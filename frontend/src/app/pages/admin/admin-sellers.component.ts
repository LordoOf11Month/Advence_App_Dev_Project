import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSeller } from '../../models/admin.model';
import { SellerProfile } from '../../models/auth.model';
import { SellerService } from '../../services/seller.service';

@Component({
  selector: 'app-admin-sellers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
          <a routerLink="/admin/sellers" routerLinkActive="active">
            <span class="material-symbols-outlined">store</span>
            Sellers
          </a>
        </nav>
      </aside>

      <main class="admin-content">
        <div class="admin-header">
          <h1>Seller Management</h1>
          <div class="header-actions">
            <div class="search-bar">
              <span class="material-symbols-outlined">search</span>
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterSellers()"
                placeholder="Search sellers..."
              >
            </div>
            <select [(ngModel)]="statusFilter" (change)="filterSellers()">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div class="sellers-table">
          <table>
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Seller</th>
                <th>Products</th>
                <th>Sales</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let seller of filteredSellers">
                <td>
                  <div class="store-info">
                    <span class="store-name">{{seller.storeName}}</span>
                    <span class="store-description">{{seller.storeDescription}}</span>
                  </div>
                </td>
                <td>
                  <div class="seller-info">
                    <span>{{seller.firstName}} {{seller.lastName}}</span>
                    <span class="seller-email">{{seller.email}}</span>
                  </div>
                </td>
                <td>{{seller.productCount}}</td>
                <td>{{seller.totalSales}}</td>
                <td>
                  <div class="rating">
                    <span class="material-symbols-outlined">star</span>
                    {{seller.rating.toFixed(1)}}
                  </div>
                </td>
                <td>
                  <span 
                    class="status-badge"
                    [class.active]="seller.status === 'active'"
                    [class.suspended]="seller.status === 'suspended'"
                  >
                    {{seller.status}}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button 
                      class="action-btn view" 
                      (click)="viewSellerDetails(seller)"
                    >
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button 
                      class="action-btn"
                      [class.suspend]="seller.status === 'active'"
                      [class.activate]="seller.status === 'suspended'"
                      (click)="toggleSellerStatus(seller)"
                    >
                      <span class="material-symbols-outlined">
                        {{seller.status === 'active' ? 'block' : 'check_circle'}}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Seller Details Modal -->
        <div class="modal" *ngIf="selectedSeller">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Seller Details</h2>
              <button class="close-btn" (click)="closeSellerDetails()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="detail-section">
                <h3>Store Information</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Store Name</label>
                    <p>{{selectedSeller.storeName}}</p>
                  </div>
                  <div class="detail-item">
                    <label>Description</label>
                    <p>{{selectedSeller.storeDescription}}</p>
                  </div>
                  <div class="detail-item">
                    <label>Date Joined</label>
                    <p>{{selectedSeller.dateJoined | date}}</p>
                  </div>
                  <div class="detail-item">
                    <label>Last Active</label>
                    <p>{{selectedSeller.lastActive | date:'medium'}}</p>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h3>Performance Metrics</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Total Products</label>
                    <p>{{selectedSeller.productCount}}</p>
                  </div>
                  <div class="detail-item">
                    <label>Total Sales</label>
                    <p>{{selectedSeller.totalSales}}</p>
                  </div>
                  <div class="detail-item">
                    <label>Rating</label>
                    <p>{{selectedSeller.rating.toFixed(1)}}</p>
                  </div>
                  <div class="detail-item">
                    <label>Commission Rate</label>
                    <p>{{selectedSeller.commissionRate}}%</p>
                  </div>
                </div>
              </div>

              <div class="detail-section" *ngIf="selectedSeller.paymentInfo">
                <h3>Payment Information</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Bank Name</label>
                    <p>{{selectedSeller.paymentInfo.bankName}}</p>
                  </div>
                  <div class="detail-item">
                    <label>Account Holder</label>
                    <p>{{selectedSeller.paymentInfo.accountHolder}}</p>
                  </div>
                  <div class="detail-item">
                    <label>Account Number</label>
                    <p>{{selectedSeller.paymentInfo.accountNumber}}</p>
                  </div>
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
    }

    .admin-header {
      margin-bottom: var(--space-6);
    }

    .admin-header h1 {
      font-size: 1.75rem;
      color: var(--neutral-900);
      margin: 0;
      margin-bottom: var(--space-4);
    }

    .header-actions {
      display: flex;
      gap: var(--space-4);
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background-color: var(--white);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-3);
      flex: 1;
    }

    .search-bar input {
      border: none;
      outline: none;
      width: 100%;
      font-size: 0.9375rem;
    }

    .sellers-table {
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
      border-bottom: 1px solid var(--neutral-200);
    }

    th {
      background-color: var(--neutral-50);
      font-weight: 600;
      color: var(--neutral-700);
    }

    .store-info, .seller-info {
      display: flex;
      flex-direction: column;
    }

    .store-name {
      font-weight: 500;
      color: var(--neutral-900);
    }

    .store-description {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .seller-email {
      font-size: 0.875rem;
      color: var (--neutral-600);
    }

    .rating {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--warning);
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
      background-color: var(--success-light);
      color: var(--success);
    }

    .status-badge.suspended {
      background-color: var(--error-light);
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
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .action-btn.view {
      background-color: var(--primary-light);
      color: var(--primary);
    }

    .action-btn.suspend {
      background-color: var(--error-light);
      color: var(--error);
    }

    .action-btn.activate {
      background-color: var(--success-light);
      color: var(--success);
    }

    .action-btn:hover {
      transform: translateY(-2px);
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
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 800px;
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
      margin: 0;
      font-size: 1.25rem;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--neutral-500);
    }

    .modal-body {
      padding: var(--space-4);
    }

    .detail-section {
      margin-bottom: var(--space-6);
    }

    .detail-section h3 {
      font-size: 1.125rem;
      margin-bottom: var(--space-4);
      color: var(--neutral-900);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .detail-item label {
      display: block;
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-1);
    }

    .detail-item p {
      margin: 0;
      color: var(--neutral-900);
      font-weight: 500;
    }

    @media (max-width: 992px) {
      .sellers-table {
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

      .header-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdminSellersComponent implements OnInit {
  sellers: AdminSeller[] = [];
  filteredSellers: AdminSeller[] = [];
  selectedSeller: AdminSeller | null = null;
  searchQuery: string = '';
  statusFilter: string = 'all';

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  mapSellerProfileToAdminSeller(seller: SellerProfile): AdminSeller {
    return {
      id: seller.id,
      userId: seller.userId,
      email: '', // This will be populated from user info
      firstName: '', // This will be populated from user info
      lastName: '', // This will be populated from user info
      storeName: seller.storeName,
      storeDescription: seller.storeDescription,
      rating: seller.rating,
      productCount: seller.productCount,
      totalSales: seller.totalSales,
      status: seller.status,
      dateJoined: seller.dateJoined,
      lastActive: new Date(),
      totalProducts: seller.productCount, // Map to existing productCount
      totalOrders: 0, // Default value
      totalRevenue: 0, // Default value
      reviewCount: 0, // Default value
      commissionRate: 0.1,
      paymentInfo: {
        bankName: '',
        accountNumber: '',
        accountHolder: seller.storeName
      }
    };
  }

  loadSellers(): void {
    this.sellerService.getAllSellers().subscribe(sellers => {
      this.sellers = sellers.map(seller => this.mapSellerProfileToAdminSeller(seller));
    });
  }

  filterSellers(): void {
    let filtered = [...this.sellers];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(seller => 
        seller.storeName.toLowerCase().includes(query) ||
        seller.firstName.toLowerCase().includes(query) ||
        seller.lastName.toLowerCase().includes(query) ||
        seller.email.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(seller => seller.status === this.statusFilter);
    }

    this.filteredSellers = filtered;
  }

  viewSellerDetails(seller: AdminSeller): void {
    this.selectedSeller = seller;
  }

  closeSellerDetails(): void {
    this.selectedSeller = null;
  }

  toggleSellerStatus(seller: AdminSeller): void {
    if (seller.status === 'active') {
      this.sellerService.suspendSeller(seller.id).subscribe(() => {
        seller.status = 'suspended';
      });
    } else {
      this.sellerService.activateSeller(seller.id).subscribe(() => {
        seller.status = 'active';
      });
    }
  }
}