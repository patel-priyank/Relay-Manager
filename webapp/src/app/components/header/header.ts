import { Component, signal } from '@angular/core';
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
export class Header {
  protected drawerVisible = signal<boolean>(false);

  protected theme = signal<string>('system');

  protected toggleDrawer() {
    this.drawerVisible.update((value) => !value);
  }

  protected onThemeChange(theme: string) {
    this.theme.set(theme);
  }
}
