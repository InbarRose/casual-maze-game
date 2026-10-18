/**
 * Level Generator & Verifier for Chapter 10: The Prismatic Labyrinth (Levels 37–40)
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
// Level 37: The Spectral Gate (23x23) - Ki (Introduction)
// =========================================================================
function buildLevel37() {
  const w = 23;
  const h = 23;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // West Wing (x <= 10)
  for (let y = 1; y <= 21; y++) ground[y][1] = 0; // west outer
  for (let x = 1; x <= 10; x++) ground[21][x] = 0; // west south
  for (let x = 1; x <= 10; x++) ground[1][x] = 0; // west north
  for (let x = 1; x <= 10; x++) ground[11][x] = 0; // west middle
  for (let y = 1; y <= 11; y++) ground[y][10] = 0;

  // Amber Key chamber at (4, 4)
  for (let y = 3; y <= 5; y++) {
    for (let x = 3; x <= 5; x++) ground[y][x] = 0;
  }
  for (let y = 5; y <= 11; y++) ground[y][4] = 0;

  // Secret alcove at (5, 19)
  ground[18][5] = TILES.SECRET_WALL;
  ground[19][5] = 0;
  ground[20][5] = 0;

  // Only doorway between West and East wings: (11, 11)
  ground[11][11] = 0;

  // East Wing (x >= 12)
  for (let x = 11; x <= 21; x++) ground[11][x] = 0; // east middle
  for (let y = 1; y <= 21; y++) ground[y][21] = 0; // east outer
  for (let x = 12; x <= 21; x++) ground[21][x] = 0; // east south
  for (let y = 11; y <= 21; y++) ground[y][15] = 0; // south branch

  // Violet Key chamber at (15, 18)
  for (let y = 17; y <= 19; y++) {
    for (let x = 14; x <= 16; x++) ground[y][x] = 0;
  }

  // North-east corridor leading to Exit at (21, 1)
  // Violet door at (21, 5)

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "37",
    chapter: "chapter_10",
    zone: "zone_10",
    title: "The Spectral Gate",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "prismatic",
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
      x: 21,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      label: "Refraction Chamber",
      wallDirection: "north",
    },
    parSteps: 58,
    parTime: 36,
    architectNote: "The refracting crystal prisms cast elusive shadows. Locate the amber and violet keys to breach the Spectral Gate.",
    help: {
      title: "Level 37: The Spectral Gate",
      message: "The way forward is locked by dual crystal seals. Explore the chambers to find the spectral keys.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_amber_37",
        type: "key",
        color: "#f59e0b",
        name: "Amber Crystal Key",
        x: 4,
        y: 4,
        elevation: 0,
      },
      {
        id: "door_amber_37",
        type: "door",
        color: "#f59e0b",
        name: "Amber Spectral Barrier",
        requiresKey: "key_amber_37",
        x: 11,
        y: 11,
        elevation: 0,
      },
      {
        id: "key_violet_37",
        type: "key",
        color: "#8b5cf6",
        name: "Violet Crystal Key",
        x: 15,
        y: 18,
        elevation: 0,
      },
      {
        id: "door_violet_37",
        type: "door",
        color: "#8b5cf6",
        name: "Violet Prismatic Gate",
        requiresKey: "key_violet_37",
        x: 21,
        y: 5,
        elevation: 0,
      },
      {
        id: "checkpoint_37",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Prism Central Beacon",
        x: 15,
        y: 11,
        elevation: 0,
        color: "#a855f7",
      },
      {
        id: "decor_note_37",
        type: "wall_decor",
        decorType: "plaque",
        title: "Chromatic Inscription",
        text: "Light splits into amber and violet vibrations upon striking the primal crystal facade.",
        author: "Prism Master Kael",
        x: 1,
        y: 3,
        facing: "east",
        elevation: 0,
      },
      {
        id: "gem_secret_37",
        type: "collectible",
        collectibleType: "gem",
        name: "Luminescent Shard",
        scoreValue: 250,
        color: "#06b6d4",
        x: 5,
        y: 19,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// =========================================================================
// Level 38: Concentric Trestles (25x25) - Shō (Multi-elevation Bridges & Ramps)
// =========================================================================
function buildLevel38() {
  const w = 25;
  const h = 25;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Outer corridor
  for (let x = 2; x <= 22; x++) {
    ground[2][x] = 0;
    ground[22][x] = 0;
  }
  for (let y = 2; y <= 22; y++) {
    ground[y][2] = 0;
    ground[y][22] = 0;
  }

  // Inner sanctum at (10..14, 10..14)
  for (let y = 10; y <= 14; y++) {
    for (let x = 10; x <= 14; x++) {
      ground[y][x] = 0;
    }
  }

  // Elevated Bridge EW: from (5,5) up to (11,5), crossing canal at (8,5)
  // Low side at west (4,5), high side at east (6,5)
  ground[5][5] = TILES.RAMP_E;
  overhead[5][5] = TILES.RAMP_E;
  for (let x = 6; x <= 10; x++) {
    overhead[5][x] = TILES.BRIDGE_NS;
    ground[5][x] = 0;
  }
  ground[5][8] = TILES.BRIDGE_NS;
  ground[5][11] = TILES.RAMP_W;
  overhead[5][11] = TILES.RAMP_W;

  // Canal passing under bridge at (8, 2..10)
  for (let y = 2; y <= 10; y++) {
    if (y !== 5) ground[y][8] = 0;
  }

  // Path connecting ramp down at (11,5) into sanctum approach at (12,5..10)
  ground[5][12] = 0;
  for (let y = 5; y <= 10; y++) ground[y][12] = 0;

  // Path connecting spawn (2,2) to ramp start (5,5) from the west (entering at 4,5):
  for (let y = 2; y <= 5; y++) ground[y][2] = 0;
  for (let x = 2; x <= 4; x++) ground[5][x] = 0;

  // Path connecting to key chamber at (22, 22)
  for (let y = 18; y <= 22; y++) ground[y][18] = 0;
  for (let x = 18; x <= 22; x++) ground[18][x] = 0;

  // Single door into inner sanctum at (12, 10)
  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "38",
    chapter: "chapter_10",
    zone: "zone_10",
    title: "Concentric Trestles",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "prismatic",
      viewPerspective: "angled",
    },
    spawn: {
      x: 2,
      y: 2,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 12,
      y: 12,
      elevation: 0,
      style: "portal",
      label: "Heart Conduit",
      wallDirection: "none",
    },
    parSteps: 64,
    parTime: 40,
    architectNote: "Traverse the multi-elevation crystalline trestles to access the concentric inner sanctum.",
    help: {
      title: "Level 38: Concentric Trestles",
      message: "Ascend the directional ramps to walk across the upper trestles. Watch your footing above the crystal abyss.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_prism_38",
        type: "key",
        color: "#a855f7",
        name: "Prism Core Key",
        x: 22,
        y: 22,
        elevation: 0,
      },
      {
        id: "door_prism_38",
        type: "door",
        color: "#a855f7",
        name: "Sanctum Seal",
        requiresKey: "key_prism_38",
        x: 12,
        y: 10,
        elevation: 0,
      },
      {
        id: "checkpoint_38",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Trestle Waypoint",
        x: 12,
        y: 5,
        elevation: 0,
        color: "#a855f7",
      },
      {
        id: "decor_note_38",
        type: "wall_decor",
        decorType: "carving",
        title: "Trestle Geometry",
        text: "Upper trestles weave over lower flumes without intersecting their physical geometry.",
        author: "Prism Architect",
        x: 2,
        y: 8,
        facing: "east",
        elevation: 0,
      },
      {
        id: "gem_trestle_1",
        type: "collectible",
        collectibleType: "gem",
        name: "Bridge Shard",
        scoreValue: 150,
        color: "#f59e0b",
        x: 8,
        y: 2,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// =========================================================================
// Level 39: Harmonic Mirror Seals (27x27) - Ten (Puzzles, Switches, Secrets)
// =========================================================================
function buildLevel39() {
  const w = 27;
  const h = 27;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Outer corridor
  for (let y = 2; y <= 24; y++) ground[y][2] = 0;
  for (let x = 2; x <= 24; x++) ground[24][x] = 0;
  for (let y = 2; y <= 24; y++) ground[y][24] = 0;
  for (let x = 2; x <= 24; x++) ground[2][x] = 0;

  // Concentric internal avenues (excluding central hall 12..16)
  for (let x = 4; x <= 22; x++) {
    ground[6][x] = 0;
    ground[20][x] = 0;
  }
  for (let y = 4; y <= 22; y++) {
    ground[y][6] = 0;
    ground[y][20] = 0;
  }

  // Vertical connectors
  for (let y = 2; y <= 6; y++) {
    ground[y][6] = 0;
    ground[y][20] = 0;
  }
  for (let y = 20; y <= 24; y++) {
    ground[y][6] = 0;
    ground[y][20] = 0;
  }

  // Single approach from north avenue at (14, 6) down to central door at (14, 12)
  for (let y = 6; y <= 12; y++) ground[y][14] = 0;

  // Central Mirror Hall (12..16, 12..16) - walled off on all other sides
  for (let y = 13; y <= 16; y++) {
    for (let x = 12; x <= 16; x++) {
      ground[y][x] = 0;
    }
  }

  // Secret vault at (22, 2)
  ground[4][22] = TILES.SECRET_WALL;
  ground[3][22] = 0;
  ground[2][22] = 0;

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "39",
    chapter: "chapter_10",
    zone: "zone_10",
    title: "Harmonic Mirror Seals",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "prismatic",
      viewPerspective: "angled",
    },
    spawn: {
      x: 2,
      y: 2,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 14,
      y: 14,
      elevation: 0,
      style: "portal",
      label: "Heart Portal",
      wallDirection: "none",
    },
    parSteps: 78,
    parTime: 48,
    architectNote: "Align the harmonic mirror seals. Retrieve the silver key from the east wing to enter the Inner Sanctum.",
    help: {
      title: "Level 39: Harmonic Mirror Seals",
      message: "The inner hall is shielded by harmonic forcefields. Explore the resonating corridors to secure the silver tuning key.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_silver_39",
        type: "key",
        color: "#94a3b8",
        name: "Silver Tuning Key",
        x: 20,
        y: 6,
        elevation: 0,
      },
      {
        id: "door_silver_39",
        type: "door",
        color: "#94a3b8",
        name: "Harmonic Forcefield",
        requiresKey: "key_silver_39",
        x: 14,
        y: 12,
        elevation: 0,
      },
      {
        id: "checkpoint_39",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Resonance Nexus",
        x: 6,
        y: 6,
        elevation: 0,
        color: "#94a3b8",
      },
      {
        id: "decor_note_39",
        type: "wall_decor",
        decorType: "plaque",
        title: "Harmonic Frequency",
        text: "The silver tuning fork emits a 432 Hz frequency capable of shattering spectral forcefields.",
        author: "Prism Harmonizer",
        x: 2,
        y: 10,
        facing: "east",
        elevation: 0,
      },
      {
        id: "gem_secret_39",
        type: "collectible",
        collectibleType: "gem",
        name: "Prismatic Tear",
        scoreValue: 300,
        color: "#ec4899",
        x: 22,
        y: 2,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// =========================================================================
// Level 40: Heart of the Prism (29x29) - Ketsu (Climax Finale)
// Sequential 4-Quadrant Kishōtenketsu Climax:
// NW (Spawn, Ruby Key) -> NE (Ruby Door, Emerald Key) -> SE (Emerald Door, Sapphire Key)
// -> SW (Sapphire Door, Apex Core) -> Central Sanctum (Apex Door, Exit)
// =========================================================================
function buildLevel40() {
  const w = 29;
  const h = 29;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Quadrant 1: NW (x=2..10, y=2..10)
  for (let x = 2; x <= 10; x++) { ground[2][x] = 0; ground[10][x] = 0; }
  for (let y = 2; y <= 10; y++) { ground[y][2] = 0; ground[y][10] = 0; }
  // Ruby key at (6, 6)
  for (let y = 5; y <= 7; y++) {
    for (let x = 5; x <= 7; x++) ground[y][x] = 0;
  }
  ground[6][2] = 0; ground[6][3] = 0; ground[6][4] = 0;

  // Gateway NW -> NE: Corridor at y=2 from x=10 to x=18
  for (let x = 10; x <= 18; x++) ground[2][x] = 0;
  // Ruby Door at (14, 2)

  // Quadrant 2: NE (x=18..26, y=2..10)
  for (let x = 18; x <= 26; x++) { ground[2][x] = 0; ground[10][x] = 0; }
  for (let y = 2; y <= 10; y++) { ground[y][18] = 0; ground[y][26] = 0; }
  // Emerald key at (22, 6)
  for (let y = 5; y <= 7; y++) {
    for (let x = 21; x <= 23; x++) ground[y][x] = 0;
  }
  ground[6][24] = 0; ground[6][25] = 0;

  // Gateway NE -> SE: Corridor at x=26 from y=10 to y=18
  for (let y = 10; y <= 18; y++) ground[y][26] = 0;
  // Emerald Door at (26, 14)

  // Quadrant 3: SE (x=18..26, y=18..26)
  for (let x = 18; x <= 26; x++) { ground[18][x] = 0; ground[26][x] = 0; }
  for (let y = 18; y <= 26; y++) { ground[y][18] = 0; ground[y][26] = 0; }
  // Sapphire key at (22, 22)
  for (let y = 21; y <= 23; y++) {
    for (let x = 21; x <= 23; x++) ground[y][x] = 0;
  }
  ground[22][24] = 0; ground[22][25] = 0;

  // Gateway SE -> SW: Corridor at y=26 from x=10 to x=18
  for (let x = 10; x <= 18; x++) ground[26][x] = 0;
  // Sapphire Door at (14, 26)

  // Quadrant 4: SW (x=2..10, y=18..26)
  for (let x = 2; x <= 10; x++) { ground[18][x] = 0; ground[26][x] = 0; }
  for (let y = 18; y <= 26; y++) { ground[y][2] = 0; ground[y][10] = 0; }
  // Apex Gold Key at (6, 22)
  for (let y = 21; y <= 23; y++) {
    for (let x = 5; x <= 7; x++) ground[y][x] = 0;
  }
  ground[22][2] = 0; ground[22][3] = 0; ground[22][4] = 0;

  // Approach SW into Central Sanctum:
  for (let y = 14; y <= 18; y++) ground[y][10] = 0;
  for (let x = 10; x <= 12; x++) ground[14][x] = 0;
  ground[14][13] = 0;

  // Central Sanctum (Heart of the Prism) at (14..16, 13..15)
  for (let y = 13; y <= 15; y++) {
    for (let x = 14; x <= 16; x++) ground[y][x] = 0;
  }

  // Secret vault in NE corner
  ground[4][26] = TILES.SECRET_WALL;
  ground[3][26] = 0;
  ground[3][25] = 0;

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "40",
    chapter: "chapter_10",
    zone: "zone_10",
    title: "Heart of the Prism",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: "prismatic",
      viewPerspective: "angled",
    },
    spawn: {
      x: 2,
      y: 2,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 15,
      y: 14,
      elevation: 0,
      style: "portal",
      label: "Campaign Apex",
      wallDirection: "none",
    },
    parSteps: 92,
    parTime: 58,
    architectNote: "The apex of the Prismatic Labyrinth. Scour all four quadrants in sequence to assemble the primal crystal keys and breach the Heart.",
    help: {
      title: "Level 40: Heart of the Prism",
      message: "Traverse each quadrant sequentially: claim the Ruby, Emerald, and Sapphire keys before retrieving the Apex Core to unlock the inner Heart.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_ruby_40",
        type: "key",
        color: "#ef4444",
        name: "Ruby Shard Key",
        x: 7,
        y: 7,
        elevation: 0,
      },
      {
        id: "door_ruby_40",
        type: "door",
        color: "#ef4444",
        name: "Ruby Prism Barrier",
        requiresKey: "key_ruby_40",
        x: 14,
        y: 2,
        elevation: 0,
      },
      {
        id: "key_emerald_40",
        type: "key",
        color: "#10b981",
        name: "Emerald Shard Key",
        x: 21,
        y: 7,
        elevation: 0,
      },
      {
        id: "door_emerald_40",
        type: "door",
        color: "#10b981",
        name: "Emerald Prism Barrier",
        requiresKey: "key_emerald_40",
        x: 26,
        y: 14,
        elevation: 0,
      },
      {
        id: "key_sapphire_40",
        type: "key",
        color: "#3b82f6",
        name: "Sapphire Shard Key",
        x: 21,
        y: 21,
        elevation: 0,
      },
      {
        id: "door_sapphire_40",
        type: "door",
        color: "#3b82f6",
        name: "Sapphire Prism Barrier",
        requiresKey: "key_sapphire_40",
        x: 14,
        y: 26,
        elevation: 0,
      },
      {
        id: "key_apex_40",
        type: "key",
        color: "#f59e0b",
        name: "Apex Prismatic Core",
        x: 7,
        y: 21,
        elevation: 0,
      },
      {
        id: "door_apex_40",
        type: "door",
        color: "#f59e0b",
        name: "Gateway of the Prism",
        requiresKey: "key_apex_40",
        x: 13,
        y: 14,
        elevation: 0,
      },
      {
        id: "checkpoint_40",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Heart Chamber Beacon",
        x: 15,
        y: 13,
        elevation: 0,
        color: "#f59e0b",
      },
      {
        id: "decor_note_40",
        type: "wall_decor",
        decorType: "monolith",
        title: "Monolith of the Apex",
        text: "He who assembles Ruby, Emerald, Sapphire, and Apex holds mastery over all chromatic light.",
        author: "Prism Paragon",
        x: 15,
        y: 15,
        facing: "south",
        elevation: 0,
      },
      {
        id: "gem_apex_secret",
        type: "collectible",
        collectibleType: "gem",
        name: "Crystalline Heart Relic",
        scoreValue: 500,
        color: "#ec4899",
        x: 25,
        y: 3,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// =========================================================================
// Main Execution: Validate, Solve & Write Files
// =========================================================================
async function main() {
  const levels = [buildLevel37(), buildLevel38(), buildLevel39(), buildLevel40()];
  const ch10Dir = path.resolve(rootDir, 'levels', 'chapter_10');

  if (!fs.existsSync(ch10Dir)) {
    fs.mkdirSync(ch10Dir, { recursive: true });
  }

  for (const lvl of levels) {
    console.log(`\n--- Validating & Solving Level ${lvl.id}: "${lvl.title}" (${lvl.dimensions.width}x${lvl.dimensions.height}) ---`);
    
    // 1. LevelValidator checks
    const valResult = LevelValidator.validate(lvl);
    if (!valResult.valid || valResult.errors.length > 0 || valResult.warnings.length > 0) {
      console.error(`Validation errors in Level ${lvl.id}:`, valResult.errors, valResult.warnings);
      process.exit(1);
    }
    console.log(`✓ Schema & topology validation passed (0 errors, 0 warnings)`);

    // 2. Solve test
    const solution = solveLevel(lvl);
    if (!solution) {
      console.error(`Level ${lvl.id} is NOT solvable!`);
      process.exit(1);
    }
    const optimalSteps = solution.length;
    console.log(`✓ Solvable! Optimal path: ${optimalSteps} steps`);

    // Adjust parSteps to be generous over optimal
    lvl.parSteps = Math.ceil(optimalSteps * 1.15) + 3;
    lvl.parTime = Math.max(15, Math.ceil(optimalSteps * 0.7));

    // 3. Write JSON file
    const filePath = path.resolve(ch10Dir, `level_${lvl.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(lvl, null, 2) + '\n', 'utf8');
    console.log(`✓ Written to ${path.relative(rootDir, filePath)}`);
  }

  console.log('\nAll Chapter 10 levels generated and verified successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
