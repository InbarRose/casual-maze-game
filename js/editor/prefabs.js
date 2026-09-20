/**
 * Casual Maze Game — Architectural Prefabs & Stamp Palette (BL-20)
 *
 * Defines modular, reusable architectural prefabs (bridge crossings, locked vault gates,
 * Kishōtenketsu pillared chambers, 4-way crossroads, riddle sanctums, and clockwork switch hubs)
 * for one-click stamping in the Map Editor Studio.
 */

import { TILES } from '../core/constants.js';

/**
 * Architectural Prefabs Catalog
 */
export const PREFABS = {
  bridge_crossing: {
    id: 'bridge_crossing',
    name: 'Bridge Crossing (5x5)',
    description: 'Complete 2-elevation crossing: East-West ground corridor passing under a North-South overhead walkway with approach ramps.',
    width: 5,
    height: 5,
    layers: {
      ground: [
        [1, 1, TILES.RAMP_S, 1, 1],
        [1, 1, 0, 1, 1],
        [0, 0, TILES.BRIDGE_EW, 0, 0],
        [1, 1, 0, 1, 1],
        [1, 1, TILES.RAMP_N, 1, 1],
      ],
      overhead: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, TILES.BRIDGE_EW, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    },
    entities: [],
  },

  vault_gate: {
    id: 'vault_gate',
    name: 'Locked Vault Gate (5x3)',
    description: 'Chamber barrier with a locked vault door and its matching color key.',
    width: 5,
    height: 3,
    layers: {
      ground: [
        [0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1],
        [0, 0, 0, 0, 0],
      ],
      overhead: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    },
    entities: [
      {
        type: 'door',
        relX: 2,
        relY: 1,
        z: 0,
        color: '#fbbf24',
        name: 'Gold Vault Door',
        requiresKey: '__AUTO_KEY__',
      },
      {
        type: 'key',
        relX: 0,
        relY: 0,
        z: 0,
        color: '#fbbf24',
        name: 'Gold Vault Key',
        id: '__AUTO_KEY__',
      },
    ],
  },

  chamber_room: {
    id: 'chamber_room',
    name: 'Pillared Chamber (5x5)',
    description: 'Spacious Kishōtenketsu hall with 4 decorative corner pillars and wide ambulatory transit.',
    width: 5,
    height: 5,
    layers: {
      ground: [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
      ],
      overhead: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    },
    entities: [
      {
        type: 'wall_decor',
        relX: 1,
        relY: 1,
        z: 0,
        style: 'torch',
        loreText: 'Ancient stone pillar casting flickering amber light across the chamber.',
      },
      {
        type: 'wall_decor',
        relX: 3,
        relY: 1,
        z: 0,
        style: 'torch',
        loreText: 'Ancient stone pillar casting flickering amber light across the chamber.',
      },
    ],
  },

  cross_intersection: {
    id: 'cross_intersection',
    name: '4-Way Crossroads (5x5)',
    description: 'Smooth 4-way corridor junction flanked by solid corner masonry.',
    width: 5,
    height: 5,
    layers: {
      ground: [
        [1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1],
        [0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1],
      ],
      overhead: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    },
    entities: [],
  },

  puzzle_sanctum: {
    id: 'puzzle_sanctum',
    name: 'Riddle Sanctum (5x5)',
    description: 'Enclosed sacred sanctuary with an inscribed riddle pedestal, carried animal totem relic, and locked sanctuary gate.',
    width: 5,
    height: 5,
    layers: {
      ground: [
        [1, 1, 0, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1],
        [0, 0, 0, 0, 0],
      ],
      overhead: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    },
    entities: [
      {
        type: 'pedestal',
        relX: 2,
        relY: 1,
        z: 0,
        name: 'Falcon Pedestal',
        prompt: 'Only the soaring bird of prey may unseal the sanctum gates.',
        acceptedItemId: '__AUTO_RELIC__',
        targetDoorId: '__AUTO_DOOR__',
      },
      {
        type: 'riddle_item',
        relX: 1,
        relY: 2,
        z: 0,
        symbol: '🦅',
        name: 'Falcon Statue',
        id: '__AUTO_RELIC__',
      },
      {
        type: 'door',
        relX: 2,
        relY: 3,
        z: 0,
        color: '#fbbf24',
        name: 'Sanctum Barrier Gate',
        id: '__AUTO_DOOR__',
      },
    ],
  },

  switch_hub: {
    id: 'switch_hub',
    name: 'Clockwork Switch Hub (5x4)',
    description: 'Mechanical switch station with a lever wired to toggle adjacent corridor security walls.',
    width: 5,
    height: 4,
    layers: {
      ground: [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      overhead: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    },
    entities: [
      {
        type: 'lever',
        relX: 1,
        relY: 1,
        z: 0,
        name: 'Clockwork Lever',
        style: 'switch',
        targets: [
          { relX: 2, relY: 1, layer: 'ground', tile: 0 },
        ],
      },
    ],
  },
};

/**
 * Stamp a prefab onto a level object at specified grid coordinates.
 * Clamps to level boundaries and assigns unique IDs to generated entities.
 *
 * @param {object} level The level data object
 * @param {string} prefabId ID of the prefab from PREFABS
 * @param {number} originX Top-left grid X
 * @param {number} originY Top-left grid Y
 * @returns {{ success: boolean, stampedCount: number, entitiesCreated: number }}
 */
export function stampPrefab(level, prefabId, originX, originY) {
  const prefab = PREFABS[prefabId];
  if (!prefab || !level || !level.layers) {
    return { success: false, stampedCount: 0, entitiesCreated: 0 };
  }

  const { width, height } = level.dimensions;
  const uid = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  let stampedCount = 0;
  let entitiesCreated = 0;

  // 1. Stamp Ground & Overhead Tiles
  for (let dy = 0; dy < prefab.height; dy++) {
    for (let dx = 0; dx < prefab.width; dx++) {
      const gx = originX + dx;
      const gy = originY + dy;

      if (gx < 0 || gx >= width || gy < 0 || gy >= height) continue;

      if (prefab.layers.ground && prefab.layers.ground[dy] && prefab.layers.ground[dy][dx] !== undefined) {
        if (!level.layers.ground[gy]) level.layers.ground[gy] = [];
        level.layers.ground[gy][gx] = prefab.layers.ground[dy][dx];
        stampedCount++;
      }

      if (prefab.layers.overhead && prefab.layers.overhead[dy] && prefab.layers.overhead[dy][dx] !== undefined) {
        if (!level.layers.overhead) level.layers.overhead = [];
        if (!level.layers.overhead[gy]) level.layers.overhead[gy] = [];
        level.layers.overhead[gy][gx] = prefab.layers.overhead[dy][dx];
      }
    }
  }

  // 2. Instantiate and Link Entities
  if (!Array.isArray(level.entities)) {
    level.entities = [];
  }

  const autoKeyId = `key_${uid}`;
  const autoDoorId = `door_${uid}`;
  const autoRelicId = `relic_${uid}`;

  for (const entDef of prefab.entities) {
    const ex = originX + entDef.relX;
    const ey = originY + entDef.relY;

    if (ex < 0 || ex >= width || ey < 0 || ey >= height) continue;

    // Remove any existing entity at the exact coordinate & elevation to avoid stacking
    const targetZ = entDef.z || 0;
    level.entities = level.entities.filter(e => !(e.x === ex && e.y === ey && (e.z ?? e.elevation ?? 0) === targetZ));

    const newEntity = {
      ...entDef,
      x: ex,
      y: ey,
      elevation: targetZ,
      z: targetZ,
    };
    delete newEntity.relX;
    delete newEntity.relY;

    // Resolve dynamic ID place-holders
    if (newEntity.id === '__AUTO_KEY__') newEntity.id = autoKeyId;
    else if (newEntity.id === '__AUTO_DOOR__') newEntity.id = autoDoorId;
    else if (newEntity.id === '__AUTO_RELIC__') newEntity.id = autoRelicId;
    else if (!newEntity.id) newEntity.id = `${entDef.type}_${uid}_${entitiesCreated}`;

    if (newEntity.requiresKey === '__AUTO_KEY__') newEntity.requiresKey = autoKeyId;
    if (newEntity.targetDoorId === '__AUTO_DOOR__') newEntity.targetDoorId = autoDoorId;
    if (newEntity.acceptedItemId === '__AUTO_RELIC__') newEntity.acceptedItemId = autoRelicId;

    // Resolve lever target relative coordinates
    if (Array.isArray(newEntity.targets)) {
      newEntity.targets = newEntity.targets.map(t => ({
        x: originX + (t.relX ?? 0),
        y: originY + (t.relY ?? 0),
        layer: t.layer || 'ground',
        tile: t.tile ?? 0,
      }));
    }

    level.entities.push(newEntity);
    entitiesCreated++;
  }

  return { success: true, stampedCount, entitiesCreated };
}
