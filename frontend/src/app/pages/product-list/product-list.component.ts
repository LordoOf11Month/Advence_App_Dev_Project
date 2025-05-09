import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CompareService } from '../../services/compare.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="container">
      <div class="category-header">
        <h1 class="category-title">{{categoryName}}</h1>
        <div class="breadcrumbs">
          <a href="/">Home</a> / <span>{{categoryName}}</span>
        </div>
      </div>
      
      <div class="product-list-container">
        <aside class="filters-sidebar">
          <div class="filter-section">
            <h3 class="filter-title">Price Range</h3>
            <div class="price-range">
              <input type="range" min="0" max="2000" step="100" [(ngModel)]="priceRange">
              <div class="price-labels">
                <span>₺0</span>
                <span>₺{{priceRange}}</span>
                <span>₺2000+</span>
              </div>
            </div>
          </div>
          
          <div class="filter-section">
            <h3 class="filter-title">Brand</h3>
            <div class="filter-checkbox" *ngFor="let brand of brands">
              <label>
                <input type="checkbox" [value]="brand" [(ngModel)]="selectedBrands[brand]">
                {{brand}}
              </label>
            </div>
          </div>
          
          <div class="filter-section">
            <h3 class="filter-title">Rating</h3>
            <div class="filter-checkbox" *ngFor="let rating of ratings">
              <label>
                <input type="checkbox" [value]="rating" [(ngModel)]="selectedRatings[rating]">
                {{rating}}+ Stars
              </label>
            </div>
          </div>
          
          <div class="filter-section">
            <h3 class="filter-title">Shipping</h3>
            <div class="filter-checkbox">
              <label>
                <input type="checkbox" [(ngModel)]="filterFreeShipping">
                Free Shipping
              </label>
            </div>
            <div class="filter-checkbox">
              <label>
                <input type="checkbox" [(ngModel)]="filterFastDelivery">
                Fast Delivery
              </label>
            </div>
          </div>
          
          <button class="apply-filters-btn" (click)="applyFilters()">Apply Filters</button>
          <button class="clear-filters-btn" (click)="clearFilters()">Clear Filters</button>
        </aside>
        
        <div class="products-grid">
          <div class="sort-options">
            <select [(ngModel)]="sortOption" (change)="sortProducts()">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          
          <div class="results-count">
            Showing {{filteredProducts.length}} results
          </div>
          
          <div class="products-container">
            <div *ngFor="let product of filteredProducts" class="product-item">
              <app-product-card 
                [product]="product"
                (addToCart)="onAddToCart($event)"
                (toggleFavorite)="onToggleFavorite($event)"
                (toggleCompare)="onToggleCompare($event)"
              ></app-product-card>
            </div>
            
            <div *ngIf="filteredProducts.length === 0" class="no-results">
              <div class="no-results-content">
                <span class="material-symbols-outlined">search_off</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <button class="clear-filters-btn" (click)="clearFilters()">Clear All Filters</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-header {
      margin-bottom: var(--space-5);
    }
    
    .category-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: var(--space-2);
    }
    
    .breadcrumbs {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }
    
    .breadcrumbs a {
      color: var(--neutral-600);
      text-decoration: none;
    }
    
    .breadcrumbs a:hover {
      color: var(--primary);
    }
    
    .product-list-container {
      display: flex;
      gap: var(--space-5);
    }
    
    .filters-sidebar {
      flex: 0 0 250px;
      background-color: var(--white);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
      height: fit-content;
    }
    
    .filter-section {
      margin-bottom: var(--space-4);
    }
    
    .filter-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--neutral-800);
    }
    
    .price-range {
      display: flex;
      flex-direction: column;
    }
    
    .price-range input {
      width: 100%;
      margin-bottom: var(--space-2);
    }
    
    .price-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--neutral-700);
    }
    
    .filter-checkbox {
      margin-bottom: var(--space-2);
    }
    
    .filter-checkbox label {
      display: flex;
      align-items: center;
      font-size: 0.9375rem;
      color: var(--neutral-700);
      cursor: pointer;
    }
    
    .filter-checkbox input {
      margin-right: var(--space-2);
    }
    
    .apply-filters-btn {
      width: 100%;
      background-color: var(--primary);
      color: var(--white);
      padding: var(--space-2);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 500;
      margin-bottom: var(--space-2);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .apply-filters-btn:hover {
      background-color: var(--primary-dark);
    }
    
    .clear-filters-btn {
      width: 100%;
      background-color: var(--white);
      color: var(--neutral-700);
      padding: var(--space-2);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .clear-filters-btn:hover {
      background-color: var(--neutral-100);
      color: var(--neutral-800);
    }
    
    .products-grid {
      flex: 1;
    }
    
    .sort-options {
      margin-bottom: var(--space-4);
      display: flex;
      justify-content: flex-end;
    }
    
    .sort-options select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      color: var(--neutral-800);
      background-color: var(--white);
    }
    
    .results-count {
      margin-bottom: var(--space-4);
      font-size: 0.9375rem;
      color: var(--neutral-600);
    }
    
    .products-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
    }
    
    .no-results {
      grid-column: 1 / -1;
      background-color: var(--white);
      border-radius: var(--radius-md);
      padding: var(--space-6);
      text-align: center;
      box-shadow: var(--shadow-sm);
    }
    
    .no-results-content {
      max-width: 300px;
      margin: 0 auto;
    }
    
    .no-results .material-symbols-outlined {
      font-size: 3rem;
      color: var(--neutral-400);
      margin-bottom: var(--space-3);
    }
    
    .no-results h3 {
      font-size: 1.25rem;
      margin-bottom: var(--space-2);
      color: var(--neutral-800);
    }
    
    .no-results p {
      color: var(--neutral-600);
      margin-bottom: var(--space-4);
    }
    
    @media (max-width: 992px) {
      .products-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .product-list-container {
        flex-direction: column;
      }
      
      .filters-sidebar {
        flex: 0 0 auto;
        width: 100%;
        margin-bottom: var(--space-4);
      }
    }
    
    @media (max-width: 576px) {
      .products-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categoryId: string = '';
  categoryName: string = 'All Products';
  
  // Filter states
  priceRange: number = 2000;
  brands: string[] = [];
  selectedBrands: {[key: string]: boolean} = {};
  ratings: number[] = [4, 3, 2, 1];
  selectedRatings: {[key: number]: boolean} = {};
  filterFreeShipping: boolean = false;
  filterFastDelivery: boolean = false;
  
  // Sort option
  sortOption: string = 'featured';
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private compareService: CompareService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoryId = params.get('categoryId') || '';
      
      if (this.categoryId) {
        this.loadProductsByCategory();
        this.setCategoryName();
      } else {
        this.loadAllProducts();
      }
    });
  }
  
  setCategoryName(): void {
    // Convert slug to display name
    this.categoryName = this.categoryId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  loadAllProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.filteredProducts = [...products];
      this.extractBrands();
    });
  }
  
  loadProductsByCategory(): void {
    this.productService.getProductsByCategory(this.categoryId).subscribe(products => {
      this.products = products;
      this.filteredProducts = [...products];
      this.extractBrands();
    });
  }
  
  extractBrands(): void {
    const brandsSet = new Set<string>();
    this.products.forEach(product => brandsSet.add(product.brand));
    this.brands = Array.from(brandsSet);
    
    // Initialize brand filter object
    this.brands.forEach(brand => {
      this.selectedBrands[brand] = false;
    });
  }
  
  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Price filter
      if (product.price > this.priceRange) {
        return false;
      }
      
      // Brand filter
      const selectedBrandsCount = Object.values(this.selectedBrands).filter(value => value).length;
      if (selectedBrandsCount > 0 && !this.selectedBrands[product.brand]) {
        return false;
      }
      
      // Rating filter
      const selectedRatingsCount = Object.entries(this.selectedRatings)
        .filter(([_, value]) => value)
        .length;
        
      if (selectedRatingsCount > 0) {
        const hasSelectedRating = Object.entries(this.selectedRatings)
          .some(([rating, isSelected]) => {
            return isSelected && product.rating >= Number(rating);
          });
          
        if (!hasSelectedRating) {
          return false;
        }
      }
      
      // Shipping filters
      if (this.filterFreeShipping && !product.freeShipping) {
        return false;
      }
      
      if (this.filterFastDelivery && !product.fastDelivery) {
        return false;
      }
      
      return true;
    });
    
    this.sortProducts();
  }
  
  clearFilters(): void {
    this.priceRange = 2000;
    this.brands.forEach(brand => {
      this.selectedBrands[brand] = false;
    });
    this.ratings.forEach(rating => {
      this.selectedRatings[rating] = false;
    });
    this.filterFreeShipping = false;
    this.filterFastDelivery = false;
    this.sortOption = 'featured';
    
    this.filteredProducts = [...this.products];
    this.sortProducts();
  }
  
  sortProducts(): void {
    switch (this.sortOption) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        // Assuming the original order is the featured order
        this.filteredProducts = [...this.filteredProducts];
        break;
    }
  }
  
  onAddToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    // Show toast or notification
  }
  
  onToggleFavorite(productId: number): void {
    // Update the UI immediately
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      this.products[productIndex].isFavorite = !this.products[productIndex].isFavorite;
      this.filteredProducts = [...this.products];
    }
    
    // Call API to update favorite status
    this.productService.toggleFavorite(productId).subscribe();
  }
  
  onToggleCompare(product: Product): void {
    // UI is updated by the product-card component directly
    // This method is primarily for handling parent component logic if needed
    console.log('Product toggled for comparison:', product.id);
  }
}
