import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CheckoutService, ShippingAddress } from '../../services/checkout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ShippingComponent implements OnInit {
  shippingForm: FormGroup;
  private currentAddressId: number | undefined;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private checkoutService: CheckoutService
  ) {
    this.shippingForm = this.fb.group({
      name: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('^\\d{5}(-\\d{4})?$')]], // Basic US zip code pattern
      country: ['US', Validators.required], // Default to US
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')] // E.164 phone number pattern (optional)
    });
  }

  ngOnInit(): void {
    this.checkoutService.setCurrentStep('shipping');
    const existingAddress = this.checkoutService.getShippingAddress();
    if (existingAddress) {
      this.shippingForm.patchValue(existingAddress);
      if (existingAddress.id) {
        this.currentAddressId = existingAddress.id;
      }
    }
  }

  onSubmit(): void {
    if (this.shippingForm.valid) {
      const formValue = this.shippingForm.value;
      const addressToSet: ShippingAddress = {
        name: formValue.name,
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2,
        city: formValue.city,
        state: formValue.state,
        postalCode: formValue.postalCode,
        country: formValue.country,
        phone: formValue.phone,
        id: this.currentAddressId
      };
      console.log('ShippingComponent: addressToSet before calling setShippingAddress:', addressToSet);
      this.checkoutService.setShippingAddress(addressToSet);
      this.router.navigate(['/checkout/payment']);
    } else {
      // Mark all fields as touched to display validation errors
      this.shippingForm.markAllAsTouched();
    }
  }

  fillWithSampleAddress(): void {
    const sampleAddress = {
      name: 'Jane Doe',
      addressLine1: '123 Sample St',
      addressLine2: 'Suite 100',
      city: 'Testville',
      state: 'TS', // Use a generic state code, or a valid one if your validators are strict
      postalCode: '99999', // A generic postal code
      country: 'US', // Assuming US is a common default
      phone: '+15550001111'
    };
    this.shippingForm.patchValue(sampleAddress);
  }
}
