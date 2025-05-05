import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SellerService } from '../../services/seller.service';
import { AccountComponent } from '../account/account.component';

@Component({
  selector: 'app-seller-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="seller-register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>Become a Seller</h1>
          <p>Join thousands of sellers and start growing your business today</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-section">
            <h2>Store Information</h2>

            <div class="form-group">
              <label for="storeName">Store Name *</label>
              <input
                id="storeName"
                type="text"
                formControlName="storeName"
                [class.error]="isFieldInvalid('storeName')"
                placeholder="Enter your store name"
              >
              <div class="error-message" *ngIf="isFieldInvalid('storeName')">
                Store name is required
              </div>
            </div>

            <div class="form-group">
              <label for="description">Store Description</label>
              <textarea
                id="description"
                formControlName="description"
                rows="3"
                placeholder="Tell customers about your store"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="category">Store Category *</label>
              <select
                id="category"
                formControlName="category"
                [class.error]="isFieldInvalid('category')"
              >
                <option value="">Select a category</option>
                <option *ngFor="let cat of categories" [value]="cat">{{cat}}</option>
              </select>
              <div class="error-message" *ngIf="isFieldInvalid('category')">
                Please select a category
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Business Information</h2>

            <div class="form-group">
              <label for="businessName">Legal Business Name *</label>
              <input
                id="businessName"
                type="text"
                formControlName="businessName"
                [class.error]="isFieldInvalid('businessName')"
                placeholder="Enter your legal business name"
              >
              <div class="error-message" *ngIf="isFieldInvalid('businessName')">
                Business name is required
              </div>
            </div>

            <div class="form-group">
              <label for="taxId">Tax ID / VAT Number *</label>
              <input
                id="taxId"
                type="text"
                formControlName="taxId"
                [class.error]="isFieldInvalid('taxId')"
                placeholder="Enter your tax ID"
              >
              <div class="error-message" *ngIf="isFieldInvalid('taxId')">
                Tax ID is required
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  formControlName="phone"
                  [class.error]="isFieldInvalid('phone')"
                  placeholder="Enter phone number"
                >
                <div class="error-message" *ngIf="isFieldInvalid('phone')">
                  Valid phone number is required
                </div>
              </div>

              <div class="form-group">
                <label for="email">Business Email *</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  [class.error]="isFieldInvalid('email')"
                  placeholder="Enter business email"
                >
                <div class="error-message" *ngIf="isFieldInvalid('email')">
                  Valid email is required
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Address Information</h2>

            <div class="form-group">
              <label for="address">Street Address *</label>
              <input
                id="address"
                type="text"
                formControlName="address"
                [class.error]="isFieldInvalid('address')"
                placeholder="Enter street address"
              >
              <div class="error-message" *ngIf="isFieldInvalid('address')">
                Address is required
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="city">City *</label>
                <input
                  id="city"
                  type="text"
                  formControlName="city"
                  [class.error]="isFieldInvalid('city')"
                  placeholder="Enter city"
                >
                <div class="error-message" *ngIf="isFieldInvalid('city')">
                  City is required
                </div>
              </div>

              <div class="form-group">
                <label for="state">State/Province *</label>
                <input
                  id="state"
                  type="text"
                  formControlName="state"
                  [class.error]="isFieldInvalid('state')"
                  placeholder="Enter state"
                >
                <div class="error-message" *ngIf="isFieldInvalid('state')">
                  State is required
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="postalCode">Postal Code *</label>
                <input
                  id="postalCode"
                  type="text"
                  formControlName="postalCode"
                  [class.error]="isFieldInvalid('postalCode')"
                  placeholder="Enter postal code"
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
                  <option *ngFor="let country of countries" [value]="country">{{country}}</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('country')">
                  Please select a country
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  formControlName="terms"
                  [class.error]="isFieldInvalid('terms')"
                >
                <span>I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
              </label>
              <div class="error-message" *ngIf="isFieldInvalid('terms')">
                You must accept the terms and conditions
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" [disabled]="registerForm.invalid || isLoading">
              <span *ngIf="!isLoading">Register as Seller</span>
              <span *ngIf="isLoading">Registering...</span>
            </button>
            <p class="login-link">
              Already have a seller account? <a routerLink="/login">Login here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .seller-register-container {
      min-height: 100vh;
      padding: var(--space-6) var(--space-4);
      background-color: var(--neutral-50);
      display: flex;
      justify-content: center;
    }

    .register-card {
      width: 100%;
      max-width: 800px;
      background-color: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: var(--space-6);
    }

    .register-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .register-header h1 {
      font-size: 2rem;
      color: var(--neutral-900);
      margin: 0 0 var(--space-2);
    }

    .register-header p {
      color: var(--neutral-600);
      font-size: 1.125rem;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .form-section h2 {
      font-size: 1.25rem;
      color: var(--neutral-900);
      margin: 0;
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--neutral-700);
    }

    input, select, textarea {
      padding: var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 1rem;
      color: var(--neutral-900);
      transition: all var(--transition-fast);
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    input.error, select.error {
      border-color: var(--error);
    }

    .error-message {
      font-size: 0.875rem;
      color: var(--error);
    }

    .checkbox-group {
      margin-top: var(--space-2);
    }

    .checkbox-label {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin: 0;
    }

    .checkbox-label span {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .checkbox-label a {
      color: var(--primary);
      text-decoration: none;
    }

    .checkbox-label a:hover {
      text-decoration: underline;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .submit-btn {
      width: 100%;
      max-width: 300px;
      padding: var(--space-4);
      background-color: var(--primary);
      color: var(--white);
      border: none;
      border-radius: var (--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .submit-btn:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .login-link {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .login-link a {
      color: var(--primary);
      text-decoration: none;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .register-card {
        padding: var(--space-4);
      }
    }
  `]
})
export class SellerRegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Beauty & Health',
    'Toys & Games',
    'Books & Media',
    'Automotive',
    'Food & Beverages',
    'Other'
  ];

  countries = [
    'Turkey',
    'United States',
    'United Kingdom',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'Belgium',
    'Sweden',
    // Add more countries as needed
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private sellerService: SellerService
  ) {
    this.registerForm = this.fb.group({
      storeName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      Account_number: ['', Validators.required],
      bank_name: ['', Validators.required],
      Account_owner_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      try {
        // Call your registration service here
        await this.sellerService.register(this.registerForm.value);
        this.router.navigate(['/seller/dashboard']);
      } catch (error) {
        console.error('Registration failed:', error);
        // Handle error (show message to user)
      } finally {
        this.isLoading = false;
      }
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}