package com.example.controllers.customer;

import com.example.DTO.OrderDTO;
import com.example.DTO.OrderDTO.CreateOrderRequest;
import com.example.DTO.OrderDTO.OrderResponse;
import com.example.DTO.OrderDTO.RefundRequestDTO;
import com.example.DTO.OrderDTO.RefundResponseDTO;
import com.example.models.OrderItem;
import com.example.models.User;
import com.example.models.OrderEntity;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
public class CustomerOrderController {
    private static final Logger logger = LoggerFactory.getLogger(CustomerOrderController.class);

    private final OrderService orderService;
    private final StripeService stripeService;
    private final RefundService refundService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
        
    public CustomerOrderController(OrderService orderService, StripeService stripeService, RefundService refundService, OrderRepository orderRepository, UserRepository userRepository, ProductService productService) {
        this.orderService = orderService;
        this.stripeService = stripeService;
        this.refundService = refundService;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productService = productService;
    }
    
    @GetMapping
    public ResponseEntity<?> getOrders() {
        try {
            logger.info("Fetching orders for current user: {}", SecurityContextHolder.getContext().getAuthentication().getName());
            List<OrderResponse> orders = orderService.getOrdersForCurrentUser();
            logger.info("Successfully retrieved {} orders", orders.size());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting orders for current user", e);
            
            // Return a structured error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve orders");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", new java.util.Date());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrderForCurrentUser(id));
        } catch (Exception e) {
            logger.error("Error getting order with id: {}", id, e);
            throw e;
        }
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest createDto) {
        try {
            logger.info("Creating new order for user: {}", SecurityContextHolder.getContext().getAuthentication().getName());
            
            // Get current user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate that either shippingAddressId or newShippingAddress is provided
            if (createDto.getShippingAddressId() == null && createDto.getNewShippingAddress() == null) {
                logger.warn("Order creation failed: No shipping address provided");
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Either shippingAddressId or newShippingAddress must be provided"
                ));
            }

            // Create order with payment intents
            OrderResponse order = orderService.save(createDto);
            logger.info("Order created successfully with ID: {}", order.getId());
            
            // Return the order ID and payment intents
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getId());
            response.put("paymentIntents", order.getItems().stream()
                .map(item -> Map.of(
                    "paymentIntentId", item.getStripePaymentIntentId(),
                    "clientSecret", item.getClientSecret()
                ))
                .collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Order creation failed", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage() != null ? e.getMessage() : "Unknown error occurred while creating order");
            errorResponse.put("detailedError", e.toString());
            
            // Log stack trace for server-side debugging
            logger.error("Detailed error stack trace:", e);
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelOrder(@PathVariable Long id) {
        try {
            orderService.cancelOrder(id);
            return ResponseEntity.ok(Map.of("message", "Order cancelled successfully"));
        } catch (Exception e) {
            logger.error("Error cancelling order with id: {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{orderId}/items/{itemId}/refund")
    public ResponseEntity<RefundResponseDTO> requestRefund(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody RefundRequestDTO refundRequest) {
        try {
            logger.info("Processing refund request for order item: {}", itemId);
            
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
            
            RefundResponseDTO response = refundService.requestRefund(refundRequest);
            logger.info("Refund request processed successfully for order item: {}", itemId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing refund request", e);
            throw e;
        }
    }

    @PostMapping("/{orderId}/items/{itemId}/confirm-payment")
    public ResponseEntity<Map<String, String>> confirmPayment(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody Map<String, String> paymentConfirmation) {
        try {
            logger.info("Confirming payment for order: {}, item: {}", orderId, itemId);
            
            // Get current user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Authenticated user: {}", username);
            User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            logger.info("Found user with ID: {}", user.getId());

            // Verify the order item belongs to the user
            logger.info("Looking up order item with ID: {}", itemId);
            OrderItem orderItem = orderRepository.findOrderItemById(itemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));
            logger.info("Found order item: {}, belongs to order: {}", itemId, orderItem.getOrder().getId());

            if (orderItem.getOrder().getUser().getId() != user.getId()) {
                logger.error("Order item belongs to user: {}, but current user is: {}", 
                    orderItem.getOrder().getUser().getId(), user.getId());
                throw new RuntimeException("Order item does not belong to the current user");
            }

            // Verify payment intent
            String paymentIntentId = paymentConfirmation.get("paymentIntentId");
            logger.info("Received payment intent ID: {}", paymentIntentId);
            
            if (paymentIntentId == null || paymentIntentId.isEmpty()) {
                logger.error("Payment intent ID is null or empty");
                throw new RuntimeException("Payment intent ID is required");
            }
            
            if (!paymentIntentId.equals(orderItem.getStripePaymentIntentId())) {
                logger.error("Payment intent mismatch. Received: {}, Expected: {}", 
                    paymentIntentId, orderItem.getStripePaymentIntentId());
                throw new RuntimeException("Invalid payment intent for this order item");
            }
            logger.info("Verified payment intent ID matches order item's payment intent ID");

            // Confirm payment and update order status
            logger.info("Calling orderService.confirmPayment with paymentIntentId: {}", paymentIntentId);
            OrderDTO.OrderResponse updatedOrder = orderService.confirmPayment(paymentIntentId);
            logger.info("Payment confirmed successfully for order: {}, new status: {}", orderId, updatedOrder.getStatus());

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment confirmed and order status updated",
                "orderId", updatedOrder.getId()
            ));
        } catch (Exception e) {
            logger.error("Error confirming payment", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/by-payment-intent/{paymentIntentId}")
    public ResponseEntity<?> getOrderByPaymentIntent(@PathVariable String paymentIntentId) {
        try {
            logger.info("Finding order by payment intent ID: {}", paymentIntentId);
            
            if (paymentIntentId == null || paymentIntentId.isBlank()) {
                logger.error("Payment intent ID is null or empty");
                return ResponseEntity.badRequest().body(Map.of("error", "Payment intent ID is required"));
            }
            
            try {
                OrderResponse order = orderService.findByPaymentIntentId(paymentIntentId);
                logger.info("Successfully found order with payment intent ID: {}", paymentIntentId);
                return ResponseEntity.ok(order);
            } catch (Exception e) {
                logger.error("Error finding order with payment intent ID: {}", paymentIntentId, e);
                
                // Try to find the current user's most recent order as a fallback
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                
                List<OrderEntity> userOrders = orderRepository.findByUser_Id(user.getId());
                if (!userOrders.isEmpty()) {
                    // Sort by created date descending and get the first one
                    OrderEntity recentOrder = userOrders.stream()
                        .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                        .findFirst()
                        .orElse(null);
                    
                    if (recentOrder != null) {
                        logger.info("Found recent order as fallback: {}", recentOrder.getId());
                        return ResponseEntity.ok(orderService.getOrderForCurrentUser(recentOrder.getId()));
                    }
                }
                
                // If we get here, we couldn't find any order
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Order not found",
                    "message", e.getMessage(),
                    "paymentIntentId", paymentIntentId
                ));
            }
        } catch (Exception e) {
            logger.error("Unexpected error finding order with payment intent ID: {}", paymentIntentId, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "An unexpected error occurred",
                "message", e.getMessage()
            ));
        }
    }
} 