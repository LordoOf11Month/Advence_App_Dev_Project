import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <h1 class="page-title">Your Shopping Cart</h1>
      
      <div class="cart-container" *ngIf="cartItems.length > 0">
        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of cartItems; let i = index">
            <div class="item-image">
              <img [src]="item.product.images[0]" [alt]="item.product.title">
            </div>
            
            <div class="item-details">
              <div class="item-header">
                <h3 class="item-title">
                  <a [routerLink]="['/product', item.product.id]">{{item.product.title}}</a>
                </h3>
                <span class="item-price">{{item.product.price | currency:'TRY':'₺'}}</span>
              </div>
              
              <div class="item-variants" *ngIf="item.color || item.size">
                <span class="variant-label" *ngIf="item.color">Color: {{item.color}}</span>
                <span class="variant-label" *ngIf="item.size">Size: {{item.size}}</span>
              </div>
              
              <div class="item-actions">
                <div class="quantity-selector">
                  <button 
                    (click)="decreaseQuantity(i)" 
                    [disabled]="item.quantity <= 1"
                  >-</button>
                  <input 
                    type="number" 
                    [(ngModel)]="item.quantity" 
                    (change)="updateQuantity(i, item.quantity)"
                    min="1" 
                    max="10"
                  >
                  <button (click)="increaseQuantity(i, item.quantity)">+</button>
                </div>
                
                <button class="remove-button" (click)="removeItem(i)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="cart-summary">
          <div class="summary-header">
            <h2>Order Summary</h2>
          </div>
          
          <div class="summary-details">
            <div class="summary-row">
              <span>Subtotal ({{getItemCount()}} items)</span>
              <span>{{getSubtotal() | currency:'TRY':'₺'}}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping</span>
              <span>{{getShippingCost() | currency:'TRY':'₺'}}</span>
            </div>
            
            <div class="summary-row discount" *ngIf="discount > 0">
              <span>Discount</span>
              <span>-{{discount | currency:'TRY':'₺'}}</span>
            </div>
            
            <div class="summary-divider"></div>
            
            <div class="summary-row total">
              <span>Total</span>
              <span>{{getTotal() | currency:'TRY':'₺'}}</span>
            </div>
          </div>
          
          <div class="promo-code">
            <input 
              type="text" 
              placeholder="Enter promo code" 
              [(ngModel)]="promoCode"
            >
            <button 
              (click)="applyPromoCode()"
              [disabled]="!promoCode"
            >Apply</button>
          </div>
          
          <button class="checkout-button">
            Proceed to Checkout
          </button>
          
          <div class="payment-methods">
            <p>We accept:</p>
            <div class="payment-icons">
              <span class="payment-icon">Visa</span>
              <span class="payment-icon">MasterCard</span>
              <span class="payment-icon">PayPal</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="empty-cart" *ngIf="cartItems.length === 0">
        <div class="empty-cart-content">
          <span class="material-symbols-outlined">shopping_cart</span>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <a routerLink="/" class="continue-shopping-btn">Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: var(--space-6);
    }
    
    .cart-container {
      display: flex;
      gap: var(--space-6);
    }
    
    .cart-items {
      flex: 1;
    }
    
    .cart-item {
      display: flex;
      background-color: var(--white);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
    }
    
    .item-image {
      width: 120px;
      height: 120px;
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-right: var(--space-4);
    }
    
    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }
    
    .item-title {
      font-size: 1.125rem;
      font-weight: 500;
      margin: 0;
    }
    
    .item-title a {
      color: var(--neutral-900);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    
    .item-title a:hover {
      color: var(--primary);
    }
    
    .item-price {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--primary);
    }
    
    .item-variants {
      margin-bottom: var(--space-2);
    }
    
    .variant-label {
      display: inline-block;
      font-size: 0.875rem;
      color: var(--neutral-600);
      background-color: var(--neutral-100);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      margin-right: var(--space-2);
    }
    
    .item-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    
    .quantity-selector {
      display: flex;
      align-items: center;
    }
    
    .quantity-selector button {
      width: 32px;
      height: 32px;
      border: 1px solid var(--neutral-300);
      background-color: var(--white);
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .quantity-selector button:first-child {
      border-radius: var(--radius-md) 0 0 var(--radius-md);
    }
    
    .quantity-selector button:last-child {
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
    }
    
    .quantity-selector button:hover:not(:disabled) {
      background-color: var(--neutral-100);
    }
    
    .quantity-selector button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .quantity-selector input {
      width: 40px;
      height: 32px;
      border: 1px solid var(--neutral-300);
      border-left: none;
      border-right: none;
      text-align: center;
      font-size: 0.9375rem;
    }
    
    .remove-button {
      background-color: transparent;
      border: none;
      color: var(--neutral-500);
      cursor: pointer;
      transition: color var(--transition-fast);
      padding: var(--space-1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .remove-button:hover {
      color: var(--error);
    }
    
    .cart-summary {
      flex: 0 0 350px;
      background-color: var(--white);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
      height: fit-content;
    }
    
    .summary-header {
      margin-bottom: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
      padding-bottom: var(--space-3);
    }
    
    .summary-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }
    
    .summary-details {
      margin-bottom: var(--space-4);
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-3);
      font-size: 0.9375rem;
    }
    
    .summary-row.total {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--neutral-900);
    }
    
    .summary-row.discount {
      color: var(--success);
    }
    
    .summary-divider {
      height: 1px;
      background-color: var(--neutral-200);
      margin: var(--space-3) 0;
    }
    
    .promo-code {
      display: flex;
      margin-bottom: var(--space-4);
    }
    
    .promo-code input {
      flex: 1;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md) 0 0 var(--radius-md);
      font-size: 0.9375rem;
    }
    
    .promo-code button {
      background-color: var(--primary);
      color: var(--white);
      border: none;
      padding: var(--space-2) var(--space-3);
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .promo-code button:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
    
    .promo-code button:disabled {
      background-color: var(--neutral-400);
      cursor: not-allowed;
    }
    
    .checkout-button {
      width: 100%;
      background-color: var(--primary);
      color: var(--white);
      border: none;
      padding: var(--space-3);
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
      margin-bottom: var(--space-4);
    }
    
    .checkout-button:hover {
      background-color: var(--primary-dark);
    }
    
    .payment-methods {
      border-top: 1px solid var(--neutral-200);
      padding-top: var(--space-3);
    }
    
    .payment-methods p {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
    }
    
    .payment-icons {
      display: flex;
      gap: var(--space-2);
    }
    
    .payment-icon {
      display: inline-block;
      background-color: var(--neutral-100);
      color: var(--neutral-700);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
    }
    
    .empty-cart {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .empty-cart-content {
      text-align: center;
      max-width: 400px;
    }
    
    .empty-cart-content .material-symbols-outlined {
      font-size: 4rem;
      color: var(--neutral-400);
      margin-bottom: var(--space-4);
    }
    
    .empty-cart-content h2 {
      font-size: 1.5rem;
      margin-bottom: var(--space-3);
      color: var(--neutral-800);
    }
    
    .empty-cart-content p {
      color: var(--neutral-600);
      margin-bottom: var(--space-4);
    }
    
    .continue-shopping-btn {
      display: inline-block;
      background-color: var(--primary);
      color: var(--white);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      text-decoration: none;
      transition: background-color var(--transition-fast);
    }
    
    .continue-shopping-btn:hover {
      background-color: var(--primary-dark);
    }
    
    @media (max-width: 992px) {
      .cart-container {
        flex-direction: column;
      }
      
      .cart-summary {
        flex: 0 0 auto;
        width: 100%;
      }
    }
    
    @media (max-width: 576px) {
      .cart-item {
        flex-direction: column;
      }
      
      .item-image {
        width: 100%;
        height: 200px;
        margin-right: 0;
        margin-bottom: var(--space-3);
      }
      
      .item-header {
        flex-direction: column;
      }
      
      .item-price {
        margin-top: var(--space-1);
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  promoCode: string = '';
  discount: number = 0;
  
  constructor(private cartService: CartService) {}
  
  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }
  
  getItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }
  
  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }
  
  getShippingCost(): number {
    const subtotal = this.getSubtotal();
    // Free shipping for orders over TRY 300
    return subtotal > 300 ? 0 : 19.99;
  }
  
  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost() - this.discount;
  }
  
  removeItem(index: number): void {
    this.cartService.removeFromCart(index);
  }
  
  updateQuantity(index: number, quantity: number): void {
    this.cartService.updateQuantity(index, quantity);
  }
  
  increaseQuantity(index: number, quantity: number): void {
    if (quantity < 10) {
      this.cartService.updateQuantity(index, quantity + 1);
    }
  }
  
  decreaseQuantity(index: number): void {
    const currentQuantity = this.cartItems[index].quantity;
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(index, currentQuantity - 1);
    }
  }
  
  applyPromoCode(): void {
    // Mock promo code functionality
    if (this.promoCode.toUpperCase() === 'WELCOME10') {
      const subtotal = this.getSubtotal();
      this.discount = subtotal * 0.1; // 10% discount
      this.promoCode = '';
      // You would typically show a success message here
    } else {
      this.discount = 0;
      // You would typically show an error message here
    }
  }
}