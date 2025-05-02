export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'seller' | 'user';
  storeName?: string;
  storeDescription?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SellerRegistrationData extends RegisterData {
  storeName: string;
  storeDescription: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  rating: number;
  productCount: number;
  totalSales: number;
  dateJoined: Date;
  status: 'active' | 'suspended';
}
