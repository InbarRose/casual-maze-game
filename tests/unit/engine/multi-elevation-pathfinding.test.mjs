/**
 * Unit Tests: Multi-Elevation BFS Pathfinding, Responsive Touch Tap (No Deadzone),
 * and Universal Inline Destructive Confirmation Safety
 * Covers BL-72, BL-73, BL-74
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { TILES, ELEVATION } from '../../../js/core/constants.js';
import { ProfileModal } from '../../../js/ui/profile-modal.js';
import { SettingsModal } from '../../../js/ui/settings-modal.js';
import { GameMenu } from '../../../js/ui/game-menu.js';
import { StorageManager } from '../../../js/core/storage.js';

function createMockCanvas(width = 800, height = 600) {
  const operations = [];
  const eventListeners = {};

  const mockCtx = {
    fillRect: (x, y, w, h) => operations.push({ op: 'fillRect', x, y, w, h }),
    strokeRect: (x, y, w, h) => operations.push({ op: 'strokeRect', x, y, w, h }),
    save: () => operations.push({ op: 'save' }),
    restore: () => operations.push({ op: 'restore' }),
    beginPath: () => operations.push({ op: 'beginPath' }),
    closePath: () => operations.push({ op: 'closePath' }),
    moveTo: (x, y) => operations.push({ op: 'moveTo', x, y }),
    lineTo: (x, y) => operations.push({ op: 'lineTo', x, y }),
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

function createBridgeLevel() {
  // 11x11 level with a B_EW bridge at (5, 5), R_S ramp at (5, 6), R_N ramp at (5, 4)
  // Walls surrounding to force crossing over the bridge
  const width = 11;
  const height = 11;
  const ground = Array.from({ length: height }, () => new Array(width).fill(TILES.FLOOR));

  // Place bridge configuration
  ground[5][5] = TILES.B_EW;
  ground[6][5] = TILES.R_S;
  ground[4][5] = TILES.R_N;

  // Solid walls on columns 4 and 6 to force player through the ramps & bridge
  for (let y = 3; y <= 7; y++) {
    ground[y][4] = TILES.WALL;
    ground[y][6] = TILES.WALL;
  }

  return {
    id: 'test_bridge_path_level',
    title: 'Bridge Path Test Level',
    dimensions: { width, height },
    spawn: { x: 5, y: 7 },
    exit: { x: 5, y: 3 },
    layers: { ground, overhead: null },
    entities: [],
    config: { theme: 'dungeon' },
  };
}

describe('Multi-Elevation BFS Pathfinding & Tap Sensitivity (BL-72)', () => {
  it('findPathTo navigates across bridge ramps and elevated spans (BL-72)', () => {
    const main = createMockCanvas(800, 600);
    const mini = createMockCanvas(180, 180);
    const level = createBridgeLevel();

    const loop = new GameLoop({
      mainCanvas: main.canvas,
      minimapCanvas: mini.canvas,
      level,
    });

    // Player starts at (5, 7) at elevation 0
    assertEqual(loop.player.gridX, 5, 'Player starts at x=5');
    assertEqual(loop.player.gridY, 7, 'Player starts at y=7');
    assertEqual(loop.player.elevation, 0, 'Player starts on ground floor');

    // Pathfind to (5, 3) on the other side of the bridge
    const path = loop.findPathTo(5, 3);
    assert(path !== null, 'Path across bridge exists and is found');
    assert(path.length >= 4, 'Path contains steps to reach target');

    // Verify path steps through ramp (5, 6) -> bridge (5, 5) -> ramp (5, 4) -> (5, 3)
    const expectedCoords = [
      { x: 5, y: 6 },
      { x: 5, y: 5 },
      { x: 5, y: 4 },
      { x: 5, y: 3 },
    ];

    for (let i = 0; i < expectedCoords.length; i++) {
      assertEqual(path[i].x, expectedCoords[i].x, `Step ${i} x coordinate`);
      assertEqual(path[i].y, expectedCoords[i].y, `Step ${i} y coordinate`);
    }

    // Pathfind directly onto the bridge deck (5, 5)
    const bridgePath = loop.findPathTo(5, 5);
    assert(bridgePath !== null, 'Path directly onto bridge deck exists');
    assertEqual(bridgePath[bridgePath.length - 1].x, 5);
    assertEqual(bridgePath[bridgePath.length - 1].y, 5);

    loop.destroy();
  });

  it('eliminates tap deadzone: micro-drag under 20px triggers pointer click (BL-72)', () => {
    const main = createMockCanvas(800, 600);
    const mini = createMockCanvas(180, 180);
    const level = createBridgeLevel();

    const loop = new GameLoop({
      mainCanvas: main.canvas,
      minimapCanvas: mini.canvas,
      level,
    });

    let pointerDownCalled = false;
    let pointerCoords = null;
    loop.handleCanvasPointerDown = (coords) => {
      pointerDownCalled = true;
      pointerCoords = coords;
    };

    // Touch down at (100, 100)
    main.canvas.dispatchEvent({
      type: 'touchstart',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 100, clientY: 100 }],
    });

    // Micro-drag to (116, 100): dx = 16px (below 20px drag steer threshold)
    main.canvas.dispatchEvent({
      type: 'touchmove',
      cancelable: true,
      preventDefault: () => {},
      touches: [{ clientX: 116, clientY: 100 }],
    });

    // Lift finger
    main.canvas.dispatchEvent({
      type: 'touchend',
      cancelable: true,
      preventDefault: () => {},
      changedTouches: [{ clientX: 116, clientY: 100 }],
    });

    assert(pointerDownCalled, 'Micro-drag triggers pointerDown (no deadzone!)');
    assertEqual(pointerCoords?.clientX, 116, 'PointerDown receives accurate clientX');
    assertEqual(pointerCoords?.clientY, 100, 'PointerDown receives accurate clientY');

    loop.destroy();
  });
});

describe('Inline Destructive Confirmation Safety & Popup Avoidance (BL-73, BL-74)', () => {
  it('ProfileModal protects Reset Save with inline confirmation box (BL-73)', () => {
    const modal = new ProfileModal();
    modal.open();

    const resetBtn = modal.modalEl.querySelector('#btn-profile-reset');
    const confirmBox = modal.modalEl.querySelector('#profile-reset-confirm-box');
    const cancelBtn = modal.modalEl.querySelector('#btn-profile-cancel-reset');
    const confirmBtn = modal.modalEl.querySelector('#btn-profile-confirm-reset');

    assert(resetBtn !== null, 'Reset Save button exists');
    assert(confirmBox !== null, 'Inline confirmation box exists');
    assert(cancelBtn !== null, 'Cancel button exists');
    assert(confirmBtn !== null, 'Confirm button exists');

    // Click Reset Save: reveals confirm box and hides button
    resetBtn.click();
    assertEqual(confirmBox.style.display, 'inline-flex', 'Confirm box revealed on click');
    assertEqual(resetBtn.style.display, 'none', 'Reset button hidden while confirming');

    // Click Cancel: restores initial state
    cancelBtn.click();
    assertEqual(confirmBox.style.display, 'none', 'Confirm box hidden after cancel');
    assertEqual(resetBtn.style.display, 'inline-block', 'Reset button restored after cancel');

    modal.close();
  });

  it('SettingsModal protects Backup Restore with inline confirmation box (BL-73)', () => {
    const modal = new SettingsModal();
    modal.open();

    const restoreBox = modal.modalEl.querySelector('#settings-restore-confirm-box');
    const cancelBtn = modal.modalEl.querySelector('#btn-settings-cancel-restore');
    const confirmBtn = modal.modalEl.querySelector('#btn-settings-confirm-restore');
    const fileInput = modal.modalEl.querySelector('#settings-save-file-input');

    assert(restoreBox !== null, 'Settings restore confirm box exists');
    assert(cancelBtn !== null, 'Settings restore cancel button exists');
    assert(confirmBtn !== null, 'Settings restore confirm button exists');
    assert(fileInput !== null, 'Settings file input exists');

    // Trigger file selection
    fileInput.onchange({ target: { files: [{ name: 'backup.json' }] } });
    assertEqual(restoreBox.style.display, 'block', 'Restore confirm box revealed on file selection');

    // Click cancel
    cancelBtn.click();
    assertEqual(restoreBox.style.display, 'none', 'Restore confirm box hidden on cancel');

    modal.close();
  });

  it('GameMenu supports promptQuit and promptRestart with inline confirmation (BL-74)', () => {
    const classes = {
      '#pause-restart-confirm': new Set(['hidden']),
      '#pause-quit-confirm': new Set(['hidden']),
    };

    const mockModal = {
      classList: {
        add: () => {},
        remove: () => {},
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
          textContent: '',
          addEventListener: () => {},
        };
      },
    };

    const menu = new GameMenu({ modalElement: mockModal });

    // Calling promptQuit opens menu and unhides quit confirmation box
    menu.promptQuit({ title: 'Test Level', steps: 10, keysHeld: 2 });
    assert(menu.isPaused(), 'Menu is paused on promptQuit');
    assertEqual(classes['#pause-quit-confirm'].has('hidden'), false, 'Quit confirmation box is revealed');

    // Calling promptRestart switches to restart confirmation box
    menu.promptRestart({ title: 'Test Level', steps: 10, keysHeld: 2 });
    assertEqual(classes['#pause-quit-confirm'].has('hidden'), true, 'Quit confirmation box is hidden');
    assertEqual(classes['#pause-restart-confirm'].has('hidden'), false, 'Restart confirmation box is revealed');
  });
});
