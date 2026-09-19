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
├── package.json                  # Test script runner (`npm test`)
├── test-suite.mjs                # Backward-compatible proxy to `tests/run-all.mjs`
├── tests/                        # Modular Test Architecture & User Journeys
│   ├── harness/                  # Test runner, assertions, and Node.js DOM/storage mocks
│   │   ├── index.mjs             # Unified harness export
│   │   ├── runner.mjs            # describe, it, suite grouping, filtering (--suite, --grep)
│   │   ├── assertions.mjs        # assert, assertEqual, assertDeepEqual, assertThrows
│   │   └── mocks.mjs             # Storage polyfills, mock canvas/DOM, FileReader/Blob
│   ├── unit/                     # Granular subsystem unit test suites
│   │   ├── core/                 # prng, events, storage, constants
│   │   ├── engine/               # collision, fog, camera, debug-logger
│   │   ├── entities/             # player, key, door, lever, dynamic-activities
│   │   ├── levels/               # level-loader, json-integrity, campaign, tutorial
│   │   └── editor/               # level-validator, json-exporter
│   ├── integration/
│   │   └── journeys/             # End-to-end simulated player & architect workflows
│   │       ├── tutorial-progression.journey.test.mjs
│   │       ├── campaign-solvability.journey.test.mjs
│   │       ├── editor-authoring.journey.test.mjs
│   │       ├── fog-exploration.journey.test.mjs
│   │       ├── multi-elevation.journey.test.mjs
│   │       └── interactive-activities.journey.test.mjs
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
│       └── 0005-angled-topdown-perspective-and-dynamic-activities.md
├── css/
│   ├── main.css                  # Shared UI design tokens, typography, hub styling
│   ├── game.css                  # Canvas overlay, HUD, minimap, mobile d-pad, puzzle modal
│   └── editor.css                # Editor toolbars, entity inspector, palette, validator
├── js/
│   ├── core/
│   │   ├── constants.js          # Tile types, entity enums, key mappings, layer IDs
│   │   ├── prng.js               # Mulberry32 deterministic pseudo-random generator
│   │   ├── events.js             # Pub/Sub EventBus for decoupled engine communication
│   │   └── storage.js            # LocalStorage / SessionStorage persistence wrapper
│   ├── engine/
│   │   ├── camera.js             # Viewport translation, lerp follow, free-pan mode
│   │   ├── collision.js          # Elevation-aware collision & directional bridge traversal
│   │   ├── fog.js                # 3-state fog-of-war (Unexplored, Explored, Visible)
│   │   ├── game-loop.js          # Delta-time coordinator, entity cycles, animation loop
│   │   ├── minimap.js            # Dedicated HUD minimap canvas renderer
│   │   ├── renderer.js           # 2D/2.5D canvas drawing pipeline with Y-depth sorting
│   │   └── debug-logger.js       # Runtime debug telemetry & replay JSON export
│   ├── entities/
│   │   ├── player.js             # Position, elevation state, inventory, input listener
│   │   ├── key.js                # Collectible colored key entities
│   │   ├── door.js               # Locked barrier entities
│   │   ├── lever.js              # State-switching trigger entities (mutates grid tiles)
│   │   ├── teleporter.js         # Dimensional warp portals with 3D coordinate translation
│   │   ├── hazard.js             # Timed cyclical hazards & waypoint-navigating patrollers
│   │   └── puzzle-gate.js        # Interactive minigame puzzle barrier entities
│   ├── ui/
│   │   └── puzzle-modal.js       # Pure static DOM modal for rune sequence and cipher dials
│   ├── levels/
│   │   ├── level-loader.js       # Schema validator, URL param parser, static level loader
│   │   └── default-levels.js     # Hardcoded fallback campaign levels (Levels 1–10)
│   └── editor/
│       ├── editor-canvas.js      # Grid painting, drag-placement, coordinate preview
│       ├── editor-ui.js          # Palette selection, layer toggling, toolbar bindings
│       ├── entity-inspector.js   # Interactive lever-to-target wiring panel
│       ├── level-validator.js    # Static schema checks & BFS reachability solver
│       └── json-exporter.js      # File export/import parser via Web File API
└── levels/
    ├── manifest.json             # Manifest of campaign and tutorial levels
    ├── tutorial_1.json .. tutorial_6.json # Handcrafted tutorial levels
    └── level_1.json .. level_10.json      # Canonical JSON campaign levels (Zones 1-3)
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

