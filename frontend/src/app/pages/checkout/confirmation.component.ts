import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { CheckoutProgressComponent } from './checkout-progress.component';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, CheckoutProgressComponent],
  template: `
    <div class="container">
      <app-checkout-progress [currentStep]="'confirmation'"></app-checkout-progress>
      
      <div class="confirmation-container">
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
              
              <div *ngIf="order.paymentMethod.type === 'paypal'" class="payment-detail">
                <p><span class="material-symbols-outlined">account_balance_wallet</span> PayPal</p>
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
  `]
})
export class ConfirmationComponent implements OnInit {
  order: Order | null = null;
  
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Get order ID from query parameters
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      
      if (!orderId) {
        this.router.navigate(['/']);
        return;
      }
      
      // Get order details
      this.orderService.getOrderById(orderId).subscribe({
        next: (order) => {
          this.order = order;
        },
        error: () => {
          this.router.navigate(['/']);
        }
      });
    });
  }
} 