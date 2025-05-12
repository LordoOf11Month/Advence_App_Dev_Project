import { NotificationService } from './../../../../../core/services/notification.service';
import { Order } from './../../../../checkout/services/order.service';
import { AdminService } from './../../../services/system-admin.service';
// features/system-admin/components/global-orders/global-order-list/global-order-list.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-global-order-list',
  standalone: false,
  templateUrl: './global-order-list.component.html',
  styleUrls: ['./global-order-list.component.css']
})
export class GlobalOrderListComponent implements OnInit {
  orders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;
  shipmentStatuses: string[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(private adminService: AdminService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminService.getAllOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load orders', err);
        this.error = 'Could not load orders.';
        this.loading = false;
      }
    });
  }

  cancelOrder(order: Order): void {
    if (!confirm(`Cancel Order #${order.id}?`)) return;
    this.adminService.updateOrderStatus(order.id, 'CANCELLED').subscribe({
      next: updated => {
        order.status = updated.status;
        this.notify.showSuccess(`Order #${order.id} cancelled.`);
      },
      error: err => {
        console.error('Cancel order failed', err);
        this.notify.showError('Failed to cancel order.');
      }
    });
  }

  updateShipmentStatus(order: Order, status: string): void {
    this.adminService.updateShipmentStatus(order.id, status).subscribe({
      next: updated => {
        order.status = updated.status;
        this.notify.showSuccess(`Order #${order.id} status updated to ${status}.`);
      },
      error: err => {
        console.error('Update shipment status failed', err);
        this.notify.showError('Failed to update shipment status.');
      }
    });
  }
}
