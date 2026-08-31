/**
 * Asset Pipeline Generator
 * Generates standalone SVG files for all tiles, entities, environment, player, and UI icons,
 * along with the canonical assets/manifest.json registry.
 */

import fs from 'fs';
import path from 'path';

const dirs = [
  'assets',
  'assets/tiles/ground',
  'assets/tiles/bridges',
  'assets/tiles/ramps',
  'assets/entities/keys',
  'assets/entities/doors',
  'assets/entities/levers',
  'assets/environment/spawn',
  'assets/environment/exit',
  'assets/player',
  'assets/ui',
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

export const ASSET_DEFINITIONS = [
  // ==========================================
  // 1. TILES - GROUND
  // ==========================================
  {
    id: 'tile_floor',
    name: 'Dungeon Floor',
    type: 'tile',
    category: 'ground',
    style: 'dungeon',
    path: 'assets/tiles/ground/floor.svg',
    description: 'Standard stone floor paver with mortar seams and subtle texture flecks',
    tags: ['floor', 'stone', 'ground', 'walkable'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="flrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="url(#flrGrad)" />
  <path d="M 0 32 L 64 32 M 32 0 L 32 32 M 16 32 L 16 64 M 48 32 L 48 64" stroke="#334155" stroke-width="1.5" />
  <circle cx="14" cy="16" r="1.5" fill="#475569" opacity="0.5" />
  <circle cx="46" cy="18" r="1" fill="#475569" opacity="0.5" />
  <circle cx="24" cy="48" r="1.5" fill="#475569" opacity="0.5" />
</svg>`
  },
  {
    id: 'tile_wall_dungeon',
    name: 'Dungeon Slate Wall',
    type: 'tile',
    category: 'ground',
    style: 'dungeon',
    path: 'assets/tiles/ground/wall_dungeon.svg',
    description: 'Chiseled slate stone dungeon wall block with top bevel and drop shadow',
    tags: ['wall', 'solid', 'barrier', 'dungeon'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="wDungGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="40%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect x="0" y="8" width="64" height="56" fill="#000000" opacity="0.4" />
  <rect x="0" y="0" width="64" height="60" rx="2" fill="url(#wDungGrad)" />
  <rect x="2" y="2" width="60" height="16" rx="1" fill="#64748b" />
  <path d="M 0 18 L 64 18 M 0 40 L 64 40 M 32 18 L 32 40 M 16 40 L 16 60 M 48 40 L 48 60" stroke="#1e293b" stroke-width="1.5" />
  <path d="M 2 2 L 62 2" stroke="#94a3b8" stroke-width="1" />
</svg>`
  },
  {
    id: 'tile_wall_overgrowth',
    name: 'Overgrowth Wall',
    type: 'tile',
    category: 'ground',
    style: 'overgrowth',
    path: 'assets/tiles/ground/wall_overgrowth.svg',
    description: 'Ancient moss-covered cobblestone wall draped with jungle vines',
    tags: ['wall', 'overgrowth', 'moss', 'nature'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="wJungleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#166534" />
      <stop offset="50%" stop-color="#14532d" />
      <stop offset="100%" stop-color="#052e16" />
    </linearGradient>
  </defs>
  <rect width="64" height="60" rx="2" fill="url(#wJungleGrad)" />
  <rect x="2" y="2" width="60" height="16" rx="1" fill="#15803d" />
  <path d="M 8 18 Q 12 36 8 48 Q 6 54 10 58 M 24 18 Q 28 30 22 42 M 44 18 Q 48 38 42 54 M 56 18 Q 60 28 56 38" stroke="#4ade80" stroke-width="2" fill="none" stroke-linecap="round" />
  <circle cx="10" cy="34" r="3" fill="#22c55e" />
  <circle cx="45" cy="40" r="3.5" fill="#22c55e" />
</svg>`
  },
  {
    id: 'tile_wall_magma',
    name: 'Magma Chasm Wall',
    type: 'tile',
    category: 'ground',
    style: 'magma',
    path: 'assets/tiles/ground/wall_magma.svg',
    description: 'Dark volcanic basalt rock with glowing lava fissures',
    tags: ['wall', 'magma', 'fire', 'volcanic', 'lava'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="wMagmaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#450a0a" />
      <stop offset="100%" stop-color="#1c0404" />
    </linearGradient>
  </defs>
  <rect width="64" height="60" rx="2" fill="url(#wMagmaGrad)" />
  <rect x="2" y="2" width="60" height="16" rx="1" fill="#7f1d1d" />
  <path d="M 12 18 Q 18 32 10 44 Q 8 50 14 58 M 38 18 Q 32 30 40 42 Q 44 48 36 58 M 52 24 Q 48 36 56 46" stroke="#ef4444" stroke-width="2" fill="none" />
  <path d="M 12 24 L 10 40 M 38 28 L 36 46" stroke="#fbbf24" stroke-width="1" fill="none" />
</svg>`
  },
  {
    id: 'tile_wall_temple',
    name: 'Sunken Temple Wall',
    type: 'tile',
    category: 'ground',
    style: 'temple',
    path: 'assets/tiles/ground/wall_temple.svg',
    description: 'Golden carved sandstone temple wall with runic glyph reliefs',
    tags: ['wall', 'temple', 'sandstone', 'gold', 'ancient'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="wTempleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#78350f" />
      <stop offset="50%" stop-color="#451a03" />
      <stop offset="100%" stop-color="#270e02" />
    </linearGradient>
  </defs>
  <rect width="64" height="60" rx="2" fill="url(#wTempleGrad)" />
  <rect x="2" y="2" width="60" height="16" rx="1" fill="#92400e" />
  <path d="M 16 26 L 24 26 L 20 34 Z M 40 26 L 48 26 L 48 34 L 40 34 Z M 16 44 L 24 44 M 20 40 L 20 48 M 40 44 Q 44 40 48 44 Q 44 48 40 44" stroke="#fbbf24" stroke-width="1.5" fill="none" opacity="0.8" />
</svg>`
  },

  // ==========================================
  // 2. TILES - BRIDGES
  // ==========================================
  {
    id: 'tile_bridge_ew',
    name: 'Bridge (East-West Tunnel / NS Span)',
    type: 'tile',
    category: 'bridges',
    style: 'standard',
    path: 'assets/tiles/bridges/bridge_ew.svg',
    description: 'Overhead elevated wooden bridge crossing north-south over an east-west ground corridor',
    tags: ['bridge', 'elevation', 'overhead', '3d'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="10" y="2" width="48" height="60" fill="#000000" opacity="0.55" rx="2" />
  <rect x="8" y="0" width="48" height="64" fill="#78350f" />
  <path d="M 8 12 L 56 12 M 8 24 L 56 24 M 8 36 L 56 36 M 8 48 L 56 48 M 8 60 L 56 60" stroke="#451a03" stroke-width="1.5" />
  <rect x="6" y="0" width="5" height="64" fill="#92400e" />
  <rect x="53" y="0" width="5" height="64" fill="#92400e" />
  <circle cx="8.5" cy="6" r="1.5" fill="#ffffff" />
  <circle cx="55.5" cy="6" r="1.5" fill="#ffffff" />
  <circle cx="8.5" cy="58" r="1.5" fill="#ffffff" />
  <circle cx="55.5" cy="58" r="1.5" fill="#ffffff" />
</svg>`
  },
  {
    id: 'tile_bridge_ns',
    name: 'Bridge (North-South Tunnel / EW Span)',
    type: 'tile',
    category: 'bridges',
    style: 'standard',
    path: 'assets/tiles/bridges/bridge_ns.svg',
    description: 'Overhead elevated wooden bridge crossing east-west over a north-south ground corridor',
    tags: ['bridge', 'elevation', 'overhead', '3d'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="2" y="10" width="60" height="48" fill="#000000" opacity="0.55" rx="2" />
  <rect x="0" y="8" width="64" height="48" fill="#78350f" />
  <path d="M 12 8 L 12 56 M 24 8 L 24 56 M 36 8 L 36 56 M 48 8 L 48 56 M 60 8 L 60 56" stroke="#451a03" stroke-width="1.5" />
  <rect x="0" y="6" width="64" height="5" fill="#92400e" />
  <rect x="0" y="53" width="64" height="5" fill="#92400e" />
  <circle cx="6" cy="8.5" r="1.5" fill="#ffffff" />
  <circle cx="6" cy="55.5" r="1.5" fill="#ffffff" />
  <circle cx="58" cy="8.5" r="1.5" fill="#ffffff" />
  <circle cx="58" cy="55.5" r="1.5" fill="#ffffff" />
</svg>`
  },

  // ==========================================
  // 3. TILES - RAMPS
  // ==========================================
  {
    id: 'tile_ramp_north',
    name: 'Ramp North',
    type: 'tile',
    category: 'ramps',
    style: 'standard',
    path: 'assets/tiles/ramps/ramp_north.svg',
    description: 'Gradual stone incline sloping upwards to the North toward elevated bridge decks',
    tags: ['ramp', 'elevation', 'north', 'slope'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b" />
  <rect x="4" y="4" width="56" height="12" fill="#475569" />
  <rect x="4" y="18" width="56" height="12" fill="#334155" />
  <rect x="4" y="32" width="56" height="12" fill="#1e293b" />
  <rect x="4" y="46" width="56" height="14" fill="#0f172a" />
  <path d="M 18 42 L 32 20 L 46 42" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`
  },
  {
    id: 'tile_ramp_south',
    name: 'Ramp South',
    type: 'tile',
    category: 'ramps',
    style: 'standard',
    path: 'assets/tiles/ramps/ramp_south.svg',
    description: 'Gradual stone incline sloping upwards to the South toward elevated bridge decks',
    tags: ['ramp', 'elevation', 'south', 'slope'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b" />
  <rect x="4" y="4" width="56" height="14" fill="#0f172a" />
  <rect x="4" y="20" width="56" height="12" fill="#1e293b" />
  <rect x="4" y="34" width="56" height="12" fill="#334155" />
  <rect x="4" y="48" width="56" height="12" fill="#475569" />
  <path d="M 18 22 L 32 44 L 46 22" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`
  },
  {
    id: 'tile_ramp_east',
    name: 'Ramp East',
    type: 'tile',
    category: 'ramps',
    style: 'standard',
    path: 'assets/tiles/ramps/ramp_east.svg',
    description: 'Gradual stone incline sloping upwards to the East toward elevated bridge decks',
    tags: ['ramp', 'elevation', 'east', 'slope'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b" />
  <rect x="4" y="4" width="14" height="56" fill="#0f172a" />
  <rect x="20" y="4" width="12" height="56" fill="#1e293b" />
  <rect x="34" y="4" width="12" height="56" fill="#334155" />
  <rect x="48" y="4" width="12" height="56" fill="#475569" />
  <path d="M 22 18 L 44 32 L 22 46" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`
  },
  {
    id: 'tile_ramp_west',
    name: 'Ramp West',
    type: 'tile',
    category: 'ramps',
    style: 'standard',
    path: 'assets/tiles/ramps/ramp_west.svg',
    description: 'Gradual stone incline sloping upwards to the West toward elevated bridge decks',
    tags: ['ramp', 'elevation', 'west', 'slope'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b" />
  <rect x="4" y="4" width="12" height="56" fill="#475569" />
  <rect x="18" y="4" width="12" height="56" fill="#334155" />
  <rect x="32" y="4" width="12" height="56" fill="#1e293b" />
  <rect x="46" y="4" width="14" height="56" fill="#0f172a" />
  <path d="M 42 18 L 20 32 L 42 46" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`
  },

  // ==========================================
  // 4. ENTITIES - KEYS
  // ==========================================
  {
    id: 'key_classic',
    name: 'Classic Key',
    type: 'entity',
    category: 'keys',
    style: 'classic',
    path: 'assets/entities/keys/key_classic.svg',
    description: 'Standard notched gold key with gemstone bow and faceted shaft',
    tags: ['key', 'item', 'unlock', 'gold', 'classic'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="20" r="14" stroke="#fbbf24" stroke-width="4" fill="#0f172a" />
  <circle cx="32" cy="20" r="6" fill="#fbbf24" />
  <circle cx="29" cy="17" r="2.5" fill="#ffffff" />
  <rect x="30" y="32" width="4" height="24" fill="#fbbf24" />
  <rect x="34" y="44" width="10" height="4" fill="#fbbf24" />
  <rect x="34" y="52" width="8" height="4" fill="#fbbf24" />
</svg>`
  },
  {
    id: 'key_ornate',
    name: 'Ornate Skeleton Key',
    type: 'entity',
    category: 'keys',
    style: 'ornate',
    path: 'assets/entities/keys/key_ornate.svg',
    description: 'Antique forged skeleton key with decorative filigree double-sided bit',
    tags: ['key', 'skeleton', 'antique', 'ornate'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="18" r="14" stroke="#fbbf24" stroke-width="3" fill="none" />
  <circle cx="26" cy="18" r="4" stroke="#fbbf24" stroke-width="2" fill="none" />
  <circle cx="38" cy="18" r="4" stroke="#fbbf24" stroke-width="2" fill="none" />
  <circle cx="32" cy="13" r="4" stroke="#fbbf24" stroke-width="2" fill="none" />
  <rect x="30" y="32" width="4" height="26" fill="#fbbf24" />
  <rect x="34" y="44" width="10" height="4" fill="#fbbf24" />
  <rect x="20" y="44" width="10" height="4" fill="#fbbf24" />
  <rect x="34" y="52" width="8" height="4" fill="#fbbf24" />
</svg>`
  },
  {
    id: 'key_crystal',
    name: 'Elemental Crystal Shard',
    type: 'entity',
    category: 'keys',
    style: 'crystal',
    path: 'assets/entities/keys/key_crystal.svg',
    description: 'Glowing elemental crystal shard with faceted edges',
    tags: ['crystal', 'gem', 'shard', 'elemental'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="32,6 50,22 44,52 32,58 20,52 14,22" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
  <line x1="32" y1="6" x2="32" y2="58" stroke="#ffffff" stroke-width="1.5" opacity="0.75" />
  <line x1="14" y1="22" x2="50" y2="22" stroke="#ffffff" stroke-width="1.5" opacity="0.75" />
  <polygon points="32,6 50,22 32,58" fill="#0284c7" opacity="0.3" />
</svg>`
  },
  {
    id: 'key_orb',
    name: 'Arcane Orb',
    type: 'entity',
    category: 'keys',
    style: 'orb',
    path: 'assets/entities/keys/key_orb.svg',
    description: 'Mystic glowing arcane sphere with spinning planetary energy ring',
    tags: ['orb', 'arcane', 'magic', 'sphere'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="orbGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="30%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#581c87" />
    </radialGradient>
  </defs>
  <ellipse cx="32" cy="32" rx="28" ry="10" stroke="#c084fc" stroke-width="2" fill="none" transform="rotate(-20 32 32)" />
  <circle cx="32" cy="32" r="18" fill="url(#orbGrad)" />
  <circle cx="26" cy="24" r="4" fill="#ffffff" opacity="0.8" />
</svg>`
  },
  {
    id: 'key_relic',
    name: 'Royal Relic Crown',
    type: 'entity',
    category: 'keys',
    style: 'relic',
    path: 'assets/entities/keys/key_relic.svg',
    description: 'Golden royal crown imperial relic with jewel-tipped peaks',
    tags: ['relic', 'crown', 'royal', 'gold'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="12,20 22,34 32,14 42,34 52,20 48,50 16,50" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
  <circle cx="12" cy="18" r="3" fill="#f43f5e" />
  <circle cx="32" cy="12" r="3.5" fill="#38bdf8" />
  <circle cx="52" cy="18" r="3" fill="#f43f5e" />
  <circle cx="32" cy="42" r="4" fill="#34d399" />
  <rect x="18" y="46" width="28" height="4" fill="#d97706" />
</svg>`
  },
  {
    id: 'key_skull',
    name: 'Crypt Rune Token',
    type: 'entity',
    category: 'keys',
    style: 'skull',
    path: 'assets/entities/keys/key_skull.svg',
    description: 'Ancient bone crypt token skull with glowing eye sockets',
    tags: ['skull', 'crypt', 'bone', 'token'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M 16 32 C 16 16 48 16 48 32 C 48 40 42 46 42 54 L 22 54 C 22 46 16 40 16 32 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="2" />
  <circle cx="26" cy="30" r="5" fill="#0f172a" />
  <circle cx="38" cy="30" r="5" fill="#0f172a" />
  <circle cx="26" cy="30" r="2" fill="#34d399" />
  <circle cx="38" cy="30" r="2" fill="#34d399" />
  <polygon points="32,38 29,44 35,44" fill="#64748b" />
  <line x1="26" y1="50" x2="26" y2="54" stroke="#64748b" stroke-width="2" />
  <line x1="32" y1="50" x2="32" y2="54" stroke="#64748b" stroke-width="2" />
  <line x1="38" y1="50" x2="38" y2="54" stroke="#64748b" stroke-width="2" />
</svg>`
  },

  // ==========================================
  // 5. ENTITIES - DOORS
  // ==========================================
  {
    id: 'door_classic',
    name: 'Reinforced Gate',
    type: 'entity',
    category: 'doors',
    style: 'classic',
    path: 'assets/entities/doors/door_classic.svg',
    description: 'Ironbound wooden gate with glowing keyhole emblem and vertical bars',
    tags: ['door', 'gate', 'lock', 'classic'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" rx="6" fill="#0f172a" stroke="#fbbf24" stroke-width="3" />
  <line x1="18" y1="4" x2="18" y2="60" stroke="#475569" stroke-width="3" />
  <line x1="32" y1="4" x2="32" y2="60" stroke="#475569" stroke-width="3" />
  <line x1="46" y1="4" x2="46" y2="60" stroke="#475569" stroke-width="3" />
  <circle cx="32" cy="30" r="8" fill="#fbbf24" />
  <polygon points="29,32 35,32 33,40 31,40" fill="#fbbf24" />
</svg>`
  },
  {
    id: 'door_portcullis',
    name: 'Spiked Portcullis',
    type: 'entity',
    category: 'doors',
    style: 'portcullis',
    path: 'assets/entities/doors/door_portcullis.svg',
    description: 'Heavy iron portcullis grate with pointed spikes',
    tags: ['door', 'portcullis', 'iron', 'spikes'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="3" />
  <line x1="16" y1="4" x2="16" y2="56" stroke="#94a3b8" stroke-width="3" />
  <line x1="32" y1="4" x2="32" y2="56" stroke="#94a3b8" stroke-width="3" />
  <line x1="48" y1="4" x2="48" y2="56" stroke="#94a3b8" stroke-width="3" />
  <line x1="4" y1="20" x2="60" y2="20" stroke="#64748b" stroke-width="3" />
  <line x1="4" y1="40" x2="60" y2="40" stroke="#64748b" stroke-width="3" />
  <polygon points="16,56 12,62 20,62" fill="#94a3b8" />
  <polygon points="32,56 28,62 36,62" fill="#94a3b8" />
  <polygon points="48,56 44,62 52,62" fill="#94a3b8" />
</svg>`
  },
  {
    id: 'door_laser_barrier',
    name: 'Laser Forcefield Barrier',
    type: 'entity',
    category: 'doors',
    style: 'laser_barrier',
    path: 'assets/entities/doors/door_laser_barrier.svg',
    description: 'Electromagnetic forcefield barrier with side generator pylons',
    tags: ['door', 'barrier', 'laser', 'forcefield', 'tech'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a" opacity="0.6" />
  <rect x="2" y="4" width="10" height="56" fill="#334155" rx="2" stroke="#64748b" stroke-width="1.5" />
  <rect x="52" y="4" width="10" height="56" fill="#334155" rx="2" stroke="#64748b" stroke-width="1.5" />
  <line x1="12" y1="16" x2="52" y2="16" stroke="#f43f5e" stroke-width="3" />
  <line x1="12" y1="32" x2="52" y2="32" stroke="#f43f5e" stroke-width="4" />
  <line x1="12" y1="48" x2="52" y2="48" stroke="#f43f5e" stroke-width="3" />
  <circle cx="7" cy="32" r="3" fill="#f43f5e" />
  <circle cx="57" cy="32" r="3" fill="#f43f5e" />
</svg>`
  },
  {
    id: 'door_magic_seal',
    name: 'Arcane Runic Seal',
    type: 'entity',
    category: 'doors',
    style: 'magic_seal',
    path: 'assets/entities/doors/door_magic_seal.svg',
    description: 'Mystic rune circle seal preventing passage until dispelled',
    tags: ['door', 'magic', 'rune', 'seal', 'arcane'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a" opacity="0.75" />
  <circle cx="32" cy="32" r="26" stroke="#a855f7" stroke-width="2.5" fill="none" />
  <circle cx="32" cy="32" r="16" stroke="#c084fc" stroke-width="1.5" fill="none" />
  <polygon points="32,16 46,40 18,40" stroke="#a855f7" stroke-width="1.5" fill="none" />
  <polygon points="32,48 18,24 46,24" stroke="#a855f7" stroke-width="1.5" fill="none" />
  <circle cx="32" cy="32" r="4" fill="#ffffff" />
</svg>`
  },
  {
    id: 'door_crystal_spikes',
    name: 'Crystal Spikes Barrier',
    type: 'entity',
    category: 'doors',
    style: 'crystal_spikes',
    path: 'assets/entities/doors/door_crystal_spikes.svg',
    description: 'Cluster of sharp mineral crystal spikes blocking the passage',
    tags: ['door', 'crystal', 'spikes', 'barrier'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a" opacity="0.6" />
  <polygon points="14,60 18,18 26,60" fill="#38bdf8" stroke="#ffffff" stroke-width="1" />
  <polygon points="26,60 32,8 38,60" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" />
  <polygon points="38,60 46,22 50,60" fill="#38bdf8" stroke="#ffffff" stroke-width="1" />
</svg>`
  },
  {
    id: 'door_vault_hatch',
    name: 'Vault Bulkhead Hatch',
    type: 'entity',
    category: 'doors',
    style: 'vault_hatch',
    path: 'assets/entities/doors/door_vault_hatch.svg',
    description: 'Heavy reinforced steel airtight bulkhead hatch with rotary wheel',
    tags: ['door', 'vault', 'hatch', 'bulkhead', 'metal'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="28" fill="#1e293b" stroke="#64748b" stroke-width="3" />
  <circle cx="32" cy="32" r="20" stroke="#fbbf24" stroke-width="2" fill="none" />
  <circle cx="32" cy="32" r="10" fill="#0f172a" stroke="#cbd5e1" stroke-width="2" />
  <line x1="32" y1="12" x2="32" y2="52" stroke="#cbd5e1" stroke-width="2" />
  <line x1="12" y1="32" x2="52" y2="32" stroke="#cbd5e1" stroke-width="2" />
  <circle cx="32" cy="32" r="4" fill="#fbbf24" />
</svg>`
  },

  // ==========================================
  // 6. ENTITIES - LEVERS
  // ==========================================
  {
    id: 'lever_switch_off',
    name: 'Floor Lever (Inactive / OFF)',
    type: 'entity',
    category: 'levers',
    style: 'switch_lever',
    state: 'off',
    path: 'assets/entities/levers/lever_switch_off.svg',
    description: 'Floor mechanism switch in unpulled state with red LED indicator',
    tags: ['lever', 'switch', 'mechanism', 'off'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="8" y="32" width="48" height="26" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" />
  <circle cx="20" cy="45" r="4" fill="#f43f5e" />
  <text x="20" y="55" font-family="monospace" font-size="6" fill="#fca5a5" font-weight="bold" text-anchor="middle">OFF</text>
  <rect x="36" y="40" width="16" height="8" fill="#0f172a" stroke="#64748b" stroke-width="1" />
  <line x1="44" y1="44" x2="36" y2="12" stroke="#cbd5e1" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="36" cy="12" r="5" fill="#e2e8f0" />
</svg>`
  },
  {
    id: 'lever_switch_on',
    name: 'Floor Lever (Active / ON)',
    type: 'entity',
    category: 'levers',
    style: 'switch_lever',
    state: 'on',
    path: 'assets/entities/levers/lever_switch_on.svg',
    description: 'Floor mechanism switch in pulled state with active green LED indicator',
    tags: ['lever', 'switch', 'mechanism', 'on'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="8" y="32" width="48" height="26" rx="4" fill="#064e3b" stroke="#34d399" stroke-width="2" />
  <circle cx="20" cy="45" r="4" fill="#34d399" />
  <text x="20" y="55" font-family="monospace" font-size="6" fill="#a7f3d0" font-weight="bold" text-anchor="middle">ON</text>
  <rect x="36" y="40" width="16" height="8" fill="#0f172a" stroke="#64748b" stroke-width="1" />
  <line x1="44" y1="44" x2="52" y2="12" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="52" cy="12" r="5" fill="#38bdf8" />
</svg>`
  },
  {
    id: 'pedestal_inactive',
    name: 'Stone Pedestal (Inactive)',
    type: 'entity',
    category: 'levers',
    style: 'pressure_pedestal',
    state: 'off',
    path: 'assets/entities/levers/pedestal_inactive.svg',
    description: 'Carved stone pressure plate pedestal in resting state',
    tags: ['pedestal', 'pressure', 'switch', 'stone'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="26" fill="#334155" stroke="#64748b" stroke-width="3" />
  <circle cx="32" cy="32" r="16" fill="#0f172a" />
</svg>`
  },
  {
    id: 'pedestal_active',
    name: 'Stone Pedestal (Active)',
    type: 'entity',
    category: 'levers',
    style: 'pressure_pedestal',
    state: 'on',
    path: 'assets/entities/levers/pedestal_active.svg',
    description: 'Carved stone pressure plate pedestal depressed and glowing green',
    tags: ['pedestal', 'pressure', 'switch', 'stone', 'active'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="26" fill="#334155" stroke="#34d399" stroke-width="3" />
  <circle cx="32" cy="32" r="14" fill="#059669" />
  <circle cx="32" cy="32" r="8" fill="#34d399" />
</svg>`
  },
  {
    id: 'crystal_switch_inactive',
    name: 'Resonance Crystal (Rest)',
    type: 'entity',
    category: 'levers',
    style: 'crystal_switch',
    state: 'off',
    path: 'assets/entities/levers/crystal_inactive.svg',
    description: 'Harmonic crystal switch in dormant state',
    tags: ['crystal', 'switch', 'resonance'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="32,8 46,32 32,56 18,32" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
</svg>`
  },
  {
    id: 'crystal_switch_active',
    name: 'Resonance Crystal (Active)',
    type: 'entity',
    category: 'levers',
    style: 'crystal_switch',
    state: 'on',
    path: 'assets/entities/levers/crystal_active.svg',
    description: 'Harmonic crystal switch glowing with active resonant green energy',
    tags: ['crystal', 'switch', 'resonance', 'active'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="32,8 46,32 32,56 18,32" fill="#34d399" stroke="#ffffff" stroke-width="2" />
  <circle cx="32" cy="32" r="8" fill="#ffffff" />
</svg>`
  },
  {
    id: 'runic_plate_off',
    name: 'Runic Inscription Plate (Inactive)',
    type: 'entity',
    category: 'levers',
    style: 'runic_plate',
    state: 'off',
    path: 'assets/entities/levers/runic_plate_off.svg',
    description: 'Floor rune inscription dormant',
    tags: ['rune', 'plate', 'floor', 'glyph'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="24" stroke="#a855f7" stroke-width="2" fill="none" />
  <text x="32" y="38" font-size="20" text-anchor="middle" fill="#a855f7">📜</text>
</svg>`
  },
  {
    id: 'runic_plate_on',
    name: 'Runic Inscription Plate (Active)',
    type: 'entity',
    category: 'levers',
    style: 'runic_plate',
    state: 'on',
    path: 'assets/entities/levers/runic_plate_on.svg',
    description: 'Floor rune inscription glowing active',
    tags: ['rune', 'plate', 'floor', 'glyph', 'active'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="24" stroke="#34d399" stroke-width="3" fill="none" />
  <text x="32" y="38" font-size="20" text-anchor="middle" fill="#34d399">⚡</text>
</svg>`
  },
  {
    id: 'cog_valve_off',
    name: 'Mechanical Valve (Closed)',
    type: 'entity',
    category: 'levers',
    style: 'cog_wheel',
    state: 'off',
    path: 'assets/entities/levers/cog_valve_off.svg',
    description: 'Industrial steam crank valve wheel closed',
    tags: ['valve', 'wheel', 'crank', 'closed'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="22" stroke="#94a3b8" stroke-width="4" fill="none" />
  <line x1="32" y1="10" x2="32" y2="54" stroke="#94a3b8" stroke-width="3" />
  <line x1="10" y1="32" x2="54" y2="32" stroke="#94a3b8" stroke-width="3" />
  <circle cx="32" cy="32" r="6" fill="#64748b" />
</svg>`
  },
  {
    id: 'cog_valve_on',
    name: 'Mechanical Valve (Open)',
    type: 'entity',
    category: 'levers',
    style: 'cog_wheel',
    state: 'on',
    path: 'assets/entities/levers/cog_valve_on.svg',
    description: 'Industrial steam crank valve wheel turned open with green conduit',
    tags: ['valve', 'wheel', 'crank', 'open'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="22" stroke="#34d399" stroke-width="4" fill="none" />
  <line x1="16" y1="16" x2="48" y2="48" stroke="#34d399" stroke-width="3" />
  <line x1="16" y1="48" x2="48" y2="16" stroke="#34d399" stroke-width="3" />
  <circle cx="32" cy="32" r="6" fill="#34d399" />
</svg>`
  },

  // ==========================================
  // 7. ENVIRONMENT - SPAWN
  // ==========================================
  {
    id: 'spawn_stairs_down',
    name: 'Entrance Stairs Down',
    type: 'environment',
    category: 'spawn',
    style: 'stairs_down',
    path: 'assets/environment/spawn/spawn_stairs_down.svg',
    description: 'Recessed stone staircase descending into the subterranean dungeon',
    tags: ['spawn', 'entrance', 'stairs', 'descent'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" fill="#0f172a" rx="2" />
  <rect x="8" y="10" width="48" height="8" fill="#475569" stroke="#1e293b" />
  <rect x="8" y="20" width="48" height="8" fill="#334155" stroke="#1e293b" />
  <rect x="8" y="30" width="48" height="8" fill="#1e293b" stroke="#1e293b" />
  <rect x="8" y="40" width="48" height="8" fill="#0f172a" stroke="#1e293b" />
  <text x="32" y="56" font-family="sans-serif" font-size="8" font-weight="bold" fill="#34d399" text-anchor="middle">ENTER</text>
</svg>`
  },
  {
    id: 'spawn_portal',
    name: 'Summoning Rift',
    type: 'environment',
    category: 'spawn',
    style: 'portal',
    path: 'assets/environment/spawn/spawn_portal.svg',
    description: 'Cyan swirling dimensional summoning rift',
    tags: ['spawn', 'portal', 'rift', 'magic'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="26" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" fill="none" />
  <circle cx="32" cy="32" r="18" fill="#0284c7" opacity="0.4" />
  <circle cx="32" cy="32" r="10" fill="#38bdf8" opacity="0.8" />
  <text x="32" y="38" font-size="18" fill="#ffffff" text-anchor="middle">▼</text>
</svg>`
  },
  {
    id: 'spawn_archway',
    name: 'Entrance Archway',
    type: 'environment',
    category: 'spawn',
    style: 'archway',
    path: 'assets/environment/spawn/spawn_archway.svg',
    description: 'Heavy ancient stone archway threshold',
    tags: ['spawn', 'archway', 'stone', 'ancient'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="6" y="6" width="52" height="52" fill="#0f172a" />
  <rect x="8" y="10" width="12" height="48" fill="#475569" />
  <rect x="44" y="10" width="12" height="48" fill="#475569" />
  <rect x="6" y="6" width="52" height="12" fill="#64748b" />
</svg>`
  },
  {
    id: 'spawn_pentagram',
    name: 'Runic Circle Spawn',
    type: 'environment',
    category: 'spawn',
    style: 'pentagram',
    path: 'assets/environment/spawn/spawn_pentagram.svg',
    description: 'Inscribed invocation runic circle',
    tags: ['spawn', 'pentagram', 'rune', 'magic'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="26" stroke="#a855f7" stroke-width="2" fill="none" />
  <polygon points="32,8 39,26 57,26 43,37 48,55 32,44 16,55 21,37 7,26 25,26" stroke="#c084fc" stroke-width="1.5" fill="none" />
</svg>`
  },
  {
    id: 'spawn_camp',
    name: 'Explorer Camp',
    type: 'environment',
    category: 'spawn',
    style: 'camp',
    path: 'assets/environment/spawn/spawn_camp.svg',
    description: 'Explorer starting camp tent and campfire',
    tags: ['spawn', 'camp', 'tent', 'explorer'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="12,52 32,16 52,52" fill="#78350f" stroke="#92400e" stroke-width="2" />
  <polygon points="24,52 32,32 40,52" fill="#0f172a" />
  <circle cx="54" cy="50" r="3" fill="#ef4444" />
</svg>`
  },

  // ==========================================
  // 8. ENVIRONMENT - EXIT
  // ==========================================
  {
    id: 'exit_portal',
    name: 'Cosmic Exit Portal',
    type: 'environment',
    category: 'exit',
    style: 'portal',
    path: 'assets/environment/exit/exit_portal.svg',
    description: 'Swirling dimensional victory exit portal with glowing glyph rings',
    tags: ['exit', 'portal', 'victory', 'cosmic'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="26" stroke="#0284c7" stroke-width="3" stroke-dasharray="6,4" fill="none" />
  <circle cx="32" cy="32" r="18" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3" fill="none" />
  <circle cx="32" cy="32" r="10" fill="#ffffff" />
</svg>`
  },
  {
    id: 'exit_stairs_up',
    name: 'Daylight Ascent Stairs',
    type: 'environment',
    category: 'exit',
    style: 'stairs_up',
    path: 'assets/environment/exit/exit_stairs_up.svg',
    description: 'Ascending stone staircase illuminated by warm golden daylight beams',
    tags: ['exit', 'stairs', 'daylight', 'victory'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" fill="#0f172a" rx="2" />
  <rect x="8" y="40" width="48" height="8" fill="#78350f" />
  <rect x="12" y="30" width="40" height="8" fill="#92400e" />
  <rect x="16" y="20" width="32" height="8" fill="#b45309" />
  <circle cx="32" cy="14" r="10" fill="#fef08a" opacity="0.9" />
  <text x="32" y="18" font-size="14" fill="#000000" font-weight="bold" text-anchor="middle">▲</text>
</svg>`
  },
  {
    id: 'exit_archway',
    name: 'Sanctuary Exit Archway',
    type: 'environment',
    category: 'exit',
    style: 'archway',
    path: 'assets/environment/exit/exit_archway.svg',
    description: 'Luminous victory sanctuary gateway threshold',
    tags: ['exit', 'archway', 'sanctuary', 'portal'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="8" y="10" width="12" height="48" fill="#475569" />
  <rect x="44" y="10" width="12" height="48" fill="#475569" />
  <path d="M 8 18 Q 32 4 56 18" stroke="#38bdf8" stroke-width="4" fill="none" />
  <rect x="20" y="20" width="24" height="38" fill="#38bdf8" opacity="0.4" />
</svg>`
  },
  {
    id: 'exit_treasure_chest',
    name: 'Treasure Vault Chest',
    type: 'environment',
    category: 'exit',
    style: 'chest',
    path: 'assets/environment/exit/exit_treasure_chest.svg',
    description: 'Golden reward treasure chest victory goal',
    tags: ['exit', 'chest', 'treasure', 'gold', 'victory'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="8" y="28" width="48" height="28" rx="2" fill="#78350f" stroke="#fbbf24" stroke-width="2" />
  <path d="M 8 28 Q 32 12 56 28 Z" fill="#92400e" stroke="#fbbf24" stroke-width="2" />
  <rect x="28" y="26" width="8" height="10" rx="1" fill="#fbbf24" stroke="#000000" stroke-width="1" />
  <circle cx="32" cy="31" r="1.5" fill="#000000" />
</svg>`
  },
  {
    id: 'exit_shrine',
    name: 'Sacred Torii Shrine',
    type: 'environment',
    category: 'exit',
    style: 'shrine',
    path: 'assets/environment/exit/exit_shrine.svg',
    description: 'Sacred torii shrine victory gateway',
    tags: ['exit', 'shrine', 'torii', 'sacred', 'victory'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="12" y="14" width="6" height="46" fill="#dc2626" />
  <rect x="46" y="14" width="6" height="46" fill="#dc2626" />
  <rect x="4" y="10" width="56" height="6" fill="#dc2626" rx="1" />
  <rect x="8" y="20" width="48" height="4" fill="#000000" />
  <circle cx="32" cy="36" r="8" fill="#fbbf24" opacity="0.6" />
</svg>`
  },

  // ==========================================
  // 9. PLAYER
  // ==========================================
  {
    id: 'player_ground',
    name: 'Adventurer (Ground Level)',
    type: 'player',
    category: 'player',
    style: 'ground',
    path: 'assets/player/player_ground.svg',
    description: 'Player hero avatar token at ground floor elevation',
    tags: ['player', 'hero', 'avatar', 'ground'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="22" fill="#0284c7" stroke="#38bdf8" stroke-width="3" />
  <circle cx="32" cy="32" r="14" fill="#38bdf8" />
  <circle cx="28" cy="26" r="4" fill="#ffffff" />
</svg>`
  },
  {
    id: 'player_overhead',
    name: 'Adventurer (Bridge Level)',
    type: 'player',
    category: 'player',
    style: 'overhead',
    path: 'assets/player/player_overhead.svg',
    description: 'Player hero avatar token at elevated bridge elevation with drop shadow',
    tags: ['player', 'hero', 'avatar', 'bridge', 'elevation'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="36" cy="46" rx="16" ry="6" fill="#000000" opacity="0.5" />
  <circle cx="32" cy="26" r="20" fill="#059669" stroke="#34d399" stroke-width="3" />
  <circle cx="32" cy="26" r="12" fill="#34d399" />
  <circle cx="28" cy="20" r="3.5" fill="#ffffff" />
</svg>`
  },
  {
    id: 'player_compass',
    name: 'Navigation Compass Pointer',
    type: 'player',
    category: 'player',
    style: 'compass',
    path: 'assets/player/player_compass.svg',
    description: 'Directional navigation compass pointing toward victory exit',
    tags: ['compass', 'navigation', 'direction', 'hud'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="28" fill="#0f172a" stroke="#fbbf24" stroke-width="2.5" />
  <polygon points="32,8 38,32 32,28 26,32" fill="#f43f5e" />
  <polygon points="32,56 38,32 32,36 26,32" fill="#94a3b8" />
  <circle cx="32" cy="32" r="3" fill="#fbbf24" />
</svg>`
  },

  // ==========================================
  // 10. UI & TOOLS
  // ==========================================
  {
    id: 'tool_pencil',
    name: 'Pencil Tool',
    type: 'ui',
    category: 'tools',
    style: 'icon',
    path: 'assets/ui/tool_pencil.svg',
    description: 'Pencil drawing tool icon',
    tags: ['ui', 'tool', 'pencil', 'draw'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="12,52 14,42 44,12 52,20 22,50" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
  <polygon points="12,52 10,54 20,52" fill="#ffffff" />
  <polygon points="44,12 52,20 56,16 48,8" fill="#f43f5e" />
</svg>`
  },
  {
    id: 'tool_line',
    name: 'Line Tool',
    type: 'ui',
    category: 'tools',
    style: 'icon',
    path: 'assets/ui/tool_line.svg',
    description: 'Straight line wall tool icon',
    tags: ['ui', 'tool', 'line', 'wall'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <line x1="12" y1="52" x2="52" y2="12" stroke="#a855f7" stroke-width="6" stroke-linecap="round" />
  <circle cx="12" cy="52" r="6" fill="#ffffff" stroke="#a855f7" stroke-width="2" />
  <circle cx="52" cy="12" r="6" fill="#ffffff" stroke="#a855f7" stroke-width="2" />
</svg>`
  },
  {
    id: 'tool_fill',
    name: 'Fill Bucket Tool',
    type: 'ui',
    category: 'tools',
    style: 'icon',
    path: 'assets/ui/tool_fill.svg',
    description: 'Flood fill bucket tool icon',
    tags: ['ui', 'tool', 'fill', 'bucket'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="16,30 36,10 54,28 34,48" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
  <path d="M 38 46 C 38 56 48 56 48 46" stroke="#38bdf8" stroke-width="3" fill="none" />
</svg>`
  },
  {
    id: 'tool_eraser',
    name: 'Eraser Tool',
    type: 'ui',
    category: 'tools',
    style: 'icon',
    path: 'assets/ui/tool_eraser.svg',
    description: 'Tile eraser tool icon',
    tags: ['ui', 'tool', 'eraser', 'clear'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="14,46 36,54 52,38 30,30" fill="#f43f5e" stroke="#be123c" stroke-width="2" />
  <polygon points="30,30 52,38 42,20 20,12" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2" />
</svg>`
  },
  {
    id: 'tool_select',
    name: 'Select / Inspect Tool',
    type: 'ui',
    category: 'tools',
    style: 'icon',
    path: 'assets/ui/tool_select.svg',
    description: 'Inspect magnifying cursor tool icon',
    tags: ['ui', 'tool', 'select', 'inspect'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="28" cy="28" r="16" stroke="#fbbf24" stroke-width="4" fill="none" />
  <line x1="40" y1="40" x2="56" y2="56" stroke="#fbbf24" stroke-width="6" stroke-linecap="round" />
  <circle cx="28" cy="28" r="8" fill="#fbbf24" opacity="0.3" />
</svg>`
  },
  {
    id: 'tool_move',
    name: 'Grab & Move Tool',
    type: 'ui',
    category: 'tools',
    style: 'icon',
    path: 'assets/ui/tool_move.svg',
    description: 'Grab and relocate object hand tool icon',
    tags: ['ui', 'tool', 'move', 'grab', 'hand'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M 22 36 L 22 20 C 22 17 26 17 26 20 L 26 34 L 28 16 C 28 13 32 13 32 16 L 32 34 L 34 18 C 34 15 38 15 38 18 L 38 34 L 40 22 C 40 19 44 19 44 22 L 44 38 C 44 48 36 56 26 56 C 18 56 14 50 14 44 L 22 36 Z" fill="#34d399" stroke="#059669" stroke-width="2" />
</svg>`
  }
];

// Write all SVGs to disk
for (const a of ASSET_DEFINITIONS) {
  fs.writeFileSync(a.path, a.svg, 'utf8');
}

// Generate canonical assets/manifest.json
const manifest = {
  $schema: './schema.json',
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  totalAssets: ASSET_DEFINITIONS.length,
  categories: {
    tiles: ['ground', 'bridges', 'ramps'],
    entities: ['keys', 'doors', 'levers'],
    environment: ['spawn', 'exit'],
    player: ['player'],
    ui: ['tools', 'viewport']
  },
  assets: ASSET_DEFINITIONS.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    category: a.category,
    style: a.style,
    state: a.state || undefined,
    path: a.path,
    viewBox: '0 0 64 64',
    description: a.description,
    tags: a.tags
  }))
};

fs.writeFileSync('assets/manifest.json', JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Generated ${ASSET_DEFINITIONS.length} SVG asset files and assets/manifest.json successfully!`);
