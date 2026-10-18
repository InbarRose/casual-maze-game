/**
 * Unit Test Suite: Biome Surface Shaders & Environmental Props (BL-127, ADR-0035)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { BiomeSurfaceShaders } from '../../../js/engine/biome-surface-shaders.js';
import { THEMES, getBiomeFamily, BIOME_FAMILIES } from '../../../js/core/constants.js';

function createMockContext() {
  const calls = [];
  return {
    calls,
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    beginPath: () => calls.push('beginPath'),
    closePath: () => calls.push('closePath'),
    fill: () => calls.push('fill'),
    stroke: () => calls.push('stroke'),
    fillRect: (x, y, w, h) => calls.push(['fillRect', x, y, w, h]),
    strokeRect: (x, y, w, h) => calls.push(['strokeRect', x, y, w, h]),
    arc: (x, y, r, sa, ea) => calls.push(['arc', x, y, r, sa, ea]),
    ellipse: (x, y, rx, ry, rot, sa, ea) => calls.push(['ellipse', x, y, rx, ry, rot, sa, ea]),
    moveTo: (x, y) => calls.push(['moveTo', x, y]),
    lineTo: (x, y) => calls.push(['lineTo', x, y]),
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
  };
}

describe('Engine Suite > Biome Surface Shaders & Environmental Props', () => {
  it('computes deterministic, normalized decor hashes', () => {
    const h1 = BiomeSurfaceShaders.getDecorHash(3, 7, 42);
    const h2 = BiomeSurfaceShaders.getDecorHash(3, 7, 42);
    const h3 = BiomeSurfaceShaders.getDecorHash(4, 7, 42);

    assertEqual(h1, h2, 'Hash is deterministic');
    assert(h1 >= 0 && h1 < 1, 'Hash within [0, 1)');
    assert(h1 !== h3, 'Spatial variation across coordinates');
  });

  it('verifies aqueduct and prismatic themes and family resolution', () => {
    assert(THEMES.aqueduct !== undefined, 'aqueduct theme registered');
    assertEqual(THEMES.aqueduct.id, 'aqueduct');
    assert(THEMES.aqueduct.bg.startsWith('#'), 'aqueduct has background');

    assert(THEMES.prismatic !== undefined, 'prismatic theme registered');
    assertEqual(THEMES.prismatic.id, 'prismatic');
    assert(THEMES.prismatic.bg.startsWith('#'), 'prismatic has background');

    assertEqual(getBiomeFamily('aqueduct'), 'aqueduct');
    assertEqual(getBiomeFamily('water'), 'aqueduct');
    assertEqual(getBiomeFamily('sunken'), 'aqueduct');
    assertEqual(getBiomeFamily('prismatic'), 'prismatic');
    assertEqual(getBiomeFamily('crystal'), 'prismatic');
  });

  it('renders floor surface details across all supported biomes without error', () => {
    const biomes = ['dungeon', 'jungle', 'lava', 'snow', 'cave', 'sunset', 'temple', 'aqueduct', 'prismatic'];
    const ctx = createMockContext();

    for (const biome of biomes) {
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          BiomeSurfaceShaders.renderFloorDetails(ctx, x, y, x * 32, y * 32, 32, biome, 42, 1.5);
        }
      }
    }
    assert(ctx.calls.length > 0, 'Floor detail draw operations executed');
  });

  it('renders perimeter wall decor props across biomes', () => {
    const ctx = createMockContext();
    const ground = [
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0],
    ];

    const biomes = ['dungeon', 'temple', 'aqueduct', 'prismatic'];
    for (const biome of biomes) {
      for (let x = 0; x < 10; x++) {
        BiomeSurfaceShaders.renderPerimeterDecorTile(ctx, x, 1, x * 32, 32, 32, biome, 42 + x, ground, 2.0);
      }
    }
    assert(ctx.calls.length > 0, 'Perimeter decor draw operations executed');
  });
});
