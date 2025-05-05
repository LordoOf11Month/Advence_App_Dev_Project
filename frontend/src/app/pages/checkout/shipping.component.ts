import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ShippingAddress } from '../../models/order.model';
import { CheckoutProgressComponent } from './checkout-progress.component';
import { OrderSummaryComponent } from './order-summary.component';

@Component({
  selector: 'app-shipping',
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
      <app-checkout-progress [currentStep]="'shipping'"></app-checkout-progress>
      
      <div class="checkout-container">
        <div class="checkout-form">
          <h1>Shipping Information</h1>
          
          <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  formControlName="firstName"
                  [class.error]="isFieldInvalid('firstName')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('firstName')">
                  First name is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input 
                  type="text" 
                  id="lastName" 
                  formControlName="lastName"
                  [class.error]="isFieldInvalid('lastName')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('lastName')">
                  Last name is required
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">Email Address *</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email"
                [class.error]="isFieldInvalid('email')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('email')">
                Please enter a valid email address
              </div>
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number *</label>
              <input 
                type="tel" 
                id="phone" 
                formControlName="phone"
                [class.error]="isFieldInvalid('phone')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('phone')">
                Please enter a valid phone number
              </div>
            </div>
            
            <div class="form-group">
              <label for="address1">Address Line 1 *</label>
              <input 
                type="text" 
                id="address1" 
                formControlName="address1"
                [class.error]="isFieldInvalid('address1')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('address1')">
                Address is required
              </div>
            </div>
            
            <div class="form-group">
              <label for="address2">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                id="address2" 
                formControlName="address2"
              >
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="city">City *</label>
                <input 
                  type="text" 
                  id="city" 
                  formControlName="city"
                  [class.error]="isFieldInvalid('city')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('city')">
                  City is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="state">State/Province *</label>
                <input 
                  type="text" 
                  id="state" 
                  formControlName="state"
                  [class.error]="isFieldInvalid('state')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('state')">
                  State/Province is required
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="postalCode">Postal Code *</label>
                <input 
                  type="text" 
                  id="postalCode" 
                  formControlName="postalCode"
                  [class.error]="isFieldInvalid('postalCode')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('postalCode')">
                  Postal code is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="country">Country *</label>
                <select 
                  id="country" 
                  formControlName="country"
                  [class.error]="isFieldInvalid('country')"
                >
                  <option value="">Select a country</option>
                  <option value="Turkey">Turkey</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                  <option value="Netherlands">Netherlands</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('country')">
                  Country is required
                </div>
              </div>
            </div>
            
            <div class="form-group checkbox">
              <input 
                type="checkbox" 
                id="saveAddress" 
                formControlName="saveAddress"
              >
              <label for="saveAddress">Save this address for future orders</label>
            </div>
            
            <div class="form-actions">
              <a routerLink="/cart" class="back-button">Back to Cart</a>
              <button 
                type="submit" 
                class="continue-button"
                [disabled]="shippingForm.invalid"
              >
                Continue to Payment
              </button>
            </div>
          </form>
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
    
    .form-row {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    
    .form-row .form-group {
      flex: 1;
    }
    
    .form-group {
      margin-bottom: var(--space-4);
    }
    
    label {
      display: block;
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: var(--space-2);
      color: var(--neutral-700);
    }
    
    input, select {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 1rem;
      transition: border-color var(--transition-fast);
    }
    
    input:focus, select:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    input.error, select.error {
      border-color: var(--error);
    }
    
    .error-message {
      color: var(--error);
      font-size: 0.8125rem;
      margin-top: var(--space-1);
    }
    
    .checkbox {
      display: flex;
      align-items: center;
    }
    
    .checkbox input {
      width: auto;
      margin-right: var(--space-2);
    }
    
    .checkbox label {
      margin-bottom: 0;
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
      .form-row {
        flex-direction: column;
        gap: var(--space-3);
      }
    }
  `]
})
export class ShippingComponent implements OnInit {
  shippingForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router
  ) {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address1: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      saveAddress: [false]
    });
  }
  
  ngOnInit(): void {
    // Load saved address if available
    const savedAddress = this.orderService.getSavedShippingAddress();
    if (savedAddress) {
      this.shippingForm.patchValue(savedAddress);
    }
  }
  
  isFieldInvalid(field: string): boolean {
    const formControl = this.shippingForm.get(field);
    return !!(formControl && formControl.invalid && (formControl.dirty || formControl.touched));
  }
  
  onSubmit(): void {
    if (this.shippingForm.valid) {
      const shippingAddress: ShippingAddress = this.shippingForm.value;
      this.orderService.setShippingAddress(shippingAddress);
      this.router.navigate(['/checkout/payment']);
    } else {
      // Mark all fields as touched to display validation errors
      Object.keys(this.shippingForm.controls).forEach(key => {
        this.shippingForm.get(key)?.markAsTouched();
      });
    }
  }
} 