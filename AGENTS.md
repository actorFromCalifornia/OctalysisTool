# Repository Guidelines

## General
- Отвечай только на русском языке.

## Project Structure & Module Organization
- `src/`: Application code. Organize by feature/module; keep files small and cohesive.
- `tests/`: Mirrors `src/` structure (one test module per source module).
- `assets/`: Static files (images, styles, seeds, fixtures).
- `docs/`: Architecture notes, ADRs, runbooks.
- `scripts/`: Developer/CI helper scripts.
- `Makefile` (optional): Common tasks (`build`, `test`, `lint`, `dev`).

## Build, Test, and Development Commands
- `make setup`: Install dependencies for local development.
- `make dev`: Start a local dev server or watcher.
- `make build`: Produce release artifacts.
- `make test`: Run the test suite.
- `make lint` / `make fmt`: Lint and auto-format the code.
If no `Makefile` exists, use the language’s native tools (examples): `npm ci && npm run test`, `pytest -q`, `go test ./...`.

## Coding Style & Naming Conventions
- Use language-standard formatters and linters (examples): Prettier/ESLint (JS/TS), Black/Ruff (Python), `go fmt`/`golangci-lint` (Go). No tabs; keep imports ordered.
- Naming: classes/types `PascalCase`; functions/variables `camelCase` (JS/TS) or `snake_case` (Python); files `kebab-case` for web assets, `snake_case.py` for Python.
- Keep functions focused; prefer composition over deeply nested logic. Document public APIs with concise docstrings/comments.

## Testing Guidelines
- Place unit tests in `tests/` mirroring `src/` (e.g., `tests/foo/test_bar.py`, `src/foo/bar.py`).
- Names: Python `test_*.py`; JS/TS `*.spec.ts` / `*.test.ts`.
- Target ≥ 80% line coverage for new/changed code. Avoid network calls; use fakes/fixtures.
- Run locally before pushing: `make test` (or `npm test`, `pytest`). Include at least one integration test for critical paths.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`. Subject in imperative mood (<72 chars). Example: `feat(auth): add PKCE flow`.
- PRs: link issues, summarize changes, note breaking changes/migrations, add screenshots/logs when UI/UX or DX is affected, and list verification steps.
- Requirements: passing CI, lint/format clean, updated tests/docs. Prefer small, focused PRs.

## Security & Configuration Tips
- Never commit secrets. Use `.env` locally and provide `.env.example` for required variables.
- Pin dependencies where possible and review new licenses. Rotate keys used in development fixtures.
- Document new config in `README.md` and keep sample values minimal but runnable.
