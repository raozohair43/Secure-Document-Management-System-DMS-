import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { User, AuthResponse } from '../../models/auth';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signal for reactive, glitch-free state management across the app
  currentUser = signal<User | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setSession(response.data))
    );
  }

  register(userData: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.setSession(response.data))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(data: { token: string; user: User }) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.currentUser.set(data.user);
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser.set(JSON.parse(userStr));
    }
  }
}