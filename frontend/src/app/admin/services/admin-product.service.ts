import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define interfaces based on your backend DTOs if possible
// For ProductResponse, you likely have one in your models folder
// For now, using 'any' for simplicity, but strong typing is recommended
export interface AdminProductResponse {
  // Define based on how GenericController paginates. Often similar to Spring Page:
  // content: ProductResponse[]; totalElements: number; totalPages: number; number: number; size: number;
  [key: string]: any; // Placeholder
}

// If you have a ProductResponse DTO from your models, you would import and use it:
// import { ProductResponse } from '../../models/product.model'; // Adjust path

@Injectable({
  providedIn: 'root' // Or provide in AdminModule if preferred
})
export class AdminProductService {
  private baseUrl = '/api/admin/products'; // Adjust if your proxy/API prefix is different

  constructor(private http: HttpClient) { }

  getProducts(page: number = 0, size: number = 10): Observable<AdminProductResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // If your GenericController supports other query params for filtering/sorting, add them here
    return this.http.get<AdminProductResponse>(this.baseUrl, { params });
  }

  // Add other methods like getProductById, createProduct, updateProduct, deleteProduct,
  // approveProduct, toggleFreeShipping, etc., as needed.
  // Example for approveProduct:
  // approveProduct(productId: number, approved: boolean): Observable<any> { // Replace 'any' with ProductResponse
  //   return this.http.put(`${this.baseUrl}/${productId}/approve?approved=${approved}`, {});
  // }
}
