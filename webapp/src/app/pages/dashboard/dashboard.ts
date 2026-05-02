import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard',
  imports: [
    ButtonModule,
    Card,
    DatePipe,
    DialogModule,
    Divider,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    Panel,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected data = signal<any | null>(null);
  protected profileDialogVisible = signal<boolean>(false);
  protected subscriptionDialogVisible = signal<boolean>(false);
  protected searchQuery = signal<string>('');

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
          aliases: [...res.random, ...res.domain].sort((a, b) =>
            a.description.toLowerCase().localeCompare(b.description.toLowerCase()),
          ),
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
