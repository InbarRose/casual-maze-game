/**
 * Redesign and Solver Calibration for Chapter 7: Trials of Ascent & Citadel Bastion (Levels 25–28)
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
// LEVEL 25: "The Sovereign Rampart" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel25() {
  const file = path.join(rootDir, 'levels/chapter_7/level_25.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add wall-walk battlements connecting to the bridge deck at x=5
  // Along the adjacent wall at x=6, y=4..7
  o[4][6] = 'WW';
  o[5][6] = 'WW';
  o[6][6] = 'WW';
  o[7][6] = 'WW';

  // Secret alcove
  g[1][1] = 0;
  g[2][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_rampart_25')) {
    level.entities.push({
      id: 'secret_rampart_25',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Rampart Star Diadem',
      scoreValue: 300,
      x: 1,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 26: "The Frostfire Conduit" (19x15)
// ---------------------------------------------------------------------------
export function generateLevel26() {
  const file = path.join(rootDir, 'levels/chapter_7/level_26.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add wall-walk battlements along wall at y=2, x=8..10 connected to bridge span at y=3
  o[2][8] = 'WW';
  o[2][9] = 'WW';
  o[2][10] = 'WW';

  // Secret alcove
  g[13][1] = 0;
  g[12][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_frostfire_26')) {
    level.entities.push({
      id: 'secret_frostfire_26',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Frostfire Phoenix Feather',
      scoreValue: 350,
      x: 1,
      y: 13,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 27: "The Prismatic Bastion" (19x17)
// ---------------------------------------------------------------------------
export function generateLevel27() {
  const file = path.join(rootDir, 'levels/chapter_7/level_27.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add wall-walk battlements along wall at x=10, y=7..10 connected to bridge span at x=9
  o[7][10] = 'WW';
  o[8][10] = 'WW';
  o[9][10] = 'WW';
  o[10][10] = 'WW';

  // Secret alcove
  g[1][17] = 0;
  g[2][17] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_bastion_27')) {
    level.entities.push({
      id: 'secret_bastion_27',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Prismatic Bastion Aegis',
      scoreValue: 400,
      x: 17,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 28: "The Sovereign's Ascent" (21x19)
// ---------------------------------------------------------------------------
export function generateLevel28() {
  const file = path.join(rootDir, 'levels/chapter_7/level_28.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Add high viaduct bridge across row 8 (cols 8..12) overlooking the central checkpoint at (10, 9)
  g[8][8] = 1; o[8][8] = 'WW';
  g[8][9] = 1; o[8][9] = 'WW';
  o[8][10] = 'PLATFORM';
  g[8][11] = 1; o[8][11] = 'WW';
  g[8][12] = 1; o[8][12] = 'WW';

  g[7][8] = 'R_S';
  g[7][12] = 'R_S';

  // Secret alcove
  g[1][1] = 0;
  g[2][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_sovereign_28')) {
    level.entities.push({
      id: 'secret_sovereign_28',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Sovereign Apex Zenith Star',
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
  console.log('--- Overhauling Chapter 7 (Levels 25–28) ---');

  const generators = [
    { num: 25, fn: generateLevel25 },
    { num: 26, fn: generateLevel26 },
    { num: 27, fn: generateLevel27 },
    { num: 28, fn: generateLevel28 }
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
    const filePath = path.join(rootDir, `levels/chapter_7/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 7 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
