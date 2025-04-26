export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  lastUpdated: Date;
}

export interface AdminOrder {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'banned';
  role: 'user' | 'admin';
  joinDate: Date;
  lastLogin: Date;
  orderCount: number;
  totalSpent: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
}