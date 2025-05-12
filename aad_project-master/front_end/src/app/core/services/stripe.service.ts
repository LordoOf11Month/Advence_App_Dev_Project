import { environment } from './../../../environments/environment';
// front_end/src/app/core/services/payment/stripe.service.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { ApiResponse } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise = loadStripe(environment.stripePublishableKey);

  async pay(orderId: number, amountCents: number) {
    const stripe = await this.stripePromise as Stripe;
    const response = await firstValueFrom(
      this.http.post<{ clientSecret: string }>(
        `${environment.apiUrl}/payment/create-payment-intent`,
        { orderId, amount: amountCents, currency: 'usd' }
      )
    );
    if (!response) {
      throw new Error('Failed to create payment intent');
    }

    const { clientSecret } = response;

    // show Stripe's card element or Payment Sheet
    const { error } = await stripe.confirmPayment({
      elements: stripe.elements({ clientSecret }),
      confirmParams: { return_url: window.location.origin + '/order-success' },
    });
    if (error) { throw error; }
  }

  constructor(private http: HttpClient) {}

  /** 1. OrderID'yi alır, backend'de PaymentIntent üretir */
  createPaymentIntent(orderId: number) {
    return this.http
      .post<ApiResponse<{clientSecret:string}>>(
        `${environment.apiUrl}/payment/create-payment-intent`,
        { orderId }
      )
      .pipe(map(r => r.data.clientSecret));
  }


getStripe() { return this.stripePromise; }


  /** 2. Kart bilgileriyle Stripe'a onay gönderir */
  async confirmWithCard(
    clientSecret: string,
    card: StripeCardElement
  ): Promise<string> {
    console.log('Starting card confirmation process with Stripe...');
    try {
      // Validate card is ready
      if (!card) {
        throw new Error('Card element is not initialized');
      }

      const stripe = (await this.stripePromise) as Stripe;
      if (!stripe) {
        throw new Error('Stripe is not initialized');
      }

      console.log('Confirming card payment with Stripe...');
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });

      if (result.error) {
        console.error('Stripe card confirmation error:', result.error);
        throw result.error;
      }

      if (!result.paymentIntent) {
        throw new Error('Payment confirmation failed - no payment intent returned');
      }

      console.log('Card confirmation successful, intent status:', result.paymentIntent.status);

      // Return the payment intent ID for backend confirmation
      return result.paymentIntent.id;
    } catch (error) {
      console.error('Error in confirmWithCard:', error);
      throw error;
    }
  }
}
