import { inject, Injectable } from '@angular/core';

import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class Message {
  private messageService = inject(MessageService);

  showMessage(severity: 'success' | 'info' | 'warn' | 'error', title: string, message: string) {
    this.messageService.clear();

    this.messageService.add({
      severity,
      summary: title,
      detail: message,
    });
  }
}
