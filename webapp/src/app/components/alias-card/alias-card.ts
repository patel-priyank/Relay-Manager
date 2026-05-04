import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

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
    { name: 'None', value: 'none', disabled: false },
    { name: 'Promo', value: 'promo', disabled: !this.premiumUser() },
    { name: 'All', value: 'all', disabled: false },
  ]);

  protected aliasDialogVisible = signal<boolean>(false);
  protected aliasCopied = signal<boolean>(false);

  protected updateDescription() {
    console.log('updateDescription() called');
  }

  protected copyAlias() {
    if (!this.alias()) return;

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
