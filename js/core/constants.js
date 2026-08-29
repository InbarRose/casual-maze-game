/**
 * Casual Maze Game - Constants & Enumerations
 */

export const TILES = Object.freeze({
  FLOOR: 0,
  WALL: 1,
  BRIDGE_EW: 'B_EW',
  BRIDGE_NS: 'B_NS',
  RAMP_N: 'R_N',
  RAMP_S: 'R_S',
  RAMP_E: 'R_E',
  RAMP_W: 'R_W',
});

export const ENTITY_TYPES = Object.freeze({
  KEY: 'key',
  DOOR: 'door',
  LEVER: 'lever',
});

export const LAYERS = Object.freeze({
  GROUND: 'ground',
  OVERHEAD: 'overhead',
});

export const ELEVATION = Object.freeze({
  GROUND: 0,
  OVERHEAD: 1,
});

export const FOG_STATE = Object.freeze({
  UNEXPLORED: 0,
  EXPLORED: 1,
  VISIBLE: 2,
});

export const DIRECTIONS = Object.freeze({
  NORTH: { x: 0, y: -1, name: 'north' },
  SOUTH: { x: 0, y: 1, name: 'south' },
  WEST: { x: -1, y: 0, name: 'west' },
  EAST: { x: 1, y: 0, name: 'east' },
});

export const OPPOSITE_DIRECTIONS = Object.freeze({
  north: 'south',
  south: 'north',
  west: 'east',
  east: 'west',
});

export const KEY_CODES = Object.freeze({
  UP: ['ArrowUp', 'KeyW', 'KeyK', 'w', 'W', 'k', 'K', 'Up'],
  DOWN: ['ArrowDown', 'KeyS', 'KeyJ', 's', 'S', 'j', 'J', 'Down'],
  LEFT: ['ArrowLeft', 'KeyA', 'KeyH', 'a', 'A', 'h', 'H', 'Left'],
  RIGHT: ['ArrowRight', 'KeyD', 'KeyL', 'd', 'D', 'l', 'L', 'Right'],
  INTERACT: ['Space', 'KeyE', 'Enter', 'e', 'E', ' ', 'Enter'],
  MAP: ['KeyM', 'm', 'M'],
  RESTART: ['KeyR', 'r', 'R'],
  PAUSE: ['Escape', 'KeyP', 'p', 'P', 'Esc'],
});

export const DEFAULTS = Object.freeze({
  TILE_SIZE: 32,
  VIEW_RADIUS: 6,
  FOG_OF_WAR: true,
  ALLOW_FREE_PAN: true,
  CAMERA_LERP: 0.12,
  PLAYER_SPEED: 4.8, // tiles per second during smooth walk
  MINIMAP_SIZE: 180,
  THEME: 'dungeon',
});

export const THEMES = Object.freeze({
  dungeon: {
    name: 'Dungeon',
    bg: '#0d1117',
    floor: '#161b22',
    floorAlt: '#1c2128',
    wall: '#30363d',
    wallTop: '#484f58',
    bridgeGround: '#1e293b',
    bridgeOverhead: '#475569',
    bridgeRailing: '#94a3b8',
    ramp: '#334155',
    accent: '#38bdf8',
    fogUnexplored: '#05070a',
    fogMemory: 'rgba(5, 7, 10, 0.65)',
  },
  emerald: {
    name: 'Emerald Cavern',
    bg: '#061a14',
    floor: '#0b2920',
    floorAlt: '#0e3328',
    wall: '#134e3f',
    wallTop: '#10b981',
    bridgeGround: '#064e3b',
    bridgeOverhead: '#047857',
    bridgeRailing: '#34d399',
    ramp: '#0f766e',
    accent: '#10b981',
    fogUnexplored: '#020b08',
    fogMemory: 'rgba(2, 11, 8, 0.65)',
  },
  sunset: {
    name: 'Sunset Citadel',
    bg: '#180e15',
    floor: '#2a1622',
    floorAlt: '#351c2b',
    wall: '#632541',
    wallTop: '#be185d',
    bridgeGround: '#4a152d',
    bridgeOverhead: '#831843',
    bridgeRailing: '#f472b6',
    ramp: '#701a75',
    accent: '#f43f5e',
    fogUnexplored: '#0c070b',
    fogMemory: 'rgba(12, 7, 11, 0.65)',
  },
});
