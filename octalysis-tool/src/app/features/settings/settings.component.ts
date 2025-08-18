import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { StateService } from '../../core/state.service';
import { ExportService } from '../export/export.service';
import { I18nService, Locale } from '../../core/i18n.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="settings">
      <button class="icon" type="button" (click)="toggleTheme()" title="{{ 'settings.toggleTheme' | t }}" [attr.aria-label]="'settings.toggleTheme' | t">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-10.45-10.3 1 1 0 0 0-1.16-1.32 10 10 0 1 0 12.9 12.9 1 1 0 0 0-.24-1.14Z"/></svg>
      </button>
      <button class="icon" type="button" (click)="reset()" title="{{ 'settings.reset' | t }}" [attr.aria-label]="'settings.reset' | t">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12a9 9 0 1 1-3.18-6.86l1.4-1.4A1 1 0 0 1 21 4v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-.71-1.71l2.49-2.49A7 7 0 1 0 19 12h2Z"/></svg>
      </button>
      <button class="icon" type="button" (click)="exportPDF()" title="{{ 'settings.exportPDF' | t }}" [attr.aria-label]="'settings.exportPDF' | t">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 2.5 3.5 3.5H14Z"/><path d="M8 13h2.5a1.5 1.5 0 1 0 0-3H8Zm0 0v3m5-6h2a1 1 0 0 1 0 2h-2Zm0 0v4m0 0h2a1 1 0 0 0 0-2h-2Z"/></svg>
      </button>
      <button class="lang-btn" type="button" (click)="toggleLocale()" [attr.title]="'settings.language' | t">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm7.93 9h-3.08a15.46 15.46 0 0 0-1.2-5.17A8.015 8.015 0 0 1 19.93 11ZM12 4a13.53 13.53 0 0 1 2.06 6H9.94A13.53 13.53 0 0 1 12 4ZM4.07 13h3.08a15.46 15.46 0 0 0 1.2 5.17A8.015 8.015 0 0 1 4.07 13Zm3.08-2H4.07A8.015 8.015 0 0 1 8.35 5.83 15.46 15.46 0 0 0 7.15 11ZM9.94 13h4.12A13.53 13.53 0 0 1 12 20a13.53 13.53 0 0 1-2.06-7Zm6.91 0h3.08a8.015 8.015 0 0 1-4.28 6.17A15.46 15.46 0 0 0 16.85 13Z"/></svg>
        <span class="sep">|</span>
        <span class="code">{{ (i18n.locale$ | async) === 'ru' ? 'RU' : 'EN' }}</span>
      </button>
    </section>
  `,
  styles: [`
    .settings { display:flex; gap: .5rem; align-items: center; }
    .icon { width: 36px; height: 36px; display:inline-flex; align-items:center; justify-content:center; background: var(--btn-bg); color: var(--btn-fg); border: 1px solid var(--btn-border); border-radius: 8px; cursor: pointer; }
    .icon:hover { filter: brightness(1.05); }
    .lang-btn { height: 36px; display:inline-flex; align-items:center; gap: .5rem; padding: 0 .5rem; background: var(--btn-bg); color: var(--btn-fg); border: 1px solid var(--btn-border); border-radius: 8px; cursor: pointer; }
    .lang-btn .sep { opacity: .6; }
  `]
})
export class SettingsComponent {
  constructor(
    private theme: ThemeService,
    private state: StateService,
    private exporter: ExportService,
    public i18n: I18nService,
  ) {}

  toggleTheme() { this.theme.toggle(); }
  reset() { this.state.reset(); }
  exportPNG() { this.exporter.exportPNG(); }
  exportSVG() { this.exporter.exportSVG(); }
  exportPDF() { this.exporter.exportPDF(); }
  setLocale(l: Locale) { this.i18n.setLocale(l); }
  toggleLocale() {
    const sub = this.i18n.locale$.subscribe((loc) => {
      this.i18n.setLocale(loc === 'ru' ? 'en' : 'ru');
    });
    sub.unsubscribe();
  }
}
