# 0043. Campaign-Wide True Maze Topology & 3D Multi-Elevation Redesign

Date: 2026-10-18

## Status
Accepted

## Context
Following the successful overhaul of Chapter 10 in ADR-0042, user feedback explicitly directed that the true maze topology and 3D elevation mechanics should not be confined to the final chapter:
> *"bridges on chapter 10 are still not a good experience, visually wierd, dont seem connected to the game play, randomly placed, small, and not consequential. the bridges/tunnels concept needs rework again. the idea is to allow more than 1 level of movement, so the maze is 3d not 2d, allowing more interesting designs where paths that could be dead ends might actually lead to a tunnel or a bridge to another section. being able to walk over an area and see into it, and see what you are looking for, but need to find the way down and around to it. being able to walk on the walls and look for the ramps up and down, these are exciting and fun elements we are completely missing.*
> *instead of mazes, we seem to have these patterned large rooms with designs in them. mazes should have longer corridors, turns, twists, forks, dead ends, traps, and hidden things.*
> *those maze and bridge/tunnel/topolgy/levels redesign was not meant only for that last chapter. please apply it across the entire set of chapters (all 40 levels) and identify improvements to be made."*

An architectural audit of Chapters 1 through 9 revealed that earlier versions often solved dead-space constraints ($\text{DeadSpace}_{\ge 4\times 4} = 0$) by carving $3\times 3$ or $4\times 4$ square/rectangular rooms, open concentric corridors, or rigid horizontal/vertical corridors. Furthermore, verticality (bridges, ramps, underpasses, and wall walks) was under-utilized in early chapters and lacked the sense of 3D non-planar traversal (where an apparent dead-end corridor actually leads through an underpass tunnel or up a ramp onto a battlement looking down onto a locked courtyard).

## Decision
1. **Universal True Labyrinth Standard**:
   - Apply deterministic organic DFS labyrinth carving with directional inertia ($\ge 70\%$) across all campaign chapters (Levels 1–40).
   - Ensure corridors are 1-tile wide with deliberate 90-degree elbows, blind turns, non-trivial branching forks, and deceptive dead-end spurs.
   - Maintain zero dead space ($\text{DeadSpace}_{\ge 4\times 4} = 0$) mathematically via odd-coordinate passage distribution.
   - Embed secret walls (`TILES.SECRET_WALL`) at dead ends hiding bonus collectibles or shortcuts.

2. **3D Multi-Elevation Architecture**:
   - Weave overhead bridges (`BRIDGE_EW`, `BRIDGE_NS`, `PLATFORM`) and underpass tunnels (`ground[y][x] = 0` beneath `BRIDGE_*`) so corridors intersect vertically in 3D without connecting in 2D.
   - Introduce wall-walk battlements (`WALL_WALK`) accessible via ramps, allowing the player to mount walls and scout lower chambers, keys, and doors from above through upper-level Line-of-Sight Fog of War (ADR-0040).
   - Require vertical scouting and navigation: players can see objectives below but must deduce the route down and around through the maze.

3. **Incremental Multi-Phase Delivery**:
   - **Phase 1: Chapters 1 & 2 (Levels 1–8)** — Foundation labyrinths and verticality introduction.
   - **Phase 2: Chapters 3 & 4 (Levels 9–16)** — Shifting clockwork levers and vertical astral rifts.
   - **Phase 3: Chapters 5 & 6 (Levels 17–24)** — Molten viaducts over magma fissures, timed dead-end traps, and library mezzanine wall-walks.
   - **Phase 4: Chapters 7, 8 & 9 (Levels 25–36)** — High-altitude citadel ramparts, 4-way camera perspective overpasses, and winding aqueduct canals.
   - **Phase 5: Campaign-Wide Quality Gating & Calibration** — Automated BFS solver validation, zero bypass verification, and manifest synchronization.

## Consequences
- The entire 40-level campaign transitions from flat, geometric room-and-corridor arrangements into authentic, immersive, multi-elevation labyrinths.
- Players experience true 3D spatial problem solving: climbing walls, crossing viaducts, diving into underpasses, and unravelling winding corridors.
- Zero server runtime dependencies are maintained (100% Vanilla ES6 on GitHub Pages).
- All changes are protected by automated regression test suites and atomic git commits.
