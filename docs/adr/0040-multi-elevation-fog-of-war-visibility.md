# 0040. Multi-Elevation Fog-of-War Line-of-Sight & Ground Wall Occlusion

Date: 2026-10-18

## Status
Accepted

## Context
Following the implementation of elevated platforms, bridges, and wall-top walkways (ADR-0038, BL-146, BL-147), players can climb ramps onto overhead walkways (`elevation === 1`) such as wall-top battlements (`WALL_WALK`), platforms (`PLATFORM`), and elevated viaduct bridges (`BRIDGE_EW`, `BRIDGE_NS`).

In levels utilizing Fog of War (such as Chapter 10 Level 38 "Concentric Trestles", Level 39, and Level 40):
1. Wall-top walkways (`WALL_WALK`) are structurally positioned on top of solid ground walls (`groundLayer[y][x] === TILES.WALL` with `overheadLayer[y][x] === TILES.WALL_WALK`).
2. The Fog of War raycaster in `FogOfWar.update(...)` checked only `groundLayer[testY][testX] === TILES.WALL`.
3. Consequently, whenever the player stood on a wall-top battlement at elevation 1:
   - Every ray immediately terminated at step distance 0.2 because the player's current coordinate had `groundLayer === 1`.
   - The player was completely blinded, unable to see adjacent corridors or rooms on either side of the battlement.
4. Conversely, if all ground walls were ignored while elevated, the player would see over single interior partition walls into distant unrevealed rooms across the entire level, destroying maze exploration and mystery.

## Decision
1. **Multi-Elevation LoS Raycaster in `FogOfWar.update(...)` (BL-155)**:
   - Identify if the player is currently elevated (`(Number(playerElevation) >= 1) || this.isElevatedSurface(overheadLayer[playerY][playerX], groundLayer[playerY][playerX])`).
   - For each cast ray, maintain a mutable ray state tracking `rayElevation`:
     - Initialized to `1` if the player is elevated, or `0` if at ground level.
   - While `rayElevation === 1`:
     - If the ray encounters an elevated surface (`WALL_WALK`, `PLATFORM`, `BRIDGE_*`, or `RAMP_*`), it remains on the upper level and continues propagating along the walkway (`continue`).
     - If the ray encounters an opaque ground wall *without* an overhead walkway, the ground wall face is illuminated (`VISIBLE`) and the ray terminates (`break`).
     - If the ray encounters an open ground tile (`groundLayer === 0` without an overhead surface), the ray descends into the lower open space (`rayElevation = 0`). The lower corridor/room is illuminated (`VISIBLE`).
   - While `rayElevation === 0`:
     - Standard ground line-of-sight applies: open floors remain visible, and ground walls illuminate their front surface before terminating the ray (`break`).
   - Result:
     - When standing on an elevated walkway, players see adjacent and nearby open lower halls and corridors within view radius as if on ground level.
     - Lower ground walls still stop rays, preventing players from seeing "over" single walls into rooms beyond.
     - When on ground level (`playerElevation === 0`), line-of-sight behavior remains 100% identical to legacy ground raycasting.

2. **Automated Test Coverage**:
   - Added unit test suite in `tests/unit/engine/fog.test.mjs` verifying:
     - Upper-level player on `WALL_WALK` illuminates walkway tiles.
     - Player illuminates adjacent lower corridors to the North and South.
     - Player illuminates facing ground walls.
     - Rooms beyond those ground walls remain occluded (`UNEXPLORED`).
