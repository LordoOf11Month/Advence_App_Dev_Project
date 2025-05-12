import { CartService, CartItem } from './../../../cart/services/cart.service';
// features/checkout/components/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Address } from '../../../auth/components/user-profile/user-profile.component';
import { AddressService } from '../../../../core/services/address.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaymentService } from '../../services/payment.service';
import { NotificationService as MessageService } from '../../../../core/services/notification.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  savedAddresses: Address[] = [];
  checkoutForm!: FormGroup;
  addressForm!: FormGroup;
  cartItems: CartItem[] = [];
  submitted: boolean = false;
  error: string | null = null;

  useExistingAddress: boolean = true;
  showAddressForm: boolean = false;

  order: any;
  isProcessingPayment = false;

  get isLoggedIn(): boolean {
    return !!this.authService.currentUserSubject.value;
  }

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService,
    private paymentService: PaymentService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Get current cart items
    this.cartItems = this.cartService.getItems();
    if (!this.cartItems.length) {
      // If cart empty, redirect to cart page
      this.router.navigate(['/cart']);
      return;
    }

    // Initialize checkout form with address selector
    this.checkoutForm = this.fb.group({
      selectedAddressId: ['', Validators.required]
    });

    // Initialize new address form
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
      saveAddress: [true]
    });

    // Load user's saved addresses if logged in
    if (this.isLoggedIn) {
      this.loadUserAddresses();
    } else {
      // If not logged in, default to manual address entry
      this.useExistingAddress = false;
      this.showAddressForm = true;
    }

    // Check if there's an existing order in the component
    // This happens when returning to this component after order creation
    if (this.order) {
      // Initialize the payment form if there's already an order
      setTimeout(() => {
        this.processPayment();
      }, 500);
    }
  }

  get f() { return this.checkoutForm.controls; }
  get a() { return this.addressForm.controls; }

  // Load user's saved addresses
  loadUserAddresses(): void {
    if (this.isLoggedIn) {
      this.addressService.getAddresses().subscribe({
        next: (response) => {
          this.savedAddresses = response.data.map(addr => ({
            ...addr,
            isDefault: addr.primary || false
          }));
          if (this.savedAddresses.length > 0) {
            const defaultAddress = this.savedAddresses.find(addr => addr);
            if (defaultAddress) {
              this.checkoutForm.patchValue({
                selectedAddressId: defaultAddress.id
              });
            } else {
              this.checkoutForm.patchValue({
                selectedAddressId: this.savedAddresses[0].id
              });
            }
          } else {
            this.useExistingAddress = false;
            this.showAddressForm = true;
          }
        },
        error: (error) => {
          console.error('Failed to load addresses:', error);
          this.error = 'Failed to load saved addresses';
          this.useExistingAddress = false;
          this.showAddressForm = true;
        }
      });
    }
  }

  toggleAddressForm(): void {
    this.useExistingAddress = !this.useExistingAddress;
    this.showAddressForm = !this.useExistingAddress;

    if (this.useExistingAddress) {
      // Reset the address form when switching back to saved addresses
      this.addressForm.reset();
      this.addressForm.patchValue({ saveAddress: true });
    } else {
      // Reset address selection when switching to new address
      this.checkoutForm.get('selectedAddressId')?.reset();
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.useExistingAddress) {
      if (this.checkoutForm.invalid) return;

      const selectedAddressId = this.checkoutForm.value.selectedAddressId;
      this.createOrder({ addressId: selectedAddressId });
    } else {
      if (this.addressForm.invalid) return;

      const addressData = this.addressForm.value;
      if (this.isLoggedIn && addressData.saveAddress) {
        // Save address first, then create order
        this.addressService.createAddress({
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          country: addressData.country,
          primary: false
        }).subscribe({
          next: (response) => {
            this.createOrder({ addressId: response.data.id });
          },
          error: (error) => {
            console.error('Failed to save address:', error);
            this.error = 'Failed to save address';
          }
        });
      } else {
        // Guest checkout - pass address directly
        this.createOrder({
          address: addressData
        });
      }
    }
  }

  private createOrder(shippingInfo: any): void {
    this.orderService.createOrder(shippingInfo, this.cartItems).subscribe({
      next: (order) => {
        // Store the order in the component
        this.order = order;

        // Instead of navigating away, process the payment
        this.processPayment();
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        this.error = 'Failed to create order. Please try again.';
      }
    });
  }

  private saveNewAddress(addressData: any): void {
    const newAddress = {
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      country: addressData.country,
      primary: false
    };

    this.addressService.createAddress(newAddress).subscribe({
      next: (response) => {
        const savedAddress = { ...response.data, isDefault: response.data.primary || false };
        this.savedAddresses.push(savedAddress);
        return savedAddress.id; // Return the ID for order creation
      },
      error: (error) => {
        console.error('Failed to save address:', error);
        throw new Error('Failed to save address');
      }
    });
  }

  calculateTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async processPayment() {
    if (!this.order) {
      console.error('No order to process payment for');
      return;
    }

    if (this.isProcessingPayment) {
      console.log('Payment is already processing');
      return;
    }

    try {
      this.isProcessingPayment = true;

      // Log the order structure to see what's available
      console.log('Order data for payment processing:', this.order);

      // Create the payment intent using firstValueFrom instead of toPromise
      // Ensure we're explicitly passing an orderId that exists
      const orderId = this.order.id || this.order.data?.id;
      console.log('Using orderId for payment:', orderId);

      if (!orderId) {
        throw new Error('Cannot process payment: Order ID is missing');
      }

      const clientSecret = await firstValueFrom(this.paymentService.createPaymentIntent(orderId))
        .catch(error => {
          // Handle case where payment intent already exists
          if (error?.error?.message === "Payment already created for this order") {
            this.messageService.showInfo('Payment process already started for this order');
            // Since payment was already created, consider it in process
            this.cartService.clearCart();
            this.router.navigate(['/orders']);
            return null;
          }
          throw error; // Rethrow if it's a different error
        });

      // If we caught the duplicate payment error above, exit early
      if (!clientSecret) return;

      // Create payment form element
      const paymentFormContainer = document.getElementById('payment-form-container');
      if (!paymentFormContainer) {
        throw new Error('Payment form container not found');
      }

      // Clear any existing contents
      paymentFormContainer.innerHTML = '<div id="payment-element"></div>';

      // Create and mount the payment form
      const { elements } = await this.paymentService.createPaymentForm(clientSecret, 'payment-element');

      // Get the form and attach a submit handler
      const form = document.getElementById('payment-form') as HTMLFormElement;
      if (!form) {
        throw new Error('Payment form not found');
      }

      // Setup error display element
      const errorDisplay = document.getElementById('payment-errors');

      // Set up the form submit handler
      form.addEventListener('submit', async (event) => {
        // Prevent the default form submission
        event.preventDefault();

        if (this.isProcessingPayment) {
          return;
        }

        this.isProcessingPayment = true;

        // Get the payment submission button and disable it
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.setAttribute('disabled', 'true');
        }

        // Clear any previous errors
        if (errorDisplay) {
          errorDisplay.textContent = '';
        }

        const stripe = await this.paymentService.getStripe();

        // Process the payment
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
          },
          redirect: 'if_required'
        });

        if (error) {
          console.error('Payment failed:', error);

          // Display the error message
          if (errorDisplay) {
            errorDisplay.textContent = error.message || 'An error occurred during payment.';
          }

          this.messageService.showError('Payment failed: ' + (error.message || 'Unknown error'));

          // Re-enable the submit button
          if (submitButton) {
            submitButton.removeAttribute('disabled');
          }

          this.isProcessingPayment = false;
          return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Payment was successful - clear the cart and redirect
          this.cartService.clearCart();

          // Additional attempt to confirm the payment
          try {
            console.log('Additional payment confirmation attempt before redirecting');
            await firstValueFrom(this.paymentService.confirmPayment(paymentIntent.id));
          } catch (err) {
            console.error('Additional confirmation attempt failed:', err);
            // Continue with redirect anyway since payment succeeded on Stripe's side
          }

          this.router.navigate(['/checkout/success'], {
            queryParams: { orderId: orderId }
          });
        } else if (paymentIntent) {
          // Payment requires additional actions, handle accordingly
          console.log('Payment status:', paymentIntent.status);
          this.messageService.showInfo('Payment is processing. You will be notified when it completes.');
          this.cartService.clearCart();  // Clear cart since order is being processed
          this.router.navigate(['/orders']);
        }
      });

    } catch (err: any) {
      console.error('Payment processing error:', err);
      this.messageService.showError('Payment processing error: ' + (err.message || 'Unknown error'));
    } finally {
      this.isProcessingPayment = false;
    }
  }
}
