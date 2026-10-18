/**
 * Level Generator & Verifier for Chapter 9: The Sunken Aqueducts (Levels 33–36)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TILES, ELEVATION } from '../js/core/constants.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { solveLevel } from '../js/engine/solver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function makeGrid(w, h, fill = 1) {
  const g = [];
  for (let y = 0; y < h; y++) {
    g.push(new Array(w).fill(fill));
  }
  return g;
}

// =========================================================================
// Level 33: The Sluice Gate (15x15)
// =========================================================================
function buildLevel33() {
  const w = 15;
  const h = 15;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Carve corridors
  // Spawn area: (1,1) down to (1, 13)
  for (let y = 1; y <= 13; y++) ground[y][1] = 0;
  // Cross corridor to key chamber at (3, 13)
  ground[13][2] = 0;
  ground[13][3] = 0;
  ground[12][3] = 0;
  ground[11][3] = 0;

  // Path from (1, 7) east to central sluice gate at (7, 7)
  for (let x = 1; x <= 7; x++) ground[7][x] = 0;

  // Path from (7, 7) east to (13, 7)
  for (let x = 7; x <= 13; x++) ground[7][x] = 0;

  // North branch from (7, 3) to (13, 3)
  for (let y = 3; y <= 7; y++) ground[y][7] = 0;
  for (let x = 7; x <= 13; x++) ground[3][x] = 0;
  ground[4][13] = 0;
  ground[5][13] = 0;
  ground[6][13] = 0;

  // Path from (13, 7) down to (12, 13), then enter exit at (13, 13)
  for (let y = 7; y <= 13; y++) ground[y][12] = 0;
  ground[13][13] = 0;

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "33",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "The Sluice Gate",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled",
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 13,
      y: 13,
      elevation: 0,
      style: "wall_archway",
      label: "Aqueduct Conduit",
      wallDirection: "north",
    },
    parSteps: 30,
    parTime: 18,
    architectNote: "Seek the bronze sluice key in the southern overflow flume to unlock the central watergate.",
    help: {
      title: "Level 33: The Sluice Gate",
      message: "The central waterway is blocked by an ancient bronze sluice gate. Locate the key in the southern basin.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_sluice_33",
        type: "key",
        color: "#0284c7",
        name: "Bronze Sluice Key",
        x: 3,
        y: 11,
        elevation: 0,
      },
      {
        id: "door_sluice_33",
        type: "door",
        color: "#0284c7",
        name: "Central Sluice Gate",
        requiresKey: "key_sluice_33",
        x: 7,
        y: 7,
        elevation: 0,
      },
      {
        id: "decor_note_33",
        type: "wall_decor",
        decorType: "carving",
        title: "Aqueduct Inscription",
        text: "Water flows from the high snowcaps down into the grand cisterns. Maintain the sluice gates.",
        author: "Aqueduct Architect",
        x: 1,
        y: 6,
        facing: "east",
        elevation: 0,
      },
      {
        id: "gem_aqueduct_33",
        type: "collectible",
        collectibleType: "gem",
        name: "Aqueduct Sapphire",
        scoreValue: 150,
        color: "#38bdf8",
        x: 13,
        y: 3,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// =========================================================================
// Level 34: Submerged Crossings (17x17)
// =========================================================================
function buildLevel34() {
  const w = 17;
  const h = 17;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Outer pathway from spawn (1,1)
  for (let x = 1; x <= 5; x++) ground[1][x] = 0;
  for (let y = 1; y <= 5; y++) ground[y][5] = 0;

  // Directional ramp leading up to overhead aqueduct bridge
  // Ramp from (5,5) going East up to overhead bridge at (6,5)..(10,5)
  // Underneath at ground (8,5), ground is BRIDGE_NS
  // Ramp down at (11,5)
  ground[5][5] = TILES.RAMP_E;
  overhead[5][5] = TILES.RAMP_E;

  for (let x = 6; x <= 10; x++) {
    overhead[5][x] = TILES.BRIDGE_EW;
    ground[5][x] = 0;
  }
  ground[5][8] = TILES.BRIDGE_NS; // Lower canal passes North-South

  ground[5][11] = TILES.RAMP_W; // Ramp down towards west or down from east
  overhead[5][11] = TILES.RAMP_W;

  // Lower canal passing under the bridge: from (8,2) to (8,14)
  for (let y = 2; y <= 14; y++) ground[y][8] = 0;
  ground[5][8] = TILES.BRIDGE_NS;

  // Key placed at end of lower canal (8, 14)
  // Path to lower canal entry: from spawn area: (1,1) -> (1,8) -> (7,8) -> (8,8)
  for (let y = 1; y <= 8; y++) ground[y][1] = 0;
  for (let x = 1; x <= 7; x++) ground[8][x] = 0;

  // Path after exiting bridge ramp down at (11,5):
  // (11,5) -> (14,5) -> (14,15) -> (15,15)
  for (let x = 11; x <= 14; x++) ground[5][x] = 0;
  for (let y = 5; y <= 15; y++) ground[y][14] = 0;
  ground[15][15] = 0;

  // Door at (14, 10) blocking exit at (15,15)
  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "34",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "Submerged Crossings",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled",
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 15,
      y: 15,
      elevation: 0,
      style: "wall_archway",
      label: "Lower Reservoir Flume",
      wallDirection: "north",
    },
    parSteps: 38,
    parTime: 24,
    architectNote: "Cross the elevated aqueduct bridge, then drop into the flooded channel below to retrieve the pressure key.",
    help: {
      title: "Level 34: Submerged Crossings",
      message: "Navigate multi-elevation bridges. The key lies submerged in the deep canal running beneath the aqueduct trestle.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_canal_34",
        type: "key",
        color: "#06b6d4",
        name: "Canal Pressure Key",
        x: 8,
        y: 14,
        elevation: 0,
      },
      {
        id: "door_canal_34",
        type: "door",
        color: "#06b6d4",
        name: "Submerged Flume Gate",
        requiresKey: "key_canal_34",
        x: 14,
        y: 10,
        elevation: 0,
      },
      {
        id: "checkpoint_34",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Aqueduct Pier Beacon",
        x: 13,
        y: 5,
        elevation: 0,
        color: "#38bdf8",
      },
      {
        id: "decor_note_34",
        type: "wall_decor",
        decorType: "plaque",
        title: "Trestle Engineering",
        text: "Elevated flumes transport pure glacial melt above the marsh runoff.",
        author: "Chief Engineer Valen",
        x: 5,
        y: 3,
        facing: "south",
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// =========================================================================
// Level 35: The Pressure Basin (19x19)
// =========================================================================
function buildLevel35() {
  const w = 19;
  const h = 19;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Outer corridor from spawn (1,1)
  for (let y = 1; y <= 9; y++) ground[y][1] = 0;
  for (let x = 1; x <= 9; x++) ground[9][x] = 0;

  // Central chamber (9,9)
  // Stepping stones corridor from (9,9) to (9,17)
  for (let y = 9; y <= 17; y++) ground[y][9] = 0;

  // North-East channel from (9,9) up to (17,9)
  for (let x = 9; x <= 17; x++) ground[9][x] = 0;

  // North loop to lever at (17, 3)
  for (let y = 3; y <= 9; y++) ground[y][17] = 0;
  for (let x = 11; x <= 17; x++) ground[3][x] = 0;

  // Secret passage at (3, 15) behind secret wall at (1, 15)
  ground[15][1] = TILES.SECRET_WALL;
  ground[15][2] = 0;
  ground[15][3] = 0;
  ground[14][1] = 0;
  ground[15][1] = TILES.SECRET_WALL;

  // Exit branch from (9, 17) east to (16, 17), then enter exit at (17, 17)
  for (let x = 9; x <= 16; x++) ground[17][x] = 0;
  ground[17][17] = 0;

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "35",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "The Pressure Basin",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled",
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 17,
      y: 17,
      elevation: 0,
      style: "wall_archway",
      label: "Pressure Basin Outflow",
      wallDirection: "north",
    },
    parSteps: 46,
    parTime: 30,
    architectNote: "Timing is everything. Trigger the pressure release lever in the northeast terrace to clear the outflow gate.",
    help: {
      title: "Level 35: The Pressure Basin",
      message: "Timed hazard geysers pulse along the outflow corridor. Find the relief lever in the northeast chamber.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_basin_35",
        type: "key",
        color: "#38bdf8",
        name: "Pressure Basin Key",
        x: 11,
        y: 3,
        elevation: 0,
      },
      {
        id: "door_basin_35",
        type: "door",
        color: "#38bdf8",
        name: "Outflow Pressure Gate",
        requiresKey: "key_basin_35",
        x: 13,
        y: 17,
        elevation: 0,
      },
      {
        id: "hazard_basin_35a",
        type: "timed_hazard",
        hazardType: "spikes",
        x: 9,
        y: 13,
        elevation: 0,
        activeDuration: 2.0,
        inactiveDuration: 2.5,
        offset: 0.0,
      },
      {
        id: "decor_carving_35",
        type: "wall_decor",
        decorType: "carving",
        title: "Relief Valve Directive",
        text: "When basin pressure reaches critical threshold, vent steam via the north valve.",
        author: "Basin Overseer",
        x: 9,
        y: 8,
        facing: "south",
        elevation: 0,
      },
      {
        id: "gem_secret_35",
        type: "collectible",
        collectibleType: "gem",
        name: "Deep Aquamarine",
        scoreValue: 200,
        color: "#0284c7",
        x: 3,
        y: 15,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// =========================================================================
// Level 36: Grand Aqueduct Reservoir (21x21)
// =========================================================================
function buildLevel36() {
  const w = 21;
  const h = 21;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Carve multi-channel reservoir layout
  // 1. Spawn corridor: (1,1) -> (1,7) -> (7,7)
  for (let y = 1; y <= 7; y++) ground[y][1] = 0;
  for (let x = 1; x <= 7; x++) ground[7][x] = 0;

  // 2. West canal: (1,7) -> (1,19) -> (7,19)
  for (let y = 7; y <= 19; y++) ground[y][1] = 0;
  for (let x = 1; x <= 7; x++) ground[19][x] = 0;

  // 3. Central elevated bridge spanning across canal
  // Ramp Up from (7,7) East to (8,7), bridge (9,7)..(13,7), Ramp Down at (14,7)
  ground[7][7] = TILES.RAMP_E;
  overhead[7][7] = TILES.RAMP_E;

  for (let x = 8; x <= 12; x++) {
    overhead[7][x] = TILES.BRIDGE_EW;
    ground[7][x] = 0;
  }
  ground[7][10] = TILES.BRIDGE_NS; // Lower flooded channel passing underneath

  ground[7][13] = TILES.RAMP_W;
  overhead[7][13] = TILES.RAMP_W;

  // Lower canal passing under at x=10:
  for (let y = 3; y <= 17; y++) ground[y][10] = 0;
  ground[7][10] = TILES.BRIDGE_NS;

  // Canal access corridor from west canal (1,13) to lower canal (10,13)
  for (let x = 1; x <= 10; x++) ground[13][x] = 0;

  // Key 1 (cyan) placed at (10, 3)
  // Key 2 (amethyst) placed at (7, 19)

  // Door 1 (cyan) at (15, 7) leading east to terrace (14,7) -> (18,7) -> (18,19) -> (19,19)
  for (let x = 13; x <= 18; x++) ground[7][x] = 0;
  for (let y = 7; y <= 19; y++) ground[y][18] = 0;
  ground[19][19] = 0;

  // Door 2 (amethyst) at (18, 15) guarding Exit at (19, 19)
  // Secret Wall at (18, 3) leading to secret chamber (16, 3)
  ground[3][18] = 0;
  ground[4][18] = 0;
  ground[5][18] = 0;
  ground[6][18] = 0;
  ground[3][17] = TILES.SECRET_WALL;
  ground[3][16] = 0;
  ground[3][15] = 0;

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "36",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "Grand Aqueduct Reservoir",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled",
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 19,
      y: 19,
      elevation: 0,
      style: "wall_archway",
      label: "Grand Spillway",
      wallDirection: "north",
    },
    parSteps: 60,
    parTime: 40,
    architectNote: "The grand culmination of the Sunken Aqueducts. Coordinate keys across flooded canals and elevated piers to breach the Grand Spillway.",
    help: {
      title: "Level 36: Grand Aqueduct Reservoir",
      message: "Two ancient gates lock the Spillway. Traverse both the submerged canals and high bridges to gather the required keys.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_cyan_36",
        type: "key",
        color: "#06b6d4",
        name: "Cyan Canal Key",
        x: 10,
        y: 3,
        elevation: 0,
      },
      {
        id: "door_cyan_36",
        type: "door",
        color: "#06b6d4",
        name: "Terrace Access Gate",
        requiresKey: "key_cyan_36",
        x: 15,
        y: 7,
        elevation: 0,
      },
      {
        id: "key_amethyst_36",
        type: "key",
        color: "#a855f7",
        name: "Amethyst Sluice Key",
        x: 7,
        y: 19,
        elevation: 0,
      },
      {
        id: "door_amethyst_36",
        type: "door",
        color: "#a855f7",
        name: "Grand Spillway Seal",
        requiresKey: "key_amethyst_36",
        x: 18,
        y: 15,
        elevation: 0,
      },
      {
        id: "checkpoint_36",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Grand Reservoir Sanctum",
        x: 18,
        y: 10,
        elevation: 0,
        color: "#38bdf8",
      },
      {
        id: "gem_grand_36",
        type: "collectible",
        collectibleType: "gem",
        name: "Heart of the Aqueduct",
        scoreValue: 300,
        color: "#a855f7",
        x: 16,
        y: 3,
        elevation: 0,
      },
      {
        id: "decor_spillway_36",
        type: "wall_decor",
        decorType: "plaque",
        title: "The Grand Spillway",
        text: "Beyond these gates lie the pristine depths of the Sunken Vaults.",
        author: "Master Mason Torin",
        x: 18,
        y: 14,
        facing: "west",
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// Generate, Validate & Calibrate
const levels = [buildLevel33(), buildLevel34(), buildLevel35(), buildLevel36()];

for (const lvl of levels) {
  const rep = LevelValidator.validate(lvl);
  if (!rep.valid || rep.errors.length > 0 || rep.warnings.length > 0) {
    console.error(`Validation failed for Level ${lvl.id}:`, rep.errors, rep.warnings);
    process.exit(1);
  }

  const solution = solveLevel(lvl);
  if (!solution) {
    console.error(`Solver failed for Level ${lvl.id}: Unsolvable!`);
    process.exit(1);
  }

  const optimalSteps = solution.length;
  lvl.parSteps = Math.ceil(optimalSteps * 1.15);
  lvl.parTime = Math.max(15, Math.ceil(optimalSteps * 0.7));

  console.log(`✓ Level ${lvl.id} ("${lvl.title}"): Validated 100%! Optimal steps: ${optimalSteps}, Par steps: ${lvl.parSteps}, Par time: ${lvl.parTime}s`);

  // Write JSON file to levels/chapter_9/
  const filePath = path.join(rootDir, 'levels', 'chapter_9', `level_${lvl.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(lvl, null, 2) + '\n', 'utf8');
}

console.log('\n✨ All Chapter 9 levels built, validated, and calibrated!');
