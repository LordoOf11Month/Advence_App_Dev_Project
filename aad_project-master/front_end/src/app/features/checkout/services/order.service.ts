import { environment } from './../../../../environments/environment';
// features/checkout/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../../cart/services/cart.service';
import { map } from 'rxjs/operators';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  storeName: string;
  storeId: number;
  imageUrl: string;
}

export interface Order {
  id: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;       // e.g., 'PENDING_PAYMENT', 'PAID', 'SHIPPED', etc.
  shipmentStatus: string; // e.g., 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  shippingAddress?: any; // could be an address object with fields
  userId?: number;
  userEmail: string;
  orderDate: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  createOrder(shippingInfo: any, cartItems: CartItem[]): Observable<Order> {
    // Transform cart items into the structure expected by backend (productId & quantity)
    const orderItems = cartItems.map(it => ({
      productId: it.productId,
      quantity: it.quantity,
      price: it.price
    }));
    const payload = { shippingAddress: shippingInfo, items: orderItems };
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/orders`, payload)
      .pipe(map(response => response.data));
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/orders/${orderId}`)
      .pipe(map(response => response.data));
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders`)
      .pipe(map(response => response.data || []));
  }
}
