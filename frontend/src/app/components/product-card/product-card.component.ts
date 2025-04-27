import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';

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
      
      <a [routerLink]="['/product', product.id]" class="product-link">
        <div class="image-container">
          <img [src]="product.images[0]" [alt]="product.title" class="product-image">
          
          <div class="discount-badge" *ngIf="product.discountPercentage">
            {{product.discountPercentage}}% OFF
          </div>
        </div>
        
        <div class="product-info">
          <h3 class="product-title">{{product.title}}</h3>
          
          <div class="product-brand">{{product.brand}}</div>
          
          <div class="product-rating">
            <div class="stars" [attr.data-rating]="product.rating">
              <span class="material-symbols-outlined">star</span>
              <span class="material-symbols-outlined">star</span>
              <span class="material-symbols-outlined">star</span>
              <span class="material-symbols-outlined">star</span>
              <span class="material-symbols-outlined">star</span>
            </div>
            <span class="rating-count">({{product.reviewCount}})</span>
          </div>
          
          <div class="product-price">
            <span class="current-price">{{product.price | currency:'TRY':'₺'}}</span>
            <span class="original-price" *ngIf="product.originalPrice">
              {{product.originalPrice | currency:'TRY':'₺'}}
            </span>
          </div>
          
          <div class="product-tags">
            <span class="tag free-shipping" *ngIf="product.freeShipping">Free Shipping</span>
            <span class="tag fast-delivery" *ngIf="product.fastDelivery">Fast Delivery</span>
          </div>
        </div>
      </a>
      
      <button class="add-to-cart-btn" (click)="onAddToCart($event)">
        <span class="material-symbols-outlined">shopping_cart</span>
        Add to Cart
      </button>
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
    
    .favorite-button {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
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
    
    .favorite-button:hover {
      transform: scale(1.1);
    }
    
    .favorite-button .material-symbols-outlined {
      color: var(--neutral-500);
      transition: color var(--transition-fast);
    }
    
    .favorite-button .is-favorite {
      color: var(--error);
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
    
    .product-brand {
      font-size: 0.8125rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
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
      font-size: 0.6875rem;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-weight: 500;
    }
    
    .free-shipping {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }
    
    .fast-delivery {
      background-color: rgba(0, 102, 255, 0.1);
      color: var(--secondary);
    }
    
    .add-to-cart-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      background-color: var(--primary);
      color: var(--white);
      border: none;
      padding: var(--space-2);
      font-weight: 500;
      transition: background-color var(--transition-fast);
      border-radius: 0;
    }
    
    .add-to-cart-btn:hover {
      background-color: var(--primary-dark);
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() toggleFavorite = new EventEmitter<number>();
  
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
}
