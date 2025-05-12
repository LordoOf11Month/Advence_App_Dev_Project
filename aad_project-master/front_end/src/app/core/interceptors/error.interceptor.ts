// core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router,
              private authService: AuthService,
              private notify: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Log outgoing request URL for debugging
    console.log(`API Request to: ${req.url}`);

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';

        // Log detailed error information for debugging
        console.error('API Error:', {
          url: req.url,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });

        if (error.status === 401) {
          // Unauthorized – maybe token expired or not valid
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          errorMsg = 'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          // Forbidden – lacking required role
          this.router.navigate(['/access-denied']);
          errorMsg = 'You do not have permission to perform this action.';
        } else if (error.status === 0) {
          // Network error (server down or CORS issue)
          errorMsg = 'Unable to connect to the server. Please try again later.';
        } else {
          // Other errors (400, 404, 500, etc.)
          if (error.error && error.error.message) {
            // If backend provided an error message in response body
            errorMsg = error.error.message;
          } else {
            errorMsg = `Error ${error.status}: ${error.statusText}`;
          }
        }
        // Use NotificationService to display the error (e.g., a toast or alert component)
        this.notify.showError(errorMsg);
        return throwError(() => error);  // propagate error if needed for specific catches
      })
    );
  }
}
