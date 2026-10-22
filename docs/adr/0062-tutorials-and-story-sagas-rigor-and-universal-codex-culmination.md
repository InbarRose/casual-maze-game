# ADR-0062: Tutorials & Story Sagas Rigor, Academy Folios, Vault Siphons & Platform-Wide Universal Codex Culmination

## Status
Accepted

## Context
Following the completion of Chapter 10 (ADR-0061), work concludes on Phase 11 of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-187`).

Across the Casual Maze Game platform, the complete level catalog consists of exactly 53 official levels:
- **Campaign (40 Levels)**: Chapters 1 to 10 (Levels 1–40), completely overhauled in ADR-0048 through ADR-0061.
- **Tutorial Academy (6 Levels)**: "The Novice's Initiation" (`tutorial_1` through `tutorial_6`).
- **Story Sagas (7 Levels)**:
  - *Relics of the Four Guardians* (`story_guardians_1`, `story_guardians_2`, `story_guardians_3`)
  - *The Whispering Citadel* (`story_citadel_1`, 3-tier multi-room dungeon)
  - *The Sunken Vaults of the Deep* (`story_sunken_vaults_1`, `story_sunken_vaults_2`, `story_sunken_vaults_3`)

Prior to this milestone, the 13 non-campaign levels (Tutorials and Story Sagas) contained architectural gaps:
1. **Missing Architect Folios & Stone Lecterns**: The remaining 13 lost folios (Folios #41 through #53) had not been placed on carved stone lecterns (`style: "lectern_stone"`) with persistent coordinate tracking `(X, Y, Z)`, preventing players from completing the ultimate realm achievement: **"Grand Universal Chronicler"** (`grand_chronicler`, target: 53 folios).
2. **Inconsistent Exit Portal Conventions**: Several tutorial exits generated architectural warnings in `LevelValidator` due to wall direction mismatches.
3. **Absence of Unified Story Package Compilation**: Modular packages required synchronized compilation into canonical datasets.

## Decision

We systematically re-engineer all 6 Tutorial Academy levels and all 7 Story Saga levels to enforce stone folio lecterns with coordinates, authentic North wall portals, zero-bypass gating solvability, and full platform-wide catalog synchronization.

### 1. Tutorial Academy: "The Novice's Initiation" (Folios #41 to #46)
- **Tutorial 1 ("First Steps")**: Carved stone lectern at `(1, 2, 0)` housing **Architect's Folio #41**. North wall entrance doorway (`wall_doorway`, `north`) and subterranean archway exit (`wall_archway`, `north`).
- **Tutorial 2 ("Keys & Colored Gates")**: Carved stone lectern at `(1, 2, 0)` housing **Architect's Folio #42**. Authentic color resonance gates and azure exit portal (`portal`, `none`).
- **Tutorial 3 ("Mechanisms & Levers")**: Carved stone lectern at `(1, 2, 0)` housing **Architect's Folio #43**. Dynamic clockwork wall-lowering lever and ascending gear stairwell (`stairs_up`, `none`).
- **Tutorial 4 ("Bridges & Elevation")**: Carved stone lectern at `(1, 2, 0)` housing **Architect's Folio #44**. 3D ground underpass and elevated canopy bridge crossing (`wall_archway`, `north`).
- **Tutorial 5 ("The Shrouded Path")**: Carved stone lectern at `(1, 2, 0)` housing **Architect's Folio #45**. Dynamic Fog of War navigation and rift portal exit (`portal`, `none`).
- **Tutorial 6 ("Master's Trial")**: Carved stone lectern at `(2, 2, 0)` housing **Architect's Folio #46**. Full mechanic synthesis (keys, levers, bridges, fog) and grand archway exit (`wall_archway`, `north`).

### 2. Story Saga 1: "Relics of the Four Guardians" (Folios #47 to #49)
- **Chapter 1 ("The Whispering Ruins")**: Carved stone lectern at `(3, 1, 0)` housing **Architect's Folio #47**. Wall carvings and sunstone crystal clues.
- **Chapter 2 ("The Falcon's Plinth")**: Carved stone lectern at `(2, 2, 0)` housing **Architect's Folio #48**. Elevated terrace vantage and Falcon riddle pedestal matching.
- **Chapter 3 ("Sanctum of the Four Guardians")**: Carved stone lectern at `(8, 2, 0)` housing **Architect's Folio #49**. 4-totem riddle plinth unsealing of the Golden Sanctum Gate.

### 3. Story Saga 2: "The Whispering Citadel" (Folio #50)
- **Chapter 1 ("The Whispering Citadel", 3-Tier Multi-Room)**: Carved stone lectern at `(2, 1, 0)` housing **Architect's Folio #50**. Connects Courtyard, Catacombs, and High Spire with dual branching exits (Apex Altar and Level 29 Secret Tunnel).

### 4. Story Saga 3: "The Sunken Vaults of the Deep" (Folios #51 to #53)
- **Chapter 1 ("The Flooded Siphon")**: Carved stone lectern at `(2, 1, 0)` housing **Architect's Folio #51**. Submerged flumes and thermal water vents.
- **Chapter 2 ("The Pressure Reservoir")**: Carved stone lectern at `(3, 1, 0)` housing **Architect's Folio #52**. Hydrodynamic pressure regulation and reservoir key.
- **Chapter 3 ("The Abyssal Sanctuary")**: Carved stone lectern at `(3, 1, 0)` housing **Architect's Folio #53**. Dual-key climax (Azure & Abyssal Keys) unsealing the Primal Water Core.

### 5. Universal Codex & Achievement Culmination
- With Folios #1 through #53 fully deployed across all 53 levels, the **Grand Universal Chronicler** achievement (`grand_chronicler`, target: 53) is 100% achievable in-game.
- All 53 folios display their exact discovery coordinates `(X, Y, Z)`, level title, and chapter in the Architect's Codex modal (hotkey `J`).

## Consequences

- **100% Platform-Wide Game Rigor Completed**: All 53 levels across the entire application (40 Campaign, 6 Tutorials, 7 Story Sagas) strictly adhere to high corridor inertia, 0 dead spaces $\ge 4\times 4$, stone lectern folios, authentic entrance portals, and zero-bypass gating solvability.
- **Flawless Automated Quality**: `npm test` passes all 782 automated tests across 156 test suites with 0 failures; `npm run validate:drift` passes 23/23 integrity checks.
- **Zero Server Overhead**: 100% vanilla ES6+ client-side code running statically on GitHub Pages.
