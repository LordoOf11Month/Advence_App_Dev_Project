// features/catalogue/components/review-list/review-list.component.ts
import { Component, Input } from '@angular/core';
import { Review } from '../../services/review.service';

@Component({
  selector: 'app-review-list',
  standalone: false,
  template: `
    <div *ngIf="reviews && reviews.length; else noReviews" class="reviews-container">
      <div *ngFor="let review of reviews" class="review-item">
        <div class="review-header">
          <strong class="reviewer-name">{{ getFirstName(review.userName) }}</strong>
          <div class="rating">
            <span [innerHTML]="getStarRating(review.rating)"></span>
            <span class="rating-text">{{ review.rating }}/5</span>
          </div>
        </div>
        <p class="review-comment">{{ review.comment }}</p>
        <small class="date">{{ review.date | date:'medium' }}</small>
      </div>
    </div>
    <ng-template #noReviews>
      <p class="no-reviews">No reviews yet. Be the first to leave a review!</p>
    </ng-template>
  `,
  styles: [`
    .reviews-container {
      margin-top: 15px;
    }
    .review-item {
      border-bottom: 1px solid #eee;
      padding: 15px 0;
      margin-bottom: 10px;
    }
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .reviewer-name {
      font-size: 16px;
      color: #333;
    }
    .rating {
      color: #ff9800;
      display: flex;
      align-items: center;
    }
    .rating-text {
      margin-left: 5px;
      font-size: 14px;
    }
    .review-comment {
      margin: 10px 0;
      line-height: 1.5;
    }
    .date {
      color: #777;
      font-size: 12px;
      display: block;
      text-align: right;
    }
    .no-reviews {
      color: #666;
      font-style: italic;
      margin: 20px 0;
      text-align: center;
    }
  `]
})
export class ReviewListComponent {
  @Input() reviews: Review[] = [];

  getFirstName(fullName: string | undefined): string {
    if (!fullName) return 'Anonymous User';

    // Extract the first name (everything before the first space)
    const firstName = fullName.split(' ')[0];
    return firstName || 'Anonymous User';
  }

  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let stars = '';
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    // Add half star if needed
    if (halfStar) {
      stars += '★';
    }
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '☆';
    }

    return stars;
  }
}
