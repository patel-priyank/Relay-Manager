import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

import { Haptics } from '../../services/haptics';
import { Message } from '../../services/message';

import { API_KEY_STORAGE_KEY } from '../../constants';

@Component({
  selector: 'app-alias-card',
  imports: [
    ButtonModule,
    DatePipe,
    CardModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    SelectButtonModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './alias-card.html',
  styleUrl: './alias-card.scss',
})
export class AliasCard {
  @ViewChild('aliasLabelInputRef') private aliasLabelInputRef!: ElementRef<HTMLInputElement>;

  alias = input<any | undefined>(undefined);
  isPremiumUser = input<boolean>(false);

  onUpdateAlias = output<any>();
  onRequestDeleteAlias = output<any>();

  protected blockingLevels = computed(() => [
    {
      value: 'none',
      label: 'None',
      longLabel: 'None',
      description: 'All emails sent to this alias will be forwarded to your real address.',
      disabled: false,
    },
    {
      value: 'promo',
      label: 'Promo',
      longLabel: 'Promotions',
      description:
        'Firefox Relay will attempt to block promotional emails while still forwarding emails like receipts and shipping information.',
      disabled: !this.isPremiumUser(),
    },
    {
      value: 'all',
      label: 'All',
      longLabel: 'All',
      description: 'Firefox Relay is blocking all emails sent to this alias.',
      disabled: false,
    },
  ]);

  protected isStatisticsDialogVisible = signal<boolean>(false);

  protected aliasLabel = signal<string>('');
  protected isAliasLabelEditable = signal<boolean>(false);
  protected isSavingAliasLabel = signal<boolean>(false);

  protected blockingLevel = signal<string | undefined>(undefined);
  protected isSavingBlockingLevel = signal<boolean>(false);

  private haptics = inject(Haptics);
  private http = inject(HttpClient);
  private message = inject(Message);

  constructor() {
    effect(() => {
      this.setBlockingLevel();
    });
  }

  private setBlockingLevel() {
    if (!this.alias()) return;

    if (this.alias().enabled) {
      if (this.alias().block_list_emails) {
        this.blockingLevel.set('promo');
      } else {
        this.blockingLevel.set('none');
      }
    } else {
      this.blockingLevel.set('all');
    }
  }

  protected showAliasLabelInput() {
    this.isAliasLabelEditable.set(true);
    this.aliasLabel.set(this.alias().description || '');
    setTimeout(() => this.aliasLabelInputRef.nativeElement.focus());
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.isAliasLabelEditable.set(false);
    }
  }

  protected updateAliasLabel() {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!this.alias()) return;
    if (!apiKey) return;

    if (this.aliasLabel() === this.alias().description) {
      this.isAliasLabelEditable.set(false);

      return;
    }

    let maskType = '';

    switch (this.alias().mask_type) {
      case 'random':
        maskType = 'random';
        break;

      case 'custom':
        maskType = 'domain';
        break;
    }

    const body = { description: this.aliasLabel() };

    this.isSavingAliasLabel.set(true);

    this.http
      .patch(`/api/${maskType}/${this.alias().id}`, body, {
        headers: { Authorization: `Token ${apiKey}` },
      })
      .subscribe({
        next: (res: any) => {
          this.isSavingAliasLabel.set(false);
          this.isAliasLabelEditable.set(false);
          this.haptics.trigger('success');

          this.onUpdateAlias.emit(res);

          this.message.showMessage(
            'success',
            'Label saved',
            `Label updated for ${this.alias().full_address}`,
          );
        },
        error: (_err: HttpErrorResponse) => {
          this.isSavingAliasLabel.set(false);
          this.haptics.trigger('error');

          this.message.showMessage(
            'error',
            'Update failed',
            `Label could not be updated for ${this.alias().full_address}`,
          );
        },
      });
  }

  protected copyAddress() {
    navigator.clipboard.writeText(this.alias().full_address);
    this.haptics.trigger('medium');

    this.message.showMessage('success', 'Copied', 'Copied alias address to clipboard');
  }

  protected updateBlockingLevel(blockingLevel: string) {
    if (!this.isPremiumUser() && blockingLevel === 'promo') {
      this.blockingLevel.set(blockingLevel);

      setTimeout(() => this.setBlockingLevel());

      this.haptics.trigger('warning');

      this.message.showMessage(
        'warn',
        'Premium only',
        'Promotions blocking level is only available for Relay Premium subscribers',
      );

      return;
    }

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!this.alias()) return;
    if (!apiKey) return;

    let maskType = '';
    let body = {
      enabled: this.alias().enabled,
      block_list_emails: this.alias().block_list_emails,
    };

    switch (this.alias().mask_type) {
      case 'random':
        maskType = 'random';
        break;

      case 'custom':
        maskType = 'domain';
        break;
    }

    switch (blockingLevel) {
      case 'none':
        body = { enabled: true, block_list_emails: false };
        break;

      case 'promo':
        body = { enabled: true, block_list_emails: true };
        break;

      case 'all':
        body = { enabled: false, block_list_emails: false };
        break;
    }

    this.blockingLevel.set(blockingLevel);

    this.isSavingBlockingLevel.set(true);

    this.http
      .patch(`/api/${maskType}/${this.alias().id}`, body, {
        headers: { Authorization: `Token ${apiKey}` },
      })
      .subscribe({
        next: (res: any) => {
          this.isSavingBlockingLevel.set(false);
          this.haptics.trigger('soft');

          this.onUpdateAlias.emit(res);

          this.message.showMessage(
            'success',
            'Blocking level saved',
            `Blocking level updated for ${this.alias().full_address}`,
          );
        },
        error: (_err: HttpErrorResponse) => {
          this.isSavingBlockingLevel.set(false);
          this.haptics.trigger('error');

          this.setBlockingLevel();

          this.message.showMessage(
            'error',
            'Update failed',
            `Blocking level could not be updated for ${this.alias().full_address}`,
          );
        },
      });
  }
}
