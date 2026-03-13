import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';
import { LucideAngularModule, LayoutDashboard, Files, Users, Activity, X } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.html'
})
export class Sidebar {
  authService = inject(AuthService);
  
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();

  readonly DashboardIcon = LayoutDashboard;
  readonly FilesIcon = Files;
  readonly UsersIcon = Users;
  readonly ActivityIcon = Activity;
  readonly XIcon = X;

  isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'Admin';
  }

  closeSidebar() {
    this.toggle.emit();
  }
}