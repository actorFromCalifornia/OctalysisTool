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
      <input
        type="text"
        [placeholder]="'project.placeholder' | t"
        [value]="name"
        (input)="onInput($any($event.target).value)"
      />
    </div>
  `,
  styles: [`
    .project { margin-top: 2rem; padding: 0 1rem 1rem; display:flex; justify-content: center; }
    input { width: 100%; max-width: 900px; box-sizing: border-box; background: var(--bg); color: var(--fg); border: 1px solid var(--btn-border); border-radius: 10px; padding: .75rem 1rem; font-size: 1rem; }
  `]
})
export class ProjectComponent {
  name = '';
  constructor(private state: StateService) {
    this.name = state.value.projectName;
    state.value$.subscribe(v => this.name = v.projectName);
  }
  onInput(val: string) { this.state.setProjectName(val); }
}
