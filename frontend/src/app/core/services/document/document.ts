import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';

export interface Document {
  id: string;
  title: string;
  createdAt: string;
  owner: { name: string; email: string };
  versions: { fileType: string; versionNumber: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/documents`;

  getDocuments(): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(this.apiUrl);
  }

  uploadDocument(file: File, title: string): Observable<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    // Note: HttpClient automatically sets the correct boundary headers for FormData!
    return this.http.post<ApiResponse<Document>>(`${this.apiUrl}/upload`, formData);
  }

  searchDocuments(queryParams: any): Observable<ApiResponse<Document[]>> {
    // Dynamically build the query string (e.g., ?title=myDoc&fileType=pdf)
    const params = new URLSearchParams(queryParams).toString();
    return this.http.get<ApiResponse<Document[]>>(`${this.apiUrl}/search?${params}`);
  }

  getDocumentById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  uploadNewVersion(documentId: string, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${documentId}/versions`, formData);
  }

  downloadVersion(versionId: string): Observable<Blob> {
    // Note: responseType: 'blob' is crucial for downloading files in Angular!
    return this.http.get(`${this.apiUrl}/versions/${versionId}/download`, {
      responseType: 'blob'
    });
  }

}