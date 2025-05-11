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
    <div class="container mx-auto px-4">
      <app-banner-slider [banners]="banners"></app-banner-slider>
      
      <app-category-showcase></app-category-showcase>
      
      <!-- Loading state for featured products -->
      <div *ngIf="loadingFeatured" class="flex justify-center items-center py-8">
        <div class="w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
      
      <!-- Error state for featured products -->
      <div *ngIf="featuredError" class="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
        <p class="text-red-600">Unable to load featured products. Please try again later.</p>
        <button (click)="loadFeaturedProducts()" class="mt-2 px-4 py-2 bg-primary text-white rounded-md">
          Retry
        </button>
      </div>
      
      <!-- Featured products -->
      <app-product-carousel
        *ngIf="!loadingFeatured && !featuredError && featuredProducts.length > 0"
        [products]="featuredProducts"
        title="Featured Products"
      ></app-product-carousel>
      
      <div class="h-[200px] bg-gradient-to-r from-primary-dark to-primary rounded-md mb-8 relative overflow-hidden flex items-center">
        <div class="absolute top-[-50%] right-[-50%] w-[200px] h-[200px] rounded-full bg-white bg-opacity-10"></div>
        <div class="absolute bottom-[-30%] left-[10%] w-[150px] h-[150px] rounded-full bg-white bg-opacity-10"></div>
        
        <div class="p-6 text-white relative z-10">
          <h2 class="text-3xl font-bold mb-2">Summer Sale is Live!</h2>
          <p class="text-xl mb-4 opacity-90">Up to 70% off on summer essentials</p>
          <button class="bg-white text-primary px-4 py-2 rounded-md font-medium transition-all duration-200 hover:bg-neutral-50 hover:-translate-y-0.5">Shop Now</button>
        </div>
      </div>
      
      <!-- Loading state for new arrivals -->
      <div *ngIf="loadingNewArrivals" class="flex justify-center items-center py-8">
        <div class="w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
      
      <!-- Error state for new arrivals -->
      <div *ngIf="newArrivalsError" class="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
        <p class="text-red-600">Unable to load new arrivals. Please try again later.</p>
        <button (click)="loadNewArrivals()" class="mt-2 px-4 py-2 bg-primary text-white rounded-md">
          Retry
        </button>
      </div>
      
      <!-- New arrivals products -->
      <app-product-carousel
        *ngIf="!loadingNewArrivals && !newArrivalsError && newArrivals.length > 0"
        [products]="newArrivals"
        title="New Arrivals"
      ></app-product-carousel>
      
      <!-- Empty state if no products are found -->
      <div *ngIf="(!loadingFeatured && !featuredError && featuredProducts.length === 0) || 
                (!loadingNewArrivals && !newArrivalsError && newArrivals.length === 0)" 
           class="text-center py-8 mb-8 bg-neutral-50 rounded-md">
        <div class="text-4xl mb-4">🛒</div>
        <h3 class="text-xl font-semibold mb-2">No products found</h3>
        <p class="text-neutral-600">We're working on adding more products.</p>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  banners: Banner[] = [];
  
  // Loading states
  loadingFeatured = true;
  loadingNewArrivals = true;
  
  // Error states
  featuredError = false;
  newArrivalsError = false;
  
  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}
  
  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadNewArrivals();
    this.loadBanners();
  }
  
  loadFeaturedProducts(): void {
    this.loadingFeatured = true;
    this.featuredError = false;
    
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        console.log('Loaded featured products:', products.length);
        this.loadingFeatured = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.featuredError = true;
        this.loadingFeatured = false;
      }
    });
  }
  
  loadNewArrivals(): void {
    this.loadingNewArrivals = true;
    this.newArrivalsError = false;
    
    this.productService.getNewArrivals().subscribe({
      next: (products: Product[]) => {
        this.newArrivals = products;
        console.log('Loaded new arrivals:', products.length);
        this.loadingNewArrivals = false;
      },
      error: (error: Error) => {
        console.error('Error loading new arrivals:', error);
        this.newArrivalsError = true;
        this.loadingNewArrivals = false;
      }
    });
  }
  
  loadBanners(): void {
    this.productService.getBanners().subscribe(banners => {
      this.banners = banners;
    });
  }
}
