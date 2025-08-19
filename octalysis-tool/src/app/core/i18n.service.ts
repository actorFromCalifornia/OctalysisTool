import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type Locale = 'ru' | 'en';
type Dict = Record<string, string>;

const DEFAULT_EN: Dict = {
  'app.title': 'Octalysis Tool',
  'app.subtitle': 'Assess 8 motivation drives, save and export.',

  'assessment.title': 'Assessment',
  'comments.title': 'Driver Notes',
  'project.placeholder': 'Project name',
  'project.totalScore': 'Total Score',

  'drivers.meaning': 'Epic Meaning',
  'drivers.accomplishment': 'Accomplishment',
  'drivers.creativity': 'Empowerment',
  'drivers.ownership': 'Ownership',
  'drivers.socialInfluence': 'Social Influence',
  'drivers.scarcity': 'Scarcity',
  'drivers.unpredictability': 'Unpredictability',
  'drivers.avoidance': 'Loss & Avoidance',

  'chart.title': 'Octalysis Chart',

  'settings.toggleTheme': 'Toggle theme',
  'settings.reset': 'Reset',
  'settings.exportPNG': 'Export PNG',
  'settings.exportSVG': 'Export SVG',
  'settings.exportPDF': 'Export PDF',
  'settings.language': 'Language',

  // SEO fallbacks
  'seo.description': 'Analyze the 8 Core Drives of the Octalysis Framework. Build a radar chart, add notes, and export to PDF. Works fully offline.',
  'seo.keywords': 'Octalysis, Octalysis Tool, gamification, 8 Core Drives, motivation, UX, product design, framework, analysis, radar chart'
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private localeSubject = new BehaviorSubject<Locale>('en');
  readonly locale$ = this.localeSubject.asObservable();
  private dict: Dict = {};

  constructor(private http: HttpClient) {
    // Provide immediate defaults, then choose initial locale by URL prefix
    this.dict = DEFAULT_EN;
    let initial: Locale = 'en';
    try {
      const url = new URL(window.location.href);
      const p = url.pathname || '/';
      const pp = url.searchParams.get('p') || '';
      const target = pp || p;
      if (target === '/ru' || target.startsWith('/ru/')) initial = 'ru';
    } catch {}
    this.setLocale(initial);
  }

  async setLocale(locale: Locale) {
    try {
      const dict = await firstValueFrom(this.http.get<Dict>(`assets/i18n/${locale}.json`));
      this.dict = dict || this.dict;
    } catch {
      // Keep existing dictionary (defaults are EN) if load fails
    }
    this.localeSubject.next(locale);
    document.documentElement.setAttribute('lang', locale);
  }

  t(key: string): string {
    return this.dict[key] ?? key;
  }

  driverLabels(): string[] {
    return [
      this.t('drivers.meaning'),
      this.t('drivers.accomplishment'),
      this.t('drivers.creativity'),
      this.t('drivers.ownership'),
      this.t('drivers.socialInfluence'),
      this.t('drivers.scarcity'),
      this.t('drivers.unpredictability'),
      this.t('drivers.avoidance'),
    ];
  }
}
