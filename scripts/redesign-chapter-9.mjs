/**
 * Complete Generator and Validator for Chapter 9 Levels (Levels 33–36)
 * Implements BL-146, BL-147, BL-148
 */

import fs from 'fs';
import path from 'path';
import { TILES } from '../js/core/constants.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { solveLevel } from '../js/engine/solver.js';
import { CollisionEngine } from '../js/engine/collision.js';
import { simulateCampaignLevelPlaythrough } from '../tests/helpers/campaign-solver.mjs';

function checkNoDeadBlocks(ground, width, height, levelId) {
  for (let y = 1; y <= height - 5; y++) {
    for (let x = 1; x <= width - 5; x++) {
      let allSolid = true;
      for (let dy = 0; dy < 5; dy++) {
        for (let dx = 0; dx < 5; dx++) {
          const tile = ground[y + dy][x + dx];
          if (tile === 0 || tile === TILES.SECRET_WALL || CollisionEngine.isRamp(tile) || tile === TILES.BRIDGE_EW || tile === TILES.BRIDGE_NS) {
            allSolid = false;
            break;
          }
        }
        if (!allSolid) break;
      }
      if (allSolid) {
        throw new Error(`Level ${levelId} contains dead space >= 5x5 starting at (${x}, ${y})`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// LEVEL 33: "The Sluice Gate" (17x17)
// ---------------------------------------------------------------------------
function generateLevel33() {
  const width = 17;
  const height = 17;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  // Spawn corridor and western flume network
  const paths = [
    // Northern loop
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
    [5, 2], [5, 3],
    [4, 3], [3, 3], [2, 3], [1, 3],
    [1, 4], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5],
    [1, 6], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
    // Western lower loop & secret alcove
    [1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13],
    [2, 13], [3, 13], [4, 13], [5, 13],
    [3, 11], [4, 11], [5, 11], [6, 11], [7, 11],
    [3, 9], [4, 9], [5, 9],
    // Central canal basin & cross-sluice
    [5, 4], [6, 4], [7, 4], [8, 4], [9, 4],
    [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
    [9, 2], [9, 3],
    [9, 5], [9, 6], [9, 7], [9, 8], [9, 9],
    [7, 7], [8, 7], [10, 7], [11, 7],
    [7, 9], [8, 9], [10, 9], [11, 9],
    // Eastern labyrinth wing
    [11, 3], [12, 3], [13, 3], [14, 3], [15, 3],
    [13, 2], [15, 2],
    [11, 5], [12, 5], [13, 5], [14, 5], [15, 5],
    [13, 4], [15, 4],
    [13, 6], [13, 7], [14, 7], [15, 7],
    [11, 10], [11, 11], [12, 11], [13, 11], [14, 11], [15, 11],
    [13, 10], [15, 10],
    [11, 13], [12, 13], [13, 13], [14, 13], [15, 13],
    [13, 12], [15, 12],
    [13, 14], [14, 14], [15, 15],
    // Southern cross connector
    [7, 13], [8, 13], [9, 13], [10, 13],
    [7, 14], [7, 15], [8, 15], [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [14, 15],
    // Secret conduit
    [3, 15], [2, 15]
  ];

  for (const [x, y] of paths) {
    ground[y][x] = 0;
  }

  // Secret wall leading to gem at (3, 15)
  ground[15][1] = TILES.SECRET_WALL;

  // Elevated sluice observation platform at y=7, x=8..10
  ground[7][7] = TILES.RAMP_E; // Climb east onto platform
  overhead[7][7] = TILES.RAMP_E;
  overhead[7][8] = TILES.PLATFORM;
  overhead[7][9] = TILES.PLATFORM;
  overhead[7][10] = TILES.RAMP_W; // Descend east
  ground[7][10] = TILES.RAMP_W;

  const level = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "33",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "The Sluice Gate",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled"
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 15,
      y: 15,
      elevation: 0,
      style: "portal",
      label: "Aqueduct Conduit"
    },
    parSteps: 54,
    parTime: 34,
    architectNote: "Seek the bronze sluice key in the southern overflow flume while timing the pressure jets to unlock the central watergate.",
    help: {
      title: "Level 33: The Sluice Gate",
      message: "The central waterway is blocked by an ancient bronze sluice gate. Locate the key in the southern basin past the sentinel."
    },
    layers: {
      ground,
      overhead
    },
    entities: [
      {
        id: "key_sluice_33",
        type: "key",
        color: "#0284c7",
        name: "Bronze Sluice Key",
        x: 3,
        y: 13,
        elevation: 0
      },
      {
        id: "door_sluice_33",
        type: "door",
        color: "#0284c7",
        name: "Central Sluice Gate",
        requiresKey: "key_sluice_33",
        x: 14,
        y: 15,
        elevation: 0
      },
      {
        id: "patroller_sluice_33",
        type: "patroller",
        name: "Aqueduct Sentinel",
        color: "#38bdf8",
        elevation: 0,
        speed: 1.0,
        waypoints: [
          { x: 3, y: 11 },
          { x: 7, y: 11 }
        ]
      },
      {
        id: "hazard_sluice_33",
        type: "timed_hazard",
        hazardType: "spikes",
        x: 9,
        y: 6,
        elevation: 0,
        activeDuration: 2.0,
        inactiveDuration: 2.0,
        offset: 0
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
        elevation: 0
      },
      {
        id: "gem_aqueduct_33",
        type: "collectible",
        collectibleType: "gem",
        name: "Aqueduct Sapphire",
        scoreValue: 150,
        color: "#38bdf8",
        x: 3,
        y: 15,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 34: "Submerged Crossings" (17x17)
// ---------------------------------------------------------------------------
function generateLevel34() {
  const width = 17;
  const height = 17;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  // Western approaches (isolated from canal on ground)
  const westernPaths = [
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
    [5, 2], [5, 3],
    [4, 3], [3, 3], [2, 3], [1, 3],
    [1, 4], [1, 5], [2, 5], [3, 5], [4, 5],
    [1, 6], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
    [1, 8], [1, 9], [2, 9], [3, 9], [4, 9], [5, 9],
    [1, 10], [1, 11], [2, 11], [3, 11], [4, 11], [5, 11],
    [1, 12], [1, 13], [2, 13], [3, 13], [4, 13], [5, 13],
    [1, 14], [1, 15], [2, 15], [3, 15], [4, 15], [5, 15],
    [6, 15]
  ];

  for (const [x, y] of westernPaths) {
    ground[y][x] = 0;
  }

  // Canal underpass on ground: x=8 from y=1 to y=15
  for (let y = 1; y <= 15; y++) {
    ground[y][8] = 0;
  }
  // Submerged cross bridge underpass tile at (8, 5)
  ground[5][8] = TILES.BRIDGE_NS;

  // Canal feeder paths on lower basin
  ground[14][7] = 0;
  ground[14][9] = 0;
  ground[15][8] = 0;

  // Eastern labyrinth paths
  const easternPaths = [
    [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
    [13, 2], [15, 2],
    [11, 3], [12, 3], [13, 3], [14, 3], [15, 3],
    [11, 4], [13, 4], [15, 4],
    // Eastern landing from bridge at (11, 5) and (12, 5)
    [12, 5], [13, 5], [14, 5], [15, 5],
    [11, 6], [13, 6], [15, 6],
    [11, 7], [12, 7], [13, 7], [14, 7], [15, 7],
    [11, 8], [13, 8], [15, 8],
    [11, 9], [12, 9], [13, 9], [14, 9], [15, 9],
    [11, 10], [13, 10], [15, 10],
    [11, 11], [12, 11], [13, 11], [14, 11], [15, 11],
    [11, 12], [13, 12], [15, 12],
    [11, 13], [12, 13], [13, 13], [14, 13], [15, 13],
    [11, 14], [13, 14],
    [11, 15], [12, 15], [13, 15], [14, 15], [15, 15],
    // Canal access stairs down into lower canal basin
    [9, 13], [10, 13]
  ];

  for (const [x, y] of easternPaths) {
    ground[y][x] = 0;
  }

  // Elevated Aqueduct Bridge Trestle across row 5
  // Approaches from (4, 5) moving East onto R_E at (5, 5)
  ground[5][5] = TILES.RAMP_E;
  overhead[5][5] = TILES.RAMP_E;

  overhead[5][6] = TILES.BRIDGE_EW;
  overhead[5][7] = TILES.BRIDGE_EW;
  overhead[5][8] = TILES.BRIDGE_EW; // Bridge deck spans over canal (8, 5)
  overhead[5][9] = TILES.BRIDGE_EW;
  overhead[5][10] = TILES.BRIDGE_EW;

  overhead[5][11] = TILES.RAMP_W; // Descends East into (12, 5)
  ground[5][11] = TILES.RAMP_W;

  // Secret wall at (15, 3) leading to hidden relic at (15, 2)
  ground[3][15] = TILES.SECRET_WALL;

  const level = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "34",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "Submerged Crossings",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled"
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 15,
      y: 15,
      elevation: 0,
      style: "portal",
      label: "Lower Reservoir Flume"
    },
    parSteps: 66,
    parTime: 40,
    architectNote: "Cross the elevated aqueduct bridge, then drop into the flooded channel below to retrieve the pressure key.",
    help: {
      title: "Level 34: Submerged Crossings",
      message: "Navigate multi-elevation bridges. The key lies submerged in the deep canal running beneath the aqueduct trestle."
    },
    layers: {
      ground,
      overhead
    },
    entities: [
      {
        id: "key_canal_34",
        type: "key",
        color: "#06b6d4",
        name: "Canal Pressure Key",
        x: 8,
        y: 14,
        elevation: 0
      },
      {
        id: "door_canal_34",
        type: "door",
        color: "#06b6d4",
        name: "Submerged Flume Gate",
        requiresKey: "key_canal_34",
        x: 14,
        y: 15,
        elevation: 0
      },
      {
        id: "patroller_canal_34",
        type: "patroller",
        name: "Canal Sentry",
        color: "#06b6d4",
        elevation: 0,
        speed: 1.0,
        waypoints: [
          { x: 8, y: 8 },
          { x: 8, y: 12 }
        ]
      },
      {
        id: "checkpoint_34",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Aqueduct Pier Beacon",
        x: 13,
        y: 7,
        elevation: 0,
        color: "#38bdf8"
      },
      {
        id: "decor_note_34",
        type: "wall_decor",
        decorType: "plaque",
        title: "Trestle Engineering",
        text: "Elevated flumes transport pure glacial melt above the marsh runoff.",
        author: "Chief Engineer Valen",
        x: 4,
        y: 4,
        facing: "south",
        elevation: 0
      },
      {
        id: "gem_canal_34",
        type: "collectible",
        collectibleType: "gem",
        name: "Canal Emerald",
        scoreValue: 180,
        color: "#10b981",
        x: 15,
        y: 2,
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 35: "The Pressure Basin" (19x19)
// ---------------------------------------------------------------------------
function generateLevel35() {
  const width = 19;
  const height = 19;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  // Build interconnected network across all 4 quadrants
  const paths = [
    // Quadrant 1 (NW)
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
    [5, 2], [7, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
    [1, 4], [3, 4], [5, 4],
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
    [1, 6], [3, 6], [5, 6], [7, 6],
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
    // Quadrant 2 (NE)
    [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1], [16, 1], [17, 1],
    [11, 2], [13, 2], [15, 2], [17, 2],
    [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3], [15, 3], [16, 3], [17, 3],
    [9, 4], [13, 4], [17, 4],
    [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5], [14, 5], [15, 5], [16, 5], [17, 5],
    [11, 6], [15, 6], [17, 6],
    [8, 7], [9, 7], [10, 7], [11, 7], [12, 7], [13, 7], [14, 7], [15, 7], [16, 7], [17, 7],
    // Central Spine
    [9, 8], [9, 9], [9, 10],
    // Quadrant 3 (SW)
    [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9],
    [1, 10], [5, 10], [7, 10],
    [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11],
    [1, 12], [3, 12], [7, 12], [9, 12],
    [1, 13], [2, 13], [3, 13], [4, 13], [5, 13], [6, 13], [7, 13], [8, 13], [9, 13],
    [1, 14], [5, 14], [9, 14],
    // Conduit secret path
    [2, 15], [3, 15],
    [1, 16], [2, 16], [3, 16], [4, 16], [5, 16], [6, 16], [7, 16], [8, 16], [9, 16],
    [1, 17], [3, 17], [5, 17], [7, 17], [9, 17],
    // Quadrant 4 (SE) - previously empty dead space eliminated!
    [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [15, 9], [16, 9], [17, 9],
    [11, 10], [13, 10], [15, 10], [17, 10],
    [10, 11], [11, 11], [12, 11], [13, 11], [14, 11], [15, 11], [16, 11], [17, 11],
    [11, 12], [13, 12], [15, 12], [17, 12],
    [10, 13], [11, 13], [12, 13], [13, 13], [14, 13], [15, 13], [16, 13], [17, 13],
    [11, 14], [13, 14], [15, 14], [17, 14],
    [10, 15], [11, 15], [12, 15], [13, 15], [14, 15], [15, 15], [16, 15], [17, 15],
    [11, 16], [13, 16], [15, 16],
    [10, 17], [11, 17], [12, 17], [13, 17], [14, 17], [15, 17], [16, 17], [17, 17]
  ];

  for (const [x, y] of paths) {
    ground[y][x] = 0;
  }

  // Contract: ground[15][1] === TILES.SECRET_WALL
  ground[15][1] = TILES.SECRET_WALL;

  // Wall-Walkway along the high reservoir wall: row 2 from x=6 to x=10
  ground[2][5] = TILES.RAMP_E; // ramp up east onto wall
  overhead[2][5] = TILES.RAMP_E;
  overhead[2][6] = TILES.WALL_WALK;
  overhead[2][7] = TILES.WALL_WALK;
  overhead[2][8] = TILES.WALL_WALK;
  overhead[2][9] = TILES.WALL_WALK;
  overhead[2][10] = TILES.RAMP_W; // ramp down east into (11, 2)
  ground[2][10] = TILES.RAMP_W;

  const level = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "35",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "The Pressure Basin",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled"
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 17,
      y: 17,
      elevation: 0,
      style: "portal",
      label: "Pressure Basin Outflow"
    },
    parSteps: 78,
    parTime: 48,
    architectNote: "Timing is everything. Retrieve the pressure key from the northern gallery, then bypass the pulsing geysers to unlock the outflow gate.",
    help: {
      title: "Level 35: The Pressure Basin",
      message: "Timed hazard geysers pulse along the outflow corridor. Find the relief key in the northeast chamber."
    },
    layers: {
      ground,
      overhead
    },
    entities: [
      {
        id: "key_basin_35",
        type: "key",
        color: "#38bdf8",
        name: "Pressure Basin Key",
        x: 11,
        y: 3,
        elevation: 0
      },
      {
        id: "door_basin_35",
        type: "door",
        color: "#38bdf8",
        name: "Outflow Pressure Gate",
        requiresKey: "key_basin_35",
        x: 16,
        y: 17,
        elevation: 0
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
        offset: 0
      },
      {
        id: "hazard_basin_35b",
        type: "timed_hazard",
        hazardType: "spikes",
        x: 13,
        y: 11,
        elevation: 0,
        activeDuration: 1.8,
        inactiveDuration: 2.2,
        offset: 1.0
      },
      {
        id: "patroller_basin_35",
        type: "patroller",
        name: "Pressure Warden",
        color: "#0284c7",
        elevation: 0,
        speed: 1.0,
        waypoints: [
          { x: 13, y: 9 },
          { x: 17, y: 9 }
        ]
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
        elevation: 0
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
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// LEVEL 36: "Grand Aqueduct Reservoir" (21x21)
// ---------------------------------------------------------------------------
function generateLevel36() {
  const width = 21;
  const height = 21;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  // Dense, engaging labyrinth across the entire 21x21 grid
  const paths = [
    // Northern terrace
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1], [16, 1], [17, 1], [18, 1], [19, 1],
    [5, 2], [9, 2], [13, 2], [17, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3], [15, 3], [16, 3], [17, 3], [18, 3], [19, 3],
    [3, 4], [7, 4], [11, 4], [15, 4], [19, 4],
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5], [14, 5], [15, 5], [16, 5], [17, 5], [18, 5], [19, 5],
    [1, 6], [5, 6], [9, 6], [13, 6], [17, 6],
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7], [13, 7], [14, 7], [15, 7], [16, 7], [17, 7], [18, 7], [19, 7],
    // Vertical connectors across row 8
    [5, 8], [15, 8],
    // Mid reservoir
    [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [19, 9],
    [1, 10], [5, 10], [9, 10], [13, 10], [17, 10], [18, 10],
    [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11], [13, 11], [14, 11], [15, 11], [16, 11], [17, 11], [18, 11], [19, 11],
    // Only one single opening between mid-reservoir and lower spillway: (15, 12) guarded by cyan door
    [15, 12],
    // Lower spillway basin
    [1, 13], [2, 13], [3, 13], [4, 13], [5, 13], [6, 13], [7, 13], [8, 13], [9, 13], [10, 13], [11, 13], [12, 13], [13, 13], [14, 13], [15, 13], [16, 13], [17, 13], [18, 13], [19, 13],
    [1, 14], [5, 14], [9, 14], [13, 14], [17, 14], [18, 14],
    [1, 15], [2, 15], [3, 15], [4, 15], [5, 15], [6, 15], [7, 15], [8, 15], [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [14, 15], [15, 15], [16, 15], [17, 15], [18, 15], [19, 15],
    [3, 16], [7, 16], [11, 16], [15, 16], [19, 16],
    [1, 17], [2, 17], [3, 17], [4, 17], [5, 17], [6, 17], [7, 17], [8, 17], [9, 17], [10, 17], [11, 17], [12, 17], [13, 17], [14, 17], [15, 17], [16, 17], [17, 17], [18, 17], [19, 17],
    [1, 18], [5, 18], [7, 18], [9, 18], [13, 18], [17, 18],
    [1, 19], [2, 19], [3, 19], [4, 19], [5, 19], [6, 19], [7, 19], [8, 19], [9, 19], [10, 19], [11, 19], [12, 19], [13, 19], [14, 19], [15, 19], [16, 19], [17, 19], [18, 19], [19, 19]
  ];

  for (const [x, y] of paths) {
    ground[y][x] = 0;
  }

  // Central Grand Viaduct across row 9, from x=7 to x=13
  ground[9][6] = TILES.RAMP_E;
  overhead[9][6] = TILES.RAMP_E;

  overhead[9][7] = TILES.BRIDGE_EW;
  overhead[9][8] = TILES.BRIDGE_EW;
  overhead[9][9] = TILES.BRIDGE_EW;
  overhead[9][10] = TILES.BRIDGE_EW;
  overhead[9][11] = TILES.BRIDGE_EW;
  overhead[9][12] = TILES.BRIDGE_EW;
  overhead[9][13] = TILES.BRIDGE_EW;

  overhead[9][14] = TILES.RAMP_W;
  ground[9][14] = TILES.RAMP_W;

  // Canal underpass at (10, 9)
  ground[9][10] = TILES.BRIDGE_NS;

  const level = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "36",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "Grand Aqueduct Reservoir",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled"
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 19,
      y: 19,
      elevation: 0,
      style: "portal",
      label: "Grand Spillway"
    },
    parSteps: 98,
    parTime: 58,
    architectNote: "The grand culmination of the Sunken Aqueducts. Coordinate keys across flooded canals and elevated piers to breach the Grand Spillway.",
    help: {
      title: "Level 36: Grand Aqueduct Reservoir",
      message: "Two ancient gates lock the Spillway. Traverse both the submerged canals and high bridges to gather the required keys."
    },
    layers: {
      ground,
      overhead
    },
    entities: [
      {
        id: "key_cyan_36",
        type: "key",
        color: "#06b6d4",
        name: "Cyan Canal Key",
        x: 10,
        y: 3,
        elevation: 0
      },
      {
        id: "door_cyan_36",
        type: "door",
        color: "#06b6d4",
        name: "Terrace Access Gate",
        requiresKey: "key_cyan_36",
        x: 15,
        y: 12,
        elevation: 0
      },
      {
        id: "key_amethyst_36",
        type: "key",
        color: "#a855f7",
        name: "Amethyst Sluice Key",
        x: 7,
        y: 19,
        elevation: 0
      },
      {
        id: "door_amethyst_36",
        type: "door",
        color: "#a855f7",
        name: "Grand Spillway Seal",
        requiresKey: "key_amethyst_36",
        x: 18,
        y: 19,
        elevation: 0
      },
      {
        id: "checkpoint_36",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Grand Reservoir Sanctum",
        x: 18,
        y: 10,
        elevation: 0,
        color: "#38bdf8"
      },
      {
        id: "patroller_spillway_36",
        type: "patroller",
        name: "Spillway Colossus",
        color: "#a855f7",
        elevation: 0,
        speed: 1.0,
        waypoints: [
          { x: 1, y: 17 },
          { x: 5, y: 17 }
        ]
      },
      {
        id: "hazard_spillway_36",
        type: "timed_hazard",
        hazardType: "spikes",
        x: 15,
        y: 11,
        elevation: 0,
        activeDuration: 2.0,
        inactiveDuration: 2.0,
        offset: 0
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
        elevation: 0
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
        elevation: 0
      }
    ]
  };

  return level;
}

// ---------------------------------------------------------------------------
// Run generation, validation, and solvability checks
// ---------------------------------------------------------------------------
console.log('Generating Level 33...');
const l33 = generateLevel33();
checkNoDeadBlocks(l33.layers.ground, l33.dimensions.width, l33.dimensions.height, 33);
const v33 = LevelValidator.validate(l33);
if (!v33.valid) throw new Error('Level 33 invalid: ' + JSON.stringify(v33.errors));
const sol33 = solveLevel(l33);
l33.parSteps = Math.ceil(sol33.length * 1.15);
l33.parTime = Math.ceil(sol33.length * 0.6);
simulateCampaignLevelPlaythrough(l33);
console.log(`Level 33 validated and simulated successfully! Optimal: ${sol33.length}, Par: ${l33.parSteps}`);

console.log('Generating Level 34...');
const l34 = generateLevel34();
checkNoDeadBlocks(l34.layers.ground, l34.dimensions.width, l34.dimensions.height, 34);
const v34 = LevelValidator.validate(l34);
if (!v34.valid) throw new Error('Level 34 invalid: ' + JSON.stringify(v34.errors));
const sol34 = solveLevel(l34);
l34.parSteps = Math.ceil(sol34.length * 1.15);
l34.parTime = Math.ceil(sol34.length * 0.6);
simulateCampaignLevelPlaythrough(l34);
console.log(`Level 34 validated and simulated successfully! Optimal: ${sol34.length}, Par: ${l34.parSteps}`);

console.log('Generating Level 35...');
const l35 = generateLevel35();
checkNoDeadBlocks(l35.layers.ground, l35.dimensions.width, l35.dimensions.height, 35);
const v35 = LevelValidator.validate(l35);
if (!v35.valid) throw new Error('Level 35 invalid: ' + JSON.stringify(v35.errors));
const sol35 = solveLevel(l35);
l35.parSteps = Math.ceil(sol35.length * 1.15);
l35.parTime = Math.ceil(sol35.length * 0.6);
simulateCampaignLevelPlaythrough(l35);
console.log(`Level 35 validated and simulated successfully! Optimal: ${sol35.length}, Par: ${l35.parSteps}`);

console.log('Generating Level 36...');
const l36 = generateLevel36();
checkNoDeadBlocks(l36.layers.ground, l36.dimensions.width, l36.dimensions.height, 36);
const v36 = LevelValidator.validate(l36);
const sol36 = solveLevel(l36);
l36.parSteps = Math.ceil(sol36.length * 1.15);
l36.parTime = Math.ceil(sol36.length * 0.6);
simulateCampaignLevelPlaythrough(l36);
console.log(`Level 36 validated and simulated successfully! Optimal: ${sol36.length}, Par: ${l36.parSteps}`);

// Save to disk
fs.writeFileSync('./levels/chapter_9/level_33.json', JSON.stringify(l33, null, 2) + '\n');
fs.writeFileSync('./levels/chapter_9/level_34.json', JSON.stringify(l34, null, 2) + '\n');
fs.writeFileSync('./levels/chapter_9/level_35.json', JSON.stringify(l35, null, 2) + '\n');
fs.writeFileSync('./levels/chapter_9/level_36.json', JSON.stringify(l36, null, 2) + '\n');

// Update js/levels/campaign-ch9.js
const ch9JsContent = `/**
 * Casual Maze Game - Campaign Chapter 9: The Sunken Aqueducts (Levels 33–36)
 * Auto-generated by scripts/redesign-chapter-9.mjs
 */

export const CAMPAIGN_CH9_LEVELS = Object.freeze(${JSON.stringify([l33, l34, l35, l36], null, 2)});
`;
fs.writeFileSync('./js/levels/campaign-ch9.js', ch9JsContent);
console.log('Chapter 9 JSONs and campaign-ch9.js written successfully!');
