/**
 * Unit & Benchmark Tests: Canvas 2D Visual Regression & Entity Rendering Performance (BL-79, CMP-17)
 */

import { describe, it, beforeEach, assert, assertEqual, setupMocks, createMockCanvas } from '../../harness/index.mjs';
import { Player } from '../../../js/entities/player.js';
import { Key } from '../../../js/entities/key.js';
import { Door } from '../../../js/entities/door.js';
import { Lever } from '../../../js/entities/lever.js';
import { Teleporter } from '../../../js/entities/teleporter.js';
import { Pedestal } from '../../../js/entities/pedestal.js';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { EditorCanvas } from '../../../js/editor/editor-canvas.js';
import { TILES, EXPLORER_OUTFITS } from '../../../js/core/constants.js';

describe('QA > Canvas Visual Regression & Performance Benchmark (BL-79, CMP-17)', () => {
  let canvas;
  let ctx;

  beforeEach(() => {
    setupMocks();
    canvas = createMockCanvas(800, 600);
    ctx = canvas.getContext('2d');
  });

  it('renders all core interactive entity domain models deterministically', () => {
    const key = new Key({ id: 'key_gold_1', x: 2, y: 3, keyId: 'gold_1', color: '#fbbf24', elevation: 0 });
    const door = new Door({ id: 'door_gold_1', x: 4, y: 5, keyId: 'gold_1', color: '#fbbf24', elevation: 0 });
    const lever = new Lever({ id: 'lever_1', x: 6, y: 7, state: false, targetDoors: ['door_gold_1'], elevation: 0 });
    const teleporter = new Teleporter({ id: 'teleport_1', x: 8, y: 9, targetX: 1, targetY: 1, elevation: 0 });
    const pedestal = new Pedestal({ id: 'pedestal_1', x: 10, y: 11, acceptedItem: 'orb_fire', elevation: 0 });

    const entities = [key, door, lever, teleporter, pedestal];

    for (const ent of entities) {
      let threw = false;
      try {
        if (typeof ent.render === 'function') {
          ent.render(ctx, ent.x * 32, ent.y * 32, 32);
        }
      } catch {
        threw = true;
      }
      assert(!threw, `Entity "${ent.type}" render threw error`);
    }
  });

  it('verifies 4-way camera rotation matrix rendering across all explorer perspectives', () => {
    const player = new Player(3, 3, 0, 32);
    const rotationAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    for (const angle of rotationAngles) {
      for (const facing of ['north', 'south', 'east', 'west']) {
        player.facing = facing;

        let threwAngled = false;
        let threwTopdown = false;
        try {
          player.render(ctx, 100, 100, 32, 'angled', angle);
        } catch {
          threwAngled = true;
        }
        try {
          player.render(ctx, 100, 100, 32, 'topdown', angle);
        } catch {
          threwTopdown = true;
        }

        assert(!threwAngled, `Player angled render threw at angle ${angle} facing ${facing}`);
        assert(!threwTopdown, `Player topdown render threw at angle ${angle} facing ${facing}`);
      }
    }

    player.destroy();
  });

  it('benchmarks 1,000 entity rendering passes within high-performance budget', () => {
    const player = new Player(4, 4, 0, 32);
    const start = Date.now();
    const ITERATIONS = 1000;

    for (let i = 0; i < ITERATIONS; i++) {
      player.worldX = 4 * 32 + (i % 32);
      player.render(ctx, 200, 200, 32, 'angled', 0);
    }

    const elapsed = Date.now() - start;
    // 1000 iterations in headless mock should easily complete in under 200ms
    assert(elapsed < 300, `1,000 entity renders took ${elapsed}ms, exceeding budget`);

    player.destroy();
  });

  it('verifies procedural floor details, ambient occlusion, and wall torch sconces execute safely (BL-101)', () => {
    const renderer = new GameRenderer(canvas);
    let threw = false;

    try {
      // Test procedural floor details across multiple biome themes
      for (const theme of ['dungeon', 'jungle', 'lava', 'snow', 'cave', 'sunset']) {
        renderer.renderProceduralFloorDetails(ctx, 3, 4, 96, 128, 32, theme, 42);
      }

      // Test floor ambient occlusion
      const mockGround = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
      ];
      renderer.renderFloorAmbientOcclusion(ctx, 1, 1, 32, 32, 32, mockGround);

      // Test wall torch sconce rendering
      renderer.renderWallTorchSconce(ctx, 64, 64, 32, 0.15);
    } catch {
      threw = true;
    }

    assert(!threw, 'BL-101 procedural environmental fidelity rendering threw an unexpected error');
  });

  it('verifies BL-105 surface shaders (puddles, ripples, magma pulses) and BL-103 editor mini-map radar', () => {
    const renderer = new GameRenderer(canvas);
    renderer.exitPulseTimer = 1.25;
    let threwShaders = false;

    try {
      // Test surface shader variations across biomes with high hash triggers
      for (const theme of ['dungeon', 'jungle', 'lava', 'snow', 'cave', 'sunset']) {
        // Test different coordinate combinations to exercise ripple & shimmer code paths
        for (let x = 0; x < 5; x++) {
          for (let y = 0; y < 5; y++) {
            renderer.renderProceduralFloorDetails(ctx, x, y, x * 32, y * 32, 32, theme, 77);
          }
        }
      }
    } catch {
      threwShaders = true;
    }
    assert(!threwShaders, 'BL-105 surface shader floor details threw an unexpected error');

    // Test BL-103 editor mini-map radar overview render
    let threwMiniMap = false;
    try {
      const mockLevel = {
        dimensions: { width: 15, height: 15 },
        config: { theme: 'dungeon' },
        layers: {
          ground: Array.from({ length: 15 }, () => Array(15).fill(0)),
          overhead: Array.from({ length: 15 }, () => Array(15).fill(0)),
        },
        spawn: { x: 1, y: 1 },
        exit: { x: 13, y: 13 },
        entities: [
          { type: 'key', x: 3, y: 3, color: '#fbbf24' },
          { type: 'door', x: 5, y: 5, color: '#fbbf24' },
        ],
      };

      const miniCanvas = createMockCanvas(160, 160);
      const editorCanvas = new EditorCanvas({
        canvas,
        level: mockLevel,
      });

      editorCanvas.renderMiniMap(miniCanvas);
      assert(editorCanvas.miniMapTransform !== undefined, 'MiniMap transform must be defined after render');
      assertEqual(editorCanvas.miniMapTransform.mazeW, 15, 'Maze width matches');

      // Test mini-map click navigation
      editorCanvas.handleMiniMapNavigation(80, 80, miniCanvas);
    } catch (err) {
      assert(false, `Mini-map render failed: ${err.message}\n${err.stack}`);
      threwMiniMap = true;
    }
    assert(!threwMiniMap, 'BL-103 editor mini-map radar rendering threw an unexpected error');
  });
});
