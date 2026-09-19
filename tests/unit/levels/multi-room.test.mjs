/**
 * Unit Tests: Multi-Room Labyrinth Normalization & State Management
 * Validates rooms normalization, inter-room state caching, and inventory persistence.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelLoader } from '../../../js/levels/level-loader.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { TILES, ELEVATION } from '../../../js/core/constants.js';

describe('Levels > Multi-Room Labyrinth Architecture', () => {
  const sampleMultiRoomLevel = {
    id: 'test_multi_room',
    title: 'Test Multi-Room Complex',
    dimensions: { width: 7, height: 7 },
    initialRoom: 'room_entrance',
    spawn: { x: 1, y: 1, elevation: 0 },
    exit: { x: 5, y: 5, elevation: 0 },
    rooms: {
      room_entrance: {
        title: 'Entrance Hall',
        theme: 'dungeon',
        dimensions: { width: 7, height: 7 },
        spawn: { x: 1, y: 1, elevation: 0 },
        exits: [
          {
            id: 'exit_to_crypt',
            x: 5,
            y: 5,
            elevation: 0,
            targetRoom: 'room_crypt',
            targetSpawn: { x: 2, y: 2, elevation: 0 },
          },
        ],
        layers: {
          ground: [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1],
          ],
          overhead: Array(7).fill(null).map(() => Array(7).fill(0)),
        },
        entities: [
          {
            id: 'door_entrance_gate',
            type: 'door',
            color: '#fbbf24',
            requiresKey: 'key_crypt_gold',
            x: 5,
            y: 4,
            elevation: 0,
          },
        ],
      },
      room_crypt: {
        title: 'Subterranean Crypt',
        theme: 'temple',
        dimensions: { width: 7, height: 7 },
        spawn: { x: 2, y: 2, elevation: 0 },
        exits: [
          {
            id: 'exit_back_to_entrance',
            x: 2,
            y: 2,
            elevation: 0,
            targetRoom: 'room_entrance',
            targetSpawn: { x: 5, y: 5, elevation: 0 },
          },
        ],
        layers: {
          ground: [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1],
          ],
          overhead: Array(7).fill(null).map(() => Array(7).fill(0)),
        },
        entities: [
          {
            id: 'key_crypt_gold',
            type: 'key',
            color: '#fbbf24',
            name: 'Crypt Master Key',
            x: 5,
            y: 5,
            elevation: 0,
          },
          {
            id: 'gem_crypt_bonus',
            type: 'collectible',
            collectibleType: 'gem',
            scoreValue: 100,
            x: 1,
            y: 5,
            elevation: 0,
          },
        ],
      },
    },
  };

  it('normalizes multi-room level definitions with nested rooms and exits', () => {
    const normalized = LevelLoader.normalizeLevel(sampleMultiRoomLevel);

    assert(normalized.rooms !== undefined, 'Rooms map is preserved');
    assertEqual(Object.keys(normalized.rooms).length, 2, 'Has 2 rooms');
    assertEqual(normalized.initialRoom, 'room_entrance', 'Initial room is preserved');

    const entrance = normalized.rooms.room_entrance;
    assertEqual(entrance.title, 'Entrance Hall');
    assertEqual(entrance.theme, 'dungeon');
    assertEqual(entrance.exits.length, 1);
    assertEqual(entrance.exits[0].targetRoom, 'room_crypt');
    assertEqual(entrance.exits[0].targetSpawn.x, 2);
    assertEqual(entrance.exits[0].targetSpawn.y, 2);

    const crypt = normalized.rooms.room_crypt;
    assertEqual(crypt.title, 'Subterranean Crypt');
    assertEqual(crypt.theme, 'temple');
    assertEqual(crypt.entities.length, 2);
  });

  it('initializes GameLoop in the initial room and swaps biome contexts', () => {
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        fillText: () => {},
        strokeText: () => {},
        measureText: () => ({ width: 10 }),
        drawImage: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
      }),
    };

    const loop = new GameLoop(sampleMultiRoomLevel, mockCanvas, mockCanvas);

    assertEqual(loop.isMultiRoom, true, 'GameLoop detects multi-room mode');
    assertEqual(loop.activeRoomId, 'room_entrance', 'Active room starts at room_entrance');
    assertEqual(loop.currentRoom.title, 'Entrance Hall', 'Room title is Entrance Hall');
    assertEqual(loop.level.theme, 'dungeon', 'Initial theme is dungeon');
    assertEqual(loop.player.x, 1, 'Player spawned at entrance room spawn X');
    assertEqual(loop.player.y, 1, 'Player spawned at entrance room spawn Y');

    // Simulate transition to room_crypt
    loop.transitionToRoom('room_crypt', { x: 2, y: 2, elevation: 0 });

    assertEqual(loop.activeRoomId, 'room_crypt', 'Active room switched to room_crypt');
    assertEqual(loop.currentRoom.title, 'Subterranean Crypt', 'Room title updated to Subterranean Crypt');
    assertEqual(loop.level.theme, 'temple', 'Theme dynamically changed to temple');
    assertEqual(loop.player.x, 2, 'Player teleported to target spawn X');
    assertEqual(loop.player.y, 2, 'Player teleported to target spawn Y');

    loop.stop();
  });

  it('maintains persistent inventory, keys, and score across room transitions', () => {
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        fillText: () => {},
        strokeText: () => {},
        measureText: () => ({ width: 10 }),
        drawImage: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
      }),
    };

    const loop = new GameLoop(sampleMultiRoomLevel, mockCanvas, mockCanvas);

    // Give player custom score and item in entrance
    loop.player.score = 50;
    loop.player.stepsTaken = 10;

    // Transition to crypt
    loop.transitionToRoom('room_crypt', { x: 5, y: 5, elevation: 0 }, true);

    // Collect crypt key
    const key = loop.entities.find(e => e.id === 'key_crypt_gold');
    assert(key !== undefined, 'Crypt key found in crypt room');
    loop.player.addKey(key.id);
    loop.player.score += 200;

    assertEqual(loop.player.hasKey('key_crypt_gold'), true, 'Player holds crypt key');
    assertEqual(loop.player.score, 250, 'Score is 250');

    // Transition back to entrance
    loop.transitionToRoom('room_entrance', { x: 5, y: 5, elevation: 0 }, true);

    assertEqual(loop.activeRoomId, 'room_entrance', 'Back in entrance room');
    assertEqual(loop.player.hasKey('key_crypt_gold'), true, 'Crypt key persisted back into entrance');
    assertEqual(loop.player.score, 250, 'Score persisted back into entrance');

    loop.stop();
  });

  it('preserves room mutable entity states (unlocked doors stay unlocked when returning)', () => {
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        fillText: () => {},
        strokeText: () => {},
        measureText: () => ({ width: 10 }),
        drawImage: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
      }),
    };

    const loop = new GameLoop(sampleMultiRoomLevel, mockCanvas, mockCanvas);

    // Unlock entrance door
    const door = loop.entities.find(e => e.id === 'door_entrance_gate');
    assert(door !== undefined, 'Door exists in entrance');
    assertEqual(door.isOpen, false, 'Door initially closed');
    door.open();
    assertEqual(door.isOpen, true, 'Door unlocked');

    // Switch to crypt and back
    loop.transitionToRoom('room_crypt', { x: 2, y: 2, elevation: 0 }, true);
    loop.transitionToRoom('room_entrance', { x: 5, y: 5, elevation: 0 }, true);

    const restoredDoor = loop.entities.find(e => e.id === 'door_entrance_gate');
    assertEqual(restoredDoor.isOpen, true, 'Door state was preserved across room transitions');

    loop.stop();
  });
});
