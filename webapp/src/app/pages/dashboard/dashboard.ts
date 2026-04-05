import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { Header } from '../../components/header/header';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private router = inject(Router);

  constructor() {
    const savedAPIKey = localStorage.getItem('relay-manager-api-key');

    if (!savedAPIKey) {
      this.router.navigate(['/setup']);
    }
  }

  protected disconnect() {
    localStorage.removeItem('relay-manager-api-key');

    this.router.navigate(['/setup']);
  }
}
