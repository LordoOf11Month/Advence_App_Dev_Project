import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminProduct } from '../../models/admin.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-container">
      <aside class="admin-sidebar">
        <nav class="admin-nav">
          <a routerLink="/admin" routerLinkActive="active">
            <span class="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="active">
            <span class="material-symbols-outlined">inventory_2</span>
            Products
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active">
            <span class="material-symbols-outlined">local_shipping</span>
            Orders
          </a>
          <a routerLink="/admin/users" routerLinkActive="active">
            <span class="material-symbols-outlined">group</span>
            Users
          </a>
        </nav>
      </aside>

      <main class="admin-content">
        <div class="admin-header">
          <h1>Product Management</h1>
          <button class="add-product-btn" (click)="openProductForm()">
            <span class="material-symbols-outlined">add</span>
            Add Product
          </button>
        </div>

        <div class="product-filters">
          <div class="search-bar">
            <span class="material-symbols-outlined">search</span>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (ngModelChange)="filterProducts()"
              placeholder="Search products..."
            >
          </div>

          <select [(ngModel)]="statusFilter" (change)="filterProducts()">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="filterProducts()">
            <option value="title">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="lastUpdated">Sort by Last Updated</option>
          </select>
        </div>

        <div class="products-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of filteredProducts">
                <td>{{product.title}}</td>
                <td>₺{{product.price | number:'1.2-2'}}</td>
                <td [class.low-stock]="product.stock < 10">{{product.stock}}</td>
                <td>
                  <span class="status-badge" [class]="product.status">
                    {{product.status}}
                  </span>
                </td>
                <td>{{product.lastUpdated | date:'medium'}}</td>
                <td class="actions">
                  <button class="action-btn edit" (click)="editProduct(product)">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <a [routerLink]="['/product', product.id]" target="_blank" class="action-btn view">
                    <span class="material-symbols-outlined">visibility</span>
                  </a>
                  <button class="action-btn delete" (click)="deleteProduct(product.id)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Product Form Modal -->
        <div class="modal" *ngIf="showProductForm">
          <div class="modal-content">
            <div class="modal-header">
              <h2>{{editingProduct ? 'Edit Product' : 'Add New Product'}}</h2>
              <button class="close-btn" (click)="closeProductForm()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <form (ngSubmit)="saveProduct()" #productForm="ngForm">
              <div class="form-group">
                <label for="title">Product Title</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title"
                  [(ngModel)]="currentProduct.title"
                  required
                >
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea 
                  id="description" 
                  name="description"
                  [(ngModel)]="currentProduct.description"
                  required
                  rows="3"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="price">Price</label>
                  <input 
                    type="number" 
                    id="price" 
                    name="price"
                    [(ngModel)]="currentProduct.price"
                    required
                    min="0"
                    step="0.01"
                  >
                </div>

                <div class="form-group">
                  <label for="stock">Stock</label>
                  <input 
                    type="number" 
                    id="stock" 
                    name="stock"
                    [(ngModel)]="currentProduct.stock"
                    required
                    min="0"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="imageUrl">Image URL</label>
                <div class="image-url-container">
                  <input 
                    type="text" 
                    id="imageUrl" 
                    name="imageUrl"
                    [(ngModel)]="currentProduct.imageUrl"
                    required
                    placeholder="https://example.com/image.jpg"
                  >
                  <button type="button" class="preview-image-btn" (click)="updateImagePreview()">
                    <span class="material-symbols-outlined">preview</span>
                    Preview
                  </button>
                </div>
                <div class="image-url-actions">
                  <small class="image-url-note">Enter the full URL to the image (including https://)</small>
                  <button type="button" class="save-image-btn" (click)="updateImageOnly()">
                    <span class="material-symbols-outlined">save</span>
                    Save Image Only
                  </button>
                </div>
                <div class="image-preview" *ngIf="currentProduct.imageUrl">
                  <img [src]="currentProduct.imageUrl" alt="Product image preview" class="preview-image">
                  <span class="image-url-loading" *ngIf="currentProduct.imageUrl.includes('?t=')">Loading...</span>
                </div>
              </div>

              <div class="form-group">
                <label for="status">Status</label>
                <select 
                  id="status" 
                  name="status"
                  [(ngModel)]="currentProduct.status"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" class="cancel-btn" (click)="closeProductForm()">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="save-btn"
                  [disabled]="productForm.invalid || saving"
                >
                  {{saving ? 'Saving...' : 'Save Product'}}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: calc(100vh - 140px);
    }

    .admin-sidebar {
      width: 250px;
      background-color: var(--white);
      border-right: 1px solid var(--neutral-200);
      padding: var(--space-4);
    }

    .admin-nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .admin-nav a {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      color: var(--neutral-700);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .admin-nav a:hover {
      background-color: var(--neutral-100);
      color: var(--primary);
    }

    .admin-nav a.active {
      background-color: var(--primary);
      color: var(--white);
    }

    .admin-content {
      flex: 1;
      padding: var(--space-6);
      background-color: var(--neutral-50);
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
    }

    .admin-header h1 {
      font-size: 1.75rem;
      color: var(--neutral-900);
      margin: 0;
    }

    .add-product-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background-color: var(--primary);
      color: var(--white);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      transition: background-color var(--transition-fast);
    }

    .add-product-btn:hover {
      background-color: var(--primary-dark);
    }

    .product-filters {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .search-bar {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background-color: var(--white);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--neutral-200);
    }

    .search-bar input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.9375rem;
    }

    .search-bar .material-symbols-outlined {
      color: var(--neutral-500);
    }

    .product-filters select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      background-color: var(--white);
      color: var(--neutral-700);
      font-size: 0.9375rem;
    }

    .products-table {
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-bottom: 1px solid var(--neutral-200);
    }

    th {
      background-color: var(--neutral-50);
      font-weight: 600;
      color: var(--neutral-700);
    }

    .low-stock {
      color: var(--error);
    }

    .status-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.active {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }

    .status-badge.inactive {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
    }

    .actions {
      display: flex;
      gap: var(--space-2);
    }

    .action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .action-btn.edit {
      background-color: rgba(0, 102, 255, 0.1);
      color: var(--secondary);
    }

    .action-btn.edit:hover {
      background-color: var(--secondary);
      color: var(--white);
    }

    .action-btn.view {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }

    .action-btn.view:hover {
      background-color: var(--success);
      color: var(--white);
    }

    .action-btn.delete {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
    }

    .action-btn.delete:hover {
      background-color: var(--error);
      color: var(--white);
    }

    .image-url-container {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
    }

    .image-url-container input {
      flex: 1;
    }

    .preview-image-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 8px 12px;
      background-color: var(--secondary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .preview-image-btn:hover {
      background-color: var(--secondary-dark);
    }

    .image-preview {
      margin-top: 10px;
      max-width: 100%;
      text-align: center;
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 4px;
    }

    .preview-image {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: var(--white);
      border-radius: var(--radius-md);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }

    .modal-header h2 {
      font-size: 1.25rem;
      margin: 0;
    }

    .close-btn {
      background: none;
      color: var(--neutral-500);
      padding: var(--space-1);
    }

    .close-btn:hover {
      color: var(--neutral-700);
    }

    form {
      padding: var(--space-4);
    }

    .form-group {
      margin-bottom: var(--space-4);
    }

    .form-row {
      display: flex;
      gap: var(--space-4);
    }

    .form-row .form-group {
      flex: 1;
    }

    label {
      display: block;
      font-size: 0.9375rem;
      color: var(--neutral-700);
      margin-bottom: var(--space-2);
    }

    input, select {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
    }

    textarea {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      resize: vertical;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-6);
    }

    .cancel-btn {
      background-color: var(--white);
      color: var(--neutral-700);
      border: 1px solid var(--neutral-300);
    }

    .cancel-btn:hover {
      background-color: var(--neutral-100);
    }

    .save-btn {
      background-color: var(--primary);
      color: var(--white);
    }

    .save-btn:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }

    .save-btn:disabled {
      background-color: var(--neutral-400);
      cursor: not-allowed;
    }

    @media (max-width: 992px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }

    @media (max-width: 768px) {
      .admin-container {
        flex-direction: column;
      }

      .admin-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--neutral-200);
      }

      .admin-nav {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: var(--space-2);
      }

      .admin-nav a {
        flex: 0 0 auto;
      }

      .product-filters {
        flex-direction: column;
      }

      .products-table {
        overflow-x: auto;
      }

      table {
        min-width: 800px;
      }
    }

    .image-url-loading {
      display: inline-block;
      margin-top: 8px;
      font-size: 0.8rem;
      color: var(--secondary);
      background: rgba(0, 102, 255, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }

    .image-url-note {
      display: block;
      font-size: 0.8rem;
      color: var(--neutral-600);
      margin-top: 4px;
      margin-bottom: 8px;
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }

    .image-url-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
      margin-bottom: 8px;
    }

    .save-image-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      background-color: var(--success);
      color: white;
      font-size: 0.8rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .save-image-btn:hover {
      background-color: var(--success-dark, #2e7d32);
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: AdminProduct[] = [];
  filteredProducts: AdminProduct[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'title';
  showProductForm: boolean = false;
  editingProduct: boolean = false;
  saving: boolean = false;

  currentProduct: AdminProduct = {
    id: '',
    title: '',
    price: 0,
    category: '',
    status: 'active',
    inStock: true,
    stock: 0,
    sellerId: '',
    sellerName: '',
    dateAdded: new Date(),
    lastUpdated: new Date()
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getProducts().subscribe(products => {
      this.products = products;
      this.filterProducts();
    });
  }

  filterProducts(): void {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price':
          return a.price - b.price;
        case 'stock':
          return a.stock - b.stock;
        case 'lastUpdated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        default:
          return a.title.localeCompare(b.title);
      }
    });

    this.filteredProducts = filtered;
  }

  openProductForm(): void {
    this.editingProduct = false;
    this.currentProduct = {
      id: '',
      title: '',
      price: 0,
      category: '',
      status: 'active',
      inStock: true,
      stock: 0,
      sellerId: '',
      sellerName: '',
      dateAdded: new Date(),
      lastUpdated: new Date(),
      description: 'Product description',
      imageUrl: 'https://via.placeholder.com/150'
    };
    this.showProductForm = true;
  }

  editProduct(product: AdminProduct): void {
    this.editingProduct = true;
    this.currentProduct = { ...product };
    this.showProductForm = true;
  }

  closeProductForm(): void {
    this.showProductForm = false;
  }

  saveProduct(): void {
    this.saving = true;
    
    // Clean the image URL by removing any timestamp parameters
    if (this.currentProduct && this.currentProduct.imageUrl && this.currentProduct.imageUrl.includes('?')) {
      this.currentProduct.imageUrl = this.currentProduct.imageUrl.split('?')[0];
      console.log('Cleaned image URL for saving:', this.currentProduct.imageUrl);
    }

    if (this.editingProduct) {
      // Keep existing ID when editing
      this.adminService.updateProduct(this.currentProduct).subscribe({
        next: (product) => {
          console.log('Product updated successfully:', product);
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            // Force image refresh by adding timestamp to prevent caching
            if (product.imageUrl) {
              product.imageUrl = product.imageUrl.includes('?') 
                ? product.imageUrl.split('?')[0] + '?t=' + new Date().getTime() 
                : product.imageUrl + '?t=' + new Date().getTime();
            }
            
            // Make sure to update all properties including imageUrl
            this.products[index] = { ...product };
          }
          this.filterProducts();
          this.showProductForm = false;
          this.saving = false;
          
          // Add delay and reload products to ensure the image changes are reflected
          setTimeout(() => {
            this.loadProducts();
          }, 500);
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.saving = false;
        }
      });
    } else {
      // Create new product
      this.adminService.createProduct(this.currentProduct).subscribe({
        next: (product) => {
          console.log('Product created successfully:', product);
          // Force image refresh
          if (product.imageUrl) {
            product.imageUrl = product.imageUrl.includes('?') 
              ? product.imageUrl.split('?')[0] + '?t=' + new Date().getTime() 
              : product.imageUrl + '?t=' + new Date().getTime();
          }
          
          this.products.push(product);
          this.filterProducts();
          this.showProductForm = false;
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.saving = false;
        }
      });
    }
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.adminService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: () => {
          // Handle error
        }
      });
    }
  }

  updateImagePreview(): void {
    if (this.currentProduct?.imageUrl) {
      // Store the original URL without timestamp
      const originalUrl = this.currentProduct.imageUrl.includes('?') 
        ? this.currentProduct.imageUrl.split('?')[0]
        : this.currentProduct.imageUrl;
      
      // Add timestamp to force image refresh but keep the original URL for saving
      this.currentProduct.imageUrl = originalUrl + '?t=' + new Date().getTime();
      console.log('Updated image URL with timestamp for preview:', this.currentProduct.imageUrl);
    }
  }

  updateImageOnly(): void {
    if (!this.currentProduct.id || !this.currentProduct.imageUrl) {
      console.error('Product ID or image URL is missing');
      return;
    }
    
    // Clean the URL by removing only timestamp parameters, preserve other query params
    let cleanImageUrl = this.currentProduct.imageUrl;
    if (cleanImageUrl.includes('?t=')) {
      cleanImageUrl = cleanImageUrl.split('?t=')[0];
    } else if (cleanImageUrl.includes('&t=')) {
      cleanImageUrl = cleanImageUrl.split('&t=')[0];
    }
    
    console.log(`Updating image for product ${this.currentProduct.id} to: ${cleanImageUrl}`);
    this.saving = true;
    
    this.adminService.updateProductImageDirect(this.currentProduct.id, cleanImageUrl)
      .subscribe({
        next: (response: any) => {
          console.log('Image updated successfully:', response);
          
          // Update the product in the products array
          const index = this.products.findIndex(p => p.id === this.currentProduct.id);
          if (index !== -1) {
            this.products[index].imageUrl = response.imageUrl;
            console.log('Updated image URL in products array');
          }
          
          // Force refresh of the image with a timestamp
          this.currentProduct.imageUrl = response.imageUrl;
          
          this.saving = false;
          this.filterProducts();
          
          // Reload products to ensure changes are reflected
          setTimeout(() => {
            this.loadProducts();
          }, 300);
        },
        error: (error: any) => {
          console.error('Error updating image:', error);
          this.saving = false;
        }
      });
  }
}
