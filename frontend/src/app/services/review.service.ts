import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Review, ReviewStats, NewReview } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  // Mock data for reviews
  private reviews: Review[] = [
    {
      id: '1',
      productId: 1001,
      userId: 'user1',
      userName: 'John Doe',
      userImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      rating: 5,
      title: 'Great product!',
      comment: 'I love this product. Very high quality and worth the price.',
      images: ['https://via.placeholder.com/400x300?text=Product+Image+1'],
      isVerifiedPurchase: true,
      likes: 12,
      dislikes: 2,
      createdAt: new Date('2023-04-27')
    },
    {
      id: '2',
      productId: 1001,
      userId: 'user2',
      userName: 'Jane Smith',
      userImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      rating: 4,
      title: 'Good but could be better',
      comment: 'The product is good, but it has some minor issues. Overall satisfied with the purchase.',
      images: [],
      isVerifiedPurchase: true,
      likes: 5,
      dislikes: 1,
      createdAt: new Date('2023-04-19')
    },
    {
      id: '3',
      productId: 1001,
      userId: 'user3',
      userName: 'Mike Johnson',
      userImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      rating: 3,
      title: 'Average product',
      comment: "It's okay, but not worth the price. There are better alternatives available.",
      images: [],
      isVerifiedPurchase: false,
      likes: 3,
      dislikes: 4,
      createdAt: new Date('2023-04-04')
    },
    {
      id: '4',
      productId: 1001,
      userId: 'user4',
      userName: 'Emily Davis',
      userImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      rating: 5,
      title: 'Exceeded my expectations',
      comment: 'This product has exceeded all my expectations. The quality is outstanding and it performs even better than advertised. Highly recommend!',
      images: ['https://via.placeholder.com/400x300?text=Review+Image+1', 'https://via.placeholder.com/400x300?text=Review+Image+2'],
      isVerifiedPurchase: true,
      likes: 18,
      dislikes: 0,
      createdAt: new Date('2023-05-15')
    },
    {
      id: '5',
      productId: 1001,
      userId: 'user5',
      userName: 'Robert Wilson',
      userImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      rating: 2,
      title: 'Disappointed with quality',
      comment: 'I was really looking forward to this product, but the quality is poor. It started showing issues within just a week of use.',
      images: ['https://via.placeholder.com/400x300?text=Quality+Issue+Image'],
      isVerifiedPurchase: true,
      likes: 7,
      dislikes: 3,
      createdAt: new Date('2023-06-02')
    },
    {
      id: '6',
      productId: 1001,
      userId: 'user6',
      userName: 'Sarah Thompson',
      userImage: 'https://randomuser.me/api/portraits/women/3.jpg',
      rating: 4,
      title: 'Great value for money',
      comment: 'This product offers exceptional value for the price point. It has all the features I need and works reliably.',
      images: [],
      isVerifiedPurchase: true,
      likes: 9,
      dislikes: 1,
      createdAt: new Date('2023-05-28')
    },
    {
      id: '7',
      productId: 1001,
      userId: 'user7',
      userName: 'David Brown',
      userImage: 'https://randomuser.me/api/portraits/men/4.jpg',
      rating: 1,
      title: 'Waste of money',
      comment: 'Absolutely terrible product. Broke within days and customer service was no help at all. Stay away!',
      images: [],
      isVerifiedPurchase: true,
      likes: 15,
      dislikes: 5,
      createdAt: new Date('2023-06-10')
    },
    {
      id: '8',
      productId: 1001,
      userId: 'user8',
      userName: 'Lisa Martinez',
      userImage: 'https://randomuser.me/api/portraits/women/4.jpg',
      rating: 5,
      title: 'Perfect for my needs',
      comment: 'I\'ve been using this product daily for a month now and it\'s perfect for my needs. The design is elegant and functionality is top-notch.',
      images: ['https://via.placeholder.com/400x300?text=Product+In+Use'],
      isVerifiedPurchase: false,
      likes: 6,
      dislikes: 0,
      createdAt: new Date('2023-05-05')
    },
    {
      id: '9',
      productId: 1001,
      userId: 'user9',
      userName: 'Michael Taylor',
      userImage: 'https://randomuser.me/api/portraits/men/5.jpg',
      rating: 3,
      title: 'Mixed feelings',
      comment: 'I have mixed feelings about this product. Some features are great while others feel unpolished. It works for now but I might look for alternatives.',
      images: [],
      isVerifiedPurchase: true,
      likes: 4,
      dislikes: 2,
      createdAt: new Date('2023-04-12')
    },
    {
      id: '10',
      productId: 1001,
      userId: 'user10',
      userName: 'Jennifer Adams',
      userImage: 'https://randomuser.me/api/portraits/women/5.jpg',
      rating: 4,
      title: 'Very happy with purchase',
      comment: 'I\'m very happy with my purchase. The product arrived quickly and works as described. The only minor issue is the battery life could be better.',
      images: [],
      isVerifiedPurchase: true,
      likes: 8,
      dislikes: 1,
      createdAt: new Date('2023-05-20')
    },
    // Reviews for product ID 2
    {
      id: '11',
      productId: 2,
      userId: 'user1',
      userName: 'John Doe',
      userImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      rating: 4,
      title: 'Solid purchase',
      comment: 'Reliable product with good features. I\'ve been using it for several weeks with no issues.',
      images: [],
      isVerifiedPurchase: true,
      likes: 5,
      dislikes: 1,
      createdAt: new Date('2023-05-10')
    },
    {
      id: '12',
      productId: 2,
      userId: 'user5',
      userName: 'Robert Wilson',
      userImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      rating: 5,
      title: 'Best in its class',
      comment: 'I\'ve tried many similar products and this one is by far the best in its class. Worth every penny!',
      images: ['https://via.placeholder.com/400x300?text=Product+Comparison'],
      isVerifiedPurchase: true,
      likes: 12,
      dislikes: 0,
      createdAt: new Date('2023-06-05')
    },
    {
      id: '13',
      productId: 2,
      userId: 'user7',
      userName: 'David Brown',
      userImage: 'https://randomuser.me/api/portraits/men/4.jpg',
      rating: 3,
      title: 'Decent but overpriced',
      comment: 'The product works as advertised but I think it\'s overpriced for what it offers. There are cheaper alternatives with similar features.',
      images: [],
      isVerifiedPurchase: false,
      likes: 3,
      dislikes: 2,
      createdAt: new Date('2023-04-28')
    }
  ];

  constructor() { }

  getReviewsByProductId(productId: number, sortOption: string = 'recent', page: number = 1, limit: number = 5): Observable<{ reviews: Review[], total: number }> {
    // Filter reviews by product ID
    let filteredReviews = this.reviews.filter(review => review.productId === productId);
    
    // Sort reviews based on option
    switch (sortOption) {
      case 'recent':
        filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'helpful':
        filteredReviews.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'highest':
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
    
    return of({
      reviews: paginatedReviews,
      total: filteredReviews.length
    }).pipe(delay(800));
  }

  getReviewStats(productId: number): Observable<ReviewStats> {
    const productReviews = this.reviews.filter(review => review.productId === productId);
    
    // Calculate average rating
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = productReviews.length > 0 ? totalRating / productReviews.length : 0;
    
    // Count ratings by star
    const ratingCounts: {[key: number]: number} = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    productReviews.forEach(review => {
      if (ratingCounts[review.rating] !== undefined) {
        ratingCounts[review.rating]++;
      }
    });
    
    return of({
      averageRating,
      totalReviews: productReviews.length,
      ratingCounts
    }).pipe(delay(500));
  }

  addReview(reviewData: NewReview): Observable<Review> {
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      productId: reviewData.productId,
      userId: 'user1', // This would come from auth service in a real app
      userName: 'Current User',
      userImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      rating: reviewData.rating,
      title: reviewData.title || '',
      comment: reviewData.comment,
      images: reviewData.images || [],
      isVerifiedPurchase: true,
      likes: 0,
      dislikes: 0,
      createdAt: new Date()
    };
    
    this.reviews.unshift(newReview);
    
    return of(newReview).pipe(delay(1000));
  }

  deleteReview(reviewId: string): Observable<boolean> {
    const index = this.reviews.findIndex(review => review.id === reviewId);
    
    if (index !== -1) {
      this.reviews.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    
    return of(false).pipe(delay(500));
  }

  likeReview(reviewId: string): Observable<Review> {
    const review = this.reviews.find(r => r.id === reviewId);
    
    if (review) {
      if (!review.likes) review.likes = 0;
      review.likes++;
      return of({...review}).pipe(delay(300));
    }
    
    throw new Error('Review not found');
  }

  dislikeReview(reviewId: string): Observable<Review> {
    const review = this.reviews.find(r => r.id === reviewId);
    
    if (review) {
      if (!review.dislikes) review.dislikes = 0;
      review.dislikes++;
      return of({...review}).pipe(delay(300));
    }
    
    throw new Error('Review not found');
  }

  updateReview(reviewId: string, data: Partial<NewReview>): Observable<Review> {
    const review = this.reviews.find(r => r.id === reviewId);
    
    if (review) {
      if (data.rating !== undefined) review.rating = data.rating;
      if (data.title !== undefined) review.title = data.title;
      if (data.comment !== undefined) review.comment = data.comment;
      if (data.images !== undefined) review.images = data.images;
      
      review.updatedAt = new Date();
      
      return of({...review}).pipe(delay(1000));
    }
    
    throw new Error('Review not found');
  }
} 