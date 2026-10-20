# 0044. Universal Level Package Architecture, Saga Labyrinth Redesign & 3D Elevation

Date: 2026-10-19

## Status
Accepted

## Context
In ADR-0037 and ADR-0043, we established the Modular Level Package Architecture and the campaign-wide 3D true labyrinth topology across the 40 campaign levels (`levels/chapter_1/level_1/` through `levels/chapter_10/level_40/`).

However, the remaining levels in the platform:
1. **Tutorial Academy (The Novice's Initiation)**: Chapters 1 to 6 (`levels/tutorial/tutorial_1.json` through `tutorial_6.json`)
2. **Relics of the Guardians**: Chapters 1 to 3 (`levels/stories/story_guardians_1.json` through `story_guardians_3.json`)
3. **The Whispering Citadel**: Multi-room 3-tier dungeon saga (`levels/stories/story_citadel_1.json` with Courtyard, Catacombs, High Spire)
4. **Sunken Vaults of the Deep**: Chapters 1 to 3 (`levels/stories/story_sunken_vaults_1.json` through `story_sunken_vaults_3.json`)

remained in legacy flat `.json` format and exhibited legacy design flaws:
- High concentration of solid dead space voids ($\text{DeadSpace}_{\ge 4\times 4} > 0$): Tutorial 6 had 12 dead blocks, Guardians 2 had 4 dead blocks, Citadel Catacombs had 48 dead blocks, and Sunken Vaults Chapters 1–3 had 34, 52, and 86 dead blocks respectively.
- Disconnected design standards: Earlier sagas relied on box rooms or wide open floor areas rather than authentic winding 1-tile labyrinth corridors with directional inertia ($\ge 70\%$) and deceptive dead ends.
- Underutilization of modern 3D multi-elevation elements: wall-walk battlements (`WALL_WALK`), overhead viaduct platforms (`PLATFORM`), Roman vaulted underpass archways, carved staircases (`RAMP_*`), and dual elevation player drop shadows.

## Decision

We establish universal parity across all platform levels and sagas:

### 1. Universal Package Migration Across All 53 Levels
Every single level in the game is migrated to a dedicated directory package:
- `levels/tutorial/tutorial_1/` through `tutorial_6/`
- `levels/stories/story_guardians_1/` through `story_guardians_3/`
- `levels/stories/story_citadel_1/` (supporting multi-room directory architecture)
- `levels/stories/story_sunken_vaults_1/` through `story_sunken_vaults_3/`

Each directory package contains:
- `manifest.json`: Configuration, spawn/exit styles, dimensions, par metrics, themes.
- `layers.json`: Matrix representations for ground, overhead, and decor layers.
- `entities.json`: Interactive entities, locks, triggers, puzzles, hazards, and inspectables.
- `README.md`: Diegetic lore, Kishōtenketsu structure, and strategic walkthroughs.

### 2. Multi-Room Package Schema Extension
For episodic multi-room levels like `story_citadel_1`, the package format supports room decomposition:
- The package root manifest contains saga-wide metadata, prologue, and initial room pointer.
- `rooms` in `manifest.json` cleanly delegates room layers and entities into modular structures while compiling transparently into the canonical composite level object.

### 3. Universal True Labyrinth & Zero Dead Space Standard ($\text{DeadSpace}_{\ge 4\times 4} = 0$)
- Reclaim every solid $4 \times 4$ bedrock void across Tutorial 6, Guardians 2, Citadel Catacombs, and Sunken Vaults 1–3.
- Convert dead spaces into authentic labyrinth corridors with directional inertia ($\ge 70\%$), 90° blind corners, deceptive dead ends with hazard traps, safe alcoves, and secret walls (`SW`) guarding high-value gems and relics.

### 4. 3D Elevation & Visual Depth Integration
- Weave 3D elevated viaducts (`PLATFORM`, `B_EW`, `B_NS`), wall-top battlement ramparts (`WALL_WALK`), and directional carved staircases (`RAMP_*`) across tutorials and sagas.
- Underpasses beneath overhead spans feature Roman vaulted archways with masonry keystones and gradient tunnel depth shadows.
- Players traversing upper elevations project dual drop shadows (deck contact + detached ground floor shadow) with cyan elevation beacons.

### 5. Automated Compilation & Static Compatibility
- `scripts/update-manifests.mjs` automatically detects all 53 level packages, compiles them into static `.json` files and JS modules (`js/levels/tutorials.js`, `js/levels/campaign-ch*.js`, `js/stories/storylines.js`, `js/stories/sunken-vaults.js`), and computes SHA-256 cryptographic hashes for `levels/manifest.json`.
- Zero backend runtime required; 100% static GitHub Pages compatibility is preserved.

## Consequences

- **100% Package Architecture Coverage**: All 53 levels in the project now follow the modular per-level package standard.
- **Zero Dead Space Across Entire Game**: Every level, tutorial, and saga has $\text{DeadSpace}_{\ge 4\times 4} = 0$.
- **Unified 3D Aesthetics & Mechanics**: Roman arches, crenellated parapets, and multi-elevation bridges are consistently integrated across both the main campaign and all side sagas.
- **Enhanced Testability & Zero Drift**: Automated test suites verify all 53 level packages, 100% solvability, unbypassable gating, and zero cryptographic drift.
