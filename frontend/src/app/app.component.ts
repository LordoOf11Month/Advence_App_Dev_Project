import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CompareBarComponent } from './components/compare-bar/compare-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CompareBarComponent
  ],
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-compare-bar></app-compare-bar>
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
  `]
})
export class AppComponent {
  title = 'Trendway';
}