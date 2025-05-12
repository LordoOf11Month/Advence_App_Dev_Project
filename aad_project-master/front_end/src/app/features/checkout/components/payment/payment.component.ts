// features/checkout/components/payment/payment.component.ts
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StripeService } from '../../../../core/services/stripe.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PaymentMethod } from '../../../auth/components/user-profile/user-profile.component';
import { OrderService, Order } from '../../services/order.service';
import { firstValueFrom, catchError, of } from 'rxjs';
import { StripeCardElement } from '@stripe/stripe-js';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit, AfterViewInit {
  orderId: number | null = null;
  orderDetails: Order | null = null;
  paymentForm!: FormGroup;
  error: string | null = null;
  processing: boolean = false;
  clientSecret: string | null = null;
  cardComplete: boolean = false;

  savedPaymentMethods: PaymentMethod[] = [];
  useExistingPayment: boolean = true;
  showPaymentForm: boolean = false;

  @ViewChild('cardElement') cardElementRef!: ElementRef;
  private cardElement!: StripeCardElement;

  get isLoggedIn(): boolean {
    return !!this.authService.currentUserSubject.value;
  }

  constructor(
    private fb: FormBuilder,
    private stripeService: StripeService,
    private orderService: OrderService,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadOrderAndCreatePaymentIntent();

    // If user is logged in, load their payment methods
    if (this.isLoggedIn) {
      this.loadPaymentMethods();
    } else {
      // If guest checkout, show payment form by default
      this.useExistingPayment = false;
      this.showPaymentForm = true;
    }
  }

  async ngAfterViewInit() {
    // Wait for cardElementRef to be available in DOM
    const maxRetries = 5;
    let retries = 0;

    const initStripe = async () => {
      try {
        console.log("Initializing Stripe Elements...");
        if (!this.cardElementRef?.nativeElement) {
          console.warn("Card element reference not found in DOM");
          if (retries < maxRetries) {
            retries++;
            setTimeout(initStripe, 200); // Retry after 200ms
            return;
          } else {
            throw new Error("Card element could not be found in the DOM");
          }
        }

        const stripe = await this.stripeService.getStripe();
        if (!stripe) {
          throw new Error('Failed to initialize Stripe');
        }

        console.log("Creating Stripe card element...");
        const elements = stripe.elements();
        this.cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#32325d',
              fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
              '::placeholder': {
                color: '#aab7c4'
              }
            },
            invalid: {
              color: '#dc3545',
              iconColor: '#dc3545'
            }
          }
        });

        // Now mount it to the DOM
        console.log("Mounting card element to DOM...");
        this.cardElement.mount(this.cardElementRef.nativeElement);
        console.log("Card element mounted successfully");

        // Add event listener for card validation errors
        this.cardElement.on('change', (event) => {
          const displayError = document.getElementById('card-errors');
          if (displayError) {
            displayError.textContent = event.error ? event.error.message : '';
          }
          this.cardComplete = event.complete;

          // Log for debugging
          if (event.error) {
            console.warn("Card validation error:", event.error.message);
          } else if (event.complete) {
            console.log("Card details complete and valid");
          }
        });
      } catch (err) {
        console.error('Error initializing Stripe Elements:', err);
        this.error = 'Could not initialize payment form.';
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    setTimeout(initStripe, 100);
  }

  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      selectedPaymentId: ['', Validators.required],
      newPayment: this.fb.group({
        cardholderName: ['', Validators.required],
        savePayment: [true]
      })
    });
  }

  private loadOrderAndCreatePaymentIntent(): void {
    const idStr = sessionStorage.getItem('currentOrderId');
    if (!idStr) {
      this.router.navigate(['/cart']);
      return;
    }

    this.orderId = Number(idStr);
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;

    this.orderService.getOrder(this.orderId).subscribe({
      next: (order: Order) => {
        this.orderDetails = order;
        // Create payment intent after loading order
        this.createPaymentIntent();
      },
      error: (err: any) => {
        console.error('Error fetching order details', err);
        this.error = 'Could not load order details.';
      }
    });
  }

  private createPaymentIntent(): void {
    if (!this.orderId) return;

    const orderId = this.orderId;
    console.log(`Attempting to create/get payment intent for order #${orderId}`);

    // Direct approach - always try to create first, and if that fails with 'already exists',
    // then attempt to retrieve the existing one
    this.stripeService.createPaymentIntent(orderId)
      .pipe(
        catchError((createErr: HttpErrorResponse) => {
          console.log('Error response from create payment intent:', createErr.status, createErr.error);

          // If error is 'Payment already created', try to get the existing one
          if (createErr.status === 500 &&
              createErr.error?.message?.includes('Payment already created')) {
            console.log('Payment already exists, retrieving...');
            return this.http.get<any>(`${environment.apiUrl}/payment/get-payment-intent/${orderId}`)
              .pipe(
                catchError((getErr: HttpErrorResponse) => {
                  console.error('Failed to retrieve existing payment intent:', getErr);
                  this.error = 'Could not retrieve payment information. Please try again or contact support.';
                  return of(null);
                })
              );
          }

          // For other errors
          console.error('Failed to create payment intent:', createErr);
          this.error = createErr.error?.message || 'Could not initialize payment. Please try again.';
          return of(null);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            // Extract client secret from the response
            if (response.clientSecret) {
              this.clientSecret = response.clientSecret;
            } else if (response.data && response.data.clientSecret) {
              this.clientSecret = response.data.clientSecret;
            } else {
              this.clientSecret = response;
            }

            if (this.clientSecret) {
              console.log('Payment intent retrieved/created successfully');
            } else {
              console.error('Invalid response format:', response);
              this.error = 'Invalid payment data received.';
            }
          }
        },
        error: (err) => {
          console.error('Subscription error:', err);
          this.error = 'Error setting up payment.';
        }
      });
  }

  loadPaymentMethods(): void {
    // In a real app, this would be an API call
    // For now, we'll mock the data (similar to the profile component)
    this.savedPaymentMethods = [
      {
        id: 1,
        cardNumber: '1234567890123456',
        cardholderName: 'John Doe',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ];

    // If user has saved payment methods, select the default one
    if (this.savedPaymentMethods.length > 0) {
      const defaultPayment = this.savedPaymentMethods.find(pm => pm.isDefault);
      if (defaultPayment) {
        this.paymentForm.patchValue({
          selectedPaymentId: defaultPayment.id
        });
      } else {
        this.paymentForm.patchValue({
          selectedPaymentId: this.savedPaymentMethods[0].id
        });
      }
    } else {
      // If no saved payment methods, show the payment form
      this.useExistingPayment = false;
      this.showPaymentForm = true;
    }
  }

  togglePaymentForm(): void {
    this.useExistingPayment = !this.useExistingPayment;
    this.showPaymentForm = !this.useExistingPayment;

    if (this.useExistingPayment) {
      // Reset the new payment form when switching back to saved payments
      this.paymentForm.get('newPayment')?.reset();
      this.paymentForm.get('newPayment')?.patchValue({ savePayment: true });
    } else {
      // Reset payment selection when switching to new payment
      this.paymentForm.get('selectedPaymentId')?.reset();
    }
  }

  maskCardNumber(cardNumber: string): string {
    return 'xxxx-xxxx-xxxx-' + cardNumber.slice(-4);
  }

  async pay(): Promise<void> {
    if (!this.orderId) {
      this.error = 'No active order found.';
      return;
    }

    // Validate form based on payment method
    if (this.useExistingPayment) {
      if (!this.paymentForm.get('selectedPaymentId')?.value) {
        this.error = 'Please select a payment method.';
        return;
      }
    } else {
      // For new payment with Stripe Elements
      if (!this.paymentForm.get('newPayment.cardholderName')?.valid) {
        this.error = 'Please enter the cardholder name.';
        return;
      }

      if (!this.cardComplete) {
        this.error = 'Please enter valid card details.';
        return;
      }

      if (!this.cardElement) {
        this.error = 'Card element is not ready. Please refresh and try again.';
        return;
      }
    }

    this.processing = true;
    this.error = null;

    try {
      // If we already have a client secret from earlier, use it
      let clientSecret = this.clientSecret;

      // Otherwise create a new payment intent
      if (!clientSecret) {
        console.log("No client secret found, attempting to get one...");
        try {
          // First try to get an existing payment intent
          const orderId = this.orderId;
          const response = await firstValueFrom(
            this.http.get<any>(`${environment.apiUrl}/payment/get-payment-intent/${orderId}`)
          );
          if (response && (response.clientSecret || response)) {
            clientSecret = response.clientSecret || response;
            console.log("Retrieved existing payment intent");
          }
        } catch (err) {
          console.log("No existing payment intent, creating new one");
          // If no existing intent, create a new one
          clientSecret = await firstValueFrom(
            this.stripeService.createPaymentIntent(this.orderId)
          );
        }
      }

      if (!clientSecret) {
        throw new Error('Could not initialize payment. Please try again.');
      }

      console.log("Processing payment with client secret:", clientSecret.substring(0, 10) + "...");

      /* 2 | Kart bilgisiyle onayla -> intentId geri al */
      const intentId = await this.stripeService.confirmWithCard(clientSecret, this.cardElement);

      console.log("Payment confirmed, intent ID:", intentId);

      /* 3 | Backend'e "ödeme tamam" de */
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/payment/confirm`, { paymentIntentId: intentId })
      );

      console.log("Backend confirmed payment successful");

      /* 4 | Başarılı yönlendirme */
      sessionStorage.removeItem('currentOrderId');
      this.router.navigate(['/checkout/success'], { queryParams: { orderId: this.orderId } });

    } catch (err: any) {
      console.error('Payment error:', err);
      this.error = err.message || 'Payment could not be processed.';
    } finally {
      this.processing = false;
    }
  }

  private saveNewPaymentMethod(paymentData: any): void {
    // In a real app, this would be an API call to save the payment method
    console.log('Saving new payment method:', paymentData);
    // Mock implementation - we'd normally send this to the backend
    const newPayment: PaymentMethod = {
      id: Date.now(), // Temporary ID
      cardNumber: paymentData.cardNumber,
      cardholderName: paymentData.cardholderName,
      expiryMonth: paymentData.expiryMonth,
      expiryYear: paymentData.expiryYear,
      isDefault: false
    };

    // Update the local list
    this.savedPaymentMethods.push(newPayment);
  }

  // Helper to safely get order total
  getOrderTotal(): number {
    if (!this.orderDetails) return 0;

    // Try to access various properties where the total might be stored
    // using type assertion to avoid compilation errors
    const details = this.orderDetails as any;
    return details.total || details.subtotal || details.amount || 0;
  }
}
