import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
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
          role: 'admin'
        },
        token: 'mock-jwt-token'
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
          role: 'user'
        },
        token: 'mock-jwt-token'
      };
      
      return of(response).pipe(
        delay(1000),
        tap(res => this.handleAuthResponse(res))
      );
    }
    
    return throwError(() => new Error('Invalid credentials'));
  }
  
  register(data: RegisterData): Observable<AuthResponse> {
    // Mock registration - replace with actual API call
    const response: AuthResponse = {
      user: {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'user'
      },
      token: 'mock-jwt-token'
    };
    
    return of(response).pipe(
      delay(1000),
      tap(res => this.handleAuthResponse(res))
    );
  }
  
  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    this.currentUserSubject.next(response.user);
  }
  
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }
  
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}