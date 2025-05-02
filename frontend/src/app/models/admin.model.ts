export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  inStock: boolean;
  stock: number;
  sellerId: string;
  sellerName: string;
  dateAdded: Date;
  lastUpdated: Date;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userEmail: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  sellerId: string;
  sellerName: string;
  dateCreated: Date;
  dateUpdated: Date;
  createdAt: Date;
  shippingAddress: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'seller' | 'user';
  status: 'active' | 'suspended' | 'banned';
  dateJoined: Date;
  lastLogin?: Date;
  joinDate: Date;
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
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalSellers: number;
  activeUsers: number;
  lowStockProducts: number;
}

export interface OrderTracking {
  orderId: string;
  status: AdminOrder['status'];
  location: string;
  updatedAt: Date;
}

export interface UserTransaction {
  transactionId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
}

export interface AdminSeller {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  storeName: string;
  storeDescription: string;
  rating: number;
  productCount: number;
  totalSales: number;
  status: 'active' | 'suspended';
  dateJoined: Date;
  lastActive: Date;
  commissionRate: number;
  paymentInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}
