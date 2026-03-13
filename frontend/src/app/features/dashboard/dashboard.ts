import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth';
import { DocumentService, Document } from '../../core/services/document/document';
import { LucideAngularModule, FileText, Clock, ArrowRight, ShieldCheck } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  authService = inject(AuthService);
  documentService = inject(DocumentService);

  // Icons
  readonly FileIcon = FileText;
  readonly ClockIcon = Clock;
  readonly ArrowIcon = ArrowRight;
  readonly ShieldIcon = ShieldCheck;

  // State
  user = this.authService.currentUser;
  recentDocs = signal<Document[]>([]);
  totalDocs = signal<number>(0);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.documentService.getDocuments().subscribe({
      next: (res) => {
        const docs = res.data;
        this.totalDocs.set(docs.length);
        
        // Sort by newest first and grab the top 5
        const sorted = docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.recentDocs.set(sorted.slice(0, 5));
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch dashboard data', err);
        this.isLoading.set(false);
      }
    });
  }

  getFileType(doc: Document): string {
    return doc.versions?.[0]?.fileType || 'Unknown';
  }
}