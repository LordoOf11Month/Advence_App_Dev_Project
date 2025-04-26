import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          <a href="#" class="forgot-password">Forgot Password?</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
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
    
    .auth-links p {
      margin-bottom: var(--space-2);
    }
    
    .forgot-password {
      color: var(--neutral-600);
    }
    
    .forgot-password:hover {
      color: var(--primary);
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
        }
      });
  }
}