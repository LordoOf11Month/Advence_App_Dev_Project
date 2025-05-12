import { OrderService, Order } from './../../../checkout/services/order.service';
// features/orders/components/order-history/order-history.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.component.html'
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to fetch orders', err);
        this.error = 'Could not load your orders.';
        this.loading = false;
      }
    });
  }

  viewOrder(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }
}
