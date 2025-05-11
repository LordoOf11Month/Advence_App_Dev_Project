import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-showcase">
      <h2 class="section-title">Shop by Category</h2>
      
      <!-- Loading state -->
      <div *ngIf="loading" class="flex justify-center items-center py-6">
        <div class="w-10 h-10 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
      
      <!-- Error state -->
      <div *ngIf="error && !loading" class="error-container">
        <p>Unable to load categories. Please try again later.</p>
        <button (click)="loadCategories()" class="retry-button">
          Retry
        </button>
      </div>
      
      <!-- Categories grid -->
      <div *ngIf="!loading && !error && categories.length > 0" class="categories-grid">
        <a 
          *ngFor="let category of categories" 
          [routerLink]="['/category', getCategorySlug(category)]"
          class="category-card"
        >
          <div class="category-image-container">
            <img [src]="category.imageUrl || '/assets/images/placeholder-24.png'" [alt]="category.name" class="category-image" (error)="handleImageError($event)">
          </div>
          <h3 class="category-name">{{category.name}}</h3>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .category-showcase {
      margin-bottom: var(--space-8);
    }
    
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: var(--space-4);
      color: var(--neutral-800);
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: var(--space-4);
    }
    
    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-3);
      border-radius: var(--rounded-md);
      text-decoration: none;
      transition: transform var(--transition-fast);
    }
    
    .category-card:hover {
      transform: translateY(-5px);
    }
    
    .category-card:hover .category-name {
      color: var(--primary);
    }
    
    .category-image-container {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: var(--space-3);
      border: 2px solid var(--neutral-200);
      transition: border-color var(--transition-fast);
    }
    
    .category-card:hover .category-image-container {
      border-color: var(--primary-light);
    }
    
    .category-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-fast);
    }
    
    .category-card:hover .category-image {
      transform: scale(1.05);
    }
    
    .category-name {
      font-size: 1rem;
      font-weight: 500;
      color: var(--neutral-800);
      text-align: center;
      transition: color var(--transition-fast);
    }
    
    .error-container {
      text-align: center;
      padding: var(--space-6);
      background-color: var(--neutral-100);
      border-radius: var(--rounded-md);
      margin-bottom: var(--space-4);
    }
    
    .error-container p {
      margin-bottom: var(--space-3);
      color: var(--neutral-700);
    }
    
    .retry-button {
      padding: var(--space-2) var(--space-4);
      background-color: var(--primary);
      color: white;
      border-radius: var(--rounded-md);
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .retry-button:hover {
      background-color: var(--primary-dark);
    }
    
    @media (max-width: 992px) {
      .categories-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .categories-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (max-width: 576px) {
      .categories-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class CategoryShowcaseComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error = false;
  
  // Define the IDs of the important categories we want to display
  // These IDs match our main root categories in the database
  private importantCategoryIds = [1, 31, 46, 68, 75, 100, 120, 123];
  
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}
  
  ngOnInit(): void {
    this.loadCategories();
  }
  
  loadCategories(): void {
    this.loading = true;
    this.error = false;
    
    // Use the CategoryService directly for better control
    this.categoryService.getRootCategories().subscribe({
      next: (categories: Category[]) => {
        console.log('All root categories:', categories);
        
        // Filter to only show the important categories defined above
        // And limit to maximum 5 categories for display
        if (categories && categories.length > 0) {
          // First try to get categories by our predefined IDs
          const importantCategories = this.importantCategoryIds
            .map(id => categories.find((cat: Category) => cat.id === id))
            .filter(cat => cat !== undefined) as Category[];
          
          // If we have at least some important categories, use those
          if (importantCategories.length > 0) {
            this.categories = importantCategories.slice(0, 5);
          } else {
            // Fallback to just taking the first 5 categories
            this.categories = categories.slice(0, 5);
          }
        }
        
        this.loading = false;
        console.log('Displaying categories:', this.categories);
      },
      error: (err: any) => {
        console.error('Error loading categories:', err);
        this.loading = false;
        this.error = true;
      }
    });
  }
  
  // Handle image loading errors by replacing with placeholder
  handleImageError(event: any) {
    event.target.src = '/assets/images/placeholder-24.png';
  }

  getCategorySlug(category: any): string {
    if (category.slug) {
      return category.slug;
    }
    if (category.name) {
      return category.name.toLowerCase().replace(/ /g, '-');
    }
    return 'all';
  }
}
