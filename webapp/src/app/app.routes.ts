import { Routes } from '@angular/router';

import { requiresAuth, requiresNoAuth } from './guards/auth';

export const routes: Routes = [
  {
    path: '',
    canActivate: [requiresNoAuth],
    loadComponent: () => import('./pages/setup/setup').then((m) => m.Setup),
  },
  {
    path: 'dashboard',
    canActivate: [requiresAuth],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
