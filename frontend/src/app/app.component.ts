import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-container">
      <app-header></app-header>
      
      <div class="announcement-bar">
        🎉 New Feature: Product Reviews & Ratings - Share your experience with our products! 🎉
      </div>
      
      <main>
        <router-outlet></router-outlet>
      </main>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    main {
      flex: 1;
      padding-top: var(--space-4);
      padding-bottom: var(--space-4);
    }
    
    .announcement-bar {
      background-color: #4CAF50;
      color: white;
      text-align: center;
      padding: 8px;
      font-size: 14px;
      font-weight: 500;
    }
  `]
})
export class AppComponent {
  title = 'E-Commerce App';
}
