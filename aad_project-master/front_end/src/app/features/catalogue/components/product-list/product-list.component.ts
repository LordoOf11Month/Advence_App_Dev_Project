import { CategoryService } from './../../service/category.service';
// features/catalogue/components/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { CompareDialogComponent } from '../compare-dialog/compare-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartService } from '../../../cart/services/cart.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  searchTerm: string = '';
  categoryFilter: string = '';

  // For product comparison feature:
  compareSelection: Product[] = [];
  maxCompareProducts: number = 4; // Allow comparing up to 4 products

  constructor(private productService: ProductService, private dialog: MatDialog,private categoryService: CategoryService,
    private cartService: CartService,
    private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Initially load all products
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.applyFilters();
    });

    this.getCategories();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
    // Alternatively, call productService.searchProducts(term) to get server-filtered results
  }

  onCategorySelected(category: string): void {
    this.categoryFilter = category;
    this.applyFilters();
    // Alternatively, call productService.getProductsByCategory(category) to fetch filtered list
  }

  applyFilters(): void {
    // Simple client-side filtering by search term and category
    this.filteredProducts = this.products.filter(p => {
      const matchesText = this.searchTerm ?
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      const matchesCategory = this.categoryFilter ?
        p.categoryId.toString() === this.categoryFilter : true;
      return matchesText && matchesCategory;
    });
  }

  addToCompare(product: Product): void {
    // Add or remove product from compare selection
    const index = this.compareSelection.findIndex(p => p.id === product.id);
    if (index >= 0) {
      // already in list, remove it
      this.compareSelection.splice(index, 1);
    } else {
      if (this.compareSelection.length < this.maxCompareProducts) {
        this.compareSelection.push(product);
      } else {
        this.notificationService.showError(`You can compare up to ${this.maxCompareProducts} products at once.`);
      }
    }
  }

  isProductInCompare(product: Product): boolean {
    return this.compareSelection.some(p => p.id === product.id);
  }

  clearCompareSelection(): void {
    this.compareSelection = [];
  }

  openCompareDialog(): void {
    if (this.compareSelection.length < 2) {
      this.notificationService.showError('Select at least 2 products to compare.');
      return;
    }

    this.dialog.open(CompareDialogComponent, {
      data: { products: this.compareSelection },
      width: '90%',
      maxWidth: '1200px'
    });
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe(
      (categories: Category[]) => {
        // On success, store the categories
        this.categories = categories;
      },
      (error) => {
        // On error, log the issue (could also show a notification)
        console.error('Failed to load categories:', error);
      }
    );
  }

  /** Adds a product to the cart and shows a success notification */
  onAddToCart(product: Product): void {
    // Call CartService to add the product to the cart
    this.cartService.addItem(product);
    // If addToCart() is synchronous (not returning an observable),
    // simply call it and then trigger the success notification:
    // this.cartService.addToCart(product);
    this.notificationService.showSuccess('Product added to cart!');
  }
}

