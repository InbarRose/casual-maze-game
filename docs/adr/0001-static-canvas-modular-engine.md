# 0001. Static Canvas 2D Engine with ES6 Modules

Date: 2026-08-30

## Status
Accepted

## Context
We need an accessible, low-latency, and zero-maintenance deployment model for a 2D puzzle maze game that can be instantly played on the web, shared via static links, and hosted at zero infrastructure cost on GitHub Pages with a custom domain (`casual-maze-game.inbarrose.com`).

## Decision
1. **Zero-Backend Architecture**: All game simulation, collision detection, and level editing run entirely in client-side JavaScript in the user's browser.
2. **Vanilla ES6+ Modules**: Code is modularized into cleanly decoupled native ES modules (`js/core/`, `js/engine/`, `js/entities/`, `js/levels/`, `js/editor/`) without requiring runtime bundlers or transpilers.
3. **HTML5 Canvas 2D Rendering**: Graphics are rendered on Canvas 2D contexts, utilizing viewport culling (`Camera.getViewportBounds()`) to ensure 60fps performance even on large labyrinths.
4. **Offline Fallback**: Standard campaign levels are available both as static JSON files (`levels/level_N.json`) and compiled into `js/levels/default-levels.js` to ensure reliable play even if file fetching is restricted.

## Consequences
### Positive
* Instant loading without server latency or maintenance overhead.
* 100% compatible with static GitHub Pages hosting.
* Clean separation of concerns across modules with low coupling.
* Highly testable logic using standard Node.js without browser emulation for math and logic.

### Negative / Trade-offs
* Assets and levels must be loaded via static fetch or embedded scripts.
* Persistent state is limited to client-side storage (`localStorage`, `sessionStorage`, URL params) and downloadable JSON files.
