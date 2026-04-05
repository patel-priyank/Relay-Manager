import { Component, effect, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    AvatarModule,
    ButtonModule,
    DrawerModule,
    PanelModule,
    RadioButtonModule,
    ToolbarModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnDestroy {
  protected drawerVisible = signal<boolean>(false);
  protected theme = signal<string>('system');

  private isDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  private themeChangeListener = () => {
    if (this.theme() === 'system') {
      this.applyTheme();
    }
  };

  constructor() {
    const savedTheme = localStorage.getItem('relay-manager-theme') || 'system';

    this.theme.set(savedTheme);

    this.isDarkMediaQuery.addEventListener('change', this.themeChangeListener);

    effect(() => {
      localStorage.setItem('relay-manager-theme', this.theme());

      this.applyTheme();
    });
  }

  ngOnDestroy() {
    this.isDarkMediaQuery.removeEventListener('change', this.themeChangeListener);
  }

  private initialThemeApplied = false;

  private applyTheme() {
    const applyClasses = () => {
      (this.theme() === 'system' ? this.isDarkMediaQuery.matches : this.theme() === 'dark')
        ? document.documentElement.classList.add('app-dark')
        : document.documentElement.classList.remove('app-dark');
    };

    if (this.initialThemeApplied && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => applyClasses());
    } else {
      applyClasses();

      this.initialThemeApplied = true;
    }
  }

  protected onThemeChange(theme: string) {
    this.theme.set(theme);
  }
}
