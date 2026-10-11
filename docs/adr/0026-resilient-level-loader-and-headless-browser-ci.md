# ADR-0026: Resilient Level Loader Strategy, Fallback Watchdog, and Headless Browser CI Gating

## Status
Accepted

## Context
During local playtesting and hub navigation, players occasionally reported that levels remained stuck at `"Loading..."` without starting or launching the game canvas. Investigation identified several contributing factors:
1. **Blind Sequential Remote Fetching**: `LevelLoader.loadFromParams()` previously looped through up to 17 sequential remote JSON URL candidates one by one. For late campaign chapters (e.g. Chapter 8), the loader made 7–8 consecutive 404 network fetch requests before attempting the correct chapter directory. Any network latency, packet loss, or hanging request could stall the initialization promise indefinitely.
2. **File Protocol (`file://`) Browser Security Restrictions**: Modern web browsers (Chromium, Edge, Safari) strictly block ES6 JavaScript module imports (`<script type="module">`) on the `file://` protocol due to Cross-Origin Resource Sharing (CORS) rules. When users opened `index.html` or `maze.html` directly from their filesystem, the module scripts failed to load silently without presenting any actionable feedback to the user, leaving the title stuck at `"Loading..."`.
3. **Absence of Headless E2E Browser Testing in CI**: The test suite previously ran purely within a mock Node.js environment or static unit tests without validating the complete real-browser lifecycle (Hub navigation $\to$ level pill click $\to$ canvas boot $\to$ live physics & step counters) inside GitHub Actions CI.

## Decision
1. **Deterministic Level Loader Routing**:
   - Refactored `LevelLoader.loadFromParams()` to calculate the expected chapter directory mathematically (`expectedChapter = Math.ceil(levelId / 4)`) for campaign levels, directly prioritizing `levels/chapter_${expectedChapter}/level_${id}.json`.
   - Wrapped all network fetch operations in an `AbortSignal.timeout(1500)` guard to prevent network stalls from hanging the game.
   - Guaranteed immediate fallback to in-memory embedded definitions (`CAMPAIGN_LEVELS`, `TUTORIAL_LEVELS`, `STORYLINES`) upon network failure or timeout.
2. **Graceful `file://` Protocol Guard & Loading Watchdog**:
   - Added pre-flight non-module diagnostic scripts in `index.html` and `maze.html`.
   - Detects `window.location.protocol === 'file:'` immediately and renders a glassmorphic guidance modal explaining modern browser CORS restrictions and providing exact instructions (`npm start` or `python -m http.server 8000`).
   - Implemented an initialization watchdog in `maze.html`: if `hud-level-title` remains `"Loading..."` or `window.gameLoop` is uninitialized after 4 seconds, the game surfaces a floating recovery dock with **Retry** and **Return to Hub** actions.
   - Hoisted initial level title assignment immediately upon `LevelLoader` resolution so the HUD updates before rendering subsystems finish mounting.
3. **Zero-Dependency Headless Browser E2E Test Suite & CI Gate**:
   - Implemented `tests/e2e/headless-hub-and-gameplay.test.mjs` and runner `tests/suites/e2e.mjs` using the Chrome DevTools Protocol (CDP) and native WebSockets.
   - Cross-platform browser discovery automatically detects Google Chrome, Chromium, or Microsoft Edge on Windows, Linux, and macOS.
   - Automatically executes:
     - Hub navigation across all 3 mode switcher tabs (`Campaign`, `Stories`, `Architect`).
     - Level selection from Hub to `maze.html?id=1`.
     - Live gameplay movement execution, step registration, and timer progression.
     - Multi-mode entry verification across Tutorials, Story Quests, and Campaign chapters.
   - Added `npm run test:e2e` to `.github/workflows/ci.yml` as a mandatory automated quality gate on all Pull Requests and pushes to `main`.

## Consequences
- **Positive**:
  - Zero stall guarantee: levels load deterministically with instant fallback and watchdog recovery.
  - Users running locally via `file://` receive clear, helpful guidance instead of a blank or stalled screen.
  - Every Pull Request to `main` is gated by real headless browser navigation and gameplay verification.
  - Zero runtime dependencies added; maintains 100% static GitHub Pages architecture.
- **Negative**:
  - E2E headless test suite adds ~8–10 seconds to full master test runs when Chrome/Chromium is installed.
