import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StateService } from '../../core/state.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="project">
      <div class="row">
        <input
          class="name"
          type="text"
          [placeholder]="'project.placeholder' | t"
          [value]="name"
          (input)="onInput($any($event.target).value)"
        />
        <div class="score" [title]="('project.totalScore' | t) + ': ' + totalScore.toFixed(2)">
          <span class="label">{{ 'project.totalScore' | t }}</span>
          <span class="value">{{ totalScore.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .project { margin-top: 2rem; padding: 0 1rem 1rem; display:flex; justify-content: center; }
    .row { width: 100%; max-width: 900px; display: flex; gap: .75rem; align-items: stretch; }
    .name { flex: 1 1 auto; min-width: 0; box-sizing: border-box; background: var(--bg); color: var(--fg); border: 1px solid var(--btn-border); border-radius: 10px; padding: .75rem 1rem; font-size: 1rem; }
    .score { flex: 0 0 auto; display: inline-flex; align-items: center; gap: .5rem; border: 1px solid var(--btn-border); border-radius: 10px; padding: .75rem 1rem; background: var(--bg); color: var(--fg); white-space: nowrap; font-size: 1rem; }
    .score .label { color: var(--text-muted); font-size: .9rem; }
    .score .value { font-weight: 600; font-variant-numeric: tabular-nums; }
  `]
})
export class ProjectComponent {
  name = '';
  totalScore = 0;
  constructor(private state: StateService) {
    this.name = state.value.projectName;
    this.totalScore = this.state.computeTotalScore(state.value.drives);
    state.value$.subscribe(v => {
      this.name = v.projectName;
      this.totalScore = this.state.computeTotalScore(v.drives);
    });
  }
  onInput(val: string) { this.state.setProjectName(val); }
}
