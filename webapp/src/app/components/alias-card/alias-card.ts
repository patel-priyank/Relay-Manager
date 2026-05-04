import { Component, computed, effect, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
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
    DividerModule,
    FormsModule,
    MessageModule,
    SelectButtonModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './alias-card.html',
  styleUrl: './alias-card.scss',
})
export class AliasCard {
  alias = input<any | undefined>(undefined);
  premiumUser = input<boolean>(false);

  protected blockingLevels = computed(() => [
    {
      value: 'none',
      btnLabel: 'None',
      textLabel: 'None',
      description: 'All emails sent to this alias will be forwarded to your real address.',
      disabled: false,
      learnMore: false,
    },
    {
      value: 'promo',
      btnLabel: 'Promo',
      textLabel: 'Promotions',
      description:
        'Firefox Relay will attempt to block promotional emails while still forwarding emails like receipts and shipping information.',
      disabled: !this.premiumUser(),
      learnMore: true,
    },
    {
      value: 'all',
      btnLabel: 'All',
      textLabel: 'All',
      description: 'Firefox Relay is blocking all emails sent to this alias.',
      disabled: false,
      learnMore: false,
    },
  ]);

  protected aliasDialogVisible = signal<boolean>(false);
  protected aliasCopied = signal<boolean>(false);
  protected blockingLevel = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const alias = this.alias();

      if (alias) {
        if (alias.enabled) {
          if (alias.block_list_emails) {
            this.blockingLevel.set('promo');
          } else {
            this.blockingLevel.set('none');
          }
        } else {
          this.blockingLevel.set('all');
        }
      }
    });
  }

  protected updateDescription() {
    console.log('updateDescription() called');
  }

  protected copyAlias() {
    navigator.clipboard.writeText(this.alias().full_address);

    this.aliasCopied.set(true);

    setTimeout(() => {
      this.aliasCopied.set(false);
    }, 1500);
  }

  protected updateBlockingLevel() {
    console.log('updateBlockingLevel() called');
  }
}
