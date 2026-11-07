STATUS: APPROVED

# Spec 01 Technical Brief (Revised)

## Resolved decisions from checkpoint feedback

1. **Repo structure:** Keep monorepo; create mobile app under `mobile/`. Keep boundaries clean so mobile can be moved to a separate repo later.
2. **Endpoint direction:** Future Home quote fetch should target `GET /api/quotes/random`, but **do not implement quote fetch flow in Spec 01**.
3. **Production domain:** Use `https://kavinschool.com` as canonical production API base host for AC2 validation.
4. **Env config naming + validation:** Respect requested env intent with `REACT_NATIVE_API_BASE_URL`, but because Expo runtime only exposes `EXPO_PUBLIC_*`, Spec 01 will validate **`EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL`** in app shell and show a clear user/developer-visible error when invalid/missing.
5. **Tooling:** Expo is approved and selected.
6. **Testing scope:** Keep existing Playwright as web-only; mobile Spec 01 verification is manual (Detox/Appium deferred).
7. **Root scripts:** Minimal approach: do not add root wrapper scripts in Spec 01; run mobile commands inside `mobile/`.

## Canonical API base URL recommendation (dev/prod)

| Environment | Recommended base URL | Notes |
|---|---|---|
| Development | `http://localhost:3000` | Local Express server from repo root. |
| Production | `https://kavinschool.com` | Canonical host for AC2 validation. |

**Mobile env key used by app runtime validation:**  
`EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL` (absolute `http(s)` URL, no trailing slash required).

---

## 1) Data model changes

- **Database/schema/indexes:** No changes.
- **Migrations:** None.
- **Up/Down notes:** N/A (Spec 01 is app shell/config only).

---

## 2) Process / background flow

1. App starts (`mobile/App.tsx`).
2. App enters bootstrap `loading` state and shows full-screen loader.
3. Runtime config loader reads `process.env.EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL`.
4. Validator checks:
   - present and non-empty
   - valid absolute URL
   - protocol is `http:` or `https:`
5. If validation fails:
   - transition to `config_error`
   - render Config Error screen with field name + fix hint
6. If validation passes:
   - transition to `ready`
   - render navigation root, initial route = `Home`
7. Any unhandled render-time screen error is caught by app error boundary and fallback UI is shown.

---

## 3) API changes

### Backend API (server)
- **No endpoint changes in Spec 01.**
- Future direction (not implemented here): mobile Home quote flow will use `GET /api/quotes/random`.

### Frontend internal API contract (Spec 01)

```ts
type BootstrapState =
  | { status: "loading" }
  | { status: "ready"; config: RuntimeConfig }
  | { status: "config_error"; error: ConfigError };

interface RuntimeConfig {
  apiBaseUrl: string; // absolute http/https URL
}

interface ConfigError {
  code: "CONFIG_MISSING" | "CONFIG_INVALID_URL";
  field: "EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL";
  message: string;
  hint: string;
}
```

### Error shape (UI-facing)
```json
{
  "code": "CONFIG_INVALID_URL",
  "field": "EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL",
  "message": "Invalid API base URL.",
  "hint": "Set EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL in .env and restart Expo."
}
```

---

## 4) Frontend changes

- Add Expo React Native app in `mobile/` (TypeScript).
- Keep all shell logic centralized in app root; screens must not read env vars directly.
- Add:
  - app root bootstrap state handler (`loading` / `ready` / `config_error`)
  - app-level error boundary fallback
  - root navigation container with Home as initial route
  - placeholder Home screen
  - config error screen
  - runtime config validator module
  - API client base URL utility only (no quote-fetch UX in Spec 01)
- Env docs/examples:
  - document user-facing intent key (`REACT_NATIVE_API_BASE_URL`)
  - enforce Expo-safe runtime key (`EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL`)

---

## 5) Tests required

> Mobile for Spec 01 is manual validation; Playwright remains web-only.

1. **Launch smoke (iOS + Android)** — app opens and shows shell/Home placeholder. **[AC1]**
2. **Environment base URL switch test** — dev build uses dev URL, prod build uses prod URL without screen code changes. **[AC2]**
3. **Error boundary fallback test** — trigger a screen throw and verify app fallback UI appears (no freeze/crash screen). **[AC3]**
4. **Global loading visibility test** — loader appears during bootstrap and disappears when ready. **[AC4]**
5. **Navigation start route test** — cold start/restart always lands on Home route. **[AC5]**
6. **Missing env test** — unset env variable; verify clear config error UI. **[AC6]**
7. **Malformed env URL test** — set invalid URL (e.g., `ftp://...` or malformed); verify clear config error UI. **[AC6]**

(Keep existing web Playwright flow unchanged as regression safety for existing web app.)

---

## 6) Risks and open questions

### Risks
- **Expo env constraint risk:** non-`EXPO_PUBLIC_*` vars are not safely available at runtime; must enforce Expo-prefixed key.
- **Tenant isolation:** no tenant model exists; do not introduce tenant state in Spec 01.
- **Timezone:** no timezone/day-boundary logic in Spec 01; keep out.
- **Retry behavior:** no automatic retry/backoff in Spec 01; avoid implying retry policy.
- **Scope creep risk:** avoid implementing quote fetch/display flow in this spec.

### Open questions
- **None blocking after checkpoint feedback.** Proceed within current scope.

---

## 7) File-level change plan

### Edit
- `README.md` — add mobile setup/run/env validation instructions for Spec 01.
- `.gitignore` — ignore Expo/mobile artifacts.

### Add
- `mobile/package.json` — Expo mobile workspace dependencies and scripts.
- `mobile/package-lock.json` — lockfile for reproducible mobile dependency installs.
- `mobile/.gitignore` — ignore mobile-local artifacts.
- `mobile/app.json` — Expo app metadata/config.
- `mobile/babel.config.js` — Expo Babel config.
- `mobile/tsconfig.json` — TypeScript config for mobile app.
- `mobile/index.ts` — Expo app entry registration.
- `mobile/App.tsx` — root app mount.
- `mobile/.env.example` — env template with `EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL`.
- `mobile/src/app/AppRoot.tsx` — bootstrap state orchestration.
- `mobile/src/app/AppErrorBoundary.tsx` — app-level runtime fallback boundary.
- `mobile/src/app/navigation/RootNavigator.tsx` — navigation root with Home initial route.
- `mobile/src/config/runtimeConfig.ts` — env read + strict validation logic.
- `mobile/src/config/types.ts` — runtime config/bootstrap types.
- `mobile/src/screens/HomeScreen.tsx` — placeholder Home screen.
- `mobile/src/screens/ConfigErrorScreen.tsx` — clear env error UI.
- `mobile/src/components/FullScreenLoader.tsx` — global loading indicator.
- `mobile/src/components/FallbackErrorScreen.tsx` — fallback UI for unhandled runtime errors.
- `mobile/src/api/client.ts` — base URL client helper and future `/api/quotes/random` path anchor (no fetch flow yet).
- `mobile/src/testUtils.ts` — shared RN test tree text helper.

### Add (tests)
- `mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx` — Spec 01 acceptance assertions.
- `mobile/src/api/client.test.ts` — API URL builder unit tests.
- `mobile/src/app/AppErrorBoundary.test.tsx` — app boundary behavior tests.
- `mobile/src/app/AppRoot.test.tsx` — bootstrap state transition tests.
- `mobile/src/app/navigation/RootNavigator.test.tsx` — initial route tests.
- `mobile/src/components/FallbackErrorScreen.test.tsx` — fallback UI render tests.
- `mobile/src/components/FullScreenLoader.test.tsx` — loader render tests.
- `mobile/src/config/runtimeConfig.test.ts` — env validation tests.
- `mobile/src/screens/ConfigErrorScreen.test.tsx` — config error UI tests.
- `mobile/src/screens/HomeScreen.test.tsx` — Home placeholder render tests.

### Remove
- None.
