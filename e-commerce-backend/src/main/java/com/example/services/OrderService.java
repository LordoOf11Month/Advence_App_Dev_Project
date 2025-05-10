package com.example.services;

import com.example.DTO.OrderDTO; // For OrderItemDTO.product conversion
import com.example.DTO.admin.AdminOrderDTO;
import com.example.models.OrderEntity;
import com.example.models.OrderItem;
import com.example.models.Product; // For looking up product by name
import com.example.models.Store; // For looking up store by name
import com.example.models.User;
import com.example.repositories.*;
import com.example.services.generic.GenericServiceImpl;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;


import com.example.models.PaymentMethod;

@Service
public class OrderService extends GenericServiceImpl<OrderEntity, OrderDTO.OrderResponse, OrderDTO.CreateOrderRequest, Long> {

    private final AddressRepository addressRepository;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository; // For filtering by product name/id
    private final StoreRepository storeRepository;   // For filtering by store name/id
    private final UserRepository userRepository;     // For filtering by customer email/id
    private final StripeService stripeService;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        StoreRepository storeRepository,
                        UserRepository userRepository,
                        StripeService stripeService,
                        RefundRepository refundRepository, AddressRepository addressRepository) {
        super(orderRepository);
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
        this.addressRepository = addressRepository;
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
        order.setEstimatedDelivery(LocalDate.now().plusDays(7));
        order.setTrackingNumber(generateTrackingNumber());
        order.setShippingAddress(addressRepository.findById(createDto.getShippingAddressId())
            .orElseThrow(() -> new RuntimeException("Shipping address not found")));
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
            
            // Get payment method details from Stripe
            com.stripe.model.PaymentIntent paymentIntent = stripeService.getPaymentIntent(paymentIntentId);
            String paymentMethodId = paymentIntent.getPaymentMethod();
            
            // Check if all items in the order are paid
            OrderEntity order = orderItem.getOrder();
            boolean allItemsPaid = order.getOrderItems().stream()
                    .allMatch(item -> item.getStripeChargeId() != null);

            // If all items are paid, update order status and set payment method
            if (allItemsPaid) {
                order.setStatus(OrderEntity.Status.processing);
                order.setStripeChargeId(chargeId);
                
                // Set payment method if not already set
                if (order.getPaymentMethod() == null && paymentMethodId != null) {
                    PaymentMethod paymentMethod = new PaymentMethod();
                    paymentMethod.setStripePaymentMethodId(paymentMethodId);
                    paymentMethod.setUser(order.getUser());
                    order.setPaymentMethod(paymentMethod);
                }
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
        dto.setProductId(item.getProduct().getId());
        dto.setQuantity(item.getQuantity());
        dto.setPriceAtPurchase(item.getPriceAtPurchase());
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

    public List<OrderDTO.OrderResponse> getOrdersForCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return orderRepository.findByUser_Id(user.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public OrderDTO.OrderResponse getOrderForCurrentUser(Long orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getUser().getId() != user.getId()) {
            throw new RuntimeException("Order does not belong to user");
        }
        
        return convertToDto(order);
    }

    @Transactional
    public OrderDTO.OrderResponse create(OrderDTO.CreateOrderRequest createDto) throws StripeException {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderEntity.Status.pending);
        order.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        order.setShippingAddress(addressRepository.findById(createDto.getShippingAddressId())
            .orElseThrow(() -> new RuntimeException("Shipping address not found")));
        order.setEstimatedDelivery(LocalDate.now().plusDays(7));
        order.setTrackingNumber(generateTrackingNumber());

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderDTO.OrderItemDTO itemDto : createDto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());

            // Create payment intent for this item
            Map<String, String> paymentIntent = stripeService.createPaymentIntent(
                user.getStripeCustomerId(),
                product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())).longValue(),
                "usd"
            );
            orderItem.setStripePaymentIntentId(paymentIntent.get("paymentIntentId"));

            orderItems.add(orderItem);
        }
        order.setOrderItems(orderItems);

        return convertToDto(orderRepository.save(order));
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getUser().getId() != user.getId()) {
            throw new RuntimeException("Order does not belong to user");
        }
        
        if (order.getStatus() != OrderEntity.Status.pending) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }
        
        order.setStatus(OrderEntity.Status.cancelled);
        orderRepository.save(order);
    }

    public Map<String, Object> findAllAdminOrders(AdminOrderDTO.AdminOrderFilterRequest filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderEntity> ordersPage = orderRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (filter.getOrderId() != null) {
                predicates.add(cb.equal(root.get("id"), filter.getOrderId()));
            }
            if (filter.getCustomerId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), filter.getCustomerId()));
            }
            if (filter.getOrderStatus() != null) {
                predicates.add(cb.equal(root.get("status"), OrderEntity.Status.valueOf(filter.getOrderStatus())));
            }
            if (filter.getMinOrderDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getMinOrderDate()));
            }
            if (filter.getMaxOrderDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getMaxOrderDate()));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);

        List<OrderDTO.OrderResponse> orders = ordersPage.getContent().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders);
        response.put("currentPage", ordersPage.getNumber());
        response.put("totalItems", ordersPage.getTotalElements());
        response.put("totalPages", ordersPage.getTotalPages());
        
        return response;
    }

    public List<OrderDTO.OrderResponse> getOrdersByUserId(Integer userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return orderRepository.findByUser_Id(user.getId()).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, String> createOrderForUser(Integer userId, OrderDTO.CreateOrderRequest createDto) throws StripeException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderEntity.Status.pending);
        order.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        order.setShippingAddress(addressRepository.findById(createDto.getShippingAddressId())
            .orElseThrow(() -> new RuntimeException("Shipping address not found")));
        order.setEstimatedDelivery(LocalDate.now().plusDays(7));
        order.setTrackingNumber(generateTrackingNumber());

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderDTO.OrderItemDTO itemDto : createDto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());

            // Create payment intent for this item
            Map<String, String> paymentIntent = stripeService.createPaymentIntent(
                user.getStripeCustomerId(),
                product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())).longValue(),
                "usd"
            );
            orderItem.setStripePaymentIntentId(paymentIntent.get("paymentIntentId"));

            orderItems.add(orderItem);
        }
        order.setOrderItems(orderItems);

        OrderEntity savedOrder = orderRepository.save(order);
        return Map.of(
            "orderId", savedOrder.getId().toString(),
            "paymentIntentId", orderItems.get(0).getStripePaymentIntentId()
        );
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check if order can be deleted (e.g., not in certain statuses)
        if (order.getStatus() == OrderEntity.Status.delivered || 
            order.getStatus() == OrderEntity.Status.shipped) {
            throw new RuntimeException("Cannot delete delivered or shipped orders");
        }
        
        orderRepository.delete(order);
    }

    private String generateTrackingNumber() {
        // Generate a random tracking number in format: TRK-XXXX-XXXX-XXXX
        // where X is a random alphanumeric character
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder("TRK-");
        java.util.Random random = new java.util.Random();
        
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 4; j++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            if (i < 2) sb.append("-");
        }
        return sb.toString();
    }

    public boolean validateOrderItemBelongsToOrder(Long orderItemId, Long orderId) {
        OrderItem orderItem = orderRepository.findOrderItemById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));
        return orderItem.getOrder().getId().equals(orderId);
    }
} 