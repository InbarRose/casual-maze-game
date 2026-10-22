# ADR-0048: Chapter 1 Level 1 True Labyrinth Topology, Secret Alcove & Wall Portal Architectural Visuals

## Status
Accepted

## Context
Following direct hands-on playtesting of Chapter 1 Level 1 ("First Footsteps"), critical gameplay, puzzle design, and visual presentation deficiencies were identified:
1. **Labyrinth Topology**: Previous revisions relied on open horizontal bands across rows 1, 3, 5, 7, 9, 11 where parallel corridors redundantly connected without dead ends, blind corners, or directional navigation tension.
2. **Secret Room Integrity**: The cracked secret wall (`SW`) at `(4, 1)` sat exposed in the middle of the main top hallway, immediately accessible without discovery, environmental cues, or exploration curiosity.
3. **Entrance & Exit Visuals**: Entrance and exit markers appeared as generic 2D floor circles rather than grounded architectural features embedded in the dungeon's stone masonry. The entrance lacked the sense of arriving into the dungeon from the sunny surface world above, and the exit lacked the sense of descending into the dark subterranean depths of Chapter 2.

## Decision

### 1. Artisanal Single-Tile Labyrinth Topology
- Completely redesigned `levels/chapter_1/level_1/layers.json` into an authentic winding labyrinth:
  - **Zero Dead Space Standard**: $\text{DeadSpace}_{\ge 4\times 4} = 0$.
  - **Directional Inertia**: 69% straight hallway persistence with deliberate 90-degree blind turns and dead-end exploration spurs.
  - **100% Zero-Bypass Gating**: The Golden Gate (`door_gold_1` at `(9, 2)`) completely encloses the Exit Sanctum at `(10, 2)`. The exit cannot be reached without recovering the Golden Key (`key_gold_1` at `(11, 10)`) in the deep southeast wing.
  - **Deceptive Secret Alcove**: Replaced the hallway secret wall with an enclosed dead-end alcove in the southwest wing (`(1, 5)`). A wall carving (`inscr_secret_hint`) provides diegetic lore: *"The dead-end wall whispers of hollow stone... seek the fissure where the mortar crumbles."* Striking the cracked wall (`SW` at `(1, 6)`) breaks into a secluded single-tile sanctuary (`(1, 7)`) housing the Secret Sunstone (`secret_gem_1`, 250 points).
  - **Calibrated Par**: Optimal solution is 52 steps; par budget set to 61 steps (1.17x ratio) and 30 seconds.

### 2. Architectural Entrance Doorway with Ascending Stairs & Open Vista
- Enhanced `renderWallEntranceDoorway` in `js/engine/renderer.js`:
  - Situation: Rendered on the front drop-face of the North wall directly behind spawn (`(2, 1)` for spawn at `(2, 2)`).
  - **Arched Stone Frame**: Heavy masonry voussoir arch with prominent keystone and wall-top border stroke.
  - **Open Exterior Vista**: Linear sky gradient (bright blue to golden sunlight) with a green hill landscape horizon silhouette and radiant sunlight rays streaming into the dungeon entryway.
  - **Ascending Stone Stairs**: A flight of 4 perspective stone steps climbing **UP** and back into daylight behind the character, with sunlit treads and shaded risers.
  - **Heavy Studded Timber Double-Doors**: Oak double-doors pushed open inward against the stone jambs, complete with black iron strap hinges, iron rivets, and brass handle ring.
  - **Floor Threshold Apron**: Refactored `renderWallAdjacentEntranceFloor` to draw flagstone pavers, warm ambient light wash, and a decorative stone diamond welcome inlay.

### 3. Architectural Exit Doorway with Descending Stairs into the Deep
- Enhanced `renderWallExitDoorway` in `js/engine/renderer.js`:
  - Situation: Rendered on the front drop-face of the North wall above the exit (`(10, 1)` for exit at `(10, 2)`).
  - **Deep Subterranean Archway**: Gothic stone archway with decorative keystone and glowing accent edge blur.
  - **Descending Stone Stairs**: A flight of 5 perspective stone steps stepping **DOWN** into the dark subterranean depths of Chapter 2, with progressive dark shading and highlighted tread lips.
  - **Subterranean Hearth Glow**: Warm golden-amber ember gradient and subtle downward guidance chevron radiating up from the deep cavern below.
  - **Flanking Wall Torches**: Twin iron sconces with animated flickering flames mounted on the masonry jambs.

## Consequences & Verification
- **Static Compatibility**: 100% client-side HTML5 Canvas 2D without server or runtime dependencies (GitHub Pages compatible).
- **Test Integrity**: All 156 test suites and 775 automated tests pass (`0 failed`), including unit tests, integration user journeys, and headless E2E browser tests.
- **Drift Protection**: All 23 drift checks in `tests/validate-drift.mjs` pass cleanly (`0 failed`).
- **Telemetry**: Level 1 verified with 0 dead space blocks, 69% corridor inertia, 9 entities, and 61 par steps.
