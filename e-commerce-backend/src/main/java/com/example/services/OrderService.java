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
import com.example.services.generic.GenericServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService extends GenericServiceImpl<OrderEntity, OrderDTO.OrderResponse, OrderDTO.CreateOrderRequest, Long> {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository; // For filtering by product name/id
    private final StoreRepository storeRepository;   // For filtering by store name/id
    private final UserRepository userRepository;     // For filtering by customer email/id

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        StoreRepository storeRepository,
                        UserRepository userRepository) {
        super(orderRepository);
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
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
    protected OrderEntity convertToEntity(OrderDTO.CreateOrderRequest createDto) {
        // Admin context might not create orders often, but implemented for completeness
        // This would involve mapping DTOs to entities, fetching related entities (User, Products)
        // and setting up OrderItems. This is a complex operation usually handled elsewhere.
        // For now, a basic placeholder.
        if (createDto == null) return null;
        OrderEntity entity = new OrderEntity();
        // entity.setUser(...); // Requires fetching User based on context or DTO field
        // entity.setShippingAddress(...); // Requires mapping ShippingAddressDTO to Address entity
        // entity.setStripeChargeId(createDto.getStripePaymentChargeId());
        // entity.setStatus(OrderEntity.Status.pending); // Default status
        // entity.setOrderItems(...); // Requires mapping List<OrderItemDTO> to List<OrderItem>
        // throw new UnsupportedOperationException("Order creation via admin is complex and not fully implemented yet.");
         return entity; // Basic, needs full implementation if used
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