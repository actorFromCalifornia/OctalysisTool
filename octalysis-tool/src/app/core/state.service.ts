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
      state = { projectName: '', drives: d, comments: { ...DEFAULT_COMMENTS } };
    } else {
      state = saved as AppState;
    }
    this.subject.next(state);
    this.value$.subscribe((v) => this.storage.set(STORAGE_KEY, v));
  }

  get value(): AppState {
    return this.subject.getValue();
  }

  updateDrive<K extends keyof CoreDrives>(key: K, value: number) {
    const v = Math.max(0, Math.min(100, Number(value)));
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
}
