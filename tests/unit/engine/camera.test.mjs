/**
 * Unit Tests: Camera Subsystem & Viewport Culling
 */

import { describe, it, assert, assertEqual, assertInRange } from '../../harness/index.mjs';
import { Camera } from '../../../js/engine/camera.js';

describe('Engine > Camera', () => {
  it('initializes with correct viewport dimensions and default zoom', () => {
    const cam = new Camera(800, 600, 32);
    assertEqual(cam.viewportWidth, 800);
    assertEqual(cam.viewportHeight, 600);
    assertEqual(cam.tileSize, 32);
    assertEqual(cam.mode, 'follow');
  });

  it('snaps immediately to target world coordinates and clamps bounds', () => {
    const cam = new Camera(640, 480, 32);
    cam.snapTo(320, 320, 20, 20);

    assertEqual(cam.x, 320);
    assertEqual(cam.y, 320);

    const bounds = cam.getViewportBounds(20, 20);
    assertInRange(bounds.startCol, 0, 20);
    assertInRange(bounds.endCol, 0, 20);
    assertInRange(bounds.startRow, 0, 20);
    assertInRange(bounds.endRow, 0, 20);
  });

  it('correctly converts between world and screen coordinate spaces', () => {
    const cam = new Camera(800, 600, 32);
    cam.snapTo(400, 300, 50, 50);

    const screenCenter = cam.worldToScreen(400, 300);
    assertEqual(screenCenter.x, 400, 'World center maps to screen center X');
    assertEqual(screenCenter.y, 300, 'World center maps to screen center Y');

    const worldPoint = cam.screenToWorld(400, 300);
    assertEqual(worldPoint.x, 400, 'Screen center maps back to world point X');
    assertEqual(worldPoint.y, 300, 'Screen center maps back to world point Y');
  });

  it('smoothly interpolates towards target position during update()', () => {
    const cam = new Camera(400, 300, 32);
    // Maze is 50x50 tiles (1600x1600 px)
    cam.snapTo(400, 300, 50, 50);

    // Target moves to (600, 600) with dt=0.05
    cam.update(600, 600, 0.05, 50, 50);

    assert(cam.x > 400 && cam.x < 600, `Camera X (${cam.x}) interpolates towards target 600`);
    assert(cam.y > 300 && cam.y < 600, `Camera Y (${cam.y}) interpolates towards target 600`);
  });
});
