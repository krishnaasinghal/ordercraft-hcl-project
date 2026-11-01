import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private getStoredUser(): AuthResponse | null {
    const userData = localStorage.getItem('ordercraft_user');
    return userData ? JSON.parse(userData) : null;
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('ordercraft_token');
  }

  get isAuthenticated(): boolean {
    const token = this.token;
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return !!token;
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        localStorage.setItem('ordercraft_token', response.token);
        localStorage.setItem('ordercraft_user', JSON.stringify(response));
        this.currentUserSubject.next(response);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      tap(response => {
        localStorage.setItem('ordercraft_token', response.token);
        localStorage.setItem('ordercraft_user', JSON.stringify(response));
        this.currentUserSubject.next(response);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('ordercraft_token');
    localStorage.removeItem('ordercraft_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
