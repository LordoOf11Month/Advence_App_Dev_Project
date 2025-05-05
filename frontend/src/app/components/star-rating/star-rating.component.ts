import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="star-rating" 
      [class.interactive]="interactive"
      [class.small]="size === 'small'"
      [class.large]="size === 'large'"
    >
      <div 
        *ngFor="let star of starsArray; let i = index" 
        class="star" 
        [class.filled]="i < filledStars"
        [class.half-filled]="i === Math.floor(filledStars) && hasHalfStar"
        (click)="interactive && setRating(i + 1)"
        (mouseenter)="interactive && setHoverRating(i + 1)"
        (mouseleave)="interactive && resetHoverRating()"
      >
        <span class="material-symbols-outlined">star</span>
      </div>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
    }
    
    .star {
      position: relative;
      color: var(--neutral-300);
      cursor: default;
    }
    
    .star .material-symbols-outlined {
      font-variation-settings: 'FILL' 1;
    }
    
    .star.filled {
      color: var(--warning);
    }
    
    .star.half-filled {
      position: relative;
    }
    
    .star.half-filled::after {
      content: "star";
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 1;
      position: absolute;
      left: 0;
      width: 50%;
      overflow: hidden;
      color: var(--warning);
    }
    
    .interactive .star {
      cursor: pointer;
    }
    
    .small .material-symbols-outlined {
      font-size: 1rem;
    }
    
    .star-rating:not(.small):not(.large) .material-symbols-outlined {
      font-size: 1.5rem;
    }
    
    .large .material-symbols-outlined {
      font-size: 2rem;
    }
  `]
})
export class StarRatingComponent {
  @Input() value: number = 0;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() interactive: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();
  
  hoverRating: number | null = null;
  starsArray = [0, 1, 2, 3, 4];
  Math = Math;
  
  get filledStars(): number {
    return this.hoverRating !== null ? this.hoverRating : this.value;
  }
  
  get hasHalfStar(): boolean {
    const value = this.hoverRating !== null ? this.hoverRating : this.value;
    return Math.floor(value) !== value;
  }
  
  setRating(rating: number): void {
    this.value = rating;
    this.ratingChange.emit(rating);
  }
  
  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }
  
  resetHoverRating(): void {
    this.hoverRating = null;
  }
}