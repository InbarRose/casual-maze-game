/**
 * Unit Tests: Asset Manifest Drift & Cryptographic Integrity
 */

import fs from 'fs';
import path from 'path';
import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { ASSET_MANIFEST_VERSION } from '../../../js/core/version.js';
import { computeNormalizedFileHashAndSize, computeNormalizedHashAndSize } from '../../helpers/crypto-utils.mjs';

describe('Assets > Cryptographic Integrity & Drift Prevention', () => {
  const rootDir = process.cwd();
  const manifestPath = path.resolve(rootDir, 'assets/manifest.json');
  const schemaPath = path.resolve(rootDir, 'assets/schema.json');

  it('validates assets/schema.json exists and defines required manifest properties', () => {
    assert(fs.existsSync(schemaPath), 'assets/schema.json exists');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    assert(schema.required.includes('version'), 'Schema requires version');
    assert(schema.required.includes('totalAssets'), 'Schema requires totalAssets');
    assert(schema.required.includes('assets'), 'Schema requires assets');
  });

  it('validates assets/manifest.json metadata and version alignment', () => {
    assert(fs.existsSync(manifestPath), 'assets/manifest.json exists');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assertEqual(manifest.version, ASSET_MANIFEST_VERSION, 'Manifest version matches ASSET_MANIFEST_VERSION');
    assertEqual(manifest.totalAssets, 160, 'Manifest tracks exactly 160 total assets');
    assertEqual(manifest.assets.length, 160, 'Assets array contains exactly 160 entries');
    assert(manifest.generatedAt, 'Manifest has generatedAt timestamp');
  });

  it('verifies zero unmanifested SVG files exist on disk in assets/', () => {
    function scanSvgs(dir) {
      let list = [];
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          list.push(...scanSvgs(full));
        } else if (item.name.endsWith('.svg')) {
          list.push(path.relative(rootDir, full).replace(/\\/g, '/'));
        }
      }
      return list;
    }

    const diskSvgs = scanSvgs(path.resolve(rootDir, 'assets'));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const manifestPaths = new Set(manifest.assets.map(a => a.path.replace(/\\/g, '/')));

    const unmanifested = diskSvgs.filter(p => !manifestPaths.has(p));
    assertEqual(unmanifested.length, 0, `All SVG files on disk are registered in manifest. Found: ${unmanifested.join(', ')}`);
  });

  it('verifies 100% of registered assets match SHA-256 hashes and file sizes', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    for (const asset of manifest.assets) {
      const fullPath = path.resolve(rootDir, asset.path);
      assert(fs.existsSync(fullPath), `Asset file exists: ${asset.path}`);

      const { hash, size } = computeNormalizedFileHashAndSize(fullPath);

      assertEqual(hash, asset.hash, `SHA-256 hash matches for "${asset.id}" (${asset.path})`);
      assertEqual(size, asset.size, `File size matches for "${asset.id}" (${asset.path})`);
    }
  });

  it('proves that tampering with asset content causes hash mismatch detection', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const sampleAsset = manifest.assets[0];

    const fakeContent = '<svg xmlns="http://www.w3.org/2000/svg">tampered</svg>';
    const { hash: fakeHash } = computeNormalizedHashAndSize(fakeContent);

    assert(fakeHash !== sampleAsset.hash, 'Tampered content produces different SHA-256 hash');
  });
});
