# Art & Asset Catalog Specification — Casual Maze Game

This document outlines the asset pipeline architecture, directory hierarchy, SVG vector specifications, and offline authoring workflows for all game tiles, entities, environment props, and user interface icons.

---

## 1. Core Architecture & Offline Principles

* **Separated from Code**: All game art, tiles, entities, and environment objects are represented as standalone vector SVG files in the Git repository under `assets/`.
* **Zero Binary Blobs in Git**: All art is stored as clean, human-readable XML SVG text. Git diffs, branching, and pull requests track visual asset changes cleanly.
* **Offline Editing & Compatibility**:
  * Any vector editor (e.g. Inkscape, Adobe Illustrator, Figma, Boxy SVG, VS Code SVG Editor) can open, edit, and export these files directly offline.
  * Previewable directly in web browsers via [`art-catalog.html`](../art-catalog.html).
* **Pure Static GitHub Pages Deployment**: Assets are loaded asynchronously via native ES modules ([`js/core/asset-loader.js`](../js/core/asset-loader.js)) with fallback procedural canvas renderers for maximum performance and reliability.

---

## 2. Supported Themes & Complete Tileset Matrix

The engine provides **5 fully realized biome themes**, each equipped with complete matching tilesets:

| Theme ID | Biome Name | Floor Pavers | Wall Styles | Bridges | Ramps |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `dungeon` | Whispering Dungeon | Slate Paver, Cracked, Runic | Slate Solid, Torch Sconce, Iron Grate | Wooden Deck EW/NS | Stone Ramps (N/S/E/W) |
| `jungle` | Emerald Overgrowth | Mossy Cobble, Cracked, Runic | Overgrown Vine Wall, Torch, Grate | Canopy Plank EW/NS | Vine Ramps (N/S/E/W) |
| `magma` | Molten Chasm | Volcanic Basalt, Cracked, Runic | Obsidian Magma Wall, Torch, Grate | Ashwood Span EW/NS | Basalt Ramps (N/S/E/W) |
| `temple` | Sunken Temple | Sandstone Slab, Cracked, Runic | Carved Hieroglyph Wall, Torch, Grate | Golden Bridge EW/NS | Sandstone Ramps (N/S/E/W) |
| `glacial` | Glacial Expanse | Frost Cobble, Cracked, Runic | Crystalline Ice Wall, Torch, Grate | Frozen Plank EW/NS | Glacial Ramps (N/S/E/W) |

---

## 3. Directory Hierarchy & Taxonomy

```
assets/
├── manifest.json                     # Canonical asset index & metadata registry
├── tiles/                            # Map & terrain tiles
│   ├── ground/                       # Base floor pavers and solid theme walls
│   ├── variations/                   # Variable tiles: cracked floors, runic glyphs, torch walls, grate walls
│   ├── bridges/                      # Theme-specific multi-elevation 3D bridges (EW & NS)
│   └── ramps/                        # Theme-specific elevation incline ramps (North, South, East, West)
├── entities/                         # Interactive items, doors & switches
│   ├── keys/                         # Themed keys (Dungeon Iron, Jungle Jade, Magma Ruby, Temple Scarab, Glacial Frost) + Classic styles
│   ├── doors/                        # Directional gates (Horizontal crossbars & Vertical portcullis) + Forcefields & Vaults
│   └── levers/                       # Mechanism switches (OFF/ON states for Switches, Pedestals, Crystals, Runes, Valves)
├── environment/                      # Spawns, portals & landmarks
│   ├── spawn/                        # Freestanding entrance styles (Stairs Down, Portal, Archway, Pentagram, Camp)
│   ├── exit/                         # Freestanding exit styles (Cosmic Portal, Stairs Up, Archway, Treasure Chest, Shrine)
│   └── edge_passages/                # Perimeter edge-wall inset entrances & exits (North, South, East, West)
├── player/                           # Character avatars with 4-Way directional facing
│   ├── adventurer/                   # Classic explorer (North, South, East, West)
│   ├── knight/                       # Armored vanguard with helm (North, South, East, West)
│   ├── mage/                         # Robed wizard with cowl (North, South, East, West)
│   └── rogue/                        # Shadow scout with hood (North, South, East, West)
└── ui/                               # Editor & game HUD tool icons (Pencil, Line, Fill, Eraser, Select, Grab)
```

---

## 4. Directional Facings & Edge Wall Inset Passages

### A. Edge Wall Inset Passages
Instead of only entering or exiting via free-standing staircases or magic portals in open floor tiles, the labyrinth supports **Edge Wall Passages**:
* `spawn_edge_wall_north.svg`, `spawn_edge_wall_south.svg`, `spawn_edge_wall_east.svg`, `spawn_edge_wall_west.svg`
* `exit_edge_wall_north.svg`, `exit_edge_wall_south.svg`, `exit_edge_wall_east.svg`, `exit_edge_wall_west.svg`
* These visually integrate into perimeter walls, rendering an inset entry tunnel opening directly through the outer boundary wall.

### B. Player 4-Way Directional Facings
Each of the **4 player classes** has dedicated vector sprites for 4-way navigation:
* **North (`_north.svg`)**: Upward facing / back view
* **South (`_south.svg`)**: Downward facing / front visor view
* **East (`_east.svg`)**: Rightward facing profile
* **West (`_west.svg`)**: Leftward facing profile

### C. Directional Gate Facings
* **Vertical Facing (`_v.svg`)**: Portcullis bars oriented vertically for north-south choke points.
* **Horizontal Facing (`_h.svg`)**: Crossbeam bars oriented horizontally for east-west corridors.

---

## 5. Vector Design Guidelines & Specifications

* **Standard Grid & ViewBox**: All tile and entity icons use a standardized `viewBox="0 0 64 64"` coordinate space with `width="64"` and `height="64"`.
* **Clean Geometry**:
  * Integer grid alignment for outer frames.
  * Minimum stroke width of `1.5px` (recommended `2px` to `3px`) for clear visibility at low zoom levels.
* **Palette & Theming**:
  * **Accent / Sky Blue**: `#38bdf8` / `#0284c7`
  * **Emerald Green**: `#34d399` / `#059669`
  * **Gold / Amber**: `#fbbf24` / `#d97706`
  * **Ruby / Rose**: `#f43f5e` / `#be123c`
  * **Amethyst Purple**: `#a855f7` / `#7e22ce`
  * **Slate Neutral**: `#0f172a`, `#1e293b`, `#334155`, `#475569`, `#64748b`, `#cbd5e1`

---

## 6. Offline Viewing & Tooling

1. **In-Browser Asset Studio**: Open [`art-catalog.html`](../art-catalog.html) in any browser offline.
   * Filter by Theme: `Dungeon`, `Jungle`, `Magma`, `Temple`, `Glacial`.
   * Filter by Type: `Tiles`, `Entities`, `Environment`, `Player`, `UI`.
   * Filter by Category: `Ground`, `Variations`, `Bridges`, `Ramps`, `Keys`, `Doors`, `Levers`, `Spawn`, `Exit`, `Edge Passages`, `Player Classes`, `Tools`.
   * Copy SVG source code or asset paths directly to clipboard.
2. **Rebuilding Asset Pipeline**:
   ```bash
   node scripts/build-asset-pipeline.mjs
   ```
3. **Automated Verification**:
   ```bash
   npm test
   ```
