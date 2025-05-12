// features/orders/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../catalogue/services/product.service';
import { CartItem } from '../../cart/services/cart.service';

export interface OrderItem {
  id?: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  orderNumber?: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  shippingAddress?: any;
  paymentMethod?: string;
}

export interface CreateOrderRequest {
  addressId?: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  createOrder(shippingInfo: any, cartItems: CartItem[]): Observable<any> {
    const orderData: CreateOrderRequest = {
      ...(shippingInfo.addressId ? { addressId: shippingInfo.addressId } : { address: shippingInfo.address }),
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/orders`, orderData)
      .pipe(map(response => response.data));
  }

  // Get current user's orders
  getUserOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  // Get specific order details
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${orderId}`)
      .pipe(map(response => response.data));
  }

  // Create a new order


  // Cancel an order
  cancelOrder(orderId: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${orderId}/cancel`, {})
      .pipe(
        map(response => {
          this.notificationService.showSuccess('Order cancelled successfully');
          return response.data;
        })
      );
  }

  // For sellers to get their orders
  getSellerOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/seller/all`)
      .pipe(map(response => response.data));
  }

  // For admins to get all orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/admin/all`)
      .pipe(map(response => response.data));
  }

  // Update order status (for sellers and admins)
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/${orderId}/status`, null, {
      params: { status }
    })
    .pipe(
      map(response => response.data),
      map(order => {
        this.notificationService.showSuccess(`Order status updated to ${status}`);
        return order;
      })
    );
  }
}
