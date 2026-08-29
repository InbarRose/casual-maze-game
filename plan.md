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
    │   └── default-levels.js     # Fallback campaign levels for IDs 1..N
    └── editor/
        ├── editor-ui.js          # Palette selection, layer toggling, toolbar bindings
        ├── editor-canvas.js      # Grid painting, drag-placement, coordinate preview
        ├── entity-inspector.js   # Wire levers to target tiles/doors
        └── json-exporter.js      # File export/import parser via Web File API

```

---

## 3. Core Technical Subsystems

### A. Coordinate System & Layer Elevation

* **Grid Coordinates:** Integer grid `(gridX, gridY)` mapped to pixel space via `TILE_SIZE` (default: `32px` or `48px`).
* **Multi-Layer System (Bridges & Tunnels):**
* `Layer 0 (Ground)`: Default walking floor, walls, tunnels under bridges.
* `Layer 1 (Overhead / Bridge)`: Elevated walkways spanning over Layer 0.
* **Bridge Tiles:**
* `BRIDGE_EW`: Allows East <-> West movement only on `Layer 0`, North <-> South movement only on `Layer 1`.
* `BRIDGE_NS`: Allows North <-> South movement only on `Layer 0`, East <-> West movement only on `Layer 1`.

* **Ramps / Stairs:** Tiles that transition the player's elevation state between `0` and `1` upon stepping onto them.
* **Collision Rule:** A collision check only evaluates walls and entities matching the player's active elevation.

### B. Viewport Camera & Pan Engine

* **Viewport Clipping:** Only render tiles inside `[camX - halfWidth, camY - halfHeight]` to `[camX + halfWidth, camY + halfHeight]`.
* **Modes:**
* `Follow Mode`: Smooth interpolation (`lerp(camera, player, 0.1)`) keeping player centered.
* `Free-Pan Mode`: Player presses `M` or toggles map button to drag or pan with WASD/Arrows across discovered terrain. Clamped to maze boundaries.

### C. Fog-of-War & Minimap HUD

* **3-State Visibility Grid:**
* `0: Unexplored` — Completely hidden in solid black on main canvas and minimap.
* `1: Explored / Memory` — Revealed previously, rendered at 35% brightness / grayscale. Dynamic entities hidden.
* `2: Visible` — Active line of sight. Rendered full brightness with all dynamic entities visible.

* **Line of Sight Calculation:** 2D Raycasting (or Bresenham's circle line checks) up to `config.viewRadius` tiles. Walls terminate ray propagation.
* **Minimap HUD:** Dedicated `<canvas>` (e.g. $180 \times 180\text{ px}$) anchored to the top-right corner. It draws a 1:1 pixel representation of all tiles marked `1` or `2`, with a highlighted marker for the player.

### D. Reactive State Engine (Levers, Doors, & Keys)

* **Inventory System:** Tracks collected items (e.g., `keys: ["key_gold", "key_blue"]`).
* **Doors:** Impassable entities. If the player collides with a door and holds matching key ID, the key is consumed and door state updates to `open`.
* **Levers:** Interactive entities triggered when player steps on or interacts with the tile.
* Triggers an action list (e.g., `toggle_tile`, `lower_gate`, `raise_wall`).
* Mutates grid state dynamically at runtime without modifying the base level template.

---

## 4. Canonical Level Schema (`maze_file.json`)

```json
{
  "$schema": "[https://casual-maze-game.inbarrose.com/schemas/maze-v1.json](https://casual-maze-game.inbarrose.com/schemas/maze-v1.json)",
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

---

## 5. Tile & Entity Enumeration Table

| Code | Value / Identifier | Layer | Description / Collision Rule |
| --- | --- | --- | --- |
| `0` | `FLOOR` | Ground | Traversable open floor |
| `1` | `WALL` | Ground | Solid blocking wall |
| `B_EW` | `BRIDGE_EW` | Ground / Overhead | Ground allows E-W only; Overhead allows N-S only |
| `B_NS` | `BRIDGE_NS` | Ground / Overhead | Ground allows N-S only; Overhead allows E-W only |
| `R_N`, `R_S`, `R_E`, `R_W` | `RAMP_*` | Transition | Elevates player from Layer 0 to Layer 1 (and vice versa) |
| `key` | `ENTITY_KEY` | Dynamic | Collectible inventory item |
| `door` | `ENTITY_DOOR` | Dynamic | Impassable tile until key is used |
| `lever` | `ENTITY_LEVER` | Dynamic | Interactor that mutates tile states or opens remote doors |

---

## 6. Implementation Roadmap & Development Order

### Milestone 1: Core Engine Skeleton

* Setup `index.html` & `maze.html`.
* Implement `camera.js` (Canvas translation, viewport culling).
* Implement grid rendering for `Layer 0` and basic player movement (WASD/Arrow keys).
**Milestone 2: Multi-Elevation & Bridges**

* Implement `Layer 1` rendering.
* Implement directional collision logic for `B_EW`, `B_NS`, and elevation ramp tiles.

### ilestone 3: Fog-of-War & Minimap**

* Implement `fog.js` tracking 3-state visibility array (`0`, `1`, `2`).
* Add line-of-sight raycasting.
* Implement `minimap.js` pinned HUD rendering.
* Implement `Free-Pan Mode` on `M` key press.

### **Milestone 4: Interactive Entity System**

* Add keys, color-matched doors, and levers to the game loop.
* Build event-driven trigger system for tile transformation.

### **Milestone 5: Level Editor (`editor.html`)**

* Tile palette UI (Floor, Wall, Bridges, Ramps).
* Entity placement tools (Key, Door, Lever wiring modal).
* JSON Export to `.json` file and direct "Play Test" transition to `maze.html`.

### **Milestone 6: URL Routing & Campaign Flow**

* Parse `?id=X` from URL. If numeric, load deterministic level or seeded algorithm.
* Handle JSON drag-and-drop import from `index.html` into `sessionStorage` or player.

---

## 7. Development & Coding Rules for AI Assistants

* **Pure Static Compatibility:** Never introduce `npm` packages requiring server runtimes (Node, Express, etc.). If bundling is introduced later, target plain static outputs.
* **No Inline Game Logic in HTML:** Keep JS logic cleanly separated inside the `/js` module architecture.
* **Performance Budget:** Do not iterate over the entire grid inside `render()` loops. Always clamp iterations to current camera viewport bounds.
* **Modularity:** Ensure game mechanics (fog, collision, camera, events) remain decoupled so features can be tested independently.
