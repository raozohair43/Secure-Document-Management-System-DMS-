import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DocumentService } from '../../../core/services/document/document';
import { LucideAngularModule, ArrowLeft, Download, Upload, Clock, Shield, Link, FileText, File } from 'lucide-angular';
import { UserService } from '../../../core/services/user/user';
import { PermissionService } from '../../../core/services/permission/permission';
import { User } from '../../../core/models/auth'
import { UserPlus, Trash2 } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ShareService } from '../../../core/services/share/share';
import { Copy, Check, ExternalLink } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth/auth';
import { Eye } from 'lucide-angular';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './document-detail.html'
})
export class DocumentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private documentService = inject(DocumentService);
  private userService = inject(UserService);
  private permissionService = inject(PermissionService);
  private shareService = inject(ShareService);
  private authService = inject(AuthService);

  // signal
  currentUser = this.authService.currentUser;

  // Icons
  readonly BackIcon = ArrowLeft;
  readonly DownloadIcon = Download;
  readonly UploadIcon = Upload;
  readonly ClockIcon = Clock;
  readonly ShieldIcon = Shield;
  readonly LinkIcon = Link;
  readonly FileIcon = FileText;
  readonly GenericFileIcon = File;
  readonly UserPlusIcon = UserPlus;
  readonly TrashIcon = Trash2;
  readonly CopyIcon = Copy;
  readonly CheckIcon = Check;
  readonly ExternalLinkIcon = ExternalLink;
  readonly EyeIcon = Eye;

  // States
  documentId = '';
  document = signal<any>(null);
  isLoading = signal(true);
  activeTab = signal<'history' | 'permissions' | 'shares'>('history');
  isUploading = signal(false);
  availableUsers = signal<User[]>([]);
  selectedUserId = '';
  selectedPermissionType = 'view';
  isGranting = signal(false);
  isGeneratingLink = signal(false);
  generatedUrl = signal<string | null>(null);
  hasCopied = signal(false);

  shareExpiry = '';
  shareLimit: number | null = null;
  currentDate = new Date().toISOString();

  ngOnInit() {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.documentId) {
      this.fetchDocumentDetails();
      this.fetchUsers();
    }
  }

  // getters
  get userAccessLevel() {
    const doc = this.document();
    const user = this.currentUser();
    if (!doc || !user) return 'none';
    if (doc.ownerId === user.id || user.role === 'Admin') return 'owner';
    const perm = doc.permissions?.find((p: any) => p.userId === user.id);
    return perm ? perm.permissionType : 'none'; // returns 'view', 'download', or 'edit'
  }

  get canDownload() {
    return ['owner', 'edit', 'download'].includes(this.userAccessLevel);
  }

  get canEdit() {
    return ['owner', 'edit'].includes(this.userAccessLevel);
  }

  fetchUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => this.availableUsers.set(res.data),
      error: (err) => console.error('Failed to fetch users', err)
    });
  }

  fetchDocumentDetails() {
    this.isLoading.set(true);
    this.documentService.getDocumentById(this.documentId).subscribe({
      next: (res) => {
        this.document.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  grantAccess() {
    if (!this.selectedUserId) return;

    this.isGranting.set(true);
    const payload = {
      documentId: this.documentId,
      userId: this.selectedUserId,
      permissionType: this.selectedPermissionType
    };

    this.permissionService.grantAccess(payload).subscribe({
      next: () => {
        this.isGranting.set(false);
        this.selectedUserId = ''; // Reset dropdown
        this.fetchDocumentDetails(); // Refresh document to show new permissions
      },
      error: () => this.isGranting.set(false)
    });
  }

  revokeAccess(permissionId: string) {
    if (!confirm('Are you sure you want to revoke access for this user?')) return;

    this.permissionService.revokeAccess(permissionId).subscribe({
      next: () => this.fetchDocumentDetails(), // Refresh list
      error: (err) => console.error('Failed to revoke access', err)
    });
  }

  setTab(tab: 'history' | 'permissions' | 'shares') {
    this.activeTab.set(tab);
  }

  downloadFile(version: any) {
    this.documentService.downloadVersion(version.id).subscribe((blob) => {
      // Create a secure Object URL and trigger the browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Extract original filename or set a default
      a.download = `${this.document().title}_v${version.versionNumber}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  }

  onNewVersionSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    this.documentService.uploadNewVersion(this.documentId, file).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.fetchDocumentDetails(); // Refresh to show new version
      },
      error: () => this.isUploading.set(false)
    });
  }

  generateShareLink() {
    if (!this.shareExpiry) return;

    this.isGeneratingLink.set(true);
    const payload = {
      expiresAt: new Date(this.shareExpiry).toISOString(),
      ...(this.shareLimit ? { accessLimit: this.shareLimit } : {})
    };

    this.shareService.createShareLink(this.documentId, payload).subscribe({
      next: (res) => {
        const token = res.data.token || res.data.url.split('/').pop();

        const frontendUrl = `${window.location.origin}/share/${token}`;

        this.generatedUrl.set(frontendUrl); // The backend returns the full URL
        this.isGeneratingLink.set(false);
        this.fetchDocumentDetails(); // Refresh to update the list of active links
      },
      error: () => this.isGeneratingLink.set(false)
    });
  }

  copyToClipboard() {
    const url = this.generatedUrl();
    if (!url) return;

    navigator.clipboard.writeText(url).then(() => {
      this.hasCopied.set(true);
      setTimeout(() => this.hasCopied.set(false), 2000); // Reset after 2 seconds
    });
  }

  revokeShareLink(linkId: string) {
    if(!confirm('Revoke this public link immediately?')) return;
    
    this.shareService.revokeShareLink(linkId).subscribe({
      next: () => this.fetchDocumentDetails()
    });
  }

  viewVersion(versionId: string) {
  const token = localStorage.getItem('token'); // Adjust if you store your JWT elsewhere
  
  fetch(`${environment.apiUrl}/documents/versions/${versionId}/view`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.blob())
  .then(blob => {
    // Creates a safe local URL for the browser's PDF viewer
    const fileUrl = window.URL.createObjectURL(blob);
    window.open(fileUrl, '_blank');
  })
  .catch(err => console.error('Error viewing file:', err));
}

}