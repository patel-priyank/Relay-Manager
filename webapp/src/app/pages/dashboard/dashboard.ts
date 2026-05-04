import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';

import { AliasCard } from '../../components/alias-card/alias-card';

@Component({
  selector: 'app-dashboard',
  imports: [
    AliasCard,
    ButtonModule,
    DatePipe,
    DialogModule,
    DividerModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PanelModule,
    SkeletonModule,
    TagModule,
    ToastModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  providers: [MessageService],
})
export class Dashboard {
  protected data = signal<any | null>(null);
  protected profileDialogVisible = signal<boolean>(false);
  protected subscriptionDialogVisible = signal<boolean>(false);
  protected searchQuery = signal<string>('');

  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private router = inject(Router);

  constructor() {
    const savedApiKey = localStorage.getItem('relay-manager-api-key');

    if (!savedApiKey) {
      this.router.navigate(['/']);

      return;
    }

    forkJoin({
      random: this.http.get<any>(`/api/random?token=${savedApiKey}`),
      domain: this.http.get<any>(`/api/domain?token=${savedApiKey}`),
      profile: this.http.get<any>(`/api/account/profile?token=${savedApiKey}`),
      user: this.http.get<any>(`/api/account/user?token=${savedApiKey}`),
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
      error: (_err: HttpErrorResponse) => {
        this.disconnect();
      },
    });
  }

  protected disconnect() {
    localStorage.removeItem('relay-manager-api-key');

    this.router.navigate(['/']);
  }

  protected updateAlias(alias: any) {
    this.data.update((data) => ({
      ...data,
      aliases: data.aliases.map((a: any) => (a.id === alias.id ? { ...a, ...alias } : a)),
    }));
  }

  protected showMessage(message: { success: boolean; title: string; message: string }) {
    this.messageService.clear();

    this.messageService.add({
      severity: message.success ? 'success' : 'error',
      summary: message.title,
      detail: message.message,
    });
  }
}
