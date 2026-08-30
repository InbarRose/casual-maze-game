# Casual Maze Game — Project Management & Roadmap

This document tracks project milestones, current release status, active development tasks, and the feature backlog.

---

## 1. Release & Milestone Status

### Current Version: `v1.4.0` (Completed & Verified)

- [x] **Zone / Group Hierarchy**: Structured levels into themed zones (Tutorial Academy, Zone 1: Whispering Dungeon, Zone 2: Emerald Jungle, Zone 3: Molten Core, Zone 4: Glacial Expanse, Zone 5: Amethyst Caverns) with Tier badges and progress tracking.
- [x] **Thematic Visual Tileset Engine (6 Themes)**:
  - 🏰 `dungeon`: Classic stone masonry, slate floors, steel railings, torchlight accents.
  - 🌴 `jungle`: Overgrown moss walls, foliage dirt floors, wooden rope bridges with vine railings, emerald glow.
  - 🌋 `lava`: Obsidian basalt brick, molten channels, iron grating over lava, fire amber railings, ruby portal.
  - ❄️ `snow`: Chiseled glacial ice, permafrost floors, frozen crystal bridges, icicle railings, cyan aurora glow.
  - 🔮 `cave`: Deep subterranean amethyst stone, shale floors, crystal slab bridges, purple void glow.
  - 🌅 `sunset`: Terracotta sandstone citadel, warm polished floors, brass bridges, golden sunburst glow.
- [x] **Directional Graphics & Enhanced Object Rendering**:
  - Orientation-aware gates (horizontal security crossbars vs vertical portcullis bars) with glowing rune keyholes.
  - Directional bridges (`B_EW` vs `B_NS`) with theme-adaptive planks, structural railings, support posts, and drop shadows.
  - Directional ramps with stepped incline shading and glowing accent chevron arrows.
  - Shimmering gemstone keys and heavy industrial switches with status LEDs.
  - Animated multi-layer swirling dimensional exit portals with orbiting particles.
  - Stylized explorer player avatars with directional headlamps/visors and elevation levitation auras.
- [x] **Campaign Expansion (16 Levels Total)**: Added Zone 2 Levels 6–8 and Zone 3 Levels 9–10, all verified 100% BFS solvable.
- [x] **Editor Live Theme Preview**: Real-time canvas rendering of all 6 themes and template organization in the Editor.
- [x] **Hub Zone Showcases**: Redesigned Hub UI with dedicated Zone sections, Tier badges, and level completion tracking.
- [x] **Automated Test Suite**: 215 automated assertions in `test-suite.mjs` (0 failed).

---

## 2. Active TODOs & Work Items

### Quality & Performance
- [ ] **Sound & Audio FX**: Lightweight web audio synthesizer or static sound effects for key collection, door unlock, lever toggle, and level win.
- [ ] **Mobile Virtual Controls Polish**: Enhance touch response haptics/styling and add gesture-based minimap pinch-to-zoom.

### Editor Enhancements
- [x] **Undo / Redo History**: Implement an action stack (`Ctrl+Z` / `Ctrl+Y`) inside `editor.html`.
- [x] **Level Validator in Editor**: Warn creators if a maze has unreachable keys, missing spawns, or no path to the exit before export.
- [x] **Level Design Toggles**: Fog of war, field-of-view radius, and mapRevealed memory mode toggles in Settings modal.
- [x] **Theme Live Previewing**: Real-time visual tileset rendering on the editor canvas.
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
