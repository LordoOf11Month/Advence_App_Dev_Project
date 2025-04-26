import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminStats, OrderStats } from '../../models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <aside class="admin-sidebar">
        <nav class="admin-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <span class="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="active">
            <span class="material-symbols-outlined">inventory_2</span>
            Products
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active">
            <span class="material-symbols-outlined">local_shipping</span>
            Orders
          </a>
          <a routerLink="/admin/users" routerLinkActive="active">
            <span class="material-symbols-outlined">group</span>
            Users
          </a>
        </nav>
      </aside>

      <main class="admin-content">
        <div class="admin-header">
          <h1>Dashboard</h1>
        </div>

        <div class="stats-grid" *ngIf="stats">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: var(--primary-light)">
              <span class="material-symbols-outlined">group</span>
            </div>
            <div class="stat-info">
              <h3>Total Users</h3>
              <p class="stat-value">{{stats.totalUsers}}</p>
              <p class="stat-label">{{stats.activeUsers}} active users</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background-color: var(--success)">
              <span class="material-symbols-outlined">shopping_cart</span>
            </div>
            <div class="stat-info">
              <h3>Total Orders</h3>
              <p class="stat-value">{{stats.totalOrders}}</p>
              <p class="stat-label">₺{{stats.totalRevenue | number:'1.2-2'}} revenue</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background-color: var(--warning)">
              <span class="material-symbols-outlined">inventory</span>
            </div>
            <div class="stat-info">
              <h3>Low Stock Products</h3>
              <p class="stat-value">{{stats.lowStockProducts}}</p>
              <p class="stat-label">Need attention</p>
            </div>
          </div>
        </div>

        <div class="order-status-section" *ngIf="orderStats">
          <h2>Order Status Overview</h2>
          <div class="order-stats-grid">
            <div class="order-stat">
              <h4>Pending</h4>
              <p class="stat-number">{{orderStats.pending}}</p>
            </div>
            <div class="order-stat">
              <h4>Processing</h4>
              <p class="stat-number">{{orderStats.processing}}</p>
            </div>
            <div class="order-stat">
              <h4>Shipped</h4>
              <p class="stat-number">{{orderStats.shipped}}</p>
            </div>
            <div class="order-stat">
              <h4>Delivered</h4>
              <p class="stat-number">{{orderStats.delivered}}</p>
            </div>
            <div class="order-stat">
              <h4>Cancelled</h4>
              <p class="stat-number">{{orderStats.cancelled}}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: calc(100vh - 140px);
    }

    .admin-sidebar {
      width: 250px;
      background-color: var(--white);
      border-right: 1px solid var(--neutral-200);
      padding: var(--space-4);
    }

    .admin-nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .admin-nav a {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      color: var(--neutral-700);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .admin-nav a:hover {
      background-color: var(--neutral-100);
      color: var(--primary);
    }

    .admin-nav a.active {
      background-color: var(--primary);
      color: var(--white);
    }

    .admin-content {
      flex: 1;
      padding: var(--space-6);
      background-color: var(--neutral-50);
    }

    .admin-header {
      margin-bottom: var(--space-6);
    }

    .admin-header h1 {
      font-size: 1.75rem;
      color: var(--neutral-900);
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }

    .stat-card {
      background-color: var(--white);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--white);
    }

    .stat-info h3 {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin: 0 0 var(--space-1);
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin: 0 0 var(--space-1);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin: 0;
    }

    .order-status-section {
      background-color: var(--white);
      border-radius: var(--radius-md);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
    }

    .order-status-section h2 {
      font-size: 1.25rem;
      margin: 0 0 var(--space-4);
    }

    .order-stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: var(--space-4);
    }

    .order-stat {
      text-align: center;
    }

    .order-stat h4 {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin: 0 0 var(--space-2);
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin: 0;
    }

    @media (max-width: 992px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .order-stats-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-4) var(--space-2);
      }
    }

    @media (max-width: 768px) {
      .admin-container {
        flex-direction: column;
      }

      .admin-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--neutral-200);
      }

      .admin-nav {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: var(--space-2);
      }

      .admin-nav a {
        flex: 0 0 auto;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .order-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  orderStats: OrderStats | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadOrderStats();
  }

  private loadStats(): void {
    this.adminService.getAdminStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  private loadOrderStats(): void {
    this.adminService.getOrderStats().subscribe(stats => {
      this.orderStats = stats;
    });
  }
}