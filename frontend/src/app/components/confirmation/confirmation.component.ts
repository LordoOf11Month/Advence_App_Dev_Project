import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../services/stripe.service';
import { CheckoutService } from '../../services/checkout.service';
import { PaymentIntent } from '@stripe/stripe-js';
import { Subscription, of, from } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  isLoading = true;
  paymentStatus: string | null = null; // e.g., 'succeeded', 'requires_action', 'failed'
  errorMessage: string | null = null;
  paymentIntentId: string | null = null;
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private stripeService: StripeService,
    private checkoutService: CheckoutService,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.checkoutService.setCurrentStep('confirmation');
    this.isLoading = true;
    this.errorMessage = null;
    this.paymentStatus = null;

    const paramsSub = this.route.queryParamMap.pipe(
      switchMap(params => {
        const clientSecret = params.get('payment_intent_client_secret');
        this.paymentIntentId = params.get('payment_intent'); // Also capture raw payment_intent_id if available
        const redirectStatus = params.get('redirect_status');

        if (!clientSecret) {
          this.errorMessage = 'Payment details not found. Unable to confirm order status.';
          this.isLoading = false;
          return of(null);
        }
        // If clientSecret is present, store it as it might be the one from Stripe redirect
        if (clientSecret && !this.paymentIntentId) {
            // Assuming clientSecret from URL is related to the paymentIntentId for display
            // Stripe's client_secret usually contains the PI ID.
            // Example: pi_1J...._secret_...., so we can extract pi_1J...
             const match = clientSecret.match(/^(pi_[^_]+)_secret_.*/);
             if (match) {
                this.paymentIntentId = match[1];
             }
        }

        return from(this.stripeService.retrievePaymentIntent(clientSecret)).pipe(
          tap(intent => {
            if (intent && !this.paymentIntentId) this.paymentIntentId = intent.id;
          }),
          catchError(err => {
            console.error('Error retrieving payment intent:', err);
            this.errorMessage = 'Could not retrieve payment details to confirm status.';
            this.isLoading = false;
            return of(null);
          })
        );
      }),
      switchMap(paymentIntent => {
        if (!paymentIntent) {
          if (!this.errorMessage) this.errorMessage = 'Failed to process payment confirmation (PI null).';
          this.isLoading = false;
          return of({ success: false, error: this.errorMessage, status: 'failed', requiresAction: false });
        }
        this.paymentStatus = paymentIntent.status; // Set status based on retrieved PI

        // Check if paymentIntent is already succeeded
        if (paymentIntent.status === 'succeeded') {
          // Payment already succeeded, proceed to create order
          return of({ success: true, status: paymentIntent.status, requiresAction: false, error: null });
        }

        // If not succeeded, but requires action or other states, handle via handlePaymentConfirmation
        // This part might be redundant if retrievePaymentIntent already gives the final status.
        // However, handlePaymentConfirmation might perform additional client-side interpretations or logging.
        return from(this.stripeService.handlePaymentConfirmation(paymentIntent as PaymentIntent)).pipe(
            catchError(err => {
                console.error('Error handling payment confirmation:', err);
                // Ensure this.errorMessage is set if not already.
                this.errorMessage = this.errorMessage || 'Error processing final payment status.';
                this.paymentStatus = 'failed';
                this.isLoading = false;
                return of({ success: false, error: this.errorMessage, status: 'failed', requiresAction: false });
            })
        );
      }),
      switchMap(paymentResult => {
        this.isLoading = false; // Stop loading indicator once payment processing is done.

        if (paymentResult && paymentResult.success) {
          this.paymentStatus = 'succeeded'; // Ensure status is updated
          this.errorMessage = null;

          // Payment successful, now create the order in the backend
          try {
            const orderPayload = this.orderService.getCreateOrderRequest();
            if (!orderPayload.shippingAddress.street && !orderPayload.shippingAddress.id) { // Basic check for address
                 console.warn('ConfirmationComponent: Shipping address details are missing in order payload. Order creation might fail or be incomplete.');
                 // Potentially set an error message and do not proceed, or proceed and let backend validate
                 // For now, we'll proceed.
            }

            return this.orderService.createOrder(orderPayload).pipe(
              tap(orderResponse => {
                console.log('Order created successfully:', orderResponse);
                this.checkoutService.resetCheckout(); // Clear checkout state
                // Potentially clear cart, display order success message with order ID
              }),
              catchError(orderError => {
                console.error('Failed to create order after successful payment:', orderError);
                this.errorMessage = `Payment was successful (PI: ${this.paymentIntentId || 'N/A'}), but we failed to create your order. Please contact support.`;
                // Keep paymentStatus as 'succeeded' but show this critical error.
                return of(null); // Continue the stream, error handled.
              })
            );
          } catch (error) {
            console.error('Error preparing or calling createOrder:', error);
            this.errorMessage = `Payment was successful but order creation failed due to an unexpected error. Please contact support (PI: ${this.paymentIntentId || 'N/A'}).`;
            return of(null);
          }
        } else {
          // Payment failed or requires action
          this.paymentStatus = paymentResult?.status || 'failed';
          this.errorMessage = paymentResult?.error || `Payment ${this.paymentStatus}. Please check your payment method or contact support.`;
          if (paymentResult?.requiresAction) {
            this.errorMessage = `Your payment requires further action (${this.paymentStatus}). Please follow instructions.`;
          }
          return of(null); // Error handled, complete the stream.
        }
      })
    ).subscribe({
      next: (orderCreationResult) => {
        // Final state is set by taps/catches within the pipe. isLoading is already false.
        // If orderCreationResult is null due to an error in createOrder, errorMessage is already set.
        if (orderCreationResult) { // Order creation was successful
            // Additional success UI updates if needed.
        }
      },
      error: (finalError) => {
        // This should ideally not be reached if all errors are caught in the pipe.
        console.error("Unexpected error in confirmation subscription:", finalError);
        this.isLoading = false;
        this.errorMessage = this.errorMessage || "An unexpected error occurred during confirmation.";
        if(!this.paymentStatus) this.paymentStatus = 'failed';
      }
    });
    this.subscriptions.add(paramsSub);
  }

  navigateToShop(): void {
    this.router.navigate(['/']); // Adjust as per your shop's route
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
