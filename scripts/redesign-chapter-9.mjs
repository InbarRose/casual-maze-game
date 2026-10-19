/**
 * Redesign and Solver Calibration for Chapter 9: Sunken Aqueducts (Levels 33–36)
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
// LEVEL 33: "The Sluice Gate" (17x17)
// ---------------------------------------------------------------------------
export function generateLevel33() {
  const file = path.join(rootDir, 'levels/chapter_9/level_33.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const o = level.layers.overhead;

  // Add wall-walk ramparts on aqueduct retaining walls connecting to the sluice bridge platform
  o[6][8] = 'WW';
  o[6][9] = 'WW';
  o[8][8] = 'WW';
  o[8][9] = 'WW';

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 34: "Submerged Crossings" (17x17)
// ---------------------------------------------------------------------------
export function generateLevel34() {
  const file = path.join(rootDir, 'levels/chapter_9/level_34.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const o = level.layers.overhead;

  // Add wall-walk ramparts on embankment walls connecting to the canal bridge span
  o[4][7] = 'WW';
  o[4][9] = 'WW';
  o[6][7] = 'WW';
  o[6][9] = 'WW';

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 35: "The Pressure Basin" (19x19)
// ---------------------------------------------------------------------------
export function generateLevel35() {
  const file = path.join(rootDir, 'levels/chapter_9/level_35.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const o = level.layers.overhead;

  // Add wall-walk ramparts connected to the pressure basin walkway
  o[3][7] = 'WW';
  o[3][8] = 'WW';
  o[1][7] = 'WW';
  o[1][8] = 'WW';

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 36: "Grand Aqueduct Reservoir" (21x21)
// ---------------------------------------------------------------------------
export function generateLevel36() {
  const file = path.join(rootDir, 'levels/chapter_9/level_36.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const o = level.layers.overhead;

  // Add wall-walk ramparts on the reservoir perimeter ramparts connecting to the central viaduct bridge
  o[8][9] = 'WW';
  o[8][11] = 'WW';
  o[10][9] = 'WW';
  o[10][11] = 'WW';

  return level;
}

// ---------------------------------------------------------------------------
// Main Verification & Writer Runner
// ---------------------------------------------------------------------------
async function main() {
  console.log('--- Overhauling Chapter 9 (Levels 33–36) ---');

  const generators = [
    { num: 33, fn: generateLevel33 },
    { num: 34, fn: generateLevel34 },
    { num: 35, fn: generateLevel35 },
    { num: 36, fn: generateLevel36 }
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
    const filePath = path.join(rootDir, `levels/chapter_9/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 9 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
