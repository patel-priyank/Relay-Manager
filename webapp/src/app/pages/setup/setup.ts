import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-setup',
  imports: [FormsModule, AvatarModule, ButtonModule, CardModule, MessageModule, PasswordModule],
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
})
export class Setup {
  protected apiKey = signal('');
  protected error = signal('');
  protected isLoading = signal(false);

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    const savedAPIKey = localStorage.getItem('relay-manager-api-key');

    if (savedAPIKey) {
      this.router.navigate(['/dashboard']);
    }
  }

  protected connect() {
    if (!this.apiKey().trim()) return;

    this.isLoading.set(true);
    this.error.set('');

    this.http.get(`/api/account/profile?token=${this.apiKey()}`).subscribe({
      next: (_res: any) => {
        this.isLoading.set(false);

        localStorage.setItem('relay-manager-api-key', this.apiKey());

        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);

        this.error.set(err.error.error);
      },
    });
  }
}
