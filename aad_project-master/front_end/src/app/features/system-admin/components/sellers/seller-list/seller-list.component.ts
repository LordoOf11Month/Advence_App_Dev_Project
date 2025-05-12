import { AdminService, SellerAccount } from './../../../services/system-admin.service';
import { NotificationService } from './../../../../../core/services/notification.service';
// features/system-admin/components/sellers/seller-list/seller-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-list',
  standalone: false,
  templateUrl: './seller-list.component.html'
})
export class SellerListComponent implements OnInit {
  sellers: SellerAccount[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private adminService: AdminService,
    public router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    this.loading = true;
    this.adminService.getAllSellers().subscribe({
      next: sellers => {
        this.sellers = sellers;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load sellers', err);
        this.error = 'Could not load sellers list.';
        this.loading = false;
      }
    });
  }

  editSeller(seller: SellerAccount): void {
    this.router.navigate(['/admin/sellers', seller.id]);
  }

  toggleBan(seller: SellerAccount): void {
    if (seller.active) {
      // Ban seller
      this.adminService.banUser(seller.id).subscribe({
        next: () => {
          seller.active = false;
          this.notify.showSuccess(`Seller ${seller.email} banned.`);
        },
        error: err => {
          console.error('Ban failed', err);
          this.notify.showError('Failed to ban seller.');
        }
      });
    } else {
      // Unban seller
      this.adminService.unbanUser(seller.id).subscribe({
        next: () => {
          seller.active = true;
          this.notify.showSuccess(`Seller ${seller.email} unbanned.`);
        },
        error: err => {
          console.error('Unban failed', err);
          this.notify.showError('Failed to unban seller.');
        }
      });
    }
  }

  // Potential actions like approve or remove seller could be added here
}
