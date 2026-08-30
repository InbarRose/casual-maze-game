/**
 * User Journey 4: Fog Exploration & Dynamic Line-of-Sight
 * Simulates an explorer moving through dark subterranean corridors, discovering hidden alcoves,
 * and testing how visibility transitions from UNEXPLORED -> VISIBLE -> EXPLORED.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { FogOfWar } from '../../../js/engine/fog.js';
import { FOG_STATE } from '../../../js/core/constants.js';

describe('User Journey > Fog Exploration & Dynamic Line-of-Sight', () => {
  it('simulates player navigating winding corridors with realistic raycast sightlines', () => {
    const width = 12;
    const height = 12;
    // Map with central solid pillar at (5, 5) and dividing wall with corner
    const ground = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1], // Central pillar
      [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
    const overhead = Array.from({ length: 12 }, () => Array(12).fill(0));

    const fog = new FogOfWar(width, height);
    const viewRadius = 4;

    // 1. Initial player spawn at (1, 1) in northwest corner
    fog.update(1, 1, 0, ground, overhead, viewRadius);

    assertEqual(fog.getVisibility(1, 1), FOG_STATE.VISIBLE, 'Spawn tile is VISIBLE');
    assertEqual(fog.getVisibility(1, 3), FOG_STATE.VISIBLE, 'Direct line of sight south is VISIBLE');
    assertEqual(fog.getVisibility(3, 1), FOG_STATE.VISIBLE, 'Direct line of sight east is VISIBLE');

    // Tile at (3, 3) is behind solid wall at (2, 2) and (2, 3)
    assertEqual(fog.getVisibility(3, 3), FOG_STATE.UNEXPLORED, 'Tile hidden behind wall corner is UNEXPLORED');
    assertEqual(fog.getVisibility(10, 10), FOG_STATE.UNEXPLORED, 'Distant southeast corner is UNEXPLORED');

    // 2. Player moves East along corridor to (5, 1)
    fog.update(5, 1, 0, ground, overhead, viewRadius);

    // Current position and northern channel are VISIBLE
    assertEqual(fog.getVisibility(5, 1), FOG_STATE.VISIBLE);
    assertEqual(fog.getVisibility(5, 3), FOG_STATE.VISIBLE, 'Sightline down northern hallway is VISIBLE');

    // Behind central pillar (5, 7) remains hidden
    assertEqual(fog.getVisibility(5, 7), FOG_STATE.UNEXPLORED, 'Tile behind central pillar remains UNEXPLORED');

    // 3. Player moves around pillar to South side at (5, 9)
    fog.update(5, 9, 0, ground, overhead, viewRadius);

    // Now old spawn at (1, 1) is outside FOV and remembered as EXPLORED
    assertEqual(fog.getVisibility(1, 1), FOG_STATE.EXPLORED, 'Old spawn tile is now EXPLORED');
    assertEqual(fog.isExplored(1, 1), true);

    assertEqual(fog.getVisibility(5, 7), FOG_STATE.VISIBLE, 'Tile on South side of pillar is now VISIBLE');
    assertEqual(fog.getVisibility(5, 1), FOG_STATE.EXPLORED, 'Northern hallway remains remembered as EXPLORED');
  });
});
