import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isLevelPackage, compileLevelPackage } from '../../../scripts/level-package-compiler.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

describe('Levels > Modular Level Package Architecture (ADR-0037, BL-143)', () => {
  it('verifies all 40 campaign levels exist as self-contained directory packages', () => {
    let packageCount = 0;

    for (let ch = 1; ch <= 10; ch++) {
      const chDir = path.join(rootDir, 'levels', `chapter_${ch}`);
      assert(fs.existsSync(chDir), `Chapter directory exists: levels/chapter_${ch}`);

      for (let l = (ch - 1) * 4 + 1; l <= ch * 4; l++) {
        const pkgDir = path.join(chDir, `level_${l}`);
        assert(fs.existsSync(pkgDir), `Package directory exists for Level ${l}: ${pkgDir}`);
        assert(isLevelPackage(pkgDir), `isLevelPackage recognizes Level ${l}`);

        // 1. Verify manifest.json
        const manifestPath = path.join(pkgDir, 'manifest.json');
        assert(fs.existsSync(manifestPath), `Level ${l} has manifest.json`);
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        assertEqual(String(manifest.id), String(l), `Level ${l} manifest id matches`);
        assert(manifest.title, `Level ${l} has title: "${manifest.title}"`);
        assert(manifest.dimensions && manifest.dimensions.width >= 5 && manifest.dimensions.height >= 5, `Level ${l} dimensions valid`);
        assertEqual(manifest.version, 1, `Level ${l} has version 1`);

        // 2. Verify layers.json
        const layersPath = path.join(pkgDir, 'layers.json');
        assert(fs.existsSync(layersPath), `Level ${l} has layers.json`);
        const layers = JSON.parse(fs.readFileSync(layersPath, 'utf8'));
        assert(Array.isArray(layers.ground), `Level ${l} has ground layer array`);
        assertEqual(layers.ground.length, manifest.dimensions.height, `Level ${l} ground height matches dimensions`);
        assertEqual(layers.ground[0].length, manifest.dimensions.width, `Level ${l} ground width matches dimensions`);

        // 3. Verify entities.json
        const entitiesPath = path.join(pkgDir, 'entities.json');
        assert(fs.existsSync(entitiesPath), `Level ${l} has entities.json`);
        const entities = JSON.parse(fs.readFileSync(entitiesPath, 'utf8'));
        assert(Array.isArray(entities), `Level ${l} has entities array`);

        // 4. Verify README.md
        const readmePath = path.join(pkgDir, 'README.md');
        assert(fs.existsSync(readmePath), `Level ${l} has README.md`);
        const readme = fs.readFileSync(readmePath, 'utf8');
        assert(readme.includes(manifest.title), `Level ${l} README mentions title`);
        assert(readme.includes('Kishōtenketsu'), `Level ${l} README contains Kishōtenketsu breakdown`);

        packageCount++;
      }
    }

    assertEqual(packageCount, 40, 'All 40 campaign levels exist as modular packages');
  });

  it('compiles level directory packages into canonical objects matching bundled datasets', () => {
    for (const bundledLevel of CAMPAIGN_LEVELS) {
      const levelId = parseInt(bundledLevel.id, 10);
      if (isNaN(levelId) || levelId < 1 || levelId > 40) continue;

      const ch = Math.ceil(levelId / 4);
      const pkgDir = path.join(rootDir, 'levels', `chapter_${ch}`, `level_${levelId}`);

      const compiled = compileLevelPackage(pkgDir);
      assertEqual(compiled.id, bundledLevel.id, `Compiled ID matches bundled Level ${levelId}`);
      assertEqual(compiled.title, bundledLevel.title, `Compiled title matches bundled Level ${levelId}`);
      assertEqual(compiled.dimensions.width, bundledLevel.dimensions.width, `Compiled width matches Level ${levelId}`);
      assertEqual(compiled.dimensions.height, bundledLevel.dimensions.height, `Compiled height matches Level ${levelId}`);
      assertEqual(compiled.layers.ground.length, bundledLevel.layers.ground.length, `Ground layers length matches Level ${levelId}`);
      assertEqual(compiled.entities.length, bundledLevel.entities.length, `Entities count matches Level ${levelId}`);
    }
  });
});
