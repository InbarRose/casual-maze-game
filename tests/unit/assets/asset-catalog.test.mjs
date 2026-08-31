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
    assert(manifest.assets.length >= 30, `Contains at least 30 registered assets (found ${manifest.assets.length})`);
    assert(manifest.categories !== undefined, 'manifest contains category taxonomy');
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

  it('tests AssetLoader discovery and metadata lookup queries', () => {
    const loader = new AssetLoader();
    loader.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const classicKey = loader.getAssetInfo('key_classic');
    assert(classicKey !== null, 'Found key_classic');
    assertEqual(classicKey.type, 'entity');
    assertEqual(classicKey.category, 'keys');
    assertEqual(classicKey.style, 'classic');

    const tiles = loader.findAssets({ type: 'tile' });
    assert(tiles.length >= 8, 'Discovered tile assets');

    const bridges = loader.findAssets({ category: 'bridges' });
    assertEqual(bridges.length, 2, 'Found 2 bridge assets (bridge_ew and bridge_ns)');

    const exits = loader.findAssets({ category: 'exit' });
    assert(exits.length >= 5, 'Found exit portal style assets');
  });
});
