/**
 * User Journey Test: Camera World Rotation & Screen-Relative Navigation
 * Simulates 90° discrete camera rotating (Q / R), screen-relative explorer movement,
 * and compass rose orientation across all 4 cardinal angles.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { Camera } from '../../../js/engine/camera.js';
import { SCREEN_TO_WORLD_DELTAS, ROTATION_COMPASS } from '../../../js/core/constants.js';
import { globalEvents } from '../../../js/core/events.js';

describe('User Journey > Camera World Rotation & Screen-Relative Navigation', () => {
  const rotationTestLevel = {
    id: 'test_rotation_chamber',
    title: 'Perspective Testing Chamber',
    dimensions: { width: 9, height: 9 },
    config: {
      fogOfWar: false,
      tileSize: 32,
      viewPerspective: 'angled',
    },
    spawn: { x: 4, y: 4, elevation: 0 },
    exit: { x: 7, y: 7, elevation: 0 },
    layers: {
      ground: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      overhead: Array(9).fill(null).map(() => Array(9).fill(0)),
    },
    entities: [],
  };

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

  it('cycles camera rotation through 0°, 90°, 180°, 270° via rotateLeft and rotateRight', () => {
    const loop = new GameLoop(rotationTestLevel, mockCanvas, mockCanvas);

    assertEqual(loop.camera.getDiscreteRotation(), 0, 'Initial discrete rotation is 0°');
    assertEqual(loop.camera.getCompassHeading(), 'N', 'Initial heading is North (N)');

    // Rotate Clockwise (Right: [R]) -> 90° East
    loop.rotateRight();
    assertEqual(loop.camera.getDiscreteRotation(), 90, 'Rotated right to 90°');
    assertEqual(loop.camera.getCompassHeading(), 'E', 'Heading is East (E)');

    // Rotate Clockwise (Right: [R]) -> 180° South
    loop.rotateRight();
    assertEqual(loop.camera.getDiscreteRotation(), 180, 'Rotated right to 180°');
    assertEqual(loop.camera.getCompassHeading(), 'S', 'Heading is South (S)');

    // Rotate Clockwise (Right: [R]) -> 270° West
    loop.rotateRight();
    assertEqual(loop.camera.getDiscreteRotation(), 270, 'Rotated right to 270°');
    assertEqual(loop.camera.getCompassHeading(), 'W', 'Heading is West (W)');

    // Rotate Clockwise (Right: [R]) -> 0° North wrap
    loop.rotateRight();
    assertEqual(loop.camera.getDiscreteRotation(), 0, 'Rotated right wrapped to 0°');
    assertEqual(loop.camera.getCompassHeading(), 'N', 'Heading is North (N)');

    // Rotate Counter-Clockwise (Left: [Q]) -> 270° West
    loop.rotateLeft();
    assertEqual(loop.camera.getDiscreteRotation(), 270, 'Rotated left to 270°');
    assertEqual(loop.camera.getCompassHeading(), 'W', 'Heading is West (W)');

    loop.stop();
  });

  it('translates screen directional inputs (Up/Down/Left/Right) according to camera heading', () => {
    const loop = new GameLoop(rotationTestLevel, mockCanvas, mockCanvas);

    // 1. At 0° (North): UP moves North (dy: -1), RIGHT moves East (dx: +1)
    loop.camera.setRotation(0);
    assertEqual(loop.player.x, 4);
    assertEqual(loop.player.y, 4);

    loop.tryMoveDirection('UP');
    loop.player.update(1.0);
    assertEqual(loop.player.x, 4);
    assertEqual(loop.player.y, 3, 'At 0°, UP moves to y=3');

    loop.tryMoveDirection('RIGHT');
    loop.player.update(1.0);
    assertEqual(loop.player.x, 5, 'At 0°, RIGHT moves to x=5');
    assertEqual(loop.player.y, 3);

    // Reset player
    loop.player.teleport(4, 4, 0);

    // 2. At 90° (East): UP moves East (dx: +1), RIGHT moves South (dy: +1)
    loop.camera.setRotation(90);
    loop.tryMoveDirection('UP');
    loop.player.update(1.0);
    assertEqual(loop.player.x, 5, 'At 90°, UP moves to x=5 (East)');
    assertEqual(loop.player.y, 4);

    loop.tryMoveDirection('RIGHT');
    loop.player.update(1.0);
    assertEqual(loop.player.x, 5);
    assertEqual(loop.player.y, 5, 'At 90°, RIGHT moves to y=5 (South)');

    // Reset player
    loop.player.teleport(4, 4, 0);

    // 3. At 180° (South): UP moves South (dy: +1), RIGHT moves West (dx: -1)
    loop.camera.setRotation(180);
    loop.tryMoveDirection('UP');
    loop.player.update(1.0);
    assertEqual(loop.player.x, 4);
    assertEqual(loop.player.y, 5, 'At 180°, UP moves to y=5 (South)');

    loop.tryMoveDirection('RIGHT');
    loop.player.update(1.0);
    assertEqual(loop.player.x, 3, 'At 180°, RIGHT moves to x=3 (West)');
    assertEqual(loop.player.y, 5);

    // Reset player
    loop.player.teleport(4, 4, 0);

    // 4. At 270° (West): UP moves West (dx: -1), RIGHT moves North (dy: -1)
    loop.camera.setRotation(270);
    loop.tryMoveDirection('UP');
    loop.player.update(1.0);
    assertEqual(loop.player.x, 3, 'At 270°, UP moves to x=3 (West)');
    assertEqual(loop.player.y, 4);

    loop.tryMoveDirection('RIGHT');
    loop.player.update(1.0);
    assertEqual(loop.player.x, 3);
    assertEqual(loop.player.y, 3, 'At 270°, RIGHT moves to y=3 (North)');

    loop.stop();
  });

  it('maps explorer screen facing to match the visual direction of travel', () => {
    const loop = new GameLoop(rotationTestLevel, mockCanvas, mockCanvas);

    // When camera is rotated 90° clockwise, moving East (world 'east') should face screen 'north' (up):
    const screenFacingAt90 = loop.player.getScreenFacing('east', 90);
    assertEqual(screenFacingAt90, 'north', 'World east with 90° camera faces screen North (UP)');

    // At 180° (South up): world 'south' is screen 'north' (up)
    const screenFacingAt180 = loop.player.getScreenFacing('south', 180);
    assertEqual(screenFacingAt180, 'north', 'World south with 180° camera faces screen North (UP)');

    // At 270° (West up): world 'west' is screen 'north' (up)
    const screenFacingAt270 = loop.player.getScreenFacing('west', 270);
    assertEqual(screenFacingAt270, 'north', 'World west with 270° camera faces screen North (UP)');

    loop.stop();
  });

  it('verifies coordinate rotation matrix inversion: worldToScreen <-> screenToWorld', () => {
    const camera = new Camera(800, 600, 32);
    camera.x = 100;
    camera.y = 100;

    for (const angle of [0, 90, 180, 270]) {
      camera.setRotation(angle);
      const testWorldX = 150;
      const testWorldY = 220;

      const screenPt = camera.worldToScreen(testWorldX, testWorldY);
      const invertedWorldPt = camera.screenToWorld(screenPt.x, screenPt.y);

      const dx = Math.abs(invertedWorldPt.x - testWorldX);
      const dy = Math.abs(invertedWorldPt.y - testWorldY);

      assert(dx < 0.001, `World X inverts accurately at ${angle}° (diff: ${dx})`);
      assert(dy < 0.001, `World Y inverts accurately at ${angle}° (diff: ${dy})`);
    }
  });
});
