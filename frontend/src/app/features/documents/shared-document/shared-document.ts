import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShareService } from '../../../core/services/share/share';
import { LucideAngularModule, FileText, Download, AlertCircle, ShieldCheck } from 'lucide-angular';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-shared-document',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './shared-document.html'
})
export class SharedDocument implements OnInit {
  private route = inject(ActivatedRoute);
  private shareService = inject(ShareService);

  // Icons
  readonly FileIcon = FileText;
  readonly DownloadIcon = Download;
  readonly AlertIcon = AlertCircle;
  readonly ShieldIcon = ShieldCheck;

  // State
  token = '';
  document = signal<any>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (this.token) {
      this.fetchSharedDocument();
    } else {
      this.errorMessage.set('Invalid share link.');
      this.isLoading.set(false);
    }
  }

  fetchSharedDocument() {
    this.shareService.getSharedDocument(this.token).subscribe({
      next: (res) => {
        this.document.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        // Handle 404 (Not Found), 410 (Expired), 403 (Limit Reached)
        this.errorMessage.set(err.error?.message || 'This shared link is invalid or has expired.');
        this.isLoading.set(false);
      }
    });
  }

  downloadFile() {
    window.location.href = `${environment.apiUrl}/share/${this.token}/download`;
  }
}