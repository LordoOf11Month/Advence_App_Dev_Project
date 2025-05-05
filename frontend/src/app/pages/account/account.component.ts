import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { OrderTracking } from '../../models/admin.model';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <h1 class="page-title">My Account</h1>
      
      <div class="account-container">
        <div class="account-sidebar">
          <div class="user-info">
            <div class="user-avatar">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div class="user-details">
              <h3 class="user-name">John Doe</h3>
              <p class="user-email">john.doe&#64;example.com</p>
            </div>
          </div>
          
          <div class="account-navigation">
            <button 
              class="nav-item" 
              [class.active]="activeTab === 'profile'"
              (click)="setActiveTab('profile')"
            >
              <span class="material-symbols-outlined">person</span>
              <span>Profile</span>
            </button>
            
            <button 
              class="nav-item" 
              [class.active]="activeTab === 'orders'"
              (click)="setActiveTab('orders')"
            >
              <span class="material-symbols-outlined">receipt_long</span>
              <span>Orders</span>
            </button>
            
            <button 
              class="nav-item" 
              [class.active]="activeTab === 'addresses'"
              (click)="setActiveTab('addresses')"
            >
              <span class="material-symbols-outlined">location_on</span>
              <span>Addresses</span>
            </button>
            
            <button 
              class="nav-item" 
              [class.active]="activeTab === 'favorites'"
              (click)="setActiveTab('favorites')"
            >
              <span class="material-symbols-outlined">favorite</span>
              <span>Favorites</span>
            </button>
            
            <button 
              class="nav-item" 
              [class.active]="activeTab === 'payment'"
              (click)="setActiveTab('payment')"
            >
              <span class="material-symbols-outlined">credit_card</span>
              <span>Payment Methods</span>
            </button>

            <button
              *ngIf="isSeller"
              class="nav-item seller-dashboard"
              routerLink="/seller/dashboard"
            >
              <span class="material-symbols-outlined">store</span>
              <span>Seller Dashboard</span>
            </button>
            
            <button class="nav-item logout">
              <span class="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        <div class="account-content">
          <!-- Profile Tab -->
          <div class="tab-content" *ngIf="activeTab === 'profile'">
            <h2 class="tab-title">Profile Information</h2>
            
            <form class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name</label>
                  <input type="text" id="firstName" value="John">
                </div>
                
                <div class="form-group">
                  <label for="lastName">Last Name</label>
                  <input type="text" id="lastName" value="Doe">
                </div>
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" value="john.doe&#64;example.com">
              </div>
              
              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" value="+90 555 123 4567">
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="birthDate">Birth Date</label>
                  <input type="date" id="birthDate" value="1990-01-15">
                </div>
                
                <div class="form-group">
                  <label for="gender">Gender</label>
                  <select id="gender">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="save-btn">Save Changes</button>
              </div>
            </form>
            
            <div class="password-section">
              <h3>Change Password</h3>
              
              <form class="password-form">
                <div class="form-group">
                  <label for="currentPassword">Current Password</label>
                  <input type="password" id="currentPassword">
                </div>
                
                <div class="form-group">
                  <label for="newPassword">New Password</label>
                  <input type="password" id="newPassword">
                </div>
                
                <div class="form-group">
                  <label for="confirmPassword">Confirm New Password</label>
                  <input type="password" id="confirmPassword">
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="save-btn">Update Password</button>
                </div>
              </form>
            </div>
          </div>
          
          <!-- Orders Tab -->
          <div class="tab-content" *ngIf="activeTab === 'orders'">
            <h2 class="tab-title">My Orders</h2>
            
            <div class="order-filters">
              <button 
                class="filter-btn" 
                [class.active]="orderFilter === 'all'"
                (click)="orderFilter = 'all'"
              >All</button>
              <button 
                class="filter-btn" 
                [class.active]="orderFilter === 'processing'"
                (click)="orderFilter = 'processing'"
              >Processing</button>
              <button 
                class="filter-btn" 
                [class.active]="orderFilter === 'shipped'"
                (click)="orderFilter = 'shipped'"
              >Shipped</button>
              <button 
                class="filter-btn" 
                [class.active]="orderFilter === 'delivered'"
                (click)="orderFilter = 'delivered'"
              >Delivered</button>
              <button 
                class="filter-btn" 
                [class.active]="orderFilter === 'cancelled'"
                (click)="orderFilter = 'cancelled'"
              >Cancelled</button>
            </div>
            
            <div class="order-list">
              <div class="order-item">
                <div class="order-header">
                  <div class="order-info">
                    <span class="order-id">Order #12345</span>
                    <span class="order-date">Placed on: 15 June 2025</span>
                  </div>
                  <div class="order-status shipped">Shipped</div>
                </div>
                
                <div class="order-products">
                  <div class="order-product">
                    <div class="product-image">
                      <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" alt="T-Shirt">
                    </div>
                    <div class="product-info">
                      <h4>Men's Casual T-Shirt</h4>
                      <div class="product-details">
                        <span>Size: L</span>
                        <span>Color: Black</span>
                        <span>Qty: 1</span>
                      </div>
                      <div class="product-price">₺199.99</div>
                    </div>
                  </div>
                </div>
                
                <div class="order-footer">
                  <div class="order-total">
                    <span>Total:</span>
                    <span class="total-price">₺199.99</span>
                  </div>
                  <div class="order-actions">
                    <button class="track-btn" (click)="trackOrder('12345')">Track Order</button>
                    <button class="details-btn">View Details</button>
                  </div>
                </div>
              </div>
              
              <div class="order-item">
                <div class="order-header">
                  <div class="order-info">
                    <span class="order-id">Order #12346</span>
                    <span class="order-date">Placed on: 10 June 2025</span>
                  </div>
                  <div class="order-status delivered">Delivered</div>
                </div>
                
                <div class="order-products">
                  <div class="order-product">
                    <div class="product-image">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" alt="Headphones">
                    </div>
                    <div class="product-info">
                      <h4>Wireless Headphones</h4>
                      <div class="product-details">
                        <span>Color: Black</span>
                        <span>Qty: 1</span>
                      </div>
                      <div class="product-price">₺799.99</div>
                    </div>
                  </div>
                </div>
                
                <div class="order-footer">
                  <div class="order-total">
                    <span>Total:</span>
                    <span class="total-price">₺799.99</span>
                  </div>
                  <div class="order-actions">
                    <button class="review-btn">Write Review</button>
                    <button class="details-btn">View Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Other tabs would be implemented similarly -->
          <div class="tab-content" *ngIf="activeTab === 'addresses'">
            <h2 class="tab-title">My Addresses</h2>
            <!-- Address content would go here -->
            <p>Addresses management content will be implemented here.</p>
          </div>
          
          <div class="tab-content" *ngIf="activeTab === 'favorites'">
            <h2 class="tab-title">My Favorites</h2>
            <!-- Favorites content would go here -->
            <p>Favorites list content will be implemented here.</p>
          </div>
          
          <div class="tab-content" *ngIf="activeTab === 'payment'">
            <h2 class="tab-title">Payment Methods</h2>
            <!-- Payment methods content would go here -->
            <p>Payment methods management content will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tracking Modal -->
    <div class="modal" *ngIf="showTracking && trackingInfo">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Order Tracking</h2>
          <button class="close-btn" (click)="closeTracking()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="tracking-details">
          <div class="status-info">
            <div class="current-status">
              <h3>Current Status</h3>
              <span class="status-badge" [class]="trackingInfo.status">
                {{trackingInfo.status}}
              </span>
            </div>
            <div class="location">
              <h3>Current Location</h3>
              <p>{{trackingInfo.location}}</p>
            </div>
            <div class="last-update">
              <h3>Last Updated</h3>
              <p>{{trackingInfo.updatedAt | date:'medium'}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: var(--space-6);
    }
    
    .account-container {
      display: flex;
      gap: var(--space-6);
    }
    
    .account-sidebar {
      flex: 0 0 280px;
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      padding: var(--space-4);
      background-color: var(--neutral-800);
      color: var (--white);
    }
    
    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--space-3);
    }
    
    .user-avatar .material-symbols-outlined {
      font-size: 1.75rem;
    }
    
    .user-details {
      overflow: hidden;
    }
    
    .user-name {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 var(--space-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .user-email {
      font-size: 0.875rem;
      margin: 0;
      opacity: 0.9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .account-navigation {
      padding: var(--space-2);
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background-color: transparent;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--neutral-700);
      text-align: left;
      margin-bottom: var(--space-1);
    }
    
    .nav-item .material-symbols-outlined {
      margin-right: var(--space-3);
      font-size: 1.25rem;
    }
    
    .nav-item:hover {
      background-color: var(--neutral-100);
      color: var(--primary);
    }
    
    .nav-item.active {
      background-color: var(--primary);
      color: var(--white);
    }
    
    .nav-item.logout {
      margin-top: var(--space-4);
      color: var(--error);
    }
    
    .nav-item.logout:hover {
      background-color: rgba(255, 86, 48, 0.1);
    }
    
    .account-content {
      flex: 1;
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      padding: var(--space-5);
    }
    
    .tab-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 var(--space-5);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    /* Profile Form Styles */
    .profile-form,
    .password-form {
      margin-bottom: var(--space-6);
    }
    
    .form-row {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    
    .form-group {
      flex: 1;
      margin-bottom: var(--space-4);
    }
    
    .form-group label {
      display: block;
      font-size: 0.9375rem;
      color: var(--neutral-700);
      margin-bottom: var(--space-2);
    }
    
    .form-group input,
    .form-group select {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 1rem;
      color: var(--neutral-800);
      transition: border-color var(--transition-fast);
    }
    
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
    
    .save-btn {
      background-color: var(--primary);
      color: var(--white);
      border: none;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .save-btn:hover {
      background-color: var(--primary-dark);
    }
    
    .password-section {
      margin-top: var(--space-6);
      padding-top: var(--space-5);
      border-top: 1px solid var(--neutral-200);
    }
    
    .password-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: var(--space-4);
      color: var(--neutral-800);
    }
    
    /* Orders Tab Styles */
    .order-filters {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
      overflow-x: auto;
      padding-bottom: var(--space-2);
    }
    
    .filter-btn {
      padding: var(--space-2) var(--space-4);
      background-color: var(--white);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      color: var(--neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    
    .filter-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    
    .filter-btn.active {
      background-color: var(--primary);
      color: var(--white);
      border-color: var (--primary);
    }
    
    .order-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    
    .order-item {
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      background-color: var(--neutral-50);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .order-info {
      display: flex;
      flex-direction: column;
    }
    
    .order-id {
      font-weight: 600;
      color: var(--neutral-800);
      margin-bottom: var(--space-1);
    }
    
    .order-date {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }
    
    .order-status {
      font-size: 0.875rem;
      font-weight: 500;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
    }
    
    .order-status.processing {
      background-color: rgba(255, 171, 0, 0.1);
      color: var(--warning);
    }
    
    .order-status.shipped {
      background-color: rgba(0, 102, 255, 0.1);
      color: var(--secondary);
    }
    
    .order-status.delivered {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
    }
    
    .order-status.cancelled {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
    }
    
    .order-products {
      padding: var(--space-4);
    }
    
    .order-product {
      display: flex;
      gap: var(--space-3);
    }
    
    .product-image {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-info {
      flex: 1;
    }
    
    .product-info h4 {
      font-size: 1rem;
      font-weight: 500;
      margin: 0 0 var(--space-2);
      color: var(--neutral-800);
    }
    
    .product-details {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
    }
    
    .product-price {
      font-weight: 600;
      color: var(--neutral-800);
    }
    
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      background-color: var(--neutral-50);
      border-top: 1px solid var(--neutral-200);
    }
    
    .order-total {
      font-size: 1rem;
      color: var(--neutral-800);
    }
    
    .total-price {
      font-weight: 600;
      margin-left: var(--space-2);
    }
    
    .order-actions {
      display: flex;
      gap: var(--space-2);
    }
    
    .track-btn, .details-btn, .review-btn {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .track-btn {
      background-color: var(--primary);
      color: var(--white);
      border: none;
    }
    
    .track-btn:hover {
      background-color: var(--primary-dark);
    }
    
    .details-btn, .review-btn {
      background-color: var(--white);
      color: var(--neutral-700);
      border: 1px solid var(--neutral-300);
    }
    
    .details-btn:hover, .review-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    
    @media (max-width: 992px) {
      .account-container {
        flex-direction: column;
      }
      
      .account-sidebar {
        flex: 0 0 auto;
        width: 100%;
      }
      
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
    
    @media (max-width: 576px) {
      .order-header, .order-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }
      
      .order-actions {
        width: 100%;
      }
      
      .track-btn, .details-btn, .review-btn {
        flex: 1;
        text-align: center;
      }
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

    .tracking-details {
      padding: var(--space-4);
    }

    .status-info {
      display: grid;
      gap: var(--space-4);
    }

    .current-status h3,
    .location h3,
    .last-update h3 {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin: 0 0 var(--space-2);
    }

    .current-status .status-badge {
      display: inline-block;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
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

    .location p,
    .last-update p {
      margin: 0;
      font-size: 1rem;
      color: var(--neutral-900);
    }

    .nav-item.seller-dashboard {
      background-color: var(--primary-light);
      color: var(--primary);
      margin-top: var(--space-4);
    }

    .nav-item.seller-dashboard:hover {
      background-color: var(--primary);
      color: var(--white);
    }
  `]
})
export class AccountComponent {
  activeTab: string = 'profile';
  orderFilter: string = 'all';
  selectedOrder: any = null;
  showTracking: boolean = false;
  trackingInfo: OrderTracking | null = null;
  isSeller: boolean = false;
  
  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.isSeller = user?.role === 'seller';
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  trackOrder(orderId: string): void {
    this.adminService.getOrderTracking(orderId).subscribe((tracking: OrderTracking) => {
      this.trackingInfo = tracking;
      this.showTracking = true;
    });
  }

  closeTracking(): void {
    this.showTracking = false;
    this.trackingInfo = null;
  }
}
