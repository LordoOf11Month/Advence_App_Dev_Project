import { NotificationService } from './../../../../../core/services/notification.service';
import { Order } from './../../../../checkout/services/order.service';
import { AdminService } from './../../../services/system-admin.service';
// features/system-admin/components/payments/payment-issues/payment-issues.component.ts
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-payment-issues',
  standalone: false,
  templateUrl: './payment-issues.component.html'
})
export class PaymentIssuesComponent implements OnInit {
  issues: Order[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private adminService: AdminService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.adminService.getPaymentIssues().subscribe({
      next: issues => {
        this.issues = issues;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load payment issues', err);
        this.error = 'Could not load payment issues.';
        this.loading = false;
      }
    });
  }

  resolve(order: Order): void {
    this.adminService.resolvePaymentIssue(order.id).subscribe({
      next: () => {
        this.notify.showSuccess(`Issue for Order #${order.id} resolved.`);
        this.issues = this.issues.filter(i => i.id !== order.id);
      },
      error: err => {
        console.error('Resolve issue failed', err);
        this.notify.showError('Failed to resolve issue.');
      }
    });
  }
}
