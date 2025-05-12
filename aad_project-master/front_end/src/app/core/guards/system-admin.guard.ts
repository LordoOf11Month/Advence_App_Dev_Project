// core/guards/system-admin.guard.ts (for Admin role)
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SystemAdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.auth.isLoggedIn() && this.auth.hasRole('PLATFORM_ADMIN')) {
      return true;
    } else {
      this.router.navigate(['/access-denied']);
      return false;
    }
  }
}
