/**
 * Redesign and Solver Calibration for Chapter 2: The Vertical Dimension (Levels 5–8)
 * Implements BL-151, ADR-0039 (Zero Dead Space, 2D Platforms, Multi-Elevation Traversal, Zero-Bypass Gating)
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
// LEVEL 5: "The Canopy Bridge" (15x13)
// ---------------------------------------------------------------------------
export function generateLevel5() {
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

  // Spawn at (2, 11), Exit at (12, 4)
  // Southern grove & approach to south ramp
  carve([
    [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11],
    [2, 10], [7, 10]
  ]);

  // South ramp climbing North from ground (y=10) onto bridge at (7, 9)
  ground[9][7] = 'R_N';

  // Overhead bridge deck: x=7, y=4..8
  for (let y = 4; y <= 8; y++) {
    overhead[y][7] = 'B_EW';
  }

  // Elevated Wall-Walk battlements connecting to the bridge along walls of row 5 & 7
  // Allows the player to walk off the bridge onto wall ramparts to scout lower canals
  for (const x of [5, 6, 8, 9]) {
    overhead[5][x] = 'WW';
    overhead[7][x] = 'WW';
  }

  // High Key at (7, 6, z=1)
  // North ramp: at (7, 3) sloping UP towards South, so descending North exits to (7, 2)
  ground[3][7] = 'R_S';

  // Ground underpass: East-West canal at y=6 passing under bridge deck at (7, 6)
  carve([
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6]
  ]);
  // Ground tile at (7, 6) is B_EW for proper underpass collision & rendering
  ground[6][7] = 'B_EW';

  // Northern terrace & exit vestibule: strictly sealed by door at (12, 3)
  carve([
    [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2],
    [12, 3], // Door at (12, 3)
    [12, 4]  // Exit at (12, 4)
  ]);

  // Reclaim NW dead space (rows 1..4, cols 1..5) into winding mossy cloisters
  carve([
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
    [1, 2], [3, 2], [5, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
    [1, 4], [3, 4]
  ]);
  // Secret wall into gem alcove at (2, 6)
  ground[5][2] = 'SW';

  // Reclaim NE dead space (rows 1..4, cols 8..13)
  carve([
    [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1],
    [13, 2]
  ]);

  // Reclaim SW dead space (rows 8..9, cols 1..5)
  carve([
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
    [1, 9], [3, 9], [5, 9]
  ]);

  // Reclaim SE dead space (rows 8..11, cols 9..13) into canal loopback
  carve([
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
    [9, 9], [11, 9], [13, 9],
    [9, 10], [10, 10], [11, 10], [12, 10], [13, 10],
    [11, 11], [13, 11]
  ]);

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '5',
    chapter: 'chapter_2',
    zone: 'zone_2',
    title: 'The Canopy Bridge',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'jungle'
    },
    spawn: { x: 2, y: 11, elevation: 0, style: 'stairs_down', wallDirection: 'none' },
    exit: { x: 12, y: 4, elevation: 0, style: 'portal', wallDirection: 'none' },
    parSteps: 26,
    parTime: 16,
    architectNote: "Architect's Journal: Ascend the southern ramp to tread upon the ancient canopy bridge deck. The jungle key is suspended at high elevation; below, the underpass canal flows unimpeded toward the northern gate.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_arch_5',
        type: 'signpost',
        title: "Architect's Note #5",
        x: 3,
        y: 11,
        elevation: 0,
        text: "Architect's Journal: Ascend the southern ramp to tread upon the ancient canopy bridge deck. The jungle key is suspended at high elevation; below, the underpass canal flows unimpeded toward the northern gate."
      },
      {
        id: 'inscr_canopy_5',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'Two tiers of path weave through the trees: walk below through water, or climb above the mist.',
        playerDialogue: 'The ramp will carry me directly to the bridge deck.',
        x: 2,
        y: 10,
        elevation: 0
      },
      {
        id: 'key_jungle_5',
        type: 'key',
        color: '#34d399',
        x: 7,
        y: 6,
        z: 1,
        elevation: 1
      },
      {
        id: 'door_jungle_5',
        type: 'door',
        color: '#34d399',
        requiresKey: 'key_jungle_5',
        x: 12,
        y: 3,
        elevation: 0
      },
      {
        id: 'secret_gem_5',
        type: 'collectible',
        name: 'Canopy Peridot',
        points: 250,
        x: 2,
        y: 6,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 6: "Canopy Crossings" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel6() {
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

  // Western starting courtyard (x=1..4, y=6..8)
  carve([
    [1, 6], [2, 6], [3, 6], [4, 6],
    [1, 7], [2, 7], [3, 7], [4, 7],
    [1, 8], [2, 8], [3, 8], [4, 8]
  ]);

  // Underpass canal flowing East from (4, 7) through (8, 7) to (12, 7)
  carve([
    [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7]
  ]);
  // Bridge tile at (8, 7) for proper underpass canal
  ground[7][8] = 'B_EW';

  // Eastern lower glen holding Amber Key at (14, 12)
  carve([
    [12, 8], [12, 9], [12, 10], [12, 11], [12, 12], [13, 12], [14, 12], [15, 12],
    [10, 12], [11, 12], // connects to Amber Door at (9, 12)
    [14, 11], [14, 13]
  ]);

  // Amber Door at (9, 12) sealing southern ramp chamber
  carve([
    [9, 12], [8, 12], [8, 11]
  ]);
  // Southern ramp climbing North from (8, 12) onto bridge at (8, 11)
  ground[11][8] = 'R_N';

  // Overhead bridge deck: x=8, y=4..10
  for (let y = 4; y <= 10; y++) {
    overhead[y][8] = 'B_EW';
  }

  // Elevated Wall-Walk battlements connecting to the bridge along walls of row 6 & 8
  // Allows the player to walk off the bridge onto wall ramparts overlooking lower glen
  for (const x of [6, 7, 9, 10]) {
    overhead[6][x] = 'WW';
    overhead[8][x] = 'WW';
  }

  // Northern ramp descending North from bridge at (8, 3)
  ground[3][8] = 'R_S';

  // Northern exit terrace: (8..15, 2)
  carve([
    [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2],
    [14, 2], // Emerald Door at (14, 2)
    [15, 2]  // Exit at (15, 2)
  ]);

  // Reclaim NW dead space (rows 1..5, cols 1..6) into northern moss maze
  carve([
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
    [1, 2], [3, 2], [5, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
    [1, 4], [3, 4], [5, 4],
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5]
  ]);

  // Reclaim NE dead space (rows 1..5, cols 9..13) - walled off from exit at (15, 2)
  carve([
    [9, 1], [10, 1], [11, 1], [12, 1], [13, 1],
    [10, 3], [12, 3], [14, 3],
    [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4]
  ]);

  // Reclaim SW dead space (rows 9..13, cols 1..6) - walled off from ramp chamber at (7..8, 12..13)
  carve([
    [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9],
    [1, 10], [3, 10], [5, 10],
    [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11],
    [1, 12], [3, 12], [5, 12],
    [1, 13], [2, 13], [3, 13], [4, 13], [5, 13], [6, 13]
  ]);

  // Reclaim SE dead space (rows 6..10, cols 14..15 and rows 13..14)
  carve([
    [14, 6], [15, 6],
    [14, 7], [15, 7],
    [14, 8], [15, 8],
    [14, 9], [15, 9],
    [10, 13], [11, 13], [12, 13]
  ]);

  // Secret sunstone vault at (5, 13)
  ground[13][5] = 'SW';

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '6',
    chapter: 'chapter_2',
    zone: 'zone_2',
    title: 'Canopy Crossings',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'jungle'
    },
    spawn: { x: 2, y: 7, elevation: 0, style: 'stairs_down', wallDirection: 'none' },
    exit: { x: 15, y: 2, elevation: 0, style: 'wall_archway', wallDirection: 'north' },
    parSteps: 48,
    parTime: 29,
    architectNote: "Architect's Journal: Dual traversal is demanded here. First, brave the low underpass tunnel beneath the canopy viaduct to claim the amber key in the lower glen. Only then will the southern ramp unlock, granting access to the high bridge deck.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_arch_6',
        type: 'signpost',
        title: "Architect's Note #6",
        x: 3,
        y: 7,
        elevation: 0,
        text: "Architect's Journal: Dual traversal is demanded here. First, brave the low underpass tunnel beneath the canopy viaduct to claim the amber key in the lower glen. Only then will the southern ramp unlock, granting access to the high bridge deck."
      },
      {
        id: 'inscr_tunnel_6',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'The water tunnel runs low and cold beneath the high bridge. Collect the amber resonance before looking to the sky.',
        playerDialogue: 'Underpass first, high overpass second.',
        x: 3,
        y: 8,
        elevation: 0
      },
      {
        id: 'key_amber_6',
        type: 'key',
        color: '#f59e0b',
        x: 14,
        y: 12,
        elevation: 0
      },
      {
        id: 'door_amber_6',
        type: 'door',
        color: '#f59e0b',
        requiresKey: 'key_amber_6',
        x: 9,
        y: 12,
        elevation: 0
      },
      {
        id: 'key_emerald_6',
        type: 'key',
        color: '#34d399',
        x: 8,
        y: 7,
        z: 1,
        elevation: 1
      },
      {
        id: 'door_emerald_6',
        type: 'door',
        color: '#34d399',
        requiresKey: 'key_emerald_6',
        x: 14,
        y: 2,
        elevation: 0
      },
      {
        id: 'secret_gem_6',
        type: 'collectible',
        name: 'Sunken Amber Tear',
        points: 300,
        x: 4,
        y: 13,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 7: "The Sunken Chasm" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel7() {
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

  // Kishōtenketsu Ten (Two Intersecting Perpendicular Bridges):
  // Bridge 1: East-West overhead bridge `B_NS` at y=5, x=5..11
  // Bridge 2: North-South overhead bridge `B_EW` at x=14, y=7..11
  // Azure Key at (14, 9, z=1) on Bridge 2
  // Azure Door at (8, 3) blocks access to Exit at (8, 1)

  // Starting western gallery (spawn at 2, 5)
  carve([
    [1, 5], [2, 5], [3, 5], [4, 5]
  ]);

  // West ramp at (4, 5) climbing East onto Bridge 1
  ground[5][4] = 'R_E';

  // Bridge 1: y=5, x=5..11 on overhead (`B_NS`)
  for (let x = 5; x <= 11; x++) {
    overhead[5][x] = 'B_NS';
  }

  // Elevated Wall-Walk battlements connecting Bridge 1 to canyon walls:
  for (const y of [4, 6]) {
    overhead[y][6] = 'WW';
    overhead[y][10] = 'WW';
  }

  // Underpass beneath Bridge 1: North-South canal at x=8, y=1..13 on ground
  // (Ground tile at (8, 5) is B_NS so player can walk N-S through it)
  for (let y = 1; y <= 13; y++) {
    carve([[8, y]]);
  }
  ground[5][8] = 'B_NS';

  // East ramp descending East off Bridge 1 at (11, 5) onto ground at (12, 5)
  // Ramp at (11, 5) slopes UP towards West, so moving East descends to ground
  ground[5][11] = 'R_W';

  // Ground path from (12, 5) down to Bridge 2 southern ramp at (14, 12)
  carve([
    [12, 5], [13, 5], [14, 5],
    [14, 6], [13, 6],
    [13, 7], [13, 8], [13, 9], [13, 10], [13, 11], [13, 12],
    [14, 13]
  ]);

  // South ramp onto Bridge 2: at (14, 12) climbing North onto bridge
  ground[12][14] = 'R_N';

  // Bridge 2: x=14, y=7..11 on overhead (`B_EW`)
  for (let y = 7; y <= 11; y++) {
    overhead[y][14] = 'B_EW';
  }

  // Underpass beneath Bridge 2: East-West passage at y=9 on ground (cols 12..15)
  carve([
    [12, 9], [13, 9], [14, 9], [15, 9]
  ]);
  ground[9][14] = 'B_EW';

  // North ramp descending North off Bridge 2 at (14, 6)
  ground[6][14] = 'R_S';

  // Exit corridor: North sanctuary at (8, 1) sealed by Azure Door at (8, 3)
  carve([
    [8, 1], [8, 2], [8, 3]
  ]);

  // Reclaim NW dead space (rows 1..4, cols 1..6) - walled off from North sanctuary at col 7
  carve([
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
    [1, 2], [3, 2], [5, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
    [1, 4], [3, 4], [5, 4]
  ]);

  // Reclaim NE dead space (rows 1..4, cols 10..15) - walled off from North sanctuary at col 9
  carve([
    [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
    [11, 2], [13, 2], [15, 2],
    [10, 3], [11, 3], [12, 3], [13, 3], [14, 3], [15, 3],
    [11, 4], [13, 4], [15, 4]
  ]);

  // Reclaim SW dead space (rows 7..13, cols 1..6)
  carve([
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7],
    [1, 8], [3, 8], [5, 8],
    [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9],
    [1, 10], [3, 10], [5, 10],
    [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11],
    [1, 12], [3, 12], [5, 12],
    [1, 13], [2, 13], [3, 13], [4, 13], [5, 13], [6, 13]
  ]);

  // Reclaim SE dead space (rows 7..13, cols 9..12 and 15..16)
  carve([
    [9, 7], [10, 7], [11, 7],
    [9, 8], [11, 8],
    [9, 9], [10, 9], [11, 9],
    [9, 10], [11, 10],
    [9, 11], [10, 11], [11, 11],
    [9, 12], [11, 12],
    [9, 13], [10, 13], [11, 13],
    [15, 7], [15, 8], [15, 10], [15, 11], [15, 12], [15, 13]
  ]);

  // Secret wall into cyan crystal grotto
  ground[11][3] = 'SW';

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '7',
    chapter: 'chapter_2',
    zone: 'zone_2',
    title: 'The Sunken Chasm',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'jungle'
    },
    spawn: { x: 2, y: 5, elevation: 0, style: 'wall_doorway', wallDirection: 'north' },
    exit: { x: 8, y: 1, elevation: 0, style: 'wall_archway', wallDirection: 'north' },
    parSteps: 45,
    parTime: 27,
    architectNote: "Architect's Journal: The Sunken Chasm weaves two perpendicular viaducts across the chasm rift. Navigate the lower canals beneath the east-west bridge, then ascend to claim the azure keystone atop the north-south trestle.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_arch_7',
        type: 'signpost',
        title: "Architect's Note #7",
        x: 3,
        y: 5,
        elevation: 0,
        text: "Architect's Journal: The Sunken Chasm weaves two perpendicular viaducts across the chasm rift. Navigate the lower canals beneath the east-west bridge, then ascend to claim the azure keystone atop the north-south trestle."
      },
      {
        id: 'inscr_chasm_7',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'Perpendicular arches intersect above the deep canal. The path of height meets the path of depth.',
        playerDialogue: 'Both bridges must be traversed to reach the sanctum.',
        x: 3,
        y: 4,
        elevation: 0
      },
      {
        id: 'key_azure_7',
        type: 'key',
        color: '#06b6d4',
        x: 14,
        y: 9,
        z: 1,
        elevation: 1
      },
      {
        id: 'door_azure_7',
        type: 'door',
        color: '#06b6d4',
        requiresKey: 'key_azure_7',
        x: 8,
        y: 3,
        elevation: 0
      },
      {
        id: 'secret_gem_7',
        type: 'collectible',
        name: 'Chasm Aquamarine',
        points: 350,
        x: 2,
        y: 11,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 8: "Citadel of the Two Horizons" (19x17)
// ---------------------------------------------------------------------------
export function generateLevel8() {
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

  // Central Bastion Courtyard (spawn at 9, 8)
  carve([
    [7, 7], [8, 7], [9, 7], [10, 7], [11, 7],
    [7, 8], [8, 8], [9, 8], [10, 8], [11, 8],
    [7, 9], [8, 9], [9, 9], [10, 9], [11, 9]
  ]);

  // West ground underpass corridor leading to West Bridge southern ramp at (5, 12)
  carve([
    [6, 8], [5, 8], [4, 8], [3, 8],
    [5, 13], [5, 14], [4, 14], [3, 14],
    [3, 13], [3, 12], [4, 12], [5, 12]
  ]);
  // Ground underpass under West Bridge at (5, 8)
  ground[8][5] = 'B_EW';

  // West Bridge South Ramp at (5, 12) climbing North onto West Bridge at (5, 11)
  ground[12][5] = 'R_N';

  // West Bridge overhead deck: x=5, y=5..11 (`B_EW`)
  for (let y = 5; y <= 11; y++) {
    overhead[y][5] = 'B_EW';
  }

  // Elevated Wall-Walk parapets connecting West Bridge to citadel fortress walls
  for (const x of [3, 4]) {
    overhead[6][x] = 'WW';
    overhead[10][x] = 'WW';
  }

  // West Bridge North Ramp at (5, 4) descending North onto ground at (5, 3)
  ground[4][5] = 'R_S';
  // Loop West Bridge descent back into Central Bastion at (7, 7)
  carve([
    [5, 3], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]
  ]);

  // Ruby Door at (12, 8) blocking passage from Central Courtyard (11, 8) to East Bridge approach
  carve([
    [12, 8], [13, 8], [14, 8], [15, 8],
    [13, 13], [13, 14], [14, 14], [15, 14],
    [15, 13], [15, 12], [14, 12], [13, 12]
  ]);
  // Ground underpass under East Bridge at (13, 8)
  ground[8][13] = 'B_EW';

  // East Bridge South Ramp at (13, 12) climbing North onto East Bridge at (13, 11)
  ground[12][13] = 'R_N';

  // East Bridge overhead deck: x=13, y=5..11 (`B_EW`)
  for (let y = 5; y <= 11; y++) {
    overhead[y][13] = 'B_EW';
  }

  // East Bridge North Ramp at (13, 4) descending North onto ground at (13, 3)
  ground[4][13] = 'R_S';
  carve([
    [13, 3], [12, 3], [11, 3],
    [10, 3] // Gold Door at (10, 3)
  ]);

  // North Sanctuary (exit at 9, 2)
  carve([
    [9, 3],
    [9, 2]
  ]);

  // Reclaim NW dead space (rows 1..4, cols 1..4)
  carve([
    [1, 1], [2, 1], [3, 1], [4, 1],
    [1, 2], [3, 2],
    [1, 3], [2, 3], [3, 3],
    [1, 4], [3, 4]
  ]);

  // Reclaim NE dead space (rows 1..4, cols 14..17)
  carve([
    [14, 1], [15, 1], [16, 1], [17, 1],
    [15, 2], [17, 2],
    [14, 3], [15, 3], [16, 3], [17, 3],
    [15, 4], [17, 4]
  ]);

  // Reclaim Far-West dead space (rows 5..11, cols 1..2)
  carve([
    [1, 5], [2, 5], [1, 6], [2, 6],
    [1, 7], [2, 7], [1, 8], [2, 8],
    [1, 9], [2, 9], [1, 10], [2, 10],
    [1, 11], [2, 11]
  ]);

  // Reclaim Far-East dead space (rows 5..11, cols 16..17)
  carve([
    [16, 5], [17, 5], [16, 6], [17, 6],
    [16, 7], [17, 7], [16, 8], [17, 8],
    [16, 9], [17, 9], [16, 10], [17, 10],
    [16, 11], [17, 11]
  ]);

  // Reclaim SW lower casemates (rows 12..15, cols 1..2 and 7..11)
  carve([
    [1, 12], [2, 12], [1, 13], [2, 13], [1, 14], [2, 14], [1, 15], [2, 15],
    [7, 12], [8, 12], [9, 12], [10, 12], [11, 12],
    [7, 13], [9, 13], [11, 13],
    [7, 14], [8, 14], [9, 14], [10, 14], [11, 14],
    [9, 15]
  ]);

  // Reclaim SE lower casemates (rows 12..15, cols 16..17)
  carve([
    [16, 12], [17, 12], [16, 13], [17, 13], [16, 14], [17, 14], [16, 15], [17, 15]
  ]);

  // Secret sunstone vault at (2, 15)
  ground[14][2] = 'SW';

  const level = {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '8',
    chapter: 'chapter_2',
    zone: 'zone_2',
    title: 'Citadel of the Two Horizons',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'jungle'
    },
    spawn: { x: 9, y: 8, elevation: 0, style: 'stairs_down', wallDirection: 'none' },
    exit: { x: 9, y: 2, elevation: 0, style: 'wall_archway', wallDirection: 'north' },
    parSteps: 68,
    parTime: 41,
    architectNote: "Architect's Journal: The Citadel commands twin parallel viaducts crowning the western and eastern horizons. Claim the Ruby Horizon Key from the west ramparts to release the eastern portcullis, then ascend the second horizon to breach the northern high keep.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_arch_8',
        type: 'signpost',
        title: "Architect's Note #8",
        x: 9,
        y: 7,
        elevation: 0,
        text: "Architect's Journal: The Citadel commands twin parallel viaducts crowning the western and eastern horizons. Claim the Ruby Horizon Key from the west ramparts to release the eastern portcullis, then ascend the second horizon to breach the northern high keep."
      },
      {
        id: 'inscr_citadel_8',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'Two horizons flank the throne. West unlocks East, and East crowns the sovereign.',
        playerDialogue: 'A sequential ascent across twin towers.',
        x: 8,
        y: 7,
        elevation: 0
      },
      {
        id: 'key_ruby_8',
        type: 'key',
        color: '#ef4444',
        x: 5,
        y: 8,
        z: 1,
        elevation: 1
      },
      {
        id: 'door_ruby_8',
        type: 'door',
        color: '#ef4444',
        requiresKey: 'key_ruby_8',
        x: 12,
        y: 8,
        elevation: 0
      },
      {
        id: 'key_gold_8',
        type: 'key',
        color: '#eab308',
        x: 13,
        y: 8,
        z: 1,
        elevation: 1
      },
      {
        id: 'door_gold_8',
        type: 'door',
        color: '#eab308',
        requiresKey: 'key_gold_8',
        x: 10,
        y: 3,
        elevation: 0
      },
      {
        id: 'secret_gem_8',
        type: 'collectible',
        name: 'Citadel Horizon Sunstone',
        points: 400,
        x: 2,
        y: 15,
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
  console.log('--- Overhauling Chapter 2 (Levels 5–8) ---');

  const generators = [
    { num: 5, fn: generateLevel5 },
    { num: 6, fn: generateLevel6 },
    { num: 7, fn: generateLevel7 },
    { num: 8, fn: generateLevel8 }
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

    // Calibrate parSteps
    level.parSteps = Math.ceil(optimalSteps * 1.18);
    level.parTime = Math.ceil(level.parSteps * 0.55);

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
    const filePath = path.join(rootDir, `levels/chapter_2/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 2 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
