import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Order, OrderSummary, PaymentMethod, ShippingAddress } from '../models/order.model';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient
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
          images: item.product.images || ['https://via.placeholder.com/300'],
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
  
  createOrder(): Observable<Order> {
    const cartItems = this.cartService.getCartItems();
    const shippingAddress = this.shippingAddressSubject.value;
    const paymentMethod = this.paymentMethodSubject.value;
    const orderSummary = this.orderSummarySubject.value;
    
    if (!cartItems.length || !shippingAddress || !paymentMethod || !orderSummary) {
      return throwError(() => new Error('Checkout information is incomplete'));
    }

    // For unauthorized users, provide a fallback local order creation
    if (!this.isAuthenticated) {
      console.log('User is not authenticated, creating a local order');
      
      const localOrder: Order = {
        id: `order-${Date.now()}`,
        userId: 'guest',
        items: [...cartItems],
        shippingAddress,
        paymentMethod: {
          ...paymentMethod,
          cvv: undefined
        },
        subtotal: orderSummary.subtotal,
        shipping: orderSummary.shipping,
        discount: orderSummary.discount,
        tax: orderSummary.tax,
        total: orderSummary.total,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      
      // Clear cart
      this.cartService.clearCart();
      
      return of(localOrder).pipe(delay(500));
    }

    // Structure the request according to what the backend expects
    const createOrderRequest = {
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      shippingAddress: {
        street: shippingAddress.address1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        isPrimary: true
      },
      paymentMethodId: 'pm_card_visa' 
    };
    
    console.log('Sending order request to backend:', createOrderRequest);
    
    // Include auth headers
    const headers = { 
      'Content-Type': 'application/json'
      // Auth token should be automatically added by an HTTP interceptor
    };
    
    return this.http.post<any>(this.apiUrl, createOrderRequest, { headers })
      .pipe(
        map(response => {
          console.log('Order creation response:', response);
          
          // Handle the response from the backend
          let orderId: string;
          
          if (response.clientSecret) {
            // This is a Stripe payment intent response
            orderId = response.orderId || `order-${Date.now()}`;
            sessionStorage.setItem('currentPaymentIntent', response.clientSecret);
          } else {
            // Regular order response
            orderId = response.id?.toString() || response.orderId || `order-${Date.now()}`;
          }
          
          this.currentOrderId = orderId;
          
          // Create an order object to return
          const order: Order = {
            id: orderId,
            userId: this.currentUser?.id || 'guest',
            items: [...cartItems],
            shippingAddress,
            paymentMethod: {
              ...paymentMethod,
              cvv: undefined
            },
            subtotal: orderSummary.subtotal,
            shipping: orderSummary.shipping,
            discount: orderSummary.discount,
            tax: orderSummary.tax,
            total: orderSummary.total,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          };
          
          // Reload orders from backend
          setTimeout(() => this.loadOrdersFromBackend(), 2000);
          
          return order;
        }),
        tap(() => {
          // Clear cart after successful order
          this.cartService.clearCart();
        }),
        catchError(error => {
          console.error('Error creating order:', error);
          
          // Handle specific error cases
          if (error.status === 401 || error.status === 403) {
            // Authentication issues - create a local order instead
            console.log('Authentication error, falling back to local order');
            const localOrder: Order = {
              id: `order-${Date.now()}`,
              userId: 'guest',
              items: [...cartItems],
              shippingAddress,
              paymentMethod: {
                ...paymentMethod,
                cvv: undefined
              },
              subtotal: orderSummary.subtotal,
              shipping: orderSummary.shipping,
              discount: orderSummary.discount,
              tax: orderSummary.tax,
              total: orderSummary.total,
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
              estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };
            
            // Clear cart
            this.cartService.clearCart();
            
            return of(localOrder);
          }
          
          return throwError(() => error);
        })
      );
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