import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Order, OrderSummary, PaymentMethod, ShippingAddress, OrderResponse, OrderItem, CreateOrderRequest } from '../models/order.model';
import { Address } from '../models/address.model';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CheckoutService, ShippingAddress as CheckoutShippingAddress } from './checkout.service';

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
  private apiUrl = 'http://localhost:8080/api/orders';
  private isAuthenticated = false;

  shippingAddress$ = this.shippingAddressSubject.asObservable();
  paymentMethod$ = this.paymentMethodSubject.asObservable();
  orderSummary$ = this.orderSummarySubject.asObservable();
  orders$ = this.ordersSubject.asObservable();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private http: HttpClient,
    private checkoutService: CheckoutService
  ) {
    // Get current user and authentication status
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;

      // Load orders if authenticated
      if (this.isAuthenticated) {
        this.loadOrdersFromBackend();
      } else {
        // Reset orders for non-authenticated users
        this.ordersSubject.next([]);
      }
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

  private loadOrdersFromBackend(): void {
    if (!this.isAuthenticated) return;

    this.http.get<any>(this.apiUrl)
      .pipe(
        map(response => {
          // Transform backend response to Order[]
          return Array.isArray(response) ? this.transformOrders(response) : [];
        }),
        tap(orders => {
          this.ordersSubject.next(orders);
        }),
        catchError(error => {
          console.error('Error loading orders from backend:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  private transformOrders(ordersData: any[]): Order[] {
    return ordersData.map(orderData => ({
      id: orderData.id?.toString() || '',
      userId: orderData.customer?.id || this.currentUser?.id || 'guest',
      items: orderData.items?.map((item: any) => ({
        product: {
          id: item.product.id,
          title: item.product.name || item.product.title,
          price: item.priceAtPurchase || item.product.price,
          category: item.product.category?.name || '',
          brand: item.product.brand || '',
          images: item.product.images || ['/assets/images/placeholder-product.svg'],
          description: item.product.description || '',
          rating: item.product.rating || 0,
          reviewCount: item.product.reviewCount || 0,
          inStock: true,
          sellerId: item.product.store?.id || '1',
          sellerName: item.product.store?.name || 'Store',
          discountPercentage: 0,
          originalPrice: item.product.price,
          freeShipping: false,
          fastDelivery: false,
          colors: [],
          sizes: [],
          isFavorite: false,
          variants: []
        },
        quantity: item.quantity,
        color: item.color,
        size: item.size
      })) || [],
      shippingAddress: orderData.shippingAddress,
      paymentMethod: {
        type: 'credit_card', // Default to credit card
        cardHolder: orderData.customer?.firstName + ' ' + orderData.customer?.lastName,
        cardNumber: '************1234', // Masked for security
        expiryDate: '12/25', // Default
        cvv: '',
        saveCard: false
      },
      subtotal: orderData.subtotal || this.calculateSubtotalFromItems(orderData.items),
      shipping: orderData.shipping || 0,
      discount: orderData.discount || 0,
      tax: orderData.tax || (orderData.subtotal * 0.18), // Estimate tax if not provided
      total: orderData.total || this.calculateTotalFromItems(orderData.items),
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
      updatedAt: orderData.updatedAt ? new Date(orderData.updatedAt) : new Date(),
      estimatedDelivery: orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }));
  }

  private calculateSubtotalFromItems(items: any[]): number {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      return total + ((item.priceAtPurchase || item.product.price) * item.quantity);
    }, 0);
  }

  private calculateTotalFromItems(items: any[]): number {
    const subtotal = this.calculateSubtotalFromItems(items);
    return subtotal + (subtotal * 0.18); // Add estimated tax
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
    return 0; // No discounts for now
  }

  private calculateTax(amount: number): number {
    // Calculate tax (simplified for demo, normally would be based on location)
    return amount * 0.18; // 18% tax rate (typical VAT in Turkey)
  }

  setShippingAddress(address: ShippingAddress): void {
    this.shippingAddressSubject.next(address);
  }

  setPaymentMethod(paymentMethod: PaymentMethod): void {
    this.paymentMethodSubject.next(paymentMethod);
  }

  getSavedShippingAddress(): ShippingAddress | null {
    return null; // No longer saved to localStorage
  }

  getSavedPaymentMethod(): Partial<PaymentMethod> | null {
    return null; // No longer saved to localStorage
  }

  getCreateOrderRequest(): CreateOrderRequest {
    // Get shipping address from CheckoutService (this is CheckoutShippingAddress - flat structure)
    const currentCheckoutShippingAddress = this.checkoutService.getShippingAddress();
    const cartItems = this.cartService.getCartItems();

    // Perform a more robust check for a valid shipping address and its required fields
    if (!currentCheckoutShippingAddress ||
        !currentCheckoutShippingAddress.addressLine1 || // Corresponds to backend 'street'
        !currentCheckoutShippingAddress.city ||
        !currentCheckoutShippingAddress.state ||
        !currentCheckoutShippingAddress.country ||
        !currentCheckoutShippingAddress.postalCode // Corresponds to backend 'zipCode'
        // Add !currentCheckoutShippingAddress.name if 'name' is also critical for the address object
       ) {
      console.error('Shipping address from CheckoutService is incomplete or not available. Cannot construct valid order request.');
      // This error should be caught by the calling component (e.g., PaymentComponent or the component initiating the order)
      // and ideally prompt the user to return to the shipping step.
      throw new Error('Shipping address is incomplete or missing. Please complete all required shipping details.');
    }

    // If we reach here, currentCheckoutShippingAddress and its critical fields are considered present.
    const orderRequestPayload = {
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
        stripePaymentIntentId: null,
        stripeChargeId: null
      })),
      shippingAddress: {
        id: currentCheckoutShippingAddress.id ?? undefined, // No '?' needed after the check above
        street: currentCheckoutShippingAddress.addressLine1,    // No '|| ''' needed
        city: currentCheckoutShippingAddress.city,
        state: currentCheckoutShippingAddress.state,
        country: currentCheckoutShippingAddress.country,
        zipCode: currentCheckoutShippingAddress.postalCode,
        isDefault: false, // Assuming not applicable or default
        // name: currentCheckoutShippingAddress.name, // Include if 'name' is part of your backend Address and needed
      }
    };
    console.log('OrderService: getCreateOrderRequest payload:', orderRequestPayload);
    return orderRequestPayload;
  }

  createPaymentIntent(createOrderRequest: CreateOrderRequest): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>('http://localhost:8080/api/orders/create-payment-intent', createOrderRequest);
  }

  createOrder(createOrderRequest: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>('http://localhost:8080/api/orders', createOrderRequest);
  }

  getCurrentOrderId(): string | null {
    return this.currentOrderId;
  }

  getOrderById(orderId: string): Observable<Order> {
    if (!this.isAuthenticated) {
      return throwError(() => new Error('Authentication required to view order details'));
    }

    // If the ID starts with "order-", it's a frontend-generated ID
    if (orderId.startsWith('order-')) {
      // Refresh from backend and see if we can find the order
      return this.orders$.pipe(
        map(orders => {
          const order = orders.find(o => o.id === orderId);
          if (!order) {
            throw new Error('Order not found');
          }
          return order;
        })
      );
    }

    // If it's a numeric ID, try to get it from the backend
    return this.http.get<any>(`${this.apiUrl}/${orderId}`)
      .pipe(
        map(orderData => {
          if (!Array.isArray(orderData)) {
            return this.transformOrders([orderData])[0];
          }
          return this.transformOrders(orderData)[0];
        }),
        catchError(error => {
          console.error(`Error fetching order ${orderId}:`, error);
          return throwError(() => error);
        })
      );
  }

  getUserOrders(): Observable<Order[]> {
    if (!this.isAuthenticated) {
      return of([]); // Return empty array for non-authenticated users
    }

    // For authenticated users, return current orders or refresh
    if (this.ordersSubject.value.length === 0) {
      this.loadOrdersFromBackend();
    }
    return this.orders$;
  }

  cancelOrder(orderId: string): Observable<boolean> {
    if (!this.isAuthenticated) {
      return throwError(() => new Error('Authentication required to cancel an order'));
    }

    // If the ID starts with "order-", it was likely just created and not yet saved in backend
    if (orderId.startsWith('order-')) {
      // Refresh order list instead
      this.loadOrdersFromBackend();
      return of(true);
    }

    // Try to cancel it on the backend
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`)
      .pipe(
        map(() => true),
        tap(() => this.loadOrdersFromBackend()),
        catchError(error => {
          console.error(`Error cancelling order ${orderId}:`, error);
          return throwError(() => error);
        })
      );
  }

  applyDiscountCode(code: string): Observable<{ success: boolean, discount: number }> {
    // Directly return no discount
    return of({ success: false, discount: 0 }).pipe(delay(500));
  }
}
