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
  TELEPORTER: 'teleporter',
  HAZARD: 'hazard',
  PATROLLER: 'patroller',
  PUZZLE_GATE: 'puzzle_gate',
  SIGNPOST: 'signpost',
  WALL_DECOR: 'wall_decor',
  CHECKPOINT: 'checkpoint',
  COLLECTIBLE: 'collectible',
  PEDESTAL: 'pedestal',
  RIDDLE_ITEM: 'riddle_item',
});

export const RIDDLE_ITEM_STYLES = Object.freeze([
  { id: 'statue_falcon', type: 'statue', icon: '🦅', label: 'Falcon Statue', desc: 'Carved obsidian falcon of the eastern dawn' },
  { id: 'statue_serpent', type: 'statue', icon: '🐍', label: 'Serpent Statue', desc: 'Emerald serpent coiled toward northern depths' },
  { id: 'statue_lion', type: 'statue', icon: '🦁', label: 'Lion Statue', desc: 'Gilded lion standing guard at the southern sun' },
  { id: 'statue_dragon', type: 'statue', icon: '🐉', label: 'Dragon Statue', desc: 'Ancient sapphire dragon watching western winds' },
  { id: 'orb_fire', type: 'orb', icon: '🔥', label: 'Flame Orb', desc: 'Ever-burning cinder sphere pulsating with magma heat' },
  { id: 'orb_water', type: 'orb', icon: '💧', label: 'Tide Orb', desc: 'Cerulean pearl resonating with oceanic currents' },
  { id: 'orb_earth', type: 'orb', icon: '🌿', label: 'Flora Orb', desc: 'Jade sphere entwined with living verdant roots' },
  { id: 'orb_air', type: 'orb', icon: '💨', label: 'Gale Orb', desc: 'Swirling zephyr prism crackling with static wind' },
  { id: 'rune_sun', type: 'rune', icon: '☀️', label: 'Solar Runestone', desc: 'Radiant golden slate inscribed with daylight glyphs' },
  { id: 'rune_moon', type: 'rune', icon: '🌙', label: 'Lunar Runestone', desc: 'Silver slate reflecting calm nocturnal phases' },
  { id: 'rune_star', type: 'rune', icon: '✨', label: 'Astral Runestone', desc: 'Twinkling indigo slate charting celestial orbits' },
]);

export const PEDESTAL_STYLES = Object.freeze([
  { id: 'plinth_stone', icon: '🏛️', label: 'Carved Plinth', desc: 'Ancient fluted stone pedestal with rune-etched socket' },
  { id: 'altar_shrine', icon: '⛩️', label: 'Altar Shrine', desc: 'Ceremonial shrine adorned with divine sigils' },
  { id: 'pillar_crystal', icon: '💎', label: 'Crystal Pillar', desc: 'Resonating geometric prism socket for elemental orbs' },
]);

export const VIEW_PERSPECTIVES = Object.freeze({
  ANGLED: 'angled',
  TOPDOWN: 'topdown',
});

export const ROTATION_ANGLES = Object.freeze([0, 90, 180, 270]);

export const ROTATION_COMPASS = Object.freeze({
  0: Object.freeze({ angle: 0, heading: 'N', label: 'North' }),
  90: Object.freeze({ angle: 90, heading: 'E', label: 'East' }),
  180: Object.freeze({ angle: 180, heading: 'S', label: 'South' }),
  270: Object.freeze({ angle: 270, heading: 'W', label: 'West' }),
});

/**
 * Screen-relative input translation to world grid delta based on camera angle (0, 90, 180, 270)
 * Pressing Up always moves screen-upward.
 */
export const SCREEN_TO_WORLD_DELTAS = Object.freeze({
  0: Object.freeze({
    UP: Object.freeze({ dx: 0, dy: -1 }),
    DOWN: Object.freeze({ dx: 0, dy: 1 }),
    LEFT: Object.freeze({ dx: -1, dy: 0 }),
    RIGHT: Object.freeze({ dx: 1, dy: 0 }),
  }),
  90: Object.freeze({
    UP: Object.freeze({ dx: 1, dy: 0 }),
    DOWN: Object.freeze({ dx: -1, dy: 0 }),
    LEFT: Object.freeze({ dx: 0, dy: -1 }),
    RIGHT: Object.freeze({ dx: 0, dy: 1 }),
  }),
  180: Object.freeze({
    UP: Object.freeze({ dx: 0, dy: 1 }),
    DOWN: Object.freeze({ dx: 0, dy: -1 }),
    LEFT: Object.freeze({ dx: 1, dy: 0 }),
    RIGHT: Object.freeze({ dx: -1, dy: 0 }),
  }),
  270: Object.freeze({
    UP: Object.freeze({ dx: -1, dy: 0 }),
    DOWN: Object.freeze({ dx: 1, dy: 0 }),
    LEFT: Object.freeze({ dx: 0, dy: 1 }),
    RIGHT: Object.freeze({ dx: 0, dy: -1 }),
  }),
});

export const PUZZLE_TYPES = Object.freeze({
  RUNE_MEMORY: 'rune_memory',
  CIPHER_DIAL: 'cipher_dial',
});

export const TELEPORTER_STYLES = Object.freeze([
  { id: 'vortex', icon: '🌀', label: 'Dimensional Vortex', desc: 'Swirling celestial rift that warps across space' },
  { id: 'runic_circle', icon: '🔯', label: 'Runic Teleport Circle', desc: 'Ancient arcane circle glowing on the floor' },
  { id: 'techno_pad', icon: '⚡', label: 'Quantum Warp Pad', desc: 'High-energy matter transmission pad' },
  { id: 'crystal_well', icon: '💠', label: 'Resonance Well', desc: 'Subterranean crystal spring warping between elevations' },
]);

export const HAZARD_STYLES = Object.freeze([
  { id: 'spikes', icon: '🗡️', label: 'Floor Spikes', desc: 'Retracting lethal metal floor spikes' },
  { id: 'fire_jet', icon: '🔥', label: 'Flame Vent', desc: 'Periodic bursts of molten volcanic fire' },
  { id: 'sentinel', icon: '👁️', label: 'Clockwork Sentinel', desc: 'Autonomous patrolling dungeon guardian' },
  { id: 'boulder', icon: '🪨', label: 'Rolling Boulder', desc: 'Heavy kinetic stone moving back and forth' },
]);

export const PUZZLE_GATE_STYLES = Object.freeze([
  { id: 'rune_memory', icon: '🔮', label: 'Rune Memory Seal', desc: 'Requires memorizing and repeating an illuminated 4-rune sequence' },
  { id: 'cipher_dial', icon: '🔐', label: 'Cipher Dial Barrier', desc: 'Requires aligning concentric runic dials to decipher the clue' },
]);

export const SIGNPOST_STYLES = Object.freeze([
  { id: 'stone_tablet', icon: '🪨', label: 'Stone Tablet', desc: 'Carved obsidian tablet bearing ancient inscriptions' },
  { id: 'wooden_sign', icon: '🪵', label: 'Wooden Signpost', desc: 'Charming weathered wooden marker left by a previous explorer' },
  { id: 'astral_scroll', icon: '📜', label: 'Arcane Scroll', desc: "Illuminated parchment glowing with the Architect's notes" },
]);

export const WALL_DECOR_TYPES = Object.freeze([
  { id: 'note', icon: '📝', label: 'Scrawled Note', desc: 'Pinned parchment note with handwritten clues or warnings' },
  { id: 'painting', icon: '🖼️', label: 'Framed Painting', desc: 'Ornate framed oil canvas depicting atmospheric landscapes' },
  { id: 'fresco', icon: '🏛️', label: 'Ancient Fresco', desc: 'Vibrant mural painted directly onto stone plaster' },
  { id: 'carving', icon: '🗿', label: 'Stone Bas-Relief', desc: 'Chiseled masonry relief carved into the labyrinth wall' },
  { id: 'tapestry', icon: '🚩', label: 'Royal Tapestry', desc: 'Weathered woven banner hanging from wall sconces' },
]);

export const CHECKPOINT_STYLES = Object.freeze([
  { id: 'shrine', icon: '⛩️', label: 'Waypoint Shrine', desc: 'Ancient stone sanctuary glowing with azure flame' },
  { id: 'crystal_beacon', icon: '💎', label: 'Resonance Beacon', desc: 'Floating resonant crystal marking a safe waypoint' },
  { id: 'runic_hearth', icon: '🔥', label: 'Runic Hearth', desc: 'Warm stone brazier hearth that rekindles the explorer' },
  { id: 'brazier', icon: '🏮', label: 'Bronze Brazier', desc: 'Ceremonial brazier with illuminating spirit flame' },
]);

export const COLLECTIBLE_TYPES = Object.freeze([
  { id: 'gem', icon: '💎', label: 'Gemstone', defaultScore: 100, desc: 'Brilliant faceted gem granting bonus score points' },
  { id: 'coin', icon: '🪙', label: 'Ancient Coin', defaultScore: 50, desc: 'Rare antique minted coin' },
  { id: 'relic', icon: '👑', label: 'Golden Relic', defaultScore: 300, desc: 'Precious ceremonial artifact' },
  { id: 'torch', icon: '🔥', label: 'Adventurer Torch', defaultScore: 25, isCarriable: true, desc: 'Illuminates dark halls and expands line of sight' },
]);

export const MEDAL_TYPES = Object.freeze({
  COMPLETION: 'completion',
  PAR_STEPS: 'par_steps',
  PAR_TIME: 'par_time',
  FLAWLESS: 'flawless',
});

export const CAMPAIGN_CHAPTERS = Object.freeze([
  {
    id: 'chapter_1',
    number: 1,
    title: 'The Foundation',
    subtitle: 'Ancient Stone Vaults',
    theme: 'dungeon',
    icon: '🏰',
    description: 'Master spatial navigation, dynamic line of sight, and fundamental key/door mechanics.',
    mechanic: 'Orientation & Keys',
    levelCount: 4,
  },
  {
    id: 'chapter_2',
    number: 2,
    title: 'The Vertical Dimension',
    subtitle: 'Emerald Treetop Canopies',
    theme: 'jungle',
    icon: '🌴',
    description: 'Ascend directional ramps, cross elevated bridges, and navigate multi-layer crossings.',
    mechanic: '3D Bridges & Ramps',
    levelCount: 4,
  },
  {
    id: 'chapter_3',
    number: 3,
    title: 'Shifting Architecture',
    subtitle: 'Sunken Clockwork Crypts',
    theme: 'temple',
    icon: '🏛️',
    description: 'Engage clockwork levers to dynamically mutate wall barriers and invert pathways.',
    mechanic: 'Modulating Levers',
    levelCount: 4,
  },
  {
    id: 'chapter_4',
    number: 4,
    title: 'Astral Anomalies',
    subtitle: 'Resonant Crystal Caverns',
    theme: 'cave',
    icon: '💠',
    description: 'Step into dimensional portals warping across disconnected chambers and elevations.',
    mechanic: 'Teleportation Rifts',
    levelCount: 4,
  },
  {
    id: 'chapter_5',
    number: 5,
    title: 'Rhythm & Danger',
    subtitle: 'Molten Core Foundry',
    theme: 'lava',
    icon: '🌋',
    description: 'Dodge cyclical flame vents and sneak past continuous waypoint sentry patrols.',
    mechanic: 'Hazards & Patrollers',
    levelCount: 4,
  },
  {
    id: 'chapter_6',
    number: 6,
    title: 'Arcane Seals',
    subtitle: 'The Sunken Observatory',
    theme: 'sunset',
    icon: '🔮',
    description: 'Decipher celestial cipher dials and repeat memory rune sequences to pass arcane gates.',
    mechanic: 'Puzzle Minigames',
    levelCount: 4,
  },
  {
    id: 'chapter_7',
    number: 7,
    title: 'Grand Synthesis',
    subtitle: 'Citadel of Trials',
    theme: 'snow',
    icon: '⭐',
    description: 'The ultimate synthesis of 3D geometry, warps, levers, sentries, and cryptic puzzles.',
    mechanic: 'Master Megalabyrinths',
    levelCount: 4,
  },
  {
    id: 'chapter_8',
    number: 8,
    title: 'The Shifting Monolith',
    subtitle: 'The Prism of Perspectives',
    theme: 'dungeon',
    icon: '🧭',
    description: 'Rotate the world perspective 90 degrees to discover occluded underpasses, read cardinal inscriptions, and solve multi-room trials.',
    mechanic: 'World Rotation & Branching',
    levelCount: 4,
  },
]);

export const LAYERS = Object.freeze({
  GROUND: 'ground',
  OVERHEAD: 'overhead',
});

export const ELEVATION = Object.freeze({
  BASEMENT: -1,
  GROUND: 0,
  OVERHEAD: 1,
});

/**
 * Formats 3D (X, Y, Z) coordinates as a canonical string: (X, Y, Z)
 * @param {number} x
 * @param {number} y
 * @param {number} [z=0]
 * @returns {string} E.g. "(5, 6, 0)"
 */
export function formatXYZ(x, y, z = 0) {
  return `(${x}, ${y}, ${z ?? 0})`;
}

/**
 * Returns user-facing label for a given Z elevation level
 * @param {number} [z=0]
 * @returns {string} E.g. "Ground (Z=0)", "Overhead (Z=1)", "Basement (Z=-1)"
 */
export function getElevationLabel(z = 0) {
  const zNum = Number(z) || 0;
  if (zNum === ELEVATION.GROUND) return 'Ground (Z=0)';
  if (zNum === ELEVATION.OVERHEAD) return 'Overhead (Z=1)';
  if (zNum === ELEVATION.BASEMENT) return 'Basement (Z=-1)';
  return `Level Z=${zNum}`;
}


export const ENTRANCE_STYLES = Object.freeze({
  STAIRS_DOWN: 'stairs_down',
  PORTAL: 'portal',
  ARCHWAY: 'archway',
  DEFAULT: 'default',
});

export const EXIT_STYLES = Object.freeze({
  STAIRS_UP: 'stairs_up',
  PORTAL: 'portal',
  ARCHWAY: 'archway',
  DEFAULT: 'default',
});

export const KEY_STYLES = Object.freeze([
  { id: 'classic', icon: '🔑', label: 'Classic Key', desc: 'Standard notched key with gemstone bow' },
  { id: 'ornate', icon: '🗝️', label: 'Ornate Skeleton Key', desc: 'Antique forged skeleton key' },
  { id: 'crystal', icon: '💎', label: 'Elemental Crystal', desc: 'Glowing mineral crystal shard' },
  { id: 'orb', icon: '🔮', label: 'Arcane Orb', desc: 'Luminous magical sphere' },
  { id: 'relic', icon: '👑', label: 'Royal Relic', desc: 'Golden imperial crown relic' },
  { id: 'skull', icon: '💀', label: 'Crypt Rune Token', desc: 'Ancient bone crypt token' },
]);

export const DOOR_STYLES = Object.freeze([
  { id: 'classic', icon: '🚪', label: 'Reinforced Gate', desc: 'Ironbound wooden doorway with central keyhole' },
  { id: 'portcullis', icon: '🏰', label: 'Spiked Portcullis', desc: 'Heavy iron grid gate with defensive spikes' },
  { id: 'laser_barrier', icon: '⚡', label: 'Energy Barrier', desc: 'Pulsing electromagnetic forcefield' },
  { id: 'magic_seal', icon: '🔯', label: 'Arcane Rune Seal', desc: 'Glowing mystic rune barrier' },
  { id: 'crystal_spikes', icon: '💠', label: 'Crystal Spikes', desc: 'Faceted crystalline obstruction' },
  { id: 'vault_hatch', icon: '🔒', label: 'Vault Bulkhead', desc: 'Heavy mechanical airtight door' },
]);

export const LEVER_STYLES = Object.freeze([
  { id: 'switch_lever', icon: '🕹️', label: 'Floor Lever', desc: 'Mechanical toggle handle with ON/OFF LED' },
  { id: 'pressure_pedestal', icon: '🔘', label: 'Stone Pedestal', desc: 'Carved pressure switch pedestal' },
  { id: 'crystal_switch', icon: '🔮', label: 'Resonance Crystal', desc: 'Harmonic crystal switch that hums when active' },
  { id: 'runic_plate', icon: '📜', label: 'Runic Inscription', desc: 'Floor glyph that glows when triggered' },
  { id: 'cog_wheel', icon: '⚙️', label: 'Mechanical Valve', desc: 'Industrial steam valve crank wheel' },
]);

export const SPAWN_STYLE_PRESETS = Object.freeze([
  { id: 'stairs_down', icon: '🪜', label: 'Stairs Down', desc: 'Recessed stone steps descending into the labyrinth' },
  { id: 'portal', icon: '🌀', label: 'Summoning Rift', desc: 'Swirling dimensional portal' },
  { id: 'archway', icon: '🏛️', label: 'Stone Archway', desc: 'Ancient gateway threshold' },
  { id: 'pentagram', icon: '🔯', label: 'Runic Circle', desc: 'Glowing invocation circle' },
  { id: 'camp', icon: '⛺', label: 'Explorer Camp', desc: 'Starting basecamp' },
]);

export const EXIT_STYLE_PRESETS = Object.freeze([
  { id: 'portal', icon: '🌀', label: 'Cosmic Portal', desc: 'Swirling celestial gateway' },
  { id: 'stairs_up', icon: '🪜', label: 'Daylight Ascent', desc: 'Ascending staircase with golden sunbeams' },
  { id: 'archway', icon: '🏛️', label: 'Exit Archway', desc: 'Luminous sanctuary threshold' },
  { id: 'chest', icon: '🎁', label: 'Treasure Vault', desc: 'Golden reward chest exit' },
  { id: 'shrine', icon: '⛩️', label: 'Sacred Shrine', desc: 'Ancient victory shrine' },
]);

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
  VIEW_MODE: ['KeyV', 'v', 'V'],
});

export const KEY_COLORS = Object.freeze({
  GOLD: '#fbbf24',
  RED: '#f43f5e',
  BLUE: '#38bdf8',
  GREEN: '#34d399',
  PURPLE: '#a855f7',
});

export const KEY_COLOR_PRESETS = Object.freeze([
  { id: 'gold', name: 'Golden Key', color: '#fbbf24', label: 'Gold' },
  { id: 'red', name: 'Ruby Key', color: '#f43f5e', label: 'Ruby (Red)' },
  { id: 'blue', name: 'Sapphire Key', color: '#38bdf8', label: 'Sapphire (Blue)' },
  { id: 'green', name: 'Emerald Key', color: '#34d399', label: 'Emerald (Green)' },
  { id: 'purple', name: 'Amethyst Key', color: '#a855f7', label: 'Amethyst (Purple)' },
]);

export const LEVER_TILE_OPTIONS = Object.freeze([
  { value: 0, label: 'Floor (Open / Walkable)' },
  { value: 1, label: 'Wall (Solid Barrier)' },
  { value: 'B_EW', label: 'Bridge EW' },
  { value: 'B_NS', label: 'Bridge NS' },
  { value: 'R_N', label: 'Ramp North' },
  { value: 'R_S', label: 'Ramp South' },
  { value: 'R_E', label: 'Ramp East' },
  { value: 'R_W', label: 'Ramp West' },
]);

export const DEFAULTS = Object.freeze({
  TILE_SIZE: 32,
  VIEW_RADIUS: 6,
  FOG_OF_WAR: true,
  MAP_REVEALED: false,
  ALLOW_FREE_PAN: true,
  CAMERA_LERP: 0.12,
  PLAYER_SPEED: 4.8, // tiles per second during smooth walk
  MINIMAP_SIZE: 180,
  THEME: 'dungeon',
  VIEW_PERSPECTIVE: 'angled',
});

export const THEMES = Object.freeze({
  dungeon: {
    id: 'dungeon',
    name: 'Dungeon',
    icon: '🏰',
    bg: '#0d1117',
    floor: '#161b22',
    floorAlt: '#1c2128',
    floorGrid: 'rgba(255, 255, 255, 0.03)',
    wall: '#30363d',
    wallTop: '#484f58',
    wallDetail: '#21262d',
    bridgeGround: '#1e293b',
    bridgeOverhead: '#475569',
    bridgeRailing: '#94a3b8',
    ramp: '#334155',
    rampArrow: '#38bdf8',
    accent: '#38bdf8',
    portalOuter: '#0284c7',
    portalInner: '#38bdf8',
    fogUnexplored: '#05070a',
    fogMemory: 'rgba(5, 7, 10, 0.65)',
  },
  jungle: {
    id: 'jungle',
    name: 'Emerald Jungle',
    icon: '🌴',
    bg: '#051811',
    floor: '#0b291d',
    floorAlt: '#0f3827',
    floorGrid: 'rgba(52, 211, 153, 0.04)',
    wall: '#14532d',
    wallTop: '#22c55e',
    wallDetail: '#166534',
    bridgeGround: '#3f2e18',
    bridgeOverhead: '#78350f',
    bridgeRailing: '#34d399',
    ramp: '#15803d',
    rampArrow: '#4ade80',
    accent: '#10b981',
    portalOuter: '#059669',
    portalInner: '#34d399',
    fogUnexplored: '#020b08',
    fogMemory: 'rgba(2, 11, 8, 0.65)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Cavern',
    icon: '🌴',
    bg: '#051811',
    floor: '#0b291d',
    floorAlt: '#0f3827',
    floorGrid: 'rgba(52, 211, 153, 0.04)',
    wall: '#14532d',
    wallTop: '#22c55e',
    wallDetail: '#166534',
    bridgeGround: '#3f2e18',
    bridgeOverhead: '#78350f',
    bridgeRailing: '#34d399',
    ramp: '#15803d',
    rampArrow: '#4ade80',
    accent: '#10b981',
    portalOuter: '#059669',
    portalInner: '#34d399',
    fogUnexplored: '#020b08',
    fogMemory: 'rgba(2, 11, 8, 0.65)',
  },
  lava: {
    id: 'lava',
    name: 'Molten Core',
    icon: '🌋',
    bg: '#1c0a06',
    floor: '#2a110a',
    floorAlt: '#38160c',
    floorGrid: 'rgba(249, 115, 22, 0.05)',
    wall: '#451a03',
    wallTop: '#ea580c',
    wallDetail: '#7c2d12',
    bridgeGround: '#1c1917',
    bridgeOverhead: '#292524',
    bridgeRailing: '#f97316',
    ramp: '#7c2d12',
    rampArrow: '#fb923c',
    accent: '#f97316',
    portalOuter: '#dc2626',
    portalInner: '#f97316',
    fogUnexplored: '#0a0402',
    fogMemory: 'rgba(10, 4, 2, 0.65)',
  },
  snow: {
    id: 'snow',
    name: 'Glacial Expanse',
    icon: '❄️',
    bg: '#08141e',
    floor: '#0e2333',
    floorAlt: '#132f45',
    floorGrid: 'rgba(56, 189, 248, 0.05)',
    wall: '#1e3a5f',
    wallTop: '#38bdf8',
    wallDetail: '#0284c7',
    bridgeGround: '#0c1e2e',
    bridgeOverhead: '#1e40af',
    bridgeRailing: '#93c5fd',
    ramp: '#0369a1',
    rampArrow: '#67e8f9',
    accent: '#06b6d4',
    portalOuter: '#0284c7',
    portalInner: '#67e8f9',
    fogUnexplored: '#040b12',
    fogMemory: 'rgba(4, 11, 18, 0.65)',
  },
  cave: {
    id: 'cave',
    name: 'Amethyst Caverns',
    icon: '🔮',
    bg: '#120b1e',
    floor: '#1f1333',
    floorAlt: '#291942',
    floorGrid: 'rgba(168, 85, 247, 0.05)',
    wall: '#4c1d95',
    wallTop: '#c084fc',
    wallDetail: '#581c87',
    bridgeGround: '#2e1065',
    bridgeOverhead: '#6b21a8',
    bridgeRailing: '#d8b4fe',
    ramp: '#581c87',
    rampArrow: '#e879f9',
    accent: '#a855f7',
    portalOuter: '#7e22ce',
    portalInner: '#d8b4fe',
    fogUnexplored: '#08040d',
    fogMemory: 'rgba(8, 4, 13, 0.65)',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Citadel',
    icon: '🌅',
    bg: '#180e15',
    floor: '#2a1622',
    floorAlt: '#351c2b',
    floorGrid: 'rgba(244, 63, 94, 0.04)',
    wall: '#632541',
    wallTop: '#f43f5e',
    wallDetail: '#831843',
    bridgeGround: '#4a152d',
    bridgeOverhead: '#831843',
    bridgeRailing: '#f472b6',
    ramp: '#701a75',
    rampArrow: '#fb7185',
    accent: '#f43f5e',
    portalOuter: '#be185d',
    portalInner: '#fb7185',
    fogUnexplored: '#0c070b',
    fogMemory: 'rgba(12, 7, 11, 0.65)',
  },
});

export const ZONES = Object.freeze({
  tutorial: {
    id: 'tutorial',
    title: 'Tutorial Academy',
    badge: '🎓 Academy',
    icon: '🎓',
    theme: 'dungeon',
    desc: 'Step-by-step training mastering movement, colored keys, mechanisms, bridges, and fog of war.',
  },
  zone_1: {
    id: 'zone_1',
    title: 'Zone 1: Whispering Dungeon',
    badge: '🏰 Tier 1',
    icon: '🏰',
    theme: 'dungeon',
    desc: 'Ancient stone labyrinth exploring multi-elevation crossings and lever-locked crypts.',
  },
  zone_2: {
    id: 'zone_2',
    title: 'Zone 2: Emerald Jungle',
    badge: '🌴 Tier 2',
    icon: '🌴',
    theme: 'jungle',
    desc: 'Lush canopy mazes with rope bridge walkways, dense foliage barriers, and multiple colored gates.',
  },
  zone_3: {
    id: 'zone_3',
    title: 'Zone 3: Molten Core',
    badge: '🌋 Tier 3',
    icon: '🌋',
    theme: 'lava',
    desc: 'Intense volcanic vaults with obsidian bridges spanning over magma channels and dynamic switch gates.',
  },
  zone_4: {
    id: 'zone_4',
    title: 'Zone 4: Glacial Expanse',
    badge: '❄️ Tier 4',
    icon: '❄️',
    theme: 'snow',
    desc: 'Chiseled frost caverns with slippery ice passages, crystal trestles, and shrouded blizzards.',
  },
  zone_5: {
    id: 'zone_5',
    title: 'Zone 5: Amethyst Caverns',
    badge: '🔮 Tier 5',
    icon: '🔮',
    theme: 'cave',
    desc: 'Bioluminescent deep subterranean ruins with multi-tier bridges and intricate key-lever sequences.',
  },
});
