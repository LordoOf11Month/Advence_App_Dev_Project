import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface User {
  id: number;
  name?: string;
  email: string;
  roles: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;                   // http://localhost:8080/api
  private isBrowser: boolean;

  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$       = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    public  tokenStorage: TokenStorageService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    /* bootstrap stored login */
    if (this.isBrowser) {
      const stored = this.tokenStorage.getUser();
      if (stored) this.currentUserSubject.next(stored);
    }
  }

  /* ───────────────────────────── login / logout ─────────────────────────── */

  login(email: string, password: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/login`, { email, password })
        .subscribe({
          next: res => {
            if (!res.success) { observer.error(res.message); return; }

            const { token, user } = res.data;
            if (token) this.tokenStorage.saveToken(token);

            const u: User = user ?? this.decodeToken(token);
            this.tokenStorage.saveUser(u);
            this.currentUserSubject.next(u);

            observer.next(true); observer.complete();
          },
          error: err => observer.error(err)
        });
    });
  }

  register(body: {name: string; email: string; password: string}) {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/register`, body)
                    .pipe(map(r => r.data));
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null);
  }

  /* ───────────────────────────── helpers ─────────────────────────── */

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !Array.isArray(user.roles)) return false;           // guard
    return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
  }

  /** naïve JWT decode (no external lib) */
  private decodeToken(token: string): User {
    try {
      const base64 = token.split('.')[1]
                          .replace(/-/g, '+')
                          .replace(/_/g, '/');
      const json   = (this.isBrowser
                      ? atob(base64)
                      : Buffer.from(base64, 'base64').toString('utf8'));
      const payload = JSON.parse(json);
      return {
        id   : payload.id,
        email: payload.sub ?? payload.email,
        name : payload.name,
        roles: payload.roles ?? []
      };
    } catch (e) {
      console.error('JWT decode failed', e);
      return { id: 0, email: '', roles: [] };
    }
  }
}
