/**
 * Unit Tests: Viewport Zoom & Optical Scale (BL-87)
 * Validates dynamic camera tile scaling, zoom limits (0.5x - 2.0x), coordinate round-trips,
 * and input command integration.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Camera } from '../../../js/engine/camera.js';
import { InputManager, GAME_COMMANDS } from '../../../js/engine/input-manager.js';
import { VIEWPORT_ZOOM, KEY_CODES } from '../../../js/core/constants.js';

describe('Engine > Viewport Zoom & Optical Scale (BL-87)', () => {
  it('initializes camera with default zoom 1.0x and base tile size', () => {
    const camera = new Camera(800, 600, 36);
    assertEqual(camera.zoom, 1.0);
    assertEqual(camera.baseTileSize, 36);
    assertEqual(camera.tileSize, 36);
  });

  it('clamps zoom within VIEWPORT_ZOOM range [0.5x, 2.0x]', () => {
    const camera = new Camera(800, 600, 36);

    camera.setZoom(0.1);
    assertEqual(camera.zoom, 0.5);
    assertEqual(camera.tileSize, 18); // 36 * 0.5

    camera.setZoom(5.0);
    assertEqual(camera.zoom, 2.0);
    assertEqual(camera.tileSize, 72); // 36 * 2.0

    camera.setZoom(1.25);
    assertEqual(camera.zoom, 1.25);
    assertEqual(camera.tileSize, 45); // 36 * 1.25
  });

  it('increments and decrements zoom via zoomIn() and zoomOut()', () => {
    const camera = new Camera(800, 600, 36);

    camera.zoomIn(0.2);
    assertEqual(camera.zoom, 1.2);
    assertEqual(camera.tileSize, 43); // Math.round(36 * 1.2) = 43

    camera.zoomOut(0.4);
    assertEqual(camera.zoom, 0.8);
    assertEqual(camera.tileSize, 29); // Math.round(36 * 0.8) = 29

    camera.resetZoom();
    assertEqual(camera.zoom, 1.0);
    assertEqual(camera.tileSize, 36);
  });

  it('preserves pixel-accurate tile projections and invertibility under zoom', () => {
    const camera = new Camera(800, 600, 36);
    camera.x = 200;
    camera.y = 200;

    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    for (const z of zoomLevels) {
      camera.setZoom(z);

      // Tile (5, 6)
      const tileTopLeft = camera.tileToScreen(5, 6);
      const tileCenter = {
        x: tileTopLeft.x + camera.tileSize / 2,
        y: tileTopLeft.y + camera.tileSize / 2,
      };

      const resolvedTile = camera.screenToTile(tileCenter.x, tileCenter.y);
      assertEqual(resolvedTile.x, 5, `Tile X matches at zoom ${z}`);
      assertEqual(resolvedTile.y, 6, `Tile Y matches at zoom ${z}`);
    }
  });

  it('preserves camera rotation coordinate projections under zoom', () => {
    const camera = new Camera(800, 600, 36);
    camera.x = 400;
    camera.y = 300;
    camera.setZoom(1.5);

    // Test across all 4 cardinal angles
    for (const angle of [0, 90, 180, 270]) {
      camera.setRotation(angle, true);

      const worldPoint = { x: 500, y: 350 };
      const screenPoint = camera.worldToScreen(worldPoint.x, worldPoint.y, true);
      const invertedWorld = camera.screenToWorld(screenPoint.x, screenPoint.y, true);

      assert(Math.abs(invertedWorld.x - worldPoint.x) <= 1, `Inverted X matches at angle ${angle}`);
      assert(Math.abs(invertedWorld.y - worldPoint.y) <= 1, `Inverted Y matches at angle ${angle}`);
    }
  });

  it('correctly dispatches ZOOM_IN, ZOOM_OUT, and ZOOM_RESET commands from InputManager', () => {
    const commandsDispatched = [];
    const input = new InputManager({
      hotkeysEnabled: true,
      onCommand: (cmd) => commandsDispatched.push(cmd),
    });

    // Simulate key down for '=' (zoom in)
    input.handleKeyDown({ code: 'Equal', key: '+', preventDefault: () => {} });
    assertEqual(commandsDispatched[commandsDispatched.length - 1], GAME_COMMANDS.ZOOM_IN);

    // Simulate key down for '-' (zoom out)
    input.handleKeyDown({ code: 'Minus', key: '-', preventDefault: () => {} });
    assertEqual(commandsDispatched[commandsDispatched.length - 1], GAME_COMMANDS.ZOOM_OUT);

    // Simulate key down for '0' (zoom reset)
    input.handleKeyDown({ code: 'Digit0', key: '0', preventDefault: () => {} });
    assertEqual(commandsDispatched[commandsDispatched.length - 1], GAME_COMMANDS.ZOOM_RESET);
  });

  it('strictly clamps zoom to bounds [0.5, 2.0] across arbitrary numeric inputs (BL-93)', () => {
    const camera = new Camera(800, 600, 36);
    assertEqual(camera.setZoom(-10), 0.5);
    assertEqual(camera.setZoom(0.49), 0.5);
    assertEqual(camera.setZoom(0.5), 0.5);
    assertEqual(camera.setZoom(1.0), 1.0);
    assertEqual(camera.setZoom(2.0), 2.0);
    assertEqual(camera.setZoom(2.01), 2.0);
    assertEqual(camera.setZoom(999), 2.0);
    assertEqual(camera.setZoom('invalid'), 2.0); // Preserves previous valid zoom
  });
});
