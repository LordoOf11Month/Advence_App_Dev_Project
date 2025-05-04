import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { ProductCarouselComponent } from '../../components/product-carousel/product-carousel.component';
import { ReviewListComponent } from '../../components/reviews/review-list.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCarouselComponent, ReviewListComponent],
  template: `
    <div class="container" *ngIf="product">
      <div class="breadcrumbs">
        <a routerLink="/">Home</a> / 
        <a [routerLink]="['/category', product.category]">{{categoryName}}</a> / 
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
              <img [src]="image" [alt]="product.title + ' image ' + (i+1)">
            </div>
          </div>
          
          <div class="image-actions">
            <button 
              class="favorite-button" 
              (click)="toggleFavorite()"
              [class.is-favorite]="product.isFavorite"
            >
              <span class="material-symbols-outlined">
                {{product.isFavorite ? 'favorite' : 'favorite_border'}}
              </span>
              <span>{{product.isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}}</span>
            </button>
            
            <button class="share-button">
              <span class="material-symbols-outlined">share</span>
              <span>Share</span>
            </button>
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-header">
            <h1 class="product-title">{{product.title}}</h1>
            <div class="product-brand">{{product.brand}}</div>
            
            <a [routerLink]="['/store', product.sellerId]" class="seller-link">
              <span class="material-symbols-outlined">store</span>
              {{product.sellerName}}
            </a>
            
            <div class="product-rating">
              <div class="stars" [attr.data-rating]="product.rating">
                <span 
                  *ngFor="let star of [1,2,3,4,5]" 
                  class="material-symbols-outlined"
                  [class.filled]="star <= Math.round(product.rating)"
                >
                  star
                </span>
              </div>
              <span class="rating-text">
                {{product.rating}} ({{product.reviewCount}} Reviews)
              </span>
            </div>
          </div>
          
          <div class="product-price">
            <span class="current-price">{{product.price | currency:'TRY':'₺'}}</span>
            <span class="original-price" *ngIf="product.originalPrice">
              {{product.originalPrice | currency:'TRY':'₺'}}
            </span>
            <span class="discount-badge" *ngIf="product.discountPercentage">
              {{product.discountPercentage}}% OFF
            </span>
          </div>
          
          <div class="product-tags">
            <span class="tag in-stock" *ngIf="product.inStock">In Stock</span>
            <span class="tag out-of-stock" *ngIf="!product.inStock">Out of Stock</span>
            <span class="tag free-shipping" *ngIf="product.freeShipping">Free Shipping</span>
            <span class="tag fast-delivery" *ngIf="product.fastDelivery">Fast Delivery</span>
          </div>
          
          <div class="product-variants" *ngIf="product.colors?.length">
            <h3 class="variant-title">Colors</h3>
            <div class="color-options">
              <div 
                *ngFor="let color of product.colors" 
                class="color-option"
                [class.selected]="selectedColor === color"
                (click)="selectedColor = color"
              >
                {{color}}
              </div>
            </div>
          </div>
          
          <div class="product-variants" *ngIf="product.sizes?.length">
            <h3 class="variant-title">Sizes</h3>
            <div class="size-options">
              <div 
                *ngFor="let size of product.sizes" 
                class="size-option"
                [class.selected]="selectedSize === size"
                (click)="selectedSize = size"
              >
                {{size}}
              </div>
            </div>
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
      
      <!-- Product Reviews Section -->
      <div class="product-reviews">
        <app-review-list [productId]="product.id"></app-review-list>
      </div>
      
      <div class="related-products">
        <app-product-carousel
          [products]="relatedProducts"
          title="You May Also Like"
        ></app-product-carousel>
      </div>
    </div>
    
    <div class="container product-loading" *ngIf="!product">
      <div class="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>
  `,
  styles: [`
    .breadcrumbs {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-4);
    }
    
    .breadcrumbs a {
      color: var(--neutral-600);
      text-decoration: none;
    }
    
    .breadcrumbs a:hover {
      color: var(--primary);
    }
    
    .product-detail {
      display: flex;
      gap: var(--space-6);
      margin-bottom: var(--space-8);
    }
    
    .product-gallery {
      flex: 0 0 50%;
    }
    
    .main-image-container {
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: var(--space-3);
      background-color: var(--white);
    }
    
    .main-image {
      width: 100%;
      aspect-ratio: 1;
      object-fit: contain;
    }
    
    .thumbnail-gallery {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }
    
    .thumbnail-item {
      width: 70px;
      height: 70px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid var(--neutral-200);
      cursor: pointer;
      transition: border-color var(--transition-fast);
    }
    
    .thumbnail-item.active {
      border-color: var(--primary);
    }
    
    .thumbnail-item:hover {
      border-color: var(--primary-light);
    }
    
    .thumbnail-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .image-actions {
      display: flex;
      gap: var(--space-3);
    }
    
    .favorite-button, .share-button {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background-color: var(--white);
      border: 1px solid var(--neutral-300);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      color: var(--neutral-700);
      transition: all var(--transition-fast);
      cursor: pointer;
    }
    
    .favorite-button:hover, .share-button:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    
    .favorite-button.is-favorite {
      color: var(--error);
      border-color: var(--error);
    }
    
    .favorite-button.is-favorite .material-symbols-outlined {
      color: var(--error);
    }
    
    .product-info {
      flex: 1;
    }
    
    .product-header {
      margin-bottom: var(--space-4);
    }
    
    .product-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }
    
    .product-brand {
      font-size: 1rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
    }
    
    .seller-link {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.9375rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-3);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .seller-link:hover {
      color: var(--primary);
    }

    .seller-link .material-symbols-outlined {
      font-size: 1.125rem;
    }
    
    .product-rating {
      display: flex;
      align-items: center;
    }
    
    .stars {
      display: flex;
      align-items: center;
      margin-right: var(--space-2);
    }
    
    .stars .material-symbols-outlined {
      color: var(--neutral-300);
      font-size: 1.25rem;
    }
    
    .stars .material-symbols-outlined.filled {
      color: var(--warning);
    }
    
    .rating-text {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }
    
    .product-price {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    
    .current-price {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary);
      margin-right: var(--space-3);
    }
    
    .original-price {
      font-size: 1.125rem;
      color: var(--neutral-500);
      text-decoration: line-through;
      margin-right: var(--space-3);
    }
    
    .discount-badge {
      background-color: var(--primary);
      color: var(--white);
      font-size: 0.875rem;
      font-weight: 600;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
    }
    
    .product-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }
    
    .tag {
      font-size: 0.8125rem;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      font-weight: 500;
    }
    
    .in-stock {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }
    
    .out-of-stock {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
    }
    
    .free-shipping {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }
    
    .fast-delivery {
      background-color: rgba(0, 102, 255, 0.1);
      color: var(--secondary);
    }
    
    .product-variants {
      margin-bottom: var(--space-4);
    }
    
    .variant-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: var(--space-2);
      color: var(--neutral-800);
    }
    
    .color-options, .size-options {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    
    .color-option, .size-option {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .color-option.selected, .size-option.selected {
      border-color: var(--primary);
      background-color: var(--primary);
      color: var(--white);
    }
    
    .color-option:hover, .size-option:hover {
      border-color: var(--primary-light);
    }
    
    .quantity-selector {
      margin-bottom: var(--space-4);
    }
    
    .quantity-controls {
      display: flex;
      align-items: center;
      width: fit-content;
    }
    
    .quantity-controls button {
      width: 36px;
      height: 36px;
      border: 1px solid var(--neutral-300);
      background-color: var(--white);
      font-size: 1.25rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .quantity-controls button:first-child {
      border-radius: var(--radius-md) 0 0 var(--radius-md);
    }
    
    .quantity-controls button:last-child {
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
    }
    
    .quantity-controls button:hover:not(:disabled) {
      background-color: var(--neutral-100);
    }
    
    .quantity-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .quantity-controls input {
      width: 50px;
      height: 36px;
      border: 1px solid var(--neutral-300);
      border-left: none;
      border-right: none;
      text-align: center;
      font-size: 1rem;
    }
    
    .product-actions {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }
    
    .add-to-cart-btn, .buy-now-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3);
      font-size: 1rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .add-to-cart-btn {
      background-color: var(--white);
      color: var(--primary);
      border: 1px solid var(--primary);
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
    
    .buy-now-btn:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
    
    .add-to-cart-btn:disabled, .buy-now-btn:disabled {
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
  `]
})
export class ProductDetailComponent implements OnInit {
  productId: number = 0;
  product: Product | undefined;
  relatedProducts: Product[] = [];
  selectedImage: string = '';
  selectedColor: string = '';
  selectedSize: string = '';
  quantity: number = 1;
  categoryName: string = '';
  Math = Math;
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}
  
  ngOnInit(): void {
    console.log('ProductDetailComponent initialized');
    this.route.params.subscribe(params => {
      this.productId = +params['productId'];
      console.log('Product ID from route:', this.productId);
      this.loadProduct();
    });
  }
  
  loadProduct(): void {
    console.log('Loading product with ID:', this.productId);
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        console.log('Product loaded:', product);
        this.product = product;
        
        if (product) {
          this.selectedImage = product.images[0] || '';
          this.selectedColor = product.colors?.[0] || '';
          this.selectedSize = product.sizes?.[0] || '';
          
          this.setCategoryName();
          this.loadRelatedProducts();
        } else {
          console.error('Product not found for ID:', this.productId);
        }
      },
      error: (error) => {
        console.error('Error loading product', error);
      }
    });
  }
  
  setCategoryName(): void {
    if (!this.product) return;
    
    // Convert category ID to readable name (e.g., 'electronics' to 'Electronics')
    this.categoryName = this.product.category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  loadRelatedProducts(): void {
    if (!this.product) return;
    
    this.productService.getProductsByCategory(this.product.category).subscribe({
      next: (products: Product[]) => {
        // Filter out the current product
        this.relatedProducts = products.filter(p => p.id !== this.product?.id);
      }
    });
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
    if (!this.product) return;
    
    this.cartService.addToCart(
      this.product, 
      this.quantity, 
      this.selectedSize, 
      this.selectedColor
    );
  }
  
  toggleFavorite(): void {
    if (!this.product) return;
    
    this.product.isFavorite = !this.product.isFavorite;
  }
}
