import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Navbar],
  templateUrl: './dashboard-layout.html'
})
export class DashboardLayout {
  // Signal to manage mobile sidebar state natively and reactively
  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(val => !val);
  }
}