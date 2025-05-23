import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Check for admin route
      if (route.data['requiresAdmin'] && !this.authService.isAdmin()) {
        this.router.navigate(['/']);
        return false;
      }

      // Check for seller route
      if (route.data['requiresSeller'] && !this.authService.isSeller()) {
        this.router.navigate(['/']);
        return false;
      }

      return true;
    }
    
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
