// core/guards/seller-admin.guard.ts (for Seller role)
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SellerAdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.auth.isLoggedIn()&&this.auth.hasRole('SELLER')) {
      return true;
    }
    // Not a seller, deny access
    this.router.navigate(['/access-denied']);
    return false;
  }
}
