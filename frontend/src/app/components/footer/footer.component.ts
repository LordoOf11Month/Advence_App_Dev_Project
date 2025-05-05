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
            <div class="col-3 col-md-6 col-sm-12">
              <div class="footer-section">
                <h4>Shopping</h4>
                <ul>
                  <li><a href="#">Women</a></li>
                  <li><a href="#">Men</a></li>
                  <li><a href="#">Electronics</a></li>
                  <li><a href="#">Home & Living</a></li>
                  <li><a href="#">Beauty</a></li>
                </ul>
              </div>
            </div>
            
            <div class="col-3 col-md-6 col-sm-12">
              <div class="footer-section">
                <h4>About</h4>
                <ul>
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Corporate Information</a></li>
                  <li><a href="#">Sustainability</a></li>
                  <li><a href="#">Press</a></li>
                </ul>
              </div>
            </div>
            
            <div class="col-3 col-md-6 col-sm-12">
              <div class="footer-section">
                <h4>Help</h4>
                <ul>
                  <li><a href="#">Payments</a></li>
                  <li><a href="#">Shipping</a></li>
                  <li><a href="#">Cancellation & Returns</a></li>
                  <li><a href="#">FAQ</a></li>
                  <li><a href="#">Report Infringement</a></li>
                </ul>
              </div>
            </div>
            
            <div class="col-3 col-md-6 col-sm-12">
              <div class="footer-section">
                <h4>Contact Us</h4>
                <ul>
                  <li>Email: support&#64;trendyol.com</li>
                  <li>Phone: +90 123 456 7890</li>
                  <li>Hours: 9:00 AM - 6:00 PM, Mon - Fri</li>
                </ul>
                
                <div class="social-links">
                  <a href="#" class="social-link">
                    <span class="material-symbols-outlined">facebook</span>
                  </a>
                  <a href="#" class="social-link">
                    <span class="material-symbols-outlined">twitter</span>
                  </a>
                  <a href="#" class="social-link">
                    <span class="material-symbols-outlined">instagram</span>
                  </a>
                  <a href="#" class="social-link">
                    <span class="material-symbols-outlined">youtube</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer-middle">
          <div class="app-download">
            <h4>Download Our Mobile App</h4>
            <div class="app-buttons">
              <a href="#" class="app-btn">
                <span class="material-symbols-outlined">phone_iphone</span>
                App Store
              </a>
              <a href="#" class="app-btn">
                <span class="material-symbols-outlined">android</span>
                Google Play
              </a>
            </div>
          </div>
          
          <div class="payment-methods">
            <h4>Payment Methods</h4>
            <div class="payment-icons">
              <span class="payment-icon">Visa</span>
              <span class="payment-icon">MasterCard</span>
              <span class="payment-icon">PayPal</span>
              <span class="payment-icon">Apple Pay</span>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="copyright">
            <p>&copy; 2025 Trendyol Clone. All rights reserved.</p>
          </div>
          
          <div class="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
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
    
    .social-links {
      display: flex;
      margin-top: var(--space-4);
    }
    
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background-color: var(--neutral-700);
      color: var(--white);
      border-radius: 50%;
      margin-right: var(--space-2);
      transition: all var(--transition-fast);
    }
    
    .social-link:hover {
      background-color: var(--primary);
    }
    
    .footer-middle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: var(--space-6) 0;
      padding: var(--space-5) 0;
      border-top: 1px solid var(--neutral-700);
      border-bottom: 1px solid var(--neutral-700);
    }
    
    .app-download h4, .payment-methods h4 {
      color: var(--white);
      margin-bottom: var(--space-3);
      font-size: 1rem;
    }
    
    .app-buttons {
      display: flex;
    }
    
    .app-btn {
      display: flex;
      align-items: center;
      background-color: var(--neutral-700);
      color: var(--white);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      margin-right: var(--space-3);
      transition: all var(--transition-fast);
    }
    
    .app-btn:hover {
      background-color: var(--primary);
    }
    
    .app-btn .material-symbols-outlined {
      margin-right: var(--space-2);
    }
    
    .payment-icons {
      display: flex;
      flex-wrap: wrap;
    }
    
    .payment-icon {
      display: inline-block;
      background-color: var(--neutral-700);
      color: var(--white);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      margin-right: var(--space-2);
      margin-bottom: var(--space-2);
      font-size: 0.875rem;
    }
    
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-4);
    }
    
    .copyright p {
      color: var(--neutral-400);
      font-size: 0.875rem;
      margin: 0;
    }
    
    .legal-links a {
      color: var(--neutral-400);
      font-size: 0.875rem;
      margin-left: var(--space-4);
      transition: color var(--transition-fast);
    }
    
    .legal-links a:hover {
      color: var(--primary-light);
    }
    
    @media (max-width: 768px) {
      .footer-middle {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .payment-methods {
        margin-top: var(--space-5);
      }
      
      .footer-bottom {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .legal-links {
        margin-top: var(--space-3);
      }
      
      .legal-links a {
        margin-left: 0;
        margin-right: var(--space-4);
      }
    }
  `]
})
export class FooterComponent { }
