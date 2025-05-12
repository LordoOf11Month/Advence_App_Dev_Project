import { NotificationService } from './../../../../core/services/notification.service';
// features/catalogue/components/review-form/review-form.component.ts
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService, Review } from '../../services/review.service';

@Component({
  selector: 'app-review-form',
  standalone: false,
  templateUrl: './review-form.component.html'
})
export class ReviewFormComponent implements OnInit {
  @Input() productId!: number;
  @Output() reviewSubmitted = new EventEmitter<Review>();
  reviewForm!: FormGroup;
  submitting: boolean = false;
  error: string | null = null;
  existingReview: Review | null = null;
  isEditMode = false;

  constructor(private fb: FormBuilder, private reviewService: ReviewService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.initForm();
    this.checkExistingReview();
  }

  private initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  private checkExistingReview(): void {
    this.reviewService.getUserReviewForProduct(this.productId).subscribe({
      next: (review) => {
        if (review) {
          this.existingReview = review;
          this.isEditMode = true;
          // Populate form with existing review data
          this.reviewForm.patchValue({
            rating: review.rating,
            comment: review.comment
          });
        }
      },
      error: (err) => {
        console.error('Error checking for existing review', err);
      }
    });
  }

  get f() { return this.reviewForm.controls; }

  onSubmit(): void {
    if (this.reviewForm.invalid || this.submitting) return;
    this.submitting = true;
    this.error = null;
    const reviewData = this.reviewForm.value;  // { rating: number, comment: string }

    // If we're editing an existing review
    if (this.isEditMode && this.existingReview?.id) {
      this.reviewService.updateReview(this.existingReview.id, reviewData).subscribe({
        next: (updatedReview) => {
          this.submitting = false;
          this.notify.showSuccess('Review updated successfully.');
          this.reviewSubmitted.emit(updatedReview);
        },
        error: err => {
          this.submitting = false;
          this.error = 'Failed to update review. Please try again.';
          if (err.error && err.error.message) {
            this.error = err.error.message;
          }
        }
      });
    } else {
      // Creating a new review
      this.reviewService.addReview(this.productId, reviewData).subscribe({
        next: (savedReview) => {
          this.submitting = false;
          this.existingReview = savedReview;
          this.isEditMode = true;
          this.notify.showSuccess('Review submitted successfully.');
          this.reviewSubmitted.emit(savedReview);
        },
        error: err => {
          this.submitting = false;
          this.error = 'Failed to submit review. Please try again.';
          if (err.error && err.error.message) {
            this.error = err.error.message;
          }
        }
      });
    }
  }
}
