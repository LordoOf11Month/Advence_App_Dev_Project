import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { PaymentMethod } from '../../models/order.model';
import { CheckoutProgressComponent } from './checkout-progress.component';
import { OrderSummaryComponent } from './order-summary.component';

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
              >
                Continue to Review
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
export class PaymentComponent implements OnInit {
  selectedPaymentMethod: string = 'stripe';
  
  paymentMethods = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Secure online payment via Stripe',
      icon: 'credit_score'
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
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Check if shipping address is set
    this.orderService.shippingAddress$.subscribe(address => {
      if (!address) {
        this.router.navigate(['/checkout/shipping']);
      }
    });
    
    // Load saved payment method if available
    const savedPaymentMethod = this.orderService.getSavedPaymentMethod();
    if (savedPaymentMethod && savedPaymentMethod.type) {
      if (savedPaymentMethod.type === 'stripe' || savedPaymentMethod.type === 'cash_on_delivery') {
        this.selectedPaymentMethod = savedPaymentMethod.type;
      }
    }
  }
  
  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
  }
  
  continueWithSelectedMethod(): void {
    const paymentData: PaymentMethod = {
      type: this.selectedPaymentMethod as 'stripe' | 'cash_on_delivery'
    };
    
    this.orderService.setPaymentMethod(paymentData);
    this.router.navigate(['/checkout/review']);
  }
} 