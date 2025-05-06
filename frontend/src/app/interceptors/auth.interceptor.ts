import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Track token refresh state
let isRefreshing = false;
let refreshTokenPromise: Promise<string> | null = null;

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  
  // Skip adding token for authentication requests
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  
  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService);
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
  // If we're already refreshing, wait for that to complete
  if (isRefreshing) {
    return new Observable<HttpEvent<unknown>>(observer => {
      refreshTokenPromise?.then(token => {
        next(addToken(request, token)).subscribe(observer);
      }).catch(err => {
        observer.error(err);
      });
    });
  }

  isRefreshing = true;
  // Temporarily comment out refresh token logic as it's not implemented/causing issues
  /*
  refreshTokenPromise = new Promise<string>((resolve, reject) => {
    authService.refreshToken().subscribe({
      next: (response: any) => { // Added explicit type
        isRefreshing = false;
        resolve(response.token);
      },
      error: (err: any) => { // Added explicit type
        isRefreshing = false;
        refreshTokenPromise = null;
        // If refresh token fails, log out the user
        authService.logout().subscribe(); // Changed from authService.logout()
        reject(err);
      }
    });
  });

  return new Observable<HttpEvent<unknown>>(observer => {
    refreshTokenPromise?.then(token => {
      next(addToken(request, token)).subscribe(observer);
    }).catch(err => {
      observer.error(err);
    });
  });
  */

  // If refresh token logic is removed/handled differently, just logout on 401
  console.error('Unauthorized (401) or refresh token logic disabled, logging out.');
  isRefreshing = false; // Ensure flag is reset
  refreshTokenPromise = null; // Ensure promise is cleared
  authService.logout().subscribe();
  return throwError(() => new HttpErrorResponse({ error: 'Unauthorized or refresh failed', status: 401 })); // Return an error observable
}

/* Original problematic code in interceptor for reference:
if (error.status === 401) {
  return authService.refreshToken().subscribe({
    next: (response) => {
      // Handle successful refresh
    },
    error: (err) => {
      // Handle refresh error, e.g., logout
      authService.logout().subscribe();
    }
  });
}
*/