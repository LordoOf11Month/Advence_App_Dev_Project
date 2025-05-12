import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Category Test Component</h2>
      
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-2">All Categories</h3>
        <div *ngIf="loading" class="text-gray-500">Loading categories...</div>
        <div *ngIf="error" class="text-red-500">{{ error }}</div>
        <ul *ngIf="categories.length > 0" class="list-disc pl-5">
          <li *ngFor="let category of categories" class="mb-2">
            <div class="font-medium">{{ category.name }}</div>
            <div class="text-sm text-gray-500">
              ID: {{ category.id }} | Slug: {{ category.slug }}
            </div>
            <div *ngIf="category.subcategories && category.subcategories.length > 0" class="pl-4 mt-1">
              <div class="text-sm font-medium">Subcategories:</div>
              <ul class="list-circle pl-5">
                <li *ngFor="let sub of category.subcategories" class="text-sm">
                  {{ sub.name }} ({{ sub.slug }})
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
      
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-2">Root Categories</h3>
        <div *ngIf="loadingRoot" class="text-gray-500">Loading root categories...</div>
        <div *ngIf="errorRoot" class="text-red-500">{{ errorRoot }}</div>
        <ul *ngIf="rootCategories.length > 0" class="list-disc pl-5">
          <li *ngFor="let category of rootCategories" class="mb-2">
            <div class="font-medium">{{ category.name }}</div>
            <div class="text-sm text-gray-500">
              ID: {{ category.id }} | Slug: {{ category.slug }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: []
})
export class CategoryTestComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error: string | null = null;
  
  rootCategories: Category[] = [];
  loadingRoot = true;
  errorRoot: string | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadAllCategories();
    this.loadRootCategories();
  }

  loadAllCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
        console.log('Categories loaded successfully:', data);
      },
      error: (err) => {
        this.error = 'Failed to load categories. ' + (err.message || '');
        this.loading = false;
        console.error('Error loading categories:', err);
      }
    });
  }

  loadRootCategories(): void {
    this.categoryService.getRootCategories().subscribe({
      next: (data) => {
        this.rootCategories = data;
        this.loadingRoot = false;
        console.log('Root categories loaded successfully:', data);
      },
      error: (err) => {
        this.errorRoot = 'Failed to load root categories. ' + (err.message || '');
        this.loadingRoot = false;
        console.error('Error loading root categories:', err);
      }
    });
  }
}
