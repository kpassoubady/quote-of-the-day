# 1) Feature area summary

The current repo is a Node/Express + static web app (no React Native app exists yet): `server.js` serves a browser UI from `public/`, exposes quote APIs (`/api/quotes`, `/api/quotes/random`, `/health`), and the frontend (`public/app.js`) already implements app-shell-like concerns (global loading spinner, global error panel, and simple view navigation between Home/Favorites).

# 2) Relevant files

- `server.js` — Express app entrypoint; defines API contracts the mobile app must call; used by `npm start`/`npm dev`.
- `package.json` — root toolchain/scripts (`start`, `dev`, `demo:quotes`), dependency baseline (Express/CORS/Helmet, Playwright dev dep).
- `README.md` — documents current architecture and explicitly references `/api/quotes` caching behavior.
- `public/app.js` — current client integration pattern for backend calls (`fetch('/api/quotes')`), global loading/error handling, and navigation-style view switching.
- `public/index.html` — current app shell structure (navbar/main/footer), fallback error UI container, loading spinner container.
- `scripts/generate-quote-demo.mjs` — Playwright automation that depends on existing web selectors and running backend; closest thing to executable UI validation.
- `llm-context/specs/react-native-feature-factory-specs.md` — feature spec source for Spec 01–10.
- `llm-context/docs/react-native-dev-tools-install-guide.md` — in-repo RN setup guidance (simulators/emulators, env variables, suggested config/module split for API base URL).
- `.agenthub-config.yaml` — **missing** (no backend/frontend/test folder hints available).

## Backend API endpoints/contracts for initial integration

From `server.js`:

- `GET /api/quotes`
  - Success `200`:
    - Header: `X-Cache: HIT|MISS`
    - Body:
      ```json
      {
        "success": true,
        "source": "cache|database",
        "count": 15,
        "quotes": [{ "id": 1, "text": "...", "author": "..." }]
      }
      ```
  - Error `500`:
    ```json
    {
      "success": false,
      "error": "Internal Server Error",
      "message": "Unable to retrieve quotes at this time."
    }
    ```

- `GET /api/quotes/random`
  - Success `200`:
    ```json
    { "success": true, "quote": { "id": 1, "text": "...", "author": "..." } }
    ```
  - Not found `404`:
    ```json
    { "success": false, "error": "Not Found", "message": "No quotes available." }
    ```
  - Error `500`:
    ```json
    { "success": false, "error": "Internal Server Error", "message": "An unexpected error occurred." }
    ```

- `GET /health`
  - Success `200`:
    ```json
    { "success": true, "status": "ok", "uptime": 123, "timestamp": "ISO-8601" }
    ```

# 3) Patterns to follow

- Centralized async fetch with one entry path (`fetchQuotes`) and `try/catch`-based user-facing fallback (`showError(...)`) rather than silent failures.
- Separate UI state toggles for loading/success/error (`showSpinner`, `hideSpinner`, `showError`, `hideError`).
- API success envelope pattern uses `success: true/false` plus explicit `error`/`message` fields on failures.
- Environment-driven runtime config already used for server port (`process.env.PORT || 3000`), indicating config-over-hardcode convention.
- Root repo uses ESM (`"type": "module"`), not CommonJS.
- Current project automation is script-driven from `package.json`; no monorepo/mobile workspace conventions are present yet.

# 4) Similar features

- **Global loading + global error fallback in existing UI**
  - `public/app.js` (`fetchQuotes`, `showSpinner`, `showError`, retry button handler)
  - `public/index.html` (`#loading-spinner`, `#error-container`, `#retry-btn`)
  - Structure: one app-level fetch path controls loading/error state for the main screen.

- **Navigation root analogue**
  - `public/app.js` (`showMainView`, `showFavoritesView`, nav event bindings)
  - `public/index.html` (`#nav-home`, `#nav-favorites`, `#home-view`, `#favorites-view`)
  - Structure: single root shell toggling between top-level views.

# 5) Risks

- **Tenant isolation**
  - No tenant model exists (single in-memory quote list). Risk if multi-tenant needs emerge later: no request scoping patterns currently in place.

- **Timezones**
  - `/health` returns `new Date().toISOString()`; no “quote of the day by timezone” logic exists yet. Risk for future day-boundary behavior.

- **Retry / idempotency**
  - Current client call pattern is single-attempt fetch with manual retry button only; no automatic retry/backoff conventions yet.

- **Secrets**
  - No secret management conventions found; current backend does not require API keys. Risk when adding env-based mobile config: avoid committing prod endpoints/secrets into source.

- **Migrations**
  - No DB layer/migration system present (in-memory array only). If persistence is added later, migration conventions are currently absent.

- **Other**
  - React Native codebase is not initialized in this repo yet (Spec 01 starts from zero mobile scaffold).
  - `.agenthub-config.yaml` missing, so folder/test boundary hints are unavailable.
  - CLAUDE.md missing, so no project-level mandatory coding rules were discoverable.

# 6) Tests likely to need updates

- `scripts/generate-quote-demo.mjs` — existing UI automation may need separation/guarding if repo adds RN app structure.
- `package.json` scripts section — no formal test command currently; test entrypoints will need to be introduced for RN simulator validation.
- No `tests/`, `test/`, or `__tests__` folders currently present in repository snapshot.

# 7) CLAUDE.md rules that apply

CLAUDE.md is missing in this worktree, so there are no project rules to quote.

> `Path /Users/kangs/code/github/quote-of-the-day.worktrees/agents-react-native-feature-factory-dev-setup/CLAUDE.md does not exist. Please provide a valid path.`

# 8) Open questions

- Should the React Native app live in this repo root or as a subfolder/workspace alongside the existing web app?
- Should mobile consume `/api/quotes` (full list) or `/api/quotes/random` for initial Home placeholder behavior in Spec 01?
- What should be the canonical dev/prod API base URLs for mobile (none are defined in current code/docs as concrete values)?
- Is existing Playwright automation expected to remain for web only, or should mobile test tooling be added in parallel?
