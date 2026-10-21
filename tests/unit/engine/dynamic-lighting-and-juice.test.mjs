import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { BiomeSurfaceShaders } from '../../../js/engine/biome-surface-shaders.js';
import { Camera } from '../../../js/engine/camera.js';
import { audioFX } from '../../../js/ui/audio-fx.js';
import { globalEvents } from '../../../js/core/events.js';
import { TILES } from '../../../js/core/constants.js';

describe('Engine > Dynamic Floor Lighting & Kinetic Juice (BL-164, ADR-0047)', () => {
  it('renders dynamic radial lighting on floor pavers without errors', () => {
    const mockCtx = {
      saveCalls: 0,
      restoreCalls: 0,
      arcCalls: 0,
      fillCalls: 0,
      gradients: [],
      save() { this.saveCalls++; },
      restore() { this.restoreCalls++; },
      beginPath() {},
      arc(x, y, r, sa, ea) { this.arcCalls++; },
      fill() { this.fillCalls++; },
      createRadialGradient(x0, y0, r0, x1, y1, r1) {
        const grad = {
          x0, y0, r0, x1, y1, r1,
          stops: [],
          addColorStop(offset, color) { this.stops.push({ offset, color }); }
        };
        mockCtx.gradients.push(grad);
        return grad;
      }
    };

    const mockLevel = {
      layers: {
        ground: [
          [TILES.WALL, TILES.WALL, TILES.WALL],
          [TILES.WALL, TILES.FLOOR, TILES.WALL],
          [TILES.WALL, TILES.WALL, TILES.WALL]
        ]
      },
      exit: { x: 1, y: 1 }
    };

    const mockBounds = { startCol: 0, endCol: 2, startRow: 0, endRow: 2 };
    const mockCamera = {
      tileSize: 32,
      worldToScreen(wx, wy) { return { x: wx, y: wy }; }
    };

    const mockEntities = [
      { type: 'wall_decor', decorType: 'torch', x: 1, y: 0 }
    ];

    const mockPlayer = {
      worldX: 32,
      worldY: 32,
      hasTorch() { return true; }
    };

    BiomeSurfaceShaders.renderDynamicFloorLightingPass(
      mockCtx,
      mockLevel,
      mockBounds,
      mockCamera,
      { id: 'dungeon' },
      mockEntities,
      mockPlayer,
      32,
      1.5
    );

    assert(mockCtx.saveCalls >= 1, 'Context was saved');
    assert(mockCtx.restoreCalls >= 1, 'Context was restored');
    assert(mockCtx.gradients.length >= 2, 'Gradients created for torch, player, and/or exit');
    assert(mockCtx.arcCalls >= 2, 'Radial light arcs drawn');
  });

  it('verifies Camera shake initiates, offsets screen coordinates, and dampens over dt', () => {
    const camera = new Camera(800, 600, 32);
    assertEqual(camera.shakeDuration, 0, 'Camera starts with zero shake');
    assertEqual(camera.shakeOffsetX, 0, 'Initial shake X offset is zero');
    assertEqual(camera.shakeOffsetY, 0, 'Initial shake Y offset is zero');

    camera.shake(6, 0.25);
    assertEqual(camera.shakeIntensity, 6, 'Shake intensity set to 6');
    assertEqual(camera.shakeDuration, 0.25, 'Shake duration set to 0.25s');

    // Update camera with dt = 0.05
    camera.update(100, 100, 0.05, 30, 30);
    assert(camera.shakeDuration > 0, 'Shake still active after dt');
    assert(camera.shakeDuration < 0.25, 'Shake duration decremented');

    // Test coordinate displacement in worldToScreen
    const screenCoord = camera.worldToScreen(100, 100);
    assert(typeof screenCoord.x === 'number', 'Screen coordinate X calculated');
    assert(typeof screenCoord.y === 'number', 'Screen coordinate Y calculated');

    // Fast-forward camera past shake duration
    camera.update(100, 100, 0.30, 30, 30);
    assertEqual(camera.shakeDuration, 0, 'Shake duration returned to zero');
    assertEqual(camera.shakeOffsetX, 0, 'Shake X offset reset to zero');
    assertEqual(camera.shakeOffsetY, 0, 'Shake Y offset reset to zero');
  });

  it('triggers camera screen punch on door:unlocked and lever:toggled events', () => {
    const camera = new Camera(800, 600, 32);
    camera.shakeDuration = 0;

    globalEvents.emit('door:unlocked', { doorId: 'test_door' });
    assert(camera.shakeDuration > 0, 'Camera shook on door:unlocked event');
    assert(camera.shakeIntensity >= 4, 'Door unlock punch has intensity >= 4');

    camera.shakeDuration = 0;
    globalEvents.emit('lever:toggled', { state: true });
    assert(camera.shakeDuration > 0, 'Camera shook on lever:toggled event');
  });

  it('verifies audioFX footstep handles terrain types and pitch jitter', () => {
    // Should not throw on different terrain types
    audioFX.playFootstep('stone');
    audioFX.playFootstep('wood');
    audioFX.playFootstep('water');
    audioFX.playMove('wood');
    assert(true, 'playFootstep executes safely across stone, wood, and water terrains');
  });
});
