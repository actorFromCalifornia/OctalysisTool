import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

export type CoreDrives = {
  meaning: number; // Смысл
  accomplishment: number; // Достижения
  creativity: number; // Креативность
  ownership: number; // Владение
  socialInfluence: number; // Социальное влияние
  scarcity: number; // Дефицит
  unpredictability: number; // Непредсказуемость
  avoidance: number; // Потери/Избегание
};

export type Comments = {
  meaning: string;
  accomplishment: string;
  creativity: string;
  ownership: string;
  socialInfluence: string;
  scarcity: string;
  unpredictability: string;
  avoidance: string;
};

export type AppState = {
  projectName: string;
  drives: CoreDrives;
  comments: Comments;
};

const DEFAULT_DRIVES: CoreDrives = {
  meaning: 50,
  accomplishment: 50,
  creativity: 50,
  ownership: 50,
  socialInfluence: 50,
  scarcity: 50,
  unpredictability: 50,
  avoidance: 50,
};

const DEFAULT_COMMENTS: Comments = {
  meaning: '',
  accomplishment: '',
  creativity: '',
  ownership: '',
  socialInfluence: '',
  scarcity: '',
  unpredictability: '',
  avoidance: '',
};

const DEFAULT_STATE: AppState = {
  projectName: '',
  drives: DEFAULT_DRIVES,
  comments: DEFAULT_COMMENTS,
};

const STORAGE_KEY = 'octalysisState';

@Injectable({ providedIn: 'root' })
export class StateService {
  private subject = new BehaviorSubject<AppState>(DEFAULT_STATE);
  readonly value$ = this.subject.asObservable();

  constructor(private storage: StorageService) {
    const saved = this.storage.get<AppState | CoreDrives>(STORAGE_KEY, DEFAULT_STATE as unknown as AppState);
    // migrate from old shape (plain CoreDrives)
    let state: AppState;
    if ('meaning' in (saved as any)) {
      const d = saved as CoreDrives;
      state = { projectName: '', drives: this.sanitizeDrives(d), comments: { ...DEFAULT_COMMENTS } };
    } else {
      const s = saved as AppState;
      state = { ...s, drives: this.sanitizeDrives(s.drives) };
    }
    this.subject.next(state);
    this.value$.subscribe((v) => this.storage.set(STORAGE_KEY, v));
  }

  get value(): AppState {
    return this.subject.getValue();
  }

  updateDrive<K extends keyof CoreDrives>(key: K, value: number) {
    const n = Number(value);
    const v = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
    const next: AppState = { ...this.value, drives: { ...this.value.drives, [key]: v } } as AppState;
    this.subject.next(next);
  }

  reset() {
    this.subject.next({ ...DEFAULT_STATE });
  }

  setProjectName(name: string) {
    this.subject.next({ ...this.value, projectName: name });
  }

  setComment<K extends keyof Comments>(key: K, text: string) {
    this.subject.next({ ...this.value, comments: { ...this.value.comments, [key]: text } });
  }

  computeTotalScore(drives: CoreDrives): number {
    const vals = Object.values(drives);
    return vals.reduce((sum, x) => {
      const t = Math.max(0, Math.min(1, (x - 25) / 75));
      return sum + (1 + 3 * t);
    }, 0);
  }

  private sanitizeDrives(d: CoreDrives): CoreDrives {
    const norm = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
    };
    return {
      meaning: norm(d?.meaning),
      accomplishment: norm(d?.accomplishment),
      creativity: norm(d?.creativity),
      ownership: norm(d?.ownership),
      socialInfluence: norm(d?.socialInfluence),
      scarcity: norm(d?.scarcity),
      unpredictability: norm(d?.unpredictability),
      avoidance: norm(d?.avoidance),
    };
  }
}
