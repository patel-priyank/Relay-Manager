import { Injectable } from '@angular/core';

import { WebHaptics } from 'web-haptics';

type HapticPreset =
  | 'success'
  | 'warning'
  | 'error'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'soft'
  | 'rigid'
  | 'selection'
  | 'nudge'
  | 'buzz';

@Injectable({
  providedIn: 'root',
})
export class Haptics {
  private haptics = new WebHaptics();

  trigger(preset: HapticPreset) {
    this.haptics.trigger(preset);
  }
}
