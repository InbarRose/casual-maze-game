/**
 * Unit Tests: Tactical Minimap Multi-Elevation Shading, Entity Indicators & High-Contrast Mode
 * Covers BL-65 and BL-66
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Minimap } from '../../../js/engine/minimap.js';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { Player } from '../../../js/entities/player.js';
import { StorageManager } from '../../../js/core/storage.js';
import { TILES, FOG_STATE, ENTITY_TYPES } from '../../../js/core/constants.js';

function createMockCanvas(width = 180, height = 180) {
  const operations = [];

  const mockCtx = {
    fillRect: (x, y, w, h) => operations.push({ op: 'fillRect', x, y, w, h, fillStyle: mockCtx.fillStyle }),
    strokeRect: (x, y, w, h) => operations.push({ op: 'strokeRect', x, y, w, h, strokeStyle: mockCtx.strokeStyle }),
    save: () => operations.push({ op: 'save' }),
    restore: () => operations.push({ op: 'restore' }),
    beginPath: () => operations.push({ op: 'beginPath' }),
    closePath: () => operations.push({ op: 'closePath' }),
    moveTo: (x, y) => operations.push({ op: 'moveTo', x, y }),
    lineTo: (x, y) => operations.push({ op: 'lineTo', x, y }),
    arc: (x, y, r) => operations.push({ op: 'arc', x, y, r, fillStyle: mockCtx.fillStyle, strokeStyle: mockCtx.strokeStyle }),
    fill: () => operations.push({ op: 'fill', fillStyle: mockCtx.fillStyle }),
    stroke: () => operations.push({ op: 'stroke', strokeStyle: mockCtx.strokeStyle }),
    roundRect: (x, y, w, h, r) => operations.push({ op: 'roundRect', x, y, w, h, r }),
    fillStyle: '#000000',
    strokeStyle: '#000000',
    globalAlpha: 1.0,
    lineWidth: 1,
    font: '10px sans-serif',
    textAlign: 'left',
    textBaseline: 'top',
    fillText: (text, x, y) => operations.push({ op: 'fillText', text, x, y }),
  };

  const canvas = {
    width,
    height,
    getContext: () => mockCtx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width, height }),
  };

  return { canvas, mockCtx, operations };
}

function create3DTestLevel() {
  const width = 11;
  const height = 11;
  const ground = Array.from({ length: height }, () => Array(width).fill(TILES.FLOOR));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  // Outer walls
  for (let i = 0; i < 11; i++) {
    ground[0][i] = TILES.WALL;
    ground[10][i] = TILES.WALL;
    ground[i][0] = TILES.WALL;
    ground[i][10] = TILES.WALL;
  }

  // Multi-elevation bridge at (5, 5) with approach ramps at (5, 4) and (5, 6)
  ground[5][5] = TILES.BRIDGE_EW;
  overhead[5][5] = TILES.BRIDGE_EW;
  ground[4][5] = TILES.RAMP_S;
  ground[6][5] = TILES.RAMP_N;

  // Secret wall at (2, 2)
  ground[2][2] = TILES.SECRET_WALL;

  const entities = [
    { type: ENTITY_TYPES.KEY, id: 'k1', x: 2, y: 5, color: '#facc15', collected: false },
    { type: ENTITY_TYPES.DOOR, id: 'd1', x: 8, y: 5, color: '#ef4444', isOpen: false },
    { type: ENTITY_TYPES.LEVER, id: 'l1', x: 3, y: 3, active: false },
    { type: ENTITY_TYPES.TELEPORTER, id: 't1', x: 7, y: 7 },
  ];

  return {
    dimensions: { width, height },
    config: { theme: 'dungeon', viewPerspective: 'angled' },
    layers: { ground, overhead },
    entities,
    exit: { x: 9, y: 9 },
  };
}

function resetIsolation() {
  if (typeof localStorage !== 'undefined' && localStorage.clear) {
    localStorage.clear();
  }
  if (typeof document !== 'undefined' && document.body?.classList?.remove) {
    document.body.classList.remove('high-contrast-mode');
  }
}

describe('Engine > Tactical Minimap & Elevation Shading (BL-65)', () => {
  it('renders multi-elevation bridges with elevated deck and walkway stripe', () => {
    resetIsolation();
    const { canvas, operations } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);
    const level = create3DTestLevel();
    const player = new Player(1, 1, 0, 32);

    minimap.render(level, player, null, 0.016);

    // Verify bridge deck fill operations
    const bridgeFills = operations.filter(
      op => op.op === 'fillRect' && (op.fillStyle === '#0369a1' || op.fillStyle === '#075985')
    );
    assert(bridgeFills.length > 0, 'Minimap renders elevated cobalt bridge deck');

    // Verify walkway center stripe
    const bridgeStripes = operations.filter(
      op => op.op === 'fillRect' && op.fillStyle === '#38bdf8'
    );
    assert(bridgeStripes.length > 0, 'Minimap renders bright cyan center plank stripe for bridge');

    // Verify ramp incline fills
    const rampFills = operations.filter(
      op => op.op === 'fillRect' && (op.fillStyle === '#0ea5e9' || op.fillStyle === '#0284c7')
    );
    assert(rampFills.length > 0, 'Minimap renders directional ramp incline tiles');
  });

  it('renders tactical entity indicators for uncollected keys, locked doors, and levers', () => {
    resetIsolation();
    const { canvas, operations } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);
    const level = create3DTestLevel();
    const player = new Player(1, 1, 0, 32);

    minimap.render(level, player, null, 0.016);

    // Verify uncollected key indicator rendered
    const keyArcs = operations.filter(
      op => op.op === 'arc' && op.fillStyle === '#facc15'
    );
    assert(keyArcs.length > 0, 'Minimap renders glowing key pip at key coordinates');

    // Verify locked door barrier crossbar rendered
    const doorBars = operations.filter(
      op => op.op === 'fillRect' && op.fillStyle === '#ef4444'
    );
    assert(doorBars.length > 0, 'Minimap renders security barrier bar across locked door');

    // Verify lever switch node rendered
    const leverNodes = operations.filter(
      op => op.op === 'fillRect' && op.fillStyle === '#f59e0b'
    );
    assert(leverNodes.length > 0, 'Minimap renders lever switch node');
  });

  it('renders player elevation beacon when player is on upper bridge deck (Z=1)', () => {
    resetIsolation();
    const { canvas, operations } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);
    const level = create3DTestLevel();

    // Player elevated on overhead bridge (Z=1)
    const elevatedPlayer = new Player(5, 5, 1, 32);
    minimap.render(level, elevatedPlayer, null, 0.016);

    // Look for elevated beacon arc operations with cyan color '#38bdf8'
    const cyanBeacons = operations.filter(
      op => op.op === 'arc' && (op.fillStyle === '#38bdf8' || op.strokeStyle === '#38bdf8')
    );
    assert(cyanBeacons.length >= 2, 'Elevated player gets cyan beacon and outer elevated ring');
  });

  it('renders atmospheric radar sweep and tactical HUD corner frame', () => {
    resetIsolation();
    const { canvas, operations } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);
    const level = create3DTestLevel();
    const player = new Player(1, 1, 0, 32);

    minimap.render(level, player, null, 0.016);

    // Verify tactical corner bracket lines
    const lineTos = operations.filter(op => op.op === 'lineTo');
    assert(lineTos.length >= 8, 'Minimap renders tactical HUD corner brackets');

    // Verify radar sweep arc
    const sweepArcs = operations.filter(op => op.op === 'arc' && op.strokeStyle?.includes('56, 189, 248'));
    assert(sweepArcs.length > 0, 'Minimap emits circular radar sonar wave');
  });
});

describe('Accessibility > High-Contrast Canvas Contours (BL-26, BL-66)', () => {
  it('applies high-contrast borders and neon player halo in Minimap', () => {
    localStorage.clear();
    StorageManager.setSetting('high_contrast', true);

    const { canvas, operations } = createMockCanvas(180, 180);
    const minimap = new Minimap(canvas, 180);
    const level = create3DTestLevel();
    const player = new Player(1, 1, 0, 32);

    assert(minimap.isHighContrast() === true, 'isHighContrast returns true');
    minimap.render(level, player, null, 0.016);

    // Verify clear background is high-contrast black #000000
    const blackFills = operations.filter(op => op.op === 'fillRect' && op.fillStyle === '#000000');
    assert(blackFills.length > 0, 'High contrast minimap clears with pitch black background');

    // Verify player is rendered with high-contrast neon yellow #facc15
    const hcPlayer = operations.filter(op => op.op === 'arc' && op.fillStyle === '#facc15');
    assert(hcPlayer.length > 0, 'High contrast minimap renders neon yellow player marker');

    StorageManager.setSetting('high_contrast', false);
    resetIsolation();
  });

  it('GameRenderer.isHighContrast() detects mode and renders high-visibility player halo', () => {
    localStorage.clear();
    StorageManager.setSetting('high_contrast', true);

    const { canvas, mockCtx, operations } = createMockCanvas(800, 600);
    const renderer = new GameRenderer(canvas);
    assert(renderer.isHighContrast() === true, 'GameRenderer detects high contrast setting');

    renderer.renderPlayerHighContrastHalo(mockCtx, 100, 100, 32);

    // Verify yellow and white halo arcs
    const yellowHalo = operations.filter(op => op.op === 'arc' && op.strokeStyle === '#facc15');
    assert(yellowHalo.length > 0, 'Rendered neon yellow halo arc around player');

    const whiteHalo = operations.filter(op => op.op === 'arc' && op.strokeStyle === '#ffffff');
    assert(whiteHalo.length > 0, 'Rendered outer white contour ring around player');

    StorageManager.setSetting('high_contrast', false);
    resetIsolation();
  });
});
