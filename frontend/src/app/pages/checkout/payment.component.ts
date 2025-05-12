import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { PaymentMethod } from '../../models/order.model';
import { CheckoutProgressComponent } from './checkout-progress.component';
import { OrderSummaryComponent } from './order-summary.component';
import { StripeService } from '../../services/stripe.service';

@Component({
  selector: 'app-payment',
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
      <app-checkout-progress [currentStep]="'payment'"></app-checkout-progress>

      <div class="checkout-container">
        <div class="checkout-form">
          <h1>Payment Method</h1>

          <div class="payment-methods">
            <div class="payment-method"
              *ngFor="let method of paymentMethods"
              [class.active]="selectedPaymentMethod === method.id"
              (click)="selectPaymentMethod(method.id)"
            >
              <div class="payment-method-radio">
                <div class="radio-inner" *ngIf="selectedPaymentMethod === method.id"></div>
              </div>
              <div class="payment-method-icon">
                <span class="material-symbols-outlined">{{method.icon}}</span>
              </div>
              <div class="payment-method-details">
                <div class="payment-method-name">{{method.name}}</div>
                <div class="payment-method-description">{{method.description}}</div>
              </div>
            </div>
          </div>

          <div *ngIf="selectedPaymentMethod === 'stripe'">
            <div #paymentElement class="payment-element"></div>
            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
          </div>

          <div class="alternative-payment">
            <p class="alternative-payment-note">
              You will be redirected to complete your payment after reviewing your order.
            </p>

            <div class="form-actions">
              <a routerLink="/checkout/shipping" class="back-button">Back to Shipping</a>
              <button
                type="button"
                class="continue-button"
                (click)="continueWithSelectedMethod()"
                [disabled]="isProcessing">
                <span *ngIf="isProcessing">Processing...</span>
                <span *ngIf="!isProcessing">Continue to Review</span>
              </button>
            </div>
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

    .payment-methods {
      margin-bottom: var(--space-4);
    }

    .payment-method {
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-3);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .payment-method:hover {
      border-color: var(--primary);
    }

    .payment-method.active {
      border-color: var(--primary);
      background-color: var(--primary-50);
    }

    .payment-method-radio {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--neutral-400);
      margin-right: var(--space-3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color var(--transition-fast);
    }

    .payment-method.active .payment-method-radio {
      border-color: var(--primary);
    }

    .radio-inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--primary);
    }

    .payment-method-icon {
      margin-right: var(--space-3);
      color: var(--neutral-700);
    }

    .payment-method-details {
      flex: 1;
    }

    .payment-method-name {
      font-weight: 500;
      margin-bottom: var(--space-1);
    }

    .payment-method-description {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .alternative-payment {
      margin-top: var(--space-4);
    }

    .alternative-payment-note {
      color: var(--neutral-700);
      margin-bottom: var(--space-4);
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

    .continue-button {
      background-color: var(--primary);
      color: var(--white);
      border: none;
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .continue-button:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }

    .continue-button:disabled {
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
      .payment-method {
        flex-direction: column;
        align-items: flex-start;
      }

      .payment-method-radio {
        margin-bottom: var(--space-2);
      }

      .payment-method-icon {
        margin-bottom: var(--space-2);
      }
    }
  `]
})
export class PaymentComponent implements OnInit, AfterViewInit {
  selectedPaymentMethod: string = 'stripe';
  isProcessing = false;
  errorMessage: string | null = null;
  stripeReady = false;
  paymentElement: any;

  @ViewChild('paymentElement') paymentElementRef!: ElementRef;

  paymentMethods = [
    { id: 'stripe', name: 'Stripe', description: 'Secure online payment via Stripe', icon: 'credit_score' },
    { id: 'cash_on_delivery', name: 'Cash on Delivery', description: 'Pay when you receive your order', icon: 'local_shipping' }
  ];

  constructor(
    private orderService: OrderService,
    private stripeService: StripeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.orderService.shippingAddress$.subscribe(address => {
      if (!address) this.router.navigate(['/checkout/shipping']);
    });
  }

  async ngAfterViewInit() {
    if (this.selectedPaymentMethod === 'stripe') {
      try {
        this.isProcessing = true;
        // 1. Create a payment intent on the backend and get the client secret
        const clientSecret = await this.createPaymentIntentAndGetClientSecret();
        // 2. Mount the Stripe payment element
        this.paymentElement = await this.stripeService.createPaymentElement(clientSecret);
        await this.paymentElement.mount(this.paymentElementRef.nativeElement);
        this.stripeReady = true;
      } catch (err: any) {
        this.errorMessage = err.message || 'Failed to initialize payment.';
      } finally {
        this.isProcessing = false;
      }
    }
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
    this.errorMessage = null;
    this.stripeReady = false;
    // Optionally, unmount Stripe element if switching away from Stripe
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
    if (methodId === 'stripe') {
      this.ngAfterViewInit();
    }
  }

  async continueWithSelectedMethod() {
    this.isProcessing = true;
    this.errorMessage = null;

    try {
      if (this.selectedPaymentMethod === 'stripe') {
        // 1. Create the order
        const createOrderRequest = this.orderService.getCreateOrderRequest();
        const order = await this.orderService.createOrder(createOrderRequest).toPromise();

        if (!order) throw new Error('Order creation failed');

        // 2. Get client secret
        const paymentIntents = JSON.parse(sessionStorage.getItem('currentPaymentIntents') || '[]');
        const clientSecret = paymentIntents[0]?.clientSecret;
        if (!clientSecret) throw new Error('No payment intent found');

        // 3. Mount Stripe element and confirm payment
        this.paymentElement = await this.stripeService.createPaymentElement(clientSecret);
        await this.paymentElement.mount(this.paymentElementRef.nativeElement);

        const paymentIntent = await this.stripeService.confirmPayment(clientSecret);
        const result = await this.stripeService.handlePaymentConfirmation(paymentIntent);

        if (!result.success) throw new Error('Payment failed or requires additional action.');

        // 4. On success, go to review
        this.router.navigate(['/checkout/review'], { queryParams: { orderId: order.id } });
      } else {
        // Cash on delivery: just save method and go to review
        const paymentData: PaymentMethod = { type: 'cash_on_delivery' };
        this.orderService.setPaymentMethod(paymentData);
        this.router.navigate(['/checkout/review']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to process payment';
    } finally {
      this.isProcessing = false;
    }
  }

  // This should call your backend to create a payment intent and return the client secret
  async createPaymentIntentAndGetClientSecret(): Promise<string> {
    const createOrderRequest = this.orderService.getCreateOrderRequest();
    const response = await this.orderService.createPaymentIntent(createOrderRequest).toPromise();

    if (!response) throw new Error('No response from payment intent creation');
    return response.clientSecret;
  }
}