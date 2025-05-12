// features/catalogue/components/product-filter/product-filter.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-filter',
  standalone: false,
  template: `
    <input type="text" placeholder="Search..." (input)="onSearchChange($any($event.target).value)" />
    <!-- For simplicity, static categories list. In real scenario, might fetch categories list from service. -->
    <select (change)="onCategoryChange($any($event.target).value)">
      <option value="">All Categories</option>
      <option value="Electronics">Electronics</option>
      <option value="Clothing">Clothing</option>
      <option value="Books">Books</option>
    </select>
  `
})
export class ProductFilterComponent {
  @Output() search = new EventEmitter<string>();
  @Output() filterByCategory = new EventEmitter<string>();

  onSearchChange(term: string) {
    this.search.emit(term);
  }
  onCategoryChange(category: string) {
    this.filterByCategory.emit(category);
  }
}
