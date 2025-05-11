import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map, mergeMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { User, LoginCredentials, RegisterData, AuthResponse, SellerRegistrationData, RefreshTokenResponse, Permission, PermissionName } from '../models/auth.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;
  
  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }
  
  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('loadStoredUser - Decoded token:', decodedToken);
        
        // Extract roles - could be in different formats from backend
        let roles: string[] = [];
        if (decodedToken.roles) {
          // If roles are in token
          if (Array.isArray(decodedToken.roles)) {
            roles = decodedToken.roles;
          } else if (typeof decodedToken.roles === 'string') {
            // Sometimes roles might be a comma-separated string
            roles = decodedToken.roles.split(',');
          }
        } else if (decodedToken.role) {
          // Sometimes roles might be under 'role'
          if (Array.isArray(decodedToken.role)) {
            roles = decodedToken.role;
          } else if (typeof decodedToken.role === 'string') {
            roles = [decodedToken.role];
          }
        } else if (decodedToken.authorities) {
          // Sometimes Spring Security uses 'authorities'
          roles = decodedToken.authorities;
        } else {
          // Look for common role patterns in the token
          Object.keys(decodedToken).forEach(key => {
            if (key.toLowerCase().includes('role') || 
                key.toLowerCase().includes('auth')) {
              console.log(`Found possible role field: ${key}`, decodedToken[key]);
              if (Array.isArray(decodedToken[key])) {
                roles = decodedToken[key];
              } else if (typeof decodedToken[key] === 'string') {
                roles = [decodedToken[key]];
              }
            }
          });
        }
        
        console.log('loadStoredUser - Extracted roles:', roles);
        
        // Force admin role for admin@example.com for testing
        const email = decodedToken.email || decodedToken.sub;
        if (email === 'admin@example.com') {
          console.log('Admin email detected! Forcing admin role.');
          roles.push('ROLE_ADMIN');
        }
        
        // Create a user object from the decoded token
        const user: User = {
          id: decodedToken.id || decodedToken.sub || '',
          email: email || '',
          firstName: decodedToken.firstName || '', 
          lastName: decodedToken.lastName || '',
          role: this.mapRole(roles)
        };
        
        console.log('loadStoredUser - Created user:', user);
        
        this.currentUserSubject.next(user);
        
        // Set up automatic token refresh before expiration
        if (decodedToken.exp) {
          this.scheduleTokenRefresh(decodedToken.exp);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        this.logout();
      }
    }
  }
  
  // Map backend roles to frontend user role
  private mapRole(roles: string[]): 'admin' | 'seller' | 'user' {
    // Convert roles to lowercase for case-insensitive comparison
    const lowerCaseRoles = roles.map(role => role.toLowerCase());
    
    // Check for admin - various formats the backend might return
    if (
      lowerCaseRoles.includes('role_admin') || 
      lowerCaseRoles.includes('admin')
    ) {
      return 'admin';
    }
    
    // Check for seller roles
    if (
      lowerCaseRoles.includes('role_seller') || 
      lowerCaseRoles.includes('seller')
    ) {
      return 'seller';
    }
    
    // Default to user/customer
    return 'user';
  }
  
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          try {
            console.log('Auth response from backend:', response);
            
            // Transform backend response to match our frontend AuthResponse format
            const decodedToken: any = jwtDecode(response.token);
            console.log('Decoded token from login:', decodedToken);
            
            // Extract roles from token or response
            let roles: string[] = [];
            
            // Try to get roles from response first
            if (response.roles) {
              if (Array.isArray(response.roles)) {
                roles = response.roles;
              } else if (typeof response.roles === 'string') {
                roles = response.roles.split(',');
              }
            } 
            
            // Try to get roles from token if not found in response
            if (roles.length === 0) {
              if (decodedToken.roles) {
                if (Array.isArray(decodedToken.roles)) {
                  roles = decodedToken.roles;
                } else if (typeof decodedToken.roles === 'string') {
                  roles = decodedToken.roles.split(',');
                }
              } else if (decodedToken.role) {
                if (Array.isArray(decodedToken.role)) {
                  roles = decodedToken.role;
                } else if (typeof decodedToken.role === 'string') {
                  roles = [decodedToken.role];
                }
              } else if (decodedToken.authorities) {
                roles = decodedToken.authorities;
              }
            }
            
            console.log('Extracted roles from login:', roles);
            
            // Force admin role for admin@example.com for testing
            const email = response.email || decodedToken.sub || decodedToken.email;
            if (email === 'admin@example.com') {
              console.log('Admin email detected during login! Forcing admin role.');
              roles.push('ROLE_ADMIN');
            }
            
            // Create user from token data
            const user: User = {
              id: (response.id || decodedToken.id || decodedToken.sub || '').toString(),
              email: email || '',
              firstName: decodedToken.firstName || response.firstName || '',
              lastName: decodedToken.lastName || response.lastName || '',
              role: this.mapRole(roles)
            };
            
            console.log('User created during login:', user);
            
            const authResponse: AuthResponse = {
              user,
              token: response.token,
              refreshToken: response.refreshToken || response.token
            };
            
            return authResponse;
          } catch (e) {
            console.error('Error processing login response:', e);
            throw new Error('Invalid response from server');
          }
        }),
        tap(res => this.handleAuthResponse(res)),
        catchError(error => this.handleError(error))
      );
  }
  
  register(data: RegisterData | SellerRegistrationData): Observable<AuthResponse> {
    // Determine if it's a seller registration
    const endpoint = 'storeName' in data ? '/seller-register' : '/register';
    
    return this.http.post<any>(`${this.apiUrl}${endpoint}`, data)
      .pipe(
        tap(() => console.log('Registration successful')),
        // After successful registration, we'll log in the user
        map(response => {
          // After registration, proceed to login
          const credentials: LoginCredentials = {
            email: data.email,
            password: data.password
          };
          return credentials;
        }),
        mergeMap(credentials => this.login(credentials)),
        catchError(this.handleError)
      );
  }
  
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('refreshToken', res.refreshToken);
          
          // Update token expiration timer
          try {
            const decodedToken: any = jwtDecode(res.token);
            this.scheduleTokenRefresh(decodedToken.exp);
          } catch (error) {
            console.error('Invalid token:', error);
          }
        }),
        catchError(this.handleError)
      );
  }
  
  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    this.currentUserSubject.next(response.user);
    
    // Set up token refresh before expiration
    try {
      const decodedToken: any = jwtDecode(response.token);
      if (decodedToken.exp) {
        this.scheduleTokenRefresh(decodedToken.exp);
      }
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }
  
  private scheduleTokenRefresh(expirationTimestamp: number): void {
    // Clear any existing timer
    this.clearTokenTimer();
    
    // Calculate time until token expires (in milliseconds)
    const expiresIn = expirationTimestamp * 1000 - Date.now();
    
    // Schedule refresh 1 minute before expiration
    const refreshIn = Math.max(0, expiresIn - 60000);
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.refreshToken().subscribe();
    }, refreshIn);
  }
  
  private clearTokenTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }
  
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => this.clearUserData()),
        catchError(error => {
          // Even if the server logout fails, we should clean up local state
          this.clearUserData();
          return throwError(() => error);
        })
      );
  }
  
  private clearUserData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.clearTokenTimer();
  }
  
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to the server. Please check your network connection and try again.';
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this resource';
      } else if (error.status === 400) {
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Authentication error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  getCurrentUserId(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.id : null;
  }
  
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    console.log('isAdmin check - Current user:', user);
    const isAdmin = user?.role === 'admin';
    console.log('User has admin role:', isAdmin);
    return isAdmin;
  }
  
  isSeller(): boolean {
    return this.currentUserSubject.value?.role === 'seller';
  }
  
  hasPermission(permission: PermissionName): boolean {
    // In a real implementation, you'd check the user's permissions array
    // or call an API to verify if the user has a specific permission
    // For now, using simplified role-based permissions
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // This is simplified - in a real app, you'd want to check the actual permissions
    if (user.role === 'admin') return true; // Admin has all permissions
    
    // Simplified permission checks based on role
    if (user.role === 'seller') {
      const sellerPermissions = ['products:view', 'products:create', 'products:edit', 'products:delete', 
                                'orders:view', 'orders:manage'];
      return sellerPermissions.includes(permission);
    }
    
    if (user.role === 'user') {
      const userPermissions = ['products:view', 'orders:view'];
      return userPermissions.includes(permission);
    }
    
    return false;
  }
  
  hasAnyPermission(permissions: PermissionName[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }
  
  hasAllPermissions(permissions: PermissionName[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }
  
  // Add this public getter to access the current user
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
