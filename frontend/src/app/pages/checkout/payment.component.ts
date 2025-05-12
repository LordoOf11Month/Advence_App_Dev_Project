import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { StripeService } from '../../services/stripe.service';
import { PaymentMethod } from '../../models/order.model';
import { CheckoutProgressComponent } from './checkout-progress.component';
import { OrderSummaryComponent } from './order-summary.component';
import { Subscription } from 'rxjs';

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

          <!-- Stripe Payment Form -->
          <div class="stripe-payment-container" *ngIf="selectedPaymentMethod === 'stripe'">
            <div class="stripe-form">
              <h3>Card Information</h3>

              <!-- Loading indicator for Stripe form -->
              <div class="form-loading" *ngIf="isLoadingStripeForm">
                <div class="spinner"></div>
                <p>Loading payment form...</p>
              </div>

              <div id="stripe-payment-element" #stripePaymentElement
                   [class.hidden]="isLoadingStripeForm"></div>

              <div class="stripe-error" *ngIf="stripeError">{{ stripeError }}</div>

              <div class="processing-payment" *ngIf="isProcessingPayment">
                <div class="spinner"></div>
                <p>Processing payment...</p>
              </div>
            </div>
          </div>

          <!-- Cash on Delivery -->
          <div class="alternative-payment" *ngIf="selectedPaymentMethod === 'cash_on_delivery'">
            <p class="alternative-payment-note">
              You will pay for your order when it is delivered.
            </p>
          </div>

          <div class="form-actions">
            <a routerLink="/checkout/shipping" class="back-button">Back to Shipping</a>
            <button
              type="button"
              class="continue-button"
              [disabled]="isButtonDisabled()"
              (click)="continueWithSelectedMethod()"
            >
              <span *ngIf="!isProcessingPayment">Continue to Review</span>
              <span *ngIf="isProcessingPayment">Processing...</span>
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

    h1, h3 {
      font-weight: 600;
      color: var(--neutral-900);
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: var(--space-4);
    }

    h3 {
      font-size: 1.125rem;
      margin-bottom: var(--space-3);
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

    .stripe-payment-container {
      margin-top: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .stripe-form {
      padding: var(--space-4);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      background-color: var(--neutral-50);
      min-height: 160px; /* Ensure consistent height even during loading */
    }

    #stripe-payment-element {
      margin-bottom: var(--space-4);
    }

    .hidden {
      display: none;
    }

    .stripe-error {
      color: var(--error);
      font-size: 0.875rem;
      margin-top: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .form-loading, .processing-payment {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      margin-top: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .spinner {
      border: 3px solid var(--neutral-200);
      border-radius: 50%;
      border-top: 3px solid var(--primary);
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-2);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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

    @media (max-width: 768px) {
      .checkout-container {
        flex-direction: column;
      }

      .checkout-summary {
        width: 100%;
        order: -1;
      }
    }
  `]
})
export class PaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stripePaymentElement') stripePaymentElement!: ElementRef;

  selectedPaymentMethod: string = 'stripe';
  showStripeForm = true;
  isLoadingStripeForm = false;
  isProcessingPayment = false;
  stripeError: string | null = null;
  isStripeFormReady = false;

  private stripe: any;
  private elements: any;
  private paymentElement: any;
  private clientSecret: string | null = null;
  private subscriptions = new Subscription();
  private orderSummary: any;
  private stripeInitializationAttempted = false;

  paymentMethods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Pay securely with Stripe',
      icon: 'credit_card'
    },
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: 'local_shipping'
    }
  ];

  constructor(
    private orderService: OrderService,
    private stripeService: StripeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if shipping address is set
    this.subscriptions.add(
      this.orderService.shippingAddress$.subscribe(address => {
        if (!address) {
          this.router.navigate(['/checkout/shipping']);
        }
      })
    );

    // Get order summary for payment amount
    this.subscriptions.add(
      this.orderService.orderSummary$.subscribe(summary => {
        this.orderSummary = summary;
      })
    );
  }

  ngAfterViewInit(): void {
    // Wait a moment for the DOM to be fully ready
    setTimeout(() => {
      if (this.selectedPaymentMethod === 'stripe') {
        this.initializeStripe();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;

    if (methodId === 'stripe' && !this.stripeInitializationAttempted) {
      this.initializeStripe();
    }
  }

  isButtonDisabled(): boolean {
    if (this.isProcessingPayment) {
      return true;
    }

    if (this.selectedPaymentMethod === 'stripe') {
      return this.isLoadingStripeForm || !this.isStripeFormReady || !!this.stripeError;
    }

    return false;
  }

  private initializeStripe(): void {
    this.isLoadingStripeForm = true;
    this.isStripeFormReady = false;
    this.stripeInitializationAttempted = true;

    if (!this.stripePaymentElement || !this.orderSummary) {
      this.stripeError = 'Cannot initialize payment form. Please try refreshing the page.';
      this.isLoadingStripeForm = false;
      return;
    }

    // Create a payment intent based on the order total
    const amount = Math.round(this.orderSummary.total * 100); // Convert to cents

    this.subscriptions.add(
      this.stripeService.createPaymentIntent(amount, 'usd').subscribe({
        next: (result) => {
          this.clientSecret = result.clientSecret;

          if (this.clientSecret) {
            this.stripeService.initializeElements(this.clientSecret)
              .then(({ stripe, elements }) => {
                this.stripe = stripe;
                this.elements = elements;

                // Create and mount the Payment Element
                this.paymentElement = this.elements.create('payment');
                this.paymentElement.mount(this.stripePaymentElement.nativeElement);

                this.paymentElement.on('ready', () => {
                  this.isLoadingStripeForm = false;
                  this.isStripeFormReady = true;
                });

                this.paymentElement.on('change', (event: any) => {
                  if (event.error) {
                    this.stripeError = event.error.message;
                  } else {
                    this.stripeError = null;
                  }
                });
              })
              .catch(error => {
                console.error('Error initializing Stripe Elements:', error);
                this.stripeError = 'Failed to initialize payment form. Please try again.';
                this.isLoadingStripeForm = false;
              });
          } else {
            console.error('No client secret returned from payment intent creation');
            this.stripeError = 'Failed to initialize payment. Please try again.';
            this.isLoadingStripeForm = false;
          }
        },
        error: (error) => {
          console.error('Error creating payment intent:', error);
          this.stripeError = 'Failed to initialize payment. Please try again.';
          this.isLoadingStripeForm = false;
        }
      })
    );
  }

  continueWithSelectedMethod(): void {
    if (this.selectedPaymentMethod === 'stripe') {
      this.processStripePayment();
    } else {
      // For cash on delivery, just set the payment method and proceed
      const paymentData: PaymentMethod = {
        type: 'cash_on_delivery'
      };

      this.orderService.setPaymentMethod(paymentData);
      this.router.navigate(['/checkout/review']);
    }
  }

  private processStripePayment(): void {
    if (!this.isStripeFormReady || !this.stripe || !this.elements || !this.clientSecret) {
      this.stripeError = 'Payment form is not ready yet. Please try again.';

      // Try to reinitialize if stripe initialization failed
      if (!this.stripe || !this.elements) {
        this.initializeStripe();
      }

      return;
    }

    this.isProcessingPayment = true;

    // Create a payment method and set it in the order service
    this.stripeService.handlePayment(this.clientSecret).subscribe({
      next: (result) => {
        if (result.error) {
          this.stripeError = result.error.message;
          this.isProcessingPayment = false;
        } else {
          // Payment successful, save payment method
          const paymentData: PaymentMethod = {
            type: 'stripe',
            stripePaymentMethodId: result.paymentMethod?.id
          };

          this.orderService.setPaymentMethod(paymentData);
          this.isProcessingPayment = false;
          this.router.navigate(['/checkout/review']);
        }
      },
      error: (error) => {
        console.error('Payment processing error:', error);
        this.stripeError = error.message || 'An error occurred while processing your payment.';
        this.isProcessingPayment = false;
      }
    });
  }
}
