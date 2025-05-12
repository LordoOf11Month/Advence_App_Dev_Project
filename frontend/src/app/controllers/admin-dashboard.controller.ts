import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../services/api-config.service';
import { AdminStats, OrderStats, AdminProduct, AdminOrder, AdminUser, AdminSeller } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardController {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.baseUrl = this.apiConfigService.getApiBaseUrl() + '/admin';
  }

  // Dashboard Statistics
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/stats`);
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.baseUrl}/order-stats`);
  }

  // Product Management
  getProducts(): Observable<AdminProduct[]> {
    return this.http.get<AdminProduct[]>(`${this.baseUrl}/products`);
  }

  getProduct(id: string): Observable<AdminProduct> {
    return this.http.get<AdminProduct>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(product: AdminProduct): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(`${this.baseUrl}/products`, product);
  }

  updateProduct(product: AdminProduct): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.baseUrl}/products/${product.id}`, product);
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/products/${id}`);
  }

  approveProduct(id: string, approved: boolean): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.baseUrl}/products/${id}/approve`, { approved });
  }

  updateProductImageDirect(id: string, imageUrl: string): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.baseUrl}/products/${id}/image`, { imageUrl });
  }

  toggleFreeShipping(id: string, freeShipping: boolean): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.baseUrl}/products/${id}/free-shipping`, { freeShipping });
  }

  toggleFastDelivery(id: string, fastDelivery: boolean): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.baseUrl}/products/${id}/fast-delivery`, { fastDelivery });
  }

  // Order Management
  getOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${this.baseUrl}/orders`);
  }

  getOrder(id: string): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`${this.baseUrl}/orders/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.baseUrl}/orders/${id}/status`, { status });
  }

  resolvePaymentIssue(id: string): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.baseUrl}/orders/${id}/resolve-payment`, {});
  }

  resolveOrderIssue(id: string): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.baseUrl}/orders/${id}/resolve-issue`, {});
  }

  // User Management
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`);
  }

  getUser(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/users/${id}`);
  }

  banUser(id: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.baseUrl}/users/${id}/ban`, {});
  }

  unbanUser(id: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.baseUrl}/users/${id}/unban`, {});
  }

  getUserTransactions(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/${id}/transactions`);
  }

  // Seller Management
  getSellers(): Observable<AdminSeller[]> {
    return this.http.get<AdminSeller[]>(`${this.baseUrl}/sellers`);
  }

  getSeller(id: string): Observable<AdminSeller> {
    return this.http.get<AdminSeller>(`${this.baseUrl}/sellers/${id}`);
  }

  approveSeller(id: string, approved: boolean): Observable<AdminSeller> {
    return this.http.put<AdminSeller>(`${this.baseUrl}/sellers/${id}/approve`, { approved });
  }

  updateSellerCommission(id: string, commissionRate: number): Observable<AdminSeller> {
    return this.http.put<AdminSeller>(`${this.baseUrl}/sellers/${id}/commission`, { commissionRate });
  }

  getSellerPerformance(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sellers/${id}/performance`);
  }
}
