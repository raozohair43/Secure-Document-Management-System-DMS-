// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../environments/environments';
// import { Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class PermissionService {
//   private http = inject(HttpClient);
//   private apiUrl = `${environment.apiUrl}/permissions`;

//   grantAccess(payload: { documentId: string; userId: string; permissionType: string }): Observable<any> {
//     return this.http.post(this.apiUrl, payload);
//   }

//   revokeAccess(permissionId: string): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/${permissionId}`);
//   }
// }

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);

  grantAccess(payload: { documentId: string; userId: string; permissionType: string }): Observable<any> {
    // 👈 Correctly formats the URL to /documents/:id/permissions
    return this.http.post(`${environment.apiUrl}/documents/${payload.documentId}/permissions`, {
      userId: payload.userId,
      permissionType: payload.permissionType
    });
  }

  revokeAccess(permissionId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/permissions/${permissionId}`);
  }
}