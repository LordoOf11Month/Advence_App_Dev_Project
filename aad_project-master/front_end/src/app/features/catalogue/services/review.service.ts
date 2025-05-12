import { environment } from './../../../../environments/environment.development';
// features/catalogue/services/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

export interface Review {
  id?: number;
  productId: number;
  userId?: number;
  username?: string;
  userName?: string;
  rating: number;
  comment: string;
  date?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getReviews(productId: number): Observable<Review[]> {
    return this.http.get<any>(`${this.apiUrl}/reviews/product/${productId}`)
      .pipe(map(response => {
        const reviews = response.data || [];
        return reviews.map((review: Review) => ({
          ...review,
          date: review.createdAt || review.date
        }));
      }));
  }

  getUserReviews(): Observable<Review[]> {
    return this.http.get<any>(`${this.apiUrl}/reviews/user`)
      .pipe(map(response => {
        const reviews = response.data || [];
        return reviews.map((review: Review) => ({
          ...review,
          date: review.createdAt || review.date
        }));
      }));
  }

  getUserReviewForProduct(productId: number): Observable<Review | null> {
    return this.getUserReviews().pipe(
      map(reviews => {
        const review = reviews.find(r => r.productId === productId);
        return review || null;
      })
    );
  }

  addReview(productId: number, review: { rating: number, comment: string }): Observable<Review> {
    const reviewDTO = {
      ...review,
      productId: productId
    };

    return this.http.post<any>(`${this.apiUrl}/reviews`, reviewDTO)
      .pipe(map(response => {
        const review = response.data;
        return {
          ...review,
          date: review.createdAt || review.date
        };
      }));
  }

  updateReview(reviewId: number, review: { rating: number, comment: string }): Observable<Review> {
    return this.http.put<any>(`${this.apiUrl}/reviews/${reviewId}`, review)
      .pipe(map(response => {
        const review = response.data;
        return {
          ...review,
          date: review.createdAt || review.date
        };
      }));
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/reviews/${reviewId}`)
      .pipe(map(response => undefined));
  }
}
