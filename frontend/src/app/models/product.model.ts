export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  images: string[];
  colors?: string[];
  sizes?: string[];
  freeShipping?: boolean;
  fastDelivery?: boolean;
  inStock: boolean;
  sellerId: string;
  sellerName: string;
  variants?: ProductVariant[];
  isFavorite?: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  color?: string;
  size?: string;
  price?: number;
  inStock: boolean;
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
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
}

export interface CartItem {
  id?: number;
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
