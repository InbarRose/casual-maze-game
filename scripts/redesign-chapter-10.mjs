/**
 * Complete Redesign and Solver Calibration for Chapter 10: Levels 37 & 38
 * Implements BL-150 and ADR-0039 (Zero Dead Space, Compounding Mechanics)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TILES, ELEVATION } from '../js/core/constants.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { solveLevel } from '../js/engine/solver.js';
import { CollisionEngine } from '../js/engine/collision.js';
import { simulateCampaignLevelPlaythrough } from '../tests/helpers/campaign-solver.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function checkZeroDeadSpace4x4(ground, overhead, width, height, levelId) {
  const deadSpaces = [];
  for (let y = 1; y < height - 4; y++) {
    for (let x = 1; x < width - 4; x++) {
      let isAllWall = true;
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          const g = ground[y + dy][x + dx];
          const o = overhead && overhead[y + dy] ? overhead[y + dy][x + dx] : 0;
          if (g !== 1 || (o !== 0 && o !== 1)) {
            isAllWall = false;
            break;
          }
        }
        if (!isAllWall) break;
      }
      if (isAllWall) {
        deadSpaces.push({ x, y });
      }
    }
  }
  if (deadSpaces.length > 0) {
    throw new Error(`Level ${levelId} contains ${deadSpaces.length} dead space blocks (>= 4x4) starting at (${deadSpaces[0].x}, ${deadSpaces[0].y})`);
  }
}

// ---------------------------------------------------------------------------
// LEVEL 37: "The Spectral Gate" (23x23)
// ---------------------------------------------------------------------------
export function generateLevel37() {
  const width = 23;
  const height = 23;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  // Helper to carve paths
  function carve(coords) {
    for (const [x, y] of coords) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ground[y][x] = 0;
      }
    }
  }

  // 1. QUADRANT 1 (NW: Spawn & Western Gallery)
  // Winding corridors to eliminate dead space in x: 1..10, y: 1..10
  // 1. QUADRANT 1 (NW: Spawn & Amber Key Vault)
  // Outer boundary x=0, y=0 are walls. Dividing wall at x=11.
  carve([
    // Spawn lane
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1],
    [1, 2], [5, 2], [10, 2],
    [1, 3], [2, 3], [3, 3], [5, 3], [6, 3], [7, 3], [8, 3], [10, 3],
    [3, 4], [8, 4], [10, 4],
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [10, 5],
    [1, 6], [5, 6], [10, 6],
    // Amber key chamber & approach at (3, 7)
    [1, 7], [2, 7], [3, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7],
    [1, 8], [5, 8], [8, 8],
    [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9],
    // Path leading directly to Amber Door at (5, 11)
    [3, 10], [4, 10], [5, 10]
  ]);

  // Amber Door at (5, 11) is the ONLY passage through row 11
  ground[11][5] = 0;

  // 2. QUADRANT 2 (SW: Sentinel Gauntlet, Secret Sanctuary & Rift Portal A)
  carve([
    // Entry from Amber Door into SW sector
    [5, 12], [4, 12], [3, 12], [2, 12], [1, 12],
    [1, 13], [5, 13], [8, 13],
    [1, 14], [2, 14], [3, 14], [4, 14], [5, 14], [6, 14], [7, 14], [8, 14], [9, 14], [10, 14],
    [3, 15], [7, 15], [10, 15],
    [1, 16], [2, 16], [3, 16], [4, 16], [5, 16], [6, 16], [7, 16], [8, 16], [9, 16], [10, 16],
    // Patroller track at y = 17
    [1, 17], [2, 17], [3, 17], [4, 17], [5, 17], [6, 17], [7, 17], [8, 17], [9, 17], [10, 17],
    [1, 18], [5, 18], [10, 18],
    [1, 19], [2, 19], [3, 19], [4, 19], [5, 19], [6, 19], [7, 19], [8, 19], [9, 19], [10, 19],
    [1, 20], [3, 20], [7, 20], [10, 20],
    [1, 21], [2, 21], [3, 21], [4, 21], [5, 21], [6, 21], [7, 21], [8, 21], [9, 21], [10, 21],
  ]);

  // Secret Wall at (1, 19) leading to secret room at (1, 20)
  ground[19][1] = TILES.SECRET_WALL;

  // 3. SE SEALED CRYPT (Reachable ONLY via Portal Alpha -> Beta)
  // Enclosed in x: 13..21, y: 13..21 (completely surrounded by walls on all sides)
  carve([
    [14, 14], [15, 14], [16, 14], [17, 14], [18, 14], [19, 14], [20, 14], [21, 14],
    [14, 15], [18, 15], [21, 15],
    [14, 16], [15, 16], [16, 16], [17, 16], [18, 16], [19, 16], [20, 16], [21, 16],
    [14, 17], [17, 17], [21, 17],
    [14, 18], [15, 18], [16, 18], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18],
    [14, 19], [18, 19], [21, 19],
    [14, 20], [15, 20], [16, 20], [17, 20], [18, 20], [19, 20], [20, 20], [21, 20],
    [14, 21], [15, 21], [16, 21], [17, 21], [18, 21], [19, 21], [20, 21], [21, 21],
  ]);
  // Violet Key is in SE Crypt at (17, 18)
  // Portal B entrance at (15, 14), Portal B exit at (13, 8)

  // 4. CENTRAL VIADUCT & REFRACTION LEVER
  // Return portal from SE Crypt drops player at (13, 8)
  carve([
    [13, 8], [13, 7],
    // Ramp up at (14, 7) enters from (13, 7) at elevation 0
  ]);

  // Elevated Viaduct:
  // Ramp at (14, 7) RAMP_E enters from (13, 7) at elevation 0, reaches (15, 7) at elevation 1
  ground[7][14] = TILES.RAMP_E;
  overhead[7][15] = TILES.PLATFORM;
  overhead[7][16] = TILES.PLATFORM;
  // Ramp down at (17, 7) RAMP_W enters from (18, 7) at elevation 0, reaches (16, 7) at elevation 1
  ground[7][17] = TILES.RAMP_W;

  // 5. NE EXIT WING (Guarded by Shifting Barrier at (18, 6) and Violet Door at (21, 5))
  carve([
    // Landing from viaduct ramp at (18, 7)
    [18, 7],
    // Path through shifting barrier at (18, 6)
    [18, 6], [18, 5],
    // Behind shifting barrier (x >= 18, y <= 5)
    [19, 5], [20, 5],
    [18, 4], [19, 4],
    [18, 3], [19, 3],
    [18, 2], [19, 2],
    [18, 1], [19, 1],
    // Violet door at (21, 5) leading to exit at (21, 1)
    // NOTE: Column 20 at y: 1..4 is SOLID WALL (1) to prevent bypassing door at (21, 5)!
    [21, 5], [21, 4], [21, 3], [21, 2], [21, 1],
    // Side corridors in lower NE wing to eliminate dead space
    [12, 1], [13, 1], [14, 1], [15, 1], [16, 1],
    [12, 2], [14, 2], [16, 2],
    [12, 3], [13, 3], [14, 3], [15, 3], [16, 3],
    [12, 4], [14, 4], [16, 4],
    [12, 9], [13, 9], [14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [19, 9], [20, 9], [21, 9],
    [13, 10], [17, 10], [21, 10],
    [12, 11], [13, 11], [14, 11], [15, 11], [16, 11], [17, 11], [18, 11], [19, 11], [20, 11], [21, 11],
    [12, 12], [13, 12], [17, 12], [21, 12],
    [12, 13], [13, 13], [14, 13], [15, 13], [16, 13], [17, 13], [18, 13], [19, 13], [20, 13], [21, 13],
  ]);

  // Ensure Column 20 from y=1 to y=4 is solid wall (1)
  ground[1][20] = 1;
  ground[2][20] = 1;
  ground[3][20] = 1;
  ground[4][20] = 1;

  // Ensure Column 11 is solid wall from y=1 to y=21
  for (let y = 1; y <= 21; y++) {
    ground[y][11] = 1;
  }
  // Ensure Row 11 is solid wall from x=1 to x=10 except x=5
  for (let x = 1; x <= 10; x++) {
    if (x !== 5) ground[11][x] = 1;
  }

  // Initial state of Shifting Barrier at (18, 6): solid wall (1)
  ground[6][18] = 1;
  // Ensure (19, 7) and (18, 8) are walls
  ground[7][19] = 1;
  ground[8][18] = 1;

  const entities = [
    {
      id: "key_amber_37",
      type: "key",
      color: "#f59e0b",
      name: "Amber Crystal Key",
      x: 3,
      y: 7,
      elevation: 0
    },
    {
      id: "door_amber_37",
      type: "door",
      color: "#f59e0b",
      name: "Amber Spectral Barrier",
      requiresKey: "key_amber_37",
      x: 5,
      y: 11,
      elevation: 0
    },
    {
      id: "portal_spectral_a",
      type: "teleporter",
      name: "Astral Rift Alpha",
      x: 3,
      y: 21,
      elevation: 0,
      targetX: 19,
      targetY: 21,
      targetElevation: 0,
      color: "#a855f7"
    },
    {
      id: "portal_spectral_b",
      type: "teleporter",
      name: "Astral Rift Beta",
      x: 15,
      y: 14,
      elevation: 0,
      targetX: 13,
      targetY: 8,
      targetElevation: 0,
      color: "#a855f7"
    },
    {
      id: "patroller_spectral_37",
      type: "patroller",
      name: "Spectral Prism Warden",
      color: "#f43f5e",
      elevation: 0,
      speed: 1.0,
      waypoints: [
        { x: 6, y: 17 },
        { x: 10, y: 17 }
      ]
    },
    {
      id: "hazard_spectral_pulse_37",
      type: "timed_hazard",
      hazardType: "spikes",
      x: 5,
      y: 14,
      elevation: 0,
      activeDuration: 2.0,
      inactiveDuration: 2.0,
      offset: 0
    },
    {
      id: "key_violet_37",
      type: "key",
      color: "#8b5cf6",
      name: "Violet Crystal Key",
      x: 17,
      y: 18,
      elevation: 0
    },
    {
      id: "lever_refraction_37",
      type: "lever",
      name: "Refraction Focal Lever",
      x: 15,
      y: 7,
      elevation: 1,
      color: "#eab308",
      state: false,
      targets: [
        {
          action: "toggle_tile",
          layer: "ground",
          x: 18,
          y: 6,
          stateA: 0,
          stateB: 1
        }
      ]
    },
    {
      id: "door_violet_37",
      type: "door",
      color: "#8b5cf6",
      name: "Violet Prismatic Gate",
      requiresKey: "key_violet_37",
      x: 21,
      y: 5,
      elevation: 0
    },
    {
      id: "checkpoint_37",
      type: "checkpoint",
      style: "crystal_beacon",
      name: "Prism Central Beacon",
      x: 5,
      y: 12,
      elevation: 0,
      color: "#a855f7"
    },
    {
      id: "decor_note_37",
      type: "wall_decor",
      decorType: "plaque",
      title: "Chromatic Inscription",
      text: "Light splits into amber and violet vibrations upon striking the primal crystal facade. Ascend the viaduct to align the focal lever.",
      author: "Prism Master Kael",
      x: 1,
      y: 3,
      facing: "east",
      elevation: 0
    },
    {
      id: "gem_secret_37",
      type: "collectible",
      collectibleType: "gem",
      name: "Prismatic Diamond",
      scoreValue: 250,
      color: "#06b6d4",
      x: 1,
      y: 20,
      elevation: 0
    }
  ];

  return {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "37",
    chapter: "chapter_10",
    zone: "zone_10",
    title: "The Spectral Gate",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "prismatic",
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
      x: 21,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      label: "Refraction Chamber",
      wallDirection: "north"
    },
    parSteps: 80,
    parTime: 50,
    architectNote: "The refracting crystal prisms cast elusive shadows. Locate the amber key, ascend the viaduct to toggle the refraction barrier, and unseal the spectral gate.",
    help: {
      title: "Level 37: The Spectral Gate",
      message: "The way forward is locked by dual crystal seals and chromatic barriers. Use the elevated viaduct to reach the focal lever."
    },
    layers: {
      ground,
      overhead
    },
    entities
  };
}

// ---------------------------------------------------------------------------
// LEVEL 38: "Concentric Trestles" (25x25)
// ---------------------------------------------------------------------------
export function generateLevel38() {
  const width = 25;
  const height = 25;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  function carve(coords) {
    for (const [x, y] of coords) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ground[y][x] = 0;
      }
    }
  }

  // 1. Concentric Ring Corridors (r = 1, 3, 5, 7, 9)
  for (const r of [1, 3, 5, 7, 9]) {
    const min = r;
    const max = 24 - r;
    for (let x = min; x <= max; x++) {
      ground[min][x] = 0;
      ground[max][x] = 0;
    }
    for (let y = min; y <= max; y++) {
      ground[y][min] = 0;
      ground[y][max] = 0;
    }
  }

  // Inner Sanctum (x: 11..13, y: 11..13)
  for (let y = 11; y <= 13; y++) {
    for (let x = 11; x <= 13; x++) {
      ground[y][x] = 0;
    }
  }

  // Cut-through connections between concentric rings:
  // Ring 1 (r=1) to Ring 2 (r=3): cuts at Wall Ring 1 (r=2)
  carve([
    [1, 2], [23, 2], // NW & NE vertical cuts
    [2, 2],          // Access to wall walk ramp
    [2, 5], [2, 19], // West cuts
    [22, 5], [22, 19], // East cuts
    [5, 22], [19, 22] // South cuts
  ]);

  // Ring 2 (r=3) to Ring 3 (r=5): cuts at Wall Ring 2 (r=4)
  carve([
    [4, 7], [4, 17], // West cuts
    [20, 7], [20, 17], // East cuts
    [7, 4], [17, 4], // North cuts
    [7, 20], [17, 20] // South cuts
  ]);

  // Ring 3 (r=5) to Ring 4 (r=7): cuts at Wall Ring 3 (r=6)
  carve([
    [6, 9], [6, 15], // West cuts
    [18, 9], [18, 15], // East cuts
    [9, 6], [15, 6], // North cuts
    [9, 18], [15, 18] // South cuts
  ]);

  // Ring 4 (r=7) to Ring 5 (r=9): cuts at Wall Ring 4 (r=8)
  carve([
    [8, 11], [8, 13], // West cuts
    [16, 11], [16, 13], // East cuts
    [11, 8], [13, 8], // North cuts
    [11, 16], [13, 16] // South cuts
  ]);

  // Cardinal spokes connections at r=1, 3:
  // North spoke connects r=1, 2, 3
  carve([[12, 1], [12, 2], [12, 3], [12, 4]]);
  // South spoke connects r=1, 2, 3
  carve([[12, 23], [12, 22], [12, 21]]);
  // West spoke connects r=1, 2, 3
  carve([[1, 12], [2, 12], [3, 12], [4, 12]]);
  // East spoke connects r=1, 2, 3
  carve([[23, 12], [22, 12], [21, 12], [20, 12]]);

  // Inner Sanctum Doorway at (12, 10):
  ground[10][12] = 0;

  // 2. Trestle Bridges over lower r=7 canals
  // North Trestle (along x = 12):
  ground[6][12] = TILES.RAMP_S;
  ground[7][12] = 0; // underpass floor
  overhead[7][12] = TILES.BRIDGE_NS;
  ground[8][12] = TILES.RAMP_N;

  // South Trestle (along x = 12):
  ground[16][12] = TILES.RAMP_S;
  ground[17][12] = 0; // underpass floor
  overhead[17][12] = TILES.BRIDGE_NS;
  ground[18][12] = TILES.RAMP_N;

  // West Trestle (along y = 12):
  ground[12][6] = TILES.RAMP_E;
  ground[12][7] = 0; // underpass floor
  overhead[12][7] = TILES.BRIDGE_EW;
  ground[12][8] = TILES.RAMP_W;

  // East Trestle (along y = 12):
  ground[12][16] = TILES.RAMP_E;
  ground[12][17] = 0; // underpass floor
  overhead[12][17] = TILES.BRIDGE_EW;
  ground[12][18] = TILES.RAMP_W;

  // Wall-Walk Battlement on Wall Ring 1 (North, y=2):
  // Approaches from (2, 2) on ground:
  ground[2][3] = TILES.RAMP_E;
  overhead[2][4] = TILES.WALL_WALK;
  overhead[2][5] = TILES.WALL_WALK;
  overhead[2][6] = TILES.WALL_WALK;
  overhead[2][7] = TILES.WALL_WALK;
  ground[2][8] = TILES.RAMP_W;

  // Secret Wall at (23, 2) leading to Secret Chamber at (23, 1)
  ground[2][23] = TILES.SECRET_WALL;

  // 3. Isolated Astral Chamber in SE (x: 21..23, y: 21..23)
  for (let y = 20; y <= 24; y++) ground[y][20] = 1;
  for (let x = 20; x <= 24; x++) ground[20][x] = 1;
  for (let y = 21; y <= 23; y++) {
    for (let x = 21; x <= 23; x++) {
      ground[y][x] = 0;
    }
  }

  // Shifting Barrier at (12, 20) blocking passage to Portal A at (12, 21)
  ground[20][12] = 1;
  ground[21][11] = 1;
  ground[21][13] = 1;
  ground[22][12] = 1;

  const entities = [
    {
      id: 'key_prism_38',
      type: 'key',
      name: 'Prism Keystone',
      color: '#38bdf8',
      x: 22,
      y: 22,
      elevation: 0
    },
    {
      id: 'door_prism_38',
      type: 'door',
      name: 'Inner Sanctum Gate',
      color: '#38bdf8',
      requiresKey: 'key_prism_38',
      x: 12,
      y: 10,
      elevation: 0
    },
    {
      id: 'lever_trestle_38',
      type: 'lever',
      name: 'Battlement Focal Lever',
      color: '#06b6d4',
      x: 5,
      y: 2,
      elevation: 1, // On the Wall-Walk!
      targets: [
        {
          action: 'toggle_tile',
          layer: 'ground',
          x: 12,
          y: 20,
          stateA: 0,
          stateB: 1
        }
      ]
    },
    {
      id: 'portal_trestle_a',
      type: 'teleporter',
      name: 'Concentric Rift Alpha',
      color: '#8b5cf6',
      x: 12,
      y: 21,
      elevation: 0,
      targetX: 21,
      targetY: 22,
      targetElevation: 0
    },
    {
      id: 'portal_trestle_b',
      type: 'teleporter',
      name: 'Concentric Rift Beta',
      color: '#8b5cf6',
      x: 23,
      y: 22,
      elevation: 0,
      targetX: 12,
      targetY: 3,
      targetElevation: 0
    },
    {
      id: 'patroller_trestle_38',
      type: 'patroller',
      name: 'Apex Trestle Sentinel',
      color: '#ef4444',
      elevation: 0,
      speed: 1.0,
      waypoints: [
        { x: 3, y: 9 },
        { x: 3, y: 15 }
      ]
    },
    {
      id: 'hazard_trestle_38',
      type: 'timed_hazard',
      hazardType: 'spikes',
      x: 7,
      y: 5,
      elevation: 0,
      activeDuration: 2.0,
      inactiveDuration: 2.0,
      offset: 0
    },
    {
      id: 'checkpoint_38',
      type: 'checkpoint',
      style: 'crystal_beacon',
      name: 'Concentric Nexus Beacon',
      x: 12,
      y: 3,
      elevation: 0,
      color: '#38bdf8'
    },
    {
      id: 'decor_note_38',
      type: 'wall_decor',
      decorType: 'plaque',
      title: 'Trestle Diagram',
      text: 'Four elevated viaduct trestles bridge the concentric rings. Traverse the upper platform to bypass the lower canals.',
      author: 'Master Architect Vane',
      x: 1,
      y: 4,
      facing: 'east',
      elevation: 0
    },
    {
      id: 'gem_secret_38',
      type: 'collectible',
      collectibleType: 'gem',
      name: 'Celestial Tourmaline',
      scoreValue: 300,
      color: '#ec4899',
      x: 23,
      y: 1,
      elevation: 0
    }
  ];

  return {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '38',
    chapter: 'chapter_10',
    zone: 'zone_10',
    title: 'Concentric Trestles',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: 'prismatic',
      viewPerspective: 'angled'
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: 'wall_doorway',
      wallDirection: 'north'
    },
    exit: {
      x: 12,
      y: 12,
      elevation: 0,
      style: 'pedestal',
      label: 'Apex Altar'
    },
    parSteps: 60,
    parTime: 40,
    architectNote: 'Traverse the multi-elevation concentric trestles, toggle the battlement lever, and claim the keystone to enter the Apex Altar.',
    help: {
      title: 'Level 38: Concentric Trestles',
      message: 'The inner sanctum is surrounded by concentric ring galleries. Cross the elevated trestle bridges to navigate between tiers.'
    },
    layers: { ground, overhead },
    entities
  };
}

// ---------------------------------------------------------------------------
// LEVEL 39: "Harmonic Mirror Seals" (27x27)
// ---------------------------------------------------------------------------
export function generateLevel39() {
  const width = 27;
  const height = 27;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  function carve(coords) {
    for (const [x, y] of coords) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ground[y][x] = 0;
      }
    }
  }

  // 1. Serpentine Corridors across 4 Quadrants to eliminate ALL dead spaces >= 4x4
  // NW Quadrant (x: 1..11, y: 1..11)
  for (let y = 1; y <= 11; y += 2) {
    for (let x = 1; x <= 11; x++) ground[y][x] = 0;
  }
  for (let y = 2; y <= 10; y += 4) ground[y][1] = 0;
  for (let y = 4; y <= 10; y += 4) ground[y][11] = 0;

  // NE Quadrant (x: 15..25, y: 1..11)
  for (let y = 1; y <= 11; y += 2) {
    for (let x = 15; x <= 25; x++) ground[y][x] = 0;
  }
  for (let y = 2; y <= 10; y += 4) ground[y][25] = 0;
  for (let y = 4; y <= 10; y += 4) ground[y][15] = 0;

  // SW Quadrant (x: 1..11, y: 15..25)
  for (let y = 15; y <= 25; y += 2) {
    for (let x = 1; x <= 11; x++) ground[y][x] = 0;
  }
  for (let y = 16; y <= 24; y += 4) ground[y][1] = 0;
  for (let y = 18; y <= 24; y += 4) ground[y][11] = 0;

  // SE Quadrant (x: 15..25, y: 15..25)
  for (let y = 15; y <= 25; y += 2) {
    for (let x = 15; x <= 25; x++) ground[y][x] = 0;
  }
  for (let y = 16; y <= 24; y += 4) ground[y][25] = 0;
  for (let y = 18; y <= 24; y += 4) ground[y][15] = 0;

  // Central Spokes (x = 13 and y = 13)
  for (let y = 1; y <= 10; y++) ground[y][13] = 0;
  for (let y = 16; y <= 25; y++) ground[y][13] = 0;
  for (let x = 1; x <= 10; x++) ground[13][x] = 0;
  for (let x = 16; x <= 25; x++) ground[13][x] = 0;

  // Quadrant Connectors to Central Spokes
  carve([
    [12, 1], [14, 1],
    [12, 5], [14, 5],
    [12, 9], [14, 9],
    [12, 17], [14, 17],
    [12, 21], [14, 21],
    [12, 25], [14, 25],
    [5, 12], [5, 14],
    [9, 12], [9, 14],
    [17, 12], [17, 14],
    [21, 12], [21, 14]
  ]);

  // Inner Sanctum (x: 12..14, y: 12..14)
  for (let y = 12; y <= 14; y++) {
    for (let x = 12; x <= 14; x++) {
      ground[y][x] = 0;
    }
  }
  // Enclosing walls around Inner Sanctum
  for (let y = 11; y <= 15; y++) {
    ground[y][11] = 1;
    ground[y][15] = 1;
  }
  for (let x = 11; x <= 15; x++) {
    ground[11][x] = 1;
    ground[15][x] = 1;
  }
  // Approach to door at (13, 10), door at (13, 11)
  ground[10][13] = 0;
  ground[11][13] = 0; // Door tile

  // 2. Elevated Viaduct Platforms and Wall Walks
  // North Viaduct: along x = 13, crossing over lower East-West corridor at y = 5
  ground[3][13] = TILES.RAMP_S;
  overhead[4][13] = TILES.PLATFORM;
  overhead[5][13] = TILES.BRIDGE_NS; // Bridge over underpass at ground[5][13]
  overhead[6][13] = TILES.PLATFORM;
  ground[7][13] = TILES.RAMP_N;

  // South Viaduct: along x = 13, crossing over lower East-West corridor at y = 21
  ground[19][13] = TILES.RAMP_S;
  overhead[20][13] = TILES.PLATFORM;
  overhead[21][13] = TILES.BRIDGE_NS;
  overhead[22][13] = TILES.PLATFORM;
  ground[23][13] = TILES.RAMP_N;

  // West Wall Walk on northern battlements
  ground[2][2] = TILES.RAMP_E;
  overhead[2][3] = TILES.WALL_WALK;
  overhead[2][4] = TILES.WALL_WALK;
  overhead[2][5] = TILES.WALL_WALK;
  ground[2][6] = TILES.RAMP_W;

  // Secret Wall at (22, 4) guarding Gem at (24, 4)
  ground[4][22] = TILES.SECRET_WALL;
  ground[4][23] = 0;
  ground[4][24] = 0;

  // 3. Isolated East Astral Sanctum for Silver Key
  // Enclose x: 23..25, y: 11..15
  for (let y = 10; y <= 16; y++) ground[y][22] = 1;
  for (let x = 22; x <= 26; x++) {
    ground[10][x] = 1;
    ground[16][x] = 1;
  }
  for (let y = 11; y <= 15; y++) {
    for (let x = 23; x <= 25; x++) {
      ground[y][x] = 0;
    }
  }

  // Shifting Barrier at (13, 25) blocking ONLY passage to Portal A at (14, 25)
  ground[25][13] = 1; // Initially solid wall!
  ground[25][15] = 1;
  ground[24][14] = 1;

  const entities = [
    {
      id: "key_silver_39",
      type: "key",
      name: "Silver Harmonic Key",
      color: "#e2e8f0",
      x: 24,
      y: 13,
      elevation: 0
    },
    {
      id: "door_silver_39",
      type: "door",
      name: "Harmonic Forcefield Gate",
      color: "#e2e8f0",
      requiresKey: "key_silver_39",
      x: 13,
      y: 11,
      elevation: 0
    },
    {
      id: "lever_harmonic_39",
      type: "lever",
      name: "Harmonic Mirror Lever",
      color: "#a855f7",
      x: 3,
      y: 25,
      elevation: 0,
      targets: [
        {
          action: "toggle_tile",
          layer: "ground",
          x: 13,
          y: 25,
          stateA: 0,
          stateB: 1
        }
      ]
    },
    {
      id: "portal_harmonic_a",
      type: "teleporter",
      name: "Harmonic Rift Alpha",
      color: "#8b5cf6",
      x: 14,
      y: 25,
      elevation: 0,
      targetX: 23,
      targetY: 13,
      targetElevation: 0
    },
    {
      id: "portal_harmonic_b",
      type: "teleporter",
      name: "Harmonic Rift Beta",
      color: "#8b5cf6",
      x: 25,
      y: 13,
      elevation: 0,
      targetX: 13,
      targetY: 3,
      targetElevation: 0
    },
    {
      id: "patroller_harmonic_39",
      type: "patroller",
      name: "Resonant Mirror Warden",
      color: "#ec4899",
      elevation: 0,
      speed: 1.0,
      waypoints: [
        { x: 17, y: 17 },
        { x: 23, y: 17 }
      ]
    },
    {
      id: "hazard_harmonic_39",
      type: "timed_hazard",
      hazardType: "spikes",
      x: 7,
      y: 9,
      elevation: 0,
      activeDuration: 2.0,
      inactiveDuration: 2.0,
      offset: 0
    },
    {
      id: "checkpoint_39",
      type: "checkpoint",
      style: "crystal_beacon",
      name: "Harmonic Mirror Beacon",
      x: 13,
      y: 2,
      elevation: 0,
      color: "#e2e8f0"
    },
    {
      id: "decor_note_39",
      type: "wall_decor",
      decorType: "plaque",
      title: "Harmonic Mirror Inscription",
      text: "The silver tuning key rests in the isolated East Astral Sanctum. Align the southern focal lever to unseal the resonant rift.",
      author: "Prism Master Kael",
      x: 1,
      y: 3,
      facing: "east",
      elevation: 0
    },
    {
      id: "gem_secret_39",
      type: "collectible",
      collectibleType: "gem",
      name: "Harmonic Moonstone",
      scoreValue: 350,
      color: "#38bdf8",
      x: 24,
      y: 4,
      elevation: 0
    }
  ];

  return {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "39",
    chapter: "chapter_10",
    zone: "zone_10",
    title: "Harmonic Mirror Seals",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "prismatic",
      viewPerspective: "angled"
    },
    spawn: {
      x: 2,
      y: 2,
      elevation: 0,
      style: "floor_symbol"
    },
    exit: {
      x: 13,
      y: 13,
      elevation: 0,
      style: "pedestal",
      label: "Heart Portal"
    },
    parSteps: 145,
    parTime: 85,
    architectNote: "Align the harmonic mirror seals. Retrieve the silver key from the east wing to enter the Inner Sanctum.",
    help: {
      title: "Level 39: Harmonic Mirror Seals",
      message: "The inner hall is shielded by harmonic forcefields. Explore the resonating corridors to secure the silver tuning key."
    },
    layers: { ground, overhead },
    entities
  };
}

// ---------------------------------------------------------------------------
// LEVEL 40: "Heart of the Prism" (29x29)
// ---------------------------------------------------------------------------
export function generateLevel40() {
  const width = 29;
  const height = 29;
  const ground = Array.from({ length: height }, () => Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  function carve(coords) {
    for (const [x, y] of coords) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ground[y][x] = 0;
      }
    }
  }

  // 1. Serpentine Corridors across 4 Quadrants
  // NW Quadrant: x: 1..13, y: 1..13
  for (let y = 1; y <= 13; y += 2) {
    for (let x = 1; x <= 13; x++) ground[y][x] = 0;
  }
  for (let y = 2; y <= 12; y += 4) ground[y][1] = 0;
  for (let y = 4; y <= 12; y += 4) ground[y][13] = 0;

  // NE Quadrant: x: 15..27, y: 1..13
  for (let y = 1; y <= 13; y += 2) {
    for (let x = 15; x <= 27; x++) ground[y][x] = 0;
  }
  for (let y = 2; y <= 12; y += 4) ground[y][27] = 0;
  for (let y = 4; y <= 12; y += 4) ground[y][15] = 0;

  // SE Quadrant: x: 15..27, y: 15..27
  for (let y = 15; y <= 27; y += 2) {
    for (let x = 15; x <= 27; x++) ground[y][x] = 0;
  }
  for (let y = 16; y <= 26; y += 4) ground[y][27] = 0;
  for (let y = 18; y <= 26; y += 4) ground[y][15] = 0;

  // SW Quadrant: x: 1..13, y: 15..27
  for (let y = 15; y <= 27; y += 2) {
    for (let x = 1; x <= 13; x++) ground[y][x] = 0;
  }
  for (let y = 16; y <= 26; y += 4) ground[y][1] = 0;
  for (let y = 18; y <= 26; y += 4) ground[y][13] = 0;

  // Dividing Walls:
  // Column 14 separates West and East quadrants
  // Row 14 separates North and South quadrants
  // Sequential quadrant gates:
  // 1. NW to NE gate at (14, 1): Ruby Door
  ground[1][14] = 0;
  // 2. NE to SE gate at (27, 14): Emerald Door
  ground[14][27] = 0;
  // 3. SE to SW gate at (14, 27): Sapphire Door
  ground[27][14] = 0;

  // Central Apex Inner Sanctum at (14, 14)
  ground[14][14] = 0;
  // 4. SW to Center gate at (13, 14): Apex Door
  ground[14][13] = 0;

  // 2. Multi-Elevation Viaducts and Parapets
  // NE Viaduct: along y = 5, crossing over lower corridor at (21, 5)
  ground[5][19] = TILES.RAMP_E;
  overhead[5][20] = TILES.PLATFORM;
  overhead[5][21] = TILES.BRIDGE_EW;
  overhead[5][22] = TILES.PLATFORM;
  ground[5][23] = TILES.RAMP_W;

  // NW Wall-Walk Parapet: along y = 2
  ground[2][3] = TILES.RAMP_E;
  overhead[2][4] = TILES.WALL_WALK;
  overhead[2][5] = TILES.WALL_WALK;
  overhead[2][6] = TILES.WALL_WALK;
  ground[2][7] = TILES.RAMP_W;

  // Secret Wall at (25, 3) in NE guarding Gem at (27, 3)
  ground[3][25] = TILES.SECRET_WALL;
  ground[3][26] = 0;
  ground[3][27] = 0;

  const entities = [
    // 4 Elemental Shard Keys & Doors
    {
      id: "key_ruby_40",
      type: "key",
      name: "Ruby Shard Key",
      color: "#ef4444",
      x: 7,
      y: 7,
      elevation: 0
    },
    {
      id: "door_ruby_40",
      type: "door",
      name: "Ruby Prism Barrier",
      color: "#ef4444",
      requiresKey: "key_ruby_40",
      x: 14,
      y: 1,
      elevation: 0
    },
    {
      id: "key_emerald_40",
      type: "key",
      name: "Emerald Shard Key",
      color: "#10b981",
      x: 21,
      y: 7,
      elevation: 0
    },
    {
      id: "door_emerald_40",
      type: "door",
      name: "Emerald Prism Barrier",
      color: "#10b981",
      requiresKey: "key_emerald_40",
      x: 27,
      y: 14,
      elevation: 0
    },
    {
      id: "key_sapphire_40",
      type: "key",
      name: "Sapphire Shard Key",
      color: "#3b82f6",
      x: 21,
      y: 21,
      elevation: 0
    },
    {
      id: "door_sapphire_40",
      type: "door",
      name: "Sapphire Prism Barrier",
      color: "#3b82f6",
      requiresKey: "key_sapphire_40",
      x: 14,
      y: 27,
      elevation: 0
    },
    {
      id: "key_apex_40",
      type: "key",
      name: "Apex Prismatic Core",
      color: "#f59e0b",
      x: 7,
      y: 21,
      elevation: 0
    },
    {
      id: "door_apex_40",
      type: "door",
      name: "Gateway of the Prism",
      color: "#f59e0b",
      requiresKey: "key_apex_40",
      x: 13,
      y: 14,
      elevation: 0
    },

    // Compounding Sentinel, Hazard, and Checkpoints
    {
      id: "patroller_apex_40",
      type: "patroller",
      name: "Prismatic Apex Colossus",
      color: "#f43f5e",
      elevation: 0,
      speed: 1.0,
      waypoints: [
        { x: 2, y: 9 },
        { x: 6, y: 9 }
      ]
    },
    {
      id: "hazard_apex_40",
      type: "timed_hazard",
      hazardType: "spikes",
      x: 7,
      y: 11,
      elevation: 0,
      activeDuration: 2.0,
      inactiveDuration: 2.0,
      offset: 0
    },
    {
      id: "checkpoint_40",
      type: "checkpoint",
      style: "crystal_beacon",
      name: "Apex Central Beacon",
      x: 15,
      y: 13,
      elevation: 0,
      color: "#eab308"
    },
    {
      id: "decor_note_40",
      type: "wall_decor",
      decorType: "plaque",
      title: "Prism Master's Codex",
      text: "Unite the four elemental crystals: Ruby, Emerald, Sapphire, and the Astral Apex Key to breach the final sanctuary.",
      author: "Prism Sovereign Vael",
      x: 1,
      y: 3,
      facing: "east",
      elevation: 0
    },
    {
      id: "gem_apex_secret",
      type: "collectible",
      collectibleType: "gem",
      name: "Crown of the Prism",
      scoreValue: 500,
      color: "#f59e0b",
      x: 27,
      y: 3,
      elevation: 0
    }
  ];

  return {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "40",
    chapter: "chapter_10",
    zone: "zone_10",
    title: "Heart of the Prism",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "prismatic",
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
      x: 14,
      y: 14,
      elevation: 0,
      style: "pedestal",
      label: "Heart of the Prism"
    },
    parSteps: 397,
    parTime: 238,
    architectNote: "The climax macro-labyrinth. Traverse the four elemental quadrant sanctums and claim the Crown of the Prism at the central altar.",
    help: {
      title: "Level 40: Heart of the Prism",
      message: "Four elemental seals guard the heart of the prism. Explore all four quadrants, cross elevated viaducts, and breach the central sanctuary."
    },
    layers: { ground, overhead },
    entities
  };
}

// ---------------------------------------------------------------------------
// Runner & Verification
// ---------------------------------------------------------------------------
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log('Generating Level 37...');
  const l37 = generateLevel37();
  checkZeroDeadSpace4x4(l37.layers.ground, l37.layers.overhead, l37.dimensions.width, l37.dimensions.height, 37);
  const v37 = LevelValidator.validate(l37);
  if (!v37.valid) throw new Error('Level 37 invalid: ' + JSON.stringify(v37.errors));
  const sol37 = solveLevel(l37);
  if (!sol37) throw new Error('Level 37 has no solution!');
  l37.parSteps = Math.ceil(sol37.length * 1.15);
  l37.parTime = Math.ceil(sol37.length * 0.6);
  simulateCampaignLevelPlaythrough(l37);
  console.log(`Level 37 validated and simulated successfully! Optimal: ${sol37.length}, Par: ${l37.parSteps}`);

  console.log('Generating Level 38...');
  const l38 = generateLevel38();
  checkZeroDeadSpace4x4(l38.layers.ground, l38.layers.overhead, l38.dimensions.width, l38.dimensions.height, 38);
  const v38 = LevelValidator.validate(l38);
  if (!v38.valid) throw new Error('Level 38 invalid: ' + JSON.stringify(v38.errors));
  const sol38 = solveLevel(l38);
  if (!sol38) throw new Error('Level 38 has no solution!');
  l38.parSteps = Math.ceil(sol38.length * 1.15);
  l38.parTime = Math.ceil(sol38.length * 0.6);
  simulateCampaignLevelPlaythrough(l38);
  console.log(`Level 38 validated and simulated successfully! Optimal: ${sol38.length}, Par: ${l38.parSteps}`);

  console.log('Generating Level 39...');
  const l39 = generateLevel39();
  checkZeroDeadSpace4x4(l39.layers.ground, l39.layers.overhead, l39.dimensions.width, l39.dimensions.height, 39);
  const v39 = LevelValidator.validate(l39);
  if (!v39.valid) throw new Error('Level 39 invalid: ' + JSON.stringify(v39.errors));
  const sol39 = solveLevel(l39);
  if (!sol39) throw new Error('Level 39 has no solution!');
  l39.parSteps = Math.ceil(sol39.length * 1.15);
  l39.parTime = Math.ceil(sol39.length * 0.6);
  simulateCampaignLevelPlaythrough(l39);
  console.log(`Level 39 validated and simulated successfully! Optimal: ${sol39.length}, Par: ${l39.parSteps}`);

  console.log('Generating Level 40...');
  const l40 = generateLevel40();
  checkZeroDeadSpace4x4(l40.layers.ground, l40.layers.overhead, l40.dimensions.width, l40.dimensions.height, 40);
  const v40 = LevelValidator.validate(l40);
  if (!v40.valid) throw new Error('Level 40 invalid: ' + JSON.stringify(v40.errors));
  const sol40 = solveLevel(l40);
  if (!sol40) throw new Error('Level 40 has no solution!');
  l40.parSteps = Math.ceil(sol40.length * 1.15);
  l40.parTime = Math.ceil(sol40.length * 0.6);
  simulateCampaignLevelPlaythrough(l40);
  console.log(`Level 40 validated and simulated successfully! Optimal: ${sol40.length}, Par: ${l40.parSteps}`);

  const ch10Dir = path.join(rootDir, 'levels', 'chapter_10');
  fs.writeFileSync(path.join(ch10Dir, 'level_37.json'), JSON.stringify(l37, null, 2) + '\n');
  fs.writeFileSync(path.join(ch10Dir, 'level_38.json'), JSON.stringify(l38, null, 2) + '\n');
  fs.writeFileSync(path.join(ch10Dir, 'level_39.json'), JSON.stringify(l39, null, 2) + '\n');
  fs.writeFileSync(path.join(ch10Dir, 'level_40.json'), JSON.stringify(l40, null, 2) + '\n');
  console.log('Wrote level_37.json, level_38.json, level_39.json, level_40.json to levels/chapter_10/');
}

