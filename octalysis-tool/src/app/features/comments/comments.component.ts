import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StateService, Comments, CoreDrives, AppState } from '../../core/state.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { Observable } from 'rxjs';

type Key = keyof Comments & keyof CoreDrives;

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="comments">
      <h2>{{ 'comments.title' | t }}</h2>
      <ng-container *ngIf="state$ | async as s">
        <div class="item" *ngFor="let k of keys">
          <label [for]="k">{{ ('drivers.' + k) | t }}</label>
          <textarea [id]="k" rows="2" [value]="s.comments[k]" (input)="onChange(k, $any($event.target).value)"></textarea>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .comments { padding: 1rem; }
    .item { display:flex; flex-direction: column; gap: .5rem; margin-bottom: .75rem; }
    textarea { width: 100%; max-width: 100%; box-sizing: border-box; resize: vertical; background: var(--bg); color: var(--fg); border: 1px solid var(--btn-border); border-radius: 8px; padding: .5rem .75rem; }
    label { color: var(--text-muted); }
  `]
})
export class CommentsComponent {
  state$: Observable<AppState> = this.state.value$;
  // Order aligned with chart axes (top, clockwise)
  keys: Key[] = ['meaning','creativity','socialInfluence','unpredictability','avoidance','scarcity','ownership','accomplishment'];
  constructor(private state: StateService) {}
  onChange(key: Key, text: string) { this.state.setComment(key, text); }
}
