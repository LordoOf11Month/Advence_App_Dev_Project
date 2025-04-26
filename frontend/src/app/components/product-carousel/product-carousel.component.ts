import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="product-carousel">
      <div class="carousel-header">
        <h2 class="section-title">{{title}}</h2>
        <div class="carousel-controls">
          <button 
            class="control-btn prev-btn" 
            (click)="slidePrev()"
            [disabled]="currentSlide === 0"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button 
            class="control-btn next-btn" 
            (click)="slideNext()"
            [disabled]="currentSlide >= maxSlide"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      
      <div class="carousel-container" #carouselContainer>
        <div class="carousel-track" #carouselTrack>
          <div 
            *ngFor="let product of products" 
            class="carousel-slide"
          >
            <app-product-card 
              [product]="product"
              (addToCart)="onAddToCart($event)"
              (toggleFavorite)="onToggleFavorite($event)"
            ></app-product-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-carousel {
      margin-bottom: var(--space-8);
    }
    
    .carousel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    
    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin: 0;
    }
    
    .carousel-controls {
      display: flex;
      gap: var(--space-2);
    }
    
    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--white);
      color: var(--neutral-800);
      border: 1px solid var(--neutral-200);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .control-btn:hover:not(:disabled) {
      background-color: var(--primary);
      color: var(--white);
      border-color: var(--primary);
    }
    
    .control-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .carousel-container {
      overflow: hidden;
      position: relative;
      border-radius: var(--radius-md);
    }
    
    .carousel-track {
      display: flex;
      transition: transform var(--transition-normal);
    }
    
    .carousel-slide {
      flex: 0 0 calc(25% - var(--space-3));
      margin-right: var(--space-3);
    }
    
    @media (max-width: 992px) {
      .carousel-slide {
        flex: 0 0 calc(33.333% - var(--space-3));
      }
    }
    
    @media (max-width: 768px) {
      .carousel-slide {
        flex: 0 0 calc(50% - var(--space-3));
      }
    }
    
    @media (max-width: 576px) {
      .carousel-slide {
        flex: 0 0 calc(100% - var(--space-3));
      }
    }
  `]
})
export class ProductCarouselComponent implements AfterViewInit {
  @Input() products: Product[] = [];
  @Input() title: string = '';
  
  @ViewChild('carouselTrack') carouselTrack!: ElementRef;
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  
  currentSlide: number = 0;
  slideWidth: number = 0;
  maxSlide: number = 0;
  slidesPerView: number = 4;
  
  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {}
  
  ngAfterViewInit(): void {
    this.initCarousel();
    window.addEventListener('resize', () => this.initCarousel());
  }
  
  initCarousel(): void {
    const containerWidth = this.carouselContainer.nativeElement.offsetWidth;
    
    if (window.innerWidth <= 576) {
      this.slidesPerView = 1;
    } else if (window.innerWidth <= 768) {
      this.slidesPerView = 2;
    } else if (window.innerWidth <= 992) {
      this.slidesPerView = 3;
    } else {
      this.slidesPerView = 4;
    }
    
    this.slideWidth = containerWidth / this.slidesPerView;
    this.maxSlide = Math.max(0, this.products.length - this.slidesPerView);
    this.updateSlidePosition();
  }
  
  slideNext(): void {
    if (this.currentSlide < this.maxSlide) {
      this.currentSlide++;
      this.updateSlidePosition();
    }
  }
  
  slidePrev(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlidePosition();
    }
  }
  
  updateSlidePosition(): void {
    const track = this.carouselTrack.nativeElement;
    const translateX = -this.currentSlide * this.slideWidth;
    track.style.transform = `translateX(${translateX}px)`;
  }
  
  onAddToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
  
  onToggleFavorite(productId: number): void {
    this.productService.toggleFavorite(productId).subscribe();
  }
}