package com.example.controllers.customer;

import com.example.DTO.OrderDTO.CreateOrderRequest;
import com.example.DTO.OrderDTO.OrderResponse;
import com.example.DTO.OrderDTO.RefundRequestDTO;
import com.example.DTO.OrderDTO.RefundResponseDTO;
import com.example.models.OrderItem;
import com.example.models.User;
import com.example.repositories.OrderRepository;
import com.example.repositories.UserRepository;
import com.example.services.OrderService;
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

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
public class CustomerOrderController {

    private final OrderService orderService;
    private final StripeService stripeService;
    private final RefundService refundService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    
        @Autowired
        public CustomerOrderController(OrderService orderService, StripeService stripeService, RefundService refundService, OrderRepository orderRepository, UserRepository userRepository) {
            this.orderService = orderService;
            this.stripeService = stripeService;
            this.refundService = refundService;
            this.orderRepository = orderRepository;
            this.userRepository = userRepository;
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
        public ResponseEntity<Map<String, String>> createOrder(@RequestBody CreateOrderRequest createDto) throws StripeException {
            // Create order and get payment intent details
            OrderResponse order = orderService.create(createDto);
            
            // Get the first order item's payment intent (assuming single payment for now)
            String paymentIntentId = order.getItems().get(0).getStripePaymentIntentId();
            
            // Get payment intent details from Stripe
            Map<String, String> paymentDetails = stripeService.createPaymentIntent(
                order.getCustomer().getStripeCustomerId(),
                order.getTotal().longValue(),
                "usd" // You might want to make this configurable
            );
    
            return ResponseEntity.ok(paymentDetails);
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
} 