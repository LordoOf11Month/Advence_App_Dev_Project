import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionName } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // First check if user is authenticated at all
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    
    // Get required permissions from route data
    const requiredPermission = route.data['requiredPermission'] as PermissionName;
    const requiredAnyPermissions = route.data['requiredAnyPermissions'] as PermissionName[];
    const requiredAllPermissions = route.data['requiredAllPermissions'] as PermissionName[];
    
    // Check for single permission
    if (requiredPermission && !this.authService.hasPermission(requiredPermission)) {
      this.router.navigate(['/']);
      return false;
    }
    
    // Check if user has at least one of the listed permissions
    if (requiredAnyPermissions && 
        requiredAnyPermissions.length > 0 && 
        !this.authService.hasAnyPermission(requiredAnyPermissions)) {
      this.router.navigate(['/']);
      return false;
    }
    
    // Check if user has all of the listed permissions
    if (requiredAllPermissions && 
        requiredAllPermissions.length > 0 && 
        !this.authService.hasAllPermissions(requiredAllPermissions)) {
      this.router.navigate(['/']);
      return false;
    }
    
    return true;
  }
} 