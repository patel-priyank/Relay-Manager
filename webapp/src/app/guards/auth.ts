import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const requiresAuth: CanActivateFn = () => {
  const router = inject(Router);

  if (!localStorage.getItem('relay-manager-api-key')) {
    return router.createUrlTree(['/']);
  }

  return true;
};

export const requiresNoAuth: CanActivateFn = () => {
  const router = inject(Router);

  if (localStorage.getItem('relay-manager-api-key')) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
