/**
 * Redesign and Solver Calibration for Chapter 6: Arcane Minigames & Grand Archive (Levels 21–24)
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
// LEVEL 21: "The Rune Lock" (15x13)
// ---------------------------------------------------------------------------
export function generateLevel21() {
  const file = path.join(rootDir, 'levels/chapter_6/level_21.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Mezzanine catwalk in the right wing (cols 8..12, row 4)
  // Player must first unlock the Rune Gate at (6, 6) to access the mezzanine
  g[4][8] = 1; o[4][8] = 'WW';
  g[4][9] = 1; o[4][9] = 'WW';
  o[4][10] = 'PLATFORM';
  g[4][11] = 1; o[4][11] = 'WW';
  g[4][12] = 1; o[4][12] = 'WW';

  g[5][8] = 'R_N';
  g[5][12] = 'R_N';

  // Secret alcove
  g[1][1] = 0;
  g[2][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_rune_21')) {
    level.entities.push({
      id: 'secret_rune_21',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Runic Astral Sphere',
      scoreValue: 300,
      x: 1,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 22: "The Cipher Dials" (17x15)
// ---------------------------------------------------------------------------
export function generateLevel22() {
  const file = path.join(rootDir, 'levels/chapter_6/level_22.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Mezzanine catwalk in the upper right wing (cols 9..13, row 4)
  // Overlooking the cipher dial rotunda at (7, 7) and guarding access to azure key
  g[4][9] = 1; o[4][9] = 'WW';
  o[4][10] = 'PLATFORM';
  o[4][11] = 'PLATFORM';
  g[4][12] = 1; o[4][12] = 'WW';
  g[4][13] = 1; o[4][13] = 'WW';

  g[5][9] = 'R_N';
  g[5][13] = 'R_N';

  // Secret alcove
  g[13][1] = 0;
  g[12][1] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_cipher_22')) {
    level.entities.push({
      id: 'secret_cipher_22',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Enigmatic Cipher Chronometer',
      scoreValue: 350,
      x: 1,
      y: 13,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 23: "The Entangled Wards" (19x15)
// ---------------------------------------------------------------------------
export function generateLevel23() {
  const file = path.join(rootDir, 'levels/chapter_6/level_23.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // Elevated library viaduct in central wing (cols 8..11, row 6)
  // Spanning over the central hall and connecting the archive galleries
  g[6][8] = 1; o[6][8] = 'WW';
  o[6][9] = 'PLATFORM';
  o[6][10] = 'PLATFORM';
  g[6][11] = 1; o[6][11] = 'WW';

  g[5][8] = 'R_S';
  g[5][11] = 'R_S';

  // Secret alcove
  g[1][17] = 0;
  g[2][17] = 'SW';
  if (!level.entities.some(e => e.id === 'secret_entangled_23')) {
    level.entities.push({
      id: 'secret_entangled_23',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Entangled Void Tome',
      scoreValue: 400,
      x: 17,
      y: 1,
      elevation: 0
    });
  }

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 24: "The Grand Archive" (21x19)
// ---------------------------------------------------------------------------
export function generateLevel24() {
  const file = path.join(rootDir, 'levels/chapter_6/level_24.json');
  const level = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = level.layers.ground;
  const o = level.layers.overhead;

  // High scriptorium skybridge across row 8 (cols 8..12)
  // Spanning the central atrium between North and South galleries
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
  if (!level.entities.some(e => e.id === 'secret_archive_24')) {
    level.entities.push({
      id: 'secret_archive_24',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Grand Archon Scribe Quill',
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
  console.log('--- Overhauling Chapter 6 (Levels 21–24) ---');

  const generators = [
    { num: 21, fn: generateLevel21 },
    { num: 22, fn: generateLevel22 },
    { num: 23, fn: generateLevel23 },
    { num: 24, fn: generateLevel24 }
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
    const filePath = path.join(rootDir, `levels/chapter_6/level_${num}.json`);
    fs.writeFileSync(filePath, JSON.stringify(level, null, 2) + '\n', 'utf8');
    console.log(`✓ Saved ${filePath}\n`);
  }

  console.log('All Chapter 6 levels overhauled and saved successfully!');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
}
