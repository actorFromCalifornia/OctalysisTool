import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type Locale = 'ru' | 'en';
type Dict = Record<string, string>;

const DEFAULT_RU: Dict = {
  'app.title': 'Octalysis Tool',
  'app.subtitle': 'Анализируйте 8 стимулов мотивации, сохраняйте и экспортируйте.',
  'assessment.title': 'Оценка драйверов',
  'drivers.meaning': 'Смысл',
  'drivers.accomplishment': 'Достижения',
  'drivers.creativity': 'Креативность',
  'drivers.ownership': 'Владение',
  'drivers.socialInfluence': 'Социальное влияние',
  'drivers.scarcity': 'Дефицит',
  'drivers.unpredictability': 'Непредсказуемость',
  'drivers.avoidance': 'Потери/Избегание',
  'chart.title': 'Диаграмма Octalysis',
  'settings.toggleTheme': 'Сменить тему',
  'settings.reset': 'Сбросить',
  'settings.exportPNG': 'Экспорт PNG',
  'settings.exportSVG': 'Экспорт SVG',
  'settings.exportPDF': 'Экспорт PDF',
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private localeSubject = new BehaviorSubject<Locale>('ru');
  readonly locale$ = this.localeSubject.asObservable();
  private dict: Dict = {};

  constructor(private http: HttpClient) {
    // Provide immediate defaults for file:// usage, then try to load.
    this.dict = DEFAULT_RU;
    this.setLocale('ru');
  }

  async setLocale(locale: Locale) {
    try {
      const dict = await firstValueFrom(this.http.get<Dict>(`assets/i18n/${locale}.json`));
      this.dict = dict || this.dict;
    } catch {
      // If load fails (e.g., file://), keep existing dictionary (defaults are RU)
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
