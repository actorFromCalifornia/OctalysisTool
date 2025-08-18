# План реализации Octalysis Tool (Angular)

## Обзор и цели
На основе PRD_Octalysis_Angular: локальная (offline) SPA на Angular с визуализацией 8 Core Drives, полная русификация, экспорт (PNG/SVG/PDF), хранение в Local Storage, современный адаптивный UI с тёмной/светлой темами.

## Архитектура и стек
- Angular 17+ (standalone-компоненты), RxJS; состояние через сервисы с `BehaviorSubject` (возможна миграция на NgRx при росте сложности).
- Визуализация: D3 для радиальной (radar/spider) диаграммы; допускается `ngx-charts` для вспомогательных графиков.
- Локализация: Angular i18n (`messages.xlf`, locale `ru`).
- Стили: SCSS + CSS Variables для тем.
- Хранение: `localStorage`; экспорт: `html2canvas` + `jsPDF`, а также экспорт SVG/PNG из D3.

## Структура проекта
- `src/app/core/`: конфигурация i18n/тем, сервисы: `StorageService`, `ThemeService`.
- `src/app/shared/`: UI-атомы (кнопки, слайдеры), пайпы, директивы.
- `src/app/features/assessment/`: слайдеры 8 драйверов, подсказки, обзор сильных/слабых сторон.
- `src/app/features/chart/`: компонент `RadarChartComponent` (D3, отзывчивый layout).
- `src/app/features/export/`: сервис и UI для PNG/SVG/PDF.
- `src/app/features/settings/`: пресеты, сброс, импорт/экспорт JSON.
- `assets/i18n/`: ресурсы перевода (если используем runtime-подход); иначе `messages.ru.xlf`.

## Этапы (milestones)
1) Инициализация (0.5–1 дн): каркас Angular, SCSS, темы, lint/format, CI.
2) Модель и ввод (1–2 дн): типы Core Drives, слайдеры, реактивное состояние, сохранение в `localStorage`.
3) Диаграмма (1–2 дн): `RadarChartComponent` на D3, адаптивность, легенда, тултипы.
4) Аналитика (0.5–1 дн): вычисление сильных/слабых сторон, рекомендации (статические текстовые шаблоны).
5) Экспорт (1 дн): PNG/SVG/PDF, проверка качества изображений и шрифтов.
6) i18n и темы (0.5 дн): полный RU, переключение тем, аудит контраста.
7) QA и кроссбраузер (0.5–1 дн): тесты, перфоманс, офлайн-проверка; опционально `ng add @angular/pwa`.

## Команды и зависимости
- Создание проекта: `npx @angular/cli@17 new octalysis-tool --style=scss --routing=false --ssr=false`.
- Запуск/сборка/тесты: `npm start` / `npm run build` / `ng test`.
- Пакеты: `npm i d3 html2canvas jspdf` (+ опц. `ngx-charts`, `@ngrx/store @ngrx/effects`).
- i18n: `ng extract-i18n --format xlf` → правка `messages.xlf` → сборка `ng build --localize` (или runtime i18n через `assets/i18n`).

## Тестирование и качество
- Unit: `ng test`, покрытие ≥80% для новых модулей (основная логика расчётов и рендер графика).
- E2E: критические сценарии (ввод → график → экспорт → восстановление из `localStorage`).
- Линт/формат: включить ESLint + Prettier; проверять на CI.

## Критерии приёмки
- Полное RU i18n; корректная радиальная диаграмма с живым обновлением.
- Данные сохраняются локально; экспорт в PNG/SVG/PDF без артефактов.
- Адаптивность и базовая доступность (клавиатура, контраст). Поддержка Chrome/Firefox/Edge/Safari.

## Риски и меры
- Точность экспорта: тестирование dpi/шрифтов → fallback SVG → PNG.
- Перфоманс D3: минимизировать перерисовки, мемоизация масштабов и путей.
- Доступность: aria-атрибуты для слайдеров и альтернативные текстовые сводки к графику.
