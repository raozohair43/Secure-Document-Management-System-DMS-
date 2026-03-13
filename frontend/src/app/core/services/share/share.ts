import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createShareLink(documentId: string, data: { expiresAt: string; accessLimit?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/documents/${documentId}/share`, data);
  }

  revokeShareLink(linkId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/share/${linkId}`);
  }

  getSharedDocument(token: string): Observable<any> {
    // This hits the public router.get('/share/:token') endpoint we built in Node
    return this.http.get(`${this.apiUrl}/share/${token}`);
  }
}