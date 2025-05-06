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
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
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
  refreshTokenPromise = new Promise<string>((resolve, reject) => {
    authService.refreshToken().subscribe({
      next: (response) => {
        isRefreshing = false;
        resolve(response.token);
      },
      error: (err) => {
        isRefreshing = false;
        refreshTokenPromise = null;
        // If refresh token fails, log out the user
        authService.logout();
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
}