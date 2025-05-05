import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SellerService } from '../../services/seller.service';
import { Product } from '../../models/product.model';
import { AdminOrder } from '../../models/admin.model';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="seller-container">
      <aside class="seller-sidebar">
        <nav class="seller-nav">
          <a routerLink="/seller" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <span class="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a routerLink="/seller/products" routerLinkActive="active">
            <span class="material-symbols-outlined">inventory_2</span>
            Products
          </a>
          <a routerLink="/seller/orders" routerLinkActive="active">
            <span class="material-symbols-outlined">local_shipping</span>
            Orders
          </a>
          <a routerLink="/seller/profile" routerLinkActive="active">
            <span class="material-symbols-outlined">store</span>
            Store Profile
          </a>
        </nav>
      </aside>

      <main class="seller-content">
        <div class="seller-header">
          <div class="header-content">
            <h1>Welcome back, {{storeName}}</h1>
            <p>Here's what's happening with your store today.</p>
          </div>
        </div>

        <div class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-icon orders">
              <span class="material-symbols-outlined">local_shipping</span>
            </div>
            <div class="stat-content">
              <h3>Orders Today</h3>
              <p class="stat-value">{{todayOrders}}</p>
              <p class="stat-change positive" *ngIf="orderChange > 0">+{{orderChange}}% from yesterday</p>
              <p class="stat-change negative" *ngIf="orderChange < 0">{{orderChange}}% from yesterday</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon revenue">
              <span class="material-symbols-outlined">payments</span>
            </div>
            <div class="stat-content">
              <h3>Revenue Today</h3>
              <p class="stat-value">₺{{todayRevenue.toLocaleString()}}</p>
              <p class="stat-change positive" *ngIf="revenueChange > 0">+{{revenueChange}}% from yesterday</p>
              <p class="stat-change negative" *ngIf="revenueChange < 0">{{revenueChange}}% from yesterday</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon products">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
            <div class="stat-content">
              <h3>Active Products</h3>
              <p class="stat-value">{{activeProducts}}</p>
              <p class="stat-note">{{lowStockProducts}} low in stock</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon rating">
              <span class="material-symbols-outlined">star</span>
            </div>
            <div class="stat-content">
              <h3>Store Rating</h3>
              <p class="stat-value">{{rating.toFixed(1)}}</p>
              <p class="stat-note">{{totalReviews}} total reviews</p>
            </div>
          </div>
        </div>

        <div class="dashboard-sections">
          <section class="recent-orders">
            <div class="section-header">
              <h2>Recent Orders</h2>
              <a routerLink="/seller/orders" class="view-all">View All</a>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of recentOrders">
                    <td>#{{order.id}}</td>
                    <td>{{order.userEmail}}</td>
                    <td>{{order.items.length}} items</td>
                    <td>₺{{order.totalAmount.toLocaleString()}}</td>
                    <td>
                      <span class="status-badge" [class]="order.status">
                        {{order.status}}
                      </span>
                    </td>
                    <td>{{order.dateCreated | date:'short'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="low-stock-products">
            <div class="section-header">
              <h2>Low Stock Products</h2>
              <a routerLink="/seller/products" class="view-all">View All Products</a>
            </div>
            
            <div class="products-grid">
              <div class="product-card" *ngFor="let product of lowStockItems">
                <img [src]="product.images[0]" [alt]="product.title">
                <div class="product-info">
                  <h3>{{product.title}}</h3>
                  <p class="price">₺{{product.price.toLocaleString()}}</p>
                  <p class="stock warning">Only {{product.stock}} left in stock</p>
                </div>
                <button class="update-stock-btn">Update Stock</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .seller-container {
      display: flex;
      min-height: calc(100vh - 140px);
    }

    .seller-sidebar {
      width: 250px;
      background-color: var(--white);
      border-right: 1px solid var(--neutral-200);
      padding: var(--space-4);
    }

    .seller-nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .seller-nav a {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      color: var(--neutral-700);
      border-radius: var (--radius-md);
      transition: all var(--transition-fast);
    }

    .seller-nav a:hover {
      background-color: var(--neutral-100);
      color: var(--primary);
    }

    .seller-nav a.active {
      background-color: var(--primary);
      color: var(--white);
    }

    .seller-content {
      flex: 1;
      padding: var(--space-6);
      background-color: var(--neutral-50);
    }

    .seller-header {
      background-color: var(--white);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
      box-shadow: var(--shadow-sm);
    }

    .seller-header h1 {
      font-size: 1.75rem;
      color: var(--neutral-900);
      margin: 0;
    }

    .seller-header p {
      color: var(--neutral-600);
      margin: var(--space-2) 0 0;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .stat-card {
      background-color: var(--white);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      display: flex;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.orders {
      background-color: var(--primary-light);
      color: var(--primary);
    }

    .stat-icon.revenue {
      background-color: var(--success-light);
      color: var(--success);
    }

    .stat-icon.products {
      background-color: var(--warning-light);
      color: var(--warning);
    }

    .stat-icon.rating {
      background-color: var(--info-light);
      color: var (--info);
    }

    .stat-content h3 {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin: 0;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin: var(--space-1) 0;
    }

    .stat-change {
      font-size: 0.875rem;
      margin: 0;
    }

    .stat-change.positive {
      color: var(--success);
    }

    .stat-change.negative {
      color: var(--error);
    }

    .stat-note {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin: 0;
    }

    .dashboard-sections {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }

    .section-header h2 {
      font-size: 1.25rem;
      color: var(--neutral-900);
      margin: 0;
    }

    .view-all {
      color: var(--primary);
      font-weight: 500;
    }

    .table-container {
      background-color: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: var(--space-4);
      text-align: left;
    }

    th {
      background-color: var(--neutral-50);
      font-weight: 600;
      color: var(--neutral-700);
    }

    td {
      border-top: 1px solid var(--neutral-200);
    }

    .status-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-badge.pending {
      background-color: var(--warning-light);
      color: var(--warning);
    }

    .status-badge.processing {
      background-color: var(--info-light);
      color: var(--info);
    }

    .status-badge.shipped {
      background-color: var(--primary-light);
      color: var(--primary);
    }

    .status-badge.delivered {
      background-color: var(--success-light);
      color: var(--success);
    }

    .status-badge.cancelled {
      background-color: var(--error-light);
      color: var(--error);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .product-card {
      background-color: var(--white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .product-card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
    }

    .product-info {
      padding: var(--space-3);
    }

    .product-info h3 {
      font-size: 0.9375rem;
      margin: 0;
      color: var(--neutral-900);
    }

    .price {
      font-weight: 600;
      color: var (--primary);
      margin: var(--space-1) 0;
    }

    .stock {
      font-size: 0.875rem;
      margin: 0;
    }

    .stock.warning {
      color: var(--warning);
    }

    .update-stock-btn {
      width: 100%;
      padding: var(--space-2);
      background-color: var(--neutral-100);
      color: var(--neutral-900);
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .update-stock-btn:hover {
      background-color: var(--neutral-200);
    }

    @media (max-width: 992px) {
      .dashboard-sections {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .seller-container {
        flex-direction: column;
      }

      .seller-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--neutral-200);
      }

      .seller-nav {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: var(--space-2);
      }

      .seller-nav a {
        flex: 0 0 auto;
      }
    }
  `]
})
export class SellerDashboardComponent implements OnInit {
  storeName: string = '';
  todayOrders: number = 0;
  todayRevenue: number = 0;
  orderChange: number = 0;
  revenueChange: number = 0;
  activeProducts: number = 0;
  lowStockProducts: number = 0;
  rating: number = 0;
  totalReviews: number = 0;
  recentOrders: AdminOrder[] = [];
  lowStockItems: any[] = [];

  constructor(
    private authService: AuthService,
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    // Get current seller's profile using Observable
    this.authService.currentUser$.subscribe(currentUser => {
      if (currentUser && currentUser.storeName) {
        this.storeName = currentUser.storeName;
        this.loadDashboardData(currentUser.id);
      }
    });
  }

  private loadDashboardData(sellerId: string): void {
    // In a real application, these would be separate API calls
    // For now, we'll use mock data
    this.todayOrders = 12;
    this.todayRevenue = 4500;
    this.orderChange = 15;
    this.revenueChange = 8;
    this.activeProducts = 45;
    this.lowStockProducts = 3;
    this.rating = 4.8;
    this.totalReviews = 128;

    // Load recent orders
    this.recentOrders = [
      {
        id: '1',
        userId: 'user1',
        userEmail: 'customer@example.com',
        customerName: 'John Customer',
        items: [
          { productId: 1, productName: 'Wireless Earbuds', quantity: 1, price: 299.99 }
        ],
        totalAmount: 299.99,
        total: 299.99, // Set total equal to totalAmount
        status: 'pending',
        sellerId: sellerId,
        sellerName: this.storeName,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        createdAt: new Date(),
        shippingAddress: '123 Main St, Anytown, USA'
      },
      // Add more mock orders as needed
    ];

    // Load low stock products
    this.lowStockItems = [
      {
        id: 1,
        title: 'Wireless Earbuds',
        price: 299.99,
        images: ['https://example.com/earbuds.jpg'],
        stock: 2
      },
      // Add more mock products as needed
    ];
  }
}