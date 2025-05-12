import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/system-admin.service';
import { Product } from '../../../../catalogue/services/product.service';

@Component({
  selector: 'app-product-management',
  standalone: false,
  templateUrl: './product-management.component.html'
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private adminService: AdminService,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.loading = true;
    this.adminService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load products', err);
        this.error = 'Could not load products. Please try again.';
        this.loading = false;
      }
    });
  }

  removeProduct(productId: number): void {
    if (confirm('Are you sure you want to remove this product?')) {
      this.adminService.removeProduct(productId).subscribe({
        next: () => {
          this.notify.showSuccess('Product removed successfully.');
          this.loadAllProducts(); // Refresh the list
        },
        error: (err: any) => {
          console.error('Failed to remove product', err);
          this.notify.showError('Failed to remove product.');
        }
      });
    }
  }
}
