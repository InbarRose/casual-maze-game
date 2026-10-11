# ADR-0028: Discrete Stepped Viewport Zoom, Mobile Touch Navigation Modes, Top Activity Feed Docking & Streamlined Command HUD

## Status
Accepted

## Date
2026-10-11

## Context
Across diverse device form factors (mobile touchscreens, high-DPI displays, and desktop browsers), players encountered several friction points impacting gameplay clarity, visual stability, and responsive ergonomics:

1. **Continuous Floating-Point Zoom Jitter**:
   Prior viewport zooming permitted arbitrary fractional zoom floats (e.g., 0.8329x, 1.117x), producing subpixel tile boundaries, fuzzy pixel art edges, and camera centering drift relative to the character sprite. Zoom behavior also diverged between active play (`maze.html`), the level architect (`editor.html`), and the Replay Theatre (`test.html`).
2. **Replay Theatre Visual Clunkiness**:
   During playback in Replay Theatre (`test.html`), the player character maintained a static orientation regardless of travel direction, failing to reflect turn-by-turn cardinal heading ('north', 'south', 'east', 'west') and stride cadence.
3. **Mobile Touch Control Ambiguity (Pathfinding vs Steering)**:
   On mobile devices, tapping corridors did not consistently pathfind to target coordinates because touch drags and holds collided with click event dispatchers. Players lacked an explicit mechanism to toggle between **Tap to Move (BFS Pathfinding)** and **Press & Hold / Drag to Steer**.
4. **Mobile Activity Feed Occlusion**:
   On mobile viewports, the bottom-docked activity feed obstructed virtual movement controls, canvas touch interaction, and minimap controls.
5. **HUD Clutter and Button Overlap**:
   The upper HUD action row suffered from layout wrap on narrow viewports, causing action buttons (`#btn-minimap-min`, `#hud-btn-settings`, `#hud-btn-profile`) to overlap or shift unpredictably.

## Decisions

### 1. Unified Discrete Stepped Zoom Ladder
- Established a canonical discrete zoom step ladder in `VIEWPORT_ZOOM.STEPS = Object.freeze([0.5, 0.75, 1.0, 1.25, 1.5, 2.0])` with helper functions `getNextZoomStep()` and `snapToClosestZoomStep()`.
- Standard base tile width (36px) multiplied by these discrete steps produces integer or half-integer pixel dimensions (18, 27, 36, 45, 54, 72px), completely eliminating subpixel sprite shimmering.
- Unified zoom semantics and controls (`zoomIn()`, `zoomOut()`, `resetZoom()`, and wheel snapping) across:
  - **Live Gameplay Engine** (`js/engine/game-loop.js`, `js/engine/camera.js`)
  - **Architect Mode Studio** (`js/editor/editor-canvas.js`, `js/editor/editor-ui.js`)
  - **Replay Theatre** (`js/engine/replay-player.js`, `test.html`)
- Synchronized `player.setTileSize(size)` on zoom mutations so character world centering updates immediately without positional drift.

### 2. Authentic Replay Character Orientation & Cadence
- In `ReplayPlayer._executeAction()`, derived cardinal movement orientation from step vectors (`action.to.x - action.from.x`, etc.) and normalized aliases (`up` $\to$ `north`, `down` $\to$ `south`, `left` $\to$ `west`, `right` $\to$ `east`).
- Updated `Player.getScreenFacing()` to seamlessly normalize colloquial and cardinal directions with camera rotation offsets.
- Animated explorer stride cadence using `player.pulseTimer` on step execution while locking exact destination world coordinates (`isMoving = false`).

### 3. Mobile Touch Navigation Mode Toggle (Tap to Move vs Hold Steer)
- Introduced `GameLoop.toggleTouchNavigationMode()` supporting runtime switching between:
  - `MOUSE_MOVE_MODES.CLICK_PATH` (**Tap to Move**): Single tap calculates BFS pathfinding to target cell; red target feedback rings indicate unreachable barriers.
  - `MOUSE_MOVE_MODES.DRAG_ONLY` (**Hold & Steer**): Continuous directional steering with 24px threshold and interval repeat.
- Added `#btn-touch-mode-toggle` pill to the HUD with live icon and aria-label updates (`👆 Tap Move` vs `🕹️ Hold Steer`).
- Separated pointerdown touch handling from mouse clicks to prevent premature moves and duplicate invocations.

### 4. Top Docking & Draggable Header for Mobile Activity Feed
- Refactored `.game-activity-feed` on mobile viewports ($\le 768\text{px}$) to dock from the top (`top: 4.5rem; bottom: auto;`), keeping bottom virtual controls clear.
- Added pointer and touch dragging to `#activity-feed-header`, enabling players to reposition the feed freely across the viewport.

### 5. Streamlined Action Cluster & Wrap Prevention
- Consolidated action buttons in `maze.html` into a streamlined `.hud-action-cluster` preserving all semantic identifiers.
- Added `flex-wrap: nowrap` on `.game-hud-top` to guarantee the minimap collapse button (`#btn-minimap-min`) is never occluded or overlapped.

### 6. Semantic Version Increment
- Incremented system semantic version to `v1.21.0` across `package.json`, `js/core/version.js`, `test.html`, and project documentation.

## Consequences

### Positive
- Crisp pixel art rendering across all zoom levels without subpixel jitter.
- Replay Theatre presentations authentically show explorer turns and stride animations.
- Mobile players have total control over whether taps pathfind or touches steer.
- Bottom virtual controls and canvas interactables are completely unobstructed on small screens.
- Full backwards-compatible test coverage (669 tests passing, 0 failed, including headless browser E2E).

### Negative / Trade-offs
- Continuous arbitrary floating-point pinch-to-zoom is snapped to discrete steps on gesture end (a deliberate design choice for pixel clarity).
