import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpClient and HttpHeaders
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay, catchError } from 'rxjs/operators'; // Import catchError
import { jwtDecode } from 'jwt-decode';
import { User, LoginCredentials, RegisterData, AuthResponse, SellerRegistrationData, RefreshTokenResponse, Permission, PermissionName } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;
  private apiUrl = '/api/auth'; // Define backend API URL

  constructor(private http: HttpClient) { // Inject HttpClient
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          console.log('Token expired, attempting refresh...');
          // Optionally attempt refresh here or just logout
          this.logout().subscribe(); // Logout if token is expired
          return;
        }

        // Assuming the backend includes user details in the token or provides another endpoint
        // For simplicity, we'll decode the user from the token if available
        // A better approach might be to fetch user details from a /me endpoint
        if (decodedToken && decodedToken.sub) { // Use 'sub' for user identifier (e.g., email or ID)
          // Fetch user details based on token or use details embedded in token
          // This part needs adjustment based on how your backend structures the JWT
          const user: User = {
            id: decodedToken.userId || '', // Adjust based on your JWT payload
            email: decodedToken.sub,
            firstName: decodedToken.firstName || '',
            lastName: decodedToken.lastName || '',
            role: decodedToken.role || 'user',
            permissions: decodedToken.permissions || [],
            // Add seller-specific fields if applicable and present in token
            ...(decodedToken.role === 'seller' && {
              storeName: decodedToken.storeName || '',
              storeDescription: decodedToken.storeDescription || ''
            })
          };
          this.currentUserSubject.next(user);
          this.scheduleTokenRefresh(decodedToken.exp);
        } else {
          this.logout().subscribe(); // Logout if token is invalid or doesn't contain user info
        }
      } catch (error) {
        console.error('Invalid token:', error);
        this.logout().subscribe();
      }
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(res => this.handleAuthResponse(res)),
      catchError(this.handleError)
    );
  }

  register(data: RegisterData | SellerRegistrationData): Observable<AuthResponse> {
    const endpoint = 'storeName' in data ? `${this.apiUrl}/register/seller` : `${this.apiUrl}/register/customer`;
    return this.http.post<AuthResponse>(endpoint, data, { withCredentials: true }).pipe(
      tap(res => this.handleAuthResponse(res)),
      catchError(this.handleError)
    );
  }

  // Remove refreshToken method if backend handles it via cookies/httpOnly
  // refreshToken(): Observable<RefreshTokenResponse> { ... }

  logout(): Observable<any> {
    // Clear client-side storage and state
    const clearClientState = () => {
      localStorage.removeItem('token');
      // localStorage.removeItem('refreshToken'); // Remove if not using separate refresh tokens
      this.currentUserSubject.next(null);
      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
      }
    };

    // Call backend logout endpoint
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true, responseType: 'text' }).pipe(
      tap(() => {
        console.log('Logout successful on backend');
        clearClientState();
      }),
      catchError(error => {
        console.error('Backend logout failed, clearing client state anyway:', error);
        clearClientState();
        // Decide if you want to re-throw the error or return a success indicator
        return of(null); // Indicate logout completion despite backend error
      })
    );
  }

  // Remove generateMockToken method
  // private generateMockToken(role: string): string { ... }

  private handleAuthResponse(response: AuthResponse): void {
    // Assuming the backend sends the JWT in the response body or sets an HttpOnly cookie
    // If the token is in the response body:
    if (response.token) {
       localStorage.setItem('token', response.token);
       // If using refresh tokens managed by frontend:
       // if (response.refreshToken) {
       //   localStorage.setItem('refreshToken', response.refreshToken);
       // }

       try {
         const decodedToken: any = jwtDecode(response.token);
         // Extract user details from token (adjust based on your JWT structure)
         const user: User = {
           id: decodedToken.userId || '',
           email: decodedToken.sub,
           firstName: decodedToken.firstName || '',
           lastName: decodedToken.lastName || '',
           role: decodedToken.role || 'user',
           permissions: decodedToken.permissions || [],
           ...(decodedToken.role === 'seller' && {
             storeName: decodedToken.storeName || '',
             storeDescription: decodedToken.storeDescription || ''
           })
         };
         this.currentUserSubject.next(user);
         this.scheduleTokenRefresh(decodedToken.exp);
       } catch (error) {
         console.error('Error decoding token after auth:', error);
         // Handle error, maybe logout user
       }
    } else {
      // If backend uses HttpOnly cookies, the token won't be in the response body.
      // We might need to make a separate call to a /me endpoint to get user details.
      // Or decode the cookie if it's accessible (less secure and not recommended for HttpOnly).
      // For now, let's assume the user object is sent in the response.
      if (response.user) {
        this.currentUserSubject.next(response.user);
        // Need a way to get token expiration if not in response/cookie
        // Maybe fetch it from a /me endpoint or decode a non-HttpOnly cookie
        // this.scheduleTokenRefresh(expirationTime); 
      } else {
        console.error('Auth response missing token and user details.');
        // Handle error
      }
    }
  }

  private scheduleTokenRefresh(expiration: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    const expiresAt = expiration * 1000; // Convert to milliseconds
    const timeout = expiresAt - Date.now() - (60 * 1000); // Refresh 1 minute before expiry

    if (timeout > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        console.log('Attempting token refresh...');
        // Replace with actual refresh logic if frontend manages refresh tokens
        // this.refreshToken().subscribe({
        //   next: () => console.log('Token refreshed successfully'),
        //   error: err => {
        //     console.error('Token refresh failed:', err);
        //     this.logout().subscribe(); // Logout if refresh fails
        //   }
        // });
        // If backend handles refresh via HttpOnly cookies, this client-side refresh might not be needed,
        // or it might involve calling a specific refresh endpoint.
        // For now, we'll just log out if the token expires and rely on backend session management.
        console.warn('Token nearing expiration. Implement refresh logic or rely on backend session.');
        // Consider logging out proactively if no refresh mechanism is in place
        // this.logout().subscribe();
      }, timeout);
    } else {
      console.log('Token already expired or expiration time invalid.');
      this.logout().subscribe(); // Logout if token is already expired
    }
  }

  hasPermission(requiredPermission: PermissionName | PermissionName[]): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser || !currentUser.permissions) {
      return false;
    }

    const userPermissions = new Set(currentUser.permissions.map(p => p.name));

    if (Array.isArray(requiredPermission)) {
      return requiredPermission.every(permission => userPermissions.has(permission));
    } else {
      return userPermissions.has(requiredPermission);
    }
  }

  // Helper to get current user value synchronously
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Check if current user is an admin
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'admin'; // Adjust 'admin' role name if different
  }

  // Check if current user is a seller
  isSeller(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'seller'; // Adjust 'seller' role name if different
  }

  // Error handling utility
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    // Customize error handling based on status code or error structure
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      // The response body may contain clues as to what went wrong
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += `\nDetails: ${error.error}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
