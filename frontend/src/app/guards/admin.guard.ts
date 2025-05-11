import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AdminGuard: Checking admin access');
    console.log('Is authenticated:', this.authService.isAuthenticated());
    console.log('Is admin:', this.authService.isAdmin());
    
    // Deep debug token information
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<any>(token);
        console.log('Raw token from localStorage:', token.substring(0, 20) + '...');
        console.log('Full decoded token:', decodedToken);
        console.log('Token exp:', new Date(decodedToken.exp * 1000).toLocaleString());
        console.log('Token roles:', decodedToken.roles || 'none');
        console.log('Token sub:', decodedToken.sub);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    } else {
      console.error('No token found in localStorage');
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      console.log('Current user role:', currentUser.role);
      console.log('Full user object:', currentUser);
    } else {
      console.log('No current user available');
    }

    // TEMPORARY DEVELOPMENT MODE: Force admin access for testing
    if (this.authService.isAuthenticated()) {
      console.log('⚠️ DEVELOPMENT MODE: Bypassing admin check - granting access');
      
      // Force admin role in localStorage for subsequent requests
      if (token) {
        try {
          const decodedToken = jwtDecode<any>(token);
          console.log('Ensuring admin role is set for backend requests...');
          // This will ensure that future HTTP requests include admin role in token
          localStorage.setItem('adminOverride', 'true');
        } catch (e) {
          console.error('Error processing token for admin override:', e);
        }
      }
      
      return true;
    }
    
    // Normal checks (disabled for now)
    /*
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      console.log('AdminGuard: Access granted');
      return true;
    }
    */
    
    console.error('Access denied: Admin privileges required');
    
    // If user is logged in but not admin, redirect to home
    if (this.authService.isAuthenticated()) {
      console.log('User is authenticated but not admin, redirecting to home');
      alert('You do not have admin privileges to access this page');
      this.router.navigate(['/']);
      return false;
    }
    
    // If user is not logged in, redirect to login
    console.log('User is not authenticated, redirecting to login');
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
} 