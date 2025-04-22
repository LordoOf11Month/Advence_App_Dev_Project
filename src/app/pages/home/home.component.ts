import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, Banner } from '../../models/product.model';
import { BannerSliderComponent } from '../../components/banner-slider/banner-slider.component';
import { CategoryShowcaseComponent } from '../../components/category-showcase/category-showcase.component';
import { ProductCarouselComponent } from '../../components/product-carousel/product-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    BannerSliderComponent,
    CategoryShowcaseComponent,
    ProductCarouselComponent
  ],
  template: `
    <div class="container">
      <app-banner-slider [banners]="banners"></app-banner-slider>
      
      <app-category-showcase></app-category-showcase>
      
      <app-product-carousel
        [products]="featuredProducts"
        title="Featured Products"
      ></app-product-carousel>
      
      <div class="promo-banner">
        <div class="promo-content">
          <h2 class="promo-title">Summer Sale is Live!</h2>
          <p class="promo-subtitle">Up to 70% off on summer essentials</p>
          <button class="promo-cta">Shop Now</button>
        </div>
      </div>
      
      <app-product-carousel
        [products]="newArrivals"
        title="New Arrivals"
      ></app-product-carousel>
    </div>
  `,
  styles: [`
    .promo-banner {
      height: 200px;
      background: linear-gradient(to right, var(--primary-dark), var(--primary));
      border-radius: var(--radius-md);
      margin-bottom: var(--space-8);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
    }
    
    .promo-banner::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .promo-banner::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: 10%;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .promo-content {
      padding: var(--space-6);
      color: var(--white);
      position: relative;
      z-index: 1;
    }
    
    .promo-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: var(--space-2);
    }
    
    .promo-subtitle {
      font-size: 1.25rem;
      margin-bottom: var(--space-4);
      opacity: 0.9;
    }
    
    .promo-cta {
      background-color: var(--white);
      color: var(--primary);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      transition: all var(--transition-fast);
      border: none;
      cursor: pointer;
    }
    
    .promo-cta:hover {
      background-color: var(--neutral-50);
      transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
      .promo-banner {
        height: 180px;
      }
      
      .promo-title {
        font-size: 1.5rem;
      }
      
      .promo-subtitle {
        font-size: 1rem;
      }
    }
    
    @media (max-width: 576px) {
      .promo-banner {
        height: 160px;
      }
      
      .promo-content {
        padding: var(--space-4);
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  banners: Banner[] = [];
  
  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}
  
  ngOnInit(): void {
    this.productService.getFeaturedProducts().subscribe(products => {
      this.featuredProducts = products;
    });
    
    this.productService.getNewArrivals().subscribe(products => {
      this.newArrivals = products;
    });
    
    this.productService.getBanners().subscribe(banners => {
      this.banners = banners;
    });
  }
}