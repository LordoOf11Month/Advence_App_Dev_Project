// core/footer/footer.component.ts
import { Component } from '@angular/core';
@Component({
  selector: 'app-footer',
  standalone: false,
  template: `<footer class="footer">&copy; 2025 E-Shop. All rights reserved.</footer>`,
  styles: [`.footer { text-align: center; padding: 1rem; background: #f0f0f0; margin-top: 2rem; }`]
})
export class FooterComponent { }
