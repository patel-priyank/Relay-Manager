import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, PanelModule, SkeletonModule, TagModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected data = signal<any | null>(null);

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    const savedAPIKey = localStorage.getItem('relay-manager-api-key');

    if (!savedAPIKey) {
      this.router.navigate(['/setup']);

      return;
    }

    forkJoin({
      random: this.http.get<any>(`/api/random?token=${savedAPIKey}`),
      domain: this.http.get<any>(`/api/domain?token=${savedAPIKey}`),
      profile: this.http.get<any>(`/api/account/profile?token=${savedAPIKey}`),
      user: this.http.get<any>(`/api/account/user?token=${savedAPIKey}`),
    }).subscribe({
      next: (res) => {
        this.data.set({
          email: res.user[0].email,
          profile: res.profile[0],
          aliases: [...res.random, ...res.domain],
        });
      },
      error: (err: HttpErrorResponse) => {
        console.log('Error fetching data:', err);
      },
    });
  }

  protected disconnect() {
    localStorage.removeItem('relay-manager-api-key');

    this.router.navigate(['/setup']);
  }
}
