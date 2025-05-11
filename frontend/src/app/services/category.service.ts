import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Category } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/api/public/categories';
  private categoriesCache$: Observable<Category[]> | null = null;
  
  constructor(private http: HttpClient) { }
  
  /**
   * Get all categories with subcategories
   */
  getAllCategories(): Observable<Category[]> {
    // Return cached categories if available
    if (this.categoriesCache$) {
      return this.categoriesCache$;
    }
    
    // Fetch categories from the API
    this.categoriesCache$ = this.http.get<Category[]>(this.apiUrl).pipe(
      tap(categories => console.log('Fetched categories:', categories)),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return throwError(() => error);
      }),
      shareReplay(1) // Cache the result
    );
    
    return this.categoriesCache$;
  }
  
  /**
   * Get only root categories
   */
  getRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/root`).pipe(
      tap(categories => console.log('Fetched root categories:', categories)),
      catchError(error => {
        console.error('Error fetching root categories:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Get a specific category by ID
   */
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`).pipe(
      tap(category => console.log(`Fetched category with ID ${id}:`, category)),
      catchError(error => {
        console.error(`Error fetching category with ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Get a specific category by slug
   */
  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/by-slug/${slug}`).pipe(
      tap(category => console.log(`Fetched category with slug '${slug}':`, category)),
      catchError(error => {
        console.error(`Error fetching category with slug '${slug}':`, error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Get subcategories for a specific category
   */
  getSubcategories(categoryId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/${categoryId}/subcategories`).pipe(
      tap(subcategories => console.log(`Fetched subcategories for category ${categoryId}:`, subcategories)),
      catchError(error => {
        console.error(`Error fetching subcategories for category ${categoryId}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Get categories that have products
   */
  getCategoriesWithProducts(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/with-products`).pipe(
      tap(categories => console.log('Fetched categories with products:', categories)),
      catchError(error => {
        console.error('Error fetching categories with products:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Clear the categories cache
   */
  clearCache(): void {
    this.categoriesCache$ = null;
  }
}
