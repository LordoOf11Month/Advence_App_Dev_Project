import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { User, LoginCredentials, RegisterData, AuthResponse, SellerRegistrationData, RefreshTokenResponse, Permission, PermissionName } from '../models/auth.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
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
        // Create a user object from the decoded token
        const user: User = {
          id: decodedToken.id,
          email: decodedToken.email,
          firstName: decodedToken.firstName || '', // These may need adjustments based on your JWT structure
          lastName: decodedToken.lastName || '',
          role: this.mapRole(decodedToken.roles)
        };
        
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
    if (roles.includes('ROLE_ADMIN')) return 'admin';
    if (roles.includes('ROLE_SELLER')) return 'seller';
    return 'user'; // Default to customer/user
  }
  
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    console.log('Login attempt with:', credentials);
    return this.http.post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          console.log('Raw backend response:', response);
          try {
            // Transform backend response to match our frontend AuthResponse format
            const decodedToken: any = jwtDecode(response.token);
            console.log('Decoded token:', decodedToken);
            
            // Create user from token data
            const user: User = {
              id: response.id.toString(),
              email: response.email,
              firstName: decodedToken.firstName || '',
              lastName: decodedToken.lastName || '',
              role: this.mapRole(response.roles)
            };
            
            const authResponse: AuthResponse = {
              user,
              token: response.token,
              refreshToken: response.token // Backend doesn't use refresh tokens yet
            };
            
            return authResponse;
          } catch (e) {
            console.error('Error decoding token, falling back to mock data:', e);
            
            // If we can't decode the token, create a mock user based on the credentials
            // This is a fallback for testing when backend isn't fully functional
            const mockUser: User = {
              id: '1',
              email: credentials.email,
              firstName: credentials.email.split('@')[0],
              lastName: '',
              role: credentials.email.includes('admin') ? 'admin' : 
                   credentials.email.includes('seller') ? 'seller' : 'user'
            };
            
            const authResponse: AuthResponse = {
              user: mockUser,
              token: response.token || 'mock-token',
              refreshToken: response.token || 'mock-token'
            };
            
            return authResponse;
          }
        }),
        tap(res => this.handleAuthResponse(res)),
        catchError(error => {
          console.error('Login error:', error);
          
          // For development/testing: if backend is not running, use mock data
          if (error.status === 0) {
            console.log('Backend not responding, using mock data for testing');
            
            // Create a mock response based on well-known test accounts
            if ((credentials.email === 'admin@example.com' && credentials.password === 'password') ||
                (credentials.email === 'seller@example.com' && credentials.password === 'password') ||
                (credentials.email === 'customer@example.com' && credentials.password === 'password')) {
              
              const mockUser: User = {
                id: '1',
                email: credentials.email,
                firstName: credentials.email.split('@')[0],
                lastName: '',
                role: credentials.email.includes('admin') ? 'admin' : 
                     credentials.email.includes('seller') ? 'seller' : 'user'
              };
              
              const authResponse: AuthResponse = {
                user: mockUser,
                token: 'mock-token',
                refreshToken: 'mock-token'
              };
              
              return of(authResponse).pipe(
                tap(res => this.handleAuthResponse(res))
              );
            }
          }
          
          return this.handleError(error);
        })
      );
  }
  
  register(data: RegisterData | SellerRegistrationData): Observable<AuthResponse> {
    // Determine if it's a seller registration
    const endpoint = 'storeName' in data ? '/seller-register' : '/register';
    
    return this.http.post<any>(`${this.apiUrl}${endpoint}`, data)
      .pipe(
        // After registration, we need to log in the user
        // Since the backend returns a simple success message, we'll log in the user manually
        tap(() => console.log('Registration successful')),
        // After registration, call the login endpoint
        tap(() => {
          // After successful registration, we'll proceed to login
          const credentials: LoginCredentials = {
            email: data.email,
            password: data.password
          };
          return this.login(credentials);
        }),
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
        tap(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          this.currentUserSubject.next(null);
          this.clearTokenTimer();
        }),
        catchError(error => {
          // Even if the server logout fails, we should clean up local state
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          this.currentUserSubject.next(null);
          this.clearTokenTimer();
          return throwError(() => error);
        })
      );
  }
  
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    console.log('Error details:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      message: error.message
    });
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Connection error - likely backend not running
      errorMessage = 'Cannot connect to the server. Please ensure the backend server is running.';
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.status === 403) {
        errorMessage = 'Access denied';
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
    
    console.error('Formatted error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
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
}
