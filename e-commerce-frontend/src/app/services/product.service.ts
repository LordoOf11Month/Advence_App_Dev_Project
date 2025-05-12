import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/customer/products';

  constructor(private http: HttpClient) {}

  getProductsByCategory(slug: string): Observable<Product[]> {
    console.log('Fetching products for category:', slug);
    // Corrected API URL to match the backend CustomerProductController endpoint
    return this.http.get<Product[]>(`${this.apiUrl}/category/${slug}`).pipe(
      tap((products: Product[]) => console.log(`Found ${products.length} products for category ${slug}`)),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching products for category slug ' + slug + ':', error);
        if (error.status === 404) {
          console.log('Category not found:', slug);
        }
        return of([]);
      })
    );
  }
}