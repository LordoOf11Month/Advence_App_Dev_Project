import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ShippingAddress } from '../../models/order.model';
import { CheckoutProgressComponent } from './checkout-progress.component';
import { OrderSummaryComponent } from './order-summary.component';
import { AddressService, AddressResponse } from '../../services/address.service';
import { AuthService } from '../../services/auth.service';

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

          <!-- Saved Addresses Section -->
          <div class="saved-addresses" *ngIf="isAuthenticated && savedAddresses.length > 0">
            <h2>Saved Addresses</h2>
            <div class="address-grid">
              <div
                *ngFor="let address of savedAddresses"
                class="address-card"
                [class.selected]="selectedAddressId === address.id"
                (click)="selectAddress(address)"
              >
                <div class="address-card-header">
                  <div class="address-card-title">
                    <span *ngIf="address.isDefault" class="default-badge">Default</span>
                  </div>
                  <div class="address-actions">
                    <button type="button" class="edit-button" (click)="editAddress(address, $event)">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button type="button" class="delete-button" (click)="deleteAddress(address.id, $event)">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <div class="address-card-body">
                  <p><strong>Address:</strong> {{address.street}}</p>
                  <p><strong>City:</strong> {{address.city}}</p>
                  <p><strong>State:</strong> {{address.state}}</p>
                  <p><strong>Country:</strong> {{address.country}}</p>
                  <p><strong>ZIP Code:</strong> {{address.zipCode}}</p>
                </div>
              </div>
            </div>
            <div class="use-new-address">
              <button type="button" (click)="useNewAddress()">
                <span class="material-symbols-outlined">add</span>
                Add a new address
              </button>
            </div>
          </div>

          <!-- New Address Form -->
          <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()" *ngIf="showAddressForm">
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

            <div class="form-group checkbox" *ngIf="isAuthenticated">
              <input
                type="checkbox"
                id="saveAddress"
                formControlName="saveAddress"
              >
              <label for="saveAddress">Save this address for future orders</label>
            </div>

            <div class="form-group checkbox" *ngIf="isAuthenticated && shippingForm.get('saveAddress')?.value">
              <input
                type="checkbox"
                id="isDefault"
                formControlName="isDefault"
              >
              <label for="isDefault">Set as default address</label>
            </div>

            <div class="form-actions">
              <a routerLink="/cart" class="back-button">Back to Cart</a>
              <button
                type="submit"
                class="continue-button"
                [disabled]="shippingForm.invalid || isSubmitting"
              >
                Continue to Payment
              </button>
            </div>
          </form>

          <!-- Continue with Selected Address -->
          <div class="form-actions" *ngIf="!showAddressForm && selectedAddressId !== null">
            <a routerLink="/cart" class="back-button">Back to Cart</a>
            <button
              type="button"
              class="continue-button"
              (click)="continueWithSelectedAddress()"
            >
              Continue to Payment
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

    h1, h2 {
      font-weight: 600;
      color: var(--neutral-900);
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: var(--space-4);
    }

    h2 {
      font-size: 1.25rem;
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

    /* Saved addresses styles */
    .saved-addresses {
      margin-bottom: var(--space-6);
    }

    .address-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .address-card {
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .address-card:hover {
      border-color: var(--primary);
      background-color: var(--primary-50);
    }

    .address-card.selected {
      border-color: var(--primary);
      background-color: var(--primary-50);
      box-shadow: 0 0 0 2px var(--primary-200);
    }

    .address-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .default-badge {
      background-color: var(--primary);
      color: var(--white);
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      display: inline-block;
    }

    .address-actions {
      display: flex;
      gap: var(--space-1);
    }

    .edit-button, .delete-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-fast);
    }

    .edit-button:hover {
      background-color: var(--neutral-200);
    }

    .delete-button:hover {
      background-color: var(--error-100);
      color: var(--error);
    }

    .material-symbols-outlined {
      font-size: 1.25rem;
    }

    .address-card-body p {
      margin: 0;
      margin-bottom: var(--space-1);
      font-size: 0.875rem;
      color: var(--neutral-700);
    }

    .use-new-address {
      margin-top: var(--space-4);
    }

    .use-new-address button {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: none;
      border: 1px dashed var(--neutral-400);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      color: var(--neutral-700);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .use-new-address button:hover {
      border-color: var(--primary);
      color: var(--primary);
      background-color: var(--primary-50);
    }

    /* Form styles */
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
      margin-bottom: var(--space-1);
      font-weight: 500;
      color: var(--neutral-700);
    }

    input, select {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 1rem;
      transition: border-color var(--transition-fast);
    }

    input:focus, select:focus {
      border-color: var(--primary);
      outline: none;
    }

    input.error, select.error {
      border-color: var(--error);
    }

    .error-message {
      color: var(--error);
      font-size: 0.875rem;
      margin-top: var(--space-1);
    }

    .form-group.checkbox {
      display: flex;
      align-items: center;
    }

    .form-group.checkbox input {
      width: auto;
      margin-right: var(--space-2);
    }

    .form-group.checkbox label {
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

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: var(--space-2);
      }

      .form-group {
        margin-bottom: var(--space-3);
      }

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
export class ShippingComponent implements OnInit {
  shippingForm: FormGroup;
  isSubmitting = false;
  isAuthenticated = false;
  savedAddresses: AddressResponse[] = [];
  selectedAddressId: number | null = null;
  showAddressForm = true;
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private addressService: AddressService,
    private authService: AuthService,
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
      saveAddress: [false],
      isDefault: [false]
    });
  }

  ngOnInit(): void {
    // Check authentication status
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;

      if (this.isAuthenticated) {
        // Load saved addresses
        this.loadSavedAddresses();

        // Pre-fill form with user information
        if (user) {
          this.shippingForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || ''
          });
        }
      }
    });

    // Check for existing shipping address in order service
    this.orderService.shippingAddress$.subscribe(address => {
      if (address) {
        this.shippingForm.patchValue(address);
      }
    });
  }

  loadSavedAddresses(): void {
    this.addressService.getAddresses().subscribe(addresses => {
      this.savedAddresses = addresses;

      // If there's a default address and no address is selected, select it
      if (this.selectedAddressId === null) {
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
          this.showAddressForm = false;
        }
      }
    });
  }

  selectAddress(address: AddressResponse): void {
    this.selectedAddressId = address.id;
    this.showAddressForm = false;
  }

  useNewAddress(): void {
    this.selectedAddressId = null;
    this.showAddressForm = true;
    this.shippingForm.reset({
      firstName: this.currentUser?.firstName || '',
      lastName: this.currentUser?.lastName || '',
      email: this.currentUser?.email || '',
      phone: this.currentUser?.phone || '',
      saveAddress: false,
      isDefault: false
    });
  }

  editAddress(address: AddressResponse, event: Event): void {
    event.stopPropagation(); // Prevent address selection when clicking edit

    this.selectedAddressId = address.id;
    this.showAddressForm = true;

    // Populate form with address data
    this.shippingForm.patchValue({
      address1: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.zipCode,
      country: address.country,
      saveAddress: false, // Already saved
      isDefault: address.isDefault
    });
  }

  deleteAddress(addressId: number, event: Event): void {
    event.stopPropagation(); // Prevent address selection when clicking delete

    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          if (this.selectedAddressId === addressId) {
            this.selectedAddressId = null;
            this.showAddressForm = true;
          }
          // Addresses are updated via addressesSubject in service
        },
        error: error => {
          console.error('Error deleting address:', error);
          alert('Failed to delete address. Please try again.');
        }
      });
    }
  }

  continueWithSelectedAddress(): void {
    if (this.selectedAddressId === null) {
      return;
    }

    const selectedAddress = this.savedAddresses.find(addr => addr.id === this.selectedAddressId);
    if (selectedAddress) {
      const shippingAddress = this.addressService.toShippingAddress(
        selectedAddress,
        this.shippingForm.get('firstName')?.value || this.currentUser?.firstName || '',
        this.shippingForm.get('lastName')?.value || this.currentUser?.lastName || '',
        this.shippingForm.get('phone')?.value || this.currentUser?.phone || '',
        this.shippingForm.get('email')?.value || this.currentUser?.email || ''
      );

      // Set shipping address in order service
      this.orderService.setShippingAddress({
        ...shippingAddress,
        // Include addressId for backend
        addressId: this.selectedAddressId
      });

      // Navigate to payment page
      this.router.navigate(['/checkout/payment']);
    }
  }

  isFieldInvalid(field: string): boolean {
    const formControl = this.shippingForm.get(field);
    return !!formControl && formControl.invalid && (formControl.dirty || formControl.touched);
  }

  onSubmit(): void {
    if (this.shippingForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.shippingForm.controls).forEach(key => {
        this.shippingForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formData = this.shippingForm.value;

    // Create shipping address object from form data
    const shippingAddress: ShippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address1: formData.address1,
      address2: formData.address2 || undefined,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      email: formData.email,
      saveAddress: formData.saveAddress
    };

    // If user wants to save the address
    if (this.isAuthenticated && formData.saveAddress) {
      // If editing an existing address
      if (this.selectedAddressId !== null) {
        this.addressService.updateAddress(this.selectedAddressId, {
          street: formData.address1,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.postalCode,
          isDefault: formData.isDefault
        }).subscribe({
          next: (updatedAddress) => {
            // Set shipping address in order service
            this.orderService.setShippingAddress({
              ...shippingAddress,
              // Include addressId for backend
              addressId: updatedAddress.id
            });

            this.isSubmitting = false;
            // Navigate to payment page
            this.router.navigate(['/checkout/payment']);
          },
          error: (error) => {
            console.error('Error updating address:', error);
            this.isSubmitting = false;
            alert('Failed to update address. Please try again.');
          }
        });
      } else {
        // Create a new address
        this.addressService.createAddress({
          street: formData.address1,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.postalCode,
          isDefault: formData.isDefault
        }).subscribe({
          next: (newAddress) => {
            // Set shipping address in order service
            this.orderService.setShippingAddress({
              ...shippingAddress,
              // Include addressId for backend
              addressId: newAddress.id
            });

            this.isSubmitting = false;
            // Navigate to payment page
            this.router.navigate(['/checkout/payment']);
          },
          error: (error) => {
            console.error('Error creating address:', error);
            this.isSubmitting = false;
            alert('Failed to save address. Please try again.');
          }
        });
      }
    } else {
      // Just set the shipping address without saving
      this.orderService.setShippingAddress(shippingAddress);
      this.isSubmitting = false;
      // Navigate to payment page
      this.router.navigate(['/checkout/payment']);
    }
  }
}
