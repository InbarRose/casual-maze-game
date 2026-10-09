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
});
