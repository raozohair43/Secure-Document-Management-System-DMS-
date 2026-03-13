import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if we have a valid token in localStorage
  if (authService.getToken()) {
    return true; // Let them pass
  }

  // Not logged in? Redirect to the login page
  router.navigate(['/auth/login']);
  return false;
};