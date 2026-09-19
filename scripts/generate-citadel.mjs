import fs from 'fs';
import path from 'path';
import { TILES, ELEVATION, ENTITY_TYPES } from '../js/core/constants.js';
import { LevelValidator } from '../js/editor/level-validator.js';

function createGrid(w, h, fill = 0) {
  const g = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
        row.push(1);
      } else {
        row.push(fill);
      }
    }
    g.push(row);
  }
  return g;
}

// ----------------------------------------------------
// Room 1: The Grand Courtyard (13x13)
// ----------------------------------------------------
const rCourtyardGround = createGrid(13, 13, 0);
// Dividing garden wall with gateway at (6, 5)
for (let x = 2; x <= 10; x++) {
  if (x !== 6) {
    rCourtyardGround[5][x] = 1;
  }
}
// Chokepoint guarding spire stairs at (11, 11)
rCourtyardGround[10][11] = 0; // Door tile
rCourtyardGround[11][10] = 1; // Wall to west of stairs

const courtyardRoom = {
  id: 'courtyard',
  title: 'Grand Courtyard',
  theme: 'temple',
  dimensions: { width: 13, height: 13 },
  spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
  exits: [
    {
      id: 'exit_courtyard_to_catacombs',
      x: 1,
      y: 11,
      elevation: 0,
      style: 'stairs',
      label: 'Descend into Catacombs',
      targetRoom: 'catacombs',
      targetSpawn: { x: 1, y: 1, elevation: 0 },
    },
    {
      id: 'exit_courtyard_to_spire',
      x: 11,
      y: 11,
      elevation: 0,
      style: 'stairs',
      label: 'Ascend to High Spire',
      targetRoom: 'high_spire',
      targetSpawn: { x: 1, y: 1, elevation: 0 },
    },
  ],
  layers: {
    ground: rCourtyardGround,
    overhead: createGrid(13, 13, 0),
  },
  entities: [
    {
      id: 'signpost_courtyard_guide',
      type: 'signpost',
      title: 'Courtyard Inscription',
      message: 'The High Spire awaits above, but its portal is sealed. Descend into the subterranean Catacombs to recover the Spire Key.',
      x: 2,
      y: 1,
      elevation: 0,
    },
    {
      id: 'door_spire_gate',
      type: 'door',
      color: '#06b6d4',
      name: 'Spire Barrier Gate',
      requiresKey: 'key_citadel_spire',
      x: 11,
      y: 10,
      elevation: 0,
    },
    {
      id: 'decor_courtyard_statue',
      type: 'wall_decor',
      decorType: 'carving',
      title: 'Shrine of the Winds',
      text: 'Four winds echo through the citadel. Turn your perspective to catch their secrets.',
      author: 'Ancient Cartographer',
      x: 6,
      y: 1,
      facing: 'south',
      elevation: 0,
    },
    {
      id: 'gem_courtyard_topaz',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Courtyard Topaz',
      scoreValue: 150,
      color: '#fbbf24',
      x: 11,
      y: 1,
      elevation: 0,
    },
  ],
};

// ----------------------------------------------------
// Room 2: The Sunken Catacombs (13x13)
// ----------------------------------------------------
const rCatacombsGround = createGrid(13, 13, 0);
// Crypt maze walls
for (let y = 2; y <= 10; y += 2) {
  for (let x = 2; x <= 10; x++) {
    if ((y === 2 && x === 10) || (y === 4 && x === 2) || (y === 6 && x === 10) || (y === 8 && x === 2) || (y === 10 && x === 10)) {
      continue;
    }
    rCatacombsGround[y][x] = 1;
  }
}

const catacombsRoom = {
  id: 'catacombs',
  title: 'Sunken Catacombs',
  theme: 'dungeon',
  dimensions: { width: 13, height: 13 },
  spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
  exits: [
    {
      id: 'exit_catacombs_to_courtyard',
      x: 1,
      y: 1,
      elevation: 0,
      style: 'stairs',
      label: 'Return to Courtyard',
      targetRoom: 'courtyard',
      targetSpawn: { x: 1, y: 10, elevation: 0 },
    },
  ],
  layers: {
    ground: rCatacombsGround,
    overhead: createGrid(13, 13, 0),
  },
  entities: [
    {
      id: 'key_citadel_spire',
      type: 'key',
      color: '#06b6d4',
      name: 'Spire Keystone',
      x: 11,
      y: 11,
      elevation: 0,
    },
    {
      id: 'hazard_catacomb_fire',
      type: 'hazard',
      hazardType: 'fire',
      cyclePeriod: 3000,
      offsetRatio: 0,
      x: 6,
      y: 5,
      elevation: 0,
    },
    {
      id: 'wall_decor_catacomb_carving',
      type: 'wall_decor',
      decorType: 'carving',
      title: 'Catacomb Epitaph',
      text: 'Here lie the guardians who sealed the high spire away from the reaching fog.',
      author: 'Unknown Cryptkeeper',
      x: 4,
      y: 1,
      facing: 'south',
      elevation: 0,
    },
    {
      id: 'gem_crypt_amethyst',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Catacomb Amethyst',
      scoreValue: 250,
      color: '#a855f7',
      x: 11,
      y: 1,
      elevation: 0,
    },
  ],
};

// ----------------------------------------------------
// Room 3: The Whispering Spire (13x13)
// ----------------------------------------------------
const rSpireGround = createGrid(13, 13, 0);
const rSpireOverhead = createGrid(13, 13, 0);

// Spire bridge spanning across central chasm
for (let x = 4; x <= 8; x++) {
  rSpireOverhead[6][x] = TILES.BRIDGE_NS;
}
rSpireGround[6][3] = TILES.RAMP_E; // Climb up east
rSpireGround[6][9] = TILES.RAMP_W; // Climb up west

const spireRoom = {
  id: 'high_spire',
  title: 'Whispering Spire',
  theme: 'snow',
  dimensions: { width: 13, height: 13 },
  spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
  exits: [
    {
      id: 'exit_spire_to_courtyard',
      x: 1,
      y: 1,
      elevation: 0,
      style: 'stairs',
      label: 'Descend to Courtyard',
      targetRoom: 'courtyard',
      targetSpawn: { x: 11, y: 9, elevation: 0 },
    },
    {
      id: 'exit_spire_citadel_victory',
      x: 11,
      y: 11,
      elevation: 0,
      style: 'portal',
      label: 'Apex Altar of the Monolith',
    },
    {
      id: 'exit_spire_secret_monolith',
      x: 11,
      y: 1,
      elevation: 0,
      style: 'portal',
      label: 'Secret Monolith Tunnel',
      targetLevel: '29',
    },
  ],
  layers: {
    ground: rSpireGround,
    overhead: rSpireOverhead,
  },
  entities: [
    {
      id: 'checkpoint_spire_altar',
      type: 'checkpoint',
      style: 'shrine',
      name: 'Spire Apex Waypoint',
      x: 6,
      y: 6,
      elevation: 1,
      color: '#38bdf8',
    },
    {
      id: 'gem_spire_sapphire',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Star of the Monolith',
      scoreValue: 500,
      color: '#38bdf8',
      x: 6,
      y: 11,
      elevation: 0,
    },
    {
      id: 'wall_decor_spire_revelation',
      type: 'wall_decor',
      decorType: 'carving',
      title: 'Apex Revelation',
      text: 'From the heights of the spire, the entire world bends beneath your perspective. Rotate [Q / R] to survey the horizons.',
      author: 'High Cartographer',
      x: 6,
      y: 1,
      facing: 'south',
      elevation: 0,
    },
  ],
};

// ----------------------------------------------------
// Compose Full Citadel Level
// ----------------------------------------------------
const storyCitadelLevel = {
  $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
  id: 'story_citadel_1',
  storyId: 'the_whispering_citadel',
  chapterNumber: 1,
  chapterTitle: 'The Whispering Citadel',
  chapterSubtitle: 'Interconnected Multi-Room Sanctuary',
  prologueText: 'Beneath the peaks of the Monolith lies the Whispering Citadel—a three-tier sanctuary connecting an ancient courtyard, subterranean catacombs, and a high spire open to the four winds.',
  title: 'The Whispering Citadel',
  author: 'High Cartographer of the Monolith',
  version: 1,
  dimensions: { width: 13, height: 13 },
  config: {
    fogOfWar: true,
    viewRadius: 6,
    allowFreePan: true,
    tileSize: 32,
    theme: 'temple',
    viewPerspective: 'angled',
  },
  spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
  exit: {
    x: 11,
    y: 11,
    elevation: 0,
    style: 'portal',
    label: 'Apex Altar of the Monolith',
  },
  exits: courtyardRoom.exits,
  initialRoom: 'courtyard',
  rooms: {
    courtyard: courtyardRoom,
    catacombs: catacombsRoom,
    high_spire: spireRoom,
  },
  parSteps: 80,
  parTime: 60,
  architectNote: 'A true multi-room dungeon. Descend into the Catacombs to retrieve the Spire Key, return to unlock the Spire Gate, and ascend to the mountain heights.',
  help: {
    title: 'The Whispering Citadel',
    message: 'Travel between the Courtyard, Catacombs, and High Spire. Your inventory, score, and key state persist between rooms!',
  },
  layers: courtyardRoom.layers,
  entities: courtyardRoom.entities,
};

// Validate
const rep = LevelValidator.validate(storyCitadelLevel);
console.log(`Validating Citadel Level -> Valid: ${rep.valid}, Errors: ${rep.errors.length}, Warnings: ${rep.warnings.length}`);
if (!rep.valid || rep.errors.length > 0) {
  console.error('Validation errors:', rep.errors);
  process.exit(1);
}

// Write out JSON
const outDir = path.resolve('levels/stories');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'story_citadel_1.json');
fs.writeFileSync(outPath, JSON.stringify(storyCitadelLevel, null, 2) + '\n', 'utf8');
console.log(`Wrote ${outPath}`);

// Update js/stories/storylines.js
const storylinesPath = path.resolve('js/stories/storylines.js');
let storylinesCode = fs.readFileSync(storylinesPath, 'utf8');

const citadelChapterCode = `// Story 3: The Whispering Citadel (Multi-Room Dungeon)
const CITADEL_CHAPTER_1 = ${JSON.stringify(storyCitadelLevel, null, 2)};\n\n`;

const citadelStorylineEntry = `  {
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
`;

if (storylinesCode.includes('CITADEL_CHAPTER_1')) {
  // Replace existing CITADEL_CHAPTER_1
  storylinesCode = storylinesCode.replace(
    /\/\/ Story 3: The Whispering Citadel[\s\S]*?const CITADEL_CHAPTER_1 = \{[\s\S]*?\n\};\n\n/,
    citadelChapterCode
  );
  fs.writeFileSync(storylinesPath, storylinesCode, 'utf8');
  console.log(`Replaced CITADEL_CHAPTER_1 in ${storylinesPath}`);
} else {
  const exportTarget = 'export const STORYLINES = Object.freeze([';
  storylinesCode = storylinesCode.replace(exportTarget, `${citadelChapterCode}${exportTarget}\n${citadelStorylineEntry}`);
  fs.writeFileSync(storylinesPath, storylinesCode, 'utf8');
  console.log(`Updated ${storylinesPath}`);
}

