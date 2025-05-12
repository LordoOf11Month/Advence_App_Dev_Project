import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../services/stripe.service';
import { CheckoutService, OrderSummary } from '../../services/checkout.service';
import { StripeElement } from '@stripe/stripe-js';
import { Subscription, throwError, of, from, firstValueFrom } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';

interface PaymentIntentAPIResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule]
})
export class PaymentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('paymentElementRef') paymentElementRef?: ElementRef;

  private paymentElement: StripeElement | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  private subscriptions = new Subscription();

  private clientSecret: string | null = null;
  private paymentIntentId: string | null = null;

  constructor(
    private stripeService: StripeService,
    private checkoutService: CheckoutService,
    public router: Router,
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.checkoutService.setCurrentStep('payment');
    this.isLoading = true;
    this.errorMessage = null;
    this.stripeService.clearPaymentElement();

    const summaryValidationSub = this.checkoutService.orderSummary$.pipe(
      tap(summary => {
        if (!summary || summary.total <= 0) {
          this.errorMessage = 'Order amount is invalid. Please review your cart.';
          this.isLoading = false;
          this.checkoutService.setPaymentIntentClientSecret(null);
        } else {
          this.createPaymentIntent();
        }
      }),
      catchError(err => {
        console.error("Error processing order summary for payment setup:", err);
        this.errorMessage = "Could not retrieve order details to proceed with payment.";
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();

    this.subscriptions.add(summaryValidationSub);
  }

  ngAfterViewInit(): void {
    if (this.clientSecret && !this.paymentElement) {
        console.log('ngAfterViewInit: Client secret exists, attempting to setup Stripe elements.');
        this.setupStripeElements();
    }
  }

  createPaymentIntent(): void {
    console.log('Attempting to create payment intent...');
    this.isLoading = true;
    this.errorMessage = null;

    const cartItems = this.cartService.getCartItems();
    const shippingAddress = this.checkoutService.getShippingAddress();

    if (!cartItems || cartItems.length === 0) {
      this.errorMessage = 'Your cart is empty. Cannot create payment intent.';
      this.isLoading = false;
      console.error(this.errorMessage);
      return;
    }
    if (!shippingAddress) {
      this.errorMessage = 'Shipping address is missing. Cannot create payment intent.';
      this.isLoading = false;
      console.error(this.errorMessage);
      return;
    }

    this.http.post<PaymentIntentAPIResponse>('/api/orders/create-payment-intent', {
      items: cartItems.map((item: CartItem) => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      shippingAddress: shippingAddress
    })
    .subscribe({
      next: (response) => {
        console.log('Payment intent creation response:', response);
        if (response && response.clientSecret) {
          this.clientSecret = response.clientSecret;
          this.paymentIntentId = response.paymentIntentId;
          this.checkoutService.setPaymentIntentClientSecret(response.clientSecret);
          console.log('Client secret received and set:', this.clientSecret);

          if (this.paymentElementRef) {
            console.log('createPaymentIntent: View is ready, calling setupStripeElements.');
            this.setupStripeElements();
          } else {
            console.log('createPaymentIntent: View not ready yet, ngAfterViewInit will handle Stripe setup.');
          }
        } else {
          console.error('No client secret in API response:', response);
          this.errorMessage = 'Payment initialization failed: Missing payment details from server.';
          this.isLoading = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating payment intent via API:', error);
        this.errorMessage = `Payment initialization failed: ${error.error?.error || error.message || 'Unknown server error'}`;
        this.isLoading = false;
      }
    });
  }

  async setupStripeElements(): Promise<void> {
    if (!this.clientSecret) {
      this.errorMessage = 'Cannot setup Stripe Elements: Client secret is missing.';
      this.isLoading = false;
      console.error(this.errorMessage);
      return;
    }
    if (!this.paymentElementRef) {
        this.errorMessage = 'Payment form container not found in the template. Cannot mount Stripe element.';
        this.isLoading = false;
        console.error(this.errorMessage);
        return;
    }
    if (this.paymentElement) {
        console.log('Stripe element already initialized and possibly mounted.');
        this.isLoading = false;
        return;
    }

    console.log('Setting up Stripe Elements with client secret:', this.clientSecret);
    this.isLoading = true;

    try {
      const stripe = await firstValueFrom(this.stripeService.getStripe());
      if (!stripe) {
        this.errorMessage = 'Stripe.js failed to load. Cannot display payment form.';
        this.isLoading = false;
        console.error(this.errorMessage);
        return;
      }

      this.paymentElement = await this.stripeService.createPaymentElement(this.clientSecret);
      if (this.paymentElement && this.paymentElementRef) {
        this.paymentElement.mount(this.paymentElementRef.nativeElement);
        this.errorMessage = null;
        console.log('Stripe Payment Element mounted successfully.');
      } else {
        this.errorMessage = 'Failed to initialize or mount Stripe payment element.';
        console.error(this.errorMessage);
        this.isLoading = false; // Ensure loading is off if this path is taken
      }
    } catch (error: any) {
      console.error('Error during Stripe Elements setup:', error);
      this.errorMessage = `Could not display payment form: ${error.message || 'Stripe setup error'}`;
      this.isLoading = false; // Ensure loading is off on error
    } finally {
      // Only set isLoading to false if it wasn't handled by a more specific error path above
      if (this.isLoading) {
        this.isLoading = false;
      }
    }
  }

  proceedToReview(): void {
    if (this.paymentElement && !this.isLoading && !this.errorMessage) {
        this.router.navigate(['/checkout/review']);
    } else {
        if (this.isLoading) {
            this.errorMessage = "Payment setup is still in progress. Please wait.";
        } else if (!this.paymentElement) {
            this.errorMessage = "Payment details are not ready. Please ensure there are no errors or try again.";
        }
        console.warn('Proceed to review blocked:', {isLoading: this.isLoading, hasPaymentElement: !!this.paymentElement, errorMessage: this.errorMessage});
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stripeService.clearPaymentElement();
  }
}
