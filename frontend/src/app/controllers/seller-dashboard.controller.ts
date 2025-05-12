import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SellerDashboardController {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.baseUrl = this.apiConfigService.getApiBaseUrl() + '/seller';
  }

  // Dashboard Statistics
  getSellerStats(sellerId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sellerId}/stats`);
  }

  getSellerOrderStats(sellerId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sellerId}/order-stats`);
  }

  // Product Management
  getSellerProducts(sellerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${sellerId}/products`);
  }

  getSellerProduct(sellerId: string, productId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sellerId}/products/${productId}`);
  }

  createSellerProduct(sellerId: string, product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sellerId}/products`, product);
  }

  updateSellerProduct(sellerId: string, product: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sellerId}/products/${product.id}`, product);
  }

  deleteSellerProduct(sellerId: string, productId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${sellerId}/products/${productId}`);
  }

  updateProductImage(sellerId: string, productId: string, imageUrl: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sellerId}/products/${productId}/image`, { imageUrl });
  }

  // Order Management
  getSellerOrders(sellerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${sellerId}/orders`);
  }

  getSellerOrder(sellerId: string, orderId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sellerId}/orders/${orderId}`);
  }

  updateSellerOrderStatus(sellerId: string, orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sellerId}/orders/${orderId}/status`, { status });
  }

  // Inventory Management
  updateInventory(sellerId: string, productId: string, quantity: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sellerId}/inventory/${productId}`, { quantity });
  }

  bulkUpdateInventory(sellerId: string, updates: { productId: string, quantity: number }[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sellerId}/inventory/bulk`, { updates });
  }

  // Sales and Revenue
  getSellerRevenue(sellerId: string, period: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sellerId}/revenue?period=${period}`);
  }

  getSellerSalesReport(sellerId: string, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sellerId}/sales-report?startDate=${startDate}&endDate=${endDate}`);
  }

  // Promotions and Discounts
  getSellerPromotions(sellerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${sellerId}/promotions`);
  }

  createSellerPromotion(sellerId: string, promotion: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sellerId}/promotions`, promotion);
  }

  updateSellerPromotion(sellerId: string, promotionId: string, promotion: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sellerId}/promotions/${promotionId}`, promotion);
  }

  deleteSellerPromotion(sellerId: string, promotionId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${sellerId}/promotions/${promotionId}`);
  }

  // Profile Management
  getSellerProfile(sellerId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sellerId}/profile`);
  }

  updateSellerProfile(sellerId: string, profile: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sellerId}/profile`, profile);
  }

  updateStoreSettings(sellerId: string, settings: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sellerId}/store-settings`, settings);
  }

  // Reviews and Ratings
  getSellerReviews(sellerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${sellerId}/reviews`);
  }

  respondToReview(sellerId: string, reviewId: string, response: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sellerId}/reviews/${reviewId}/respond`, { response });
  }

  getSellerRatingAnalytics(sellerId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sellerId}/rating-analytics`);
  }
}
