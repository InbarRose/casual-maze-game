/**
 * Redesign and Solver Calibration for Chapter 4: Astral Rifts (Levels 13–16)
 * Implements BL-152, ADR-0039 (Zero Dead Space, Astral Shrines, Zero-Bypass Gating)
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
// LEVEL 13: "The First Rift" (15x13)
// ---------------------------------------------------------------------------
export function generateLevel13() {
  const file = path.join(rootDir, 'levels/chapter_4/level_13.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;

  // Carve central dividing wall into astral pillars (rows 2..10, cols 6..8)
  for (let y = 2; y <= 10; y++) {
    g[y][7] = 0;
  }
  g[3][6] = 0; g[3][8] = 0;
  g[6][6] = 0; g[6][8] = 0;
  g[9][6] = 0; g[9][8] = 0;
  g[6][5] = 'SW'; // Secret wall from (4, 6) into central void shrine

  // Introduce 3D verticality: overhead skywalk across row 3 overlooking central astral rift
  level.layers.overhead[3][5] = 'WW';
  level.layers.overhead[3][6] = 'PLATFORM';
  level.layers.overhead[3][7] = 'PLATFORM';
  level.layers.overhead[3][8] = 'PLATFORM';
  level.layers.overhead[3][9] = 'WW';
  g[4][5] = 'R_N';
  g[4][9] = 'R_N';

  // Add secret collectible
  if (!level.entities.some(e => e.id === 'secret_astral_13')) {
    level.entities.push({
      id: 'secret_astral_13',
      type: 'collectible',
      name: 'Astral Rift Shard',
      points: 250,
      x: 7,
      y: 6,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 14: "Twinned Portals" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel14() {
  const file = path.join(rootDir, 'levels/chapter_4/level_14.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;

  // Carve lower-left dead space (rows 12..13, col 2)
  g[12][2] = 0; g[13][2] = 0;
  g[12][3] = 'SW'; // Secret wall from (3, 12) into hidden star observatory

  // Introduce 3D verticality: overhead spire skybridge across row 4 overlooking twin rifts
  level.layers.overhead[4][7] = 'WW';
  level.layers.overhead[4][8] = 'PLATFORM';
  level.layers.overhead[4][9] = 'PLATFORM';
  level.layers.overhead[4][10] = 'WW';
  g[5][7] = 'R_N';
  g[5][10] = 'R_N';

  // Add secret collectible
  if (!level.entities.some(e => e.id === 'secret_star_14')) {
    level.entities.push({
      id: 'secret_star_14',
      type: 'collectible',
      name: 'Twin Star Quartz',
      points: 300,
      x: 2,
      y: 13,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 15: "Dimensional Warp" (19x15)
// ---------------------------------------------------------------------------
export function generateLevel15() {
  const file = path.join(rootDir, 'levels/chapter_4/level_15.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;

  // Carve upper-right celestial sanctum (rows 1..8, cols 11..17)
  for (let y = 1; y <= 8; y++) {
    g[y][12] = 0; g[y][13] = 0;
    g[y][15] = 0; g[y][16] = 0;
  }
  g[2][14] = 0; g[5][14] = 0; g[8][14] = 0;
  g[5][10] = 'SW'; g[5][11] = 0; // Secret wall from (9, 5) into celestial sanctum
  for (let x = 11; x <= 17; x++) {
    g[9][x] = 1;
  }

  // Carve between cols 6..9
  g[2][7] = 0; g[3][7] = 0;
  g[2][8] = 0; g[3][8] = 0;
  g[2][6] = 'SW';

  // Introduce 3D verticality: wall-walk battlements connecting to the bridge deck
  level.layers.overhead[6][7] = 'WW';
  level.layers.overhead[6][8] = 'WW';
  level.layers.overhead[6][10] = 'WW';
  level.layers.overhead[6][11] = 'WW';

  // Add secret collectible
  if (!level.entities.some(e => e.id === 'secret_warp_15')) {
    level.entities.push({
      id: 'secret_warp_15',
      type: 'collectible',
      name: 'Warp Horizon Pearl',
      points: 350,
      x: 14,
      y: 5,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 16: "The Astral Nexus" (19x19)
// ---------------------------------------------------------------------------
export function generateLevel16() {
  const file = path.join(rootDir, 'levels/chapter_4/level_16.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;

  // Carve NW astral observatory (rows 1..4, cols 2..4)
  g[1][2] = 0; g[1][3] = 0; g[1][4] = 0;
  g[2][2] = 0; g[2][4] = 0;
  g[3][2] = 0; g[3][3] = 0; g[3][4] = 0;
  g[4][3] = 'SW';

  // Carve NE astral observatory (rows 1..4, cols 14..16)
  g[1][14] = 0; g[1][15] = 0; g[1][16] = 0;
  g[2][14] = 0; g[2][16] = 0;
  g[3][14] = 0; g[3][15] = 0; g[3][16] = 0;
  g[4][15] = 'SW';

  // Carve Central Nexus Chamber (rows 6..9, cols 8..10)
  g[6][8] = 0; g[6][9] = 0; g[6][10] = 0;
  g[7][8] = 0; g[7][9] = 0; g[7][10] = 0;
  g[8][8] = 0; g[8][9] = 0; g[8][10] = 0;
  g[10][9] = 'SW'; // Secret wall from (9, 11) into nexus center

  // Carve lower-left crypt (rows 14..17, cols 2..4)
  for (let y = 14; y <= 17; y++) {
    g[y][2] = 0; g[y][4] = 0;
  }
  g[14][3] = 0; g[17][3] = 0;
  g[12][3] = 'SW';

  // Carve lower-right crypt (rows 14..17, cols 14..16)
  for (let y = 14; y <= 17; y++) {
    g[y][14] = 0; g[y][16] = 0;
  }
  g[14][15] = 0; g[17][15] = 0;
  g[12][15] = 'SW';

  // Introduce 3D verticality: celestial nexus viaduct spanning over lower crypt corridors
  level.layers.overhead[7][7] = 'WW';
  level.layers.overhead[7][8] = 'PLATFORM';
  level.layers.overhead[7][9] = 'PLATFORM';
  level.layers.overhead[7][10] = 'PLATFORM';
  level.layers.overhead[7][11] = 'WW';
  g[8][7] = 'R_N';
  g[8][11] = 'R_N';

  // Add secret collectible
  if (!level.entities.some(e => e.id === 'secret_nexus_16')) {
    level.entities.push({
      id: 'secret_nexus_16',
      type: 'collectible',
      name: 'Nexus Star Sapphire',
      points: 400,
      x: 9,
      y: 7,
      elevation: 0
    });
  }

  // Ensure Fog of War configuration per BL-88
  level.config.fogOfWar = true;
  level.config.viewRadius = 7;

  return level;
}

// ---------------------------------------------------------------------------
// Main Verification & Writer Runner
// ---------------------------------------------------------------------------
async function main() {
  console.log('--- Overhauling Chapter 4 (Levels 13–16) ---');

  const generators = [
    { num: 13, fn: generateLevel13 },
    { num: 14, fn: generateLevel14 },
    { num: 15, fn: generateLevel15 },
    { num: 16, fn: generateLevel16 }
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

    // 4. Zero Bypass Gating Check
    const hasDoors = level.entities.some(e => e.type === 'door');
    const hasTeleporters = level.entities.some(e => e.type === 'teleporter');
    if (hasDoors) {
      const bypass = solveLevel(level, { allowDoors: false });
      if (bypass !== null) throw new Error(`Level ${num} fails zero-bypass doors!`);
    }
    if (hasTeleporters) {
      const bypass = solveLevel(level, { allowTeleporters: false });
      if (bypass !== null) throw new Error(`Level ${num} fails zero-bypass teleporters!`);
    }
    console.log(`✓ Level ${num}: 100% Zero-bypass gating verified.`);

    // 5. Full Engine Playthrough Simulation
    simulateCampaignLevelPlaythrough(level);
    console.log(`✓ Level ${num}: Engine simulation passed!`);

    // Write file
    const filePath = path.join(rootDir, `levels/chapter_4/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 4 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
