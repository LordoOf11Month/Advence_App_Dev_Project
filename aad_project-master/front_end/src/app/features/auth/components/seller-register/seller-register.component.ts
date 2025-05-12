import { NotificationService } from './../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-seller-register',
  standalone: false,
  templateUrl: './seller-register.component.html'
})
export class SellerRegisterComponent implements OnInit {
  sellerRegForm!: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  businessTypes = [
    { value: 'individual', label: 'Individual/Sole Proprietor' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'llc', label: 'LLC' },
    { value: 'other', label: 'Other' }
  ];

  // Check if user is already logged in
  get isLoggedIn(): boolean {
    return !!this.authService.currentUserSubject.value;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.isLoggedIn && !this.canBecomeASeller()) {
      this.router.navigate(['/']);
      return;
    }

    this.sellerRegForm = this.fb.group({
      // Only ask for these fields if user is not logged in
      // Otherwise, we'll use their existing account
      email: [{ value: this.isLoggedIn ? this.authService.currentUserSubject.value?.email : '', disabled: this.isLoggedIn },
               [Validators.required, Validators.email]],
      password: [{ value: '', disabled: this.isLoggedIn },
                 this.isLoggedIn ? [] : [Validators.required, Validators.minLength(8)]],
      confirmPassword: [{ value: '', disabled: this.isLoggedIn },
                        this.isLoggedIn ? [] : [Validators.required]],

      // Seller-specific fields
      companyName: ['', Validators.required],
      storeName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      businessAddress: ['', Validators.required],
      businessType: ['', Validators.required],
      taxId: ['', Validators.required],

      // Agreement checkbox
      agreeTOS: [false, Validators.requiredTrue]
    }, {
      validator: this.isLoggedIn ? undefined : this.checkPasswords
    });
  }

  // Custom validator to check if passwords match
  checkPasswords(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;

    return pass === confirmPass ? null : { passwordMismatch: true };
  }

  // Helper method to get error message for field
  getErrorMessage(fieldName: string): string {
    const control = this.sellerRegForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['pattern']) {
      if (fieldName === 'phoneNumber') return 'Please enter a valid phone number (10-15 digits)';
      return `Invalid format for ${this.getFieldLabel(fieldName)}`;
    }

    return 'Invalid input';
  }

  // Helper method to get field label
  private getFieldLabel(fieldName: string): string {
    const labels: {[key: string]: string} = {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      companyName: 'Company name',
      storeName: 'Store name',
      phoneNumber: 'Phone number',
      businessAddress: 'Business address',
      businessType: 'Business type',
      taxId: 'Tax ID'
    };

    return labels[fieldName] || fieldName;
  }

  // Check if logged in user can register as a seller
  canBecomeASeller(): boolean {
    if (!this.isLoggedIn) return true;

    const user = this.authService.currentUserSubject.value;
    // Check if user already has seller role
    if (!user || !user.roles) return false;
    return !user.roles.includes('SELLER');
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.sellerRegForm.invalid) {
      // Focus the first invalid field
      const invalidControl = this.findFirstInvalidControl();
      if (invalidControl) {
        invalidControl.focus();
      }
      return;
    }

    this.loading = true;
    this.error = null;

    const sellerData = {
      ...this.sellerRegForm.getRawValue(), // Include disabled fields
      // If user is logged in, we're just adding seller role to existing account
      // Otherwise, we're creating a new account with seller role
      isExistingUser: this.isLoggedIn
    };

    // Call the auth service
    // In a real application, these methods would be implemented in AuthService
    // For now, we'll simulate the API calls
    this.processSellerRegistration(sellerData).subscribe({
      next: () => {
        this.loading = false;
        this.notify.showSuccess('Seller registration successful!');

        // Redirect to seller dashboard if already logged in,
        // otherwise to login page
        if (this.isLoggedIn) {
          // Refresh the user to update roles
          this.simulateUserRefresh().subscribe(() => {
            this.router.navigate(['/seller-dashboard']);
          });
        } else {
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: 'true', seller: 'true' }
          });
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Registration failed:', err);
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  // Find first invalid control to focus
  private findFirstInvalidControl(): any {
    const invalidControlNames = Object.keys(this.sellerRegForm.controls)
      .filter(name => this.sellerRegForm.get(name)?.invalid);

    if (invalidControlNames.length > 0) {
      const firstInvalidControlName = invalidControlNames[0];
      const invalidElement = document.querySelector(`[formControlName="${firstInvalidControlName}"]`);
      return invalidElement;
    }

    return null;
  }

  // These methods simulate API calls that would be in the AuthService
  private processSellerRegistration(data: any): Observable<any> {
    console.log('Processing seller registration:', data);
    // Simulate successful registration
    return of({ success: true });
  }

  private simulateUserRefresh(): Observable<any> {
    console.log('Refreshing user data');
    // Simulate successful refresh
    return of({ success: true });
  }
}
