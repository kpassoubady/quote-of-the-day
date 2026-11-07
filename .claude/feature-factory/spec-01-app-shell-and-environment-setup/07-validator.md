## Critical
- None.

## Important

1. **`mobile/tests/acceptance/spec01.app-shell.acceptance.test.tsx:18`** — AC1 remains unverified because coverage is Jest-renderer only and does not prove clean launch on both iOS and Android simulators.  
   - **Violates:** Story AC1 (`02-story.md:30`) and Brief test requirement #1 (`03-spec.md:114`).  
   - **Recommended action:** Add on-disk manual verification evidence (or simulator-based test artifacts) for both iOS and Android startup.

2. **`mobile/src/app/navigation/RootNavigator.tsx:1`** — The “navigator” is currently a static `View` + label, not an actual navigation container/root, so AC5 is only weakly satisfied by text rendering.  
   - **Violates:** Story AC5 (`02-story.md:34`) and Brief frontend change requirement for a “root navigation container” (`03-spec.md:99`, `03-spec.md:156`).  
   - **Recommended action:** Align implementation vs brief intent (either upgrade to a real nav root in follow-up or explicitly revise brief/story wording).

3. **`README.md:58`** — Documentation only describes `EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL` and does not document the requested user-facing intent key `REACT_NATIVE_API_BASE_URL`.  
   - **Violates:** Brief env-doc requirement (`03-spec.md:105-107`) and resolved decision on key naming intent (`03-spec.md:10`).  
   - **Recommended action:** Update spec/docs alignment so both intent key and Expo runtime key expectations are explicitly documented.

4. **`05-frontend-summary.md:7`** — Files were added outside the brief’s file-level change plan (e.g., `mobile/.gitignore`, `mobile/package-lock.json`, multiple `*.test.*` files), but the plan in `03-spec.md` does not list them.  
   - **Violates:** Brief file-level change plan (`03-spec.md:140-166`) under scope control expectations.  
   - **Recommended action:** Reconcile scope formally (update brief plan or trim unplanned additions).

## Minor
- None.
