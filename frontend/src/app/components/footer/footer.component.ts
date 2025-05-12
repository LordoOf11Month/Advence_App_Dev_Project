import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer>
      <div class="container">
        <div class="footer-top">
          <div class="row">
            <div class="col-6 col-md-6 col-sm-12">
              <div class="footer-section">
                <h4>Shopping</h4>
                <ul>
                  <li><a routerLink="/category/women">Women</a></li>
                  <li><a routerLink="/category/men">Men</a></li>
                  <li><a routerLink="/category/electronics">Electronics</a></li>
                  <li><a routerLink="/category/home-living">Home & Living</a></li>
                  <li><a routerLink="/category/beauty">Beauty</a></li>
                </ul>
              </div>
            </div>
            
            <div class="col-6 col-md-6 col-sm-12">
              <div class="footer-section">
                <h4>Legal</h4>
                <ul>
                  <li><a routerLink="/terms">Terms of Service</a></li>
                  <li><a routerLink="/privacy">Privacy Policy</a></li>
                  <li><a routerLink="/cookies">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="copyright">
            <p>&copy; 2025 Trendway. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      background-color: var(--neutral-800);
      color: var(--neutral-100);
      padding: var(--space-8) 0 var(--space-4);
      margin-top: var(--space-8);
    }
    
    .footer-section {
      margin-bottom: var(--space-6);
    }
    
    .footer-section h4 {
      color: var(--white);
      font-size: 1.125rem;
      margin-bottom: var(--space-4);
      font-weight: 600;
    }
    
    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .footer-section li {
      margin-bottom: var(--space-2);
    }
    
    .footer-section a {
      color: var(--neutral-300);
      font-size: 0.9375rem;
      transition: color var(--transition-fast);
    }
    
    .footer-section a:hover {
      color: var(--primary-light);
    }
    
    .footer-bottom {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-700);
    }
    
    .copyright p {
      color: var(--neutral-400);
      font-size: 0.875rem;
      margin: 0;
      text-align: center;
    }
    
    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -15px;
    }
    
    .col-6 {
      flex: 0 0 50%;
      max-width: 50%;
      padding: 0 15px;
    }
    
    @media (max-width: 768px) {
      .col-md-6 {
        flex: 0 0 50%;
        max-width: 50%;
      }
    }
    
    @media (max-width: 576px) {
      .col-sm-12 {
        flex: 0 0 100%;
        max-width: 100%;
      }
      
      .footer-bottom {
        flex-direction: column;
      }
    }
  `]
})
export class FooterComponent {}
