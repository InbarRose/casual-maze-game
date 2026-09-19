# Casual Maze Game — Project Management & Roadmap

This document tracks project milestones, current release status, active development tasks, and the feature backlog.

---

## 1. Release & Milestone Status

### Current Version: `v1.13.0` (Completed & Verified)

- [x] **Storylines ("Stories") Game Mode & Tutorial Evolution**:
  - Dual primary play modes accessible from the Hub (`index.html`): **Campaign Trail** (28 Megalabyrinths across 7 chapters) and **Storylines** (narrative episodic sagas).
  - Mode Switcher navigation tabs (`#tab-stories`, `#tab-campaign`) with persistent selection, hero call-to-actions, story cards with synopsis, difficulty badges, and chapter completion pills.
  - Transformed the 6 tutorial mazes into **Storyline 1: *The Novice's Initiation*** with narrative prologues, rich titles, and seamless backward compatibility for `?tutorial=N` URLs.
  - Authored **Storyline 2: *Relics of the Four Guardians*** with 3 custom chapters:
    1. *The Whispering Ruins* (Orientation, ancient notes, bonus sunstone crystals, beacons).
    2. *The Falcon's Plinth* (Falcon statue retrieval, sky plinth socketing, terrace gate unsealing).
    3. *Sanctum of the Four Guardians* (4-statue environmental riddle: Falcon, Lion, Serpent, Bear placed on elemental plinths to break the golden sanctuary seal).
  - Standalone level JSON files exported to `levels/stories/story_guardians_[1-3].json` and registered in `levels/manifest.json`.
- [x] **In-Game Viewport Story Mode Experience (`maze.html`)**:
  - Detects `?story=<id>&chapter=<num>` with in-game story header badge (`📜 The Novice's Initiation • Ch. 1/6`, `🦅 Four Guardians • Ch. 2/3`).
  - Narrative prologue modal on chapter entry detailing lore and objective.
  - Next-chapter victory progression (`Chapter N →`) automatically loading the next sequential chapter and presenting a story victory celebration upon finishing the finale.
- [x] **Persistent Story Progression (`StorageManager`)**:
  - `STORY_PROGRESS` local storage key tracking per-story, per-chapter completion, best times, and step counts.
  - Full save profile export/import serialization including both campaign and story progress.
- [x] **Comprehensive Automated Test Coverage**:
  - Dedicated unit suite `tests/unit/stories/storylines.test.mjs` verifying registry and chapter navigation.
  - End-to-end user journey test `tests/integration/journeys/storylines-progression.journey.test.mjs` running complete live GameLoop simulations through all 6 chapters of Novice Initiation and all 3 chapters of Four Guardians.
  - Updated `tests/unit/levels/json-integrity.test.mjs` and `tests/validate-static.mjs` covering all 37 manifest levels.
  - 48 test suites, 221 tests, 4,274 assertions passing 100% (0 failed).

### Previous Milestone: `v1.12.0`

- [x] **Test Suite Modularization & BFS Campaign Solver Extraction**:
  - Replaced monolithic `campaign-playthrough.journey.test.mjs` with modular per-chapter test suites (`chapter-1.test.mjs` through `chapter-7.test.mjs`).
  - Extracted generalized solver into `tests/helpers/campaign-solver.mjs` for fast parallel verification of all 28 levels.
- [x] **Default Levels Modularization**:
  - Partitioned the 26,053-line monolith `default-levels.js` into categorized submodules (`tutorials.js`, `campaign-ch1.js` through `campaign-ch7.js`) with a clean 28-line backward-compatible aggregator.
- [x] **Carryable Riddle Relics & Inscribed Pedestal Puzzles**:
  - Added `RiddleItem` and `Pedestal` entities supporting non-automatic riddle solving.
  - Facing-tile interaction priority (`sortByFacing`), manual `[E]` interact to place/retrieve/swap items, inspection clues, and group solving (`evaluateRiddleGroup`) triggering target gate unlock.
  - Full end-to-end journey test `tests/integration/journeys/riddle-pedestals.journey.test.mjs` (4-statue guardian riddle solving sanctum gate).
- [x] **Thematic Atmospheric Backdrops & Procedural Perimeter Decor**:
  - Implemented `renderThematicBackdrop` with ambient vignette and animated biome particles (rising magma embers, drifting stars/crystals, snowflakes, floating pollen).
  - Deterministic procedural perimeter decor across non-playable void regions (`renderThematicPerimeterDecor`): skeletons, iron wall chains, cobwebs, trailing vines, fern clusters, sandstone arches, golden hieroglyphs, amethyst geodes, stalactites, magma fissures, astrolabes, and icicles.
- [x] **Wall Art, Atmospheric Inscriptions, Bonus Collectibles & Checkpoints**:
  - Added interactive wall art & lore tablets with inspection modal and player dialogue.
  - Added score gems (`BonusItem`) and carriable lighting aids (Torch).
  - Added mid-level checkpoints (`Checkpoint`) with death snapshot restoration.
- [x] **Editor Modernization & Modal Architecture**:
  - Extracted modal controllers into dedicated modules in `js/editor/modals/` (`ProjectsModal`, `ValidationModal`, `PlaytestModal`, `GuideModal`).
  - Added authoring palette buttons and Inspector property forms for Pedestals, Riddle Relics, Checkpoints, Notes, and Bonus Gems.
  - Real-time LevelValidator integrity checks for pedestal accepted items and target doors.
  - Grab & Move tool support for all new entity types.
- [x] **HUD Carried Relic Badge & Pedestal Inscription Dialog**:
  - Real-time badge in `maze.html` showing carried relic and key actions.
  - Inscription modal displaying riddle clues, socket status, and interactive controls.
- [x] **Automated Test Suite**:
  - 45 test suites, 207 tests, 4,082 assertions passing 100% (0 failed) in ~280ms.

### Previous Milestone: `v1.11.0`

- [x] **Mandatory Labyrinth Chokepoints & Non-Bypassable Obstacles**:
  - Audited all 28 campaign levels and redesigned corridor geometry across Chapters 1, 2, 3, 6, and 7 to seal unintended perimeter bypasses.
  - Formally proved that 100% of levels with locked doors, levers, teleporters, or puzzle gates *cannot* reach victory if those mechanisms are ignored or skipped (`canReachExitWithoutGates === false`, `canReachExitWithoutLevers === false`, etc.).
- [x] **Active Obstacle Interaction & 100% Clearance Test Suite**:
  - `tests/integration/journeys/campaign-playthrough.journey.test.mjs` enhanced with pre-run non-bypassability checks, real-time blocked movement validation on locked doors/puzzle gates, key collection & inventory consumption, lever tile mutations (`stateA`), and post-run 100% obstacle clearance audits (`door.isOpen === true`, `key.isCollected === true`, `lever.state === true`, `puzzleGate.isUnlocked === true`).
- [x] **Dedicated Gate & Obstacle Interaction Journey (`obstacle-interactions.journey.test.mjs`)**:
  - Key color isolation (Gold, Ruby, Sapphire keys strictly isolated).
  - Multi-elevation isolation (ground players at Z=0 cannot pick up or unlock overhead items at Z=1).
  - Multi-target levers with two-way toggle, tile state inversion, and one-way locks.
  - TimedHazard rhythm (active lethal phase vs dormant safe phase).
  - Patroller continuous navigation and circular collision detection.
  - PuzzleGate minigame validation (`rune_memory` and `cipher_dial` logic).
- [x] **LevelValidator Reachability Simulation**:
  - Multi-pass reachability analysis in `js/editor/level-validator.js` now simulates lever stepping and dynamic wall-to-floor tile mutations.
- [x] **Comprehensive Automated Test Coverage**:
  - 32 test suites, 184 test cases, 3,876 assertions running with 0 failures in under 200ms.

### Previous Milestone: `v1.10.0`

- [x] **Perspective Toggle Reliability & Persistent User Settings**:
  - Identified and resolved renderer regression in `js/engine/renderer.js` where per-frame execution was overriding runtime perspective choices.
  - Added user settings persistence in `StorageManager` (`getSetting`, `setSetting`) for perspective choice across level transitions and browser sessions.
  - Updated HUD button `#btn-perspective` in `maze.html` with active indicators and hotkey `[V]` listener.
- [x] **Human Explorer Character Art (Jeans, Plaid Flannel & Backpack)**:
  - Procedural Canvas 2D player renderer overhaul in `js/entities/player.js` supporting both 2.5D angled and top-down perspectives.
  - **2.5D Angled View**: Upright human explorer with messy brown hair, friendly facial expression, red-and-black Buffalo plaid flannel shirt (check patterns, collar, front placket), blue denim jeans with animated walking stride, brown leather boots, and brown backpack with rolled sleeping bedroll, side pouches, and brass buckles.
  - **Top-Down View**: Orthographic plan view with flannel shoulders, directional indicator, and backpack.
  - Created 4 standalone vector SVG sprites in `assets/player/explorer/` (`north`, `south`, `east`, `west`).
- [x] **Art DB & Asset Catalog Expansion (`art-catalog.html`)**:
  - Registered 12 new SVG assets into `assets/manifest.json` (total 147 assets): 4 explorer facings, teleporter, flame vent, patroller sentinel, rune & cipher puzzle gates, signpost, and 2.5D angled wall and bridge tiles.
  - Added in-browser **2.5D Perspective Preview Toggle** with CSS 3D card tilt (`rotateX(24deg)`) and realistic drop shadows.
  - Added filter pills for all new categories (`angled`, `teleporters`, `hazards`, `patrollers`, `puzzle_gates`, `signposts`) and character classes (`explorer`, `adventurer`, `knight`, `mage`, `rogue`).
- [x] **Comprehensive Automated Test Coverage**:
  - 31 test suites, 178 tests, 3,532 assertions passing 100% (0 failed) in ~170ms.

### Previous Milestone: `v1.9.0`
- [x] **Progressive Campaign Architecture (7 Chapters, 28 Levels)**:
  - Structured progression inspired by *World of Goo*: introducing core mechanics, scaling, twisting, and culminating in grand synthesis.
  - 7 curated chapters conforming to Kishōtenketsu 4-act progression:
    1. **Chapter 1: The Foundation** (Levels 1-4, Whispering Dungeon, Orientation, Line of Sight, Keys).
    2. **Chapter 2: The Vertical Dimension** (Levels 5-8, Emerald Canopy, 3D Bridges, Ramps, Underpasses).
    3. **Chapter 3: Shifting Architecture** (Levels 9-12, Sunken Clockwork Crypt, Modulating Levers).
    4. **Chapter 4: Astral Anomalies** (Levels 13-16, Crystal Caverns, Dimensional Teleporters).
    5. **Chapter 5: Rhythm & Danger** (Levels 17-20, Molten Core, Timed Flame Vents, Patroller Sentinels).
    6. **Chapter 6: Arcane Seals** (Levels 21-24, Sunken Observatory, Rune Memory, Cipher Dial Minigames).
    7. **Chapter 7: Grand Synthesis** (Levels 25-28, Citadel of Trials, Megalabyrinth Fusion).
- [x] **Architect's Journal & Signpost Entity (`Signpost`)**:
  - Readable tablets and scrolls placed across labyrinths with whimsical lore and spatial guidance.
  - Visual rendering across both 2.5D angled and top-down perspectives.
  - Step arrival toast and event bus broadcast (`signpost:read`).
- [x] **Tri-Medal Mastery & Progression System**:
  - Three distinct achievement goals per level: Completion Star, Pathfinder (Par Steps), Speedrunner (Par Time).
  - StorageManager aggregation: `getChapterStars(levels, progress)` and persistent medals.
  - Hub world map (`index.html`) displaying chapter cards, tier tags, level pills, star counters, and medal ribbon status.
- [x] **Automated Level Playthrough Verification Suite**:
  - Zero-dependency BFS state-space pathfinding solver computing shortest winning paths for any level.
  - `campaign-playthrough.journey.test.mjs` executing live GameLoop runtime simulation for all 28 campaign levels, verifying collision, key pickup, door unlocking, bridge crossing, teleporter warping, and victory.
- [x] **Comprehensive Automated Test Coverage**:
  - 31 test suites, 174 test cases, 3,455 assertions running with 0 failures in under 200ms.

### Previous Milestone: `v1.8.0`
- [x] **Angled Top-Down (2.5D) Perspective Renderer**:
  - Dual-perspective engine (`ANGLED` default, `TOPDOWN` flat toggleable with `[V]` and HUD button).
  - Dual-plane wall rendering with elevated top caps (`wallH = 12px`), vertical south-facing drop facades with brick/mortar relief, and cast shadows.
  - Elevated multi-layer overpass spans with physical elevation lift (`heightOffset = 14px`), vertical support pillars anchored to ground, and drop shadows.
  - Back-to-front Y-depth sorting pipeline (`renderYSortedEntities`) for proper occlusion between sprites, players, and wall facades.
- [x] **Dynamic Interactive Activities & Entities**:
  - `Teleporter`: Instant 3D coordinate warping `(x, y, z)` with cooldown looping prevention and concentric portal animation.
  - `TimedHazard`: Cyclical phase machine (`DORMANT` -> `WARNING` -> `ACTIVE` -> `DECAYING`) for flame vents and spike traps with checkpoint respawning on contact.
  - `Patroller`: Continuous waypoint navigation with cyclic loops and ping-pong paths, dynamic heading angles, and circular player collision.
  - `PuzzleGate`: Impassable barriers unlocked by completing mental minigames.
- [x] **Static Puzzle Minigame Modal Overlay (`PuzzleModal`)**:
  - Simon-style sequential pattern memorization (`Rune Memory`).
  - 3-ring celestial rotary combination dial lock (`Cipher Dial`).
  - Responsive mouse and keyboard accessibility with solve animations and event bus dispatches.

### Previous Milestone: `v1.7.0`
- [x] **3D `(X, Y, Z)` Coordinate Standardization**:
  - Unified integer spatial model with `Z = 0` (Ground), `Z = 1` (Overhead), and `Z = -1` (Basement).
  - Canonical formatters `formatXYZ(x, y, z)` and `getElevationLabel(z)`.
  - Player, Key, Door, and Lever models with synchronized `z` and `elevation` properties and `.getCoordString()`.
  - Editor 3D cursor readout, layer switcher, and Entity Inspector 3D coordinate support.
- [x] **Advanced Editor Toolset & Precision Drawing**:
  - Bresenham Line-Drawing Tool for straight and diagonal wall segments.
  - Multi-Sized Brush Footprints (`1x1` to `5x5`) for rapid stamping and painting.
  - Object Grab & Move Tool with real-time collision checks and relocation logging.
  - Official Preset Level Loading & Remix Cloning for rapid level iteration.
  - Entity Inspector with custom art style variants, orientation selection, and trigger wiring.
- [x] **Standalone Asset Catalog & Vector System**:
  - Decoupled SVG vector graphics catalog in `assets/` with `assets/manifest.json`.
  - Full tileset variations across all themes (Dungeon, Jungle, Lava, Snow, Cave, Sunset).
  - 4-way directional player classes and facing-aware passage/gate graphics.

### Previous Milestone: `v1.6.0`
- [x] **Modular Test Directory Architecture (`tests/`)**: Subsystem unit suites across `core`, `engine`, `entities`, `levels`, and `editor`.
- [x] **Zero-Dependency Test Harness & Assertions**: Custom ES-module runner with deep equality and mocks.
- [x] **End-to-End User Journey Suites**: Tutorial Academy, Campaign Solvability, Dungeon Architect, Fog Exploration, and Multi-Elevation Traversal.

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
- [x] **Interactive Activities & Dynamic Entities**:
  - [x] Dimensional Teleporters with 3D coordinate warping.
  - [x] Timed cyclical hazards (flames, spikes) and checkpoint respawn.
  - [x] Waypoint-navigating patroller hazards.
  - [x] Minigame puzzle gates (Rune Memory, Cipher Dial).
- [ ] **Additional Puzzle Entities**:
  - Pressure plates (momentary activation when stepped on).
  - One-way gates / sliding doors.

---

## 3. Architecture Decision Records (ADRs)

All architectural decisions are documented in `docs/adr/`:

| ADR | Title | Status | Date |
| --- | --- | --- | --- |
| [0001](adr/0001-static-canvas-modular-engine.md) | Static Canvas 2D Engine with ES6 Modules | Accepted | 2026-08-30 |
| [0002](adr/0002-multi-elevation-bridge-system.md) | Two-Layer Elevation and Directional Bridges | Accepted | 2026-08-30 |
| [0003](adr/0003-tutorial-system-and-level-toggles.md) | Tutorial Academy, In-Game Hint System, and Level Design Toggles | Accepted | 2026-08-30 |
| [0004](adr/0004-zone-grouping-and-thematic-tilesets.md) | Zone Grouping, Thematic Tilesets, and Directional Graphics | Accepted | 2026-08-30 |
| [0005](adr/0005-angled-topdown-perspective-and-dynamic-activities.md) | Angled Top-Down (2.5D) Perspective and Dynamic Activities | Accepted | 2026-09-18 |

---

## 4. Release Checklist

When preparing a release or submitting a major update:
1. Run `npm test` and verify 100% pass rate.
2. Verify all campaign JSON levels in `levels/` and `levels/manifest.json` are valid.
3. Test locally with a static server (`python -m http.server 8000`) across desktop keyboard and mobile touch controls.
4. Verify `CNAME` is untouched and relative asset paths are intact for GitHub Pages.
5. Update this file and `PROJECT_CONTEXT.md` to reflect any new features or schema changes.
