import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeElement, PaymentIntent } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise = loadStripe(environment.stripe.publishableKey);
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private stripeInitialized = new BehaviorSubject<boolean>(false);
  private paymentElement: StripeElement | null = null;

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.stripe = await this.stripePromise;
      if (this.stripe) {
        this.stripeInitialized.next(true);
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.stripeInitialized.next(false);
    }
  }

  getStripe(): Observable<Stripe | null> {
    return from(this.stripePromise);
  }

  async createPaymentElement(clientSecret: string): Promise<StripeElement> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      // Create elements instance if it doesn't exist
      if (!this.elements) {
        this.elements = this.stripe.elements({
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#007bff',
              colorBackground: '#ffffff',
              colorText: '#333333',
              colorDanger: '#dc3545',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              spacingUnit: '4px',
              borderRadius: '4px'
            }
          }
        });
      }

      // Create and return the payment element
      this.paymentElement = this.elements.create('payment');
      return this.paymentElement;
    } catch (error) {
      console.error('Error creating payment element:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret: string): Promise<any> {
    if (!this.stripe || !this.elements) {
      throw new Error('Stripe not initialized');
    }

    try {
      const { paymentIntent, error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        throw error;
      }

      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  async retrievePaymentIntent(clientSecret: string): Promise<PaymentIntent | null> {
    if (!this.stripe) {
      await this.initializeStripe();
      if (!this.stripe) {
        console.error('Stripe failed to initialize before retrieving PaymentIntent.');
        throw new Error('Stripe not initialized after attempting re-initialization.');
      }
    }
    try {
      const { paymentIntent, error } = await this.stripe.retrievePaymentIntent(clientSecret);
      if (error) {
        console.error('Error retrieving PaymentIntent:', error);
        throw error;
      }
      return paymentIntent || null;
    } catch (error) {
      console.error('Exception during retrievePaymentIntent:', error);
      throw error;
    }
  }

  async handlePaymentConfirmation(paymentIntent: PaymentIntent): Promise<{ success: boolean; requiresAction: boolean; status: string; error?: string }> {
    if (!paymentIntent) {
      console.error('handlePaymentConfirmation called with no payment intent.');
      throw new Error('No payment intent provided');
    }

    const status = paymentIntent.status;
    switch (status) {
      case 'succeeded':
        return { success: true, requiresAction: false, status };
      case 'requires_action':
      case 'requires_confirmation':
        return { success: false, requiresAction: true, status };
      case 'requires_payment_method':
        return { success: false, requiresAction: true, status, error: paymentIntent.last_payment_error?.message || 'Payment method failed. Please try another.' };
      case 'processing':
        return { success: false, requiresAction: false, status, error: 'Payment is processing. We will update you shortly.' };
      case 'canceled':
        return { success: false, requiresAction: false, status, error: paymentIntent.last_payment_error?.message || 'Payment was canceled.' };
      default:
        console.warn(`Unhandled payment status in handlePaymentConfirmation: ${status}`);
        return { success: false, requiresAction: false, status, error: `Unhandled payment status: ${status}` };
    }
  }

  isStripeInitialized(): Observable<boolean> {
    return this.stripeInitialized.asObservable();
  }

  clearPaymentElement() {
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
    this.elements = null;
  }
}
