import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { User, AuthResponse } from '../../models/auth';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(this.apiUrl);
  }

  // Admin: Update a user's role
  updateUserRole(userId: string, role: 'Admin' | 'Employee'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/`, { roleName: role });
  }

  // Admin: Delete/Deactivate a user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

}