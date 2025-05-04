import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { User, LoginCredentials, RegisterData, AuthResponse, SellerRegistrationData, RefreshTokenResponse, Permission, PermissionName } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;
  
  constructor() {
    this.loadStoredUser();
  }
  
  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken && decodedToken.user) {
          this.currentUserSubject.next(decodedToken.user);
          
          // Set up automatic token refresh before expiration
          this.scheduleTokenRefresh(decodedToken.exp);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        this.logout();
      }
    }
  }
  
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Mock login - replace with actual API call
    if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
      const response: AuthResponse = {
        user: {
          id: '1',
          email: credentials.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: [
            { id: '1', name: 'product:create', description: 'Create products' },
            { id: '2', name: 'product:read', description: 'View products' },
            { id: '3', name: 'product:update', description: 'Update products' },
            { id: '4', name: 'product:delete', description: 'Delete products' },
            { id: '5', name: 'user:create', description: 'Create users' },
            { id: '6', name: 'user:read', description: 'View users' },
            { id: '7', name: 'user:update', description: 'Update users' },
            { id: '8', name: 'user:delete', description: 'Delete users' }
          ]
        },
        token: this.generateMockToken('admin'),
        refreshToken: 'mock-refresh-token-admin'
      };
      
      return of(response).pipe(
        delay(1000),
        tap(res => this.handleAuthResponse(res))
      );
    }
    
    if (credentials.email === 'seller@example.com' && credentials.password === 'seller123') {
      const response: AuthResponse = {
        user: {
          id: '3',
          email: credentials.email,
          firstName: 'Sample',
          lastName: 'Seller',
          role: 'seller',
          storeName: 'Tech Galaxy',
          storeDescription: 'Your one-stop shop for all electronics',
          permissions: [
            { id: '1', name: 'product:create', description: 'Create products' },
            { id: '2', name: 'product:read', description: 'View products' },
            { id: '3', name: 'product:update', description: 'Update products' },
            { id: '4', name: 'product:delete', description: 'Delete products' },
            { id: '9', name: 'order:read', description: 'View orders' },
            { id: '10', name: 'order:update', description: 'Update orders' }
          ]
        },
        token: this.generateMockToken('seller'),
        refreshToken: 'mock-refresh-token-seller'
      };
      
      return of(response).pipe(
        delay(1000),
        tap(res => this.handleAuthResponse(res))
      );
    }
    
    if (credentials.email === 'user@example.com' && credentials.password === 'user123') {
      const response: AuthResponse = {
        user: {
          id: '2',
          email: credentials.email,
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          permissions: [
            { id: '2', name: 'product:read', description: 'View products' },
            { id: '9', name: 'order:read', description: 'View orders' },
            { id: '11', name: 'order:create', description: 'Create orders' },
            { id: '12', name: 'order:cancel', description: 'Cancel orders' }
          ]
        },
        token: this.generateMockToken('user'),
        refreshToken: 'mock-refresh-token-user'
      };
      
      return of(response).pipe(
        delay(1000),
        tap(res => this.handleAuthResponse(res))
      );
    }
    
    return throwError(() => new Error('Invalid credentials'));
  }
  
  register(data: RegisterData | SellerRegistrationData): Observable<AuthResponse> {
    // Check if it's a seller registration
    const isSeller = 'storeName' in data;
    
    // Default permissions based on role
    const permissions: Permission[] = isSeller ? [
      { id: '1', name: 'product:create', description: 'Create products' },
      { id: '2', name: 'product:read', description: 'View products' },
      { id: '3', name: 'product:update', description: 'Update products' },
      { id: '4', name: 'product:delete', description: 'Delete products' },
      { id: '9', name: 'order:read', description: 'View orders' },
      { id: '10', name: 'order:update', description: 'Update orders' }
    ] : [
      { id: '2', name: 'product:read', description: 'View products' },
      { id: '9', name: 'order:read', description: 'View orders' },
      { id: '11', name: 'order:create', description: 'Create orders' },
      { id: '12', name: 'order:cancel', description: 'Cancel orders' }
    ];
    
    // Mock registration - replace with actual API call
    const response: AuthResponse = {
      user: {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: isSeller ? 'seller' : 'user',
        permissions,
        ...(isSeller && {
          storeName: (data as SellerRegistrationData).storeName,
          storeDescription: (data as SellerRegistrationData).storeDescription
        })
      },
      token: this.generateMockToken(isSeller ? 'seller' : 'user'),
      refreshToken: `mock-refresh-token-${isSeller ? 'seller' : 'user'}-${Math.random().toString(36).substr(2, 5)}`
    };
    
    return of(response).pipe(
      delay(1000),
      tap(res => this.handleAuthResponse(res))
    );
  }
  
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    // Mock token refresh - replace with actual API call
    const role = this.currentUserSubject.value?.role || 'user';
    const response: RefreshTokenResponse = {
      token: this.generateMockToken(role),
      refreshToken: refreshToken // Reuse the same refresh token for simplicity in this mock
    };
    
    return of(response).pipe(
      delay(500),
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
      })
    );
  }
  
  private generateMockToken(role: string): string {
    // In a real implementation, this would be a JWT from the server
    // For mock purposes, create a token with a 1-hour expiration
    const expiration = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    return `mock-jwt-token-${role}-${expiration}`;
  }
  
  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    this.currentUserSubject.next(response.user);
    
    // Set up token refresh before expiration
    try {
      const decodedToken: any = jwtDecode(response.token);
      this.scheduleTokenRefresh(decodedToken.exp);
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
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.clearTokenTimer();
  }
  
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isSeller(): boolean {
    return this.currentUserSubject.value?.role === 'seller';
  }
  
  hasPermission(permission: PermissionName): boolean {
    return !!this.currentUserSubject.value?.permissions?.some(p => p.name === permission);
  }
  
  hasAnyPermission(permissions: PermissionName[]): boolean {
    return !!this.currentUserSubject.value?.permissions?.some(p => 
      permissions.includes(p.name as PermissionName)
    );
  }
  
  hasAllPermissions(permissions: PermissionName[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }
}
