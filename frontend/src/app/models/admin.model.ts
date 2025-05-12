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
  description?: string;
  imageUrl?: string;
  freeShipping?: boolean;
  fastDelivery?: boolean;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userEmail: string;
  customerName: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
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
  activeProducts: number;
  monthlySales: number[];
  topSellingCategories: Array<{
    name: string;
    count: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    date: Date;
    total: number;
    status: AdminOrder['status'];
  }>;
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
  storeDescription?: string;
  status: 'active' | 'suspended' | 'banned';
  dateJoined: Date;
  lastActive: Date;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  productCount: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
  commissionRate: number;
  paymentInfo?: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
  };
}

export interface AdminReview {
  id?: string;
  productId: number;
  userId: number;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  dateCreated?: Date;
  createdAt: Date;
  approved: boolean;
  status?: 'approved' | 'pending';
}
