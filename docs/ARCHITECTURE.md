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
├── test-suite.mjs                # Pure Node ES-module test runner
├── docs/                         # Documentation & Architecture Records
│   ├── ARCHITECTURE.md           # Deep subsystem architecture & engine details (this file)
│   ├── LEVEL_SCHEMA.md           # Canonical JSON level schema and entity specs
│   ├── PROJECT_MANAGEMENT.md     # Milestone tracking, roadmap & active backlog
│   └── adr/                      # Architectural Decision Records (ADRs)
│       ├── README.md             # ADR index and template
│       ├── 0001-static-canvas-modular-engine.md
│       ├── 0002-multi-elevation-bridge-system.md
│       ├── 0003-tutorial-system-and-level-toggles.md
│       └── 0004-zone-grouping-and-thematic-tilesets.md
├── css/
│   ├── main.css                  # Shared UI design tokens, typography, hub styling
│   ├── game.css                  # Canvas overlay, HUD, minimap, mobile d-pad
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
│   │   ├── game-loop.js          # Delta-time coordinator and animation loop
│   │   ├── minimap.js            # Dedicated HUD minimap canvas renderer
│   │   ├── renderer.js           # 2D canvas drawing pipeline (clamped to viewport)
│   │   └── debug-logger.js       # Runtime debug telemetry & replay JSON export
│   ├── entities/
│   │   ├── player.js             # Position, elevation state, inventory, input listener
│   │   ├── key.js                # Collectible colored key entities
│   │   ├── door.js               # Locked barrier entities
│   │   └── lever.js              # State-switching trigger entities (mutates grid tiles)
│   ├── levels/
│   │   ├── level-loader.js       # Schema validator, URL param parser, static level loader
│   │   └── default-levels.js     # Hardcoded fallback campaign levels (Levels 1–5)
│   └── editor/
│       ├── editor-canvas.js      # Grid painting, drag-placement, coordinate preview
│       ├── editor-ui.js          # Palette selection, layer toggling, toolbar bindings
│       ├── entity-inspector.js   # Interactive lever-to-target wiring panel
│       ├── level-validator.js    # Static schema checks & BFS reachability solver
│       └── json-exporter.js      # File export/import parser via Web File API
└── levels/
    ├── manifest.json             # Manifest of campaign and tutorial levels
    ├── tutorial_1.json .. tutorial_6.json # Handcrafted tutorial levels
    └── level_1.json .. level_5.json       # Canonical JSON campaign levels
```

---

## 3. Core Engine Subsystems

### A. Coordinate System & Layer Elevation
* **Grid Coordinates:** Integer space `(gridX, gridY)` mapped to pixel space via `TILE_SIZE` (default `32px`).
* **Multi-Layer System (Bridges & Tunnels):**
  * `Layer 0 (Ground)`: Default walking floor, walls, tunnels beneath bridges.
  * `Layer 1 (Overhead / Bridge)`: Elevated walkways spanning across Layer 0.
* **Bridge Tiles:**
  * `BRIDGE_EW` (`B_EW`): Allows East <-> West traversal on `Layer 0`; allows North <-> South traversal on `Layer 1`.
  * `BRIDGE_NS` (`B_NS`): Allows North <-> South traversal on `Layer 0`; allows East <-> West traversal on `Layer 1`.
* **Directional Ramps:** `RAMP_N`, `RAMP_S`, `RAMP_E`, `RAMP_W` (`R_N`, `R_S`, `R_E`, `R_W`): Dynamically transition the player's elevation between `0` and `1` based on movement vector.
* **Collision Rule:** Movement evaluation checks walls, entity obstacles, and elevation bounds via `CollisionEngine.checkMove(fromX, fromY, toX, toY, elevation, level, entities, inventory)`.

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
