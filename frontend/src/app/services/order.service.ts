import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap, retry } from 'rxjs/operators';
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
      items: orderData.items?.map((item: any) => {
        // Skip items with missing product data
        if (!item || !item.product) {
          console.warn('Found order item with missing product data:', item);
          return null;
        }

        return {
          product: {
            id: item.product.id || 0,
            title: item.product.name || item.product.title || 'Unknown Product',
            price: item.priceAtPurchase || item.product.price || 0,
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
            originalPrice: item.product.price || 0,
            freeShipping: false,
            fastDelivery: false,
            colors: [],
            sizes: [],
            isFavorite: false,
            variants: []
          },
          quantity: item.quantity || 1,
          color: item.color,
          size: item.size
        };
      }).filter((item: any) => item !== null) || [], // Filter out any null items
      shippingAddress: orderData.shippingAddress,
      paymentMethod: {
        type: 'credit_card', // Default to credit card
        cardHolder: orderData.customer?.firstName + ' ' + orderData.customer?.lastName || 'Card Holder',
        cardNumber: '************1234', // Masked for security
        expiryDate: '12/25', // Default
        cvv: '',
        saveCard: false
      },
      subtotal: orderData.subtotal || this.calculateSubtotalFromItems(orderData.items || []),
      shipping: orderData.shipping || 0,
      discount: orderData.discount || 0,
      tax: orderData.tax || ((orderData.subtotal || 0) * 0.18), // Estimate tax if not provided
      total: orderData.total || this.calculateTotalFromItems(orderData.items || []),
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
      updatedAt: orderData.updatedAt ? new Date(orderData.updatedAt) : new Date(),
      estimatedDelivery: orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }));
  }

  private calculateSubtotalFromItems(items: any[]): number {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item: any) => {
      if (!item || !item.product) return total;
      return total + ((item.priceAtPurchase || item.product.price || 0) * (item.quantity || 1));
    }, 0);
  }

  private calculateTotalFromItems(items: any[]): number {
    const subtotal = this.calculateSubtotalFromItems(items);
    return subtotal + (subtotal * 0.18); // Add estimated tax
  }

  private calculateSubtotal(cartItems: any[]): number {
    return cartItems.reduce((total: number, item: any) => {
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
    const createOrderRequest: any = {
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    // If using a saved address, send the addressId
    if (shippingAddress.addressId) {
      createOrderRequest.shippingAddressId = shippingAddress.addressId;
    } else if (shippingAddress.saveAddress) {
      // If a new address that should be saved, send it as newShippingAddress
      createOrderRequest.newShippingAddress = {
        street: shippingAddress.address1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        zipCode: shippingAddress.postalCode,
        isDefault: false // Default value, can be updated via address management
      };
    } else {
      // If a new address that shouldn't be saved, still send it as newShippingAddress
      createOrderRequest.newShippingAddress = {
        street: shippingAddress.address1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        zipCode: shippingAddress.postalCode,
        isDefault: false
      };
    }

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

          if (response.paymentIntents && response.paymentIntents.length > 0) {
            // This is a Stripe payment intent response
            orderId = response.orderId || `order-${Date.now()}`;

            // Store payment intents in session storage for payment completion
            const paymentIntent = response.paymentIntents[0];
            if (paymentIntent.clientSecret) {
              sessionStorage.setItem('currentPaymentIntent', paymentIntent.clientSecret);
              sessionStorage.setItem('paymentIntentId', paymentIntent.paymentIntentId);
            }
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

          // Clear cart after successful order
          this.cartService.clearCart();

          return order;
        }),
        catchError(error => {
          console.error('Error creating order:', error);
          return throwError(() => new Error(`Failed to create order: ${error.message || 'Unknown error'}`));
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

  /**
   * Get all orders for the current user with improved error handling and retries
   */
  getOrders(): Observable<Order[]> {
    // Log that we're making the request
    console.log('Fetching orders from API endpoint:', this.apiUrl);

    return this.http.get<Order[]>(this.apiUrl)
      .pipe(
        // Add retries for network issues - more retries and exponential backoff
        retry({
          count: 3,
          delay: (error, retryAttempt) => {
            const delayMs = Math.pow(2, retryAttempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`Retry attempt ${retryAttempt} after ${delayMs}ms`);
            return of(null).pipe(delay(delayMs));
          }
        }),
        tap(orders => {
          console.log('Successfully retrieved orders:', orders ? orders.length : 0);

          // Update the cached orders in the BehaviorSubject
          if (orders && orders.length > 0) {
            try {
              // Process the orders to ensure proper date objects
              const processedOrders = orders.map(order => {
                try {
                  return {
                    ...order,
                    createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt || Date.now()),
                    updatedAt: order.updatedAt instanceof Date ? order.updatedAt : new Date(order.updatedAt || Date.now()),
                    estimatedDelivery: order.estimatedDelivery instanceof Date ?
                      order.estimatedDelivery :
                      order.estimatedDelivery ? new Date(order.estimatedDelivery) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  };
                } catch (err) {
                  console.warn('Error processing order, using default values:', err);
                  // Return the order with default dates if there was an error
                  return {
                    ...order,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  };
                }
              });

              // Sort by date (newest first)
              processedOrders.sort((a, b) => {
                try {
                  return b.createdAt.getTime() - a.createdAt.getTime();
                } catch (err) {
                  return 0; // If we can't compare, don't change order
                }
              });

              // Store processed orders in local cache as well for faster recovery
              sessionStorage.setItem('cachedOrders', JSON.stringify(processedOrders));

              this.ordersSubject.next(processedOrders);
            } catch (err) {
              console.error('Error processing orders:', err);
              // Still update with raw data if processing fails
              this.ordersSubject.next(orders);
            }
          }
        }),
        catchError(error => {
          console.error('Error loading orders from backend:', error);

          // Check if we have orders in the behavior subject already
          if (this.ordersSubject.value && this.ordersSubject.value.length > 0) {
            console.log('Returning cached orders as fallback');
            return of(this.ordersSubject.value);
          }

          // Try to get orders from session storage as a deeper fallback
          try {
            const cachedOrders = sessionStorage.getItem('cachedOrders');
            if (cachedOrders) {
              const orders = JSON.parse(cachedOrders);
              console.log('Returning session cached orders as fallback');
              this.ordersSubject.next(orders);
              return of(orders);
            }
          } catch (err) {
            console.warn('Could not retrieve cached orders from session storage:', err);
          }

          // If the error is an authentication issue, we can handle it specially
          if (error?.status === 401 || error?.status === 403) {
            return throwError(() => new Error('Authentication required to view orders. Please log in.'));
          }

          // For server errors, return empty array with console warning
          if (error?.status >= 500) {
            console.warn('Server error when loading orders, returning empty list');
            return of([]);
          }

          return throwError(() => new Error('Could not load orders. Please try again later.'));
        })
      );
  }

  /**
   * Get user orders with improved error handling and caching
   */
  getUserOrders(): Observable<Order[]> {
    if (!this.isAuthenticated) {
      console.log('User not authenticated, returning empty orders array');
      return of([]); // Return empty array for non-authenticated users
    }

    // For authenticated users, try multiple strategies:
    // 1. Use cached orders if available
    // 2. Try to refresh from server
    // 3. Fall back to session storage if server fails

    // First check if we have cached orders
    if (this.ordersSubject.value.length > 0) {
      console.log('Returning cached orders from memory:', this.ordersSubject.value.length);

      // In the background, refresh orders after a delay (don't block UI)
      setTimeout(() => {
        this.refreshOrdersQuietly();
      }, 1000);

      return of(this.ordersSubject.value);
    }

    // If no cached orders in memory, try to restore from session storage first
    try {
      const cachedOrdersJson = sessionStorage.getItem('cachedOrders');
      if (cachedOrdersJson) {
        const cachedOrders = JSON.parse(cachedOrdersJson);
        if (Array.isArray(cachedOrders) && cachedOrders.length > 0) {
          console.log('Restored orders from session storage:', cachedOrders.length);

          // Use cached orders immediately
          this.ordersSubject.next(cachedOrders);

          // Refresh from server in background
          this.refreshOrdersQuietly();

          return of(cachedOrders);
        }
      }
    } catch (err) {
      console.warn('Error reading cached orders from session storage:', err);
    }

    // If no cache available, fetch from server
    console.log('No cached orders found, fetching from server');
    return this.getOrders().pipe(
      retry(2), // Add retry for network issues
      catchError(error => {
        console.error('Error fetching user orders:', error);
        // Return empty array to avoid breaking the UI
        return of([]);
      })
    );
  }

  /**
   * Refresh orders in the background without disrupting the UI
   * @private
   */
  private refreshOrdersQuietly(): void {
    // Only proceed if authenticated
    if (!this.isAuthenticated) return;

    console.log('Refreshing orders in background...');

    this.http.get<Order[]>(this.apiUrl)
      .pipe(
        // Only one quick retry
        retry(1),
        catchError(error => {
          console.warn('Background refresh of orders failed:', error);
          return of(null); // Prevent the error from propagating
        })
      )
      .subscribe(orders => {
        if (orders && orders.length > 0) {
          console.log('Successfully refreshed orders in background');

          try {
            // Process the orders similar to getOrders method
            const processedOrders = orders.map(order => {
              // Process items safely to handle potentially missing product data
              const safeItems = order.items?.map((item: any) => {
                if (!item || !item.product) {
                  console.warn('Found order item with missing product data in background refresh');
                  return null;
                }
                return item;
              }).filter((item: any) => item !== null) || [];

              return {
                ...order,
                items: safeItems,
                createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt || Date.now()),
                updatedAt: order.updatedAt instanceof Date ? order.updatedAt : new Date(order.updatedAt || Date.now()),
                estimatedDelivery: order.estimatedDelivery instanceof Date ?
                  order.estimatedDelivery :
                  order.estimatedDelivery ? new Date(order.estimatedDelivery) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              };
            });

            // Sort by date (newest first)
            processedOrders.sort((a, b) =>
              b.createdAt.getTime() - a.createdAt.getTime()
            );

            // Update cache
            sessionStorage.setItem('cachedOrders', JSON.stringify(processedOrders));
            this.ordersSubject.next(processedOrders);

          } catch (err) {
            console.warn('Error processing refreshed orders:', err);
          }
        }
      });
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

  /**
   * Get an order by payment intent ID
   */
  getOrderByPaymentIntent(paymentIntentId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/by-payment-intent/${paymentIntentId}`)
      .pipe(
        catchError(error => {
          console.error('Error loading order by payment intent:', error);
          return throwError(() => new Error('Could not load order by payment intent ID'));
        })
      );
  }

  /**
   * Request a refund for an order item
   */
  requestRefund(orderId: string, itemId: string, reason: string): Observable<any> {
    if (!this.isAuthenticated) {
      return throwError(() => new Error('Authentication required to request a refund'));
    }

    const refundRequest = {
      orderItemId: itemId,
      reason: reason
    };

    return this.http.post<any>(`${this.apiUrl}/${orderId}/items/${itemId}/refund`, refundRequest)
      .pipe(
        tap(() => {
          // Refresh orders after requesting a refund
          this.loadOrdersFromBackend();
        }),
        catchError(error => {
          console.error(`Error requesting refund for order item ${itemId}:`, error);
          return throwError(() => error);
        })
      );
  }
}
