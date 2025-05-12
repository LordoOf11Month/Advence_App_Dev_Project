import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { AddressService, AddressResponse, CreateAddressRequest, UpdateAddressRequest } from '../../services/address.service';
import { OrderTracking } from '../../models/admin.model';
import { User } from '../../models/auth.model';
import { Order } from '../../models/order.model';
import { Subscription } from 'rxjs';
import { delay, catchError, of } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
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
              <h3 class="user-name">{{currentUser?.firstName}} {{currentUser?.lastName}}</h3>
              <p class="user-email">{{currentUser?.email}}</p>
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

            <button class="nav-item logout" (click)="logout()">
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
                  <input type="text" id="firstName" value="{{currentUser?.firstName}}">
                </div>

                <div class="form-group">
                  <label for="lastName">Last Name</label>
                  <input type="text" id="lastName" value="{{currentUser?.lastName}}">
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" value="{{currentUser?.email}}">
              </div>

              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" value="{{currentUser?.phone}}">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="birthDate">Birth Date</label>
                  <input type="date" id="birthDate" value="{{currentUser?.birthDate | date:'yyyy-MM-dd'}}">
                </div>

                <div class="form-group">
                  <label for="gender">Gender</label>
                  <select id="gender">
                    <option value="male" [selected]="currentUser?.gender === 'male'">Male</option>
                    <option value="female" [selected]="currentUser?.gender === 'female'">Female</option>
                    <option value="other" [selected]="currentUser?.gender === 'other'">Other</option>
                    <option value="prefer-not-to-say" [selected]="currentUser?.gender === 'prefer-not-to-say'">Prefer not to say</option>
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
                (click)="setOrderFilter('all')"
              >All</button>
              <button
                class="filter-btn"
                [class.active]="orderFilter === 'processing'"
                (click)="setOrderFilter('processing')"
              >Processing</button>
              <button
                class="filter-btn"
                [class.active]="orderFilter === 'shipped'"
                (click)="setOrderFilter('shipped')"
              >Shipped</button>
              <button
                class="filter-btn"
                [class.active]="orderFilter === 'delivered'"
                (click)="setOrderFilter('delivered')"
              >Delivered</button>
              <button
                class="filter-btn"
                [class.active]="orderFilter === 'cancelled'"
                (click)="setOrderFilter('cancelled')"
              >Cancelled</button>
            </div>

            <!-- Loading indicator -->
            <div class="loading-container" *ngIf="isLoadingOrders">
              <div class="spinner"></div>
              <p>Loading your orders...</p>
            </div>

            <!-- No orders message -->
            <div class="no-orders-message" *ngIf="!isLoadingOrders && filteredOrders.length === 0">
              <p>You don't have any orders yet.</p>
              <button routerLink="/product-list" class="shop-now-btn">Shop Now</button>
            </div>

            <div class="order-list" *ngIf="!isLoadingOrders && filteredOrders.length > 0">
              <div class="order-item" *ngFor="let order of filteredOrders">
                <div class="order-header">
                  <div class="order-info">
                    <span class="order-id">Order #{{order.id}}</span>
                    <span class="order-date">Placed on: {{order.createdAt | date:'d MMMM yyyy'}}</span>
                  </div>
                  <div class="order-status" [ngClass]="order.status">{{order.status}}</div>
                </div>

                <div class="order-products">
                  <div class="order-product" *ngFor="let item of order.items">
                    <div class="product-image">
                      <img [src]="item.product.images[0]" [alt]="item.product.title">
                    </div>
                    <div class="product-info">
                      <h4>{{item.product.title}}</h4>
                      <div class="product-details">
                        <span *ngIf="item.size">Size: {{item.size}}</span>
                        <span *ngIf="item.color">Color: {{item.color}}</span>
                        <span>Qty: {{item.quantity}}</span>
                      </div>
                      <div class="product-price">₺{{item.product.price}}</div>
                    </div>
                  </div>
                </div>

                <div class="order-footer">
                  <div class="order-total">
                    <span>Total:</span>
                    <span class="total-price">₺{{order.total}}</span>
                  </div>
                  <div class="order-actions">
                    <button class="track-btn" *ngIf="order.status !== 'cancelled'" (click)="trackOrder(order.id)">Track Order</button>
                    <button class="details-btn" (click)="viewOrderDetails(order)">View Details</button>
                    <button class="cancel-btn" *ngIf="order.status === 'pending' || order.status === 'processing'" (click)="cancelOrder(order.id)">Cancel Order</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Details Modal -->
            <div class="modal" *ngIf="selectedOrder">
              <div class="modal-content">
                <div class="modal-header">
                  <h3>Order Details</h3>
                  <button class="close-btn" (click)="selectedOrder = null">×</button>
                </div>
                <div class="modal-body">
                  <div class="order-detail-header">
                    <div>
                      <p class="detail-label">Order ID</p>
                      <p class="detail-value">{{selectedOrder.id}}</p>
                    </div>
                    <div>
                      <p class="detail-label">Order Date</p>
                      <p class="detail-value">{{selectedOrder.createdAt | date:'medium'}}</p>
                    </div>
                    <div>
                      <p class="detail-label">Status</p>
                      <p class="detail-value" [ngClass]="selectedOrder.status">{{selectedOrder.status}}</p>
                    </div>
                    <div *ngIf="selectedOrder.estimatedDelivery">
                      <p class="detail-label">Estimated Delivery</p>
                      <p class="detail-value">{{selectedOrder.estimatedDelivery | date:'mediumDate'}}</p>
                    </div>
                  </div>

                  <div class="order-detail-items">
                    <h4>Items</h4>
                    <div class="detail-item" *ngFor="let item of selectedOrder.items">
                      <div class="detail-item-image">
                        <img [src]="item.product.images[0]" [alt]="item.product.title">
                      </div>
                      <div class="detail-item-info">
                        <h5>{{item.product.title}}</h5>
                        <p *ngIf="item.color || item.size">
                          <span *ngIf="item.color">Color: {{item.color}}</span>
                          <span *ngIf="item.size"> | Size: {{item.size}}</span>
                        </p>
                        <p>Quantity: {{item.quantity}}</p>
                        <p>Price: ₺{{item.product.price}} each</p>
                      </div>
                      <div class="detail-item-total">
                        ₺{{item.product.price * item.quantity}}
                      </div>
                      <div class="detail-item-actions" *ngIf="selectedOrder.status === 'delivered'">
                        <button class="refund-btn" (click)="requestRefund(item)">Request Refund</button>
                      </div>
                    </div>
                  </div>

                  <div class="order-detail-address">
                    <h4>Shipping Address</h4>
                    <div class="address-details">
                      <p>{{selectedOrder.shippingAddress.firstName}} {{selectedOrder.shippingAddress.lastName}}</p>
                      <p>{{selectedOrder.shippingAddress.address1}}</p>
                      <p *ngIf="selectedOrder.shippingAddress.address2">{{selectedOrder.shippingAddress.address2}}</p>
                      <p>{{selectedOrder.shippingAddress.city}}, {{selectedOrder.shippingAddress.state}} {{selectedOrder.shippingAddress.postalCode}}</p>
                      <p>{{selectedOrder.shippingAddress.country}}</p>
                      <p>{{selectedOrder.shippingAddress.phone}}</p>
                    </div>
                  </div>

                  <div class="order-detail-payment">
                    <h4>Payment Information</h4>
                    <div class="payment-details">
                      <p *ngIf="selectedOrder.paymentMethod.type === 'credit_card'">
                        <span class="payment-type">Credit Card</span>
                        <span *ngIf="selectedOrder.paymentMethod.cardNumber"> - •••• {{selectedOrder.paymentMethod.cardNumber.slice(-4)}}</span>
                      </p>
                      <p *ngIf="selectedOrder.paymentMethod.type === 'stripe'">
                        <span class="payment-type">Stripe Payment</span>
                      </p>
                      <p *ngIf="selectedOrder.paymentMethod.type === 'cash_on_delivery'">
                        <span class="payment-type">Cash on Delivery</span>
                      </p>
                    </div>
                  </div>

                  <div class="order-detail-summary">
                    <h4>Order Summary</h4>
                    <div class="summary-table">
                      <div class="summary-row">
                        <span>Subtotal</span>
                        <span>₺{{selectedOrder.subtotal}}</span>
                      </div>
                      <div class="summary-row">
                        <span>Shipping</span>
                        <span>₺{{selectedOrder.shipping}}</span>
                      </div>
                      <div class="summary-row" *ngIf="selectedOrder.discount > 0">
                        <span>Discount</span>
                        <span>-₺{{selectedOrder.discount}}</span>
                      </div>
                      <div class="summary-row">
                        <span>Tax</span>
                        <span>₺{{selectedOrder.tax}}</span>
                      </div>
                      <div class="summary-row total">
                        <span>Total</span>
                        <span>₺{{selectedOrder.total}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="close-modal-btn" (click)="selectedOrder = null">Close</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Tab -->
          <div class="tab-content" *ngIf="activeTab === 'addresses'">
            <div class="tab-header">
              <h2 class="tab-title">My Addresses</h2>
              <button class="add-new-btn" (click)="addNewAddress()">
                <span class="material-symbols-outlined">add</span>
                Add New Address
              </button>
            </div>

            <!-- Error message -->
            <div class="alert alert-error" *ngIf="addressError">
              {{addressError}}
            </div>

            <!-- Loading indicator -->
            <div class="loading-container" *ngIf="isLoadingAddresses">
              <div class="spinner"></div>
              <p>Loading your addresses...</p>
            </div>

            <!-- No addresses message -->
            <div class="no-addresses-message" *ngIf="!isLoadingAddresses && addresses.length === 0 && !showAddressForm">
              <p>You don't have any saved addresses yet.</p>
              <button (click)="addNewAddress()" class="add-address-btn">Add a New Address</button>
            </div>

            <!-- Address Form -->
            <div class="address-form-container" *ngIf="showAddressForm">
              <h3>{{editingAddressId ? 'Edit Address' : 'Add New Address'}}</h3>
              <form [formGroup]="addressForm" (ngSubmit)="saveAddress()">
                <div class="form-row">
                  <div class="form-group">
                    <label for="street">Street Address *</label>
                    <input
                      type="text"
                      id="street"
                      formControlName="street"
                      [class.error]="addressSubmitted && addressForm.get('street')?.invalid"
                    >
                    <div class="error-message" *ngIf="addressSubmitted && addressForm.get('street')?.invalid">
                      Street address is required
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      formControlName="city"
                      [class.error]="addressSubmitted && addressForm.get('city')?.invalid"
                    >
                    <div class="error-message" *ngIf="addressSubmitted && addressForm.get('city')?.invalid">
                      City is required
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="state">State/Province *</label>
                    <input
                      type="text"
                      id="state"
                      formControlName="state"
                      [class.error]="addressSubmitted && addressForm.get('state')?.invalid"
                    >
                    <div class="error-message" *ngIf="addressSubmitted && addressForm.get('state')?.invalid">
                      State is required
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="zipCode">Postal Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      formControlName="zipCode"
                      [class.error]="addressSubmitted && addressForm.get('zipCode')?.invalid"
                    >
                    <div class="error-message" *ngIf="addressSubmitted && addressForm.get('zipCode')?.invalid">
                      Postal code is required
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="country">Country *</label>
                    <input
                      type="text"
                      id="country"
                      formControlName="country"
                      [class.error]="addressSubmitted && addressForm.get('country')?.invalid"
                    >
                    <div class="error-message" *ngIf="addressSubmitted && addressForm.get('country')?.invalid">
                      Country is required
                    </div>
                  </div>
                </div>

                <div class="form-group checkbox">
                  <input
                    type="checkbox"
                    id="isDefault"
                    formControlName="isDefault"
                  >
                  <label for="isDefault">Set as default address</label>
                </div>

                <div class="form-actions">
                  <button type="button" class="cancel-btn" (click)="cancelAddressEdit()">Cancel</button>
                  <button type="submit" class="save-btn">Save Address</button>
                </div>
              </form>
            </div>

            <!-- Address List -->
            <div class="address-grid" *ngIf="!isLoadingAddresses && addresses.length > 0 && !showAddressForm">
              <div
                *ngFor="let address of addresses"
                class="address-card"
                [class.default]="address.isDefault"
              >
                <div class="address-card-header">
                  <div class="address-card-title">
                    <span class="material-symbols-outlined">location_on</span>
                    <h3>Address</h3>
                    <span class="default-badge" *ngIf="address.isDefault">Default</span>
                  </div>
                  <div class="address-actions">
                    <button type="button" class="edit-button" (click)="editAddress(address)">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button type="button" class="delete-button" (click)="deleteAddress(address.id)">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <div class="address-card-body">
                  <p>{{address.street}}</p>
                  <p>{{address.city}}, {{address.state}} {{address.zipCode}}</p>
                  <p>{{address.country}}</p>
                </div>
                <div class="address-card-footer" *ngIf="!address.isDefault">
                  <button type="button" class="set-default-btn" (click)="setDefaultAddress(address.id)">
                    Set as Default
                  </button>
                </div>
              </div>
            </div>
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

    <!-- Refund Form Modal -->
    <div class="modal" *ngIf="showRefundForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Request Refund</h3>
          <button class="close-btn" (click)="cancelRefund()">×</button>
        </div>
        <div class="modal-body">
          <div *ngIf="refundingItem">
            <div class="refund-product-info">
              <div class="refund-product-image">
                <img [src]="refundingItem.product.images[0]" [alt]="refundingItem.product.title">
              </div>
              <div class="refund-product-details">
                <h4>{{refundingItem.product.title}}</h4>
                <p>Quantity: {{refundingItem.quantity}}</p>
                <p>Price: ₺{{refundingItem.product.price * refundingItem.quantity}}</p>
              </div>
            </div>

            <div class="form-group refund-reason">
              <label for="refundReason">Reason for Refund *</label>
              <textarea
                id="refundReason"
                [(ngModel)]="refundReason"
                placeholder="Please explain why you're requesting a refund..."
                rows="4">
              </textarea>
              <div class="error-message" *ngIf="refundReason.trim() === '' && refundReason !== ''">
                Please provide a reason for your refund request
              </div>
            </div>

            <div class="refund-info">
              <p><strong>Note:</strong> Refund requests will be reviewed by the seller. If approved, the amount will be refunded to your original payment method.</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" (click)="cancelRefund()">Cancel</button>
          <button
            class="submit-btn"
            [disabled]="!refundReason.trim()"
            (click)="submitRefund()">
            Submit Refund Request
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-4);
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: var(--space-6);
      color: var(--neutral-900);
    }

    .account-container {
      display: flex;
      gap: var(--space-6);
    }

    .account-sidebar {
      width: 250px;
      flex-shrink: 0;
    }

    .account-content {
      flex: 1;
      background-color: var(--white);
      padding: var(--space-6);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .user-info {
      display: flex;
      align-items: center;
      padding: var(--space-4);
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--space-4);
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      background-color: var(--primary-50);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      margin-right: var(--space-3);
    }

    .user-name {
      font-weight: 600;
      margin: 0;
      margin-bottom: var(--space-1);
      color: var(--neutral-900);
    }

    .user-email {
      margin: 0;
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .account-navigation {
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .nav-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: var(--space-3) var(--space-4);
      border: none;
      background: none;
      text-align: left;
      color: var(--neutral-700);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border-bottom: 1px solid var(--neutral-100);
    }

    .nav-item:last-child {
      border-bottom: none;
    }

    .nav-item:hover {
      background-color: var(--neutral-50);
      color: var(--primary);
    }

    .nav-item.active {
      background-color: var(--primary-50);
      color: var(--primary);
    }

    .nav-item.logout {
      color: var(--error);
    }

    .nav-item.logout:hover {
      background-color: var(--error-50);
    }

    .nav-item.seller-dashboard {
      color: var(--success);
    }

    .nav-item.seller-dashboard:hover {
      background-color: var(--success-50);
    }

    .nav-item span:first-child {
      margin-right: var(--space-3);
    }

    .tab-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: var(--space-4);
      color: var(--neutral-900);
    }

    .order-filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .filter-btn {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      background-color: var(--white);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .filter-btn:hover {
      border-color: var(--primary-300);
      background-color: var(--primary-50);
    }

    .filter-btn.active {
      background-color: var(--primary);
      color: var(--white);
      border-color: var(--primary);
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

    .order-id {
      font-weight: 600;
      color: var(--neutral-900);
      margin-right: var(--space-2);
    }

    .order-date {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .order-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-md);
      text-transform: uppercase;
    }

    .order-status.pending {
      background-color: var(--warning-100);
      color: var(--warning-700);
    }

    .order-status.processing {
      background-color: var(--info-100);
      color: var(--info-700);
    }

    .order-status.shipped {
      background-color: var(--primary-100);
      color: var(--primary-700);
    }

    .order-status.delivered {
      background-color: var(--success-100);
      color: var(--success-700);
    }

    .order-status.cancelled {
      background-color: var(--error-100);
      color: var(--error-700);
    }

    .order-products {
      padding: var(--space-4);
    }

    .order-product {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .order-product:last-child {
      margin-bottom: 0;
    }

    .product-image {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
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
      margin: 0;
      margin-bottom: var(--space-1);
      font-size: 0.9375rem;
      font-weight: 500;
    }

    .product-details {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      font-size: 0.8125rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-1);
    }

    .product-price {
      font-size: 0.875rem;
      color: var(--neutral-700);
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
      font-size: 0.9375rem;
      color: var(--neutral-700);
    }

    .total-price {
      font-weight: 600;
      color: var(--neutral-900);
      margin-left: var(--space-1);
    }

    .order-actions {
      display: flex;
      gap: var(--space-2);
    }

    .track-btn, .details-btn, .cancel-btn, .review-btn {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .track-btn {
      background-color: var(--primary-50);
      color: var(--primary);
      border: 1px solid var(--primary-200);
    }

    .track-btn:hover {
      background-color: var(--primary-100);
    }

    .details-btn {
      background-color: var(--neutral-100);
      color: var(--neutral-700);
      border: 1px solid var(--neutral-300);
    }

    .details-btn:hover {
      background-color: var(--neutral-200);
    }

    .cancel-btn {
      background-color: var(--error-50);
      color: var(--error);
      border: 1px solid var(--error-200);
    }

    .cancel-btn:hover {
      background-color: var(--error-100);
    }

    .review-btn {
      background-color: var(--success-50);
      color: var(--success);
      border: 1px solid var(--success-200);
    }

    .review-btn:hover {
      background-color: var(--success-100);
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

    label {
      display: block;
      margin-bottom: var(--space-1);
      font-size: 0.9375rem;
      color: var(--neutral-700);
    }

    input, select {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      background-color: var(--white);
      font-size: 1rem;
    }

    input:focus, select:focus {
      outline: none;
      border-color: var(--primary);
    }

    .form-actions {
      margin-top: var(--space-4);
    }

    .save-btn {
      padding: var(--space-2) var(--space-4);
      background-color: var(--primary);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .save-btn:hover {
      background-color: var(--primary-dark);
    }

    .password-section {
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--neutral-200);
    }

    .password-section h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: var(--space-4);
      color: var(--neutral-900);
    }

    /* Loading spinner styles */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--neutral-200);
      border-radius: 50%;
      border-top: 3px solid var(--primary);
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-3);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-orders-message {
      text-align: center;
      padding: var(--space-6);
    }

    .shop-now-btn {
      margin-top: var(--space-3);
      padding: var(--space-2) var(--space-4);
      background-color: var(--primary);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .shop-now-btn:hover {
      background-color: var(--primary-dark);
    }

    /* Modal styles */
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
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-btn {
      border: none;
      background: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--neutral-500);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
    }

    .close-btn:hover {
      background-color: var(--neutral-100);
      color: var(--neutral-900);
    }

    .modal-body {
      padding: var(--space-4);
    }

    .modal-footer {
      padding: var(--space-4);
      border-top: 1px solid var(--neutral-200);
      display: flex;
      justify-content: flex-end;
    }

    .close-modal-btn {
      padding: var(--space-2) var(--space-4);
      background-color: var(--neutral-100);
      color: var(--neutral-700);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .close-modal-btn:hover {
      background-color: var(--neutral-200);
    }

    .order-detail-header {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .detail-label {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin: 0;
      margin-bottom: var(--space-1);
    }

    .detail-value {
      font-weight: 500;
      margin: 0;
    }

    .order-detail-items, .order-detail-address, .order-detail-payment, .order-detail-summary {
      margin-bottom: var(--space-4);
    }

    .order-detail-items h4, .order-detail-address h4, .order-detail-payment h4, .order-detail-summary h4 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
    }

    .detail-item {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--neutral-100);
    }

    .detail-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .detail-item-image {
      width: 70px;
      height: 70px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
    }

    .detail-item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .detail-item-info {
      flex: 1;
    }

    .detail-item-info h5 {
      margin: 0;
      margin-bottom: var(--space-1);
      font-size: 1rem;
      font-weight: 500;
    }

    .detail-item-info p {
      margin: 0;
      margin-bottom: var(--space-1);
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .detail-item-total {
      font-weight: 600;
      color: var(--primary);
    }

    .address-details p, .payment-details p {
      margin: 0;
      margin-bottom: var(--space-1);
      line-height: 1.4;
    }

    .payment-type {
      font-weight: 500;
      color: var(--neutral-800);
    }

    .summary-table {
      width: 100%;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--neutral-100);
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 1.125rem;
      border-top: 1px solid var(--neutral-300);
      border-bottom: none;
      padding-top: var(--space-3);
      margin-top: var(--space-1);
    }

    @media screen and (max-width: 768px) {
      .account-container {
        flex-direction: column;
      }

      .account-sidebar {
        width: 100%;
        margin-bottom: var(--space-4);
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .order-detail-header {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }

    /* Address styles */
    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }

    .add-new-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background-color: var(--primary);
      color: var(--white);
      border: none;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .add-new-btn:hover {
      background-color: var(--primary-dark);
    }

    .address-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }

    .address-card {
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: all var(--transition-fast);
    }

    .address-card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--neutral-300);
    }

    .address-card.default {
      border-color: var(--primary);
      background-color: var(--primary-50);
    }

    .address-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3);
      border-bottom: 1px solid var(--neutral-200);
      background-color: var(--neutral-50);
    }

    .address-card.default .address-card-header {
      background-color: var(--primary-100);
    }

    .address-card-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .address-card-title h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .default-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--white);
      background-color: var(--primary);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      margin-left: var(--space-2);
    }

    .address-actions {
      display: flex;
      gap: var(--space-1);
    }

    .edit-button, .delete-button {
      background: none;
      border: none;
      cursor: pointer;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
    }

    .edit-button:hover {
      background-color: var(--neutral-200);
      color: var(--primary);
    }

    .delete-button:hover {
      background-color: var(--error-100);
      color: var(--error);
    }

    .address-card-body {
      padding: var(--space-3);
    }

    .address-card-body p {
      margin: 0;
      margin-bottom: var(--space-1);
      font-size: 0.875rem;
      color: var(--neutral-700);
    }

    .address-card-body p:last-child {
      margin-bottom: 0;
    }

    .address-card-footer {
      padding: var(--space-3);
      border-top: 1px solid var(--neutral-200);
      text-align: right;
    }

    .set-default-btn {
      background: none;
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .set-default-btn:hover {
      background-color: var(--primary);
      color: var(--white);
    }

    .address-form-container {
      background-color: var(--neutral-50);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
      border: 1px solid var(--neutral-200);
    }

    .address-form-container h3 {
      margin-top: 0;
      margin-bottom: var(--space-4);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--neutral-900);
    }

    .form-row {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .form-row .form-group {
      flex: 1;
    }

    .form-group {
      margin-bottom: var(--space-4);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--space-1);
      font-weight: 500;
      color: var(--neutral-700);
    }

    .form-group input, .form-group select {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 1rem;
      transition: border-color var(--transition-fast);
    }

    .form-group input:focus, .form-group select:focus {
      border-color: var(--primary);
      outline: none;
    }

    .form-group input.error, .form-group select.error {
      border-color: var(--error);
    }

    .error-message {
      color: var(--error);
      font-size: 0.875rem;
      margin-top: var(--space-1);
    }

    .form-group.checkbox {
      display: flex;
      align-items: center;
    }

    .form-group.checkbox input {
      width: auto;
      margin-right: var(--space-2);
    }

    .form-group.checkbox label {
      margin-bottom: 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }

    .cancel-btn {
      background: none;
      border: 1px solid var(--neutral-300);
      color: var(--neutral-700);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .cancel-btn:hover {
      background-color: var(--neutral-100);
      border-color: var(--neutral-400);
    }

    .save-btn {
      background-color: var(--primary);
      border: none;
      color: var(--white);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .save-btn:hover {
      background-color: var(--primary-dark);
    }

    .no-addresses-message {
      text-align: center;
      padding: var(--space-6);
      background-color: var(--neutral-50);
      border-radius: var(--radius-md);
      border: 1px dashed var(--neutral-300);
    }

    .no-addresses-message p {
      margin-bottom: var(--space-4);
      color: var(--neutral-600);
    }

    .add-address-btn {
      background-color: var(--primary);
      color: var(--white);
      border: none;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .add-address-btn:hover {
      background-color: var(--primary-dark);
    }

    .alert {
      padding: var(--space-3);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
    }

    .alert-error {
      background-color: var(--error-50);
      color: var(--error);
      border: 1px solid var(--error-100);
    }

    .detail-item-actions {
      margin-top: 10px;
    }

    .refund-btn {
      background-color: #f8f9fa;
      color: #dc3545;
      border: 1px solid #dc3545;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .refund-btn:hover {
      background-color: #dc3545;
      color: white;
    }

    .refund-product-info {
      display: flex;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .refund-product-image {
      width: 80px;
      height: 80px;
      margin-right: 15px;
    }

    .refund-product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .refund-product-details h4 {
      margin-top: 0;
      margin-bottom: 8px;
    }

    .refund-product-details p {
      margin: 4px 0;
      color: #666;
    }

    .refund-reason {
      margin-bottom: 20px;
    }

    .refund-reason textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    }

    .refund-info {
      background-color: #f8f9fa;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
    }

    .refund-info p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    .modal-footer .submit-btn {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .modal-footer .submit-btn:disabled {
      background-color: #e9a8af;
      cursor: not-allowed;
    }
  `]
})
export class AccountComponent implements OnInit, OnDestroy {
  activeTab: string = 'profile';
  orderFilter: string = 'all';
  selectedOrder: Order | null = null;
  showTracking: boolean = false;
  trackingInfo: OrderTracking | null = null;
  isSeller: boolean = false;
  currentUser: User | null = null;

  // Address related variables
  addresses: AddressResponse[] = [];
  isLoadingAddresses: boolean = false;
  showAddressForm: boolean = false;
  editingAddressId: number | null = null;
  addressForm: FormGroup;
  addressSubmitted: boolean = false;
  addressError: string | null = null;

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoadingOrders: boolean = false;
  private subscriptions = new Subscription();

  // Refund functionality
  showRefundForm: boolean = false;
  refundingItem: any = null;
  refundReason: string = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private orderService: OrderService,
    private addressService: AddressService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.addressForm = this.formBuilder.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      zipCode: ['', Validators.required],
      isDefault: [false]
    });
  }

  ngOnInit(): void {
    // Get current user information
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isSeller = user?.role === 'seller';

        // Load orders when user is authenticated
        if (user) {
          this.loadOrders();
        }
      })
    );

    if (this.activeTab === 'orders') {
      this.loadOrders();
    } else if (this.activeTab === 'addresses') {
      this.loadAddresses();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;

    if (tab === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    } else if (tab === 'addresses' && this.addresses.length === 0) {
      this.loadAddresses();
    }
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    console.log('Loading user orders...');

    // Clear any existing orders first to avoid showing stale data
    this.orders = [];
    this.filteredOrders = [];

    this.subscriptions.add(
      this.orderService.getUserOrders().pipe(
        // Add delay to avoid UI flickering if response is very fast
        delay(300),
        catchError(error => {
          console.error('Failed to load orders, retrying...', error);
          // Return an empty array but try again after a delay
          setTimeout(() => this.retryLoadOrders(), 1000);
          return of([]);
        })
      ).subscribe({
        next: (orders) => {
          console.log('Orders loaded successfully:', orders.length);
          this.orders = orders;

          // Process orders - ensure dates are properly formatted
          this.orders = orders.map(order => ({
            ...order,
            createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt),
            updatedAt: order.updatedAt instanceof Date ? order.updatedAt : new Date(order.updatedAt),
            estimatedDelivery: order.estimatedDelivery instanceof Date ?
              order.estimatedDelivery :
              order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined
          }));

          // Sort by date (newest first)
          this.orders.sort((a, b) =>
            b.createdAt.getTime() - a.createdAt.getTime()
          );

          this.applyOrderFilter(this.orderFilter);
          this.isLoadingOrders = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.isLoadingOrders = false;
          // Set empty arrays to avoid undefined errors in template
          this.orders = [];
          this.filteredOrders = [];
        }
      })
    );
  }

  // Retry loading orders with backoff
  private retryLoadOrders(retries: number = 1): void {
    if (retries > 3) {
      console.error('Maximum retry attempts reached');
      this.isLoadingOrders = false;
      return;
    }

    console.log(`Retrying order load (attempt ${retries})...`);

    this.subscriptions.add(
      this.orderService.getUserOrders().subscribe({
        next: (orders) => {
          console.log('Orders loaded successfully on retry:', orders.length);
          this.orders = orders;
          this.applyOrderFilter(this.orderFilter);
          this.isLoadingOrders = false;
        },
        error: (error) => {
          console.error(`Retry ${retries} failed:`, error);
          // Exponential backoff for retry
          const delay = Math.min(1000 * Math.pow(2, retries), 10000);
          setTimeout(() => this.retryLoadOrders(retries + 1), delay);
        }
      })
    );
  }

  setOrderFilter(filter: string): void {
    this.orderFilter = filter;
    this.applyOrderFilter(filter);
  }

  applyOrderFilter(filter: string): void {
    if (filter === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === filter);
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          // Reload orders after cancellation
          this.loadOrders();
          alert('Order cancelled successfully');
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order. Please try again.');
        }
      });
    }
  }

  trackOrder(orderId: string): void {
    this.showTracking = true;
    this.adminService.getOrderTracking(orderId).subscribe({
      next: (tracking) => {
        this.trackingInfo = tracking;
      },
      error: (error) => {
        console.error('Error getting tracking info:', error);
        this.trackingInfo = null;
      }
    });
  }

  closeTracking(): void {
    this.showTracking = false;
    this.trackingInfo = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Address management methods
  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.addressError = null;

    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoadingAddresses = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.addressError = 'Failed to load addresses. Please try again.';
        this.isLoadingAddresses = false;
      }
    });
  }

  addNewAddress(): void {
    this.addressForm.reset({
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      isDefault: false
    });
    this.editingAddressId = null;
    this.showAddressForm = true;
    this.addressSubmitted = false;
  }

  editAddress(address: AddressResponse): void {
    this.addressForm.setValue({
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    this.editingAddressId = address.id;
    this.showAddressForm = true;
    this.addressSubmitted = false;
  }

  cancelAddressEdit(): void {
    this.showAddressForm = false;
    this.editingAddressId = null;
    this.addressForm.reset();
  }

  deleteAddress(id: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          this.addresses = this.addresses.filter(a => a.id !== id);
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          this.addressError = 'Failed to delete address. Please try again.';
        }
      });
    }
  }

  saveAddress(): void {
    this.addressSubmitted = true;

    if (this.addressForm.invalid) {
      return;
    }

    const addressData = this.addressForm.value;

    if (this.editingAddressId) {
      // Update existing address
      this.addressService.updateAddress(this.editingAddressId, addressData).subscribe({
        next: (updatedAddress) => {
          const index = this.addresses.findIndex(a => a.id === this.editingAddressId);
          if (index !== -1) {
            this.addresses[index] = updatedAddress;
          }
          this.cancelAddressEdit();
        },
        error: (error) => {
          console.error('Error updating address:', error);
          this.addressError = 'Failed to update address. Please try again.';
        }
      });
    } else {
      // Create new address
      this.addressService.createAddress(addressData).subscribe({
        next: (newAddress) => {
          this.addresses.push(newAddress);
          this.cancelAddressEdit();
        },
        error: (error) => {
          console.error('Error creating address:', error);
          this.addressError = 'Failed to create address. Please try again.';
        }
      });
    }
  }

  setDefaultAddress(id: number): void {
    const address = this.addresses.find(a => a.id === id);
    if (!address || address.isDefault) {
      return;
    }

    // Show a temporary loading state
    this.addressError = null;
    this.isLoadingAddresses = true;
    const originalAddresses = [...this.addresses];

    // Optimistically update the UI
    this.addresses.forEach(a => {
      a.isDefault = a.id === id;
    });

    const updateRequest: UpdateAddressRequest = {
      isDefault: true
    };

    this.addressService.updateAddress(id, updateRequest).subscribe({
      next: (updatedAddress) => {
        console.log('Address successfully set as default:', updatedAddress);
        // Reload addresses to ensure we have the latest state from the backend
        this.loadAddresses();
      },
      error: (error) => {
        console.error('Error setting default address:', error);
        this.addressError = 'Failed to set default address. Please try again.';
        this.isLoadingAddresses = false;

        // Revert the optimistic update
        this.addresses = [...originalAddresses];

        // If it's a 401 error, try refreshing the token and retry
        if (error?.status === 401) {
          console.log('Attempting to refresh token and retry...');
          this.authService.refreshToken().subscribe({
            next: () => {
              console.log('Token refreshed, retrying update...');
              this.isLoadingAddresses = true;
              this.addressService.updateAddress(id, updateRequest).subscribe({
                next: (updatedAddress) => {
                  console.log('Address successfully set as default after token refresh:', updatedAddress);
                  // Reload addresses to ensure we have the latest state
                  this.loadAddresses();
                },
                error: (retryError) => {
                  console.error('Error setting default address after token refresh:', retryError);
                  this.addressError = 'Failed to set default address. Please log out and try again.';
                  this.isLoadingAddresses = false;
                }
              });
            },
            error: (refreshError) => {
              console.error('Token refresh failed:', refreshError);
              this.addressError = 'Your session has expired. Please log in again.';
              this.isLoadingAddresses = false;

              // Redirect to login after a delay
              setTimeout(() => {
                this.authService.logout();
                this.router.navigate(['/login']);
              }, 2000);
            }
          });
        }
      }
    });
  }

  // Refund functionality
  requestRefund(item: any): void {
    this.refundingItem = item;
    this.refundReason = '';
    this.showRefundForm = true;
  }

  submitRefund(): void {
    if (!this.refundingItem || !this.refundReason) {
      return;
    }

    // Get the order ID and item ID
    const orderId = this.selectedOrder?.id;
    const itemId = this.refundingItem.id || (this.refundingItem.orderItemId ? this.refundingItem.orderItemId.toString() : '');

    if (!orderId || !itemId) {
      alert('Could not identify the order or item for refund');
      return;
    }

    this.orderService.requestRefund(orderId, itemId, this.refundReason).subscribe({
      next: (response) => {
        alert('Refund request submitted successfully');
        this.showRefundForm = false;
        this.refundingItem = null;
        this.refundReason = '';

        // Reload orders to show the updated status
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error requesting refund:', error);
        alert('Failed to submit refund request. Please try again.');
      }
    });
  }

  cancelRefund(): void {
    this.showRefundForm = false;
    this.refundingItem = null;
    this.refundReason = '';
  }
}
