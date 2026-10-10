# ADR-0020: Replay Theater In-Game Graphics Parity & Minimap Isolation

## Status
Accepted

## Date
2026-10-10

## Context & Problem Statement
When viewing solver walkthroughs or saved replay logs in `test.html` (or when launched from `maze.html` via "🎬 Watch Solver Walkthrough"), users experienced severe graphical corruption. Instead of seeing rich 2.5D in-game graphics (wall facades, textured floors, animated torches, fluid water/lava shaders, and character models), the replay canvas displayed a tiny, pixelated 2D radar stretched across the 800px viewport.

Investigation identified the root causes:
1. **Canvas Aliasing & Resolution Corruption**: In `ReplayPlayer._initGameLoop()`, `const minimap = this.minimapCanvas || this.canvas;` defaulted to passing the main game canvas as the `minimapCanvas` argument to `GameLoop`. The `Minimap` constructor forcibly executed `this.canvas.width = 180; this.canvas.height = 180;`, mutating the main $800 \times 600$ viewport down to $180 \times 180$.
2. **Render Loop Overwrite**: Every animation frame, `GameLoop.render()` rendered the complete scene to `mainCanvas`, but immediately followed by `this.minimap.render()`, which cleared the canvas (`ctx.fillRect(0, 0, 180, 180)`) and drew the 2D minimap radar directly over the main view.
3. **Asset Preload Desynchronization**: While `assetLoader.preloadTheme(...)` initiated vector SVG downloading, the replay loop did not trigger a re-render upon promise resolution, leaving fallbacks until an action ticked.
4. **Camera Viewport Calibration**: The camera was not explicitly resized to the replay canvas resolution ($800 \times 600$), and camera tracking did not center on player coordinates across seek and step events.

## Decision
1. **Isolate Minimap Canvas in `ReplayPlayer` and `GameLoop`**:
   - `ReplayPlayer` never falls back to `this.canvas`. When `options.minimapCanvas` is omitted, it supplies `null` (or a detached off-screen canvas in headless test harnesses).
   - `GameLoop` detects canvas aliasing (`if (mainCanvas && minimapCanvas === mainCanvas)`), logs a warning, and prevents `Minimap` from mutating `mainCanvas`.
   - `GameLoop.minimap` is nullable; all minimap interactions and renders safely execute only if `this.minimap` is present.
2. **Replay Theater Picture-in-Picture (PiP) Radar HUD**:
   - `test.html` mounts a dedicated `<canvas id="replay-minimap-canvas" width="180" height="180">` positioned in the bottom-right corner of `.viewport-box`.
   - A `🗺 Radar` toggle button in the replay toolbar allows users to show or hide the PiP minimap.
3. **Perspective Switching (2.5D Angled vs. Blueprint Top-Down)**:
   - Added `setPerspective(mode)`, `togglePerspective()`, and `getPerspective()` methods to `ReplayPlayer`.
   - Added a `📐 2.5D / Blueprint` toggle button in `test.html`'s playback toolbar.
4. **Theme Asset Preload & Reactive Re-render**:
   - In `test.html`, `assetLoader.preloadTheme(theme)` triggers `replayPlayer.gameLoop.render()` on promise resolution, ensuring vector SVG assets display immediately once decoded.
5. **Camera Bounds Calibration & Follow Snapping**:
   - `ReplayPlayer._initGameLoop()` invokes `this.gameLoop.camera.resize(this.canvas.width, this.canvas.height)`.
   - `ReplayPlayer._executeAction(action)` centers the camera on the player via `snapTo()` and updates player sprite facing direction (`facing`).

## Consequences
### Positive
- **Visual Fidelity**: Replay Theater renders 100% full in-game graphics with dynamic torches, 2.5D wall facades, fluid shaders, and character animations at crisp native $800 \times 600$ resolution.
- **Picture-in-Picture Overview**: Users can view both the rich game world and the high-level radar simultaneously.
- **Architectural Safety**: `GameLoop` and `Minimap` are defensively isolated against canvas aliasing and null pointers.
- **Zero Drift & Pure Static**: Remains 100% vanilla ES modules with zero backend or production npm dependencies.

### Negative / Trade-offs
- An additional DOM canvas element exists in `test.html` when PiP radar is visible.
