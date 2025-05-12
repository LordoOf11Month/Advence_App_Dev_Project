import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CheckoutService } from '../../services/checkout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CheckoutComponent implements OnInit {
  currentStep$: Observable<string>;
  currentStepValue: string | null = null;
  steps: { path: string; label: string }[] = [
    { path: 'shipping', label: 'Shipping' },
    { path: 'payment', label: 'Payment' },
    { path: 'review', label: 'Review' },
    { path: 'confirmation', label: 'Confirmation' }
  ];

  constructor(private checkoutService: CheckoutService, private router: Router) {
    this.currentStep$ = this.checkoutService.currentStep$;
    this.currentStep$.subscribe(value => this.currentStepValue = value);

    // Optionally, update CheckoutService's current step based on router changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        const segments = url.split('/');
        const lastSegment = segments[segments.length - 1];
        // Check if lastSegment is one of the known checkout steps
        if (this.steps.some(step => step.path === lastSegment)) {
          return lastSegment;
        }
        return null; // Or a default step if not on a specific checkout route
      }),
      filter(step => step !== null)
    ).subscribe(step => {
      if (step) this.checkoutService.setCurrentStep(step);
    });
  }

  ngOnInit(): void {
    // Initialize with the first step if not already set or determined by route
    // For example, navigate to the first step if the user lands on /checkout directly.
    // const currentRouteStep = this.router.url.split('/').pop();
    // if (!this.steps.some(s => s.path === currentRouteStep)) {
    //   this.router.navigate(['/checkout/shipping']);
    // }
  }

  isStepActive(stepPath: string): boolean {
    return stepPath === this.currentStepValue;
  }

  isStepCompleted(stepPath: string): boolean {
    if (!this.currentStepValue) return false;
    const currentIndex = this.steps.findIndex(s => s.path === this.currentStepValue);
    const stepIndex = this.steps.findIndex(s => s.path === stepPath);
    return stepIndex < currentIndex;
  }

  isStepDisabled(stepPath: string): boolean {
    if (!this.currentStepValue) return stepPath !== 'shipping'; // Only shipping enabled initially
    const currentIndex = this.steps.findIndex(s => s.path === this.currentStepValue);
    const stepIndex = this.steps.findIndex(s => s.path === stepPath);
    // A step is disabled if it's further than the current step and not the current step itself.
    // This logic might need adjustment based on whether users can jump back to completed steps.
    return stepIndex > currentIndex && stepIndex !== currentIndex;
  }

  navigateToStep(stepPath: string): void {
    if (!this.isStepDisabled(stepPath) && !this.isStepActive(stepPath)) {
      this.router.navigate(['/checkout', stepPath]);
    }
  }
}
