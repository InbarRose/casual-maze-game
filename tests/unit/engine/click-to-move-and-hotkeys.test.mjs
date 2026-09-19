/**
 * Unit Tests: Click-to-Move Pathfinding & Hotkey Toggles
 * Validates BFS navigation around obstacles, ramps/bridges, adjacent interact targeting,
 * and hotkeys toggle/simple keyboard mode isolation.
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { ELEVATION, TILES } from '../../../js/core/constants.js';
import { StorageManager } from '../../../js/core/storage.js';

function createMockCanvas(width = 800, height = 600) {
  const listeners = {};
  return {
    width,
    height,
    getContext: () => ({
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      measureText: () => ({ width: 10 }),
      fillText: () => {},
      strokeText: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
    }),
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width,
      height,
    }),
    addEventListener: (type, handler) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(handler);
    },
    removeEventListener: (type, handler) => {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter(h => h !== handler);
      }
    },
    trigger: (type, evt) => {
      if (listeners[type]) {
        for (const handler of listeners[type]) {
          handler(evt);
        }
      }
    },
  };
}

describe('Engine > Click-to-Move & Hotkey Toggles', () => {
  const testLevel = {
    id: 'test_click_move',
    title: 'Click-to-Move Lab',
    dimensions: { width: 7, height: 5 },
    config: { tileSize: 32, theme: 'dungeon', fogOfWar: false },
    spawn: { x: 1, y: 1, elevation: 0 },
    exit: { x: 5, y: 1, elevation: 0 },
    layers: {
      ground: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 0, 0, 0, 1], // (2,1) is wall; (1,1) must go south to (1,2) or (1,3) around wall
        [1, 0, 1, 0, 1, 0, 1], // (2,2) is wall; (4,2) is wall
        [1, 0, 0, 0, 0, 0, 1], // row 3 is open corridor connecting east and west
        [1, 1, 1, 1, 1, 1, 1],
      ],
      overhead: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
    },
    entities: [
      { id: 'lever_1', type: 'lever', x: 3, y: 1, state: false, targets: [] },
    ],
  };

  it('finds optimal path around walls from (1,1) to (3,1)', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(120, 120);
    const loop = new GameLoop({ mainCanvas, minimapCanvas, level: testLevel });

    assertEqual(loop.player.gridX, 1);
    assertEqual(loop.player.gridY, 1);

    const path = loop.findPathTo(3, 1);
    assert(path !== null, 'Path exists around wall');
    assert(path.length > 0, 'Path has steps');

    // (2,1) and (2,2) are walls. Explorer must step down to (1,3), across to (3,3), and up to (3,1).
    // Expected steps: (1,2) -> (1,3) -> (2,3) -> (3,3) -> (3,2) -> (3,1) = 6 steps
    assertEqual(path.length, 6, 'Optimal path is 6 steps');
    assertDeepEqual(path[path.length - 1], { x: 3, y: 1 }, 'Last step arrives at target cell');

    loop.destroy();
  });

  it('paths to nearest walkable neighbor when clicking a solid wall', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(120, 120);
    const loop = new GameLoop({ mainCanvas, minimapCanvas, level: testLevel });

    // (4,2) is a solid wall
    const path = loop.findPathTo(4, 2);
    assert(path !== null, 'Adjacent path found to solid obstacle');
    assert(path.length > 0, 'Path has steps');
    const lastStep = path[path.length - 1];
    const distToWall = Math.abs(lastStep.x - 4) + Math.abs(lastStep.y - 2);
    assertEqual(distToWall, 1, 'Final step is adjacent to the clicked obstacle');

    loop.destroy();
  });

  it('returns empty path if target is player current cell, and null if out of bounds', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(120, 120);
    const loop = new GameLoop({ mainCanvas, minimapCanvas, level: testLevel });

    const selfPath = loop.findPathTo(1, 1);
    assertDeepEqual(selfPath, [], 'Clicking current cell returns empty path');

    const oobPath = loop.findPathTo(-1, 2);
    assertEqual(oobPath, null, 'Out-of-bounds target returns null');

    loop.destroy();
  });

  it('triggers canvas pointerdown event to initiate click-to-move path', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(120, 120);
    const loop = new GameLoop({ mainCanvas, minimapCanvas, level: testLevel });

    assertEqual(loop.autoMovePath, null, 'autoMovePath initially null');

    // Camera clamps to maze center (112, 80) in a 800x600 canvas
    // Clicking center of canvas (400, 300) targets (3, 2)
    mainCanvas.trigger('pointerdown', {
      clientX: 400,
      clientY: 300,
      button: 0,
    });

    assert(loop.autoMovePath !== null, 'Pointer event initiated autoMovePath');
    assert(loop.autoMovePath.length >= 1, 'Path contains step towards target');
    assert(loop.clickTarget !== null, 'clickTarget recorded for rendering');
    assertEqual(loop.clickTarget.x, 3);
    assertEqual(loop.clickTarget.y, 2);

    loop.destroy();
  });

  it('cancels autoMovePath when user presses manual directional keys', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(120, 120);
    const loop = new GameLoop({ mainCanvas, minimapCanvas, level: testLevel });

    loop.autoMovePath = [{ x: 1, y: 2 }, { x: 1, y: 3 }];
    loop.clickTarget = { x: 1, y: 3, time: performance.now() };

    // Simulate pressing KeyD (Right)
    loop.keysDown.add('KeyD');
    loop.processPlayerMovement();

    assertEqual(loop.autoMovePath, null, 'Manual keypress clears autoMovePath');
    assertEqual(loop.clickTarget, null, 'Manual keypress clears clickTarget');

    loop.destroy();
  });

  it('supports toggling hotkeys and simple keyboard mode', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(120, 120);
    const loop = new GameLoop({ mainCanvas, minimapCanvas, level: testLevel });

    loop.setHotkeysEnabled(true);
    assertEqual(loop.areHotkeysEnabled(), true, 'Hotkeys are enabled');
    assertEqual(StorageManager.getSetting('hotkeys_enabled'), true);
    assertEqual(StorageManager.getSetting('simple_keyboard_mode'), false);

    loop.setHotkeysEnabled(false);
    assertEqual(loop.areHotkeysEnabled(), false, 'Hotkeys disabled in simple mode');
    assertEqual(StorageManager.getSetting('hotkeys_enabled'), false);
    assertEqual(StorageManager.getSetting('simple_keyboard_mode'), true);

    // Reset back to enabled default
    loop.setHotkeysEnabled(true);
    assertEqual(loop.areHotkeysEnabled(), true);

    loop.destroy();
  });
});
