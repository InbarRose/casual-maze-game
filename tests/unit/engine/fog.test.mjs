/**
 * Unit Tests: FogOfWar Subsystem & Dynamic Line-of-Sight Raycasting
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { FogOfWar } from '../../../js/engine/fog.js';
import { FOG_STATE } from '../../../js/core/constants.js';

describe('Engine > FogOfWar', () => {
  const width = 15;
  const height = 15;
  const emptyGround = Array.from({ length: height }, () => Array(width).fill(0));
  const emptyOverhead = Array.from({ length: height }, () => Array(width).fill(0));

  it('initializes all tiles as UNEXPLORED by default', () => {
    const fog = new FogOfWar(width, height);
    assertEqual(fog.getVisibility(0, 0), FOG_STATE.UNEXPLORED);
    assertEqual(fog.getVisibility(7, 7), FOG_STATE.UNEXPLORED);
    assertEqual(fog.isExplored(7, 7), false);
    assertEqual(fog.isVisible(7, 7), false);
  });

  it('marks player tile and surrounding FoV radius as VISIBLE and EXPLORED upon update', () => {
    const fog = new FogOfWar(width, height);
    fog.update(7, 7, 0, emptyGround, emptyOverhead, 3);

    assertEqual(fog.getVisibility(7, 7), FOG_STATE.VISIBLE, 'Player center is VISIBLE');
    assertEqual(fog.isExplored(7, 7), true, 'Player center is EXPLORED');
    assertEqual(fog.getVisibility(7, 9), FOG_STATE.VISIBLE, 'Tile at distance 2 is VISIBLE');
    assertEqual(fog.getVisibility(7, 12), FOG_STATE.UNEXPLORED, 'Tile beyond radius is UNEXPLORED');
  });

  it('converts previously visible tiles to EXPLORED when player moves away', () => {
    const fog = new FogOfWar(width, height);
    fog.update(2, 2, 0, emptyGround, emptyOverhead, 2);
    assertEqual(fog.getVisibility(2, 2), FOG_STATE.VISIBLE);

    // Player moves to distant position (12, 12)
    fog.update(12, 12, 0, emptyGround, emptyOverhead, 2);
    assertEqual(fog.getVisibility(2, 2), FOG_STATE.EXPLORED, 'Old tile becomes EXPLORED (remembered)');
    assertEqual(fog.isExplored(2, 2), true);
    assertEqual(fog.isVisible(2, 2), false);

    assertEqual(fog.getVisibility(12, 12), FOG_STATE.VISIBLE, 'New tile is VISIBLE');
  });

  it('casts raycast shadow occlusions behind solid walls', () => {
    const walledGround = Array.from({ length: height }, () => Array(width).fill(0));
    // Place a solid wall at x=5, y=7
    walledGround[7][5] = 1;

    const fog = new FogOfWar(width, height);
    // Player at x=3, y=7 looking East toward wall
    fog.update(3, 7, 0, walledGround, emptyOverhead, 5);

    assertEqual(fog.getVisibility(5, 7), FOG_STATE.VISIBLE, 'Wall front face is visible');
    assertEqual(fog.getVisibility(7, 7), FOG_STATE.UNEXPLORED, 'Tile directly behind wall is occluded in shadow');
  });

  it('supports mapRevealed memory mode where all tiles start EXPLORED', () => {
    const fog = new FogOfWar(width, height);
    fog.reset(true); // mapStartsRevealed = true

    assertEqual(fog.getVisibility(0, 0), FOG_STATE.EXPLORED, 'Tile starts EXPLORED in revealed mode');
    assertEqual(fog.getVisibility(14, 14), FOG_STATE.EXPLORED);
    assertEqual(fog.isExplored(5, 5), true);
    assertEqual(fog.isVisible(5, 5), false);

    fog.update(5, 5, 0, emptyGround, emptyOverhead, 2);
    assertEqual(fog.getVisibility(5, 5), FOG_STATE.VISIBLE, 'Active LoS tile becomes VISIBLE');
  });

  it('supports revealAll() cheat / debug functionality', () => {
    const fog = new FogOfWar(width, height);
    fog.revealAll();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        assertEqual(fog.getVisibility(x, y), FOG_STATE.VISIBLE);
      }
    }
  });

  it('illuminates adjacent lower halls from an upper-level battlement without seeing over walls (BL-146, ADR-0038)', () => {
    // 15x15 map
    // y=7 is a wall line from x=0 to 14
    // On that wall line, x=4..10 has overhead WALL_WALK
    // Lower rooms/halls are on North (y=5, 6) and South (y=8, 9)
    // An occluding ground wall is at y=4 (blocking further North)
    const testGround = Array.from({ length: height }, () => Array(width).fill(0));
    const testOverhead = Array.from({ length: height }, () => Array(width).fill(0));

    // Ground wall at y=7
    for (let x = 0; x < width; x++) {
      testGround[7][x] = 1;
    }
    // Overhead WALL_WALK at y=7, x=4..10
    for (let x = 4; x <= 10; x++) {
      testOverhead[7][x] = 'WALL_WALK';
    }
    // Ground wall at y=4 from x=4..10 (occluding wall further North)
    for (let x = 4; x <= 10; x++) {
      testGround[4][x] = 1;
    }

    const fog = new FogOfWar(width, height);
    // Player is at x=7, y=7 on upper elevation (playerElevation = 1)
    fog.update(7, 7, 1, testGround, testOverhead, 5);

    // 1. Player tile and walkway tiles along the battlement are VISIBLE
    assertEqual(fog.getVisibility(7, 7), FOG_STATE.VISIBLE, 'Walkway tile under player is VISIBLE');
    assertEqual(fog.getVisibility(6, 7), FOG_STATE.VISIBLE, 'Adjacent walkway west is VISIBLE');
    assertEqual(fog.getVisibility(8, 7), FOG_STATE.VISIBLE, 'Adjacent walkway east is VISIBLE');

    // 2. Adjacent lower halls (y=6 North, y=8 South) are VISIBLE looking down
    assertEqual(fog.getVisibility(7, 6), FOG_STATE.VISIBLE, 'Adjacent lower hall North (y=6) is VISIBLE');
    assertEqual(fog.getVisibility(7, 5), FOG_STATE.VISIBLE, 'Lower hall North (y=5) is VISIBLE');
    assertEqual(fog.getVisibility(7, 8), FOG_STATE.VISIBLE, 'Adjacent lower hall South (y=8) is VISIBLE');
    assertEqual(fog.getVisibility(7, 9), FOG_STATE.VISIBLE, 'Lower hall South (y=9) is VISIBLE');

    // 3. Occluding ground wall at y=4 is VISIBLE
    assertEqual(fog.getVisibility(7, 4), FOG_STATE.VISIBLE, 'North ground wall face (y=4) is VISIBLE');

    // 4. Room beyond ground wall at y=3, y=2 must NOT be seen through/over (occluded, UNEXPLORED)
    assertEqual(fog.getVisibility(7, 3), FOG_STATE.UNEXPLORED, 'Room behind ground wall (y=3) is occluded in shadow');
    assertEqual(fog.getVisibility(7, 2), FOG_STATE.UNEXPLORED, 'Room further behind ground wall (y=2) is occluded');
  });
});

