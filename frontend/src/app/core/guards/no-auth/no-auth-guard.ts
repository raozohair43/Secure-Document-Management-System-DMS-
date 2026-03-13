import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If they are already logged in, bounce them straight to the dashboard
  if (authService.getToken()) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Not logged in? Let them view the login/register pages
  return true;
};