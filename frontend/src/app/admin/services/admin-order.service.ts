import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define interfaces based on your backend DTOs if possible
// For now, using 'any' for simplicity, but strong typing is recommended
export interface AdminOrderResponse {
  // Define based on what your backend Map<String, Object> for orders returns
  // e.g., content: any[]; totalElements: number; totalPages: number; number: number; size: number;
  [key: string]: any; // Placeholder
}

export interface AdminOrderFilterRequest {
  status?: string;
  search?: string;
  // Add other filter fields as defined in your backend AdminOrderFilterRequest DTO
  [key: string]: any; // Placeholder for other potential filters
}

@Injectable({
  providedIn: 'root' // Or provide in AdminModule if preferred
})
export class AdminOrderService {
  private baseUrl = '/api/admin/orders'; // Adjust if your proxy/API prefix is different

  constructor(private http: HttpClient) { }

  getOrders(filters?: AdminOrderFilterRequest, page: number = 0, size: number = 10): Observable<AdminOrderResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.append(key, filters[key]);
        }
      });
    }

    return this.http.get<AdminOrderResponse>(this.baseUrl, { params });
  }

  // Add other methods like getOrderById, updateOrderStatus, deleteOrder as needed
  // Example for updateOrderStatus (ensure DTO matches backend):
  // updateOrderStatus(orderId: number, statusUpdate: { newStatus: string; reason?: string }): Observable<any> {
  //   return this.http.put(`${this.baseUrl}/${orderId}/status`, statusUpdate);
  // }
}
