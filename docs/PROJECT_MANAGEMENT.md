# Casual Maze Game — Project Management & Roadmap

This document tracks project milestones, current release status, active development tasks, and the feature backlog.

---

## 1. Release & Milestone Status

### Current Version: `v1.3.0` (Completed & Verified)

- [x] **Tutorial Academy (6 Progressive Mazes)**: Structured introductory curriculum (`tutorial_1` to `tutorial_6`) gradually teaching navigation, multi-color keys, levers, bridges/elevation ramps, and fog of war, culminating in the Master's Trial.
- [x] **Contextual In-Game Help & Hint Banner**: Added `help: { title, message }` schema metadata, rendered as an unobtrusive collapsible HUD banner with dedicated HUD quick-toggle button and tutorial progress badge.
- [x] **Level Design Toggles**:
  - `config.fogOfWar` (Boolean): Toggle dynamic darkness on/off per level.
  - `config.viewRadius` (Number): Dynamic field-of-view radius (tile sight distance).
  - `config.mapRevealed` (Boolean): Memory mode where entire maze layout is visible while dynamic entities remain hidden until active line of sight.
- [x] **Multi-Colored Keys & Gates**: Supported Ruby (Red `#f43f5e`), Sapphire (Blue `#38bdf8`), Emerald (Green `#34d399`), Gold (`#fbbf24`), and Purple (`#a855f7`) key/door pairs with color-coded HUD pills.
- [x] **Tutorial Academy Hub & Field Guide**: Added Tutorial Academy section on `index.html` with completion stars/best time tracking via `StorageManager.loadTutorialProgress()`, plus interactive Explorer's Field Guide.
- [x] **Editor Settings & Starter Templates**: Added "Map Starts Revealed" checkbox and custom help title/message fields to Settings modal, plus 1-click remixable Tutorial starter templates in Projects modal.
- [x] **Automated Test Suite**: 149 automated tests in `test-suite.mjs` verifying tutorial levels, solvability via BFS, fog toggles, view radius, multi-color keys, and tutorial storage.

---

## 2. Active TODOs & Work Items

### Quality & Performance
- [ ] **Sound & Audio FX**: Lightweight web audio synthesizer or static sound effects for key collection, door unlock, lever toggle, and level win.
- [ ] **Visual Polishing & Themes**: Additional tile themes (e.g. Castle, Forest, Sci-fi) selectable in level configuration.
- [ ] **Mobile Virtual Controls Polish**: Enhance touch response haptics/styling and add gesture-based minimap pinch-to-zoom.

### Editor Enhancements
- [x] **Undo / Redo History**: Implement an action stack (`Ctrl+Z` / `Ctrl+Y`) inside `editor.html`.
- [x] **Level Validator in Editor**: Warn creators if a maze has unreachable keys, missing spawns, or no path to the exit before export.
- [x] **Level Design Toggles**: Fog of war, field-of-view radius, and mapRevealed memory mode toggles in Settings modal.
- [ ] **Level Auto-Fix**: One-click quick-fixes for common validation warnings (e.g. adding missing ramp).

### Campaign & Gameplay Expansion
- [x] **Tutorial Academy & Hint Banner**: Progressive 6-level onboarding and in-game hints.
- [x] **Multi-Colored Keys & Gates**: Multiple distinct key colors and locked doors.
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
| [0003](adr/0003-tutorial-system-and-level-toggles.md) | Tutorial Academy, In-Game Hint System, and Level Design Toggles | Accepted | 2026-08-30 |

---

## 4. Release Checklist

When preparing a release or submitting a major update:
1. Run `npm test` and verify 100% pass rate.
2. Verify all campaign JSON levels in `levels/` and `levels/manifest.json` are valid.
3. Test locally with a static server (`python -m http.server 8000`) across desktop keyboard and mobile touch controls.
4. Verify `CNAME` is untouched and relative asset paths are intact for GitHub Pages.
5. Update this file and `PROJECT_CONTEXT.md` to reflect any new features or schema changes.
