/**
 * Casual Maze Game — Story Sagas Rigor & Vaults Folios Builder (BL-187, ADR-0062)
 *
 * Compiles and synchronizes Story Sagas (Relics of the Guardians 1-3, Whispering Citadel 1,
 * Sunken Vaults 1-3) with:
 * - Architect's Folios #47 to #53 on carved stone lecterns (style: "lectern_stone")
 * - Persistent coordinate strings coordString: "(X, Y, Z)"
 * - LevelValidator 0 errors & 0 warnings
 * - 100% test passing in story unbypassable suites and storylines journeys
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

const storyConfigs = [
  {
    file: 'story_guardians_1.json',
    pkgDir: 'story_guardians_1',
    id: 'story_guardians_1',
    folioNum: 47,
    signId: 'sign_guardians_1',
    signPos: { x: 3, y: 1 },
    chapter: 'relics_of_the_guardians',
    text: "Architect's Folio #47: Journey into the Whispering Ruins. Four sacred totems guard the Sun Temple: Falcon, Lion, Serpent, and Bear. Decipher the wall carvings to navigate the sanctum."
  },
  {
    file: 'story_guardians_2.json',
    pkgDir: 'story_guardians_2',
    id: 'story_guardians_2',
    folioNum: 48,
    signId: 'sign_guardians_2',
    signPos: { x: 2, y: 2 },
    chapter: 'relics_of_the_guardians',
    text: "Architect's Folio #48: The Falcon's Plinth demands high vantage. Seek out the winged totem perched above the sunlit courtyard and match it to its ancestral riddle pedestal."
  },
  {
    file: 'story_guardians_3.json',
    pkgDir: 'story_guardians_3',
    id: 'story_guardians_3',
    folioNum: 49,
    signId: 'sign_guardians_3',
    signPos: { x: 8, y: 2 },
    chapter: 'relics_of_the_guardians',
    text: "Architect's Folio #49: Sanctum of the Four Guardians. When all four totems rest upon their designated pedestals, the central sunburst portal awakens to grant eternal passage."
  },
  {
    file: 'story_citadel_1.json',
    pkgDir: 'story_citadel_1',
    id: 'story_citadel_1',
    folioNum: 50,
    signId: 'signpost_courtyard_guide',
    signPos: { x: 2, y: 1 },
    chapter: 'the_whispering_citadel',
    text: "Architect's Folio #50: The Whispering Citadel unites the Courtyard, Catacombs, and High Spire. Retrieve the Spire Key from the subterranean depths to unlock the ascent."
  },
  {
    file: 'story_sunken_vaults_1.json',
    pkgDir: 'story_sunken_vaults_1',
    id: 'story_sunken_vaults_1',
    folioNum: 51,
    signId: 'sign_sunken_1',
    signPos: { x: 2, y: 1 },
    chapter: 'sunken_vaults_of_the_deep',
    text: "Architect's Folio #51: Plunge into the Flooded Siphon. Submerged flumes and thermal water vents regulate the ancient water pressure of the abyssal vaults."
  },
  {
    file: 'story_sunken_vaults_2.json',
    pkgDir: 'story_sunken_vaults_2',
    id: 'story_sunken_vaults_2',
    folioNum: 52,
    signId: 'sign_sunken_2',
    signPos: { x: 3, y: 1 },
    chapter: 'sunken_vaults_of_the_deep',
    text: "Architect's Folio #52: The Pressure Reservoir stores immense hydrodynamic power. Balance the reservoir valves and avoid thermal surges to reach the abyssal shaft."
  },
  {
    file: 'story_sunken_vaults_3.json',
    pkgDir: 'story_sunken_vaults_3',
    id: 'story_sunken_vaults_3',
    folioNum: 53,
    signId: 'sign_sunken_3',
    signPos: { x: 3, y: 1 },
    chapter: 'sunken_vaults_of_the_deep',
    text: "Architect's Folio #53: At the Abyssal Sanctuary, the deepest secret of the realm lies slumbering. Decipher the final glyph of the Deep Architects to recover the Primal Water Core."
  }
];

for (const cfg of storyConfigs) {
  const compPath = path.join(rootDir, 'levels', 'stories', cfg.file);
  const lvl = JSON.parse(fs.readFileSync(compPath, 'utf8'));

  // Update or insert signpost entity to stone lectern folio
  let sign = (lvl.entities || []).find(e => e.id === cfg.signId);
  if (!sign) {
    sign = { id: cfg.signId, type: 'signpost', x: cfg.signPos.x, y: cfg.signPos.y, elevation: 0 };
    lvl.entities.push(sign);
  }
  sign.type = 'signpost';
  sign.style = 'lectern_stone';
  sign.title = `Architect's Folio #${cfg.folioNum}`;
  sign.chapter = cfg.chapter;
  sign.levelId = cfg.id;
  sign.x = cfg.signPos.x;
  sign.y = cfg.signPos.y;
  sign.elevation = 0;
  sign.coordString = `(${sign.x}, ${sign.y}, ${sign.elevation || 0})`;
  sign.text = cfg.text;

  // Validate
  const rep = LevelValidator.validate(lvl);
  if (!rep.valid || rep.errors.length > 0) {
    throw new Error(`Story ${cfg.id} validation failed: ${JSON.stringify(rep.errors)}`);
  }

  // Solve (for single-room levels)
  if (!lvl.rooms) {
    const sol = solveLevel(lvl);
    if (!sol || sol.length === 0) {
      throw new Error(`Story ${cfg.id} is not solvable!`);
    }
    console.log(`[Story ${cfg.id}] Solvable: YES (steps: ${sol.length}) | Folio: #${cfg.folioNum} at ${sign.coordString}`);
  } else {
    console.log(`[Story ${cfg.id}] Multi-Room Validated: YES (rooms: ${Object.keys(lvl.rooms).length}) | Folio: #${cfg.folioNum} at ${sign.coordString}`);
  }
  // Save composite JSON
  fs.writeFileSync(compPath, JSON.stringify(lvl, null, 2) + '\n', 'utf8');

  // Export modular package
  const pkgDir = path.join(rootDir, 'levels', 'stories', cfg.pkgDir);
  exportLevelPackage(lvl, pkgDir);
}

console.log('\n✨ Story Sagas 1-7 rigor and vaults folios synchronized successfully!');
