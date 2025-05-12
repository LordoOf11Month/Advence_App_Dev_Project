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
import java.util.Optional;


import com.example.models.PaymentMethod;
import com.stripe.model.PaymentIntent;
import com.example.models.Address;
import com.example.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OrderService extends GenericServiceImpl<OrderEntity, OrderDTO.OrderResponse, OrderDTO.CreateOrderRequest, Long> {

    private final AddressRepository addressRepository;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository; // For filtering by product name/id
    private final StoreRepository storeRepository;   // For filtering by store name/id
    private final UserRepository userRepository;     // For filtering by customer email/id
    private final StripeService stripeService;
    private final NotificationService notificationService;
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        StoreRepository storeRepository,
                        UserRepository userRepository,
                        StripeService stripeService,
                        RefundRepository refundRepository, AddressRepository addressRepository,
                        NotificationService notificationService) {
        super(orderRepository);
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
        this.addressRepository = addressRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public OrderDTO.OrderResponse save(OrderDTO.CreateOrderRequest createDto) {
        try {
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
            
            // Handle shipping address - either use existing address by ID or create a new one
            Address shippingAddress;
            if (createDto.getShippingAddressId() != null) {
                // Use existing address
                shippingAddress = addressRepository.findById(createDto.getShippingAddressId())
                    .orElseThrow(() -> new RuntimeException("Shipping address not found"));
                    
                // Verify the address belongs to the current user
                if (shippingAddress.getUser().getId() != user.getId()) {
                    throw new RuntimeException("Address does not belong to current user");
                }
            } else if (createDto.getNewShippingAddress() != null) {
                // Create a new address from the request
                Address newAddress = new Address();
                newAddress.setUser(user);
                newAddress.setStreet(createDto.getNewShippingAddress().getStreet());
                newAddress.setCity(createDto.getNewShippingAddress().getCity());
                newAddress.setState(createDto.getNewShippingAddress().getState());
                newAddress.setCountry(createDto.getNewShippingAddress().getCountry());
                newAddress.setZipCode(createDto.getNewShippingAddress().getZipCode());
                newAddress.setDefault(createDto.getNewShippingAddress().isDefault());
                
                // If this is set as default, unset any existing default address
                if (createDto.getNewShippingAddress().isDefault()) {
                    addressRepository.findByUserAndIsDefaultTrue(user)
                            .ifPresent(existingDefault -> {
                                existingDefault.setDefault(false);
                                addressRepository.save(existingDefault);
                            });
                }
                
                shippingAddress = addressRepository.save(newAddress);
            } else {
                throw new RuntimeException("Shipping address information is required");
            }
            
            order.setShippingAddress(shippingAddress);
            
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
                    Map<String, String> paymentIntent;
                    
                    // Check if user has a valid Stripe customer ID
                    if (user.getStripeCustomerId() != null && !user.getStripeCustomerId().isEmpty()) {
                        // Use customer ID for the payment intent
                        paymentIntent = stripeService.createPaymentIntent(
                            user.getStripeCustomerId(),
                            product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())).longValue(),
                            "usd"
                        );
                    } else {
                        // Create payment intent without customer ID
                        paymentIntent = stripeService.createPaymentIntentWithoutCustomer(
                            product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())).longValue(),
                            "usd"
                        );
                    }

                    orderItem.setStripePaymentIntentId(paymentIntent.get("paymentIntentId"));
                    orderItems.add(orderItem);
                } catch (StripeException e) {
                    throw new RuntimeException("Failed to create payment intent: " + e.getMessage(), e);
                }
            }

            order.setOrderItems(orderItems);
            return convertToDto(orderRepository.save(order));
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Error creating order: " + e.getMessage(), e);
        }
    }

    @Override
    protected OrderDTO.OrderResponse convertToDto(OrderEntity entity) {
        if (entity == null) return null;
        OrderDTO.OrderResponse dto = new OrderDTO.OrderResponse();
        dto.setId(entity.getId() != null ? entity.getId().toString() : null);
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toLocalDateTime() : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toLocalDateTime() : null);
        
        // Set shipping address if available
        if (entity.getShippingAddress() != null) {
            OrderDTO.ShippingAddressDTO addressDTO = new OrderDTO.ShippingAddressDTO();
            Address address = entity.getShippingAddress();
            addressDTO.setId(address.getId());
            addressDTO.setStreet(address.getStreet());
            addressDTO.setCity(address.getCity());
            addressDTO.setState(address.getState());
            addressDTO.setCountry(address.getCountry());
            addressDTO.setZipCode(address.getZipCode());
            dto.setShippingAddress(addressDTO);
        }
        
        // Set tracking information
        dto.setTrackingNumber(entity.getTrackingNumber());
        dto.setEstimatedDelivery(entity.getEstimatedDelivery());
        
        // Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderDTO.OrderItemDTO> itemDtos = new ArrayList<>();
        
        try {
            if (entity.getOrderItems() != null) {
                for (OrderItem item : entity.getOrderItems()) {
                    if (item != null) {
                        OrderDTO.OrderItemDTO itemDto = convertOrderItemToDto(item);
                        if (itemDto != null) {
                            itemDtos.add(itemDto);
                            
                            // Add to subtotal
                            if (item.getPriceAtPurchase() != null && item.getQuantity() > 0) {
                                subtotal = subtotal.add(
                                    item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()))
                                );
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log the error but don't fail the entire conversion
            System.err.println("Error processing order items: " + e.getMessage());
            e.printStackTrace();
        }
        
        dto.setItems(itemDtos);
        
        // Set financial details
        dto.setSubtotal(subtotal);
        // Apply shipping cost calculation (simplified example)
        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(100)) > 0 ? 
                           BigDecimal.ZERO : BigDecimal.valueOf(10);
        dto.setShipping(shipping);
        
        // Apply tax calculation (simplified example - 8%)
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.08)).setScale(2, java.math.RoundingMode.HALF_UP);
        dto.setTax(tax);
        
        // Calculate total
        BigDecimal total = subtotal.add(shipping).add(tax);
        dto.setTotal(total);
        
        // Add payment method info if available
        if (entity.getStripeChargeId() != null) {
            OrderDTO.PaymentMethodDTO paymentMethodDTO = new OrderDTO.PaymentMethodDTO();
            paymentMethodDTO.setType("stripe");
            dto.setPaymentMethod(paymentMethodDTO);
        }

        return dto;
    }

    private OrderDTO.OrderItemDTO convertOrderItemToDto(OrderItem item) {
        if (item == null) return null;
        OrderDTO.OrderItemDTO dto = new OrderDTO.OrderItemDTO();
        dto.setProductId(item.getProduct().getId());
        dto.setQuantity(item.getQuantity());
        dto.setPriceAtPurchase(item.getPriceAtPurchase());
        dto.setStripePaymentIntentId(item.getStripePaymentIntentId());
        // Get client secret from Stripe service
        try {
            PaymentIntent paymentIntent = stripeService.getPaymentIntent(item.getStripePaymentIntentId());
            dto.setClientSecret(paymentIntent.getClientSecret());
        } catch (StripeException e) {
            // Log error but don't fail the request
            System.err.println("Error getting payment intent client secret: " + e.getMessage());
        }
        return dto;
    }

    @Override
    protected OrderEntity convertToEntity(OrderDTO.CreateOrderRequest createDto) {
        // This is handled in the save method
        throw new UnsupportedOperationException("Manual conversion is handled in save method");
    }

    @Override
    protected OrderEntity convertToEntityForUpdate(Long id, OrderDTO.CreateOrderRequest updateDto) {
        // This is handled in specific update methods
        throw new UnsupportedOperationException("Manual conversion is handled in specific update methods");
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
            OrderEntity.Status oldStatus = order.getStatus();
            OrderEntity.Status newStatus = OrderEntity.Status.valueOf(request.getNewStatus().toLowerCase());
            order.setStatus(newStatus);
            
            // Create a notification for the user about the order status change
            if (order.getUser() != null && !oldStatus.equals(newStatus)) {
                String notificationMessage = String.format(
                    "Your order #%d status has been updated from %s to %s.", 
                    orderId, 
                    oldStatus.name(), 
                    newStatus.name()
                );
                notificationService.createNotification(Long.valueOf(order.getUser().getId()), notificationMessage);
            }
            
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + request.getNewStatus());
        }
        
        OrderEntity updatedOrder = orderRepository.save(order);
        return convertToDto(updatedOrder);
    }

    @Transactional
    public List<OrderDTO.OrderResponse> getOrdersForCurrentUser() {
        try {
            // Get the current authenticated user's email
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            if (username == null || username.isEmpty()) {
                throw new RuntimeException("User not authenticated");
            }
            
            // Find the user by email
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + username));
            
            // Find all orders for the user with eager loading to prevent LazyInitializationException
            List<OrderEntity> userOrders = orderRepository.findByUser_Id(user.getId());
            
            // Initialize the collections to prevent LazyInitializationException
            userOrders.forEach(order -> {
                if (order.getOrderItems() != null) {
                    order.getOrderItems().size(); // This forces initialization of the collection
                    // Initialize product for each order item
                    order.getOrderItems().forEach(item -> {
                        if (item.getProduct() != null) {
                            item.getProduct().getName(); // Force initialization
                            // Initialize other necessary properties
                        }
                    });
                }
                // Initialize other necessary collections or properties
                if (order.getShippingAddress() != null) {
                    order.getShippingAddress().getStreet(); // Force initialization
                }
            });
            
            // Convert each order entity to DTO
            List<OrderDTO.OrderResponse> orderDtos = userOrders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            System.out.println("Retrieved " + orderDtos.size() + " orders for user: " + username);
            
            return orderDtos;
        } catch (Exception e) {
            System.err.println("Error retrieving orders for current user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to retrieve orders: " + e.getMessage(), e);
        }
    }

    @Transactional
    public OrderDTO.OrderResponse getOrderForCurrentUser(Long orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getUser().getId() != user.getId()) {
            throw new RuntimeException("Order does not belong to user");
        }
        
        // Initialize collections to prevent LazyInitializationException
        if (order.getOrderItems() != null) {
            order.getOrderItems().size(); // Force initialization
            order.getOrderItems().forEach(item -> {
                if (item.getProduct() != null) {
                    item.getProduct().getName(); // Force initialization
                }
            });
        }
        
        if (order.getShippingAddress() != null) {
            order.getShippingAddress().getStreet(); // Force initialization
        }
        
        return convertToDto(order);
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
        
        // Create a notification for the user about their cancelled order
        String notificationMessage = String.format("You have cancelled your order #%d.", orderId);
        notificationService.createNotification(Long.valueOf(user.getId()), notificationMessage);
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
            Map<String, String> paymentIntent;
            
            // Check if user has a valid Stripe customer ID
            if (user.getStripeCustomerId() != null && !user.getStripeCustomerId().isEmpty()) {
                // Use customer ID for the payment intent
                paymentIntent = stripeService.createPaymentIntent(
                    user.getStripeCustomerId(),
                    product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())).longValue(),
                    "usd"
                );
            } else {
                // Create payment intent without customer ID
                paymentIntent = stripeService.createPaymentIntentWithoutCustomer(
                    product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())).longValue(),
                    "usd"
                );
            }
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

    @Transactional
    public OrderDTO.OrderResponse confirmPayment(String paymentIntentId) {
        try {
            logger.info("Confirming payment for paymentIntentId: {}", paymentIntentId);
            OrderItem orderItem = orderRepository.findByStripePaymentIntentId(paymentIntentId)
                    .orElseThrow(() -> new RuntimeException("Order item not found for payment intent: " + paymentIntentId));
            
            logger.info("Found order item: {} for payment intent: {}", orderItem.getOrderItemId(), paymentIntentId);
            
            String chargeId = stripeService.confirmPaymentIntent(paymentIntentId);
            logger.info("Retrieved charge ID: {} from Stripe for payment intent: {}", chargeId, paymentIntentId);
            
            orderItem.setStripeChargeId(chargeId);
            logger.info("Set charge ID on order item: {}", orderItem.getOrderItemId());
            
            // Check if all items in the order are paid
            OrderEntity order = orderItem.getOrder();
            
            // Also set charge ID on the order itself
            if (order.getStripeChargeId() == null) {
                order.setStripeChargeId(chargeId);
                logger.info("Set charge ID on order: {}", order.getId());
            }
            
            // Force update order status to processing when payment is confirmed
            order.setStatus(OrderEntity.Status.processing);
            logger.info("Updated order status to PROCESSING for order: {}", order.getId());
            
            // Create a notification for the user about their payment confirmation
            String notificationMessage = String.format("Payment for order #%d has been confirmed. Your order is now being processed.", order.getId());
            notificationService.createNotification(Long.valueOf(order.getUser().getId()), notificationMessage);
            
            OrderEntity savedOrder = orderRepository.save(order);
            logger.info("Saved order after payment confirmation: {}, status: {}", savedOrder.getId(), savedOrder.getStatus());
            
            return convertToDto(savedOrder);
        } catch (StripeException e) {
            logger.error("Stripe exception while confirming payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected exception while confirming payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage(), e);
        }
    }

    @Transactional
    public OrderDTO.OrderResponse handlePaymentFailure(String paymentIntentId) {
        try {
            OrderItem orderItem = orderRepository.findByStripePaymentIntentId(paymentIntentId)
                    .orElseThrow(() -> new RuntimeException("Order item not found for payment intent: " + paymentIntentId));
            
            // Get the parent order
            OrderEntity order = orderItem.getOrder();
            
            // Mark the order as cancelled due to payment failure
            if (order.getStatus() == OrderEntity.Status.pending) {
                order.setStatus(OrderEntity.Status.cancelled);
                
                // Notify the user that payment has failed
                String notificationMessage = String.format(
                    "Payment for order #%d has failed. Please update your payment information or contact customer support.", 
                    order.getId()
                );
                notificationService.createNotification(Long.valueOf(order.getUser().getId()), notificationMessage);
            }
            
            // Save the updated order
            OrderEntity savedOrder = orderRepository.save(order);
            return convertToDto(savedOrder);
        } catch (Exception e) {
            throw new RuntimeException("Error handling payment failure: " + e.getMessage(), e);
        }
    }

    /**
     * Find an order by payment intent ID
     * @param paymentIntentId Stripe payment intent ID
     * @return OrderDTO.OrderResponse
     * @throws RuntimeException if order not found
     */
    @Transactional
    public OrderDTO.OrderResponse findByPaymentIntentId(String paymentIntentId) {
        // Validate input
        if (paymentIntentId == null || paymentIntentId.isEmpty()) {
            throw new IllegalArgumentException("Payment intent ID cannot be null or empty");
        }
        
        // Try to find the order item
        Optional<OrderItem> orderItemOpt = orderRepository.findByStripePaymentIntentId(paymentIntentId);
        
        if (orderItemOpt.isEmpty()) {
            throw new RuntimeException("No order item found with payment intent ID: " + paymentIntentId);
        }
        
        OrderItem orderItem = orderItemOpt.get();
        OrderEntity order = orderItem.getOrder();
        
        if (order == null) {
            throw new RuntimeException("Order item with payment intent ID " + paymentIntentId + " has no associated order");
        }
        
        // If we have a payment intent but the charge ID is missing, try to confirm the payment now
        if (orderItem.getStripeChargeId() == null) {
            try {
                logger.info("Payment intent found but charge ID is missing. Attempting to fetch charge ID from Stripe.");
                String chargeId = stripeService.confirmPaymentIntent(paymentIntentId);
                
                if (chargeId != null && !chargeId.isEmpty()) {
                    logger.info("Retrieved charge ID from Stripe: {}", chargeId);
                    orderItem.setStripeChargeId(chargeId);
                    
                    // Also set it on the order
                    if (order.getStripeChargeId() == null) {
                        order.setStripeChargeId(chargeId);
                    }
                    
                    // Always update to processing status when retrieving by payment intent
                    order.setStatus(OrderEntity.Status.processing);
                    logger.info("Updated order status to processing for order: {}", order.getId());
                    
                    // Save the updated order
                    orderRepository.save(order);
                    logger.info("Saved order with updated charge IDs: {}", order.getId());
                }
            } catch (Exception e) {
                // Log but continue - we still want to return the order even if charge ID retrieval fails
                logger.warn("Failed to retrieve charge ID for payment intent: {}", paymentIntentId, e);
            }
        } else {
            // We already have a charge ID, so payment is confirmed
            // Make sure the order is in processing status
            if (order.getStatus() == OrderEntity.Status.pending) {
                order.setStatus(OrderEntity.Status.processing);
                logger.info("Updated pending order to processing status for order with existing charge: {}", order.getId());
                orderRepository.save(order);
            }
        }
        
        // Initialize collections to prevent LazyInitializationException
        if (order.getOrderItems() != null) {
            order.getOrderItems().size(); // Force initialization
            order.getOrderItems().forEach(item -> {
                if (item.getProduct() != null) {
                    item.getProduct().getName(); // Force initialization
                }
            });
        }
        
        if (order.getShippingAddress() != null) {
            order.getShippingAddress().getStreet(); // Force initialization
        }
        
        return convertToDto(order);
    }

    public Map<String, Object> getOrderStats() {
        // Get counts of orders by status
        long pendingCount = orderRepository.countPendingOrders();
        long processingCount = orderRepository.countProcessingOrders();
        long shippedCount = orderRepository.countShippedOrders();
        long deliveredCount = orderRepository.countDeliveredOrders();
        long cancelledCount = orderRepository.countCancelledOrders();
        
        // Calculate total orders
        long totalOrders = pendingCount + processingCount + shippedCount + deliveredCount + cancelledCount;
        
        // Create the response map
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", totalOrders);
        stats.put("pending", pendingCount);
        stats.put("processing", processingCount);
        stats.put("shipped", shippedCount);
        stats.put("delivered", deliveredCount);
        stats.put("cancelled", cancelledCount);
        
        return stats;
    }
} 