import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { delay, map, tap, take, switchMap } from 'rxjs/operators';
import { Review, ReviewStats, ReviewRequest } from '../models/review.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private mockReviews: Review[] = [
    {
      id: '1',
      productId: 1001,
      userId: 'user1',
      userName: 'John Doe',
      rating: 5,
      title: 'Great product!',
      comment: 'I love this product. Very high quality and worth the price.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      likes: 12,
      dislikes: 2,
      isVerifiedPurchase: true,
      userImage: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: '2',
      productId: 1001,
      userId: 'user2',
      userName: 'Jane Smith',
      rating: 4,
      title: 'Good but could be better',
      comment: 'The product is good, but it has some minor issues. Overall satisfied with the purchase.',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      likes: 5,
      dislikes: 1,
      isVerifiedPurchase: true,
      userImage: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: '3',
      productId: 1001,
      userId: 'user3',
      userName: 'Mike Johnson',
      rating: 3,
      title: 'Average product',
      comment: 'It\'s okay, but not worth the price. There are better alternatives available.',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      likes: 3,
      dislikes: 4,
      isVerifiedPurchase: false,
      userImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      id: '4',
      productId: 1002,
      userId: 'user4',
      userName: 'Lisa Brown',
      rating: 5,
      title: 'Excellent!',
      comment: 'This is exactly what I was looking for. Amazing quality and fast delivery.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      likes: 8,
      dislikes: 0,
      isVerifiedPurchase: true,
      userImage: 'https://randomuser.me/api/portraits/women/4.jpg'
    },
    {
      id: '5',
      productId: 1002,
      userId: 'user5',
      userName: 'David Williams',
      rating: 2,
      title: 'Disappointed',
      comment: 'Not what I expected. The quality is poor and it doesn\'t match the description.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      likes: 2,
      dislikes: 7,
      isVerifiedPurchase: true,
      userImage: 'https://randomuser.me/api/portraits/men/5.jpg'
    }
  ];

  private reviewsSubject = new BehaviorSubject<Review[]>(this.mockReviews);
  reviews$ = this.reviewsSubject.asObservable();

  constructor(private authService: AuthService) {}

  getReviewsByProductId(productId: number, sortBy: string = 'recent'): Observable<Review[]> {
    return this.reviews$.pipe(
      map(reviews => reviews.filter(review => review.productId === productId)),
      map(reviews => this.sortReviews(reviews, sortBy)),
      delay(500) // Simulate network delay
    );
  }

  getReviewStats(productId: number): Observable<ReviewStats> {
    return this.reviews$.pipe(
      map(reviews => {
        const productReviews = reviews.filter(review => review.productId === productId);
        const totalReviews = productReviews.length;
        let totalRating = 0;
        
        const ratingCounts: {[key: number]: number} = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        
        productReviews.forEach(review => {
          totalRating += review.rating;
          if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating]++;
          }
        });
        
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        
        return {
          averageRating,
          totalReviews,
          ratingCounts
        };
      }),
      delay(300) // Simulate network delay
    );
  }

  addReview(reviewRequest: ReviewRequest): Observable<Review> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error('User must be logged in to add a review'));
        }
        
        const newReview: Review = {
          id: Math.random().toString(36).substring(2, 10),
          productId: reviewRequest.productId,
          userId: currentUser.id,
          userName: `${currentUser.firstName} ${currentUser.lastName}`,
          rating: reviewRequest.rating,
          title: reviewRequest.title || '',
          comment: reviewRequest.comment,
          createdAt: new Date(),
          likes: 0,
          dislikes: 0,
          isVerifiedPurchase: true, // This would come from order history in a real app
          userImage: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 10) + 1}.jpg`, // Mock image
          images: reviewRequest.images
        };
        
        const currentReviews = this.reviewsSubject.getValue();
        const updatedReviews = [newReview, ...currentReviews];
        this.reviewsSubject.next(updatedReviews);
        
        return of(newReview).pipe(delay(800)); // Simulate network delay
      })
    );
  }

  updateReview(id: string, reviewRequest: Partial<ReviewRequest>): Observable<Review> {
    const currentReviews = this.reviewsSubject.getValue();
    const reviewIndex = currentReviews.findIndex(review => review.id === id);
    
    if (reviewIndex === -1) {
      return throwError(() => new Error('Review not found'));
    }
    
    const updatedReview = {
      ...currentReviews[reviewIndex],
      ...reviewRequest,
      updatedAt: new Date()
    };
    
    const updatedReviews = [...currentReviews];
    updatedReviews[reviewIndex] = updatedReview;
    this.reviewsSubject.next(updatedReviews);
    
    return of(updatedReview).pipe(delay(800)); // Simulate network delay
  }

  deleteReview(id: string): Observable<boolean> {
    const currentReviews = this.reviewsSubject.getValue();
    const updatedReviews = currentReviews.filter(review => review.id !== id);
    
    if (currentReviews.length === updatedReviews.length) {
      return of(false).pipe(delay(300)); // Review not found
    }
    
    this.reviewsSubject.next(updatedReviews);
    return of(true).pipe(delay(800)); // Simulate network delay
  }

  likeReview(id: string): Observable<Review> {
    return this.updateReviewLikes(id, 'like');
  }

  dislikeReview(id: string): Observable<Review> {
    return this.updateReviewLikes(id, 'dislike');
  }

  private updateReviewLikes(id: string, action: 'like' | 'dislike'): Observable<Review> {
    const currentReviews = this.reviewsSubject.getValue();
    const reviewIndex = currentReviews.findIndex(review => review.id === id);
    
    if (reviewIndex === -1) {
      return throwError(() => new Error('Review not found'));
    }
    
    const updatedReview = { ...currentReviews[reviewIndex] };
    
    if (action === 'like') {
      updatedReview.likes = (updatedReview.likes || 0) + 1;
    } else {
      updatedReview.dislikes = (updatedReview.dislikes || 0) + 1;
    }
    
    const updatedReviews = [...currentReviews];
    updatedReviews[reviewIndex] = updatedReview;
    this.reviewsSubject.next(updatedReviews);
    
    return of(updatedReview).pipe(delay(300)); // Simulate network delay
  }

  private sortReviews(reviews: Review[], sortBy: string): Review[] {
    const sortedReviews = [...reviews];
    
    switch (sortBy) {
      case 'recent':
        return sortedReviews.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'helpful':
        return sortedReviews.sort((a, b) => 
          ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0)));
      case 'highest':
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sortedReviews.sort((a, b) => a.rating - b.rating);
      default:
        return sortedReviews;
    }
  }
} 