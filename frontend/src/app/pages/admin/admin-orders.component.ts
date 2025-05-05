import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminOrder } from '../../models/admin.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <aside class="admin-sidebar">
        <nav class="admin-nav">
          <a routerLink="/admin" routerLinkActive="active">
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
          <h1>Order Management</h1>
        </div>

        <div class="order-filters">
          <div class="status-filters">
            <button 
              *ngFor="let status of orderStatuses"
              class="filter-btn"
              [class.active]="selectedStatus === status"
              (click)="filterByStatus(status)"
            >
              {{status | titlecase}}
            </button>
          </div>
        </div>

        <div class="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td>{{order.id}}</td>
                <td>{{order.userId}}</td>
                <td>
                  <span class="status-badge" [class]="order.status">
                    {{order.status}}
                  </span>
                </td>
                <td>{{order.items.length}} items</td>
                <td>₺{{order.total | number:'1.2-2'}}</td>
                <td>{{order.createdAt | date:'medium'}}</td>
                <td class="actions">
                  <button class="action-btn view" (click)="viewOrderDetails(order)">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                  <button class="action-btn edit" (click)="updateStatus(order)">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button class="action-btn resolve" (click)="resolveIssue(order)">
                    <span class="material-symbols-outlined">build</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Order Details Modal -->
        <div class="modal" *ngIf="selectedOrder">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Order Details</h2>
              <button class="close-btn" (click)="closeOrderDetails()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="order-details">
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span class="value">{{selectedOrder.id}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value">
                  <span class="status-badge" [class]="selectedOrder.status">
                    {{selectedOrder.status}}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Customer ID:</span>
                <span class="value">{{selectedOrder.userId}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Shipping Address:</span>
                <span class="value">{{selectedOrder.shippingAddress}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Order Date:</span>
                <span class="value">{{selectedOrder.createdAt | date:'medium'}}</span>
              </div>

              <div class="order-items">
                <h3>Order Items</h3>
                <div class="item" *ngFor="let item of selectedOrder.items">
                  <span class="item-id">{{item.productId}}</span>
                  <span class="item-quantity">Qty: {{item.quantity}}</span>
                  <span class="item-price">₺{{item.price | number:'1.2-2'}}</span>
                </div>
              </div>

              <div class="order-total">
                <span class="label">Total:</span>
                <span class="value">₺{{selectedOrder.total | number:'1.2-2'}}</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn secondary" (click)="closeOrderDetails()">Close</button>
              <button class="btn primary" (click)="updateStatus(selectedOrder)">Update Status</button>
            </div>
          </div>
        </div>

        <!-- Update Status Modal -->
        <div class="modal" *ngIf="showStatusUpdate">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Update Order Status</h2>
              <button class="close-btn" (click)="closeStatusUpdate()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="status-update-form">
              <div class="status-options">
                <button 
                  *ngFor="let status of orderStatuses"
                  class="status-btn"
                  [class.active]="selectedStatus === status"
                  (click)="selectStatus(status)"
                >
                  {{status | titlecase}}
                </button>
              </div>
              <div class="modal-actions">
                <button class="btn secondary" (click)="closeStatusUpdate()">Cancel</button>
                <button class="btn primary" (click)="confirmStatusUpdate()">Update</button>
              </div>
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

    .order-filters {
      margin-bottom: var(--space-6);
    }

    .status-filters {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      background-color: var(--white);
      color: var(--neutral-700);
      font-size: 0.9375rem;
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .filter-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .filter-btn.active {
      background-color: var(--primary);
      color: var(--white);
      border-color: var(--primary);
    }

    .orders-table {
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-bottom: 1px solid var(--neutral-200);
    }

    th {
      background-color: var(--neutral-50);
      font-weight: 600;
      color: var(--neutral-700);
    }

    .status-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.pending {
      background-color: rgba(255, 171, 0, 0.1);
      color: var(--warning);
    }

    .status-badge.processing {
      background-color: rgba(0, 102, 255, 0.1);
      color: var(--secondary);
    }

    .status-badge.shipped {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }

    .status-badge.delivered {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }

    .status-badge.cancelled {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
    }

    .actions {
      display: flex;
      gap: var(--space-2);
    }

    .action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .action-btn.view {
      background-color: rgba(0, 102, 255, 0.1);
      color: var(--secondary);
    }

    .action-btn.view:hover {
      background-color: var(--secondary);
      color: var(--white);
    }

    .action-btn.edit {
      background-color: rgba(255, 171, 0, 0.1);
      color: var(--warning);
    }

    .action-btn.edit:hover {
      background-color: var(--warning);
      color: var(--white);
    }

    .action-btn.resolve {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }

    .action-btn.resolve:hover {
      background-color: var(--success);
      color: var(--white);
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: var(--white);
      border-radius: var(--radius-md);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }

    .modal-header h2 {
      font-size: 1.25rem;
      margin: 0;
    }

    .close-btn {
      background: none;
      color: var(--neutral-500);
      padding: var(--space-1);
    }

    .close-btn:hover {
      color: var(--neutral-700);
    }

    .order-details {
      padding: var(--space-4);
    }

    .detail-row {
      display: flex;
      margin-bottom: var(--space-3);
    }

    .detail-row .label {
      width: 150px;
      font-weight: 500;
      color: var(--neutral-700);
    }

    .detail-row .value {
      flex: 1;
      color: var(--neutral-900);
    }

    .order-items {
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
    }

    .order-items h3 {
      font-size: 1.125rem;
      margin-bottom: var(--space-3);
    }

    .item {
      display: flex;
      justify-content: space-between;
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--neutral-100);
    }

    .item-id {
      font-weight: 500;
    }

    .order-total {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
      font-weight: 600;
      font-size: 1.125rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4);
      border-top: 1px solid var(--neutral-200);
    }

    .btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
    }

    .btn.primary {
      background-color: var(--primary);
      color: var(--white);
    }

    .btn.primary:hover {
      background-color: var(--primary-dark);
    }

    .btn.secondary {
      background-color: var(--white);
      color: var(--neutral-700);
      border: 1px solid var(--neutral-300);
    }

    .btn.secondary:hover {
      background-color: var(--neutral-100);
    }

    .status-update-form {
      padding: var(--space-4);
    }

    .status-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .status-btn {
      padding: var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      background-color: var(--white);
      color: var(--neutral-700);
      font-size: 1rem;
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .status-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .status-btn.active {
      background-color: var(--primary);
      color: var(--white);
      border-color: var(--primary);
    }

    @media (max-width: 992px) {
      .orders-table {
        overflow-x: auto;
      }

      table {
        min-width: 800px;
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

      .status-options {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];
  selectedOrder: AdminOrder | null = null;
  showStatusUpdate: boolean = false;
  orderStatuses: string[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  selectedStatus: string = 'all';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminService.getOrders().subscribe(orders => {
      this.orders = orders;
      this.filterByStatus(this.selectedStatus);
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.filteredOrders = status === 'all' 
      ? this.orders 
      : this.orders.filter(order => order.status === status);
  }

  viewOrderDetails(order: AdminOrder): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  updateStatus(order: AdminOrder): void {
    this.selectedOrder = order;
    this.showStatusUpdate = true;
  }

  closeStatusUpdate(): void {
    this.showStatusUpdate = false;
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  confirmStatusUpdate(): void {
    if (this.selectedOrder && this.selectedStatus !== 'all') {
      this.adminService.updateOrderStatus(this.selectedOrder.id, this.selectedStatus as AdminOrder['status'])
        .subscribe(() => {
          this.loadOrders();
          this.closeStatusUpdate();
          this.selectedOrder = null;
        });
    }
  }

  resolveIssue(order: AdminOrder): void {
    if (order.status === 'pending') {
      this.adminService.resolvePaymentIssue(order.id).subscribe(() => {
        this.loadOrders();
      });
    } else {
      this.adminService.resolveOrderIssue(order.id).subscribe(() => {
        this.loadOrders();
      });
    }
  }
}