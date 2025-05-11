import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { AdminProduct } from '../models/admin.model';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Find Products by Seller</h2>
      
      <div class="search-container">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          placeholder="Search by seller name or store name..." 
          class="search-input"
        >
        <button (click)="searchProducts()" class="search-button">Search</button>
      </div>
      
      <div *ngIf="loading" class="loading">
        Loading products...
      </div>
      
      <div *ngIf="error" class="error">
        {{ error }}
      </div>
      
      <div *ngIf="!loading && !error && products.length === 0" class="no-results">
        No products found for this seller
      </div>
      
      <div *ngIf="products.length > 0" class="products-grid">
        <div *ngFor="let product of products" class="product-card">
          <div class="product-image">
            <img [src]="product.imageUrl || 'assets/images/placeholder-product.png'" [alt]="product.title">
          </div>
          <div class="product-info">
            <h3>{{ product.title }}</h3>
            <p class="price">{{ "$" + product.price }}</p>
            <p class="seller"><strong>Seller:</strong> {{ product.sellerName }}</p>
            <p class="status" [class]="product.status">{{ product.status }}</p>
            <p class="stock"><strong>Stock:</strong> {{ product.stock }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: var(--neutral-800);
    }
    
    .search-container {
      display: flex;
      margin-bottom: 2rem;
    }
    
    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--neutral-300);
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .search-button {
      padding: 0.75rem 1.5rem;
      background-color: var(--primary);
      color: white;
      border: none;
      border-radius: 4px;
      margin-left: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .search-button:hover {
      background-color: var(--primary-dark);
    }
    
    .loading, .error, .no-results {
      padding: 2rem;
      text-align: center;
      background-color: var(--neutral-100);
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .error {
      color: var(--error);
      background-color: var(--error-light);
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    .product-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .product-image {
      height: 200px;
      overflow: hidden;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-info {
      padding: 1rem;
    }
    
    .product-info h3 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      color: var(--neutral-800);
    }
    
    .price {
      font-weight: bold;
      font-size: 1.2rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    
    .seller {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    .status.active {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }
    
    .status.inactive {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
    }
    
    .stock {
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .search-container {
        flex-direction: column;
      }
      
      .search-button {
        margin-left: 0;
        margin-top: 0.5rem;
      }
      
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      }
    }
  `]
})
export class SellerProductsComponent implements OnInit {
  searchQuery: string = '';
  products: AdminProduct[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    // Optional: Load some initial products
  }

  searchProducts() {
    if (!this.searchQuery.trim()) {
      this.error = 'Please enter a seller name to search';
      return;
    }

    this.loading = true;
    this.error = null;
    this.products = [];

    this.adminService.findProductsBySeller(this.searchQuery)
      .subscribe({
        next: (products) => {
          this.products = products;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load products: ' + err.message;
          this.loading = false;
        }
      });
  }
} 