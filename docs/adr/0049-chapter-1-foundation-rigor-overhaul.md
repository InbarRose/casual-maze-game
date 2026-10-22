# ADR-0049: Chapter 1 Foundation Rigor Overhaul (Labyrinth Topology, Secrets & Architectural Portals)

## Status
Accepted

## Context
Following user playtesting of Chapter 1 Level 1 and the implementation of ADR-0048, the user issued an explicit directive:
> *"please apply better rigor across all levels."*

Prior to this overhaul, Chapter 1 Levels 2 ("The Ruby Lock"), 3 ("Prismatic Corridors"), and 4 ("The Shrouded Vault") exhibited the same core structural deficiencies identified in Level 1:
1. **Low-Inertia Runway Topology**: Corridors featured long parallel unbroken straight runways (up to 17 tiles across) and redundant loops without blind corners or deceptive spurs.
2. **Exposed or Trivial Secrets**: Secret walls (`SW`) sat directly along active transit corridors without environmental clues or dead-end placement.
3. **Flat Floor Markers**: Spawns and exits used generic 2D circles rather than architectural North wall doorways (`wall_doorway`) with ascending stairs and daylight vistas, or archways (`wall_archway`) with descending subterranean stairs.
4. **Sub-optimal Gating Isolation**: In Level 4, earlier iterations allowed navigation around key doors due to unsealed flanking tiles.

## Decision

We systematically re-engineered all remaining levels in Chapter 1 (Levels 2, 3, and 4) to enforce rigorous architectural, spatial, and puzzle design standards.

### 1. Level 2: "The Ruby Lock" (15 × 13)
- **Labyrinth Topology**: Reconstructed into a winding artisanal labyrinth with $71\%$ corridor inertia, zero dead space $\ge 4\times 4$, and unbypassable gating.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(7, 11)` (`wall_doorway`, `north`) against wall `(7, 10)` with open double doors and ascending stone stairs.
  - Exit: North wall subterranean archway at `(7, 1)` (`wall_archway`, `north`) against wall `(7, 0)` with descending stairs into the deep.
- **Gating & Economy**: Ruby Door at `(7, 2)` completely seals the Exit Sanctum; Ruby Key placed at `(1, 3)` deep in the northwest labyrinth.
- **Secret Chamber**: Hidden behind cracked mortar `SW` at `(13, 7)` in an enclosed southeast dead end, hinted by runic wall carving `(13, 6)`, concealing the Bloodstone Shard (`secret_gem_2`, 300 pts) at `(13, 8)`. Bonus Sanctum Emerald (`gem_bonus_2`) at `(1, 9)`.
- **Calibration**: BFS optimal solution = 35 steps; calibrated par = 41 steps (1.17x ratio) and 21 seconds.

### 2. Level 3: "Prismatic Corridors" (17 × 15)
- **Labyrinth Topology**: Solid central dividing masonry barrier enforces strict sequential progression with $72\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Sequential Gating**:
  1. Adventurer enters at `(2, 2)` (`wall_doorway`, `north`) in the West half.
  2. Traverses winding corridors to recover the Emerald Key at `(2, 13)`.
  3. Returns north to unlock the central Emerald Door at `(8, 12)`, crossing into the East half.
  4. Explores the East labyrinth to retrieve the Purple Key at `(14, 13)`.
  5. Navigates north to unlock the Purple Door at `(8, 2)` into the Exit at `(8, 1)`.
  - Automated solvers mathematically prove that omitting `key_emerald_3` yields strictly `null` (zero bypass).
- **Architectural Portals**: Entrance doorway at `(2, 2)` beneath wall `(2, 1)`; exit archway at `(8, 1)` beneath wall `(8, 0)`.
- **Secret Chamber**: East dead end at `(15, 6)` conceals cracked wall `SW` hinted by wall carving `(14, 6)`, opening into secret alcove `(15, 7)` housing the Prismatic Shard (`secret_gem_3`, 350 pts).
- **Calibration**: BFS optimal solution = 54 steps; calibrated par = 63 steps (1.17x ratio) and 32 seconds.

### 3. Level 4: "The Shrouded Vault" (19 × 17)
- **Labyrinth Topology**: Grand 4-wing Gothic cathedral labyrinth operating under dense Fog of War (`viewRadius: 6`) with $77\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Central Nave & Portals**:
  - Central spawn at `(9, 8)` with North wall entrance doorway beneath wall `(9, 7)`.
  - Triune Sanctum Exit at `(10, 15)` beneath North wall `(10, 14)` with descending subterranean stairs.
- **Triune Sequential Gating**:
  - The south sanctum corridor is strictly sealed on all flanks, forcing passage through 3 sequential doors:
    - Ruby Door at `(9, 11)`
    - Emerald Door at `(9, 12)`
    - Sapphire Door at `(9, 13)`
  - Omission of any of the three keys (`key_ruby_4`, `key_emerald_4`, `key_blue_4`) strictly produces `null` solution.
  - Three expansive wings house the keys:
    - West wing: Ruby Key at `(1, 11)`
    - East wing: Emerald Key at `(17, 11)`
    - North wing: Sapphire Key at `(9, 2)`
- **Secret Chamber**: Northeast dead end houses secret wall `SW` at `(17, 3)` hinted by runic wall carving `(17, 4)`, unlocking an enclosed 1-tile sanctuary `(17, 2)` concealing the Cathedral Starstone (`secret_gem_4`, 350 pts). Bonus gem at `(1, 14)`.
- **Calibration**: BFS optimal solution = 93 steps; calibrated par = 107 steps (1.15x ratio) and 55 seconds.

## Consequences & Verification
- **Static Compatibility**: 100% static vanilla web execution with zero server or runtime dependencies (GitHub Pages).
- **Test Integrity**: All 156 test suites and 775 automated tests pass cleanly (`0 failed`).
- **Drift Protection**: All 23 drift checks in `tests/validate-drift.mjs` pass cleanly (`0 failed`).
- **Telemetry Verification**:
  - Level 2: 71% corridor inertia, 0 dead space $\ge 4\times 4$, 41 par steps.
  - Level 3: 72% corridor inertia, 0 dead space $\ge 4\times 4$, 63 par steps.
  - Level 4: 77% corridor inertia, 0 dead space $\ge 4\times 4$, 107 par steps.
- **Foundation Benchmark**: Chapter 1 now stands as a showcase standard for genuine labyrinthine navigation, environmental storytelling, fair secrets, and architectural portal aesthetics.
