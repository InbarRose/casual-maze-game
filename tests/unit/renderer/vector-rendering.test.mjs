/**
 * Unit Tests: Vector SVG Asset Pipeline Integration in GameRenderer & Entities
 * Validates BL-09 (SVG Sprite Rendering) and BL-10 (Biome Floor Textures)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { assetLoader, CANONICAL_ASSET_PATHS } from '../../../js/core/asset-loader.js';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { Camera } from '../../../js/engine/camera.js';
import { THEMES, TILES } from '../../../js/core/constants.js';
import { Door } from '../../../js/entities/door.js';
import { Key } from '../../../js/entities/key.js';
import { Lever } from '../../../js/entities/lever.js';

function createMockContext() {
  const calls = {
    drawImage: [],
    fillRect: [],
    strokeRect: [],
    save: 0,
    restore: 0,
    beginPath: 0,
    fill: 0,
    stroke: 0,
  };

  return {
    calls,
    canvas: { width: 800, height: 600 },
    drawImage(...args) { calls.drawImage.push(args); },
    fillRect(...args) { calls.fillRect.push(args); },
    strokeRect(...args) { calls.strokeRect.push(args); },
    save() { calls.save++; },
    restore() { calls.restore++; },
    beginPath() { calls.beginPath++; },
    rect() {},
    roundRect() {},
    arc() {},
    ellipse() {},
    fill() { calls.fill++; },
    stroke() { calls.stroke++; },
    moveTo() {},
    lineTo() {},
    closePath() {},
    translate() {},
    rotate() {},
    setLineDash() {},
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    font: '12px sans-serif',
    textAlign: 'center',
    textBaseline: 'middle',
    measureText: () => ({ width: 40 }),
    fillText() {},
  };
}

function createMockLoadedImage(path) {
  return {
    src: path,
    complete: true,
    naturalWidth: 64,
    naturalHeight: 64,
  };
}

describe('Engine > Vector SVG Asset Pipeline (BL-09 & BL-10)', () => {
  it('validates canonical asset path mappings across all 5 themes', () => {
    const themes = ['dungeon', 'glacial', 'jungle', 'magma', 'temple'];
    for (const theme of themes) {
      assert(CANONICAL_ASSET_PATHS[`tile_floor_${theme}`], `Floor exists for ${theme}`);
      assert(CANONICAL_ASSET_PATHS[`tile_floor_${theme}`].includes('.svg'), `Path is SVG: ${theme}`);
      assert(CANONICAL_ASSET_PATHS[`tile_wall_${theme}`], `Wall exists for ${theme}`);
      assert(CANONICAL_ASSET_PATHS[`tile_bridge_${theme}_ew`], `Bridge EW exists for ${theme}`);
      assert(CANONICAL_ASSET_PATHS[`tile_bridge_${theme}_ns`], `Bridge NS exists for ${theme}`);
      assert(CANONICAL_ASSET_PATHS[`door_${theme}_horizontal`], `Door horizontal exists for ${theme}`);
      assert(CANONICAL_ASSET_PATHS[`door_${theme}_vertical`], `Door vertical exists for ${theme}`);
    }

    assert(CANONICAL_ASSET_PATHS['door_classic'], 'door_classic is registered');
    assert(CANONICAL_ASSET_PATHS['key_classic'], 'key_classic is registered');
    assert(CANONICAL_ASSET_PATHS['lever_switch_on'], 'lever_switch_on is registered');
    assert(CANONICAL_ASSET_PATHS['exit_portal'], 'exit_portal is registered');
  });

  it('tests resolvePath and getImage synchronous cache behavior', () => {
    assertEqual(assetLoader.resolvePath('tile_floor_dungeon'), 'assets/tiles/ground/floor_dungeon.svg');
    assertEqual(assetLoader.resolvePath('assets/tiles/ground/floor_dungeon.svg'), 'assets/tiles/ground/floor_dungeon.svg');
    assertEqual(assetLoader.resolvePath('non_existent_key_123'), null);

    // In headless environment without cache, returns null
    const path = 'assets/tiles/ground/floor_dungeon.svg';
    assetLoader.imageCache.delete(path);
    assertEqual(assetLoader.getImage('tile_floor_dungeon'), null);

    // When mock image is placed in imageCache, returns image
    const mockImg = createMockLoadedImage(path);
    assetLoader.imageCache.set(path, mockImg);
    assertEqual(assetLoader.getImage('tile_floor_dungeon'), mockImg);

    // Clean up
    assetLoader.imageCache.delete(path);
  });

  it('tests GameRenderer.renderAngledFloors vector SVG drawing and procedural fallback', () => {
    const mockCtx = createMockContext();
    const mockCanvas = { width: 800, height: 600, getContext: () => mockCtx };
    const renderer = new GameRenderer(mockCanvas);
    const camera = new Camera(800, 600, 32);
    camera.snapTo(64, 64);

    const level = {
      config: { theme: 'dungeon' },
      dimensions: { width: 5, height: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1],
        ],
      },
    };
    const bounds = { startCol: 1, endCol: 3, startRow: 1, endRow: 3 };

    // 1. Without cached image -> falls back to ctx.fillRect
    assetLoader.imageCache.clear();
    renderer.renderAngledFloors(mockCtx, level, bounds, camera, THEMES.dungeon);
    assert(mockCtx.calls.fillRect.length > 0, 'Used fillRect for procedural floor fallback');
    assertEqual(mockCtx.calls.drawImage.length, 0, 'Zero drawImage calls without cached assets');

    // 2. With cached image -> uses ctx.drawImage
    const floorPath = assetLoader.resolvePath('tile_floor_dungeon');
    const mockFloor = createMockLoadedImage(floorPath);
    assetLoader.imageCache.set(floorPath, mockFloor);

    mockCtx.calls.drawImage = [];
    mockCtx.calls.fillRect = [];
    renderer.renderAngledFloors(mockCtx, level, bounds, camera, THEMES.dungeon);
    assert(mockCtx.calls.drawImage.length > 0, 'Invoked ctx.drawImage with vector floor SVG');
    assertEqual(mockCtx.calls.drawImage[0][0], mockFloor, 'First arg to drawImage is the loaded floor SVG image');

    // Clean up
    assetLoader.imageCache.delete(floorPath);
  });

  it('tests GameRenderer.renderAngledWall vector SVG top cap and facade rendering', () => {
    const mockCtx = createMockContext();
    const mockCanvas = { width: 800, height: 600, getContext: () => mockCtx };
    const renderer = new GameRenderer(mockCanvas);
    const camera = new Camera(800, 600, 32);

    const ground = [
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0],
    ];

    // 1. Procedural fallback
    assetLoader.imageCache.clear();
    renderer.renderAngledWall(mockCtx, 1, 1, 100, 100, 32, THEMES.dungeon, ground, camera);
    assert(mockCtx.calls.fillRect.length > 0, 'Wall rendered using procedural fillRect fallback');
    assertEqual(mockCtx.calls.drawImage.length, 0, 'Zero drawImage calls without cached wall asset');

    // 2. Vector wall sprite rendering
    const wallPath = assetLoader.resolvePath('tile_wall_dungeon');
    const mockWall = createMockLoadedImage(wallPath);
    assetLoader.imageCache.set(wallPath, mockWall);

    mockCtx.calls.drawImage = [];
    renderer.renderAngledWall(mockCtx, 1, 1, 100, 100, 32, THEMES.dungeon, ground, camera);
    assert(mockCtx.calls.drawImage.length >= 1, 'Wall top cap drawn using vector SVG');
    assertEqual(mockCtx.calls.drawImage[0][0], mockWall, 'drawImage called with mock wall image');

    // Clean up
    assetLoader.imageCache.delete(wallPath);
  });

  it('tests Door entity vector SVG sprite rendering with fallback', () => {
    const mockCtx = createMockContext();
    const door = new Door({ id: 'test_door', x: 2, y: 2, color: '#fbbf24', style: 'classic', useVectorSprite: true });

    // 1. Fallback
    assetLoader.imageCache.clear();
    door.render(mockCtx, 64, 64, 32);
    assertEqual(mockCtx.calls.drawImage.length, 0, 'Zero drawImage calls when door asset unloaded');

    // 2. Vector sprite
    const doorPath = assetLoader.resolvePath('door_classic');
    const mockDoor = createMockLoadedImage(doorPath);
    assetLoader.imageCache.set(doorPath, mockDoor);

    mockCtx.calls.drawImage = [];
    door.render(mockCtx, 64, 64, 32);
    assertEqual(mockCtx.calls.drawImage.length, 1, 'Door rendered using vector SVG drawImage');
    assertEqual(mockCtx.calls.drawImage[0][0], mockDoor, 'Door image passed to drawImage');

    // Clean up
    assetLoader.imageCache.delete(doorPath);
  });

  it('tests Key entity vector SVG sprite rendering with fallback', () => {
    const mockCtx = createMockContext();
    const key = new Key({ id: 'test_key', x: 3, y: 3, color: '#38bdf8', style: 'classic', useVectorSprite: true });

    // 1. Fallback
    assetLoader.imageCache.clear();
    key.render(mockCtx, 96, 96, 32);
    assertEqual(mockCtx.calls.drawImage.length, 0, 'Zero drawImage calls when key asset unloaded');

    // 2. Vector sprite
    const keyPath = assetLoader.resolvePath('key_classic');
    const mockKey = createMockLoadedImage(keyPath);
    assetLoader.imageCache.set(keyPath, mockKey);

    mockCtx.calls.drawImage = [];
    key.render(mockCtx, 96, 96, 32);
    assertEqual(mockCtx.calls.drawImage.length, 1, 'Key rendered using vector SVG drawImage');
    assertEqual(mockCtx.calls.drawImage[0][0], mockKey, 'Key image passed to drawImage');

    // Clean up
    assetLoader.imageCache.delete(keyPath);
  });

  it('tests Lever entity vector SVG sprite rendering with active and inactive states', () => {
    const mockCtx = createMockContext();
    const lever = new Lever({ id: 'test_lever', x: 4, y: 4, style: 'switch_lever', state: false, useVectorSprite: true });

    // 1. Fallback
    assetLoader.imageCache.clear();
    lever.render(mockCtx, 128, 128, 32);
    assertEqual(mockCtx.calls.drawImage.length, 0, 'Zero drawImage calls when lever asset unloaded');

    // 2. Vector sprite (inactive)
    const offPath = assetLoader.resolvePath('lever_switch_off');
    const onPath = assetLoader.resolvePath('lever_switch_on');
    const mockOff = createMockLoadedImage(offPath);
    const mockOn = createMockLoadedImage(onPath);
    assetLoader.imageCache.set(offPath, mockOff);
    assetLoader.imageCache.set(onPath, mockOn);

    mockCtx.calls.drawImage = [];
    lever.render(mockCtx, 128, 128, 32);
    assertEqual(mockCtx.calls.drawImage.length, 1, 'Inactive lever rendered with drawImage');
    assertEqual(mockCtx.calls.drawImage[0][0], mockOff, 'Used lever_switch_off image');

    // 3. Vector sprite (active)
    lever.state = true;
    mockCtx.calls.drawImage = [];
    lever.render(mockCtx, 128, 128, 32);
    assertEqual(mockCtx.calls.drawImage.length, 1, 'Active lever rendered with drawImage');
    assertEqual(mockCtx.calls.drawImage[0][0], mockOn, 'Used lever_switch_on image');

    // Clean up
    assetLoader.imageCache.delete(offPath);
    assetLoader.imageCache.delete(onPath);
  });
});
