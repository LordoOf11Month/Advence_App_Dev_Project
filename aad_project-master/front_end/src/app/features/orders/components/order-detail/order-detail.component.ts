import { OrderService, Order } from './../../../checkout/services/order.service';
// features/orders/components/order-detail/order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.orderService.getOrder(id).subscribe({
        next: order => this.order = order,
        error: err => {
          console.error('Failed to load order', err);
          this.error = 'Order not found or inaccessible.';
        }
      });
    }
  }
}
