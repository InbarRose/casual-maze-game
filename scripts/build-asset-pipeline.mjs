/**
 * Asset Pipeline Generator
 * Generates standalone SVG files for complete tilesets (Dungeon, Jungle, Magma, Temple, Glacial),
 * variable floor & wall tiles, directional doors & ramps, themed levers & keys,
 * 4-way directional player class sprites, and edge-wall entrance/exit passages.
 */

import fs from 'fs';
import path from 'path';

const dirs = [
  'assets',
  'assets/tiles/ground',
  'assets/tiles/bridges',
  'assets/tiles/ramps',
  'assets/tiles/variations',
  'assets/entities/keys',
  'assets/entities/doors',
  'assets/entities/levers',
  'assets/environment/spawn',
  'assets/environment/exit',
  'assets/environment/edge_passages',
  'assets/player',
  'assets/player/adventurer',
  'assets/player/knight',
  'assets/player/mage',
  'assets/player/rogue',
  'assets/ui',
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

export const ASSET_DEFINITIONS = [];

// Helper to push asset
function addAsset(def) {
  ASSET_DEFINITIONS.push(def);
}

// =========================================================================
// 1. COMPLETE TILESETS: DUNGEON, JUNGLE, MAGMA, TEMPLE, GLACIAL
// =========================================================================
const THEMES = [
  {
    id: 'dungeon',
    name: 'Whispering Dungeon',
    floor1: '#1e293b', floor2: '#0f172a', seam: '#334155', fleck: '#475569',
    wallTop: '#64748b', wallMid: '#334155', wallBot: '#0f172a', wallStroke: '#1e293b',
    accent: '#38bdf8', wood: '#78350f', woodDark: '#451a03',
  },
  {
    id: 'jungle',
    name: 'Emerald Overgrowth',
    floor1: '#14532d', floor2: '#052e16', seam: '#166534', fleck: '#22c55e',
    wallTop: '#15803d', wallMid: '#166534', wallBot: '#052e16', wallStroke: '#14532d',
    accent: '#34d399', wood: '#713f12', woodDark: '#3f2005',
  },
  {
    id: 'magma',
    name: 'Molten Chasm',
    floor1: '#450a0a', floor2: '#1c0404', seam: '#7f1d1d', fleck: '#ef4444',
    wallTop: '#7f1d1d', wallMid: '#450a0a', wallBot: '#1c0404', wallStroke: '#2d0606',
    accent: '#f97316', wood: '#451a03', woodDark: '#1c0701',
  },
  {
    id: 'temple',
    name: 'Sunken Temple',
    floor1: '#78350f', floor2: '#451a03', seam: '#92400e', fleck: '#fbbf24',
    wallTop: '#b45309', wallMid: '#78350f', wallBot: '#451a03', wallStroke: '#3a1402',
    accent: '#fbbf24', wood: '#92400e', woodDark: '#451a03',
  },
  {
    id: 'glacial',
    name: 'Glacial Expanse',
    floor1: '#0c4a6e', floor2: '#082f49', seam: '#0284c7', fleck: '#bae6fd',
    wallTop: '#38bdf8', wallMid: '#0284c7', wallBot: '#082f49', wallStroke: '#075985',
    accent: '#7dd3fc', wood: '#1e3a8a', woodDark: '#172554',
  }
];

for (const t of THEMES) {
  // A. Base Floor
  addAsset({
    id: `tile_floor_${t.id}`,
    name: `${t.name} Floor (Plain)`,
    type: 'tile',
    category: 'ground',
    style: t.id,
    path: `assets/tiles/ground/floor_${t.id}.svg`,
    description: `Standard stone floor paver for ${t.name} tileset`,
    tags: ['floor', t.id, 'ground', 'walkable'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="flr_${t.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.floor1}" />
      <stop offset="100%" stop-color="${t.floor2}" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="url(#flr_${t.id})" />
  <path d="M 0 32 L 64 32 M 32 0 L 32 32 M 16 32 L 16 64 M 48 32 L 48 64" stroke="${t.seam}" stroke-width="1.5" />
  <circle cx="14" cy="16" r="1.5" fill="${t.fleck}" opacity="0.5" />
  <circle cx="46" cy="18" r="1" fill="${t.fleck}" opacity="0.5" />
  <circle cx="24" cy="48" r="1.5" fill="${t.fleck}" opacity="0.5" />
</svg>`
  });

  // B. Variable Floor: Cracked
  addAsset({
    id: `tile_floor_${t.id}_cracked`,
    name: `${t.name} Floor (Cracked)`,
    type: 'tile',
    category: 'variations',
    style: t.id,
    path: `assets/tiles/variations/floor_${t.id}_cracked.svg`,
    description: `Aged paver with deep fractures for ${t.name} tileset`,
    tags: ['floor', 'cracked', 'variation', t.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="flrCrk_${t.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.floor1}" />
      <stop offset="100%" stop-color="${t.floor2}" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="url(#flrCrk_${t.id})" />
  <path d="M 0 32 L 64 32 M 32 0 L 32 32 M 16 32 L 16 64" stroke="${t.seam}" stroke-width="1.5" />
  <!-- Fractures -->
  <path d="M 18 12 L 26 24 L 22 36 L 30 48 M 26 24 L 38 20 L 46 28 M 22 36 L 14 42" stroke="${t.accent}" stroke-width="1.5" fill="none" opacity="0.8" />
  <circle cx="46" cy="48" r="1.5" fill="${t.fleck}" opacity="0.5" />
</svg>`
  });

  // C. Variable Floor: Runic / Glyph Inscription
  addAsset({
    id: `tile_floor_${t.id}_runic`,
    name: `${t.name} Floor (Runic Inscribed)`,
    type: 'tile',
    category: 'variations',
    style: t.id,
    path: `assets/tiles/variations/floor_${t.id}_runic.svg`,
    description: `Paver carved with mystical glowing symbols for ${t.name}`,
    tags: ['floor', 'runic', 'glyph', 'magic', t.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="${t.floor2}" />
  <circle cx="32" cy="32" r="22" stroke="${t.accent}" stroke-width="1.5" fill="none" opacity="0.75" />
  <circle cx="32" cy="32" r="14" stroke="${t.accent}" stroke-width="1" stroke-dasharray="3,3" fill="none" opacity="0.6" />
  <polygon points="32,14 44,38 20,38" stroke="${t.accent}" stroke-width="1" fill="none" opacity="0.75" />
  <polygon points="32,50 20,26 44,26" stroke="${t.accent}" stroke-width="1" fill="none" opacity="0.75" />
  <circle cx="32" cy="32" r="3" fill="${t.accent}" />
</svg>`
  });

  // D. Base Wall
  addAsset({
    id: `tile_wall_${t.id}`,
    name: `${t.name} Wall (Solid)`,
    type: 'tile',
    category: 'ground',
    style: t.id,
    path: `assets/tiles/ground/wall_${t.id}.svg`,
    description: `Solid stone barrier block for ${t.name}`,
    tags: ['wall', 'solid', 'barrier', t.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="wGrad_${t.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${t.wallTop}" />
      <stop offset="40%" stop-color="${t.wallMid}" />
      <stop offset="100%" stop-color="${t.wallBot}" />
    </linearGradient>
  </defs>
  <rect x="0" y="8" width="64" height="56" fill="#000000" opacity="0.4" />
  <rect x="0" y="0" width="64" height="60" rx="2" fill="url(#wGrad_${t.id})" />
  <rect x="2" y="2" width="60" height="16" rx="1" fill="${t.wallTop}" />
  <path d="M 0 18 L 64 18 M 0 40 L 64 40 M 32 18 L 32 40 M 16 40 L 16 60 M 48 40 L 48 60" stroke="${t.wallStroke}" stroke-width="1.5" />
</svg>`
  });

  // E. Variable Wall: Torch Sconce
  addAsset({
    id: `tile_wall_${t.id}_torch`,
    name: `${t.name} Wall (Torch Sconce)`,
    type: 'tile',
    category: 'variations',
    style: t.id,
    path: `assets/tiles/variations/wall_${t.id}_torch.svg`,
    description: `Stone wall with mounted wrought-iron illuminated torch sconce`,
    tags: ['wall', 'torch', 'sconce', 'light', t.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="wTorchGrad_${t.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${t.wallTop}" />
      <stop offset="100%" stop-color="${t.wallBot}" />
    </linearGradient>
  </defs>
  <rect width="64" height="60" rx="2" fill="url(#wTorchGrad_${t.id})" />
  <rect x="2" y="2" width="60" height="16" rx="1" fill="${t.wallTop}" />
  <!-- Torch Bracket -->
  <rect x="30" y="26" width="4" height="18" fill="#1e293b" />
  <polygon points="28,26 36,26 34,20 30,20" fill="#475569" />
  <!-- Torch Flame Glow Aura -->
  <circle cx="32" cy="16" r="12" fill="#fbbf24" opacity="0.35" />
  <!-- Flame -->
  <path d="M 32 8 Q 37 16 32 20 Q 27 16 32 8 Z" fill="#f59e0b" />
  <path d="M 32 12 Q 35 17 32 20 Q 29 17 32 12 Z" fill="#fef08a" />
</svg>`
  });

  // F. Variable Wall: Grate / Window
  addAsset({
    id: `tile_wall_${t.id}_grate`,
    name: `${t.name} Wall (Iron Grate Window)`,
    type: 'tile',
    category: 'variations',
    style: t.id,
    path: `assets/tiles/variations/wall_${t.id}_grate.svg`,
    description: `Stone wall with recessed barred peek grate`,
    tags: ['wall', 'grate', 'window', 'bars', t.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="60" rx="2" fill="${t.wallMid}" />
  <rect x="2" y="2" width="60" height="16" rx="1" fill="${t.wallTop}" />
  <!-- Grate Opening -->
  <rect x="18" y="24" width="28" height="24" rx="4" fill="#020617" stroke="#1e293b" stroke-width="2" />
  <!-- Iron Bars -->
  <line x1="24" y1="24" x2="24" y2="48" stroke="#64748b" stroke-width="2" />
  <line x1="32" y1="24" x2="32" y2="48" stroke="#64748b" stroke-width="2" />
  <line x1="40" y1="24" x2="40" y2="48" stroke="#64748b" stroke-width="2" />
  <line x1="18" y1="36" x2="46" y2="36" stroke="#475569" stroke-width="2" />
</svg>`
  });

  // G. Bridges: EW and NS
  addAsset({
    id: `tile_bridge_${t.id}_ew`,
    name: `${t.name} Bridge EW`,
    type: 'tile',
    category: 'bridges',
    style: t.id,
    path: `assets/tiles/bridges/bridge_${t.id}_ew.svg`,
    description: `Overhead bridge span crossing north-south over east-west tunnel for ${t.name}`,
    tags: ['bridge', 'elevation', 'overhead', t.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="10" y="2" width="48" height="60" fill="#000000" opacity="0.55" rx="2" />
  <rect x="8" y="0" width="48" height="64" fill="${t.wood}" />
  <path d="M 8 12 L 56 12 M 8 24 L 56 24 M 8 36 L 56 36 M 8 48 L 56 48 M 8 60 L 56 60" stroke="${t.woodDark}" stroke-width="1.5" />
  <rect x="6" y="0" width="5" height="64" fill="${t.wallTop}" />
  <rect x="53" y="0" width="5" height="64" fill="${t.wallTop}" />
</svg>`
  });

  addAsset({
    id: `tile_bridge_${t.id}_ns`,
    name: `${t.name} Bridge NS`,
    type: 'tile',
    category: 'bridges',
    style: t.id,
    path: `assets/tiles/bridges/bridge_${t.id}_ns.svg`,
    description: `Overhead bridge span crossing east-west over north-south tunnel for ${t.name}`,
    tags: ['bridge', 'elevation', 'overhead', t.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="2" y="10" width="60" height="48" fill="#000000" opacity="0.55" rx="2" />
  <rect x="0" y="8" width="64" height="48" fill="${t.wood}" />
  <path d="M 12 8 L 12 56 M 24 8 L 24 56 M 36 8 L 36 56 M 48 8 L 48 56 M 60 8 L 60 56" stroke="${t.woodDark}" stroke-width="1.5" />
  <rect x="0" y="6" width="64" height="5" fill="${t.wallTop}" />
  <rect x="0" y="53" width="64" height="5" fill="${t.wallTop}" />
</svg>`
  });

  // H. Directional Ramps: North, South, East, West
  const rampDirs = [
    { dir: 'north', pathD: 'M 18 42 L 32 20 L 46 42' },
    { dir: 'south', pathD: 'M 18 22 L 32 44 L 46 22' },
    { dir: 'east',  pathD: 'M 22 18 L 44 32 L 22 46' },
    { dir: 'west',  pathD: 'M 42 18 L 20 32 L 42 46' }
  ];

  for (const r of rampDirs) {
    addAsset({
      id: `tile_ramp_${t.id}_${r.dir}`,
      name: `${t.name} Ramp (${r.dir.toUpperCase()})`,
      type: 'tile',
      category: 'ramps',
      style: t.id,
      path: `assets/tiles/ramps/ramp_${t.id}_${r.dir}.svg`,
      description: `Elevation ramp sloping toward ${r.dir} for ${t.name}`,
      tags: ['ramp', 'elevation', r.dir, t.id],
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="${t.floor2}" />
  <path d="${r.pathD}" stroke="${t.accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`
    });
  }
}

// =========================================================================
// 2. THEMED KEYS, DOORS WITH FACING, AND THEMED LEVERS
// =========================================================================

// Theme keys
const THEMED_KEYS = [
  { id: 'key_dungeon_iron', name: 'Dungeon Iron Key', color: '#94a3b8', theme: 'dungeon' },
  { id: 'key_jungle_jade', name: 'Jungle Jade Key', color: '#34d399', theme: 'jungle' },
  { id: 'key_magma_ruby', name: 'Molten Core Ruby Key', color: '#f43f5e', theme: 'magma' },
  { id: 'key_temple_scarab', name: 'Sunken Temple Gold Key', color: '#fbbf24', theme: 'temple' },
  { id: 'key_glacial_frost', name: 'Glacial Sapphire Key', color: '#38bdf8', theme: 'glacial' },
];

for (const k of THEMED_KEYS) {
  addAsset({
    id: k.id,
    name: k.name,
    type: 'entity',
    category: 'keys',
    style: k.theme,
    path: `assets/entities/keys/${k.id}.svg`,
    description: `Collectible key for ${k.theme} biome`,
    tags: ['key', 'item', 'unlock', k.theme],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="20" r="14" stroke="${k.color}" stroke-width="4" fill="#0f172a" />
  <circle cx="32" cy="20" r="6" fill="${k.color}" />
  <circle cx="29" cy="17" r="2.5" fill="#ffffff" />
  <rect x="30" y="32" width="4" height="24" fill="${k.color}" />
  <rect x="34" y="44" width="10" height="4" fill="${k.color}" />
  <rect x="34" y="52" width="8" height="4" fill="${k.color}" />
</svg>`
  });
}

// Directional Doors (Horizontal & Vertical facings)
const DOOR_THEMES = [
  { id: 'dungeon', name: 'Dungeon Iron Gate', color: '#94a3b8' },
  { id: 'jungle', name: 'Jungle Vine Gate', color: '#34d399' },
  { id: 'magma', name: 'Molten Obsidian Bulkhead', color: '#f43f5e' },
  { id: 'temple', name: 'Sunken Sandstone Gate', color: '#fbbf24' },
  { id: 'glacial', name: 'Glacial Frost Gate', color: '#38bdf8' },
];

for (const d of DOOR_THEMES) {
  // Vertical Facing (Portcullis bars)
  addAsset({
    id: `door_${d.id}_vertical`,
    name: `${d.name} (Vertical Facing)`,
    type: 'entity',
    category: 'doors',
    style: d.id,
    path: `assets/entities/doors/door_${d.id}_v.svg`,
    description: `Locked gate with vertical portcullis bars for ${d.id} theme`,
    tags: ['door', 'gate', 'vertical', d.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" rx="6" fill="#0f172a" stroke="${d.color}" stroke-width="3" />
  <line x1="18" y1="4" x2="18" y2="60" stroke="#475569" stroke-width="3" />
  <line x1="32" y1="4" x2="32" y2="60" stroke="#475569" stroke-width="3" />
  <line x1="46" y1="4" x2="46" y2="60" stroke="#475569" stroke-width="3" />
  <circle cx="32" cy="30" r="8" fill="${d.color}" />
</svg>`
  });

  // Horizontal Facing (Crossbeam bars)
  addAsset({
    id: `door_${d.id}_horizontal`,
    name: `${d.name} (Horizontal Facing)`,
    type: 'entity',
    category: 'doors',
    style: d.id,
    path: `assets/entities/doors/door_${d.id}_h.svg`,
    description: `Locked gate with horizontal crossbars for ${d.id} theme`,
    tags: ['door', 'gate', 'horizontal', d.id],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" rx="6" fill="#0f172a" stroke="${d.color}" stroke-width="3" />
  <line x1="4" y1="18" x2="60" y2="18" stroke="#475569" stroke-width="3" />
  <line x1="4" y1="32" x2="60" y2="32" stroke="#475569" stroke-width="3" />
  <line x1="4" y1="46" x2="60" y2="46" stroke="#475569" stroke-width="3" />
  <circle cx="32" cy="30" r="8" fill="${d.color}" />
</svg>`
  });
}

// =========================================================================
// 3. EDGE WALL INSET ENTRANCES & EXITS (Passages cut into perimeter walls)
// =========================================================================
const EDGE_WALL_DIRS = [
  { dir: 'north', label: 'North Edge', pathD: 'M 16 0 L 16 36 L 48 36 L 48 0' },
  { dir: 'south', label: 'South Edge', pathD: 'M 16 64 L 16 28 L 48 28 L 48 64' },
  { dir: 'east',  label: 'East Edge',  pathD: 'M 64 16 L 28 16 L 28 48 L 64 48' },
  { dir: 'west',  label: 'West Edge',  pathD: 'M 0 16 L 36 16 L 36 48 L 0 48' },
];

for (const e of EDGE_WALL_DIRS) {
  // Edge Wall Entrance
  addAsset({
    id: `spawn_edge_wall_${e.dir}`,
    name: `Edge Wall Entrance (${e.label})`,
    type: 'environment',
    category: 'edge_passages',
    style: 'wall_passage',
    path: `assets/environment/edge_passages/spawn_edge_${e.dir}.svg`,
    description: `Seamless entrance passage cut into the ${e.label} perimeter wall`,
    tags: ['spawn', 'entrance', 'edge', 'wall', e.dir],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Wall Base -->
  <rect width="64" height="64" fill="#334155" />
  <rect x="2" y="2" width="60" height="16" fill="#475569" />
  <!-- Inset Tunnel Passage -->
  <path d="${e.pathD}" fill="#020617" stroke="#1e293b" stroke-width="2" />
  <!-- Green Entry Beacon -->
  <circle cx="32" cy="32" r="6" fill="#34d399" />
</svg>`
  });

  // Edge Wall Exit
  addAsset({
    id: `exit_edge_wall_${e.dir}`,
    name: `Edge Wall Exit (${e.label})`,
    type: 'environment',
    category: 'edge_passages',
    style: 'wall_passage',
    path: `assets/environment/edge_passages/exit_edge_${e.dir}.svg`,
    description: `Escape tunnel doorway leading out through the ${e.label} perimeter wall`,
    tags: ['exit', 'victory', 'edge', 'wall', e.dir],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Wall Base -->
  <rect width="64" height="64" fill="#334155" />
  <rect x="2" y="2" width="60" height="16" fill="#475569" />
  <!-- Inset Tunnel Passage -->
  <path d="${e.pathD}" fill="#020617" stroke="#1e293b" stroke-width="2" />
  <!-- Golden Victory Daylight Glow -->
  <circle cx="32" cy="32" r="8" fill="#fbbf24" opacity="0.8" />
  <text x="32" y="36" font-size="10" font-weight="bold" fill="#000000" text-anchor="middle">EXIT</text>
</svg>`
  });
}

// =========================================================================
// 4. MULTIPLE PLAYER AVATAR CLASSES WITH 4-WAY DIRECTIONAL FACING
// =========================================================================
const PLAYER_CLASSES = [
  {
    id: 'adventurer',
    name: 'Adventurer',
    bodyCol: '#0284c7', hatCol: '#78350f', rimCol: '#38bdf8', desc: 'Classic leather-clad maze explorer'
  },
  {
    id: 'knight',
    name: 'Knight',
    bodyCol: '#475569', hatCol: '#94a3b8', rimCol: '#cbd5e1', desc: 'Armored vanguard with iron greathelm and shield'
  },
  {
    id: 'mage',
    name: 'Mage',
    bodyCol: '#581c87', hatCol: '#7e22ce', rimCol: '#c084fc', desc: 'Arcane wizard in mystic robed cowl'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    bodyCol: '#1e293b', hatCol: '#0f172a', rimCol: '#34d399', desc: 'Shadow scout in leather mantle and mask'
  }
];

const FACINGS = [
  { dir: 'north', label: 'North (Up/Back)', eyeDx: 0, eyeDy: -6 },
  { dir: 'south', label: 'South (Down/Front)', eyeDx: 0, eyeDy: 4 },
  { dir: 'east',  label: 'East (Right)', eyeDx: 5, eyeDy: 0 },
  { dir: 'west',  label: 'West (Left)', eyeDx: -5, eyeDy: 0 },
];

for (const p of PLAYER_CLASSES) {
  for (const f of FACINGS) {
    addAsset({
      id: `player_${p.id}_${f.dir}`,
      name: `${p.name} (${f.label})`,
      type: 'player',
      category: 'player',
      style: p.id,
      path: `assets/player/${p.id}/player_${p.id}_${f.dir}.svg`,
      description: `${p.desc} facing ${f.dir}`,
      tags: ['player', 'hero', p.id, f.dir, 'character'],
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Outer Aura Ring -->
  <circle cx="32" cy="32" r="22" fill="${p.bodyCol}" stroke="${p.rimCol}" stroke-width="3" />
  <!-- Character Head / Helmet -->
  <circle cx="32" cy="32" r="14" fill="${p.hatCol}" />
  <!-- Directional Facing Indicator Eyes / Visor -->
  <circle cx="${32 + f.eyeDx - 4}" cy="${32 + f.eyeDy}" r="2.5" fill="#ffffff" />
  <circle cx="${32 + f.eyeDx + 4}" cy="${32 + f.eyeDy}" r="2.5" fill="#ffffff" />
</svg>`
    });
  }
}

// =========================================================================
// 5. FREE-STANDING ENTRANCES & VICTORY EXITS
// =========================================================================
const FREESTANDING_SPAWNS = [
  { id: 'spawn_stairs_down', name: 'Entrance Stairs Down', style: 'stairs_down', icon: 'ENTER' },
  { id: 'spawn_portal', name: 'Summoning Rift', style: 'portal', icon: '▼' },
  { id: 'spawn_archway', name: 'Entrance Archway', style: 'archway', icon: '🏛️' },
  { id: 'spawn_pentagram', name: 'Runic Circle Spawn', style: 'pentagram', icon: '🔯' },
  { id: 'spawn_camp', name: 'Explorer Camp', style: 'camp', icon: '⛺' },
];

for (const s of FREESTANDING_SPAWNS) {
  addAsset({
    id: s.id,
    name: s.name,
    type: 'environment',
    category: 'spawn',
    style: s.style,
    path: `assets/environment/spawn/${s.id}.svg`,
    description: `Freestanding entrance location (${s.name})`,
    tags: ['spawn', 'entrance', s.style],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" fill="#0f172a" rx="4" />
  <circle cx="32" cy="32" r="22" stroke="#34d399" stroke-width="2.5" fill="rgba(52,211,153,0.15)" />
  <text x="32" y="37" font-size="16" fill="#34d399" font-weight="bold" text-anchor="middle">${s.icon}</text>
</svg>`
  });
}

const FREESTANDING_EXITS = [
  { id: 'exit_portal', name: 'Cosmic Exit Portal', style: 'portal', icon: '🌀' },
  { id: 'exit_stairs_up', name: 'Daylight Ascent Stairs', style: 'stairs_up', icon: '▲' },
  { id: 'exit_archway', name: 'Sanctuary Exit Archway', style: 'archway', icon: '🏛️' },
  { id: 'exit_treasure_chest', name: 'Treasure Vault Chest', style: 'chest', icon: '🎁' },
  { id: 'exit_shrine', name: 'Sacred Torii Shrine', style: 'shrine', icon: '⛩️' },
];

for (const x of FREESTANDING_EXITS) {
  addAsset({
    id: x.id,
    name: x.name,
    type: 'environment',
    category: 'exit',
    style: x.style,
    path: `assets/environment/exit/${x.id}.svg`,
    description: `Victory goal destination (${x.name})`,
    tags: ['exit', 'victory', 'goal', x.style],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" fill="#0f172a" rx="4" />
  <circle cx="32" cy="32" r="22" stroke="#38bdf8" stroke-width="2.5" fill="rgba(56,189,248,0.15)" />
  <text x="32" y="38" font-size="18" fill="#ffffff" text-anchor="middle">${x.icon}</text>
</svg>`
  });
}

// =========================================================================
// 6. SPECIAL BARRIERS, MECHANISMS & UI TOOLS
// =========================================================================
const SPECIAL_ENTITIES = [
  { id: 'key_classic', name: 'Classic Gold Key', type: 'entity', category: 'keys', style: 'classic', path: 'assets/entities/keys/key_classic.svg', tags: ['key', 'classic', 'gold'] },
  { id: 'key_ornate', name: 'Ornate Skeleton Key', type: 'entity', category: 'keys', style: 'ornate', path: 'assets/entities/keys/key_ornate.svg', tags: ['key', 'ornate', 'skeleton'] },
  { id: 'key_crystal', name: 'Elemental Crystal Shard', type: 'entity', category: 'keys', style: 'crystal', path: 'assets/entities/keys/key_crystal.svg', tags: ['key', 'crystal', 'gem'] },
  { id: 'key_orb', name: 'Arcane Orb', type: 'entity', category: 'keys', style: 'orb', path: 'assets/entities/keys/key_orb.svg', tags: ['key', 'orb', 'arcane'] },
  { id: 'key_relic', name: 'Royal Relic Crown', type: 'entity', category: 'keys', style: 'relic', path: 'assets/entities/keys/key_relic.svg', tags: ['key', 'relic', 'crown'] },
  { id: 'key_skull', name: 'Crypt Rune Token', type: 'entity', category: 'keys', style: 'skull', path: 'assets/entities/keys/key_skull.svg', tags: ['key', 'skull', 'crypt'] },
  { id: 'door_laser_barrier', name: 'Laser Forcefield Barrier', type: 'entity', category: 'doors', style: 'laser_barrier', path: 'assets/entities/doors/door_laser_barrier.svg', tags: ['door', 'laser', 'barrier'] },
  { id: 'door_magic_seal', name: 'Arcane Runic Seal', type: 'entity', category: 'doors', style: 'magic_seal', path: 'assets/entities/doors/door_magic_seal.svg', tags: ['door', 'magic', 'seal'] },
  { id: 'door_crystal_spikes', name: 'Crystal Spikes Barrier', type: 'entity', category: 'doors', style: 'crystal_spikes', path: 'assets/entities/doors/door_crystal_spikes.svg', tags: ['door', 'crystal', 'spikes'] },
  { id: 'door_vault_hatch', name: 'Vault Bulkhead Hatch', type: 'entity', category: 'doors', style: 'vault_hatch', path: 'assets/entities/doors/door_vault_hatch.svg', tags: ['door', 'vault', 'hatch'] },
  { id: 'lever_switch_off', name: 'Floor Lever (OFF)', type: 'entity', category: 'levers', style: 'switch_lever', path: 'assets/entities/levers/lever_switch_off.svg', tags: ['lever', 'switch', 'off'] },
  { id: 'lever_switch_on', name: 'Floor Lever (ON)', type: 'entity', category: 'levers', style: 'switch_lever', path: 'assets/entities/levers/lever_switch_on.svg', tags: ['lever', 'switch', 'on'] },
  { id: 'pedestal_inactive', name: 'Stone Pedestal (Inactive)', type: 'entity', category: 'levers', style: 'pressure_pedestal', path: 'assets/entities/levers/pedestal_inactive.svg', tags: ['pedestal', 'off'] },
  { id: 'pedestal_active', name: 'Stone Pedestal (Active)', type: 'entity', category: 'levers', style: 'pressure_pedestal', path: 'assets/entities/levers/pedestal_active.svg', tags: ['pedestal', 'on'] },
  { id: 'crystal_inactive', name: 'Resonance Crystal (Rest)', type: 'entity', category: 'levers', style: 'crystal_switch', path: 'assets/entities/levers/crystal_inactive.svg', tags: ['crystal', 'off'] },
  { id: 'crystal_active', name: 'Resonance Crystal (Active)', type: 'entity', category: 'levers', style: 'crystal_switch', path: 'assets/entities/levers/crystal_active.svg', tags: ['crystal', 'on'] },
  { id: 'runic_plate_off', name: 'Runic Inscription (OFF)', type: 'entity', category: 'levers', style: 'runic_plate', path: 'assets/entities/levers/runic_plate_off.svg', tags: ['rune', 'off'] },
  { id: 'runic_plate_on', name: 'Runic Inscription (ON)', type: 'entity', category: 'levers', style: 'runic_plate', path: 'assets/entities/levers/runic_plate_on.svg', tags: ['rune', 'on'] },
  { id: 'cog_valve_off', name: 'Mechanical Valve (OFF)', type: 'entity', category: 'levers', style: 'cog_wheel', path: 'assets/entities/levers/cog_valve_off.svg', tags: ['valve', 'off'] },
  { id: 'cog_valve_on', name: 'Mechanical Valve (ON)', type: 'entity', category: 'levers', style: 'cog_wheel', path: 'assets/entities/levers/cog_valve_on.svg', tags: ['valve', 'on'] },
];

for (const se of SPECIAL_ENTITIES) {
  addAsset({
    ...se,
    description: `Specialized game asset: ${se.name}`,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a" rx="4" />
  <circle cx="32" cy="32" r="20" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
  <circle cx="32" cy="32" r="8" fill="#fbbf24" />
</svg>`
  });
}

// UI Tools
const UI_TOOLS = [
  { id: 'tool_pencil', name: 'Pencil Tool', icon: '✏️' },
  { id: 'tool_line', name: 'Line Tool', icon: '📏' },
  { id: 'tool_fill', name: 'Fill Bucket Tool', icon: '🪣' },
  { id: 'tool_eraser', name: 'Eraser Tool', icon: '🧹' },
  { id: 'tool_select', name: 'Select Tool', icon: '🔍' },
  { id: 'tool_move', name: 'Grab Tool', icon: '✋' },
];

for (const ut of UI_TOOLS) {
  addAsset({
    id: ut.id,
    name: ut.name,
    type: 'ui',
    category: 'tools',
    style: 'icon',
    path: `assets/ui/${ut.id}.svg`,
    description: `Editor user interface tool icon (${ut.name})`,
    tags: ['ui', 'tool', 'editor'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b" rx="6" stroke="#334155" stroke-width="2" />
  <text x="32" y="42" font-size="28" text-anchor="middle">${ut.icon}</text>
</svg>`
  });
}

// Write all SVGs to disk
for (const a of ASSET_DEFINITIONS) {
  fs.writeFileSync(a.path, a.svg, 'utf8');
}

// Generate canonical assets/manifest.json
const manifest = {
  $schema: './schema.json',
  version: '1.3.0',
  generatedAt: new Date().toISOString(),
  totalAssets: ASSET_DEFINITIONS.length,
  themes: ['dungeon', 'jungle', 'magma', 'temple', 'glacial'],
  playerClasses: ['adventurer', 'knight', 'mage', 'rogue'],
  facings: ['north', 'south', 'east', 'west'],
  categories: {
    tiles: ['ground', 'bridges', 'ramps', 'variations'],
    entities: ['keys', 'doors', 'levers'],
    environment: ['spawn', 'exit', 'edge_passages'],
    player: ['player'],
    ui: ['tools']
  },
  assets: ASSET_DEFINITIONS.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    category: a.category,
    style: a.style,
    path: a.path,
    viewBox: '0 0 64 64',
    description: a.description,
    tags: a.tags
  }))
};

fs.writeFileSync('assets/manifest.json', JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Generated ${ASSET_DEFINITIONS.length} complete standalone SVG asset files and updated assets/manifest.json!`);

