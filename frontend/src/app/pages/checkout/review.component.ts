import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ShippingAddress, PaymentMethod, OrderSummary } from '../../models/order.model';
import { CartItem } from '../../models/product.model';
import { CheckoutProgressComponent } from './checkout-progress.component';
import { OrderSummaryComponent } from './order-summary.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CheckoutProgressComponent,
    OrderSummaryComponent
  ],
  template: `
    <div class="container">
      <app-checkout-progress [currentStep]="'review'"></app-checkout-progress>

      <div class="checkout-container">
        <div class="checkout-form">
          <h1>Review Your Order</h1>

          <div class="review-section">
            <div class="section-header">
              <h2 class="section-title">Shipping Address</h2>
              <a routerLink="/checkout/shipping" class="edit-link">Edit</a>
            </div>

            <div class="section-content" *ngIf="shippingAddress">
              <div class="shipping-address">
                <p class="customer-name">{{shippingAddress.firstName}} {{shippingAddress.lastName}}</p>
                <p class="address-line">{{shippingAddress.address1}}</p>
                <p class="address-line" *ngIf="shippingAddress.address2">{{shippingAddress.address2}}</p>
                <p class="address-line">
                  {{shippingAddress.city}}, {{shippingAddress.state}} {{shippingAddress.postalCode}}
                </p>
                <p class="address-line">{{shippingAddress.country}}</p>
                <p class="contact-info">
                  <span>Phone: {{shippingAddress.phone}}</span>
                  <span>Email: {{shippingAddress.email}}</span>
                </p>
              </div>
            </div>
          </div>

          <div class="review-section">
            <div class="section-header">
              <h2 class="section-title">Payment Method</h2>
              <a routerLink="/checkout/payment" class="edit-link">Edit</a>
            </div>

            <div class="section-content" *ngIf="paymentMethod">
              <div class="payment-info">
                <div *ngIf="paymentMethod.type === 'credit_card'" class="payment-card">
                  <span class="material-symbols-outlined">credit_card</span>
                  <div class="card-details">
                    <p class="payment-type">Credit Card</p>
                    <p class="card-number" *ngIf="paymentMethod.cardNumber">
                      •••• •••• •••• {{paymentMethod.cardNumber.slice(-4)}}
                    </p>
                    <p class="card-holder" *ngIf="paymentMethod.cardHolder">
                      {{paymentMethod.cardHolder}}
                    </p>
                    <p class="expiry-date" *ngIf="paymentMethod.expiryDate">
                      Expires: {{paymentMethod.expiryDate}}
                    </p>
                  </div>
                </div>

                <div *ngIf="paymentMethod.type === 'stripe'" class="payment-other">
                  <span class="material-symbols-outlined">credit_score</span>
                  <div class="payment-details">
                    <p class="payment-type">Stripe</p>
                    <p class="payment-note">You will be redirected to Stripe to complete payment</p>
                  </div>
                </div>

                <div *ngIf="paymentMethod.type === 'cash_on_delivery'" class="payment-other">
                  <span class="material-symbols-outlined">local_shipping</span>
                  <div class="payment-details">
                    <p class="payment-type">Cash on Delivery</p>
                    <p class="payment-note">You will pay when you receive your order</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="review-section">
            <div class="section-header">
              <h2 class="section-title">Order Items</h2>
              <a routerLink="/cart" class="edit-link">Edit</a>
            </div>

            <div class="section-content">
              <div class="review-items">
                <div class="review-item" *ngFor="let item of cartItems">
                  <div class="item-image">
                    <img [src]="item.product.images[0]" [alt]="item.product.title">
                  </div>

                  <div class="item-details">
                    <div class="item-name">{{item.product.title}}</div>
                    <div class="item-variants" *ngIf="item.color || item.size">
                      <span *ngIf="item.color">Color: {{item.color}}</span>
                      <span *ngIf="item.size">Size: {{item.size}}</span>
                    </div>
                    <div class="item-quantity">Quantity: {{item.quantity}}</div>
                    <div class="item-price">{{item.product.price | currency:'TRY':'₺'}} each</div>
                  </div>

                  <div class="item-total">
                    {{item.product.price * item.quantity | currency:'TRY':'₺'}}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/checkout/payment" class="back-button">Back to Payment</a>
            <button
              type="button"
              class="place-order-button"
              (click)="placeOrder()"
              [disabled]="isPlacingOrder"
            >
              <span *ngIf="isPlacingOrder">Processing...</span>
              <span *ngIf="!isPlacingOrder">Place Order</span>
            </button>
          </div>
        </div>

        <div class="checkout-summary">
          <app-order-summary></app-order-summary>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-4);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: var(--space-4);
      color: var(--neutral-900);
    }

    .checkout-container {
      display: flex;
      gap: var(--space-6);
      margin-top: var(--space-6);
    }

    .checkout-form {
      flex: 1;
      background-color: var(--white);
      padding: var(--space-6);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .checkout-summary {
      width: 350px;
    }

    .review-section {
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin: 0;
    }

    .edit-link {
      color: var(--primary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color var(--transition-fast);
    }

    .edit-link:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    .section-content {
      background-color: var(--neutral-50);
      padding: var(--space-4);
      border-radius: var(--radius-md);
    }

    .shipping-address p {
      margin: 0;
      margin-bottom: var(--space-1);
      color: var(--neutral-800);
    }

    .customer-name {
      font-weight: 500;
    }

    .contact-info {
      margin-top: var(--space-2);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      color: var(--neutral-700);
      font-size: 0.9375rem;
    }

    .payment-card, .payment-other {
      display: flex;
      align-items: center;
    }

    .material-symbols-outlined {
      font-size: 2rem;
      margin-right: var(--space-3);
      color: var(--primary);
    }

    .card-details, .payment-details {
      flex: 1;
    }

    .card-details p, .payment-details p {
      margin: 0;
      margin-bottom: var(--space-1);
      color: var(--neutral-800);
    }

    .payment-type {
      font-weight: 500;
    }

    .payment-note {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .review-items {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .review-item {
      display: flex;
      gap: var(--space-3);
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      font-weight: 500;
      margin-bottom: var(--space-1);
    }

    .item-variants {
      display: flex;
      gap: var(--space-2);
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-1);
    }

    .item-quantity, .item-price {
      font-size: 0.875rem;
      color: var(--neutral-700);
    }

    .item-total {
      font-weight: 500;
      color: var(--primary);
      white-space: nowrap;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-6);
    }

    .back-button {
      color: var(--neutral-700);
      text-decoration: none;
      font-weight: 500;
      transition: color var(--transition-fast);
    }

    .back-button:hover {
      color: var(--primary);
    }

    .place-order-button {
      background-color: var(--success);
      color: var(--white);
      border: none;
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
      min-width: 150px;
    }

    .place-order-button:hover:not(:disabled) {
      background-color: var(--success-dark);
    }

    .place-order-button:disabled {
      background-color: var(--neutral-400);
      cursor: not-allowed;
    }

    @media (max-width: 992px) {
      .checkout-container {
        flex-direction: column;
      }

      .checkout-summary {
        width: 100%;
        order: -1;
        margin-bottom: var(--space-4);
      }
    }

    @media (max-width: 576px) {
      .review-item {
        flex-direction: column;
      }

      .item-image {
        width: 100%;
        height: 160px;
      }

      .item-total {
        align-self: flex-end;
        margin-top: var(--space-2);
      }
    }
  `]
})
export class ReviewComponent implements OnInit {
  shippingAddress: ShippingAddress | null = null;
  paymentMethod: PaymentMethod | null = null;
  orderSummary: OrderSummary | null = null;
  cartItems: CartItem[] = [];
  isPlacingOrder = false;

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verify all required data is available
    this.orderService.shippingAddress$.subscribe(address => {
      this.shippingAddress = address;
      if (!address) {
        this.router.navigate(['/checkout/shipping']);
      }
    });

    this.orderService.paymentMethod$.subscribe(method => {
      this.paymentMethod = method;
      if (!method) {
        this.router.navigate(['/checkout/payment']);
      }
    });

    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      if (!items.length) {
        this.router.navigate(['/cart']);
      }
    });

    this.orderService.orderSummary$.subscribe(summary => {
      this.orderSummary = summary;
    });
  }

  placeOrder(): void {
    this.isPlacingOrder = true;

    this.orderService.createOrder().subscribe({
      next: (order) => {
        this.isPlacingOrder = false;

        // For Stripe payments, check if we need to redirect
        if (order.paymentMethod.type === 'stripe') {
          const clientSecret = sessionStorage.getItem('currentPaymentIntent');

          if (clientSecret) {
            // Store the order ID for retrieval after Stripe redirect
            sessionStorage.setItem('pendingOrderId', order.id);
            console.log('Order created with ID:', order.id);
            console.log('Stored pendingOrderId in sessionStorage:', order.id);

            // Stripe redirect will be handled by the Stripe service
            // The return_url will bring the user back to the confirmation page

            // For now, go directly to confirmation
            this.router.navigate(['/checkout/confirmation'], {
              queryParams: { orderId: order.id }
            });
          } else {
            console.error('Missing Stripe payment intent client secret');
            this.router.navigate(['/checkout/confirmation'], {
              queryParams: { orderId: order.id }
            });
          }
        } else {
          // For other payment methods, go directly to confirmation
          this.router.navigate(['/checkout/confirmation'], {
            queryParams: { orderId: order.id }
          });
        }
      },
      error: (error) => {
        this.isPlacingOrder = false;
        console.error('Error placing order:', error);
        alert(`Failed to place order: ${error.message || 'Unknown error'}`);
      }
    });
  }
}
