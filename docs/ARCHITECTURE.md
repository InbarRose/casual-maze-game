# System Architecture & Technical Subsystems

This document provides a comprehensive technical overview of the **Casual Maze Game** engine, coordinate systems, rendering pipeline, collision algorithms, and editor subsystem.

---

## 1. High-Level Architecture Overview

The Casual Maze Game is a 100% static, client-side web application designed to run in all modern desktop and mobile browsers without requiring any backend servers or Node runtime in production.

```text
┌─────────────────────────────────────────────────────────────┐
│                       Browser Window                        │
├─────────────────────────┬───────────────────────────────────┤
│    Game View (maze.html)│    Editor View (editor.html)      │
│  ┌───────────────────┐  │  ┌─────────────────────────────┐  │
│  │     GameLoop      │  │  │          EditorUI           │  │
│  │ ┌───────────────┐ │  │  │ ┌─────────────┐ ┌─────────┐ │  │
│  │ │ Camera2D      │ │  │  │ │EditorCanvas │ │Inspector│ │  │
│  │ ├───────────────┤ │  │  │ ├─────────────┴─┴─────────┤ │  │
│  │ │ Collision     │ │  │  │ │ LevelValidator (BFS)    │ │  │
│  │ ├───────────────┤ │  │  │ ├─────────────────────────┤ │  │
│  │ │ FogOfWar(LoS) │ │  │  │ │ JsonExporter & Projects │ │  │
│  │ ├───────────────┤ │  │  │ └─────────────────────────┘ │  │
│  │ │ GameRenderer  │ │  │  └─────────────────────────────┘  │
│  │ ├───────────────┤ │  │                                   │
│  │ │ DebugLogger   │ │  │                                   │
│  │ └───────────────┘ │  │                                   │
│  └───────────────────┘  │                                   │
├─────────────────────────┴───────────────────────────────────┤
│                   Shared Core & Levels                      │
│ ┌────────────┐ ┌───────────┐ ┌─────────────┐ ┌────────────┐ │
│ │Constants   │ │ EventBus  │ │LevelLoader  │ │StorageMgr  │ │
│ └────────────┘ └───────────┘ └─────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & File Map

```text
casual-maze-game/
├── .github/
│   └── workflows/
│       └── ci.yml                # Automated CI running test suite on pushes/PRs to main
├── CNAME                         # Domain mapping (casual-maze-game.inbarrose.com)
├── README.md                     # User-facing overview, gameplay controls, and quickstart
├── AGENTS.md                     # Standard agent operating procedures & PR workflows
├── PROJECT_CONTEXT.md            # Technical context and subsystem summary
├── index.html                    # Hub / Level Select / Tutorial Academy
├── maze.html                     # Game canvas viewport interface
├── editor.html                   # Handcrafted maze architect and JSON level designer
├── test.html                     # Diagnostics, Replay Theater & In-Browser Test Lab
├── test/
│   └── index.html                # Static redirect to `../test.html` for clean `/test` routing
├── package.json                  # Test script runner (`npm test`)
├── test-suite.mjs                # Backward-compatible proxy to `tests/run-all.mjs`
├── tests/                        # Modular Test Architecture & User Journeys
│   ├── browser-test-runner.js    # Master in-browser test aggregator and runner
│   ├── harness/                  # Test runner, assertions, and Node.js DOM/storage mocks
│   │   ├── index.mjs             # Unified harness export
│   │   ├── runner.mjs            # describe, it, suite grouping, filtering (--suite, --grep)
│   │   ├── assertions.mjs        # assert, assertEqual, assertDeepEqual, assertThrows
│   │   └── mocks.mjs             # Storage polyfills, mock canvas/DOM, FileReader/Blob
│   ├── helpers/                  # Test utilities & game simulation helpers
│   │   └── campaign-solver.mjs   # BFS state-space solver & GameLoop simulation runner
│   ├── unit/                     # Granular subsystem unit test suites
│   │   ├── core/                 # prng, events, storage, constants
│   │   ├── engine/               # collision, fog, camera, debug-logger, perspective-renderer
│   │   ├── entities/             # player, key, door, lever, signpost, dynamic-activities, riddle-item, pedestal
│   │   ├── levels/               # level-loader, json-integrity, campaign, tutorial
│   │   ├── stories/              # storylines registry, chapter navigation, level validation
│   │   ├── editor/               # level-validator, json-exporter
│   │   └── ui/                   # audio-fx synthesizer, in-game pause & action menu
│   ├── integration/
│   │   ├── campaign/             # Per-chapter modular campaign playthrough test suites
│   │   │   ├── chapter-1.test.mjs ... chapter-7.test.mjs
│   │   └── journeys/             # End-to-end simulated player & architect workflows
│   │       ├── tutorial-progression.journey.test.mjs
│   │       ├── campaign-progression.journey.test.mjs
│   │       ├── campaign-solvability.journey.test.mjs
│   │       ├── editor-authoring.journey.test.mjs
│   │       ├── fog-exploration.journey.test.mjs
│   │       ├── multi-elevation.journey.test.mjs
│   │       ├── interactive-activities.journey.test.mjs
│   │       ├── obstacle-interactions.journey.test.mjs
│   │       ├── wall-art-checkpoints-bonus.journey.test.mjs
│   │       ├── riddle-pedestals.journey.test.mjs
│   │       └── storylines-progression.journey.test.mjs
│   └── run-all.mjs               # Master test runner entrypoint
├── docs/                         # Documentation & Architecture Records
│   ├── ARCHITECTURE.md           # Deep subsystem architecture & engine details (this file)
│   ├── TESTING_PLAN.md           # Comprehensive testing strategy, matrices & CI gating
│   ├── LEVEL_SCHEMA.md           # Canonical JSON level schema and entity specs
│   ├── PROJECT_MANAGEMENT.md     # Milestone tracking, roadmap & active backlog
│   └── adr/                      # Architectural Decision Records (ADRs)
│       ├── README.md             # ADR index and template
│       ├── 0001-static-canvas-modular-engine.md
│       ├── 0002-multi-elevation-bridge-system.md
│       ├── 0003-tutorial-system-and-level-toggles.md
│       ├── 0004-zone-grouping-and-thematic-tilesets.md
│       ├── 0005-angled-topdown-perspective-and-dynamic-activities.md
│       └── 0006-camera-world-rotation-branching-rooms.md
├── levels/                       # Standalone Level JSON Files & Manifest
│   ├── manifest.json             # Master level registry (42 campaign, tutorial, and story levels)
│   ├── tutorial/                 # Tutorial Academy levels (1-6)
│   ├── stories/                  # Episodic Storyline levels (Four Guardians 1-3, Whispering Citadel 1)
│   └── chapter_1/ ... chapter_8/ # 32 Megalabyrinth campaign JSON files
├── css/
│   ├── main.css                  # Shared UI design tokens, typography, hub styling
│   ├── game.css                  # Canvas overlay, HUD, minimap, mobile d-pad, puzzle modal
│   └── editor.css                # Editor toolbars, entity inspector, palette, validator
├── js/
│   ├── core/
│   │   ├── constants.js          # Tile types, entity enums, key mappings, layer IDs, rotation matrices
│   │   ├── prng.js               # Mulberry32 deterministic pseudo-random generator
│   │   ├── events.js             # Pub/Sub EventBus for decoupled engine communication
│   │   └── storage.js            # LocalStorage / SessionStorage persistence wrapper
│   ├── engine/
│   │   ├── camera.js             # Viewport translation, lerp follow, free-pan mode, 90° rotation matrices
│   │   ├── collision.js          # Elevation-aware collision & directional bridge traversal
│   │   ├── fog.js                # 3-state fog-of-war (Unexplored, Explored, Visible)
│   │   ├── game-loop.js          # Delta-time coordinator, entity cycles, screen-relative navigation, room transitions
│   │   ├── minimap.js            # Dedicated HUD minimap canvas renderer
│   │   ├── renderer.js           # 2D/2.5D canvas drawing pipeline, vignettes, decor, rotation transforms
│   │   ├── debug-logger.js       # Runtime debug telemetry & replay JSON export
│   │   ├── solver.js             # Standalone BFS pathfinder & deterministic walkthrough replay generator
│   │   └── replay-player.js      # Interactive visual playback controller, scrub/seek, speed modulation
│   ├── entities/
│   │   ├── player.js             # Position, elevation state, inventory, carried riddle badges, screen facing
│   │   ├── key.js                # Collectible colored key entities
│   │   ├── door.js               # Locked barrier entities
│   │   ├── lever.js              # State-switching trigger entities (mutates grid tiles)
│   │   ├── signpost.js           # Readable lore tablets, journal notes, spatial hints
│   │   ├── teleporter.js         # Dimensional warp portals with 3D coordinate translation
│   │   ├── hazard.js             # Timed cyclical hazards & waypoint-navigating patrollers
│   │   ├── puzzle-gate.js        # Interactive minigame puzzle barrier entities
│   │   ├── checkpoint.js         # Mid-level checkpoint beacon with snapshot restoration
│   │   ├── collectible.js        # Bonus score collectibles and carriable torches
│   │   ├── wall-decor.js         # Atmospheric wall art, murals, and lore tablets
│   │   ├── riddle-item.js        # Carryable statues/relics for environmental puzzles
│   │   └── pedestal.js           # Inscribed socket pedestals with verification logic
│   ├── ui/
│   │   ├── audio-fx.js           # Procedural Web Audio API sound FX synthesizer (zero audio files)
│   │   ├── game-menu.js          # In-game Pause & Action Menu controller and modal bindings
│   │   └── puzzle-modal.js       # Pure static DOM modal for rune sequence and cipher dials
│   ├── levels/
│   │   ├── level-loader.js       # Schema validator, URL param parser, static level loader, room normalizer
│   │   ├── tutorials.js          # Tutorial academy levels (1-6)
│   │   ├── campaign-ch1.js ... campaign-ch8.js # Modular chapter level definitions
│   │   └── default-levels.js     # Aggregator exporting all campaign and tutorial levels
│   ├── stories/
│   │   └── storylines.js         # Storylines registry, chapter progression, Novice, Guardian, and Citadel sagas
│   └── editor/
│       ├── editor-canvas.js      # Grid painting, drag-placement, coordinate preview
│       ├── editor-ui.js          # Palette selection, layer toggling, toolbar bindings
│       ├── entity-inspector.js   # Interactive lever-to-target wiring & entity property forms
│       ├── level-validator.js    # Static schema checks, multi-room integrity & BFS reachability solver
│       ├── json-exporter.js      # File export/import parser via Web File API
│       └── modals/               # Modular editor dialog controllers
│           ├── projects-modal.js
│           ├── validation-modal.js
│           ├── playtest-modal.js
│           └── guide-modal.js
└── levels/
    ├── manifest.json             # Manifest of 42 levels (32 campaign, 6 tutorial, 4 story)
    ├── tutorial/                 # Handcrafted tutorial levels (tutorial_1.json .. tutorial_6.json)
    ├── stories/                  # Episodic story levels (story_guardians_1..3.json, story_citadel_1.json)
    ├── chapter_1/                # The Foundation (level_1.json .. level_4.json)
    ├── chapter_2/                # The Vertical Dimension (level_5.json .. level_8.json)
    ├── chapter_3/                # Shifting Architecture (level_9.json .. level_12.json)
    ├── chapter_4/                # Astral Anomalies (level_13.json .. level_16.json)
    ├── chapter_5/                # Rhythm & Danger (level_17.json .. level_20.json)
    ├── chapter_6/                # Arcane Seals (level_21.json .. level_24.json)
    ├── chapter_7/                # Grand Synthesis (level_25.json .. level_28.json)
    └── chapter_8/                # The Shifting Monolith (level_29.json .. level_32.json)
```

---

## 3. Core Engine Subsystems

### A. 3D Coordinate System & Layer Elevation (X, Y, Z)
* **3D Coordinate Tuple:** Space is represented canonically as `(X, Y, Z)`:
  * `X, Y`: Horizontal and vertical grid cell indices mapped to pixel space via `TILE_SIZE` (default `32px`).
  * `Z` (Elevation Level):
    * `Z = 0 (Ground)`: Default walking floor, standard walls, tunnels beneath bridges.
    * `Z = 1 (Overhead)`: Elevated walkways, bridge decks, canopies spanning across Ground level.
    * `Z = -1 (Basement)`: Subterranean vaults, sunken chambers, crypts.
* **Canonical Helpers:**
  * `formatXYZ(x, y, z)`: Returns standard string `(X, Y, Z)`.
  * `getElevationLabel(z)`: Returns human-readable label (`Ground (Z=0)`, `Overhead (Z=1)`, `Basement (Z=-1)`).
* **Multi-Layer System & Bridges:**
  * `BRIDGE_EW` (`B_EW`): Allows East <-> West traversal on `Z = 0` (Ground); allows North <-> South traversal on `Z = 1` (Overhead).
  * `BRIDGE_NS` (`B_NS`): Allows North <-> South traversal on `Z = 0` (Ground); allows East <-> West traversal on `Z = 1` (Overhead).
* **Directional Ramps:** `RAMP_N`, `RAMP_S`, `RAMP_E`, `RAMP_W` (`R_N`, `R_S`, `R_E`, `R_W`): Dynamically transition the player's elevation between `Z = 0` and `Z = 1` based on movement vector.
* **Collision Rule:** Movement evaluation checks walls, entity obstacles, and elevation bounds via `CollisionEngine.checkMove(fromX, fromY, toX, toY, elevation, level, entities, inventory)`. Both `nextZ` and `nextElevation` are returned.

### B. Viewport Camera & Pan Engine
* **Performance Clamping:** Tiles outside `[camX - halfWidth, camY - halfHeight]` to `[camX + halfWidth, camY + halfHeight]` are culled during rendering and line-of-sight updates.
* **Follow Mode:** Smooth linear interpolation (`lerp`) tracks the player's world position.
* **Free-Pan Mode:** Toggled with `[M]` or by clicking the map HUD. Allows full-map panning with WASD, arrow keys, or mouse drag.

### C. Fog-of-War & Line-of-Sight (LoS)
* **3-State Visibility Grid:**
  * `0: Unexplored` — Solid black veil on canvas and minimap.
  * `1: Explored / Memory` — Previously revealed terrain rendered at reduced brightness. Dynamic entities hidden.
  * `2: Visible` — Active line of sight. Fully illuminated with all interactive entities visible.
* **Raycasting:** 2D Bresenham raycasting radiates outward up to `config.viewRadius`. Wall tiles terminate ray propagation.
* **Map Revealed Mode:** When `config.mapRevealed === true`, the full maze layout begins in state `1 (Explored)`.

### D. Reactive State Engine (Keys, Doors, & Levers)
* **Inventory:** Collects unique colored keys (e.g. `key_ruby`, `key_sapphire`).
* **Doors:** Solid barriers requiring matching `requiresKey` ID. Unlocks and clears path upon contact.
* **Levers:** Interactive switches that mutate tile coordinates (e.g. toggling a wall between `0` and `1`).

### E. In-Editor Level Validator & BFS Solver
* Analyzes maze reachability using multi-pass Breadth-First Search (BFS).
* Simulates key pickups and unlocks downstream doors iteratively until the exit is reached or confirmed unreachable.
* Checks spawn coordinates, boundary integrity, and orphaned lever targets.

### F. Debug Logger & Teleplay
* Records timestamped events: movement attempts, rejection reasons (`wall`, `door_locked`), elevation changes, key acquisitions, and door opens.
* Exports complete session telemetry to JSON for replay verification and debugging.

### G. Angled Top-Down (2.5D) Perspective & Depth Pipeline
* **Dual Perspectives (`VIEW_PERSPECTIVES`):**
  * `TOPDOWN`: Orthographic flat plan-view rendering.
  * `ANGLED` (Default): 2.5D oblique perspective inspired by classic 16-bit action RPGs, rendering physical wall facades, vertical height displacement, and bridge pillars.
  * Toggled dynamically via `[V]` hotkey or HUD button (`📐 Perspective [V]`), preserving camera focus and state.
* **Dual-Plane Wall Rendering (`renderAngledWall`):**
  * Top cap face elevated upward by `wallH` (12px), rendered in lighter wall shade (`wallTop`) with inner highlights.
  * Vertical drop facade (front face) rendered in primary wall color with brick mortar joints, corner bevels, and ground cast shadows when adjacent south tile (`y + 1`) is open or at lower elevation.
* **Elevated Overpasses & Bridge Pillars (`renderAngledBridgeSpan`):**
  * Bridge spans rendered with physical vertical elevation (`heightOffset = 14px`).
  * Vertical support pillars anchored to the ground floor beneath bridge edges, featuring masonry texture and drop shadows.
  * Directional railings with corner posts and depth shadows.
* **Y-Depth Sorted Render Pipeline (`renderYSortedEntities`):**
  * Merges player avatar, keys, doors, levers, teleporters, hazards, and patrollers into a unified array.
  * Sorted back-to-front by `bottomY = worldY + tileSize * 0.4` (or `cy` for player).
  * Guarantees entities properly pass behind elevated wall caps and in front of lower wall facades.

### H. Dynamic Entities & Interactive Activities
* **Teleporter (`Teleporter`):**
  * Instantaneous 3D spatial warping between `(x, y, z)` and `(targetX, targetY, targetZ)`.
  * Cooldown timer (`cooldown = 1.0s`) prevents infinite ping-pong loops upon arrival.
  * Visual rendering includes rotating concentric portal rings, dimensional runes, and warping aura.
* **Timed Hazards (`TimedHazard`):**
  * Cyclical phase state machine: `DORMANT` -> `WARNING` -> `ACTIVE` -> `DECAYING`.
  * Configurable intervals (`intervalMs`), active durations (`activeDurationMs`), and warning windows (`warningDurationMs`).
  * Visual cues: telegraphing warning rings on floor, erupting flame jets or spike grids during active window.
  * Contact during active state triggers player respawn to last safe checkpoint and screen flash.
* **Patrollers (`Patroller`):**
  * Continuous waypoint navigation along cyclic loops (`LOOP`) or back-and-forth paths (`PING_PONG`).
  * Real-time linear interpolation (`x, y`), heading angle calculation (`angle`), and smooth visual orientation.
  * Circular bounding collision detection against player radius.
* **Puzzle Gates (`PuzzleGate`) & Modal UI (`PuzzleModal`):**
  * Impassable barrier gates that trigger interactive mental minigames when inspected or touched.
  * Supported puzzle types:
    * `RUNE_MEMORY`: Simon-style sequential pattern memorization across 4 celestial runes.
    * `CIPHER_DIAL`: 3-ring celestial rotary lock requiring alignment to secret target runes.
  * Pure static modal UI (`js/ui/puzzle-modal.js`) with responsive mouse and keyboard controls.
  * Successful solve unlocks the gate, removes collision obstacle, and dispatches `puzzle:solved` event.
* **Architect's Journal & Signpost Entity (`Signpost`):**
  * Spatial narrative tablets and guidance markers embedded at specific `(x, y, z)` coordinates.
  * Rendered across both 2.5D angled and 2D top-down perspectives with inscribed tablet glyphs and glowing rune embellishments.
  * Proximity detection triggers read toasts and emits `signpost:read` events to the EventBus.

### I. Progressive Campaign Architecture (Kishōtenketsu Progression)
* **Design Philosophy:** Inspired by *World of Goo*, introducing core mechanics in isolation, developing variations, introducing unexpected twists, and culminating in grand synthesis.
* **8-Chapter Thematic Arc (32 Levels):**
  1. **Chapter 1: The Foundation** (Levels 1–4, Whispering Dungeon): Spatial orientation, 2D Line-of-Sight fog, colored keys and matching barrier doors.
  2. **Chapter 2: The Vertical Dimension** (Levels 5–8, Emerald Canopy): 3D directional ramps (`R_N`, `R_S`) and multi-elevation bridges (`B_EW`, `B_NS`) enabling underpasses and overpasses.
  3. **Chapter 3: Shifting Architecture** (Levels 9–12, Sunken Clockwork Crypt): Interactive switches and levers dynamically altering maze wall topography.
  4. **Chapter 4: Astral Anomalies** (Levels 13–16, Crystal Caverns): Dimensional teleporter pairs connecting non-Euclidean isolated chambers across 3D space.
  5. **Chapter 5: Rhythm & Danger** (Levels 17–20, Molten Core): Kinetic timed flame vents and autonomous waypoint patroller sentinels.
  6. **Chapter 6: Arcane Seals** (Levels 21–24, Sunken Observatory): Interactive mental minigames (Simon-style Rune Memory and multi-ring Cipher Dials).
  7. **Chapter 7: Grand Synthesis** (Levels 25–28, Citadel of Trials): Multi-floor megalabyrinths synthesizing bridges, teleporters, levers, patrollers, and puzzles.
  8. **Chapter 8: The Shifting Monolith** (Levels 29–32, Monolithic Ruins): 4-quadrant camera world rotation, perspective-hidden alcoves, occluded underpasses, four-faced pillar keys, and prismatic overpasses.
* **Tri-Medal Mastery & Progression (`StorageManager`):**
  * Tracks 3 distinct mastery awards per level: **Completion Star**, **Pathfinder** (par steps), and **Speedrunner** (par elapsed seconds).
  * Persisted locally with zero backend dependencies (`casual_maze_stars`, `casual_maze_par_steps`, `casual_maze_par_time`).
  * Real-time chapter progress calculation (`getChapterStars(levels, progress)`) driving hub world cards and medal ribbons.

### J. Automated BFS Playthrough Verification Engine
* **Shortest Path State-Space Solver:**
  * Zero-dependency Breadth-First Search (BFS) engine traversing the complete configuration space `(x, y, elevation, keyBitmask)`.
  * Models key pickups, door unlocks, directional ramp transitions, bridge deck/underpass traversals, and teleporter dimensional jumps.
* **Real Engine Simulation (`GameLoop.tryMove`):**
  * Automated journey test (`campaign-playthrough.journey.test.mjs`) loads each of the campaign levels into an instantiated `GameLoop` instance.
  * Replays the solved optimal coordinate sequence step-by-step through real collision, inventory, and elevation transition logic.
  * Formally verifies reachability and asserts `gameLoop.isWon === true` for every single level.

### K. 90-Degree Camera World Rotation & Screen-Relative Navigation
* **4-Quadrant Compass Model (`ROTATION_ANGLES`, `ROTATION_COMPASS`):**
  * Supported rotations: `0° (North)`, `90° (East)`, `180° (South)`, `270° (West)`.
  * Managed by `Camera2D` with smooth linear interpolation (`rotationLerpSpeed`) and center-pivot rotation:
    * `worldToScreen(wx, wy)`: Rotates coordinates around the level grid center before applying camera translation and zoom.
    * `screenToWorld(sx, sy)`: Inverts the rotation transformation matrix to unproject screen-space pointer coordinates back to world grid coordinates.
    * `getViewportBounds()`: Unprojects all 4 screen corners to compute an accurate world-space bounding box for viewport culling.
* **Screen-Relative Input Vector Translation (`SCREEN_TO_WORLD_DELTAS`):**
  * Directs player movement relative to the screen viewpoint regardless of world angle:
    * At `0°`: Screen UP moves North `(dx: 0, dy: -1)`.
    * At `90°`: Screen UP moves East `(dx: 1, dy: 0)`.
    * At `180°`: Screen UP moves South `(dx: 0, dy: 1)`.
    * At `270°`: Screen UP moves West `(dx: -1, dy: 0)`.
  * Player avatar facing automatically syncs to screen movement vector (`player.getScreenFacing(worldFacing, rotationAngle)`).
* **Perspective Depth & Directional Tile Rendering (`renderer.js`):**
  * `renderAngledWall`: Dynamically shifts vertical drop facades, mortar joints, and cast shadows according to the camera's orientation.
  * `renderAngledFloors` & `renderAngledOverheadLayer`: Adjusts underpass tunnel visibility and bridge deck orientation relative to viewpoint.
  * `renderYSortedEntities`: 4-way back-to-front depth sort ensuring entities properly pass behind walls and underpasses at any angle.

### L. Branching Labyrinths & Multi-Exit Routing
* **Multi-Exit Level Contract (`level.exits[]`):**
  * Levels can define multiple exits via the `exits` array, while maintaining full backward compatibility with single `exit` definitions:
    ```json
    {
      "exits": [
        { "x": 19, "y": 1, "z": 0, "targetLevel": "secret_vault", "label": "Secret Vault" },
        { "x": 19, "y": 19, "z": 0, "targetLevel": "30", "label": "Path of the Needle" }
      ]
    }
    ```
  * `GameLoop.getMatchingExit(x, y, z)` matches player coordinates against active exit portals.
* **Conditional Level & Story Routing:**
  * When reaching an exit portal, `GameLoop.handleVictory()` checks matching exit properties:
    * If `targetLevel` is set, navigation routes to the designated level ID.
    * If `targetRoom` is set, initiates an intra-level room transition.
    * If neither is set, preserves standard sequential level progression.
  * Portals render with pulsing golden ring effects and hover tooltip destination banners.

### M. Interconnected Multi-Room Dungeon State Architecture
* **Topological Room Structure (`level.rooms`):**
  * Levels can contain multiple interconnected rooms (e.g. `courtyard`, `catacombs`, `high_spire`) in a single JSON schema.
  * Each room defines its own dimensions, tile layers (ground and overhead), entity instances, spawn, and exits.
* **Persistent In-Memory Room State Caching (`roomStates[roomId]`):**
  * When transitioning between rooms via `GameLoop.transitionToRoom(roomId, spawn, force)`:
    1. Active room is snapshotted (`snapshotCurrentRoom()`): caching open door states, collected keys, active checkpoint, lever toggle states, and modified tile layers.
    2. Target room is activated, restoring its previous state from `roomStates` cache or initializing fresh on first visit.
    3. Global explorer state is preserved uninterrupted: carried inventory, score, elapsed time, and carried riddle relics.
* **HUD Room Badge (`#hud-room-badge`):**
  * Displays the current active room name in real-time alongside compass heading and carried inventory.


