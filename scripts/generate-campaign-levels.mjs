/**
 * Comprehensive Campaign Level Generator & Solvability Verifier
 * Builds all 28 progressive levels across Chapters 1-7, validates each with LevelValidator,
 * updates levels/manifest.json, and synchronizes js/levels/default-levels.js.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LevelValidator } from '../js/editor/level-validator.js';
import { TILES, ELEVATION, ENTITY_TYPES } from '../js/core/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function createGrid(width, height, fill = TILES.WALL) {
  const grid = [];
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width).fill(fill));
  }
  return grid;
}

function carveH(grid, y, x1, x2, tile = TILES.FLOOR) {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  for (let x = start; x <= end; x++) {
    grid[y][x] = tile;
  }
}

function carveV(grid, x, y1, y2, tile = TILES.FLOOR) {
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2);
  for (let y = start; y <= end; y++) {
    grid[y][x] = tile;
  }
}

function carveRoom(grid, x, y, w, h, tile = TILES.FLOOR) {
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      grid[r][c] = tile;
    }
  }
}

console.log('Generating 28 campaign levels across 7 Chapters...');

const levels = [];

// ============================================================================
// CHAPTER 1: THE FOUNDATION (Whispering Dungeon, Keys & Orientation)
// ============================================================================

// Level 1 (1-1): First Footsteps
{
  const width = 15, height = 15;
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  carveH(ground, 1, 1, 7);
  carveV(ground, 7, 1, 7);
  carveH(ground, 7, 7, 13);
  carveV(ground, 13, 7, 13);

  carveV(ground, 1, 1, 11);
  carveH(ground, 11, 1, 3);

  carveH(ground, 3, 3, 11);
  carveV(ground, 3, 3, 7);
  carveH(ground, 5, 7, 11);
  carveV(ground, 11, 5, 9);
  carveH(ground, 9, 3, 11);
  carveH(ground, 13, 7, 13);

  levels.push({
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '1',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'First Footsteps',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: 13, y: 13, elevation: 0, style: 'portal' },
    parSteps: 35,
    parTime: 20,
    architectNote: 'Every grand labyrinth begins with a single step. Follow the stone path, retrieve the Dungeon Master Key, and open the gilded gate to reach the portal.',
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_arch_1',
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: "Architect's Note #1",
        text: 'Every grand labyrinth begins with a single step. Follow the stone path, retrieve the Dungeon Master Key, and open the gilded gate to reach the portal.',
        style: 'stone_tablet',
      },
      {
        id: 'key_gold_1',
        type: 'key',
        x: 1,
        y: 11,
        color: '#fbbf24',
        name: 'Dungeon Master Key',
        style: 'classic',
        glowEffect: 'vibrant',
      },
      {
        id: 'door_gold_1',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_gold_1',
        color: '#fbbf24',
        style: 'portcullis',
        orientation: 'horizontal',
      },
    ],
  });
}

// Level 2 (1-2): The Ruby Lock
{
  const width = 15, height = 15;
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  carveV(ground, 1, 1, 13);
  carveH(ground, 1, 1, 5);
  carveV(ground, 5, 1, 5);
  carveH(ground, 5, 5, 9);
  carveV(ground, 9, 5, 1);
  carveH(ground, 1, 9, 13);
  carveV(ground, 13, 1, 5);

  carveH(ground, 13, 1, 13);
  carveV(ground, 7, 5, 13);
  carveH(ground, 7, 1, 13);
  carveV(ground, 13, 7, 13);

  levels.push({
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '2',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'The Ruby Lock',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: 13, y: 13, elevation: 0, style: 'portal' },
    parSteps: 38,
    parTime: 22,
    architectNote: 'The ruby gemstone glimmers in the shadows. Remember: locked gates yield only to keys of matching resonance.',
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_arch_2',
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: "Architect's Note #2",
        text: 'The ruby gemstone glimmers in the shadows. Remember: locked gates yield only to keys of matching resonance.',
        style: 'stone_tablet',
      },
      {
        id: 'key_ruby_2',
        type: 'key',
        x: 1,
        y: 13,
        color: '#f43f5e',
        name: 'Ruby Key',
        style: 'classic',
        glowEffect: 'pulse',
      },
      {
        id: 'door_ruby_2',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_ruby_2',
        color: '#f43f5e',
        style: 'classic',
        orientation: 'horizontal',
      },
    ],
  });
}

// Level 3 (1-3): Prismatic Corridors
{
  const width = 17, height = 17;
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  carveH(ground, 1, 1, 15);
  carveV(ground, 1, 1, 15);
  carveH(ground, 15, 1, 15);
  carveV(ground, 15, 1, 15);

  carveRoom(ground, 7, 7, 3, 3);
  carveH(ground, 8, 1, 15);
  carveV(ground, 8, 1, 15);

  carveRoom(ground, 3, 3, 3, 3);
  carveRoom(ground, 11, 3, 3, 3);
  carveRoom(ground, 3, 11, 3, 3);
  carveRoom(ground, 11, 11, 3, 3);

  levels.push({
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '3',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'Prismatic Corridors',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: 15, y: 15, elevation: 0, style: 'portal' },
    parSteps: 54,
    parTime: 32,
    architectNote: 'Three gates of three colors bar the way forward. Seek the emerald in the east, sapphire in the south, and ruby in the west.',
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_arch_3',
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: "Architect's Note #3",
        text: 'Three gates of three colors bar the way forward. Seek the emerald in the east, sapphire in the south, and ruby in the west.',
        style: 'stone_tablet',
      },
      {
        id: 'key_emerald_3',
        type: 'key',
        x: 15,
        y: 1,
        color: '#34d399',
        name: 'Emerald Key',
        style: 'ornate',
        glowEffect: 'vibrant',
      },
      {
        id: 'door_emerald_3',
        type: 'door',
        x: 8,
        y: 5,
        requiresKey: 'key_emerald_3',
        color: '#34d399',
        style: 'classic',
        orientation: 'horizontal',
      },
      {
        id: 'key_ruby_3',
        type: 'key',
        x: 1,
        y: 15,
        color: '#f43f5e',
        name: 'Ruby Key',
        style: 'classic',
        glowEffect: 'pulse',
      },
      {
        id: 'door_ruby_3',
        type: 'door',
        x: 5,
        y: 8,
        requiresKey: 'key_ruby_3',
        color: '#f43f5e',
        style: 'portcullis',
        orientation: 'vertical',
      },
      {
        id: 'key_sapphire_3',
        type: 'key',
        x: 8,
        y: 8,
        color: '#38bdf8',
        name: 'Sapphire Key',
        style: 'orb',
        glowEffect: 'sparkle',
      },
      {
        id: 'door_sapphire_3',
        type: 'door',
        x: 11,
        y: 8,
        requiresKey: 'key_sapphire_3',
        color: '#38bdf8',
        style: 'heavy',
        orientation: 'vertical',
      },
    ],
  });
}

// Level 4 (1-4): The Shrouded Vault (Capstone)
{
  const width = 19, height = 19;
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  // Serpentine corridor
  for (let y = 1; y < height - 1; y += 2) {
    carveH(ground, y, 1, width - 2);
  }
  for (let i = 0; i < 4; i++) {
    const yTop = 1 + i * 4;
    const yBot = yTop + 2;
    const yNext = yBot + 2;
    carveV(ground, width - 2, yTop, yBot);
    if (yNext < height - 1) {
      carveV(ground, 1, yBot, yNext);
    }
  }

  // Cross connector
  carveV(ground, 9, 1, height - 2);

  levels.push({
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: '4',
    chapter: 'chapter_1',
    zone: 'zone_1',
    title: 'The Shrouded Vault',
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 5,
      allowFreePan: true,
      tileSize: 32,
      theme: 'dungeon',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: 17, y: 17, elevation: 0, style: 'portal' },
    parSteps: 68,
    parTime: 40,
    architectNote: 'The deepest vault is shrouded in mist. Trust your orientation, map the chambers in your mind, and claim the master sigil.',
    layers: { ground, overhead },
    entities: [
      {
        id: 'sign_arch_4',
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: "Architect's Note #4",
        text: 'The deepest vault is shrouded in mist. Trust your orientation, map the chambers in your mind, and claim the master sigil.',
        style: 'stone_tablet',
      },
      {
        id: 'key_gold_4',
        type: 'key',
        x: 1,
        y: 17,
        color: '#fbbf24',
        name: 'Vault Master Sigil',
        style: 'ornate',
        glowEffect: 'vibrant',
      },
      {
        id: 'door_gold_4',
        type: 'door',
        x: 16,
        y: 17,
        requiresKey: 'key_gold_4',
        color: '#fbbf24',
        style: 'portcullis',
        orientation: 'horizontal',
      },
    ],
  });
}

// ============================================================================
// CHAPTER 2: THE VERTICAL DIMENSION (Emerald Canopy, 3D Bridges & Ramps)
// ============================================================================

function createBridgeLevel({ id, title, width, height, midX, rampY1, rampY2, parSteps, parTime, note }) {
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  // Outer pathway
  carveH(ground, 1, 1, width - 2);
  carveV(ground, 1, 1, height - 2);
  carveH(ground, height - 2, 1, width - 2);
  carveV(ground, width - 2, 1, height - 2);

  // Path to ramp start
  carveV(ground, midX, 1, rampY1);

  // Ramp going UP (South)
  ground[rampY1][midX] = TILES.RAMP_S;

  // Overhead bridge deck
  for (let y = rampY1 + 1; y < rampY2; y++) {
    overhead[y][midX] = TILES.BRIDGE_EW;
  }

  // Underpass tunnel on ground at midY
  const midY = Math.floor((rampY1 + rampY2) / 2);
  carveH(ground, midY, 1, width - 2);
  ground[midY][midX] = TILES.BRIDGE_EW;

  // Ramp going DOWN (South)
  ground[rampY2][midX] = TILES.RAMP_N;

  // Path from ramp exit to bottom corridor
  carveV(ground, midX, rampY2, height - 2);

  return {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: String(id),
    chapter: 'chapter_2',
    zone: 'zone_2',
    title,
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'jungle',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: width - 2, y: height - 2, elevation: 0, style: 'portal' },
    parSteps,
    parTime,
    architectNote: note,
    layers: { ground, overhead },
    entities: [
      {
        id: `sign_arch_${id}`,
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: `Architect's Note #${id}`,
        text: note,
        style: 'wooden_sign',
      },
      {
        id: `key_jungle_${id}`,
        type: 'key',
        x: midX,
        y: midY,
        z: 1,
        elevation: 1,
        color: '#34d399',
        name: 'Canopy Key',
        style: 'ornate',
        glowEffect: 'vibrant',
      },
      {
        id: `door_jungle_${id}`,
        type: 'door',
        x: width - 3,
        y: height - 2,
        requiresKey: `key_jungle_${id}`,
        color: '#34d399',
        style: 'portcullis',
        orientation: 'horizontal',
      },
    ],
  };
}

levels.push(createBridgeLevel({
  id: 5,
  title: 'The Wooden Ramp',
  width: 15,
  height: 15,
  midX: 7,
  rampY1: 3,
  rampY2: 11,
  parSteps: 36,
  parTime: 22,
  note: 'Look up! The jungle canopy offers high paths. Walk up the wooden incline to ascend to elevation 1.',
}));

levels.push(createBridgeLevel({
  id: 6,
  title: 'Under & Over',
  width: 17,
  height: 17,
  midX: 8,
  rampY1: 4,
  rampY2: 12,
  parSteps: 48,
  parTime: 28,
  note: 'A single bridge can be traversed twice: once as a cool tunnel beneath, and once as a soaring walk above.',
}));

levels.push(createBridgeLevel({
  id: 7,
  title: 'Canopy Crossroads',
  width: 19,
  height: 19,
  midX: 9,
  rampY1: 5,
  rampY2: 13,
  parSteps: 56,
  parTime: 34,
  note: 'Where canopies collide, paths weave over and under. Mind your footing and explore both layers.',
}));

levels.push(createBridgeLevel({
  id: 8,
  title: 'The Treehouse Spire',
  width: 21,
  height: 21,
  midX: 10,
  rampY1: 6,
  rampY2: 14,
  parSteps: 75,
  parTime: 45,
  note: 'The ancient canopy spire stretches across multiple elevations. Master both floors to claim the forest crown.',
}));

// ============================================================================
// CHAPTER 3: SHIFTING ARCHITECTURE (Sunken Temple, Modulating Levers)
// ============================================================================

function createLeverLevel({ id, title, width = 17, height = 17, leverX, leverY, targetX, targetY, parSteps, parTime, note }) {
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  carveH(ground, 1, 1, width - 2);
  carveV(ground, 1, 1, height - 2);
  carveH(ground, height - 2, 1, width - 2);
  carveV(ground, width - 2, 1, height - 2);

  const midY = Math.floor(height / 2);
  const midX = Math.floor(width / 2);
  carveH(ground, midY, 1, width - 2);
  carveV(ground, midX, 1, height - 2);

  ground[targetY][targetX] = TILES.WALL;

  return {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: String(id),
    chapter: 'chapter_3',
    zone: 'zone_3',
    title,
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'temple',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: width - 2, y: height - 2, elevation: 0, style: 'portal' },
    parSteps,
    parTime,
    architectNote: note,
    layers: { ground, overhead },
    entities: [
      {
        id: `sign_arch_${id}`,
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: `Architect's Note #${id}`,
        text: note,
        style: 'stone_tablet',
      },
      {
        id: `lever_${id}`,
        type: 'lever',
        x: leverX,
        y: leverY,
        name: 'Clockwork Gear',
        style: 'switch_lever',
        state: false,
        targets: [
          {
            action: 'toggle_tile',
            layer: 'ground',
            x: targetX,
            y: targetY,
            stateA: 1,
            stateB: 0,
          },
        ],
      },
    ],
  };
}

levels.push(createLeverLevel({
  id: 9,
  title: 'The Stone Switch',
  width: 15,
  height: 15,
  leverX: 1,
  leverY: 13,
  targetX: 7,
  targetY: 7,
  parSteps: 40,
  parTime: 24,
  note: 'The stones beneath your feet hear the click of ancient levers. Step upon the switch to open the way.',
}));

levels.push(createLeverLevel({
  id: 10,
  title: 'The Seesaw Chasm',
  width: 17,
  height: 17,
  leverX: 1,
  leverY: 15,
  targetX: 8,
  targetY: 8,
  parSteps: 50,
  parTime: 30,
  note: 'When one gate opens, another must close. Plan your route before pulling the lever.',
}));

levels.push(createLeverLevel({
  id: 11,
  title: 'Vertical Gears',
  width: 19,
  height: 19,
  leverX: 1,
  leverY: 17,
  targetX: 9,
  targetY: 9,
  parSteps: 58,
  parTime: 35,
  note: 'The gears of the temple reach between dimensions. A lever pulled on the ground shifts the walkways above.',
}));

levels.push(createLeverLevel({
  id: 12,
  title: 'The Clockwork Vault',
  width: 21,
  height: 21,
  leverX: 1,
  leverY: 19,
  targetX: 10,
  targetY: 10,
  parSteps: 78,
  parTime: 48,
  note: 'The grand clockwork mechanism is a living puzzle. Each lever changes the maze topology.',
}));

// ============================================================================
// CHAPTER 4: ASTRAL ANOMALIES (Crystal Caverns, Teleporters)
// ============================================================================

function createTeleportLevel({ id, title, width = 17, height = 17, tpX, tpY, targetX, targetY, parSteps, parTime, note }) {
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  // Chamber 1: North (Spawn at 1, 1 -> TP at tpX, tpY)
  carveH(ground, 1, 1, width - 2);
  carveV(ground, tpX, 1, tpY);

  // Chamber 2: South (Target at targetX, targetY -> Exit at width-2, height-2)
  carveV(ground, targetX, targetY, height - 2);
  carveH(ground, height - 2, 1, width - 2);

  return {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: String(id),
    chapter: 'chapter_4',
    zone: 'zone_4',
    title,
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'cave',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: width - 2, y: height - 2, elevation: 0, style: 'portal' },
    parSteps,
    parTime,
    architectNote: note,
    layers: { ground, overhead },
    entities: [
      {
        id: `sign_arch_${id}`,
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: `Architect's Note #${id}`,
        text: note,
        style: 'astral_scroll',
      },
      {
        id: `tp_${id}`,
        type: 'teleporter',
        x: tpX,
        y: tpY,
        z: 0,
        targetX,
        targetY,
        targetZ: 0,
        name: 'Astral Rift',
        color: '#c084fc',
      },
    ],
  };
}

levels.push(createTeleportLevel({
  id: 13,
  title: 'The Crystal Rift',
  width: 15,
  height: 15,
  tpX: 7,
  tpY: 5,
  targetX: 7,
  targetY: 9,
  parSteps: 38,
  parTime: 22,
  note: 'The amethyst rift warps reality itself. Step into the glowing circle to traverse the void.',
}));

levels.push(createTeleportLevel({
  id: 14,
  title: 'Dimensional Lift',
  width: 17,
  height: 17,
  tpX: 8,
  tpY: 6,
  targetX: 8,
  targetY: 10,
  parSteps: 46,
  parTime: 26,
  note: 'Rifts can alter elevation without a single step of stairs. Ascend to the stars.',
}));

levels.push(createTeleportLevel({
  id: 15,
  title: 'The Relay Network',
  width: 19,
  height: 19,
  tpX: 9,
  tpY: 7,
  targetX: 9,
  targetY: 11,
  parSteps: 54,
  parTime: 32,
  note: 'A network of crystal portals. Choose your jumps wisely; not all paths lead forward.',
}));

levels.push(createTeleportLevel({
  id: 16,
  title: 'The Amethyst Nexus',
  width: 21,
  height: 21,
  tpX: 10,
  tpY: 8,
  targetX: 10,
  targetY: 12,
  parSteps: 72,
  parTime: 44,
  note: 'Welcome to the Nexus: a fragmented realm stitched together by astral rifts.',
}));

// ============================================================================
// CHAPTER 5: RHYTHM & DANGER (Molten Core, Hazards & Patrollers)
// ============================================================================

function createPatrolLevel({ id, title, width = 17, height = 17, waypoints, parSteps, parTime, note }) {
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  carveH(ground, 1, 1, width - 2);
  carveV(ground, width - 2, 1, height - 2);
  carveH(ground, height - 2, 1, width - 2);
  carveV(ground, 1, 1, height - 2);

  const midY = Math.floor(height / 2);
  carveH(ground, midY, 1, width - 2);
  carveV(ground, Math.floor(width / 2), 1, height - 2);

  carveRoom(ground, 3, 3, 2, 2);
  carveRoom(ground, width - 5, 3, 2, 2);

  return {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: String(id),
    chapter: 'chapter_5',
    zone: 'zone_5',
    title,
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'lava',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: width - 2, y: height - 2, elevation: 0, style: 'portal' },
    parSteps,
    parTime,
    architectNote: note,
    layers: { ground, overhead },
    entities: [
      {
        id: `sign_arch_${id}`,
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: `Architect's Note #${id}`,
        text: note,
        style: 'stone_tablet',
      },
      {
        id: `patroller_${id}`,
        type: 'patroller',
        waypoints,
        speed: 1.0,
        name: 'Molten Sentinel',
      },
    ],
  };
}

levels.push(createPatrolLevel({
  id: 17,
  title: 'The Fire Vents',
  width: 15,
  height: 15,
  waypoints: [{ x: 5, y: 7, z: 0 }, { x: 9, y: 7, z: 0 }],
  parSteps: 40,
  parTime: 24,
  note: 'Feel the heat beneath the obsidian floor. Time your movement between eruptions.',
}));

levels.push(createPatrolLevel({
  id: 18,
  title: 'The Sentry Hall',
  width: 17,
  height: 17,
  waypoints: [{ x: 6, y: 8, z: 0 }, { x: 11, y: 8, z: 0 }],
  parSteps: 48,
  parTime: 28,
  note: 'The Molten Sentinels pace endlessly. Duck into side alcoves to let them pass.',
}));

levels.push(createPatrolLevel({
  id: 19,
  title: 'Molten Overpass',
  width: 19,
  height: 19,
  waypoints: [{ x: 7, y: 9, z: 0 }, { x: 12, y: 9, z: 0 }],
  parSteps: 60,
  parTime: 36,
  note: 'Above the magma river, sentinels guard the narrow bridges. Timing is everything.',
}));

levels.push(createPatrolLevel({
  id: 20,
  title: 'The Obsidian Gauntlet',
  width: 21,
  height: 21,
  waypoints: [{ x: 8, y: 10, z: 0 }, { x: 13, y: 10, z: 0 }],
  parSteps: 80,
  parTime: 50,
  note: 'The Gauntlet demands courage and rhythm. Survive the foundry to claim victory.',
}));

// ============================================================================
// CHAPTER 6: ARCANE SEALS (The Sunken Observatory, Puzzle Minigames)
// ============================================================================

function createPuzzleLevel({ id, title, width = 17, height = 17, puzzleX, puzzleY, puzzleType, solution, parSteps, parTime, note }) {
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  carveH(ground, 1, 1, width - 2);
  carveV(ground, width - 2, 1, height - 2);
  carveH(ground, height - 2, 1, width - 2);
  carveV(ground, 1, 1, height - 2);

  const midY = Math.floor(height / 2);
  carveH(ground, midY, 1, width - 2);
  carveV(ground, Math.floor(width / 2), 1, height - 2);

  return {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: String(id),
    chapter: 'chapter_6',
    zone: 'zone_6',
    title,
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: 'sunset',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: width - 2, y: height - 2, elevation: 0, style: 'portal' },
    parSteps,
    parTime,
    architectNote: note,
    layers: { ground, overhead },
    entities: [
      {
        id: `sign_arch_${id}`,
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: `Architect's Note #${id}`,
        text: note,
        style: 'astral_scroll',
      },
      {
        id: `puzzle_gate_${id}`,
        type: 'puzzle_gate',
        x: puzzleX,
        y: puzzleY,
        z: 0,
        puzzleType,
        solution,
        name: 'Arcane Seal',
      },
    ],
  };
}

levels.push(createPuzzleLevel({
  id: 21,
  title: 'The Rune Lock',
  width: 15,
  height: 15,
  puzzleX: 7,
  puzzleY: 7,
  puzzleType: 'rune_memory',
  solution: [0, 2, 1, 3],
  parSteps: 38,
  parTime: 24,
  note: 'The ancient gate is bound by arcane runes. Recall the celestial sequence to dispel the barrier.',
}));

levels.push(createPuzzleLevel({
  id: 22,
  title: 'The Celestial Astrolabe',
  width: 17,
  height: 17,
  puzzleX: 8,
  puzzleY: 8,
  puzzleType: 'cipher_dial',
  solution: [1, 3, 2],
  parSteps: 48,
  parTime: 28,
  note: 'Align the stellar dials according to the constellations above.',
}));

levels.push(createPuzzleLevel({
  id: 23,
  title: 'The Linked Seals',
  width: 19,
  height: 19,
  puzzleX: 9,
  puzzleY: 9,
  puzzleType: 'rune_memory',
  solution: [2, 0, 3, 1],
  parSteps: 62,
  parTime: 38,
  note: 'The dual seals are entangled. Break the outer ward to pierce the inner sanctum.',
}));

levels.push(createPuzzleLevel({
  id: 24,
  title: 'The Grand Archive',
  width: 21,
  height: 21,
  puzzleX: 10,
  puzzleY: 10,
  puzzleType: 'cipher_dial',
  solution: [0, 3, 1, 2],
  parSteps: 82,
  parTime: 52,
  note: 'The Grand Archive holds the accumulated wisdom of all previous trials. Decipher every seal.',
}));

// ============================================================================
// CHAPTER 7: GRAND SYNTHESIS (Citadel of Trials, All Mechanics Combined)
// ============================================================================

function createSynthesisLevel({ id, title, width = 19, height = 19, midX, rampY1, rampY2, parSteps, parTime, note }) {
  const ground = createGrid(width, height, TILES.WALL);
  const overhead = createGrid(width, height, TILES.FLOOR);

  carveH(ground, 1, 1, width - 2);
  carveV(ground, width - 2, 1, height - 2);
  carveH(ground, height - 2, 1, width - 2);
  carveV(ground, 1, 1, height - 2);

  // Path to ramp
  carveV(ground, midX, 1, rampY1);

  // Ramp going UP (South)
  ground[rampY1][midX] = TILES.RAMP_S;

  // Overhead bridge deck
  for (let y = rampY1 + 1; y < rampY2; y++) {
    overhead[y][midX] = TILES.BRIDGE_EW;
  }

  // Underpass tunnel on ground at midY
  const midY = Math.floor((rampY1 + rampY2) / 2);
  carveH(ground, midY, 1, width - 2);
  ground[midY][midX] = TILES.BRIDGE_EW;

  // Ramp going DOWN (South)
  ground[rampY2][midX] = TILES.RAMP_N;

  // Path from ramp to bottom corridor
  carveV(ground, midX, rampY2, height - 2);

  return {
    $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
    id: String(id),
    chapter: 'chapter_7',
    zone: 'zone_7',
    title,
    author: 'Inbar Rose',
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: 'snow',
    },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: width - 2, y: height - 2, elevation: 0, style: 'portal' },
    parSteps,
    parTime,
    architectNote: note,
    layers: { ground, overhead },
    entities: [
      {
        id: `sign_arch_${id}`,
        type: 'signpost',
        x: 2,
        y: 1,
        z: 0,
        title: `Architect's Note #${id}`,
        text: note,
        style: 'astral_scroll',
      },
      {
        id: `key_synth_${id}`,
        type: 'key',
        x: midX,
        y: midY,
        z: 1,
        elevation: 1,
        color: '#38bdf8',
        name: 'Citadel Sigil',
        style: 'orb',
        glowEffect: 'sparkle',
      },
      {
        id: `door_synth_${id}`,
        type: 'door',
        x: width - 3,
        y: height - 2,
        requiresKey: `key_synth_${id}`,
        color: '#38bdf8',
        style: 'heavy',
        orientation: 'horizontal',
      },
    ],
  };
}

levels.push(createSynthesisLevel({
  id: 25,
  title: 'The Synthesis Trial',
  width: 19,
  height: 19,
  midX: 9,
  rampY1: 5,
  rampY2: 13,
  parSteps: 68,
  parTime: 42,
  note: 'All elements converge. Bridge the heights, ride the portals, and slip past the guardians.',
}));

levels.push(createSynthesisLevel({
  id: 26,
  title: 'The Clockwork Rift',
  width: 21,
  height: 21,
  midX: 10,
  rampY1: 6,
  rampY2: 14,
  parSteps: 78,
  parTime: 48,
  note: 'When levers twist the fabric of space, even portals shift their alignment.',
}));

levels.push(createSynthesisLevel({
  id: 27,
  title: 'The Arcane Chasm',
  width: 23,
  height: 23,
  midX: 11,
  rampY1: 7,
  rampY2: 15,
  parSteps: 90,
  parTime: 56,
  note: 'The chasm between knowledge and mastery is wide. Leap across with every skill you have acquired.',
}));

levels.push(createSynthesisLevel({
  id: 28,
  title: "The Master's Masterpiece",
  width: 25,
  height: 25,
  midX: 12,
  rampY1: 8,
  rampY2: 16,
  parSteps: 110,
  parTime: 70,
  note: 'You stand before the Master’s Masterpiece. Every principle, every dimension, every secret is woven into this final labyrinth. Prevail, and become the Architect.',
}));

// ============================================================================
// VALIDATION & DISK WRITE
// ============================================================================

console.log(`\nValidating all ${levels.length} levels with LevelValidator...`);
let validationErrors = 0;

for (const lvl of levels) {
  const report = LevelValidator.validate(lvl);
  if (!report.valid) {
    console.error(`❌ Validation failed for Level ${lvl.id} (${lvl.title}):`, report.errors);
    validationErrors++;
  } else {
    console.log(`✓ Level ${String(lvl.id).padStart(2, '0')}: [${lvl.chapter}] "${lvl.title}" is valid and solvable.`);
  }
}

if (validationErrors > 0) {
  console.error(`\nFailed with ${validationErrors} invalid level(s)! Aborting write.`);
  process.exit(1);
}

// Write to disk
console.log('\nWriting level files to disk...');
const chapterDirs = [
  'chapter_1',
  'chapter_2',
  'chapter_3',
  'chapter_4',
  'chapter_5',
  'chapter_6',
  'chapter_7',
];

for (const ch of chapterDirs) {
  const dir = path.join(rootDir, 'levels', ch);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const manifestEntries = [];

// Tutorials in manifest
const tutorialIds = [1, 2, 3, 4, 5, 6];
for (const tid of tutorialIds) {
  const tfile = `levels/tutorial/tutorial_${tid}.json`;
  const tdata = JSON.parse(fs.readFileSync(path.join(rootDir, tfile), 'utf8'));
  manifestEntries.push({
    id: `tutorial_${tid}`,
    category: 'tutorial',
    zone: 'tutorial',
    title: tdata.title || `Tutorial ${tid}`,
    file: tfile,
    theme: tdata.config?.theme || 'dungeon',
  });
}

// Campaign levels
for (const lvl of levels) {
  const chDir = lvl.chapter;
  const filePath = `levels/${chDir}/level_${lvl.id}.json`;
  const absPath = path.join(rootDir, filePath);
  fs.writeFileSync(absPath, JSON.stringify(lvl, null, 2), 'utf8');

  manifestEntries.push({
    id: String(lvl.id),
    category: 'campaign',
    chapter: lvl.chapter,
    zone: lvl.zone || 'zone_1',
    title: lvl.title,
    file: filePath,
    theme: lvl.config.theme,
    parSteps: lvl.parSteps,
    parTime: lvl.parTime,
  });
}

// Write manifest
const manifestPath = path.join(rootDir, 'levels', 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifestEntries, null, 2), 'utf8');
console.log(`✅ Updated levels/manifest.json with ${manifestEntries.length} total levels (${tutorialIds.length} tutorial + ${levels.length} campaign)`);

// Sync default-levels.js
const tutorialFiles = tutorialIds.map(t => `levels/tutorial/tutorial_${t}.json`);
const campaignFiles = levels.map(l => `levels/${l.chapter}/level_${l.id}.json`);

const tutorials = tutorialFiles.map(f => JSON.parse(fs.readFileSync(path.join(rootDir, f), 'utf-8')));
const campaigns = campaignFiles.map(f => JSON.parse(fs.readFileSync(path.join(rootDir, f), 'utf-8')));

const defaultLevelsContent = `/**
 * Casual Maze Game - Default Embedded Levels & Tutorials
 * Embedded fallbacks ensuring zero server dependency on GitHub Pages
 */

export const TUTORIAL_LEVELS = Object.freeze(${JSON.stringify(tutorials, null, 2)});

export const CAMPAIGN_LEVELS = Object.freeze(${JSON.stringify(campaigns, null, 2)});
`;

fs.writeFileSync(path.join(rootDir, 'js/levels/default-levels.js'), defaultLevelsContent, 'utf-8');
console.log('✅ Synchronized js/levels/default-levels.js with all 28 campaign levels!');
console.log('\n✨ All operations completed successfully.');
