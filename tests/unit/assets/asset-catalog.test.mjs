/**
 * Unit Tests: Asset Catalog & SVG Pipeline
 */

import fs from 'fs';
import path from 'path';
import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { AssetLoader } from '../../../js/core/asset-loader.js';

describe('Assets > Manifest & SVG Vector Files Integrity', () => {
  const manifestPath = path.resolve(process.cwd(), 'assets/manifest.json');

  it('validates assets/manifest.json exists and contains registered assets', () => {
    assert(fs.existsSync(manifestPath), 'assets/manifest.json exists');
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);

    assert(Array.isArray(manifest.assets), 'manifest.assets is an array');
    assert(manifest.assets.length >= 100, `Contains at least 100 registered assets (found ${manifest.assets.length})`);
    assert(manifest.categories !== undefined, 'manifest contains category taxonomy');
    assert(Array.isArray(manifest.themes), 'manifest contains theme array');
    assertEqual(manifest.themes.length, 5, 'Contains 5 biome themes (dungeon, jungle, magma, temple, glacial)');
  });

  it('verifies every registered SVG asset file exists on disk and has valid viewBox', () => {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);

    for (const asset of manifest.assets) {
      const fullPath = path.resolve(process.cwd(), asset.path);
      assert(fs.existsSync(fullPath), `Asset file exists on disk: "${asset.path}"`);

      const content = fs.readFileSync(fullPath, 'utf8');
      assert(content.includes('<svg'), `Contains <svg> opening tag: "${asset.path}"`);
      assert(content.includes('</svg>'), `Contains </svg> closing tag: "${asset.path}"`);
      assert(content.includes('viewBox="0 0 64 64"'), `Specifies standard viewBox="0 0 64 64": "${asset.path}"`);
    }
  });

  it('tests complete tileset and variation coverage across all 5 themes', () => {
    const loader = new AssetLoader();
    loader.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const themes = ['dungeon', 'jungle', 'magma', 'temple', 'glacial'];
    for (const theme of themes) {
      // Floor & Wall
      assert(loader.getAssetInfo(`tile_floor_${theme}`) !== null, `Theme ${theme} has base floor`);
      assert(loader.getAssetInfo(`tile_floor_${theme}_cracked`) !== null, `Theme ${theme} has cracked floor`);
      assert(loader.getAssetInfo(`tile_floor_${theme}_runic`) !== null, `Theme ${theme} has runic floor`);
      assert(loader.getAssetInfo(`tile_wall_${theme}`) !== null, `Theme ${theme} has solid wall`);
      assert(loader.getAssetInfo(`tile_wall_${theme}_torch`) !== null, `Theme ${theme} has torch wall`);
      assert(loader.getAssetInfo(`tile_wall_${theme}_grate`) !== null, `Theme ${theme} has grate wall`);

      // Bridges
      assert(loader.getAssetInfo(`tile_bridge_${theme}_ew`) !== null, `Theme ${theme} has bridge EW`);
      assert(loader.getAssetInfo(`tile_bridge_${theme}_ns`) !== null, `Theme ${theme} has bridge NS`);

      // 4 Directional Ramps
      for (const dir of ['north', 'south', 'east', 'west']) {
        assert(loader.getAssetInfo(`tile_ramp_${theme}_${dir}`) !== null, `Theme ${theme} has ramp ${dir}`);
      }
    }
  });

  it('tests directional door facings and edge-wall passage assets', () => {
    const loader = new AssetLoader();
    loader.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Directional Doors
    for (const theme of ['dungeon', 'jungle', 'magma', 'temple', 'glacial']) {
      assert(loader.getAssetInfo(`door_${theme}_vertical`) !== null, `${theme} vertical door exists`);
      assert(loader.getAssetInfo(`door_${theme}_horizontal`) !== null, `${theme} horizontal door exists`);
    }

    // Edge Wall Inset Passages
    for (const dir of ['north', 'south', 'east', 'west']) {
      assert(loader.getAssetInfo(`spawn_edge_wall_${dir}`) !== null, `Spawn edge wall ${dir} exists`);
      assert(loader.getAssetInfo(`exit_edge_wall_${dir}`) !== null, `Exit edge wall ${dir} exists`);
    }
  });

  it('tests 4-way directional facings across all player classes', () => {
    const loader = new AssetLoader();
    loader.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const classes = ['adventurer', 'knight', 'mage', 'rogue'];
    const facings = ['north', 'south', 'east', 'west'];

    for (const cls of classes) {
      for (const f of facings) {
        const asset = loader.getAssetInfo(`player_${cls}_${f}`);
        assert(asset !== null, `Player ${cls} facing ${f} exists`);
        assertEqual(asset.type, 'player');
        assertEqual(asset.style, cls);
      }
    }
  });
});
