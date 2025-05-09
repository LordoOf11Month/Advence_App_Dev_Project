import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CompareService {
  private compareProducts: Product[] = [];
  private compareProductsSubject = new BehaviorSubject<Product[]>([]);

  constructor() { }

  /**
   * Add a product to the comparison list
   * @param product The product to add
   * @returns boolean indicating if product was added
   */
  addToCompare(product: Product): boolean {
    // Don't add duplicates
    if (this.compareProducts.some(p => p.id === product.id)) {
      return false;
    }

    // Limit to 4 products for comparison
    if (this.compareProducts.length >= 4) {
      return false;
    }

    this.compareProducts.push(product);
    this.compareProductsSubject.next([...this.compareProducts]);
    return true;
  }

  /**
   * Remove a product from the comparison list
   * @param productId The ID of product to remove
   */
  removeFromCompare(productId: number): void {
    this.compareProducts = this.compareProducts.filter(p => p.id !== productId);
    this.compareProductsSubject.next([...this.compareProducts]);
  }

  /**
   * Clear all products from comparison
   */
  clearCompare(): void {
    this.compareProducts = [];
    this.compareProductsSubject.next([]);
  }

  /**
   * Get the current comparison list
   * @returns Observable of products being compared
   */
  getCompareProducts(): Observable<Product[]> {
    return this.compareProductsSubject.asObservable();
  }

  /**
   * Check if a product is in the comparison list
   * @param productId The ID of product to check
   * @returns boolean indicating if product is in comparison list
   */
  isInCompare(productId: number): boolean {
    return this.compareProducts.some(p => p.id === productId);
  }

  /**
   * Get the number of products in comparison
   * @returns number of products being compared
   */
  getCompareCount(): number {
    return this.compareProducts.length;
  }
} 