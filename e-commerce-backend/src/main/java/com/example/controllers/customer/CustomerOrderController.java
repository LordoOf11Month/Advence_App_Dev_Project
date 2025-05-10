package com.example.controllers.customer;

import com.example.DTO.OrderDTO.CreateOrderRequest;
import com.example.DTO.OrderDTO.OrderResponse;
import com.example.DTO.OrderDTO.RefundRequestDTO;
import com.example.DTO.OrderDTO.RefundResponseDTO;
import com.example.services.OrderService;
import com.example.services.StripeService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
public class CustomerOrderController {

    private final OrderService orderService;
    private final StripeService stripeService;

    public CustomerOrderController(OrderService orderService, StripeService stripeService) {
        this.orderService = orderService;
        this.stripeService = stripeService;
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
            @RequestBody RefundRequestDTO refundRequest) throws StripeException {
        return ResponseEntity.ok(orderService.processRefund(orderId, itemId, refundRequest));
    }
} 