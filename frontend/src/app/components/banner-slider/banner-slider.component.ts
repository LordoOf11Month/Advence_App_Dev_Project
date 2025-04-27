import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Banner } from '../../models/product.model';

@Component({
  selector: 'app-banner-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="banner-slider">
      <div class="slides-container">
        <div 
          *ngFor="let banner of banners; let i = index" 
          class="slide"
          [class.active]="i === currentSlide"
        >
          <img [src]="banner.imageUrl" [alt]="banner.title" class="slide-image">
          <div class="slide-content">
            <h2 class="slide-title">{{banner.title}}</h2>
            <p class="slide-subtitle" *ngIf="banner.subtitle">{{banner.subtitle}}</p>
            <a [routerLink]="banner.linkUrl" class="slide-cta">Shop Now</a>
          </div>
        </div>
      </div>
      
      <div class="slider-controls">
        <button 
          class="control-btn prev-btn" 
          (click)="prevSlide()"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        
        <div class="dots">
          <button 
            *ngFor="let banner of banners; let i = index" 
            class="dot"
            [class.active]="i === currentSlide"
            (click)="goToSlide(i)"
          ></button>
        </div>
        
        <button 
          class="control-btn next-btn" 
          (click)="nextSlide()"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .banner-slider {
      position: relative;
      margin-bottom: var(--space-6);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    
    .slides-container {
      height: 400px;
      position: relative;
    }
    
    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
      z-index: 1;
    }
    
    .slide.active {
      opacity: 1;
      z-index: 2;
    }
    
    .slide-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .slide-content {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: var(--space-6);
      background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0));
      color: var(--white);
      z-index: 3;
    }
    
    .slide-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: var(--space-2);
      text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    }
    
    .slide-subtitle {
      font-size: 1.25rem;
      margin-bottom: var(--space-4);
      opacity: 0.9;
    }
    
    .slide-cta {
      display: inline-block;
      background-color: var(--primary);
      color: var(--white);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      transition: all var(--transition-fast);
    }
    
    .slide-cta:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
    }
    
    .slider-controls {
      position: absolute;
      bottom: var(--space-4);
      right: var(--space-4);
      z-index: 10;
      display: flex;
      align-items: center;
    }
    
    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      color: var(--white);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      backdrop-filter: blur(4px);
    }
    
    .control-btn:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    .dots {
      display: flex;
      gap: var(--space-2);
      margin: 0 var(--space-2);
    }
    
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .dot.active {
      background-color: var(--white);
      transform: scale(1.2);
    }
    
    @media (max-width: 768px) {
      .slides-container {
        height: 300px;
      }
      
      .slide-title {
        font-size: 1.5rem;
      }
      
      .slide-subtitle {
        font-size: 1rem;
      }
    }
    
    @media (max-width: 576px) {
      .slides-container {
        height: 200px;
      }
      
      .slide-content {
        padding: var(--space-4);
      }
      
      .control-btn {
        width: 32px;
        height: 32px;
      }
    }
  `]
})
export class BannerSliderComponent implements AfterViewInit, OnDestroy {
  @Input() banners: Banner[] = [];
  
  currentSlide: number = 0;
  slideInterval: any;
  
  ngAfterViewInit(): void {
    this.startAutoSlide();
  }
  
  ngOnDestroy(): void {
    this.stopAutoSlide();
  }
  
  startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
  
  stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
  
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.banners.length;
  }
  
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.banners.length) % this.banners.length;
  }
  
  goToSlide(index: number): void {
    this.currentSlide = index;
  }
}
