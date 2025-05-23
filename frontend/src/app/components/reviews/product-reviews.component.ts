import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Review, ReviewStats, NewReview } from '../../models/review.model';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StarRatingComponent,
    RouterModule
  ],
  template: `
    <div class="product-reviews">
      <h2 class="reviews-title">Customer Reviews</h2>
      
      <div class="reviews-container">
        <div class="reviews-summary">
          <div class="rating-overview" *ngIf="reviewStats">
            <div class="average-rating">
              <div class="rating-value">{{reviewStats.averageRating.toFixed(1)}}</div>
              <app-star-rating
                [value]="reviewStats.averageRating"
                [interactive]="false"
                size="large"
              ></app-star-rating>
              <div class="rating-count">{{reviewStats.totalReviews}} reviews</div>
            </div>
            
            <div class="rating-breakdown">
              <div class="rating-bar" *ngFor="let item of ratingBreakdown">
                <div class="rating-label">{{item.stars}} Stars</div>
                <div class="progress-bar">
                  <div 
                    class="progress" 
                    [ngStyle]="{'width': (item.percentage) + '%'}"
                  ></div>
                </div>
                <div class="rating-count">{{item.count}}</div>
              </div>
            </div>
          </div>
          
          <div class="write-review-section">
            <h3>Write a Review</h3>
            
            <div *ngIf="!isAuthenticated" class="login-prompt">
              <p>Please <a routerLink="/login" [queryParams]="{returnUrl: currentUrl}">sign in</a> to write a review.</p>
            </div>
            
            <form *ngIf="isAuthenticated" [formGroup]="reviewForm" (ngSubmit)="submitReview()">
              <div class="form-group">
                <label>Rating *</label>
                <app-star-rating
                  [value]="reviewForm.get('rating')?.value || 0"
                  [interactive]="true"
                  (ratingChange)="onRatingChange($event)"
                ></app-star-rating>
                <div class="error-message" *ngIf="reviewForm.get('rating')?.invalid && reviewForm.get('rating')?.touched">
                  Please select a rating
                </div>
              </div>
              
              <div class="form-group">
                <label for="title">Review Title</label>
                <input 
                  type="text" 
                  id="title" 
                  formControlName="title" 
                  placeholder="Summarize your experience"
                >
              </div>
              
              <div class="form-group">
                <label for="comment">Review *</label>
                <textarea 
                  id="comment" 
                  formControlName="comment" 
                  rows="4" 
                  placeholder="Tell others about your experience with this product"
                ></textarea>
                <div class="error-message" *ngIf="reviewForm.get('comment')?.invalid && reviewForm.get('comment')?.touched">
                  Please enter your review
                </div>
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="submit-button"
                  [disabled]="reviewForm.invalid || isSubmitting"
                >
                  {{isSubmitting ? 'Submitting...' : 'Submit Review'}}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div class="reviews-list">
          <div class="reviews-filter">
            <label for="sort-reviews">Sort by:</label>
            <select id="sort-reviews" [(ngModel)]="sortOption" (change)="sortReviews()">
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
          
          <div class="review-items">
            <div *ngIf="!reviews.length" class="no-reviews">
              <p>There are no reviews yet for this product. Be the first to write a review!</p>
            </div>
            
            <div *ngFor="let review of reviews" class="review-item">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="avatar" *ngIf="review.userImage">
                    <img [src]="review.userImage" [alt]="review.userName">
                  </div>
                  <div class="reviewer-details">
                    <div class="reviewer-name">{{review.userName}}</div>
                    <div class="review-date">{{review.createdAt | date:'mediumDate'}}</div>
                  </div>
                </div>
                
                <div class="review-verification" *ngIf="review.isVerifiedPurchase">
                  <span class="material-symbols-outlined">verified</span>
                  <span>Verified Purchase</span>
                </div>
              </div>
              
              <div class="review-rating">
                <app-star-rating
                  [value]="review.rating"
                  [interactive]="false"
                  size="small"
                ></app-star-rating>
                <div class="review-title" *ngIf="review.title">{{review.title}}</div>
              </div>
              
              <div class="review-content">
                <p>{{review.comment}}</p>
              </div>
              
              <div class="review-images" *ngIf="review.images && review.images.length">
                <div 
                  *ngFor="let image of review.images" 
                  class="review-image"
                  (click)="enlargeImage(image)"
                >
                  <img [src]="image" alt="Review image">
                </div>
              </div>
              
              <div class="review-actions">
                <div class="helpful-actions">
                  <span>Was this review helpful?</span>
                  <button 
                    class="action-button" 
                    (click)="onLikeReview(review.id)"
                    [class.active]="review.userLiked"
                  >
                    <span class="material-symbols-outlined">thumb_up</span>
                    <span>{{review.likes}}</span>
                  </button>
                  <button 
                    class="action-button" 
                    (click)="onDislikeReview(review.id)"
                    [class.active]="review.userDisliked"
                  >
                    <span class="material-symbols-outlined">thumb_down</span>
                    <span>{{review.dislikes}}</span>
                  </button>
                </div>
                
                <div class="review-actions-right">
                  <button 
                    *ngIf="isCurrentUserReview(review.userId)" 
                    class="delete-button" 
                    (click)="confirmDeleteReview(review.id)"
                  >
                    <span class="material-symbols-outlined">delete</span>
                    Delete
                  </button>
                  <button class="link-button" (click)="reportReview(review.id)">Report</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="load-more" *ngIf="hasMoreReviews">
            <button class="load-more-button" (click)="loadMoreReviews()">
              {{isLoadingMore ? 'Loading...' : 'Load More Reviews'}}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div class="modal" *ngIf="showDeleteConfirmation">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Confirm Delete</h2>
            <button class="close-btn" (click)="cancelDeleteReview()">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this review?</p>
            <p class="warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn secondary" (click)="cancelDeleteReview()">Cancel</button>
            <button class="btn danger" (click)="deleteReview()">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-reviews {
      margin: var(--space-8) 0;
    }
    
    .reviews-title {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: var(--space-6);
      color: var(--neutral-900);
    }
    
    .reviews-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: var(--space-6);
    }
    
    /* Reviews Summary */
    .reviews-summary {
      border-right: 1px solid var(--neutral-200);
      padding-right: var(--space-6);
    }
    
    .rating-overview {
      margin-bottom: var(--space-6);
    }
    
    .average-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    
    .rating-value {
      font-size: 2.5rem;
      font-weight: 600;
      color: var(--neutral-900);
      line-height: 1;
      margin-bottom: var(--space-2);
    }
    
    .rating-count {
      margin-top: var(--space-1);
      font-size: 0.875rem;
      color: var(--neutral-600);
    }
    
    .rating-breakdown {
      margin-top: var(--space-4);
    }
    
    .rating-bar {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-2);
    }
    
    .rating-label {
      width: 60px;
      font-size: 0.875rem;
      color: var(--neutral-700);
    }
    
    .progress-bar {
      flex: 1;
      height: 8px;
      background-color: var(--neutral-200);
      border-radius: 4px;
      overflow: hidden;
      margin: 0 var(--space-2);
    }
    
    .progress {
      height: 100%;
      background-color: var(--warning);
      border-radius: 4px;
    }
    
    .rating-bar .rating-count {
      width: 30px;
      text-align: right;
      margin-top: 0;
    }
    
    /* Write Review Section */
    .write-review-section {
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--neutral-200);
    }
    
    .write-review-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: var(--space-4);
      color: var(--neutral-900);
    }
    
    .login-prompt {
      padding: var(--space-4);
      background-color: var(--neutral-50);
      border-radius: var(--radius-md);
      text-align: center;
    }
    
    .login-prompt a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }
    
    .form-group {
      margin-bottom: var(--space-4);
    }
    
    label {
      display: block;
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: var(--space-2);
      color: var(--neutral-700);
    }
    
    input, textarea, select {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 1rem;
      transition: border-color var(--transition-fast);
    }
    
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    .error-message {
      color: var(--error);
      font-size: 0.8125rem;
      margin-top: var(--space-1);
    }
    
    .form-actions {
      margin-top: var(--space-4);
    }
    
    .submit-button {
      background-color: var(--primary);
      color: var(--white);
      border: none;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
    
    .submit-button:disabled {
      background-color: var(--neutral-400);
      cursor: not-allowed;
    }
    
    /* Reviews List */
    .reviews-filter {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    
    .reviews-filter label {
      margin-right: var(--space-2);
      margin-bottom: 0;
    }
    
    .reviews-filter select {
      width: auto;
    }
    
    .review-items {
      border-top: 1px solid var(--neutral-200);
      padding-top: var(--space-4);
    }
    
    .no-reviews {
      padding: var(--space-4);
      background-color: var(--neutral-50);
      border-radius: var(--radius-md);
      text-align: center;
      color: var(--neutral-700);
    }
    
    .review-item {
      padding: var(--space-4) 0;
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-3);
    }
    
    .reviewer-info {
      display: flex;
      align-items: center;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: var(--space-3);
    }
    
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .reviewer-name {
      font-weight: 500;
      margin-bottom: var(--space-1);
    }
    
    .review-date {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }
    
    .review-verification {
      display: flex;
      align-items: center;
      color: var(--success);
      font-size: 0.875rem;
    }
    
    .review-verification .material-symbols-outlined {
      font-size: 1rem;
      margin-right: var(--space-1);
    }
    
    .review-rating {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-2);
    }
    
    .review-title {
      font-weight: 600;
      margin-left: var(--space-3);
    }
    
    .review-content p {
      margin: 0;
      line-height: 1.5;
    }
    
    .review-images {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-3);
    }
    
    .review-image {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
    }
    
    .review-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .review-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-3);
    }
    
    .helpful-actions {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      color: var(--neutral-600);
    }
    
    .action-button {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      padding: var(--space-1) var(--space-2);
      margin-left: var(--space-2);
      color: var(--neutral-600);
      cursor: pointer;
      transition: color var(--transition-fast);
    }
    
    .action-button .material-symbols-outlined {
      font-size: 1.125rem;
      margin-right: var(--space-1);
    }
    
    .action-button:hover, .action-button.active {
      color: var(--primary);
    }
    
    .link-button {
      background: none;
      border: none;
      padding: 0;
      color: var(--neutral-600);
      text-decoration: underline;
      font-size: 0.875rem;
      cursor: pointer;
      transition: color var(--transition-fast);
    }
    
    .link-button:hover {
      color: var(--primary);
    }
    
    .load-more {
      margin-top: var(--space-4);
      text-align: center;
    }
    
    .load-more-button {
      background-color: var(--white);
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .load-more-button:hover {
      background-color: var(--primary-50);
    }
    
    @media (max-width: 992px) {
      .reviews-container {
        grid-template-columns: 1fr;
      }
      
      .reviews-summary {
        border-right: none;
        border-bottom: 1px solid var(--neutral-200);
        padding-right: 0;
        padding-bottom: var(--space-6);
        margin-bottom: var(--space-6);
      }
    }
    
    @media (max-width: 576px) {
      .review-header {
        flex-direction: column;
      }
      
      .review-verification {
        margin-top: var(--space-2);
      }
      
      .review-actions {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .review-report {
        margin-top: var(--space-2);
      }
      
      .review-actions-right {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }
    }
    
    .delete-button {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
      border: 1px solid var(--error);
      border-radius: var(--radius-md);
      padding: var(--space-1) var(--space-2);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .delete-button:hover {
      background-color: var(--error);
      color: var(--white);
    }
    
    .delete-button .material-symbols-outlined {
      font-size: 1rem;
    }
    
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: var(--white);
      border-radius: var(--radius-md);
      width: 100%;
      max-width: 400px;
      box-shadow: var(--shadow-lg);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .modal-header h2 {
      font-size: 1.25rem;
      margin: 0;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--neutral-500);
      cursor: pointer;
    }
    
    .modal-body {
      padding: var(--space-4);
    }
    
    .warning {
      color: var(--error);
      font-weight: 500;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4);
      border-top: 1px solid var(--neutral-200);
    }
    
    .btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: none;
    }
    
    .btn.secondary {
      background-color: var(--neutral-200);
      color: var(--neutral-700);
    }
    
    .btn.secondary:hover {
      background-color: var(--neutral-300);
    }
    
    .btn.danger {
      background-color: var(--error);
      color: var(--white);
    }
    
    .btn.danger:hover {
      background-color: var(--error-dark, #d32f2f);
    }
  `]
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: number;
  
  reviews: (Review & { userLiked?: boolean; userDisliked?: boolean })[] = [];
  reviewStats: ReviewStats | null = null;
  ratingBreakdown: { stars: number; count: number; percentage: number }[] = [];
  reviewForm: FormGroup;
  
  isAuthenticated = false;
  isSubmitting = false;
  isLoadingMore = false;
  hasMoreReviews = false;
  sortOption = 'recent';
  currentPage = 1;
  currentUrl = '';
  totalReviews = 0;
  pageSize = 5;
  
  // Delete review confirmation
  showDeleteConfirmation = false;
  reviewToDelete: string | null = null;
  
  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      title: [''],
      comment: ['', Validators.required]
    });
    
    this.currentUrl = window.location.pathname;
  }
  
  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Load reviews and stats
    this.loadReviews();
    this.loadReviewStats();
  }
  
  loadReviews(): void {
    this.reviewService.getReviewsByProductId(
      this.productId, 
      this.sortOption, 
      this.currentPage, 
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (this.currentPage === 1) {
          this.reviews = response.reviews.map(review => ({
            ...review,
            userLiked: false,
            userDisliked: false
          }));
        } else {
          // Append to existing reviews when loading more
          this.reviews = [
            ...this.reviews, 
            ...response.reviews.map(review => ({
              ...review,
              userLiked: false,
              userDisliked: false
            }))
          ];
        }
        
        this.totalReviews = response.total;
        this.hasMoreReviews = (this.currentPage * this.pageSize) < response.total;
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoadingMore = false;
      }
    });
  }
  
  loadReviewStats(): void {
    this.reviewService.getReviewStats(this.productId).subscribe({
      next: (stats) => {
        this.reviewStats = stats;
        this.generateRatingBreakdown();
      },
      error: (error) => {
        console.error('Error loading review stats:', error);
      }
    });
  }
  
  generateRatingBreakdown(): void {
    if (!this.reviewStats) return;
    
    this.ratingBreakdown = [];
    for (let i = 5; i >= 1; i--) {
      const count = this.reviewStats.ratingCounts[i] || 0;
      const percentage = this.reviewStats.totalReviews > 0 
        ? (count / this.reviewStats.totalReviews) * 100 
        : 0;
      
      this.ratingBreakdown.push({
        stars: i,
        count,
        percentage
      });
    }
  }
  
  sortReviews(): void {
    this.currentPage = 1;
    this.loadReviews();
  }
  
  loadMoreReviews(): void {
    this.isLoadingMore = true;
    this.currentPage++;
    
    this.loadReviews();
    
    // Show loading for a realistic effect
    setTimeout(() => {
      this.isLoadingMore = false;
    }, 1000);
  }
  
  onRatingChange(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating);
    this.reviewForm.get('rating')?.markAsTouched();
  }
  
  submitReview(): void {
    if (this.reviewForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    const reviewData: NewReview = {
      productId: this.productId,
      rating: this.reviewForm.value.rating,
      title: this.reviewForm.value.title,
      comment: this.reviewForm.value.comment
    };
    
    this.reviewService.addReview(reviewData).subscribe({
      next: (review) => {
        this.isSubmitting = false;
        
        // Add the new review to the top of the list with userLiked/userDisliked properties
        this.reviews.unshift({
          ...review,
          userLiked: false,
          userDisliked: false
        });
        
        // Reset the form
        this.reviewForm.reset({
          rating: 0,
          title: '',
          comment: ''
        });
        
        // Reload stats
        this.loadReviewStats();
      },
      error: (error) => {
        this.isSubmitting = false;
        alert(error.message || 'Error submitting review');
      }
    });
  }
  
  onLikeReview(reviewId: string): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return;
    
    if (review.userLiked) {
      // If already liked, undo the like
      review.likes = (review.likes || 0) - 1;
      review.userLiked = false;
    } else {
      // Add like and remove dislike if present
      review.likes = (review.likes || 0) + 1;
      if (review.userDisliked) {
        review.dislikes = (review.dislikes || 0) - 1;
        review.userDisliked = false;
      }
      review.userLiked = true;
      
      // Call the service in a real app
      this.reviewService.likeReview(reviewId).subscribe();
    }
  }
  
  onDislikeReview(reviewId: string): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return;
    
    if (review.userDisliked) {
      // If already disliked, undo the dislike
      review.dislikes = (review.dislikes || 0) - 1;
      review.userDisliked = false;
    } else {
      // Add dislike and remove like if present
      review.dislikes = (review.dislikes || 0) + 1;
      if (review.userLiked) {
        review.likes = (review.likes || 0) - 1;
        review.userLiked = false;
      }
      review.userDisliked = true;
      
      // Call the service in a real app
      this.reviewService.dislikeReview(reviewId).subscribe();
    }
  }
  
  reportReview(reviewId: string): void {
    // In a real app, implement report functionality
    this.reviewService.reportReview(reviewId, 'inappropriate').subscribe();
    alert('Review reported! Thank you for your feedback.');
  }
  
  enlargeImage(imageUrl: string): void {
    // In a real app, implement image lightbox/modal
    window.open(imageUrl, '_blank');
  }
  
  isCurrentUserReview(userId: string): boolean {
    if (!this.isAuthenticated) return false;
    
    // Get current user ID from auth service
    const currentUserId = this.authService.getCurrentUserId();
    return userId === currentUserId;
  }
  
  confirmDeleteReview(reviewId: string): void {
    this.reviewToDelete = reviewId;
    this.showDeleteConfirmation = true;
  }
  
  cancelDeleteReview(): void {
    this.reviewToDelete = null;
    this.showDeleteConfirmation = false;
  }
  
  deleteReview(): void {
    if (!this.reviewToDelete) return;
    
    // The deleteReview method in ReviewService expects a productId
    this.reviewService.deleteReview(this.productId).subscribe({
      next: () => {
        // Remove the deleted review from the list
        this.reviews = this.reviews.filter(review => review.id !== this.reviewToDelete);
        
        // Update review stats
        this.loadReviewStats();
        
        // Close the confirmation dialog
        this.cancelDeleteReview();
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        alert(error.message || 'Failed to delete review. Please try again.');
        this.cancelDeleteReview();
      }
    });
  }
}