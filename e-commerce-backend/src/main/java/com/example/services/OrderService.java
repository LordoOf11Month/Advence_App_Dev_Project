package com.example.services;

import com.example.DTO.OrderDTO;
import com.example.DTO.ProductDTO; // For OrderItemDTO.product conversion
import com.example.DTO.admin.AdminOrderDTO;
import com.example.models.OrderEntity;
import com.example.models.OrderItem;
import com.example.models.Product; // For looking up product by name
import com.example.models.Store; // For looking up store by name
import com.example.models.User; // For looking up user by email
import com.example.repositories.OrderRepository;
import com.example.repositories.ProductRepository;
import com.example.repositories.StoreRepository;
import com.example.repositories.UserRepository;
import com.example.repositories.RefundRepository;
import com.example.services.generic.GenericServiceImpl;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.models.Refund;

@Service
public class OrderService extends GenericServiceImpl<OrderEntity, OrderDTO.OrderResponse, OrderDTO.CreateOrderRequest, Long> {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository; // For filtering by product name/id
    private final StoreRepository storeRepository;   // For filtering by store name/id
    private final UserRepository userRepository;     // For filtering by customer email/id
    private final StripeService stripeService;
    private final RefundRepository refundRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        StoreRepository storeRepository,
                        UserRepository userRepository,
                        StripeService stripeService,
                        RefundRepository refundRepository) {
        super(orderRepository);
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
        this.refundRepository = refundRepository;
    }

    @Override
    @Transactional
    protected OrderEntity convertToEntity(OrderDTO.CreateOrderRequest createDto) {
        // Get the current user
        User user = userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create the order entity
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderEntity.Status.pending);
        order.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        // Process each order item and create payment intents
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderDTO.OrderItemDTO itemDto : createDto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());

            try {
                // Create a payment intent for this item
                Map<String, String> paymentIntent = stripeService.createPaymentIntent(
                    user.getStripeCustomerId(),
                    product.getPrice().multiply(new java.math.BigDecimal(itemDto.getQuantity())).longValue(),
                    "usd"
                );

                orderItem.setStripePaymentIntentId(paymentIntent.get("paymentIntentId"));
                orderItems.add(orderItem);
            } catch (StripeException e) {
                throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
            }
        }

        order.setOrderItems(orderItems);
        return order;
    }

    @Transactional
    public OrderDTO.OrderResponse confirmPayment(String paymentIntentId) {
        OrderItem orderItem = orderRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Order item not found for payment intent: " + paymentIntentId));

        try {
            String chargeId = stripeService.confirmPaymentIntent(paymentIntentId);
            orderItem.setStripeChargeId(chargeId);
            
            // Check if all items in the order are paid
            OrderEntity order = orderItem.getOrder();
            boolean allItemsPaid = order.getOrderItems().stream()
                    .allMatch(item -> item.getStripeChargeId() != null);

            // If all items are paid, update order status
            if (allItemsPaid) {
                order.setStatus(OrderEntity.Status.processing);
            }

            orderRepository.save(order);
            return convertToDto(order);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
        }
    }

    @Transactional
    public OrderDTO.OrderResponse handlePaymentFailure(String paymentIntentId) {
        OrderItem orderItem = orderRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Order item not found for payment intent: " + paymentIntentId));

        OrderEntity order = orderItem.getOrder();
        
        // You might want to implement retry logic or notify the user
        // For now, we'll just mark the order as cancelled
        order.setStatus(OrderEntity.Status.cancelled);
        
        orderRepository.save(order);
        return convertToDto(order);
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
        refund.setAmount(orderItem.getPriceAtPurchase().multiply(new java.math.BigDecimal(orderItem.getQuantity())));
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
        BigDecimal maxRefundAmount = orderItem.getPriceAtPurchase().multiply(new java.math.BigDecimal(orderItem.getQuantity()));
        if (request.getRefundAmount().compareTo(maxRefundAmount) > 0) {
            throw new RuntimeException("Refund amount cannot exceed the original payment amount");
        }

        try {
            // Convert amount to cents for Stripe
            long refundAmountCents = request.getRefundAmount().multiply(new java.math.BigDecimal("100")).longValue();
            
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

    public Page<OrderDTO.OrderResponse> findAllAdminOrders(AdminOrderDTO.AdminOrderFilterRequest filter, Pageable pageable) {
        // Implementation of complex filtering using JPA Specifications
        Specification<OrderEntity> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getOrderId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("id"), filter.getOrderId()));
            }
            if (filter.getCustomerId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("user").get("id"), filter.getCustomerId()));
            }
            if (filter.getCustomerEmail() != null && !filter.getCustomerEmail().isBlank()) {
                // This requires a join or a subquery if searching user by email directly in OrderEntity spec
                // For simplicity, could fetch user by email first then filter by ID, or add more complex spec
                 User user = userRepository.findByEmail(filter.getCustomerEmail()).orElse(null);
                 if (user != null) {
                    predicates.add(criteriaBuilder.equal(root.get("user").get("id"), user.getId()));
                 } else {
                    // No user found with that email, so no orders will match this criterion
                    predicates.add(criteriaBuilder.disjunction()); // effectively a "false" condition
                 }
            }
            if (filter.getOrderStatus() != null && !filter.getOrderStatus().isBlank()) {
                try {
                    OrderEntity.Status status = OrderEntity.Status.valueOf(filter.getOrderStatus().toLowerCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), status));
                } catch (IllegalArgumentException e) {
                    // Invalid status string, add a predicate that results in no matches
                    predicates.add(criteriaBuilder.disjunction());
                }
            }
            if (filter.getMinOrderDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), filter.getMinOrderDate()));
            }
            if (filter.getMaxOrderDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), filter.getMaxOrderDate()));
            }
            
            // Filtering by storeId, storeName, productId, productName requires joins in OrderItem
            // This can get complex with JPA specifications. Consider dedicated repository methods or simplifying.
            // For now, let's add placeholders for direct ID filters if available on OrderEntity or easily joinable.

            // Example: If orders are directly associated with a primary store (not through items)
            // if (filter.getStoreId() != null) {
            //     predicates.add(criteriaBuilder.equal(root.get("store").get("id"), filter.getStoreId()));
            // }

            // Filtering by product ID/Name or Store ID/Name through OrderItems is more involved.
            // It typically requires a subquery or a join on orderItems, then product/store.
            // This part will be developed further.
            if (filter.getProductId() != null || (filter.getProductName() != null && !filter.getProductName().isBlank()) ||
                filter.getStoreId() != null || (filter.getStoreName() != null && !filter.getStoreName().isBlank())) {
                
                query.distinct(true); // Ensure distinct orders if multiple items match
                Join<OrderEntity, OrderItem> orderItemJoin = root.join("orderItems", JoinType.INNER);

                if (filter.getProductId() != null) {
                    predicates.add(criteriaBuilder.equal(orderItemJoin.get("product").get("id"), filter.getProductId()));
                }
                if (filter.getProductName() != null && !filter.getProductName().isBlank()) {
                    predicates.add(criteriaBuilder.like(criteriaBuilder.lower(orderItemJoin.get("product").get("name")),
                            "%" + filter.getProductName().toLowerCase() + "%"));
                }
                if (filter.getStoreId() != null) {
                    predicates.add(criteriaBuilder.equal(orderItemJoin.get("product").get("store").get("id"), filter.getStoreId()));
                }
                if (filter.getStoreName() != null && !filter.getStoreName().isBlank()) {
                     predicates.add(criteriaBuilder.like(criteriaBuilder.lower(orderItemJoin.get("product").get("store").get("storeName")),
                            "%" + filter.getStoreName().toLowerCase() + "%"));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return findAll(spec, pageable); // Leverages GenericServiceImpl's findAll(spec, pageable)
    }

    public OrderDTO.OrderResponse updateOrderStatus(Long orderId, AdminOrderDTO.UpdateOrderStatusRequest request) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId)); // Replace with custom exception
        
        try {
            OrderEntity.Status newStatus = OrderEntity.Status.valueOf(request.getNewStatus().toLowerCase());
            order.setStatus(newStatus);
            // Optionally: Log the reason if provided in request.getReason()
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + request.getNewStatus());
        }
        
        OrderEntity updatedOrder = orderRepository.save(order);
        return convertToDto(updatedOrder);
    }

    @Override
    protected OrderDTO.OrderResponse convertToDto(OrderEntity entity) {
        if (entity == null) return null;
        OrderDTO.OrderResponse dto = new OrderDTO.OrderResponse();
        dto.setId(entity.getId() != null ? entity.getId().toString() : null);
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toLocalDateTime() : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toLocalDateTime() : null);
        // dto.setShippingAddress(...); // Requires mapping Address entity to ShippingAddressDTO
        // dto.setSubtotal(...); dto.setShipping(...); dto.setTotal(...); // These might need calculation

        if (entity.getOrderItems() != null) {
            dto.setItems(entity.getOrderItems().stream()
                .map(this::convertOrderItemToDto)
                .collect(Collectors.toList()));
        }
        // Calculate totals if not stored directly on OrderEntity
        // For simplicity, let's assume they might be null or pre-calculated.
        // Proper calculation would iterate through items.
        return dto;
    }

    private OrderDTO.OrderItemDTO convertOrderItemToDto(OrderItem item) {
        if (item == null) return null;
        OrderDTO.OrderItemDTO dto = new OrderDTO.OrderItemDTO();
        dto.setQuantity(item.getQuantity());
        dto.setPriceAtPurchase(item.getPriceAtPurchase() != null ? item.getPriceAtPurchase().doubleValue() : 0.0);
        
        // Product mapping: OrderItemDTO expects ProductDTO.CreateProductRequest
        // This is unusual for a response. Ideally, it should be a ProductResponseDTO.
        // For now, creating a CreateProductRequest from Product entity.
        if (item.getProduct() != null) {
            ProductDTO.CreateProductRequest productDto = new ProductDTO.CreateProductRequest();
            productDto.setTitle(item.getProduct().getName());
            productDto.setDescription(item.getProduct().getDescription());
            productDto.setPrice(item.getProduct().getPrice());
            productDto.setCategory(item.getProduct().getCategory() != null ? item.getProduct().getCategory().getName() : null);
            // productDto.setStockQuantity(...); // CreateProductRequest has stockQuantity
            dto.setProduct(productDto);
        }
        return dto;
    }

    @Override
    protected OrderEntity convertToEntityForUpdate(Long id, OrderDTO.CreateOrderRequest updateDto) {
        // Similar to convertToEntity, updating an order via CreateOrderRequest is unusual.
        // Usually, there'd be a specific OrderUpdateDTO.
        // For admin, most updates might be status changes or minor corrections.
        OrderEntity existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        // Apply updates from updateDto to existingOrder
        // This needs careful consideration of what fields an admin can update.
        // throw new UnsupportedOperationException("Order update via admin is complex and not fully implemented yet.");
        return existingOrder; // Basic, needs full implementation if used
    }
} 