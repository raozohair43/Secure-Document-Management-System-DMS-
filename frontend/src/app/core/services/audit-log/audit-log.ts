import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: string;
  action: string; // e.g., 'DOCUMENT_CREATED', 'DOCUMENT_DOWNLOADED', 'LINK_GENERATED'
  userId?: string;
  user?: { name: string; email: string };
  documentId?: string;
  document?: { title: string };
  ipAddress?: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/logs`; // Assuming this is your backend route

  getLogs(): Observable<{ success: boolean; data: AuditLog[] }> {
    return this.http.get<{ success: boolean; data: AuditLog[] }>(this.apiUrl);
  }
}