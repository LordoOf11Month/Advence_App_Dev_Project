export interface Review {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  title?: string;
  createdAt: Date;
  updatedAt?: Date;
  likes?: number;
  dislikes?: number;
  userImage?: string;
  isVerifiedPurchase?: boolean;
  images?: string[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    [key: number]: number; // e.g., { 5: 10, 4: 5, 3: 3, 2: 1, 1: 0 }
  };
}

export interface ReviewRequest {
  productId: number;
  rating: number;
  comment: string;
  title?: string;
  images?: string[];
} 