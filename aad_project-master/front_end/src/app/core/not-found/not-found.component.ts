// core/not-found/not-found.component.ts
import { Component } from '@angular/core';
@Component({
  selector: 'app-not-found',
  standalone: false,
  template: `<h2>404 - Page Not Found</h2><p>The page you are looking for does not exist.</p>`,
  styles: [`h2 { color: #d32f2f; }`]
})
export class NotFoundComponent { }
