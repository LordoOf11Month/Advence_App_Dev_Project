import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of, throwError } from 'rxjs';
import { CartItem, Product } from '../models/product.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'api/cart';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  cart$: Observable<CartItem[]> = this.cartSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadCart();
  }
  
  private loadCart(): void {
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in. Cannot load cart.');
      this.cartSubject.next([]);
      return;
    }

    console.log('Loading cart for authenticated user...');
    
    const headers = this.getAuthHeaders();
    
    this.http.get<CartItem[]>(this.apiUrl, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error loading cart:', error);
          if (error.status === 401 || error.status === 403) {
            console.log('Authentication error when loading cart. Redirecting to login.');
            this.handleAuthError();
          }
          return of([]);
        })
      )
      .subscribe(cartItems => {
        console.log('Cart loaded successfully:', cartItems);
        this.cartSubject.next(cartItems);
      });
  }
  
  addToCart(product: Product, quantity: number = 1, size?: string, color?: string): Observable<CartItem> {
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in. Cannot add to cart.');
      this.router.navigate(['/login']);
      return throwError(() => new Error('Authentication required'));
    }
    
    const cartItemDTO = {
      productId: product.id,
      quantity,
      size,
      color
    };
    
    console.log('Adding to cart:', cartItemDTO);
    
    const headers = this.getAuthHeaders();
    
    return this.http.post<CartItem>(`${this.apiUrl}/add`, cartItemDTO, { headers })
      .pipe(
        tap((response) => {
          console.log('Product successfully added to cart:', response);
          this.loadCart();
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error adding product to cart:', error);
          if (error.status === 401 || error.status === 403) {
            this.handleAuthError();
          } else if (error.status === 400) {
            console.log('Invalid product data provided');
          }
          throw error;
        })
      );
  }
  
  removeFromCart(cartItemId: number): Observable<void> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('Authentication required'));
    }
    
    const headers = this.getAuthHeaders();
    
    return this.http.delete<void>(`${this.apiUrl}/remove/${cartItemId}`, { headers })
      .pipe(
        tap(() => this.loadCart()),
        catchError((error: HttpErrorResponse) => {
          console.error('Error removing item from cart:', error);
          if (error.status === 401 || error.status === 403) {
            this.handleAuthError();
          }
          throw error;
        })
      );
  }
  
  updateQuantity(cartItemId: number, quantity: number): Observable<CartItem> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('Authentication required'));
    }
    
    const headers = this.getAuthHeaders();
    
    return this.http.put<CartItem>(`${this.apiUrl}/update/${cartItemId}?quantity=${quantity}`, {}, { headers })
      .pipe(
        tap(() => this.loadCart()),
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating cart item quantity:', error);
          if (error.status === 401 || error.status === 403) {
            this.handleAuthError();
          }
          throw error;
        })
      );
  }
  
  clearCart(): Observable<void> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('Authentication required'));
    }
    
    const headers = this.getAuthHeaders();
    
    return this.http.delete<void>(`${this.apiUrl}/clear`, { headers })
      .pipe(
        tap(() => this.loadCart()),
        catchError((error: HttpErrorResponse) => {
          console.error('Error clearing cart:', error);
          if (error.status === 401 || error.status === 403) {
            this.handleAuthError();
          }
          throw error;
        })
      );
  }
  
  getCartTotal(): number {
    const cartItems = this.cartSubject.getValue();
    return cartItems.reduce(
      (total, item) => total + (item.product.price * item.quantity), 
      0
    );
  }
  
  getCartCount(): number {
    const cartItems = this.cartSubject.getValue();
    return cartItems.reduce(
      (count, item) => count + item.quantity, 
      0
    );
  }
  
  getCartItems(): CartItem[] {
    return this.cartSubject.getValue();
  }
  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  private handleAuthError(): void {
    console.log('Authentication error. Redirecting to login.');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
