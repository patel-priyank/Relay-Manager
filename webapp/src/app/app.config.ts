import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { providePrimeNG } from 'primeng/config';

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { apiInterceptor } from './interceptors/api.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([apiInterceptor])),
    providePrimeNG({
      theme: {
        preset: definePreset(Aura, {
          semantic: {
            primary: {
              50: '{purple.50}',
              100: '{purple.100}',
              200: '{purple.200}',
              300: '{purple.300}',
              400: '{purple.400}',
              500: '{purple.500}',
              600: '{purple.600}',
              700: '{purple.700}',
              800: '{purple.800}',
              900: '{purple.900}',
              950: '{purple.950}',
            },
          },
        }),
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    provideRouter(routes),
  ],
};
