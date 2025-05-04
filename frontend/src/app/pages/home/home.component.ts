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
      
      <app-product-carousel
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
      
      <app-product-carousel
        [products]="newArrivals"
        title="New Arrivals"
      ></app-product-carousel>
    </div>
  `,
  styles: []
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
