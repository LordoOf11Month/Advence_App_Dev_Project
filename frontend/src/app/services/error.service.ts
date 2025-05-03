import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorState = new BehaviorSubject<ErrorState>({
    message: '',
    type: 'error',
    visible: false
  });

  error$ = this.errorState.asObservable();

  showError(message: string, type: 'error' | 'warning' | 'info' = 'error') {
    this.errorState.next({
      message,
      type,
      visible: true
    });
  }

  showSuccess(message: string): void {
    this.errorState.next({
      message,
      type: 'info',
      visible: true
    });
  }

  clearError() {
    this.errorState.next({
      message: '',
      type: 'error',
      visible: false
    });
  }

  handleHttpError(error: any): void {
    let message: string;
    let type: 'error' | 'warning' | 'info' = 'error';

    if (error.status === 0) {
      message = 'Network error. Please check your connection.';
    } else if (error.status === 401) {
      message = 'Your session has expired. Please log in again.';
      type = 'warning';
    } else if (error.status === 403) {
      message = 'You do not have permission to perform this action.';
      type = 'warning';
    } else if (error.status === 404) {
      message = 'The requested resource was not found.';
      type = 'info';
    } else if (error.status === 422) {
      message = 'Invalid data provided. Please check your input.';
      type = 'warning';
    } else if (error.status >= 500) {
      message = 'A server error occurred. Please try again later.';
    } else {
      message = error.message || 'An unexpected error occurred.';
    }

    this.showError(message, type);
  }

  handleValidationError(errors: Record<string, string[]>): void {
    const messages = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
      .join('\n');
    
    this.showError(messages, 'warning');
  }

  handleSuccess(message: string): void {
    this.showError(message, 'info');
  }
}