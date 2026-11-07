# Spec 01 Acceptance Coverage (for `06-coverage.md`)

## Test file(s) added
- `mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx`

## Coverage report

| AC # | Status | Rationale | Evidence |
|---|---|---|---|
| 1 | UNCOVERED | Automated test proves shell+Home render, but criterion explicitly requires clean run on **both iOS and Android simulators**, which was not executable in this environment. | `mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx:18-44` (partial), simulator requirement uncovered |
| 2 | PASS | Validates dev/prod env URLs are both accepted and used to build API targets without screen-level changes. | `mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx:46-60` |
| 3 | PASS | Runtime screen throw is caught by app-level boundary and fallback UI is shown. | `mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx:62-84` |
| 4 | PASS | Global loader is shown during bootstrap and removed after ready state. | `mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx:18-40` |
| 5 | PASS | App opens to Home route on startup and after remount (restart simulation). | `mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx:86-112` |
| 6 | PASS | Missing env and invalid env both show clear user-visible config error UI with field context. | `mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx:114-174` |

## FAIL items (owner + gap)
- None.

## Untestable / uncovered criteria
- **AC1** (simulator parity): requires manual/device-level iOS+Android simulator execution; current run only validates via Jest renderer.

## Test run output

### Acceptance file run
- Command: `cd mobile && npm test -- tests/acceptance/spec01.app-shell.acceptance.test.tsx`
- Result: **PASS**
- Counts: **1 suite, 6 tests passed**

### Full mobile suite run
- Command: `cd mobile && npm test`
- Result: **PASS**
- Counts: **10 suites passed, 19 tests passed, 0 failed**
