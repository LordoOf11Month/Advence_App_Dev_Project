import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, shareReplay, tap } from 'rxjs/operators';
import { Review, ReviewStats, NewReview } from '../models/review.model';
import { environment } from '../../environments/environment';

interface ReviewResponse {
  reviews: any[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;
  private cache = new Map<string, Observable<{ reviews: Review[], total: number }>>();

  constructor(private http: HttpClient) { }

  getReviewsByProductId(productId: number, sortOption: string = 'recent', page: number = 1, limit: number = 5): Observable<{ reviews: Review[], total: number }> {
    const cacheKey = `reviews_${productId}_${sortOption}_${page}_${limit}`;
    
    if (!this.cache.has(cacheKey)) {
      const request = this.http.get<ReviewResponse>(`${this.apiUrl}/reviews/product/${productId}?sort=${sortOption}&page=${page}&limit=${limit}`)
        .pipe(
          retry(2), // Retry failed requests up to 2 times
          map(response => {
            return {
              reviews: (response.reviews || []).map(review => this.mapReviewFromApi(review)),
              total: response.total || 0
            };
          }),
          tap(data => console.log(`Fetched ${data.reviews.length} reviews for product ${productId}`)),
          catchError(error => {
            console.error('Error fetching reviews:', error);
            return of({ reviews: [], total: 0 });
          }),
          shareReplay(1) // Cache the result
        );
        
      this.cache.set(cacheKey, request);
    }
    
    return this.cache.get(cacheKey)!;
  }

  clearCache(productId?: number): void {
    if (productId) {
      // Clear only cache entries for this product
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(`reviews_${productId}`))
        .forEach(key => this.cache.delete(key));
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  getReviewStats(productId: number): Observable<ReviewStats> {
    return this.http.get<any>(`${this.apiUrl}/products/${productId}/review-stats`)
      .pipe(
        retry(2),
        map(response => ({
          averageRating: response.averageRating || 0,
          totalReviews: response.totalReviews || 0,
          ratingCounts: response.ratingCounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        })),
        catchError(error => {
          console.error('Error fetching review stats:', error);
          return of({
            averageRating: 0,
            totalReviews: 0,
            ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          });
        })
      );
  }

  addReview(reviewData: NewReview): Observable<Review> {
    const reviewRequest = {
      productId: reviewData.productId,
      rating: reviewData.rating,
      comment: reviewData.comment || ''
    };

    return this.http.post<any>(`${this.apiUrl}/reviews`, reviewRequest)
      .pipe(
        map(response => this.mapReviewFromApi(response)),
        tap(() => {
          // Clear the cache for this product to force refresh
          this.clearCache(reviewData.productId);
        }),
        catchError(error => {
          console.error('Error adding review:', error);
          const errorMsg = error.error && error.error.message 
            ? error.error.message 
            : 'Failed to add review. Please try again.';
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  updateReview(productId: number, updateData: { rating: number, comment: string }): Observable<Review> {
    const reviewRequest = {
      productId: productId,
      rating: updateData.rating,
      comment: updateData.comment || ''
    };

    return this.http.put<any>(`${this.apiUrl}/reviews/${productId}`, reviewRequest)
      .pipe(
        map(response => this.mapReviewFromApi(response)),
        tap(() => {
          // Clear the cache for this product to force refresh
          this.clearCache(productId);
        }),
        catchError(error => {
          console.error('Error updating review:', error);
          const errorMsg = error.error && error.error.message 
            ? error.error.message 
            : 'Failed to update review. Please try again.';
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  deleteReview(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${productId}`)
      .pipe(
        tap(() => {
          // Clear the cache for this product to force refresh
          this.clearCache(productId);
        }),
        catchError(error => {
          console.error('Error deleting review:', error);
          const errorMsg = error.error && error.error.message 
            ? error.error.message 
            : 'Failed to delete review. Please try again.';
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  likeReview(reviewId: string): Observable<void> {
    // This would be implemented when backend supports this feature
    return of(undefined);
  }

  dislikeReview(reviewId: string): Observable<void> {
    // This would be implemented when backend supports this feature
    return of(undefined);
  }

  reportReview(reviewId: string, reason: string): Observable<void> {
    // This would be implemented when backend supports this feature
    return of(undefined);
  }

  private mapReviewFromApi(apiReview: any): Review {
    if (!apiReview) {
      console.warn('Invalid review data received:', apiReview);
      return {
        id: 'unknown',
        productId: 0,
        userId: 'unknown',
        userName: 'Anonymous',
        rating: 0,
        comment: '',
        createdAt: new Date(),
        isVerifiedPurchase: false,
        likes: 0,
        dislikes: 0
      };
    }

    return {
      id: apiReview.id.toString(),
      productId: apiReview.productId,
      userId: apiReview.userId.toString(),
      userName: apiReview.userName || 'Anonymous',
      rating: apiReview.rating,
      comment: apiReview.comment,
      createdAt: new Date(apiReview.createdAt),
      updatedAt: apiReview.updatedAt ? new Date(apiReview.updatedAt) : undefined,
      isVerifiedPurchase: apiReview.verifiedPurchase || false,
      likes: 0,
      dislikes: 0
    };
  }
} 