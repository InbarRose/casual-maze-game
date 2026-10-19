/**
 * Redesign and Solver Calibration for Chapter 8: The Shifting Monolith & World Rotation (Levels 29–32)
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
// LEVEL 29: "The Cardinal Needle" (15x15)
// ---------------------------------------------------------------------------
export function generateLevel29() {
  const file = path.join(rootDir, 'levels/chapter_8/level_29.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add elevated catwalk battlements across row 4 overlooking the northern needle
  o[4][5] = 'WW';
  o[4][6] = 'WW';
  o[4][7] = 'PLATFORM';
  o[4][8] = 'WW';
  o[4][9] = 'WW';

  g[3][5] = 'R_S';
  g[3][9] = 'R_S';

  // Secret alcove
  g[1][13] = 0;
  g[2][13] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_needle_29')) {
    level.entities.push({
      id: 'secret_needle_29',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Cardinal Astral Compass Gem',
      scoreValue: 300,
      x: 13,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 30: "The Hidden Underpass" (15x15)
// ---------------------------------------------------------------------------
export function generateLevel30() {
  const file = path.join(rootDir, 'levels/chapter_8/level_30.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add wall-walk battlements connected to the central underpass bridge
  o[5][5] = 'WW';
  o[6][5] = 'WW';
  o[8][9] = 'WW';
  o[9][9] = 'WW';

  // Secret alcove
  g[13][1] = 0;
  g[12][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_underpass_30')) {
    level.entities.push({
      id: 'secret_underpass_30',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Occluded Sunstone',
      scoreValue: 350,
      x: 1,
      y: 13,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 31: "The Four-Faced Pillar" (15x15)
// ---------------------------------------------------------------------------
export function generateLevel31() {
  const file = path.join(rootDir, 'levels/chapter_8/level_31.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add observation catwalk battlements across row 10 overlooking the four-faced pillar
  o[10][9] = 'WW';
  o[10][10] = 'PLATFORM';
  o[10][11] = 'WW';

  g[11][9] = 'R_N';
  g[11][11] = 'R_N';

  // Secret alcove
  g[1][13] = 0;
  g[2][13] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_pillar_31')) {
    level.entities.push({
      id: 'secret_pillar_31',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Four Winds Zephyr Core',
      scoreValue: 400,
      x: 13,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 32: "The Prismatic Spire" (17x17)
// ---------------------------------------------------------------------------
export function generateLevel32() {
  const file = path.join(rootDir, 'levels/chapter_8/level_32.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add wall-walk battlements connected to the existing bridge span
  o[7][4] = 'WW';
  o[9][4] = 'WW';
  o[7][12] = 'WW';
  o[9][12] = 'WW';

  // Secret alcove
  g[1][15] = 0;
  g[2][15] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_spire_32')) {
    level.entities.push({
      id: 'secret_spire_32',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Crown Monolith Prismatic Core',
      scoreValue: 500,
      x: 15,
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
  console.log('--- Overhauling Chapter 8 (Levels 29–32) ---');

  const generators = [
    { num: 29, fn: generateLevel29 },
    { num: 30, fn: generateLevel30 },
    { num: 31, fn: generateLevel31 },
    { num: 32, fn: generateLevel32 }
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
    const hasPuzzles = level.entities.some(e => e.type === 'puzzle_gate');
    const hasLevers = level.entities.some(e => e.type === 'lever');
    const hasTeleporters = level.entities.some(e => e.type === 'teleporter');
    if (hasDoors) {
      const bypass = solveLevel(level, { allowDoors: false });
      if (bypass !== null) throw new Error(`Level ${num} fails zero-bypass doors!`);
    }
    if (hasPuzzles) {
      const bypass = solveLevel(level, { allowPuzzles: false });
      if (bypass !== null) throw new Error(`Level ${num} fails zero-bypass puzzles!`);
    }
    if (hasLevers) {
      const bypass = solveLevel(level, { allowLevers: false });
      if (bypass !== null) throw new Error(`Level ${num} fails zero-bypass levers!`);
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
    const filePath = path.join(rootDir, `levels/chapter_8/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 8 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
