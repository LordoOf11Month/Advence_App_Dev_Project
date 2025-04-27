import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  AdminProduct, 
  AdminOrder, 
  AdminUser, 
  OrderStats, 
  AdminStats,
  OrderTracking,
  UserTransaction
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Mock data
  private products: AdminProduct[] = [
    {
      id: '1',
      title: 'Men\'s Casual T-Shirt',
      price: 199.99,
      stock: 50,
      status: 'active',
      lastUpdated: new Date()
    },
    {
      id: '2',
      title: 'Women\'s Summer Dress',
      price: 349.99,
      stock: 30,
      status: 'active',
      lastUpdated: new Date()
    }
  ];

  private orders: AdminOrder[] = [
    {
      id: '1',
      userId: '2',
      status: 'processing',
      total: 199.99,
      items: [
        { productId: '1', quantity: 1, price: 199.99 }
      ],
      shippingAddress: '123 Main St, City, Country',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private users: AdminUser[] = [
    {
      id: '2',
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      status: 'active',
      role: 'user',
      joinDate: new Date(),
      lastLogin: new Date(),
      orderCount: 1,
      totalSpent: 199.99
    }
  ];

  constructor() {}

  // Product Management
  getProducts(): Observable<AdminProduct[]> {
    return of(this.products).pipe(delay(500));
  }

  updateProduct(product: AdminProduct): Observable<AdminProduct> {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index === -1) {
      return throwError(() => new Error('Product not found'));
    }
    
    this.products[index] = { ...product, lastUpdated: new Date() };
    return of(this.products[index]).pipe(delay(500));
  }

  deleteProduct(productId: string): Observable<void> {
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) {
      return throwError(() => new Error('Product not found'));
    }
    
    this.products.splice(index, 1);
    return of(void 0).pipe(delay(500));
  }

  // Order Management
  getOrders(): Observable<AdminOrder[]> {
    return of(this.orders).pipe(delay(500));
  }

  updateOrderStatus(orderId: string, status: AdminOrder['status']): Observable<AdminOrder> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      return throwError(() => new Error('Order not found'));
    }
    
    order.status = status;
    order.updatedAt = new Date();
    return of(order).pipe(delay(500));
  }

  getOrderStats(): Observable<OrderStats> {
    const stats: OrderStats = {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      processing: this.orders.filter(o => o.status === 'processing').length,
      shipped: this.orders.filter(o => o.status === 'shipped').length,
      delivered: this.orders.filter(o => o.status === 'delivered').length,
      cancelled: this.orders.filter(o => o.status === 'cancelled').length
    };
    
    return of(stats).pipe(delay(500));
  }

  // Order Tracking
  getOrderTracking(orderId: string): Observable<OrderTracking> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      return throwError(() => new Error('Order not found'));
    }

    const tracking: OrderTracking = {
      orderId: order.id,
      status: order.status,
      location: 'Warehouse', // Example location
      updatedAt: order.updatedAt
    };

    return of(tracking).pipe(delay(500));
  }

  // User Management
  getUsers(): Observable<AdminUser[]> {
    return of(this.users).pipe(delay(500));
  }

  updateUserStatus(userId: string, status: 'active' | 'banned'): Observable<AdminUser> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    
    user.status = status;
    return of(user).pipe(delay(500));
  }

  banUser(userId: string): Observable<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    user.status = 'banned';
    return of(void 0).pipe(delay(500));
  }

  unbanUser(userId: string): Observable<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    user.status = 'active';
    return of(void 0).pipe(delay(500));
  }

  getUserTransactions(userId: string): Observable<UserTransaction[]> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    // Mock transactions data
    const transactions: UserTransaction[] = this.orders
      .filter(o => o.userId === userId)
      .map(o => ({
        transactionId: o.id,
        userId: o.userId,
        amount: o.total,
        status: o.status === 'cancelled' ? 'failed' : o.status === 'pending' ? 'pending' : 'success',
        createdAt: o.createdAt
      }));

    return of(transactions).pipe(delay(500));
  }

  // Dashboard Stats
  getAdminStats(): Observable<AdminStats> {
    const stats: AdminStats = {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'active').length,
      totalOrders: this.orders.length,
      totalRevenue: this.orders.reduce((sum, order) => sum + order.total, 0),
      lowStockProducts: this.products.filter(p => p.stock < 10).length
    };
    
    return of(stats).pipe(delay(500));
  }

  // Issue Resolution
  resolvePaymentIssue(orderId: string): Observable<void> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      return throwError(() => new Error('Order not found'));
    }

    if (order.status !== 'pending') {
      return throwError(() => new Error('Order is not in pending state'));
    }

    order.status = 'processing';
    order.updatedAt = new Date();
    return of(void 0).pipe(delay(500));
  }

  resolveOrderIssue(orderId: string): Observable<void> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      return throwError(() => new Error('Order not found'));
    }

    order.status = 'processing';
    order.updatedAt = new Date();
    return of(void 0).pipe(delay(500));
  }
}
