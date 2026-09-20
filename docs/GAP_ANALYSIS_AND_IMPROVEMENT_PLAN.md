# Gap Analysis & Improvement Remediation Plan

This document details the technical root-cause investigation, architectural diagnosis, and phased remediation plan for all user-identified gaps and backlog items across the engine, editor, rendering pipeline, inputs, and level layouts.

---

## 1. Executive Summary of Identified Gaps

| # | Gap / User Feedback | Priority | Root Cause Diagnosis | Remediation Status |
| :-: | :--- | :---: | :--- | :--- |
| **1** | **Test / Replay is not working** | **P0** | `test.html` imports `ALL_LEVELS` from `default-levels.js`, which only exported `TUTORIAL_LEVELS` and `CAMPAIGN_LEVELS`. Script crashed on page load with module `SyntaxError`. | **Fixed in Phase 1** |
| **2** | **Rotation breaks levels (bridges & walls)** | **P0** | Inverted bridge direction logic in `renderer.js` (`dir = isRotated90or270 ? 'EW' : 'NS'`) drew horizontal bridges as vertical decks; wall painter depth was not sorted by screen-Y. | **Fixed in Phase 1** |
| **3** | **Levels repeated / larger scale clones** | **P0** | Chapters 1 & 2 used corner-to-corner spawns/exits with generic corridor scaling (+2 or +4) without Kishōtenketsu progression. | **Workshopping Chapters 1 & 2** |
| **4** | **Obstacles can be circumvented** | **P0** | Lack of strict chokepoint verification in legacy levels allowed perimeter skips around locked gates. | **Enforcing 0-Bypass Regression Tests** |
| **5** | **No Profile / Settings / Audio toggles** | **P1** | `ProfileModal` and `SettingsModal` were implemented in `js/ui/`, but `initAppHeader()` was not mounted in `maze.html`, and audio gain was not connected to real-time sliders. | **Wired & Documented** |
| **6** | **Assets not up to date** | **P1** | Rich SVG vector catalog in `assets/` was never wired into `renderer.js` Canvas 2D drawing pipeline (used procedural primitives instead). | **Backlog Milestone v1.19** |
| **7** | **Mobile not working well** | **P1** | Canvas touch gestures triggered page scrolling; virtual D-pad overlapped top HUD islands on screens <380px. | **Backlog Milestone v1.19** |
| **8** | **Editor hard to use** | **P2** | Missing keyboard shortcuts (layer toggle, erase mode), missing drag-to-paint smoothing, and lack of visual layer indicators. | **Backlog Milestone v1.20** |

---

## 2. In-Depth Root Cause & Technical Remediation Plans

### Gap 1: Test / Replay Player Crash
* **Diagnosis**:
  In `test.html` line 464:
  ```javascript
  import { ALL_LEVELS } from './js/levels/default-levels.js';
  ```
  `js/levels/default-levels.js` only exported `TUTORIAL_LEVELS` and `CAMPAIGN_LEVELS`. When loaded in the browser, modern ES module loaders immediately halt execution with:
  `SyntaxError: The requested module './js/levels/default-levels.js' does not provide an export named 'ALL_LEVELS'`.
  This prevented the entire Replay Theater, Test Runner, and Diagnostics tab from running.
* **Remediation**:
  1. Export `ALL_LEVELS` in `js/levels/default-levels.js`:
     ```javascript
     export const ALL_LEVELS = Object.freeze([
       ...TUTORIAL_LEVELS,
       ...CAMPAIGN_LEVELS,
       ...getAllStoryLevels(),
     ]);
     ```
  2. In `js/engine/replay-player.js`, replace hardcoded `32` coordinates with `this.gameLoop.tileSize` for multi-resolution level support.

---

### Gap 2: Camera Rotation Visual Distortion (Bridges & Walls)
* **Diagnosis**:
  1. **Bridge Deck Inversion**: In `js/engine/renderer.js` lines 603–608:
     ```javascript
     if (overTile === TILES.BRIDGE_EW || gTile === TILES.BRIDGE_EW) {
       const dir = isRotated90or270 ? 'EW' : 'NS'; // BUG: at 0 deg, uses 'NS'!
       this.renderBridgeSpan(ctx, dir, screen.x, screen.y, tileSize, theme);
     }
     ```
     At 0° rotation (`isRotated90or270 === false`), an East-West bridge (`BRIDGE_EW`) was rendered with `dir = 'NS'`, drawing vertical railings and horizontal planks across an East-West corridor!
  2. **Wall Painter Order**: `renderAngledWalls` looped `for (y) for (x)` in world order. At 180° or 90°/270°, background walls were drawn after foreground walls, occluding drop facades.
* **Remediation**:
  1. Correct bridge direction mapping:
     ```javascript
     const dir = isRotated90or270 ? 'NS' : 'EW';
     ```
  2. In `renderAngledWalls`, sort wall drawables by `screen.y` ascending (painter's algorithm) under non-zero camera rotations.

---

### Gap 3 & 4: Level Repetition & Obstacle Circumvention
* **Diagnosis**:
  - Chapter 1 (Levels 1–4) and Chapter 2 (Levels 5–8) followed an identical formula:
    - Spawn at top-left `(1, 1)`.
    - Exit at bottom-right `(W-2, H-2)`.
    - Dimensions systematically scaled (+2 or +4) without changing spatial structure or introducing the 4-stage *Kishōtenketsu* progression.
  - Several legacy corridors allowed bypassing key rooms entirely.
* **Remediation**:
  1. Establish [Level Design Philosophy](LEVEL_DESIGN_PHILOSOPHY.md) and [Level Audit Rubric](LEVEL_AUDIT_RUBRIC.md).
  2. Handcraft Chapters 1 & 2 from scratch with non-corner spawns/exits, varied room footprints (courtyards, twin wings, grand naves), and strict 0-bypass gating.
  3. Enforce automated regression testing (`tests/unit/levels/chapter-1-and-2-redesign.test.mjs`) asserting that removing any required entity prevents reaching the exit.

---

### Gap 5: In-Game Profile, Settings & Audio Wiring
* **Diagnosis**:
  - `app-header.js`, `profile-modal.js`, and `settings-modal.js` were built in `v1.17.0` and mounted on `index.html`, `editor.html`, and `test.html`.
  - However, in `maze.html`, `initAppHeader()` was not called because `maze.html` uses an in-game HUD overlay instead of the standard page header.
  - While `GameMenu` wired `#btn-pause-settings` and `#btn-pause-profile`, players who looked for these controls during active gameplay without entering the pause menu could not locate them.
* **Remediation**:
  1. Ensure `maze.html` top-left HUD island includes direct profile codename pill and quick-settings gear icon alongside pause menu.
  2. Wire audio slider changes in `SettingsModal` directly to `audioFX.setMasterVolume()`, `audioFX.setSfxVolume()`, and `audioFX.setBgmVolume()`.

---

### Gap 6: SVG Asset Utilization & Visual Modernization (Milestone v1.19)
* **Diagnosis**:
  - The repository contains a complete SVG vector catalog in `assets/` (keys, doors, levers, teleporters, checkpoints, gems, torches).
  - `GameRenderer` in `js/engine/renderer.js` currently draws entities using 2D canvas drawing commands and emoji text overlays.
* **Remediation (Milestone v1.19)**:
  1. Enhance `js/core/asset-loader.js` to pre-render SVG assets onto off-screen canvas buffers.
  2. Update `renderYSortedEntities` to draw cached SVG sprites for keys, doors, levers, and relics, providing crisp, modern vector graphics at any resolution.
  3. Add radial light vignetting and ambient floor drop shadows.

---

### Gap 7: Mobile & Touch Ergonomics (Milestone v1.19)
* **Diagnosis**:
  - On iOS Safari and Chrome Mobile, dragging across the canvas can trigger browser pull-to-refresh or swipe navigation.
  - Virtual D-pad buttons can overlap top-floating HUD islands on small-screen devices (<380px).
* **Remediation (Milestone v1.19)**:
  1. Apply `touch-action: none;` and `overscroll-behavior: none;` to `html, body, .game-viewport, #game-canvas`.
  2. Implement responsive floating island collapse and dedicated bottom-screen touch control bar.
  3. Full integration of Click-to-Move with tap target indicators for one-finger navigation.

---

### Gap 8: Architect Studio Editor Usability (Milestone v1.20)
* **Diagnosis**:
  - Switching between Ground Floor (Z=0) and Overhead Walkways (Z=1) requires clicking sidebar buttons.
  - Erasing tiles requires selecting the eraser tool and re-selecting a brush to paint again.
  - No visual coordinate tooltip under cursor.
* **Remediation (Milestone v1.20)**:
  1. Add hotkeys: `Tab` for layer toggle (Z=0 ↔ Z=1), `E` for eraser toggle, `1–5` for brush size, `Ctrl+Z`/`Ctrl+Y` for undo/redo.
  2. Add right-click to quick-erase.
  3. Display dynamic cursor HUD displaying grid coordinates `(x, y, elevation)` and tile under cursor.
