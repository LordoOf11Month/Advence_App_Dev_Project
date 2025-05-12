import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // For potential future API calls, though not used directly for confirm
import { Observable, Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StripeService } from '../../services/stripe.service';
import { CheckoutService, ShippingAddress, OrderItem, OrderSummary } from '../../services/checkout.service';
import { PaymentIntent } from '@stripe/stripe-js';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit, OnDestroy {
  shippingAddress$: Observable<ShippingAddress | null>;
  orderItems$: Observable<OrderItem[]>;
  orderSummary$: Observable<OrderSummary | null>;

  isLoading = false;
  errorMessage: string | null = null;
  clientSecret: string | null = null;
  private subscriptions = new Subscription();

  constructor(
    private checkoutService: CheckoutService,
    private stripeService: StripeService,
    private router: Router
  ) {
    this.shippingAddress$ = this.checkoutService.shippingAddress$;
    this.orderItems$ = this.checkoutService.orderItems$;
    this.orderSummary$ = this.checkoutService.orderSummary$;
  }

  ngOnInit(): void {
    this.checkoutService.setCurrentStep('review');
    this.clientSecret = this.checkoutService.getPaymentIntentClientSecret();

    if (!this.clientSecret) {
      this.errorMessage = 'Payment session is not valid. Please return to the payment step.';
      console.error('ReviewComponent: Client secret is missing.');
      // Optionally, redirect back to payment or show a more prominent error
      // this.router.navigate(['/checkout/payment']);
    }
    // Data observables are already set up in the constructor for the template to use.
  }

  async confirmOrderAndPay(): Promise<void> {
    if (!this.clientSecret) {
      this.errorMessage = 'Cannot proceed: Payment session is invalid.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    try {
      const paymentIntentResult = await this.stripeService.confirmPayment(this.clientSecret);
      // The confirmPayment method in StripeService already handles the redirect if required.
      // It returns the paymentIntent or throws an error.

      // If redirect: 'if_required' is used and a redirect happens, this part might not be reached immediately.
      // The user would be redirected to an external site (e.g. 3D Secure) and then back to the return_url.
      // The ConfirmationComponent will handle retrieving the PaymentIntent status using the client_secret from the URL.

      if (paymentIntentResult) {
         // If no redirect was needed, or if confirmPayment somehow resolves without redirecting (e.g. error before redirect attempt)
        const handlingResult = await this.stripeService.handlePaymentConfirmation(paymentIntentResult as PaymentIntent);

        if (handlingResult.success) {
          this.router.navigate(['/checkout/confirmation'], { queryParams: { payment_intent_client_secret: this.clientSecret, status: 'succeeded' } });
        } else if (handlingResult.requiresAction) {
          // This case should ideally be handled by Stripe's automatic redirection or by specific UI elements for SCA.
          // If we reach here, it means automatic redirection didn't happen or wasn't sufficient.
          this.errorMessage = `Payment requires further action: ${handlingResult.status}. Please follow any instructions from your bank or try another payment method.`;
          // router.navigate to payment step with an error message?
        } else {
          this.errorMessage = handlingResult.error || 'Payment failed. Please try again.';
        }
      }
      // If paymentIntentResult is null/undefined (e.g. if confirmPayment threw an error handled by StripeService),
      // the error should have been caught by the catch block below.

    } catch (error: any) {
      console.error('Error during payment confirmation:', error);
      this.errorMessage = error.message || 'An unexpected error occurred during payment.';
      // If the error is specific, like card_declined, StripeService.confirmPayment might throw it directly
      // and it can be displayed here.
    } finally {
      this.isLoading = false;
    }
  }

  editShipping(): void {
    this.router.navigate(['/checkout/shipping']);
  }

  editPayment(): void {
    // Clearing the payment element in StripeService might be good here if user goes back
    // this.stripeService.clearPaymentElement();
    // However, PaymentComponent already calls clearPaymentElement in its ngOnInit.
    this.router.navigate(['/checkout/payment']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
