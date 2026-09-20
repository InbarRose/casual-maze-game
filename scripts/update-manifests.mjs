/**
 * Casual Maze Game — Universal Manifest Synchronizer & Hasher
 * Updates assets/manifest.json with SHA-256 hashes and sizes for all 160 SVGs.
 * Updates levels/manifest.json with SHA-256 hashes, sizes, dimensions, and entity counts for all 42 levels.
 * Re-generates modular js/levels/ files and default-levels.js aggregator with 100% Chapter 8 support.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeNormalizedFileHashAndSize } from '../tests/helpers/crypto-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const computeFileHashAndSize = computeNormalizedFileHashAndSize;

// -------------------------------------------------------------
// 1. Synchronize assets/manifest.json
// -------------------------------------------------------------
console.log('[1/3] Synchronizing assets/manifest.json with SHA-256 hashes and file sizes...');
const assetManifestPath = path.join(rootDir, 'assets', 'manifest.json');
const rawAssetManifest = JSON.parse(fs.readFileSync(assetManifestPath, 'utf8'));

// Supplementary metadata for legacy unmanifested assets
const UNMANIFESTED_METADATA = {
  'assets/entities/doors/door_classic.svg': {
    id: 'door_classic',
    name: 'Classic Reinforced Door',
    type: 'door',
    category: 'doors',
    style: 'classic',
    viewBox: '0 0 64 64',
    description: 'Heavy reinforced dungeon door with golden keyhole escutcheon',
    tags: ['door', 'classic', 'barrier', 'entry'],
  },
  'assets/entities/doors/door_portcullis.svg': {
    id: 'door_portcullis',
    name: 'Iron Portcullis Grate',
    type: 'door',
    category: 'doors',
    style: 'iron',
    viewBox: '0 0 64 64',
    description: 'Spiked iron portcullis barrier with heavy crossbars',
    tags: ['door', 'portcullis', 'iron', 'gate'],
  },
  'assets/player/player_compass.svg': {
    id: 'player_compass',
    name: 'Player Compass Rose Overlay',
    type: 'player',
    category: 'player',
    style: 'compass',
    viewBox: '0 0 64 64',
    description: 'Directional orientation indicator for player positioning',
    tags: ['player', 'compass', 'hud', 'direction'],
  },
  'assets/player/player_ground.svg': {
    id: 'player_ground',
    name: 'Player Avatar (Ground Level)',
    type: 'player',
    category: 'player',
    style: 'ground',
    viewBox: '0 0 64 64',
    description: 'Ground-level explorer silhouette and elevation indicator',
    tags: ['player', 'ground', 'avatar', 'elevation_0'],
  },
  'assets/player/player_overhead.svg': {
    id: 'player_overhead',
    name: 'Player Avatar (Overhead Bridge Level)',
    type: 'player',
    category: 'player',
    style: 'overhead',
    viewBox: '0 0 64 64',
    description: 'Overhead elevation explorer silhouette and bridge traversal indicator',
    tags: ['player', 'overhead', 'avatar', 'elevation_1'],
  },
  'assets/tiles/bridges/bridge_ew.svg': {
    id: 'tile_bridge_generic_ew',
    name: 'Generic Overpass Bridge (East-West)',
    type: 'tile',
    category: 'bridges',
    style: 'generic',
    viewBox: '0 0 64 64',
    description: 'Universal bridge overpass spanning North-South with East-West ground tunnel',
    tags: ['tile', 'bridge', 'b_ew', 'overpass'],
  },
  'assets/tiles/bridges/bridge_ns.svg': {
    id: 'tile_bridge_generic_ns',
    name: 'Generic Overpass Bridge (North-South)',
    type: 'tile',
    category: 'bridges',
    style: 'generic',
    viewBox: '0 0 64 64',
    description: 'Universal bridge overpass spanning East-West with North-South ground tunnel',
    tags: ['tile', 'bridge', 'b_ns', 'overpass'],
  },
  'assets/tiles/ground/floor.svg': {
    id: 'tile_floor_generic',
    name: 'Generic Walkable Floor',
    type: 'tile',
    category: 'ground',
    style: 'generic',
    viewBox: '0 0 64 64',
    description: 'Clean stone tile floor for generic labyrinth corridors',
    tags: ['tile', 'floor', 'walkable', 'ground'],
  },
  'assets/tiles/ground/wall_overgrowth.svg': {
    id: 'tile_wall_overgrowth',
    name: 'Overgrown Foliage Wall',
    type: 'tile',
    category: 'variations',
    style: 'jungle',
    viewBox: '0 0 64 64',
    description: 'Stone wall overrun by creeping vines, moss, and tangled roots',
    tags: ['tile', 'wall', 'jungle', 'overgrowth'],
  },
  'assets/tiles/ramps/ramp_east.svg': {
    id: 'tile_ramp_generic_east',
    name: 'Generic Inclined Ramp (East)',
    type: 'tile',
    category: 'ramps',
    style: 'generic',
    viewBox: '0 0 64 64',
    description: 'Universal directional ramp ascending East from Ground to Overhead',
    tags: ['tile', 'ramp', 'ramp_e', 'east'],
  },
  'assets/tiles/ramps/ramp_north.svg': {
    id: 'tile_ramp_generic_north',
    name: 'Generic Inclined Ramp (North)',
    type: 'tile',
    category: 'ramps',
    style: 'generic',
    viewBox: '0 0 64 64',
    description: 'Universal directional ramp ascending North from Ground to Overhead',
    tags: ['tile', 'ramp', 'ramp_n', 'north'],
  },
  'assets/tiles/ramps/ramp_south.svg': {
    id: 'tile_ramp_generic_south',
    name: 'Generic Inclined Ramp (South)',
    type: 'tile',
    category: 'ramps',
    style: 'generic',
    viewBox: '0 0 64 64',
    description: 'Universal directional ramp ascending South from Ground to Overhead',
    tags: ['tile', 'ramp', 'ramp_s', 'south'],
  },
  'assets/tiles/ramps/ramp_west.svg': {
    id: 'tile_ramp_generic_west',
    name: 'Generic Inclined Ramp (West)',
    type: 'tile',
    category: 'ramps',
    style: 'generic',
    viewBox: '0 0 64 64',
    description: 'Universal directional ramp ascending West from Ground to Overhead',
    tags: ['tile', 'ramp', 'ramp_w', 'west'],
  },
};

// Scan disk for all SVGs in assets
function scanSvgFiles(dir) {
  let list = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      list.push(...scanSvgFiles(full));
    } else if (item.name.endsWith('.svg')) {
      const rel = path.relative(rootDir, full).replace(/\\/g, '/');
      list.push(rel);
    }
  }
  return list;
}

const allDiskSvgs = scanSvgFiles(path.join(rootDir, 'assets'));
const assetMapByPath = new Map();
for (const a of rawAssetManifest.assets) {
  assetMapByPath.set(a.path.replace(/\\/g, '/'), a);
}

// Add unmanifested files
for (const [p, meta] of Object.entries(UNMANIFESTED_METADATA)) {
  if (!assetMapByPath.has(p)) {
    assetMapByPath.set(p, {
      id: meta.id,
      name: meta.name,
      type: meta.type,
      category: meta.category,
      style: meta.style,
      path: p,
      viewBox: meta.viewBox,
      description: meta.description,
      tags: meta.tags,
    });
  }
}

// Enrich each asset with hash, size, and ensure viewBox
const enrichedAssets = [];
for (const diskPath of allDiskSvgs) {
  let asset = assetMapByPath.get(diskPath);
  if (!asset) {
    // Auto-generate basic metadata if a brand new SVG was added
    const basename = path.basename(diskPath, '.svg');
    asset = {
      id: basename,
      name: basename.replace(/_/g, ' '),
      type: diskPath.includes('/tiles/') ? 'tile' : (diskPath.includes('/entities/') ? 'entity' : 'misc'),
      category: path.basename(path.dirname(diskPath)),
      path: diskPath,
      viewBox: '0 0 64 64',
      description: `Asset for ${basename}`,
      tags: [basename],
    };
  }

  const { hash, size } = computeFileHashAndSize(path.join(rootDir, diskPath));
  asset.hash = hash;
  asset.size = size;
  asset.path = diskPath; // Normalize forward slashes
  enrichedAssets.push(asset);
}

enrichedAssets.sort((a, b) => a.id.localeCompare(b.id));

const updatedAssetManifest = {
  $schema: './schema.json',
  version: '1.5.0',
  generatedAt: new Date().toISOString(),
  totalAssets: enrichedAssets.length,
  themes: rawAssetManifest.themes || ['dungeon', 'jungle', 'magma', 'temple', 'glacial'],
  playerClasses: rawAssetManifest.playerClasses || ['explorer', 'adventurer', 'knight', 'mage', 'rogue'],
  facings: rawAssetManifest.facings || ['north', 'south', 'east', 'west'],
  categories: rawAssetManifest.categories,
  assets: enrichedAssets,
};

fs.writeFileSync(assetManifestPath, JSON.stringify(updatedAssetManifest, null, 2) + '\n', 'utf8');
console.log(`  ✓ Updated assets/manifest.json (${enrichedAssets.length} assets with SHA-256 hashes)`);

// -------------------------------------------------------------
// 2. Synchronize levels/manifest.json
// -------------------------------------------------------------
console.log('\n[2/3] Synchronizing levels/manifest.json with SHA-256 hashes, sizes & dimensions...');
const levelManifestPath = path.join(rootDir, 'levels', 'manifest.json');
const rawLevelManifest = JSON.parse(fs.readFileSync(levelManifestPath, 'utf8'));

const enrichedLevels = [];
for (const entry of rawLevelManifest) {
  const levelFilePath = path.join(rootDir, entry.file);
  if (!fs.existsSync(levelFilePath)) {
    throw new Error(`Level file referenced in manifest does not exist: ${entry.file}`);
  }

  const { hash, size } = computeFileHashAndSize(levelFilePath);
  const levelData = JSON.parse(fs.readFileSync(levelFilePath, 'utf8'));

  const dimensions = levelData.dimensions || { width: 0, height: 0 };
  const entityCount = Array.isArray(levelData.entities) ? levelData.entities.length : 0;
  const hasMultiRoom = Boolean(levelData.rooms && Object.keys(levelData.rooms).length > 0);
  const exits = Array.isArray(levelData.exits) ? levelData.exits : (levelData.exit ? [levelData.exit] : []);

  enrichedLevels.push({
    ...entry,
    file: entry.file.replace(/\\/g, '/'),
    version: levelData.version ?? 1,
    hash,
    size,
    dimensions: {
      width: dimensions.width,
      height: dimensions.height,
    },
    entityCount,
    hasMultiRoom,
    exitCount: exits.length,
  });
}

fs.writeFileSync(levelManifestPath, JSON.stringify(enrichedLevels, null, 2) + '\n', 'utf8');
console.log(`  ✓ Updated levels/manifest.json (${enrichedLevels.length} levels with SHA-256 hashes and dimensions)`);

// -------------------------------------------------------------
// 3. Synchronize default-levels.js Aggregator & Chapters
// -------------------------------------------------------------
console.log('\n[3/3] Synchronizing default-levels.js and modular chapter datasets...');

// 3a. Tutorials
const tutorialFiles = enrichedLevels.filter(m => m.category === 'tutorial').map(m => m.file);
const tutorials = tutorialFiles.map(f => JSON.parse(fs.readFileSync(path.join(rootDir, f), 'utf-8')));
const tutorialContent = `/**
 * Casual Maze Game - Tutorial Levels
 */

export const TUTORIAL_LEVELS = Object.freeze(${JSON.stringify(tutorials, null, 2)});
`;
fs.writeFileSync(path.join(rootDir, 'js/levels/tutorials.js'), tutorialContent, 'utf-8');

// 3b. Campaign Chapters 1 through 8
for (let ch = 1; ch <= 8; ch++) {
  const chapterKey = `chapter_${ch}`;
  const chapterFiles = enrichedLevels
    .filter(m => m.category === 'campaign' && m.chapter === chapterKey)
    .map(m => m.file);
  const chapterLevels = chapterFiles.map(f => JSON.parse(fs.readFileSync(path.join(rootDir, f), 'utf-8')));

  const chapterContent = `/**
 * Casual Maze Game - Campaign Chapter ${ch} Levels
 */

export const CAMPAIGN_CH${ch}_LEVELS = Object.freeze(${JSON.stringify(chapterLevels, null, 2)});
`;
  fs.writeFileSync(path.join(rootDir, `js/levels/campaign-ch${ch}.js`), chapterContent, 'utf-8');
}

// 3c. Combined Aggregator default-levels.js (Chapters 1 to 8 + Storyline helpers)
const aggregatorContent = `/**
 * Casual Maze Game - Default Embedded Levels Aggregator
 * Re-exports modular tutorial and chapter datasets with 100% backward compatibility.
 */

import { TUTORIAL_LEVELS } from './tutorials.js';
import { CAMPAIGN_CH1_LEVELS } from './campaign-ch1.js';
import { CAMPAIGN_CH2_LEVELS } from './campaign-ch2.js';
import { CAMPAIGN_CH3_LEVELS } from './campaign-ch3.js';
import { CAMPAIGN_CH4_LEVELS } from './campaign-ch4.js';
import { CAMPAIGN_CH5_LEVELS } from './campaign-ch5.js';
import { CAMPAIGN_CH6_LEVELS } from './campaign-ch6.js';
import { CAMPAIGN_CH7_LEVELS } from './campaign-ch7.js';
import { CAMPAIGN_CH8_LEVELS } from './campaign-ch8.js';
import { getStoryline, getStoryChapter, getAllStoryLevels, STORYLINES } from '../stories/storylines.js';

export { TUTORIAL_LEVELS, getStoryline, getStoryChapter, getAllStoryLevels, STORYLINES };

export const CAMPAIGN_LEVELS = Object.freeze([
  ...CAMPAIGN_CH1_LEVELS,
  ...CAMPAIGN_CH2_LEVELS,
  ...CAMPAIGN_CH3_LEVELS,
  ...CAMPAIGN_CH4_LEVELS,
  ...CAMPAIGN_CH5_LEVELS,
  ...CAMPAIGN_CH6_LEVELS,
  ...CAMPAIGN_CH7_LEVELS,
  ...CAMPAIGN_CH8_LEVELS,
]);

export const ALL_LEVELS = Object.freeze([
  ...TUTORIAL_LEVELS,
  ...CAMPAIGN_LEVELS,
  ...getAllStoryLevels(),
]);
`;

fs.writeFileSync(path.join(rootDir, 'js/levels/default-levels.js'), aggregatorContent, 'utf-8');
console.log('  ✓ Updated js/levels/default-levels.js aggregator with Chapters 1-8');
console.log('\n✨ All manifests, hashes, and default level files successfully synchronized!');
