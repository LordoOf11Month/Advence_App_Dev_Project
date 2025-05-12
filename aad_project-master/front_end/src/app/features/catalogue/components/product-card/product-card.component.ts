// features/catalogue/components/product-card/product-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() isSelected: boolean = false;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() compare = new EventEmitter<Product>();

  onAddToCartClick(): void {
    this.addToCart.emit(this.product);
  }
  onCompareClick(): void {
    this.compare.emit(this.product);
  }
}
