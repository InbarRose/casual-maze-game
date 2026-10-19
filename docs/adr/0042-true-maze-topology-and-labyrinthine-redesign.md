# 0042. True Maze Topology & Labyrinthine Redesign Standard

Date: 2026-10-18

## Status
Accepted

## Context
Following user feedback and playtesting reviews of Chapter 10 ("The Prismatic Labyrinth"), a critical game design and topological deficiency was identified:
> *"instead of mazes, we seem to have these patterned large rooms with designs in them. mazes should have longer corridors, turns, twists, forks, dead ends, traps, and hidden things."*

During earlier dead-space elimination efforts (BL-149, ADR-0039), level generators relied on simple geometric loops (e.g. nested concentric squares `for (const r of [1, 3, 5, 7, 9])` in Level 38, or uniform alternating horizontal stripes `for (let y = 1; y <= 11; y += 2)` in Levels 39 and 40). While this mechanically eliminated voids $\ge 4\times 4$, it destroyed the essence of an authentic **maze**:
1. **Lack of Corridors**: Levels felt like large square open rooms filled with repetitive barcode stripes or concentric square tracks rather than winding labyrinths.
2. **Absence of Blind Corners & Mystery**: Straight lines across entire quadrants negated Fog-of-War tension; players could see the entire corridor in one glance.
3. **No Meaningful Decision Forks**: Movement was trivial lawnmower sweeping rather than strategic navigation through branches and forks.
4. **No Deceptive Dead Ends**: Without real dead ends, there was no risk of taking a wrong turn, no tactical backtracking, and no anticipation of discovering hidden alcoves or stumbling into traps.
5. **Superficial Elevation**: Elevation was not embedded into the maze topology, missing opportunities where a ground-level dead end actually passes under a bridge or leads to a ramp up to a wall-walk.

## Decision
1. **Labyrinth Generation Paradigm & Topology Standard (`buildLabyrinthSector`)**:
   - Implemented a specialized, deterministic organic labyrinth carver in [`scripts/redesign-chapter-10.mjs`](../../scripts/redesign-chapter-10.mjs):
     - **Directional Inertia ($\ge 70\%$)**: Corridors persist in their current direction before turning, generating long winding corridors (5 to 11 tiles) with deliberate 90-degree elbows and S-curves.
     - **Branching Decision Forks & Dead Ends**: Introduces non-trivial T-junctions and deep dead-end spurs that force exploration and spatial orientation.
     - **Controlled Braid Factor ($15\text{--}20\%$)**: Selectively carves dead-end walls into loops, allowing flanking routes and circuit traversal while preserving authentic dead ends.
     - **Guaranteed $\text{DeadSpace}_{\ge 4\times 4} = 0$**: In an odd-coordinate DFS grid, every $2\times 2$ block contains at least one odd corridor tile, mathematically preventing any solid wall void $\ge 4\times 4$.

2. **Chapter 10 Macro-Labyrinth Redesign (Levels 37–40)**:
   - **Level 37 ("The Spectral Gate", 23x23)**:
     - Replaced parallel NW/SW/SE rows with 5 organic labyrinth sectors.
     - Spawn winds into blind corners and deceptive dead ends; Amber Key tucked at $(3, 7)$.
     - SW Sentinel Maze features a patrolling warden and timed spike traps along narrow corridor forks.
     - Sealed SE Crypt is an authentic twisting catacomb.
     - Optimal path calibrated at 75 steps (par 87).
   - **Level 38 ("Concentric Trestles", 25x25)**:
     - Eliminated concentric square rings in favor of a 3D multi-elevation labyrinth.
     - Integrates high perimeter battlements (`WALL_WALK`), grand viaducts (`PLATFORM`/`BRIDGE_EW`), and underpass tunnels (`ground[y][x] = 0` beneath `BRIDGE_*`).
     - Ground perimeter of NW quadrant is sealed, making elevated traversal mandatory (40/81 steps elevated, almost $50\%$).
     - Keystone sits in the Sunken Keystone Courtyard, viewed from the ramparts above and reached via an underpass tunnel below the viaduct.
     - Optimal path calibrated at 81 steps (par 94).
   - **Level 39 ("Harmonic Mirror Seals", 27x27)**:
     - Replaced 4 striped quadrant boxes with a cohesive harmonic mirror labyrinth.
     - Winding corridors, blind corners, and dead-end hazard spurs around the central spine and Astral Sanctum.
     - Optimal path calibrated at 76 steps (par 88).
   - **Level 40 ("Heart of the Prism", 29x29)**:
     - Replaced 4 striped quadrant boxes with 4 vast elemental macro-labyrinths (Ruby, Emerald, Sapphire, Apex Astral).
     - Each quadrant features distinct twisting corridors, dead-end traps, patrolling colossi, and viaduct bridges.
     - Sequential gating: Ruby Key $\rightarrow$ Emerald Barrier $\rightarrow$ Emerald Key $\rightarrow$ Sapphire Barrier $\rightarrow$ Sapphire Key $\rightarrow$ Apex Barrier $\rightarrow$ Heart of the Prism exit.
     - Optimal path calibrated at 165 steps (par 190).

3. **Validation & Verification**:
   - 100% passing automated tests across all 153 suites (761 tests) in `tests/`.
   - 23/23 drift verification checks passing with updated SHA-256 hashes in `levels/manifest.json`.
   - All 4 levels verified with zero dead space ($\text{DeadSpace}_{\ge 4\times 4} = 0$), LevelValidator ($0$ errors, $0$ warnings), and full game loop playthrough simulation (`simulateCampaignLevelPlaythrough`).

## Consequences
- The game now delivers genuine, exciting, labyrinthine exploration with suspense, blind corners, tactical backtracking, traps, hidden alcoves, and meaningful 3D elevation traversal.
- The geometric "barcode" rooms and concentric tracks are completely eradicated from Chapter 10.
- All code remains 100% static Vanilla ES6 JavaScript, running without server runtime dependencies on GitHub Pages.
