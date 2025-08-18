import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StateService, CoreDrives, AppState } from '../../core/state.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { Observable } from 'rxjs';

type DriverKey = keyof CoreDrives;

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="assessment">
      <h2>{{ 'assessment.title' | t }}</h2>
      <ng-container *ngIf="values$ | async as values">
        <div class="slider" *ngFor="let d of drivers">
          <label [for]="d.key">{{ ('drivers.' + d.key) | t }}: <strong>{{ values.drives[d.key] }}</strong></label>
          <input
            type="range"
            min="0"
            max="100"
            [id]="d.key"
            [value]="values.drives[d.key]"
            (input)="onChange(d.key, $any($event.target).value)"
          />
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .assessment { padding: 1rem; }
    .slider { margin: .5rem 0 1rem; }
    label { display:block; margin-bottom: .25rem; }
    input[type=range] { width: 100%; }
  `]
})
export class AssessmentComponent {
  values$: Observable<AppState> = this.state.value$;

  drivers: { key: DriverKey }[] = [
    { key: 'meaning' },
    { key: 'accomplishment' },
    { key: 'creativity' },
    { key: 'ownership' },
    { key: 'socialInfluence' },
    { key: 'scarcity' },
    { key: 'unpredictability' },
    { key: 'avoidance' },
  ];

  constructor(private state: StateService) {}

  onChange(key: DriverKey, value: number) {
    this.state.updateDrive(key, value);
  }
}
