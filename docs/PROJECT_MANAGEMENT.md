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
- [x] **Master Product Backlog & Gap Analysis**:
  - Published [`docs/BACKLOG.md`](BACKLOG.md) establishing an authoritative, prioritized backlog tracking all 32 items across 7 epics (Level Design, Visual Engine, Mobile UX, Editor Studio, Navigation & HUD, Audio FX, QA Automation).
  - Published [`docs/GAP_ANALYSIS_AND_IMPROVEMENT_PLAN.md`](GAP_ANALYSIS_AND_IMPROVEMENT_PLAN.md) detailing root-cause diagnosis and phased engineering plans for all 8 reported gaps.
- [x] **Rigorous Quality Rubric & Realistic Scoring Register (v2.0)**:
  - Overhauled [`docs/LEVEL_AUDIT_RUBRIC.md`](LEVEL_AUDIT_RUBRIC.md) to eliminate lenient rating bias, introducing granular sub-criteria, explicit backtrack penalties (-1 pt per 8 empty steps), flat canvas deductions (-4 pts), and an anti-box standard.
  - Re-audited Chapters 1 and 2 in [`docs/LEVEL_SCORING_REGISTER.md`](LEVEL_SCORING_REGISTER.md), establishing realistic, honest baseline scores (37–42 / 60, C to B- Tiers) and explicit next-iteration directives.
- [x] **Comprehensive Campaign Workshop (Chapters 1–8, Levels 1–32)**:
  - Redesigned and workshopped all 32 campaign levels following 4-stage *Kishōtenketsu* methodology (Ki: Intro, Shō: Development, Ten: Twist, Ketsu: Synthesis).
  - Eradicated 1-tile grid labyrinths, replaced with expansive pillared chambers, ambulatory transit loops, and safe harbors eliminating empty backtracking.
  - Enforced 100% airtight zero-bypass gating across all doors, keys, levers, teleporters, and puzzle gates (BFS solver verified: disabling any obstacle returns \`null\`).
  - Empirically calibrated all par steps ($parSteps = \\lceil \\text{optimal} \\times 1.15 \\rceil$) and par times ($parTime = \\lceil parSteps \\times 0.6 \\rceil$).
- [x] **Official Storylines & Episodic Campaigns Overhaul**:
  - Audited and verified *The Novice's Initiation* (Story 1, Chapters 1–6) unbypassable challenge integrity.
  - Overhauled *Relics of the Four Guardians* (Story 2, Chapters 1–3) with carryable animal statues and riddle socket plinths in expanded temple architecture.
  - Validated *The Whispering Citadel* (Story 3, Chapter 1) 3-tier multi-room dungeon (Courtyard $\to$ Catacombs $\to$ High Spire) with unbypassable Spire Barrier Gate and branching exits.
- [x] **Scalable 1-Test-Per-Chapter Architecture**:
  - Replaced monolithic multi-chapter bundles with dedicated unit tests: \`chapter-1.test.mjs\` through \`chapter-8.test.mjs\`, plus \`story-1-unbypassable.test.mjs\`, \`story-2-unbypassable.test.mjs\`, and \`story-3-unbypassable.test.mjs\`.
  - Expanded test suite to 73 test suites and 390 automated tests (0 failed, 6,541 assertions).
- [x] **Master Level Scoring Register (v3.0)**:
  - Populated [`docs/LEVEL_SCORING_REGISTER.md`](LEVEL_SCORING_REGISTER.md) with comprehensive 6-Chair ratings (Spatial, Systems, Art, Pacing, UX, Narrative) across all 32 campaign levels and 10 story levels.
  - Verified 100% of all 42 levels achieve A-Tier Release Candidate standard ($\\ge 45.00 / 60.00$).
- [x] **Immediate Core Engine Fixes & Visual Depth**:
  - Exported `ALL_LEVELS` in `js/levels/default-levels.js` fixing module loading crash on `test.html`.
  - Corrected bridge deck orientation mapping in `js/engine/renderer.js` (`renderOverheadLayer`).
  - **2.5D Depth-Sorting & Wall Front/Roof Occlusion (BL-33)**: Replaced batched wall rendering with `renderAngledGroundLayerInterleaved` in `js/engine/renderer.js`, combining walls, entities, and the player into a single draw list sorted ascending by projected screen Y base coordinate. Resolved visual bug where character rendered over southern wall roofs when walking behind walls. Verified camera-rotation invariance and 100% test coverage with `tests/unit/engine/depth-sorting.test.mjs`.
  - **Vector SVG Asset Pipeline Integration (BL-09 & BL-10)**: Connected the 160 vector SVG assets from `assets/manifest.json` into `GameRenderer` via `AssetLoader`. Rendered textured biome floors (with cracked and accent variations), textured wall caps and vertical drop facades, directional overhead bridges, ramps, stylized vector doors, collectible keys, switches/pedestals, and exit portals with robust procedural canvas fallbacks. Verified 100% test suite compatibility with `tests/unit/renderer/vector-rendering.test.mjs`.
  - **Dynamic Atmospheric Particles, Lighting Gradients & Elevation Shadows (BL-11, BL-12, BL-13)**: Implemented biome-tailored ambient particle simulations across all 5 biomes (`magma` rising embers, `jungle` floating spores, `glacial` snowfall, `temple` golden glitter, `dungeon` motes) capped at 35 particles with sinusoidal physics; dynamic radial lighting gradients under Fog of War softening explorer vision bounds (with torch expansion) and casting warm halos for wall torches and sconces; multi-tier directional drop shadows (umbra and penumbra) for elevated bridges and incline linear gradient shadows for ramps. Verified with unit test suite `tests/unit/renderer/particles-lighting.test.mjs` (78 suites, 410 tests passing).
  - **Mobile Touch Viewport & Minimap Gestures (BL-16 & BL-17)**: Added `overscroll-behavior: none` and `touch-action: none` across `html, body`, viewport, canvas, and minimap, preventing rubber-banding and pull-to-refresh on iOS Safari and Android Chrome; implemented mobile canvas swipe navigation with cardinal thresholds; added zoom ($1.0\times$ to $3.5\times$), pan offsets, and HUD zoom badge to `Minimap` with two-finger pinch-to-zoom, single-finger panning when zoomed, double-tap zoom toggle, and mouse wheel zoom. Verified with unit test suite `tests/unit/ui/touch-controls.test.mjs` (80 suites, 417 tests passing).
  - **Map Editor Action History Stack & Drag-to-Paint Smoothing (BL-18 & BL-19)**: Implemented a 50-state undo/redo command stack (`Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z`) in `EditorUI` recording brush strokes, entity lifecycle, theme changes, and dimensional resizing, synchronizing all UI inputs, badges, and button states; implemented continuous drag-to-paint smoothing in `EditorCanvas` using Bresenham line algorithm interpolation between consecutive pointer/touch coordinates, eliminating broken gaps during rapid mouse and tablet drawing; added non-passive touch event handling to editor canvas. Verified with unit test suite `tests/unit/editor/history-stack.test.mjs` (83 suites, 426 tests passing).
  - **Real-Time Audio Gain Sliders & Procedural Environmental Ambience (BL-24, BL-25, BL-28)**: Added a 3-tier hierarchical audio routing graph (`destination` $\leftarrow$ `_masterGain` $\leftarrow$ `_sfxGain` + `_bgmGain`) in `SoundFXEngine` with [0.0, 1.0] clamping and `StorageManager` persistence; linked settings sliders directly to gain nodes for instant volume adjustment; synthesized 100% zero-dependency procedural environmental ambience loops across all 5 biomes (`dungeon` draft drone, `jungle` warm canopy breeze & chirps, `magma` deep geothermal rumble, `glacial` arctic wind & crystal chimes, `temple` binaural singing bowl beating & droplet ping); integrated ambience lifecycle into `GameLoop` (`start`, `stop`, `restartLevel`, `handleVictory`, `initActiveRoom`) and `GameMenu` (`pause`, `resume`); verified with dedicated unit test suite `tests/unit/ui/audio-ambience.test.mjs` (84 test suites, 432 tests passing, 0 failed, 23/23 zero-drift checks).
  - **Map Editor Multi-Tile Prefabs, Diagnostic Auto-Fixer & Layer Switcher HUD (BL-20, BL-21, BL-22)**: Created modular catalog `PREFABS` with 6 canonical architectural prefabs (`bridge_crossing`, `vault_gate`, `chamber_room`, `cross_intersection`, `puzzle_sanctum`, `switch_hub`) and stamping engine `stampPrefab()` with unique UUID allocation; built one-click diagnostic auto-fixer `LevelValidator.autoFix()` repairing missing/walled spawn & exit, orphaned door keys, multi-elevation approach ramps, out-of-bounds targets, and blocked corridors with undoable snapshots and real-time status badge pulse; added floating visual layer switcher HUD (`#editor-layer-hud`) with elevation indicators and layer view mode filters (`focus`, `all`, `solo`) with differential elevation opacity and hover ghost outlines; verified with dedicated unit test suite `tests/unit/editor/prefabs-and-autofix.test.mjs` (87 test suites, 448 tests passing, 0 failed, 23/23 zero-drift checks).
  - **Page Initialization, TDZ Prevention & Automated Bootstrap Testing**: Resolved runtime Temporal Dead Zone (TDZ) `ReferenceError: Cannot access 'loreCardOpenedAtSteps' before initialization` in `maze.html` by hoisting all modal controls, dialogue lifecycle handlers, and step trackers before `new GameLoop(...)`; corrected lore card auto-dismissal step evaluation on movement (`window.gameLoop.steps` / `player.stepsTaken`); removed redundant duplicate declarations; created automated HTML bootstrap test suite (`tests/unit/ui/maze-html-bootstrap.test.mjs`) extracting and executing page scripts in a mock DOM environment to ensure menus, games, and UI components initialize without runtime errors (90 test suites, 456 tests passing, 0 failed).
- [x] **Platform Component Quality Rubric & Master Scoring Register**:
  - Published [`docs/COMPONENT_AUDIT_RUBRIC.md`](COMPONENT_AUDIT_RUBRIC.md) establishing an exhaustive 6-Chair simulated expert panel evaluation framework (Juice & Delight, Static Systems, UI/UX Ergonomics, Mechanics Depth, Progression Prestige, Inclusivity & DX) evaluating every application subsystem on an absolute 60-point scale.
  - Published [`docs/COMPONENT_SCORING_REGISTER.md`](COMPONENT_SCORING_REGISTER.md) with comprehensive baseline audits and gap analyses across all 19 application components (Shell, Rendering, Loop, Input, Minimap, HUD, Menus, Editor Canvas, Editor History, Editor Diagnostics, Assets, Audio, Storage, Profile, Settings, Handbook, Diagnostic Lab, Community Bug Channels, Accessibility).
  - Identified and prioritized new backlog tickets (`BL-34` through `BL-40` in [`docs/BACKLOG.md`](BACKLOG.md)) resolving usability friction, tactile acoustic feedback, and diagnostic telemetry.
- [x] **Quality Scores & UX Ergonomics Sprint (BL-26, BL-34, BL-35, BL-36, BL-38, BL-54, BL-55)**:
  - **Top Navigation Breadcrumbs & HUD Hierarchy (BL-54)**: Implemented interactive breadcrumbs bar (`.app-breadcrumbs-bar`) in `initAppHeader()` across campaign, story quests, and custom levels; wired in-game HUD breadcrumb display (`#hud-breadcrumbs`) showing Chapter title and Level ID with direct return links to Hub.
  - **Keyboard Quick-Advance on Victory (BL-55)**: Enabled `Space` or `Enter` hotkey detection when victory modal is active, immediately advancing to the next labyrinth for fast-paced continuous play without requiring mouse clicks.
  - **Tactile UI Audio Cues & Footstep Pitch Jitter (BL-35)**: Added frequency randomization ($\pm 3\%$) to footstep synthesizer audio to eliminate repetitive ear fatigue during long exploration sessions; added procedural micro-click sound feedback on tab navigation and crumb clicks.
  - **Save State Versioned Migration Runner (BL-36)**: Implemented automated `StorageManager.migrateSaveData()` upgrading legacy save schemas on initial boot without data loss (normalizing medals, bestSecrets, and score tallies).
  - **1-Click Diagnostic Bug Bundle Exporter (BL-34)**: Built `StorageManager.exportDiagnosticBugBundle()` gathering session telemetry, level ID, player coordinates, move history, and logs into a pre-filled, labeled GitHub issue report.
  - **Prestige Victory Confetti Cannon (BL-38)**: Built Canvas 2D drifting physics confetti particle bursts on victory modal activation.
  - **High-Contrast Accessibility Mode (BL-26)**: Added persistent high-contrast grid outline and background palette toggle in settings modal and auto-applied on startup.
  - **Automated QA Coverage**: Expanded test harness to 94 test suites and 468 tests (0 failed, 7,039 assertions, 23/23 zero-drift checks passed).
- [x] **SOLID Geometry Foundation, Cloudless Backup & Visual Guides Sprint (BL-37, BL-53, BL-61)**:
  - **Clean Geometry Value Objects (BL-61)**: Implemented immutable, frozen Value Objects `Vec2`, `GridRect`, and `Heading` in `js/core/geometry.js` providing pure functional 2D coordinates, rect bounds containment/overlap, and cardinal directional transformations.
  - **1-Click Save Data & Profile Backup / Restore (BL-53)**: Implemented cloudless JSON export and import in `StorageManager` (`exportFullBackup`, `importFullBackup`, `downloadFullBackupFile`) and integrated 1-click backup/restore triggers into `SettingsModal`.
  - **Visual Multi-Elevation Bridge & Ramp Guide (BL-37)**: Added responsive vector SVG diagrams in the Architect Handbook (`editor.html` & Guide Modal) illustrating exact `B_EW` and `B_NS` bridge deck crossing and directional approach ramp configurations (`R_S`, `R_N`, `R_E`, `R_W`).
  - **Automated QA Coverage**: Expanded test harness to 97 test suites and 480 tests (0 failed, 7,131 assertions, 23/23 zero-drift checks passed).
- [x] **InputManager, Gamepad Controller Support & Procedural Maze Generator Sprint (BL-40, BL-50, BL-59)**:
  - **Clean Input Architecture & Command Pattern (BL-59)**: Implemented `InputManager` (`js/engine/input-manager.js`) adhering to Single Responsibility Principle (SRP), centralizing hardware event listeners, directional vector math, and semantic game command dispatching (`MOVE`, `INTERACT`, `ROTATE_LEFT`, `ROTATE_RIGHT`, `TOGGLE_MAP`, `TOGGLE_VIEW_MODE`, `RESTART`, `PAUSE`).
  - **Gamepad API Controller Support (BL-40)**: Built standard HTML5 Gamepad API polling into `InputManager` supporting USB and Bluetooth controllers: Left Analog Stick with 0.28 deadzone filtering, D-Pad buttons 12–15, Button A/Cross for inspect & interact, Button B/Circle & Start for in-game pause, Bumpers (LB/RB) for 90° camera rotation, and edge-triggered button debouncing.
  - **Procedural Maze Generator & Studio Modal (BL-50)**: Built `MazeGenerator` (`js/core/maze-generator.js`) generating 100% solvable labyrinths via randomized depth-first search with customizable dimensions (clamped odd dimensions $\ge 7$), biome themes, circuit braid factor (reducing dead ends to create interconnected loop circuits), and reachable key-door puzzle gating; added "⚡ Generate" toolbar button and `#modal-maze-generator` in `editor.html` and `EditorUI`.
  - **Automated QA Coverage**: Expanded test harness to 100 test suites and 491 tests (0 failed, 7,225 assertions, 23/23 zero-drift checks passed).
- [x] **Custom Prefabs, BaseEntity Domain Models & Code Elegance Standards Sprint (BL-39, BL-57, BL-62)**:
  - **Polymorphic Entity Domain Models (BL-57)**: Created `BaseEntity` (`js/entities/base-entity.js`) domain foundation integrating frozen immutable `Vec2` positions, polymorphic `canInteract()`, `onInteract()`, `isBlocking()`, and self-documenting interaction prompts (`getPrompt()`); refactored `Key`, `Door`, and `Lever` to extend `BaseEntity`, replacing brittle switch-case logic with polymorphic object-oriented contracts.
  - **Custom Prefab Saving in Map Editor (BL-39)**: Implemented `captureLevelRegionAsPrefab()`, `saveCustomPrefab()`, `getCustomPrefabs()`, `deleteCustomPrefab()`, and `clearCustomPrefabs()` in `js/editor/prefabs.js`; updated `stampPrefab()` and `EditorCanvas` ghost preview to dynamically resolve custom user prefabs; created `#modal-save-prefab` and sidebar custom prefab palette in `editor.html` and `EditorUI` with 1-click region capture, dynamic stamping, and deletion management.
  - **Automated QA Coverage**: Expanded test harness to 102 test suites and 500 tests (0 failed, 7,297 assertions, 23/23 zero-drift checks passed).
- [x] **Mobile Movement, Moveable Top Controls, Minimal UI & Safety Confirmations Sprint (BL-63, BL-64)**:
  - **Moveable & Top-Docked Virtual Controls (BL-63)**: Defaulted `#virtual-controls` to top-left (`top: 4.25rem; left: 1rem;`) freeing bottom screen from mobile browser gesture bars; implemented 4-quadrant docking cycles (`top-left`, `top-right`, `bottom-left`, `bottom-right`), drag handle repositioning with viewport boundary clamping and `localStorage` persistence, and minimize toggle (`_` / `▲`).
  - **Effortless Mobile Movement & Auto-Repeat (BL-63)**: Added continuous tap-and-hold auto-repeat to directional virtual buttons (115ms interval following 220ms initial hold delay) across both touch and mouse events; added direct camera rotation buttons (`↺` [Q] and `↻` [R]) on the virtual pad.
  - **Destructive Action Safety Confirmations (BL-64)**: Added double-confirmation modal flows with explicit Cancel and Confirm buttons for `StorageManager.resetAllProgress()`, custom prefab deletion in Map Editor, and procedural maze generator canvas overwrites.
  - **Minimalist UI & Modal Scroll Containment (BL-64)**: Refactored modal layouts with clamped viewport heights (`88vh`), smooth touch scrolling (`-webkit-overflow-scrolling: touch; overscroll-behavior: contain`), sticky footers preventing offscreen buttons, non-blocking toast notifications (`pointer-events: none`), and mobile tutorial hint collapsing.
  - **Automated QA Coverage**: Expanded test harness to 103 test suites and 504 tests (0 failed, 7,325 assertions, 23/23 zero-drift checks passed).
- [x] **Tactical Minimap Elevation Shading & High-Contrast Canvas Contours Sprint (BL-65, BL-66)**:
  - **Tactical Minimap Elevation & Entity Shading (BL-65)**: Rendered elevated bridge spans (`B_EW`, `B_NS`) with distinct cobalt deck fills (`#0369a1`) and bright cyan center walkway planks (`#38bdf8`); rendered directional approach ramps (`R_*`) with incline shading and directional indicators; overlaid overhead walkway layer with subtle cyan tint; rendered explored uncollected keys (`#facc15`), locked door barrier bars (`#ef4444`), lever switch nodes, and teleporters on the minimap; added atmospheric radar sonar sweep radiating from explorer location with cyan elevation rings when aloft on upper decks (`player.elevation === 1`) and tactical HUD corner brackets.
  - **Canvas High-Contrast Contours & Assist Halos (BL-26, BL-66)**: Added high-contrast contour rendering pass in `GameRenderer` stroking wall perimeters with 2px solid white borders (`#ffffff`) and wrapping player avatar with dual-tier neon yellow (`#facc15`) and white (`#ffffff`) halo rings across angled, classic, and overhead projections; added pitch-black backdrop (`#000000`) and high-contrast tile contours to Minimap.
  - **Automated QA Coverage**: Created `tests/unit/engine/tactical-minimap.test.mjs`; expanded test harness to 105 test suites and 510 tests (0 failed, 7,340 assertions, 23/23 zero-drift checks passed).
- [x] **Continuous Touch Drag Steering, Pathfinding Waypoints & Pause Confirmation Safety Sprint (BL-67, BL-68)**:
  - **Continuous Touch Drag Steering (BL-67)**: Implemented fluid directional drag steering on mobile canvas with 125ms auto-step repeat rate and dynamic mid-drag heading adjustments.
  - **Pathfinding Waypoint Trail (BL-67)**: Rendered glowing cyan waypoint dots connecting player position to tapped destination tile along BFS corridor route.
  - **Pause Menu Destructive Confirmation Safety (BL-68)**: Added explicit confirmation dialogs protecting Restart Level and Return to Level Select against accidental mobile taps.
  - **Collapsible Top Minimap Radar (BL-68)**: Maintained top-docked minimap radar on mobile viewports (`top: 4.25rem; right: 0.75rem;`), freeing the bottom canvas from touch gesture conflicts, with 1-tap minimize toggle (`_`/`▲`) and localStorage persistence.
  - **Automated QA Coverage**: Created `tests/unit/ui/mobile-movement-and-minimap.test.mjs`; expanded test harness to 107 test suites and 513 tests (0 failed, 7,353 assertions, 23/23 zero-drift checks passed).
- [x] **Universal Feedback Modal, Live Telemetry & Settings Gamepad Tester Sprint (BL-69, BL-70)**:
  - **Universal Feedback & Bug Reporting Modal (BL-69)**: Created `FeedbackModal` (`js/ui/feedback-modal.js`) and unified action triggers in `app-header.js` (`#btn-app-feedback`, `#btn-footer-feedback`) and `settings-modal.js` (`#btn-settings-open-feedback`); auto-generates 1-click diagnostic telemetry bundles with active level ID/title, client screen/viewport/DPR/touch support, engine version, player coordinates, inventory state, and settings; provides 1-click clipboard markdown copying with fallback support and pre-filled GitHub issue link generation.
  - **Interactive Gamepad Guide & Live Input Tester (BL-70)**: Added collapsible controller visual mapping diagram in `SettingsModal` (`#settings-gamepad-details`) illustrating cardinal movement, button 0 (interact), button 1 (pause/cancel), button 2 (view mode), bumpers (camera rotation), and select (minimap); added real-time Gamepad API polling loop (`_updateGamepadStatus()`) highlighting pressed buttons (`.gp-indicator`) and displaying live analog stick coordinates.
  - **Automated QA Coverage**: Created `tests/unit/ui/feedback-modal.test.mjs`; expanded test harness to 108 test suites and 517 tests (0 failed, 7,388 assertions, 23/23 zero-drift checks passed).
- [x] **Universal Interactive Guide & Mechanics Handbook Modal Sprint (BL-71, CMP-16)**:
  - **Universal Interactive Guide & Handbook Modal (BL-71)**: Created `GuideModal` (`js/ui/guide-modal.js`) and unified action triggers in `app-header.js` (`#btn-app-guide`, `#btn-footer-guide`); structured multi-tabbed glassmorphic interface with Controls & Multi-Input reference, Labyrinth Puzzle Entities glossary, Multi-Elevation Bridge & Directional Ramp visual SVG diagrams, and Secrets / Par Calibration / Medal Tiers guide; uplifted CMP-16 from 34.66 to **44.00 / 60 (73.3% B Tier)**.
  - **Automated QA Coverage**: Created `tests/unit/ui/guide-modal.test.mjs`; expanded test harness to 109 test suites and 521 tests (0 failed, 7,420 assertions, 23/23 zero-drift checks passed).
- [x] **Multi-Elevation BFS Pathfinding, Deadzone-Free Touch & Universal Destructive Confirmations Sprint (BL-72, BL-73, BL-74)**:
  - **Multi-Elevation BFS Pathfinding (BL-72)**: Enhanced `findPathTo` in `GameLoop` eliminating flawed single-elevation pre-check heuristics; BFS dynamically explores elevation states via `CollisionEngine.checkMove()`, allowing effortless 1-tap navigation from ground floor through directional ramps (`R_S`, `R_N`, `R_E`, `R_W`) onto upper bridge decks (`B_EW`, `B_NS`) and across complex multi-elevation labyrinths; seamlessly routes to closest adjacent tile when tapping solid obstacles, closed doors, and interactive levers.
  - **Deadzone-Free Mobile Touch Tap & Steering Sensitivity (BL-72)**: Eliminated touch tap deadzone (where micro-drags between 15px and 24px were dropped without moving); lowered drag steering deadzone threshold to 20px (120ms auto-step repeat) for fluid, responsive mobile steering and 1-tap movement.
  - **Universal Popup Avoidance & Inline Destructive Confirmations (BL-73)**: Eradicated intrusive native browser `confirm()` popups across the entire codebase; added sleek, non-blocking inline confirmation boxes in `ProfileModal` for "Reset Save", in `SettingsModal` for "Restore Save Backup", and created `#modal-clear-confirm` in `editor.html` & `EditorUI` protecting canvas clears with <kbd>Ctrl+Z</kbd> undo recovery instructions.
  - **Top Navigation Exit Safety Routing (BL-74)**: Protected `← Hub` in `maze.html` top navigation during active labyrinths (steps > 0 or keys held), routing to `gameMenu.promptQuit()` confirmation dialog, preventing accidental mobile taps from discarding game progress.
  - **Automated QA Coverage**: Created `tests/unit/engine/multi-elevation-pathfinding.test.mjs`; expanded test harness to 111 test suites and 526 tests (0 failed, 7,457 assertions, 23/23 zero-drift checks passed).
- [x] **Action Activity Feed, Level Lore Journal & Unobtrusive Examination UX Sprint (BL-81, CMP-06)**:
  - **Single-Prompt Note Examination**: Eradicated the 3-popup barrage on Architect Note stepping; stepping onto a note tile now renders ONLY a single in-world indicator (`📜 [E] Read Architect Note`) without auto-opening modals or firing full-screen toasts.
  - **Action Activity Feed & Category Filter Toggles**: Upgraded real-time Activity Feed into a sleek docked game widget at bottom-left with category filter pills (`All`, `📜 Lore`, `⚙️ Mech`, `🗝️ Items`) and minimize toggle (`_`/`▲`), recording discrete mechanisms, gates, keys, and lore while filtering out step noise.
  - **Level Lore Journal**: Added companion HUD button (`#hud-journal-btn`) with dynamic counter and hotkey (`J`), opening the Level Lore Journal modal (`#journal-modal`) to browse and examine all discovered Architect Notes and wall murals in a parchment viewer.
  - **Configurable Note Presentation Mode**: Added setting in SettingsModal (`Note & Lore Presentation`) allowing players to toggle between `Card Modal Popup` and `Activity Feed Stream`.
  - **Automated QA Coverage**: Created `tests/unit/ui/lore-journal.test.mjs`; expanded test harness to 118 test suites and 553 tests (0 failed, 7,744 assertions, 23/23 zero-drift checks passed).
- [x] **Architectural Entrance & Exit Visuals Sprint (BL-82, CMP-02)**:
  - **Wall-Integrated Entrance Doorways**: Dynamically detects when spawn is adjacent to a wall (prioritizing North front wall face) and renders a stone keystone archway, dark tunnel recess, heavy ajar wooden door with iron straps, mounted torch sconces, and ambient floor light spill.
  - **Wall-Integrated Exit Archways**: Dynamically detects when exit is adjacent to a wall and renders an imposing carved stone portal arch with daylight sunbeams or cosmic portal ether and stone threshold apron.
  - **Freestanding 3D Spiral Staircases**: When spawn or exit has no adjacent walls (freestanding in open space), renders a 3D spiral stairwell (descending well into darkness with circular balustrade and floor shadow for spawn, ascending spiral steps with golden daylight shaft for exit).
  - **Automated QA Coverage**: Created `tests/unit/engine/entrance-exit-visuals.test.mjs`; expanded test harness to 119 test suites and 562 tests (0 failed, 7,762 assertions, 23/23 zero-drift checks passed).
- [x] **Celestial Cipher Dials & Thematic Wall Murals Sprint (BL-83, CMP-06, CMP-14)**:
  - **Thematic Celestial Vocabulary**: Replaced arbitrary numeric digits with 6 celestial symbols (`CELESTIAL_SYMBOLS`): ☀️ Sun, 🌙 Moon, 🌅 Horizon, ⭐ Star, 🪐 Planet, ☄️ Comet.
  - **PuzzleModal Dial Rendering**: Upgraded `PuzzleModal` dial columns to render rich icons, capitalized labels, glowing symbol accent borders, and cycling arrow controls.
  - **In-World Riddle Murals**: Inscribed celestial wall carvings and murals across Level 22 (Sun, Moon, Horizon), Level 23 (Horizon, Moon, Star), Level 24 (Star, Moon, Horizon), and Level 27 (Horizon, Sun, Star), enabling players to deduce cipher solutions logically from lore clues without brute-force guessing.
  - **Manifest Hash Integrity**: Updated embedded level files and generated SHA-256 hashes ensuring zero drift across all 42 levels.
- [x] **Hardcoded Entrance & Exit Layout, Clash Detection & Editor Assistant Sprint (BL-84, CMP-02, CMP-08)**:
  - **Zero Dynamic Inference at Runtime**: Decoupled engine rendering from runtime `detectAdjacentWall` guesswork; `GameRenderer` strictly honors explicit level definitions (`spawn.style`, `spawn.wallDirection`, `exit.style`, `exit.wallDirection`), rendering wall doorways/archways only when explicitly configured on the level.
  - **Comprehensive Architectural Clash Detection**: Added collision & overlap validation in `LevelValidator` detecting when wall doorways or archways clash with adjacent entities (such as `wall_decor` carvings, signposts, or items) on the wall drop face or threshold tile, as well as warning when anchored to non-wall tiles.
  - **Map Editor Architectural Assistant**: Enhanced `EntityInspector` with wall direction selectors (`WALL_DIRECTIONS`), live architectural clash notices, and a 1-click "💡 Suggest Style & Wall" assistant automatically recommending clean wall doorways or falling back to freestanding stairwells when wall faces are occupied.
  - **Level Hardcoding & Manifest Synchronization**: Explicitly configured styles and wall anchor directions across all 42 official campaign, tutorial, and story levels without a single entity clash (Level 5 canopy carving preserved with freestanding descent); synchronized `levels/manifest.json` SHA-256 hashes and dimensions with 23/23 zero-drift checks passing.
  - **Automated QA Coverage**: Created `tests/unit/editor/entrance-exit-clash.test.mjs` and updated `tests/unit/engine/entrance-exit-visuals.test.mjs`; expanded test harness to 121 test suites and 572 tests (0 failed, 7,823 assertions, 23/23 zero-drift checks passed).
- [x] **Directional Proximity Interaction & Multi-Target Disambiguation Sprint (BL-85, CMP-05, CMP-06)**:
  - **Directional Proximity Restriction (`interactDirections`)**: Added `interactDirections` property across all entities (`['north', 'south', 'east', 'west', 'self']`), enforced via `isApproachAllowed` helper in `constants.js` and `canInteract` across `BaseEntity`, `Signpost`, `WallDecor`, `Lever`, `PuzzleGate`, `Pedestal`, `RiddleItem`, and `Door`. Prevents nonsensical interactions from behind wall backs, pillar faces, or closed barriers.
  - **Multi-Target Disambiguation Engine**: Implemented `GameLoop.getAllAvailableInteractions()`, gathering all reachable candidates within distance <= 1, sorting by player facing direction (front-facing = #1, current-tile = #2, flanks = #3), and formatting numbered candidates (`[1]`, `[2]`, ...).
  - **In-World Numbered Pills & Action Drawer HUD**: When >= 2 interactables are nearby simultaneously, renders numbered pills (`.hud-disambig-pill`) floating directly over each item with number badge (`1..N`) and item name/title; renders numbered action drawer (`#hud-disambig-drawer`) with clickable rows.
  - **Disambiguated Keyboard & Touch Controls**: Pressing numeric keys `1`..`9` immediately triggers the chosen entity; clicking in-world pills or drawer rows activates that item; pressing default interact key `[E]` triggers candidate #1 (the facing entity). Preserves clean single-prompt `[E]` experience when only 1 item is nearby.
  - **Map Editor Entity Inspector**: Added "Allowed Interaction Approaches" multi-checkbox controls in `EntityInspector` enabling level creators to selectively configure approach directions on all interactable entities.
  - **Automated QA Coverage**: Created `tests/unit/engine/interact-directions-disambiguation.test.mjs`; expanded test harness to 122 test suites and 577 tests (0 failed, 7,882 assertions, 23/23 zero-drift checks passed).
- [x] **Lever Interaction Separation, Floor-Plate Traps & Level 23 Celestial Gate Sealing (BL-86, CMP-03, CMP-06)**:
  - **Lever Manual Interaction Enforcement**: Removed automatic toggling of levers when stepped on in `GameLoop.handleCellArrival()`. Standard levers (`switch_lever`, `pressure_pedestal`, `crystal_switch`, `runic_plate`, `cog_wheel`) now strictly require manual engagement via `[E]`, click, or disambiguation selection (`1..9`).
  - **Floor-Plate Trap Support (`floor_plate`)**: Added `floor_plate` to `LEVER_STYLES` in `constants.js` and introduced `triggerOnStep`, `autoTriggerOnce`, and `hasTriggered` properties on `Lever`. Floor-plate traps auto-trigger once when stepped on with warning visual effects (`⚠️` / `💥`), while ignoring repeat stepping when `autoTriggerOnce` is set.
  - **Level 23 Celestial Gate Airtight Sealing**: Sealed the bypassable corridor around `puzzle_gate_23_cipher` in Level 23 (*The Entangled Wards*) by placing divider walls at column 14 (rows 5, 6, 8, 9). Players can no longer reach the exit portal without solving both the Outer Rune Ward and the Inner Celestial Cipher Ward. Synchronized `levels/chapter_6/level_23.json`, `js/levels/campaign-ch6.js`, and `levels/manifest.json`.
  - **Automated QA Coverage**: Expanded `tests/unit/engine/interact-directions-disambiguation.test.mjs` and `tests/unit/levels/chapter-6.test.mjs`; verified 122 test suites and 579 tests (0 failed, 7,894 assertions, 23/23 zero-drift checks passed).
- [x] **Interactive Viewport Zoom & Consistent Optical Scale (BL-87, CMP-04, CMP-06)**:
  - **Decoupled Optical World Scale**: Anchored default world scale to 36px base tile size (`VIEWPORT_ZOOM.BASE_TILE_SIZE = 36`), ensuring larger labyrinths naturally extend beyond viewport bounds and scroll smoothly with camera follow rather than being squished into the screen.
  - **Zoom Engine & Projections**: Integrated zoom level (`0.5x` to `2.0x`) with dynamic `camera.tileSize`, preserving pixel-perfect tile projections, camera rotations, and collision bounds.
  - **Multi-Input Zoom Control Parity**: Supported keyboard shortcuts (`+`/`-`, `0` to reset), mouse wheel zoom on main canvas, two-finger mobile pinch-to-zoom, and glassmorphic HUD buttons (`−`, `100%`, `+`) in the top navigation island with `StorageManager` persistence (`viewport_zoom`).
- [x] **Character Customization, Replay Theater Graphics & Mobile Accessibility Sprint (BL-95, BL-96, BL-97, ADR-0014)**:
  - **Player Profile Character Visual Customization (BL-95)**: Introduced comprehensive character customization in Player Profile (`ProfileModal`), defining gender/body silhouettes (`MALE`, `FEMALE`, `NEUTRAL`), diverse hair styles (`SHORT`, `PONYTAIL`, `CURLS`, `BOB`, `BALD`), vibrant hair colors (`BRUNETTE`, `RAVEN`, `BLONDE`, `AUBURN`, `SILVER`, `AMETHYST`), and skin tones (`FAIR`, `WARM`, `OLIVE`, `BRONZE`, `DEEP`); persisted across sessions via `StorageManager` and dynamically rendered in `Player.prototype.drawExplorerSprite` and `HeroAmbientCanvas`.
  - **Replay Theater Full Graphic Simulation & Vector Alignment (BL-96)**: Aligned replay coordinates with level tile size (`this.gameLoop.tileSize` instead of hardcoded 32); preloaded SVG theme vector assets via `assetLoader` in `test.html` so walkthroughs and replays render full in-game graphics, lighting, and entity assets instead of fallback primitives.
  - **Mobile Feed Accessibility, Download Feedback & Site-Wide Button Verification (BL-97)**: Restored mobile feed visibility above virtual controls (`bottom: 5.5rem`) and added 1-tap `#hud-feed-pill` to collapsed HUD; provided clear download confirmation toasts/banners explaining download destination; audited and verified all buttons, links, and click targets across all pages for full touch and mouse compatibility.
- [x] **Custom Keybindings & Pointer Movement Toggle Sprint (Issue #63, BL-100, ADR-0016)**:
  - **Configurable Keybinding Presets (BL-100, CMP-04, CMP-15)**: Implement selectable movement key presets in `constants.js` and `InputManager` (`WASD & Arrows`, `Arrow Keys Only`, `ESDF`, `AZERTY (ZQSD)`, `Numpad (8462)`) with live persistence.
  - **Pointer Click-to-Move vs Drag Navigation Toggle (BL-100, CMP-04, CMP-15)**: Implement toggleable pointer movement modes in `GameLoop` and `SettingsModal` (`click_path` BFS pathfinding, `drag_only` swipe/drag steering, or `disabled`).
  - **Settings UI Controls Card**: Render interactive dropdowns for keyboard presets and mouse modes in `SettingsModal`.
- [x] **Visual Fidelity Polish & AAA Map Editor Studio Sprint (BL-101, BL-102, ADR-0017)**:
  - **Procedural Environmental Fidelity & Wall Sconce Flares (BL-101, CMP-02, CMP-11)**: Enhance canvas rendering with biome-specific micro-textures (cobblestones, flagstones, moss growth, mineral veins), dynamic animated torch sconces on walls with warm radial light flicker, corner ambient occlusion, and corridor dust particles.
  - **AAA Map Editor Studio Overhaul (BL-102, CMP-08, CMP-09, CMP-10)**: Redesign Map Editor UI into a dark glassmorphic professional IDE layout with categorized collapsible tool palettes, active tool indicator cards, interactive canvas mini-map overview HUD, real-time statistics telemetry, and polished tooltips.
- [x] **Interactive Map Editor Mini-Map Overview HUD & Surface Polish Sprint (BL-103, BL-104, BL-105, ADR-0018)**:
  - **Interactive Mini-Map Overview HUD (BL-103, CMP-08, CMP-10)**: Floating glassmorphic mini-map canvas (`#editor-minimap-hud`) tracking visible viewport bounds and enabling instant 1-click drag navigation across large labyrinths.
  - **Categorized Accordion Tool Palette (BL-104, CMP-08, CMP-09)**: Grouped sidebar tools into collapsible accordion cards (`Draw Tools`, `Tiles & Bridges`, `Elevation Ramps`, `Architectural Prefabs`, `Custom Prefabs`, `Entities & Markers`) with item count badges, rotating chevrons, and minimized workspace states.
  - **Procedural Surface Shaders & Animated Fluid Polish (BL-105, CMP-02, CMP-11)**: Animated water puddles with concentric ripples in Caves, Jungles, and Dungeons; molten lava bubbling hotspots in Magma; and diamond ice crystal sparkles in Snow biomes.
- [x] **Settings & In-Game Menu Overlay Consolidation Sprint (BL-106, BL-107, ADR-0019)**:
  - **In-Game Pause Command Center (BL-106, CMP-07)**: Redesigned the bulky monolithic 14-button pause menu drawer into a sleek, categorized 2-column command center (`Primary Actions`, `View & Exploration`, `Preferences & System`, `Session Exit`), eliminating vertical overflow and visual fatigue on laptops and mobile devices while preserving all button IDs, shortcuts, and tests.
  - **Segmented Settings Navigation Tabs (BL-107, CMP-15)**: Replaced the unwieldy 70vh monolithic settings scroll with a streamlined 5-category tab bar (`🔊 Audio`, `🎥 Display`, `🎮 Controls`, `💾 Save Data`, `🔬 Support`), supporting live keyboard navigation, instant tab switching via `switchTab(tabId)`, and direct category jumps without visual bloat.
  - **Automated QA Coverage**: Added tab switching assertions to `tests/unit/ui/app-header.test.mjs`; verified 126 test suites and 607 tests passing (0 failed, 8,123 assertions, 23/23 zero-drift checks passed).
- [x] **Universal Menu Navigation, Modal Stacking Isolation & Test Suite Sprint (BL-111, ADR-0020)**:
  - **Modal Backdrop Opacity & Interactivity Lifecycle (CMP-07, CMP-15)**: Fixed unclickable/invisible dialogs by strictly ensuring `SettingsModal`, `ProfileModal`, and `FeedbackModal` add the `.active` class to `.modal-backdrop` and `.modal-open` to `document.body` upon opening, and remove both on closing (aligning with `css/main.css` transition rules).
  - **Home Page Hero Settings Trigger (CMP-01)**: Added `#btn-hero-settings` to the hero action buttons bar on `index.html` and bound it to open `getSettingsModal()` with tactile audio feedback.
  - **Map Editor Properties Modal Isolation (CMP-08, CMP-15)**: Renamed Map Editor's Level Properties modal from `#settings-modal` to `#properties-modal` (and associated buttons to `#btn-properties`, `#properties-btn-close`, `#properties-btn-save`), preventing ID collision and listener hijacking of the global Settings dialog.
  - **Z-Index Modal Stacking Hierarchy (CMP-07, CMP-15)**: Elevated global dialog backdrops (`#settings-modal`, `#profile-modal`, `#feedback-modal`, `#guide-modal`) to `z-index: 1100`, ensuring they always stack cleanly in front of in-game pause and level complete overlays (`z-index: 1000`).
  - **Comprehensive Menus, Action Buttons & Settings Test Suite (CMP-07, CMP-15)**: Created `tests/unit/ui/menus-and-buttons.test.mjs` verifying header buttons, home hero buttons, pause drawer buttons, settings tab panels, profile codename persistence, and modal isolation.
  - **Automated QA Coverage**: 127 test suites, 614 tests passing (0 failed, 8,190 assertions, 23/23 zero-drift checks passed).
- [x] **Walkthrough Replay Fullscreen Grand Theater & Activity Feed Sprint (BL-112, ADR-0021)**:
  - **Expansive Theater Viewport & Dynamic Resizing (CMP-17)**: Replaced cramped 4:3 box in `test.html` with an expansive responsive theater viewport (`height: clamp(520px, 68vh, 800px)`); extended `ReplayPlayer` with dynamic canvas and camera resizing (`resize(w, h)`), ResizeObserver, and Fullscreen Theater Mode (`.is-fullscreen`, <kbd>F</kbd>/<kbd>Esc</kbd>).
  - **Synchronized Action Activity Feed (CMP-05, CMP-17)**: Integrated `#replay-activity-feed` overlay inside replay stage with category filter pills (`All`, `📜 Lore`, `⚙️ Mech`, `🗝️ Items`), animated cards, collapsible toggle (`_`/`▲`), and global event dispatch (`key:collected`, `door:unlocked`, `lever:toggled`, `teleport:used`, `player:elevation_changed`, `note:examined`) with seek-aware noise suppression.
  - **In-Game Floating HUD Islands & Tactical Minimap (CMP-05, CMP-17)**: Integrated top HUD cards (Level title, chapter, elevation, carried inventory keys with accessible colorblind geometric glyphs via `getKeyColorblindShape`, live timer, and step progress), perspective toggle (<kbd>V</kbd>), 90° camera rotation dial (<kbd>Q</kbd>/<kbd>R</kbd>), and dedicated tactical radar minimap canvas (`#replay-minimap-canvas`, <kbd>M</kbd>).
  - **Comprehensive Media Play Menu Deck (CMP-17)**: Engineered `#media-play-deck` with timeline scrubber, current/total timestamps, step counter pill, action telemetry badge, transport buttons (Restart, Prev Step, Hero Play/Pause, Next Step, Jump to End), continuous loop toggle, sound toggle, and speed selectors (`0.5x`..`8x`).
  - **Automated QA Coverage**: 128 test suites, 624 tests passing (0 failed, 8,271 assertions, 23/23 zero-drift checks passed) covering `tests/unit/engine/replay-player.test.mjs` and `tests/unit/ui/replay-theater-and-feed.test.mjs`.

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
- [ ] **Additional Puzzle & Trap Entities**:
  - [x] Floor-plate traps (momentary or single-fire activation when stepped on).
  - [ ] One-way directional gates / sliding doors.
- [x] **Strategic Fog of War & Exploratory Vision Dynamics (`BL-88`)**:
  - Expanded dynamic Fog of War into climatic campaign chapter finales (Level 4, 8, 12, 16, 20, 24, 28, 29, 30, 31, 32) with calibrated sight radii (`viewRadius: 6..7`), 360-degree raycasting line-of-sight, torch lighting glow, and explored memory shading, elevating exploration discovery and minimap radar value without breaking puzzle solvability (ADR-0011).
- [x] **Viewport Zoom & Consistent Optical Scale (`BL-87`)**:
  - Decouple canvas tile rendering from "fit-to-screen" squash; establish a default optical tile scale ($32\text{px}$–$40\text{px}$) so larger levels extend beyond viewport bounds and scroll cleanly with camera follow; provide intuitive zoom controls (`+`/`-`, mouse wheel, pinch-to-zoom, HUD buttons).
- [x] **Translucent Disambiguation & Two-Stage Interaction Reveal (`BL-91`)**:
  - Refine multi-target proximity HUD to eliminate player character visual occlusion: (1) Make in-world popups and drawers semi-translucent (`backdrop-filter`, `opacity: 0.82`, non-blocking footprint); (2) When multiple items are nearby, render only a single primary `[E]` interact indicator with a small quantity badge (e.g. `[E] • 3`); (3) Only reveal in-world numbered targets (`[1]`, `[2]`, `[3]`) and expanded action options *after* the initial <kbd>E</kbd> / tap is engaged, keeping the viewport pristine during movement.
- [x] **Responsive Viewport HUD Collapse, Mobile Clutter Elimination & Menu Auto-Pause (`BL-92`)**:
  - Prevent screen shrinking and mobile viewports from clumping topbars, sidebars, inventory, and telemetry over the game world: (1) Responsively collapse topbars, sidebars, radar, and feeds into compact floating quick-action pills/drawers with 1-tap expand/minimize states (`#btn-hud-collapse`, shortcut <kbd>H</kbd>, persistent via `localStorage`); (2) Eradicate overlapping HUD elements on viewports $< 768\text{px}$ via dedicated media query layout restructuring; (3) Automatically pause the engine whenever full-screen menus, modals, or expanded overlays obscure visibility of the player and active maze via `gameLoop.setObscured(true/false, modalId)`.
- [x] **Macro-Labyrinths & Classic Maze Topologies (`BL-89`, `BL-90`)**:
  - Expanded labyrinth scale into authentic macro-scale geometry without discarding existing levels by upgrading the subterranean Catacombs in *The Whispering Citadel* (`story_citadel_1`) into a sprawling $27 \times 27$ multi-wing megalabyrinth featuring concentric ambulatory halls, pillared sanctuaries, branching corridors, timed hazard gauntlets, and airtight zero-bypass Spire Keystone gating (ADR-0012).
- [x] **Viewport Zoom Optical Clamping & UI Isolation (`BL-93`)**:
  - Strictly clamp viewport zoom levels between $0.5\times$ and $2.0\times$ across all input modalities (mouse wheel, touch pinch, buttons, hotkeys); decouple HTML menus, sidebars, and modals from canvas zoom; inject `--camera-zoom` CSS variable and dynamically scale in-world overlay indicators (`.hud-tile-indicator`, `.hud-disambig-pill`) with `clamp(0.75, var(--camera-zoom, 1), 1.35)` to prevent visual rate mismatch and distortion (ADR-0013).
- [x] **Interactive Action Feed History & Companion Drawer (`BL-94`)**:
  - Eradicate activity feed ephemerality by adding an interactive history trigger (📜 / `#btn-feed-history`) and click handler on the feed header/items; open comprehensive Activity History companion modal with categorized chronological events and filter pills (`All`, `Lore`, `Mech`, `Items`, `Warnings`) (ADR-0013).

### Strategic Architecture Initiative: Modernization & SOLID Refactoring (`v2.0.0` Roadmap)
*Objective: Transform monolithic "god-classes" and procedural switch blocks into simple, elegant, explainable, highly testable, readable, and robust Object-Oriented modules adhering strictly to SOLID principles and clean architectural separation.*

- [ ] **Engine Decomposition & SRP Refactoring (`BL-56`)**:
  - Split `js/engine/game-loop.js` (2,250+ lines) into single-responsibility collaborators: `MovementController` (motion and collision mediation), `InteractionDispatcher` (entity interaction routing), and `GameStateManager` (scoring, time, steps, level lifecycle).
  - Target module size: $\le 300$ lines per file.
- [ ] **Polymorphic Entity Domain Models (`BL-57`)**:
  - Refactor procedural entity switch/case blocks into object-oriented classes (`KeyEntity`, `DoorEntity`, `LeverEntity`, `PedestalEntity`, `HazardEntity`) implementing an explicit `Interactable` / `Collidable` contract (`canInteract()`, `onInteract()`, `onCollide()`, `getPrompt()`).
  - Upholds Open/Closed Principle: new entity types can be added without mutating core engine files.
- [ ] **Editor Studio Modularization (`BL-58`)**:
  - Split `js/editor/editor-ui.js` (1,800+ lines) into cohesive controllers: `ToolbarController`, `ProjectModalManager`, `DiagnosticsController`, and `EditorShortcutHandler`.
- [ ] **Clean Input Handling & Command Pattern (`BL-59`)**:
  - Extract input listeners from `GameLoop` and HTML pages into a standalone `InputManager` emitting semantic `GameCommand` objects (`MoveCommand`, `InteractCommand`, `RotateCommand`).
  - Enables clean, headless-safe unit testing of input semantics without mock DOM event dispatch.
- [ ] **Decoupled UI Contract & Presentation Layer (`BL-60`)**:
  - Replace ad-hoc `uiCallbacks` object literals with an explicit `IGamePresenter` interface contract and granular event subscriptions (`onInventoryChanged`, `onStepTaken`, `onElevationChanged`), eliminating full-DOM recalculations on every step and TDZ initialization hazards.
- [ ] **Value Objects & Clean Geometry Math (`BL-61`)**:
  - Replace loose `{x, y}` object literals and repeated ad-hoc math with immutable Value Objects: `Vec2` / `Coord2D`, `GridRect`, and `Heading` with self-documenting methods.
- [ ] **Defensive Guard Clauses & Code Elegance Standards (`BL-62`)**:
  - Publish ADR-007 establishing standards for early return guard clauses, eradication of magical sentinel numbers, maximum file length guidelines ($\le 300$ lines), and consistent error handling paradigms.

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
| [0007](adr/0007-solid-principles-and-code-elegance.md) | SOLID Principles, Entity Domain Polymorphism, and Code Elegance | Accepted | 2026-10-02 |
| [0008](adr/0008-lever-interaction-separation-and-floor-plate-traps.md) | Lever Manual Interaction Separation and Floor-Plate Trap Mechanics | Accepted | 2026-10-09 |
| [0009](adr/0009-translucent-disambiguation-and-two-stage-reveal.md) | Translucent Disambiguation and Two-Stage Interaction Reveal | Accepted | 2026-10-09 |
| [0010](adr/0010-responsive-hud-collapse-and-menu-auto-pause.md) | Responsive HUD Collapse, Mobile Clutter Elimination, and Obscured Menu Auto-Pause | Accepted | 2026-10-09 |

---

## 4. Release Checklist

When preparing a release or submitting a major update:
1. Run `npm test` and verify 100% pass rate.
2. Verify all campaign JSON levels in `levels/` and `levels/manifest.json` are valid.
3. Test locally with a static server (`python -m http.server 8000`) across desktop keyboard and mobile touch controls.
4. Verify `CNAME` is untouched and relative asset paths are intact for GitHub Pages.
5. Update this file and `PROJECT_CONTEXT.md` to reflect any new features or schema changes.
