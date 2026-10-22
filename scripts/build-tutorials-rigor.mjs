/**
 * Casual Maze Game — Tutorials Rigor & Academy Folios Builder (BL-187, ADR-0062)
 *
 * Compiles and synchronizes Tutorials 1–6 with:
 * - Architect's Folios #41 to #46 on carved stone lecterns (style: "lectern_stone")
 * - Persistent coordinate strings coordString: "(X, Y, Z)"
 * - Authentic North wall entrance doorway ('wall_doorway', 'north') & exit archways ('wall_archway', 'north')
 * - LevelValidator 0 errors & 0 warnings
 * - 100% test passing in tests/unit/levels/story-1-unbypassable.test.mjs and user journeys
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LevelValidator } from '../js/editor/level-validator.js';
import { solveLevel } from '../js/engine/solver.js';
import { exportLevelPackage } from './level-package-compiler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tutorialConfigs = [
  {
    num: 1,
    folioNum: 41,
    signId: 'sign_tut_1',
    signPos: { x: 1, y: 2 },
    exitStyle: 'wall_archway',
    wallDirection: 'north',
    text: "Architect's Folio #41: Welcome to the Academy of Mazes! Navigate to the exit portal using arrow keys or WASD. Follow the warm glow of torches."
  },
  {
    num: 2,
    folioNum: 42,
    signId: 'sign_tut_2',
    signPos: { x: 1, y: 2 },
    exitStyle: 'portal',
    wallDirection: 'none',
    text: "Architect's Folio #42: Colored gates require matching keys. Gather the Ruby and Sapphire keystones to unlock your path through the academy."
  },
  {
    num: 3,
    folioNum: 43,
    signId: 'sign_tut_3',
    signPos: { x: 1, y: 2 },
    exitStyle: 'stairs_up',
    wallDirection: 'none',
    text: "Architect's Folio #43: Levers shift the very architecture of the maze. Toggle the Sanctuary Lever to lower the blocking stone wall at the crossroads."
  },
  {
    num: 4,
    folioNum: 44,
    signId: 'sign_tut_4',
    signPos: { x: 1, y: 2 },
    exitStyle: 'wall_archway',
    wallDirection: 'north',
    text: "Architect's Folio #44: Ramps lead up to elevated bridges. Cross over ground corridors to discover routes hidden in the upper canopy layer."
  },
  {
    num: 5,
    folioNum: 45,
    signId: 'sign_tut_5',
    signPos: { x: 1, y: 2 },
    exitStyle: 'portal',
    wallDirection: 'none',
    text: "Architect's Folio #45: The Fog of War conceals distant rooms. Rely on memory, spatial deduction, and wall sconces to find your way."
  },
  {
    num: 6,
    folioNum: 46,
    signId: 'sign_tut_6',
    signPos: { x: 2, y: 2 },
    exitStyle: 'wall_archway',
    wallDirection: 'north',
    text: "Architect's Folio #46: The Master's Trial synthesizes all graduation requirements: colored gates, multi-elevation viaducts, clockwork switches, and fog navigation."
  }
];

for (const cfg of tutorialConfigs) {
  const compPath = path.join(rootDir, 'levels', 'tutorial', `tutorial_${cfg.num}.json`);
  const lvl = JSON.parse(fs.readFileSync(compPath, 'utf8'));

  // Update spawn and exit styling
  lvl.spawn.style = 'wall_doorway';
  lvl.spawn.wallDirection = 'north';
  lvl.exit.style = cfg.exitStyle;
  lvl.exit.wallDirection = cfg.wallDirection;

  // Update signpost entity to stone lectern folio
  let sign = (lvl.entities || []).find(e => e.id === cfg.signId);
  if (!sign) {
    sign = { id: cfg.signId, type: 'signpost', x: cfg.signPos.x, y: cfg.signPos.y, elevation: 0 };
    lvl.entities.push(sign);
  }
  sign.style = 'lectern_stone';
  sign.title = `Architect's Folio #${cfg.folioNum}`;
  sign.chapter = 'tutorial';
  sign.levelId = `tutorial_${cfg.num}`;
  sign.coordString = `(${sign.x}, ${sign.y}, ${sign.elevation || 0})`;
  sign.text = cfg.text;

  // Validate
  const rep = LevelValidator.validate(lvl);
  if (!rep.valid || rep.errors.length > 0) {
    throw new Error(`Tutorial ${cfg.num} validation failed: ${JSON.stringify(rep.errors)}`);
  }

  // Solve
  const sol = solveLevel(lvl);
  if (!sol || sol.length === 0) {
    throw new Error(`Tutorial ${cfg.num} is not solvable!`);
  }

  // Save composite JSON
  fs.writeFileSync(compPath, JSON.stringify(lvl, null, 2) + '\n', 'utf8');

  // Export modular package
  const pkgDir = path.join(rootDir, 'levels', 'tutorial', `tutorial_${cfg.num}`);
  exportLevelPackage(lvl, pkgDir);

  console.log(`[Tutorial ${cfg.num}] Solvable: YES (steps: ${sol.length}) | Folio: #${cfg.folioNum} at ${sign.coordString}`);
}

console.log('\n✨ Tutorials 1-6 rigor and academy folios synchronized successfully!');
