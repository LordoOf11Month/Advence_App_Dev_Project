# Role-Based Generic API Implementation Guide

This document outlines the steps needed to fully implement the role-based generic API structure for the e-commerce backend.

## Important Notes

1. When creating packages for controllers, use `pub` instead of `public` since `public` is a Java keyword and can't be used as a package name.

## Completed Implementation

We have already implemented:

1. Generic repository, service, and controller interfaces and base classes
2. Role-based controllers for the Product entity:
   - PublicProductController for public access
   - ProductController for authenticated users
   - SellerProductController for sellers
   - AdminProductController for administrators
3. Updated security configuration to support our role-based API structure

## Remaining Implementation Tasks

### 1. Update Entity Models

Ensure all entity models have the necessary timestamps (createdAt, updatedAt) and appropriate JPA annotations:

- [ ] User
- [ ] Store
- [ ] Category
- [ ] Order & OrderItem
- [ ] Cart & CartItem
- [ ] Review
- [ ] Payment & PaymentMethod
- [ ] Address
- [ ] Banner
- [ ] Discount & PromoCode

### 2. Update DTOs for Each Entity

Each entity should have corresponding DTOs in the package structure:

```java
public class EntityNameDTO {
    @Data
    public static class Response {
        // Response fields
    }
    
    @Data
    public static class Request {
        // Request fields with validation annotations
    }
    
    @Data
    public static class Filter {
        // Filter fields for search and filtering
    }
}
```

### 3. Update Repositories

Update each repository to extend GenericRepository:

```java
@Repository
public interface EntityNameRepository extends GenericRepository<EntityName, Long> {
    // Custom query methods
}
```

### 4. Update Services

Update each service to extend GenericServiceImpl:

```java
@Service
public class EntityNameService extends GenericServiceImpl<EntityName, EntityNameDTO.Response, EntityNameDTO.Request, Long> {
    
    private final EntityNameRepository entityNameRepository;
    
    public EntityNameService(EntityNameRepository entityNameRepository) {
        super(entityNameRepository);
        this.entityNameRepository = entityNameRepository;
    }
    
    // Implement required abstract methods
    @Override
    protected EntityNameDTO.Response convertToDto(EntityName entity) {
        // Conversion logic
    }
    
    @Override
    protected EntityName convertToEntity(EntityNameDTO.Request request) {
        // Conversion logic
    }
    
    @Override
    protected EntityName convertToEntityForUpdate(Long id, EntityNameDTO.Request request) {
        // Update logic
    }
    
    // Custom service methods
}
```

### 5. Create Role-Based Controllers

For each entity, create appropriate role-based controllers based on access requirements:

#### Public Controllers

```java
@RestController
@RequestMapping("/api/public/entity-names")
public class PublicEntityNameController extends GenericController<EntityName, EntityNameDTO.Response, EntityNameDTO.Request, Long> {
    // Public endpoints
}
```

#### User Controllers

```java
@RestController
@RequestMapping("/api/entity-names")
@PreAuthorize("isAuthenticated()")
public class EntityNameController extends GenericController<EntityName, EntityNameDTO.Response, EntityNameDTO.Request, Long> {
    // User-specific endpoints
}
```

#### Seller Controllers

```java
@RestController
@RequestMapping("/api/seller/entity-names")
@PreAuthorize("hasRole('SELLER')")
public class SellerEntityNameController extends GenericController<EntityName, EntityNameDTO.Response, EntityNameDTO.Request, Long> {
    // Seller-specific endpoints
}
```

#### Admin Controllers

```java
@RestController
@RequestMapping("/api/admin/entity-names")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEntityNameController extends GenericController<EntityName, EntityNameDTO.Response, EntityNameDTO.Request, Long> {
    // Admin-specific endpoints
}
```

### 6. Implementations Needed for Each Entity

#### User
- [ ] Update User entity
- [ ] Create/update UserDTO
- [ ] Update UserRepository and UserService
- [ ] Create AdminUserController
- [ ] Update UserController

#### Store
- [ ] Update Store entity
- [ ] Create/update StoreDTO
- [ ] Update StoreRepository and StoreService
- [ ] Create PublicStoreController
- [ ] Create SellerStoreController
- [ ] Create AdminStoreController

#### Category
- [ ] Update Category entity
- [ ] Create/update CategoryDTO
- [ ] Update CategoryRepository and CategoryService
- [ ] Create PublicCategoryController
- [ ] Create AdminCategoryController

#### Order & OrderItem
- [ ] Update Order and OrderItem entities
- [ ] Create/update OrderDTO and OrderItemDTO
- [ ] Update OrderRepository and OrderService
- [ ] Create OrderController for users
- [ ] Create SellerOrderController
- [ ] Create AdminOrderController

#### Cart & CartItem
- [ ] Update Cart and CartItem entities
- [ ] Create/update CartDTO and CartItemDTO
- [ ] Update CartRepository and CartService
- [ ] Update CartController

#### Review
- [ ] Update Review entity
- [ ] Create/update ReviewDTO
- [ ] Update ReviewRepository and ReviewService
- [ ] Create ReviewController
- [ ] Create AdminReviewController

#### Payment & PaymentMethod
- [ ] Update Payment and PaymentMethod entities
- [ ] Create/update PaymentDTO and PaymentMethodDTO
- [ ] Update PaymentRepository and PaymentService
- [ ] Update PaymentController
- [ ] Update PaymentMethodController

#### Address
- [ ] Update Address entity
- [ ] Create/update AddressDTO
- [ ] Update AddressRepository and AddressService
- [ ] Update AddressController

#### Banner
- [ ] Update Banner entity
- [ ] Create/update BannerDTO
- [ ] Update BannerRepository and BannerService
- [ ] Create PublicBannerController
- [ ] Create AdminBannerController

#### Discount & PromoCode
- [ ] Update Discount and PromoCode entities
- [ ] Create/update DiscountDTO and PromoCodeDTO
- [ ] Update DiscountRepository and PromoCodeRepository
- [ ] Update DiscountService and PromoCodeService
- [ ] Create PublicDiscountController
- [ ] Create AdminDiscountController
- [ ] Create SellerDiscountController

### 7. Dashboard Controllers

- [ ] Create AdminDashboardController
- [ ] Create SellerDashboardController

## Implementation Strategy

1. Start with the most critical entities first (Product, User, Order)
2. Implement one entity at a time, completing all components before moving to the next
3. Test each implementation thoroughly before proceeding
4. Maintain consistent naming and structure across all implementations 