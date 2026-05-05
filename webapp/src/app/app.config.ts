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
              50: '{indigo.50}',
              100: '{indigo.100}',
              200: '{indigo.200}',
              300: '{indigo.300}',
              400: '{indigo.400}',
              500: '{indigo.500}',
              600: '{indigo.600}',
              700: '{indigo.700}',
              800: '{indigo.800}',
              900: '{indigo.900}',
              950: '{indigo.950}',
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
