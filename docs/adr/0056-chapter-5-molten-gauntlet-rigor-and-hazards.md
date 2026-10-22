# ADR-0056: Chapter 5 Molten Gauntlet Rigor, Dynamic Hazards, Patroller Sentinels & Caldera Labyrinth Topology

## Status
Accepted

## Context
Following the successful completion and merging of Chapter 1 (ADR-0049), Chapter 2 (ADR-0053), Chapter 3 (ADR-0054), and Chapter 4 (ADR-0055), work advances to Phase 6 of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-182`).

Chapter 5 ("Molten Gauntlet", Levels 17–20: "The Fire Vents", "The Molten Sentinels", "The Crucible Crossing", "The Caldera Gauntlet") introduces the engine's active hazard, patrolling sentinel, and checkpoint recovery mechanics in the Volcano biome:
- Periodic flame vents (`hazard`) spewing geysers of fire requiring rhythmic timing.
- Obsidian patroller sentinels (`patroller`) walking deterministic waypoint paths requiring spatial evasion and safe harbor timing.
- Resonating checkpoint monoliths (`checkpoint`) saving active state mid-run.
- Strategic Fog of War (`fogOfWar: true`, `viewRadius: 7`) on Chapter climax Level 20.

Prior to this overhaul, an automated metrics audit (`scripts/audit-level-metrics.mjs`) revealed significant quality gaps in Chapter 5:
1. **Low Corridor Inertia (28%–45%)**:
   - Level 17: **42% inertia** (wide open magma chambers around vents).
   - Level 18: **36% inertia** (large rectangular sentinel patrol ring).
   - Level 19: **28% inertia** (fragmented crossing blocks).
   - Level 20: **45% inertia** (sprawling open caldera arena).
2. **Flat Floor Markers**: Spawns and exits utilized generic flat circles rather than architectural North wall drop-face doorways (`wall_doorway`, `north`) with ascending stairs and subterranean archways (`wall_archway`, `north`) with descending stairs.
3. **Floating Lore Signs**: Notes were floating flat signs on the floor rather than stone lecterns (`style: "lectern_stone"`) recording discovery coordinates `(X, Y, Z)` for the Architect's Codex (ADR-0050).
4. **Mechanical Clues in Lore Signs**: Hazard timing and secret wall clues were placed in lore text rather than diegetic wall art (stone frescoes and bronze runic plates, ADR-0051).

## Decision

We systematically re-engineer all four stages of Chapter 5 (Levels 17–20) to enforce rigorous 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone lecterns, and diegetic wall art.

### 1. Level 17: "The Fire Vents" (15 × 13, Volcano Biome) — Ki (Introduction)
- **Concept**: Introductory hazard gauntlet. The adventurer enters the northern basalt colonnade, winds through volcanic trenches past rhythmic fire vents into safe harbor recesses, and reaches the lower obsidian descent.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Active Hazards**:
  - Twin flame vents (`hazard_vent_17_a` at `(5, 5, 0)` and `hazard_vent_17_b` at `(9, 7, 0)`) with periodic burst cycles and safe harbor alcoves.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(13, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #17 with coordinates `(1, 3, 0)`.
  - Wall fresco at `(5, 4, 0)` depicting volcanic magma conduits.
  - Bronze runic plate at `(10, 11, 0)` hinting secret wall `SW` at `(11, 11)`, concealing Molten Core Opal (`secret_gem_17`, 300 pts) at `(9, 7, 0)`.
- **Calibration**: Optimal BFS solution $\ge 35$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 2. Level 18: "The Molten Sentinels" (17 × 15, Volcano Biome) — Shō (Development)
- **Concept**: Introduction of moving patroller sentinels. The adventurer navigates winding basalt trenches monitored by an obsidian construct, timing movements between evasion alcoves to secure the Bronze Key and unlock the exit portcullis.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Patroller Sentinel & Gating**:
  - Patroller `patroller_18` navigating waypoints through central basalt halls.
  - Bronze Key (`key_bronze_18`) at `(8, 4, 0)` unlocking Bronze Foundry Gate (`door_bronze_18`) at `(15, 3, 0)`.
  - Strict zero-bypass: Omitting key or door mathematically yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)`.
  - Exit: North wall subterranean archway at `(15, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(8, 7, 0)` housing Architect's Note #18 with coordinates `(8, 7, 0)`.
  - Wall fresco at `(5, 5, 0)` depicting clockwork obsidian guardians walking silent circuits.
  - Bronze runic plate at `(11, 13, 0)` hinting secret wall concealing Obsidian Eye Quartz (`secret_gem_18`, 350 pts).
- **Calibration**: Optimal BFS solution $\ge 50$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 3. Level 19: "The Crucible Crossing" (19 × 15, Volcano Biome) — Ten (Twist)
- **Concept**: Synthesis of combined hazards, patrollers, and checkpoint recovery across molten canals. An obsidian monolith checkpoint anchors the central crossing, allowing respawn safety before entering the treacherous southern crucible to obtain the Silver Key.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Checkpoint & Crucible Mechanics**:
  - Checkpoint `checkpoint_19` at central safe island `(9, 7, 0)`.
  - Patroller `patroller_19` and flame hazard `hazard_vent_19` patrolling the lower magma channels.
  - Silver Key (`key_silver_19`) at `(9, 3, 0)` unlocking Silver Seal (`door_silver_19`) at `(17, 3, 0)`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)`.
  - Exit: North wall subterranean archway at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 7, 0)` housing Architect's Note #19 with coordinates `(1, 7, 0)`.
  - Wall carving at `(5, 5, 0)` depicting the crucible crossing and safe anchor stones.
  - Bronze runic plate at `(13, 13, 0)` concealing Igneous Tear Gem (`secret_gem_19`, 400 pts).
- **Calibration**: Optimal BFS solution $\ge 50$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 4. Level 20: "The Caldera Gauntlet" (21 × 19, Volcano Biome) — Ketsu (Climax)
- **Concept**: Climactic chapter finale operating under strategic Fog of War (`viewRadius: 7`). Grand four-quadrant caldera synthesis featuring dual obsidian sentinels (North & South), dual flame vents, mid-run checkpoint, and the Apex Ruby Gate.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Caldera Synthesis Mechanics**:
  - North Sentinel (`patroller_20_north`) patrolling upper basalt terrace.
  - South Sentinel (`patroller_20_south`) patrolling molten crucible.
  - Mid-level checkpoint `checkpoint_20` at caldera center `(10, 9, 0)`.
  - Ruby Key (`key_ruby_20`) in deep magma chamber unlocking Apex Crucible Gate (`door_ruby_20`) at exit corridor.
  - Strict zero-bypass: Omitting key or door yields strictly `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)`.
  - Exit: North wall subterranean archway at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(10, 17, 0)` housing Architect's Note #20 with coordinates `(10, 17, 0)`.
  - Wall carving at `(7, 9, 0)` depicting the Caldera Heart Constellation.
  - Bronze runic plate at `(2, 17, 0)` hinting Caldera Dragon Cinder (`secret_gem_20`, 500 pts).
- **Calibration**: Optimal BFS solution $\ge 50$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

## Consequences & Verification
- **Static Compatibility**: 100% static vanilla web execution with zero server dependencies (GitHub Pages).
- **Automated Test Integrity**: All 156 test suites and existing unit/integration tests must pass cleanly (`0 failed`).
- **Drift Protection**: `npm run validate:drift` must maintain 23/23 passing checks.
- **Level Package Alignment**: All 4 levels compiled into modular packages under `levels/chapter_5/level_X/`.
- **Telemetry Verification**: Corridor directional inertia elevated from 28%–45% to $\ge 70\%$, with 0 dead spaces $\ge 4\times 4$.
