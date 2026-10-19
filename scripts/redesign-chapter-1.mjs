/**
 * Redesign and Solver Calibration for Chapter 1: The Foundation (Levels 1–4)
 * Implements BL-151, ADR-0039 (Zero Dead Space, Architectural Elegance, Zero-Bypass Gating)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LevelValidator } from '../js/editor/level-validator.js';
import { solveLevel } from '../js/engine/solver.js';
import { simulateCampaignLevelPlaythrough } from '../tests/helpers/campaign-solver.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function checkZeroDeadSpace4x4(ground, overhead, width, height, levelId) {
  const deadSpaces = [];
  for (let y = 1; y < height - 4; y++) {
    for (let x = 1; x < width - 4; x++) {
      let isAllWall = true;
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          const g = ground[y + dy][x + dx];
          const o = overhead && overhead[y + dy] ? overhead[y + dy][x + dx] : 0;
          if (g !== 1 || (o !== 0 && o !== 1)) {
            isAllWall = false;
            break;
          }
        }
        if (!isAllWall) break;
      }
      if (isAllWall) {
        deadSpaces.push({ x, y });
      }
    }
  }
  if (deadSpaces.length > 0) {
    throw new Error(`Level ${levelId} contains ${deadSpaces.length} dead space blocks (>= 4x4) starting at (${deadSpaces[0].x}, ${deadSpaces[0].y})`);
  }
}

// ---------------------------------------------------------------------------
// LEVEL 1: "First Footsteps" (13x13)
// ---------------------------------------------------------------------------
export function generateLevel1() {
  const width = 13;
  const height = 13;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  function carve(coords) {
    for (const [x, y] of coords) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ground[y][x] = 0;
      }
    }
  }

  // Western entry gallery & key vestibule
  carve([
    [1, 1], [2, 1], [3, 1],
    [1, 2], [2, 2], [3, 2],
    [1, 3], [2, 3], [3, 3],
    [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9],
    [1, 10], [2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10],
    [1, 11], [2, 11], [3, 11]
  ]);

  // Secret sunstone vault at top
  ground[1][4] = 'SW';
  ground[1][5] = 0;

  // Central circular ambulatory & sanctuary
  carve([
    [5, 4], [6, 4], [7, 4], [8, 4], [9, 4],
    [5, 5], [7, 5], [9, 5],
    [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
    [5, 7], [7, 7], [9, 7],
    [5, 8], [6, 8], [7, 8], [8, 8], [9, 8],
    [7, 9] // connects to southern corridor at (7, 10)
  ]);

  // Reclaim upper-right dead space into northern colonnade gallery
  carve([
    [9, 1], [10, 1], [11, 1],
    [9, 2], [11, 2],
    [7, 3], [8, 3], [9, 3], [11, 3]
  ]);

  // Reclaim lower-right dead space into crypt alcoves
  carve([
    [9, 9], [11, 9],
    [9, 10], [10, 10], [11, 10],
    [9, 11]
  ]);

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '1',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'First Footsteps',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon'
    },
    spawn: { x: 2, y: 2, elevation: 0, style: 'stairs_down', wallDirection: 'none' },
    exit: { x: 11, y: 6, elevation: 0, style: 'wall_archway', wallDirection: 'north' },
    parSteps: 26,
    parTime: 14,
    architectNote: "Architect's Note #1: Every grand labyrinth begins with a single step. Beyond this entry vestibule lies the Golden Gate. Follow the western gallery to recover the keystore; the circular ambulatory leads directly to the central sanctum.",
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
      },
      {
        id: 'secret_gem_1',
        type: 'collectible',
        name: 'Secret Sunstone',
        points: 250,
        x: 5,
        y: 1,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 2: "The Ruby Lock" (15x13)
// ---------------------------------------------------------------------------
export function generateLevel2() {
  const width = 15;
  const height = 13;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  function carve(coords) {
    for (const [x, y] of coords) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ground[y][x] = 0;
      }
    }
  }

  // Central South-to-North axis
  // Spawn at (7, 11), Exit at (7, 1)
  // Southern portico (rows 9..11, cols 5..9)
  carve([
    [5, 9], [6, 9], [7, 9], [8, 9], [9, 9],
    [5, 10], [7, 10], [9, 10],
    [5, 11], [6, 11], [7, 11], [8, 11], [9, 11]
  ]);

  // Central hall & vertical artery (x=7, y=4..8)
  carve([
    [7, 8], [7, 7], [7, 6], [7, 5], [7, 4]
  ]);

  // Northern Sanctuary (rows 1..2, cols 6..8) - strictly sealed by doorway at (7, 3)
  carve([
    [6, 1], [7, 1], [8, 1],
    [6, 2], [7, 2], [8, 2],
    [7, 3] // ONLY (7, 3) enters the sanctum!
  ]);

  // Western Wing: Pillared Ruby Vault (rows 3..7, cols 1..5)
  carve([
    [1, 3], [2, 3], [3, 3], [4, 3],
    [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
    [1, 5], [3, 5], [5, 5],
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]
  ]);

  // Eastern Wing: Mirror Archive & Gem Vault (rows 3..7, cols 9..13)
  carve([
    [10, 3], [11, 3], [12, 3], [13, 3],
    [8, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4],
    [9, 5], [11, 5], [13, 5],
    [8, 6], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6],
    [8, 7], [9, 7], [10, 7], [11, 7], [12, 7], [13, 7]
  ]);

  // Reclaim NW dead space (rows 1..2, cols 1..4) without connecting to north sanctuary
  carve([
    [1, 1], [2, 1], [3, 1],
    [1, 2], [3, 2]
  ]);

  // Reclaim NE dead space (rows 1..2, cols 10..13) with secret sunstone chamber
  carve([
    [11, 1], [12, 1], [13, 1],
    [11, 2], [13, 2]
  ]);
  ground[2][10] = 'SW'; // Secret wall from (10, 3) area into NE sanctuary

  // Reclaim SW dead space (rows 9..11, cols 1..4)
  carve([
    [1, 9], [2, 9], [3, 9],
    [1, 10], [3, 10],
    [1, 11], [2, 11], [3, 11], [4, 11]
  ]);

  // Reclaim SE dead space (rows 9..11, cols 10..13)
  carve([
    [11, 9], [12, 9], [13, 9],
    [11, 10], [13, 10],
    [10, 11], [11, 11], [12, 11], [13, 11]
  ]);

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '2',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'The Ruby Lock',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon'
    },
    spawn: { x: 7, y: 11, elevation: 0, style: 'stairs_down', wallDirection: 'none' },
    exit: { x: 7, y: 1, elevation: 0, style: 'wall_archway', wallDirection: 'north' },
    parSteps: 25,
    parTime: 14,
    architectNote: "Architect's Journal: The North Sanctuary is sealed by ancient crimson resonance. Retrieve the Ruby Key from the western pillared vault; use the northern shortcut to proceed directly to the sanctum.",
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
        id: 'secret_gem_2',
        type: 'collectible',
        name: 'Hidden Bloodstone',
        points: 250,
        x: 12,
        y: 1,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 3: "Prismatic Corridors" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel3() {
  const width = 17;
  const height = 15;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  function carve(coords) {
    for (const [x, y] of coords) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ground[y][x] = 0;
      }
    }
  }

  // Kishōtenketsu Sequential Chain:
  // Spawn at (2, 7)
  // Southern Cistern has Emerald Key at (3, 13)
  // Emerald Door at (7, 12) unlocks passage to Eastern Vault holding Purple Key at (13, 11)
  // Purple Door at (9, 6) unlocks Central Dais Exit at (8, 7)

  // Western starting wing (x=1..3, y=5..9)
  carve([
    [1, 5], [2, 5], [3, 5],
    [1, 6], [2, 6], [3, 6],
    [1, 7], [2, 7], [3, 7],
    [1, 8], [2, 8], [3, 8],
    [2, 9], [2, 10], [2, 11], [2, 12]
  ]);

  // Southern cistern with emerald key at (3, 13)
  carve([
    [1, 12], [2, 12], [3, 12], [4, 12], [5, 12], [6, 12], [7, 12],
    [2, 13], [3, 13], [4, 13], [5, 13]
  ]);

  // Eastern lower corridor & purple key vault (beyond emerald door at (7, 12))
  carve([
    [8, 12], [9, 12], [10, 12], [11, 12], [12, 12], [13, 12], [14, 12], [15, 12],
    [13, 11], [14, 11], [15, 11],
    [13, 13], [14, 13], [15, 13],
    [15, 10], [15, 9], [15, 8], [15, 7], [15, 6], [15, 5], [15, 4]
  ]);

  // Approach to Purple Door at (9, 6)
  carve([
    [14, 4], [13, 4], [12, 4], [11, 4], [10, 4],
    [10, 5], [10, 6], [9, 6] // Purple Door at (9, 6)
  ]);

  // Central Dais Sanctuary (enclosed completely, entry ONLY via (9, 6))
  carve([
    [8, 6],
    [8, 7] // Exit at (8, 7)
  ]);

  // Reclaim northern rows 1..3 dead spaces into western high galleria (dead end, does NOT connect to eastern wing)
  carve([
    [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1],
    [2, 2], [4, 2], [6, 2], [8, 2],
    [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3]
  ]);
  // Connect west wing to northern galleria
  ground[4][2] = 0;

  // Reclaim northern-east dead spaces (rows 1..3, cols 10..15) as an isolated secret sunstone chamber
  carve([
    [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
    [11, 2], [13, 2], [15, 2],
    [11, 3], [12, 3], [13, 3], [14, 3], [15, 3]
  ]);
  ground[4][13] = 'SW'; // Secret wall from (13, 4) into northern secret archive

  // Reclaim middle dead spaces (rows 5..8, cols 5..6 and 12..14)
  carve([
    [5, 5], [5, 6], [5, 7],
    [12, 8], [13, 8],
    // Middle-south alcoves (rows 8..10, cols 4..11) separated at col 7
    [4, 8], [5, 8], [6, 8],
    [4, 9], [6, 9],
    [4, 10], [5, 10], [6, 10],
    [8, 10], [9, 10], [10, 10], [11, 10]
  ]);

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '3',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'Prismatic Corridors',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon'
    },
    spawn: { x: 2, y: 7, elevation: 0, style: 'stairs_down', wallDirection: 'none' },
    exit: { x: 8, y: 7, elevation: 0, style: 'portal', wallDirection: 'none' },
    parSteps: 44,
    parTime: 24,
    architectNote: "Architect's Journal: The central dais is locked under royal purple seal. To break it, claim the Emerald Key in the southern cistern, open the eastern passage, and retrieve the Purple Keystone.",
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
      },
      {
        id: 'secret_gem_3',
        type: 'collectible',
        name: 'Prismatic Shard',
        points: 300,
        x: 13,
        y: 1,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 4: "The Shrouded Vault" (19x17)
// ---------------------------------------------------------------------------
export function generateLevel4() {
  const width = 19;
  const height = 17;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  function carve(coords) {
    for (const [x, y] of coords) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ground[y][x] = 0;
      }
    }
  }

  // Central crossing and ambulatory (rows 6..10, cols 7..11)
  // Spawn at (9, 8)
  carve([
    [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
    [7, 7], [9, 7], [11, 7],
    [7, 8], [8, 8], [9, 8], [10, 8], [11, 8],
    [7, 9], [9, 9], [11, 9],
    [7, 10], [8, 10], [9, 10], [10, 10], [11, 10]
  ]);

  // West Wing (Ruby Key at (2, 8))
  carve([
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6],
    [1, 7], [2, 7], [3, 7], [5, 7],
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8],
    [1, 9], [2, 9], [3, 9], [5, 9],
    [1, 10], [2, 10], [3, 10], [4, 10], [5, 10], [6, 10]
  ]);

  // East Wing (Emerald Key at (16, 8))
  carve([
    [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6],
    [13, 7], [15, 7], [16, 7], [17, 7],
    [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8],
    [13, 9], [15, 9], [16, 9], [17, 9],
    [12, 10], [13, 10], [14, 10], [15, 10], [16, 10], [17, 10]
  ]);

  // North Wing (Blue Key at (8, 2))
  carve([
    [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
    [3, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [15, 2],
    [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3], [15, 3],
    [3, 4], [9, 4], [15, 4],
    [3, 5], [9, 5], [15, 5]
  ]);

  // South Wing: Triune Sanctum
  // Doors at (9, 11), (9, 12), (9, 13) leading to (9, 14), (9, 15) exit
  carve([
    [9, 11], [9, 12], [9, 13], [9, 14],
    [9, 15]
  ]);

  // Reclaim lower-left dead spaces (rows 11..15, cols 1..7) - walled off from x=8..10
  carve([
    [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11],
    [1, 12], [3, 12], [5, 12],
    [1, 13], [2, 13], [3, 13], [4, 13], [5, 13], [6, 13],
    [1, 14], [3, 14], [5, 14],
    [1, 15], [2, 15], [3, 15], [4, 15], [5, 15], [6, 15]
  ]);

  // Reclaim lower-right dead spaces (rows 11..15, cols 12..17) - walled off from x=8..10
  carve([
    [12, 11], [13, 11], [14, 11], [15, 11], [16, 11], [17, 11],
    [13, 12], [15, 12], [17, 12],
    [12, 13], [13, 13], [14, 13], [15, 13], [16, 13], [17, 13],
    [13, 14], [15, 14], [17, 14],
    [12, 15], [13, 15], [14, 15], [15, 15], [16, 15], [17, 15]
  ]);

  // Secret sanctum chamber in lower wing
  ground[13][4] = 'SW';
  ground[14][4] = 0;

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '4',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'The Shrouded Vault',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon'
    },
    spawn: { x: 9, y: 8, elevation: 0, style: 'stairs_down', wallDirection: 'none' },
    exit: { x: 9, y: 15, elevation: 0, style: 'portal', wallDirection: 'none' },
    parSteps: 65,
    parTime: 36,
    architectNote: "Architect's Journal: The Triune Sanctum to the south requires all three resonance keys—Ruby, Emerald, and Sapphire. The outer ambulatory connects all three cathedral wings beneath the shrouded mist.",
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
      },
      {
        id: 'secret_gem_4',
        type: 'collectible',
        name: 'Abyssal Sapphire',
        points: 400,
        x: 4,
        y: 14,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// Main Verification & Writer Runner
// ---------------------------------------------------------------------------
async function main() {
  console.log('--- Overhauling Chapter 1 (Levels 1–4) ---');

  const generators = [
    { num: 1, fn: generateLevel1 },
    { num: 2, fn: generateLevel2 },
    { num: 3, fn: generateLevel3 },
    { num: 4, fn: generateLevel4 }
  ];

  for (const { num, fn } of generators) {
    const level = fn();
    const w = level.dimensions.width;
    const h = level.dimensions.height;

    // 1. Zero Dead Space Check
    checkZeroDeadSpace4x4(level.layers.ground, level.layers.overhead, w, h, num);
    console.log(`✓ Level ${num} (${level.title}): Zero dead space (4x4) passed.`);

    // 2. Schema / LevelValidator Check
    const valResult = LevelValidator.validate(level);
    if (valResult.errors && valResult.errors.length > 0) {
      throw new Error(`Level ${num} validation failed: ${JSON.stringify(valResult.errors)}`);
    }
    console.log(`✓ Level ${num}: LevelValidator passed (0 errors).`);

    // 3. BFS Solver Check
    const solution = solveLevel(level);
    if (!solution) {
      throw new Error(`Level ${num} is UNSOLVABLE by BFS solver!`);
    }
    const optimalSteps = solution.length - 1;
    console.log(`✓ Level ${num}: Solvable in ${optimalSteps} steps (current parSteps: ${level.parSteps}).`);

    // Calibrate parSteps if needed
    if (num !== 1) {
      level.parSteps = Math.ceil(optimalSteps * 1.18);
      level.parTime = Math.ceil(level.parSteps * 0.55);
    }

    // 4. Zero Bypass Gating Check
    const bypass = solveLevel(level, { allowDoors: false });
    if (bypass !== null) {
      throw new Error(`Level ${num} fails zero-bypass gating! Exit is reachable without keys/doors.`);
    }
    console.log(`✓ Level ${num}: 100% Zero-bypass gating verified.`);

    // 5. Full Engine Playthrough Simulation
    simulateCampaignLevelPlaythrough(level);
    console.log(`✓ Level ${num}: Engine simulation passed!`);

    // Write file
    const filePath = path.join(rootDir, `levels/chapter_1/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 1 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
