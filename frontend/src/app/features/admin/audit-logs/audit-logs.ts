import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log/audit-log';
import { 
  LucideAngularModule, Activity, FileText, Download, 
  UserPlus, Eye, Link, Trash, Monitor 
} from 'lucide-angular';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './audit-logs.html'
})
export class AuditLogs implements OnInit {
  private auditLogService = inject(AuditLogService);

  // Icons
  readonly ActivityIcon = Activity;
  readonly MonitorIcon = Monitor;

  // State
  logs = signal<AuditLog[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchLogs();
  }

  fetchLogs() {
    this.isLoading.set(true);
    this.auditLogService.getLogs().subscribe({
      next: (res) => {
        this.logs.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch audit logs', err);
        this.isLoading.set(false);
      }
    });
  }

  // Helper to format action names (e.g., "DOCUMENT_CREATED" -> "Document Created")
  formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  // Helper to get badge colors based on action type
  getActionColor(action: string): string {
    if (action.includes('CREATE') || action.includes('UPLOAD')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('DELETE') || action.includes('REVOKE')) return 'bg-red-100 text-red-800 border-red-200';
    if (action.includes('SHARE') || action.includes('LINK')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (action.includes('DOWNLOAD')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-gray-100 text-gray-800 border-gray-200'; // Default (Views, Reads)
  }
}