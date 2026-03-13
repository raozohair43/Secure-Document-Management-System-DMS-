import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/document/document';
import { LucideAngularModule, UploadCloud, X, File, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './upload-modal.html'
})
export class UploadModal {
  private documentService = inject(DocumentService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() uploadSuccess = new EventEmitter<void>();

  // Icons
  readonly XIcon = X;
  readonly UploadIcon = UploadCloud;
  readonly FileIcon = File;
  readonly LoaderIcon = Loader2;

  // State
  isDragging = signal(false);
  selectedFile = signal<File | null>(null);
  documentTitle = '';
  isUploading = signal(false);
  errorMessage = signal<string | null>(null);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length) {
      this.handleFile(event.target.files[0]);
    }
  }

  private handleFile(file: File) {
    this.selectedFile.set(file);
    if (!this.documentTitle) {
      // Auto-fill title with filename (without extension) if empty
      this.documentTitle = file.name.split('.').slice(0, -1).join('.');
    }
  }

  upload() {
    const file = this.selectedFile();
    if (!file || !this.documentTitle) return;

    this.isUploading.set(true);
    this.errorMessage.set(null);

    this.documentService.uploadDocument(file, this.documentTitle).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.uploadSuccess.emit();
        this.close();
      },
      error: (err) => {
        this.isUploading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to upload document.');
      }
    });
  }

  close() {
    this.closeModal.emit();
  }
}