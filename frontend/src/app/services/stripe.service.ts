import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// Define the window interface with Stripe
interface WindowWithStripe extends Window {
  Stripe?: (apiKey: string) => any;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<any>;
  private apiUrl = 'http://localhost:8080/api/payments';
  private stripePublicKey = 'pk_test_51RLMRPP5MCwbyxz8kuyF32zIthrkrljhotAaAYXLdnM3owlUYqCk2k4WYdgIpPERpzxEz1dOAGuFee2eRqwtfDye008y3AfLT6'; // Stripe test publishable key

  private stripeInstanceSubject = new BehaviorSubject<any>(null);
  public stripeInstance$ = this.stripeInstanceSubject.asObservable();

  private elementsInstance: any = null;

  constructor(private http: HttpClient) {
    this.stripePromise = this.loadStripe();
  }

  private loadStripe(): Promise<any> {
    return new Promise((resolve, reject) => {
      const windowWithStripe = window as WindowWithStripe;
      if (windowWithStripe.Stripe) {
        resolve(windowWithStripe.Stripe(this.stripePublicKey));
      } else {
        // Add Stripe.js script to the document if not already loaded
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.onload = () => {
          const stripe = (window as WindowWithStripe).Stripe?.(this.stripePublicKey);
          if (stripe) {
            this.stripeInstanceSubject.next(stripe);
            resolve(stripe);
          } else {
            reject(new Error('Stripe initialization failed'));
          }
        };
        script.onerror = (error) => {
          console.error('Error loading Stripe.js', error);
          reject(new Error('Failed to load Stripe.js'));
        };
        document.body.appendChild(script);
      }
    });
  }

  /**
   * Get the Stripe instance
   */
  getStripe(): Observable<any> {
    return from(this.stripePromise);
  }

  /**
   * Initialize Stripe Elements
   */
  initializeElements(clientSecret: string): Promise<any> {
    return this.stripePromise
      .then(stripe => {
        const elements = stripe.elements({ clientSecret });
        this.elementsInstance = elements;
        return { stripe, elements };
      });
  }

  /**
   * Create a payment intent
   */
  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-payment-intent`, { amount, currency })
      .pipe(
        catchError(error => {
          console.error('Error creating payment intent:', error);
          return throwError(() => new Error('Failed to create payment intent'));
        })
      );
  }

  /**
   * Confirm a payment intent
   */
  confirmPayment(paymentIntentId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirm-payment`, { paymentIntentId })
      .pipe(
        catchError(error => {
          console.error('Error confirming payment:', error);
          return throwError(() => new Error('Failed to confirm payment'));
        })
      );
  }

  /**
   * Handle payment with Stripe Elements
   */
  handlePayment(clientSecret: string | null): Observable<any> {
    if (!clientSecret) {
      return throwError(() => new Error('Missing payment client secret'));
    }

    if (!this.elementsInstance) {
      return throwError(() => new Error('Stripe Elements not initialized'));
    }

    return from(this.stripePromise).pipe(
      switchMap(stripe => {
        return from(stripe.confirmPayment({
          elements: this.elementsInstance,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/confirmation`,
          },
        }));
      }),
      map((result: any) => {
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result;
      }),
      catchError(error => {
        console.error('Payment error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Complete payment when returning from Stripe redirect
   */
  completePayment(clientSecret: string): Observable<any> {
    if (!clientSecret || clientSecret.trim() === '') {
      console.error('Invalid client secret provided to completePayment');
      return throwError(() => new Error('Invalid client secret'));
    }

    console.log('Retrieving payment intent with client secret');

    return from(this.stripePromise).pipe(
      switchMap(stripe => {
        if (!stripe) {
          throw new Error('Stripe not initialized');
        }
        return from(stripe.retrievePaymentIntent(clientSecret));
      }),
      map((result: any) => {
        if (result.error) {
          console.error('Error retrieving payment intent:', result.error);
          throw new Error(result.error.message);
        }

        if (!result.paymentIntent) {
          console.error('No payment intent returned from Stripe');
          throw new Error('No payment intent found');
        }

        console.log('Payment intent status:', result.paymentIntent.status);

        // If payment intent is not succeeded, throw appropriate error
        if (result.paymentIntent.status !== 'succeeded') {
          console.error('Payment intent not succeeded. Status:', result.paymentIntent.status);
          throw new Error(`Payment is ${result.paymentIntent.status}. Expected 'succeeded'.`);
        }

        return result.paymentIntent;
      }),
      catchError(error => {
        console.error('Error completing payment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Clear payment element references
   */
  clearPaymentElement(): void {
    this.elementsInstance = null;
  }
}
