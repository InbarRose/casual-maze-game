/**
 * Redesign and Solver Calibration for Chapter 5: Molten Gauntlet (Levels 17–20)
 * Implements BL-158, ADR-0043 (Authentic Labyrinth Corridors, Wall Ramparts, 3D Bridges & Underpasses)
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
// LEVEL 17: "The Fire Vents" (15x13)
// ---------------------------------------------------------------------------
export function generateLevel17() {
  const file = path.join(rootDir, 'levels/chapter_5/level_17.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Carve labyrinthine corridors with turns and dead ends into previously open rows 5, 6, 7
  g[5][2] = 1;
  g[5][4] = 1;
  g[5][10] = 1;
  g[5][12] = 1;

  g[7][2] = 1;
  g[7][4] = 1;
  g[7][10] = 1;
  g[7][12] = 1;

  // Central elevated basalt bridge over the fire vents at (7, 6) and (8, 6)
  g[6][5] = 1;
  g[6][6] = 1;
  g[6][9] = 1;
  g[6][10] = 1;

  o[6][5] = 'WW';
  o[6][6] = 'WW';
  o[6][7] = 'PLATFORM';
  o[6][8] = 'PLATFORM';
  o[6][9] = 'WW';
  o[6][10] = 'WW';

  // Staircase ramps leading up to the wall-walks
  g[7][5] = 'R_N';
  g[7][10] = 'R_N';

  // Secret alcove with collectible
  g[1][1] = 0;
  g[2][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_molten_17')) {
    level.entities.push({
      id: 'secret_molten_17',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Molten Core Geode',
      scoreValue: 300,
      x: 1,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 18: "The Molten Sentinels" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel18() {
  const file = path.join(rootDir, 'levels/chapter_5/level_18.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add elevated catwalk battlements and overhead bridge overlooking sentinel patrol loop (y=5..9, x=6..10)
  g[4][6] = 'R_S';
  g[4][7] = 1; o[4][7] = 'WW';
  g[4][8] = 1; o[4][8] = 'WW';
  g[4][9] = 1; o[4][9] = 'WW';
  g[4][10] = 'R_S';

  o[5][6] = 'PLATFORM';
  o[5][7] = 'PLATFORM';
  o[5][8] = 'PLATFORM';
  o[5][9] = 'PLATFORM';
  o[5][10] = 'PLATFORM';

  // Secret alcove in lower corridor
  g[13][1] = 0;
  g[12][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_basalt_18')) {
    level.entities.push({
      id: 'secret_basalt_18',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Crystalline Basalt Rose',
      scoreValue: 350,
      x: 1,
      y: 13,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 19: "The Crucible Crossing" (19x15)
// ---------------------------------------------------------------------------
export function generateLevel19() {
  const file = path.join(rootDir, 'levels/chapter_5/level_19.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add elevated viaduct bridge spanning over the glacial beacon checkpoint at (9, 7)
  g[6][9] = 1; o[6][9] = 'WW';
  g[7][9] = 0; o[7][9] = 'PLATFORM';
  g[8][9] = 1; o[8][9] = 'WW';

  g[5][9] = 'R_S';
  g[9][9] = 'R_N';
  g[10][9] = 0;

  // Secret alcove
  g[1][17] = 0;
  g[2][17] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_crucible_19')) {
    level.entities.push({
      id: 'secret_crucible_19',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Crucible Sunstone',
      scoreValue: 400,
      x: 17,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 20: "The Caldera Gauntlet" (21x19)
// ---------------------------------------------------------------------------
export function generateLevel20() {
  const file = path.join(rootDir, 'levels/chapter_5/level_20.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add high observation viaduct battlements across row 8 overlooking the central gauntlet (y=9)
  g[8][9] = 1;
  g[8][11] = 1;
  o[8][8] = 'WW';
  o[8][9] = 'WW';
  o[8][10] = 'PLATFORM';
  o[8][11] = 'WW';
  o[8][12] = 'WW';

  g[7][8] = 'R_S';
  g[7][12] = 'R_S';

  // Secret alcove
  g[1][1] = 0;
  g[2][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_caldera_20')) {
    level.entities.push({
      id: 'secret_caldera_20',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Primal Pyretic Crown',
      scoreValue: 500,
      x: 1,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// Main Verification & Writer Runner
// ---------------------------------------------------------------------------
async function main() {
  console.log('--- Overhauling Chapter 5 (Levels 17–20) ---');

  const generators = [
    { num: 17, fn: generateLevel17 },
    { num: 18, fn: generateLevel18 },
    { num: 19, fn: generateLevel19 },
    { num: 20, fn: generateLevel20 }
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
    level.parSteps = Math.ceil(solution.length * 1.15);
    console.log(`✓ Level ${num}: Solvable in ${solution.length} path nodes (${optimalSteps} steps, parSteps: ${level.parSteps}).`);

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
    const filePath = path.join(rootDir, `levels/chapter_5/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 5 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
