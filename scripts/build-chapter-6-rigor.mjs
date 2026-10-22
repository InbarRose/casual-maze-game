/**
 * Casual Maze Game — Chapter 6 Rigor & Arcane Enigmas Redesign Engine (BL-183, ADR-0057)
 *
 * Compiles and synchronizes Levels 21–24 ("The Rune Lock", "The Cipher Dials", "The Entangled Wards",
 * "The Grand Archive") with:
 * - 1-tile winding labyrinth topology (corridor inertia >= 70%, 0 dead space >= 4x4)
 * - Arcane puzzle gates (Rune Memory, Cipher Dial), conduit levers, and gold sanctum key/door
 * - North wall entrance doorway ('wall_doorway', 'north') & exit archway ('wall_archway', 'north')
 * - Stone lecterns for Architect's Notes with coordinate tracking
 * - Diegetic wall carvings/runic plates for hints and secrets
 * - Fog of war on Level 24 climax (viewRadius: 7)
 * - 100% verified solvability and zero-bypass gating via BFS solver
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveLevel } from '../js/engine/solver.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';
import { exportLevelPackage } from './level-package-compiler.mjs';
import { makeLevel21, makeLevel22, makeLevel23, makeLevel24 } from './test-ch6-full-rigor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawLevels = [makeLevel21(), makeLevel22(), makeLevel23(), makeLevel24()];
const builtLevels = [];

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
  const compJsonPath = path.join(rootDir, 'levels', 'chapter_6', `level_${fullLevel.id}.json`);
  fs.writeFileSync(compJsonPath, JSON.stringify(fullLevel, null, 2) + '\n', 'utf8');

  // 3. Export modular package directory
  const pkgDir = path.join(rootDir, 'levels', 'chapter_6', `level_${fullLevel.id}`);
  exportLevelPackage(fullLevel, pkgDir);

  builtLevels.push(fullLevel);

  // Audit metrics
  const metrics = auditLevelMetrics(fullLevel);
  console.log(`[Level ${fullLevel.id}] Solvable: YES (opt: ${solution.length}, par: ${fullLevel.parSteps}) | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);
}

// 4. Update js/levels/campaign-ch6.js
const ch6JsContent = `/**
 * Casual Maze Game - Campaign Chapter 6 Levels
 */

export const CAMPAIGN_CH6_LEVELS = Object.freeze(${JSON.stringify(builtLevels, null, 2)});\n`;
fs.writeFileSync(path.join(rootDir, 'js', 'levels', 'campaign-ch6.js'), ch6JsContent, 'utf8');

console.log('\n✨ Chapter 6 Levels 21-24 built and exported successfully!');
