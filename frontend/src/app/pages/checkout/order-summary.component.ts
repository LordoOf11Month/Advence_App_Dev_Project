import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { OrderSummary } from '../../models/order.model';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-summary">
      <h2 class="summary-title">Order Summary</h2>
      
      <div class="summary-items">
        <div class="summary-item" *ngFor="let item of cartItems">
          <div class="item-info">
            <div class="item-name">{{item.product.title}} <span class="item-quantity">x{{item.quantity}}</span></div>
            <div class="item-variants" *ngIf="item.color || item.size">
              <span *ngIf="item.color">{{item.color}}</span>
              <span *ngIf="item.size">{{item.size}}</span>
            </div>
          </div>
          <div class="item-price">{{item.product.price * item.quantity | currency:'TRY':'₺'}}</div>
        </div>
      </div>
      
      <div class="summary-divider"></div>
      
      <div class="summary-details" *ngIf="orderSummary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>{{orderSummary.subtotal | currency:'TRY':'₺'}}</span>
        </div>
        
        <div class="summary-row">
          <span>Shipping</span>
          <span>{{orderSummary.shipping | currency:'TRY':'₺'}}</span>
        </div>
        
        <div class="summary-row" *ngIf="orderSummary.discount > 0">
          <span>Discount</span>
          <span>-{{orderSummary.discount | currency:'TRY':'₺'}}</span>
        </div>
        
        <div class="summary-row">
          <span>Tax (18%)</span>
          <span>{{orderSummary.tax | currency:'TRY':'₺'}}</span>
        </div>
        
        <div class="summary-divider"></div>
        
        <div class="summary-row total">
          <span>Total</span>
          <span>{{orderSummary.total | currency:'TRY':'₺'}}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-summary {
      background-color: var(--white);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
    }
    
    .summary-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .summary-items {
      margin-bottom: var(--space-4);
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-100);
    }
    
    .item-info {
      flex: 1;
      padding-right: var(--space-2);
    }
    
    .item-name {
      font-size: 0.9375rem;
      color: var(--neutral-800);
    }
    
    .item-quantity {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-left: var(--space-1);
    }
    
    .item-variants {
      font-size: 0.8125rem;
      color: var(--neutral-600);
      margin-top: var(--space-1);
    }
    
    .item-variants span:not(:last-child)::after {
      content: ", ";
      margin-right: var(--space-1);
    }
    
    .item-price {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--neutral-800);
      white-space: nowrap;
    }
    
    .summary-divider {
      height: 1px;
      background-color: var(--neutral-200);
      margin: var(--space-3) 0;
    }
    
    .summary-details {
      margin-top: var(--space-3);
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
      font-size: 0.9375rem;
      color: var(--neutral-700);
    }
    
    .summary-row.total {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--neutral-900);
    }
  `]
})
export class OrderSummaryComponent implements OnInit {
  cartItems: CartItem[] = [];
  orderSummary: OrderSummary | null = null;
  
  constructor(
    private orderService: OrderService,
    private cartService: CartService
  ) {}
  
  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
    
    this.orderService.orderSummary$.subscribe(summary => {
      this.orderSummary = summary;
    });
  }
} 