import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user/user';
import { AuthService } from '../../../core/services/auth/auth';
import { User } from '../../../core/models/auth';
import { LucideAngularModule, Users, Shield, Trash2, Mail, ShieldAlert } from 'lucide-angular';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './user-management.html'
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // Icons
  readonly UsersIcon = Users;
  readonly ShieldIcon = Shield;
  readonly TrashIcon = Trash2;
  readonly MailIcon = Mail;
  readonly AdminIcon = ShieldAlert;

  // State
  users = signal<User[]>([]);
  isLoading = signal(true);
  currentUser = this.authService.currentUser;

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (res) => {

        const mappedUsers = res.data.map((u: any) => ({
          ...u,
          role: u.role?.roleName || 'Employee'
        }));

        this.users.set(mappedUsers);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch users', err);
        this.isLoading.set(false);
      }
    });
  }

  changeRole(userId: string, newRole: 'Admin' | 'Employee') {
    // Prevent removing your own admin rights accidentally
    if (userId === this.currentUser()?.id && newRole === 'Employee') {
      alert("You cannot demote yourself from Admin status.");
      // Refresh to reset the dropdown visually
      this.fetchUsers();
      return;
    }

    this.userService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        // Optimistically update the local state to avoid a full re-fetch
        this.users.update(users => 
          users.map(u => u.id === userId ? { ...u, role: newRole } : u)
        );
      },
      error: () => this.fetchUsers() // Revert on failure
    });
  }

  deleteUser(user: User) {
    if (user.id === this.currentUser()?.id) {
      alert("You cannot delete your own account from here.");
      return;
    }

    if (confirm(`Are you absolutely sure you want to delete ${user.name}? This cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.id !== user.id));
        },
        error: (err) => console.error('Failed to delete user', err)
      });
    }
  }
}