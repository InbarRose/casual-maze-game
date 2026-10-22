# ADR-0054: Chapter 3 Clockwork Foundry Rigor, Dynamic Levers & Shifting Labyrinth Topology

## Status
Accepted

## Context
Following the completion of Chapter 1 (ADR-0049) and Chapter 2 (ADR-0053) rigor overhauls, the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-180`) progresses to Chapter 3 ("Shifting Clockwork", Levels 9–12: "The Iron Lever", "Clockwork Gates", "Shifting Foundations", "Master of Wheels").

Chapter 3 introduces the dynamic mechanical lever and wall-state modification system of the engine:
- Levers (`lever`) with customizable target coordinate modifications (`targets: [{ x, y, tile: 0 }]` or toggling between open/closed barriers).
- Mechanical gates (`gate_closed` / `gate_open` or floor/wall transitions).
- Sequential multi-switch puzzles where multiple levers or keys must be manipulated in strict logical dependencies to open progression chokepoints.

Prior to this overhaul, an automated audit (`scripts/audit-level-metrics.mjs`) revealed severe design deficiencies in Chapter 3:
1. **Low Corridor Inertia (24%–38%)**:
   - Level 9: **27% inertia** (unbroken open rooms and straight 2-tile runways).
   - Level 10: **24% inertia** (wide open machinery floor with minimal navigational friction).
   - Level 11: **38% inertia** (hollow voids and short runways).
   - Level 12: **37% inertia** (flat open arenas despite being the chapter climax).
2. **Generic Floor Markers**: Spawns and exits utilized flat generic circle markers rather than architectural North wall drop-face doorways (`wall_doorway`, `north`) and subterranean archways (`wall_archway`, `north`).
3. **Floating Floor Notes**: Notes were flat floating sign entities rather than authentic stone lecterns (`style: "lectern_stone"`) recording exact discovery coordinates `(X, Y, Z)` for the Architect's Codex (ADR-0050).
4. **Mechanical Clues in Signs**: Clues and secret wall hints were in text signs rather than diegetic wall art (bas-relief stone carvings and bronze runic plates, ADR-0051).

## Decision

We systematically re-engineer all four stages of Chapter 3 (Levels 9–12) to enforce the highest standards of artisanal 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone lecterns, and diegetic wall art.

### 1. Level 9: "The Iron Lever" (15 × 13, Dungeon/Foundry Biome) — Ki (Introduction)
- **Concept**: Introductory foundry stage introducing dynamic clockwork levers. The adventurer enters the northern vestibule and navigates serpentine smelting corridors to find the primary Iron Lever, which dynamically collapses a solid masonry barrier to open the exit path.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Mechanical Dynamic Lever**:
  - Lever `lever_9_iron` positioned at `(13, 9, 0)`.
  - Toggles the shifting barrier gate at `(13, 3, 0)` from solid wall (`1`) to floor (`0`).
  - Strict zero-bypass: BFS pathfinding without flipping `lever_9_iron` strictly returns `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(1, 2, 0)` against North boundary wall `(1, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(13, 1, 0)` against North boundary wall `(13, 0, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 11, 0)` housing Architect's Note #9 with coordinates `(1, 11, 0)`.
  - Bas-relief wall carving at `(3, 4, 0)` depicting the gear mechanism connected to the northern gate.
  - Bronze runic plate at `(2, 11, 0)` hinting secret wall `SW` at `(3, 11)`, opening into hidden alcove concealing the Forgemaster's Gear (`secret_gem_9`, 300 pts) at `(5, 11, 0)`.
- **Calibration**: Optimal BFS solution $\ge 24$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 2. Level 10: "Clockwork Gates" (17 × 15, Dungeon/Foundry Biome) — Shō (Development)
- **Concept**: Dual sequential clockwork valves. Traversal requires navigating the western boiler wing to toggle the hydraulic valve, unlocking passage into the eastern piston gallery where the secondary valve lowers the exit portcullis.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Dual Dynamic Levers**:
  - Western Valve (`lever_10_west`) at `(1, 13, 0)`: collapses barrier at `(8, 7, 0)` to open access to eastern wing.
  - Eastern Piston (`lever_10_east`) at `(15, 13, 0)`: collapses barrier at `(15, 3, 0)` to open the exit sanctum.
  - Strict sequential zero-bypass: Omitting either `lever_10_west` or `lever_10_east` strictly returns `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)` beneath North wall `(3, 0, 0)`.
  - Exit: North wall subterranean archway at `(15, 1, 0)` beneath North wall `(15, 0, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(8, 13, 0)` housing Architect's Note #10 with coordinates `(8, 13, 0)`.
  - Bas-relief wall carving at `(5, 5, 0)` illustrating dual pressure gauges requiring synchronized release.
  - Bronze runic plate at `(10, 13, 0)` hinting secret wall `SW` at `(11, 13)`, concealing Brass Chronometer (`secret_gem_10`, 350 pts) at `(13, 13, 0)`.
- **Calibration**: Optimal BFS solution $\ge 35$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 3. Level 11: "Shifting Foundations" (17 × 15, Dungeon/Foundry Biome) — Ten (Twist)
- **Concept**: Toggling counterweights and key locks. Adventurer must balance moving counterweights with key retrieval: flipping the central counterweight lever alters the floor geometry, opening access to the gold sluice key while sealing alternative corridors.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Hybrid Mechanics (Lever + Key)**:
  - Counterweight lever (`lever_11_counterweight`) at `(8, 8, 0)`: toggles barrier gates.
  - Gold Sluice Key (`key_gold_11`) located deep in the southwest machinery shaft at `(1, 13, 0)`.
  - Gold Door at `(15, 3, 0)` directly guarding the exit archway.
  - Strict zero-bypass: Omitting either the lever or the gold key mathematically returns `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)` beneath North wall `(3, 0, 0)`.
  - Exit: North wall subterranean archway at `(15, 1, 0)` beneath North wall `(15, 0, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 7, 0)` housing Architect's Note #11 with coordinates `(1, 7, 0)`.
  - Wall carving at `(5, 3, 0)` illustrating the counterweight pulleys and shifting floor plates.
  - Bronze runic plate at `(14, 13, 0)` hinting secret wall `SW` at `(15, 12)`, concealing Gilded Flywheel (`secret_gem_11`, 400 pts) at `(15, 13, 0)`.
- **Calibration**: Optimal BFS solution $\ge 26$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 4. Level 12: "Master of Wheels" (19 × 17, Dungeon/Foundry Biome) — Ketsu (Climax)
- **Concept**: Climactic chapter finale operating under strategic Fog of War (`viewRadius: 7`). Synthesis of four grand machinery quadrants: steam generator, furnace crucible, gearworks gallery, and dynamo core. Requires retrieval of Furnace Ruby Key and activation of Master Dynamo Lever to breach the high keep.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Climactic Synthesis Mechanics**:
  - Furnace Ruby Key (`key_ruby_12`) at `(1, 15, 0)` in southwest crucible.
  - Master Dynamo Lever (`lever_12_dynamo`) at `(17, 15, 0)` in southeast generator hall.
  - Ruby Door at `(17, 7, 0)` sealing the northern dynamo conduit.
  - Dynamo Gate at `(17, 3, 0)` lowered by `lever_12_dynamo` to access the exit.
  - Strict zero-bypass: BFS solvers verify that omitting either the ruby key or dynamo lever yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(9, 2, 0)` beneath North wall `(9, 1, 0)`.
  - Exit: North wall subterranean archway at `(17, 1, 0)` beneath North wall `(17, 0, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(9, 15, 0)` housing Architect's Note #12 with coordinates `(9, 15, 0)`.
  - Wall carving at `(9, 6, 0)` depicting the Great Dynamo Wheel and furnace conduits.
  - Bronze runic plate at `(2, 15, 0)` hinting secret wall `SW` at `(3, 15)`, concealing Dynamo Core Crystal (`secret_gem_12`, 500 pts) at `(5, 15, 0)`.
- **Calibration**: Optimal BFS solution $\ge 47$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

## Consequences & Verification
- **Static Compatibility**: 100% static vanilla web execution with zero server or runtime dependencies (GitHub Pages).
- **Automated Test Integrity**: All 156 test suites and existing unit/integration tests must pass cleanly (`0 failed`).
- **Drift Protection**: `npm run validate:drift` must maintain 23/23 passing checks.
- **Level Package Alignment**: All 4 levels compiled into modular packages (`manifest.json`, `layers.json`, `entities.json`, `README.md`) under `levels/chapter_3/level_X/`.
- **Telemetry Verification**: Corridor directional inertia elevated from 24%–38% to $\ge 70\%$, with 0 dead spaces $\ge 4\times 4$.
