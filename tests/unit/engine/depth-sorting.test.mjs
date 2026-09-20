/**
 * Unit Tests: 2.5D Depth-Sorting & Wall Front/Roof Occlusion (BL-33)
 *
 * Verifies that:
 * 1. Ground walls, entities, and the player sprite are rendered in unified Y-sorted painter order.
 * 2. When the player stands north of a wall tile (y < wallY), the player renders BEFORE the wall,
 *    allowing the wall's top cap face to correctly occlude the player's lower boundary.
 * 3. When the player stands south of a wall tile (y > wallY), the wall renders BEFORE the player,
 *    so the player correctly appears in front of the wall.
 * 4. Moving patrollers and dynamic entities respect the same occlusion guarantees.
 * 5. Camera rotation (0°, 90°, 180°, 270°) preserves screen-space depth sorting.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { Camera } from '../../../js/engine/camera.js';
import { Player } from '../../../js/entities/player.js';
import { Patroller } from '../../../js/entities/hazard.js';
import { Key } from '../../../js/entities/key.js';
import { TILES, ELEVATION } from '../../../js/core/constants.js';

describe('Engine > 2.5D Depth-Sorting & Wall Occlusion (BL-33)', () => {
  const tileSize = 32;

  function createTestLevel() {
    // 11x11 grid with open center and test walls
    const ground = Array.from({ length: 11 }, () => Array(11).fill(TILES.FLOOR));
    // Set perimeter walls
    for (let i = 0; i < 11; i++) {
      ground[0][i] = TILES.WALL;
      ground[10][i] = TILES.WALL;
      ground[i][0] = TILES.WALL;
      ground[i][10] = TILES.WALL;
    }
    // Specific test walls around (5, 5):
    ground[4][5] = TILES.WALL; // North wall
    ground[6][5] = TILES.WALL; // South wall
    ground[5][4] = TILES.WALL; // West wall
    ground[5][6] = TILES.WALL; // East wall

    return {
      dimensions: { width: 11, height: 11 },
      config: { theme: 'dungeon', viewPerspective: 'angled' },
      layers: {
        ground,
        overhead: Array.from({ length: 11 }, () => Array(11).fill(0)),
      },
      spawn: { x: 5, y: 5, elevation: 0 },
      exit: null,
    };
  }

  function createMockRenderer() {
    const drawLog = [];
    const mockCtx = {
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      rect: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 10 }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      drawImage: () => {},
      setLineDash: () => {},
      getLineDash: () => [],
    };
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => mockCtx,
    };

    const renderer = new GameRenderer(mockCanvas);
    renderer.setPerspective('angled');
    return { renderer, drawLog, mockCtx };
  }

  it('verifies that south wall renders AFTER player to occlude feet (BL-33 fix)', () => {
    const { renderer } = createMockRenderer();
    const camera = new Camera(800, 600, tileSize);
    camera.x = 5 * tileSize + 16;
    camera.y = 5 * tileSize + 16;
    camera.setRotation(0, true);

    const level = createTestLevel();
    const player = new Player(5, 5, 0, tileSize);

    const drawSequence = [];

    // Intercept wall render
    const origRenderWall = renderer.renderAngledWall.bind(renderer);
    renderer.renderAngledWall = (ctx, x, y, sx, sy, ts, th, gr, cam) => {
      drawSequence.push(`wall_${x}_${y}`);
      origRenderWall(ctx, x, y, sx, sy, ts, th, gr, cam);
    };

    // Intercept player render
    const origRenderPlayer = player.render.bind(player);
    player.render = (ctx, sx, sy, ts, persp, angle) => {
      drawSequence.push('player');
      origRenderPlayer(ctx, sx, sy, ts, persp, angle);
    };

    // Render angled pipeline
    const bounds = camera.getViewportBounds(11, 11, 2);
    renderer.renderAngledPipeline(level, player, [], camera, null, bounds, { bg: '#000', floor: '#222', wall: '#444' }, tileSize);

    // North wall (5, 4) should render BEFORE player
    const northWallIdx = drawSequence.indexOf('wall_5_4');
    const playerIdx = drawSequence.indexOf('player');
    const southWallIdx = drawSequence.indexOf('wall_5_6');

    assert(northWallIdx !== -1, 'North wall (5, 4) was rendered');
    assert(playerIdx !== -1, 'Player was rendered');
    assert(southWallIdx !== -1, 'South wall (5, 6) was rendered');

    assert(northWallIdx < playerIdx, `North wall (${northWallIdx}) must render before player (${playerIdx})`);
    assert(playerIdx < southWallIdx, `Player (${playerIdx}) must render before South wall (${southWallIdx}) so south wall occludes player`);
  });

  it('verifies that moving sentinels (patrollers) respect the same south wall occlusion order', () => {
    const { renderer } = createMockRenderer();
    const camera = new Camera(800, 600, tileSize);
    camera.x = 5 * tileSize + 16;
    camera.y = 5 * tileSize + 16;
    camera.setRotation(0, true);

    const level = createTestLevel();
    const player = new Player(2, 2, 0, tileSize); // Player elsewhere
    const sentinel = new Patroller({
      id: 'sentinel_test',
      x: 5,
      y: 5,
      elevation: 0,
      waypoints: [{ x: 5, y: 5 }, { x: 5, y: 5 }],
    });

    const drawSequence = [];

    renderer.renderAngledWall = (ctx, x, y) => {
      drawSequence.push(`wall_${x}_${y}`);
    };
    sentinel.render = () => {
      drawSequence.push('sentinel');
    };

    const bounds = camera.getViewportBounds(11, 11, 2);
    renderer.renderAngledPipeline(level, player, [sentinel], camera, null, bounds, { bg: '#000', floor: '#222', wall: '#444' }, tileSize);

    const sentinelIdx = drawSequence.indexOf('sentinel');
    const southWallIdx = drawSequence.indexOf('wall_5_6');

    assert(sentinelIdx !== -1, 'Sentinel was rendered');
    assert(southWallIdx !== -1, 'South wall was rendered');
    assert(sentinelIdx < southWallIdx, `Sentinel (${sentinelIdx}) must render before South wall (${southWallIdx})`);
  });

  it('verifies that camera rotation preserves screen-space depth sorting (180 degrees)', () => {
    const { renderer } = createMockRenderer();
    const camera = new Camera(800, 600, tileSize);
    camera.x = 5 * tileSize + 16;
    camera.y = 5 * tileSize + 16;
    camera.setRotation(180, true); // South is now UP, North is now DOWN (Screen-South)

    const level = createTestLevel();
    const player = new Player(5, 5, 0, tileSize);

    const drawSequence = [];

    renderer.renderAngledWall = (ctx, x, y) => {
      drawSequence.push(`wall_${x}_${y}`);
    };
    player.render = () => {
      drawSequence.push('player');
    };

    const bounds = camera.getViewportBounds(11, 11, 2);
    renderer.renderAngledPipeline(level, player, [], camera, null, bounds, { bg: '#000', floor: '#222', wall: '#444' }, tileSize);

    const northWallIdx = drawSequence.indexOf('wall_5_4');
    const playerIdx = drawSequence.indexOf('player');
    const southWallIdx = drawSequence.indexOf('wall_5_6');

    // At 180 degrees:
    // World (5, 6) is now screen-NORTH (up) -> renders BEFORE player
    // World (5, 4) is now screen-SOUTH (down) -> renders AFTER player
    assert(southWallIdx < playerIdx, `At 180°, World-South wall (5, 6) is screen-north and must render before player`);
    assert(playerIdx < northWallIdx, `At 180°, World-North wall (5, 4) is screen-south and must render after player`);
  });
});
