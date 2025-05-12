import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { CompareService } from '../../services/compare.service';
import { Product, Category } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, RouterModule],
  template: `
    <div class="container">
      <div class="category-header">
        <h1 class="category-title">{{categoryName}}</h1>
        <div class="breadcrumbs">
          <a routerLink="/">Home</a> / 
          <ng-container *ngIf="parentCategory">
            <a [routerLink]="['/category', parentCategory.slug]" class="text-neutral-600 hover:text-primary">
              {{parentCategory.name}}
            </a> / 
          </ng-container>
          <span>{{categoryName}}</span>
        </div>
      </div>
      
      <!-- Loading state -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
      
      <!-- Error state -->
      <div *ngIf="hasError" class="error-container">
        <div class="error-content">
          <span class="material-symbols-outlined">error</span>
          <h3>Failed to load products</h3>
          <p>There was an error loading the products. Please try again.</p>
          <button class="retry-button" (click)="loadProducts()">Try Again</button>
        </div>
      </div>
      
      <div class="product-list-container" *ngIf="!isLoading && !hasError">
        <aside class="filters-sidebar">
          <!-- Subcategories Section -->
          <ng-container *ngIf="currentCategory">
            <div class="filter-section" *ngIf="currentCategory.subcategories?.length">
              <h3 class="filter-title">Subcategories</h3>
              <div class="subcategories-list">
                <ng-container *ngFor="let subcat of currentCategory.subcategories">
                  <a *ngIf="subcat" 
                     [routerLink]="['/category', subcat.slug]"
                     class="subcategory-link"
                     [class.active]="subcat.slug === currentSlug">
                    {{subcat.name}}
                  </a>
                </ng-container>
              </div>
            </div>
          </ng-container>

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
            <div *ngIf="brands.length === 0" class="empty-filter-message">
              No brands available
            </div>
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
      color: var (--neutral-800);
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
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
    }
    
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--neutral-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .error-container {
      display: flex;
      justify-content: center;
      padding: 4rem 0;
    }
    
    .error-content {
      text-align: center;
      max-width: 400px;
    }
    
    .error-content .material-symbols-outlined {
      font-size: 48px;
      color: var(--error);
      margin-bottom: 1rem;
    }
    
    .error-content h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--neutral-800);
    }
    
    .error-content p {
      color: var(--neutral-600);
      margin-bottom: 1rem;
    }
    
    .retry-button {
      background-color: var(--primary);
      color: var (--white);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      border: none;
      font-weight: 500;
      cursor: pointer;
    }
    
    .retry-button:hover {
      background-color: var(--primary-dark);
    }
    
    .empty-filter-message {
      font-size: 0.875rem;
      color: var(--neutral-500);
      padding: var(--space-2) 0;
    }
    
    .subcategories-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .subcategory-link {
      display: block;
      padding: var(--space-2) var(--space-3);
      color: var(--neutral-700);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
    }

    .subcategory-link:hover {
      background-color: var(--neutral-100);
      color: var(--primary);
    }

    .subcategory-link.active {
      background-color: var(--primary);
      color: var(--white);
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  currentSlug: string = '';
  categoryName: string = 'All Products';
  currentCategory: Category | null = null;
  categories: Category[] = [];
  private _parentCategory: Category | null = null;
  
  get parentCategory(): Category | null {
    return this.currentCategory?.parentCategory || this._parentCategory;
  }
  
  // Loading and error states
  isLoading: boolean = true;
  hasError: boolean = false;
  
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
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private compareService: CompareService
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const paramValue = params['slug']; // This could be a slug or a name
      if (paramValue && paramValue !== 'all') {
        // The paramValue from Angular's ActivatedRoute is already URL-decoded.
        if (this.categoryService.isLikelyCategoryName(paramValue)) {
          this.isLoading = true; // Show loading indicator while fetching by name
          this.hasError = false;
          this.categoryService.getCategoryByName(paramValue).subscribe({
            next: (category) => {
              if (category && category.slug) {
                this.router.navigate(['/category', category.slug], { 
                  replaceUrl: true,
                  // queryParamsHandling: 'preserve' // Optional: if you want to preserve existing query params
                });
                // Navigation will re-trigger ngOnInit or route resolvers, so no need to manually load products here
                // or set isLoading = false.
              } else {
                // Category not found by name, show an appropriate message or redirect to 404
                this.categoryName = `Category '${paramValue}' Not Found`;
                this.currentCategory = null;
                this.products = [];
                this.filteredProducts = [];
                this.isLoading = false;
                this.hasError = true; // Indicate an error state
              }
            },
            error: (err) => {
              console.error(`Error fetching category by name '${paramValue}':`, err);
              this.categoryName = 'Error Loading Category';
              this.currentCategory = null;
              this.products = [];
              this.filteredProducts = [];
              this.isLoading = false;
              this.hasError = true;
            }
          });
        } else {
          // It's likely a slug, proceed with existing logic
          this.currentSlug = paramValue; // Ensure currentSlug is set
          this.handleCategoryParam(paramValue); // This method should handle loading by slug
        }
      } else {
        this.categoryName = 'All Products';
        this.currentSlug = 'all';
        this.loadAllProducts();
      }
    });
  }
  
  private handleCategoryParam(param: string): void {
    this.isLoading = true;
    this.hasError = false;

    if (this.categoryService.isLikelyCategoryName(param)) {
      // It's likely a category name, try to fetch by name
      this.categoryService.getCategoryByName(param).subscribe({
        next: category => {
          if (category && category.slug) {
            // Category found, redirect to the slug-based URL
            // This ensures the URL is canonical and avoids duplicate content issues.
            this.router.navigate(['/category', category.slug], { replaceUrl: true });
            // ngOnInit will be re-triggered with the new slug param, so no need to call loadCategoryAndProducts here directly.
          } else {
            // Category not found by name, or slug is missing
            this.categoryName = `Category '${param}' not found`;
            this.hasError = true;
            this.isLoading = false;
          }
        },
        error: () => {
          this.categoryName = `Error loading category '${param}'`;
          this.hasError = true;
          this.isLoading = false;
        }
      });
    } else {
      // It's likely a slug, proceed as before
      this.currentSlug = param;
      this.loadCategoryAndProducts();
    }
  }

  private loadAllProducts(): void {
    this.isLoading = true;
    this.hasError = false;
    this.currentCategory = null;

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.extractBrands();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading all products:', error);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
  
  private loadCategoryAndProducts(): void {
    if (!this.currentSlug || this.currentSlug === 'all') {
        this.loadAllProducts();
        return;
    }

    this.isLoading = true;
    this.hasError = false;
    this._parentCategory = null;

    // First, get the category by slug from the database
    this.categoryService.getCategoryBySlug(this.currentSlug).subscribe({
      next: (category) => {
        if (!category) {
          this.currentCategory = null;
          this.categoryName = 'All Products';
          this.loadAllProducts();
          return;
        }
        
        this.currentCategory = category;
        this.setCategoryName(category.name);
        
        // Then load products using the category slug from the database
        this.productService.getProductsByCategory(category.slug).subscribe({
          next: (products) => {
            this.products = products;
            this.filteredProducts = products;
            this.extractBrands();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading products:', error);
            this.hasError = true;
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.hasError = true;
        this.isLoading = false;
        // Try to redirect to parent category if available and this was a child category
        this.tryRedirectToParentCategory(this.currentSlug);
      }
    });
  }
  
  private tryRedirectToParentCategory(slug: string): void {
    // If the slug contains hyphens, try the parent category
    const parts = slug.split('-');
    if (parts.length > 1) {
      // Try with the parent category by removing the last segment
      const parentSlug = parts.slice(0, -1).join('-');
      this.router.navigate(['/category', parentSlug]);
    } else {
      // If there's no parent category to try, redirect to all products
      this.router.navigate(['/category', 'all']);
    }
  }
  
  setCategoryName(name: string | undefined): void {
    this.categoryName = name ?? 'All Products';
  }
  
  findCategoryBySlug(slug: string): Category | undefined {
    // First search in top-level categories
    let result = this.categories.find(c => c.slug === slug);
    if (result) return result;
    
    // Then search recursively in subcategories
    for (const category of this.categories) {
      if (category.subcategories) {
        result = this.findSubcategoryBySlug(category.subcategories, slug);
        if (result) return result;
      }
    }
    
    return undefined;
  }
  
  findSubcategoryBySlug(subcategories: Category[], slug: string): Category | undefined {
    for (const subcat of subcategories) {
      if (subcat.slug === slug) return subcat;
      
      if (subcat.subcategories) {
        const result = this.findSubcategoryBySlug(subcat.subcategories, slug);
        if (result) return result;
      }
    }
    
    return undefined;
  }
  
  loadProducts(): void {
    if (!this.currentSlug) {
      this.loadAllProducts();
      return;
    }

    this.productService.getProductsByCategory(this.currentSlug).subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.extractBrands();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.hasError = true;
        this.isLoading = false;
        this.loadAllProducts();
      }
    });
  }
  
  extractBrands(): void {
    const brandsSet = new Set<string>();
    this.products.forEach(product => {
      if (product.brand) {
        brandsSet.add(product.brand);
      }
    });
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
