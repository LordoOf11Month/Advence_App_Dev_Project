// shared/components/loading-spinner/loading-spinner.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from '../../../core/services/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-spinner',
  standalone: false,
  template: `<div class="backdrop" *ngIf="loading"><mat-progress-spinner mode="indeterminate"></mat-progress-spinner></div>`,
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  private sub?: Subscription;

  constructor(private loader: LoaderService) {}

  ngOnInit(): void {
    // subscribe to loading state
    this.sub = this.loader.loading$.subscribe(isLoading => {
      this.loading = isLoading;
    });
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
