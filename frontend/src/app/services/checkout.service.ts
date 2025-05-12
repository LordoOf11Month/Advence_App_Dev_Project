import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ShippingAddress {
  id?: number; // Or string, depending on backend ID type
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // Price per unit
  imageUrl?: string;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private currentStepSubject = new BehaviorSubject<string>('shipping'); // e.g., shipping, payment, review
  private shippingAddressSubject = new BehaviorSubject<ShippingAddress | null>(null);
  private orderItemsSubject = new BehaviorSubject<OrderItem[]>([]);
  private paymentIntentClientSecretSubject = new BehaviorSubject<string | null>(null);
  private orderSummarySubject = new BehaviorSubject<OrderSummary | null>(null);


  currentStep$: Observable<string> = this.currentStepSubject.asObservable();
  shippingAddress$: Observable<ShippingAddress | null> = this.shippingAddressSubject.asObservable();
  orderItems$: Observable<OrderItem[]> = this.orderItemsSubject.asObservable();
  paymentIntentClientSecret$: Observable<string | null> = this.paymentIntentClientSecretSubject.asObservable();
  orderSummary$: Observable<OrderSummary | null> = this.orderSummarySubject.asObservable();

  constructor() {
    // Load initial cart/order items if applicable, e.g., from a cart service
    // this.orderItemsSubject.next(this.cartService.getItems());
    // this.calculateOrderSummary();
  }

  // --- Step Management ---
  setCurrentStep(step: string): void {
    this.currentStepSubject.next(step);
  }

  // --- Shipping ---
  setShippingAddress(address: ShippingAddress): void {
    this.shippingAddressSubject.next(address);
  }

  getShippingAddress(): ShippingAddress | null {
    return this.shippingAddressSubject.getValue();
  }

  // --- Order Items ---
  setOrderItems(items: OrderItem[]): void {
    this.orderItemsSubject.next(items);
    this.calculateOrderSummary();
  }

  getOrderItems(): OrderItem[] {
    return this.orderItemsSubject.getValue();
  }

  // --- Payment Intent ---
  setPaymentIntentClientSecret(clientSecret: string | null): void {
    this.paymentIntentClientSecretSubject.next(clientSecret);
  }

  getPaymentIntentClientSecret(): string | null {
    return this.paymentIntentClientSecretSubject.getValue();
  }

  // --- Order Summary ---
  private calculateOrderSummary(): void {
    const items = this.orderItemsSubject.getValue();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Basic calculation, can be expanded (e.g. dynamic shipping, taxes)
    const shippingCost = subtotal > 0 ? 5.00 : 0; // Example shipping
    const taxRate = 0.10; // Example 10% tax
    const tax = subtotal * taxRate;
    const total = subtotal + shippingCost + tax;

    this.orderSummarySubject.next({ subtotal, shippingCost, tax, total });
  }

  getOrderSummary(): OrderSummary | null {
    return this.orderSummarySubject.getValue();
  }

  // --- Reset ---
  resetCheckout(): void {
    this.currentStepSubject.next('shipping');
    this.shippingAddressSubject.next(null);
    // this.orderItemsSubject.next([]); // Or reload from cart
    this.paymentIntentClientSecretSubject.next(null);
    this.orderSummarySubject.next(null);
    // Potentially clear cart items if order is complete or cancelled
  }
}
