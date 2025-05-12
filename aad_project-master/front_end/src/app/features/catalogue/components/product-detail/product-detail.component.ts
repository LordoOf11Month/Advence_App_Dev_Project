import { AuthService } from './../../../../core/services/auth.service';
import { CartService } from './../../../cart/services/cart.service';
// features/catalogue/components/product-detail/product-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { ReviewService, Review } from '../../services/review.service';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../checkout/services/order.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  reviews: Review[] = [];
  private routeSub?: Subscription;
  error: string | null = null;
  isLoggedIn: boolean = false;
  canReview: boolean = false;
  role: string = '';
  checkingEligibility: boolean = false;
  hasAlreadyPurchased: boolean = false;
  activeImageIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private reviewService: ReviewService,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter to load product details when ID changes
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    });

    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      // Check user role
      this.authService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.role = user.roles ? user.roles[0] : '';
            // Sellers and admins can't review products
            if (this.role === 'SELLER' || this.role === 'PLATFORM_ADMIN') {
              this.canReview = false;
            }
          }
        }
      });
    }
  }

  loadProduct(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: product => {
        this.product = product;
        this.activeImageIndex = 0; // Reset image index when loading a new product

        // Load reviews for this product
        this.loadReviews();

        // Check if user has purchased and received this product
        if (this.isLoggedIn && this.role !== 'SELLER' && this.role !== 'PLATFORM_ADMIN') {
          this.checkingEligibility = true;

          // Get user's orders and check if they've purchased and received this product
          this.orderService.getUserOrders().subscribe({
            next: (orders) => {
              // Check if any delivered order contains this product
              this.hasAlreadyPurchased = orders.some(order =>
                order.status === 'DELIVERED' &&
                order.items.some(item => item.productId === product.id)
              );

              // Can review if purchased and haven't already reviewed
              this.checkIfAlreadyReviewed(product.id);
            },
            error: () => {
              this.canReview = false;
              this.checkingEligibility = false;
            }
          });
        }
      },
      error: err => {
        console.error('Failed to load product', err);
        this.error = 'Product not found or an error occurred.';
      }
    });
  }

  loadReviews(): void {
    if (!this.product) return;

    this.reviewService.getReviews(this.product.id).subscribe({
      next: reviews => this.reviews = reviews,
      error: err => console.error('Failed to load reviews', err)
    });
  }

  checkIfAlreadyReviewed(productId: number): void {
    this.reviewService.getUserReviewForProduct(productId).subscribe({
      next: (review) => {
        // User can either create a new review OR edit an existing one
        // If they have purchased the product, they should always be able to interact with the review form
        this.canReview = this.hasAlreadyPurchased;
        this.checkingEligibility = false;
      },
      error: () => {
        this.canReview = false;
        this.checkingEligibility = false;
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product, 1);
    // Optionally, we could show a success message:
    // this.notificationService.showSuccess(product.name + ' added to cart');
  }

  onReviewSubmitted(newReview: Review): void {
    // Reload all reviews to get the updated list
    this.loadReviews();

    // Make sure we know that the user has submitted a review
    // This is important for subsequent visits to the page
    if (this.product) {
      this.reviewService.getUserReviewForProduct(this.product.id).subscribe();
    }
  }

  // Image swiper functions
  selectImage(index: number): void {
    if (this.product?.imageUrls && index >= 0 && index < this.product.imageUrls.length) {
      this.activeImageIndex = index;
    }
  }

  nextImage(): void {
    if (this.product?.imageUrls) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.product.imageUrls.length;
    }
  }

  prevImage(): void {
    if (this.product?.imageUrls) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.product.imageUrls.length) % this.product.imageUrls.length;
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
