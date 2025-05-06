export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'seller' | 'user';
  storeName?: string;
  storeDescription?: string;
  permissions?: Permission[];
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  avatar_url?: string;
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
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
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

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export type PermissionName = 
  // Product permissions
  | 'products:view' | 'products:create' | 'products:edit' | 'products:delete'
  // Order permissions
  | 'orders:view' | 'orders:manage' | 'orders:viewAll'
  // User permissions
  | 'users:view' | 'users:edit' | 'users:ban'
  // Seller permissions
  | 'sellers:view' | 'sellers:approve' | 'sellers:suspend'
  // Analytics permissions
  | 'analytics:view' | 'analytics:export'
  // Legacy permissions (for backward compatibility)
  | 'product:create' | 'product:read' | 'product:update' | 'product:delete'
  | 'order:create' | 'order:read' | 'order:update' | 'order:cancel'
  | 'user:create' | 'user:read' | 'user:update' | 'user:delete'
  | 'seller:create' | 'seller:read' | 'seller:update' | 'seller:delete'
  | 'review:create' | 'review:read' | 'review:update' | 'review:delete';
