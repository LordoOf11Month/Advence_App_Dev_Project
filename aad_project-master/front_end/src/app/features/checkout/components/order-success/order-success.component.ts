// features/checkout/components/order-success/order-success.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-order-success',
  standalone: false,
  template: `
    <div class="success">
      <h2>Thank you!</h2>
      <p>Your order has been placed successfully.</p>
      <p *ngIf="orderId">Order #: {{orderId}}</p>
      <a routerLink="/orders">View My Orders</a>
    </div>
  `,
  styles: [`
    .success { text-align: center; padding: 2rem; }
    .success h2 { color: #4caf50; }
  `]
})
export class OrderSuccessComponent implements OnInit {
  orderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.orderId = +params['orderId'];
        this.ensureTransaction(this.orderId);
      }
    });
  }

  ensureTransaction(orderId: number) {
    console.log(`Ensuring transaction for order ${orderId}`);
    this.paymentService.ensureTransaction(orderId).subscribe({
      next: result => {
        console.log('Transaction verification result:', result);
      },
      error: err => {
        console.error('Failed to verify transaction:', err);
        // Don't show error to user since this is a background operation
      }
    });
  }
}
