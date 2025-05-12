import { environment } from './../../../../environments/environment';
import { NotificationService } from './../../../core/services/notification.service';
// category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'  // or provided in CatalogueModule
})
export class CategoryService {
  private apiUrl = environment.apiUrl;  // Base URL of the backend API

  constructor(
    private http: HttpClient,
    private notification: NotificationService
  ) { }

  /** Fetch all product categories from the backend */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        // Notify user of error and rethrow for further handling if needed
        this.notification.showError('Failed to load categories');
        return throwError(() => error);
      })
    );
  }
}
