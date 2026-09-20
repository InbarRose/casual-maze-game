import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveLevel } from '../js/engine/solver.js';
import { LevelValidator } from '../js/editor/level-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ch2Dir = path.join(rootDir, 'levels', 'chapter_2');

// Level 5
const l5Path = path.join(ch2Dir, 'level_5.json');
const l5 = JSON.parse(fs.readFileSync(l5Path, 'utf8'));
l5.entities = l5.entities.filter(e => !e.id.startsWith('gem_'));
if (!l5.entities.some(e => e.id === 'inscr_canopy_5')) {
  l5.entities.push({
    id: 'inscr_canopy_5',
    type: 'wall_decor',
    decorType: 'carving',
    text: 'Ancient glyph: The high wooden trestle leads to the canopy overlook. Above, the canopy key rests among the vines.',
    playerDialogue: 'The high bridge deck is the only way to reach the Canopy Key.',
    x: 2,
    y: 10,
    elevation: 0
  });
}
const sol5 = solveLevel(l5);
l5.parSteps = Math.ceil(sol5.length * 1.15);
l5.parTime = Math.ceil(l5.parSteps * 0.6);
fs.writeFileSync(l5Path, JSON.stringify(l5, null, 2) + '\n', 'utf8');

// Level 6
const l6Path = path.join(ch2Dir, 'level_6.json');
const l6 = JSON.parse(fs.readFileSync(l6Path, 'utf8'));
l6.entities = l6.entities.filter(e => !e.id.startsWith('gem_'));
if (!l6.entities.some(e => e.id === 'inscr_tunnel_6')) {
  l6.entities.push({
    id: 'inscr_tunnel_6',
    type: 'wall_decor',
    decorType: 'carving',
    text: 'Runic tablet: Ground below, heavens above. Walk the underpass tunnel first, then ascend to cross the bridge deck.',
    playerDialogue: 'Underpass first for the Amber Key, then overhead bridge for the Canopy Key.',
    x: 3,
    y: 8,
    elevation: 0
  });
}
const sol6 = solveLevel(l6);
l6.parSteps = Math.ceil(sol6.length * 1.15);
l6.parTime = Math.ceil(l6.parSteps * 0.6);
fs.writeFileSync(l6Path, JSON.stringify(l6, null, 2) + '\n', 'utf8');

// Level 7
const l7Path = path.join(ch2Dir, 'level_7.json');
const l7 = JSON.parse(fs.readFileSync(l7Path, 'utf8'));
l7.entities = l7.entities.filter(e => !e.id.startsWith('gem_'));
if (!l7.entities.some(e => e.id === 'inscr_chasm_7')) {
  l7.entities.push({
    id: 'inscr_chasm_7',
    type: 'wall_decor',
    decorType: 'carving',
    text: 'Ancient stone: Two bridges intersect across the chasm depths. Mind the directional incline.',
    playerDialogue: 'The perpendicular bridges weave across two distinct elevations.',
    x: 3,
    y: 4,
    elevation: 0
  });
}
const sol7 = solveLevel(l7);
l7.parSteps = Math.ceil(sol7.length * 1.15);
l7.parTime = Math.ceil(l7.parSteps * 0.6);
fs.writeFileSync(l7Path, JSON.stringify(l7, null, 2) + '\n', 'utf8');

// Level 8
const l8Path = path.join(ch2Dir, 'level_8.json');
const l8 = JSON.parse(fs.readFileSync(l8Path, 'utf8'));
l8.entities = l8.entities.filter(e => !e.id.startsWith('gem_'));
if (!l8.entities.some(e => e.id === 'inscr_citadel_8')) {
  l8.entities.push({
    id: 'inscr_citadel_8',
    type: 'wall_decor',
    decorType: 'carving',
    text: 'Citadel inscription: The twin bridges guard the eastern and western horizons. Unlock both to reveal the apex stairs.',
    playerDialogue: 'Twin bridges flanking the central courtyard—both keys are strictly required.',
    x: 8,
    y: 7,
    elevation: 0
  });
}
const sol8 = solveLevel(l8);
l8.parSteps = Math.ceil(sol8.length * 1.15);
l8.parTime = Math.ceil(l8.parSteps * 0.6);
fs.writeFileSync(l8Path, JSON.stringify(l8, null, 2) + '\n', 'utf8');

console.log('Chapter 2 updated successfully');
