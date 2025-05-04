import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Review, ReviewStats } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { Observable, of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  template: `
    <div class="reviews-container">
      <div class="reviews-header">
        <h2>Customer Reviews</h2>
        <div class="reviews-stats" *ngIf="reviewStats">
          <div class="rating-summary">
            <div class="average-rating">
              <app-star-rating [value]="reviewStats.averageRating"></app-star-rating>
              <span class="rating-value">{{ reviewStats.averageRating | number:'1.1-1' }}</span>
              <span class="total-reviews">({{ reviewStats.totalReviews }} reviews)</span>
            </div>
            <div class="rating-distribution">
              <div class="rating-bar" *ngFor="let i of [5, 4, 3, 2, 1]">
                <span class="star-label">{{ i }} stars</span>
                <div class="progress-bar">
                  <div class="progress-fill" 
                      [style.width.%]="getRatingPercentage(i)">
                  </div>
                </div>
                <span class="count">{{ reviewStats.ratingCounts[i] || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="filters-row">
        <select [(ngModel)]="sortOption" (change)="sortReviews()" class="sort-select">
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
        
        <button *ngIf="isAuthenticated" class="btn btn-primary" (click)="showAddReviewForm = true">
          Write a Review
        </button>
      </div>

      <div *ngIf="showAddReviewForm" class="review-form">
        <h3>Write Your Review</h3>
        <div class="form-group">
          <label>Rating</label>
          <app-star-rating [interactive]="true" [value]="newReview.rating" (ratingChange)="newReview.rating = $event"></app-star-rating>
        </div>
        <div class="form-group">
          <label>Title</label>
          <input type="text" class="form-control" [(ngModel)]="newReview.title" placeholder="Summarize your experience">
        </div>
        <div class="form-group">
          <label>Review</label>
          <textarea class="form-control" rows="4" [(ngModel)]="newReview.comment" placeholder="Tell others about your experience with this product"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-text" (click)="showAddReviewForm = false">Cancel</button>
          <button class="btn btn-primary" [disabled]="!canSubmitReview() || isSubmitting" (click)="submitReview()">
            {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
      </div>

      <div class="reviews-list">
        <div *ngIf="loading" class="loading-spinner">
          <span class="spinner"></span>
          <p>Loading reviews...</p>
        </div>
        
        <div *ngIf="error" class="error-message">
          <p>Failed to load reviews. Please try again later.</p>
          <button class="btn btn-outline" (click)="loadReviews()">Retry</button>
        </div>
        
        <div *ngIf="!loading && !error && reviews.length === 0" class="no-reviews">
          <p>This product has no reviews yet. Be the first to share your thoughts!</p>
          <button *ngIf="isAuthenticated" class="btn btn-primary" (click)="showAddReviewForm = true">
            Write a Review
          </button>
        </div>
        
        <div *ngFor="let review of reviews" class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <img *ngIf="review.userImage" [src]="review.userImage" alt="User" class="user-avatar">
              <div class="user-details">
                <span class="user-name">{{ review.userName }}</span>
                <span *ngIf="review.isVerifiedPurchase" class="verified-badge">Verified Purchase</span>
              </div>
            </div>
            <div class="review-date">
              {{ review.createdAt | date:'mediumDate' }}
              <span *ngIf="review.updatedAt">(Edited)</span>
            </div>
          </div>
          
          <div class="review-content">
            <div class="review-rating">
              <app-star-rating [value]="review.rating" [size]="'small'"></app-star-rating>
              <span *ngIf="review.title" class="review-title">{{ review.title }}</span>
            </div>
            
            <p class="review-text">{{ review.comment }}</p>
            
            <div *ngIf="review.images && review.images.length > 0" class="review-images">
              <img *ngFor="let image of review.images" [src]="image" alt="Review image" class="review-image">
            </div>
          </div>
          
          <div class="review-footer">
            <div class="helpful-buttons">
              <span>Was this review helpful?</span>
              <button class="btn btn-sm btn-text" (click)="likeReview(review)">
                <span class="material-symbols-outlined">thumb_up</span>
                {{ review.likes || 0 }}
              </button>
              <button class="btn btn-sm btn-text" (click)="dislikeReview(review)">
                <span class="material-symbols-outlined">thumb_down</span>
                {{ review.dislikes || 0 }}
              </button>
            </div>
            
            <div *ngIf="isUserReview(review)" class="owner-actions">
              <button class="btn btn-sm btn-text" (click)="editReview(review)">Edit</button>
              <button class="btn btn-sm btn-text" (click)="deleteReview(review)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-container {
      margin-top: 2rem;
    }
    
    .reviews-header {
      margin-bottom: 1.5rem;
    }
    
    .reviews-stats {
      background-color: var(--neutral-50);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-top: 1rem;
    }
    
    .average-rating {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .rating-value {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0.5rem;
    }
    
    .total-reviews {
      color: var(--neutral-600);
    }
    
    .rating-distribution {
      max-width: 500px;
    }
    
    .rating-bar {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .star-label {
      width: 70px;
      white-space: nowrap;
    }
    
    .progress-bar {
      flex-grow: 1;
      height: 8px;
      background-color: var(--neutral-200);
      border-radius: 4px;
      margin: 0 1rem;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background-color: var(--warning);
    }
    
    .count {
      width: 30px;
      text-align: right;
    }
    
    .filters-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .sort-select {
      padding: 0.5rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--neutral-300);
    }
    
    .review-form {
      background-color: var(--neutral-50);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius);
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .reviews-list {
      margin-top: 1.5rem;
    }
    
    .review-item {
      border-bottom: 1px solid var(--neutral-200);
      padding: 1.5rem 0;
    }
    
    .review-item:last-child {
      border-bottom: none;
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    
    .reviewer-info {
      display: flex;
      align-items: center;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 0.75rem;
      object-fit: cover;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 500;
    }
    
    .verified-badge {
      font-size: 0.8rem;
      color: var(--success);
    }
    
    .review-date {
      color: var(--neutral-600);
      font-size: 0.9rem;
    }
    
    .review-rating {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .review-title {
      font-weight: 600;
      margin-left: 0.75rem;
    }
    
    .review-text {
      line-height: 1.5;
      margin-bottom: 0.75rem;
      white-space: pre-line;
    }
    
    .review-images {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
    }
    
    .review-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--border-radius);
      cursor: pointer;
    }
    
    .review-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }
    
    .helpful-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 0;
    }
    
    .spinner {
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top: 3px solid var(--primary);
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-message, .no-reviews {
      text-align: center;
      padding: 2rem 0;
    }
    
    .owner-actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class ReviewListComponent implements OnInit {
  @Input() productId!: number;
  
  reviews: Review[] = [];
  reviewStats: ReviewStats | null = null;
  loading = false;
  error = false;
  sortOption = 'recent';
  
  showAddReviewForm = false;
  isSubmitting = false;
  newReview = {
    rating: 0,
    title: '',
    comment: '',
    images: []
  };
  
  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    console.log('ReviewListComponent initialized with productId:', this.productId);
    this.loadReviews();
  }
  
  loadReviews(): void {
    console.log('Loading reviews for product ID:', this.productId);
    this.loading = true;
    this.error = false;
    
    // Create an observable for reviews
    const reviews$ = this.reviewService.getReviewsByProductId(this.productId, this.sortOption)
      .pipe(
        catchError((err) => {
          console.error('Error loading reviews:', err);
          this.error = true;
          return of([]);
        })
      );
    
    // Create an observable for stats
    const stats$ = this.reviewService.getReviewStats(this.productId)
      .pipe(
        catchError(error => {
          console.error('Error loading review stats:', error);
          return of(null);
        })
      );
    
    // Subscribe to reviews
    reviews$.subscribe(reviews => {
      console.log('Reviews loaded:', reviews);
      this.reviews = reviews;
      this.loading = false;
    });
    
    // Subscribe to stats
    stats$.subscribe(stats => {
      if (stats) {
        console.log('Review stats loaded:', stats);
        this.reviewStats = stats;
      }
    });
  }
  
  sortReviews(): void {
    this.loadReviews();
  }
  
  getRatingPercentage(rating: number): number {
    if (!this.reviewStats || this.reviewStats.totalReviews === 0) return 0;
    return (this.reviewStats.ratingCounts[rating] / this.reviewStats.totalReviews) * 100;
  }
  
  submitReview(): void {
    if (!this.canSubmitReview()) return;
    
    this.isSubmitting = true;
    
    this.reviewService.addReview({
      productId: this.productId,
      rating: this.newReview.rating,
      title: this.newReview.title,
      comment: this.newReview.comment,
      images: this.newReview.images
    }).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: () => {
        this.showAddReviewForm = false;
        this.resetNewReview();
        this.loadReviews();
      },
      error: (err) => {
        console.error('Failed to submit review', err);
        // Here you would show an error message to the user
      }
    });
  }
  
  likeReview(review: Review): void {
    this.reviewService.likeReview(review.id).subscribe();
  }
  
  dislikeReview(review: Review): void {
    this.reviewService.dislikeReview(review.id).subscribe();
  }
  
  editReview(review: Review): void {
    // In a real app, you would open an edit form here
    console.log('Edit review', review);
  }
  
  deleteReview(review: Review): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(review.id).subscribe(() => {
        this.loadReviews();
      });
    }
  }
  
  canSubmitReview(): boolean {
    return this.newReview.rating > 0 && this.newReview.comment.trim().length > 0;
  }
  
  resetNewReview(): void {
    this.newReview = {
      rating: 0,
      title: '',
      comment: '',
      images: []
    };
  }
  
  isUserReview(review: Review): boolean {
    // In a real app, we would do this check properly with auth tokens
    // For our demo, we'll just hardcode it based on the user ID
    return review.userId === 'user1'; // Assuming the logged-in user is user1
  }
  
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
} 