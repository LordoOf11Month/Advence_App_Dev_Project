import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompareService } from '../../services/compare.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-compare-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="compare-bar" *ngIf="products.length > 0" [class.expanded]="isExpanded">
      <div class="compare-bar-header" (click)="toggleExpand()">
        <div class="compare-bar-title">
          <span class="material-symbols-outlined">compare</span>
          Compare Products ({{products.length}})
        </div>
        <div class="compare-bar-actions">
          <button class="clear-btn" (click)="clearAll($event)">
            <span class="material-symbols-outlined">delete</span>
          </button>
          <button class="toggle-btn">
            <span class="material-symbols-outlined">
              {{isExpanded ? 'expand_more' : 'expand_less'}}
            </span>
          </button>
        </div>
      </div>
      
      <div class="compare-bar-content" *ngIf="isExpanded">
        <div class="products-list">
          <div class="product-item" *ngFor="let product of products">
            <div class="product-image-container">
              <img [src]="product.images[0]" [alt]="product.title" class="product-image">
              <button class="remove-btn" (click)="removeProduct(product.id, $event)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="product-title">{{product.title}}</div>
            <div class="product-price">{{product.price | currency:'TRY':'₺'}}</div>
          </div>
          
          <div class="empty-slot" *ngFor="let slot of emptySlots">
            <div class="empty-slot-content">
              <span class="material-symbols-outlined">add</span>
              <span class="empty-slot-text">Add Product</span>
            </div>
          </div>
        </div>
        
        <div class="compare-bar-footer">
          <a 
            [routerLink]="['/compare']" 
            class="compare-btn"
            [class.disabled]="products.length < 2"
            [attr.disabled]="products.length < 2 ? true : null"
          >
            Compare Now
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .compare-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: var(--white);
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      z-index: 100;
      border-top: 1px solid var(--neutral-200);
    }
    
    .compare-bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
      cursor: pointer;
    }
    
    .compare-bar-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 500;
    }
    
    .compare-bar-actions {
      display: flex;
      gap: var(--space-2);
    }
    
    .clear-btn, .toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--neutral-600);
      transition: color var(--transition-fast);
    }
    
    .clear-btn:hover {
      color: var(--error);
    }
    
    .toggle-btn:hover {
      color: var(--primary);
    }
    
    .compare-bar-content {
      padding: var(--space-4);
      max-height: 300px;
      overflow-y: auto;
    }
    
    .products-list {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    
    .product-item, .empty-slot {
      flex: 1;
      max-width: 180px;
      min-width: 120px;
    }
    
    .product-image-container {
      position: relative;
      width: 100%;
      height: 120px;
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: var(--space-2);
    }
    
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .remove-btn {
      position: absolute;
      top: var(--space-1);
      right: var(--space-1);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--white);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.75rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      color: var(--neutral-700);
      transition: all var(--transition-fast);
    }
    
    .remove-btn:hover {
      background-color: var(--error);
      color: var(--white);
    }
    
    .product-title {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: var(--space-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .product-price {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary);
    }
    
    .empty-slot {
      border: 2px dashed var(--neutral-300);
      border-radius: var(--radius-md);
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--neutral-500);
    }
    
    .empty-slot-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
    }
    
    .empty-slot-text {
      font-size: 0.75rem;
    }
    
    .compare-bar-footer {
      display: flex;
      justify-content: center;
    }
    
    .compare-btn {
      padding: var(--space-2) var(--space-6);
      background-color: var(--primary);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: background-color var(--transition-fast);
      text-align: center;
    }
    
    .compare-btn:hover:not(.disabled) {
      background-color: var(--primary-dark);
    }
    
    .compare-btn.disabled {
      background-color: var(--neutral-300);
      cursor: not-allowed;
    }
  `]
})
export class CompareBarComponent implements OnInit {
  products: Product[] = [];
  isExpanded: boolean = false;
  
  constructor(private compareService: CompareService) {}
  
  ngOnInit(): void {
    this.compareService.getCompareProducts().subscribe(products => {
      this.products = products;
    });
  }
  
  get emptySlots(): number[] {
    // Create array representing empty slots (max 4 products)
    return Array(Math.max(0, 4 - this.products.length)).fill(0);
  }
  
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  removeProduct(productId: number, event: Event): void {
    event.stopPropagation();
    this.compareService.removeFromCompare(productId);
  }
  
  clearAll(event: Event): void {
    event.stopPropagation();
    this.compareService.clearCompare();
  }
} 