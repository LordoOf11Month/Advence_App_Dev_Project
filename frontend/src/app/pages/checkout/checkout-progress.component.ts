import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutStep } from '../../models/order.model';

@Component({
  selector: 'app-checkout-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="checkout-progress">
      <div class="progress-step" 
        [class.active]="currentStep === 'shipping' || currentStep === 'payment' || currentStep === 'review' || currentStep === 'confirmation'"
        [class.completed]="currentStep === 'payment' || currentStep === 'review' || currentStep === 'confirmation'"
      >
        <div class="step-number">1</div>
        <div class="step-label">Shipping</div>
      </div>
      
      <div class="progress-connector"
        [class.active]="currentStep === 'payment' || currentStep === 'review' || currentStep === 'confirmation'"
      ></div>
      
      <div class="progress-step"
        [class.active]="currentStep === 'payment' || currentStep === 'review' || currentStep === 'confirmation'"
        [class.completed]="currentStep === 'review' || currentStep === 'confirmation'"
      >
        <div class="step-number">2</div>
        <div class="step-label">Payment</div>
      </div>
      
      <div class="progress-connector"
        [class.active]="currentStep === 'review' || currentStep === 'confirmation'"
      ></div>
      
      <div class="progress-step"
        [class.active]="currentStep === 'review' || currentStep === 'confirmation'"
        [class.completed]="currentStep === 'confirmation'"
      >
        <div class="step-number">3</div>
        <div class="step-label">Review</div>
      </div>
      
      <div class="progress-connector"
        [class.active]="currentStep === 'confirmation'"
      ></div>
      
      <div class="progress-step"
        [class.active]="currentStep === 'confirmation'"
      >
        <div class="step-number">4</div>
        <div class="step-label">Confirmation</div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-progress {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 700px;
      margin: 0 auto var(--space-6);
    }
    
    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    
    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--neutral-200);
      color: var(--neutral-600);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: var(--space-2);
      transition: all var(--transition-fast);
    }
    
    .step-label {
      font-size: 0.875rem;
      color: var(--neutral-600);
      transition: color var(--transition-fast);
    }
    
    .progress-connector {
      flex: 1;
      height: 2px;
      background-color: var(--neutral-200);
      margin: 0 var(--space-2);
      position: relative;
      top: -16px;
      transition: background-color var(--transition-fast);
    }
    
    .progress-step.active .step-number {
      background-color: var(--primary);
      color: var(--white);
    }
    
    .progress-step.active .step-label {
      color: var(--primary);
      font-weight: 500;
    }
    
    .progress-step.completed .step-number {
      background-color: var(--success);
      color: var(--white);
    }
    
    .progress-connector.active {
      background-color: var(--success);
    }
    
    @media (max-width: 576px) {
      .checkout-progress {
        max-width: 100%;
      }
      
      .step-label {
        font-size: 0.75rem;
      }
    }
  `]
})
export class CheckoutProgressComponent {
  @Input() currentStep: CheckoutStep = 'shipping';
} 