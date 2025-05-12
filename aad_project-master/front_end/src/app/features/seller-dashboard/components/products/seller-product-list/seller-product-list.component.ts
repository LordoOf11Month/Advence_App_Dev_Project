import { NotificationService } from './../../../../../core/services/notification.service';
import { Product } from './../../../../catalogue/services/product.service';
// features/seller-dashboard/components/products/seller-product-list/seller-product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../services/seller.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-product-list',
  standalone: false,
  templateUrl: './seller-product-list.component.html'
})
export class SellerProductListComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private sellerService: SellerService, private router: Router, private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.sellerService.getSellerProducts().subscribe({
      next: prods => {
        this.products = prods;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load products', err);
        this.error = 'Could not load products.';
        this.loading = false;
      }
    });
  }

  editProduct(product: Product): void {
    this.router.navigate(['/seller/products', product.id, 'edit']);
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }
    this.sellerService.deleteProduct(product.id).subscribe({
      next: () => {
        this.notify.showSuccess('Product deleted.');
        this.products = this.products.filter(p => p.id !== product.id);
      },
      error: err => {
        console.error('Delete failed', err);
        this.notify.showError('Failed to delete product.');
      }
    });
  }

  addNew(): void {
    this.router.navigate(['/seller/products/new']);
  }
}
