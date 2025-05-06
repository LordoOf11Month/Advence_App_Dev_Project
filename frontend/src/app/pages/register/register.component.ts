import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="auth-container">
        <h1>Create Account</h1>
        
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                [(ngModel)]="firstName"
                required
                #firstNameInput="ngModel"
              >
              <div class="error-message" *ngIf="firstNameInput.invalid && firstNameInput.touched">
                First name is required
              </div>
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                [(ngModel)]="lastName"
                required
                #lastNameInput="ngModel"
              >
              <div class="error-message" *ngIf="lastNameInput.invalid && lastNameInput.touched">
                Last name is required
              </div>
            </div>
          </div>
          
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
              minlength="8"
              #passwordInput="ngModel"
            >
            <div class="error-message" *ngIf="passwordInput.invalid && passwordInput.touched">
              Password must be at least 8 characters long
            </div>
          </div>
          
          <div class="error-message" *ngIf="error">
            {{error}}
          </div>
          
          <button 
            type="submit" 
            class="submit-btn" 
            [disabled]="registerForm.invalid || loading"
          >
            {{loading ? 'Creating Account...' : 'Create Account'}}
          </button>
        </form>
        
        <div class="auth-links">
          <p>Already have an account? <a routerLink="/login">Login</a></p>
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
    
    .form-row {
      display: flex;
      gap: var(--space-4);
    }
    
    .form-group {
      flex: 1;
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
    
    @media (max-width: 576px) {
      .form-row {
        flex-direction: column;
        gap: var(--space-4);
      }
      
      .auth-container {
        padding: var(--space-4);
        margin: var(--space-4) auto;
      }
    }
  `]
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) return;
    
    this.loading = true;
    this.error = '';
    
    console.log('Submitting registration form with data:', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password.length + ' characters'
    });
    
    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Registration successful, response:', response);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.error = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
