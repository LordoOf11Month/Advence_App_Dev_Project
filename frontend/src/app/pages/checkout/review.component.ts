import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ShippingAddress, PaymentMethod, OrderSummary } from '../../models/order.model';
import { CartItem } from '../../models/product.model';
import { CheckoutProgressComponent } from './checkout-progress.component';
import { OrderSummaryComponent } from './order-summary.component';
import { CartService } from '../../services/cart.service';
import { StripeService } from '../../services/stripe.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { StripeElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CheckoutProgressComponent,
    OrderSummaryComponent
  ],
  template: `
    <div class="container">
      <app-checkout-progress [currentStep]="'review'"></app-checkout-progress>

      <div class="checkout-container">
        <div class="checkout-form">
          <h1>Review Your Order</h1>

          <div class="review-section" *ngIf="shippingAddress$ | async as address">
            <div class="section-header">
              <h2 class="section-title">Shipping Address</h2>
              <a routerLink="/checkout/shipping" class="edit-link">Edit</a>
            </div>
            <div class="section-content">
              <div class="shipping-address">
                <p class="customer-name">{{address.firstName}} {{address.lastName}}</p>
                <p class="address-line">{{address.address.street}}</p>
                <p class="address-line">
                  {{address.address.city}}, {{address.address.state}} {{address.address.zipCode}}
                </p>
                <p class="address-line">{{address.address.country}}</p>
                <p class="contact-info">
                  <span>Phone: {{address.phone}}</span>
                  <span>Email: {{address.email}}</span>
                </p>
              </div>
            </div>
          </div>

          <div class="review-section">
            <div class="section-header">
              <h2 class="section-title">Payment</h2>
            </div>
            <div class="section-content">
              <form [formGroup]="orderForm">
                <div *ngIf="selectedPaymentMethod === 'stripe'">
                  <div #paymentElement class="payment-element"></div>
                </div>

                <div class="terms-checkbox">
                  <input type="checkbox" id="terms" formControlName="terms">
                  <label for="terms">I agree to the terms and conditions</label>
                </div>

                <div class="error-container" *ngIf="errorMessage">
                  <div class="error-content">
                    <span class="material-symbols-outlined error-icon">error</span>
                    <p class="error-message">{{ errorMessage }}</p>
                    <div class="error-actions">
                      <button
                        type="button"
                        class="retry-button"
                        (click)="retryPayment()"
                        [disabled]="isProcessing">
                        Try Again
                      </button>
                      <a routerLink="/checkout/payment" class="change-payment-button">
                        Change Payment Method
                      </a>
                    </div>
                  </div>
                </div>

                <div class="place-order-section">
                  <button
                    type="button"
                    class="place-order-button"
                    (click)="placeOrder()"
                    [disabled]="isProcessing || orderForm.invalid">
                    <span *ngIf="isProcessing">Processing...</span>
                    <span *ngIf="!isProcessing">Place Order</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="review-section">
            <div class="section-header">
              <h2 class="section-title">Order Items</h2>
              <a routerLink="/cart" class="edit-link">Edit</a>
            </div>
            <div class="section-content">
              <div class="review-items">
                <div class="review-item" *ngFor="let item of cartItems$ | async">
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
        </div>

        <div class="checkout-summary">
          <app-order-summary></app-order-summary>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isProcessing">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Processing your payment...</p>
          <p class="loading-note">Please do not close this window</p>
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

    .terms-checkbox {
      margin-bottom: var(--space-4);
    }

    .terms-checkbox input {
      margin-right: var(--space-2);
    }

    .payment-element {
      margin-bottom: var(--space-4);
    }

    .error-container {
      margin: var(--space-4) 0;
    }

    .error-content {
      background-color: var(--error-50);
      border: 1px solid var(--error-200);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .error-icon {
      color: var(--error);
      font-size: 2rem;
      margin-bottom: var(--space-2);
    }

    .error-message {
      color: var(--error-700);
      margin-bottom: var(--space-4);
      font-size: 1rem;
    }

    .error-actions {
      display: flex;
      gap: var(--space-3);
    }

    .retry-button {
      background-color: var(--error);
      color: var(--white);
      border: none;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .retry-button:hover:not(:disabled) {
      background-color: var(--error-dark);
    }

    .retry-button:disabled {
      background-color: var(--neutral-400);
      cursor: not-allowed;
    }

    .change-payment-button {
      color: var(--error);
      text-decoration: none;
      font-weight: 500;
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--error);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .change-payment-button:hover {
      background-color: var(--error-50);
    }

    .place-order-section {
      display: flex;
      justify-content: flex-end;
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

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-content {
      text-align: center;
      padding: var(--space-6);
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--neutral-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      margin: 0 auto var(--space-4);
      animation: spin 1s linear infinite;
    }

    .loading-content p {
      margin: 0;
      color: var(--neutral-700);
    }

    .loading-note {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-top: var(--space-2);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class ReviewComponent implements OnInit, OnDestroy {
  @ViewChild('paymentElement') paymentElementRef!: ElementRef;

  orderForm: FormGroup;
  isProcessing = false;
  errorMessage: string | null = null;
  paymentElement: StripeElement | null = null;

  shippingAddress$: Observable<ShippingAddress | null>;
  cartItems$: Observable<CartItem[]>;
  orderSummary$: Observable<OrderSummary | null>;
  selectedPaymentMethod: string | null = null;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private stripeService: StripeService,
    private cartService: CartService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      terms: [false, Validators.requiredTrue]
    });

    this.shippingAddress$ = this.orderService.shippingAddress$;
    this.cartItems$ = this.cartService.cart$;
    this.orderSummary$ = this.orderService.orderSummary$;
  }

  ngOnInit(): void {
    // Verify all required data is available
    this.orderService.shippingAddress$.subscribe(address => {
      if (!address) {
        this.router.navigate(['/checkout/shipping']);
      }
    });

    this.orderService.paymentMethod$.subscribe(method => {
      this.selectedPaymentMethod = method?.type || null;
      if (!method) {
        this.router.navigate(['/checkout/payment']);
      }
    });

    this.cartService.cart$.subscribe(items => {
      if (!items.length) {
        this.router.navigate(['/cart']);
      }
    });

    this.orderService.orderSummary$.subscribe(summary => {
      if (!summary) {
        this.router.navigate(['/cart']);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up Stripe elements when component is destroyed
    this.stripeService.clearPaymentElement();
  }

  private async handlePaymentError(error: any): Promise<void> {
    console.error('Payment error:', error);

    if (error.type === 'card_error' || error.type === 'validation_error') {
      this.errorMessage = error.message;
    } else if (error.type === 'invalid_request_error') {
      this.errorMessage = 'Invalid payment request. Please try again.';
    } else if (error.type === 'api_error') {
      this.errorMessage = 'Payment service error. Please try again later.';
    } else if (error.type === 'rate_limit_error') {
      this.errorMessage = 'Too many requests. Please try again in a moment.';
    } else {
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    }

    // Clear any existing payment elements
    this.stripeService.clearPaymentElement();

    // Reset processing state
    this.isProcessing = false;
  }

  async placeOrder() {
    if (this.orderForm.invalid) {
      this.errorMessage = 'Please accept the terms and conditions';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = null;

    try {
      // Create order and get payment intents
      const createOrderRequest = this.orderService.getCreateOrderRequest();
      const order = await this.orderService.createOrder(createOrderRequest).toPromise();

      if (!order) {
        throw new Error('Failed to create order');
      }

      // Get payment intents from session storage
      const paymentIntents = JSON.parse(sessionStorage.getItem('currentPaymentIntents') || '[]');

      if (!paymentIntents.length) {
        throw new Error('No payment intents found');
      }

      // Get the first payment intent's client secret
      const clientSecret = paymentIntents[0].clientSecret;

      try {
        // Create and mount the payment element
        this.paymentElement = await this.stripeService.createPaymentElement(clientSecret);
        await this.paymentElement.mount(this.paymentElementRef.nativeElement);

        // Confirm the payment
        const paymentIntent = await this.stripeService.confirmPayment(clientSecret);
        const result = await this.stripeService.handlePaymentConfirmation(paymentIntent);

        if (result.success) {
          // Clear cart and payment intents
          this.cartService.clearCart();
          sessionStorage.removeItem('currentPaymentIntents');

          // Navigate to confirmation
          await this.router.navigate(['/checkout/confirmation'], {
            queryParams: { orderId: order.id }
          });
        } else if (result.requiresAction) {
          // Handle 3D Secure authentication
          // The user will be redirected to complete the authentication
          // and then back to the return_url
        }
      } catch (paymentError) {
        await this.handlePaymentError(paymentError);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to process order';
      this.isProcessing = false;

      // If order creation failed, clear any existing payment intents
      sessionStorage.removeItem('currentPaymentIntents');
    }
  }

  // Add a method to retry payment
  async retryPayment() {
    this.errorMessage = null;
    await this.placeOrder();
  }
}
