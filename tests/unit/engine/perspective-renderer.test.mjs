/**
 * Unit Tests: Perspective Renderer & 2.5D Sprite Viewport
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { Camera } from '../../../js/engine/camera.js';
import { Player } from '../../../js/entities/player.js';
import { Key } from '../../../js/entities/key.js';
import { ELEVATION } from '../../../js/core/constants.js';

describe('Engine > Perspective Renderer', () => {
  it('defaults to angled perspective and supports switching', () => {
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
      }),
    };

    const renderer = new GameRenderer(mockCanvas);
    assertEqual(renderer.perspective, 'angled', 'Defaults to angled 2.5D perspective');

    renderer.setPerspective('topdown');
    assertEqual(renderer.perspective, 'topdown', 'Switches to classic topdown');

    renderer.setPerspective('angled');
    assertEqual(renderer.perspective, 'angled', 'Switches back to angled');
  });

  it('calculates proper 2.5D wall heights and overhead height offsets', () => {
    const tileSize = 32;
    const wallH = Math.round(tileSize * 0.38); // 12px
    const heightOffset = Math.round(tileSize * 0.45); // 14px

    assertEqual(wallH, 12, 'Calculates 12px front wall face height');
    assertEqual(heightOffset, 14, 'Calculates 14px overhead elevation lift');
  });

  it('sorts entities and player back-to-front by bottom Y coordinate', () => {
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({ fillRect: () => {}, save: () => {}, restore: () => {} }),
    };
    const renderer = new GameRenderer(mockCanvas);
    const camera = new Camera(800, 600, 32);

    const player = new Player(4, 8, 0, 32);
    const keyNorth = new Key({ id: 'k_north', x: 4, y: 3, z: 0 });
    const keySouth = new Key({ id: 'k_south', x: 4, y: 12, z: 0 });

    const renderedOrder = [];
    const mockCtx = {
      save: () => {},
      restore: () => {},
    };

    // Override render methods to record draw sequence
    keyNorth.render = () => renderedOrder.push('k_north');
    keySouth.render = () => renderedOrder.push('k_south');
    player.render = () => renderedOrder.push('player');

    renderer.renderYSortedEntities(
      mockCtx,
      [keySouth, keyNorth],
      player,
      ELEVATION.GROUND,
      camera,
      null,
      32,
      0
    );

    // Expected order: keyNorth (y=3) -> player (y=8) -> keySouth (y=12)
    assertEqual(renderedOrder[0], 'k_north');
    assertEqual(renderedOrder[1], 'player');
    assertEqual(renderedOrder[2], 'k_south');
  });

  it('preserves explicitly toggled perspective across render frames', () => {
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        ellipse: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
      }),
    };
    const renderer = new GameRenderer(mockCanvas);
    renderer.setPerspective('topdown');

    const fakeLevel = {
      dimensions: { width: 5, height: 5 },
      config: { theme: 'dungeon', tileSize: 32, viewPerspective: 'angled' },
      layers: { ground: [[0, 0], [0, 0]], overhead: [[0, 0], [0, 0]] },
      entities: [],
    };
    const camera = new Camera(800, 600, 32);
    const player = new Player(1, 1, 0, 32);

    renderer.render(fakeLevel, player, [], camera, null, 0.016);
    assertEqual(renderer.perspective, 'topdown', 'Explicit topdown perspective must not be overwritten by level config');
  });
});
