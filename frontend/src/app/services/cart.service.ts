import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  cart$: Observable<CartItem[]> = this.cartSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Try to load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next([...this.cartItems]);
    }
  }
  
  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
  }
  
  addToCart(product: Product, quantity: number = 1, size?: string, color?: string): void {
    const existingItem = this.cartItems.find(
      item => item.product.id === product.id && 
              item.size === size && 
              item.color === color
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity, size, color });
    }
    
    this.saveCart();
  }
  
  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
    this.saveCart();
  }
  
  updateQuantity(index: number, quantity: number): void {
    if (index >= 0 && index < this.cartItems.length) {
      this.cartItems[index].quantity = quantity;
      this.saveCart();
    }
  }
  
  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }
  
  getCartTotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + (item.product.price * item.quantity), 
      0
    );
  }
  
  getCartCount(): number {
    return this.cartItems.reduce(
      (count, item) => count + item.quantity, 
      0
    );
  }
  
  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }
}
