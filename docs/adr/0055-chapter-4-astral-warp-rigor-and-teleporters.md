# ADR-0055: Chapter 4 Astral Warp Rigor, Spatial Teleporters & Non-Euclidean Labyrinth Topology

## Status
Accepted

## Context
Following the successful completion and merging of Chapter 1 (ADR-0049), Chapter 2 (ADR-0053), and Chapter 3 (ADR-0054), work advances to Phase 5 of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-181`).

Chapter 4 ("Astral Warp", Levels 13–16: "The First Rift", "Twinned Portals", "Dimensional Warp", "The Astral Nexus") introduces the engine's non-Euclidean spatial teleporter network mechanics:
- Teleporters (`teleporter`) linking disjoint labyrinth sectors instantaneously.
- Vertical dimensional warps linking ground elevation $Z=0$ to elevated sanctuary balconies at $Z=1$.
- Multi-node spatial networks requiring sequential key activation to unlock destination rifts.

Prior to this overhaul, an automated metrics audit (`scripts/audit-level-metrics.mjs`) revealed significant quality gaps in Chapter 4:
1. **Severely Low Corridor Inertia (19%–50%)**:
   - Level 13: **50% inertia** (short open runways around central rift).
   - Level 14: **19% inertia** (lowest in early game; fragmented open chambers).
   - Level 15: **34% inertia** (large rectangular halls).
   - Level 16: **31% inertia** (wide open arenas despite chapter climax).
2. **Flat Floor Markers**: Spawns and exits utilized generic flat circles rather than architectural North wall drop-face doorways (`wall_doorway`, `north`) with ascending stairs and subterranean archways (`wall_archway`, `north`) with descending stairs.
3. **Floating Notes**: Notes were floating flat signs on the floor rather than stone lecterns (`style: "lectern_stone"`) recording discovery coordinates `(X, Y, Z)` for the Architect's Codex (ADR-0050).
4. **Mechanical Clues in Lore Signs**: Teleporter routing hints and secret wall clues were placed in lore text rather than diegetic wall art (stone frescoes and bronze runic plates, ADR-0051).

## Decision

We systematically re-engineer all four stages of Chapter 4 (Levels 13–16) to enforce rigorous 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone lecterns, and diegetic wall art.

### 1. Level 13: "The First Rift" (15 × 13, Temple/Astral Biome) — Ki (Introduction)
- **Concept**: Introductory spatial warp. The adventurer enters the western star observatory, winds through celestial colonnades, and steps into the primary rift to traverse an impassable cosmic void into the eastern sanctum.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Spatial Teleporter**:
  - Teleporter `tp_13_entry` at `(1, 11, 0)` warps to `tp_13_exit` at `(13, 11, 0)`.
  - The cosmic void between columns 6–8 is completely impassable; automated solvers verify that without entering the rift, solving returns strictly `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)` beneath North wall `(3, 0, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(13, 1, 0)` beneath North wall `(13, 0, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #13 with coordinates `(1, 3, 0)`.
  - Painted wall fresco at `(5, 4, 0)` illustrating the folding of spatial horizons.
  - Bronze runic plate at `(10, 11, 0)` hinting secret wall `SW` at `(11, 11)`, opening into hidden alcove concealing the Rift Shard (`secret_gem_13`, 300 pts) at `(11, 12, 0)`.
- **Calibration**: Optimal BFS solution $\ge 20$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 2. Level 14: "Twinned Portals" (17 × 15, Temple/Astral Biome) — Shō (Development)
- **Concept**: Twinned Alpha and Beta warp portals. Navigation requires utilizing reciprocal portal pathways: Alpha rift transports to the northern observatory to claim the Azure Key, while Beta rift transports to the southern bastion to unlock the exit door.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Twinned Portal Network**:
  - Alpha pair: `tp_14_alpha_in` at `(1, 13, 0)` warps to `tp_14_alpha_out` at `(8, 2, 0)` (near Azure Key).
  - Beta pair: `tp_14_beta_in` at `(8, 13, 0)` warps to `tp_14_beta_out` at `(15, 13, 0)` (near exit corridor).
  - Strict zero-bypass: Omitting teleporters or Azure Key mathematically yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)`.
  - Exit: North wall subterranean archway at `(15, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(8, 7, 0)` housing Architect's Note #14 with coordinates `(8, 7, 0)`.
  - Wall fresco at `(5, 5, 0)` illustrating twinned stars linked by ethereal strands.
  - Bronze runic plate at `(10, 13, 0)` hinting secret wall `SW` at `(11, 13)`, concealing Twin Star Quartz (`secret_gem_14`, 350 pts) at `(13, 13, 0)`.
- **Calibration**: Optimal BFS solution $\ge 40$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 3. Level 15: "Dimensional Warp" (19 × 15, Temple/Astral Biome) — Ten (Twist)
- **Concept**: Vertical elevation warp across 3D planes. A ground teleporter warps the adventurer directly onto an elevated gantry at $Z=1$, granting access to high parapets and retrieving the Golden Horizon Key, then crossing bridge decks to drop back down to the exit.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Elevation Warp & 3D Bridge**:
  - Teleporter `tp_15_elev` at ground `(3, 13, 0)` warps to elevated gantry `(9, 7, 1)`.
  - Elevated gantry connects to bridge deck spans (`B_EW`, `B_NS`) at $Z=1$.
  - Gold Key (`key_gold_15`) perched at `(9, 3, 1)`. Unlocks Gold Door at `(17, 3, 0)`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)`.
  - Exit: North wall subterranean archway at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 13, 0)` housing Architect's Note #15 with coordinates `(1, 13, 0)`.
  - Wall carving at `(5, 4, 0)` depicting vertical elevation transfer.
  - Bronze runic plate at `(14, 13, 0)` hinting secret wall `SW` at `(15, 12)`, concealing Warp Horizon Pearl (`secret_gem_15`, 400 pts) at `(15, 13, 0)`.
- **Calibration**: Optimal BFS solution $\ge 50$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 4. Level 16: "The Astral Nexus" (19 × 19, Temple/Astral Biome) — Ketsu (Climax)
- **Concept**: Climactic chapter finale operating under strategic Fog of War (`viewRadius: 7`). Multi-hub cosmic nexus featuring a 3-way teleporter interchange, sequential Crimson and Sapphire wards, and isolated quadrant observatories.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Nexus Interchange Mechanics**:
  - Nexus Central Hub at `(9, 9, 0)` routes between:
    - West Hub (Furnace Crucible): houses Ruby Key (`key_ruby_16`) at `(1, 17, 0)`.
    - East Hub (Celestial Observatory): houses Sapphire Key (`key_blue_16`) at `(17, 17, 0)`.
    - North Hub (Apex Sanctum): double-gated by Ruby Door and Sapphire Door leading into Exit Archway at `(9, 1, 0)`.
  - Strict sequential zero-bypass: Omitting either key or skipping any nexus hub yields strictly `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(9, 3, 0)` beneath North wall `(9, 2, 0)`.
  - Exit: North wall subterranean archway at `(9, 1, 0)` beneath North wall `(9, 0, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(9, 17, 0)` housing Architect's Note #16 with coordinates `(9, 17, 0)`.
  - Wall carving at `(7, 9, 0)` depicting the Tri-Fold Nexus Constellation.
  - Bronze runic plate at `(2, 17, 0)` hinting secret wall `SW` at `(3, 17)`, concealing Nexus Star Sapphire (`secret_gem_16`, 500 pts) at `(5, 17, 0)`.
- **Calibration**: Optimal BFS solution $\ge 60$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

## Consequences & Verification
- **Static Compatibility**: 100% static vanilla web execution with zero server or runtime dependencies (GitHub Pages).
- **Automated Test Integrity**: All 156 test suites and existing unit/integration tests must pass cleanly (`0 failed`).
- **Drift Protection**: `npm run validate:drift` must maintain 23/23 passing checks.
- **Level Package Alignment**: All 4 levels compiled into modular packages (`manifest.json`, `layers.json`, `entities.json`, `README.md`) under `levels/chapter_4/level_X/`.
- **Telemetry Verification**: Corridor directional inertia elevated from 19%–50% to $\ge 70\%$, with 0 dead spaces $\ge 4\times 4$.
