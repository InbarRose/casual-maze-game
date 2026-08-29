# Casual Maze Game — System Architecture & Context Specification

## 1. Project Overview & Objectives

* **Domain:** `casual-maze-game.inbarrose.com`
* **Hosting:** GitHub Pages (Static hosting, zero backend, zero external database).
* **Stack:** Vanilla HTML5, CSS3, Modern JavaScript (ES6+ Modules), HTML5 Canvas 2D.
* **Core Concept:** A 2D top-down, tile-based puzzle maze engine supporting large procedural or handcrafted labyrinths, multi-layer elevation (bridges/tunnels), reactive mechanics (levers, keys, locking doors), fog-of-war, viewport cameras with free-panning, a minimap HUD, and a browser-based level editor with JSON import/export.

---

## 2. Directory Structure & File Map

```text
casual-maze-game/
├── CNAME                         # Domain mapping (casual-maze-game.inbarrose.com)
├── README.md                     # Documentation & Instructions
├── PROJECT_CONTEXT.md            # AI Context Specification (this file)
├── plan.md                       # Roadmap & Architecture Blueprint
├── index.html                    # Hub / Landing Page (Level Select, Import, Editor link)
├── maze.html                     # Game Player Canvas Interface
├── editor.html                   # Handcrafted Maze Architect & JSON Designer
├── css/
│   ├── main.css                  # Shared UI, layout, and typography styles
│   ├── game.css                  # Canvas overlay, HUD, and minimap layout
│   └── editor.css                # Toolbars, palette, properties panel
└── js/
    ├── core/
    │   ├── constants.js          # Tile types, entity enums, key mappings, layer IDs
    │   ├── prng.js               # Seeded random generator (Mulberry32) for deterministic IDs
    │   ├── events.js             # Pub/Sub event bus for game state interactions
    │   └── storage.js            # LocalStorage / SessionStorage parser
    ├── engine/
    │   ├── camera.js             # Viewport transformations, lerp follow, & free-pan mode
    │   ├── fog.js                # Raycasting / Line of Sight & 3-state visibility grid
    │   ├── collision.js          # Elevation-aware collision & directional bridge traversal
    │   ├── minimap.js            # Secondary HUD canvas renderer
    │   ├── game-loop.js          # Delta-time update and render coordinator
    │   └── renderer.js           # 2D canvas drawing pipeline (ground, entities, overhead)
    ├── entities/
    │   ├── player.js             # Position, elevation, inventory, input listener
    │   ├── key.js                # Collectible key objects
    │   ├── door.js               # Key-locked barrier entities
    │   └── lever.js              # State-switching trigger entities (toggles walls/tiles)
    ├── levels/
    │   ├── level-loader.js       # JSON schema validator and URL param parser (?id=X)
    │   └── default-levels.js     # Fallback campaign levels for IDs 1..5
    └── editor/
        ├── editor-ui.js          # Palette selection, layer toggling, toolbar bindings
        ├── editor-canvas.js      # Grid painting, drag-placement, coordinate preview
        ├── entity-inspector.js   # Wire levers to target tiles/doors
        └── json-exporter.js      # File export/import parser via Web File API
```

---

## 3. Core Technical Subsystems

### A. Coordinate System & Layer Elevation

* **Grid Coordinates:** Integer grid `(gridX, gridY)` mapped to pixel space via `TILE_SIZE` (default `32px`).
* **Multi-Layer System (Bridges & Tunnels):**
  * `Layer 0 (Ground)`: Default walking floor, walls, tunnels under bridges.
  * `Layer 1 (Overhead / Bridge)`: Elevated walkways spanning over Layer 0.
* **Bridge Tiles:**
  * `BRIDGE_EW` (`B_EW`): Allows East <-> West movement only on `Layer 0`, North <-> South movement only on `Layer 1`.
  * `BRIDGE_NS` (`B_NS`): Allows North <-> South movement only on `Layer 0`, East <-> West movement only on `Layer 1`.
* **Ramps / Stairs:** `RAMP_N`, `RAMP_S`, `RAMP_E`, `RAMP_W` (`R_N`, `R_S`, `R_E`, `R_W`): Transition the player's elevation state between `0` and `1` upon stepping onto/crossing them.
* **Collision Rule:** A collision check only evaluates walls and entities matching the player's active elevation.

### B. Viewport Camera & Pan Engine

* **Viewport Clipping:** Only render tiles inside `[camX - halfWidth, camY - halfHeight]` to `[camX + halfWidth, camY + halfHeight]` for high rendering performance.
* **Modes:**
  * `Follow Mode`: Smooth interpolation (`lerp`) keeping the player centered.
  * `Free-Pan Mode`: Player presses `M` or toggles map button to drag or pan with WASD/Arrows across discovered terrain. Clamped to maze boundaries.

### C. Fog-of-War & Minimap HUD

* **3-State Visibility Grid:**
  * `0: Unexplored` — Completely hidden in solid black on main canvas and minimap.
  * `1: Explored / Memory` — Revealed previously, rendered at 35% brightness / dimmed. Dynamic entities hidden.
  * `2: Visible` — Active line of sight. Rendered full brightness with all dynamic entities visible.
* **Line of Sight Calculation:** 2D Raycasting up to `config.viewRadius` tiles. Walls terminate ray propagation.
* **Minimap HUD:** Dedicated `<canvas>` (180 × 180 px) anchored to HUD. Draws explored tiles marked `1` or `2`, with interactive click/drag to pan.

### D. Reactive State Engine (Levers, Doors, & Keys)

* **Inventory System:** Tracks collected items (e.g., `keys: ["key_gold", "key_blue"]`).
* **Doors:** Impassable entities. If the player collides with a door and holds matching key ID, the key is consumed and door state updates to `open`.
* **Levers:** Interactive entities triggered when player steps on or interacts with the tile.
  * Triggers an action list (e.g., `toggle_tile`, `lower_gate`, `raise_wall`).
  * Mutates grid state dynamically at runtime without modifying the base level template.

---

## 4. Level Schema (`maze_file.json`)

```json
{
  "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
  "id": "vault_of_shadows",
  "title": "The Sunken Vault",
  "author": "Inbar Rose",
  "version": 1,
  "dimensions": {
    "width": 40,
    "height": 40
  },
  "config": {
    "fogOfWar": true,
    "viewRadius": 6,
    "allowFreePan": true,
    "tileSize": 32,
    "theme": "dungeon"
  },
  "spawn": {
    "x": 2,
    "y": 2,
    "elevation": 0
  },
  "exit": {
    "x": 38,
    "y": 38
  },
  "layers": {
    "ground": [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, "B_EW", 0, 1]
    ],
    "overhead": [
      [0, 0, 0, 0, 0],
      [0, 0, "B_NS", 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  "entities": [
    {
      "id": "key_gold",
      "type": "key",
      "x": 10,
      "y": 14,
      "color": "#ffd700",
      "name": "Golden Sanctuary Key"
    },
    {
      "id": "door_gold",
      "type": "door",
      "x": 25,
      "y": 30,
      "requiresKey": "key_gold",
      "color": "#ffd700"
    },
    {
      "id": "lever_gate_1",
      "type": "lever",
      "x": 5,
      "y": 8,
      "state": false,
      "targets": [
        {
          "action": "toggle_tile",
          "layer": "ground",
          "x": 12,
          "y": 18,
          "stateA": 1,
          "stateB": 0
        }
      ]
    }
  ]
}
```
