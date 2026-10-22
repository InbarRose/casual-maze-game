/**
 * Casual Maze Game — Chapter 9 Rigor & Grand Aqueduct Redesign Engine (BL-186, ADR-0060)
 *
 * Compiles and synchronizes Levels 33–36 ("The Sluice Gate", "Submerged Crossings",
 * "The Pressure Basin", "Grand Aqueduct Reservoir") with:
 * - 1-tile winding labyrinth topology (corridor inertia >= 70%, 0 dead space >= 4x4)
 * - 3D multi-elevation bridges over flooded canals at (8, 5) with elevated deck traversal at Z=1 on Level 34
 * - Timed water hazards and SECRET_WALL at (1, 15) on Level 35
 * - Dual-key multi-layer progression (Cyan Canal Key & Amethyst Sluice Key) on Level 36
 * - North wall entrance doorway ('wall_doorway', 'north') & exit archway ('wall_archway', 'north')
 * - Stone lecterns for Architect's Notes with coordinate tracking
 * - Diegetic wall carvings/runic plates for hints and secrets
 * - Strategic Fog of War on all levels (viewRadius: 6)
 * - 100% verified solvability and zero-bypass gating via BFS solver
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveLevel } from '../js/engine/solver.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';
import { exportLevelPackage } from './level-package-compiler.mjs';
import { makeLevel33, makeLevel34, makeLevel35, makeLevel36 } from './test-ch9-full-rigor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawLevels = [makeLevel33(), makeLevel34(), makeLevel35(), makeLevel36()];
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
  const compJsonPath = path.join(rootDir, 'levels', 'chapter_9', `level_${fullLevel.id}.json`);
  fs.writeFileSync(compJsonPath, JSON.stringify(fullLevel, null, 2) + '\n', 'utf8');

  // 3. Export modular package directory
  const pkgDir = path.join(rootDir, 'levels', 'chapter_9', `level_${fullLevel.id}`);
  exportLevelPackage(fullLevel, pkgDir);

  builtLevels.push(fullLevel);

  // Audit metrics
  const metrics = auditLevelMetrics(fullLevel);
  console.log(`[Level ${fullLevel.id}] Solvable: YES (opt: ${solution.length}, par: ${fullLevel.parSteps}) | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);
}

// 4. Update js/levels/campaign-ch9.js
const ch9JsContent = `/**
 * Casual Maze Game - Campaign Chapter 9 Levels
 */

export const CAMPAIGN_CH9_LEVELS = Object.freeze(${JSON.stringify(builtLevels, null, 2)});\n`;
fs.writeFileSync(path.join(rootDir, 'js', 'levels', 'campaign-ch9.js'), ch9JsContent, 'utf8');

console.log('\n✨ Chapter 9 Levels 33-36 built and exported successfully!');
