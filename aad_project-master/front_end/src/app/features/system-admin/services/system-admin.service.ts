import { environment } from './../../../../environments/environment.development';
import { Order } from './../../checkout/services/order.service';
import { Product } from './../../catalogue/services/product.service';
// features/system-admin/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  role?: string;  // Single role string from backend
  active?: boolean;
  banned?: boolean; // User's banned status from backend
}
export interface SellerAccount extends UserAccount { companyName?: string; }

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Analytics
  getPlatformStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/admin/stats`)
      .pipe(map(response => response.data));
  }

  // Users management
  getAllUsers(): Observable<UserAccount[]> {
    return this.http.get<ApiResponse<UserAccount[]>>(`${this.apiUrl}/admin/users`)
      .pipe(map(response => response.data));
  }

  getAllCustomers(): Observable<UserAccount[]> {
    return this.http.get<ApiResponse<UserAccount[]>>(`${this.apiUrl}/admin/customers`)
      .pipe(map(response => response.data));
  }

  banUser(userId: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/admin/users/${userId}/ban`, {})
      .pipe(map(response => response.data));
  }
  unbanUser(userId: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/admin/users/${userId}/unban`, {})
      .pipe(map(response => response.data));
  }

  // Sellers management
  getAllSellers(): Observable<SellerAccount[]> {
    return this.http.get<ApiResponse<SellerAccount[]>>(`${this.apiUrl}/admin/sellers`)
      .pipe(map(response => response.data));
  }
  // Possibly admin can create a seller or update seller's info:
  createSeller(accountData: any): Observable<SellerAccount> {
    return this.http.post<ApiResponse<SellerAccount>>(`${this.apiUrl}/admin/sellers`, accountData)
      .pipe(map(response => response.data));
  }
  updateSeller(id: number, accountData: any): Observable<SellerAccount> {
    return this.http.put<ApiResponse<SellerAccount>>(`${this.apiUrl}/admin/sellers/${id}`, accountData)
      .pipe(map(response => response.data));
  }
  // Could also have deleteSeller if needed

  // Orders management
  getAllOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/admin/orders`)
      .pipe(map(response => response.data));
  }
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/admin/orders/${orderId}`, { status })
      .pipe(map(response => response.data));
  }

  updateShipmentStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/admin/orders/${orderId}/shipment`, { status })
      .pipe(map(response => response.data));
  }

  // Payment issues
  getPaymentIssues(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/admin/payment-issues`)
      .pipe(map(response => response.data));
  }
  resolvePaymentIssue(orderId: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/admin/payment-issues/${orderId}/resolve`, {})
      .pipe(map(response => response.data));
  }

  // Product management
  getAllProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/admin/products`)
      .pipe(map(response => response.data));
  }

  removeProduct(productId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/admin/products/${productId}`)
      .pipe(map(response => response.data));
  }
}
