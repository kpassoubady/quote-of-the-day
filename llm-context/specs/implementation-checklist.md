# Inspiria Implementation Checklist

Use this checklist to track feature improvements over time.

## Immediate Wins (Usability)

- [x] Add favorites search by quote text
- [x] Add favorites filter by author
- [x] Add keyboard shortcuts: `N` (next), `F` (favorite), `Space` (pause/resume)
- [x] Add clearer focus states for keyboard navigation
- [x] Add ARIA labels for all interactive controls
- [x] Add screen-reader announcement when quote changes
- [x] Add quote length filter (short/medium/long)
- [x] Add "Back to current quote" action from favorites view

## Immediate Wins (Performance & Reliability)

- [ ] Fix CSP to allow required Google Fonts and favicon sources
- [ ] Add lightweight `/health` endpoint
- [ ] Add client-side quote cache with TTL (sessionStorage/localStorage)
- [ ] Reduce repeated DOM work in quote transition flow
- [ ] Add API timeout and retry strategy in frontend fetch
- [ ] Add graceful fallback when external background images fail

## Immediate Wins (Feature Additions)

- [ ] Add daily quote mode (stable quote for 24 hours)
- [ ] Add random mode toggle (daily vs random)
- [ ] Add export favorites as JSON
- [ ] Add export favorites as plain text
- [ ] Add category tags to quotes (motivation, life, productivity, etc.)
- [ ] Add category filter UI
- [ ] Add author detail drawer/modal (short bio + related quotes)

## Product Polish

- [ ] Replace loader-only experience with content skeletons
- [ ] Add undo action after removing a favorite
- [ ] Add temporary "Copied" state on copy button
- [ ] Add minor transition variants for quote cards
- [ ] Add empty-state polish and contextual helper text

## Testing & Quality

- [ ] Add Playwright smoke test: app loads and first quote appears
- [ ] Add Playwright smoke test: next quote changes content
- [ ] Add Playwright smoke test: favorite add/remove works
- [ ] Add Playwright smoke test: copy-to-clipboard action
- [ ] Add Playwright smoke test: favorites view renders saved items
- [ ] Add API route tests for `/api/quotes`, `/api/quotes/random`, and `/health`

## Suggested First Sprint Scope

- [ ] CSP fixes + accessibility baseline
- [ ] Favorites search/filter + keyboard shortcuts
- [ ] Daily quote mode + favorites export
- [ ] Core Playwright smoke tests

## Notes

- Keep this file as the single source of truth for implementation progress.
- Convert completed checklist groups into release notes after shipping.
