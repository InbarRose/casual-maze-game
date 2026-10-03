/**
 * Unit Tests: Mobile Movement (Continuous Touch Drag Steering), Waypoint Trail,
 * Collapsible Minimap Radar, and Destructive Confirmation Safety
 * Covers BL-67 and BL-68
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { GameMenu } from '../../../js/ui/game-menu.js';
import { StorageManager } from '../../../js/core/storage.js';
import { TILES } from '../../../js/core/constants.js';

function createMockCanvas(width = 800, height = 600) {
  const operations = [];
  const eventListeners = {};

  const mockCtx = {
    fillRect: (x, y, w, h) => operations.push({ op: 'fillRect', x, y, w, h, fillStyle: mockCtx.fillStyle }),
    strokeRect: (x, y, w, h) => operations.push({ op: 'strokeRect', x, y, w, h }),
    save: () => operations.push({ op: 'save' }),
    restore: () => operations.push({ op: 'restore' }),
    beginPath: () => operations.push({ op: 'beginPath' }),
    closePath: () => operations.push({ op: 'closePath' }),
    moveTo: (x, y) => operations.push({ op: 'moveTo', x, y }),
    lineTo: (x, y) => operations.push({ op: 'lineTo', x, y }),
    arc: (x, y, r) => operations.push({ op: 'arc', x, y, r, fillStyle: mockCtx.fillStyle, strokeStyle: mockCtx.strokeStyle }),
    fill: () => operations.push({ op: 'fill', fillStyle: mockCtx.fillStyle }),
    stroke: () => operations.push({ op: 'stroke', strokeStyle: mockCtx.strokeStyle }),
    roundRect: (x, y, w, h, r) => operations.push({ op: 'roundRect', x, y, w, h, r }),
    fillStyle: '#000000',
    strokeStyle: '#000000',
    globalAlpha: 1.0,
    lineWidth: 1,
    font: '10px sans-serif',
    textAlign: 'left',
    textBaseline: 'top',
    fillText: (text, x, y) => operations.push({ op: 'fillText', text, x, y }),
  };

  const canvas = {
    width,
    height,
    getContext: () => mockCtx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width, height }),
    addEventListener: (type, handler, options) => {
      if (!eventListeners[type]) eventListeners[type] = [];
      eventListeners[type].push({ handler, options });
    },
    removeEventListener: (type, handler) => {
      if (eventListeners[type]) {
        eventListeners[type] = eventListeners[type].filter(l => l.handler !== handler);
      }
    },
    dispatchEvent: (event) => {
      const list = eventListeners[event.type] || [];
      for (const item of list) {
        item.handler(event);
      }
    },
  };

  return { canvas, mockCtx, operations, eventListeners };
}

function createMockLevel(width = 15, height = 15) {
  const ground = Array.from({ length: height }, () => new Array(width).fill(TILES.FLOOR));
  return {
    id: 'test_movement_level',
    title: 'Movement Test Level',
    dimensions: { width, height },
    spawn: { x: 5, y: 5 },
    exit: { x: 12, y: 12 },
    layers: { ground, overhead: null },
    entities: [],
    config: { theme: 'dungeon' },
  };
}

describe('Mobile Movement > Continuous Touch Drag Steering (BL-67)', () => {
  it('triggers immediate directional movement when drag distance exceeds 24px', () => {
    const main = createMockCanvas(800, 600);
    const mini = createMockCanvas(180, 180);
    const level = createMockLevel();

    const loop = new GameLoop({
      mainCanvas: main.canvas,
      minimapCanvas: mini.canvas,
      level,
    });

    const moved = [];
    loop.tryMoveDirection = (dir) => {
      moved.push(dir);
      return true;
    };

    // Touch down at (100, 100)
    main.canvas.dispatchEvent({
      type: 'touchstart',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 100, clientY: 100 }],
    });

    // Drag right to (135, 100): dx = 35 >= 24
    main.canvas.dispatchEvent({
      type: 'touchmove',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 135, clientY: 100 }],
    });

    assertEqual(moved.length, 1, 'Drag immediately steps once threshold is reached');
    assertEqual(moved[0], 'RIGHT', 'Step direction is RIGHT');

    // Drag downward to (135, 145): dy = 45 > dx = 35 -> direction changes to DOWN
    main.canvas.dispatchEvent({
      type: 'touchmove',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 135, clientY: 145 }],
    });

    assertEqual(moved.length, 2, 'Direction change during drag triggers new step');
    assertEqual(moved[1], 'DOWN', 'Step direction updated to DOWN');

    // Lift finger
    main.canvas.dispatchEvent({
      type: 'touchend',
      cancelable: true,
      preventDefault: () => {},
      changedTouches: [{ clientX: 135, clientY: 145 }],
    });

    loop.destroy();
  });

  it('GameRenderer renders path waypoint pips for clickTarget', () => {
    const { canvas, mockCtx, operations } = createMockCanvas(800, 600);
    const renderer = new GameRenderer(canvas);
    const mockCamera = {
      worldToScreen: (wx, wy) => ({ x: wx, y: wy }),
    };

    const clickTarget = {
      x: 8,
      y: 8,
      time: performance.now(),
      path: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 7, y: 5 },
        { x: 8, y: 5 },
      ],
    };

    renderer.renderClickTarget(mockCtx, mockCamera, clickTarget, 32);

    // Verify arc operations were called for destination ring + core dot + 4 path waypoints
    const arcOps = operations.filter(op => op.op === 'arc');
    assert(arcOps.length >= 6, 'Rendered destination circle plus path waypoint dots');
  });
});

describe('UI > Destructive Confirmation Safety in Pause Menu (BL-68)', () => {
  it('protects Restart Level and Return to Level Select behind confirmation dialogs', () => {
    let restartCalled = false;
    let quitCalled = false;

    // Build mock modal element with confirmation boxes
    const classes = {
      '#pause-restart-confirm': new Set(['hidden']),
      '#pause-quit-confirm': new Set(['hidden']),
    };

    const listeners = {};

    const mockModal = {
      classList: {
        add: () => {},
        remove: () => {},
      },
      querySelectorAll: (sel) => {
        if (sel === '.pause-confirm-box') {
          return [
            { classList: { add: (c) => { classes['#pause-restart-confirm'].add(c); classes['#pause-quit-confirm'].add(c); } } },
          ];
        }
        return [];
      },
      querySelector: (sel) => {
        if (sel === '#pause-restart-confirm' || sel === '#pause-quit-confirm') {
          return {
            classList: {
              add: (c) => classes[sel].add(c),
              remove: (c) => classes[sel].delete(c),
              contains: (c) => classes[sel].has(c),
            },
          };
        }

        return {
          addEventListener: (type, handler) => {
            listeners[sel] = handler;
          },
        };
      },
    };

    const menu = new GameMenu({
      modalEl: mockModal,
      onRestart: () => { restartCalled = true; },
      onQuit: () => { quitCalled = true; },
    });

    // 1. Click restart button -> displays restart confirm box, does not restart yet
    listeners['#btn-pause-restart']?.();
    assertEqual(classes['#pause-restart-confirm'].has('hidden'), false, 'Restart confirmation box is visible');
    assertEqual(restartCalled, false, 'onRestart not called before confirmation');

    // 2. Click cancel -> hides confirm box
    listeners['#btn-pause-restart-cancel']?.();
    assertEqual(classes['#pause-restart-confirm'].has('hidden'), true, 'Restart confirmation box hidden after cancel');
    assertEqual(restartCalled, false, 'onRestart still not called');

    // 3. Click restart again and confirm -> invokes restart
    listeners['#btn-pause-restart']?.();
    listeners['#btn-pause-restart-confirm']?.();
    assertEqual(restartCalled, true, 'onRestart executed after user confirmation');

    // 4. Click quit -> displays quit confirm box
    listeners['#btn-pause-quit']?.();
    assertEqual(classes['#pause-quit-confirm'].has('hidden'), false, 'Quit confirmation box is visible');
    assertEqual(quitCalled, false, 'onQuit not called before confirmation');

    // 5. Click quit confirm -> invokes quit
    listeners['#btn-pause-quit-confirm']?.();
    assertEqual(quitCalled, true, 'onQuit executed after user confirmation');

    menu.destroy();
  });
});
