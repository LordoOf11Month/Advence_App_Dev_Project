import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { CheckoutProgressComponent } from './checkout-progress.component';
import { StripeService } from '../../services/stripe.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, CheckoutProgressComponent],
  template: `
    <div class="container">
      <app-checkout-progress [currentStep]="'confirmation'"></app-checkout-progress>

      <div class="confirmation-container">
        <!-- Loading Indicator -->
        <div class="loading-container" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Loading your order details...</p>
        </div>

        <!-- Error Message -->
        <div class="error-container" *ngIf="error">
          <div class="error-icon">
            <span class="material-symbols-outlined">error</span>
          </div>
          <h1>Oops! Something went wrong</h1>
          <p class="error-message">{{error}}</p>
          <div class="action-buttons">
            <a routerLink="/" class="continue-button">Back to Homepage</a>
            <a routerLink="/account/orders" class="view-orders-button">View My Orders</a>
          </div>
        </div>

        <!-- Success Message -->
        <div *ngIf="!isLoading && !error">
          <div class="success-message">
            <div class="success-icon">
              <span class="material-symbols-outlined">check_circle</span>
            </div>
            <h1>Thank You for Your Order!</h1>
            <p class="order-number">Order #: <strong>{{order?.id}}</strong></p>
            <p class="confirmation-text">
              We have received your order and are processing it. You will receive an email confirmation shortly.
            </p>
          </div>

          <div class="order-details" *ngIf="order">
            <div class="detail-section">
              <h2>Order Summary</h2>

              <div class="summary-details">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>{{order.subtotal | currency:'TRY':'₺'}}</span>
                </div>

                <div class="summary-row">
                  <span>Shipping</span>
                  <span>{{order.shipping | currency:'TRY':'₺'}}</span>
                </div>

                <div class="summary-row" *ngIf="order.discount > 0">
                  <span>Discount</span>
                  <span>-{{order.discount | currency:'TRY':'₺'}}</span>
                </div>

                <div class="summary-row">
                  <span>Tax</span>
                  <span>{{order.tax | currency:'TRY':'₺'}}</span>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-row total">
                  <span>Total</span>
                  <span>{{order.total | currency:'TRY':'₺'}}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h2>Shipping Information</h2>
              <div class="shipping-address">
                <p>{{order.shippingAddress.firstName}} {{order.shippingAddress.lastName}}</p>
                <p>{{order.shippingAddress.address1}}</p>
                <p *ngIf="order.shippingAddress.address2">{{order.shippingAddress.address2}}</p>
                <p>{{order.shippingAddress.city}}, {{order.shippingAddress.state}} {{order.shippingAddress.postalCode}}</p>
                <p>{{order.shippingAddress.country}}</p>
                <p>{{order.shippingAddress.phone}}</p>
                <p>{{order.shippingAddress.email}}</p>
              </div>
            </div>

            <div class="detail-section">
              <h2>Payment Method</h2>
              <div class="payment-info">
                <div *ngIf="order.paymentMethod.type === 'credit_card'" class="payment-detail">
                  <p><span class="material-symbols-outlined">credit_card</span> Credit Card</p>
                  <p *ngIf="order.paymentMethod.cardNumber">
                    •••• •••• •••• {{order.paymentMethod.cardNumber.slice(-4)}}
                  </p>
                </div>

                <div *ngIf="order.paymentMethod.type === 'stripe'" class="payment-detail">
                  <p><span class="material-symbols-outlined">account_balance_wallet</span> Credit/Debit Card (Stripe)</p>
                </div>

                <div *ngIf="order.paymentMethod.type === 'cash_on_delivery'" class="payment-detail">
                  <p><span class="material-symbols-outlined">local_shipping</span> Cash on Delivery</p>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h2>Estimated Delivery</h2>
              <p class="delivery-date">
                {{order.estimatedDelivery | date:'mediumDate'}}
              </p>
            </div>
          </div>

          <div class="action-buttons">
            <a routerLink="/" class="continue-button">Continue Shopping</a>
            <a [routerLink]="['/account', 'orders']" class="view-orders-button">View My Orders</a>
          </div>
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

    .confirmation-container {
      background-color: var(--white);
      border-radius: var(--radius-md);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      margin-top: var(--space-6);
    }

    .success-message {
      text-align: center;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--neutral-200);
    }

    .success-icon {
      margin-bottom: var(--space-4);
    }

    .success-icon .material-symbols-outlined {
      font-size: 4rem;
      color: var(--success);
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--neutral-900);
    }

    .order-number {
      font-size: 1.125rem;
      margin-bottom: var(--space-3);
      color: var(--neutral-700);
    }

    .confirmation-text {
      font-size: 1rem;
      color: var(--neutral-700);
      max-width: 600px;
      margin: 0 auto;
    }

    .order-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
      margin-bottom: var(--space-6);
    }

    .detail-section {
      margin-bottom: var(--space-4);
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--neutral-900);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
    }

    .summary-details {
      margin-top: var(--space-3);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
      font-size: 0.9375rem;
      color: var(--neutral-700);
    }

    .summary-row.total {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--neutral-900);
    }

    .summary-divider {
      height: 1px;
      background-color: var(--neutral-200);
      margin: var(--space-3) 0;
    }

    .shipping-address p, .payment-info p, .delivery-date {
      margin: 0;
      margin-bottom: var(--space-1);
      color: var(--neutral-800);
    }

    .payment-detail {
      display: flex;
      flex-direction: column;
    }

    .payment-detail .material-symbols-outlined {
      font-size: 1.25rem;
      vertical-align: middle;
      margin-right: var(--space-1);
      color: var(--primary);
    }

    .delivery-date {
      font-size: 1.125rem;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: var(--space-4);
      margin-top: var(--space-6);
    }

    .continue-button, .view-orders-button {
      display: inline-block;
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 500;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .continue-button {
      background-color: var(--primary);
      color: var(--white);
    }

    .continue-button:hover {
      background-color: var(--primary-dark);
    }

    .view-orders-button {
      border: 1px solid var(--primary);
      color: var(--primary);
      background-color: var(--white);
    }

    .view-orders-button:hover {
      background-color: var(--primary-50);
    }

    @media (max-width: 768px) {
      .order-details {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
        gap: var(--space-3);
      }

      .continue-button, .view-orders-button {
        text-align: center;
      }
    }

    .loading-container, .error-container {
      text-align: center;
      margin: var(--space-6) 0;
      padding: var(--space-6);
    }

    .spinner {
      border: 3px solid var(--neutral-200);
      border-radius: 50%;
      border-top: 3px solid var(--primary);
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-4);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-icon {
      margin-bottom: var(--space-4);
    }

    .error-icon .material-symbols-outlined {
      font-size: 4rem;
      color: var(--error);
    }

    .error-message {
      font-size: 1.125rem;
      color: var(--neutral-700);
      margin-bottom: var(--space-6);
    }
  `]
})
export class ConfirmationComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private stripeService: StripeService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    console.log('Confirmation component initialized');

    // Check for pending orders or query parameters
    this.route.queryParams.subscribe(params => {
      console.log('Query params received:', params);

      // First priority: Check for explicit orderId in query params
      if (params['orderId']) {
        console.log('Found orderId in query params:', params['orderId']);
        this.loadOrder(params['orderId']);
        return;
      }

      // Second priority: Check for Stripe redirect with payment_intent
      if (params['payment_intent']) {
        const paymentIntent = params['payment_intent'];
        console.log('Found Stripe payment intent:', paymentIntent);

        // Try to get the client secret from session storage if not in params
        let clientSecret = params['payment_intent_client_secret'];
        if (!clientSecret) {
          clientSecret = sessionStorage.getItem('currentPaymentIntent');
          console.log('Using client secret from session storage');
        }

        if (clientSecret) {
          console.log('Completing payment with client secret');
          this.completeStripePayment(clientSecret);
          return;
        } else {
          // If we have a payment intent ID but no client secret, try to get order directly
          console.log('No client secret found, trying to fetch order by payment intent');
          this.orderService.getOrderByPaymentIntent(paymentIntent).subscribe({
            next: (order) => {
              console.log('Order found by payment intent:', order);
              this.order = order;
              this.isLoading = false;

              // Clean up session storage
              this.cleanupSessionStorage();
            },
            error: (error) => {
              console.error('Error finding order by payment intent:', error);
              this.checkForPendingOrderId();
            }
          });
          return;
        }
      }

      // If no payment_intent in params, check session storage
      this.checkForPendingOrderId();
    });
  }

  private checkForPendingOrderId(): void {
    // Third priority: Check session storage for pending order ID
    const pendingOrderId = sessionStorage.getItem('pendingOrderId');
    if (pendingOrderId) {
      console.log('Found pendingOrderId in sessionStorage:', pendingOrderId);
      this.loadOrder(pendingOrderId);
      // Clean up session storage
      this.cleanupSessionStorage();
    } else {
      // If we get here, we couldn't find order information
      console.error('No order information found in params or session storage');
      this.isLoading = false;
      this.error = 'Unable to find your order details. Please check your account for order status.';
    }
  }

  private completeStripePayment(clientSecret: string): void {
    console.log('Completing Stripe payment with client secret');
    this.stripeService.completePayment(clientSecret).subscribe({
      next: (paymentIntent) => {
        console.log('Payment completed successfully', paymentIntent);

        // Get the stored order ID from session storage
        const orderId = sessionStorage.getItem('pendingOrderId');
        if (orderId) {
          console.log('Loading order after payment completion:', orderId);
          this.loadOrder(orderId);
        } else {
          // Try to load order by payment intent ID
          console.log('No pendingOrderId found, trying by payment intent ID:', paymentIntent.id);
          this.orderService.getOrderByPaymentIntent(paymentIntent.id).subscribe({
            next: (order) => {
              console.log('Order found by payment intent ID:', order);
              this.order = order;
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error finding order by payment intent ID:', error);

              // Try to load the most recent order as a fallback
              this.loadRecentOrder();
            }
          });
        }

        // Clean up session storage either way
        this.cleanupSessionStorage();
      },
      error: (error) => {
        console.error('Error completing Stripe payment:', error);

        // Even with a payment error, try to look up a recent order
        const orderId = sessionStorage.getItem('pendingOrderId');
        if (orderId) {
          this.loadOrder(orderId);
        } else {
          this.loadRecentOrder();
        }
      }
    });
  }

  /**
   * Load the most recent order as a fallback
   */
  private loadRecentOrder(): void {
    console.log('Attempting to load most recent order as fallback');
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        if (orders && orders.length > 0) {
          // Find the most recent order by created date
          const recentOrder = orders.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          console.log('Found recent order as fallback:', recentOrder);
          this.order = recentOrder;
          this.isLoading = false;
        } else {
          console.log('No orders found');
          this.isLoading = false;
          this.error = 'Unable to find your order. Please check your account orders page.';
        }
      },
      error: (orderError) => {
        console.error('Error loading user orders:', orderError);

        // Wait a moment and retry again - this could handle temporary networking issues
        setTimeout(() => {
          console.log('Retrying order load after error...');
          this.retryLoadRecentOrder(2); // Try up to 2 more times
        }, 1000);
      }
    });
  }

  /**
   * Retry loading recent orders with a countdown
   */
  private retryLoadRecentOrder(retriesLeft: number): void {
    if (retriesLeft <= 0) {
      this.isLoading = false;
      this.error = 'Unable to find your order details. Please check your account for order status.';
      return;
    }

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        if (orders && orders.length > 0) {
          const recentOrder = orders.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          console.log('Found recent order on retry:', recentOrder);
          this.order = recentOrder;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = 'Unable to find your order. Please check your account orders page.';
        }
      },
      error: (orderError) => {
        console.error(`Retry failed (${retriesLeft} left):`, orderError);

        // Wait a bit longer between each retry
        setTimeout(() => {
          this.retryLoadRecentOrder(retriesLeft - 1);
        }, 2000);
      }
    });
  }

  loadOrder(orderId: string): void {
    console.log('Loading order details for ID:', orderId);
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        console.log('Order loaded successfully:', order);
        this.order = order;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error loading order ${orderId}:`, error);

        // Attempt to load from user's orders list as a fallback
        console.log('Attempting to load from user orders as fallback');
        this.orderService.getOrders().subscribe({
          next: (orders) => {
            if (orders && orders.length > 0) {
              // Find the most recent order
              const recentOrder = orders.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0];

              console.log('Found recent order as fallback:', recentOrder);
              this.order = recentOrder;
              this.isLoading = false;
            } else {
              this.isLoading = false;
              this.error = 'Unable to load order details. Please check your account orders.';
            }
          },
          error: (orderError) => {
            console.error('Error loading user orders:', orderError);
            this.isLoading = false;
            this.error = 'Unable to load order details. Please try again later.';
          }
        });
      }
    });
  }

  private cleanupSessionStorage(): void {
    console.log('Cleaning up session storage');
    sessionStorage.removeItem('pendingOrderId');
    sessionStorage.removeItem('currentPaymentIntent');
    sessionStorage.removeItem('paymentIntentId');
  }
}
