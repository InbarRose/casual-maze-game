/**
 * Redesign and Solver Calibration for Chapter 3: Clockwork Foundry (Levels 9–12)
 * Implements BL-152, ADR-0039 (Zero Dead Space, Clockwork Machinery, Zero-Bypass Gating)
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
// LEVEL 9: "The Iron Lever" (15x13)
// ---------------------------------------------------------------------------
export function generateLevel9() {
  const file = path.join(rootDir, 'levels/chapter_3/level_9.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;

  // Carve secret foundry cistern in rows 10..11, cols 5..7
  g[10][5] = 0; g[10][6] = 0; g[10][7] = 0;
  g[11][5] = 0; g[11][6] = 0; g[11][7] = 0;
  g[9][5] = 'SW';

  // Add secret collectible
  if (!level.entities.some(e => e.id === 'secret_gear_9')) {
    level.entities.push({
      id: 'secret_gear_9',
      type: 'collectible',
      name: 'Forgemaster Gear',
      points: 250,
      x: 6,
      y: 11,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 10: "Clockwork Gates" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel10() {
  const file = path.join(rootDir, 'levels/chapter_3/level_10.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;

  // Carve top-right machinery gallery (rows 1..3, cols 8..13)
  g[1][8] = 0; g[1][9] = 0; g[1][10] = 0; g[1][11] = 0; g[1][12] = 0; g[1][13] = 0;
  g[2][8] = 0; g[2][10] = 0; g[2][12] = 0;
  g[3][8] = 0; g[3][9] = 0; g[3][10] = 0; g[3][11] = 0; g[3][12] = 0; g[3][13] = 0;

  // Carve lower-left dead space (rows 10..13, cols 2..3)
  g[10][2] = 0; g[10][3] = 0;
  g[11][2] = 0; g[11][3] = 0;
  g[12][2] = 0; g[12][3] = 0;
  g[13][2] = 0; g[13][3] = 0;
  g[9][2] = 'SW'; // Secret wall from (2, 8) into west hydraulic vault

  // Carve lower-right dead space (rows 10..13, cols 13..14)
  g[10][13] = 0; g[10][14] = 0;
  g[11][13] = 0; g[11][14] = 0;
  g[12][13] = 0; g[12][14] = 0;
  g[13][13] = 0; g[13][14] = 0;
  g[9][14] = 'SW'; // Secret wall from (14, 8) into east steam vault

  // Add secret collectibles
  if (!level.entities.some(e => e.id === 'secret_valve_10')) {
    level.entities.push({
      id: 'secret_valve_10',
      type: 'collectible',
      name: 'Brass Chronometer',
      points: 300,
      x: 3,
      y: 12,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 11: "Shifting Foundations" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel11() {
  const file = path.join(rootDir, 'levels/chapter_3/level_11.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;

  // Carve lower-left machinery shafts (rows 6..13, cols 2..7)
  for (let y = 6; y <= 13; y++) {
    g[y][2] = 0; g[y][3] = 0;
    g[y][5] = 0; g[y][6] = 0; g[y][7] = 0;
  }
  g[7][4] = 0; g[10][4] = 0; g[13][4] = 0;
  g[6][2] = 'SW'; // Secret wall from (2, 5) into counterweight basement

  // Add secret collectible
  if (!level.entities.some(e => e.id === 'secret_counterweight_11')) {
    level.entities.push({
      id: 'secret_counterweight_11',
      type: 'collectible',
      name: 'Gilded Flywheel',
      points: 300,
      x: 6,
      y: 12,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 12: "Master of Wheels" (19x17)
// ---------------------------------------------------------------------------
export function generateLevel12() {
  const file = path.join(rootDir, 'levels/chapter_3/level_12.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;

  // Carve NW steam wheel vault (rows 1..3, cols 2..4)
  g[1][2] = 0; g[1][3] = 0; g[1][4] = 0;
  g[2][2] = 0; g[2][4] = 0;
  g[3][2] = 0; g[3][3] = 0; g[3][4] = 0;
  g[4][2] = 'SW';

  // Carve NE steam wheel vault (rows 1..3, cols 14..16)
  g[1][14] = 0; g[1][15] = 0; g[1][16] = 0;
  g[2][14] = 0; g[2][16] = 0;
  g[3][14] = 0; g[3][15] = 0; g[3][16] = 0;
  g[4][16] = 'SW';

  // Carve SW steam gear vault (rows 13..15, cols 2..4)
  g[13][2] = 0; g[13][3] = 0; g[13][4] = 0;
  g[14][2] = 0; g[14][3] = 0; g[14][4] = 0;
  g[15][2] = 0; g[15][3] = 0; g[15][4] = 0;
  g[12][2] = 'SW';

  // Carve SE steam gear vault (rows 13..15, cols 14..16)
  g[13][14] = 0; g[13][15] = 0; g[13][16] = 0;
  g[14][14] = 0; g[14][16] = 0;
  g[15][14] = 0; g[15][15] = 0; g[15][16] = 0;
  g[12][16] = 'SW';

  // Add secret collectible
  if (!level.entities.some(e => e.id === 'secret_dynamo_12')) {
    level.entities.push({
      id: 'secret_dynamo_12',
      type: 'collectible',
      name: 'Dynamo Core Crystal',
      points: 400,
      x: 3,
      y: 14,
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
  console.log('--- Overhauling Chapter 3 (Levels 9–12) ---');

  const generators = [
    { num: 9, fn: generateLevel9 },
    { num: 10, fn: generateLevel10 },
    { num: 11, fn: generateLevel11 },
    { num: 12, fn: generateLevel12 }
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
    const hasLevers = level.entities.some(e => e.type === 'lever');
    if (hasDoors) {
      const bypass = solveLevel(level, { allowDoors: false });
      if (bypass !== null) throw new Error(`Level ${num} fails zero-bypass doors!`);
    }
    if (hasLevers) {
      const bypass = solveLevel(level, { allowLevers: false });
      if (bypass !== null) throw new Error(`Level ${num} fails zero-bypass levers!`);
    }
    console.log(`✓ Level ${num}: 100% Zero-bypass gating verified.`);

    // 5. Full Engine Playthrough Simulation
    simulateCampaignLevelPlaythrough(level);
    console.log(`✓ Level ${num}: Engine simulation passed!`);

    // Write file
    const filePath = path.join(rootDir, `levels/chapter_3/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 3 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
