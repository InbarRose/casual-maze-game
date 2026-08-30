/**
 * Unit Tests: Puzzle Entities (Key, Door, Lever)
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { Key } from '../../../js/entities/key.js';
import { Door } from '../../../js/entities/door.js';
import { Lever } from '../../../js/entities/lever.js';

describe('Entities > Key, Door & Lever', () => {
  it('instantiates Key entity with colors, names, and coordinates', () => {
    const key = new Key({
      id: 'key_emerald_1',
      x: 3,
      y: 4,
      color: '#34d399',
      name: 'Emerald Key',
    });

    assertEqual(key.id, 'key_emerald_1');
    assertEqual(key.type, 'key');
    assertEqual(key.x, 3);
    assertEqual(key.y, 4);
    assertEqual(key.color, '#34d399');
    assertEqual(key.name, 'Emerald Key');
  });

  it('instantiates Door entity with lock states and requirements', () => {
    const door = new Door({
      id: 'door_emerald_1',
      x: 5,
      y: 5,
      requiresKey: 'key_emerald_1',
      color: '#34d399',
      isOpen: false,
    });

    assertEqual(door.id, 'door_emerald_1');
    assertEqual(door.type, 'door');
    assertEqual(door.requiresKey, 'key_emerald_1');
    assertEqual(door.isOpen, false);

    door.open();
    assertEqual(door.isOpen, true, 'Door state is open after open()');
  });

  it('toggles Lever state and mutates linked layer tile target', () => {
    const mapLevel = {
      dimensions: { width: 5, height: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, 1, 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
    };

    const lever = new Lever({
      id: 'lever_gate_1',
      x: 1,
      y: 1,
      state: false,
      targets: [
        { action: 'toggle_tile', layer: 'ground', x: 2, y: 1, stateA: 0, stateB: 1 },
      ],
    });

    assertEqual(mapLevel.layers.ground[1][2], 1, 'Tile is initially Wall (1)');

    const newState = lever.toggle(mapLevel);
    assertEqual(newState, true);
    assertEqual(lever.state, true);
    assertEqual(mapLevel.layers.ground[1][2], 0, 'Tile mutated to Floor (0)');

    lever.toggle(mapLevel);
    assertEqual(lever.state, false);
    assertEqual(mapLevel.layers.ground[1][2], 1, 'Tile reverted back to Wall (1)');
  });
});
