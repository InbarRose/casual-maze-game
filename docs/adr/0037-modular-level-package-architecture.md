# 0037. Modular Level Package Architecture (Per-Level Directory Structure)

Date: 2026-10-18

## Status
Accepted

## Context
As the Casual Maze Game has grown from initial basic labyrinths to an expansive 42-level campaign across 10 themed chapters and multi-room sagas, the amount of data associated with each level has grown significantly. Today, a level file encapsulates:
- Core metadata (ID, chapter, zone, title, author, version, par metrics, dimensions, theme)
- Configuration toggles (fog of war, view radius, allow free pan, tile size)
- Architectural entrance & exit styles, coordinates, and orientations
- Ground layer 2D tile matrix
- Overhead bridge layer 2D tile matrix
- Interactive entity array (keys, doors, levers, teleporters, floor plates, sentinels, pedestals)
- Narrative lore, architect notes, murals, and celestial riddles
- Solvability hints and help texts

Historically, all of this information was stored inside a single monolithic JSON file (e.g. `levels/chapter_1/level_1.json`, reaching hundreds of lines). As levels become richer with environmental props, layer overlays, complex multi-step puzzle triggers, and level designer documentation:
1. Git diffs on monolithic level JSON files become noisy and prone to merge conflicts (editing lore or entity coordinates creates diffs beside thousands of matrix numbers).
2. Level lore and architect notes are cramped inside JSON string literals without markdown formatting.
3. Designers have no dedicated space for level design guidelines, par step/time rationale, walkthrough solutions, or design sketches.

## Decision

We establish the **Modular Level Package Architecture** (`BL-143`) where levels can be authored and maintained as cohesive directory packages:

### 1. Level Directory Layout
Each level can reside in its own dedicated package directory:
```text
levels/
└── chapter_1/
    ├── level_1/
    │   ├── README.md         # Designer documentation, narrative lore, walkthrough, par notes
    │   ├── manifest.json     # Metadata, dimensions, theme, camera, spawn/exit styles, par metrics
    │   ├── layers.json       # Ground and overhead tile matrices (or layers/ground.json, layers/overhead.json)
    │   └── entities.json     # Interactive entities array (keys, doors, levers, portals, notes)
    ├── level_2/
    │   └── ...
    └── manifest.json         # Chapter-level index and level ordering
```

### 2. Package File Responsibilities
* **`README.md`**: Human-readable documentation for level designers and story writers:
  - Narrative lore & atmospheric background
  - Kishōtenketsu breakdown (Introduction, Development, Twist, Resolution)
  - Intended optimal path and par steps / par time deduction
  - Secret wall locations and bonus collectibles
* **`manifest.json`**: Pure configuration and parameters:
  - `id`, `chapter`, `zone`, `title`, `author`, `version`
  - `dimensions: { width, height }`
  - `config: { fogOfWar, viewRadius, theme, tileSize, allowFreePan }`
  - `spawn: { x, y, elevation, style, wallDirection }`
  - `exit: { x, y, elevation, style, wallDirection }`
  - `parSteps`, `parTime`
  - `architectNote` (synced from README or referenced)
* **`layers.json`**: Pure grid spatial data:
  - Decoupled from entity and metadata changes.
  - Can be extended in the future to support lightweight ASCII or Run-Length Encoded (RLE) matrices.
* **`entities.json`**: Entity graph:
  - Clean array of entity objects with specific IDs, coordinates, types, colors, and target actions.

### 3. Static Compatibility & Build Pipeline
In accordance with **Principle 1A (Zero Backend / Pure Static Compatibility)**:
- The build script (`scripts/update-manifests.mjs`) compiles level directory packages into the runtime distribution bundle:
  - Compiles package directories into bundled `default-levels.js` / JSON files for immediate browser loading.
  - Automatically verifies SHA-256 integrity and dimension consistency across manifest, layers, and entities.
- The client-side `LevelLoader` maintains seamless backward compatibility:
  - If a single `level_X.json` exists, it loads directly.
  - If a package is compiled or requested, the loader resolves the composite object transparently.

## Consequences

### Positive
* **Superior Version Control**: Tile grid alterations, entity repositioning, and lore editing are isolated in separate files, drastically reducing merge conflicts.
* **Rich Documentation**: Level designers have a first-class `README.md` to explain intended puzzle mechanics, Kishōtenketsu phase design, and solver routes.
* **Scalable Entity Modeling**: As complex entities (patrollers, floor plate sequences, multi-condition triggers) expand, they do not clutter spatial grid matrices.
* **Zero Runtime Overhead**: Game clients load compiled static artifacts with zero extra HTTP round-trips.

### Negative / Trade-offs
* Requires a compilation step via `scripts/update-manifests.mjs` when editing modular directories.
* Existing monolithic JSON files must be progressively migrated over time rather than all at once.
