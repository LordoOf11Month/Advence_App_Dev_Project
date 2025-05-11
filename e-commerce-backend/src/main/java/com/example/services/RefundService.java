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
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate order item exists and belongs to user
        OrderItem orderItem = orderRepository.findOrderItemById(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        if (orderItem.getOrder().getUser().getId() != user.getId()) {
            throw new RuntimeException("Order item does not belong to the current user");
        }

        //these feauture commented out for testing

        // Validate order status
        // if (orderItem.getOrder().getStatus() != OrderEntity.Status.delivered) {
        //     throw new RuntimeException("Refund can only be requested for delivered orders");
        // }

        // Check if refund already exists
        if (refundRepository.findByOrderItem_OrderItemId(request.getOrderItemId()).isPresent()) {
            throw new RuntimeException("Order item already has a refund request");
        }

        // Validate payment information
        if (orderItem.getStripeChargeId() == null) {
            throw new RuntimeException("Cannot refund: No charge ID found for this order item");
        }

        // Create refund request
        Refund refund = new Refund();
        refund.setOrderItem(orderItem);
        refund.setStatus(Refund.RefundStatus.PENDING);
        refund.setReason(request.getReason());
        refund.setAmount(orderItem.getPriceAtPurchase().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
        refund.setRequestedAt(LocalDateTime.now());
        
        refundRepository.save(refund);
        return convertToRefundResponse(refund);
    }

    @Transactional
    public OrderDTO.RefundResponseDTO processRefund(OrderDTO.ProcessRefundDTO request) {
        // Validate refund exists and is pending
        Refund refund = refundRepository.findByOrderItem_OrderItemIdAndStatus(request.getOrderItemId(), Refund.RefundStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("No pending refund found for this order item"));

        OrderItem orderItem = refund.getOrderItem();

        // Validate payment information
        if (orderItem.getStripeChargeId() == null) {
            throw new RuntimeException("Cannot refund: No charge ID found for this order item");
        }

        // Validate refund amount
        BigDecimal maxRefundAmount = orderItem.getPriceAtPurchase().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
        BigDecimal refundAmount = request.getRefundAmount();
        if (refundAmount == null) {
            refundAmount = maxRefundAmount;
        }
        if (refundAmount.compareTo(maxRefundAmount) > 0) {
            throw new RuntimeException("Refund amount cannot exceed the original payment amount");
        }
        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Refund amount must be greater than zero");
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
        // Validate refund exists and is pending
        Refund refund = refundRepository.findByOrderItem_OrderItemIdAndStatus(request.getOrderItemId(), Refund.RefundStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("No pending refund found for this order item"));

        if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

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
        // Validate order exists
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Validate user has access to this order
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (order.getUser().getId() != user.getId()) {
            throw new RuntimeException("Order does not belong to the current user");
        }

        return refundRepository.findByOrderItem_Order_Id(orderId).stream()
                .map(this::convertToRefundResponse)
                .collect(Collectors.toList());
    }

    public OrderDTO.RefundResponseDTO getRefundForOrderItem(Long orderItemId) {
        Refund refund = refundRepository.findByOrderItem_OrderItemId(orderItemId)
                .orElseThrow(() -> new RuntimeException("No refund found for this order item"));
        return convertToRefundResponse(refund);
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