import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private subject = new BehaviorSubject<Theme>('light');
  readonly theme$ = this.subject.asObservable();

  constructor() {
    // Try to honor system preference on first load
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = prefersDark ? 'dark' : 'light';
    this.set(initial);
  }

  set(theme: Theme) {
    this.subject.next(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggle() {
    this.set(this.subject.getValue() === 'light' ? 'dark' : 'light');
  }
}

