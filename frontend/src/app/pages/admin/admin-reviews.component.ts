import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminReview } from '../../models/admin.model';

@Component({
  selector: 'app-admin-reviews',
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
          <a routerLink="/admin/reviews" routerLinkActive="active">
            <span class="material-symbols-outlined">rate_review</span>
            Reviews
          </a>
        </nav>
      </aside>

      <main class="admin-content">
        <div class="admin-header">
          <h1>Review Management</h1>
          <div class="filters">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="filterReviews()"
              placeholder="Search reviews..." 
            />
            <select [(ngModel)]="statusFilter" (change)="filterReviews()">
              <option value="all">All Reviews</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
            </select>
            <select [(ngModel)]="ratingFilter" (change)="filterReviews()">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div class="reviews-section">
          <div class="reviews-list">
            <div *ngIf="loading" class="loading">
              Loading reviews...
            </div>
            <div *ngIf="!loading && filteredReviews.length === 0" class="no-reviews">
              No reviews found.
            </div>

            <div *ngFor="let review of filteredReviews" class="review-card">
              <div class="review-header">
                <div class="review-info">
                  <span class="product-name">{{ review.productName }}</span>
                  <div class="rating-display">
                    <span *ngFor="let star of [1, 2, 3, 4, 5]" 
                      class="star"
                      [class.filled]="star <= review.rating">
                      ★
                    </span>
                  </div>
                </div>
                <div class="review-meta">
                  <span class="user-name">By: {{ review.userName }}</span>
                  <span class="review-date">{{ review.createdAt | date:'medium' }}</span>
                </div>
              </div>

              <div class="review-content">
                {{ review.comment }}
              </div>

              <div class="review-actions">
                <button 
                  class="action-btn approve" 
                  [class.approved]="review.approved"
                  (click)="toggleApproval(review)">
                  {{ review.approved ? 'Approved' : 'Approve' }}
                </button>
                <button class="action-btn delete" (click)="confirmDelete(review)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation Modal -->
        <div class="modal" *ngIf="showDeleteConfirmation">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Confirm Delete</h2>
              <button class="close-btn" (click)="cancelDelete()">×</button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete this review?</p>
              <p class="warning">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn secondary" (click)="cancelDelete()">Cancel</button>
              <button class="btn danger" (click)="deleteReview()">Delete</button>
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
      margin-bottom: var(--space-4);
    }

    .filters {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    .filters input, .filters select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
    }

    .filters input {
      flex: 1;
    }

    .reviews-section {
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .loading, .no-reviews {
      padding: var(--space-6);
      text-align: center;
      color: var(--neutral-500);
    }

    .review-card {
      border-bottom: 1px solid var(--neutral-200);
      padding: var(--space-4);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-3);
    }

    .review-info .product-name {
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
      display: block;
    }

    .rating-display {
      display: flex;
      gap: 2px;
    }

    .star {
      color: var(--neutral-300);
      font-size: 1.125rem;
    }

    .star.filled {
      color: var(--warning);
    }

    .review-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .review-content {
      margin-bottom: var(--space-4);
      line-height: 1.5;
      color: var(--neutral-700);
    }

    .review-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }

    .action-btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: none;
    }

    .action-btn.approve {
      background-color: rgba(54, 179, 126, 0.1);
      color: var(--success);
      border: 1px solid var(--success);
    }

    .action-btn.approve:hover {
      background-color: var(--success);
      color: var(--white);
    }

    .action-btn.approve.approved {
      background-color: var(--success);
      color: var(--white);
    }

    .action-btn.delete {
      background-color: rgba(255, 86, 48, 0.1);
      color: var(--error);
      border: 1px solid var(--error);
    }

    .action-btn.delete:hover {
      background-color: var(--error);
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
      max-width: 400px;
      box-shadow: var(--shadow-lg);
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
      border: none;
      font-size: 1.5rem;
      color: var(--neutral-500);
      cursor: pointer;
    }

    .modal-body {
      padding: var(--space-4);
    }

    .warning {
      color: var(--error);
      font-weight: 500;
    }

    .modal-footer {
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
      transition: all var(--transition-fast);
      border: none;
    }

    .btn.secondary {
      background-color: var(--neutral-200);
      color: var(--neutral-700);
    }

    .btn.secondary:hover {
      background-color: var(--neutral-300);
    }

    .btn.danger {
      background-color: var(--error);
      color: var(--white);
    }

    .btn.danger:hover {
      background-color: var(--error-dark, #d32f2f);
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

      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .review-header {
        flex-direction: column;
      }

      .review-meta {
        align-items: flex-start;
        margin-top: var(--space-2);
      }
    }
  `]
})
export class AdminReviewsComponent implements OnInit {
  reviews: AdminReview[] = [];
  filteredReviews: AdminReview[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = 'all';
  ratingFilter = 'all';
  showDeleteConfirmation = false;
  selectedReview: AdminReview | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.adminService.getReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.filterReviews();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading = false;
      }
    });
  }

  filterReviews(): void {
    let filtered = this.reviews;

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.productName.toLowerCase().includes(term) || 
        review.userName.toLowerCase().includes(term) || 
        review.comment.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (this.statusFilter !== 'all') {
      const approved = this.statusFilter === 'approved';
      filtered = filtered.filter(review => review.approved === approved);
    }

    // Filter by rating
    if (this.ratingFilter !== 'all') {
      const rating = parseInt(this.ratingFilter, 10);
      filtered = filtered.filter(review => review.rating === rating);
    }

    this.filteredReviews = filtered;
  }

  toggleApproval(review: AdminReview): void {
    const newApprovalStatus = !review.approved;
    this.adminService.approveReview(parseInt(review.id), newApprovalStatus).subscribe({
      next: (updatedReview) => {
        // Update review in the local arrays
        const index = this.reviews.findIndex(r => r.id === review.id);
        if (index !== -1) {
          this.reviews[index].approved = newApprovalStatus;
        }
        
        const filteredIndex = this.filteredReviews.findIndex(r => r.id === review.id);
        if (filteredIndex !== -1) {
          this.filteredReviews[filteredIndex].approved = newApprovalStatus;
        }
      },
      error: (error) => {
        console.error('Error toggling review approval:', error);
      }
    });
  }

  confirmDelete(review: AdminReview): void {
    this.selectedReview = review;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.selectedReview = null;
  }

  deleteReview(): void {
    if (!this.selectedReview) return;
    
    this.adminService.deleteReview(parseInt(this.selectedReview.id)).subscribe({
      next: () => {
        // Remove from local arrays
        this.reviews = this.reviews.filter(r => r.id !== this.selectedReview.id);
        this.filteredReviews = this.filteredReviews.filter(r => r.id !== this.selectedReview.id);
        this.showDeleteConfirmation = false;
        this.selectedReview = null;
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.showDeleteConfirmation = false;
      }
    });
  }
} 