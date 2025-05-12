// core/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  username: string | null = null;
  isSeller: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Subscribe to login status
    this.authService.currentUser$.subscribe(user => {
      console.log('Current user object:', user); // Log the entire user object

      this.isLoggedIn = !!user;
      if (user) {
        this.username = user.name || user.email;

        // Check for user roles directly from the user object
        console.log('Raw roles from user object:', user.roles);

        // Direct check of roles array if it exists
        if (user.roles && Array.isArray(user.roles)) {
          // Try direct string matching for any admin-like role
          this.isAdmin = user.roles.some(role =>
            role.includes('ADMIN') || role.includes('admin')
          );

          // Try direct string matching for any seller-like role
          this.isSeller = user.roles.some(role =>
            role.includes('SELLER') || role.includes('seller')
          );
        }

        // Fallback to the service's hasRole method
        if (!this.isAdmin) {
          this.isAdmin = this.authService.hasRole('ADMIN') ||
                         this.authService.hasRole('ROLE_ADMIN') ||
                         this.authService.hasRole('PLATFORM_ADMIN') ||
                         this.authService.hasRole('ROLE_PLATFORM_ADMIN');
        }

        if (!this.isSeller) {
          this.isSeller = this.authService.hasRole('SELLER') ||
                          this.authService.hasRole('ROLE_SELLER');
        }

        // Final debug output
        console.log('Determined isAdmin value:', this.isAdmin);
        console.log('Determined isSeller value:', this.isSeller);

        // Force isAdmin true for username containing 'admin' (for testing)
        if (this.username && this.username.toLowerCase().includes('admin')) {
          console.log('Username contains "admin", forcing isAdmin to true');
          this.isAdmin = true;
        }

        // Force isSeller true for username containing 'sample' (for testing)
        if (this.username && this.username.toLowerCase().includes('sample')) {
          console.log('Username contains "sample", forcing isSeller to true');
          this.isSeller = true;
        }
      } else {
        this.username = null;
        this.isSeller = false;
        this.isAdmin = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
