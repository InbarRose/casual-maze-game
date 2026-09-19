# 0005. Angled Top-Down (2.5D) Perspective and Dynamic Activities

Date: 2026-09-18

## Status
Accepted

## Context
Following the 3D `(X, Y, Z)` coordinate standardization and multi-elevation bridge/ramp mechanics, players and level creators needed:
1. **Visual Depth & 2.5D Angled Perspective**: The classic flat top-down grid lacked visual depth and the ability to convey vertical facades, wall drop relief, overhead bridge clearance, and sprite layering seen in classic 16-bit exploration games (e.g. Zelda, Pokémon).
2. **Interactive Dynamic Activities**: Maze traversal needed dynamic challenges beyond static keys and doors, specifically:
   - Instant teleportation between distinct 3D coordinates (including across elevation layers).
   - Timed environmental hazards (spikes, flame vents) with cyclical telegraphing.
   - Autonomous patrolling objects/hazards following discrete waypoint paths.
   - Interactive minigame puzzle gates (rune sequence memorization, celestial cipher dials) to unlock barrier gates.
3. **Pure Static Architecture Constraint**: All additions must remain 100% static, client-side, zero-dependency, running directly on GitHub Pages via HTML5 Canvas 2D and modern ES modules.

## Decision

### 1. Angled Top-Down (2.5D) Perspective Renderer (`js/engine/renderer.js`)
- Introduced `VIEW_PERSPECTIVES` enum (`topdown`, `angled`) in `js/core/constants.js`.
- Implemented `renderAngledPipeline`:
  - **Elevated Wall Caps & Facades**: Top cap face elevated by `wallH` (12px), vertical south-facing drop face with masonry relief and bottom drop shadows.
  - **Elevated Overhead Bridges**: Bridge spans rendered with physical vertical elevation (`heightOffset = 14px`), vertical stone/wood support pillars anchored to the ground floor, and floor drop shadows.
  - **Y-Sorted Depth Rendering**: Player, keys, doors, levers, teleporters, hazards, and patrollers are aggregated into a single depth-sorted pass ordered back-to-front by `bottomY = worldY + tileSize * 0.4`.
  - **Dynamic Perspective Toggling**: Hotkey `[V]` and HUD button toggle between `angled` and `topdown` modes instantly without interrupting gameplay.

### 2. Dynamic Activity Entities (`js/entities/`)
- **Teleporter (`js/entities/teleporter.js`)**: Warps player to `(targetX, targetY, targetZ)` with animated concentric portal rings and activation cooldown to prevent immediate rebound loops.
- **Timed Hazards & Patrollers (`js/entities/hazard.js`)**:
  - `TimedHazard`: Cyclical phase state machine (`dormant` -> `warning` -> `active` -> `decaying`) with telegraphing floor rings and collision detection.
  - `Patroller`: Linear interpolation across cyclic or ping-pong waypoint sequences, automatic facing angle calculation, and circular collision bounds.
  - Player collision triggers safe checkpoint respawn, screen flash, and telemetry event dispatch.
- **Puzzle Gate (`js/entities/puzzle-gate.js`)**: Static obstacle blocking passage until solved. Supports `RUNE_MEMORY` (sequence repetition) and `CIPHER_DIAL` (rotary combination) minigames.

### 3. Pure Static Puzzle Minigame Modal (`js/ui/puzzle-modal.js`)
- Client-side DOM overlay with keyboard and mouse accessibility, sequence replay, and rotary dial controls.
- On puzzle resolution, unlocks the target gate barrier and fires `puzzle:solved` events.

## Consequences

### Positive
- **Deep 2.5D Immersion**: Mazes gain physical presence, height differentiation, and architectural depth while remaining 100% Canvas 2D vector-drawn.
- **Engaging Dynamic Gameplay**: Teleporters, patrolling guards, timed fire vents, and mental minigames create varied, rich maze traversal experiences.
- **Seamless Backward Compatibility**: Existing levels seamlessly render in both top-down and angled perspectives with zero breaking changes.
- **Zero Runtime Dependencies**: Preserves full static GitHub Pages deployment compatibility.
- **Comprehensive Test Harness Coverage**: 124 passing automated tests across 28 suites verifying math, entities, rendering, and player journeys.

### Negative / Trade-offs
- Y-sorting adds a sorting pass over visible entities per frame; mitigated by viewport culling bounding-box checks.
- Wall facade drop faces require adjacent-tile south neighbor checks (`y + 1`) to only draw front drop faces where open floor or lower elevation exists.
