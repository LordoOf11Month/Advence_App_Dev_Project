// features/catalogue/components/compare-dialog/compare-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-compare-dialog',
  standalone: false,
  templateUrl: './compare-dialog.component.html',
  styleUrls: ['./compare-dialog.component.css']
})
export class CompareDialogComponent {
  products: Product[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { products: Product[] }) {
    this.products = data.products;
  }

  // Get comparison attributes for the product table
  getComparisonAttributes(): string[] {
    // Order: Description first, then price, stock, and category
    return ['description', 'price', 'stockQuantity', 'categoryId'];
  }

  // Get attribute label for display
  getAttributeLabel(attr: string): string {
    const labels: {[key: string]: string} = {
      'price': 'Price',
      'categoryId': 'Category',
      'stockQuantity': 'Stock',
      'description': 'Description'
    };
    return labels[attr] || attr;
  }

  // Format attribute value for display
  getAttributeValue(product: Product, attr: string): string {
    const value = (product as any)[attr];
    if (attr === 'price') {
      return '$' + value.toFixed(2);
    }
    return value?.toString() || 'N/A';
  }
}
