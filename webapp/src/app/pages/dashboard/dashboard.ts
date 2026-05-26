import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { forkJoin, of, switchMap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';

import { AliasCard } from '../../components/alias-card/alias-card';

import { Haptics } from '../../services/haptics';
import { Message } from '../../services/message';

import { API_KEY_STORAGE_KEY } from '../../constants';

@Component({
  selector: 'app-dashboard',
  imports: [
    AliasCard,
    ButtonModule,
    DatePipe,
    DialogModule,
    FloatLabelModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    PaginatorModule,
    PanelModule,
    SelectModule,
    SkeletonModule,
    TabsModule,
    TagModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements AfterViewInit, OnDestroy {
  @ViewChild('createAliasFormRef') private createAliasFormRef!: NgForm;

  protected data = signal<any | null>(null);
  protected aliases = signal<any[]>([]);

  protected isProfileDialogVisible = signal<boolean>(false);
  protected isSubscriptionDialogVisible = signal<boolean>(false);

  protected paginatorFirst = signal<number>(0);
  protected paginatorRows = signal<number>(20);
  protected paginatorTotalRecords = computed(() => this.aliases().length);

  protected skeletonAliasCards = computed(() =>
    Array.from({ length: this.paginatorRows() }, (_, i) => i),
  );

  protected sortOptions = [
    { value: 'description-asc', label: 'Label (A - Z)' },
    { value: 'description-desc', label: 'Label (Z - A)' },
    { value: 'created-desc', label: 'Created (Newest first)' },
    { value: 'created-asc', label: 'Created (Oldest first)' },
    { value: 'last-used-desc', label: 'Last used (Newest first)' },
    { value: 'last-used-asc', label: 'Last used (Oldest first)' },
  ];

  protected filterOptions = signal([
    {
      label: 'Alias type',
      shortLabel: 'Type',
      items: [
        { label: 'Random', value: 'random', disabled: false },
        { label: 'Custom', value: 'custom', disabled: false },
      ],
    },
    {
      label: 'Blocking level',
      shortLabel: 'Level',
      items: [
        { label: 'None', value: 'none', disabled: false },
        { label: 'Promotions', value: 'promo', disabled: false },
        { label: 'All', value: 'all', disabled: false },
      ],
    },
  ]);

  protected searchQuery = signal<string>('');
  protected sortValue = signal<string>(this.sortOptions[0].value);
  protected filterValue = signal<string[]>(
    this.filterOptions()
      .map((option) => option.items.map((item) => item.value))
      .flat(),
  );

  protected filterLabel = computed(() => {
    const selected = this.filterValue().length;

    const total = this.filterOptions()
      .map((option) => option.items.map((item) => item.value))
      .flat().length;

    return `${selected} of ${total} selected`;
  });

  protected isDeleteAliasDialogVisible = signal<boolean>(false);
  protected isDeletingAlias = signal<boolean>(false);
  protected aliasToDelete = signal<any | null>(null);

  protected isCreateAliasDialogVisible = signal<boolean>(false);
  protected createAliasTabValue = signal<'random' | 'domain'>('random');
  protected isCreatingAlias = signal<boolean>(false);

  protected createAliasForm: any = {
    randomAliasLabel: '',
    customAliasAddress: '',
    customAliasLabel: '',
  };

  protected headerHeight = signal(0);
  protected showScrollToTop = signal(false);

  private resizeObserver: ResizeObserver | null = null;

  private dashboardEl = inject(ElementRef);
  private haptics = inject(Haptics);
  private http = inject(HttpClient);
  private message = inject(Message);
  private router = inject(Router);

  ngAfterViewInit() {
    this.dashboardEl.nativeElement
      .querySelector('.filter-dropdown input')
      .setAttribute('inputmode', 'none');

    document.addEventListener('visibilitychange', this.onVisibilityChange);

    const headerEl = document.querySelector('.header') as HTMLElement;

    if (headerEl) {
      this.resizeObserver = new ResizeObserver(() => {
        this.headerHeight.set(headerEl.getBoundingClientRect().height);
      });

      this.resizeObserver.observe(headerEl);
    }
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    this.resizeObserver?.disconnect();
  }

  @HostListener('window:scroll')
  protected onWindowScroll() {
    this.showScrollToTop.set(window.scrollY > 200);
  }

  constructor() {
    this.loadData();
  }

  private loadData() {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    this.data.set(null);
    this.aliases.set([]);

    this.paginatorFirst.set(0);

    this.http
      .get('/api/account/user', {
        headers: { Authorization: `Token ${apiKey}` },
      })
      .pipe(
        switchMap((res: any) => {
          return forkJoin({
            user: of(res),
            profile: this.http.get('/api/account/profile', {
              headers: { Authorization: `Token ${apiKey}` },
            }),
            random: this.http.get('/api/random', {
              headers: { Authorization: `Token ${apiKey}` },
            }),
            domain: this.http.get('/api/domain', {
              headers: { Authorization: `Token ${apiKey}` },
            }),
          });
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.data.set({
            email: res.user[0].email,
            profile: res.profile[0],
            aliases: [...res.random, ...res.domain],
          });

          this.applyTransforms();
        },
        error: (err: HttpErrorResponse) => {
          this.disconnect();

          this.message.showMessage('error', 'Error', err.error.error || 'Something went wrong');
        },
      });
  }

  private onVisibilityChange = () => {
    if (!document.hidden) {
      const active = document.activeElement as HTMLElement | null;

      if (active?.closest('.filter-dropdown')) {
        active.blur();
      }
    }
  };

  protected disconnect() {
    this.haptics.trigger('rigid');

    localStorage.removeItem(API_KEY_STORAGE_KEY);

    this.router.navigate(['/'], { replaceUrl: true });
  }

  protected refresh() {
    this.haptics.trigger('selection');

    this.loadData();
  }

  protected onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.paginatorFirst.set(0);
    this.applyTransforms();
  }

  protected onSortChange(sort: string) {
    this.sortValue.set(sort);
    this.paginatorFirst.set(0);
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
    this.paginatorFirst.set(0);
    this.applyTransforms();
  }

  protected onResetFilters() {
    this.filterOptions.update((groups) =>
      groups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item, disabled: false })),
      })),
    );

    this.filterValue.set(
      this.filterOptions()
        .map((option) => option.items.map((item) => item.value))
        .flat(),
    );

    this.paginatorFirst.set(0);
    this.applyTransforms();
  }

  protected onPageChange(event: { first?: number; rows?: number }) {
    this.paginatorFirst.set(event.first ?? 0);
    this.paginatorRows.set(event.rows ?? this.paginatorRows());
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

        case 'created-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        case 'created-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        case 'last-used-desc':
          return new Date(b.last_used_at ?? 0).getTime() - new Date(a.last_used_at ?? 0).getTime();

        case 'last-used-asc':
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

  protected scrollToTop() {
    this.haptics.trigger('light');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected openCreateAliasDialog() {
    this.createAliasTabValue.set('random');

    this.createAliasForm = {
      randomAliasLabel: '',
      customAliasAddress: '',
      customAliasLabel: '',
    };

    setTimeout(() => this.createAliasFormRef?.resetForm());

    this.isCreateAliasDialogVisible.set(true);
  }

  protected onCreateAliasTabChange() {
    this.createAliasForm = {
      randomAliasLabel: '',
      customAliasAddress: '',
      customAliasLabel: '',
    };

    setTimeout(() => this.createAliasFormRef?.resetForm());
  }

  protected createAlias(form: NgForm) {
    const tabValue = this.createAliasTabValue();

    if (tabValue === 'random' && this.data().profile.at_mask_limit) {
      this.isCreateAliasDialogVisible.set(false);
      this.haptics.trigger('warning');

      this.message.showMessage('warn', 'Warning', 'Alias limit reached');

      return;
    }

    if (tabValue === 'domain' && !this.data().profile.has_premium) {
      this.isCreateAliasDialogVisible.set(false);
      this.haptics.trigger('warning');

      this.message.showMessage(
        'warn',
        'Warning',
        'Custom aliases are only available for Relay Premium subscribers',
      );

      return;
    }

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!apiKey) return;

    if (tabValue === 'domain') {
      if (!this.createAliasForm.customAliasAddress?.trim()) {
        form.controls['customAliasAddress']?.markAsTouched();

        return;
      }
    }

    const maskType = tabValue;

    const body: any = {
      enabled: true,
      block_list_emails: false,
    };

    switch (maskType) {
      case 'random':
        body.description = this.createAliasForm.randomAliasLabel || '';
        break;

      case 'domain':
        body.address = this.createAliasForm.customAliasAddress || '';
        body.description = this.createAliasForm.customAliasLabel || '';
        break;
    }

    this.isCreatingAlias.set(true);

    this.http
      .post(`/api/${maskType}`, body, { headers: { Authorization: `Token ${apiKey}` } })
      .pipe(
        switchMap((res: any) => {
          this.data.update((data) => ({ ...data, aliases: [...data.aliases, res] }));

          this.applyTransforms();

          return forkJoin({
            alias: of(res),
            profile: this.http.get('/api/account/profile', {
              headers: { Authorization: `Token ${apiKey}` },
            }),
          });
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.data.update((data) => ({ ...data, profile: res.profile[0] }));

          this.isCreatingAlias.set(false);
          this.isCreateAliasDialogVisible.set(false);
          this.haptics.trigger('success');

          this.message.showMessage('success', 'Success', `Alias ${res.alias.full_address} created`);
        },
        error: (_err: HttpErrorResponse) => {
          this.isCreatingAlias.set(false);
          this.isCreateAliasDialogVisible.set(false);
          this.haptics.trigger('error');

          this.message.showMessage('error', 'Error', 'Alias could not be created');
        },
      });
  }

  protected updateAlias(alias: any) {
    this.data.update((data) => ({
      ...data,
      aliases: data.aliases.map((a: any) => (a.id === alias.id ? { ...a, ...alias } : a)),
    }));

    this.applyTransforms();
  }

  protected requestDeleteAlias(alias: any) {
    this.aliasToDelete.set(alias);
    this.isDeleteAliasDialogVisible.set(true);
  }

  protected confirmDeleteAlias() {
    const alias = this.aliasToDelete();
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!alias) return;
    if (!apiKey) return;

    let maskType = '';

    switch (alias.mask_type) {
      case 'random':
        maskType = 'random';
        break;

      case 'custom':
        maskType = 'domain';
        break;
    }

    this.isDeletingAlias.set(true);

    this.http
      .delete(`/api/${maskType}/${alias.id}`, {
        headers: { Authorization: `Token ${apiKey}` },
      })
      .pipe(
        switchMap((_res: any) => {
          this.data.update((data) => ({
            ...data,
            aliases: data.aliases.filter((a: any) => a.id !== alias.id),
          }));

          this.applyTransforms();

          return this.http.get('/api/account/profile', {
            headers: { Authorization: `Token ${apiKey}` },
          });
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.data.update((data) => ({
            ...data,
            profile: res[0],
          }));

          this.isDeletingAlias.set(false);
          this.isDeleteAliasDialogVisible.set(false);
          this.haptics.trigger('heavy');

          this.message.showMessage('success', 'Success', `Alias ${alias.full_address} deleted`);
        },
        error: (_err: HttpErrorResponse) => {
          this.isDeletingAlias.set(false);
          this.haptics.trigger('error');

          this.message.showMessage(
            'error',
            'Error',
            `Alias ${alias.full_address} could not be deleted`,
          );
        },
      });
  }
}
