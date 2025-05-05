import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review, ReviewStats } from '../../models/review.model';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  template: `
    <div class="reviews-container">
      <div class="reviews-header">
        <h2 class="reviews-title">Customer Reviews</h2>
        <div class="rating-summary">
          <div class="average-rating">
            <span class="rating-value">{{ getAverageRatingDisplay() }}</span>
            <app-star-rating 
              [value]="getAverageRatingValue()" 
              [interactive]="false"
              size="medium"
            ></app-star-rating>
            <span class="review-count">{{ getTotalReviews() }} reviews</span>
          </div>
          
          <div class="rating-breakdown">
            <div class="rating-bar" *ngFor="let i of [5, 4, 3, 2, 1]">
              <span class="rating-label">{{ i }} Stars</span>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="getPercentageForRating(i)"
                ></div>
              </div>
              <span class="rating-count">{{ getRatingCount(i) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sort-options">
        <span>Sort by:</span>
        <select (change)="onSortChange($event)">
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      <div class="reviews-list">
        <div class="review-item" *ngFor="let review of reviews">
          <div class="review-header">
            <div class="reviewer-info">
              <img
                *ngIf="review.userImage" 
                [src]="review.userImage" 
                alt="User profile" 
                class="user-avatar"
              />
              <div *ngIf="!review.userImage" class="user-avatar-placeholder">
                {{ getInitials(review.userName) }}
              </div>
              <div>
                <div class="reviewer-name">{{ review.userName }}</div>
                <div class="review-date">{{ review.createdAt | date:'MMM d, yyyy' }}</div>
              </div>
            </div>
            <div class="verified-badge" *ngIf="review.isVerifiedPurchase">
              <span class="material-symbols-outlined">verified</span>
              Verified Purchase
            </div>
          </div>

          <div class="review-rating">
            <app-star-rating 
              [value]="review.rating" 
              [interactive]="false"
              size="small"
            ></app-star-rating>
            <h3 class="review-title">{{ review.title || '' }}</h3>
          </div>

          <div class="review-content">{{ review.comment }}</div>

          <div class="review-actions">
            <div class="was-helpful">Was this review helpful?</div>
            <button class="helpful-btn" (click)="onLikeReview(review)">
              <span class="material-symbols-outlined">thumb_up</span>
              {{ review.likes || 0 }}
            </button>
            <button class="not-helpful-btn" (click)="onDislikeReview(review)">
              <span class="material-symbols-outlined">thumb_down</span>
              {{ review.dislikes || 0 }}
            </button>
            <button class="report-btn" (click)="onReportReview(review)">
              Report
            </button>
          </div>
        </div>

        <div class="no-reviews" *ngIf="!reviews || reviews.length === 0">
          No reviews yet. Be the first to leave a review!
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-container {
      font-family: var(--font-family);
      color: var(--text-color);
    }

    .reviews-header {
      margin-bottom: 2rem;
    }

    .reviews-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text-color-dark);
    }

    .rating-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .average-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .rating-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-color-dark);
    }

    .review-count {
      margin-top: 0.25rem;
      color: var(--text-color-light);
      font-size: 0.9rem;
    }

    .rating-breakdown {
      flex: 1;
      min-width: 250px;
    }

    .rating-bar {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .rating-label {
      width: 70px;
      font-size: 0.9rem;
    }

    .progress-bar {
      flex: 1;
      height: 0.5rem;
      background-color: var(--neutral-200);
      border-radius: 0.25rem;
      margin: 0 0.75rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--warning);
    }

    .rating-count {
      width: 30px;
      text-align: right;
      font-size: 0.9rem;
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    select {
      padding: 0.5rem;
      border: 1px solid var(--neutral-300);
      border-radius: 0.25rem;
      background-color: white;
      font-size: 0.9rem;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-item {
      padding: 1.5rem;
      border-bottom: 1px solid var(--neutral-200);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar, .user-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
    }

    .user-avatar-placeholder {
      background-color: var(--primary-500);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .reviewer-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .review-date {
      font-size: 0.85rem;
      color: var(--text-color-light);
    }

    .verified-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--success);
      font-size: 0.85rem;
    }

    .review-rating {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .review-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }

    .review-content {
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .review-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
    }

    .was-helpful {
      color: var(--text-color-light);
    }

    .helpful-btn, .not-helpful-btn, .report-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--neutral-300);
      border-radius: 0.25rem;
      background: none;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .report-btn {
      margin-left: auto;
    }

    .no-reviews {
      text-align: center;
      padding: 2rem;
      color: var(--text-color-light);
    }
  `]
})
export class ReviewListComponent implements OnInit {
  @Input() productId: number | null = null;
  @Input() reviews: Review[] = [];
  @Input() stats: ReviewStats | null = null;

  ngOnInit(): void {
    // Logic could be added here to load reviews if not provided as input
  }

  getAverageRatingDisplay(): string {
    if (!this.stats || typeof this.stats.averageRating !== 'number') {
      return '0.0';
    }
    return this.stats.averageRating.toFixed(1);
  }

  getAverageRatingValue(): number {
    if (!this.stats || typeof this.stats.averageRating !== 'number') {
      return 0;
    }
    return this.stats.averageRating;
  }

  getTotalReviews(): number {
    if (!this.stats || typeof this.stats.totalReviews !== 'number') {
      return 0;
    }
    return this.stats.totalReviews;
  }

  getRatingCount(rating: number): number {
    if (!this.stats || !this.stats.ratingCounts) {
      return 0;
    }
    return this.stats.ratingCounts[rating] || 0;
  }

  getPercentageForRating(rating: number): number {
    if (!this.stats || !this.stats.totalReviews || this.stats.totalReviews === 0) {
      return 0;
    }
    
    const count = this.stats.ratingCounts[rating] || 0;
    return (count / this.stats.totalReviews) * 100;
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    // Logic to sort reviews
  }

  onLikeReview(review: Review): void {
    // Logic to like a review
  }

  onDislikeReview(review: Review): void {
    // Logic to dislike a review
  }

  onReportReview(review: Review): void {
    // Logic to report a review
  }
} 