import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { StateService, CoreDrives, AppState } from '../../core/state.service';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="chart">
      <svg #svg class="radar"></svg>
    </section>
  `,
  styles: [`
    :host { display:block; width: 100%; min-width: 0; flex: 1 1 auto; }
    /*
      Safari quirk: SVG внутри flex-контейнера может получать минимальную ширину
      по содержимому и сжиматься. Явно задаём ширину и гибкость контейнеру.
    */
    .chart { padding: 1rem; width: 100%; min-width: 0; flex: 1 1 100%; user-select: none; -webkit-user-select: none; }
    .radar { width: 100%; background: var(--bg); display: block; user-select: none; -webkit-user-select: none; }
    :host ::ng-deep text.axis-label { font-size: 16px; fill: var(--text-muted); user-select: none; -webkit-user-select: none; }
    /* ring numeric labels removed */
  `]
})
export class RadarChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  private sub?: Subscription;
  private i18nSub?: Subscription;
  private initialized = false;
  private lastState?: AppState;
  private draggingIndex: number | null = null;
  private ro?: ResizeObserver;
  // tooltips/badges removed per request

  // config
  private count = 8;
  private padding = 64;
  private labelPad = 36; // space reserved outside shape for labels
  private labelGap = 16; // how far labels are from the shape edge
  private heightFactor = 0.8; // reduce height vs width to trim extra space
  private axisKeys = ['meaning','creativity','socialInfluence','unpredictability','avoidance','scarcity','ownership','accomplishment'] as const;

  constructor(private state: StateService, private i18n: I18nService) {}

  ngAfterViewInit(): void {
    this.initChart();
    this.sub = this.state.value$.subscribe((v: AppState) => { this.lastState = v; this.update(v); });
    this.i18nSub = this.i18n.locale$.subscribe(() => this.updateLabels());
    const parent = this.svgRef.nativeElement.parentElement as HTMLElement | null;
    if (parent && 'ResizeObserver' in window) {
      this.ro = new ResizeObserver(() => {
        this.initChart();
        if (this.lastState) this.update(this.lastState);
      });
      this.ro.observe(parent);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.i18nSub?.unsubscribe();
    this.ro?.disconnect();
  }

  @HostListener('window:resize')
  onResize() {
    this.initChart();
    if (this.lastState) this.update(this.lastState);
  }

  private initChart() {
    const svg = d3.select(this.svgRef.nativeElement);
    const parent = this.svgRef.nativeElement.parentElement as HTMLElement | null;
    const width = Math.max(360, parent?.clientWidth || (this.svgRef.nativeElement.getBoundingClientRect().width || 600));
    const height = Math.max(320, Math.round(width * this.heightFactor));
    const centerX = width / 2;
    const centerY = height / 2;
    const maxR = (Math.min(width, height) / 2) - this.padding;
    const usableR = Math.max(0, maxR - this.labelPad);
    const minR = usableR * 0.25; // first ring inside usable area

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const chart = svg.append('g').attr('transform', `translate(${centerX},${centerY})`);
    const labels = svg.append('g').attr('transform', `translate(${centerX},${centerY})`);

    // Radial scales and helpers
    const angle = (i: number) => (-Math.PI / 2) + (i * 2 * Math.PI / this.count); // start at top, clockwise
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, usableR]);

    // Grid rings
    const rings = d3.range(4).map((i: number) => usableR * ((i + 1) / 4));
    chart.selectAll('circle.grid')
      .data(rings)
      .enter()
      .append('circle')
      .attr('class', 'grid')
      .attr('r', (d) => d)
      .attr('fill', 'none')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    // ring numeric labels removed

    // Axes and labels
    type Axis = { x: number; y: number; lx: number; ly: number; i: number };
    const axes: Axis[] = d3.range(this.count).map((i: number) => ({
      x: Math.cos(angle(i)) * usableR,
      y: Math.sin(angle(i)) * usableR,
      lx: Math.cos(angle(i)) * (usableR + this.labelGap),
      ly: Math.sin(angle(i)) * (usableR + this.labelGap),
      i,
    }));

    chart.selectAll('line.axis')
      .data(axes)
      .enter()
      .append('line')
      .attr('class', 'axis')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', (d: Axis) => d.x).attr('y2', (d: Axis) => d.y)
      .attr('stroke', '#cbd5e1').attr('stroke-width', 1);

    labels.selectAll('text.axis-label')
      .data(axes.map((a: Axis, i: number) => ({ ...a, label: this.i18n.t('drivers.' + this.axisKeys[i]) })))
      .enter()
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', (d: Axis & { label: string }) => d.lx)
      .attr('y', (d: Axis & { label: string }) => d.ly)
      .attr('text-anchor', (d: Axis & { label: string }) => {
        const c = Math.cos(angle(d.i));
        if (c > 0.3) return 'start';
        if (c < -0.3) return 'end';
        return 'middle';
      })
      .attr('dy', '0.35em')
      .attr('dx', (d: Axis & { label: string }) => {
        const c = Math.cos(angle(d.i));
        if (c > 0.3) return 6;
        if (c < -0.3) return -6;
        return 0;
      })
      .text((d: Axis & { label: string }) => d.label);

    // Clamp labels inside the viewport
    this.clampLabelsInside(labels, width, height);

    // no tooltip layer

    // Data group
    chart.append('path')
      .attr('class', 'area')
      .attr('fill', 'var(--accent-200)')
      .attr('stroke', 'var(--accent-500)')
      .attr('stroke-width', 2)
      .attr('fill-opacity', 0.35)
      .attr('d', this.pathForValues({
        meaning: 0, accomplishment: 0, creativity: 0, ownership: 0,
        socialInfluence: 0, scarcity: 0, unpredictability: 0, avoidance: 0
      }, rScale, angle));

    // Drag handles at vertices
    const handles = chart.append('g').attr('class','handles');
    handles.selectAll('circle.handle')
      .data(this.axisKeys.map((_, i) => i))
      .enter()
      .append('circle')
      .attr('class','handle')
      .attr('r', 7)
      .attr('fill', 'var(--accent-500)')
      .attr('cx', 0)
      .attr('cy', 0)
      .call(d3.drag<SVGCircleElement, number>()
        .on('start', (_event, i) => { this.draggingIndex = i; })
        .on('drag', (event, i) => {
          const a = angle(i);
          const p = d3.pointer(event, chart.node() as any);
          const x = p[0], y = p[1];
          const proj = (x*Math.cos(a) + y*Math.sin(a));
          const clamped = Math.max(minR, Math.min(usableR, proj));
          const value = usableR > 0 ? Math.round((clamped / usableR) * 100) : 0;
          const key = this.axisKeys[i] as keyof CoreDrives;
          this.state.updateDrive(key, value);
        })
        .on('end', () => { this.draggingIndex = null; })
      );

    // Wide invisible pick lines along axes for easier interaction
    chart.append('g').attr('class','axis-pick')
      .selectAll('line.pick')
      .data(this.axisKeys.map((_, i) => i))
      .enter()
      .append('line')
      .attr('class','pick')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', (i) => Math.cos(angle(i)) * usableR)
      .attr('y2', (i) => Math.sin(angle(i)) * usableR)
      .attr('stroke', 'transparent')
      .attr('stroke-width', 36)
      .on('mousedown mousemove click touchmove', (event: any, i: number) => {
        if (this.draggingIndex !== null && this.draggingIndex !== i) return;
        if (event.type === 'mousedown') this.draggingIndex = i;
        if (event.type === 'mousemove' && !(event.buttons & 1)) return;
        const a = angle(i);
        const p = d3.pointer(event, chart.node() as any);
        const x = p[0], y = p[1];
        const proj = (x*Math.cos(a) + y*Math.sin(a));
        const clamped = Math.max(minR, Math.min(usableR, proj));
        const value = usableR > 0 ? Math.round((clamped / usableR) * 100) : 0;
        const key = this.axisKeys[i] as keyof CoreDrives;
        this.state.updateDrive(key, value);
      });

    // no badges

    // Reset dragging on global mouseup/touchend
    d3.select(window as any).on('mouseup.radar touchend.radar', () => { this.draggingIndex = null; });

    // Save helpers on element for reuse
    (this.svgRef.nativeElement as any).__radar__ = { width, height, maxR, usableR, minR, rScale, angle };
    this.initialized = true;
  }

  private pathForValues(v: CoreDrives, r: d3.ScaleLinear<number, number>, angle: (i: number) => number, minR = 0): string {
    const vals = this.axisKeys.map(k => v[k]);
    const points = vals.map((value, i) => [
      Math.cos(angle(i)) * Math.max(minR, r(value)),
      Math.sin(angle(i)) * Math.max(minR, r(value)),
    ] as [number, number]);
    const line = d3.line<[number, number]>().x((d: [number, number]) => d[0]).y((d: [number, number]) => d[1]).curve(d3.curveLinearClosed);
    return line(points) ?? '';
  }

  private update(v: AppState) {
    if (!this.initialized) return;
    const svg = d3.select(this.svgRef.nativeElement);
    const ctx = (this.svgRef.nativeElement as any).__radar__ as { width: number; height: number; maxR: number; usableR: number; minR: number; rScale: d3.ScaleLinear<number, number>; angle: (i: number) => number };
    const path = this.pathForValues(v.drives, ctx.rScale, ctx.angle, ctx.minR);

    const area = svg.select('path.area');
    if (this.draggingIndex !== null) {
      area.attr('d', path);
    } else {
      area.transition().duration(200).attr('d', path);
    }

    // update handle positions
    const vals = this.axisKeys.map(k => v.drives[k]);
    const pts = vals.map((value, i) => {
      const a = ctx.angle(i); const r = Math.max(ctx.minR, Math.min(ctx.usableR, ctx.rScale(value)));
      return [Math.cos(a)*r, Math.sin(a)*r];
    });
    svg.selectAll('circle.handle')
      .data(pts)
      .attr('cx', (d: any) => d[0])
      .attr('cy', (d: any) => d[1]);

    // badges/tooltips removed
  }

  private updateLabels() {
    if (!this.initialized) return;
    const svg = d3.select(this.svgRef.nativeElement);
    const labelsData = this.axisKeys.map(k => this.i18n.t('drivers.' + k));
    svg.selectAll('text.axis-label').data(labelsData).text((d: string) => d);
    this.clampLabelsInside(d3.select((svg.node() as any).querySelector('g:nth-of-type(2)') as SVGGElement),
      (this.svgRef.nativeElement as any).__radar__.width,
      (this.svgRef.nativeElement as any).__radar__.height);

    // Global window move to allow dragging anywhere
    const anyWin: any = window as any;
    d3.select(anyWin)
      .on('mousemove.radar', (event: any) => {
        if (this.draggingIndex === null) return;
        const ctx = (this.svgRef.nativeElement as any).__radar__ as { usableR: number; minR: number; angle: (i: number) => number };
        const rect = (this.svgRef.nativeElement as any).getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width/2;
        const y = event.clientY - rect.top - rect.height/2;
        const i = this.draggingIndex;
        const a = ctx.angle(i);
        const proj = (x*Math.cos(a) + y*Math.sin(a));
        const clamped = Math.max(ctx.minR, Math.min(ctx.usableR, proj));
        const value = ctx.usableR > 0 ? Math.round((clamped / ctx.usableR) * 100) : 0;
        const key = this.axisKeys[i] as keyof CoreDrives;
        this.state.updateDrive(key, value);
      })
      .on('mouseup.radar touchend.radar', () => { this.draggingIndex = null; });
  }

  // tooltips/badges removed

  // Ensure labels are fully inside the SVG viewport by clamping x/y when overflowing
  private clampLabelsInside(labelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) {
    const halfX = width / 2;
    const halfY = height / 2;
    const minX = -halfX, maxX = halfX;
    const minY = -halfY, maxY = halfY;
    labelsGroup.selectAll<SVGTextElement, any>('text.axis-label').each(function() {
      const node = this as SVGTextElement;
      const bb = node.getBBox();
      let dx = 0, dy = 0;
      if (bb.x < minX) dx = minX - bb.x;
      if (bb.x + bb.width > maxX) dx = -(bb.x + bb.width - maxX);
      if (bb.y < minY) dy = minY - bb.y;
      if (bb.y + bb.height > maxY) dy = -(bb.y + bb.height - maxY);
      if (dx || dy) {
        const x = parseFloat(node.getAttribute('x') || '0');
        const y = parseFloat(node.getAttribute('y') || '0');
        node.setAttribute('x', String(x + dx));
        node.setAttribute('y', String(y + dy));
      }
    });
  }
}
