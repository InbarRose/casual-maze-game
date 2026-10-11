import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { MazeGenerator } from '../../../js/core/maze-generator.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';

describe('Editor > Procedural Maze Generator Integration (BL-50)', () => {
  it('generates solvable labyrinths across all presets', () => {
    const presets = [
      { name: 'Small', w: 11, h: 11, theme: 'dungeon', keys: 0 },
      { name: 'Medium', w: 17, h: 17, theme: 'glacial', keys: 1 },
      { name: 'Large', w: 25, h: 25, theme: 'magma', keys: 2 },
    ];

    for (const preset of presets) {
      const level = MazeGenerator.generate({
        width: preset.w,
        height: preset.h,
        theme: preset.theme,
        keyPairs: preset.keys,
        braid: 0.25,
      });

      assertEqual(level.dimensions.width, preset.w);
      assertEqual(level.dimensions.height, preset.h);
      assertEqual(level.config.theme, preset.theme);

      const val = LevelValidator.validate(level);
      assert(val.valid, `Preset ${preset.name} (${preset.w}x${preset.h}) must be valid`);
    }
  });

  it('guarantees key-door count matches requested configuration', () => {
    const level0 = MazeGenerator.generate({ width: 15, height: 15, keyPairs: 0 });
    const level1 = MazeGenerator.generate({ width: 17, height: 17, keyPairs: 1 });
    const level2 = MazeGenerator.generate({ width: 21, height: 21, keyPairs: 2 });

    const countPairs = (lvl) => {
      const doors = (lvl.entities || []).filter(e => e.type === 'door');
      const keys = (lvl.entities || []).filter(e => e.type === 'key');
      return { doors: doors.length, keys: keys.length };
    };

    const p0 = countPairs(level0);
    assertEqual(p0.doors, 0);
    assertEqual(p0.keys, 0);

    const p1 = countPairs(level1);
    assertEqual(p1.doors, 1);
    assertEqual(p1.keys, 1);

    const p2 = countPairs(level2);
    assertEqual(p2.doors, 2);
    assertEqual(p2.keys, 2);
  });
});
