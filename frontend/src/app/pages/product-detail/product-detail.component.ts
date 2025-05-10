import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CompareService } from '../../services/compare.service';
import { Product } from '../../models/product.model';
import { ProductCarouselComponent } from '../../components/product-carousel/product-carousel.component';
import { ProductReviewsComponent } from '../../components/reviews/product-reviews.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductCarouselComponent,
    ProductReviewsComponent
  ],
  template: `
    <div class="container mx-auto px-4" *ngIf="product && !isLoading && !hasError">
      <!-- Breadcrumbs with Tailwind -->
      <div class="text-sm text-neutral-600 mb-4">
        <a routerLink="/" class="text-neutral-600 hover:text-primary">Home</a> / 
        <a [routerLink]="['/category', product.category]" class="text-neutral-600 hover:text-primary">{{categoryName}}</a> / 
        <span>{{product.title}}</span>
      </div>
      
      <div class="product-detail">
        <div class="product-gallery">
          <div class="main-image-container">
            <img [src]="selectedImage" [alt]="product.title" class="main-image">
          </div>
          
          <div class="thumbnail-gallery">
            <div 
              *ngFor="let image of product.images; let i = index" 
              class="thumbnail-item"
              [class.active]="selectedImage === image"
              (click)="selectedImage = image"
            >
              <img [src]="image" [alt]="product.title + ' image ' + (i+1)" (error)="handleImageError($event)">
            </div>
          </div>
          
          <!-- Action buttons with Tailwind -->
          <div class="flex mt-4 gap-4">
            <button 
              class="flex items-center gap-2 px-4 py-2 border rounded-md transition-colors duration-200"
              [class]="product.isFavorite ? 'text-white bg-primary border-primary' : 'text-neutral-700 border-neutral-300 hover:border-primary hover:text-primary'"
              (click)="toggleFavorite()"
            >
              <span class="material-symbols-outlined">
                {{product.isFavorite ? 'favorite' : 'favorite_border'}}
              </span>
              <span>{{product.isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}}</span>
            </button>
            
            <button class="flex items-center gap-2 px-4 py-2 text-neutral-700 border border-neutral-300 rounded-md hover:border-primary hover:text-primary transition-colors duration-200">
              <span class="material-symbols-outlined">share</span>
              <span>Share</span>
            </button>
          </div>
        </div>
        
        <div class="product-info">
          <!-- Product header with Tailwind -->
          <div class="mb-4">
            <h1 class="text-2xl font-semibold text-neutral-900">{{product.title}}</h1>
            <div class="text-sm text-neutral-600 mb-2">{{product.brand}}</div>
            
            <a [routerLink]="['/store', product.sellerId]" class="flex items-center gap-1 text-sm text-primary mb-2">
              <span class="material-symbols-outlined text-base">store</span>
              {{product.sellerName}}
            </a>
            
            <div class="flex items-center">
              <div class="flex">
                <span 
                  *ngFor="let star of [1,2,3,4,5]" 
                  class="material-symbols-outlined text-lg"
                  [class]="star <= Math.round(product.rating) ? 'text-warning' : 'text-neutral-300'"
                >
                  star
                </span>
              </div>
              <span class="text-sm text-neutral-700 ml-2">
                {{product.rating}} ({{product.reviewCount}} Reviews)
              </span>
            </div>
          </div>
          
          <div class="product-price">
            <span class="current-price">{{product.price | currency:'TRY':'₺'}}</span>
            <span class="original-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
              {{product.originalPrice | currency:'TRY':'₺'}}
            </span>
            <span class="discount-badge" *ngIf="product.discountPercentage && product.discountPercentage > 0">
              {{product.discountPercentage}}% OFF
            </span>
          </div>
          
          <div class="product-tags">
            <span class="tag in-stock" *ngIf="product.inStock">In Stock</span>
            <span class="tag out-of-stock" *ngIf="!product.inStock">Out of Stock</span>
            <span class="tag free-shipping" *ngIf="product.freeShipping">Free Shipping</span>
            <span class="tag fast-delivery" *ngIf="product.fastDelivery">Fast Delivery</span>
          </div>
          
          <div class="quantity-selector">
            <h3 class="variant-title">Quantity</h3>
            <div class="quantity-controls">
              <button (click)="decreaseQuantity()" [disabled]="quantity <= 1">-</button>
              <input type="number" [(ngModel)]="quantity" min="1" max="10">
              <button (click)="increaseQuantity()">+</button>
            </div>
          </div>
          
          <div class="product-actions">
            <button 
              class="add-to-cart-btn" 
              (click)="addToCart()"
              [disabled]="!product.inStock"
            >
              <span class="material-symbols-outlined">shopping_cart</span>
              Add to Cart
            </button>
            
            <button 
              class="compare-btn" 
              (click)="toggleCompare()"
              [class.is-comparing]="isInCompare"
            >
              <span class="material-symbols-outlined">{{isInCompare ? 'compare_check' : 'compare'}}</span>
              {{isInCompare ? 'Remove from Compare' : 'Add to Compare'}}
            </button>
            
            <button class="buy-now-btn" [disabled]="!product.inStock">
              <span class="material-symbols-outlined">bolt</span>
              Buy Now
            </button>
          </div>
          
          <div class="product-description">
            <h3>Product Description</h3>
            <p>{{product.description}}</p>
          </div>
        </div>
      </div>
      
      <!-- Related Products Section -->
      <div class="related-products" *ngIf="!loadingRelated && !relatedError && relatedProducts.length > 0">
        <app-product-carousel
          [products]="relatedProducts"
          title="You May Also Like"
        ></app-product-carousel>
      </div>
      
      <!-- Loading state for related products -->
      <div *ngIf="loadingRelated" class="flex justify-center items-center py-8">
        <div class="w-8 h-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
      
      <!-- Error state for related products -->
      <div *ngIf="relatedError" class="bg-red-50 border border-red-200 rounded-md p-4 my-8">
        <p class="text-red-600 text-sm">Unable to load related products.</p>
      </div>
    </div>
    
    <!-- Loading state with Tailwind -->
    <div class="container mx-auto px-4 flex flex-col items-center justify-center py-16" *ngIf="isLoading">
      <div class="w-16 h-16 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mb-6"></div>
      <p class="text-lg text-neutral-600">Loading product details...</p>
    </div>
    
    <!-- Error state with Tailwind -->
    <div class="container mx-auto px-4 flex flex-col items-center justify-center py-16" *ngIf="hasError">
      <div class="text-center max-w-md">
        <div class="text-5xl mb-4 text-error">
          <span class="material-symbols-outlined" style="font-size: 4rem;">error</span>
        </div>
        <h2 class="text-2xl font-semibold mb-2 text-neutral-800">Product Not Found</h2>
        <p class="text-neutral-600 mb-6">The product you're looking for doesn't exist or there was an error loading it.</p>
        <div class="flex justify-center gap-4">
          <a routerLink="/" class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
            Go to Homepage
          </a>
          <button (click)="loadProduct()" class="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:border-primary hover:text-primary transition-colors">
            Try Again
          </button>
        </div>
      </div>
    </div>
    
    <!-- Reviews Section -->
    <section class="mt-8 pt-8 border-t border-neutral-200" *ngIf="product && !isLoading && !hasError">
      <div class="container mx-auto px-4">
        <app-product-reviews [productId]="product?.id || 0"></app-product-reviews>
      </div>
    </section>
  `,
  styles: [`
    .product-detail {
      display: flex;
      gap: var(--space-6);
      margin-bottom: var(--space-6);
    }
    
    .product-gallery {
      flex: 0 0 45%;
    }
    
    .main-image-container {
      width: 100%;
      height: 400px;
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: var(--space-4);
    }
    
    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .thumbnail-gallery {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }
    
    .thumbnail-item {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color var(--transition-fast);
    }
    
    .thumbnail-item.active {
      border-color: var(--primary);
    }
    
    .thumbnail-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .image-actions {
      display: flex;
      gap: var(--space-4);
    }
    
    .favorite-button,
    .share-button {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      background-color: transparent;
      border: 1px solid var(--neutral-300);
      color: var(--neutral-700);
      transition: all var(--transition-fast);
    }
    
    .favorite-button:hover,
    .share-button:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    
    .favorite-button.is-favorite {
      background-color: var(--primary);
      border-color: var(--primary);
      color: var(--white);
    }
    
    .product-info {
      flex: 1;
    }
    
    .product-header {
      margin-bottom: var(--space-4);
    }
    
    .product-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }
    
    .product-brand {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
    }
    
    .seller-link {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: 0.875rem;
      color: var(--primary);
      margin-bottom: var(--space-2);
    }
    
    .product-rating {
      display: flex;
      align-items: center;
    }
    
    .stars {
      display: flex;
    }
    
    .stars .material-symbols-outlined {
      font-size: 1.25rem;
      color: var(--neutral-300);
    }
    
    .stars .material-symbols-outlined.filled {
      color: var(--warning);
    }
    
    .rating-text {
      font-size: 0.875rem;
      color: var(--neutral-700);
      margin-left: var(--space-2);
    }
    
    .product-price {
      display: flex;
      align-items: center;
      margin: var(--space-4) 0;
    }
    
    .current-price {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary);
    }
    
    .original-price {
      font-size: 1rem;
      color: var(--neutral-500);
      text-decoration: line-through;
      margin-left: var(--space-2);
    }
    
    .discount-badge {
      background-color: var(--primary);
      color: var(--white);
      font-size: 0.75rem;
      font-weight: 600;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      margin-left: var(--space-2);
    }
    
    .product-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }
    
    .tag {
      font-size: 0.75rem;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
    }
    
    .tag.in-stock {
      background-color: var(--success);
      color: var(--white);
    }
    
    .tag.out-of-stock {
      background-color: var(--error);
      color: var(--white);
    }
    
    .tag.free-shipping {
      background-color: var(--secondary);
      color: var(--white);
    }
    
    .tag.fast-delivery {
      background-color: var(--warning);
      color: var(--white);
    }
    
    .quantity-selector {
      margin-bottom: var(--space-4);
    }
    
    .quantity-controls {
      display: flex;
      width: fit-content;
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    
    .quantity-controls button {
      width: 36px;
      height: 36px;
      background-color: var(--neutral-100);
      border: none;
      font-size: 1.25rem;
      padding: 0;
      cursor: pointer;
    }
    
    .quantity-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .quantity-controls input {
      width: 50px;
      text-align: center;
      border: none;
      border-left: 1px solid var(--neutral-300);
      border-right: 1px solid var(--neutral-300);
      -moz-appearance: textfield;
    }
    
    .quantity-controls input::-webkit-outer-spin-button,
    .quantity-controls input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    .product-actions {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }
    
    .add-to-cart-btn,
    .buy-now-btn,
    .compare-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 1rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .add-to-cart-btn {
      background-color: var(--white);
      color: var(--primary);
      border: 1px solid var(--primary);
    }
    
    .compare-btn {
      background-color: var(--white);
      color: var(--neutral-700);
      border: 1px solid var(--neutral-300);
    }
    
    .compare-btn.is-comparing {
      background-color: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
    }
    
    .buy-now-btn {
      background-color: var(--primary);
      color: var(--white);
      border: 1px solid var(--primary);
    }
    
    .add-to-cart-btn:hover:not(:disabled) {
      background-color: var(--primary-light);
      color: var(--white);
    }
    
    .compare-btn:hover:not(:disabled) {
      background-color: var(--neutral-100);
    }
    
    .buy-now-btn:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
    
    .add-to-cart-btn:disabled, 
    .buy-now-btn:disabled {
      background-color: var(--neutral-200);
      border-color: var(--neutral-300);
      color: var(--neutral-500);
      cursor: not-allowed;
    }
    
    .product-description {
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
    }
    
    .product-description h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--neutral-800);
    }
    
    .product-description p {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--neutral-700);
    }
    
    .related-products {
      margin-top: var(--space-8);
    }
    
    .product-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) 0;
    }
    
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--neutral-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    @media (max-width: 992px) {
      .product-detail {
        flex-direction: column;
      }
      
      .product-gallery {
        flex: 0 0 auto;
      }
    }
    
    @media (max-width: 576px) {
      .thumbnail-gallery {
        flex-wrap: wrap;
      }
      
      .image-actions {
        flex-direction: column;
      }
      
      .product-actions {
        flex-direction: column;
      }
    }
    
    .product-reviews-section {
      margin-top: var(--space-8);
      padding-top: var(--space-8);
      border-top: 1px solid var(--neutral-200);
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  productId: number = 0;
  product: Product | undefined;
  relatedProducts: Product[] = [];
  selectedImage: string = '';
  quantity: number = 1;
  categoryName: string = '';
  Math = Math;
  isInCompare: boolean = false;
  
  // Loading and error states
  isLoading: boolean = true;
  hasError: boolean = false;
  loadingRelated: boolean = false;
  relatedError: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private compareService: CompareService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('productId') || params.get('id');
      if (idParam) {
        this.productId = +idParam;
        this.loadProduct();
      } else {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
  
  loadProduct(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.selectedImage = this.getFirstValidImage(product);
          
          this.setCategoryName();
          this.loadRelatedProducts();
          
          this.isInCompare = this.compareService.isInCompare(product.id);
        } else {
          this.hasError = true;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error loading product with ID ${this.productId}:`, error);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
  
  getFirstValidImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://via.placeholder.com/500';
  }
  
  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/150';
  }
  
  setCategoryName(): void {
    if (this.product) {
      // Convert slug to display name
      this.categoryName = this.product.category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  loadRelatedProducts(): void {
    if (this.product) {
      this.loadingRelated = true;
      this.relatedError = false;
      
      this.productService.getProductsByCategory(this.product.category).subscribe({
        next: (products) => {
          // Filter out the current product
          this.relatedProducts = products.filter(p => p.id !== this.productId);
          this.loadingRelated = false;
        },
        error: (error) => {
          console.error('Error loading related products:', error);
          this.relatedError = true;
          this.loadingRelated = false;
        }
      });
    }
  }
  
  increaseQuantity(): void {
    if (this.quantity < 10) {
      this.quantity++;
    }
  }
  
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(
        this.product, 
        this.quantity
      );
    }
  }
  
  toggleFavorite(): void {
    if (this.product) {
      this.productService.toggleFavorite(this.product.id).subscribe(isFavorite => {
        if (this.product) {
          this.product.isFavorite = !this.product.isFavorite;
        }
      });
    }
  }
  
  toggleCompare(): void {
    if (!this.product) return;
    
    if (this.isInCompare) {
      this.compareService.removeFromCompare(this.product?.id || 0);
      this.isInCompare = false;
    } else {
      if (this.product) {
        const added = this.compareService.addToCompare(this.product);
        this.isInCompare = added;
      }
    }
  }
}
