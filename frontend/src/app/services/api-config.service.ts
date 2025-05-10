import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  // Base API URL
  private baseUrl = 'http://localhost:8080/api';
  
  // Public endpoints
  get publicProductsUrl(): string {
    return `${this.baseUrl}/public/products`;
  }
  
  // Get URL for a specific product
  getProductUrl(id: number): string {
    return `${this.publicProductsUrl}/${id}`;
  }
  
  // Get URL for products by category
  getProductsByCategoryUrl(): string {
    return `${this.publicProductsUrl}`;
  }
  
  // Get URL for products by store
  getProductsByStoreUrl(storeId: number): string {
    return `${this.publicProductsUrl}/stores/${storeId}`;
  }
  
  constructor() { }
} 