# Casual Maze Game

A top-down 2D puzzle maze and labyrinth engine built with Vanilla HTML5, CSS3, Modern JavaScript (ES6+ Modules), and HTML5 Canvas 2D. Features multi-layer elevation (bridges & tunnels), reactive puzzle mechanics (levers, color-locked doors, keys), dynamic fog-of-war, viewport cameras with free-panning, a minimap HUD, seeded procedural labyrinths, and a browser-based level editor with JSON import/export.

Hosted statically on GitHub Pages at [casual-maze-game.inbarrose.com](https://casual-maze-game.inbarrose.com).

---

## 🎮 Gameplay Features

* **Multi-Layer Elevation & Bridges**: Cross over or tunnel beneath elevated bridges (`B_EW`, `B_NS`) using directional ramps (`R_N`, `R_S`, `R_E`, `R_W`).
* **Reactive Puzzle Mechanics**: Discover colored keys, unlock matching gates, and step on or pull switches/levers to dynamically open passages and secret shortcuts.
* **3-State Fog-of-War**: 2D raycasting line-of-sight with memory dimming for explored terrain.
* **Camera & Free-Pan Mode**: Smooth camera follow with the ability to press `[M]` to freely pan and inspect the discovered map.
* **Minimap HUD**: Real-time minimap with click-and-drag navigation.
* **Campaign & Seeded Procedural Generator**: Play through handcrafted tutorial and master labyrinths (Levels 1–5), or enter any custom seed/id (`?id=42`) for an infinite variety of solvable mazes.
* **Handcrafted Maze Architect (Editor)**: Design custom puzzles, wire levers to toggle tiles, and export/import `.json` maze files.
* **Responsive & Mobile Ready**: Full keyboard controls (WASD / Arrows / Space / E / M / R) and on-screen virtual touch controls for phones and tablets.

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
| --- | --- | --- |
| **Move** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual D-Pad buttons |
| **Interact / Toggle Lever** | `E`, `Space`, or `Enter` | `USE` button |
| **Free-Pan Map** | `M` | Tap Map Button / Minimap |
| **Restart Level** | `R` | Restart Button `🔄` |

---

## 🏗️ Level Editor (`editor.html`)

1. Open `editor.html` or click **"Open Level Editor"** on the hub.
2. Select your drawing tool (**Pencil**, **Flood Fill**, **Eraser**, or **Inspect**).
3. Switch between **Ground (Layer 0)** and **Overhead (Layer 1)** to place walkways and bridges.
4. Place **Keys**, **Doors**, and **Levers**.
5. Select a lever and click **"+ Pick Target Tile"** to wire it to any grid coordinate to toggle walls on and off!
6. Click **"▶ Play Test"** to immediately play your custom puzzle.
7. Click **"💾 Export"** to download your `maze_file.json` to share with friends.

---

## 📁 Project Architecture

```text
casual-maze-game/
├── index.html                    # Hub / Landing Page (Level Select, Import, Editor link)
├── maze.html                     # Game Player Canvas Interface
├── editor.html                   # Handcrafted Maze Architect & JSON Designer
├── css/
│   ├── main.css                  # Shared UI tokens, layout, and typography
│   ├── game.css                  # Canvas overlay, HUD, and minimap layout
│   └── editor.css                # Toolbars, palette, properties panel
└── js/
    ├── core/
    │   ├── constants.js          # Tile types, entity enums, key mappings, layer IDs
    │   ├── prng.js               # Seeded random generator (Mulberry32) for deterministic IDs
    │   ├── events.js             # Pub/Sub event bus for game state interactions
    │   └── storage.js            # LocalStorage / SessionStorage persistence
    ├── engine/
    │   ├── camera.js             # Viewport transformations, lerp follow, & free-pan mode
    │   ├── fog.js                # Raycasting / Line of Sight & 3-state visibility grid
    │   ├── collision.js          # Elevation-aware collision & directional bridge traversal
    │   ├── minimap.js            # Secondary HUD canvas renderer
    │   ├── game-loop.js          # Delta-time update and render coordinator
    │   └── renderer.js           # 2D canvas drawing pipeline
    ├── entities/
    │   ├── player.js             # Position, elevation, inventory, input listener
    │   ├── key.js                # Collectible key objects
    │   ├── door.js               # Key-locked barrier entities
    │   └── lever.js              # State-switching trigger entities
    ├── levels/
    │   ├── level-loader.js       # JSON schema validator and URL param parser (?id=X)
    │   └── default-levels.js     # Campaign levels 1..5
    └── editor/
        ├── editor-ui.js          # Palette selection, layer toggling, toolbar bindings
        ├── editor-canvas.js      # Grid painting, drag-placement, coordinate preview
        ├── entity-inspector.js   # Wire levers to target tiles/doors
        └── json-exporter.js      # File export/import parser via Web File API
```

---

## 🚀 Local Development

To run the game locally:
```bash
# Using Python
python -m http.server 8000

# Or using any static file server
# Open http://localhost:8000 in your browser
```
