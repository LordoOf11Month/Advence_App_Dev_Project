import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, switchMap, map } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Order, OrderSummary, PaymentMethod, ShippingAddress } from '../models/order.model';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private currentOrderId: string | null = null;
  private shippingAddressSubject = new BehaviorSubject<ShippingAddress | null>(null);
  private paymentMethodSubject = new BehaviorSubject<PaymentMethod | null>(null);
  private orderSummarySubject = new BehaviorSubject<OrderSummary | null>(null);
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private currentUser: any = null;
  
  shippingAddress$ = this.shippingAddressSubject.asObservable();
  paymentMethod$ = this.paymentMethodSubject.asObservable();
  orderSummary$ = this.orderSummarySubject.asObservable();
  orders$ = this.ordersSubject.asObservable();
  
  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {
    // Load orders from localStorage if available
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      this.ordersSubject.next(orders);
    }
    
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Calculate order summary whenever cart changes
    this.cartService.cart$.subscribe(cartItems => {
      if (cartItems.length > 0) {
        const subtotal = this.calculateSubtotal(cartItems);
        const shipping = this.calculateShipping(subtotal);
        const discount = this.calculateDiscount(subtotal);
        const tax = this.calculateTax(subtotal - discount);
        const total = subtotal + shipping + tax - discount;
        
        this.orderSummarySubject.next({
          subtotal,
          shipping,
          discount,
          tax,
          total
        });
      } else {
        this.orderSummarySubject.next(null);
      }
    });
  }
  
  private calculateSubtotal(cartItems: any[]): number {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }
  
  private calculateShipping(subtotal: number): number {
    // Free shipping for orders over TRY 300
    return subtotal > 300 ? 0 : 19.99;
  }
  
  private calculateDiscount(subtotal: number): number {
    // Apply any stored discount code here
    const discountCode = localStorage.getItem('discountCode');
    if (discountCode === 'WELCOME10') {
      return subtotal * 0.1; // 10% discount
    }
    return 0;
  }
  
  private calculateTax(amount: number): number {
    // Calculate tax (simplified for demo, normally would be based on location)
    return amount * 0.18; // 18% tax rate (typical VAT in Turkey)
  }
  
  setShippingAddress(address: ShippingAddress): void {
    this.shippingAddressSubject.next(address);
    // Optionally save to local storage if user wants to save it
    if (address.saveAddress) {
      localStorage.setItem('shippingAddress', JSON.stringify(address));
    }
  }
  
  setPaymentMethod(paymentMethod: PaymentMethod): void {
    this.paymentMethodSubject.next(paymentMethod);
    // Optionally save to local storage if user wants to save it
    if (paymentMethod.saveCard && paymentMethod.type === 'credit_card') {
      const securePayment = {
        type: paymentMethod.type,
        cardHolder: paymentMethod.cardHolder,
        // Only save last 4 digits for security
        cardNumber: paymentMethod.cardNumber ? 
          '************' + paymentMethod.cardNumber.slice(-4) : undefined,
        expiryDate: paymentMethod.expiryDate
        // Never save CVV
      };
      localStorage.setItem('paymentMethod', JSON.stringify(securePayment));
    }
  }
  
  getSavedShippingAddress(): ShippingAddress | null {
    const savedAddress = localStorage.getItem('shippingAddress');
    return savedAddress ? JSON.parse(savedAddress) : null;
  }
  
  getSavedPaymentMethod(): Partial<PaymentMethod> | null {
    const savedPayment = localStorage.getItem('paymentMethod');
    return savedPayment ? JSON.parse(savedPayment) : null;
  }
  
  createOrder(): Observable<Order> {
    const shippingAddress = this.shippingAddressSubject.value;
    const paymentMethod = this.paymentMethodSubject.value;
    const orderSummary = this.orderSummarySubject.value;
    
    // Get cart items from the observable instead of direct access
    return this.cartService.cart$.pipe(
      tap(cartItems => {
        if (!cartItems.length || !shippingAddress || !paymentMethod || !orderSummary) {
          throw new Error('Checkout information is incomplete');
        }
      }),
      switchMap(cartItems => {
        // In a real app, this would be a POST request to a backend API
        const order: Order = {
          id: 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          userId: this.currentUser?.id || 'guest',
          items: [...cartItems],
          shippingAddress: shippingAddress!,
          paymentMethod: {
            ...paymentMethod!,
            // Remove sensitive data before storing
            cvv: undefined
          },
          subtotal: orderSummary!.subtotal,
          shipping: orderSummary!.shipping,
          discount: orderSummary!.discount,
          tax: orderSummary!.tax,
          total: orderSummary!.total,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        };
        
        // Save the new order
        this.currentOrderId = order.id;
        
        // Add to orders list
        const currentOrders = this.ordersSubject.value;
        const updatedOrders = [order, ...currentOrders];
        this.ordersSubject.next(updatedOrders);
        
        // Save to localStorage
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        // Clear cart after successful order and return the order
        return this.cartService.clearCart().pipe(
          map(() => order),
          tap(() => {
            // Clear stored discount code
            localStorage.removeItem('discountCode');
          })
        );
      })
    );
  }
  
  getCurrentOrderId(): string | null {
    return this.currentOrderId;
  }
  
  getOrderById(orderId: string): Observable<Order> {
    const orders = this.ordersSubject.value;
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return throwError(() => new Error('Order not found'));
    }
    
    return of(order);
  }
  
  getUserOrders(userId: string): Observable<Order[]> {
    const orders = this.ordersSubject.value;
    return of(orders.filter(order => order.userId === userId));
  }
  
  applyDiscountCode(code: string): Observable<{ success: boolean, discount: number }> {
    // Mock discount code validation
    if (code.toUpperCase() === 'WELCOME10') {
      localStorage.setItem('discountCode', code);
      
      // Recalculate order summary with the discount applied
      const orderSummary = this.orderSummarySubject.value;
      if (orderSummary) {
        const discount = orderSummary.subtotal * 0.1; // 10% discount
        const newSummary = {
          ...orderSummary,
          discount,
          total: orderSummary.subtotal + orderSummary.shipping + orderSummary.tax - discount
        };
        this.orderSummarySubject.next(newSummary);
      }
      
      return of({ success: true, discount: 10 }).pipe(delay(500));
    }
    
    return of({ success: false, discount: 0 }).pipe(delay(500));
  }
} 