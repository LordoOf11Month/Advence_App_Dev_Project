import { NotificationService } from './../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: false,  // Keep this false since we're using NgModule
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;

  constructor(
    private cartService: CartService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.items$.subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
      },
      error: (err) => {
        console.error('Error loading cart items:', err);
        this.notify.showError('Failed to load cart items');
      }
    });
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }

  updateQuantity(item: CartItem, newQty: number): void {
    const quantity = parseInt(newQty.toString());
    if (isNaN(quantity) || quantity < 1) {
      this.notify.showError('Invalid quantity');
      return;
    }
    // Use cart item's ID instead of product.id
    this.cartService.updateQuantity(item.id, quantity);
  }

  removeItem(item: CartItem): void {
    // Use cart item's ID instead of product.id
    this.cartService.removeItem(item.id);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
