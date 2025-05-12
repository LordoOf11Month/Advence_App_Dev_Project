// core/access-denied/access-denied.component.ts
import { Component } from '@angular/core';
@Component({
  selector: 'app-access-denied',
  standalone: false,
  template: `<h2>Access Denied</h2><p>You do not have permission to view this page.</p>`,
  styles: [`h2 { color: #d32f2f; }`]
})
export class AccessDeniedComponent { }
