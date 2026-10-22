# ADR-0058: Chapter 7 Citadel Trials Rigor, High Viaduct Ramparts, Frostfire Conduits & Grand Synthesis Labyrinth Topology

## Status
Accepted

## Context
Following the successful completion and merging of Chapter 1 (ADR-0049), Chapter 2 (ADR-0053), Chapter 3 (ADR-0054), Chapter 4 (ADR-0055), Chapter 5 (ADR-0056), and Chapter 6 (ADR-0057), work advances to Phase 8 of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-184`).

Chapter 7 ("Grand Synthesis & Citadel Trials", Levels 25–28: "The Sovereign Rampart", "The Frostfire Conduit", "The Prismatic Bastion", "The Sovereign's Ascent") represents the campaign's penultimate macro-synthesis in the Glacial Citadel / Snow biome:
- High viaduct ramparts at $Z=1$ connected via directional ramps (`R_*`), overlooking lower snow ditches and frozen canals at $Z=0$.
- Dynamic patrolling sentinels (`patroller`) patrolling lower moats and courtyards.
- Frostfire conduit levers (`lever`) toggling barrier walls.
- Aerial vortex teleporters (`teleporter`) linking distant fortress bastions.
- Full mechanical synthesis on Chapter climax Level 28 under strategic Fog of War (`fogOfWar: true`, `viewRadius: 7`) combining high rampart battlements, patrolling sentinels, Rune Memory puzzle gates, conduit levers, mid-run checkpoint monoliths, and the Golden Apex Gate.

Prior to this overhaul, an automated metrics audit (`scripts/audit-level-metrics.mjs`) revealed significant quality gaps in Chapter 7:
1. **Low Corridor Inertia (32%–48%)**:
   - Level 25: **42% inertia** (broad open courtyard platforms).
   - Level 26: **36% inertia** (large unsegmented snow plazas).
   - Level 27: **32% inertia** (sparse open bastion halls).
   - Level 28: **48% inertia** (sprawling summit arena).
2. **Flat Floor Markers**: Spawns and exits utilized generic flat circles rather than architectural North wall drop-face doorways (`wall_doorway`, `north`) with ascending stairs and subterranean archways (`wall_archway`, `north`) with descending stairs.
3. **Floating Lore Signs**: Notes were floating flat signs on the floor rather than stone lecterns (`style: "lectern_stone"`) recording discovery coordinates `(X, Y, Z)` for the Architect's Codex (ADR-0050).
4. **Mechanical Clues in Lore Signs**: Teleport routing cues and secret wall hints were placed in lore text rather than diegetic wall art (stone bas-reliefs and bronze runic plates, ADR-0051).

## Decision

We systematically re-engineer all four stages of Chapter 7 (Levels 25–28) to enforce rigorous 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone lecterns, and diegetic wall art.

### 1. Level 25: "The Sovereign Rampart" (19 × 17, Snow/Citadel Biome) — Ki (Introduction)
- **Concept**: Introduction of high citadel ramparts and frost rifts. The adventurer ascends icy wooden ramps to high battlements ($Z=1$), traverses elevated viaduct spans overlooking frozen moats, steps through a spatial frost rift to an isolated battlement tower to claim the Azure Sigil Key, and unlocks the gate to the inner keep.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **High Ramparts & Frost Rift**:
  - Multi-elevation bridge spans (`B_EW`, `B_NS`) at $Z=1$, directional ramps (`R_N`, `R_S`) transitioning elevations.
  - Frost Rift (`teleporter_25_alpha` -> `teleporter_25_beta`) linking west ramparts to the isolated eastern spire.
  - Azure Key (`key_azure_25`) and Azure Sigil Gate (`door_azure_25`).
  - Strict zero-bypass: Solving with `allowTeleporters: false`, `allowDoors: false`, or without the key mathematically yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #25 with coordinates `(1, 3, 0)`.
  - Wall fresco at `(5, 5, 0)` illustrating the high rampart ascent.
  - Bronze runic plate at `(11, 15, 0)` hinting secret wall concealing Glacial Sigil Gem (`secret_gem_25`, 400 pts).
- **Calibration**: Optimal BFS solution $\ge 45$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 2. Level 26: "The Frostfire Conduit" (21 × 17, Snow/Citadel Biome) — Shō (Development)
- **Concept**: Bridge traversal over patrolling sentinels and frostfire barrier levers. The adventurer maneuvers through lower moat trenches avoiding frost sentinels, pulls the conduit lever to lower iron portcullis barriers, claims the Ruby Key, and climbs upper viaducts to the sanctuary gate.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Sentinels & Barrier Lever**:
  - Patrolling sentinel (`patroller_26`) circulating in guarded side terrace.
  - Conduit lever (`lever_26_frost`) toggling barrier tile `(stateA: 0, stateB: 1)`.
  - Ruby Key (`key_ruby_26`) and Ruby Sanctuary Gate (`door_ruby_26`).
  - Strict zero-bypass: Omitting lever, key, or door yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(19, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 7, 0)` housing Architect's Note #26 with coordinates `(1, 7, 0)`.
  - Wall diagram at `(5, 5, 0)` depicting sentinel patrol rhythm and bridge vantage points.
  - Runic plate at `(13, 15, 0)` hinting secret alcove concealing Frostfire Shard (`secret_gem_26`, 450 pts).
- **Calibration**: Optimal BFS solution $\ge 60$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 3. Level 27: "The Prismatic Bastion" (21 × 19, Snow/Citadel Biome) — Ten (Twist)
- **Concept**: Twisting high rampart navigation with celestial Cipher Dial puzzle gates and aerial vortex warps. The adventurer must align planetary astrolabe dials to open the vortex chamber, teleport across the abyssal gorge to the northern battlement, and claim the Golden Citadel Key.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Cipher Gate & Aerial Vortex**:
  - Cipher dial puzzle gate (`puzzle_gate_27_dial`, solution `[2, 0, 1]`).
  - Aerial vortex teleporter (`teleporter_27_vortex` -> `teleporter_27_spire`).
  - Golden Key (`key_gold_27`) and Golden Gate (`door_gold_27`).
  - Strict zero-bypass: Omitting cipher dial, teleporter, key, or door yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(19, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #27 with coordinates `(1, 3, 0)`.
  - Wall astronomical diagram at `(11, 7, 0)` detailing celestial dial alignments.
  - Bronze runic plate at `(15, 17, 0)` pointing to hidden Bastion Core Crystal (`secret_gem_27`, 500 pts).
- **Calibration**: Optimal BFS solution $\ge 70$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 4. Level 28: "The Sovereign's Ascent" (23 × 21, Snow/Citadel Biome) — Ketsu (Climax & Synthesis)
- **Concept**: The ultimate summit trial of Chapter 7 under strategic Fog of War (`fogOfWar: true`, `viewRadius: 7`). Combines high viaduct ramparts, patrolling sentinels, Rune Memory puzzle gates, conduit levers, mid-run checkpoint monoliths, and the Golden Apex Gate.
- **Topology**: 1-tile winding fortress labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Synthesis Mechanics Chain**:
  - Spawn (North doorway `(3, 1)`) -> Outer Fortress Labyrinth.
  - Sovereign Rune Memory Gate (`puzzle_gate_28_rune`, solution `[1, 3, 0, 2]`).
  - Ramp ascent to High Rampart Viaducts ($Z=1$) overlooking sentinel moat (`patroller_28`).
  - Checkpoint monolith (`checkpoint_28`) in fortified redoubt.
  - Crypt Dynamo Switch (`lever_28_summit`) lowering summit gate.
  - Golden Apex Key (`key_gold_28`) and Golden Apex Portal (`door_gold_28`).
  - Strict zero-bypass: Every puzzle, lever, key, and door is strictly required to reach the exit.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(21, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #28 with coordinates `(1, 3, 0)`.
  - Wall fresco at `(7, 5, 0)` portraying the complete ascent of the citadel.
  - Bronze runic plate at `(17, 19, 0)` concealing the Sovereign Crown Jewel (`secret_gem_28`, 600 pts).
- **Calibration**: Optimal BFS solution $\ge 120$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

## Consequences

### Positive
- Elevated Chapter 7 to 1-tile winding labyrinth topology ($\ge 70\%$ inertia, 0 dead spaces $\ge 4\times 4$).
- Seamless thematic and mechanical culmination before the final World Rotation (Chapter 8) and Grand Aqueduct (Chapters 9 & 10) sagas.
- 100% zero-bypass gating mathematically proven through automated BFS solvers.
- Full architectural consistency across North wall entrance doorways, subterranean archway exits, stone lecterns, and diegetic wall art.

### Verification Criteria
- `scripts/test-ch7-full-rigor.mjs` passes 100% of validation checks and zero-bypass assertions.
- `npm run validate:drift` passes 23/23 checks.
- `npm test` passes all suites with 0 failures.
