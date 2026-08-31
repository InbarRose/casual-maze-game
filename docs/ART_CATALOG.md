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

## 2. Directory Hierarchy & Taxonomy

The asset tree is categorized into **5 primary domains**:

```
assets/
├── manifest.json                     # Canonical asset index & metadata registry
├── tiles/                            # Map & terrain tiles
│   ├── ground/                       # Floor slabs and theme-specific walls
│   │   ├── floor.svg
│   │   ├── wall_dungeon.svg
│   │   ├── wall_overgrowth.svg
│   │   ├── wall_magma.svg
│   │   └── wall_temple.svg
│   ├── bridges/                      # Multi-elevation 3D bridges
│   │   ├── bridge_ew.svg
│   │   └── bridge_ns.svg
│   └── ramps/                        # Elevation incline ramps
│       ├── ramp_north.svg
│       ├── ramp_south.svg
│       ├── ramp_east.svg
│       └── ramp_west.svg
├── entities/                         # Interactive items, doors & switches
│   ├── keys/                         # Collectibles
│   │   ├── key_classic.svg
│   │   ├── key_ornate.svg
│   │   ├── key_crystal.svg
│   │   ├── key_orb.svg
│   │   ├── key_relic.svg
│   │   └── key_skull.svg
│   ├── doors/                        # Barriers & gates
│   │   ├── door_classic.svg
│   │   ├── door_portcullis.svg
│   │   ├── door_laser_barrier.svg
│   │   ├── door_magic_seal.svg
│   │   ├── door_crystal_spikes.svg
│   │   └── door_vault_hatch.svg
│   └── levers/                       # Mechanism switches
│       ├── lever_switch_off.svg
│       ├── lever_switch_on.svg
│       ├── pedestal_inactive.svg
│       ├── pedestal_active.svg
│       ├── crystal_inactive.svg
│       ├── crystal_active.svg
│       ├── runic_plate_off.svg
│       ├── runic_plate_on.svg
│       ├── cog_valve_off.svg
│       └── cog_valve_on.svg
├── environment/                      # Spawns, portals & landmarks
│   ├── spawn/                        # Entrance visual styles
│   │   ├── spawn_stairs_down.svg
│   │   ├── spawn_portal.svg
│   │   ├── spawn_archway.svg
│   │   ├── spawn_pentagram.svg
│   │   └── spawn_camp.svg
│   └── exit/                         # Victory exit styles
│       ├── exit_portal.svg
│       ├── exit_stairs_up.svg
│       ├── exit_archway.svg
│       ├── exit_treasure_chest.svg
│       └── exit_shrine.svg
├── player/                           # Hero tokens & HUD pointers
│   ├── player_ground.svg
│   ├── player_overhead.svg
│   └── player_compass.svg
└── ui/                               # Editor & game HUD tool icons
    ├── tool_pencil.svg
    ├── tool_line.svg
    ├── tool_fill.svg
    ├── tool_eraser.svg
    ├── tool_select.svg
    └── tool_move.svg
```

---

## 3. Vector Design Guidelines & Specifications

* **Grid & ViewBox**: All tile and entity icons use a standardized `viewBox="0 0 64 64"` coordinate space with `width="64"` and `height="64"`.
* **Clean Geometry**:
  * Integer grid alignment for outer frames (avoid half-pixel blur).
  * Minimum stroke width of `1.5px` (recommended `2px` to `3px`) for clear visibility at low zoom levels.
* **Palette & Theming**:
  * **Accent / Sky Blue**: `#38bdf8` / `#0284c7`
  * **Emerald Green**: `#34d399` / `#059669`
  * **Gold / Amber**: `#fbbf24` / `#d97706`
  * **Ruby / Rose**: `#f43f5e` / `#be123c`
  * **Amethyst Purple**: `#a855f7` / `#7e22ce`
  * **Slate Neutral**: `#0f172a`, `#1e293b`, `#334155`, `#475569`, `#64748b`, `#cbd5e1`

---

## 4. `assets/manifest.json` Registry

Every asset is registered in `assets/manifest.json` with the following schema:

```json
{
  "id": "key_classic",
  "name": "Classic Key",
  "type": "entity",
  "category": "keys",
  "style": "classic",
  "path": "assets/entities/keys/key_classic.svg",
  "viewBox": "0 0 64 64",
  "description": "Standard notched gold key with gemstone bow and faceted shaft",
  "tags": ["key", "item", "unlock", "gold", "classic"]
}
```

---

## 5. Offline Viewing & Tooling

1. **In-Browser Asset Studio**: Open [`art-catalog.html`](../art-catalog.html) in any browser offline.
   - Filter by type: Tiles, Entities, Environment, Player, UI.
   - Filter by category: Ground, Bridges, Ramps, Keys, Doors, Levers, Spawn, Exit.
   - Copy SVG source code or asset paths directly to clipboard.
2. **Rebuilding Asset Pipeline**:
   ```bash
   node scripts/build-asset-pipeline.mjs
   ```
3. **Automated Verification**:
   ```bash
   npm test
   ```
