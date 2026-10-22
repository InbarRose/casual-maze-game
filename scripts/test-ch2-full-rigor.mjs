import { solveLevel } from '../js/engine/solver.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';
import { ELEVATION, ENTITY_TYPES } from '../js/core/constants.js';

// =========================================================================
// LEVEL 5 (Ki) - 15x13
// =========================================================================
export function makeLevel5() {
  const width = 15, height = 13;
  const ground = [
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary wall
    [  1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1 ], // 01 (1,1) Spawn, (13,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 02
    [  1, 0, 1, 0, 1, 0, 1,'R_S',1, 0, 1, 0, 0, 0, 1 ], // 03 (7,3) Ramp facing South down
    [  1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1 ], // 04 (13,3) door_jungle_5
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1 ], // 05
    [  1, 0, 0, 0, 1, 0, 0,'B_EW',0, 0, 1, 0, 1, 1, 1 ], // 06 (7,6) Underpass canal E-W
    [  1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 07
    [  1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 08
    [  1, 0, 1, 0, 1, 0, 1,'R_N',1, 0, 1, 0, 1, 0, 1 ], // 09 (7,9) Ramp facing North up
    [  1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1 ], // 10
    [  1, 0, 1,'SW',0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1 ], // 11 (1,11) Lectern, (4,11) Secret room
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // 12 South boundary wall
  ];

  const overhead = Array.from({ length: height }, () => Array(width).fill(0));
  overhead[4][7] = 'B_EW';
  overhead[5][7] = 'B_EW';
  overhead[6][7] = 'B_EW';
  overhead[7][7] = 'B_EW';
  overhead[8][7] = 'B_EW';
  overhead[5][6] = 'WW'; overhead[5][8] = 'WW';
  overhead[7][6] = 'WW'; overhead[7][8] = 'WW';

  const manifest = {
    "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    "id": "5",
    "chapter": "chapter_2",
    "zone": "zone_2",
    "title": "The Canopy Bridge",
    "author": "Inbar Rose",
    "version": 1,
    "dimensions": { width, height },
    "config": {
      "fogOfWar": false,
      "viewRadius": 7,
      "allowFreePan": true,
      "tileSize": 32,
      "theme": "jungle"
    },
    "spawn": { "x": 1, "y": 1, "elevation": 0, "style": "wall_doorway", "wallDirection": "north" },
    "exit": { "x": 13, "y": 1, "elevation": 0, "style": "wall_archway", "wallDirection": "north" },
    "parSteps": 61,
    "parTime": 37,
    "architectNote": "Architect's Journal: Ascend the southern ramp to tread upon the ancient canopy bridge deck. The jungle key is suspended at high elevation; below, the underpass canal flows unimpeded toward the northern gate.",
    "package": { "layers": "./layers.json", "entities": "./entities.json", "documentation": "./README.md" }
  };

  const entities = [
    {
      "id": "sign_arch_5",
      "type": "signpost",
      "title": "Architect's Note #5",
      "style": "lectern_stone",
      "chapter": "chapter_2",
      "levelId": "5",
      "x": 1,
      "y": 11,
      "z": 0,
      "elevation": 0,
      "coordString": "(1, 11, 0)",
      "text": "Architect's Journal: Ascend the southern ramp to tread upon the ancient canopy bridge deck. The jungle key is suspended at high elevation; below, the underpass canal flows unimpeded toward the northern gate."
    },
    {
      "id": "inscr_canopy_5",
      "type": "wall_decor",
      "decorType": "carving",
      "facing": "west",
      "text": "Two tiers of path weave through the trees: walk below through water, or climb above the mist.",
      "playerDialogue": "The southern ramp will carry me directly onto the high canopy deck.",
      "x": 2,
      "y": 9,
      "elevation": 0
    },
    {
      "id": "inscr_secret_5",
      "type": "wall_decor",
      "decorType": "runic_plate",
      "facing": "north",
      "text": "ᚲᛁᛈᚺ Behind moss-choked mortar lies the emerald tears of the first grove.",
      "playerDialogue": "A hollow wall resonates nearby to the east.",
      "x": 2,
      "y": 11,
      "elevation": 0
    },
    {
      "id": "key_jungle_5",
      "type": "key",
      "color": "#34d399",
      "keyId": "key_jungle_5",
      "x": 7,
      "y": 6,
      "z": 1,
      "elevation": 1
    },
    {
      "id": "door_jungle_5",
      "type": "door",
      "color": "#34d399",
      "requiresKey": "key_jungle_5",
      "x": 13,
      "y": 3,
      "elevation": 0
    },
    {
      "id": "secret_gem_5",
      "type": "collectible",
      "itemId": "gem_peridot",
      "name": "Canopy Peridot",
      "points": 250,
      "x": 4,
      "y": 11,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "torch_ch2_5_spawn",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 0,
      "y": 1,
      "elevation": 0
    },
    {
      "id": "torch_ch2_5_exit",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 14,
      "y": 1,
      "elevation": 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 6 (Shō) - 17x15
// Requirements:
// 1. Exactly 2 keys: key_amber_6 (ground, z=0), key_canopy_6 (overhead, z=1)
// 2. Exactly 2 doors: door_amber_6 (gates southern ramp to bridge), door_canopy_6 (gates exit)
// 3. Without key_amber_6, solveLevel is NULL
// 4. Zero-bypass gating: with allowDoors=false, solveLevel is NULL
// =========================================================================
export function makeLevel6() {
  const width = 17, height = 15;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1 ], // 01 (1,1) Spawn, (15,1) Exit
    [  1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1 ], // 02 (15,2) door_canopy_6!
    [  1, 0, 1, 1, 1,'R_S',1, 1, 1, 1, 1,'R_S',1, 1, 1, 0, 1 ], // 03 (15,3) corridor before door
    [  1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1 ], // 04
    [  1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1 ], // 05
    [  1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1 ], // 06
    [  1, 0, 1, 0, 0,'B_EW',0, 0, 0, 0, 0,'B_EW',0, 0, 1, 1, 1 ], // 07 (5,7) underpass, (8,7) key_amber_6, (11,7) underpass
    [  1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1 ], // 08
    [  1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ], // 09 (9,9) door_amber_6!
    [  1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1 ], // 10
    [  1, 0, 0, 0, 1,'R_N',1, 0, 1, 1, 1,'R_N',1, 0, 1, 1, 1 ], // 11 South ramps at x=5, x=11 (facing north)
    [  1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1 ], // 12 (5,12) and (11,12) low sides of R_N
    [  1, 0, 1,'SW',0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1 ], // 13 (1,13) Lectern, (4,13) Secret gem
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // 14 South boundary
  ];

  const overhead = Array.from({ length: height }, () => Array(width).fill(0));
  for (let y = 4; y <= 10; y++) {
    overhead[y][5] = 'B_EW';
    overhead[y][11] = 'B_EW';
  }
  // Cross connection between the two bridges on overhead at y=5
  for (let x = 6; x <= 10; x++) {
    overhead[5][x] = 'WW';
  }

  const manifest = {
    "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    "id": "6",
    "chapter": "chapter_2",
    "zone": "zone_2",
    "title": "Canopy Crossings",
    "author": "Inbar Rose",
    "version": 1,
    "dimensions": { width, height },
    "config": {
      "fogOfWar": false,
      "viewRadius": 7,
      "allowFreePan": true,
      "tileSize": 32,
      "theme": "jungle"
    },
    "spawn": { "x": 1, "y": 1, "elevation": 0, "style": "wall_doorway", "wallDirection": "north" },
    "exit": { "x": 15, "y": 1, "elevation": 0, "style": "wall_archway", "wallDirection": "north" },
    "parSteps": 65,
    "parTime": 39,
    "architectNote": "Architect's Journal: Twin trestles span the emerald mist. The lower underpass canal unlocks the western mechanism, whilst the upper eastern crossing delivers the key to the sanctuary door.",
    "package": { "layers": "./layers.json", "entities": "./entities.json", "documentation": "./README.md" }
  };

  const entities = [
    {
      "id": "sign_arch_6",
      "type": "signpost",
      "title": "Architect's Note #6",
      "style": "lectern_stone",
      "chapter": "chapter_2",
      "levelId": "6",
      "x": 1,
      "y": 13,
      "z": 0,
      "elevation": 0,
      "coordString": "(1, 13, 0)",
      "text": "Architect's Journal: Twin trestles span the emerald mist. The lower underpass canal unlocks the western mechanism, whilst the upper eastern crossing delivers the key to the sanctuary door."
    },
    {
      "id": "inscr_tunnel_6",
      "type": "wall_decor",
      "decorType": "carving",
      "facing": "north",
      "text": "Ground below, heavens above. Walk the underpass tunnel first, then ascend to cross the bridge deck.",
      "playerDialogue": "The underpass leads to the amber key, then the bridge reaches the northern canopy gate.",
      "x": 3,
      "y": 8,
      "elevation": 0
    },
    {
      "id": "inscr_secret_6",
      "type": "wall_decor",
      "decorType": "runic_plate",
      "facing": "north",
      "text": "ᚲᛁᛈᚺ Verdant jade slumbers behind the southern ivy seam.",
      "playerDialogue": "A loose stone seam gives way to a hidden sanctum.",
      "x": 2,
      "y": 13,
      "elevation": 0
    },
    {
      "id": "key_amber_6",
      "type": "key",
      "color": "#f59e0b",
      "keyId": "key_amber_6",
      "x": 8,
      "y": 7,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "door_amber_6",
      "type": "door",
      "color": "#f59e0b",
      "requiresKey": "key_amber_6",
      "x": 9,
      "y": 9,
      "elevation": 0
    },
    {
      "id": "key_canopy_6",
      "type": "key",
      "color": "#10b981",
      "keyId": "key_canopy_6",
      "x": 11,
      "y": 7,
      "z": 1,
      "elevation": 1
    },
    {
      "id": "door_canopy_6",
      "type": "door",
      "color": "#10b981",
      "requiresKey": "key_canopy_6",
      "x": 15,
      "y": 2,
      "elevation": 0
    },
    {
      "id": "secret_gem_6",
      "type": "collectible",
      "itemId": "gem_jade",
      "name": "Verdant Jade",
      "points": 350,
      "x": 4,
      "y": 13,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "torch_ch2_6_spawn",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 0,
      "y": 1,
      "elevation": 0
    },
    {
      "id": "torch_ch2_6_exit",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 16,
      "y": 1,
      "elevation": 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 7 (Ten) - 17x15
// Requirements:
// 1. Must contain B_NS (East-West bridge deck) AND B_EW (North-South bridge deck) in overhead layer!
// 2. Zero-bypass gating: with allowDoors=false, solveLevel is NULL
// =========================================================================
export function makeLevel7() {
  const width = 17, height = 15;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1 ], // 01 (1,1) Spawn, (15,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1 ], // 02 (15,2) door_chasm_7!
    [  1, 0, 1, 0, 1, 0, 1,'R_S',1, 1, 1, 0, 1, 0, 0, 0, 1 ], // 03 (7,3) Ramp facing South down
    [  1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1 ], // 04
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1 ], // 05
    [  1, 0, 0, 0, 1, 0, 0,'B_EW',0, 0, 1, 0, 1, 0, 1, 1, 1 ], // 06 (7,6) Underpass canal
    [  1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1 ], // 07
    [  1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1 ], // 08
    [  1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1 ], // 09
    [  1, 0, 1, 0, 1, 0, 0,'R_N',1, 0, 0, 0, 1, 0, 1, 0, 1 ], // 10 (7,10) Ramp facing North up
    [  1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 11 (7,11) low side of R_N
    [  1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1 ], // 12
    [  1, 0, 0, 0, 1,'SW',0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1 ], // 13 (1,13) Lectern, (6,13) Secret gem
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // 14 South boundary
  ];

  // Overhead layer: B_EW runs North-South at x=7; B_NS runs East-West at y=6!
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));
  for (let y = 4; y <= 9; y++) {
    overhead[y][7] = 'B_EW';
  }
  // East-West bridge crossing
  overhead[6][5] = 'B_NS';
  overhead[6][6] = 'B_NS';
  overhead[6][8] = 'B_NS';
  overhead[6][9] = 'B_NS';
  overhead[5][6] = 'WW'; overhead[5][8] = 'WW';
  overhead[7][6] = 'WW'; overhead[7][8] = 'WW';

  const manifest = {
    "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    "id": "7",
    "chapter": "chapter_2",
    "zone": "zone_2",
    "title": "The Sunken Chasm",
    "author": "Inbar Rose",
    "version": 1,
    "dimensions": { width, height },
    "config": {
      "fogOfWar": false,
      "viewRadius": 7,
      "allowFreePan": true,
      "tileSize": 32,
      "theme": "jungle"
    },
    "spawn": { "x": 1, "y": 1, "elevation": 0, "style": "wall_doorway", "wallDirection": "north" },
    "exit": { "x": 15, "y": 1, "elevation": 0, "style": "wall_archway", "wallDirection": "north" },
    "parSteps": 60,
    "parTime": 36,
    "architectNote": "Architect's Journal: The chasm deepens with every league. Here, ancient engineers elevated the stone viaduct over subterranean water conduits. Tread high to grasp the emerald sigil.",
    "package": { "layers": "./layers.json", "entities": "./entities.json", "documentation": "./README.md" }
  };

  const entities = [
    {
      "id": "sign_arch_7",
      "type": "signpost",
      "title": "Architect's Note #7",
      "style": "lectern_stone",
      "chapter": "chapter_2",
      "levelId": "7",
      "x": 1,
      "y": 13,
      "z": 0,
      "elevation": 0,
      "coordString": "(1, 13, 0)",
      "text": "Architect's Journal: The chasm deepens with every league. Here, ancient engineers elevated the stone viaduct over subterranean water conduits. Tread high to grasp the emerald sigil."
    },
    {
      "id": "inscr_chasm_7",
      "type": "wall_decor",
      "decorType": "carving",
      "facing": "north",
      "text": "Two bridges intersect across the chasm depths. Mind the directional incline.",
      "playerDialogue": "The upper viaduct deck suspends the key above the deep chasm waters.",
      "x": 3,
      "y": 4,
      "elevation": 0
    },
    {
      "id": "inscr_secret_7",
      "type": "wall_decor",
      "decorType": "runic_plate",
      "facing": "north",
      "text": "ᚲᛁᛈᚺ Beneath the waterfall cistern, the chrysoberyl of the canyon rests.",
      "playerDialogue": "A secret passage behind the southern pillar.",
      "x": 4,
      "y": 13,
      "elevation": 0
    },
    {
      "id": "key_chasm_7",
      "type": "key",
      "color": "#10b981",
      "keyId": "key_chasm_7",
      "x": 7,
      "y": 6,
      "z": 1,
      "elevation": 1
    },
    {
      "id": "door_chasm_7",
      "type": "door",
      "color": "#10b981",
      "requiresKey": "key_chasm_7",
      "x": 15,
      "y": 2,
      "elevation": 0
    },
    {
      "id": "secret_gem_7",
      "type": "collectible",
      "itemId": "gem_chrysoberyl",
      "name": "Chasm Chrysoberyl",
      "points": 400,
      "x": 7,
      "y": 13,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "torch_ch2_7_spawn",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 0,
      "y": 1,
      "elevation": 0
    },
    {
      "id": "torch_ch2_7_exit",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 16,
      "y": 1,
      "elevation": 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 8 (Ketsu) - 19x17
// Requirements:
// 1. Exactly 2 keys: key_ruby_8 (z=1), key_gold_8 (z=1)
// 2. Exactly 2 doors: door_ruby_8, door_gold_8
// 3. Both keys are elevated on twin bridge decks (West at x=5, East at x=13)
// 4. Sequential dependency: without key_ruby_8, cannot reach East bridge -> solveLevel is NULL
// 5. Zero-bypass gating: with allowDoors=false, solveLevel is NULL
// =========================================================================
export function makeLevel8() {
  const width = 19, height = 17;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1 ], // 01 (1,1) Spawn, (17,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 02 (17,2) door_gold_8!
    [  1, 0, 1, 0, 1,'R_S',1, 0, 1, 0, 1, 0, 1,'R_S',1, 0, 0, 0, 1 ], // 03 North ramps at x=5, x=13
    [  1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1 ], // 04
    [  1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1 ], // 05
    [  1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1 ], // 06
    [  1, 0, 1, 0, 0,'B_EW',0, 0, 1, 1, 1, 0, 0,'B_EW',0, 0, 1, 0, 1 ], // 07 (5,7) and (13,7) underpasses
    [  1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1 ], // 08
    [  1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ], // 09
    [  1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1 ], // 10
    [  1, 0, 0, 0, 1,'R_N',1, 0, 1, 0, 1, 0, 1,'R_N',1, 0, 1, 1, 1 ], // 11 South ramps at x=5, x=13
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1 ], // 12 (13,12) door_ruby_8!
    [  1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1 ], // 13
    [  1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1 ], // 14
    [  1, 0,'SW',0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1 ], // 15 (1,15) Lectern, (5,15) Secret gem
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // 16 South boundary
  ];

  // Overhead bridges: West bridge at x=5 from y=4 to y=10; East bridge at x=13 from y=4 to y=10
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));
  for (let y = 4; y <= 10; y++) {
    overhead[y][5] = 'B_EW';
    overhead[y][13] = 'B_EW';
  }
  overhead[7][4] = 'WW'; overhead[7][6] = 'WW';
  overhead[7][12] = 'WW'; overhead[7][14] = 'WW';

  const manifest = {
    "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    "id": "8",
    "chapter": "chapter_2",
    "zone": "zone_2",
    "title": "Citadel of the Two Horizons",
    "author": "Inbar Rose",
    "version": 1,
    "dimensions": { width, height },
    "config": {
      "fogOfWar": true,
      "viewRadius": 8,
      "allowFreePan": true,
      "tileSize": 32,
      "theme": "jungle"
    },
    "spawn": { "x": 1, "y": 1, "elevation": 0, "style": "wall_doorway", "wallDirection": "north" },
    "exit": { "x": 17, "y": 1, "elevation": 0, "style": "wall_archway", "wallDirection": "north" },
    "parSteps": 70,
    "parTime": 42,
    "architectNote": "Architect's Journal: At the apex of the canopy stands the Citadel of the Two Horizons. One vista looks back upon the moss-grown labyrinth; the other gazes forward into the subterranean volcanic halls.",
    "package": { "layers": "./layers.json", "entities": "./entities.json", "documentation": "./README.md" }
  };

  const entities = [
    {
      "id": "sign_arch_8",
      "type": "signpost",
      "title": "Architect's Note #8",
      "style": "lectern_stone",
      "chapter": "chapter_2",
      "levelId": "8",
      "x": 1,
      "y": 15,
      "z": 0,
      "elevation": 0,
      "coordString": "(1, 15, 0)",
      "text": "Architect's Journal: At the apex of the canopy stands the Citadel of the Two Horizons. One vista looks back upon the moss-grown labyrinth; the other gazes forward into the subterranean volcanic halls."
    },
    {
      "id": "inscr_citadel_8",
      "type": "wall_decor",
      "decorType": "carving",
      "facing": "north",
      "text": "The citadel crowns the canopy. Tread the battlements to seize the Horizon Sigil.",
      "playerDialogue": "The twin bridges carry the Ruby and Gold Horizon Keys.",
      "x": 3,
      "y": 6,
      "elevation": 0
    },
    {
      "id": "inscr_secret_8",
      "type": "wall_decor",
      "decorType": "runic_plate",
      "facing": "north",
      "text": "ᚲᛁᛈᚺ The Master Architect's Beryl is sequestered behind the southern masonry.",
      "playerDialogue": "The wall glyph reveals a hidden alcove ahead.",
      "x": 2,
      "y": 15,
      "elevation": 0
    },
    {
      "id": "key_ruby_8",
      "type": "key",
      "color": "#ef4444",
      "keyId": "key_ruby_8",
      "x": 5,
      "y": 7,
      "z": 1,
      "elevation": 1
    },
    {
      "id": "door_ruby_8",
      "type": "door",
      "color": "#ef4444",
      "requiresKey": "key_ruby_8",
      "x": 13,
      "y": 12,
      "elevation": 0
    },
    {
      "id": "key_gold_8",
      "type": "key",
      "color": "#fbbf24",
      "keyId": "key_gold_8",
      "x": 13,
      "y": 7,
      "z": 1,
      "elevation": 1
    },
    {
      "id": "door_gold_8",
      "type": "door",
      "color": "#fbbf24",
      "requiresKey": "key_gold_8",
      "x": 17,
      "y": 2,
      "elevation": 0
    },
    {
      "id": "secret_gem_8",
      "type": "collectible",
      "itemId": "gem_beryl",
      "name": "Master Architect's Beryl",
      "points": 500,
      "x": 5,
      "y": 15,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "torch_ch2_8_spawn",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 0,
      "y": 1,
      "elevation": 0
    },
    {
      "id": "torch_ch2_8_exit",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 18,
      "y": 1,
      "elevation": 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// RUN ALL VALIDATION TESTS
// =========================================================================
const levels = [makeLevel5(), makeLevel6(), makeLevel7(), makeLevel8()];

for (const { manifest, layers, entities } of levels) {
  const fullLevel = { ...manifest, layers, entities };

  // 1. LevelValidator
  const valResult = LevelValidator.validate(fullLevel);
  if (valResult.errors.length > 0) {
    throw new Error(`Level ${manifest.id} validation errors: ${valResult.errors.join(', ')}`);
  }

  // 2. Solve level
  const solution = solveLevel(fullLevel);
  if (!solution) {
    throw new Error(`Level ${manifest.id} is NOT solvable!`);
  }

  // 3. Zero-bypass gating
  const bypass = solveLevel(fullLevel, { allowDoors: false });
  if (bypass !== null) {
    throw new Error(`Level ${manifest.id} doors CAN BE BYPASSED!`);
  }

  // 4. Multi-elevation checks
  const elevatedKeys = entities.filter(e => e.type === 'key' && (e.z === 1 || e.elevation === 1));
  if (elevatedKeys.length === 0) {
    throw new Error(`Level ${manifest.id} has no elevated key at z=1`);
  }

  // 5. Specific level assertions
  if (manifest.id === '6') {
    const keys = entities.filter(e => e.type === 'key');
    const doors = entities.filter(e => e.type === 'door');
    if (keys.length !== 2 || doors.length !== 2) throw new Error('Level 6 must have 2 keys and 2 doors');
    const groundKey = keys.find(k => (k.z || k.elevation || 0) === 0);
    const noGround = { ...fullLevel, entities: entities.filter(e => e.id !== groundKey.id) };
    if (solveLevel(noGround) !== null) throw new Error('Level 6 can be solved without ground key!');
  }

  if (manifest.id === '7') {
    const overheadTiles = new Set();
    layers.overhead.forEach(r => r.forEach(c => { if (c) overheadTiles.add(c); }));
    if (!overheadTiles.has('B_NS') || !overheadTiles.has('B_EW')) {
      throw new Error('Level 7 must contain both B_NS and B_EW in overhead layer!');
    }
  }

  if (manifest.id === '8') {
    const keys = entities.filter(e => e.type === 'key');
    const doors = entities.filter(e => e.type === 'door');
    if (keys.length !== 2 || doors.length !== 2) throw new Error('Level 8 must have 2 keys and 2 doors');
    if (!keys.every(k => k.z === 1 || k.elevation === 1)) throw new Error('Level 8 both keys must be z=1');
    const noRuby = { ...fullLevel, entities: entities.filter(e => e.id !== 'key_ruby_8') };
    if (solveLevel(noRuby) !== null) throw new Error('Level 8 can be solved without key_ruby_8!');
  }

  // 6. Metrics
  const metrics = auditLevelMetrics(fullLevel);
  console.log(`[Level ${manifest.id}: ${manifest.title}] Solved in ${solution.length} steps | Par: ${manifest.parSteps} | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count} | 3D: ${metrics.total3DElements}`);
}

console.log('\n✨ ALL Chapter 2 levels passed 100% of rigor and unit test assertions!');
