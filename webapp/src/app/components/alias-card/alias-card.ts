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
  @ViewChild('aliasLabelInputRef') aliasLabelInputRef!: ElementRef<HTMLInputElement>;

  alias = input<any | undefined>(undefined);
  isPremiumUser = input<boolean>(false);

  onUpdateAlias = output<any>();
  onShowMessage = output<{ success: boolean; title: string; message: string }>();

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

  protected aliasDialogVisible = signal<boolean>(false);

  protected aliasLabel = signal<string>('');
  protected isAliasLabelEditable = signal<boolean>(false);
  protected isSavingAliasLabel = signal<boolean>(false);

  protected blockingLevel = signal<string | undefined>(undefined);
  protected isSavingBlockingLevel = signal<boolean>(false);

  private http = inject(HttpClient);

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

  protected updateAliasLabel() {
    const apiKey = localStorage.getItem('relay-manager-api-key');

    if (!this.alias()) return;
    if (!apiKey) return;

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

    this.http.patch(`/api/${maskType}/${this.alias().id}?token=${apiKey}`, body).subscribe({
      next: (res: any) => {
        this.isSavingAliasLabel.set(false);
        this.isAliasLabelEditable.set(false);

        this.onUpdateAlias.emit(res);

        this.onShowMessage.emit({
          success: true,
          title: 'Success',
          message: `Label updated for ${this.alias().full_address}`,
        });
      },
      error: (_err: HttpErrorResponse) => {
        this.isSavingAliasLabel.set(false);

        this.onShowMessage.emit({
          success: false,
          title: 'Error',
          message: `Label could not be updated for ${this.alias().full_address}`,
        });
      },
    });
  }

  protected copyAddress() {
    navigator.clipboard.writeText(this.alias().full_address);

    this.onShowMessage.emit({
      success: true,
      title: 'Success',
      message: 'Copied alias address to clipboard',
    });
  }

  protected updateBlockingLevel(blockingLevel: string) {
    if (!this.isPremiumUser() && blockingLevel === 'promo') {
      this.onShowMessage.emit({
        success: false,
        title: 'Error',
        message: 'Promotions blocking level is only available for Relay Premium subscribers',
      });

      this.blockingLevel.set(blockingLevel);

      setTimeout(() => this.setBlockingLevel());

      return;
    }

    const apiKey = localStorage.getItem('relay-manager-api-key');

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

    this.http.patch(`/api/${maskType}/${this.alias().id}?token=${apiKey}`, body).subscribe({
      next: (res: any) => {
        this.isSavingBlockingLevel.set(false);

        this.onUpdateAlias.emit(res);

        this.onShowMessage.emit({
          success: true,
          title: 'Success',
          message: `Blocking level updated for ${this.alias().full_address}`,
        });
      },
      error: (_err: HttpErrorResponse) => {
        this.isSavingBlockingLevel.set(false);

        this.setBlockingLevel();

        this.onShowMessage.emit({
          success: false,
          title: 'Error',
          message: `Blocking level could not be updated for ${this.alias().full_address}`,
        });
      },
    });
  }
}
