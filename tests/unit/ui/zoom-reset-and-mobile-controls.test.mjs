/**
 * Tests for Non-Persistent Viewport Zoom, In-Menu Zoom, Mobile More Drawer & Browser-Safe Hotkeys (BL-122, ADR-0032)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { KEY_CODES } from '../../../js/core/constants.js';
import { GameMenu } from '../../../js/ui/game-menu.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { Camera } from '../../../js/engine/camera.js';
import { createMockCanvas, resetStorageMocks } from '../../harness/mocks.mjs';
import fs from 'fs';
import path from 'path';

describe('UI > Zoom Reset, In-Menu Controls, Mobile More Drawer & Safe Hotkeys (BL-122)', () => {
  it('StorageManager guarantees zoom is in-memory only and never persisted to localStorage', () => {
    // Clear mock storage
    resetStorageMocks();

    // Directly attempt to getSetting
    assertEqual(StorageManager.getSetting('viewport_zoom'), 1.0, 'Default viewport zoom is always 1.0');

    // Attempt to setSetting
    StorageManager.setSetting('viewport_zoom', 1.5);
    // Setting in localStorage should NOT contain viewport_zoom
    const rawSettings = StorageManager.loadSettings();
    assertEqual(rawSettings.viewport_zoom, undefined, 'viewport_zoom is never written to persistent settings');

    // Even if legacy localStorage contains viewport_zoom, loadSettings prunes it
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('casual_maze_user_settings', JSON.stringify({ viewport_zoom: 2.0, sound_enabled: true }));
      const cleaned = StorageManager.loadSettings();
      assertEqual(cleaned.viewport_zoom, undefined, 'Legacy viewport_zoom is pruned from settings');
      assertEqual(cleaned.sound_enabled, true, 'Other settings are preserved');
    }
  });

  it('GameLoop initializes Camera with default 1.0x zoom and resets on restart', () => {
    const mockCanvas = createMockCanvas(800, 600);
    const mockMinimapCanvas = createMockCanvas(200, 200);

    const testLevel = {
      id: 'test_zoom_lvl',
      title: 'Zoom Test Level',
      dimensions: { width: 5, height: 5 },
      grid: [
        ['W', 'W', 'W', 'W', 'W'],
        ['W', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'F', 'F', 'W'],
        ['W', 'W', 'W', 'W', 'W'],
      ],
      spawn: { x: 1, y: 1 },
      exit: { x: 3, y: 3 },
      entities: [],
    };

    const loop = new GameLoop(testLevel, mockCanvas, mockMinimapCanvas);
    assertEqual(loop.camera.zoom, 1.0, 'Camera starts at default 1.0x zoom on level load');

    // Zoom in
    loop.zoomIn();
    assert(loop.camera.zoom > 1.0, 'Camera zooms in');

    // Restart level resets zoom
    loop.restartLevel();
    assertEqual(loop.camera.zoom, 1.0, 'Restarting level resets zoom to 1.0x default');

    loop.stop();
  });

  it('Pause Menu wires Viewport Zoom controls and updates percentage badge', () => {
    const pauseModal = document.createElement('div');
    pauseModal.id = 'game-pause-modal';

    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.id = 'btn-pause-zoom-out';
    pauseModal.appendChild(zoomOutBtn);

    const zoomResetBtn = document.createElement('button');
    zoomResetBtn.id = 'btn-pause-zoom-reset';
    zoomResetBtn.textContent = '100%';
    pauseModal.appendChild(zoomResetBtn);

    const zoomInBtn = document.createElement('button');
    zoomInBtn.id = 'btn-pause-zoom-in';
    pauseModal.appendChild(zoomInBtn);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'btn-pause-close';
    pauseModal.appendChild(closeBtn);

    const resumeBtn = document.createElement('button');
    resumeBtn.id = 'btn-pause-resume';
    pauseModal.appendChild(resumeBtn);

    document.body.appendChild(pauseModal);

    let zoomInCalls = 0;
    let zoomOutCalls = 0;
    let resetZoomCalls = 0;

    const mockGameLoop = {
      isPaused: true,
      camera: { zoom: 1.0 },
      zoomIn() { zoomInCalls++; this.camera.zoom = 1.25; return 1.25; },
      zoomOut() { zoomOutCalls++; this.camera.zoom = 0.75; return 0.75; },
      resetZoom() { resetZoomCalls++; this.camera.zoom = 1.0; return 1.0; },
      resume() {},
    };

    const menu = new GameMenu({ modalEl: pauseModal, gameLoop: mockGameLoop });

    // Click Zoom In
    zoomInBtn.click();
    assertEqual(zoomInCalls, 1, 'Clicking pause zoom in calls gameLoop.zoomIn()');
    assertEqual(zoomResetBtn.textContent, '125%', 'Zoom reset badge updates to 125%');

    // Click Zoom Out
    zoomOutBtn.click();
    assertEqual(zoomOutCalls, 1, 'Clicking pause zoom out calls gameLoop.zoomOut()');
    assertEqual(zoomResetBtn.textContent, '75%', 'Zoom reset badge updates to 75%');

    // Click Zoom Reset
    zoomResetBtn.click();
    assertEqual(resetZoomCalls, 1, 'Clicking pause zoom reset calls gameLoop.resetZoom()');
    assertEqual(zoomResetBtn.textContent, '100%', 'Zoom reset badge updates back to 100%');
  });

  it('maze.html includes 4 directions, USE, and More button on mobile virtual controls', () => {
    const htmlPath = path.resolve(process.cwd(), 'maze.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Verify 4 directions and USE in D-pad
    assert(html.includes('id="vbtn-up"'), 'Virtual controls has Up button');
    assert(html.includes('id="vbtn-down"'), 'Virtual controls has Down button');
    assert(html.includes('id="vbtn-left"'), 'Virtual controls has Left button');
    assert(html.includes('id="vbtn-right"'), 'Virtual controls has Right button');
    assert(html.includes('id="vbtn-act"'), 'Virtual controls has USE button');
    assert(html.includes('id="vbtn-more"'), 'Virtual controls has More button');

    // Verify Mobile More Drawer exists
    assert(html.includes('id="mobile-more-drawer"'), 'Mobile more drawer exists');
    assert(html.includes('id="vbtn-rot-l"'), 'Drawer contains rotate left');
    assert(html.includes('id="vbtn-rot-r"'), 'Drawer contains rotate right');
    assert(html.includes('id="mbtn-zoom-in"'), 'Drawer contains zoom in');
    assert(html.includes('id="mbtn-zoom-out"'), 'Drawer contains zoom out');
    assert(html.includes('id="mbtn-zoom-reset"'), 'Drawer contains zoom reset');
    assert(html.includes('id="mbtn-minimap"'), 'Drawer contains minimap toggle');
    assert(html.includes('id="mbtn-feed"'), 'Drawer contains feed toggle');
    assert(html.includes('id="mbtn-touch-mode"'), 'Drawer contains touch mode toggle');
    assert(html.includes('id="mbtn-minimal-view"'), 'Drawer contains minimal view toggle');
    assert(html.includes('id="mbtn-journal"'), 'Drawer contains lore journal button');
    assert(html.includes('id="mbtn-pause"'), 'Drawer contains pause menu button');

    // Verify Pause Modal has Zoom Controls row
    assert(html.includes('id="pause-zoom-row"'), 'Pause modal has zoom controls row');
    assert(html.includes('id="btn-pause-zoom-out"'), 'Pause modal has zoom out button');
    assert(html.includes('id="btn-pause-zoom-reset"'), 'Pause modal has zoom reset button');
    assert(html.includes('id="btn-pause-zoom-in"'), 'Pause modal has zoom in button');
  });

  it('KEY_CODES prunes browser-intercepting hotkeys (R, [, ]) to prevent browser reload hijacking', () => {
    // Assert R is NOT hijacked
    assert(!KEY_CODES.ROTATE_RIGHT.includes('KeyR'), 'ROTATE_RIGHT does not hijack KeyR');
    assert(!KEY_CODES.ROTATE_RIGHT.includes('r'), 'ROTATE_RIGHT does not hijack lowercase r');
    assert(!KEY_CODES.ROTATE_RIGHT.includes('R'), 'ROTATE_RIGHT does not hijack uppercase R');
    assert(!KEY_CODES.RESTART.includes('KeyR'), 'RESTART does not hijack KeyR');

    // Assert brackets [ and ] are NOT hijacked
    assert(!KEY_CODES.ROTATE_LEFT.includes('BracketLeft'), 'ROTATE_LEFT does not hijack BracketLeft');
    assert(!KEY_CODES.ROTATE_LEFT.includes('['), 'ROTATE_LEFT does not hijack [');
    assert(!KEY_CODES.ROTATE_RIGHT.includes('BracketRight'), 'ROTATE_RIGHT does not hijack BracketRight');
    assert(!KEY_CODES.ROTATE_RIGHT.includes(']'), 'ROTATE_RIGHT does not hijack ]');

    // Essential game controls remain intact
    assert(KEY_CODES.UP.includes('ArrowUp'), 'UP includes ArrowUp');
    assert(KEY_CODES.DOWN.includes('ArrowDown'), 'DOWN includes ArrowDown');
    assert(KEY_CODES.LEFT.includes('ArrowLeft'), 'LEFT includes ArrowLeft');
    assert(KEY_CODES.RIGHT.includes('ArrowRight'), 'RIGHT includes ArrowRight');
    assert(KEY_CODES.INTERACT.includes('KeyE'), 'INTERACT includes KeyE');
    assert(KEY_CODES.INTERACT.includes('Space'), 'INTERACT includes Space');
    assert(KEY_CODES.PAUSE.includes('Escape'), 'PAUSE includes Escape');
    assert(KEY_CODES.PAUSE.includes('KeyP'), 'PAUSE includes KeyP');
  });
});
