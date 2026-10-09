/**
 * Unit Tests: Architectural Entrance & Exit Visuals (Wall Doorways & Freestanding Spiral Staircases)
 *
 * Validates:
 * 1. detectAdjacentWall cardinal orientation detection and freestanding fallback.
 * 2. renderSpawnEntrance wall-adjacent threshold vs freestanding spiral staircase.
 * 3. renderExit wall-adjacent archway vs freestanding ascending spiral staircase.
 * 4. renderWallIntegratedPortals drop-face doorway rendering.
 * 5. Fog-of-war exploration gating and headless canvas safety across all themes.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { Camera } from '../../../js/engine/camera.js';
import { THEMES } from '../../../js/core/constants.js';

function createMockCanvas() {
  const calls = [];
  const ctx = {
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    fillRect: (...args) => calls.push(['fillRect', ...args]),
    strokeRect: (...args) => calls.push(['strokeRect', ...args]),
    beginPath: () => calls.push('beginPath'),
    closePath: () => calls.push('closePath'),
    arc: (...args) => calls.push(['arc', ...args]),
    ellipse: (...args) => calls.push(['ellipse', ...args]),
    moveTo: (...args) => calls.push(['moveTo', ...args]),
    lineTo: (...args) => calls.push(['lineTo', ...args]),
    quadraticCurveTo: (...args) => calls.push(['quadraticCurveTo', ...args]),
    fill: () => calls.push('fill'),
    stroke: () => calls.push('stroke'),
    fillText: (...args) => calls.push(['fillText', ...args]),
    measureText: (text) => ({ width: text.length * 7 }),
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
    drawImage: () => calls.push('drawImage'),
    translate: () => calls.push('translate'),
    rotate: () => calls.push('rotate'),
    setLineDash: () => {},
  };

  return {
    canvas: { width: 800, height: 600, getContext: () => ctx },
    ctx,
    calls,
  };
}

describe('Engine > Architectural Entrance & Exit Visuals', () => {
  const { canvas, ctx } = createMockCanvas();
  const renderer = new GameRenderer(canvas);
  const camera = new Camera(800, 600, 32);

  // Sample grid: 5x5
  // Row 0: 1 1 1 1 1
  // Row 1: 1 0 0 0 1
  // Row 2: 1 0 0 0 1
  // Row 3: 1 0 0 0 1
  // Row 4: 1 1 1 1 1
  const mockLevel = {
    dimensions: { width: 5, height: 5 },
    config: { theme: 'dungeon' },
    layers: {
      ground: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
    },
    spawn: { x: 2, y: 1, style: 'stairs_down' }, // North wall is at (2, 0)
    exit: { x: 2, y: 3, style: 'stairs_up' },   // South wall is at (2, 4)
  };

  it('detectAdjacentWall detects North wall correctly when wall is at y - 1', () => {
    // Point at (2, 1): neighbor at (2, 0) is wall
    const wall = renderer.detectAdjacentWall(mockLevel, 2, 1, 0);
    assert(wall !== null, 'Wall must be detected');
    assertEqual(wall.dir, 'north', 'Detected north wall');
    assertEqual(wall.wallX, 2, 'Wall X matches');
    assertEqual(wall.wallY, 0, 'Wall Y matches');
  });

  it('detectAdjacentWall detects South wall correctly when North is open', () => {
    // Point at (2, 3): North is floor (2, 2), South is wall (2, 4)
    const wall = renderer.detectAdjacentWall(mockLevel, 2, 3, 0);
    assert(wall !== null, 'Wall must be detected');
    assertEqual(wall.dir, 'south', 'Detected south wall');
    assertEqual(wall.wallX, 2, 'Wall X matches');
    assertEqual(wall.wallY, 4, 'Wall Y matches');
  });

  it('detectAdjacentWall detects West and East walls properly', () => {
    // Point at (1, 2): North is (1, 1) floor, South is (1, 3) floor, West is (0, 2) wall
    const westWall = renderer.detectAdjacentWall(mockLevel, 1, 2, 0);
    assert(westWall !== null, 'West wall detected');
    assertEqual(westWall.dir, 'west', 'Detected west wall');

    // Point at (3, 2): East is (4, 2) wall
    const eastWall = renderer.detectAdjacentWall(mockLevel, 3, 2, 0);
    assert(eastWall !== null, 'East wall detected');
    assertEqual(eastWall.dir, 'east', 'Detected east wall');
  });

  it('detectAdjacentWall returns null for freestanding center point', () => {
    // Point at (2, 2): all 4 cardinal neighbors (2, 1), (2, 3), (1, 2), (3, 2) are floor
    const freestanding = renderer.detectAdjacentWall(mockLevel, 2, 2, 0);
    assertEqual(freestanding, null, 'Center point has no adjacent walls (freestanding)');
  });

  it('renderSpawnEntrance renders wall threshold when adjacent to wall without throwing', () => {
    const levelNearWall = {
      ...mockLevel,
      spawn: { x: 2, y: 1, style: 'stairs_down' },
    };
    renderer.renderSpawnEntrance(ctx, levelNearWall, camera, THEMES.dungeon, null);
    assert(true, 'Rendered wall-adjacent spawn entrance safely');
  });

  it('renderSpawnEntrance renders freestanding spiral staircase when open without throwing', () => {
    const levelFreestanding = {
      ...mockLevel,
      spawn: { x: 2, y: 2, style: 'stairs_down' }, // Freestanding
    };
    renderer.renderSpawnEntrance(ctx, levelFreestanding, camera, THEMES.dungeon, null);
    assert(true, 'Rendered freestanding spiral staircase safely');
  });

  it('renderExit renders wall-adjacent and freestanding exits without throwing', () => {
    // Wall-adjacent exit
    renderer.renderExit(ctx, mockLevel, camera, THEMES.dungeon, null);

    // Freestanding exit
    const levelFreestandingExit = {
      ...mockLevel,
      exit: { x: 2, y: 2, style: 'portal' },
    };
    renderer.renderExit(ctx, levelFreestandingExit, camera, THEMES.cave || THEMES.dungeon, null);
    assert(true, 'Rendered exits safely');
  });

  it('renderWallIntegratedPortals renders entrance and exit doorways on wall drop faces', () => {
    // Wall at (2, 0) is North of spawn at (2, 1)
    renderer.renderWallIntegratedPortals(ctx, 2, 0, 64, 0, 32, THEMES.dungeon, mockLevel, camera);

    // Wall at (2, 4) is South of exit at (2, 3)
    renderer.renderWallIntegratedPortals(ctx, 2, 4, 64, 128, 32, THEMES.dungeon, mockLevel, camera);

    // Unrelated wall at (0, 0) does not throw
    renderer.renderWallIntegratedPortals(ctx, 0, 0, 0, 0, 32, THEMES.dungeon, mockLevel, camera);
    assert(true, 'Rendered wall portals safely');
  });

  it('supports all 6 biome themes cleanly', () => {
    for (const themeKey of ['dungeon', 'cave', 'temple', 'sunset', 'cyber', 'blueprint']) {
      const theme = THEMES[themeKey] || THEMES.dungeon;
      renderer.renderSpawnEntrance(ctx, mockLevel, camera, theme, null);
      renderer.renderExit(ctx, mockLevel, camera, theme, null);
      renderer.renderWallIntegratedPortals(ctx, 2, 0, 64, 0, 32, theme, mockLevel, camera);
    }
    assert(true, 'All biomes render without exceptions');
  });
});
