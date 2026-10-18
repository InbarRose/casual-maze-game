# 0038. Elevated Platforms, Wall-Top Walkways, Underpass Traversal, and Progressive Hazard Escalation

Date: 2026-10-18

## Status
Accepted

## Context
During playtesting of Chapter 9 (Levels 33–36), several critical gameplay, architectural, and visual limitations were identified:

1. **Campaign Victory Progression Blocker (BL-145)**:
   - Completing Level 33 did not present the "Next Level" victory button to advance to Level 34.
   - Root cause: `maze.html` and `profile-modal.js` contained a hardcoded boundary check (`currentIdNum < 32`), terminating victory quick-advance at Chapter 8 despite the addition of Chapters 9 and 10.

2. **Bridge Traversal & Elevation Model Constraints (BL-146)**:
   - Level 34 featured a bridge that could not be mounted. Players were blocked with `ramp_side_entry_blocked` because the approaching corridor entered the ramp perpendicular to its longitudinal travel axis.
   - Traditional bridges (`BRIDGE_EW`, `BRIDGE_NS`) were strictly 1-dimensional spans. Placing multiple adjacent bridge tiles caused false perimeter railing collisions.
   - Mazes lacked true 2D elevated platforms, battlement wall-top walkways, and multi-directional ground underpasses beneath overhead decks.
   - Visually, bridges were flat and uninspired without depth, shadow casting, colonnade pillars, or contextual edge railings.

3. **Level Topology & Hazard Continuity Gaps (BL-148)**:
   - Levels 33–36 contained vast unreachable "dead spaces" ($\ge 4 \times 4$ empty voids) within their outer grid dimensions.
   - Atmospheric water drops did not interact with gameplay or introduce puzzles.
   - Hazards introduced in earlier chapters (patrolling sentinels, floor spikes, timed hazards) completely disappeared, breaking the progressive challenge and tension curve.

## Decision

### 1. Dynamic Campaign Boundary Resolution (BL-145)
- Replaced all hardcoded level counts (`< 32` or `/ 32`) in `maze.html` and `js/ui/profile-modal.js` with dynamic bounds evaluated against `CAMPAIGN_LEVELS.length` (`currentIdNum < totalCampaignLevels`).
- Added automated UI regression testing (`tests/unit/ui/victory-quick-advance.test.mjs`) ensuring any campaign level $1 \le N < \text{total}$ renders the quick-advance button, and only the final level suppresses it.

### 2. Multi-Elevation Architecture Revamp (BL-146)
- **New Elevated Tile Types**:
  - `TILES.PLATFORM` (`'PLATFORM'`, alias `'PL'`): 2D walkable overhead platform allowing free 4-directional movement at elevation 1.
  - `TILES.WALL_WALK` (`'WALL_WALK'`, alias `'WW'`): Overhead walkway placed on top of ground walls, allowing elevated traversal along maze ramparts and parapets.
- **Collision Engine Overhaul (`js/engine/collision.js`)**:
  - Implemented `CollisionEngine.isOverheadWalkable(tile)` supporting `PLATFORM`, `WALL_WALK`, `BRIDGE_EW`, `BRIDGE_NS`, and directional ramps (`R_N`, `R_S`, `R_E`, `R_W`).
  - Allowed ramps on either `ground` or `overhead` layers with bi-directional height transitions.
  - Enabled ground underpasses: When `ground` is `0` (floor) beneath a bridge or platform, entities on elevation 0 move unobstructed beneath the overhead structure.
  - Enabled wall-walking: When `ground` is `TILES.WALL` (1) and `overhead` is `WALL_WALK` or `PLATFORM`, elevated entities (elevation 1) move freely along the wall top, while ground entities are stopped with `wall_hit`.
  - Chained bridge spans: Eliminated railing collisions when moving between adjacent connected bridge spans.
- **Minimap Integration (`js/engine/minimap.js`)**:
  - Added elevated deck shading for `PLATFORM` and `WALL_WALK` tiles.

### 3. Architectural 3D Overhead Viaduct Rendering (BL-147)
- In `js/engine/renderer.js`:
  - Added `renderAngledPlatformSpan` and `renderPlatformSpan` with multi-layered depth:
    - Ground drop shadows beneath elevated decks.
    - Support colonnade pillars and corbel brackets anchoring elevated platforms to underlying walls/floors.
    - Stone flagstone paving textures with ambient occlusion.
    - Contextual safety railings rendered only along exposed edges where no adjacent elevated tile exists.
  - Integrated `isElevatedSurface(level, x, y)` across angled top-down, classical 2D, and blueprint rendering pipelines.

### 4. Chapter 9 Redesign & Progressive Hazard Escalation (BL-148)
- Overhauled Levels 33, 34, 35, and 36:
  - Eliminated all dead spaces $\ge 5 \times 5$, converting voids into expansive winding labyrinth corridors, side alcoves, and puzzle chambers.
  - Redesigned Level 34 ramp approach corridor from $(4, 5) \to (5, 5)$, ensuring seamless longitudinal ramp mounting.
  - Added mandatory viaduct bridges and retaining wall water canals.
  - Preserved existing secret wall and gem test contracts while adding secret alcoves in Levels 33 and 34.
  - Reintroduced progressive hazards:
    - Patrolling sentinels: `patroller_sluice_33`, `patroller_canal_34`, `patroller_basin_35`, `patroller_spillway_36`.
    - Timed water/steam hazards: `hazard_sluice_33`, `hazard_spillway_36`.
  - Calibrated par step goals using headless shortest-path solver simulations.

## Consequences

### Positive
- **Seamless Progression**: Players can advance cleanly through Level 33, 34, and beyond without dead-ends in UI or collision.
- **Architectural Flexibility**: Level designers can build wide castle keeps, elevated balconies, rampart walkways, and overhead viaducts over canal underpasses.
- **Preserved Static Purity**: Runs 100% in client-side HTML5 Canvas/JavaScript with zero backend or build-step dependencies.
- **Full Backward Compatibility**: All 53 levels (Campaign Levels 1–40, Stories, Tutorials) remain 100% solvable with 0 test failures.

### Negative / Trade-offs
- Elevated wall walkways require designers to ensure ramp entry and exit paths align properly with wall heights to prevent entities from stepping off into void space.
- Renderer executes an additional elevation surface pass to compute dynamic railing adjacency.
