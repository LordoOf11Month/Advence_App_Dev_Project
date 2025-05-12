import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="search-results-page">
      <div class="container">
        <div class="search-header">
          <h1>Search Results for "{{searchQuery}}"</h1>
          <p class="results-count" *ngIf="!loading">
            Found {{products.length}} results
          </p>
        </div>

        <!-- Loading state -->
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Searching products...</p>
        </div>

        <!-- Error state -->
        <div *ngIf="error" class="error-state">
          <p>{{error}}</p>
          <button (click)="search()" class="retry-button">Try Again</button>
        </div>

        <!-- No results state -->
        <div *ngIf="!loading && !error && products.length === 0" class="no-results">
          <p>No products found matching "{{searchQuery}}"</p>
          <p class="suggestion">Try different keywords or browse our categories</p>
        </div>

        <!-- Results grid -->
        <div *ngIf="!loading && !error && products.length > 0" class="products-grid">
          <app-product-card
            *ngFor="let product of products"
            [product]="product"
            (addToCart)="onAddToCart($event)"
            (toggleFavorite)="onToggleFavorite($event)"
          ></app-product-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-results-page {
      padding: var(--space-6) 0;
    }

    .search-header {
      margin-bottom: var(--space-6);
    }

    .search-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }

    .results-count {
      color: var(--neutral-600);
      font-size: 0.875rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--neutral-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-state {
      text-align: center;
      padding: var(--space-8);
      background-color: var(--error-light);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
    }

    .error-state p {
      color: var(--error);
      margin-bottom: var(--space-4);
    }

    .retry-button {
      padding: var(--space-2) var(--space-4);
      background-color: var(--error);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .retry-button:hover {
      background-color: var(--error-dark);
    }

    .no-results {
      text-align: center;
      padding: var(--space-8);
      background-color: var(--neutral-100);
      border-radius: var(--radius-md);
    }

    .no-results p {
      color: var(--neutral-700);
      margin-bottom: var(--space-2);
    }

    .no-results .suggestion {
      color: var(--neutral-600);
      font-size: 0.875rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--space-4);
    }

    @media (max-width: 768px) {
      .search-results-page {
        padding: var(--space-4) 0;
      }

      .search-header {
        margin-bottom: var(--space-4);
      }

      .search-header h1 {
        font-size: 1.5rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--space-3);
      }
    }
  `]
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  products: Product[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.search();
      }
    });
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.products = [];

    this.productService.searchProducts(this.searchQuery).subscribe({
      next: (results) => {
        this.products = results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.error = 'Failed to load search results. Please try again.';
        this.loading = false;
      }
    });
  }

  onAddToCart(product: Product): void {
    // Implement add to cart functionality
    console.log('Add to cart:', product);
  }

  onToggleFavorite(productId: number): void {
    // Implement toggle favorite functionality
    console.log('Toggle favorite:', productId);
  }
} 