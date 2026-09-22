/**
 * Unit Tests: Camera World & View Rotation
 * Validates 90-degree discrete rotations, coordinate projections, and screen-relative directional input.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Camera } from '../../../js/engine/camera.js';
import { ROTATION_ANGLES, ROTATION_COMPASS, SCREEN_TO_WORLD_DELTAS } from '../../../js/core/constants.js';

describe('Engine > Camera Rotation & Projections', () => {
  it('initializes with 0-degree North orientation', () => {
    const camera = new Camera(800, 600, 32);
    assertEqual(camera.rotation, 0);
    assertEqual(camera.targetRotation, 0);
    assertEqual(camera.getDiscreteRotation(), 0);
    assertEqual(camera.getCompassHeading(), 'N');
  });

  it('cycles clockwise through all 4 cardinal angles via rotateRight()', () => {
    const camera = new Camera(800, 600, 32);

    camera.rotateRight();
    assertEqual(camera.targetRotation, 90);
    assertEqual(camera.getDiscreteRotation(), 90);
    assertEqual(camera.getCompassHeading(), 'E');

    camera.rotateRight();
    assertEqual(camera.targetRotation, 180);
    assertEqual(camera.getDiscreteRotation(), 180);
    assertEqual(camera.getCompassHeading(), 'S');

    camera.rotateRight();
    assertEqual(camera.targetRotation, 270);
    assertEqual(camera.getDiscreteRotation(), 270);
    assertEqual(camera.getCompassHeading(), 'W');

    camera.rotateRight();
    assertEqual(camera.targetRotation, 0);
    assertEqual(camera.getDiscreteRotation(), 0);
    assertEqual(camera.getCompassHeading(), 'N');
  });

  it('cycles counter-clockwise through all 4 cardinal angles via rotateLeft()', () => {
    const camera = new Camera(800, 600, 32);

    camera.rotateLeft();
    assertEqual(camera.targetRotation, 270);
    assertEqual(camera.getDiscreteRotation(), 270);
    assertEqual(camera.getCompassHeading(), 'W');

    camera.rotateLeft();
    assertEqual(camera.targetRotation, 180);
    assertEqual(camera.getDiscreteRotation(), 180);
    assertEqual(camera.getCompassHeading(), 'S');

    camera.rotateLeft();
    assertEqual(camera.targetRotation, 90);
    assertEqual(camera.getDiscreteRotation(), 90);
    assertEqual(camera.getCompassHeading(), 'E');

    camera.rotateLeft();
    assertEqual(camera.targetRotation, 0);
    assertEqual(camera.getDiscreteRotation(), 0);
    assertEqual(camera.getCompassHeading(), 'N');
  });

  it('correctly projects world coordinates to screen at 0, 90, 180, and 270 degrees', () => {
    const camera = new Camera(800, 600, 32);
    // Position camera center at (100, 100)
    camera.x = 100;
    camera.y = 100;

    // Test point 50px North of center: (100, 50)
    // At 0 deg: North is UP (screenY = 300 - 50 = 250, screenX = 400)
    camera.setRotation(0, true);
    const p0 = camera.worldToScreen(100, 50);
    assertEqual(p0.x, 400);
    assertEqual(p0.y, 250);

    // At 90 deg: North is LEFT (screenX = 400 - 50 = 350, screenY = 300)
    camera.setRotation(90, true);
    const p90 = camera.worldToScreen(100, 50);
    assertEqual(p90.x, 350);
    assertEqual(p90.y, 300);

    // At 180 deg: North is DOWN (screenX = 400, screenY = 300 + 50 = 350)
    camera.setRotation(180, true);
    const p180 = camera.worldToScreen(100, 50);
    assertEqual(p180.x, 400);
    assertEqual(p180.y, 350);

    // At 270 deg: North is RIGHT (screenX = 400 + 50 = 450, screenY = 300)
    camera.setRotation(270, true);
    const p270 = camera.worldToScreen(100, 50);
    assertEqual(p270.x, 450);
    assertEqual(p270.y, 300);
  });

  it('invertibly converts screen back to world coordinates across all angles', () => {
    const camera = new Camera(800, 600, 32);
    camera.x = 240;
    camera.y = 360;

    const testPoints = [
      { wx: 200, wy: 300 },
      { wx: 350, wy: 120 },
      { wx: 50, wy: 480 },
      { wx: 600, wy: 700 },
    ];

    for (const angle of ROTATION_ANGLES) {
      camera.setRotation(angle, true);
      for (const pt of testPoints) {
        const screen = camera.worldToScreen(pt.wx, pt.wy, true);
        const unprojected = camera.screenToWorld(screen.x, screen.y, true);
        assert(
          Math.abs(unprojected.x - pt.wx) <= 1,
          `X matches within rounding at angle ${angle}: expected ${pt.wx}, got ${unprojected.x}`
        );
        assert(
          Math.abs(unprojected.y - pt.wy) <= 1,
          `Y matches within rounding at angle ${angle}: expected ${pt.wy}, got ${unprojected.y}`
        );
      }
    }
  });

  it('translates screen-relative directional movements to world grid deltas', () => {
    // 0 deg: UP -> (0, -1), DOWN -> (0, 1), LEFT -> (-1, 0), RIGHT -> (1, 0)
    assertEqual(SCREEN_TO_WORLD_DELTAS[0].UP.dx, 0);
    assertEqual(SCREEN_TO_WORLD_DELTAS[0].UP.dy, -1);
    assertEqual(SCREEN_TO_WORLD_DELTAS[0].RIGHT.dx, 1);
    assertEqual(SCREEN_TO_WORLD_DELTAS[0].RIGHT.dy, 0);

    // 90 deg: UP -> (1, 0) [East], DOWN -> (-1, 0) [West], LEFT -> (0, -1) [North], RIGHT -> (0, 1) [South]
    assertEqual(SCREEN_TO_WORLD_DELTAS[90].UP.dx, 1);
    assertEqual(SCREEN_TO_WORLD_DELTAS[90].UP.dy, 0);
    assertEqual(SCREEN_TO_WORLD_DELTAS[90].RIGHT.dx, 0);
    assertEqual(SCREEN_TO_WORLD_DELTAS[90].RIGHT.dy, 1);

    // 180 deg: UP -> (0, 1) [South], DOWN -> (0, -1) [North], LEFT -> (1, 0) [East], RIGHT -> (-1, 0) [West]
    assertEqual(SCREEN_TO_WORLD_DELTAS[180].UP.dx, 0);
    assertEqual(SCREEN_TO_WORLD_DELTAS[180].UP.dy, 1);
    assertEqual(SCREEN_TO_WORLD_DELTAS[180].RIGHT.dx, -1);
    assertEqual(SCREEN_TO_WORLD_DELTAS[180].RIGHT.dy, 0);

    // 270 deg: UP -> (-1, 0) [West], DOWN -> (1, 0) [East], LEFT -> (0, 1) [South], RIGHT -> (0, -1) [North]
    assertEqual(SCREEN_TO_WORLD_DELTAS[270].UP.dx, -1);
    assertEqual(SCREEN_TO_WORLD_DELTAS[270].UP.dy, 0);
    assertEqual(SCREEN_TO_WORLD_DELTAS[270].RIGHT.dx, 0);
    assertEqual(SCREEN_TO_WORLD_DELTAS[270].RIGHT.dy, -1);
  });

  it('tracks isRotating() lifecycle during smooth rotation tweening', () => {
    const camera = new Camera(800, 600, 32);
    assertEqual(camera.isRotating(), false);

    camera.rotateRight();
    assertEqual(camera.isRotating(), true, 'isRotating is true after rotateRight()');

    // Simulate partial tween frames
    camera.update(400, 300, 0.016, 20, 20);
    assertEqual(camera.isRotating(), true, 'Still rotating mid-tween');

    // Complete rotation by stepping time forward
    for (let i = 0; i < 30; i++) {
      camera.update(400, 300, 0.05, 20, 20);
    }
    assertEqual(camera.isRotating(), false, 'isRotating becomes false when rotation finishes');
    assertEqual(camera.rotation, 90);
    assertEqual(camera.getDiscreteRotation(), 90);
  });

  it('maintains strict relative coordinate alignment between player and bridge tiles across rotations', () => {
    const camera = new Camera(800, 600, 32);
    const tileSize = 32;

    // Bridge cell at (6, 5), player centered on the bridge
    const bridgeTileX = 6;
    const bridgeTileY = 5;
    const playerWorldX = bridgeTileX * tileSize + tileSize / 2;
    const playerWorldY = bridgeTileY * tileSize + tileSize / 2;

    camera.snapTo(playerWorldX, playerWorldY, 20, 20);

    for (const angle of ROTATION_ANGLES) {
      camera.setRotation(angle, true);
      const tileScreen = camera.worldToScreen(bridgeTileX * tileSize, bridgeTileY * tileSize, true);
      const playerScreen = camera.worldToScreen(playerWorldX, playerWorldY, true);

      // Player center relative to tile top-left must stay exactly (16, 16) rotated
      const relX = playerScreen.x - tileScreen.x;
      const relY = playerScreen.y - tileScreen.y;
      const dist = Math.hypot(relX, relY);

      // Distance from tile origin (0,0) to center (16,16) is sqrt(16^2 + 16^2) ≈ 22.627
      const expectedDist = Math.hypot(tileSize / 2, tileSize / 2);
      assert(Math.abs(dist - expectedDist) <= 1.0, `Tile and player distance preserved at ${angle}° (got ${dist}, expected ${expectedDist})`);
    }
  });

  it('accurately maps tileToScreen and screenToTile across all 4 rotation angles (BL-43)', () => {
    const camera = new Camera(800, 600, 32);
    const tileSize = 32;
    const tileX = 10;
    const tileY = 8;
    const playerWorldX = (tileX + 0.5) * tileSize;
    const playerWorldY = (tileY + 0.5) * tileSize;

    camera.snapTo(playerWorldX, playerWorldY, 30, 30);

    for (const angle of ROTATION_ANGLES) {
      camera.setRotation(angle, true);
      const tileTopLeft = camera.tileToScreen(tileX, tileY);
      const playerScreen = camera.worldToScreen(playerWorldX, playerWorldY, true);

      // Player screen position must be EXACTLY at tile center: tileTopLeft.x + tileSize / 2, tileTopLeft.y + tileSize / 2
      const tileCenterX = tileTopLeft.x + tileSize / 2;
      const tileCenterY = tileTopLeft.y + tileSize / 2;

      assert(
        Math.abs(tileCenterX - playerScreen.x) <= 0.001,
        `Tile center X matches player screen X at ${angle}° (tile: ${tileCenterX}, player: ${playerScreen.x})`
      );
      assert(
        Math.abs(tileCenterY - playerScreen.y) <= 0.001,
        `Tile center Y matches player screen Y at ${angle}° (tile: ${tileCenterY}, player: ${playerScreen.y})`
      );

      // Invertibility: screenToTile should recover the exact tile coordinates
      const recoveredTile = camera.screenToTile(tileCenterX, tileCenterY);
      assertEqual(recoveredTile.x, tileX, `Recovered tileX matches at ${angle}°`);
      assertEqual(recoveredTile.y, tileY, `Recovered tileY matches at ${angle}°`);
    }
  });
});

