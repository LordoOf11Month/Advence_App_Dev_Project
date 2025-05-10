import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { CompareService } from '../../services/compare.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-card">
      <div class="favorite-button" (click)="onFavoriteClick($event)">
        <span class="material-symbols-outlined" [class.is-favorite]="product.isFavorite">
          {{product.isFavorite ? 'favorite' : 'favorite_border'}}
        </span>
      </div>
      
      <div class="compare-button" (click)="onCompareClick($event)" [class.is-comparing]="isInCompare">
        <span class="material-symbols-outlined">
          {{isInCompare ? 'compare_check' : 'compare'}}
        </span>
      </div>
      
      <a [routerLink]="['/product', product.id]" class="product-link">
        <div class="image-container">
          <img [src]="getProductImage()" [alt]="product.title" class="product-image" (error)="handleImageError($event)">
          
          <div class="discount-badge" *ngIf="product.discountPercentage && product.discountPercentage > 0">
            {{product.discountPercentage}}% OFF
          </div>
        </div>
        
        <div class="product-info">
          <h3 class="product-title">{{product.title || 'Product Title'}}</h3>
          
          <a [routerLink]="['/store', product.sellerId]" class="seller-link" (click)="$event.stopPropagation()">
            <span class="material-symbols-outlined">store</span>
            {{product.sellerName || 'Store'}}
          </a>
          
          <div class="product-rating">
            <div class="stars" [attr.data-rating]="product.rating || 0">
              <span 
                *ngFor="let i of [1,2,3,4,5]" 
                class="material-symbols-outlined"
                [ngStyle]="{'color': i <= (product.rating || 0) ? 'var(--warning)' : 'var(--neutral-300)'}"
              >star</span>
            </div>
            <span class="rating-count">({{product.reviewCount || 0}})</span>
          </div>
          
          <div class="product-price">
            <span class="current-price">{{product.price | currency:'TRY':'₺'}}</span>
            <span class="original-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
              {{product.originalPrice | currency:'TRY':'₺'}}
            </span>
          </div>
          
          <div class="product-tags">
            <span class="tag free-shipping" *ngIf="product.freeShipping">Free Shipping</span>
            <span class="tag fast-delivery" *ngIf="product.fastDelivery">Fast Delivery</span>
            <span class="tag in-stock" *ngIf="product.inStock">In Stock</span>
            <span class="tag out-of-stock" *ngIf="!product.inStock">Out of Stock</span>
          </div>
        </div>
      </a>
      
      <div class="card-actions">
        <button class="add-to-cart-btn" (click)="onAddToCart($event)" [disabled]="!product.inStock">
          <span class="material-symbols-outlined">shopping_cart</span>
          Add to Cart
        </button>
        
        <button class="add-to-compare-btn" (click)="onCompareClick($event)" [class.is-comparing]="isInCompare">
          <span class="material-symbols-outlined">{{isInCompare ? 'compare_check' : 'compare'}}</span>
          {{isInCompare ? 'Remove' : 'Compare'}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      position: relative;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    
    .favorite-button, .compare-button {
      position: absolute;
      z-index: 2;
      background-color: var(--white);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }
    
    .favorite-button {
      top: var(--space-2);
      right: var(--space-2);
    }
    
    .compare-button {
      top: var(--space-2);
      left: var(--space-2);
    }
    
    .favorite-button:hover, .compare-button:hover {
      transform: scale(1.1);
    }
    
    .favorite-button .material-symbols-outlined,
    .compare-button .material-symbols-outlined {
      color: var(--neutral-500);
      transition: color var(--transition-fast);
    }
    
    .favorite-button .is-favorite {
      color: var(--error);
    }
    
    .compare-button.is-comparing .material-symbols-outlined {
      color: var(--primary);
    }
    
    .product-link {
      display: block;
      color: inherit;
      text-decoration: none;
      flex: 1;
    }
    
    .image-container {
      position: relative;
      padding-top: 100%; /* 1:1 aspect ratio */
      overflow: hidden;
    }
    
    .product-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-normal);
    }
    
    .product-card:hover .product-image {
      transform: scale(1.05);
    }
    
    .discount-badge {
      position: absolute;
      top: var(--space-2);
      left: var(--space-2);
      background-color: var(--primary);
      color: var(--white);
      font-size: 0.75rem;
      font-weight: 600;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
    }
    
    .product-info {
      padding: var(--space-3);
    }
    
    .product-title {
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: var(--space-1);
      color: var(--neutral-800);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 2.8rem;
    }

    .seller-link {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: 0.8125rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
      text-decoration: none;
    }

    .seller-link:hover {
      color: var(--primary);
    }

    .seller-link .material-symbols-outlined {
      font-size: 1rem;
    }
    
    .product-rating {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-2);
    }
    
    .stars {
      display: flex;
      align-items: center;
      position: relative;
    }
    
    .stars .material-symbols-outlined {
      color: var(--warning);
      font-size: 1rem;
    }
    
    .rating-count {
      font-size: 0.75rem;
      color: var(--neutral-600);
      margin-left: var(--space-1);
    }
    
    .product-price {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-2);
    }
    
    .current-price {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--neutral-900);
    }
    
    .original-price {
      font-size: 0.875rem;
      color: var(--neutral-500);
      text-decoration: line-through;
      margin-left: var(--space-2);
    }
    
    .product-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
      margin-bottom: var(--space-2);
    }
    
    .tag {
      display: inline-block;
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      margin-right: 4px;
    }
    
    .tag.free-shipping {
      background-color: #E3F2FD;
      color: #1976D2;
    }
    
    .tag.fast-delivery {
      background-color: #E8F5E9;
      color: #388E3C;
    }
    
    .tag.in-stock {
      background-color: #E8F5E9;
      color: #388E3C;
    }
    
    .tag.out-of-stock {
      background-color: #FFEBEE;
      color: #D32F2F;
    }
    
    .card-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: 0 var(--space-3) var(--space-3);
    }
    
    .add-to-cart-btn, .add-to-compare-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-2);
      font-weight: 500;
      transition: background-color var(--transition-fast);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    
    .add-to-cart-btn {
      background-color: var(--primary);
      color: var(--white);
      border: none;
    }
    
    .add-to-cart-btn:hover {
      background-color: var(--primary-dark);
    }
    
    .add-to-compare-btn {
      background-color: var(--white);
      color: var(--neutral-700);
      border: 1px solid var(--neutral-300);
    }
    
    .add-to-compare-btn:hover {
      background-color: var(--neutral-100);
    }
    
    .add-to-compare-btn.is-comparing {
      background-color: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
    }
    
    .add-to-cart-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() toggleCompare = new EventEmitter<Product>();
  
  isInCompare = false;
  
  constructor(private compareService: CompareService) {}
  
  ngOnInit(): void {
    if (this.product) {
      this.isInCompare = this.compareService.isInCompare(this.product.id);
    }
  }
  
  getProductImage(): string {
    if (this.product && this.product.images && this.product.images.length > 0) {
      return this.product.images[0];
    }
    return 'https://via.placeholder.com/300';
  }
  
  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/300';
  }
  
  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }
  
  onFavoriteClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFavorite.emit(this.product.id);
  }
  
  onCompareClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isInCompare = !this.isInCompare;
    this.toggleCompare.emit(this.product);
  }
}
