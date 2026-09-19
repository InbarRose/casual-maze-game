# 0006. Camera World Rotation, Branching Levels, and Multi-Room Dungeons

Date: 2026-09-19

## Status
Accepted

## Context
Following the introduction of 2.5D angled depth, carryable riddle relics, and thematic sagas, players and level designers required greater spatial freedom and nonlinear progression:
1. **Camera World Rotation & Perspective Mechanics**:
   - The fixed-orientation camera restricted architectural design to a single viewpoint, hiding objects behind north walls and limiting wall facade orientation.
   - Puzzles requiring multi-perspective inspection (revealing hidden alcoves, occluded underpasses, secret wall inscriptions, or rotated spatial landmarks) were not possible.
   - Screen controls needed to feel natural when the world is rotated, moving the character relative to screen cardinal directions (Up, Down, Left, Right).
2. **Branching Labyrinths & Multi-Exit Routing**:
   - Levels were strictly linear, with a single victory portal progressing directly to level `N + 1`.
   - Players requested branching decision points where choosing different paths or portals leads to alternative levels, secret bonus stages, or shortcut routes.
3. **Interconnected Multi-Room Dungeons**:
   - Complex dungeon adventures could not be contained in a single grid without performance overhead or narrative fragmentation.
   - Designers needed interconnected chambers (e.g. Courtyard, Catacombs, High Spire) within a single level, featuring bidirectional travel, room-specific biomes/dimensions, and persistent player state (inventory, keys, score, solved doors, switched levers).
4. **Pure Static Architecture Constraint**:
   - All mechanics must remain 100% client-side, zero-dependency, running directly on GitHub Pages via HTML5 Canvas 2D and modern ES modules.

## Decision

### 1. 90-Degree World Rotation Pipeline
- Defined 4 canonical rotation states in `js/core/constants.js`: `0° (North)`, `90° (East)`, `180° (South)`, `270° (West)`.
- Implemented smooth camera rotation interpolation (`rotationLerpSpeed`) and 2D transformation matrices in `js/engine/camera.js`:
  - `worldToScreen(wx, wy)`: Rotates coordinates around the level grid center before projecting to screen space.
  - `screenToWorld(sx, sy)`: Inverts the camera rotation matrix to map screen/mouse coordinates back to world grid coordinates.
- Screen-relative player movement in `js/engine/game-loop.js`:
  - Input directions (`UP`, `DOWN`, `LEFT`, `RIGHT`) are mapped to world deltas using `SCREEN_TO_WORLD_DELTAS[rotationAngle][dir]`.
  - Player visual facing dynamically updates to match the screen direction of travel.
- Added HUD rotation controls (`#btn-rotate-left`, `#btn-rotate-right`), compass badge (`#compass-badge`), and hotkeys (`[Q]` / `[R]`, `[` / `]`).
- Perspective-dependent drop face angles, bridge orientation, and 4-way Y-depth sorting in `js/engine/renderer.js`.

### 2. Branching Levels & Multi-Exit Contracts
- Expanded level schema to support an `exits` array alongside backward-compatible `exit`:
  - Each exit entry specifies `{ x, y, z, targetLevel, targetRoom, targetSpawn, label }`.
  - Level victory routing evaluates the matching exit tile stepped onto by the player:
    - If `targetLevel` is defined, the engine loads the destination level.
    - If `targetRoom` is defined, the engine initiates an intra-level room transition.
    - If neither is defined, default sequential progression (`level + 1`) is preserved.
- Renders glowing victory portals with tooltip labels indicating destination branches.

### 3. Interconnected Multi-Room Dungeon State Architecture
- Added `level.rooms` dictionary in `js/levels/level-loader.js` and `js/engine/game-loop.js`:
  - Each room defines its own `dimensions`, `layers`, `entities`, `spawn`, `exits`, and optional `config`.
  - Engine maintains active room state and room state cache (`roomStates[roomId]`).
  - When transitioning via portal (`transitionToRoom`):
    1. Active room state is snapshotted (doors unlocked, keys collected, levers toggled, tile mutations).
    2. Target room is loaded and restored from cache if previously visited.
    3. Player position is placed at `targetSpawn`.
    4. Global player state (inventory, score, timer, carried relics) is continuously preserved across rooms.
  - HUD displays an active room badge (`#hud-room-badge`).

### 4. Content & Testing Expansion
- Created **Chapter 8: *The Shifting Monolith*** (Levels 29–32) introducing camera rotation puzzles, occluded underpasses, and multi-faceted pillar keys.
- Created **Storyline 3: *The Whispering Citadel*** featuring 3 interconnected rooms (Courtyard, Catacombs, High Spire) and a branching portal to Chapter 8.
- Added unit and user journey tests covering rotation, screen navigation, multi-exit routing, and multi-room dungeons (53 suites, 250 tests passing).

## Consequences

### Positive
- **Rich Spatial Puzzles**: Players can inspect mazes from 4 angles, revealing paths hidden by perspective facades.
- **Nonlinear Adventures**: Designers can create branching campaign paths and Metroidvania-style dungeon complexes with backtracking and persistent world state.
- **Flawless Backward Compatibility**: Single-room and single-exit levels (1–28, tutorials, storylines) continue functioning without modification.
- **Zero Production Dependencies**: Remains 100% static on GitHub Pages with pure Canvas 2D and ES modules.

### Negative / Trade-offs
- Coordinate transformations require careful center-pivot matrix math when unprojecting mouse clicks and viewport culling bounds.
- Room transitions require transient cooldown logic (`lastRoomTransitionTime`) to prevent accidental re-triggering when standing on bidirectional portals.
