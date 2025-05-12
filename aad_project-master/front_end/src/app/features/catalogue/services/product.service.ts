import { environment } from './../../../../environments/environment.development';
// features/catalogue/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  storeId: number;
  categoryId: number;
  storeName?: string;
  categoryName?: string;
  imageUrls?: string[];
  sellerId?: number;    // New field for seller
  sellerName?: string;  // New field for seller's name
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`)
      .pipe(map(response => response.data));
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/products/${productId}`)
      .pipe(map(response => response.data));
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/search`, { params: { keyword } })
      .pipe(map(response => response.data));
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/category/${categoryId}`)
      .pipe(map(response => response.data));
  }
}
