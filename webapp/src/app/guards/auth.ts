import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { API_KEY_STORAGE_KEY } from '../constants';

export const requiresAuth: CanActivateFn = () => {
  const router = inject(Router);

  if (!localStorage.getItem(API_KEY_STORAGE_KEY)) {
    return router.createUrlTree(['/']);
  }

  return true;
};

export const requiresNoAuth: CanActivateFn = () => {
  const router = inject(Router);

  if (localStorage.getItem(API_KEY_STORAGE_KEY)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
