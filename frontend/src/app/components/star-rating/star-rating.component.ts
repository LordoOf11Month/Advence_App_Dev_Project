import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="interactive">
      <span 
        *ngFor="let star of stars; let i = index" 
        class="material-symbols-outlined"
        [class.filled]="i < displayValue"
        [class.half-filled]="i === Math.floor(displayValue) && displayValue % 1 !== 0"
        (mouseenter)="onStarHover(i+1)"
        (mouseleave)="onStarLeave()"
        (click)="onStarClick(i+1)"
      >
        star
      </span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: flex;
      align-items: center;
    }
    
    .star-rating .material-symbols-outlined {
      color: var(--neutral-300);
      font-size: 1.5rem;
      cursor: default;
      transition: color var(--transition-fast);
    }
    
    .star-rating.interactive .material-symbols-outlined {
      cursor: pointer;
    }
    
    .star-rating .material-symbols-outlined.filled {
      color: var(--warning);
    }
    
    .star-rating .material-symbols-outlined.half-filled {
      position: relative;
      color: var(--neutral-300);
    }
    
    .star-rating .material-symbols-outlined.half-filled::after {
      content: 'star_half';
      position: absolute;
      left: 0;
      color: var(--warning);
    }
    
    .star-rating.interactive:hover .material-symbols-outlined {
      color: var(--neutral-300);
    }
    
    .star-rating.interactive .material-symbols-outlined:hover ~ .material-symbols-outlined {
      color: var(--neutral-300);
    }
  `]
})
export class StarRatingComponent {
  @Input() value: number = 0;
  @Input() interactive: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() ratingChange = new EventEmitter<number>();
  
  stars = [1, 2, 3, 4, 5];
  hoverValue: number | null = null;
  displayValue: number = 0;
  Math = Math;
  
  ngOnChanges() {
    this.updateDisplayValue();
  }
  
  onStarHover(value: number): void {
    if (!this.interactive) return;
    
    this.hoverValue = value;
    this.updateDisplayValue();
  }
  
  onStarLeave(): void {
    if (!this.interactive) return;
    
    this.hoverValue = null;
    this.updateDisplayValue();
  }
  
  onStarClick(value: number): void {
    if (!this.interactive) return;
    
    this.value = value;
    this.updateDisplayValue();
    this.ratingChange.emit(value);
  }
  
  private updateDisplayValue(): void {
    this.displayValue = this.hoverValue !== null ? this.hoverValue : this.value;
  }
} 