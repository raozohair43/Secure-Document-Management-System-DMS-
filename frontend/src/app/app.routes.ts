import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth-guard';
import { noAuthGuard } from './core/guards/no-auth/no-auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [noAuthGuard], // Only unauthenticated users can access
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard], // Only authenticated users can access
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/documents/document-list/document-list').then(m => m.DocumentList)
      },
      {
        path: 'documents/:id',
        loadComponent: () => import('./features/documents/document-detail/document-detail').then(m => m.DocumentDetail)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-management/user-management').then(m => m.UserManagement)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./features/admin/audit-logs/audit-logs').then(m => m.AuditLogs)
      },
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Public share route (No guard needed!)
  {
    path: 'share/:token',
    loadComponent: () => import('./features/documents/shared-document/shared-document').then(m => m.SharedDocument)
  },
  
  
  { path: '**', redirectTo: 'auth/login' }
];