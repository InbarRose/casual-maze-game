# Casual Maze Game — Project Management & Roadmap

This document tracks project milestones, current release status, active development tasks, and the feature backlog.

---

## 1. Release & Milestone Status

### Current Version: `v1.6.0` (Completed & Verified)

- [x] **Modular Test Directory Architecture (`tests/`)**: Extracted monolithic `test-suite.mjs` into dedicated subsystem unit suites across `core`, `engine`, `entities`, `levels`, and `editor`.
- [x] **Zero-Dependency Test Harness & Assertions**: Custom ES-module runner (`describe`, `it`, hooks, timers, filtering via `--suite` and `--grep`) with deep equality, numeric ranges, and mock polyfills.
- [x] **End-to-End User Journey Suites**:
  - 🎓 *Novice Tutorial Academy Journey*: Full sequential 6-level onboarding from basic movement to multi-elevation bridges and fog.
  - 🗺️ *Campaign Solvability & Replay Journey*: Multi-zone BFS solvability and telemetry event stream verification.
  - 📐 *Dungeon Architect Journey*: Level creation, deadlock and missing key detection, error correction, and JSON roundtrip export.
  - 🕯️ *Fog & Line-of-Sight Exploration Journey*: Dynamic raycasting line-of-sight and corner shadow casting.
  - 🌉 *Multi-Elevation Traversal Journey*: 3D-feel ramps, East-West and North-South bridges, railings, and overhead void boundaries.
- [x] **Automated Test Coverage**: 87 test cases and 1,202 automated assertions running in ~60ms (0 failed).

---

## 2. Active TODOs & Work Items

### Quality & Performance
- [ ] **Sound & Audio FX**: Lightweight web audio synthesizer or static sound effects for key collection, door unlock, lever toggle, and level win.
- [ ] **Mobile Virtual Controls Polish**: Enhance touch response haptics/styling and add gesture-based minimap pinch-to-zoom.

### Editor Enhancements
- [x] **Undo / Redo History**: Implement an action stack (`Ctrl+Z` / `Ctrl+Y`) inside `editor.html`.
- [x] **Level Validator in Editor**: Warn creators if a maze has unreachable keys, missing spawns, or no path to the exit before export.
- [x] **Level Design Toggles**: Fog of war, field-of-view radius, and mapRevealed memory mode toggles in Settings modal.
- [x] **Theme Live Previewing & Quick Switcher**: Real-time visual tileset rendering on the editor canvas with quick dropdown selector.
- [x] **Multi-Color Key & Door Studio**: Palette presets and color swatches for keys and gates.
- [x] **Lever Target Configuration & In-Editor Preview**: Custom State A/B tile transitions and live toggle testing.
- [x] **Playtest Custom Spawn & Inventory Preloader**: Test specific chambers with pre-assigned keys.
- [ ] **Level Auto-Fix**: One-click quick-fixes for common validation warnings (e.g. adding missing ramp).

### Campaign & Gameplay Expansion
- [x] **Tutorial Academy & Hint Banner**: Progressive 6-level onboarding and in-game hints.
- [x] **Multi-Colored Keys & Gates**: Multiple distinct key colors and locked doors.
- [x] **Zone-Batched Progression (Zones 1-3)**: 16 total levels across Dungeon, Jungle, and Lava biomes.
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
| [0004](adr/0004-zone-grouping-and-thematic-tilesets.md) | Zone Grouping, Thematic Tilesets, and Directional Graphics | Accepted | 2026-08-30 |

---

## 4. Release Checklist

When preparing a release or submitting a major update:
1. Run `npm test` and verify 100% pass rate.
2. Verify all campaign JSON levels in `levels/` and `levels/manifest.json` are valid.
3. Test locally with a static server (`python -m http.server 8000`) across desktop keyboard and mobile touch controls.
4. Verify `CNAME` is untouched and relative asset paths are intact for GitHub Pages.
5. Update this file and `PROJECT_CONTEXT.md` to reflect any new features or schema changes.
