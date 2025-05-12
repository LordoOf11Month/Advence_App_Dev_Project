import { Order } from './../../../../checkout/services/order.service';
import { NotificationService } from './../../../../../core/services/notification.service';
// features/seller-dashboard/components/orders/seller-order-list/seller-order-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../services/seller.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-order-list',
  standalone: false,
  templateUrl: './seller-order-list.component.html',
  styleUrls: ['./seller-order-list.component.css']
})
export class SellerOrderListComponent implements OnInit {
  orders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;
  shipmentStatuses: string[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(private sellerService: SellerService, private router: Router, private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.sellerService.getSellerOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to fetch seller orders', err);
        this.error = 'Could not load orders.';
        this.loading = false;
      }
    });
  }

  markShipped(order: Order): void {
    this.updateOrderStatus(order, 'SHIPPED');
  }

  updateOrderStatus(order: Order, status: string): void {
    this.sellerService.updateOrderStatus(order.id, status).subscribe({
      next: updated => {
        order.status = updated.status;
        this.notify.showSuccess(`Order #${order.id} status updated to ${status}.`);
      },
      error: err => {
        console.error('Update order status failed', err);
        this.notify.showError('Failed to update order status.');
      }
    });
  }

  cancelOrder(order: Order): void {
    if (!confirm(`Cancel Order #${order.id}? This will process a refund if payment was completed.`)) return;

    this.sellerService.cancelOrder(order.id).subscribe({
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

  sellerRevenue(order: Order): number {
    // Sum up price × quantity for all items, since the order is already seller-specific
    return order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  addNew(): void {
    this.router.navigate(['/seller/products/new']);
  }
}
