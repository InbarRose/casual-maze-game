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
import { compileLevelPackage, isLevelPackage } from './level-package-compiler.mjs';

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
  const packageDir = levelFilePath.replace(/\.json$/, '');

  let levelData;
  if (isLevelPackage(packageDir)) {
    levelData = compileLevelPackage(packageDir);
    fs.writeFileSync(levelFilePath, JSON.stringify(levelData, null, 2) + '\n', 'utf8');
  } else if (fs.existsSync(levelFilePath)) {
    levelData = JSON.parse(fs.readFileSync(levelFilePath, 'utf8'));
  } else {
    throw new Error(`Level file referenced in manifest does not exist: ${entry.file}`);
  }

  const { hash, size } = computeFileHashAndSize(levelFilePath);

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

// 3b. Campaign Chapters (Dynamic Detection)
const chapterNums = [...new Set(
  enrichedLevels
    .filter(m => m.category === 'campaign' && m.chapter?.startsWith('chapter_'))
    .map(m => parseInt(m.chapter.replace('chapter_', ''), 10))
)].sort((a, b) => a - b);

for (const ch of chapterNums) {
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

// 3c. Combined Aggregator default-levels.js (Dynamic Chapters + Storyline helpers)
const imports = chapterNums.map(ch => `import { CAMPAIGN_CH${ch}_LEVELS } from './campaign-ch${ch}.js';`).join('\n');
const spreads = chapterNums.map(ch => `  ...CAMPAIGN_CH${ch}_LEVELS,`).join('\n');

const aggregatorContent = `/**
 * Casual Maze Game - Default Embedded Levels Aggregator
 * Re-exports modular tutorial and chapter datasets with 100% backward compatibility.
 */

import { TUTORIAL_LEVELS } from './tutorials.js';
${imports}
import { getStoryline, getStoryChapter, getAllStoryLevels, STORYLINES } from '../stories/storylines.js';

export { TUTORIAL_LEVELS, getStoryline, getStoryChapter, getAllStoryLevels, STORYLINES };

export const CAMPAIGN_LEVELS = Object.freeze([
${spreads}
]);

export const ALL_LEVELS = Object.freeze([
  ...TUTORIAL_LEVELS,
  ...CAMPAIGN_LEVELS,
  ...getAllStoryLevels(),
]);
`;

fs.writeFileSync(path.join(rootDir, 'js/levels/default-levels.js'), aggregatorContent, 'utf-8');
console.log(`  ✓ Updated js/levels/default-levels.js aggregator with Chapters ${chapterNums[0]}-${chapterNums[chapterNums.length - 1]}`);

// 3d. Synchronize Sunken Vaults dataset (ADR-0044)
const sv1 = JSON.parse(fs.readFileSync(path.join(rootDir, 'levels/stories/story_sunken_vaults_1.json'), 'utf8'));
const sv2 = JSON.parse(fs.readFileSync(path.join(rootDir, 'levels/stories/story_sunken_vaults_2.json'), 'utf8'));
const sv3 = JSON.parse(fs.readFileSync(path.join(rootDir, 'levels/stories/story_sunken_vaults_3.json'), 'utf8'));

const svContent = `/**
 * Casual Maze Game — Sunken Vaults of the Deep Storyline Dataset (BL-130, ADR-0035, ADR-0044)
 */

export const SUNKEN_VAULTS_CHAPTER_1 = Object.freeze(${JSON.stringify(sv1, null, 2)});

export const SUNKEN_VAULTS_CHAPTER_2 = Object.freeze(${JSON.stringify(sv2, null, 2)});

export const SUNKEN_VAULTS_CHAPTER_3 = Object.freeze(${JSON.stringify(sv3, null, 2)});

export const SUNKEN_VAULTS_STORYLINE = Object.freeze({
  id: 'sunken_vaults_of_the_deep',
  title: 'The Sunken Vaults of the Deep',
  tagline: 'Brave the subterranean cisterns, hydraulic siphons, and abyssal waterworks.',
  description: 'Plunge into the flooded subterranean vaults beneath the Grand Aqueduct. Balance hydraulic siphons, evade thermal steam vents, and decipher the forgotten glyphs of the Deep Architects to recover the Primal Water Core.',
  badge: 'Aqueduct Saga • 3 Chapters',
  icon: '🌊',
  accentColor: '#0284c7',
  theme: 'aqueduct',
  difficulty: 'Advanced',
  totalChapters: 3,
  chapters: [SUNKEN_VAULTS_CHAPTER_1, SUNKEN_VAULTS_CHAPTER_2, SUNKEN_VAULTS_CHAPTER_3],
});
`;
fs.writeFileSync(path.join(rootDir, 'js/stories/sunken-vaults.js'), svContent, 'utf8');
console.log('  ✓ Updated js/stories/sunken-vaults.js dataset');

// 3e. Synchronize Storylines (Guardians & Citadel) (ADR-0044)
const g1 = JSON.parse(fs.readFileSync(path.join(rootDir, 'levels/stories/story_guardians_1.json'), 'utf8'));
const g2 = JSON.parse(fs.readFileSync(path.join(rootDir, 'levels/stories/story_guardians_2.json'), 'utf8'));
const g3 = JSON.parse(fs.readFileSync(path.join(rootDir, 'levels/stories/story_guardians_3.json'), 'utf8'));
const cit1 = JSON.parse(fs.readFileSync(path.join(rootDir, 'levels/stories/story_citadel_1.json'), 'utf8'));

const storylinesContent = `/**
 * Casual Maze Game — Storylines & Episodic Quests Registry
 *
 * Defines first-class narrative story campaigns alongside the mainline megalabyrinths.
 * Transforms tutorials into "The Novice's Initiation" and introduces thematic quests.
 */

import { TUTORIAL_LEVELS } from '../levels/tutorials.js';
import { TILES } from '../core/constants.js';
import { SUNKEN_VAULTS_STORYLINE } from './sunken-vaults.js';

// Story 1: The Novice's Initiation (Chapters 1 to 6)
const NOVICE_CHAPTER_PROLOGUES = [
  {
    chapter: 1,
    title: 'The Waking Hall',
    subtitle: 'Orientation & First Footing',
    prologue: 'The ancient oak doors seal behind you. The elder cartographers whisper: "Every grand journey begins with a single step. Trust your senses and seek the azure exit portal."',
    hint: 'Use WASD or Arrow keys to move through the stone hall to the glowing blue portal.',
  },
  {
    chapter: 2,
    title: 'The Prismatic Gates',
    subtitle: 'Color Resonance & Sealed Portals',
    prologue: 'Glimmering keystones radiate faint elemental auras in the damp corridors. Only keys forged in the same hue can break the resonance seals of locked sanctuary doors.',
    hint: 'Collect the colored keys to unlock matching barriers blocking your path.',
  },
  {
    chapter: 3,
    title: 'Clockwork Mechanisms',
    subtitle: 'Dynamic Architecture & Levers',
    prologue: 'Heavy bronze levers groan under centuries of silence. Throwing a lever engages subterranean clockwork, sliding solid stone walls into the earth.',
    hint: 'Step onto levers to dynamically lower walls and open alternative corridors.',
  },
  {
    chapter: 4,
    title: 'The Canopy Crossing',
    subtitle: 'Multi-Elevation Bridges & Ramps',
    prologue: 'Wooden ramps ascend into the soaring canopy. At elevation, you can cross high above ground pathways, defying the maze’s 2D constraints.',
    hint: 'Ascend directional ramps (▲) to cross overhead bridges over lower passages.',
  },
  {
    chapter: 5,
    title: 'The Shrouded Vaults',
    subtitle: 'Dynamic Fog of War & Spatial Memory',
    prologue: 'Deep subterranean darkness envelops the corridors. Keep your wits sharp and trace the labyrinth in your mind as shadows conceal what lies ahead.',
    hint: 'Navigate through dynamic line-of-sight fog. Use the walls you have seen to navigate.',
  },
  {
    chapter: 6,
    title: "The Guildmaster's Rite",
    subtitle: 'The Final Synthesis Trial',
    prologue: 'All lessons converge in the grand proving grounds. Combine key resonance, mechanical switches, and overhead bridges to claim the title of Journeyman Pathfinder.',
    hint: 'Synthesize all your skills to solve this master labyrinth and complete your initiation.',
  },
];

// Enrich tutorial levels into first-class Story chapters
const NOVICE_INITIATION_CHAPTERS = TUTORIAL_LEVELS.map((level, idx) => {
  const meta = NOVICE_CHAPTER_PROLOGUES[idx];
  return {
    ...level,
    storyId: 'novice_initiation',
    chapterNumber: meta.chapter,
    chapterTitle: meta.title,
    chapterSubtitle: meta.subtitle,
    prologueText: meta.prologue,
    help: {
      title: \`Chapter \${meta.chapter}: \${meta.title}\`,
      message: \`\${meta.prologue}\\n\\nObjective: \${meta.hint}\`,
    },
  };
});

// Story 2: Relics of the Four Guardians (3 Chapters)
const GUARDIANS_CHAPTER_1 = ${JSON.stringify(g1, null, 2)};
const GUARDIANS_CHAPTER_2 = ${JSON.stringify(g2, null, 2)};
const GUARDIANS_CHAPTER_3 = ${JSON.stringify(g3, null, 2)};

// Story 3: The Whispering Citadel (1 Chapter, Multi-Room)
const CITADEL_CHAPTER_1 = ${JSON.stringify(cit1, null, 2)};

export const STORYLINES = Object.freeze([
  {
    id: 'the_whispering_citadel',
    title: 'The Whispering Citadel',
    tagline: 'Delve into an interconnected three-tier labyrinth with rotating vantage points.',
    description: 'Explore the mysterious Citadel beneath the Monolith. Descend into damp catacombs to retrieve the Spire Key, navigate back to the Courtyard to unlock the grand stairwell, and ascend into the Whispering Spire.',
    badge: 'Dungeon Saga • Multi-Room',
    icon: '🏛️',
    accentColor: '#10b981',
    theme: 'temple',
    difficulty: 'Advanced',
    totalChapters: 1,
    chapters: [CITADEL_CHAPTER_1],
  },
  {
    id: 'novice_initiation',
    title: "The Novice's Initiation",
    tagline: 'Master the ancient art of labyrinth navigation and earn your pathfinder badge.',
    description: 'Follow the rite of passage designed by the ancient Guild of Cartographers. Progress through six structured chambers to learn line-of-sight, colored gates, dynamic levers, overhead canopy bridges, and the shrouded fog of war.',
    badge: 'Prologue • 6 Chapters',
    icon: '📜',
    accentColor: '#38bdf8',
    theme: 'dungeon',
    difficulty: 'Introductory',
    totalChapters: 6,
    chapters: NOVICE_INITIATION_CHAPTERS,
  },
  {
    id: 'relics_of_the_guardians',
    title: 'Relics of the Four Guardians',
    tagline: 'Recover the sacred animal totems and unlock the sealed sanctum.',
    description: 'Journey into the Sunken Sun Temple. Decipher wall inscriptions, collect sunstone crystals, activate respawn beacons, and place the four sacred guardian statues—Falcon, Lion, Serpent, and Bear—onto their matching riddle plinths.',
    badge: 'Riddle Quest • 3 Chapters',
    icon: '🦅',
    accentColor: '#fbbf24',
    theme: 'temple',
    difficulty: 'Intermediate',
    totalChapters: 3,
    chapters: [GUARDIANS_CHAPTER_1, GUARDIANS_CHAPTER_2, GUARDIANS_CHAPTER_3],
  },
  SUNKEN_VAULTS_STORYLINE,
]);

export function getStoryline(storyId) {
  if (!storyId) return null;
  return STORYLINES.find(s => s.id === storyId) || null;
}

export function getStoryChapter(storyId, chapterNumber) {
  const story = getStoryline(storyId);
  if (!story) return null;
  const num = parseInt(chapterNumber, 10);
  if (isNaN(num) || num < 1 || num > story.chapters.length) return null;
  return story.chapters[num - 1] || null;
}

export function getNextStoryChapter(storyId, currentChapterNumber) {
  const story = getStoryline(storyId);
  if (!story) {
    return { hasNext: false, isStoryComplete: false };
  }
  const curr = parseInt(currentChapterNumber, 10);
  if (curr < story.totalChapters) {
    return {
      hasNext: true,
      nextChapterNumber: curr + 1,
      nextChapter: story.chapters[curr],
      isStoryComplete: false,
    };
  }
  return {
    hasNext: false,
    isStoryComplete: true,
  };
}

export function getAllStoryLevels() {
  const all = [];
  for (const story of STORYLINES) {
    for (const chapter of story.chapters) {
      all.push(chapter);
    }
  }
  return all;
}
`;
fs.writeFileSync(path.join(rootDir, 'js/stories/storylines.js'), storylinesContent, 'utf8');
console.log('  ✓ Updated js/stories/storylines.js dataset');
console.log('\n✨ All manifests, hashes, and default level files successfully synchronized!');
