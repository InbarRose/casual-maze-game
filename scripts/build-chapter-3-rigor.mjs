/**
 * Casual Maze Game — Chapter 3 Rigor & Clockwork Foundry Redesign Engine (BL-180, ADR-0054)
 *
 * Compiles and synchronizes Levels 9–12 ("The Iron Lever", "Clockwork Gates", "Shifting Foundations",
 * "Master of Wheels") with:
 * - 1-tile winding labyrinth topology (corridor inertia >= 70%, 0 dead space >= 4x4)
 * - Dynamic clockwork levers, shifting barrier walls, and hydraulic valves
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
import { makeLevel9, makeLevel10, makeLevel11, makeLevel12 } from './test-ch3-full-rigor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawLevels = [makeLevel9(), makeLevel10(), makeLevel11(), makeLevel12()];

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
  const compJsonPath = path.join(rootDir, 'levels', 'chapter_3', `level_${fullLevel.id}.json`);
  fs.writeFileSync(compJsonPath, JSON.stringify(fullLevel, null, 2) + '\n', 'utf8');

  // 3. Export modular package directory
  const pkgDir = path.join(rootDir, 'levels', 'chapter_3', `level_${fullLevel.id}`);
  exportLevelPackage(fullLevel, pkgDir);

  // Audit metrics
  const metrics = auditLevelMetrics(fullLevel);
  console.log(`[Level ${fullLevel.id}] Solvable: YES (opt: ${solution.length}, par: ${fullLevel.parSteps}) | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);
}

console.log('\n✨ Chapter 3 Levels 9-12 built and exported successfully!');
