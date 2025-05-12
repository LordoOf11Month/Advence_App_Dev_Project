export interface Product {
  id: number;
  title: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  brand: string;
  rating: number;
  reviewCount: number;
  images: string[];
  colors?: string[];
  sizes?: string[];
  freeShipping?: boolean;
  fastDelivery?: boolean;
  inStock: boolean;
  stockQuantity?: number;
  sellerId: string;
  sellerName: string;
  variants?: ProductVariant[];
  isFavorite?: boolean;
  storeId?: number;
  storeName?: string;
  addedToCart?: boolean;
  quantity?: number;
  category?: string | Category;
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
  parentCategory?: Category;
  parentCategoryId?: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
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
