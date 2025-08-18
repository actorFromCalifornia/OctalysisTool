import { Injectable } from '@angular/core';
import { StateService } from '../../core/state.service';
import { I18nService } from '../../core/i18n.service';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor(private state: StateService, private i18n: I18nService) {}
  exportPNG(): void {
    // TODO: implement with html2canvas
    console.log('Export PNG: not implemented yet');
  }

  exportSVG(): void {
    // TODO: serialize SVG content
    console.log('Export SVG: not implemented yet');
  }

  exportPDF(): void {
    const st = this.state.value;
    const title = st.projectName || this.i18n.t('project.placeholder');
    const total = this.state.computeTotalScore(st.drives).toFixed(2);

    // collect non-empty comments in the same order as on the page (top, clockwise)
    const order = ['meaning','creativity','socialInfluence','unpredictability','avoidance','scarcity','ownership','accomplishment'] as const;
    const entries = order
      .map((k) => ({ key: k, label: this.i18n.t('drivers.' + k), text: (st.comments[k] || '').trim() }))
      .filter((e) => e.text.length > 0);

    // get current chart SVG
    const svgEl = document.querySelector('svg.radar') as SVGSVGElement | null;
    const svg = svgEl ? svgEl.outerHTML : '';

    // capture current theme variables to keep colors
    const root = document.documentElement;
    const style = getComputedStyle(root);
    const vars = ['--bg','--fg','--text-muted','--panel-bg','--accent-200','--accent-500','--btn-bg','--btn-fg','--btn-border'];
    const cssVars = vars.map(v => `${v}: ${style.getPropertyValue(v).trim()};`).join(' ');

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title></title>
  <style>
    :root { ${cssVars} }
    html, body { margin: 0; padding: 0; background: #fff; color: #000; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    main { box-sizing: border-box; padding: 0; }
    .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
    .title { font-size: 18px; font-weight: 600; }
    .score { font-size: 16px; font-weight: 600; }
    .chart { margin: 8px 0 16px; }
    .chart svg { width: 100%; height: auto; }
    .comments { margin-top: 8px; }
    .comment { margin: 8px 0; break-inside: avoid-page; page-break-inside: avoid; }
    .label { font-size: 13px; color: #555; margin-bottom: 2px; }
    .text { white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; font-size: 14px; }
    /* Стандартные поля страницы для печати */
    @page { size: A4; margin: 15mm; }
  </style>
  </head>
  <body>
    <main>
      <div class="header">
        <div class="title">${escapeHtml(title)}</div>
        <div class="score">${escapeHtml(this.i18n.t('project.totalScore'))}: ${escapeHtml(total)}</div>
      </div>
      <div class="chart">${svg}</div>
      ${entries.length ? `<div class="comments">
        ${entries.map(e => `<div class="comment">
          <div class="label">${escapeHtml(e.label)}</div>
          <div class="text">${escapeHtml(e.text)}</div>
        </div>`).join('')}
      </div>` : ''}
    </main>
    <script>
      (function(){
        function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }
        async function ready(){
          try { if (document.fonts && document.fonts.ready) { await document.fonts.ready; } } catch(e){}
          await delay(150);
        }
        window.addEventListener('load', async () => {
          await ready();
          try { window.focus(); } catch(e){}
          try { window.print(); } catch(e){}
        });
      })();
    </script>
  </body>
</html>`;

    // Print via hidden iframe to avoid popup blockers and about:blank issues
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
    const idoc = iframe.contentDocument;
    if (!idoc) return;
    idoc.open();
    idoc.write(html);
    idoc.close();
    // Remove iframe after some time (print dialog blocks; use timeout cleanup)
    setTimeout(() => { iframe.parentNode?.removeChild(iframe); }, 5000);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
