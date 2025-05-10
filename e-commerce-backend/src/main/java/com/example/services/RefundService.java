package com.example.services;

import com.example.DTO.OrderDTO;
import com.example.models.OrderEntity;
import com.example.models.OrderItem;
import com.example.models.Refund;
import com.example.models.User;
import com.example.repositories.OrderRepository;
import com.example.repositories.RefundRepository;
import com.example.repositories.UserRepository;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RefundService {
    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;

    @Autowired
    public RefundService(
            RefundRepository refundRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            StripeService stripeService) {
        this.refundRepository = refundRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
    }

    @Transactional
    public OrderDTO.RefundResponseDTO requestRefund(OrderDTO.RefundRequestDTO request) {
        OrderItem orderItem = orderRepository.findOrderItemById(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        if (refundRepository.findByOrderItem_OrderItemId(request.getOrderItemId()).isPresent()) {
            throw new RuntimeException("Order item already has a refund request");
        }

        if (orderItem.getStripeChargeId() == null) {
            throw new RuntimeException("Cannot refund: No charge ID found for this order item");
        }

        Refund refund = new Refund();
        refund.setOrderItem(orderItem);
        refund.setStatus(Refund.RefundStatus.PENDING);
        refund.setReason(request.getReason());
        // Default to 100% refund amount
        refund.setAmount(orderItem.getPriceAtPurchase().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
        refund.setRequestedAt(LocalDateTime.now());
        
        refundRepository.save(refund);
        return convertToRefundResponse(refund);
    }

    @Transactional
    public OrderDTO.RefundResponseDTO processRefund(OrderDTO.ProcessRefundDTO request) {
        Refund refund = refundRepository.findPendingRefundByOrderItemId(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("No pending refund found for this order item"));

        OrderItem orderItem = refund.getOrderItem();
        if (orderItem.getStripeChargeId() == null) {
            throw new RuntimeException("Cannot refund: No charge ID found for this order item");
        }

        // Validate refund amount
        BigDecimal maxRefundAmount = orderItem.getPriceAtPurchase().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
        if (request.getRefundAmount().compareTo(maxRefundAmount) > 0) {
            throw new RuntimeException("Refund amount cannot exceed the original payment amount");
        }

        try {
            // Convert amount to cents for Stripe
            long refundAmountCents = request.getRefundAmount().multiply(BigDecimal.valueOf(100)).longValue();
            
            String refundId = stripeService.processRefund(
                orderItem.getStripeChargeId(),
                refundAmountCents,
                request.getReason()
            );

            refund.setStripeRefundId(refundId);
            refund.setStatus(Refund.RefundStatus.COMPLETED);
            refund.setAmount(request.getRefundAmount());
            refund.setProcessedAt(LocalDateTime.now());
            refundRepository.save(refund);

            return convertToRefundResponse(refund);
        } catch (StripeException e) {
            refund.setStatus(Refund.RefundStatus.FAILED);
            refund.setProcessedAt(LocalDateTime.now());
            refundRepository.save(refund);
            throw new RuntimeException("Failed to process refund: " + e.getMessage());
        }
    }

    @Transactional
    public OrderDTO.RefundResponseDTO rejectRefund(OrderDTO.RejectRefundDTO request) {
        Refund refund = refundRepository.findPendingRefundByOrderItemId(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("No pending refund found for this order item"));

        refund.setStatus(Refund.RefundStatus.REJECTED);
        refund.setRejectionReason(request.getRejectionReason());
        refund.setProcessedAt(LocalDateTime.now());
        refundRepository.save(refund);

        return convertToRefundResponse(refund);
    }

    public List<OrderDTO.RefundResponseDTO> getRefundsForCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return refundRepository.findByOrderItem_Order_User_Id(user.getId()).stream()
                .map(this::convertToRefundResponse)
                .collect(Collectors.toList());
    }

    public List<OrderDTO.RefundResponseDTO> getRefundsForOrder(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return refundRepository.findByOrderItem_Order_Id(orderId).stream()
                .map(this::convertToRefundResponse)
                .collect(Collectors.toList());
    }

    private OrderDTO.RefundResponseDTO convertToRefundResponse(Refund refund) {
        OrderDTO.RefundResponseDTO response = new OrderDTO.RefundResponseDTO();
        response.setOrderItemId(refund.getOrderItem().getOrderItemId());
        response.setStatus(refund.getStatus().name());
        response.setReason(refund.getReason());
        response.setRefundAmount(refund.getAmount());
        response.setRejectionReason(refund.getRejectionReason());
        response.setRequestedAt(refund.getRequestedAt());
        response.setProcessedAt(refund.getProcessedAt());
        return response;
    }
} 