import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Product }     from '../../catalogue/services/product.service';
import { Order }       from '../../checkout/services/order.service';

export interface Store {
  id: number;
  sellerId: number;
  sellerName: string;
  storeName: string;  // Changed from 'name' to match backend
  description: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SellerService {

  private apiUrl = environment.apiUrl;            // http://localhost:8080/api

  constructor(private http: HttpClient) {}

  /* ───────────── stores ───────────── */

  getSellerStores(): Observable<Store[]> {
    return this.http.get<{data: Store[]}>(`${this.apiUrl}/seller/stores`)
      .pipe(
        map(response => {
          console.log('Stores response:', response);
          return response.data;
        })
      );
  }

  /* ───────────── products ──────────── */

  getSellerProducts(): Observable<Product[]> {
    return this.http.get<{data: Product[]}>(`${this.apiUrl}/seller/products`)
      .pipe(map(response => response.data));
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/seller/products/${id}`);
  }

  createProduct(body: any): Observable<Product> {
    return this.http.post<{data: Product}>(`${this.apiUrl}/seller/products`, body)
      .pipe(map(response => response.data));
  }

  updateProduct(id: number, body: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/seller/products/${id}`, body);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/seller/products/${id}`);
  }

  getAllCategories(): Observable<{[k: string]: any}[]> {
    return this.http.get<{data: {[k: string]: any}[]}>(`${this.apiUrl}/categories`)
      .pipe(map(response => response.data));
  }

  /* ───────────── orders ───────────── */

  getSellerOrders(): Observable<Order[]> {
    return this.http.get<{data: Order[]}>(`${this.apiUrl}/seller/orders`)
      .pipe(map(response => response.data || []));
  }

  markOrderShipped(orderId: number, body: any): Observable<Order> {
    return this.http.put<{data: Order}>(`${this.apiUrl}/seller/orders/${orderId}/ship`, body)
      .pipe(map(response => response.data));
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<{data: Order}>(`${this.apiUrl}/seller/orders/${orderId}/status`, { status })
      .pipe(map(response => response.data));
  }

  cancelOrder(orderId: number): Observable<Order> {
    return this.http.put<{data: Order}>(`${this.apiUrl}/seller/orders/${orderId}/cancel`, {})
      .pipe(map(response => response.data));
  }

  /* ───────────── analytics ─────────── */

  /**
   * If <code>period</code> is omitted we ask the backend for the full history.
   * Accepts: daily / weekly / monthly / yearly (backend is tolerant).
   */
  getSalesStats(period?: string): Observable<{[k: string]: any}> {
    const opts = period ? { params: new HttpParams().set('period', period) } : {};
    return this.http.get<{[k: string]: any}>(`${this.apiUrl}/seller/stats`, opts);
  }
}
