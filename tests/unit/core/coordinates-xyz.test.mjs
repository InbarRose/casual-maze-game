/**
 * Unit Tests for (X, Y, Z) 3D Coordinate Standard & Elevation Utilities
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { ELEVATION, formatXYZ, getElevationLabel } from '../../../js/core/constants.js';
import { Player } from '../../../js/entities/player.js';
import { Key } from '../../../js/entities/key.js';
import { Door } from '../../../js/entities/door.js';
import { Lever } from '../../../js/entities/lever.js';
import { LevelLoader } from '../../../js/levels/level-loader.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { CollisionEngine } from '../../../js/engine/collision.js';

describe('Core > (X, Y, Z) Coordinate Standard', () => {
  it('tests formatXYZ and getElevationLabel helper outputs', () => {
    assertEqual(formatXYZ(5, 6, 0), '(5, 6, 0)');
    assertEqual(formatXYZ(8, 7, 1), '(8, 7, 1)');
    assertEqual(formatXYZ(2, 3, -1), '(2, 3, -1)');
    assertEqual(formatXYZ(4, 4), '(4, 4, 0)');

    assertEqual(getElevationLabel(ELEVATION.GROUND), 'Ground (Z=0)');
    assertEqual(getElevationLabel(ELEVATION.OVERHEAD), 'Overhead (Z=1)');
    assertEqual(getElevationLabel(ELEVATION.BASEMENT), 'Basement (Z=-1)');
    assertEqual(getElevationLabel(2), 'Level Z=2');
  });

  it('tests Player entity gridZ, z getter/setter, and getCoordString', () => {
    const player = new Player(3, 4, 0);
    assertEqual(player.gridX, 3);
    assertEqual(player.gridY, 4);
    assertEqual(player.gridZ, 0);
    assertEqual(player.z, 0);
    assertEqual(player.elevation, 0);
    assertEqual(player.getCoordString(), '(3, 4, 0)');

    // Elevate to Overhead (Z=1)
    player.z = 1;
    assertEqual(player.gridZ, 1);
    assertEqual(player.elevation, 1);
    assertEqual(player.getCoordString(), '(3, 4, 1)');

    // Reset with elevation
    player.reset(7, 8, -1);
    assertEqual(player.gridX, 7);
    assertEqual(player.gridY, 8);
    assertEqual(player.gridZ, -1);
    assertEqual(player.getCoordString(), '(7, 8, -1)');
  });

  it('tests Key, Door, and Lever entity z properties and coord strings', () => {
    const key = new Key({ id: 'k1', x: 2, y: 5, z: 1, name: 'Canopy Key' });
    assertEqual(key.x, 2);
    assertEqual(key.y, 5);
    assertEqual(key.z, 1);
    assertEqual(key.elevation, 1);
    assertEqual(key.getCoordString(), '(2, 5, 1)');

    // Backward compatibility with config.elevation
    const door = new Door({ id: 'd1', x: 2, y: 6, elevation: 1, requiresKey: 'k1' });
    assertEqual(door.z, 1);
    assertEqual(door.elevation, 1);
    assertEqual(door.getCoordString(), '(2, 6, 1)');

    const lever = new Lever({ id: 'l1', x: 9, y: 12, elevation: 0 });
    assertEqual(lever.z, 0);
    assertEqual(lever.elevation, 0);
    assertEqual(lever.getCoordString(), '(9, 12, 0)');
  });

  it('tests LevelLoader normalization of z and elevation coordinates', () => {
    const raw = {
      id: 'xyz_test',
      dimensions: { width: 9, height: 9 },
      spawn: { x: 1, y: 1, z: 0 },
      exit: { x: 7, y: 7, elevation: 1 },
      testSpawn: { x: 2, y: 2, z: 1 },
      entities: [
        { id: 'key_1', type: 'key', x: 3, y: 3, elevation: 1 },
        { id: 'door_1', type: 'door', x: 4, y: 4, z: 0 },
      ],
    };

    const normalized = LevelLoader.normalizeLevel(raw);
    assertEqual(normalized.spawn.z, 0);
    assertEqual(normalized.spawn.elevation, 0);
    assertEqual(normalized.exit.z, 1);
    assertEqual(normalized.exit.elevation, 1);
    assertEqual(normalized.testSpawn.z, 1);
    assertEqual(normalized.testSpawn.elevation, 1);
    assertEqual(normalized.entities[0].z, 1);
    assertEqual(normalized.entities[0].elevation, 1);
    assertEqual(normalized.entities[1].z, 0);
    assertEqual(normalized.entities[1].elevation, 0);
  });

  it('tests LevelValidator reporting error and warning messages with formatXYZ', () => {
    const level = {
      id: 'xyz_val_test',
      dimensions: { width: 7, height: 7 },
      spawn: { x: 1, y: 1, z: 0 },
      exit: { x: 5, y: 5, z: 0 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 1, 0, 0, 0, 0, 1], // Spawn at (1, 1, 0) in solid wall
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 7 }, () => Array(7).fill(0)),
      },
      entities: [
        { id: 'door_1', type: 'door', x: 3, y: 1, z: 0, requiresKey: 'nonexistent_key' },
      ],
    };

    const report = LevelValidator.validate(level);
    assert(!report.valid, 'Validation failed as expected');
    const spawnErr = report.errors.find(e => e.message.includes('Spawn point'));
    assert(spawnErr && spawnErr.message.includes('(1, 1, 0)'), 'Spawn error includes (X, Y, Z) coordinate');

    const doorErr = report.errors.find(e => e.message.includes('Door "door_1"'));
    assert(doorErr && doorErr.message.includes('(3, 1, 0)'), 'Door error includes (X, Y, Z) coordinate');
  });

  it('tests CollisionEngine nextZ and nextElevation synchronization', () => {
    const testLevel = {
      dimensions: { width: 5, height: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, 'R_S', 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
    };

    // Step South onto R_S ramp from Ground (0) -> climbs to Overhead (1)
    const move = CollisionEngine.checkMove(2, 0, 2, 1, 0, testLevel);
    assert(move.allowed, 'Ramp entry allowed');
    assertEqual(move.nextZ, 1, 'nextZ is 1 (Overhead)');
    assertEqual(move.nextElevation, 1, 'nextElevation is 1 (Overhead)');
  });
});
