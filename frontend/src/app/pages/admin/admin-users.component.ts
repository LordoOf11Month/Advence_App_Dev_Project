import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminUser } from '../../models/admin.model';

@Component({
  selector: 'app-admin-users',
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
          <h1>User Management</h1>
        </div>

        <div class="users-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>
                  <div class="user-info">
                    <span class="user-name">{{user.firstName}} {{user.lastName}}</span>
                    <span class="user-email">{{user.email}}</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class]="user.status">
                    {{user.status}}
                  </span>
                </td>
                <td>{{user.role}}</td>
                <td>{{user.joinDate | date}}</td>
                <td>{{user.orderCount}}</td>
                <td>₺{{user.totalSpent | number:'1.2-2'}}</td>
                <td class="actions">
                  <button 
                    class="action-btn" 
                    [class.ban]="user.status === 'active'"
                    [class.unban]="user.status === 'banned'"
                    (click)="user.status === 'active' ? banUser(user.id) : unbanUser(user.id)"
                  >
                    <span class="material-symbols-outlined">
                      {{user.status === 'active' ? 'block' : 'check_circle'}}
                    </span>
                  </button>
                  <button class="action-btn view" (click)="viewTransactions(user.id)">
                    <span class="material-symbols-outlined">receipt_long</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Transactions Modal -->
        <div class="modal" *ngIf="showTransactions">
          <div class="modal-content">
            <div class="modal-header">
              <h2>User Transactions</h2>
              <button class="close-btn" (click)="closeTransactions()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="transactions-list">
              <div class="transaction" *ngFor="let transaction of userTransactions">
                <div class="transaction-header">
                  <span class="transaction-id">{{transaction.transactionId}}</span>
                  <span class="transaction-date">{{transaction.createdAt | date}}</span>
                </div>
                <div class="transaction-details">
                  <span class="amount">₺{{transaction.amount | number:'1.2-2'}}</span>
                  <span class="status" [class]="transaction.status">{{transaction.status}}</span>
                </div>
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

    .users-table {
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

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      color: var(--neutral-900);
    }

    .user-email {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .status-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.active {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }

    .status-badge.banned {
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

    .action-btn.ban {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
    }

    .action-btn.ban:hover {
      background-color: var(--error);
      color: var(--white);
    }

    .action-btn.unban {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }

    .action-btn.unban:hover {
      background-color: var(--success);
      color: var(--white);
    }

    .action-btn.view {
      background-color: rgba(0, 102, 255, 0.1);
      color: var(--secondary);
    }

    .action-btn.view:hover {
      background-color: var(--secondary);
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
      max-width: 500px;
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

    .transactions-list {
      padding: var(--space-4);
    }

    .transaction {
      padding: var(--space-3);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-3);
    }

    .transaction-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }

    .transaction-id {
      font-weight: 500;
      color: var(--neutral-900);
    }

    .transaction-date {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .transaction-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .amount {
      font-weight: 600;
      color: var(--neutral-900);
    }

    .status {
      font-size: 0.875rem;
      font-weight: 500;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
    }

    .status.success {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }

    .status.failed {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
    }

    .status.pending {
      background-color: rgba(255, 171, 0, 0.1);
      color: var(--warning);
    }

    @media (max-width: 992px) {
      .users-table {
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
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  showTransactions: boolean = false;
  userTransactions: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  banUser(userId: string): void {
    this.adminService.banUser(userId).subscribe(() => {
      this.loadUsers();
    });
  }

  unbanUser(userId: string): void {
    this.adminService.unbanUser(userId).subscribe(() => {
      this.loadUsers();
    });
  }

  viewTransactions(userId: string): void {
    this.adminService.getUserTransactions(userId).subscribe(transactions => {
      this.userTransactions = transactions;
      this.showTransactions = true;
    });
  }

  closeTransactions(): void {
    this.showTransactions = false;
  }
}