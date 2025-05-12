import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Stripe,
  StripeCardElement,
  loadStripe,
  StripeElements,
  StripePaymentElement
} from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

interface PaymentIntentResponse {
  clientSecret: string;
  orderId: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn:'root' })
export class PaymentService {
  private stripe: Promise<Stripe | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.stripe = loadStripe(environment.stripePublishableKey);
  }

  createPaymentIntent(orderId: number): Observable<string> {
    return this.http.post<ApiResponse<{clientSecret:string}>>(
      `${this.apiUrl}/payment/create-payment-intent`,
      { orderId }
    ).pipe(map(res => res.data.clientSecret));
  }

  confirmPayment(paymentIntentId: string): Observable<any> {
    console.log(`Sending payment confirmation to backend for paymentIntentId: ${paymentIntentId}`);
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/payment/confirm`,
      { paymentIntentId }
    ).pipe(
      map(res => {
        console.log('Payment confirmation response:', res);
        return res.data;
      })
    );
  }

  ensureTransaction(orderId: number): Observable<any> {
    console.log(`Ensuring transaction exists for order: ${orderId}`);
    return this.http.put<ApiResponse<string>>(
      `${this.apiUrl}/payment/ensure-transaction`,
      { orderId }
    ).pipe(
      map(res => {
        console.log('Ensure transaction response:', res);
        return res.data;
      })
    );
  }

  async getStripe(): Promise<Stripe> {
    const stripe = await this.stripe;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }
    return stripe;
  }

  async createPaymentForm(clientSecret: string, elementId: string): Promise<{ elements: StripeElements, paymentElement: StripePaymentElement }> {
    const stripe = await this.getStripe();

    const elements = stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#5469d4',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
          spacingUnit: '4px',
          borderRadius: '4px'
        }
      }
    });

    const paymentElement = elements.create('payment');
    paymentElement.mount(`#${elementId}`);

    return { elements, paymentElement };
  }

  async handlePaymentSubmission(elements: StripeElements, orderId: number): Promise<{ error?: any, paymentIntent?: any }> {
    const stripe = await this.getStripe();

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
      redirect: 'if_required'
    });

    if (error) {
      console.error('Stripe payment error:', error);
      return { error };
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded, sending confirmation to backend');

      // Notify our backend and explicitly wait for confirmation
      try {
        const confirmResult = await firstValueFrom(this.confirmPayment(paymentIntent.id));
        console.log('Payment confirmation sent successfully:', confirmResult);
      } catch (err) {
        console.error('Error confirming payment with backend:', err);
        // Don't throw - we want to return paymentIntent even if backend confirmation fails
        // The payment was successful with Stripe, so we should continue the checkout flow
      }
    } else if (paymentIntent) {
      console.log('Payment status not succeeded:', paymentIntent.status);
    }

    return { paymentIntent };
  }
}

