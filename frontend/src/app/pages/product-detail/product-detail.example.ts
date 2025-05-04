import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductReviewsComponent } from '../../components/reviews/product-reviews.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ProductReviewsComponent],
  template: `
    <div class="product-detail-container">
      <!-- Product information and details would go here -->
      
      <section class="product-reviews-section">
        <app-product-reviews [productId]="productId"></app-product-reviews>
      </section>
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .product-reviews-section {
      margin-top: 3rem;
      border-top: 1px solid var(--neutral-200);
      padding-top: 2rem;
    }
  `]
})
export class ProductDetailExampleComponent implements OnInit {
  productId: number = 1; // Default value
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    // Get product ID from route parameters
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = +params['id'];
      }
    });
  }
} 