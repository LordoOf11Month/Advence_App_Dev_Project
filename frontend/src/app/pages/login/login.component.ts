import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="auth-container">
        <h1>Login</h1>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              #emailInput="ngModel"
            >
            <div class="error-message" *ngIf="emailInput.invalid && emailInput.touched">
              Please enter a valid email address
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              #passwordInput="ngModel"
            >
            <div class="error-message" *ngIf="passwordInput.invalid && passwordInput.touched">
              Password must be at least 6 characters long
            </div>
          </div>
          
          <div class="error-message" *ngIf="error">
            {{error}}
          </div>
          
          <button 
            type="submit" 
            class="submit-btn" 
            [disabled]="loginForm.invalid || loading"
          >
            {{loading ? 'Logging in...' : 'Login'}}
          </button>
        </form>
        
        <div class="auth-links">
          <p>Don't have an account? <a routerLink="/register">Register</a></p>
        </div>
        
        <div class="test-accounts">
          <p>Test Accounts:</p>
          <button class="test-account-btn" (click)="fillTestAccount('admin@example.com', 'password')">Admin</button>
          <button class="test-account-btn" (click)="fillTestAccount('seller@example.com', 'password')">Seller</button>
          <button class="test-account-btn" (click)="fillTestAccount('customer@example.com', 'password')">Customer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      width: 100%;
      padding-right: var(--space-4);
      padding-left: var(--space-4);
      margin-right: auto;
      margin-left: auto;
      max-width: 100%;
      overflow-x: hidden;
    }
    
    .auth-container {
      max-width: 400px;
      width: 100%;
      margin: var(--space-8) auto;
      padding: var(--space-6);
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
    }
    
    .auth-container h1 {
      text-align: center;
      margin-bottom: var(--space-6);
      color: var(--neutral-900);
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    
    .form-group label {
      font-size: 0.9375rem;
      color: var(--neutral-700);
    }
    
    .form-group input {
      padding: var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 1rem;
      transition: border-color var(--transition-fast);
      width: 100%;
      box-sizing: border-box;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    .error-message {
      color: var(--error);
      font-size: 0.875rem;
    }
    
    .submit-btn {
      background-color: var(--primary);
      color: var(--white);
      padding: var(--space-3);
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .submit-btn:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
    
    .submit-btn:disabled {
      background-color: var(--neutral-400);
      cursor: not-allowed;
    }
    
    .auth-links {
      margin-top: var(--space-4);
      text-align: center;
      font-size: 0.9375rem;
    }
    
    .test-accounts {
      margin-top: var(--space-5);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
      text-align: center;
    }
    
    .test-accounts p {
      font-size: 0.9375rem;
      margin-bottom: var(--space-2);
      color: var(--neutral-600);
    }
    
    .test-account-btn {
      margin: 0 var(--space-1);
      padding: var(--space-1) var(--space-3);
      background-color: var(--neutral-100);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      color: var(--neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .test-account-btn:hover {
      background-color: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
    }
    
    @media (max-width: 576px) {
      .auth-container {
        padding: var(--space-4);
        margin: var(--space-4) auto;
      }
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  onSubmit(): void {
    if (!this.email || !this.password) return;
    
    this.loading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
  
  fillTestAccount(email: string, password: string): void {
    this.email = email;
    this.password = password;
  }
}
