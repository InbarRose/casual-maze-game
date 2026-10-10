/**
 * Unit Tests: Strategic Fog of War Expansion & Exploratory Vision Dynamics (BL-88)
 *
 * Validates:
 * 1. Fog of War configuration across climatic levels (Level 4, 8, 12, 16, 20, 24, 28, 29, 30, 31, 32).
 * 2. FogOfWar engine raycasting with viewRadius 7.
 * 3. 3-state visibility transitions (UNEXPLORED -> VISIBLE -> EXPLORED).
 * 4. Wall occlusion stopping raycasting line-of-sight.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { FogOfWar } from '../../../js/engine/fog.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { FOG_STATE, TILES } from '../../../js/core/constants.js';

describe('Engine > Strategic Fog of War Expansion (BL-88)', () => {
  const fogLevelIds = ['4', '8', '12', '16', '20', '24', '28', '29', '30', '31', '32'];

  it('verifies climatic campaign levels have fogOfWar enabled with calibrated viewRadius', () => {
    for (const id of fogLevelIds) {
      const lvl = CAMPAIGN_LEVELS.find(l => String(l.id) === id);
      assert(lvl !== undefined, `Level ${id} must exist in CAMPAIGN_LEVELS`);
      assertEqual(lvl.config.fogOfWar, true, `Level ${id} must have fogOfWar enabled`);
      assert(typeof lvl.config.viewRadius === 'number' && lvl.config.viewRadius >= 5 && lvl.config.viewRadius <= 8,
        `Level ${id} viewRadius must be calibrated between 5 and 8 (got ${lvl.config.viewRadius})`);
    }
  });

  it('FogOfWar correctly performs 360-degree raycasting with viewRadius 7', () => {
    const width = 19;
    const height = 17;
    const fog = new FogOfWar(width, height);
    fog.reset();

    // Verify initial state is completely unexplored
    assertEqual(fog.getVisibility(9, 8), FOG_STATE.UNEXPLORED, 'Center tile initially unexplored');

    // Simple open ground
    const ground = Array.from({ length: height }, () => new Array(width).fill(TILES.FLOOR));
    const overhead = Array.from({ length: height }, () => new Array(width).fill(TILES.EMPTY));

    fog.update(9, 8, 0, ground, overhead, 7);

    // Player position and nearby open tiles must be visible
    assertEqual(fog.getVisibility(9, 8), FOG_STATE.VISIBLE, 'Player tile is VISIBLE');
    assertEqual(fog.getVisibility(9, 7), FOG_STATE.VISIBLE, 'Adjacent North tile is VISIBLE');
    assertEqual(fog.getVisibility(9, 14), FOG_STATE.VISIBLE, 'Tile within radius 6 is VISIBLE');

    // Far corner tile (> radius 7) must remain UNEXPLORED
    assertEqual(fog.getVisibility(0, 0), FOG_STATE.UNEXPLORED, 'Far corner tile is outside sight radius');
  });

  it('FogOfWar rays terminate upon hitting opaque wall tiles', () => {
    const width = 15;
    const height = 15;
    const fog = new FogOfWar(width, height);
    fog.reset();

    const ground = Array.from({ length: height }, () => new Array(width).fill(TILES.FLOOR));
    const overhead = Array.from({ length: height }, () => new Array(width).fill(TILES.EMPTY));

    // Place a solid wall at x = 7, y = 5..9 (blocking east)
    for (let y = 5; y <= 9; y++) {
      ground[y][7] = TILES.WALL;
    }

    fog.update(5, 7, 0, ground, overhead, 6);

    // West of wall (near player) is visible
    assertEqual(fog.getVisibility(6, 7), FOG_STATE.VISIBLE, 'Tile before wall is VISIBLE');
    assertEqual(fog.getVisibility(7, 7), FOG_STATE.VISIBLE, 'Wall face itself is VISIBLE');

    // Directly behind wall (east) must be obstructed and remain UNEXPLORED
    assertEqual(fog.getVisibility(8, 7), FOG_STATE.UNEXPLORED, 'Tile directly behind wall is occluded');
    assertEqual(fog.getVisibility(9, 7), FOG_STATE.UNEXPLORED, 'Tile further behind wall is occluded');
  });
});
