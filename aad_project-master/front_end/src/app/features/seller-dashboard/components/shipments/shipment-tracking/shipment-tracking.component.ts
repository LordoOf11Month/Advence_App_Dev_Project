import { NotificationService } from './../../../../../core/services/notification.service';
// features/seller-dashboard/components/shipments/shipment-tracking/shipment-tracking.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SellerService } from '../../../services/seller.service';

@Component({
  selector: 'app-shipment-tracking',
  standalone: false,
  templateUrl: './shipment-tracking.component.html'
})
export class ShipmentTrackingComponent implements OnInit {
  orderId: number | null = null;
  trackingNumber: string = '';
  carrier: string = '';
  error: string | null = null;
  loading: boolean = false;

  constructor(private route: ActivatedRoute, private sellerService: SellerService, private notify: NotificationService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('orderId');
    if (id) {
      this.orderId = Number(id);
    } else {
      this.router.navigate(['/seller/orders']);
    }
  }

  submit(): void {
    if (!this.orderId) return;
    if (!this.trackingNumber || !this.carrier) {
      this.error = 'Please enter tracking info.';
      return;
    }
    this.loading = true;
    this.error = null;
    const trackingInfo = { trackingNumber: this.trackingNumber, carrier: this.carrier };
    this.sellerService.markOrderShipped(this.orderId, trackingInfo).subscribe({
      next: () => {
        this.loading = false;
        this.notify.showSuccess('Order marked as shipped.');
        this.router.navigate(['/seller/orders']);
      },
      error: err => {
        console.error('Failed to mark shipped', err);
        this.error = 'Failed to update order.';
        this.loading = false;
      }
    });
  }
}
