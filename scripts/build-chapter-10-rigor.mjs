/**
 * Casual Maze Game — Chapter 10 Rigor & Prismatic Apex Redesign Engine (BL-186, ADR-0061)
 *
 * Compiles and synchronizes Levels 37–40 ("The Spectral Gate", "Concentric Trestles",
 * "Harmonic Mirror Seals", "Heart of the Prism") with:
 * - 1-tile winding labyrinth topology (corridor inertia >= 70%, 0 dead space >= 4x4)
 * - Multi-elevation bridges and elevated trestles with >= 35 elevated steps at Z=1 on Level 38
 * - Resonant harmonic mirror levers, astral teleporters, and secret walls on Level 37 & 39
 * - 4-quadrant chromatic key progression (Ruby, Emerald, Sapphire, Apex) on Level 40
 * - North wall entrance doorway ('wall_doorway', 'north') & archway exit or central pedestal
 * - Stone lecterns for Architect's Notes with coordinate tracking
 * - Diegetic wall carvings/runic plates for hints and secrets
 * - Strategic Fog of War on all levels (viewRadius: 6)
 * - 100% verified solvability and zero-bypass gating via BFS solver
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveLevel } from '../js/engine/solver.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';
import { exportLevelPackage } from './level-package-compiler.mjs';
import { makeLevel37, makeLevel38, makeLevel39, makeLevel40 } from './test-ch10-full-rigor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawLevels = [makeLevel37(), makeLevel38(), makeLevel39(), makeLevel40()];
const builtLevels = [];

for (const fullLevel of rawLevels) {
  // 1. Validate
  const rep = LevelValidator.validate(fullLevel);
  if (!rep.valid || rep.errors.length > 0) {
    throw new Error(`Level ${fullLevel.id} failed validation: ${JSON.stringify(rep.errors)}`);
  }

  // 2. Solve to verify 100% solvability
  const solution = solveLevel(fullLevel);
  if (!solution || solution.length === 0) {
    throw new Error(`Level ${fullLevel.id} is NOT solvable!`);
  }

  // Set calibrated par steps
  fullLevel.parSteps = Math.ceil(solution.length * 1.15);
  fullLevel.parTime = Math.ceil(fullLevel.parSteps * 0.6);

  // 3. Write composite JSON file
  const compJsonPath = path.join(rootDir, 'levels', 'chapter_10', `level_${fullLevel.id}.json`);
  fs.writeFileSync(compJsonPath, JSON.stringify(fullLevel, null, 2) + '\n', 'utf8');

  // 4. Export modular package directory
  const pkgDir = path.join(rootDir, 'levels', 'chapter_10', `level_${fullLevel.id}`);
  exportLevelPackage(fullLevel, pkgDir);

  builtLevels.push(fullLevel);

  // Audit metrics
  const metrics = auditLevelMetrics(fullLevel);
  console.log(`[Level ${fullLevel.id}] Solvable: YES (opt: ${solution.length}, par: ${fullLevel.parSteps}) | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);
}

// 5. Update js/levels/campaign-ch10.js
const ch10JsContent = `/**
 * Casual Maze Game - Campaign Chapter 10 Levels
 */

export const CAMPAIGN_CH10_LEVELS = Object.freeze(${JSON.stringify(builtLevels, null, 2)});\n`;
fs.writeFileSync(path.join(rootDir, 'js', 'levels', 'campaign-ch10.js'), ch10JsContent, 'utf8');

console.log('\n✨ Chapter 10 Levels 37-40 built and exported successfully!');
