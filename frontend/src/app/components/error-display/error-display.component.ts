import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" 
         class="error-container" 
         [class.error]="type === 'error'"
         [class.warning]="type === 'warning'"
         [class.info]="type === 'info'"
         [@slideIn]>
      <div class="content">
        <span class="icon">
          {{ type === 'error' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️' }}
        </span>
        <p class="message">{{message}}</p>
      </div>
      <button class="close-btn" 
              (click)="dismissError()"
              (keydown.enter)="dismissError()"
              aria-label="Close message">
        ×
      </button>
    </div>
  `,
  styles: [`
    .error-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      max-width: 400px;
      z-index: 1000;
    }

    .content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      flex: 1;
    }

    .error { 
      border-left: 4px solid var(--error);
      background-color: var(--error-light);
    }

    .warning {
      border-left: 4px solid var(--warning);
      background-color: var(--warning-light);
    }

    .info {
      border-left: 4px solid var(--info);
      background-color: var(--info-light);
    }

    .message {
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--neutral-800);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--neutral-600);
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--neutral-900);
    }

    .close-btn:focus {
      outline: 2px solid var(--primary);
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .error-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .error-container {
        animation: slideIn 0.3s ease-out;
      }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ErrorDisplayComponent {
  @Input() message = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() visible = false;
  @Input() autoDismiss = true;
  @Input() dismissDuration = 5000;
  @Output() dismiss = new EventEmitter<void>();

  private timeoutId?: number;

  ngOnInit() {
    if (this.autoDismiss) {
      this.setupAutoDismiss();
    }
  }

  ngOnChanges() {
    if (this.visible && this.autoDismiss) {
      this.setupAutoDismiss();
    }
  }

  private setupAutoDismiss() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(() => {
      this.dismissError();
    }, this.dismissDuration);
  }

  dismissError() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.dismiss.emit();
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }
}