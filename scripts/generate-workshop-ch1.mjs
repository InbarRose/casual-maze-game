/**
 * Generator & Validator for High-Score Chapter 1 & Chapter 2 Workshops
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveLevel } from '../js/engine/solver.js';
import { LevelValidator } from '../js/editor/level-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function createGrid(w, h, fill = 1) {
  return Array(h).fill(0).map(() => Array(w).fill(fill));
}

function fillRoom(grid, x1, y1, x2, y2, val = 0) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        grid[y][x] = val;
      }
    }
  }
}

// -------------------------------------------------------------
// LEVEL 1: First Footsteps (13x13, Ki)
// -------------------------------------------------------------
function buildLevel1() {
  const w = 13, h = 13;
  const ground = createGrid(w, h, 1);
  const overhead = createGrid(w, h, 0);

  // Entry Vestibule (x: 1..3, y: 1..3)
  fillRoom(ground, 1, 1, 3, 3, 0);
  // West Gallery (x: 2, y: 4..9)
  fillRoom(ground, 2, 4, 2, 9, 0);
  // Key Alcove (x: 1..3, y: 10..11)
  fillRoom(ground, 1, 10, 3, 11, 0);
  // Loopback Hall south (y: 10, x: 4..7)
  fillRoom(ground, 4, 10, 7, 10, 0);
  // Hall into Central Chamber (x: 7, y: 8..9)
  fillRoom(ground, 7, 8, 7, 9, 0);
  // Central Chamber (x: 5..9, y: 4..8)
  fillRoom(ground, 5, 4, 9, 8, 0);
  // 4 Stone Pillars in Chamber
  ground[5][6] = 1;
  ground[5][8] = 1;
  ground[7][6] = 1;
  ground[7][8] = 1;
  // Exit Corridor (x: 10..11, y: 6)
  ground[6][10] = 0;
  ground[6][11] = 0;

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '1',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'First Footsteps',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon'
    },
    spawn: { x: 2, y: 2, elevation: 0, style: 'stairs_down' },
    exit: { x: 11, y: 6, elevation: 0, style: 'portal' },
    parSteps: 26, // BFS is 22
    parTime: 14,
    architectNote: "Every grand labyrinth begins with a single step. Beyond this entry vestibule lies the Golden Gate. Follow the western gallery to recover the keystore; the circular ambulatory leads directly to the central sanctum.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_ch1_1',
        type: 'signpost',
        title: "Architect's Note #1",
        x: 2,
        y: 1,
        elevation: 0,
        text: "Architect's Note #1: Every grand labyrinth begins with a single step. Beyond this entry vestibule lies the Golden Gate. Follow the western gallery to recover the keystore; the circular ambulatory leads directly to the central sanctum."
      },
      {
        id: 'inscr_vestibule',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'Ancient script: He who walks the circular way avoids needless retracing of steps.',
        playerDialogue: 'A wise rule for any pathfinder.',
        x: 1,
        y: 1,
        elevation: 0
      },
      {
        id: 'key_gold_1',
        type: 'key',
        color: 'gold',
        x: 2,
        y: 10,
        elevation: 0
      },
      {
        id: 'door_gold_1',
        type: 'door',
        color: 'gold',
        requiresKey: 'key_gold_1',
        x: 9,
        y: 6,
        elevation: 0
      }
    ]
  };

  return level;
}

// -------------------------------------------------------------
// LEVEL 2: The Ruby Lock (15x13, Shō)
// -------------------------------------------------------------
function buildLevel2() {
  const w = 15, h = 13;
  const ground = createGrid(w, h, 1);
  const overhead = createGrid(w, h, 0);

  // Southern Portico (x: 5..9, y: 9..11)
  fillRoom(ground, 5, 9, 9, 11, 0);
  ground[10][6] = 1;
  ground[10][8] = 1;

  // Central Nav Corridor (x: 7, y: 4..8)
  fillRoom(ground, 7, 4, 7, 8, 0);

  // West Ruby Vault (x: 1..4, y: 3..7)
  fillRoom(ground, 1, 3, 4, 7, 0);
  ground[5][2] = 1; // Center pillar

  // Entrance to West Vault from south (x: 4..6, y: 7)
  ground[7][4] = 0;
  ground[7][5] = 0;
  ground[7][6] = 0;

  // Shortcut Loopback North from West Vault to Central Crossing (x: 4..6, y: 4)
  ground[4][4] = 0;
  ground[4][5] = 0;
  ground[4][6] = 0;

  // East Relic Crypt (x: 10..13, y: 3..7)
  fillRoom(ground, 10, 3, 13, 7, 0);
  ground[5][12] = 1; // Pillar in Crypt
  ground[6][8] = 0;
  ground[6][9] = 0;

  // Northern Sanctuary (x: 6..8, y: 1..2)
  fillRoom(ground, 6, 1, 8, 2, 0);
  ground[3][7] = 0; // Door at (7,3)

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '2',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'The Ruby Lock',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon'
    },
    spawn: { x: 7, y: 11, elevation: 0, style: 'stairs_down' },
    exit: { x: 7, y: 1, elevation: 0, style: 'portal' },
    parSteps: 25, // BFS is 21
    parTime: 14,
    architectNote: "The North Sanctuary is sealed by ancient crimson resonance. Retrieve the Ruby Key from the western pillared vault; use the northern shortcut to proceed directly to the sanctum.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_ch1_2',
        type: 'signpost',
        title: "Architect's Note #2",
        x: 7,
        y: 9,
        elevation: 0,
        text: "Architect's Journal: The North Sanctuary is sealed by ancient crimson resonance. Retrieve the Ruby Key from the western pillared vault; use the northern shortcut to proceed directly to the sanctum."
      },
      {
        id: 'inscr_ruby_vault',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'The ruby gleams with subterranean fire. A return archway opens toward the north gate.',
        playerDialogue: 'Convenient archway—no need to backtrack through the south portico.',
        x: 1,
        y: 3,
        elevation: 0
      },
      {
        id: 'gem_bonus_2',
        type: 'collectible',
        collectibleType: 'gem',
        scoreValue: 150,
        x: 12,
        y: 4,
        elevation: 0
      },
      {
        id: 'key_ruby_2',
        type: 'key',
        color: 'red',
        x: 2,
        y: 4,
        elevation: 0
      },
      {
        id: 'door_ruby_2',
        type: 'door',
        color: 'red',
        requiresKey: 'key_ruby_2',
        x: 7,
        y: 3,
        elevation: 0
      }
    ]
  };

  return level;
}

// -------------------------------------------------------------
// LEVEL 3: Prismatic Corridors (17x15, Ten)
// -------------------------------------------------------------
function buildLevel3() {
  const w = 17, h = 15;
  const ground = createGrid(w, h, 1);
  const overhead = createGrid(w, h, 0);

  // West Entry Pavilion (x: 1..3, y: 6..8)
  fillRoom(ground, 1, 6, 3, 8, 0);

  // South Gallery to Emerald Vault (x: 2, y: 9..12; x: 2..5, y: 12..13)
  fillRoom(ground, 2, 9, 2, 12, 0);
  fillRoom(ground, 2, 12, 5, 13, 0);

  // Emerald Gate at (7, 12)
  ground[12][6] = 0;
  ground[12][7] = 0;
  ground[12][8] = 0;

  // East Cloister (x: 9..14, y: 10..13)
  fillRoom(ground, 9, 10, 14, 13, 0);
  ground[11][11] = 1; // Pillar in Cloister

  // Ascending corridor from East Cloister to North Gallery (x: 14, y: 4..10)
  fillRoom(ground, 14, 4, 14, 10, 0);

  // North Gallery leading to Central Dais (x: 9..14, y: 4; x: 9, y: 5..6)
  fillRoom(ground, 9, 4, 14, 4, 0);
  fillRoom(ground, 9, 5, 9, 6, 0);

  // Central Dais (x: 7..9, y: 6..8)
  fillRoom(ground, 7, 6, 9, 8, 0);

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '3',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'Prismatic Corridors',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon'
    },
    spawn: { x: 2, y: 7, elevation: 0, style: 'stairs_down' },
    exit: { x: 8, y: 7, elevation: 0, style: 'portal' },
    parSteps: 43, // BFS is 37
    parTime: 24,
    architectNote: "The central dais is locked under royal purple seal. To break it, claim the Emerald Key in the southern cistern, open the eastern passage, and retrieve the Purple Keystone.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_ch1_3',
        type: 'signpost',
        title: "Architect's Note #3",
        x: 2,
        y: 6,
        elevation: 0,
        text: "Architect's Journal: The central dais is locked under royal purple seal. To break it, claim the Emerald Key in the southern cistern, open the eastern passage, and retrieve the Purple Keystone."
      },
      {
        id: 'inscr_cistern',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'Ancient stone: Resonance flows in cycles. The Emerald unlocks the path to royalty.',
        playerDialogue: 'The Emerald Gate will open the way forward.',
        x: 1,
        y: 12,
        elevation: 0
      },
      {
        id: 'key_emerald_3',
        type: 'key',
        color: 'green',
        x: 3,
        y: 13,
        elevation: 0
      },
      {
        id: 'door_emerald_3',
        type: 'door',
        color: 'green',
        requiresKey: 'key_emerald_3',
        x: 7,
        y: 12,
        elevation: 0
      },
      {
        id: 'key_purple_3',
        type: 'key',
        color: 'purple',
        x: 13,
        y: 11,
        elevation: 0
      },
      {
        id: 'door_purple_3',
        type: 'door',
        color: 'purple',
        requiresKey: 'key_purple_3',
        x: 9,
        y: 6,
        elevation: 0
      }
    ]
  };

  return level;
}

// -------------------------------------------------------------
// LEVEL 4: The Shrouded Vault (19x17, Ketsu)
// -------------------------------------------------------------
function buildLevel4() {
  const w = 19, h = 17;
  const ground = createGrid(w, h, 1);
  const overhead = createGrid(w, h, 0);

  // Center Grand Cathedral (x: 7..11, y: 6..10)
  fillRoom(ground, 7, 6, 11, 10, 0);
  ground[7][8] = 1;  // Pillar NW
  ground[7][10] = 1; // Pillar NE
  ground[9][8] = 1;  // Pillar SW
  ground[9][10] = 1; // Pillar SE

  // North Nave to Sapphire Gallery (x: 9, y: 4..5; gallery x: 7..11, y: 1..3)
  fillRoom(ground, 9, 4, 9, 5, 0);
  fillRoom(ground, 7, 1, 11, 3, 0);
  ground[2][9] = 1; // Altar pillar

  // West Transept to Ruby Sanctum (x: 4..6, y: 8; sanctum x: 1..5, y: 6..10)
  fillRoom(ground, 4, 8, 6, 8, 0);
  fillRoom(ground, 1, 6, 5, 10, 0);
  ground[8][3] = 1; // Center brazier pillar

  // East Transept to Emerald Treasury (x: 12..14, y: 8; treasury x: 13..17, y: 6..10)
  fillRoom(ground, 12, 8, 14, 8, 0);
  fillRoom(ground, 13, 6, 17, 10, 0);
  ground[8][15] = 1; // Center pillar

  // Ambulatory Cloister connecting North Gallery to East & West wings directly:
  fillRoom(ground, 3, 1, 3, 5, 0);
  fillRoom(ground, 3, 1, 7, 1, 0);

  fillRoom(ground, 11, 1, 15, 1, 0);
  fillRoom(ground, 15, 1, 15, 5, 0);

  // South Wing: Triune Gatehouse (x: 9, y: 11..14; Altar room x: 8..10, y: 15)
  fillRoom(ground, 9, 11, 9, 14, 0);
  fillRoom(ground, 8, 15, 10, 15, 0);

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '4',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'The Shrouded Vault',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon'
    },
    spawn: { x: 9, y: 8, elevation: 0, style: 'stairs_down' },
    exit: { x: 9, y: 15, elevation: 0, style: 'portal' },
    parSteps: 65, // BFS is 56
    parTime: 36,
    architectNote: "The Triune Sanctum to the south requires all three resonance keys—Ruby, Emerald, and Sapphire. The outer ambulatory connects all three cathedral wings beneath the shrouded mist.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_ch1_4',
        type: 'signpost',
        title: "Architect's Note #4",
        x: 9,
        y: 7,
        elevation: 0,
        text: "Architect's Journal: The Triune Sanctum to the south requires all three resonance keys—Ruby, Emerald, and Sapphire. The outer ambulatory connects all three cathedral wings beneath the shrouded mist."
      },
      {
        id: 'inscr_cathedral',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'The cathedral bells echo through the fog. Seek the three sacred chambers in any order.',
        playerDialogue: 'The ambulatory ring lets me loop freely between all wings.',
        x: 7,
        y: 6,
        elevation: 0
      },
      {
        id: 'key_ruby_4',
        type: 'key',
        color: 'red',
        x: 2,
        y: 8,
        elevation: 0
      },
      {
        id: 'key_emerald_4',
        type: 'key',
        color: 'green',
        x: 16,
        y: 8,
        elevation: 0
      },
      {
        id: 'key_blue_4',
        type: 'key',
        color: 'blue',
        x: 8,
        y: 2,
        elevation: 0
      },
      {
        id: 'door_ruby_4',
        type: 'door',
        color: 'red',
        requiresKey: 'key_ruby_4',
        x: 9,
        y: 11,
        elevation: 0
      },
      {
        id: 'door_emerald_4',
        type: 'door',
        color: 'green',
        requiresKey: 'key_emerald_4',
        x: 9,
        y: 12,
        elevation: 0
      },
      {
        id: 'door_blue_4',
        type: 'door',
        color: 'blue',
        requiresKey: 'key_blue_4',
        x: 9,
        y: 13,
        elevation: 0
      }
    ]
  };

  return level;
}

// -------------------------------------------------------------
// Write Chapter 1 files and test
// -------------------------------------------------------------
const levels = [buildLevel1(), buildLevel2(), buildLevel3(), buildLevel4()];
for (const lvl of levels) {
  const filePath = path.join(rootDir, 'levels', 'chapter_1', `level_${lvl.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(lvl, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${filePath}`);

  const v = LevelValidator.validate(lvl);
  const sol = solveLevel(lvl);
  const bypass = solveLevel(lvl, { allowDoors: false });
  console.log(`Level ${lvl.id}: Valid=${v.valid} (${v.errors.length} errs), BFS Steps=${sol?.length}, ParSteps=${lvl.parSteps}, Bypassable=${bypass !== null}`);
}
