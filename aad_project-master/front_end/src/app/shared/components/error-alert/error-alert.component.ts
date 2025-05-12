// shared/components/error-alert/error-alert.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  standalone: false,
  template: `<div class="error-alert" *ngIf="errorMessage"><span>{{ errorMessage }}</span></div>`,
  styles: [`
    .error-alert { color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; padding: 0.5rem; margin: 0.5rem 0; border-radius: 4px; }
  `]
})
export class ErrorAlertComponent {
  @Input() errorMessage: string | null = null;
}
