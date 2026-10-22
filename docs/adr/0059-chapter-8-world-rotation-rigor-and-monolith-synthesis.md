# ADR-0059: Chapter 8 World Rotation Rigor, 3D Occluded Underpasses, Cardinal Monoliths & Spire Bifurcation Labyrinth Topology

## Status
Accepted

## Context
Following the successful completion and merging of Chapter 1 (ADR-0049), Chapter 2 (ADR-0053), Chapter 3 (ADR-0054), Chapter 4 (ADR-0055), Chapter 5 (ADR-0056), Chapter 6 (ADR-0057), and Chapter 7 (ADR-0058), work advances to Phase 9 of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-185`).

Chapter 8 ("The Shifting Monolith & World Rotation", Levels 29–32: "The Cardinal Needle", "The Hidden Underpass", "The Four-Faced Pillar", "The Prismatic Spire") introduces full 4-way camera rotation (`allowRotation: true`), allowing the explorer to rotate the world by 90° increments using `[Q]` and `[R]`:
- Level 29: Introduces camera rotation across long cardinal needle corridors where occluding pillars block line of sight unless viewed from adapted angles.
- Level 30: Explores 3D underpasses occluded beneath overhead bridge decks at $Z=1$, where camera rotation reveals the subterranean passage and key hidden under the bridge span (`ground[7][7] === 'B_EW'` and `overhead[7][7] === 'B_NS'`).
- Level 31: Monolith monument with 4 cardinal wall decor carvings facing `north`, `east`, `south`, and `west`, requiring the player to survey the monument in full 360° rotation to glean all inscriptions.
- Level 32: Campaign culmination and climax under strategic Fog of War (`fogOfWar: true`, `viewRadius: 7`), synthesizing 4-way camera rotation, high mountain ramparts with directional ramps, a Spire Dynamo barrier lever, mid-run checkpoint monolith, Golden Apex Key/Door, and branching exits contract (`exit_spire_primary` looping to Level 1, and `exit_spire_citadel_branch` descending into the Whispering Citadel).

Prior to this overhaul, an automated metrics audit (`scripts/audit-level-metrics.mjs`) revealed severe quality gaps:
1. **Critically Low Corridor Inertia (0%–67%)**:
   - Level 29: **67% inertia** (broad corridors).
   - Level 30: **0% inertia** (sparse open space with empty pathways).
   - Level 31: **0% inertia** (large empty room around center).
   - Level 32: **14% inertia** (almost completely open arena).
2. **Missing `allowRotation: true`**: Despite Chapter 8's theme, `allowRotation` was missing from `config` across several levels.
3. **Flat Floor Markers**: Spawns and exits utilized generic flat circles rather than architectural North wall drop-face doorways (`wall_doorway`, `north`) and subterranean archways (`wall_archway`, `north`).
4. **Floating Lore Signs**: Notes were floating flat signs on the floor rather than stone lecterns (`style: "lectern_stone"`) recording discovery coordinates `(X, Y, Z)` for the Architect's Codex (ADR-0050).
5. **Short Paths**: Paths were trivial (24–32 steps), lacking true labyrinthine depth.

## Decision

We systematically re-engineer all four stages of Chapter 8 (Levels 29–32) to enforce rigorous 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone lecterns, diegetic wall art, and 4-way camera rotation.

### 1. Level 29: "The Cardinal Needle" (19 × 17, Dungeon Biome) — Ki (Introduction)
- **Concept**: Introduction to 4-way camera world rotation. The adventurer winds through long cardinal needle corridors stretching North, South, East, and West. Rotating the camera with `[Q]` and `[R]` aligns the view with cardinal hallways and reveals passages occluded behind monolithic corner blocks.
- **Topology**: 1-tile winding labyrinth with 81% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Spawn (North wall doorway `(3, 1)`) -> West needle corridor -> South wing to claim Golden Needle Key (`key_gold_29` at `(7, 15)`) -> East quadrant -> North Needle Sanctum Gate (`door_gold_29` at `(15, 3)`) -> Needle Sanctum Archway Exit `(15, 1)`.
  - Strict zero-bypass: Solving without key or with doors disabled returns strictly `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(15, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #29 with coordinates `(1, 3, 0)`.
  - Bronze runic plate at `(9, 7, 0)` explaining camera rotation mechanics.
  - Wall carving at `(15, 15, 0)` hinting secret wall concealing Sunstone Needle Core (`secret_gem_29`, 350 pts).
- **Calibration**: Optimal BFS solution = 53 steps; calibrated par = 61 steps (`Math.ceil(53 * 1.15)`).

### 2. Level 30: "The Hidden Underpass" (21 × 19, Dungeon Biome) — Shō (Development)
- **Concept**: 3D occluded underpass bridge at `(7, 7)` and perspective shifting. The overhead bridge deck (`overhead[7][7] === 'B_NS'`) occludes the subterranean underpass tunnel (`ground[7][7] === 'B_EW'`) in angled 2.5D view until the camera is rotated 90°, clearly exposing the tunnel mouth and the Underpass Cyan Key resting beneath.
- **Topology**: 1-tile winding labyrinth with 82% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Spawn `(3, 1)` -> West corridor -> Ground underpass `(7, 7, 0)` to claim Underpass Cyan Key (`key_cyan_30`).
  - Ramp approach at `(7, 9)` (`R_N`) leads to overhead bridge deck ($Z=1$) across `(7, 7, 1)` to claim Skyward Topaz (`gem_bridge_top`), descending via `(7, 5)` (`R_S`).
  - Eastern labyrinth routes through Underpass Exit Gate (`door_cyan_30` at `(17, 3)`) to Overpass Gate Archway Exit `(17, 1)`.
  - Strict zero-bypass: Solving without key or door yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #30 with coordinates `(1, 3, 0)`.
  - Runic plate at `(5, 7, 0)` explaining bridge perspective occlusion.
  - Carving at `(5, 17, 0)` pointing to secret wall concealing Occluded Sunstone (`secret_gem_30`, 400 pts).
- **Calibration**: Optimal BFS solution = 63 steps; calibrated par = 73 steps.

### 3. Level 31: "The Four-Faced Pillar" (21 × 19, Temple Biome) — Ten (Twist)
- **Concept**: Central monolithic monument with 4 cardinal wall decor carvings facing `north`, `east`, `south`, and `west`. The player walks the perimeter of the monolith, rotating the camera to inspect each face and align clues to unlock the eastern vault.
- **Topology**: 1-tile winding labyrinth with 83% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - 4 cardinal carvings:
    - `decor_north_face` at `(7, 6)` facing `north`: "Face of the North Wind: The ruby key sleeps in the eastern vault."
    - `decor_east_face` at `(8, 7)` facing `east`: "Face of the Dawn: When the perspective is turned, unseen paths emerge."
    - `decor_south_face` at `(7, 8)` facing `south`: "Face of the Zenith: Unlock the southern portal to continue upward."
    - `decor_west_face` at `(6, 7)` facing `west`: "Face of the Dusk: Rotate [R] clockwise to survey the courtyard."
  - Interior monument hollow `(7, 7)` housing Eye of the Four Winds gem (`gem_four_winds_eye_31`, 250 pts).
  - Eastern vault holds Ruby Winds Key (`key_ruby_31` at `(19, 9)`), required to open Four Winds Sanctuary Gate (`door_ruby_31` at `(17, 3)`).
  - Strict zero-bypass: Solving without key or door yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #31 with coordinates `(1, 3, 0)`.
  - Bronze runic plate at `(13, 7, 0)` containing Zephyr Stele Inscription.
  - Secret wall `SW` at `(1, 17)` concealing Four Winds Zephyr Core (`secret_gem_31`, 450 pts).
- **Calibration**: Optimal BFS solution = 59 steps; calibrated par = 68 steps.

### 4. Level 32: "The Prismatic Spire" (23 × 21, Snow Biome) — Ketsu (Climax & Branching Synthesis)
- **Concept**: Culmination of Chapter 8 under strategic Fog of War (`fogOfWar: true`, `viewRadius: 7`). Integrates 4-way camera rotation, mountain viaduct ramparts at $Z=1$, mid-run checkpoint monolith, Spire Dynamo barrier lever, Golden Apex Key/Door, and the campaign's signature branching exits contract.
- **Topology**: 1-tile winding mountain labyrinth with 85% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics Chain & Branching Exits**:
  - Spawn (North wall doorway `(3, 1)`) -> Western spires -> Checkpoint monolith (`checkpoint_32` at `(5, 7)`) -> Ramp ascent `(7, 15)` (`R_N`) over viaduct `(7, 11)` -> Ramp descent `(7, 9)` (`R_S`).
  - Spire Dynamo Switch (`lever_32_spire` at `(9, 19)`) lowering crystalline barrier wall at `(13, 11)`.
  - Eastern spire maze to retrieve Golden Apex Key (`key_gold_32` at `(21, 17)`).
  - Golden Spire Gate (`door_gold_32` at `(19, 5)`) unlocking access to the apex junction:
    - Primary Exit: `exit_spire_primary` (`targetLevel: '1'`, `label: 'Crown of the Monolith'`) at North archway `(21, 1)`.
    - Branch Exit: `exit_spire_citadel_branch` (`targetLevel: 'story_citadel_1'`, `label: 'Descend to Whispering Citadel'`) at North doorway `(11, 1)`.
  - Strict zero-bypass: Removing lever, key, or door prevents reaching both exits.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Primary Exit: North wall subterranean archway (`wall_archway`, `north`) at `(21, 1, 0)`.
  - Branch Exit: North wall doorway (`wall_doorway`, `north`) at `(11, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #32 with coordinates `(1, 3, 0)`.
  - Runic plate at `(15, 3, 0)` describing the spire bifurcation.
  - Wall carving at `(3, 19, 0)` hinting secret wall concealing Prismatic Spire Heart (`secret_gem_32`, 500 pts).
- **Calibration**: Optimal primary BFS path = 115 steps (par 133 steps); optimal branch BFS path = 121 steps.

## Consequences

### Positive
- Elevated Chapter 8 corridor directional inertia from substandard 0%–67% to pristine 81%–85%.
- Eradicated all dead space $\ge 4\times 4$ across every level ($0$ instances).
- Ensured authentic 4-way camera rotation compatibility (`allowRotation: true`) with adaptive screen controls across all Chapter 8 stages.
- Retained strict compliance with Kishōtenketsu story progression and full branching exits contract on Level 32.
- 100% zero-bypass gating mathematically verified via automated BFS solver.
- Complete architectural consistency with North wall entrance doorways, subterranean archway exits, stone lecterns, and diegetic wall art.

### Verification Criteria
- `scripts/test-ch8-full-rigor.mjs` passes 100% of validation checks and zero-bypass assertions.
- `npm run validate:drift` passes 23/23 checks.
- `npm test` passes all 156 test suites and 777 unit tests with 0 failures.
