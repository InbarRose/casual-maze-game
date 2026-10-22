/**
 * Test & Verification Harness for Chapter 8 Rigor Overhaul (Levels 29–32) (BL-185, ADR-0059)
 *
 * Verifies:
 * 1. 100% valid via LevelValidator (0 errors, 0 warnings).
 * 2. Solvable via BFS shortest-path solver.
 * 3. 100% zero-bypass gating:
 *    - Level 29: Unsolvable without Golden Needle Key or Golden Needle Door.
 *    - Level 30: Unsolvable without Underpass Cyan Key or Cyan Door; has 3D bridge underpass at (7, 7).
 *    - Level 31: Unsolvable without Ruby Key or Ruby Door; has 4 cardinal monolith carvings.
 *    - Level 32: Unsolvable without Spire Dynamo Lever, Golden Apex Key, or Golden Spire Gate;
 *                has branching exits array ('exit_spire_primary' -> '1', 'exit_spire_citadel_branch' -> 'story_citadel_1').
 * 4. Architectural criteria:
 *    - Corridor directional inertia >= 70%.
 *    - Zero dead space >= 4x4.
 *    - North wall doorway entrance ('wall_doorway', 'north') & archway exit ('wall_archway', 'north').
 *    - Stone lecterns with coordinates (X, Y, Z).
 *    - Diegetic wall carvings and runic plates for hints and secret chambers.
 *    - allowRotation: true in config.
 */

import { solveLevel } from '../js/engine/solver.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';
import { TILES } from '../js/core/constants.js';

// =========================================================================
// LEVEL 29 - 19x17
// The Cardinal Needle: 4-Way Camera Rotation & Cardinal Corridors
// =========================================================================
export function makeLevel29() {
  const width = 19, height = 17;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // --- Topology Construction ---
  // Spawn: (3, 1) facing north wall at y=0.
  // 1. West Wing (Spawn winding down to West needle)
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 7, 13);
  carveH(3, 5, 13);
  carveV(3, 11, 15);
  carveH(1, 3, 15);
  carveV(1, 11, 15);

  // 2. Central Spine to South Needle Wing (Golden Key)
  carveH(5, 9, 7);
  carveV(9, 7, 15);
  carveH(7, 9, 15); // (7, 15) Golden Key location
  carveV(7, 13, 15);

  // 3. East Quadrant (Routing up to North Needle Gate & Exit)
  carveH(9, 13, 11);
  carveV(13, 7, 11);
  carveH(11, 15, 7);
  carveV(11, 3, 7);
  carveH(11, 13, 3);
  carveV(15, 5, 13);
  carveH(15, 17, 13);
  carveV(17, 7, 15);
  carveH(13, 17, 15);

  // Path to Golden Door and Exit
  carveV(15, 1, 5); // (15, 3) Golden Door, (15, 1) Exit
  carveH(13, 15, 5);

  // Secret Wall & Treasure Chamber
  ground[15][13] = 'SW'; // Secret wall
  carveH(11, 13, 15);   // Secret chamber behind wall at (11, 15)

  // Anti-deadspace fillers and winding branches
  carveV(7, 1, 5);
  carveH(5, 7, 1);
  carveV(5, 1, 3);
  carveH(7, 11, 3);
  carveV(17, 1, 5);
  carveH(15, 17, 5);
  carveV(13, 1, 3);
  carveH(9, 13, 1);
  carveV(9, 1, 5);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "29",
    chapter: "chapter_8",
    zone: "zone_8",
    title: "The Cardinal Needle",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      allowRotation: true,
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "dungeon",
      viewPerspective: "angled"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 15,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      label: "Needle Sanctum",
      wallDirection: "north"
    },
    parSteps: 60,
    parTime: 36,
    architectNote: "Rotate the camera [Q / R] to view the cardinal corridors. Screen controls adapt automatically to your camera heading.",
    help: {
      title: "Level 29: The Cardinal Needle",
      message: "Press [Q] and [R] to rotate the view. Screen controls adapt automatically to your camera heading."
    }
  };

  const entities = [
    {
      id: "note_29",
      type: "architect_note",
      title: "Architect's Folio #29",
      text: "The Cardinal Needle turns upon a celestial axis. When perspective shifts, long corridors reveal passage once occluded.",
      author: "The Grand Architect",
      x: 1,
      y: 3,
      elevation: 0,
      style: "lectern_stone"
    },
    {
      id: "key_gold_29",
      type: "key",
      color: "#eab308",
      name: "Golden Needle Key",
      x: 7,
      y: 15,
      elevation: 0
    },
    {
      id: "door_gold_29",
      type: "door",
      color: "#eab308",
      name: "Needle Sanctum Gate",
      requiresKey: "key_gold_29",
      x: 15,
      y: 3,
      elevation: 0
    },
    {
      id: "plate_needle_clue",
      type: "wall_decor",
      decorType: "runic_plate",
      title: "Compass Monolith Plate",
      text: "Align the camera with [Q] and [R] to sight through the cardinal needles.",
      author: "Needle Keeper",
      x: 9,
      y: 7,
      elevation: 0,
      facing: "north"
    },
    {
      id: "carving_secret_needle",
      type: "wall_decor",
      decorType: "carving",
      title: "Hollow Stone Relief",
      text: "The mortar rings hollow in the southern spur.",
      author: "Needle Mason",
      x: 15,
      y: 15,
      elevation: 0,
      facing: "east"
    },
    {
      id: "secret_gem_29",
      type: "collectible",
      collectibleType: "gem",
      name: "Sunstone Needle Core",
      scoreValue: 350,
      color: "#f59e0b",
      x: 11,
      y: 15,
      elevation: 0
    },
    {
      id: "gem_cardinal_topaz",
      type: "collectible",
      collectibleType: "gem",
      name: "Cardinal Topaz",
      scoreValue: 150,
      color: "#fbbf24",
      x: 1,
      y: 15,
      elevation: 0
    },
    {
      id: "torch_29_entry",
      type: "wall_decor",
      decorType: "torch",
      x: 3,
      y: 2,
      elevation: 0,
      facing: "west"
    },
    {
      id: "torch_29_south",
      type: "wall_decor",
      decorType: "torch",
      x: 9,
      y: 14,
      elevation: 0,
      facing: "east"
    },
    {
      id: "torch_29_exit",
      type: "wall_decor",
      decorType: "torch",
      x: 15,
      y: 2,
      elevation: 0,
      facing: "west"
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 30 - 21x19
// The Hidden Underpass: 3D Underpass & Perspective Occlusion
// =========================================================================
export function makeLevel30() {
  const width = 21, height = 19;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // --- Topology Construction ---
  // Spawn: (3, 1) facing north wall at y=0.
  // 1. West Wing (Spawn winding to underpass approach)
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 7, 15);
  carveH(1, 5, 15);
  carveV(1, 11, 15);
  carveH(1, 3, 11);
  carveV(3, 7, 11);

  // 2. Approach to Underpass & 3D Bridge
  // Carve corridor network first:
  carveH(5, 11, 7);
  carveV(11, 7, 13);
  carveH(9, 13, 13);
  carveV(9, 13, 17);
  carveH(5, 19, 17); // connects all the way from west to east at y=17
  carveV(5, 15, 17);

  // Ramp access paths on ground:
  // South approach to ramp at (7, 9):
  carveV(7, 9, 11);
  carveH(5, 7, 11);
  // North exit from ramp at (7, 5):
  carveV(7, 3, 5);
  carveH(7, 11, 3);
  carveV(11, 1, 5);

  // 3. Eastern Labyrinth to Door and Exit
  carveH(11, 15, 5);
  carveV(15, 5, 11);
  carveH(13, 17, 11);
  carveV(17, 9, 17);
  carveV(19, 7, 17);
  carveH(17, 19, 7);
  carveV(17, 3, 7); // (17, 3) Door
  carveV(17, 1, 3); // (17, 1) Exit

  // Now stamp bridge & ramps AFTER carving:
  // Ground underpass runs E-W through (7, 7):
  ground[7][7] = 'B_EW'; // underpass tunnel E-W

  // Overhead bridge deck runs N-S over (7, 7):
  ground[9][7] = 'R_N';  // ramp ascending North from ground (y=9) to overhead (y=8)
  overhead[8][7] = 'B_NS';
  overhead[7][7] = 'B_NS';
  overhead[6][7] = 'B_NS';
  ground[5][7] = 'R_S';  // ramp descending North from overhead (y=6) to ground (y=5)

  // Secret Wall & Occluded Sunstone Chamber
  ground[17][3] = 'SW'; // Secret wall at (3, 17)
  carveH(1, 3, 17);    // Secret room at (1, 17)

  // Anti-deadspace spurs and fillers
  carveV(9, 1, 3);
  carveH(7, 9, 1);
  carveV(13, 1, 3);
  carveH(13, 15, 1);
  carveV(15, 1, 3);
  carveV(13, 7, 9);
  carveH(13, 15, 7);
  carveV(15, 13, 15);
  carveH(15, 17, 15);
  carveV(19, 1, 5);
  carveH(17, 19, 5);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "30",
    chapter: "chapter_8",
    zone: "zone_8",
    title: "The Hidden Underpass",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      allowRotation: true,
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "dungeon",
      viewPerspective: "angled"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 17,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      label: "Overpass Gate",
      wallDirection: "north"
    },
    parSteps: 70,
    parTime: 42,
    architectNote: "Overhead bridges occlude low ground corridors. Rotate 90 degrees to peer straight through underpass tunnels!",
    help: {
      title: "Level 30: The Hidden Underpass",
      message: "Notice how rotation changes which side of bridges and walls you see. The tunnel key lies under the span."
    }
  };

  const entities = [
    {
      id: "note_30",
      type: "architect_note",
      title: "Architect's Folio #30",
      text: "The bridge deck conceals the true path beneath. When rotated [Q / R], the shadowed archway reveals the underpass key.",
      author: "The Grand Architect",
      x: 1,
      y: 3,
      elevation: 0,
      style: "lectern_stone"
    },
    {
      id: "key_cyan_30",
      type: "key",
      color: "#06b6d4",
      name: "Underpass Key",
      x: 7,
      y: 7,
      elevation: 0
    },
    {
      id: "door_cyan_30",
      type: "door",
      color: "#06b6d4",
      name: "Underpass Exit Gate",
      requiresKey: "key_cyan_30",
      x: 17,
      y: 3,
      elevation: 0
    },
    {
      id: "gem_bridge_top",
      type: "collectible",
      collectibleType: "gem",
      name: "Skyward Topaz",
      scoreValue: 200,
      color: "#fbbf24",
      x: 7,
      y: 7,
      elevation: 1
    },
    {
      id: "secret_underpass_30",
      type: "collectible",
      collectibleType: "gem",
      name: "Occluded Sunstone",
      scoreValue: 400,
      color: "#f59e0b",
      x: 1,
      y: 17,
      elevation: 0
    },
    {
      id: "gem_aqueduct_pearl_30",
      type: "collectible",
      collectibleType: "gem",
      name: "Subterranean Aqueduct Pearl",
      scoreValue: 200,
      color: "#38bdf8",
      x: 9,
      y: 17,
      elevation: 0
    },
    {
      id: "decor_note_bridge",
      type: "wall_decor",
      decorType: "runic_plate",
      title: "Bridge Observation",
      text: "Rotating [Q / R] shifts the 2.5D perspective, revealing what was hidden behind elevated bridge spans.",
      author: "Bridge Engineer",
      x: 5,
      y: 7,
      elevation: 0,
      facing: "north"
    },
    {
      id: "carving_secret_underpass",
      type: "wall_decor",
      decorType: "carving",
      title: "Chiseled Vault Relief",
      text: "The south-western stone yields to determination.",
      author: "Stone Carver",
      x: 5,
      y: 17,
      elevation: 0,
      facing: "south"
    },
    {
      id: "torch_30_nw",
      type: "wall_decor",
      decorType: "torch",
      x: 3,
      y: 2,
      elevation: 0,
      facing: "west"
    },
    {
      id: "torch_30_se",
      type: "wall_decor",
      decorType: "torch",
      x: 17,
      y: 2,
      elevation: 0,
      facing: "east"
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 31 - 21x19
// The Four-Faced Pillar: Cardinal Monolith Carvings & 360-Degree Perspective
// =========================================================================
export function makeLevel31() {
  const width = 21, height = 19;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // --- Topology Construction ---
  // Spawn: (3, 1) facing north wall at y=0.
  // 1. West Wing (Spawn to Central Monument Approach)
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 7, 13);
  carveH(1, 5, 13);
  carveV(1, 11, 15);
  carveH(1, 3, 15);
  carveV(3, 13, 17);
  carveH(3, 7, 17);

  // 2. Central Monument Perimeter Corridors
  // Monument walls sit at (7, 6), (8, 7), (7, 8), (6, 7).
  // Inner hollow tile is (7, 7)
  ground[7][7] = 0; // Eye of Four Winds gem inside
  // Perimeter paths surrounding the monument:
  // North walk:
  carveH(5, 9, 5);
  // South walk:
  carveH(5, 9, 9);
  // West walk:
  carveV(5, 5, 9);
  // East walk:
  carveV(9, 5, 9);

  // Connection from South (y=17) up to monument South walk:
  carveV(7, 9, 17);

  // Connection from monument to Eastern Vault (Ruby Key)
  carveH(9, 13, 7);
  carveV(13, 7, 15);
  carveH(13, 19, 15);
  carveV(19, 9, 15); // (19, 9) Ruby Key
  carveH(15, 19, 9);
  carveV(15, 5, 9);

  // 3. North-East Route to Ruby Gate and Archway Exit
  carveH(15, 17, 5);
  carveV(17, 3, 5); // (17, 3) Ruby Gate
  carveV(17, 1, 3); // (17, 1) Exit

  // Secret Wall & Zephyr Core Chamber
  ground[17][1] = 'SW'; // Secret wall at (1, 17)
  carveH(1, 3, 17);     // (1, 17) Zephyr Core

  // Anti-deadspace spurs and fillers
  carveV(9, 1, 3);
  carveH(7, 9, 1);
  carveV(7, 1, 3);
  carveH(5, 7, 1);
  carveV(11, 1, 5);
  carveH(11, 15, 1);
  carveV(13, 1, 3);
  carveV(15, 1, 5);
  carveV(19, 1, 7);
  carveH(17, 19, 7);
  carveV(11, 9, 17);
  carveH(11, 13, 17);
  carveV(17, 11, 17);
  carveH(15, 17, 17);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "31",
    chapter: "chapter_8",
    zone: "zone_8",
    title: "The Four-Faced Pillar",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      allowRotation: true,
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "temple",
      viewPerspective: "angled"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 17,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      label: "Sanctuary of the Four Winds",
      wallDirection: "north"
    },
    parSteps: 75,
    parTime: 45,
    architectNote: "Four faces of the monolith tell one story. Walk the perimeter and rotate the view to read each inscription.",
    help: {
      title: "Level 31: The Four-Faced Pillar",
      message: "Rotate the camera to view each side of the central monument. Find the ruby key in the eastern corner."
    }
  };

  const entities = [
    {
      id: "note_31",
      type: "architect_note",
      title: "Architect's Folio #31",
      text: "The Four-Faced Pillar stands immutable at the world's axis. As you circle and turn the camera [Q / R], four sacred truths align.",
      author: "The Grand Architect",
      x: 1,
      y: 3,
      elevation: 0,
      style: "lectern_stone"
    },
    {
      id: "key_ruby_31",
      type: "key",
      color: "#ef4444",
      name: "Ruby Winds Key",
      x: 19,
      y: 9,
      elevation: 0
    },
    {
      id: "door_ruby_31",
      type: "door",
      color: "#ef4444",
      name: "Four Winds Sanctuary Gate",
      requiresKey: "key_ruby_31",
      x: 17,
      y: 3,
      elevation: 0
    },
    {
      id: "decor_north_face",
      type: "wall_decor",
      decorType: "carving",
      title: "North Face of Monolith",
      text: "Face of the North Wind: The ruby key sleeps in the eastern vault.",
      author: "Ancient Scribe",
      x: 7,
      y: 6,
      facing: "north",
      elevation: 0
    },
    {
      id: "decor_east_face",
      type: "wall_decor",
      decorType: "carving",
      title: "East Face of Monolith",
      text: "Face of the Dawn: When the perspective is turned, unseen paths emerge.",
      author: "Ancient Scribe",
      x: 8,
      y: 7,
      facing: "east",
      elevation: 0
    },
    {
      id: "decor_south_face",
      type: "wall_decor",
      decorType: "carving",
      title: "South Face of Monolith",
      text: "Face of the Zenith: Unlock the southern portal to continue upward.",
      author: "Ancient Scribe",
      x: 7,
      y: 8,
      facing: "south",
      elevation: 0
    },
    {
      id: "decor_west_face",
      type: "wall_decor",
      decorType: "carving",
      title: "West Face of Monolith",
      text: "Face of the Dusk: Rotate [R] clockwise to survey the courtyard.",
      author: "Ancient Scribe",
      x: 6,
      y: 7,
      facing: "west",
      elevation: 0
    },
    {
      id: "gem_four_winds_eye_31",
      type: "collectible",
      collectibleType: "gem",
      name: "Eye of the Four Winds",
      scoreValue: 250,
      color: "#fbbf24",
      x: 7,
      y: 7,
      elevation: 0
    },
    {
      id: "secret_pillar_31",
      type: "collectible",
      collectibleType: "gem",
      name: "Four Winds Zephyr Core",
      scoreValue: 450,
      color: "#38bdf8",
      x: 1,
      y: 17,
      elevation: 0
    },
    {
      id: "plate_monolith_wisdom",
      type: "wall_decor",
      decorType: "runic_plate",
      title: "Zephyr Stele Inscription",
      text: "The compass reveals what static eyes overlook. Rotate clockwise to view dawn, counter-clockwise for dusk.",
      author: "Temple Chronicler",
      x: 13,
      y: 7,
      facing: "north",
      elevation: 0
    },
    {
      id: "torch_31_entry",
      type: "wall_decor",
      decorType: "torch",
      x: 3,
      y: 2,
      elevation: 0,
      facing: "west"
    },
    {
      id: "torch_31_exit",
      type: "wall_decor",
      decorType: "torch",
      x: 17,
      y: 2,
      elevation: 0,
      facing: "east"
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 32 - 23x21
// The Prismatic Spire: Culmination, World Rotation & Branching Exits
// =========================================================================
export function makeLevel32() {
  const width = 23, height = 21;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // --- Topology Construction ---
  // Spawn: (3, 1) facing north wall at y=0.
  // 1. West Spire Wing (Spawn to Ramp Approach)
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 7, 13);
  carveH(1, 5, 13);
  carveV(1, 11, 17);
  carveH(1, 3, 17);
  carveV(3, 15, 19);
  carveH(3, 7, 19);

  // 2. High Bridge & Rampart Viaduct at Z=1
  // Carve base corridors:
  carveV(7, 15, 19);
  carveH(5, 9, 11); // underpass corridor E-W
  carveV(5, 7, 11); // checkpoint at (5, 7)
  carveV(7, 7, 9);
  carveH(7, 11, 7);

  // Ramp and bridge structure:
  ground[15][7] = 'R_N'; // ascends north from ground y=15 to overhead y=14
  overhead[14][7] = 'B_NS';
  overhead[13][7] = 'B_NS';
  overhead[12][7] = 'B_NS';
  overhead[11][7] = 'B_NS';
  overhead[10][7] = 'B_NS';
  ground[11][7] = 'B_EW'; // underpass at (7, 11)
  ground[9][7] = 'R_S';  // descends north from overhead y=10 to ground y=9

  // 3. Central Basin to Spire Dynamo Lever at (9, 19)
  carveV(11, 7, 15);
  carveH(9, 13, 15);
  carveV(13, 11, 15); // corridor connecting basin to barrier gate at (13, 11)
  carveV(9, 15, 19); // (9, 19) Spire Dynamo Lever

  // 4. Eastern Spire Labyrinth (Post-Barrier to Golden Key at (21, 17))
  carveH(13, 17, 11);
  carveV(17, 11, 17);
  carveH(17, 21, 17); // (21, 17) Golden Apex Key
  carveV(21, 13, 19);
  carveH(19, 21, 19);
  carveV(19, 9, 19);
  carveH(17, 21, 9);
  carveV(21, 5, 9);
  carveH(19, 21, 5); // (19, 5) Golden Spire Door

  // 5. Climax Junction: Golden Door at (19, 5) to Branching Exits
  carveV(19, 3, 5); // post-door corridor
  // Branch Exit (Citadel) at (11, 1):
  carveH(11, 19, 3);
  carveV(11, 1, 3); // (11, 1) Branch Exit to Whispering Citadel
  // Primary Exit (Monolith Crown) at (21, 1):
  carveH(19, 21, 3);
  carveV(21, 1, 3); // (21, 1) Primary Exit to Loop Level 1

  // Set barrier wall tile AFTER carving:
  ground[11][13] = 1;

  // Secret Wall & Prismatic Heart Chamber
  ground[19][1] = 'SW'; // Secret wall at (1, 19)
  carveH(1, 3, 19);     // (1, 19) Prismatic Spire Heart

  // Anti-deadspace spurs and fillers (isolated dead-ends)
  carveV(5, 2, 4);    // breaks Region 1 (x: 4..5, y: 0..3)
  carveV(13, 6, 8);   // breaks Region 2 (x: 12..13, y: 4..7)
  carveV(11, 16, 18); // breaks Region 3 (x: 10..11, y: 16..17)
  carveV(9, 1, 3);
  carveV(15, 13, 17);
  carveV(15, 1, 3);
  carveV(17, 5, 7);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "32",
    chapter: "chapter_8",
    zone: "zone_8",
    title: "The Prismatic Spire",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      allowRotation: true,
      fogOfWar: true,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: "snow",
      viewPerspective: "angled"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 21,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      label: "Crown of the Monolith",
      targetLevel: "1",
      wallDirection: "north"
    },
    exits: [
      {
        id: "exit_spire_primary",
        x: 21,
        y: 1,
        elevation: 0,
        style: "wall_archway",
        label: "Crown of the Monolith",
        targetLevel: "1",
        wallDirection: "north"
      },
      {
        id: "exit_spire_citadel_branch",
        x: 11,
        y: 1,
        elevation: 0,
        style: "wall_doorway",
        label: "Descend to Whispering Citadel",
        targetLevel: "story_citadel_1",
        wallDirection: "north"
      }
    ],
    parSteps: 85,
    parTime: 51,
    architectNote: "At the summit of the shifting monolith, four compass headings merge. One portal crowns the ascent; the other descends into citadel deeps.",
    help: {
      title: "Level 32: The Prismatic Spire",
      message: "Rotate the view [Q / R] to navigate the mountain ramparts. Lower the barrier lever to claim the golden key, then choose your exit."
    }
  };

  const entities = [
    {
      id: "note_32",
      type: "architect_note",
      title: "Architect's Folio #32",
      text: "At the apex of the world, perspective is mastery. Rotate [Q / R] to pierce the blinding blizzard and align the spire's bifurcated gateways.",
      author: "The Grand Architect",
      x: 1,
      y: 3,
      elevation: 0,
      style: "lectern_stone"
    },
    {
      id: "checkpoint_32",
      type: "checkpoint",
      name: "Summit Redoubt Checkpoint",
      x: 5,
      y: 7,
      elevation: 0
    },
    {
      id: "lever_32_spire",
      type: "lever",
      name: "Spire Dynamo Switch",
      x: 9,
      y: 19,
      elevation: 0,
      state: false,
      targets: [
        {
          action: "toggle_tile",
          layer: "ground",
          x: 13,
          y: 11,
          stateA: 0,
          stateB: 1
        }
      ]
    },
    {
      id: "key_gold_32",
      type: "key",
      color: "#eab308",
      name: "Golden Apex Key",
      x: 21,
      y: 17,
      elevation: 0
    },
    {
      id: "door_gold_32",
      type: "door",
      color: "#eab308",
      name: "Golden Spire Gate",
      requiresKey: "key_gold_32",
      x: 19,
      y: 5,
      elevation: 0
    },
    {
      id: "secret_gem_32",
      type: "collectible",
      collectibleType: "gem",
      name: "Prismatic Spire Heart",
      scoreValue: 500,
      color: "#ec4899",
      x: 1,
      y: 19,
      elevation: 0
    },
    {
      id: "gem_spire_summit",
      type: "collectible",
      collectibleType: "gem",
      name: "Glacial Apex Sapphire",
      scoreValue: 250,
      color: "#38bdf8",
      x: 7,
      y: 11,
      elevation: 1
    },
    {
      id: "plate_spire_bifurcation",
      type: "wall_decor",
      decorType: "runic_plate",
      title: "Monolith Apex Stele",
      text: "Two gates crown this spire: East leads back to the origin of all trials; West delves deep into the Whispering Citadel.",
      author: "High Chronicler",
      x: 15,
      y: 3,
      facing: "north",
      elevation: 0
    },
    {
      id: "carving_spire_secret",
      type: "wall_decor",
      decorType: "carving",
      title: "Glacial Frost Relief",
      text: "The southwestern ice shelf conceals the beating heart of the spire.",
      author: "Frost Sculptor",
      x: 3,
      y: 19,
      facing: "west",
      elevation: 0
    },
    {
      id: "torch_32_entry",
      type: "wall_decor",
      decorType: "torch",
      x: 3,
      y: 2,
      elevation: 0,
      facing: "west"
    },
    {
      id: "torch_32_exit",
      type: "wall_decor",
      decorType: "torch",
      x: 21,
      y: 2,
      elevation: 0,
      facing: "west"
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}
async function testLevel29() {
  const raw = makeLevel29();
  const lvl = { ...raw.manifest, layers: raw.layers, entities: raw.entities };
  const val = LevelValidator.validate(lvl);
  console.log('Level 29 Validator:', val.valid, 'Errors:', val.errors, 'Warnings:', val.warnings);

  const sol = solveLevel(lvl);
  console.log('Level 29 Solvable:', !!sol, 'Steps:', sol?.length);

  // Test zero bypass
  const noKey = JSON.parse(JSON.stringify(lvl));
  noKey.entities = noKey.entities.filter(e => e.type !== 'key');
  const solNoKey = solveLevel(noKey);
  console.log('Level 29 Solvable without Key:', solNoKey === null);

  const solNoDoor = solveLevel(lvl, { allowDoors: false });
  console.log('Level 29 Solvable without Door:', solNoDoor === null);

  const metrics = auditLevelMetrics(lvl);
  console.log('Level 29 Inertia:', metrics.corridorInertiaPercent + '%', 'DeadSpace4x4:', metrics.deadSpace4x4Count);
}

async function testLevel30() {
  const raw = makeLevel30();
  const lvl = { ...raw.manifest, layers: raw.layers, entities: raw.entities };
  const val = LevelValidator.validate(lvl);
  console.log('Level 30 Validator:', val.valid, 'Errors:', val.errors, 'Warnings:', val.warnings);

  const sol = solveLevel(lvl);
  console.log('Level 30 Solvable:', !!sol, 'Steps:', sol?.length);

  // Test zero bypass
  const noKey = JSON.parse(JSON.stringify(lvl));
  noKey.entities = noKey.entities.filter(e => e.type !== 'key');
  const solNoKey = solveLevel(noKey);
  console.log('Level 30 Solvable without Key:', solNoKey === null);

  const solNoDoor = solveLevel(lvl, { allowDoors: false });
  console.log('Level 30 Solvable without Door:', solNoDoor === null);

  console.log('Level 30 ground[7][7] === BRIDGE_EW:', lvl.layers.ground[7][7] === TILES.BRIDGE_EW);
  console.log('Level 30 overhead[7][7] === BRIDGE_NS:', lvl.layers.overhead[7][7] === TILES.BRIDGE_NS);

  const metrics = auditLevelMetrics(lvl);
  console.log('Level 30 Inertia:', metrics.corridorInertiaPercent + '%', 'DeadSpace4x4:', metrics.deadSpace4x4Count);
}

async function testLevel31() {
  const raw = makeLevel31();
  const lvl = { ...raw.manifest, layers: raw.layers, entities: raw.entities };
  const val = LevelValidator.validate(lvl);
  console.log('Level 31 Validator:', val.valid, 'Errors:', val.errors, 'Warnings:', val.warnings);

  const sol = solveLevel(lvl);
  console.log('Level 31 Solvable:', !!sol, 'Steps:', sol?.length);

  // Test zero bypass
  const noKey = JSON.parse(JSON.stringify(lvl));
  noKey.entities = noKey.entities.filter(e => e.type !== 'key');
  const solNoKey = solveLevel(noKey);
  console.log('Level 31 Solvable without Key:', solNoKey === null);

  const solNoDoor = solveLevel(lvl, { allowDoors: false });
  console.log('Level 31 Solvable without Door:', solNoDoor === null);

  const carvings = lvl.entities.filter(e => e.type === 'wall_decor' && e.decorType === 'carving');
  console.log('Level 31 Carvings count === 4:', carvings.length === 4);
  const facings = new Set(carvings.map(c => c.facing));
  console.log('Level 31 All 4 facings present:', facings.has('north') && facings.has('east') && facings.has('south') && facings.has('west'));

  const metrics = auditLevelMetrics(lvl);
  console.log('Level 31 Inertia:', metrics.corridorInertiaPercent + '%', 'DeadSpace4x4:', metrics.deadSpace4x4Count);
}

async function testLevel32() {
  const raw = makeLevel32();
  const lvl = { ...raw.manifest, layers: raw.layers, entities: raw.entities };
  const val = LevelValidator.validate(lvl);
  console.log('Level 32 Validator:', val.valid, 'Errors:', val.errors, 'Warnings:', val.warnings);

  const sol = solveLevel(lvl);
  console.log('Level 32 Solvable:', !!sol, 'Steps:', sol?.length);

  // Test zero bypass
  const noKey = JSON.parse(JSON.stringify(lvl));
  noKey.entities = noKey.entities.filter(e => e.type !== 'key');
  const solNoKey = solveLevel(noKey);
  console.log('Level 32 Solvable without Key:', solNoKey === null);

  const solNoDoor = solveLevel(lvl, { allowDoors: false });
  console.log('Level 32 Solvable without Door:', solNoDoor === null);

  const noLever = JSON.parse(JSON.stringify(lvl));
  noLever.entities = noLever.entities.filter(e => e.type !== 'lever');
  const solNoLever = solveLevel(noLever);
  console.log('Level 32 Solvable without Lever:', solNoLever === null);

  // Test branching exits
  console.log('Level 32 Exits is array:', Array.isArray(lvl.exits));
  console.log('Level 32 Exits length === 2:', lvl.exits?.length === 2);
  const primaryExit = lvl.exits?.find(e => e.id === 'exit_spire_primary');
  console.log('Level 32 Primary exit targetLevel === 1:', primaryExit?.targetLevel === '1');
  const branchExit = lvl.exits?.find(e => e.id === 'exit_spire_citadel_branch');
  console.log('Level 32 Branch exit targetLevel === story_citadel_1:', branchExit?.targetLevel === 'story_citadel_1');

  // Verify branch exit is also reachable
  const branchLvl = JSON.parse(JSON.stringify(lvl));
  branchLvl.exit = branchExit;
  const solBranch = solveLevel(branchLvl);
  console.log('Level 32 Branch Exit Solvable:', !!solBranch, 'Steps:', solBranch?.length);

  const metrics = auditLevelMetrics(lvl);
  console.log('Level 32 Inertia:', metrics.corridorInertiaPercent + '%', 'DeadSpace4x4:', metrics.deadSpace4x4Count);
}

if (process.argv[1]?.endsWith('test-ch8-full-rigor.mjs')) {
  testLevel29();
  testLevel30();
  testLevel31();
  testLevel32();
}
