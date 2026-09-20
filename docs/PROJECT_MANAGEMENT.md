# Casual Maze Game — Project Management & Roadmap

This document tracks project milestones, current release status, active development tasks, and the feature backlog.

---

## 1. Release & Milestone Status

### Current Milestone: `v1.19.0` (In Progress)

- [x] **Level Design Philosophy & Architectural Principles Documentation**:
  - Published [`docs/LEVEL_DESIGN_PHILOSOPHY.md`](LEVEL_DESIGN_PHILOSOPHY.md) establishing the 4-stage *Kishōtenketsu* methodology (Introduction, Development, Twist, Synthesis) for labyrinth design.
  - Formulated spatial rules: anti-box rhythm (open chambers vs corridors), dynamic non-corner spawn/exit anchoring, and zero-bypass gating guarantees.
- [x] **Multi-Perspective Quality Rubric & Master Scoring Register**:
  - Published [`docs/LEVEL_AUDIT_RUBRIC.md`](LEVEL_AUDIT_RUBRIC.md) establishing a 6-axis 60-point scoring framework (Stage Alignment, Gating Integrity, Novelty, Flow, Aesthetics, Calibration) and automated quality thresholds ($\ge 45/60$, mandatory 10/10 gating).
  - Published [`docs/LEVEL_SCORING_REGISTER.md`](LEVEL_SCORING_REGISTER.md) with comprehensive baseline audits of all 32 campaign levels and 6 tutorials, establishing targeted improvement goals.
- [x] **Comprehensive Gap Analysis & Remediation Backlog**:
  - Published [`docs/GAP_ANALYSIS_AND_IMPROVEMENT_PLAN.md`](GAP_ANALYSIS_AND_IMPROVEMENT_PLAN.md) identifying root causes and actionable plans for all 8 reported gaps (test/replay crash, rotation bugs, level repetition, obstacle bypasses, settings, assets, mobile, and editor).
- [/] **Workshopping Chapter 1 (Levels 1–4) & Chapter 2 (Levels 5–8)**:
  - Redesigning Levels 1–4 (The Foundation) and 5–8 (The Vertical Dimension) to break corner-to-corner scaling and enforce strict Kishōtenketsu progression.
- [x] **Immediate Core Engine Fixes**:
  - Exported `ALL_LEVELS` in `js/levels/default-levels.js` fixing module loading crash on `test.html`.
  - Corrected bridge deck orientation mapping in `js/engine/renderer.js` (`renderOverheadLayer`).

### Previous Milestone: `v1.18.0` (Completed & Verified)

- [x] **Hotkey "R" Conflict Fix & Restart Separation**:
  - Removed `KeyR` from `KEY_CODES.RESTART` (now bound strictly to `KeyT`).
  - Added dedicated bindings `KEY_CODES.ROTATE_LEFT` (`KeyQ`, `BracketLeft`) and `KEY_CODES.ROTATE_RIGHT` (`KeyR`, `BracketRight`).
  - Cleaned `KeyL` from `KEY_CODES.RIGHT` to prevent collision with Activity Log toggle `L`.
  - Added unit tests in `tests/unit/core/constants.test.mjs` asserting key isolation.
- [x] **Hotkeys Toggle & Simple Keyboard Mode**:
  - Added `areHotkeysEnabled()` and `setHotkeysEnabled()` in `GameLoop`.
  - Added "Simple Keyboard Mode" toggle in `SettingsModal` and Pause Menu (`#btn-pause-hotkeys`), persisting `hotkeys_enabled` and `simple_keyboard_mode` in `StorageManager`.
  - In Simple Keyboard Mode, single-letter shortcuts (`Q`, `R`, `T`, `M`, `V`, `L`) are bypassed, restricting input to movement (`WASD`/Arrows) and interaction (`Space`/`Enter`) to prevent unintended resets or UI shifts.
- [x] **Click-to-Move BFS Pathfinding Engine**:
  - Implemented `GameLoop.findPathTo(targetX, targetY)` with multi-elevation awareness (bridges, ramps, closed vs. open doors).
  - Handles clicks on solid obstacles (levers, pedestals, locked doors) by routing to the nearest adjacent walkable cell.
  - Added canvas `pointerdown` listener converting coordinates via `camera.screenToWorld()`, respecting active camera rotations.
  - Added animated cyan pulsing target indicator (`GameRenderer.renderClickTarget`).
  - Automatic cancellation on manual directional keydown.
- [x] **Floating Contextual Action Button (`#hud-contextual-interact`)**:
  - Implemented `GameLoop.getAvailableInteraction()` checking player and adjacent tiles with facing-direction prioritization.
  - Supports levers, puzzle gates, pedestals, signposts, wall decor, riddle items, doors, and exits.
  - Dynamically positions a glassmorphic floating pill (`.contextual-interact-btn`) 36px above character in screen space.
  - Click & pointerdown handlers with `stopPropagation()` enabling one-tap mobile and mouse interactions without triggering click-to-move under the button.
- [x] **Automated Test Coverage**:
  - 63 test suites, 307 tests, 6,092 assertions passing 100% (0 failed, 0 drift).

### Previous Milestone: `v1.17.0` (Completed & Verified)

- [x] **Camera World Rotation Fix & Synchronized Rigid Transforms**:
  - Unified coordinate projection in `GameRenderer`: discrete coordinates for all world elements; rigid Canvas 2D matrix transformation `ctx.rotate(-deltaRad)` around screen center during camera rotation.
  - Guarantees 0 relative displacement between player avatar, multi-elevation bridges, ramps, and tiles during camera turning.
  - Gated player movement during camera rotation lerps (`camera.isRotating()`) in `GameLoop.tryMoveDirection()`, `processPlayerMovement()`, and `tryMove()`, preventing players from stepping off elevated bridge decks.
  - Added unit test suite `tests/unit/engine/camera-rotation.test.mjs` verifying rigid distance invariance across all 4 quadrants (0°, 90°, 180°, 270°).
- [x] **Story 1 (Tutorial Academy) Gate Routing & Bypass Prevention**:
  - Fixed `tutorial_3.json`: Sealed bypass corridor at rows 1-3 col 5, opened path at (4,5) leading into the (5,5) gate, making the mechanism lever at (3,7) strictly mandatory.
  - Fixed `tutorial_6.json`: Sealed perimeter bypass at (1,14) and opened corridor at (2,15), making the clockwork switch `lever_t6` at (11,12) strictly mandatory to reach the Red Key.
  - Added regression test suite `tests/unit/levels/story-1-unbypassable.test.mjs` verifying that attempting to skip keys, levers, or bridges results in 0 solvable paths to the exit.
  - Re-synchronized SHA-256 hashes and dimensions in `levels/manifest.json`, `assets/manifest.json`, and `js/levels/tutorials.js`.
- [x] **Universal App Navigation Header & Footer**:
  - Created `js/ui/app-header.js` mounting a modern glassmorphic header (`.app-nav-header`) and footer (`.app-nav-footer`) across all pages (`index.html`, `maze.html`, `editor.html`, `test.html`, `art-catalog.html`).
  - Active tab highlighting (`Play Hub`, `Play Maze`, `Architect Studio`, `Replay & Lab`, `Art Catalog`).
  - Responsive design with mobile icon-only compression and horizontal scroll protection.
- [x] **Player Profile & Save Management Modal (`js/ui/profile-modal.js`)**:
  - Dynamic Explorer codename editor with instant persistence.
  - Computed player ranking system based on stars earned across campaign, tutorials, and story chapters (Novice Pathfinder 🧭 ➔ Labyrinth Scout 🗺️ ➔ Dungeon Cartographer 📜 ➔ Master Architect 🏛️ ➔ Grand Labyrinth Sovereign 👑).
  - 1-click JSON save copy to clipboard, file download backup, and file upload restoration.
- [x] **Universal Game Settings Modal (`js/ui/settings-modal.js`)**:
  - Live procedural audio sliders for Master, SFX, and BGM volume with instantaneous sound preview.
  - 2.5D Angled vs. Flat Top-Down perspective mode switcher.
  - Smooth camera rotation toggle (`smooth_rotation`).
  - High Contrast accessibility mode toggle (`high_contrast`).
  - Comprehensive controls cheatsheet and direct link to Replay Theater & Diagnostics Lab.
  - Integrated into game pause menu (`#btn-pause-settings`, `#btn-pause-profile`).
- [x] **Architect Studio Map Editor Overhaul (`editor.html`, `css/editor.css`)**:
  - Reorganized toolbar into structured `.toolbar-group` modules (Project, History, Health/Validation, Properties, File Operations, Playtest).
  - Modernized sidebar with theme selector, layer switcher (Ground Floor Z=0 vs Overhead Walkway Z=1), brush sizing (1x1 to 5x5), tiles & ramp palettes, and multi-colored key/door/relic palettes.
  - High-contrast active tool glows, smooth hover micro-transitions, and thin glass scrollbars.
- [x] **Modular Test Runner Splitting & Fast Execution**:
  - Added `--fast` flag and category filters (`--filter=`) to `tests/harness/runner.mjs`.
  - Created granular aggregator suites in `tests/suites/`: `unit.mjs`, `engine.mjs`, `levels.mjs`, `entities.mjs`, `journeys.mjs`, `campaign.mjs`.
  - Added npm scripts: `npm run test:fast` (299 tests in ~330ms), `test:unit`, `test:engine`, `test:levels`, `test:entities`, `test:journeys`, `test:campaign`.
- [x] **Automated Test Coverage**:
  - 62 test suites, 299 tests, 6,045 assertions passing 100% (0 failed).

### Previous Milestone: `v1.16.0`

- [x] **GitHub Community Issue Templates & Seed Tracking**:
  - Issue templates: `.github/ISSUE_TEMPLATE/bug_report.yml` (structured forms for browser, level ID, OS, repro steps, and save state / debug logs), `feature_request.yml` (mechanics, entities, themes, editor tools), `feedback.yml` (difficulty curve, pacing, impressions), and `config.yml`.
  - Created seed tracking issues on GitHub via MCP:
    - Issue #20: `[Bug Reporting Guide] How to report bugs with Save State & Debug Logs` (labels: `bug`, `documentation`).
    - Issue #21: `[Community Feedback] Gameplay Impressions, Pacing & Balance Feedback` (labels: `feedback`).
    - Issue #22: `[Feature Suggestions] Ideas for Puzzles, Mechanics, Themes & Editor Tools` (labels: `enhancement`).
- [x] **Core BFS Solver & Optimal Walkthrough Generator (`js/engine/solver.js`)**:
  - Standalone zero-dependency BFS pathfinder `solveLevel(level, options)`.
  - Walkthrough generator `generateWalkthroughReplay(level)` creating structured replay JSON schemas for all 32 campaign levels, tutorials, and storylines.
- [x] **Interactive Replay Player Engine (`js/engine/replay-player.js`)**:
  - Interactive canvas playback controller with states (`IDLE`, `PLAYING`, `PAUSED`, `COMPLETED`).
  - Action playback (`move`, `teleport`, `rotate`), scrubbing slider, step-by-step navigation (`stepForward()`, `stepBackward()`), arbitrary seek (`seekTo(stepIndex)`), restart, and speed modulation (`0.5x`, `1.0x`, `2.0x`, `4.0x`).
  - Headless-safe architecture for Node.js execution.
- [x] **Diagnostics, Replay Theater & In-Browser Test Lab (`test.html`, `test/index.html`)**:
  - Three glassmorphic tab panels:
    - **Replay & Walkthrough Theater**: Viewport canvas, level selector for all 42 levels, "Compute Solver Walkthrough", JSON drag & drop / file picker, scrubber slider, step inspector, and playback controls.
    - **In-Browser Test Runner**: Metric summary cards (Suites, Passed, Failed, Assertions, Duration), progress bar, live accordion event stream, and "Run All Tests in Browser" runner.
    - **Diagnostics & GitHub Issue Reporting**: Client environment snapshot (User-Agent, screen, Canvas2D, Web Audio, localStorage), 1-click "Copy Diagnostics to Clipboard", 1-click "Copy Save State JSON", and direct issue creation links.
  - URL parameter routing (`?mode=replay&level=<id>`, `?source=last_run`, `?autoplay=1`).
  - Static redirect `/test` (`test/index.html`) forwarding query strings to `test.html`.
- [x] **In-Game Issue Reporting & Replay Integration (`maze.html`, `index.html`)**:
  - Pause Menu: `[🎬 Watch Solver Walkthrough]`, `[🐞 Report Issue on GitHub]`.
  - Activity Log Modal: `[🎬 Watch Run Replay]`, `[🐞 Report Issue]`.
  - Victory Modal: `[🎬 Watch Run Replay]`, `[🐞 Feedback / Report]`.
  - Hub: Architect Studio card for "Diagnostics & Replay Theater", 1-click "Copy Save State to Clipboard", and footer links.
- [x] **Automated Test Quality Assurance**:
  - 60 test suites, 286 tests, 5,986 assertions passing 100% (0 failed).

### Previous Milestone: `v1.15.0`

- [x] **Modern & Sleek Game UI Design System**:
  - CSS3 glassmorphism system with surface layering (`--bg-deep`, `--bg-surface`, `--bg-glass`, `--bg-glass-elevated`, `--bg-glass-card`, `--border-glass-bright`, `--inset-highlight`).
  - Luminescent neon accents (`--accent-cyan-glow`, `--gold-glow`, `--emerald-glow`, `--rose-glow`, `--purple-glow`).
  - Tactile physical button mechanics with spring-curve transitions (`cubic-bezier(0.34, 1.56, 0.64, 1)`), active state depress, and angled light shimmer hover sweeps.
  - Smooth modal transitions with backdrop blur and scaling pop-in animations (`scale(0.92)` to `scale(1)`).
- [x] **Procedural Web Audio Sound FX Engine (`js/ui/audio-fx.js`)**:
  - 100% static, zero-dependency browser Web Audio API procedural synthesizer (zero audio files to download or stream).
  - Procedural sound presets: `playHover`, `playClick`, `playKeyPickup` (3-note arpeggio), `playDoorUnlock` (stone thud), `playLeverToggle`, `playTeleport` (frequency sweep), `playVictory` (triumphant fanfare), `playHazardHit`, `playCheckpoint`, `playModalOpen`, `playModalClose`.
  - Persistent sound toggle (`localStorage['casual_maze_sound_muted']`) with audio button state mirroring.
  - Automatic DOM listener attachment helper `attachToInteractiveElements()`.
  - Headless-safe architecture enabling pure Node.js test execution.
- [x] **In-Game Floating Island HUD & Pause Menu (`maze.html`, `js/ui/game-menu.js`)**:
  - Decluttered viewport into 3 modern floating glassmorphic islands:
    - **Navigation & Info Island** (`[← Hub]`, `[Editor]`, `#hud-level-card` with tutorial/chapter badge, elevation, room title).
    - **Inventory Belt Island** (color keys, carried riddle relics, hints).
    - **Telemetry & Controls Island** (time, steps, score, compass dial with rotation buttons, `[⏸ Menu [P]]`).
  - In-game Pause & Action Menu controller (`GameMenu`) triggered via `[P]`, `Escape`, or menu button.
  - Pause menu provides real-time level telemetry, view mode toggles (Angled 2.5D vs. Top-Down), Free-Pan mode, Activity Log, Hints, Save Progress export, Sound toggle, Restart, and Level Select.
- [x] **Hub Navigation & Catalog Studio Mode (`index.html`)**:
  - Modernized Hub mode switcher with 3 tabs: `📜 Storylines (3 Sagas)`, `🏰 Campaign Trail (8 Chapters • 32 Levels)`, and `🛠️ Level Architect (Studio)`.
  - Integrated Story 3 (*The Whispering Citadel*) card with multi-room status tracking.
  - Integrated Chapter 8 (*The Shifting Monolith*) section with 12-star completion counter.
  - Architect Studio container housing Save Progress, Custom Maze importer, Maze Architect editor, and Art & Asset Catalog.
- [x] **Automated Test Coverage & Quality Assurance**:
  - 58 test suites, 274 tests, 5,915 assertions passing 100% (0 failed).
  - Dedicated unit test suite for Web Audio sound synthesis (`audio-fx.test.mjs`).
  - Dedicated unit test suite for Pause and Action Menu state machine (`game-menu.test.mjs`).

### Previous Milestone: `v1.14.0`

- [x] **Camera World Rotation & Perspective Mechanics**:
  - 4-quadrant camera rotation: `0° (North)`, `90° (East)`, `180° (South)`, `270° (West)`.
  - Smooth camera rotation interpolation (`rotationLerpSpeed`) and center-pivot coordinate transformation matrices (`worldToScreen`, `screenToWorld`).
  - Screen-relative player control mapping (`SCREEN_TO_WORLD_DELTAS[rotationAngle][dir]`) ensuring directional keys always move the explorer in the visual screen direction.
  - Explorer avatar facing automatically matches screen movement direction.
  - Renderer rotation support: dynamic wall drop faces, underpass tunnel visibility, bridge deck spans, and 4-way Y-depth sorting.
  - Interactive HUD controls: rotation buttons (`#btn-rotate-left`, `#btn-rotate-right`), dynamic compass heading rose (`#compass-badge`), and hotkeys (`[Q]` / `[R]`, `[` / `]`).
- [x] **Branching Labyrinths & Multi-Exit Routing**:
  - `exits` array schema contract supporting multiple distinct exits per level (`{ x, y, z, targetLevel, targetRoom, targetSpawn, label }`).
  - Portal-specific victory routing loading alternative target levels or trigger secret branches.
  - Glowing visual exit portal markers with tooltip destination labels.
- [x] **Interconnected Multi-Room Dungeon State Architecture**:
  - Level `rooms` dictionary supporting interconnected chambers within a single level (e.g. `courtyard`, `catacombs`, `high_spire`).
  - Bidirectional room transition portals (`targetRoom` / `targetSpawn`).
  - In-memory room state snapshot caching (`roomStates[roomId]`), preserving unlocked doors, collected keys/items, lever configurations, and modified tile layers upon leaving and returning.
  - Continuous global player state preservation (keys, carried relics, score, elapsed time) across room traversals.
  - Active room badge in HUD (`#hud-room-badge`).
- [x] **Campaign Chapter 8: The Shifting Monolith (Levels 29–32)**:
  - Level 29: *The Cardinal Needle* (Rotation tutorial, north/south corridor perspective shifts).
  - Level 30: *The Hidden Underpass* (Perspective-occluded underpass tunnel beneath an elevated bridge deck).
  - Level 31: *The Four-Faced Pillar* (4-sided central monolithic pillar hiding keys and levers on cardinal facades).
  - Level 32: *The Prismatic Spire* (Grand synthesis of rotation, bridges, teleporters, patrollers, and puzzle minigames).
  - Created modular `js/levels/campaign-ch8.js` and expanded campaign registry to 32 levels.
- [x] **Storyline 3: The Whispering Citadel**:
  - Multi-room episodic saga featuring 3 interconnected rooms (Courtyard, Catacombs, High Spire).
  - Puzzle flow: retrieve crypt key from catacombs, unlock spire gate in courtyard, cross high spire overpass to the apex altar.
  - Secret branching exit to Level 29 (*The Cardinal Needle*).
- [x] **Comprehensive Asset, Logic & Level Versioning & Drift Protection**:
  - Central versioning module `js/core/version.js` (`ENGINE_VERSION = '1.14.0'`) synchronized with `package.json`.
  - Level version normalization (`version: 1`, `schemaVersion: '1.0.0'`) and version validation in `LevelValidator`.
  - Cryptographic asset manifest (`assets/manifest.json`, `assets/schema.json`) tracking SHA-256 hashes and file sizes for all 160 SVG assets, resolving 13 previously unmanifested assets.
  - Cryptographic level manifest (`levels/manifest.json`) tracking SHA-256 hashes, file sizes, dimensions, entity counts, multi-room flags, and versions for all 42 levels.
  - Zero-dependency drift detection tool (`npm run validate:drift`) and universal manifest synchronizer (`npm run manifests:update`).
  - GitHub Actions CI gate `Validate Asset, Level & Version Drift Integrity` in `.github/workflows/ci.yml` protecting PRs into `main`.
- [x] **Automated Test Coverage & Quality Assurance**:
  - 56 test suites, 265 tests, 5,882 assertions passing 100% (0 failed) in ~300ms.
  - Dedicated suites for versioning (`versioning.test.mjs`), asset drift (`asset-drift.test.mjs`), and level drift (`level-drift.test.mjs`).

### Previous Milestone: `v1.13.0`

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
| [0006](adr/0006-camera-world-rotation-branching-rooms.md) | Camera World Rotation, Branching Levels, and Multi-Room Dungeons | Accepted | 2026-09-19 |

---

## 4. Release Checklist

When preparing a release or submitting a major update:
1. Run `npm test` and verify 100% pass rate.
2. Verify all campaign JSON levels in `levels/` and `levels/manifest.json` are valid.
3. Test locally with a static server (`python -m http.server 8000`) across desktop keyboard and mobile touch controls.
4. Verify `CNAME` is untouched and relative asset paths are intact for GitHub Pages.
5. Update this file and `PROJECT_CONTEXT.md` to reflect any new features or schema changes.
