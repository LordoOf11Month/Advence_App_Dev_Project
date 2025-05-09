import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompareService } from '../../services/compare.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-compare',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold">Compare Products</h1>
        <button 
          *ngIf="products.length > 0"
          class="flex items-center gap-2 px-4 py-2 bg-white text-neutral-700 border border-neutral-300 rounded-md hover:border-error hover:text-error transition-colors"
          (click)="clearAll()"
        >
          <span class="material-symbols-outlined">delete</span>
          Clear All
        </button>
      </div>
      
      <div *ngIf="products.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
        <span class="material-symbols-outlined text-5xl text-neutral-400 mb-4">compare</span>
        <h2 class="text-xl font-medium mb-2">No Products to Compare</h2>
        <p class="text-neutral-600 mb-6">Add products to comparison by clicking the "Compare" button on product cards.</p>
        <a routerLink="/products" class="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
          Browse Products
        </a>
      </div>
      
      <div *ngIf="products.length > 0" class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="w-full product-comparison-table">
          <thead>
            <tr>
              <th class="attribute-column">Product</th>
              <th *ngFor="let product of products" class="product-column">
                <div class="relative">
                  <button 
                    class="absolute top-0 right-0 p-2 text-neutral-500 hover:text-error"
                    (click)="removeProduct(product.id)"
                  >
                    <span class="material-symbols-outlined">close</span>
                  </button>
                  
                  <div class="product-image-container">
                    <img [src]="product.images[0]" [alt]="product.title" class="product-image">
                  </div>
                  
                  <h3 class="product-title">
                    <a [routerLink]="['/product', product.id]">{{product.title}}</a>
                  </h3>
                  
                  <div class="product-price">
                    <span class="current-price">{{product.price | currency:'TRY':'₺'}}</span>
                    <span class="original-price" *ngIf="product.originalPrice">
                      {{product.originalPrice | currency:'TRY':'₺'}}
                    </span>
                  </div>
                  
                  <div class="product-rating">
                    <div class="stars">
                      <span 
                        *ngFor="let star of [1,2,3,4,5]" 
                        class="material-symbols-outlined"
                        [class.filled]="star <= Math.round(product.rating)"
                      >
                        star
                      </span>
                    </div>
                    <span class="rating-text">{{product.rating}} ({{product.reviewCount}})</span>
                  </div>
                  
                  <a 
                    [routerLink]="['/product', product.id]" 
                    class="view-product-btn"
                  >
                    View Product
                  </a>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr>
              <td class="attribute-name">Brand</td>
              <td *ngFor="let product of products">{{product.brand}}</td>
            </tr>
            
            <tr>
              <td class="attribute-name">Description</td>
              <td *ngFor="let product of products" class="description-cell">
                {{product.description}}
              </td>
            </tr>
            
            <tr>
              <td class="attribute-name">Seller</td>
              <td *ngFor="let product of products">
                <a [routerLink]="['/store', product.sellerId]" class="seller-link">
                  {{product.sellerName}}
                </a>
              </td>
            </tr>
            
            <tr>
              <td class="attribute-name">Shipping</td>
              <td *ngFor="let product of products">
                <div class="shipping-info">
                  <span class="tag" [class.tag-success]="product.freeShipping" [class.tag-neutral]="!product.freeShipping">
                    {{product.freeShipping ? 'Free Shipping' : 'Paid Shipping'}}
                  </span>
                  <span class="tag" [class.tag-warning]="product.fastDelivery" [class.tag-neutral]="!product.fastDelivery">
                    {{product.fastDelivery ? 'Fast Delivery' : 'Standard Delivery'}}
                  </span>
                </div>
              </td>
            </tr>
            
            <tr>
              <td class="attribute-name">Stock Status</td>
              <td *ngFor="let product of products">
                <span class="tag" [class.tag-success]="product.inStock" [class.tag-error]="!product.inStock">
                  {{product.inStock ? 'In Stock' : 'Out of Stock'}}
                </span>
              </td>
            </tr>
            
            <tr>
              <td class="attribute-name">Actions</td>
              <td *ngFor="let product of products">
                <div class="actions-cell">
                  <button 
                    class="add-to-cart-btn"
                    [disabled]="!product.inStock"
                    (click)="addToCart(product)"
                  >
                    Add to Cart
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .product-comparison-table {
      border-collapse: collapse;
      min-width: 100%;
    }
    
    .product-comparison-table th,
    .product-comparison-table td {
      padding: var(--space-4);
      border: 1px solid var(--neutral-200);
    }
    
    .attribute-column {
      width: 180px;
      background-color: var(--neutral-100);
      font-weight: 600;
    }
    
    .product-column {
      min-width: 220px;
      position: relative;
      vertical-align: top;
      padding-top: var(--space-6);
    }
    
    .product-image-container {
      width: 150px;
      height: 150px;
      margin: 0 auto var(--space-3);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-title {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: var(--space-2);
      text-align: center;
    }
    
    .product-title a {
      color: var(--neutral-900);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    
    .product-title a:hover {
      color: var(--primary);
    }
    
    .product-price {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }
    
    .current-price {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--primary);
    }
    
    .original-price {
      font-size: 0.875rem;
      color: var(--neutral-500);
      text-decoration: line-through;
    }
    
    .product-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    
    .stars {
      display: flex;
      margin-bottom: var(--space-1);
    }
    
    .stars .material-symbols-outlined {
      font-size: 1rem;
      color: var(--neutral-300);
    }
    
    .stars .material-symbols-outlined.filled {
      color: var(--warning);
    }
    
    .rating-text {
      font-size: 0.75rem;
      color: var(--neutral-600);
    }
    
    .view-product-btn {
      display: block;
      text-align: center;
      padding: var(--space-2);
      background-color: var(--neutral-100);
      color: var(--neutral-700);
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: all var(--transition-fast);
      margin-bottom: var(--space-3);
    }
    
    .view-product-btn:hover {
      background-color: var(--neutral-200);
      color: var(--neutral-900);
    }
    
    .attribute-name {
      font-weight: 600;
      color: var(--neutral-700);
      background-color: var(--neutral-50);
    }
    
    .description-cell {
      font-size: 0.875rem;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    
    .seller-link {
      color: var(--primary);
      text-decoration: none;
    }
    
    .seller-link:hover {
      text-decoration: underline;
    }
    
    .shipping-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    
    .tag {
      display: inline-block;
      font-size: 0.75rem;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-weight: 500;
    }
    
    .tag-success {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }
    
    .tag-warning {
      background-color: rgba(255, 170, 0, 0.1);
      color: var(--warning);
    }
    
    .tag-error {
      background-color: rgba(231, 76, 60, 0.1);
      color: var(--error);
    }
    
    .tag-neutral {
      background-color: var(--neutral-100);
      color: var(--neutral-600);
    }
    
    .actions-cell {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    
    .add-to-cart-btn {
      width: 100%;
      padding: var(--space-2);
      background-color: var(--primary);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .add-to-cart-btn:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
    
    .add-to-cart-btn:disabled {
      background-color: var(--neutral-200);
      color: var(--neutral-500);
      cursor: not-allowed;
    }
  `]
})
export class ProductCompareComponent implements OnInit {
  products: Product[] = [];
  Math = Math; // To use Math in template
  
  constructor(private compareService: CompareService) {}
  
  ngOnInit(): void {
    this.compareService.getCompareProducts().subscribe(products => {
      this.products = products;
    });
  }
  
  removeProduct(productId: number): void {
    this.compareService.removeFromCompare(productId);
  }
  
  clearAll(): void {
    this.compareService.clearCompare();
  }
  
  addToCart(product: Product): void {
    // This should be implemented to add the product to cart
    // You would need to inject the CartService and use it here
    console.log('Add to cart:', product);
  }
} 