import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { MazeGenerator, BIOMES } from '../../../js/core/maze-generator.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';
import { TILES, ENTITY_TYPES } from '../../../js/core/constants.js';

describe('Core > Procedural Maze Generator (BL-50)', () => {
  it('generates schema-compliant level objects with clamped odd dimensions', () => {
    // Generate even dimension 12x14 -> should clamp to 13x15
    const level = MazeGenerator.generate({ width: 12, height: 14, theme: 'jungle', keyPairs: 0 });

    assertEqual(level.dimensions.width, 13);
    assertEqual(level.dimensions.height, 15);
    assertEqual(level.config.theme, 'jungle');
    assert(level.layers.ground.length === 15, 'Ground height matches');
    assert(level.layers.ground[0].length === 13, 'Ground width matches');

    // Spawn and exit must be within bounds and on open floor
    assert(level.spawn.x >= 1 && level.spawn.x < 13);
    assert(level.spawn.y >= 1 && level.spawn.y < 15);
    assertEqual(level.layers.ground[level.spawn.y][level.spawn.x], TILES.FLOOR);

    assert(level.exit.x >= 1 && level.exit.x < 13);
    assert(level.exit.y >= 1 && level.exit.y < 15);
    assertEqual(level.layers.ground[level.exit.y][level.exit.x], TILES.FLOOR);

    // Validation check
    const validation = LevelValidator.validate(level);
    assert(validation.valid, 'Generated level passes LevelValidator without errors');
  });

  it('guarantees 100% solvability via BFS pathfinding', () => {
    // Test multiple random seeds / configurations
    for (const theme of BIOMES) {
      const level = MazeGenerator.generate({
        width: 15,
        height: 15,
        theme,
        braid: 0.2,
        keyPairs: 0,
      });

      const solution = solveLevel(level);
      assert(solution !== null, `Procedural ${theme} maze must have a valid path from spawn to exit`);
      assert(solution.length >= 2, 'Solution path connects spawn to exit');
    }
  });

  it('generates valid key and locked door puzzle gating', () => {
    const level = MazeGenerator.generate({
      width: 17,
      height: 17,
      theme: 'temple',
      braid: 0.1,
      keyPairs: 1,
    });

    const doors = level.entities.filter(e => e.type === ENTITY_TYPES.DOOR);
    const keys = level.entities.filter(e => e.type === ENTITY_TYPES.KEY);

    assertEqual(doors.length, 1);
    assertEqual(keys.length, 1);
    assertEqual(doors[0].keyId, keys[0].id);
    assertEqual(doors[0].color, keys[0].color);

    // Level must still be solvable by collecting the key
    const solution = solveLevel(level);
    assert(solution !== null, 'Level with key-door pair is solvable');
  });

  it('applies loopiness / braid factor to reduce dead-ends', () => {
    // Generate purely tree maze (braid = 0) vs braided maze (braid = 0.5)
    // Deterministic pseudo-random seed generator
    let seed = 42;
    const prng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const countDeadEnds = (ground, w, h) => {
      let count = 0;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          if (ground[y][x] !== TILES.FLOOR) continue;
          let open = 0;
          if (ground[y - 1][x] === TILES.FLOOR) open++;
          if (ground[y + 1][x] === TILES.FLOOR) open++;
          if (ground[y][x - 1] === TILES.FLOOR) open++;
          if (ground[y][x + 1] === TILES.FLOOR) open++;
          if (open === 1) count++;
        }
      }
      return count;
    };

    const treeLevel = MazeGenerator.generate({ width: 19, height: 19, braid: 0.0, keyPairs: 0, prng });
    const braidedLevel = MazeGenerator.generate({ width: 19, height: 19, braid: 0.8, keyPairs: 0, prng });

    const deadEndsTree = countDeadEnds(treeLevel.layers.ground, 19, 19);
    const deadEndsBraided = countDeadEnds(braidedLevel.layers.ground, 19, 19);

    assert(deadEndsBraided < deadEndsTree, `Braided maze (${deadEndsBraided}) must have fewer dead ends than pure tree (${deadEndsTree})`);
  });
});
