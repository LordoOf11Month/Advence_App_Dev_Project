import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Track token refresh state
let isRefreshing = false;
let refreshTokenPromise: Promise<string> | null = null;

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  
  console.log(`[Auth Interceptor] Processing request: ${req.url}`);
  
  // Skip adding token for authentication requests
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
    console.log(`[Auth Interceptor] Bypassing token for auth request: ${req.url}`);
    return next(req).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          console.error(`[Auth Interceptor] Auth request error: ${req.url}`, {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
        }
        return throwError(() => error);
      })
    );
  }

  const token = localStorage.getItem('token');
  
  if (token) {
    console.log(`[Auth Interceptor] Adding token to request: ${req.url}`);
    req = addToken(req, token);
  } else {
    console.log(`[Auth Interceptor] No token available for request: ${req.url}`);
    // If this is a protected resource and user is not logged in, we should redirect them
    if (req.url.includes('/api/cart') || req.url.includes('/api/orders') || 
        req.url.includes('/api/user/profile')) {
      console.warn('[Auth Interceptor] Attempting to access protected resource without token');
    }
  }

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse) {
        console.error(`[Auth Interceptor] Request error for ${req.url}:`, {
          status: error.status,
          statusText: error.statusText,
          message: error.message
        });
        
        if (error.status === 401) {
          console.log('[Auth Interceptor] Unauthorized access. Token may be invalid or expired.');
          return handle401Error(req, next, authService);
        }
      }
      return throwError(() => error);
    })
  );
}

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenPromise = null;
    
    console.log('[Auth Interceptor] Authentication failed. Logging out user.');
    // Simply return the error and let the app handle login redirect
    authService.logout();
    return throwError(() => new Error('Authentication required'));
  } 
  
  // Wait for token refresh to complete
  return next(request);
}