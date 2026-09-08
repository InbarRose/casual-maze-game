import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LevelValidator } from '../js/editor/level-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ==========================================
// 1. TUTORIAL 4: BRIDGES & ELEVATION (13x13)
// ==========================================
const tut4_ground = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], // 1: Spawn at (1, 1)
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // 2
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], // 3
  [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1], // 4: Corridor funneling to (6, 4)
  [1, 1, 1, 1, 1, 1, 'R_S', 1, 1, 1, 1, 1, 1], // 5: Ramp South at (6, 5) - Climbs 0 -> 1
  [1, 1, 1, 1, 1, 1, 'B_EW', 1, 1, 1, 1, 1, 1], // 6: Bridge at (6, 6) - Solid walls block all ground crossing!
  [1, 1, 1, 1, 1, 1, 'R_N', 1, 1, 1, 1, 1, 1], // 7: Ramp North at (6, 7) - Descends 1 -> 0
  [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1], // 8: Exit funnel from (6, 8)
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], // 9
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // 10
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], // 11: Exit at (11, 11)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 12
];

const tut4_overhead = Array.from({ length: 13 }, () => Array(13).fill(0));
tut4_overhead[6][6] = 'B_EW'; // Overhead bridge deck at (6, 6)

const tutorial4 = {
  $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
  id: 'tutorial_4',
  title: 'Bridges & Elevation',
  author: 'Casual Maze Academy',
  version: 1,
  dimensions: { width: 13, height: 13 },
  config: {
    fogOfWar: false,
    mapRevealed: true,
    viewRadius: 6,
    allowFreePan: true,
    tileSize: 32,
    theme: 'jungle',
  },
  help: {
    title: 'Bridges & Ramps',
    message: 'Step onto Ramp South (▼) to climb to Elevation 1 (Overhead Bridge). Cross the elevated span over the dividing canyon, then descend via Ramp North (▲) to reach the sacred shrine!',
  },
  spawn: { x: 1, y: 1, elevation: 0, style: 'camp' },
  exit: { x: 11, y: 11, style: 'shrine' },
  layers: {
    ground: tut4_ground,
    overhead: tut4_overhead,
  },
  entities: [],
};

// ==========================================
// 2. TUTORIAL 6: MASTER'S TRIAL (17x17)
// ==========================================
const tut6_ground = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1: Spawn(1, 1), Door_Green(4, 1), Key_Blue(15, 1)
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // 2
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // 3: Key_Green(3, 3)
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], // 4
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 5: Leads to Ramp South at (8, 6)
  [1, 1, 1, 1, 1, 1, 1, 1, 'R_S', 1, 1, 1, 1, 1, 1, 1, 1], // 6: Ramp South at (8, 6) - Climbs 0 -> 1
  [1, 1, 1, 1, 1, 1, 1, 1, 'B_EW', 1, 1, 1, 1, 1, 1, 1, 1], // 7: Bridge at (8, 7) - Mandatory elevated overpass!
  [1, 1, 1, 1, 1, 1, 1, 1, 'R_N', 1, 1, 1, 1, 1, 1, 1, 1], // 8: Ramp North at (8, 8) - Descends 1 -> 0
  [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1], // 9: Landing corridor in South section from (8, 9) to (11, 9)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // 10: Door_Blue at (11, 10) - Sole passage to south chambers!
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 11
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1], // 12: Lever at (11, 12)
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1], // 13
  [1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1], // 14: (2, 14) toggled by Lever; (15, 14) is wall 1!
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1], // 15: Key_Red at (1, 15), Door_Red at (14, 15), Exit at (15, 15)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 16
];

// Initial barrier: (2, 14) is wall 1 until lever is pulled
tut6_ground[14][2] = 1;

const tut6_overhead = Array.from({ length: 17 }, () => Array(17).fill(0));
tut6_overhead[7][8] = 'B_EW'; // Overhead bridge deck at (8, 7)

const tutorial6 = {
  $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
  id: 'tutorial_6',
  title: "Master's Trial",
  author: 'Casual Maze Academy',
  version: 1,
  dimensions: { width: 17, height: 17 },
  config: {
    fogOfWar: true,
    mapRevealed: false,
    viewRadius: 5,
    allowFreePan: true,
    tileSize: 32,
    theme: 'temple',
  },
  help: {
    title: "The Master's Trial",
    message: 'The final test! Navigate the shrouded darkness, collect multiple colored keys (Emerald, Sapphire, Ruby), cross the mandatory elevated bridge over the central chasm, and trigger mechanisms to unlock the victory vault.',
  },
  spawn: { x: 1, y: 1, elevation: 0, style: 'archway' },
  exit: { x: 15, y: 15, style: 'chest' },
  layers: {
    ground: tut6_ground,
    overhead: tut6_overhead,
  },
  entities: [
    {
      id: 'key_green_t6',
      type: 'key',
      x: 3,
      y: 3,
      color: '#34d399',
      name: 'Emerald Scarab',
      style: 'relic',
      glowEffect: 'vibrant',
    },
    {
      id: 'door_green_t6',
      type: 'door',
      x: 4,
      y: 1,
      requiresKey: 'key_green_t6',
      color: '#34d399',
      style: 'portcullis',
      orientation: 'vertical',
    },
    {
      id: 'key_blue_t6',
      type: 'key',
      x: 15,
      y: 1,
      color: '#38bdf8',
      name: 'Sapphire Orb',
      style: 'orb',
      glowEffect: 'pulse',
    },
    {
      id: 'door_blue_t6',
      type: 'door',
      x: 11,
      y: 10,
      requiresKey: 'key_blue_t6',
      color: '#38bdf8',
      style: 'magic_seal',
      orientation: 'vertical',
    },
    {
      id: 'lever_t6',
      type: 'lever',
      x: 11,
      y: 12,
      name: 'Sanctuary Switch',
      style: 'pressure_pedestal',
      state: false,
      targets: [
        {
          action: 'toggle_tile',
          layer: 'ground',
          x: 2,
          y: 14,
          stateA: 0,
          stateB: 1,
        },
      ],
    },
    {
      id: 'key_red_t6',
      type: 'key',
      x: 1,
      y: 15,
      color: '#f43f5e',
      name: 'Ruby Sun Shard',
      style: 'crystal',
      glowEffect: 'vibrant',
    },
    {
      id: 'door_red_t6',
      type: 'door',
      x: 14,
      y: 15,
      requiresKey: 'key_red_t6',
      color: '#f43f5e',
      style: 'vault_hatch',
      orientation: 'vertical',
    },
  ],
};

// Validate both levels
const val4 = LevelValidator.validate(tutorial4);
console.log('Tutorial 4 Validation:', val4.valid ? 'PASSED' : 'FAILED', val4.errors, val4.warnings);

const val6 = LevelValidator.validate(tutorial6);
console.log('Tutorial 6 Validation:', val6.valid ? 'PASSED' : 'FAILED', val6.errors, val6.warnings);

if (val4.valid && val6.valid && val4.warnings.length === 0 && val6.warnings.length === 0) {
  fs.writeFileSync(path.join(rootDir, 'levels/tutorial/tutorial_4.json'), JSON.stringify(tutorial4, null, 2), 'utf-8');
  fs.writeFileSync(path.join(rootDir, 'levels/tutorial/tutorial_6.json'), JSON.stringify(tutorial6, null, 2), 'utf-8');
  console.log('✨ 100% VALID & 0 WARNINGS: Successfully wrote updated tutorial_4.json and tutorial_6.json');
} else {
  console.error('❌ Validation had errors or warnings, aborting write.');
  process.exit(1);
}
