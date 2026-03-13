import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';
import { LucideAngularModule, Menu, LogOut, User } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.html'
})
export class Navbar {
  authService = inject(AuthService);
  router = inject(Router);

  @Output() toggleMenu = new EventEmitter<void>();

  readonly MenuIcon = Menu;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = User;

  user = this.authService.currentUser;

  onToggleMenu() {
    this.toggleMenu.emit();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}