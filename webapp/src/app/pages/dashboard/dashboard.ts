import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
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
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MultiSelectModule,
    PanelModule,
    SelectModule,
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
  protected aliases = signal<any[]>([]);
  protected profileDialogVisible = signal<boolean>(false);
  protected subscriptionDialogVisible = signal<boolean>(false);
  protected searchQuery = signal<string>('');

  protected sortOptions = [
    { value: 'description-asc', label: 'Label (A - Z)' },
    { value: 'description-desc', label: 'Label (Z - A)' },
    { value: 'created-asc', label: 'Created (Newest first)' },
    { value: 'created-desc', label: 'Created (Oldest first)' },
    { value: 'last-used-asc', label: 'Last used (Newest first)' },
    { value: 'last-used-desc', label: 'Last used (Oldest first)' },
  ];

  protected filterOptions = signal([
    {
      label: 'Alias type',
      items: [
        { label: 'Random', value: 'random', disabled: false },
        { label: 'Custom', value: 'custom', disabled: false },
      ],
    },
    {
      label: 'Blocking level',
      items: [
        { label: 'None', value: 'none', disabled: false },
        { label: 'Promotions', value: 'promo', disabled: false },
        { label: 'All', value: 'all', disabled: false },
      ],
    },
  ]);

  protected sortValue = signal<string>(this.sortOptions[0].value);
  protected filterValue = signal<string[]>(
    this.filterOptions()
      .map((option) => option.items.map((item) => item.value))
      .flat(),
  );

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
          aliases: [...res.random, ...res.domain],
        });

        this.onSortChange(this.sortValue());
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

  protected onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.applyTransforms();
  }

  protected onSortChange(sort: string) {
    this.sortValue.set(sort);
    this.applyTransforms();
  }

  protected onFilterChange(filter: string[]) {
    this.filterOptions.update((groups) =>
      groups.map((group) => {
        const selectedItems = group.items.filter((item) => filter.includes(item.value));

        return {
          ...group,
          items: group.items.map((item) => ({
            ...item,
            disabled: selectedItems.length === 1 && selectedItems[0].value === item.value,
          })),
        };
      }),
    );

    this.filterValue.set(filter);
    this.applyTransforms();
  }

  private applyTransforms() {
    const sort = this.sortValue();
    const filter = this.filterValue();
    const query = this.searchQuery().toLowerCase();

    const sortedAliases = this.data().aliases.sort((a: any, b: any) => {
      switch (sort) {
        case 'description-asc':
          return (
            a.description.toLowerCase().localeCompare(b.description.toLowerCase()) ||
            a.full_address.toLowerCase().localeCompare(b.full_address.toLowerCase())
          );

        case 'description-desc':
          return (
            b.description.toLowerCase().localeCompare(a.description.toLowerCase()) ||
            b.full_address.toLowerCase().localeCompare(a.full_address.toLowerCase())
          );

        case 'created-asc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        case 'created-desc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        case 'last-used-asc':
          return new Date(b.last_used_at ?? 0).getTime() - new Date(a.last_used_at ?? 0).getTime();

        case 'last-used-desc':
          return new Date(a.last_used_at ?? 0).getTime() - new Date(b.last_used_at ?? 0).getTime();
      }
    });

    this.aliases.set(
      sortedAliases.filter((alias: any) => {
        const typeMatch =
          alias.mask_type === 'random' ? filter.includes('random') : filter.includes('custom');

        const blockingMatch = filter.includes(
          alias.enabled ? (alias.block_list_emails ? 'promo' : 'none') : 'all',
        );

        const searchMatch =
          !query ||
          alias.description?.toLowerCase().includes(query) ||
          alias.full_address?.toLowerCase().includes(query);

        return typeMatch && blockingMatch && searchMatch;
      }),
    );
  }

  protected updateAlias(alias: any) {
    this.data.update((data) => ({
      ...data,
      aliases: data.aliases.map((a: any) => (a.id === alias.id ? { ...a, ...alias } : a)),
    }));

    this.applyTransforms();
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
