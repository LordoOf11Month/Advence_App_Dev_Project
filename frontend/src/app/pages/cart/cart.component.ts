import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CreateOrderRequest } from '../../models/order.model';

// Declare Stripe globally or import from a wrapper service
declare var Stripe: any;

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

          <button class="checkout-button" (click)="proceedToCheckout()">
            Proceed to Checkout
          </button>

          <!-- New Stripe Button -->
          <button class="stripe-checkout-button" (click)="proceedToStripeCheckout()" [disabled]="isProcessingStripePayment">
            {{ isProcessingStripePayment ? 'Processing...' : 'Pay with Stripe' }}
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
          <p>Looks like you haven\'t added anything to your cart yet.</p>
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
      margin-bottom: 10px;
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background-color: var(--primary);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .checkout-button:hover {
      background-color: var(--primary-dark);
    }

    .stripe-checkout-button {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background-color: #6772e5;
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
      margin-top: 10px;
    }

    .stripe-checkout-button:hover {
      background-color: #5464d4;
    }

    .stripe-checkout-button:disabled {
      background-color: #b0b6f0;
      cursor: not-allowed;
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
  private stripe: any;
  isProcessingStripePayment = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });

    this.orderService.orderSummary$.subscribe(summary => {
      if (summary) {
        this.discount = summary.discount;
      }
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
    return subtotal > 50 ? 0 : 5;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost() - this.discount;
  }

  removeItem(index: number): void {
    this.cartService.removeFromCart(this.cartItems[index].product.id);
  }

  updateQuantity(index: number, quantity: number): void {
    const item = this.cartItems[index];
    if (quantity < 1) {
      quantity = 1;
    }
    this.cartService.updateQuantity(index, quantity);
  }

  increaseQuantity(index: number, currentQuantity: number): void {
    this.updateQuantity(index, currentQuantity + 1);
  }

  decreaseQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item.quantity > 1) {
      this.updateQuantity(index, item.quantity - 1);
    }
  }

  applyPromoCode(): void {
    this.orderService.applyDiscountCode(this.promoCode).subscribe(response => {
      if (response.success) {
        this.discount = response.discount;
      } else {
        this.discount = 0;
      }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout/shipping']);
  }

  async proceedToStripeCheckout(): Promise<void> {
    if (this.isProcessingStripePayment || this.cartItems.length === 0) {
      return;
    }
    this.isProcessingStripePayment = true;

    const orderItems = this.cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
      stripePaymentIntentId: null,
      stripeChargeId: null,
    }));

    const createOrderRequest: CreateOrderRequest = {
      items: orderItems,
      shippingAddress: {
        id: undefined,
        street: 'N/A',
        city: 'N/A',
        state: 'N/A',
        country: 'N/A',
        zipCode: '00000',
        isDefault: false,
      }
    };

    this.orderService.createPaymentIntent(createOrderRequest).subscribe({
      next: async (response: any) => {
        const sessionId = response.checkoutSessionId;
        const clientSecret = response.clientSecret;

        if (sessionId) {
          const { error } = await this.stripe.redirectToCheckout({
            sessionId: sessionId
          });
          if (error) {
            console.error('Stripe redirectToCheckout error:', error.message);
            this.isProcessingStripePayment = false;
          }
        } else if (clientSecret) {
          console.warn('Received clientSecret for Payment Intent. Stripe Checkout Session ID is preferred for redirectToCheckout.');
          alert('Payment setup with client secret. Integration for redirectToCheckout with clientSecret needs to be completed or backend should provide Checkout Session ID.');
          this.isProcessingStripePayment = false;
        } else {
          console.error('Neither checkoutSessionId nor clientSecret received from backend.');
          this.isProcessingStripePayment = false;
        }
      },
      error: (err) => {
        console.error('Failed to create payment intent or checkout session:', err);
        this.isProcessingStripePayment = false;
      }
    });
  }
}
