import { AdminService } from './../../services/system-admin.service';
// features/system-admin/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats: any;
  loading: boolean = true;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getPlatformStats().subscribe({
      next: data => {
        this.stats = data;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load platform stats', err);
        this.error = 'Could not load statistics.';
        this.loading = false;
      }
    });
  }
}
