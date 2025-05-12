package com.example.controllers.customer;

import com.example.DTO.OrderDTO;
import com.example.DTO.OrderDTO.CreateOrderRequest;
import com.example.DTO.OrderDTO.OrderResponse;
import com.example.DTO.OrderDTO.RefundRequestDTO;
import com.example.DTO.OrderDTO.RefundResponseDTO;
import com.example.models.OrderItem;
import com.example.models.User;
import com.example.repositories.OrderRepository;
import com.example.repositories.UserRepository;
import com.example.services.OrderService;
import com.example.services.ProductService;
import com.example.services.RefundService;
import com.example.services.StripeService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;
import com.example.models.Address;
import com.example.repositories.AddressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
public class CustomerOrderController {

    private final OrderService orderService;
    private final StripeService stripeService;
    private final RefundService refundService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final AddressRepository addressRepository;
        
        public CustomerOrderController(OrderService orderService, StripeService stripeService, RefundService refundService, OrderRepository orderRepository, UserRepository userRepository, ProductService productService, AddressRepository addressRepository) {
            this.orderService = orderService;
            this.stripeService = stripeService;
            this.refundService = refundService;
            this.orderRepository = orderRepository;
            this.userRepository = userRepository;
            this.productService = productService;
            this.addressRepository = addressRepository;
        }
    
        @GetMapping
        public ResponseEntity<List<OrderResponse>> getOrders() {
            return ResponseEntity.ok(orderService.getOrdersForCurrentUser());
        }
    
        @GetMapping("/{id}")
        public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
            return ResponseEntity.ok(orderService.getOrderForCurrentUser(id));
        }
    
        @PostMapping
        public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderDTO.CreateOrderRequest createDto) {
            try {
                // Get current user
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

                // Save the order (associate with payment intent)
                OrderResponse order = orderService.create(createDto);

                return ResponseEntity.ok(Map.of(
                    "orderId", order.getId(),
                    "status", order.getStatus()
                ));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create order: " + e.getMessage()));
            }
        }
    
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
            orderService.cancelOrder(id);
            return ResponseEntity.ok().build();
        }
    
        @PostMapping("/{orderId}/items/{itemId}/refund")
        public ResponseEntity<RefundResponseDTO> requestRefund(
                @PathVariable Long orderId,
                @PathVariable Long itemId,
                @RequestBody RefundRequestDTO refundRequest) {
            // Validate that the itemId matches the orderId
            OrderItem orderItem = orderRepository.findOrderItemById(itemId)
                    .orElseThrow(() -> new RuntimeException("Order item not found"));
            
            if (!orderItem.getOrder().getId().equals(orderId)) {
                throw new RuntimeException("Order item does not belong to the specified order");
            }
    
            // Get current user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify that the current user is the order owner
        if (orderItem.getOrder().getUser().getId() != user.getId()) {
            throw new RuntimeException("Only the order owner can request a refund");
        }
        
        // Set the orderItemId in the request
        refundRequest.setOrderItemId(itemId);
        
        return ResponseEntity.ok(refundService.requestRefund(refundRequest));
    }

    @PostMapping("/{orderId}/items/{itemId}/confirm-payment")
    public ResponseEntity<Map<String, String>> confirmPayment(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody Map<String, String> paymentConfirmation) {
        
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify the order item belongs to the user
        OrderItem orderItem = orderRepository.findOrderItemById(itemId)
            .orElseThrow(() -> new RuntimeException("Order item not found"));

        if (orderItem.getOrder().getUser().getId() != user.getId()) {
            throw new RuntimeException("Order item does not belong to the current user");
        }

        // Verify payment intent
        String paymentIntentId = paymentConfirmation.get("paymentIntentId");
        if (!paymentIntentId.equals(orderItem.getStripePaymentIntentId())) {
            throw new RuntimeException("Invalid payment intent for this order item");
        }

        // Confirm payment and update order status
        OrderDTO.OrderResponse updatedOrder = orderService.confirmPayment(paymentIntentId);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Payment confirmed and order status updated",
            "orderId", updatedOrder.getId()
        ));
    }

    @PostMapping("/create-payment-intent")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody OrderDTO.CreateOrderRequest createDto) {
        try {
            // User retrieval is not strictly necessary here if not using stripeCustomerId, but can be kept for context or future use.
            // String username = SecurityContextHolder.getContext().getAuthentication().getName();
            // User user = userRepository.findByEmail(username)
            //     .orElseThrow(() -> new RuntimeException("User not found"));

            if (createDto.getItems() == null || createDto.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order items cannot be empty."));
            }

            long orderTotalCents = 0;
            for (OrderDTO.OrderItemDTO item : createDto.getItems()) {
                if (item.getProductId() == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Product ID is missing for an item."));
                }
                // Get product price from DB to ensure security
                BigDecimal productPrice = productService.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()))
                    .getPrice();
                if (productPrice == null) {
                     throw new RuntimeException("Price not found for product: " + item.getProductId());
                }
                
                orderTotalCents += productPrice.multiply(new BigDecimal(item.getQuantity()))
                                            .multiply(new BigDecimal(100))
                                            .longValue();
            }

            if (orderTotalCents <= 0) {
                 return ResponseEntity.badRequest().body(Map.of("error", "Order total must be greater than zero."));
            }
            
            if (orderTotalCents > Integer.MAX_VALUE) { // Stripe amount is int cents
                return ResponseEntity.badRequest().body(Map.of("error", "Order total exceeds maximum allowed amount."));
            }

            // Create payment intent with Stripe using the method that doesn't require customerId
            com.stripe.model.PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                (int) orderTotalCents, 
                "usd" // Currency - consider making this configurable
            );
            
            return ResponseEntity.ok(Map.of(
                "clientSecret", paymentIntent.getClientSecret(),
                "paymentIntentId", paymentIntent.getId(),
                "amount", orderTotalCents // Return amount in cents, frontend might need to format it
            ));
        } catch (StripeException e) {
            // Log e for more details on Stripe errors
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE) // Or INTERNAL_SERVER_ERROR
                .body(Map.of("error", "Failed to create payment intent with Stripe: " + e.getMessage()));
        } catch (RuntimeException e) { // Catch other runtime exceptions like product not found
             return ResponseEntity.status(HttpStatus.BAD_REQUEST) // Or INTERNAL_SERVER_ERROR depending on cause
                .body(Map.of("error", "Failed to create payment intent: " + e.getMessage()));
        }
    }
} 