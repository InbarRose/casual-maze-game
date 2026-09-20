/**
 * Unit Tests: Mobile Touch Viewport, Canvas Swipe Controls & Minimap Gestures
 * Covers BL-16 and BL-17
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Minimap } from '../../../js/engine/minimap.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { Player } from '../../../js/entities/player.js';
import { Camera } from '../../../js/engine/camera.js';
import { TILES, THEMES, ELEVATION } from '../../../js/core/constants.js';

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
    arc: (x, y, r) => operations.push({ op: 'arc', x, y, r }),
    fill: () => operations.push({ op: 'fill' }),
    stroke: () => operations.push({ op: 'stroke' }),
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

function createMockLevel(width = 20, height = 20) {
  const ground = Array.from({ length: height }, () => new Array(width).fill(TILES.FLOOR));
  return {
    id: 'test_touch_level',
    title: 'Touch Control Test',
    dimensions: { width, height },
    spawn: { x: 5, y: 5 },
    exit: { x: 18, y: 18 },
    layers: { ground, overhead: null },
    entities: [],
    config: { theme: 'dungeon' },
  };
}

describe('Mobile Touch Viewport & Scroll Locking (BL-16)', () => {
  it('registers touch listeners with passive: false and prevents default scrolling', () => {
    const main = createMockCanvas(800, 600);
    const mini = createMockCanvas(180, 180);
    const level = createMockLevel();

    const loop = new GameLoop({
      mainCanvas: main.canvas,
      minimapCanvas: mini.canvas,
      level,
    });

    // Check touchstart registration on canvas has passive: false
    const touchStartRegs = main.eventListeners['touchstart'] || [];
    assert(touchStartRegs.length > 0, 'Canvas has touchstart listener');
    assertEqual(touchStartRegs[0].options?.passive, false, 'Touch listener uses passive: false for scroll cancellation');

    // Simulate touchstart and verify e.preventDefault is called
    let prevented = false;
    const mockTouchEvent = {
      type: 'touchstart',
      cancelable: true,
      preventDefault: () => { prevented = true; },
      touches: [{ clientX: 100, clientY: 100 }],
    };

    main.canvas.dispatchEvent(mockTouchEvent);
    assert(prevented, 'touchstart invokes preventDefault to lock page scroll');

    loop.destroy();
  });

  it('detects swipe gestures and translates them to directional movement', () => {
    const main = createMockCanvas(800, 600);
    const mini = createMockCanvas(180, 180);
    const level = createMockLevel();

    const loop = new GameLoop({
      mainCanvas: main.canvas,
      minimapCanvas: mini.canvas,
      level,
    });

    const movedDirections = [];
    loop.tryMoveDirection = (dir) => {
      movedDirections.push(dir);
      return true;
    };

    // 1. Swipe Right: start at (50, 50), move to (100, 50)
    main.canvas.dispatchEvent({
      type: 'touchstart',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 50, clientY: 50 }],
    });

    main.canvas.dispatchEvent({
      type: 'touchmove',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 100, clientY: 50 }],
    });

    main.canvas.dispatchEvent({
      type: 'touchend',
      cancelable: true,
      preventDefault: () => {},
      changedTouches: [{ clientX: 100, clientY: 50 }],
    });

    assertEqual(movedDirections[0], 'RIGHT', 'Swipe right triggers RIGHT movement');

    // 2. Swipe Up: start at (100, 100), move to (100, 40)
    main.canvas.dispatchEvent({
      type: 'touchstart',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 100, clientY: 100 }],
    });

    main.canvas.dispatchEvent({
      type: 'touchmove',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 100, clientY: 40 }],
    });

    main.canvas.dispatchEvent({
      type: 'touchend',
      cancelable: true,
      preventDefault: () => {},
      changedTouches: [{ clientX: 100, clientY: 40 }],
    });

    assertEqual(movedDirections[1], 'UP', 'Swipe up triggers UP movement');

    loop.destroy();
  });
});

describe('Minimap Pinch-to-Zoom & Pan Gestures (BL-17)', () => {
  it('initializes zoom at 1.0x and clamps within [1.0x, 3.5x]', () => {
    const { canvas } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);

    assertEqual(minimap.zoom, 1.0, 'Defaults to 1.0x overview zoom');
    assertEqual(minimap.minZoom, 1.0, 'Minimum zoom is 1.0x');
    assertEqual(minimap.maxZoom, 3.5, 'Maximum zoom is 3.5x');

    minimap.zoomBy(1.0);
    assertEqual(minimap.zoom, 2.0, 'Increments zoom to 2.0x');

    minimap.setZoom(5.0);
    assertEqual(minimap.zoom, 3.5, 'Clamps zoom to max 3.5x');

    minimap.setZoom(0.5);
    assertEqual(minimap.zoom, 1.0, 'Clamps zoom to min 1.0x');
    assertEqual(minimap.panX, 0, 'Resets panX when zoomed out to 1.0x');
  });

  it('pans minimap when zoomed in and respects boundaries', () => {
    const { canvas } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);
    const level = createMockLevel(20, 20);

    // Cannot pan when at 1.0x
    minimap.panBy(5, 5, level);
    assertEqual(minimap.panX, 0, 'Does not pan when at 1.0x overview');

    // Zoom in and pan
    minimap.setZoom(2.0);
    minimap.panBy(3, -2, level);
    assertEqual(minimap.panX, 3, 'Pans X by +3 grid units');
    assertEqual(minimap.panY, -2, 'Pans Y by -2 grid units');

    minimap.resetView();
    assertEqual(minimap.zoom, 1.0, 'resetView resets zoom to 1.0x');
    assertEqual(minimap.panX, 0, 'resetView resets panX to 0');
  });

  it('supports two-finger pinch gesture and double-tap zoom toggle on minimap', () => {
    const main = createMockCanvas(800, 600);
    const mini = createMockCanvas(180, 180);
    const level = createMockLevel(20, 20);

    const loop = new GameLoop({
      mainCanvas: main.canvas,
      minimapCanvas: mini.canvas,
      level,
    });

    assertEqual(loop.minimap.zoom, 1.0, 'Minimap starts at 1.0x');

    // 1. Two-finger pinch: start with 60px distance, expand to 120px (2x scale)
    mini.canvas.dispatchEvent({
      type: 'touchstart',
      cancelable: true,
      preventDefault: () => {},
      touches: [
        { clientX: 20, clientY: 50 },
        { clientX: 80, clientY: 50 },
      ],
    });

    mini.canvas.dispatchEvent({
      type: 'touchmove',
      cancelable: true,
      preventDefault: () => {},
      touches: [
        { clientX: 10, clientY: 50 },
        { clientX: 130, clientY: 50 },
      ],
    });

    assertEqual(loop.minimap.zoom, 2.0, 'Two-finger pinch-to-zoom scales minimap to 2.0x');

    mini.canvas.dispatchEvent({
      type: 'touchend',
      cancelable: true,
      preventDefault: () => {},
      touches: [],
    });

    // 2. Double-tap to toggle zoom
    loop.minimap.resetView();
    assertEqual(loop.minimap.zoom, 1.0, 'Reset to 1.0x');

    // First tap
    mini.canvas.dispatchEvent({
      type: 'touchstart',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 90, clientY: 90 }],
    });

    // Second tap immediately (< 300ms)
    mini.canvas.dispatchEvent({
      type: 'touchstart',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 90, clientY: 90 }],
    });

    assertEqual(loop.minimap.zoom, 2.2, 'Double-tap toggles zoom to 2.2x');

    loop.destroy();
  });

  it('accurately maps click coordinates to maze grid in both 1.0x and zoomed modes', () => {
    const { canvas } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);
    const level = createMockLevel(20, 20);
    const player = new Player(10, 10, 0, 32);

    // 1. At 1.0x: center of 180px canvas (90, 90) -> (10, 10) in 20x20 maze
    const overviewCoord = minimap.mapClickToGrid(90, 90, level, player);
    assertEqual(overviewCoord.gridX, 10, 'Center pixel maps to grid center at 1.0x');
    assertEqual(overviewCoord.gridY, 10, 'Center pixel maps to grid center at 1.0x');

    // 2. At 2.0x: focused on player at (10, 10)
    minimap.setZoom(2.0);
    const zoomedCoord = minimap.mapClickToGrid(90, 90, level, player);
    assertEqual(zoomedCoord.gridX, 10, 'Center of zoomed minimap still maps to player position (10, 10)');
    assertEqual(zoomedCoord.gridY, 10, 'Center of zoomed minimap still maps to player position (10, 10)');
  });

  it('renders zoomed corridor view and HUD zoom badge without errors', () => {
    const { canvas, mockCtx, operations } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);
    const level = createMockLevel(20, 20);
    const player = new Player(10, 10, 0, 32);

    minimap.setZoom(2.5);
    minimap.render(level, player, null, 0.016);

    const zoomText = operations.find(op => op.op === 'fillText' && op.text.includes('2.5×'));
    assert(zoomText !== undefined, 'Rendered "2.5×" HUD zoom badge in corner of minimap');
  });
});
