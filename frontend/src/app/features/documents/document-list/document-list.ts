import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DocumentService, Document } from '../../../core/services/document/document';
import { UploadModal } from '../../../shared/components/upload-modal/upload-modal';
import { LucideAngularModule, Search, Plus, FileText, MoreVertical, Download, Eye } from 'lucide-angular';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UploadModal, LucideAngularModule],
  templateUrl: './document-list.html'
})
export class DocumentList implements OnInit, OnDestroy {
  private documentService = inject(DocumentService);

  // Icons
  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly FileIcon = FileText;
  readonly MoreIcon = MoreVertical;
  readonly DownloadIcon = Download;
  readonly EyeIcon = Eye;

  // State
  documents = signal<Document[]>([]);
  isLoading = signal(true);
  isUploadModalOpen = signal(false);
  
  // Search State
  searchTerm = '';
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.fetchDocuments();

    // Setup debounced real-time search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  fetchDocuments() {
    this.isLoading.set(true);
    this.documentService.getDocuments().subscribe({
      next: (res) => {
        this.documents.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  performSearch(query: string) {
    this.isLoading.set(true);
    if (!query.trim()) {
      this.fetchDocuments();
      return;
    }

    this.documentService.searchDocuments({ title: query }).subscribe({
      next: (res) => {
        this.documents.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openUploadModal() {
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal() {
    this.isUploadModalOpen.set(false);
  }

  onUploadSuccess() {
    // Refresh the list automatically after a successful upload
    this.fetchDocuments();
  }

  getFileType(doc: Document): string {
    return doc.versions?.[0]?.fileType || 'Unknown';
  }
}