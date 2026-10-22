# ADR-0060: Chapter 9 Grand Aqueduct Rigor, Sluice Gates, Flume Bridges & Hydrodynamic Labyrinth Topology

## Status
Accepted

## Context
Following the completion of Chapter 8 (ADR-0059), work advances to Phase 10 of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-186`).

Chapter 9 ("The Sunken Aqueducts", Levels 33–36: "The Sluice Gate", "Submerged Crossings", "The Pressure Basin", "Grand Aqueduct Reservoir") represents the campaign's hydrodynamic macro-labyrinth gauntlet in the Aqueduct biome:
- Sluice gate water barriers regulating cistern flumes.
- 3D multi-elevation bridges over flooded canals at `(8, 5)` with elevated deck traversal at $Z=1$ (`ground[5][8] === 'B_NS'` and `overhead[5][8] === 'B_EW'`).
- Timed water hazard jets and pressure conduits.
- Dual-key multi-layer progression on Level 36 (Cyan Canal Key and Amethyst Sluice Key).
- Patrolling sentinels guarding flume channels.

Prior to this overhaul, an automated audit revealed architectural gaps:
1. **Flat Floor Portals & Corner Spawns**: Spawns were generic corner tiles `(1, 1)`, and exits were flat bottom-right corner portals `(15, 15)`, `(17, 17)`, `(19, 19)` rather than authentic North wall drop-face doorways (`wall_doorway`, `north`) and subterranean archways (`wall_archway`, `north`).
2. **Missing Stone Lecterns**: None of the levels contained stone lecterns (`style: "lectern_stone"`) housing collectible lost folios with persistent coordinate tracking `(X, Y, Z)` for the Architect's Codex (ADR-0050).
3. **Missing Diegetic Wall Art**: Clues were embedded in generic text boxes rather than mounted stone bas-relief carvings and bronze runic plates (ADR-0051).
4. **Missing Secret Chambers**: Lack of deceptive dead-end secret walls (`SW`) concealing high-value gems.

## Decision

We systematically re-engineer all four stages of Chapter 9 (Levels 33–36) to enforce rigorous 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone lecterns, diegetic wall art, and full playthrough compatibility.

### 1. Level 33: "The Sluice Gate" (19 × 17, Aqueduct Biome) — Ki (Introduction)
- **Concept**: Introduction to aqueduct flumes and watergate mechanics. The adventurer winds through the western canal terrace, navigates into the deep southern overflow flume to retrieve the Bronze Sluice Key (`key_sluice_33`), and unlocks the Central Sluice Gate (`door_sluice_33`) guarding the outflow conduit.
- **Topology**: 1-tile winding labyrinth with 81% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Spawn (North wall doorway `(3, 1)`) -> West terrace -> South overflow flume to claim Bronze Sluice Key at `(7, 15)` -> East flume -> Central Sluice Gate at `(15, 3)` -> Archway Exit `(15, 1)`.
  - Side spur features Aqueduct Sentinel patroller and timed hazard.
  - Strict zero-bypass: Solving without key or with doors disabled returns strictly `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(15, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #33 with coordinates `(1, 3, 0)`.
  - Bronze runic plate at `(9, 7, 0)` detailing the sluice pressure mechanism.
  - Wall carving at `(15, 15, 0)` hinting secret wall concealing Aqueduct Pearl (`secret_gem_33`, 400 pts).
- **Calibration**: Optimal BFS solution = 53 steps; calibrated par = 61 steps (`Math.ceil(53 * 1.15)`).

### 2. Level 34: "Submerged Crossings" (19 × 17, Aqueduct Biome) — Shō (Development)
- **Concept**: Multi-elevation bridges over flooded canals. The overhead bridge deck (`overhead[5][8] === 'B_EW'`) spans the flowing canal underpass (`ground[5][8] === 'B_NS'`), with elevated deck traversal at $Z=1$ accessed via directional ramps (`R_E` at `(5, 5)`, `R_W` at `(11, 5)`). The canal pressure key lies submerged in the southern drain.
- **Topology**: 1-tile winding labyrinth with 80% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Spawn `(3, 1)` -> West terrace -> Ramp ascent onto elevated bridge deck at $Z=1$ -> Descent to eastern sector.
  - Canal underpass at `(8, 14)` holds Canal Pressure Key (`key_canal_34`).
  - Submerged Flume Gate (`door_canal_34` at `(17, 3)`) unlocks access to the Archway Exit `(17, 1)`.
  - Mid-run checkpoint beacon (`checkpoint_34` at `(12, 7)`).
  - Strict zero-bypass: Solving without key or door yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #34 with coordinates `(1, 3, 0)`.
  - Trestle engineering plate at `(12, 5, 0)` explaining elevated flume construction.
  - Wall carving at `(3, 15, 0)` hinting secret wall concealing Submerged Sunstone (`secret_gem_34`, 450 pts).
- **Calibration**: Optimal BFS solution = 63 steps; calibrated par = 73 steps.

### 3. Level 35: "The Pressure Basin" (21 × 19, Aqueduct Biome) — Ten (Twist)
- **Concept**: High pressure steam jets and rhythm conduits. The adventurer dodges timed water hazards in alternating pulse channels, claims the Pressure Basin Key (`key_basin_35`), and accesses the secret conduit behind a disguised wall.
- **Topology**: 1-tile winding labyrinth with 78% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Spawn `(3, 1)` -> Southwest pressure chamber -> Secret wall at `(1, 15)` (`TILES.SECRET_WALL`) concealing Deep Aquamarine Relic (`gem_secret_35` at `(3, 15)`).
  - Central basin conduits with timed hazards (`hazard_basin_35a`, `hazard_basin_35b`) and Pressure Warden patroller.
  - Eastern valve chamber holds Pressure Basin Key (`key_basin_35` at `(19, 15)`).
  - Outflow Pressure Gate (`door_basin_35` at `(17, 3)`) blocks the Archway Exit `(17, 1)`.
  - Strict zero-bypass: Solving without key or door yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #35 with coordinates `(1, 3, 0)`.
  - Runic plate at `(7, 9, 0)` detailing relief valve pulse cadence.
  - Carving at `(1, 13, 0)` hinting the southwest secret conduit wall.
- **Calibration**: Optimal BFS solution = 79 steps; calibrated par = 91 steps.

### 4. Level 36: "Grand Aqueduct Reservoir" (21 × 21, Aqueduct Biome) — Ketsu (Climax & Dual-Key Synthesis)
- **Concept**: Culmination of Chapter 9 in a massive dual-tier reservoir requiring sequential authorization. Unlocking the Cyan Terrace Gate opens access to the deep cistern flumes, where the Amethyst Sluice Key is guarded before unsealing the Grand Spillway.
- **Topology**: 1-tile winding mega-labyrinth with 79% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics Chain & Dual Authorization**:
  - Spawn (North doorway `(3, 1)`) -> Western reservoir terrace -> Cyan Canal Key (`key_cyan_36` at `(11, 5)`).
  - Terrace Access Gate (`door_cyan_36` at `(13, 11)`) unlocking entry to Tier 2 Deep Spillway.
  - Deep spillway flume holds Amethyst Sluice Key (`key_amethyst_36` at `(15, 19)`) and Grand Reservoir Sanctum checkpoint (`checkpoint_36`).
  - Grand Spillway Seal (`door_amethyst_36` at `(17, 3)`) unseals access to the Grand Spillway Archway Exit `(17, 1)`.
  - Strict zero-bypass: Omitting either key prevents reaching the exit.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #36 with coordinates `(1, 3, 0)`.
  - Bronze runic plate at `(15, 19, 0)` declaring the Grand Spillway Seal law.
  - Wall carving at `(3, 19, 0)` hinting secret wall concealing Heart of the Aqueduct (`secret_gem_36`, 600 pts).
- **Calibration**: Optimal BFS solution = 107 steps; calibrated par = 124 steps.

## Consequences

### Positive
- Elevated Chapter 9 corridor directional inertia to 78%–81% with 0 dead spaces $\ge 4\times 4$.
- Replaced flat floor portals with authentic North wall drop-face doorways and subterranean archway exits.
- Integrated carved stone lecterns housing Architect's Notes with coordinate tracking `(X, Y, Z)` for the Architect's Codex.
- Fully compatible with automated campaign simulation playthrough tests (`tests/integration/campaign/chapter-9.test.mjs`).
- 100% zero-bypass gating mathematically proven through automated BFS solvers.

### Verification Criteria
- `scripts/test-ch9-full-rigor.mjs` passes 100% of validation checks and zero-bypass assertions.
- `npm run validate:drift` passes 23/23 checks.
- `npm test` passes all 156 test suites and 777 unit tests with 0 failures (13,849 assertions).
