/**
 * Casual Maze Game — Chapter 8 Rigor & World Rotation Redesign Engine (BL-185, ADR-0059)
 *
 * Compiles and synchronizes Levels 29–32 ("The Cardinal Needle", "The Hidden Underpass",
 * "The Four-Faced Pillar", "The Prismatic Spire") with:
 * - 1-tile winding labyrinth topology (corridor inertia >= 70%, 0 dead space >= 4x4)
 * - 4-way camera rotation ('allowRotation: true')
 * - 3D occluded underpass bridge at (7, 7) on Level 30
 * - 4-faced monolith cardinal inscriptions on Level 31
 * - Branching exits contract ('exit_spire_primary' -> '1', 'exit_spire_citadel_branch' -> 'story_citadel_1') on Level 32
 * - North wall entrance doorway ('wall_doorway', 'north') & exit archway ('wall_archway', 'north')
 * - Stone lecterns for Architect's Notes with coordinate tracking
 * - Diegetic wall carvings/runic plates for hints and secrets
 * - Fog of War on Level 32 climax (viewRadius: 7)
 * - 100% verified solvability and zero-bypass gating via BFS solver
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveLevel } from '../js/engine/solver.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';
import { exportLevelPackage } from './level-package-compiler.mjs';
import { makeLevel29, makeLevel30, makeLevel31, makeLevel32 } from './test-ch8-full-rigor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawLevels = [makeLevel29(), makeLevel30(), makeLevel31(), makeLevel32()];
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
  const compJsonPath = path.join(rootDir, 'levels', 'chapter_8', `level_${fullLevel.id}.json`);
  fs.writeFileSync(compJsonPath, JSON.stringify(fullLevel, null, 2) + '\n', 'utf8');

  // 3. Export modular package directory
  const pkgDir = path.join(rootDir, 'levels', 'chapter_8', `level_${fullLevel.id}`);
  exportLevelPackage(fullLevel, pkgDir);

  builtLevels.push(fullLevel);

  // Audit metrics
  const metrics = auditLevelMetrics(fullLevel);
  console.log(`[Level ${fullLevel.id}] Solvable: YES (opt: ${solution.length}, par: ${fullLevel.parSteps}) | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);
}

// 4. Update js/levels/campaign-ch8.js
const ch8JsContent = `/**
 * Casual Maze Game - Campaign Chapter 8 Levels
 */

export const CAMPAIGN_CH8_LEVELS = Object.freeze(${JSON.stringify(builtLevels, null, 2)});\n`;
fs.writeFileSync(path.join(rootDir, 'js', 'levels', 'campaign-ch8.js'), ch8JsContent, 'utf8');

console.log('\n✨ Chapter 8 Levels 29-32 built and exported successfully!');
