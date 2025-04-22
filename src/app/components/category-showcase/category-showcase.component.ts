import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-showcase">
      <h2 class="section-title">Shop by Category</h2>
      
      <div class="categories-grid">
        <a 
          *ngFor="let category of categories" 
          [routerLink]="['/category', category.slug]"
          class="category-card"
        >
          <div class="category-image-container">
            <img [src]="category.imageUrl" [alt]="category.name" class="category-image">
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
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: var(--space-4);
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: var(--space-4);
    }
    
    .category-card {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform var(--transition-normal);
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
  
  constructor(private productService: ProductService) {}
  
  ngOnInit(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }
}