import { NotificationService } from './../../../../core/services/notification.service';
import { AuthService } from './../../../../core/services/auth.service';
// features/auth/components/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string | null = null;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private notify: NotificationService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.error = null;
    if (this.registerForm.invalid) return;
    this.loading = true;
    const userData = this.registerForm.value;
    this.auth.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.notify.showSuccess('Registration successful! You can now log in.');
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.loading = false;
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
