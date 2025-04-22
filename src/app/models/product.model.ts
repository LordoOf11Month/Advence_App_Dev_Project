export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  description: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  images: string[];
  colors?: string[];
  sizes?: string[];
  isFavorite?: boolean;
  inStock: boolean;
  freeShipping?: boolean;
  fastDelivery?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  subcategories?: Category[];
}

export interface Banner {
  id: number;
  imageUrl: string;
  title: string;
  subtitle?: string;
  linkUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}