# Casual Maze Game — Project Management & Roadmap

This document tracks project milestones, current release status, active development tasks, and the feature backlog.

---

## 1. Release & Milestone Status

### Current Version: `v1.1.0` (Completed & Verified)

- [x] **Debug Telemetry & Replay Logger**: Integrated `DebugLogger` capturing timestamps, movement attempts with rejection reasons, elevation changes, key pickups, door unlocks, and lever state transitions with one-click JSON download at level completion.
- [x] **Multi-Elevation Collision Overhaul**: Fixed overhead void checking to prevent players from floating through walls/doors, strictly enforced directional ramp transitions (`RAMP_N`, `RAMP_S`, `RAMP_E`, `RAMP_W`), and aligned campaign level bridges and ramps.
- [x] **Key Notice HUD Cleanup**: Debounced HUD key rendering to avoid recreating DOM pills and re-triggering bounce animations on every move.
- [x] **Core Engine Skeleton**: HTML5 Canvas 2D rendering loop, viewport camera with lerp follow, grid coordinates, and keyboard/touch input.
- [x] **Multi-Layer Elevation**: 2-layer grid (`ground` and `overhead`), directional bridges (`B_EW`, `B_NS`), and elevation transition ramps (`R_N`, `R_S`, `R_E`, `R_W`).
- [x] **Fog-of-War & Minimap HUD**: 3-state visibility array (`0: Unexplored`, `1: Explored/Memory`, `2: Visible`), 2D raycasting line of sight, real-time minimap with click/drag panning, and `[M]` free-pan mode.
- [x] **Interactive Entity System**: Keys with color matching, locked doors, and levers with dynamic tile mutation.
- [x] **Handcrafted Level Architect (Editor)**: Visual canvas editor (`editor.html`), tool palette (Pencil, Flood Fill, Eraser, Inspect), lever wiring UI, and JSON file export/import.
- [x] **Campaign & Static Level Architecture**:
  - 5 handcrafted campaign levels (`levels/level_1.json` through `level_5.json` + fallback `default-levels.js`).
  - Strict static level validation and schema normalization.
- [x] **Automated Test Suite**: 69 automated tests in `test-suite.mjs` verifying math, collisions, entities, loader, telemetry logger, and JSON level integrity.
- [x] **Static Deployment**: Hosted on GitHub Pages at `casual-maze-game.inbarrose.com` via `CNAME`.

---

## 2. Active TODOs & Work Items

### Quality & Performance
- [ ] **Sound & Audio FX**: Lightweight web audio synthesizer or static sound effects for key collection, door unlock, lever toggle, and level win.
- [ ] **Visual Polishing & Themes**: Additional tile themes (e.g. Castle, Forest, Sci-fi) selectable in level configuration.
- [ ] **Mobile Virtual Controls Polish**: Enhance touch response haptics/styling and add gesture-based minimap pinch-to-zoom.

### Editor Enhancements
- [ ] **Undo / Redo History**: Implement an action stack (`Ctrl+Z` / `Ctrl+Y`) inside `editor.html`.
- [ ] **Level Validator in Editor**: Warn creators if a maze has unreachable keys, missing spawns, or no path to the exit before export.

### Campaign & Gameplay Expansion
- [ ] **Timer & Score HUD**: Optional speedrun timer and step counter persisted to `localStorage`.
- [ ] **Additional Puzzle Entities**:
  - Pressure plates (momentary activation when stepped on).
  - One-way gates / sliding doors.
  - Teleporters / portals.

---

## 3. Architecture Decision Records (ADRs)

All architectural decisions are documented in `docs/adr/`:

| ADR | Title | Status | Date |
| --- | --- | --- | --- |
| [0001](adr/0001-static-canvas-modular-engine.md) | Static Canvas 2D Engine with ES6 Modules | Accepted | 2026-08-30 |
| [0002](adr/0002-multi-elevation-bridge-system.md) | Two-Layer Elevation and Directional Bridges | Accepted | 2026-08-30 |

---

## 4. Release Checklist

When preparing a release or submitting a major update:
1. Run `npm test` and verify 100% pass rate.
2. Verify all campaign JSON levels in `levels/` and `levels/manifest.json` are valid.
3. Test locally with a static server (`python -m http.server 8000`) across desktop keyboard and mobile touch controls.
4. Verify `CNAME` is untouched and relative asset paths are intact for GitHub Pages.
5. Update this file and `PROJECT_CONTEXT.md` to reflect any new features or schema changes.
