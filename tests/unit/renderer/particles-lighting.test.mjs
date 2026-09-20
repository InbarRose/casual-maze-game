/**
 * Unit Tests: Atmospheric Particles, Fog Lighting Gradients, and Elevation Shadows
 * Covers BL-11, BL-12, and BL-13
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { Camera } from '../../../js/engine/camera.js';
import { Player } from '../../../js/entities/player.js';
import { WallDecor } from '../../../js/entities/wall-decor.js';
import { Collectible } from '../../../js/entities/collectible.js';
import { FogOfWar } from '../../../js/engine/fog.js';
import { TILES, THEMES, ELEVATION, FOG_STATE } from '../../../js/core/constants.js';

function createMockCanvas(width = 800, height = 600) {
  const operations = [];
  const gradients = [];

  const mockCtx = {
    fillRect: (x, y, w, h) => operations.push({ op: 'fillRect', x, y, w, h, fillStyle: mockCtx.fillStyle }),
    strokeRect: (x, y, w, h) => operations.push({ op: 'strokeRect', x, y, w, h }),
    save: () => operations.push({ op: 'save' }),
    restore: () => operations.push({ op: 'restore' }),
    beginPath: () => operations.push({ op: 'beginPath' }),
    closePath: () => operations.push({ op: 'closePath' }),
    arc: (x, y, r) => operations.push({ op: 'arc', x, y, r }),
    fill: () => operations.push({ op: 'fill', fillStyle: mockCtx.fillStyle }),
    stroke: () => operations.push({ op: 'stroke' }),
    moveTo: (x, y) => operations.push({ op: 'moveTo', x, y }),
    lineTo: (x, y) => operations.push({ op: 'lineTo', x, y }),
    drawImage: () => operations.push({ op: 'drawImage' }),
    createRadialGradient: (x0, y0, r0, x1, y1, r1) => {
      const grad = {
        type: 'radial',
        stops: [],
        addColorStop: (offset, color) => grad.stops.push({ offset, color }),
        x0, y0, r0, x1, y1, r1,
      };
      gradients.push(grad);
      return grad;
    },
    createLinearGradient: (x0, y0, x1, y1) => {
      const grad = {
        type: 'linear',
        stops: [],
        addColorStop: (offset, color) => grad.stops.push({ offset, color }),
        x0, y0, x1, y1,
      };
      gradients.push(grad);
      return grad;
    },
    fillStyle: '#000000',
    strokeStyle: '#000000',
    globalAlpha: 1.0,
    lineWidth: 1,
    font: '10px sans-serif',
    textAlign: 'left',
    textBaseline: 'top',
    fillText: () => {},
    strokeText: () => {},
  };

  return {
    canvas: {
      width,
      height,
      getContext: () => mockCtx,
    },
    mockCtx,
    operations,
    gradients,
  };
}

describe('Renderer > Atmospheric Particles (BL-11)', () => {
  it('initializes ambient particle pool and respects max count', () => {
    const { canvas } = createMockCanvas();
    const renderer = new GameRenderer(canvas);

    assertEqual(renderer.ambientParticles.length, 0, 'Ambient particle pool starts empty');
    assertEqual(renderer.maxAmbientParticles, 35, 'Ambient particle cap is set to 35 for 60fps budget');
  });

  it('spawns biome-specific particles with appropriate kinematics for all 5 biomes', () => {
    const { canvas } = createMockCanvas();
    const renderer = new GameRenderer(canvas);

    // 1. Magma / Lava: rising embers (vy < 0)
    const magmaParticle = renderer.createAmbientParticle('magma', 0, 100, 0, 100);
    assert(magmaParticle.vy < 0, 'Magma embers must have negative vy to rise upward');
    assert(['#f97316', '#ef4444', '#fbbf24', '#f59e0b'].includes(magmaParticle.color), 'Magma ember has fiery palette');

    // 2. Jungle: drifting pollen/spores (vy > 0)
    const jungleParticle = renderer.createAmbientParticle('jungle', 0, 100, 0, 100);
    assert(jungleParticle.vy > 0, 'Jungle spores must drift downward');
    assert(['#22c55e', '#86efac', '#4ade80', '#a7f3d0'].includes(jungleParticle.color), 'Jungle spore has verdant palette');

    // 3. Glacial: falling snow crystals (vy > 0)
    const glacialParticle = renderer.createAmbientParticle('glacial', 0, 100, 0, 100);
    assert(glacialParticle.vy > 0, 'Glacial snow crystals must fall downward');
    assert(['#e0f2fe', '#38bdf8', '#ffffff', '#bae6fd'].includes(glacialParticle.color), 'Glacial snow has frosty palette');

    // 4. Temple: golden dust with diagonal breeze (vx > 0, vy > 0)
    const templeParticle = renderer.createAmbientParticle('temple', 0, 100, 0, 100);
    assert(templeParticle.vx > 0, 'Temple sand must drift with diagonal breeze');
    assert(['#fbbf24', '#fde047', '#d97706', '#fef08a'].includes(templeParticle.color), 'Temple dust has golden palette');

    // 5. Dungeon: lazy subterranean dust motes
    const dungeonParticle = renderer.createAmbientParticle('dungeon', 0, 100, 0, 100);
    assert(dungeonParticle.maxLife >= 2.5, 'Dungeon dust motes have long lazy lifetimes');
  });

  it('populates and updates ambient particles within the camera viewport bounds', () => {
    const { canvas } = createMockCanvas();
    const renderer = new GameRenderer(canvas);
    const camera = new Camera(800, 600, 32);

    const level = {
      dimensions: { width: 25, height: 25 },
      config: { theme: 'magma' },
    };

    // First update: fills pool up to maxAmbientParticles
    renderer.updateAmbientParticles(0.016, level, camera);
    assertEqual(renderer.ambientParticles.length, 35, 'Fills ambient particle pool up to 35');

    // Store initial Y positions of rising magma particles
    const initialY = renderer.ambientParticles[0].y;
    renderer.updateAmbientParticles(0.1, level, camera);
    const updatedY = renderer.ambientParticles[0].y;

    assert(updatedY < initialY, 'Magma embers moved upward over elapsed time dt');
  });

  it('renders ambient particles smoothly with alpha fade without throwing', () => {
    const { canvas, mockCtx, operations } = createMockCanvas();
    const renderer = new GameRenderer(canvas);
    const camera = new Camera(800, 600, 32);

    renderer.ambientParticles.push({
      x: 100,
      y: 100,
      vx: 0,
      vy: -10,
      swayAmp: 10,
      swayFreq: 2,
      seed: 42,
      color: '#f97316',
      size: 2.5,
      life: 1.0,
      maxLife: 2.0,
      baseAlpha: 0.8,
    });

    renderer.renderWorldEffects(mockCtx, camera);

    const arcs = operations.filter(op => op.op === 'arc');
    assert(arcs.length >= 1, 'Rendered ambient particle arc on canvas');
  });
});

describe('Renderer > Fog of War Lighting Gradients (BL-12)', () => {
  it('renders soft radial lighting gradient halo around explorer in Fog of War', () => {
    const { canvas, mockCtx, gradients } = createMockCanvas();
    const renderer = new GameRenderer(canvas);
    const camera = new Camera(800, 600, 32);
    const fog = new FogOfWar(20, 20);
    fog.reset();

    const player = new Player(5, 5, 0, 32);
    const theme = THEMES.dungeon;

    renderer.renderFogLightingGradients(mockCtx, fog, camera, theme, player, [], null, 32);

    const radialGradients = gradients.filter(g => g.type === 'radial');
    assert(radialGradients.length >= 1, 'Created radial gradient for explorer lighting halo');

    const explorerGrad = radialGradients[0];
    assert(explorerGrad.stops.length >= 3, 'Explorer halo has smooth multi-stop gradient falloff');
  });

  it('expands explorer lighting radius when carrying a torch', () => {
    const { canvas, mockCtx, gradients } = createMockCanvas();
    const renderer = new GameRenderer(canvas);
    const camera = new Camera(800, 600, 32);
    const fog = new FogOfWar(20, 20);
    fog.reset();

    const normalPlayer = new Player(5, 5, 0, 32);
    const theme = THEMES.dungeon;

    renderer.renderFogLightingGradients(mockCtx, fog, camera, theme, normalPlayer, [], null, 32);
    const normalRadius = gradients[0].r1;

    // Player equipped with torch
    const torchPlayer = new Player(5, 5, 0, 32);
    torchPlayer.inventory = ['torch'];

    renderer.renderFogLightingGradients(mockCtx, fog, camera, theme, torchPlayer, [], null, 32);
    const torchRadius = gradients[1].r1;

    assert(torchRadius > normalRadius * 1.3, `Torch expands lighting radius significantly (${torchRadius} > ${normalRadius})`);
  });

  it('renders warm glowing radial halos for wall torches and carriable torches in explored areas', () => {
    const { canvas, mockCtx, gradients } = createMockCanvas();
    const renderer = new GameRenderer(canvas);
    const camera = new Camera(800, 600, 32);
    const fog = new FogOfWar(20, 20);
    fog.reset();
    fog.grid[4][6] = FOG_STATE.VISIBLE; // Mark torch tile visible

    const wallTorch = new WallDecor({
      id: 'torch_1',
      x: 6,
      y: 4,
      decorType: 'torch',
    });

    const theme = THEMES.dungeon;
    renderer.renderFogLightingGradients(mockCtx, fog, camera, theme, null, [wallTorch], null, 32);

    const torchGrads = gradients.filter(g => g.type === 'radial');
    assert(torchGrads.length >= 1, 'Created radial gradient for placed wall torch sconce');
    assert(torchGrads[0].stops.some(s => s.color.includes('254, 215, 170')), 'Torch has warm amber core color stop');
  });
});

describe('Renderer > Elevation Drop Shadows (BL-13)', () => {
  it('renders two-tier directional drop shadows (umbra and penumbra) for elevated bridges', () => {
    const { canvas, mockCtx, operations } = createMockCanvas();
    const renderer = new GameRenderer(canvas);
    const theme = THEMES.dungeon;

    renderer.renderAngledBridgeSpan(mockCtx, 'NS', 100, 100, 32, theme, 14);

    const fillRects = operations.filter(op => op.op === 'fillRect');
    const shadowFills = fillRects.filter(op => op.fillStyle && op.fillStyle.includes('rgba(0, 0, 0'));
    assert(shadowFills.length >= 2, 'Rendered both penumbra and umbra drop shadows beneath elevated bridge');

    // Verify directional shadow offset is applied
    const umbra = shadowFills.find(op => op.fillStyle.includes('0.48'));
    assert(umbra !== undefined, 'Found core umbra shadow');
    assert(umbra.x > 100, 'Umbra is offset along X axis');
    assert(umbra.y > 100, 'Umbra is offset along Y axis');
  });

  it('renders incline linear gradient drop shadow for directional ramps', () => {
    const { canvas, mockCtx, gradients } = createMockCanvas();
    const renderer = new GameRenderer(canvas);
    const theme = THEMES.dungeon;

    renderer.renderAngledRamp(mockCtx, TILES.RAMP_N, 100, 100, 32, theme, 14);

    const linearGradients = gradients.filter(g => g.type === 'linear');
    assert(linearGradients.length >= 1, 'Created linear gradient shadow for sloping ramp incline');
    assertEqual(linearGradients[0].stops[0].color, 'rgba(0, 0, 0, 0.05)', 'Ramp shadow starts faint at ground contact');
    assertEqual(linearGradients[0].stops[1].color, 'rgba(0, 0, 0, 0.42)', 'Ramp shadow reaches full depth at elevated end');
  });

  it('renders softened multi-tier drop shadows in classic top-down bridge view', () => {
    const { canvas, mockCtx, operations } = createMockCanvas();
    const renderer = new GameRenderer(canvas);
    const theme = THEMES.dungeon;

    renderer.renderBridgeSpan(mockCtx, 'EW', 100, 100, 32, theme);

    const fillRects = operations.filter(op => op.op === 'fillRect');
    const shadowFills = fillRects.filter(op => op.fillStyle && (op.fillStyle.includes('0.22') || op.fillStyle.includes('0.5')));
    assert(shadowFills.length >= 2, 'Rendered softened multi-tier shadow in classic bridge view');
  });
});
