// features/cart/services/cart.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Product } from '../../catalogue/services/product.service';
import { environment } from '../../../../environments/environment.development';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/cart`;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadCart();
  }

  private loadCart(): void {
    if (!this.isBrowser) {
      return; // Don't load cart on server
    }

    if (this.authService.isLoggedIn()) {
      // If logged in, fetch from API and don't use local storage
      this.fetchCartFromApi();
      // Clear any local storage cart to prevent duplication
      localStorage.removeItem('cart-items');
    } else {
      // If not logged in, load from local storage
      const saved = localStorage.getItem('cart-items');
      if (saved) {
        this.itemsSubject.next(JSON.parse(saved));
      }
    }
  }

  private fetchCartFromApi(): void {
    this.http.get<ApiResponse<CartItem[]>>(`${this.apiUrl}`)
      .pipe(
        map(res => res.data ?? []),
        map(apiItems =>
          apiItems.map<CartItem>(i => ({
            id: i.id,
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            imageUrl: i.imageUrl,
            quantity: i.quantity
          }))
        ),
        tap(items => {
          // Just update the state, don't save to localStorage when logged in
          this.itemsSubject.next(items);

          // Only store in localStorage if not logged in (for backup)
          if (!this.authService.isLoggedIn()) {
            localStorage.setItem('cart-items', JSON.stringify(items));
          }
        })
      )
      .subscribe({
        error: err => {
          console.error(err);
          this.notificationService.showError('Cart could not be loaded');
        }
      });
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getCartCount(): Observable<number> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/count`)
      .pipe(map(response => response.data.count));
  }

  addItem(product: Product, quantity: number = 1): void {
    if (!this.isBrowser) return;

    if (this.authService.isLoggedIn()) {
      this.http.post<ApiResponse<CartItem>>(`${this.apiUrl}/add`, null, {
        params: { productId: product.id.toString(), quantity: quantity.toString() }
      })
      .pipe(map(response => response.data))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Item added to cart');
          this.fetchCartFromApi();
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          this.notificationService.showError('Failed to add item to cart');
        }
      });
    } else {
      const items = [...this.itemsSubject.value];
      const idx = items.findIndex(it => it.productId === product.id);

      if (idx >= 0) {
        items[idx].quantity += quantity;
      } else {
        items.push({
          id: Date.now(), // Temporary ID for local storage
          productId: product.id,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrls?.[0],
          quantity
        });
      }

      this.updateLocalCart(items);
      this.notificationService.showSuccess('Item added to cart');
    }
  }

  removeItem(cartItemId: number): void {
    if (!this.isBrowser) return;

    if (this.authService.isLoggedIn()) {
      // Using cart item ID in the URL
      this.http.delete<ApiResponse<null>>(`${this.apiUrl}/items/${cartItemId}`)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Item removed from cart');
            this.fetchCartFromApi();
          },
          error: (err) => {
            console.error('Error removing item:', err);
            // If it's a 404 error, the item is already gone, so treat it as a success
            if (err.status === 404) {
              this.notificationService.showInfo('Item was already removed');
              this.fetchCartFromApi(); // Refresh the cart to ensure UI is in sync
            } else {
              this.notificationService.showError('Failed to remove item');
            }
          }
        });
    } else {
      // For local storage, we still need to find by product.id
      let items = this.itemsSubject.value;
      items = items.filter(it => it.id !== cartItemId);
      this.updateLocalCart(items);
      this.notificationService.showSuccess('Item removed from cart');
    }
  }

  updateQuantity(cartItemId: number, quantity: number): void {
    if (!this.isBrowser) return;

    if (quantity <= 0) {
      this.removeItem(cartItemId);
      return;
    }

    if (this.authService.isLoggedIn()) {
      // Using cart item ID in the URL
      this.http.put<ApiResponse<CartItem>>(`${this.apiUrl}/items/${cartItemId}`, { quantity })
        .pipe(map(response => response.data))
        .subscribe({
          next: () => {
            this.fetchCartFromApi();
            this.notificationService.showSuccess('Cart updated');
          },
          error: (err) => {
            console.error('Error updating cart:', err);
            this.notificationService.showError('Failed to update cart');
          }
        });
    } else {
      // For local storage, update using cart item ID
      const items = [...this.itemsSubject.value];
      const idx = items.findIndex(it => it.id === cartItemId);
      if (idx >= 0) {
        items[idx].quantity = quantity;
        this.updateLocalCart(items);
      }
    }
  }

  clearCart(): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    if (this.authService.isLoggedIn()) {
      // If logged in, use API
      this.http.delete<ApiResponse<null>>(`${this.apiUrl}/clear`)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Cart cleared');
            this.itemsSubject.next([]);
          },
          error: (err) => {
            this.notificationService.showError('Failed to clear cart');
            console.error('Error clearing cart:', err);
          }
        });
    } else {
      // If not logged in, clear local storage
      this.updateLocalCart([]);
      this.notificationService.showSuccess('Cart cleared');
    }
  }

  private updateLocalCart(items: CartItem[]): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    this.itemsSubject.next(items);
    localStorage.setItem('cart-items', JSON.stringify(items));
  }

  // Method to merge local cart with user's server cart on login
  mergeWithServerCart(): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    const localCart = JSON.parse(localStorage.getItem('cart-items') || '[]');

    if (localCart.length > 0) {
      // First, fetch the current server cart
      this.http.get<ApiResponse<CartItem[]>>(`${this.apiUrl}`)
        .pipe(
          map(res => res.data ?? [])
        )
        .subscribe(serverCartItems => {
          // Create a map of product IDs that are already in the server cart
          const existingProductIds = new Set(serverCartItems.map(item => item.productId));

          // Process each local item
          const processItem = (index: number) => {
            if (index >= localCart.length) {
              // All items processed, clear local storage and fetch updated cart
              localStorage.removeItem('cart-items');
              this.fetchCartFromApi();
              return;
            }

            const item = localCart[index];

            // Check if the product is already in the server cart
            if (existingProductIds.has(item.productId)) {
              // Skip this item and move to the next
              processItem(index + 1);
              return;
            }

            // Add the item to the server cart
            const product: Product = {
              id: item.productId,
              name: item.productName,
              price: item.price,
              imageUrls: item.imageUrl ? [item.imageUrl] : [],
              description: '', // Default description
              stockQuantity: 0, // Default stock quantity
              storeId: 0,       // Default store id
              categoryId: 0     // Default category id
            };

            this.http.post<ApiResponse<CartItem>>(`${this.apiUrl}/add`, null, {
              params: {
                productId: product.id.toString(),
                quantity: item.quantity.toString()
              }
            }).subscribe({
              next: () => {
                // Process next item
                processItem(index + 1);
              },
              error: () => {
                // On error, still try to process the next item
                processItem(index + 1);
              }
            });
          };

          // Start processing items
          processItem(0);
        });
    } else {
      // No local items to merge, just fetch the server cart
      this.fetchCartFromApi();
    }
  }
}


