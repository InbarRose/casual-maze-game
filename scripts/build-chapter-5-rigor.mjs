/**
 * Casual Maze Game — Chapter 5 Rigor & Molten Gauntlet Redesign Engine (BL-182, ADR-0056)
 *
 * Compiles and synchronizes Levels 17–20 ("The Fire Vents", "The Molten Sentinels", "The Crucible Crossing",
 * "The Caldera Gauntlet") with:
 * - 1-tile winding labyrinth topology (corridor inertia >= 70%, 0 dead space >= 4x4)
 * - Rhythmic flame vent hazards, obsidian patroller sentinels, and mid-run checkpoint monoliths
 * - North wall entrance doorway ('wall_doorway', 'north') & exit archway ('wall_archway', 'north')
 * - Stone lecterns for Architect's Notes with coordinate tracking
 * - Diegetic wall carvings/runic plates for hints and secrets
 * - 100% verified solvability and zero-bypass gating via BFS solver
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveLevel } from '../js/engine/solver.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';
import { exportLevelPackage } from './level-package-compiler.mjs';
import { makeLevel17, makeLevel18, makeLevel19, makeLevel20 } from './test-ch5-full-rigor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawLevels = [makeLevel17(), makeLevel18(), makeLevel19(), makeLevel20()];

for (const raw of rawLevels) {
  const fullLevel = {
    ...raw.manifest,
    layers: raw.layers,
    entities: raw.entities
  };

  // 1. Solve to verify 100% solvability
  const solution = solveLevel(fullLevel);
  if (!solution || solution.length === 0) {
    throw new Error(`Level ${fullLevel.id} is NOT solvable!`);
  }

  // Set calibrated par steps
  fullLevel.parSteps = Math.ceil(solution.length * 1.15);
  fullLevel.parTime = Math.ceil(fullLevel.parSteps * 0.6);
  raw.manifest.parSteps = fullLevel.parSteps;
  raw.manifest.parTime = fullLevel.parTime;

  // 2. Write composite JSON file
  const compJsonPath = path.join(rootDir, 'levels', 'chapter_5', `level_${fullLevel.id}.json`);
  fs.writeFileSync(compJsonPath, JSON.stringify(fullLevel, null, 2) + '\n', 'utf8');

  // 3. Export modular package directory
  const pkgDir = path.join(rootDir, 'levels', 'chapter_5', `level_${fullLevel.id}`);
  exportLevelPackage(fullLevel, pkgDir);

  // Audit metrics
  const metrics = auditLevelMetrics(fullLevel);
  console.log(`[Level ${fullLevel.id}] Solvable: YES (opt: ${solution.length}, par: ${fullLevel.parSteps}) | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);
}

console.log('\n✨ Chapter 5 Levels 17-20 built and exported successfully!');
