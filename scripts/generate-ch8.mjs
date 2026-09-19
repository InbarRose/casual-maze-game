import fs from 'fs';
import path from 'path';
import { TILES, ELEVATION, ENTITY_TYPES } from '../js/core/constants.js';
import { LevelValidator } from '../js/editor/level-validator.js';

function createGrid(w, h, fill = 0) {
  const g = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
        row.push(1);
      } else {
        row.push(fill);
      }
    }
    g.push(row);
  }
  return g;
}

// ----------------------------------------------------
// Level 29: The Cardinal Needle (15x15)
// ----------------------------------------------------
const l29Ground = createGrid(15, 15, 0);
// Add some interior walls to create distinct corridors around central needle
// Horizontal wall partitions
for (let x = 2; x <= 12; x++) {
  if (x !== 7 && x !== 3 && x !== 11) {
    l29Ground[4][x] = 1;
    l29Ground[10][x] = 1;
  }
}
// Vertical partitions
for (let y = 5; y <= 9; y++) {
  if (y !== 7) {
    l29Ground[y][4] = 1;
    l29Ground[y][10] = 1;
  }
}
// Central needle pillar
l29Ground[6][7] = 1;
l29Ground[7][7] = 1;
l29Ground[8][7] = 1;
// Wall guarding exit chokepoint
l29Ground[12][13] = 1;

const level29 = {
  $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
  id: '29',
  chapter: 'chapter_8',
  zone: 'zone_8',
  title: 'The Cardinal Needle',
  author: 'Inbar Rose',
  version: 1,
  dimensions: { width: 15, height: 15 },
  config: {
    fogOfWar: true,
    viewRadius: 6,
    allowFreePan: true,
    tileSize: 32,
    theme: 'dungeon',
    viewPerspective: 'angled',
  },
  spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
  exit: { x: 13, y: 13, elevation: 0, style: 'portal', label: 'Needle Sanctum' },
  parSteps: 48,
  parTime: 30,
  architectNote: 'Rotate the camera [Q / R] to view the cardinal corridors. Seek the golden key in the south-west wing.',
  help: {
    title: 'Level 29: The Cardinal Needle',
    message: 'Press [Q] and [R] to rotate the view. Screen controls adapt automatically to your camera heading.',
  },
  layers: {
    ground: l29Ground,
    overhead: createGrid(15, 15, 0),
  },
  entities: [
    {
      id: 'key_gold_29',
      type: 'key',
      color: '#fbbf24',
      name: 'Golden Needle Key',
      x: 1,
      y: 13,
      elevation: 0,
    },
    {
      id: 'door_gold_29',
      type: 'door',
      color: '#fbbf24',
      name: 'Needle Sanctum Gate',
      requiresKey: 'key_gold_29',
      x: 12,
      y: 13,
      elevation: 0,
    },
    {
      id: 'checkpoint_29',
      type: 'checkpoint',
      style: 'crystal_beacon',
      name: 'Central Needle Shrine',
      x: 7,
      y: 5,
      elevation: 0,
      color: '#38bdf8',
    },
    {
      id: 'decor_note_north',
      type: 'wall_decor',
      decorType: 'note',
      title: 'Needle Alignment',
      text: 'Rotating 90 degrees CCW [Q] turns East to facing up. Screen movement always follows your view.',
      author: 'Guild Cartographer',
      x: 7,
      y: 1,
      facing: 'south',
      elevation: 0,
    },
    {
      id: 'decor_carving_center',
      type: 'wall_decor',
      decorType: 'carving',
      title: 'Four Faces of the Monolith',
      text: 'The monolith casts its shadow according to the observer angle.',
      author: 'Ancient Stonemason',
      x: 7,
      y: 9,
      facing: 'north',
      elevation: 0,
    },
    {
      id: 'gem_score_29a',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Sapphire Prism',
      scoreValue: 150,
      color: '#38bdf8',
      x: 13,
      y: 1,
      elevation: 0,
    },
  ],
};

// ----------------------------------------------------
// Level 30: The Hidden Underpass (15x15)
// ----------------------------------------------------
const l30Ground = createGrid(15, 15, 0);
const l30Overhead = createGrid(15, 15, 0);

// Walls separating east and west wings except via underpass and bridges
for (let y = 1; y <= 13; y++) {
  if (y !== 7) {
    l30Ground[y][5] = 1;
    l30Ground[y][9] = 1;
  }
}
// Elevated bridge at col 7 spanning from y=3 to y=11
for (let y = 4; y <= 10; y++) {
  l30Overhead[y][7] = TILES.BRIDGE_NS;
}
// Ramps climbing up/down onto bridge
l30Ground[3][7] = TILES.RAMP_S; // Walk south up onto bridge
l30Ground[11][7] = TILES.RAMP_N; // Walk north up onto bridge

// Ground floor underpass at y=7 running East-West under bridge at (7, 7)
l30Ground[7][7] = TILES.BRIDGE_EW;
l30Ground[12][13] = 1; // Door chokepoint guarding exit

const level30 = {
  $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
  id: '30',
  chapter: 'chapter_8',
  zone: 'zone_8',
  title: 'The Hidden Underpass',
  author: 'Inbar Rose',
  version: 1,
  dimensions: { width: 15, height: 15 },
  config: {
    fogOfWar: true,
    viewRadius: 6,
    allowFreePan: true,
    tileSize: 32,
    theme: 'dungeon',
    viewPerspective: 'angled',
  },
  spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
  exit: { x: 13, y: 13, elevation: 0, style: 'portal', label: 'Overpass Gate' },
  parSteps: 54,
  parTime: 36,
  architectNote: 'Overhead bridges occlude low ground corridors. Rotate 90 degrees to peer straight through underpass tunnels!',
  help: {
    title: 'Level 30: The Hidden Underpass',
    message: 'Notice how rotation changes which side of bridges and walls you see. The tunnel key lies under the span.',
  },
  layers: {
    ground: l30Ground,
    overhead: l30Overhead,
  },
  entities: [
    {
      id: 'key_cyan_30',
      type: 'key',
      color: '#06b6d4',
      name: 'Underpass Key',
      x: 7,
      y: 7,
      elevation: 0,
    },
    {
      id: 'door_cyan_30',
      type: 'door',
      color: '#06b6d4',
      name: 'Underpass Exit Gate',
      requiresKey: 'key_cyan_30',
      x: 12,
      y: 13,
      elevation: 0,
    },
    {
      id: 'decor_note_bridge',
      type: 'wall_decor',
      decorType: 'note',
      title: 'Bridge Observation',
      text: 'Rotating [Q / R] shifts the 2.5D perspective, revealing what was hidden behind elevated bridge spans.',
      author: 'Bridge Engineer',
      x: 5,
      y: 1,
      facing: 'south',
      elevation: 0,
    },
    {
      id: 'gem_bridge_top',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Skyward Topaz',
      scoreValue: 200,
      color: '#fbbf24',
      x: 7,
      y: 7,
      elevation: 1,
    },
  ],
};

// ----------------------------------------------------
// Level 31: The Four-Faced Pillar (15x15)
// ----------------------------------------------------
const l31Ground = createGrid(15, 15, 0);
// Central 3x3 massive pillar
for (let y = 6; y <= 8; y++) {
  for (let x = 6; x <= 8; x++) {
    l31Ground[y][x] = 1;
  }
}
// Outer walls dividing into 4 chambers
for (let i = 1; i <= 4; i++) {
  l31Ground[i][4] = 1;
  l31Ground[14 - i][10] = 1;
}
l31Ground[12][13] = 1; // Door chokepoint guarding exit

const level31 = {
  $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
  id: '31',
  chapter: 'chapter_8',
  zone: 'zone_8',
  title: 'The Four-Faced Pillar',
  author: 'Inbar Rose',
  version: 1,
  dimensions: { width: 15, height: 15 },
  config: {
    fogOfWar: true,
    viewRadius: 6,
    allowFreePan: true,
    tileSize: 32,
    theme: 'temple',
    viewPerspective: 'angled',
  },
  spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
  exit: { x: 13, y: 13, elevation: 0, style: 'portal', label: 'Sanctuary of the Four Winds' },
  parSteps: 58,
  parTime: 38,
  architectNote: 'Four faces of the monolith tell one story. Walk the perimeter and rotate the view to read each inscription.',
  help: {
    title: 'Level 31: The Four-Faced Pillar',
    message: 'Rotate the camera to view each side of the central monument. Find the ruby key in the eastern corner.',
  },
  layers: {
    ground: l31Ground,
    overhead: createGrid(15, 15, 0),
  },
  entities: [
    {
      id: 'key_ruby_31',
      type: 'key',
      color: '#f43f5e',
      name: 'Ruby Monolith Key',
      x: 13,
      y: 2,
      elevation: 0,
    },
    {
      id: 'door_ruby_31',
      type: 'door',
      color: '#f43f5e',
      name: 'Southern Pillar Gate',
      requiresKey: 'key_ruby_31',
      x: 12,
      y: 13,
      elevation: 0,
    },
    {
      id: 'decor_north_face',
      type: 'wall_decor',
      decorType: 'carving',
      title: 'North Face of Monolith',
      text: 'Face of the North Wind: The ruby key sleeps in the eastern vault.',
      author: 'Ancient Scribe',
      x: 7,
      y: 6,
      facing: 'north',
      elevation: 0,
    },
    {
      id: 'decor_east_face',
      type: 'wall_decor',
      decorType: 'carving',
      title: 'East Face of Monolith',
      text: 'Face of the Dawn: When the perspective is turned, unseen paths emerge.',
      author: 'Ancient Scribe',
      x: 8,
      y: 7,
      facing: 'east',
      elevation: 0,
    },
    {
      id: 'decor_south_face',
      type: 'wall_decor',
      decorType: 'carving',
      title: 'South Face of Monolith',
      text: 'Face of the Zenith: Unlock the southern portal to continue upward.',
      author: 'Ancient Scribe',
      x: 7,
      y: 8,
      facing: 'south',
      elevation: 0,
    },
    {
      id: 'decor_west_face',
      type: 'wall_decor',
      decorType: 'carving',
      title: 'West Face of Monolith',
      text: 'Face of the Dusk: Rotate [R] clockwise to survey the courtyard.',
      author: 'Ancient Scribe',
      x: 6,
      y: 7,
      facing: 'west',
      elevation: 0,
    },
  ],
};

// ----------------------------------------------------
// Level 32: The Prismatic Spire (17x17)
// ----------------------------------------------------
const l32Ground = createGrid(17, 17, 0);
const l32Overhead = createGrid(17, 17, 0);

// Spire corridors
for (let y = 3; y <= 13; y++) {
  if (y !== 8) {
    l32Ground[y][4] = 1;
    l32Ground[y][12] = 1;
  }
}
for (let x = 5; x <= 11; x++) {
  if (x !== 8) {
    l32Ground[4][x] = 1;
    l32Ground[12][x] = 1;
  }
}

// Elevated Spire Walkway at y=8 from x=6 to x=10
for (let x = 6; x <= 10; x++) {
  l32Overhead[8][x] = TILES.BRIDGE_EW;
}
l32Ground[8][5] = TILES.RAMP_E; // Climb east onto walkway
l32Ground[8][11] = TILES.RAMP_W; // Climb west onto walkway
l32Ground[15][14] = 1; // Door chokepoint guarding primary exit at (15, 15)

const level32 = {
  $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
  id: '32',
  chapter: 'chapter_8',
  zone: 'zone_8',
  title: 'The Prismatic Spire',
  author: 'Inbar Rose',
  version: 1,
  dimensions: { width: 17, height: 17 },
  config: {
    fogOfWar: true,
    viewRadius: 7,
    allowFreePan: true,
    tileSize: 32,
    theme: 'snow',
    viewPerspective: 'angled',
  },
  spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
  exit: {
    x: 15,
    y: 15,
    elevation: 0,
    style: 'portal',
    label: 'Crown of the Monolith',
    targetLevel: '1',
  },
  exits: [
    {
      id: 'exit_spire_primary',
      x: 15,
      y: 15,
      elevation: 0,
      style: 'portal',
      label: 'Crown of the Monolith',
      targetLevel: '1',
    },
    {
      id: 'exit_spire_citadel_branch',
      x: 1,
      y: 15,
      elevation: 0,
      style: 'stairs',
      label: 'Descend to Whispering Citadel',
      targetLevel: 'story_citadel_1',
    },
  ],
  parSteps: 72,
  parTime: 46,
  architectNote: 'At the apex of the monolith, two distinct routes await: return victorious to the Grand Hub, or branch downward into the Whispering Citadel.',
  help: {
    title: 'Level 32: The Prismatic Spire',
    message: 'Explore the peak! Multiple exits offer choice: complete the campaign or embark on the Whispering Citadel story quest.',
  },
  layers: {
    ground: l32Ground,
    overhead: l32Overhead,
  },
  entities: [
    {
      id: 'key_emerald_32',
      type: 'key',
      color: '#10b981',
      name: 'Spire Apex Key',
      x: 15,
      y: 1,
      elevation: 0,
    },
    {
      id: 'door_emerald_32',
      type: 'door',
      color: '#10b981',
      name: 'Crown Barrier',
      requiresKey: 'key_emerald_32',
      x: 15,
      y: 14,
      elevation: 0,
    },
    {
      id: 'checkpoint_32',
      type: 'checkpoint',
      style: 'shrine',
      name: 'Spire Sanctuary Waypoint',
      x: 8,
      y: 8,
      elevation: 1,
      color: '#38bdf8',
    },
    {
      id: 'gem_apex_crown',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Diamond of the Monolith',
      scoreValue: 500,
      color: '#ffffff',
      x: 8,
      y: 2,
      elevation: 0,
    },
  ],
};

// Validate all 4 levels
const allLevels = [level29, level30, level31, level32];
for (const lvl of allLevels) {
  const rep = LevelValidator.validate(lvl);
  console.log(`Validating Level ${lvl.id}: "${lvl.title}" -> Valid: ${rep.valid}, Errors: ${rep.errors.length}, Warnings: ${rep.warnings.length}`);
  if (!rep.valid || rep.errors.length > 0) {
    console.error(`Errors in Level ${lvl.id}:`, rep.errors);
    process.exit(1);
  }
}

console.log('All Chapter 8 levels passed validation!');

// Write to levels/chapter_8/level_{id}.json
const outDir = path.resolve('levels/chapter_8');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const lvl of allLevels) {
  const filePath = path.join(outDir, `level_${lvl.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(lvl, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${filePath}`);
}

// Write to js/levels/campaign-ch8.js
const jsContent = `/**
 * Casual Maze Game - Campaign Chapter 8 Levels: The Shifting Monolith
 */

export const CAMPAIGN_CH8_LEVELS = Object.freeze(${JSON.stringify(allLevels, null, 2)});
`;

const jsPath = path.resolve('js/levels/campaign-ch8.js');
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log(`Wrote ${jsPath}`);

