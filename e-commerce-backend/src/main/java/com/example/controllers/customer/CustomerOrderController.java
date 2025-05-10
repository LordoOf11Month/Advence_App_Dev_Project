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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.ArrayList;

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
        @Autowired
        public CustomerOrderController(OrderService orderService, StripeService stripeService, RefundService refundService, OrderRepository orderRepository, UserRepository userRepository, ProductService productService) {
            this.orderService = orderService;
            this.stripeService = stripeService;
            this.refundService = refundService;
            this.orderRepository = orderRepository;
            this.userRepository = userRepository;
            this.productService = productService;
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
        public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest createDto) throws StripeException {
            // Get current user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Create order first
            OrderResponse order = orderService.create(createDto);
            
            // Create payment intents for each order item
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getId());
            
            List<Map<String, String>> paymentIntents = new ArrayList<>();
            for (OrderDTO.OrderItemDTO item : order.getItems()) {
                
                Map<String, String> paymentIntent = stripeService.createPaymentIntent(
                    user.getStripeCustomerId(),
                    productService.findById(item.getProductId()).orElseThrow(() -> new RuntimeException("Product not found")).getPrice().multiply(BigDecimal.valueOf(item.getQuantity())).longValue(),
                    "usd"
                );
                paymentIntents.add(paymentIntent);
            }
            response.put("paymentIntents", paymentIntents);

            return ResponseEntity.ok(response);
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
} 