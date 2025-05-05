import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.overlay]="overlay">
      <div class="spinner"></div>
      <p class="message" *ngIf="message">{{message}}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-4);
    }

    .spinner-container.overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 10;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--neutral-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .message {
      color: var(--neutral-600);
      font-size: 0.9375rem;
      margin: 0;
      text-align: center;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-color-scheme: dark) {
      .spinner-container.overlay {
        background-color: rgba(0, 0, 0, 0.8);
      }

      .spinner {
        border-color: var(--neutral-700);
        border-top-color: var(--primary);
      }

      .message {
        color: var(--neutral-300);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() overlay: boolean = false;
}