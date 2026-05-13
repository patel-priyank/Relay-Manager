import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { Message } from '../../services/message';

@Component({
  selector: 'app-setup',
  imports: [AvatarModule, ButtonModule, CardModule, FormsModule, MessageModule, PasswordModule],
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
})
export class Setup {
  protected apiKey = signal('');
  protected isConnecting = signal(false);

  private http = inject(HttpClient);
  private message = inject(Message);
  private router = inject(Router);

  constructor() {
    const savedApiKey = localStorage.getItem('relay-manager-api-key');

    if (savedApiKey) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  protected connect() {
    if (!this.apiKey().trim()) return;

    this.isConnecting.set(true);

    this.http
      .get('/api/account/user', {
        headers: { Authorization: `Token ${this.apiKey()}` },
      })
      .subscribe({
        next: (_res: any) => {
          this.isConnecting.set(false);

          localStorage.setItem('relay-manager-api-key', this.apiKey());

          this.router.navigate(['/dashboard'], { replaceUrl: true });
        },
        error: (err: HttpErrorResponse) => {
          this.isConnecting.set(false);

          this.message.showMessage('error', 'Error', err.error.error || 'Something went wrong');
        },
      });
  }
}
