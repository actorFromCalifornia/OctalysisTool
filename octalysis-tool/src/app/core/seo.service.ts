import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { combineLatest } from 'rxjs';
import { I18nService } from './i18n.service';
import { StateService } from './state.service';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private ldScriptId = 'ld-json-main';

  constructor(
    private titleSvc: Title,
    private meta: Meta,
    private i18n: I18nService,
    private state: StateService,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    combineLatest([this.i18n.locale$, this.state.value$]).subscribe(([loc, app]) => {
      const project = app.projectName?.trim();
      const baseTitle = 'Octalysis Tool — Octalysis Framework Analyzer';
      const title = project ? `${project} — Octalysis Analysis | Octalysis Tool` : baseTitle;
      const description = this.i18n.t('seo.description');
      const keywords = this.i18n.t('seo.keywords');
      const url = this.currentUrl();
      const image = this.absoluteUrl('assets/images/social_media.png');

      this.titleSvc.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ name: 'keywords', content: keywords });
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });

      this.meta.updateTag({ property: 'og:type', content: 'website' } as any);
      this.meta.updateTag({ property: 'og:title', content: title } as any);
      this.meta.updateTag({ property: 'og:description', content: description } as any);
      this.meta.updateTag({ property: 'og:url', content: url } as any);
      this.meta.updateTag({ property: 'og:image', content: image } as any);

      this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      this.meta.updateTag({ name: 'twitter:image', content: image });

      this.upsertCanonical(url);
      this.upsertHreflang();
      this.upsertJSONLD(this.buildJSONLD(title, description, url, image, loc));
    });
  }

  private currentUrl(): string {
    const loc = new URL(window.location.href);
    const origin = `${loc.protocol}//${loc.host}`;
    const p = loc.searchParams.get('p');
    const pathname = p || loc.pathname;
    return `${origin}${pathname}`;
  }

  private absoluteUrl(path: string): string {
    const { protocol, host } = window.location;
    const base = `${protocol}//${host}`;
    if (path.startsWith('http')) return path;
    if (!path.startsWith('/')) path = '/' + path;
    return base + path;
  }

  private upsertCanonical(href: string) {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private upsertJSONLD(json: object) {
    let script = this.doc.getElementById(this.ldScriptId) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = this.ldScriptId;
      this.doc.head.appendChild(script);
    }
    script.text = JSON.stringify(json);
  }

  private upsertHreflang() {
    const origin = `${window.location.protocol}//${window.location.host}`;
    const enHref = `${origin}/`;
    const ruHref = `${origin}/ru/`;
    const existing = Array.from(this.doc.querySelectorAll('link[rel="alternate"][hreflang]')) as HTMLLinkElement[];
    existing.forEach(el => el.parentElement?.removeChild(el));
    this.appendLink('alternate', { hreflang: 'en', href: enHref });
    this.appendLink('alternate', { hreflang: 'ru', href: ruHref });
    this.appendLink('alternate', { hreflang: 'x-default', href: enHref });
  }

  private appendLink(rel: string, attrs: Record<string, string>) {
    const l = this.doc.createElement('link');
    l.setAttribute('rel', rel);
    for (const [k, v] of Object.entries(attrs)) l.setAttribute(k, v);
    this.doc.head.appendChild(l);
  }

  private buildJSONLD(name: string, description: string, url: string, image: string, inLanguage: string) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name,
      description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage,
      url,
      image,
      offers: {
        '@type': 'Offer',
        price: 0,
        priceCurrency: 'USD'
      }
    } as const;
  }
}
