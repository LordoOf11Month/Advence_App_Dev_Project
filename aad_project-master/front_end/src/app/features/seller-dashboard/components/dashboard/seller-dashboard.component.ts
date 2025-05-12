import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../services/seller.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: false,
  templateUrl: './seller-dashboard.component.html'
})
export class SellerDashboardComponent implements OnInit {

  stats: any;
  loading = true;
  error: string | null = null;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    /* default to “monthly” – change to ’weekly’, ’daily’, … as you wish */
    this.fetchStats('monthly');
  }

  fetchStats(period?: string): void {
    this.loading = true;
    this.sellerService.getSalesStats(period).subscribe({
      next: data => { this.stats = data;  this.loading = false; },
      error: err  => {
        console.error('Stats load failed', err);
        this.error = 'Could not load analytics.';
        this.loading = false;
      }
    });
  }
}
