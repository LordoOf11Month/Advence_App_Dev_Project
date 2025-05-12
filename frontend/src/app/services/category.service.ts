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
  private apiUrl = `${environment.apiUrl}/public/categories`;
  private categoriesCache$: Observable<Category[]> | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Get all categories with subcategories
   */
  getAllCategories(): Observable<Category[]> {
    if (this.categoriesCache$) {
      return this.categoriesCache$;
    }
    this.categoriesCache$ = this.http.get<Category[]>(this.apiUrl).pipe(
      tap(categories => console.log('Fetched categories:', categories)),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return throwError(() => error);
      }),
      shareReplay(1)
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
   * Get a specific category by name
   */
  getCategoryByName(name: string): Observable<Category> {
    const encodedName = encodeURIComponent(name);
    return this.http.get<Category>(`${this.apiUrl}/by-name/${encodedName}`).pipe(
      tap(category => console.log(`Fetched category with name '${name}':`, category)),
      catchError(error => {
        console.error(`Error fetching category with name '${name}':`, error);
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
   * Check if a given string is likely a category name rather than a slug.
   * This helps decide whether to call getCategoryByName or getCategoryBySlug.
   * @param param The URL parameter string (expected to be URL-decoded by Angular Router).
   */
  isLikelyCategoryName(param: string): boolean {
    if (!param) return false; // Handle null or empty string

    // If it contains spaces, it's very likely a name that needs to be looked up.
    // e.g., "Living Room Furniture"
    if (param.includes(' ')) {
      return true;
    }

    // Regex for typical slugs:
    // - Starts with alphanumeric
    // - Can have hyphens between alphanumeric parts
    // - Optionally ends with '-<digits>' (e.g., 'some-slug-123')
    // - Case-insensitive matching for the pattern itself, though slugs are often lowercase.
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*(-\d+)?$/i;

    // If it does NOT contain spaces AND it does NOT match the typical slug pattern,
    // it might be a single-word category name (e.g., "Electronics", "Books").
    if (!slugPattern.test(param)) {
      return true;
    }

    // Otherwise (it has no spaces and matches slugPattern), assume it's a slug.
    return false;
  }

  /**
   * Clear the categories cache
   */
  clearCache(): void {
    this.categoriesCache$ = null;
  }
}
