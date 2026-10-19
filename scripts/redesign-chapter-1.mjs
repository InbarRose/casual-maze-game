/**
 * True Maze Topology & Solver Calibration for Chapter 1: The Foundation (Levels 1–4)
 * Implements BL-158, ADR-0042, and ADR-0043 (True Maze Topology & Labyrinthine Redesign Standard)
 * Replaces open patterned rooms and barcode stripes with winding corridors, 90-degree turns,
 * forks, dead ends, secret walls ('SW'), and strict zero-bypass gating.
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

/**
 * Carves an authentic labyrinth sector using DFS with directional inertia and braid.
 * Produces long, organic corridors with 90-degree turns, forks, and dead ends.
 */
export function buildLabyrinthSector(ground, minX, minY, maxX, maxY, prngSeed, inertia = 0.70, braid = 0.15, reservedSet = new Set()) {
  let s = prngSeed;
  function random() {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  }

  const oddCoords = [];
  for (let y = minY; y <= maxY; y += 2) {
    for (let x = minX; x <= maxX; x += 2) {
      if (!reservedSet.has(`${x},${y}`)) {
        oddCoords.push([x, y]);
      }
    }
  }

  if (oddCoords.length === 0) return;

  const visited = new Set();
  function k(x, y) { return `${x},${y}`; }

  const start = oddCoords[0];
  const stack = [[start[0], start[1]]];
  visited.add(k(start[0], start[1]));
  ground[start[1]][start[0]] = 0;

  const DIRS = [
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 }
  ];

  let lastDir = null;

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];

    const neighbors = [];
    for (const d of DIRS) {
      const nx = cx + d.dx;
      const ny = cy + d.dy;
      const mx = cx + d.dx / 2;
      const my = cy + d.dy / 2;
      if (
        nx >= minX && nx <= maxX &&
        ny >= minY && ny <= maxY &&
        !reservedSet.has(k(nx, ny)) &&
        !reservedSet.has(k(mx, my)) &&
        !visited.has(k(nx, ny))
      ) {
        neighbors.push({ ...d, nx, ny, mx, my });
      }
    }

    if (neighbors.length === 0) {
      stack.pop();
      lastDir = null;
      continue;
    }

    let chosen = null;
    if (lastDir && random() < inertia) {
      const same = neighbors.find(n => n.dx === lastDir.dx && n.dy === lastDir.dy);
      if (same) chosen = same;
    }

    if (!chosen) {
      chosen = neighbors[Math.floor(random() * neighbors.length)];
    }

    lastDir = { dx: chosen.dx, dy: chosen.dy };

    ground[chosen.my][chosen.mx] = 0;
    ground[chosen.ny][chosen.nx] = 0;

    visited.add(k(chosen.nx, chosen.ny));
    stack.push([chosen.nx, chosen.ny]);
  }

  // Connect any unvisited odd cells in this sector
  for (const [ox, oy] of oddCoords) {
    if (!visited.has(k(ox, oy))) {
      const candidates = [];
      for (const d of DIRS) {
        const nx = ox + d.dx;
        const ny = oy + d.dy;
        const mx = ox + d.dx / 2;
        const my = oy + d.dy / 2;
        if (visited.has(k(nx, ny)) && !reservedSet.has(k(mx, my))) {
          candidates.push({ ...d, nx, ny, mx, my });
        }
      }
      if (candidates.length > 0) {
        const c = candidates[Math.floor(random() * candidates.length)];
        ground[oy][ox] = 0;
        ground[c.my][c.mx] = 0;
        visited.add(k(ox, oy));
      }
    }
  }

  // Braid phase (selective loop creation)
  for (const [ox, oy] of oddCoords) {
    const walls = [];
    for (const d of DIRS) {
      const mx = ox + d.dx / 2;
      const my = oy + d.dy / 2;
      const nx = ox + d.dx;
      const ny = oy + d.dy;
      if (
        nx >= minX && nx <= maxX && ny >= minY && ny <= maxY &&
        !reservedSet.has(k(mx, my)) && !reservedSet.has(k(nx, ny)) &&
        ground[my][mx] === 1 && ground[ny][nx] === 0
      ) {
        walls.push([mx, my]);
      }
    }
    if (walls.length > 0 && random() < braid) {
      const [wx, wy] = walls[Math.floor(random() * walls.length)];
      ground[wy][wx] = 0;
    }
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
  const reserved = new Set();

  for (let x = 0; x < width; x++) { reserved.add(`${x},0`); reserved.add(`${x},${height - 1}`); }
  for (let y = 0; y < height; y++) { reserved.add(`0,${y}`); reserved.add(`${width - 1},${y}`); }

  // Spawn (2, 2) and Architect Note at (2, 1)
  ground[2][2] = 0; reserved.add('2,2');
  ground[1][2] = 0; reserved.add('2,1');
  ground[2][1] = 0; reserved.add('1,2');
  ground[1][1] = 0; reserved.add('1,1');
  // East corridor from spawn
  ground[2][3] = 0; reserved.add('3,2');

  // Key at (2, 10)
  ground[10][2] = 0; reserved.add('2,10');

  // Exit chamber at (11, 6) sealed by door at (9, 6)
  for (let y = 4; y <= 8; y++) {
    ground[y][10] = 1;
    reserved.add(`10,${y}`);
  }
  ground[6][10] = 0; reserved.add('10,6');
  ground[6][9] = 0; reserved.add('9,6'); // Gold Door at (9, 6)
  ground[6][11] = 0; reserved.add('11,6'); // Exit at (11, 6)

  // Build authentic DFS labyrinth in main zone (x: 1..9, y: 1..11)
  buildLabyrinthSector(ground, 1, 1, 9, 11, 104, 0.70, 0.15, reserved);

  // Upper East alcove (10..11, 1..3)
  for (let y = 1; y <= 3; y++) {
    ground[y][10] = 0;
    ground[y][11] = 0;
  }
  // Lower East alcove (10..11, 9..11)
  for (let y = 9; y <= 11; y++) {
    ground[y][10] = 0;
    ground[y][11] = 0;
  }

  // Secret sunstone vault at (5, 1) via secret wall at (4, 1)
  ground[1][4] = 'SW';
  ground[1][5] = 0;

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
    parSteps: 37,
    parTime: 21,
    architectNote: "Architect's Note #1: Every grand labyrinth begins with a single step. Beyond this entry vestibule lies the Golden Gate. Follow the winding corridors to recover the keystore; avoid dead-end traps.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_ch1_1',
        type: 'signpost',
        title: "Architect's Note #1",
        x: 2,
        y: 1,
        elevation: 0,
        text: "Architect's Note #1: Every grand labyrinth begins with a single step. Beyond this entry vestibule lies the Golden Gate. Follow the winding corridors to recover the keystore; avoid dead-end traps."
      },
      {
        id: 'inscr_vestibule',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'Ancient script: He who walks the winding way learns patience and cunning.',
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
  const reserved = new Set();

  for (let x = 0; x < width; x++) { reserved.add(`${x},0`); reserved.add(`${x},${height - 1}`); }
  for (let y = 0; y < height; y++) { reserved.add(`0,${y}`); reserved.add(`${width - 1},${y}`); }

  // North Sanctuary: rows 1..3, cols 6..8. Exit at (7, 1) sealed by Ruby Door at (7, 3)
  for (let y = 1; y <= 3; y++) {
    for (let x = 6; x <= 8; x++) {
      ground[y][x] = 1;
      reserved.add(`${x},${y}`);
    }
  }
  ground[1][7] = 0; reserved.add('7,1'); // Exit
  ground[2][7] = 0; reserved.add('7,2');
  ground[3][7] = 0; reserved.add('7,3'); // Ruby Door

  // Spawn at (7, 11)
  ground[11][7] = 0; reserved.add('7,11');
  // Ruby Key at (2, 4) in West Wing
  ground[4][2] = 0; reserved.add('2,4');

  // Build authentic DFS labyrinths in West and East wings
  buildLabyrinthSector(ground, 1, 1, 5, 11, 204, 0.70, 0.15, reserved);
  buildLabyrinthSector(ground, 9, 1, 13, 11, 254, 0.70, 0.15, reserved);

  // Central corridor & arteries
  for (let x = 5; x <= 9; x++) ground[11][x] = 0;
  for (let y = 4; y <= 11; y++) ground[y][7] = 0;
  ground[7][6] = 0; ground[7][8] = 0;

  // Secret Bloodstone Chamber at (12, 1) via secret wall at (10, 2)
  ground[2][10] = 'SW';
  ground[1][12] = 0;

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
    parSteps: 31,
    parTime: 18,
    architectNote: "Architect's Journal: The North Sanctuary lies sealed by the ancient Ruby Lock. The western labyrinth winds into the deep vault where the Ruby Key is kept. Beware deceptive dead-ends.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_ch1_2',
        type: 'signpost',
        title: "Architect's Note #2",
        x: 7,
        y: 10,
        elevation: 0,
        text: "Architect's Journal: The North Sanctuary lies sealed by the ancient Ruby Lock. The western labyrinth winds into the deep vault where the Ruby Key is kept. Beware deceptive dead-ends."
      },
      {
        id: 'inscr_ruby_altar',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'The ruby glow beckons through the winding dark.',
        playerDialogue: 'West holds the key; North holds the gate.',
        x: 7,
        y: 9,
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
        x: 13,
        y: 5,
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
  const reserved = new Set();

  for (let x = 0; x < width; x++) { reserved.add(`${x},0`); reserved.add(`${x},${height - 1}`); }
  for (let y = 0; y < height; y++) { reserved.add(`0,${y}`); reserved.add(`${width - 1},${y}`); }

  // Central Dais (Exit at 8, 7; entry ONLY via Purple Door at 9, 6)
  for (let y = 6; y <= 8; y++) {
    for (let x = 7; x <= 9; x++) {
      ground[y][x] = 1;
      reserved.add(`${x},${y}`);
    }
  }
  ground[7][8] = 0; reserved.add('8,7'); // Exit
  ground[6][8] = 0; reserved.add('8,6');
  ground[6][9] = 0; reserved.add('9,6'); // Purple Door

  // Emerald Wall separating West from East along column 7
  for (let y = 1; y <= 13; y++) {
    ground[y][7] = 1;
    reserved.add(`7,${y}`);
  }
  ground[12][7] = 0; reserved.add('7,12'); // Emerald Door

  // Key locations:
  ground[13][3] = 0; reserved.add('3,13'); // Emerald Key
  ground[11][13] = 0; reserved.add('13,11'); // Purple Key
  // Spawn at (2, 7)
  ground[7][2] = 0; reserved.add('2,7');

  // Sector 1: West Wing (x: 1..5, y: 1..13)
  buildLabyrinthSector(ground, 1, 1, 5, 13, 301, 0.70, 0.15, reserved);
  // Sector 2: East Wing (x: 9..15, y: 1..13)
  buildLabyrinthSector(ground, 9, 1, 15, 13, 351, 0.70, 0.15, reserved);

  // Connect West Wing to Emerald Door
  ground[12][6] = 0; ground[12][5] = 0;
  // Connect East Wing from Emerald Door
  ground[12][8] = 0; ground[12][9] = 0;
  // Connect East Wing to Purple Door approach
  ground[6][10] = 0;

  // Connect spawn & keys cleanly
  ground[7][1] = 0; ground[7][3] = 0;
  ground[12][3] = 0;
  ground[11][14] = 0; ground[11][12] = 0;

  // Dead-space avoidance along column 6 and 8
  for (let y = 1; y <= 11; y += 2) {
    if (y !== 7) ground[y][6] = 0;
    if (y !== 5 && y !== 7) ground[y][8] = 0;
  }
  // Ensure (8, 5) is solid wall to prevent bypassing Purple Door
  ground[5][8] = 1;

  // Secret prismatic shard at (13, 1) via secret wall at (13, 4)
  ground[4][13] = 'SW';
  ground[1][13] = 0;

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
    parTime: 25,
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
  const reserved = new Set();

  for (let x = 0; x < width; x++) { reserved.add(`${x},0`); reserved.add(`${x},${height - 1}`); }
  for (let y = 0; y < height; y++) { reserved.add(`0,${y}`); reserved.add(`${width - 1},${y}`); }

  // Central crossing at (9, 8)
  ground[8][9] = 0; reserved.add('9,8');
  // Arteries from center:
  ground[7][9] = 0; ground[6][9] = 0; ground[5][9] = 0; // North artery
  ground[8][8] = 0; ground[8][7] = 0; ground[8][6] = 0; // West artery
  ground[8][10] = 0; ground[8][11] = 0; ground[8][12] = 0; // East artery

  // South Triune Sanctum (col 9, y: 11..15)
  for (let y = 11; y <= 15; y++) {
    ground[y][8] = 1; ground[y][10] = 1;
    reserved.add(`8,${y}`); reserved.add(`10,${y}`);
    ground[y][9] = 0; reserved.add(`9,${y}`);
  }
  ground[9][9] = 0; ground[10][9] = 0;

  // Key locations:
  ground[8][2] = 0; reserved.add('2,8'); // Ruby Key
  ground[8][16] = 0; reserved.add('16,8'); // Emerald Key
  ground[2][8] = 0; reserved.add('8,2'); // Blue Key

  // Build authentic DFS labyrinths in 3 wings
  buildLabyrinthSector(ground, 1, 1, 17, 5, 401, 0.70, 0.15, reserved);
  buildLabyrinthSector(ground, 1, 7, 7, 15, 411, 0.70, 0.15, reserved);
  buildLabyrinthSector(ground, 11, 7, 17, 15, 421, 0.70, 0.15, reserved);

  // Secret Wall at (4, 13) leading to Abyssal Sapphire at (4, 14)
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
    architectNote: "Architect's Journal: The Triune Sanctum to the south requires all three resonance keys—Ruby, Emerald, and Sapphire. The labyrinth wings connect all three cathedral chambers beneath the shrouded mist.",
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_ch1_4',
        type: 'signpost',
        title: "Architect's Note #4",
        x: 9,
        y: 7,
        elevation: 0,
        text: "Architect's Journal: The Triune Sanctum to the south requires all three resonance keys—Ruby, Emerald, and Sapphire. The labyrinth wings connect all three cathedral chambers beneath the shrouded mist."
      },
      {
        id: 'inscr_cathedral',
        type: 'wall_decor',
        decorType: 'carving',
        text: 'The cathedral bells echo through the fog. Seek the three sacred chambers in any order.',
        playerDialogue: 'The corridors branch into three deep wings.',
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

    // Calibrate parSteps
    if (num === 1) {
      level.parSteps = 26;
      level.parTime = 14;
    } else {
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
