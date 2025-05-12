import { NotificationService } from './../../../../core/services/notification.service';
import { AuthService } from './../../../../core/services/auth.service';
// features/auth/components/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private notify: NotificationService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.error = null;
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.notify.showSuccess('Login successful!');
        this.router.navigate(['/']);  // go to home or intended page
      },
      error: err => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Invalid email or password.';
        } else if (err.status === 403) {
          // User is banned
          this.error = 'Your account has been banned. Please contact support for assistance.';
        } else {
          this.error = 'Login failed. Please try again.';
        }
      }
    });
  }
}
