import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SellerService } from '../../services/seller.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { SellerProfile } from '../../models/auth.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-store-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="container">
      <div class="store-header" *ngIf="seller">
        <div class="store-info">
          <h1>{{seller.storeName}}</h1>
          <p class="store-description">{{seller.storeDescription}}</p>
          <div class="store-stats">
            <div class="stat">
              <span class="material-symbols-outlined">inventory_2</span>
              <span>{{seller.productCount}} Products</span>
            </div>
            <div class="stat">
              <span class="material-symbols-outlined">star</span>
              <span>{{seller.rating.toFixed(1)}} Rating</span>
            </div>
            <div class="stat">
              <span class="material-symbols-outlined">schedule</span>
              <span>Member since {{seller.dateJoined | date}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="store-content">
        <h2>Products</h2>
        
        <div *ngIf="isLoading">
          <app-loading-spinner></app-loading-spinner>
        </div>

        <div *ngIf="!isLoading" class="products-grid">
          <app-product-card
            *ngFor="let product of products"
            [product]="product"
          ></app-product-card>
        </div>

        <div *ngIf="!isLoading && products.length === 0" class="no-products">
          <p>No products available at the moment.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .store-header {
      background-color: var(--white);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
      box-shadow: var(--shadow-sm);
    }

    .store-info h1 {
      font-size: 2rem;
      color: var(--neutral-900);
      margin: 0 0 var(--space-2);
    }

    .store-description {
      color: var(--neutral-600);
      font-size: 1.125rem;
      margin-bottom: var(--space-4);
    }

    .store-stats {
      display: flex;
      gap: var(--space-6);
    }

    .stat {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--neutral-700);
    }

    .stat .material-symbols-outlined {
      color: var(--primary);
    }

    .store-content {
      background-color: var(--white);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
    }

    .store-content h2 {
      font-size: 1.5rem;
      color: var(--neutral-900);
      margin: 0 0 var(--space-6);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--space-4);
    }

    .no-products {
      text-align: center;
      padding: var(--space-8);
      color: var(--neutral-600);
    }

    @media (max-width: 768px) {
      .store-stats {
        flex-direction: column;
        gap: var(--space-3);
      }
    }
  `]
})
export class StorePageComponent implements OnInit {
  seller: SellerProfile | null = null;
  products: Product[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private sellerService: SellerService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const sellerId = params['sellerId'];
      if (sellerId) {
        this.loadSellerInfo(sellerId);
      }
    });
  }

  private loadSellerInfo(sellerId: string): void {
    this.isLoading = true;
    this.sellerService.getSellerProfile(sellerId).subscribe({
      next: (seller) => {
        this.seller = seller;
        this.loadSellerProducts(sellerId);
      },
      error: (error) => {
        console.error('Error loading seller info:', error);
        this.isLoading = false;
      }
    });
  }

  private loadSellerProducts(sellerId: string): void {
    this.sellerService.getSellerProducts(sellerId).subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading seller products:', error);
        this.isLoading = false;
      }
    });
  }
}