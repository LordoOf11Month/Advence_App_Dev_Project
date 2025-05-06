# Frontend Project Overview

## Presentation Summary

This Angular application is structured into several key areas:

1.  **Application Shell:** Provides the main layout (`AppComponent`) including the `HeaderComponent`, `FooterComponent`, and the main content area (`RouterOutlet`) where different pages are displayed.
2.  **Core Pages:** Includes standard user-facing pages like `HomeComponent`, `ProductListComponent`, `ProductDetailComponent`, `CartComponent`, `LoginComponent`, `RegisterComponent`, and `StorePageComponent`. User account management (`AccountComponent`) is protected.
3.  **Checkout Flow:** A multi-step process (`ShippingComponent`, `PaymentComponent`, `ReviewComponent`, `ConfirmationComponent`) for completing purchases.
4.  **Admin Section:** A protected area (`AuthGuard`) for administrators, featuring a dashboard and management pages for products, orders, users, and sellers, likely using a shared `AdminSidebar` for navigation.
5.  **Seller Section:** A protected area (`AuthGuard`) for sellers, including a dashboard (`SellerDashboardComponent`) and potentially lazy-loaded registration and dashboard components.
6.  **Shared Components:** Reusable UI elements like `ProductCard`, `StarRating`, `ProductCarousel`, `BannerSlider`, etc., used across various pages to maintain consistency.

Lazy loading is employed for seller-related components to optimize initial load times. Authentication guards protect sensitive areas like Account, Admin, and Seller sections.

---

# Angular Component Diagram

This diagram illustrates the relationships between the main components in the Angular application.

```mermaid
graph TD
    subgraph App Shell [Application Shell]
        style App Shell fill:#f9f,stroke:#333,stroke-width:2px
        AppComponent --> HeaderComponent;
        AppComponent --> FooterComponent;
        AppComponent --> RouterOutlet;
    end

    subgraph Pages [Routed Pages]
        style Pages fill:#ccf,stroke:#333,stroke-width:1px
        RouterOutlet --> HomeComponent;
        RouterOutlet --> ProductListComponent;
        RouterOutlet --> ProductDetailComponent;
        RouterOutlet --> CartComponent;
        RouterOutlet --> AccountComponent[Account (AuthGuard)];
        RouterOutlet --> LoginComponent;
        RouterOutlet --> RegisterComponent;
        RouterOutlet --> StorePageComponent;
        RouterOutlet --> CheckoutRoutes[Checkout Flow];
        RouterOutlet --> AdminRoutes[Admin Section (AuthGuard)];
        RouterOutlet --> SellerRoutes[Seller Section (AuthGuard)];
        RouterOutlet --> SellerRegisterComponent_Lazy[SellerRegister (Lazy)];
        RouterOutlet --> SellerDashboardComponent_Lazy[SellerDashboard (Lazy)];
    end

    subgraph Checkout Flow
        style Checkout Flow fill:#eef,stroke:#333,stroke-width:1px
        CheckoutRoutes --> ShippingComponent;
        CheckoutRoutes --> PaymentComponent;
        CheckoutRoutes --> ReviewComponent;
        CheckoutRoutes --> ConfirmationComponent;
    end

    subgraph Admin Section
        style Admin Section fill:#efe,stroke:#333,stroke-width:1px
        AdminRoutes --> AdminDashboardComponent;
        AdminRoutes --> AdminProductsComponent;
        AdminRoutes --> AdminOrdersComponent;
        AdminRoutes --> AdminUsersComponent;
        AdminRoutes --> AdminSellersComponent;

        %% Admin Sidebar (Implied Usage in each admin component's template)
        AdminDashboardComponent -.-> AdminSidebar{Admin Sidebar Nav};
        AdminProductsComponent -.-> AdminSidebar;
        AdminOrdersComponent -.-> AdminSidebar;
        AdminUsersComponent -.-> AdminSidebar;
        AdminSellersComponent -.-> AdminSidebar;
    end

     subgraph Seller Section
        style Seller Section fill:#fee,stroke:#333,stroke-width:1px
        SellerRoutes --> SellerDashboardComponent[Seller Dashboard];
        %% SellerDashboardComponent handles /seller, /seller/products, /seller/orders, /seller/profile routes
     end

    subgraph Shared Components
        style Shared Components fill:#cfc,stroke:#333,stroke-width:1px
        ProductDetailComponent --> ProductCarousel;
        ProductDetailComponent --> ProductReviews;
        ReviewComponent --> CheckoutProgress;
        ReviewComponent --> OrderSummary;
        ProductListComponent --> ProductCard;
        HomeComponent --> BannerSlider;
        HomeComponent --> CategoryShowcase;
        HomeComponent --> ProductCarousel;
        ProductReviews --> ReviewList;
        ProductReviews --> StarRating;
        ProductCard --> StarRating;
        %% CartComponent likely uses internal elements for summary, not a separate component based on view
    end

    %% Component Usage/Nesting (Examples)
    ProductDetailComponent -.-> ProductCarousel;
    ProductDetailComponent -.-> ProductReviews;
    ReviewComponent -.-> CheckoutProgress;
    ReviewComponent -.-> OrderSummary;
    ProductListComponent -.-> ProductCard;
    HomeComponent -.-> BannerSlider;
    HomeComponent -.-> CategoryShowcase;
    HomeComponent -.-> ProductCarousel;
    ProductReviews -.-> ReviewList;
    ProductReviews -.-> StarRating;
    ProductCard -.-> StarRating;

    classDef shell fill:#fdf,stroke:#333,stroke-width:2px;
    classDef page fill:#eef,stroke:#333,stroke-width:1px;
    classDef shared fill:#efe,stroke:#333,stroke-width:1px;
    classDef flow fill:#eee,stroke:#666,stroke-width:1px,color:#666;
    classDef lazy fill:#fff,stroke:#aaa,stroke-width:1px,stroke-dasharray: 5 5;
    classDef guard fill:#fcc,stroke:#c00,stroke-width:1px;

    class AppComponent,HeaderComponent,FooterComponent,RouterOutlet shell;
    class HomeComponent,ProductListComponent,ProductDetailComponent,CartComponent,LoginComponent,RegisterComponent,StorePageComponent,ShippingComponent,PaymentComponent,ReviewComponent,ConfirmationComponent,AdminDashboardComponent,AdminProductsComponent,AdminOrdersComponent,AdminUsersComponent,AdminSellersComponent,SellerDashboardComponent page;
    class AccountComponent guard;
    class SellerRegisterComponent_Lazy,SellerDashboardComponent_Lazy lazy;
    class ProductCarousel,ProductReviews,CheckoutProgress,OrderSummary,ProductCard,BannerSlider,CategoryShowcase,ReviewList,StarRating,AdminSidebar shared;
    class CheckoutRoutes,AdminRoutes,SellerRoutes flow;

```

**Notes:**

*   `-->` indicates a direct relationship, either through routing or direct embedding in a template.
*   `-.->` indicates a component being used within another component's template (composition).
*   `(AuthGuard)` denotes routes protected by an authentication guard.
*   `(Lazy)` denotes components that are lazy-loaded.
*   The Admin Sidebar is shown conceptually; it's part of the template structure of each admin page rather than a distinct shared component based on the files viewed.
*   Some shared components like `LoadingSpinner` or `ErrorDisplay` are omitted for brevity but are typically used across various components.
*   This diagram is based on the file structure and routing configuration observed. Actual runtime relationships might differ slightly based on dynamic component loading or complex service interactions not fully represented here.