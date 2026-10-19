/**
 * Complete Labyrinth Topology Redesign and Solver Calibration for Chapter 10: Levels 37–40
 * Implements BL-157 and ADR-0042 (True Maze Topology & Labyrinthine Redesign Standard)
 * Zero Dead Space >= 4x4, Compounding Mechanics, 3D Multi-Elevation Bridges, Battlements & Tunnels
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

/**
 * Carves an authentic labyrinth sector using DFS with directional inertia and braid.
 * Produces long, organic corridors with 90-degree turns, forks, and dead ends.
 */
export function buildLabyrinthSector(ground, minX, minY, maxX, maxY, prngSeed, inertia = 0.70, braid = 0.20, reservedSet = new Set()) {
  let s = prngSeed;
  function random() {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  }

  const oddCoords = [];
  for (let y = minY; y <= maxY; y += 2) {
    for (let x = minX; x <= maxX; x += 2) {
      if (!reservedSet.has(`${x},${y}`)) {
        oddCoords.push([x, y]);
      }
    }
  }

  if (oddCoords.length === 0) return;

  const visited = new Set();
  function k(x, y) { return `${x},${y}`; }

  const start = oddCoords[0];
  const stack = [[start[0], start[1]]];
  visited.add(k(start[0], start[1]));
  ground[start[1]][start[0]] = 0;

  const DIRS = [
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 }
  ];

  let lastDir = null;

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];

    const neighbors = [];
    for (const d of DIRS) {
      const nx = cx + d.dx;
      const ny = cy + d.dy;
      const mx = cx + d.dx / 2;
      const my = cy + d.dy / 2;
      if (
        nx >= minX && nx <= maxX &&
        ny >= minY && ny <= maxY &&
        !reservedSet.has(k(nx, ny)) &&
        !reservedSet.has(k(mx, my)) &&
        !visited.has(k(nx, ny))
      ) {
        neighbors.push({ ...d, nx, ny, mx, my });
      }
    }

    if (neighbors.length === 0) {
      stack.pop();
      lastDir = null;
      continue;
    }

    let chosen = null;
    if (lastDir && random() < inertia) {
      const same = neighbors.find(n => n.dx === lastDir.dx && n.dy === lastDir.dy);
      if (same) chosen = same;
    }

    if (!chosen) {
      chosen = neighbors[Math.floor(random() * neighbors.length)];
    }

    lastDir = { dx: chosen.dx, dy: chosen.dy };

    ground[chosen.my][chosen.mx] = 0;
    ground[chosen.ny][chosen.nx] = 0;

    visited.add(k(chosen.nx, chosen.ny));
    stack.push([chosen.nx, chosen.ny]);
  }

  // Connect any unvisited odd cells in this sector
  for (const [ox, oy] of oddCoords) {
    if (!visited.has(k(ox, oy))) {
      const candidates = [];
      for (const d of DIRS) {
        const nx = ox + d.dx;
        const ny = oy + d.dy;
        const mx = ox + d.dx / 2;
        const my = oy + d.dy / 2;
        if (visited.has(k(nx, ny)) && !reservedSet.has(k(mx, my))) {
          candidates.push({ ...d, nx, ny, mx, my });
        }
      }
      if (candidates.length > 0) {
        const c = candidates[Math.floor(random() * candidates.length)];
        ground[oy][ox] = 0;
        ground[c.my][c.mx] = 0;
        visited.add(k(ox, oy));
      }
    }
  }

  // Braid phase (selective loop creation)
  for (const [ox, oy] of oddCoords) {
    const walls = [];
    for (const d of DIRS) {
      const mx = ox + d.dx / 2;
      const my = oy + d.dy / 2;
      const nx = ox + d.dx;
      const ny = oy + d.dy;
      if (
        nx >= minX && nx <= maxX && ny >= minY && ny <= maxY &&
        !reservedSet.has(k(mx, my)) && !reservedSet.has(k(nx, ny)) &&
        ground[my][mx] === 1 && ground[ny][nx] === 0
      ) {
        walls.push([mx, my]);
      }
    }
    if (walls.length > 0 && random() < braid) {
      const [wx, wy] = walls[Math.floor(random() * walls.length)];
      ground[wy][wx] = 0;
    }
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

  const reserved = new Set();
  function reserve(x, y) { reserved.add(`${x},${y}`); }

  // Dividing Walls:
  // Column 11 is solid wall separating West and East
  for (let y = 1; y <= 21; y++) {
    ground[y][11] = 1;
    reserve(11, y);
  }
  // Row 11 is solid wall separating NW and SW (x: 1..10)
  for (let x = 1; x <= 10; x++) {
    ground[11][x] = 1;
    reserve(x, 11);
  }
  // Amber Door at (5, 11) is the ONLY passage through row 11
  ground[11][5] = 0;
  reserve(5, 11);

  // SE Crypt (x: 13..21, y: 13..21) is surrounded by solid walls:
  for (let y = 13; y <= 21; y++) {
    ground[y][12] = 1; reserve(12, y); // west wall
  }
  for (let x = 12; x <= 21; x++) {
    ground[13][x] = 1; reserve(x, 13); // north wall
  }

  // Central Viaduct & Refraction Lever
  // Landing from Astral Rift Beta is at (13, 8)
  ground[8][13] = 0; reserve(13, 8);
  ground[7][13] = 0; reserve(13, 7);
  // Viaduct Ramp East at (14, 7) enters from (13, 7) at elevation 0
  ground[7][14] = TILES.RAMP_E; reserve(14, 7);
  overhead[7][15] = TILES.PLATFORM; reserve(15, 7);
  overhead[7][16] = TILES.PLATFORM; reserve(16, 7);
  // Ramp West at (17, 7) descends to (18, 7) at elevation 0
  ground[7][17] = TILES.RAMP_W; reserve(17, 7);
  ground[7][18] = 0; reserve(18, 7);

  // Shifting Barrier at (18, 6) blocking path to Violet Door
  ground[6][18] = 1; reserve(18, 6);
  ground[5][18] = 0; reserve(18, 5);
  // Block bypass around barrier:
  ground[7][19] = 1; reserve(19, 7);
  ground[8][18] = 1; reserve(18, 8);
  ground[6][19] = 1; reserve(19, 6);
  // Violet Door at (21, 5) leading to exit at (21, 1)
  ground[5][21] = 0; reserve(21, 5);
  // Column 20 wall from y=1 to 4 prevents bypassing Violet Door:
  for (let y = 1; y <= 4; y++) {
    ground[y][20] = 1; reserve(20, y);
  }
  // Exit lane at (21, 1..4):
  for (let y = 1; y <= 4; y++) {
    ground[y][21] = 0; reserve(21, y);
  }

  // Secret Wall at (1, 19) in SW leading to Gem at (1, 20)
  ground[19][1] = TILES.SECRET_WALL; reserve(1, 19);
  ground[20][1] = 0; reserve(1, 20);

  // Key / Portal locations:
  // Amber Key at (3, 7) in NW
  ground[7][3] = 0; reserve(3, 7);
  // Violet Key at (17, 18) in SE Crypt
  ground[18][17] = 0; reserve(17, 18);
  // Portal Alpha at (3, 21) in SW
  ground[21][3] = 0; reserve(3, 21);
  // Portal Alpha target in SE Crypt at (19, 21)
  ground[21][19] = 0; reserve(19, 21);
  // Portal Beta in SE Crypt at (15, 14)
  ground[14][15] = 0; reserve(15, 14);

  // Carve 5 Organic Labyrinth Sectors:
  // 1. NW Sector: x: 1..9, y: 1..9
  buildLabyrinthSector(ground, 1, 1, 9, 9, 103701, 0.70, 0.20, reserved);
  // 2. SW Sector: x: 1..9, y: 13..21
  buildLabyrinthSector(ground, 1, 13, 9, 21, 103702, 0.70, 0.20, reserved);
  // 3. SE Crypt: x: 13..21, y: 15..21
  buildLabyrinthSector(ground, 13, 15, 21, 21, 103703, 0.70, 0.20, reserved);
  // 4. Upper NE Sector: x: 13..19, y: 1..5
  buildLabyrinthSector(ground, 13, 1, 19, 5, 103704, 0.70, 0.20, reserved);
  // 5. Lower NE Sector: x: 13..21, y: 9..12
  buildLabyrinthSector(ground, 13, 9, 21, 12, 103705, 0.70, 0.20, reserved);

  // Connect (13, 8) to lower NE sector at (13, 9)
  ground[9][13] = 0;

  // Connect doors, spawns, and passages cleanly:
  // Spawn (1, 1) is carved
  ground[1][1] = 0;
  // Amber Door at (5, 11): connect from NW (5, 10) and to SW (5, 12)
  ground[10][5] = 0;
  ground[12][5] = 0;
  // Connect (5, 12) to SW labyrinth at (5, 13)
  ground[13][5] = 0;
  // Connect (5, 10) to NW labyrinth at (5, 9)
  ground[9][5] = 0;

  // Connect Amber Key at (3, 7) to NW corridor
  ground[7][2] = 0;
  ground[7][4] = 0;

  // Connect Portal Alpha at (3, 21) to SW labyrinth
  ground[20][3] = 0;
  // Connect Portal Alpha target at (19, 21) to SE Crypt
  ground[20][19] = 0;
  // Connect Portal Beta at (15, 14) to SE Crypt
  ground[15][15] = 0;

  // Connect Shifting Barrier at (18, 6) to NE labyrinth
  ground[5][19] = 0;
  ground[5][20] = 0;

  // Ensure col 10 (even col) has passages to prevent dead space in NW:
  ground[1][10] = 0;
  ground[5][10] = 0;
  ground[9][10] = 0;
  // In SW col 10:
  ground[14][10] = 0;
  ground[18][10] = 0;
  ground[21][10] = 0;

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
        { x: 5, y: 17 },
        { x: 9, y: 17 }
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
    parSteps: 87,
    parTime: 55,
    architectNote: "The refracting crystal prisms cast elusive shadows. Locate the amber key, ascend the viaduct to toggle the refraction barrier, and unseal the spectral gate.",
    help: {
      title: "Level 37: The Spectral Gate",
      message: "The way forward is locked by dual crystal seals and chromatic barriers. Use the elevated viaduct to reach the focal lever."
    },
    layers: { ground, overhead },
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

  const reserved = new Set();
  function reserve(x, y) { reserved.add(`${x},${y}`); }

  // 1. High Wall-Walk Battlement atop Wall Ring (North wall y=2, x: 4..20)
  // Ascend from (2, 2) on ground via RAMP_E at (3, 2)
  ground[2][2] = 0; // ground approach
  ground[2][3] = TILES.RAMP_E;
  reserve(2, 2);
  reserve(3, 2);
  for (let x = 4; x <= 20; x++) {
    if (x === 15) {
      overhead[2][x] = TILES.BRIDGE_EW;
      ground[2][x] = 0; // underpass tunnel below battlement!
    } else {
      overhead[2][x] = TILES.WALL_WALK;
      ground[2][x] = 1; // solid wall below
      reserve(x, 2);
    }
  }
  // Eastern Battlement turning south atop x=20 (y: 3..14)
  for (let y = 3; y <= 14; y++) {
    if (y === 8) {
      overhead[y][20] = TILES.BRIDGE_NS;
      ground[y][20] = 0; // underpass tunnel below battlement!
    } else {
      overhead[y][20] = TILES.WALL_WALK;
      ground[y][20] = 1; // solid wall below
      reserve(20, y);
    }
  }

  // 2. Transverse Viaduct Trestle spanning from Eastern Battlement (20, 14) West along y=14
  for (let x = 15; x <= 19; x++) {
    if (x === 17 || x === 19) {
      overhead[14][x] = TILES.BRIDGE_EW;
      ground[14][x] = 0; // underpass corridor
    } else {
      overhead[14][x] = TILES.PLATFORM;
      ground[14][x] = 1;
      reserve(x, 14);
    }
  }

  // Viaduct Junction Platform at corner (14, 14)
  overhead[14][14] = TILES.PLATFORM;
  ground[14][14] = 1;
  reserve(14, 14);

  // Viaduct turns South down x = 14 (y: 15..18)
  for (let y = 15; y <= 18; y++) {
    if (y === 17 || y === 15) {
      overhead[y][14] = TILES.BRIDGE_NS;
      ground[y][14] = 0; // underpass corridor
    } else {
      overhead[y][14] = TILES.PLATFORM;
      ground[y][14] = 1;
      reserve(14, y);
    }
  }
  // South descending ramp from viaduct at (14, 19)
  ground[19][14] = TILES.RAMP_N;
  ground[20][14] = 0; // landing
  reserve(14, 19);
  reserve(14, 20);

  // 3. West Trestle (along y = 12):
  ground[12][6] = TILES.RAMP_E;
  ground[12][7] = 0; // underpass floor
  overhead[12][7] = TILES.BRIDGE_EW;
  ground[12][8] = TILES.RAMP_W;
  reserve(6, 12);
  reserve(7, 12);
  reserve(8, 12);

  // 4. North Trestle (along x = 12):
  ground[6][12] = TILES.RAMP_S;
  ground[7][12] = 0; // underpass floor
  overhead[7][12] = TILES.BRIDGE_NS;
  ground[8][12] = TILES.RAMP_N;
  reserve(12, 6);
  reserve(12, 7);
  reserve(12, 8);

  // 5. Sunken Keystone Courtyard at (18, 7) on ground:
  // Surrounded by walls, visible from overhead battlement at (20, 7),
  // accessible from ground underpass tunnel at (17, 14) via x=18!
  for (let y = 7; y <= 13; y++) {
    ground[y][18] = 0;
    reserve(18, y);
  }
  ground[7][19] = 0;
  ground[8][19] = 0;
  ground[9][19] = 0;
  reserve(19, 7);
  reserve(19, 8);
  reserve(19, 9);
  for (let y = 6; y <= 10; y++) {
    reserve(20, y);
    reserve(17, y);
  }
  reserve(18, 6);
  reserve(19, 6);

  // 6. Inner Sanctum (x: 11..13, y: 11..13)
  for (let y = 11; y <= 13; y++) {
    for (let x = 11; x <= 13; x++) {
      ground[y][x] = 0;
      reserve(x, y);
    }
  }
  // Enclosing walls around Inner Sanctum
  for (let y = 10; y <= 14; y++) {
    ground[y][10] = 1; reserve(10, y);
    ground[y][14] = 1; reserve(14, y);
  }
  for (let x = 10; x <= 14; x++) {
    ground[14][x] = 1; reserve(x, 14);
  }

  // Inner Sanctum Doorway at (12, 10) and entry corridor at (12, 11):
  ground[10][12] = 0;
  ground[11][12] = 0;
  reserve(12, 10);
  reserve(12, 11);
  // Shifting Barrier at (12, 9) blocking doorway
  ground[9][12] = 1;
  reserve(12, 9);
  // Approach vestibule at (12, 8):
  ground[8][12] = 0;
  reserve(12, 8);
  // Seal flanking walls at (11, 8..10) and (13, 8..10) so vestibule has no E-W ground bypass!
  for (let y = 8; y <= 10; y++) {
    ground[y][11] = 1; reserve(11, y);
    ground[y][13] = 1; reserve(13, y);
  }

  // 7. Secret Wall at (23, 2) leading to Secret Chamber at (23, 1)
  ground[2][23] = TILES.SECRET_WALL;
  ground[1][23] = 0;
  reserve(23, 2);
  reserve(23, 1);

  // 8. Ground sector barriers: seal NW quadrant on ground to force elevated traversal
  // Col 12: walls from y=1 to 5 (leaving y=6 for RAMP_S)
  for (let y = 1; y <= 5; y++) {
    ground[y][12] = 1;
    reserve(12, y);
  }
  // Col 11: wall at y=7 to block West entrance into North trestle underpass
  ground[7][11] = 1;
  reserve(11, 7);
  // Row 12: walls from x=1 to 5 (leaving x=6 for RAMP_E)
  for (let x = 1; x <= 5; x++) {
    ground[12][x] = 1;
    reserve(x, 12);
  }
  // Row 11: wall at x=7 to block North entrance into West trestle underpass
  ground[11][7] = 1;
  reserve(7, 11);

  // Carve 4 Organic Labyrinth Quadrants
  // NW Quadrant: x: 1..11, y: 1..11
  buildLabyrinthSector(ground, 1, 1, 11, 11, 103801, 0.70, 0.20, reserved);
  // NE Quadrant: x: 13..23, y: 1..11
  buildLabyrinthSector(ground, 13, 1, 23, 11, 103802, 0.70, 0.20, reserved);
  // SW Quadrant: x: 1..11, y: 13..23
  buildLabyrinthSector(ground, 1, 13, 11, 23, 103803, 0.70, 0.20, reserved);
  // SE Quadrant: x: 13..23, y: 13..23
  buildLabyrinthSector(ground, 13, 13, 23, 23, 103804, 0.70, 0.20, reserved);

  // Ensure approach connections:
  ground[1][1] = 0;
  ground[2][1] = 0;
  ground[2][2] = 0;

  // Connect landing of south viaduct ramp (14, 20) to SE labyrinth
  ground[20][15] = 0;
  ground[20][16] = 0;

  // Connect underpass at (17, 14) to SE labyrinth at (17, 15)
  ground[15][17] = 0;

  // Connect secret wall at (23, 2) to adjacent corridor at (23, 3)
  ground[3][23] = 0;

  // Connect approach to barrier (12, 9) from north (12, 8)
  ground[8][12] = 0;

  const entities = [
    {
      id: 'key_prism_38',
      type: 'key',
      name: 'Prism Keystone',
      color: '#38bdf8',
      x: 18,
      y: 7,
      elevation: 0 // In the sunken courtyard below the battlement!
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
      elevation: 1, // On the elevated Wall-Walk battlement!
      targets: [
        {
          action: 'toggle_tile',
          layer: 'ground',
          x: 12,
          y: 9,
          stateA: 0,
          stateB: 1
        }
      ]
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
      x: 14,
      y: 20,
      elevation: 0,
      color: '#38bdf8'
    },
    {
      id: 'decor_note_38',
      type: 'wall_decor',
      decorType: 'plaque',
      title: 'Trestle Diagram',
      text: 'Ascend the outer battlement ramparts and traverse the grand viaduct to look down into the sunken courts and navigate between tiers.',
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
    parSteps: 94,
    parTime: 58,
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

  const reserved = new Set();
  function reserve(x, y) { reserved.add(`${x},${y}`); }
  function isReserved(x, y) { return reserved.has(`${x},${y}`); }

  // 1. Reserve Special Chambers
  // Central Inner Sanctum (x: 11..15, y: 11..15)
  for (let y = 11; y <= 15; y++) {
    for (let x = 11; x <= 15; x++) {
      reserve(x, y);
    }
  }

  // East Astral Sanctum (x: 22..26, y: 11..15)
  for (let y = 10; y <= 16; y++) {
    for (let x = 22; x <= 26; x++) {
      reserve(x, y);
    }
  }

  // 2. Setup Inner Sanctum floor and door
  for (let y = 12; y <= 14; y++) {
    for (let x = 12; x <= 14; x++) {
      ground[y][x] = 0;
    }
  }
  ground[10][13] = 0; // Approach to door
  ground[11][13] = 0; // Door tile (door_silver_39)

  // 3. Setup East Astral Sanctum floor and walls
  for (let y = 11; y <= 15; y++) {
    for (let x = 23; x <= 25; x++) {
      ground[y][x] = 0;
    }
  }

  // 4. Setup Central Spokes & Viaducts
  for (let y = 1; y <= 10; y++) {
    ground[y][13] = 0;
  }
  // North Viaduct: along x = 13, crossing over lower East-West corridor at y = 5
  ground[3][13] = TILES.RAMP_S;
  overhead[4][13] = TILES.PLATFORM;
  overhead[5][13] = TILES.BRIDGE_NS;
  overhead[6][13] = TILES.PLATFORM;
  ground[7][13] = TILES.RAMP_N;

  for (let y = 16; y <= 25; y++) {
    ground[y][13] = 0;
  }
  ground[19][13] = TILES.RAMP_S;
  overhead[20][13] = TILES.PLATFORM;
  overhead[21][13] = TILES.BRIDGE_NS;
  overhead[22][13] = TILES.PLATFORM;
  ground[23][13] = TILES.RAMP_N;

  reserve(13, 3);
  reserve(13, 4);
  reserve(13, 6);
  reserve(13, 7);
  reserve(13, 19);
  reserve(13, 20);
  reserve(13, 22);
  reserve(13, 23);

  // 5. Setup Shifting Barrier at (13, 25) blocking Portal A at (14, 25)
  ground[25][13] = 1; // Solid wall initially
  ground[25][14] = 0; // Portal tile
  ground[25][15] = 1;
  ground[24][14] = 1;
  reserve(13, 25);
  reserve(14, 25);
  reserve(15, 25);
  reserve(14, 24);

  // 6. Setup West Wall-Walk Battlement atop Wall at y = 2
  ground[2][2] = TILES.RAMP_E;
  overhead[2][3] = TILES.WALL_WALK;
  overhead[2][4] = TILES.WALL_WALK;
  overhead[2][5] = TILES.WALL_WALK;
  ground[2][6] = TILES.RAMP_W;
  reserve(2, 2);
  reserve(3, 2);
  reserve(4, 2);
  reserve(5, 2);
  reserve(6, 2);

  // 7. Setup Secret Wall at (22, 4) guarding Gem at (24, 4)
  ground[4][22] = TILES.SECRET_WALL;
  ground[4][23] = 0;
  ground[4][24] = 0;
  reserve(22, 4);
  reserve(23, 4);
  reserve(24, 4);

  // 8. Setup Lever position at (3, 25)
  ground[25][3] = 0;
  reserve(3, 25);

  // 9. Whole-Grid Organic Labyrinth Carving with Inertia & Braid
  let s = 98765;
  function random() {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  }

  const oddCoords = [];
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      if (!isReserved(x, y)) {
        oddCoords.push([x, y]);
      }
    }
  }

  const visited = new Set();
  function k(x, y) { return `${x},${y}`; }

  const startX = 1;
  const startY = 1;
  const stack = [[startX, startY]];
  visited.add(k(startX, startY));
  ground[startY][startX] = 0;

  const DIRS = [
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 }
  ];

  let lastDir = null;

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];

    const neighbors = [];
    for (const d of DIRS) {
      const nx = cx + d.dx;
      const ny = cy + d.dy;
      if (
        nx > 0 && nx < width - 1 &&
        ny > 0 && ny < height - 1 &&
        !isReserved(nx, ny) &&
        !isReserved(cx + d.dx / 2, cy + d.dy / 2) &&
        !visited.has(k(nx, ny))
      ) {
        neighbors.push({ ...d, nx, ny });
      }
    }

    if (neighbors.length === 0) {
      stack.pop();
      lastDir = null;
      continue;
    }

    let chosen = null;
    if (lastDir && random() < 0.70) {
      const same = neighbors.find(n => n.dx === lastDir.dx && n.dy === lastDir.dy);
      if (same) chosen = same;
    }

    if (!chosen) {
      chosen = neighbors[Math.floor(random() * neighbors.length)];
    }

    lastDir = { dx: chosen.dx, dy: chosen.dy };

    ground[cy + chosen.dy / 2][cx + chosen.dx / 2] = 0;
    ground[chosen.ny][chosen.nx] = 0;

    visited.add(k(chosen.nx, chosen.ny));
    stack.push([chosen.nx, chosen.ny]);
  }

  // Connect any remaining unvisited odd cells
  for (const [ox, oy] of oddCoords) {
    if (!visited.has(k(ox, oy))) {
      const candidates = [];
      for (const d of DIRS) {
        const nx = ox + d.dx;
        const ny = oy + d.dy;
        if (visited.has(k(nx, ny)) && !isReserved(ox + d.dx / 2, oy + d.dy / 2)) {
          candidates.push({ ...d, nx, ny });
        }
      }
      if (candidates.length > 0) {
        const c = candidates[Math.floor(random() * candidates.length)];
        ground[oy][ox] = 0;
        ground[oy + c.dy / 2][ox + c.dx / 2] = 0;
        visited.add(k(ox, oy));
      }
    }
  }

  // Connect Central Spine (x=13) to adjacent labyrinth corridors at strategic points
  const spineConnections = [
    [12, 1], [14, 1],
    [12, 5], [14, 5],
    [12, 9], [14, 9],
    [12, 17], [14, 17],
    [12, 21], [14, 21]
  ];
  for (const [cx, cy] of spineConnections) {
    ground[cy][cx] = 0;
  }

  // Underpasses below viaduct bridges:
  ground[5][13] = 0;
  ground[21][13] = 0;

  // Lever connection:
  ground[25][2] = 0;
  ground[25][1] = 0;

  // Secret wall entrance:
  ground[4][21] = 0;

  // Braid Phase: add 15% loops
  for (const [ox, oy] of oddCoords) {
    let walls = [];
    for (const d of DIRS) {
      const mx = ox + d.dx / 2;
      const my = oy + d.dy / 2;
      const nx = ox + d.dx;
      const ny = oy + d.dy;
      if (
        nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 &&
        !isReserved(mx, my) && !isReserved(nx, ny) &&
        ground[my][mx] === 1 && ground[ny][nx] === 0
      ) {
        walls.push([mx, my]);
      }
    }
    if (walls.length > 0 && random() < 0.15) {
      const [wx, wy] = walls[Math.floor(random() * walls.length)];
      ground[wy][wx] = 0;
    }
  }

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
        { x: 21, y: 17 }
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
      x: 1,
      y: 1,
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
    parSteps: 97,
    parTime: 60,
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

  const reserved = new Set();
  function reserve(x, y) { reserved.add(`${x},${y}`); }

  // Dividing Walls at Row 14 and Col 14
  // Sequential quadrant gates:
  // Ruby Door at (14, 1): NW -> NE
  ground[1][14] = 0;
  reserve(14, 1);
  // Emerald Door at (27, 14): NE -> SE
  ground[14][27] = 0;
  reserve(27, 14);
  // Sapphire Door at (14, 27): SE -> SW
  ground[27][14] = 0;
  reserve(14, 27);

  // Central Apex Inner Sanctum at (14, 14)
  ground[14][14] = 0;
  reserve(14, 14);
  // Apex Door at (13, 14): SW -> Center
  ground[14][13] = 0;
  reserve(13, 14);

  // Reserve dividing walls so they stay solid (1) except gates
  for (let i = 0; i < 29; i++) {
    if (i !== 1 && i !== 27 && i !== 14) {
      reserve(14, i);
    }
    if (i !== 27 && i !== 13 && i !== 14) {
      reserve(i, 14);
    }
  }

  // Viaducts & Battlements in Level 40:
  // NE Viaduct: along y = 5, crossing over lower corridor at (21, 5)
  ground[5][19] = TILES.RAMP_E;
  overhead[5][20] = TILES.PLATFORM;
  overhead[5][21] = TILES.BRIDGE_EW;
  ground[5][21] = 0; // underpass corridor
  overhead[5][22] = TILES.PLATFORM;
  ground[5][23] = TILES.RAMP_W;
  for (let x = 19; x <= 23; x++) reserve(x, 5);

  // NW Wall-Walk Parapet: along y = 2
  ground[2][3] = TILES.RAMP_E;
  overhead[2][4] = TILES.WALL_WALK;
  overhead[2][5] = TILES.WALL_WALK;
  overhead[2][6] = TILES.WALL_WALK;
  ground[2][7] = TILES.RAMP_W;
  for (let x = 3; x <= 7; x++) reserve(x, 2);

  // Secret Wall at (25, 3) in NE guarding Gem at (27, 3)
  ground[3][25] = TILES.SECRET_WALL;
  ground[3][26] = 0;
  ground[3][27] = 0;
  reserve(25, 3);
  reserve(26, 3);
  reserve(27, 3);

  // Key locations:
  ground[7][7] = 0;
  ground[7][21] = 0;
  ground[21][21] = 0;
  ground[21][7] = 0;

  // Carve 4 Organic Labyrinth Quadrants
  // NW: x: 1..13, y: 1..13
  buildLabyrinthSector(ground, 1, 1, 13, 13, 104001, 0.70, 0.20, reserved);
  // NE: x: 15..27, y: 1..13
  buildLabyrinthSector(ground, 15, 1, 27, 13, 104002, 0.70, 0.20, reserved);
  // SE: x: 15..27, y: 15..27
  buildLabyrinthSector(ground, 15, 15, 27, 27, 104003, 0.70, 0.20, reserved);
  // SW: x: 1..13, y: 15..27
  buildLabyrinthSector(ground, 1, 15, 13, 27, 104004, 0.70, 0.20, reserved);

  // Connect quadrant gates cleanly to adjacent labyrinth corridors:
  ground[1][13] = 0;
  ground[1][15] = 0;
  ground[13][27] = 0;
  ground[15][27] = 0;
  ground[27][15] = 0;
  ground[27][13] = 0;
  ground[15][13] = 0;

  // Connect secret wall (25, 3) to adjacent corridor at (24, 3)
  ground[3][24] = 0;

  // Ensure viaduct underpass at (21, 5) connects to north/south corridors
  ground[4][21] = 0;
  ground[6][21] = 0;

  const entities = [
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
    {
      id: "patroller_apex_40",
      type: "patroller",
      name: "Prismatic Apex Colossus",
      color: "#f43f5e",
      elevation: 0,
      speed: 1.0,
      waypoints: [
        { x: 3, y: 9 },
        { x: 7, y: 9 }
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
    parSteps: 190,
    parTime: 115,
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
  const elevatedSteps38 = sol38.filter(s => s.z === 1 || s.elevation === 1).length;
  console.log(`Level 38 validated and simulated successfully! Optimal: ${sol38.length}, Elevated: ${elevatedSteps38}/${sol38.length}, Par: ${l38.parSteps}`);

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
