import { NotificationService } from './../../../../core/services/notification.service';
import { AuthService, User } from './../../../../core/services/auth.service';
// features/auth/components/user-profile/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: number;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  addressForm!: FormGroup;
  paymentMethodForm!: FormGroup;

  editing: boolean = false;
  addingAddress: boolean = false;
  addingPaymentMethod: boolean = false;

  addresses: Address[] = [];
  paymentMethods: PaymentMethod[] = [];

  activeTab: 'profile' | 'addresses' | 'payments' = 'profile';

  // Helper for template
  get currentYear(): number {
    return new Date().getFullYear();
  }

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUserSubject.value;

    // Initialize profile form
    this.profileForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      email: [{value: this.user?.email || '', disabled: true}],  // email not editable typically
    });

    // Initialize address form
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
      isDefault: [false]
    });

    // Initialize payment method form
    this.paymentMethodForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardholderName: ['', Validators.required],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
      isDefault: [false]
    });

    // Load user addresses and payment methods
    this.loadAddresses();
    this.loadPaymentMethods();
  }

  // Profile methods
  enableEdit(): void {
    this.editing = true;
    this.profileForm.get('name')?.enable();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    const newName = this.profileForm.value.name;

    if (this.user) {
      this.user.name = newName;
      this.auth.tokenStorage.saveUser(this.user);
      this.auth.currentUserSubject.next(this.user);
    }

    this.notify.showSuccess('Profile updated.');
    this.editing = false;
    this.profileForm.get('name')?.disable();
  }

  // Tab navigation
  setActiveTab(tab: 'profile' | 'addresses' | 'payments'): void {
    this.activeTab = tab;
  }

  // Address methods
  loadAddresses(): void {
    // In a real app, this would be a backend call
    // For now, mocking some addresses
    this.addresses = [
      {
        id: 1,
        street: '123 Main St',
        city: 'Anytown',
        state: 'ST',
        zipCode: '12345',
        country: 'USA',
        isDefault: true
      }
    ];
  }

  addAddress(): void {
    this.addingAddress = true;
  }

  cancelAddAddress(): void {
    this.addressForm.reset();
    this.addingAddress = false;
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;

    const newAddress: Address = {
      id: Date.now(), // Temporary ID generation
      ...this.addressForm.value
    };

    if (newAddress.isDefault) {
      // Set all other addresses to non-default
      this.addresses.forEach(addr => addr.isDefault = false);
    }

    this.addresses.push(newAddress);
    this.addressForm.reset();
    this.addingAddress = false;
    this.notify.showSuccess('Address added successfully.');
  }

  removeAddress(id: number): void {
    if (confirm('Are you sure you want to remove this address?')) {
      this.addresses = this.addresses.filter(addr => addr.id !== id);
      this.notify.showSuccess('Address removed.');
    }
  }

  setDefaultAddress(id: number): void {
    this.addresses.forEach(addr => {
      addr.isDefault = addr.id === id;
    });
    this.notify.showSuccess('Default address updated.');
  }

  // Payment methods
  loadPaymentMethods(): void {
    // In a real app, this would be a backend call
    // For now, mocking some payment methods
    this.paymentMethods = [
      {
        id: 1,
        cardNumber: '1234567890123456',
        cardholderName: 'John Doe',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ];
  }

  addPaymentMethod(): void {
    this.addingPaymentMethod = true;
  }

  cancelAddPaymentMethod(): void {
    this.paymentMethodForm.reset();
    this.addingPaymentMethod = false;
  }

  savePaymentMethod(): void {
    if (this.paymentMethodForm.invalid) return;

    const newPayment: PaymentMethod = {
      id: Date.now(), // Temporary ID generation
      ...this.paymentMethodForm.value
    };

    if (newPayment.isDefault) {
      // Set all other payment methods to non-default
      this.paymentMethods.forEach(pm => pm.isDefault = false);
    }

    this.paymentMethods.push(newPayment);
    this.paymentMethodForm.reset();
    this.addingPaymentMethod = false;
    this.notify.showSuccess('Payment method added.');
  }

  removePaymentMethod(id: number): void {
    if (confirm('Are you sure you want to remove this payment method?')) {
      this.paymentMethods = this.paymentMethods.filter(pm => pm.id !== id);
      this.notify.showSuccess('Payment method removed.');
    }
  }

  setDefaultPaymentMethod(id: number): void {
    this.paymentMethods.forEach(pm => {
      pm.isDefault = pm.id === id;
    });
    this.notify.showSuccess('Default payment method updated.');
  }

  // Helper method to mask card numbers
  maskCardNumber(cardNumber: string): string {
    return 'xxxx-xxxx-xxxx-' + cardNumber.slice(-4);
  }
}
