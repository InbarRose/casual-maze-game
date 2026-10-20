/**
 * Casual Maze Game — Automated Level Metrics & Architectural Telemetry
 * 
 * Computes empirical game design and spatial metrics for all levels:
 * - Playable area ratio & solid wall density
 * - Solid 4x4 dead space blocks (DeadSpace >= 4x4)
 * - Corridor inertia index (% straight hallway persistence)
 * - 3D verticality elements (bridges, ramps, platforms, wall walks)
 * - Entity & key economy counts
 * - BFS optimal steps and empirical par calibration ratio
 * 
 * Usage:
 *   node scripts/audit-level-metrics.mjs [--json] [--level=<id>]
 */

import fs from 'fs';
import path from 'path';
import { solveLevel } from '../js/engine/solver.js';

/**
 * Audits a single level object and returns detailed metrics
 * @param {object} levelData Canonical level definition
 * @returns {object} Granular metrics
 */
export function auditLevelMetrics(levelData) {
  if (!levelData || !levelData.layers || !levelData.layers.ground) {
    return null;
  }

  const ground = levelData.layers.ground;
  const overhead = levelData.layers.overhead || [];
  const h = ground.length;
  const w = ground[0].length;
  const totalTiles = w * h;

  let walkableCount = 0;
  let wallCount = 0;
  let bridgeCount = 0;
  let rampCount = 0;
  let platformCount = 0;

  const isWalkable = (g, o) => {
    if (g === 0 || g === '0') return true;
    if (g === 'B_EW' || g === 'B_NS' || g === 'BRIDGE_EW' || g === 'BRIDGE_NS') return true;
    if (typeof g === 'string' && (g.startsWith('R_') || g.startsWith('RAMP_'))) return true;
    if (g === 'PLATFORM' || g === 'WALL_WALK' || g === 'WW' || g === 'PL') return true;
    if (o === 'B_EW' || o === 'B_NS' || o === 'BRIDGE_EW' || o === 'BRIDGE_NS') return true;
    if (typeof o === 'string' && (o.startsWith('R_') || o.startsWith('RAMP_'))) return true;
    if (o === 'PLATFORM' || o === 'WALL_WALK' || o === 'WW' || o === 'PL') return true;
    return false;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const g = ground[y][x];
      const o = overhead[y] ? overhead[y][x] : 0;

      if (g === 1 || g === '1') {
        wallCount++;
      }
      if (isWalkable(g, o)) {
        walkableCount++;
      }

      if (g === 'B_EW' || g === 'B_NS' || o === 'B_EW' || o === 'B_NS' || g === 'BRIDGE_EW' || g === 'BRIDGE_NS' || o === 'BRIDGE_EW' || o === 'BRIDGE_NS') {
        bridgeCount++;
      }
      if ((typeof g === 'string' && g.startsWith('R_')) || (typeof o === 'string' && o.startsWith('R_'))) {
        rampCount++;
      }
      if (g === 'PLATFORM' || g === 'WALL_WALK' || o === 'PLATFORM' || o === 'WALL_WALK' || g === 'WW' || o === 'WW' || g === 'PL' || o === 'PL') {
        platformCount++;
      }
    }
  }

  // Detect solid 4x4 dead spaces in ground layer
  const deadSpaces = [];
  for (let y = 1; y < h - 4; y++) {
    for (let x = 1; x < w - 4; x++) {
      let isAllWall = true;
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          if (ground[y + dy][x + dx] !== 1 && ground[y + dy][x + dx] !== '1') {
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

  // Calculate corridor inertia & decision points
  let corridorTileCount = 0;
  let straightCorridorTileCount = 0;
  let decisionPoints = 0;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const g = ground[y][x];
      const o = overhead[y] ? overhead[y][x] : 0;
      if (!isWalkable(g, o)) continue;

      const northWalk = isWalkable(ground[y - 1][x], overhead[y - 1] ? overhead[y - 1][x] : 0);
      const southWalk = isWalkable(ground[y + 1][x], overhead[y + 1] ? overhead[y + 1][x] : 0);
      const westWalk = isWalkable(ground[y][x - 1], overhead[y] ? overhead[y][x - 1] : 0);
      const eastWalk = isWalkable(ground[y][x + 1], overhead[y] ? overhead[y][x + 1] : 0);

      const degree = (northWalk ? 1 : 0) + (southWalk ? 1 : 0) + (westWalk ? 1 : 0) + (eastWalk ? 1 : 0);

      if (degree >= 3) {
        decisionPoints++;
      } else if (degree === 2) {
        corridorTileCount++;
        // Straight if (North & South) or (West & East)
        if ((northWalk && southWalk && !westWalk && !eastWalk) || (!northWalk && !southWalk && westWalk && eastWalk)) {
          straightCorridorTileCount++;
        }
      }
    }
  }

  const corridorInertiaPercent = corridorTileCount > 0
    ? Math.round((straightCorridorTileCount / corridorTileCount) * 100)
    : 100;

  // Entity metrics
  const entities = levelData.entities || [];
  const keys = entities.filter(e => e.type === 'key').length;
  const doors = entities.filter(e => e.type === 'door').length;
  const levers = entities.filter(e => e.type === 'lever' || e.type === 'switch').length;
  const portals = entities.filter(e => e.type === 'portal' || e.type === 'teleporter').length;
  const hazards = entities.filter(e => e.type === 'timed_hazard' || e.type === 'hazard' || e.type === 'spike_trap' || e.type === 'flame_vent').length;
  const sentinels = entities.filter(e => e.type === 'patroller' || e.type === 'sentinel').length;
  const secrets = entities.filter(e => e.type === 'secret_wall' || e.type === 'gem' || e.type === 'relic').length;
  const inscriptions = entities.filter(e => e.type === 'signpost' || e.type === 'inscription' || e.type === 'wall_decor' || e.type === 'inspectable').length;

  // Solvability & Par Step Calibration
  let optimalSteps = null;
  let parRatio = null;
  let isSolvable = false;

  try {
    const solution = solveLevel(levelData);
    if (solution && solution.length > 0) {
      isSolvable = true;
      optimalSteps = solution.length - 1;
      if (levelData.parSteps && optimalSteps > 0) {
        parRatio = +(levelData.parSteps / optimalSteps).toFixed(2);
      }
    }
  } catch (err) {
    isSolvable = false;
  }

  return {
    id: levelData.id,
    title: levelData.title,
    theme: levelData.theme || 'dungeon',
    width: w,
    height: h,
    dimensions: `${w}x${h}`,
    totalTiles,
    walkableTiles: walkableCount,
    wallTiles: wallCount,
    playableRatio: +(walkableCount / totalTiles).toFixed(3),
    deadSpace4x4Count: deadSpaces.length,
    bridges: bridgeCount,
    ramps: rampCount,
    platforms: platformCount,
    total3DElements: bridgeCount + rampCount + platformCount,
    corridorTiles: corridorTileCount,
    straightCorridorTiles: straightCorridorTileCount,
    corridorInertiaPercent,
    decisionPoints,
    entities: {
      keys,
      doors,
      levers,
      portals,
      hazards,
      sentinels,
      secrets,
      inscriptions,
      total: entities.length
    },
    isSolvable,
    optimalSteps,
    parSteps: levelData.parSteps || null,
    parTime: levelData.parTime || null,
    parRatio,
    hasFogOfWar: !!levelData.fogOfWar
  };
}

/**
 * Main execution routine: reads levels/manifest.json and audits all 53 platform levels
 */
export function auditAllPlatformLevels() {
  const manifestPath = path.resolve(process.cwd(), 'levels/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`levels/manifest.json not found at ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results = [];

  for (const entry of manifest) {
    const fullPath = path.resolve(process.cwd(), entry.file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[WARN] Level file not found: ${fullPath}`);
      continue;
    }

    const levelData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const metrics = auditLevelMetrics(levelData);

    // If multi-room, audit rooms as well
    if (levelData.rooms && typeof levelData.rooms === 'object') {
      const roomMetrics = {};
      for (const [roomId, room] of Object.entries(levelData.rooms)) {
        roomMetrics[roomId] = auditLevelMetrics({
          id: `${levelData.id}_${roomId}`,
          title: room.title || roomId,
          theme: room.theme || levelData.theme,
          layers: room.layers,
          entities: room.entities,
          spawn: room.spawn,
          exit: room.exit
        });
      }
      metrics.rooms = roomMetrics;
    }

    results.push(metrics);
  }

  return results;
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith('audit-level-metrics.mjs')) {
  const isJson = process.argv.includes('--json');
  const levelFilterArg = process.argv.find(a => a.startsWith('--level='));
  const levelFilter = levelFilterArg ? levelFilterArg.split('=')[1] : null;

  const results = auditAllPlatformLevels();
  const filtered = levelFilter ? results.filter(r => r.id === levelFilter) : results;

  if (isJson) {
    console.log(JSON.stringify(filtered, null, 2));
  } else {
    console.log('\n========================================================================================');
    console.log('         CASUAL MAZE GAME — AUTOMATED LEVEL METRICS & TELEMETRY AUDIT');
    console.log('========================================================================================\n');
    console.log('ID'.padEnd(16) + 'Title'.padEnd(26) + 'Dim'.padEnd(8) + 'Dead4x4'.padEnd(10) + 'Inertia'.padEnd(10) + '3D Elem'.padEnd(10) + 'Ents'.padEnd(8) + 'Par/Opt');
    console.log('─'.repeat(96));

    let totalDeadSpace = 0;
    let total3D = 0;
    let totalEnts = 0;
    let inertiaSum = 0;

    for (const r of filtered) {
      totalDeadSpace += r.deadSpace4x4Count;
      total3D += r.total3DElements;
      totalEnts += r.entities.total;
      inertiaSum += r.corridorInertiaPercent;

      const parRatioStr = r.parSteps && r.optimalSteps ? `${r.parSteps}/${r.optimalSteps} (${r.parRatio}x)` : 'N/A';
      console.log(
        r.id.padEnd(16) +
        r.title.slice(0, 24).padEnd(26) +
        r.dimensions.padEnd(8) +
        r.deadSpace4x4Count.toString().padStart(4).padEnd(10) +
        `${r.corridorInertiaPercent}%`.padStart(5).padEnd(10) +
        r.total3DElements.toString().padStart(4).padEnd(10) +
        r.entities.total.toString().padStart(4).padEnd(8) +
        parRatioStr
      );

      if (r.rooms) {
        for (const [roomId, room] of Object.entries(r.rooms)) {
          if (!room) continue;
          console.log(
            `  └─ ${roomId}`.padEnd(16) +
            room.title.slice(0, 22).padEnd(26) +
            room.dimensions.padEnd(8) +
            room.deadSpace4x4Count.toString().padStart(4).padEnd(10) +
            `${room.corridorInertiaPercent}%`.padStart(5).padEnd(10) +
            room.total3DElements.toString().padStart(4).padEnd(10) +
            room.entities.total.toString().padStart(4).padEnd(8) +
            'room'
          );
        }
      }
    }

    const avgInertia = Math.round(inertiaSum / filtered.length);
    console.log('─'.repeat(96));
    console.log(`TOTAL LEVELS: ${filtered.length} | TOTAL DEAD 4x4: ${totalDeadSpace} | AVG INERTIA: ${avgInertia}% | TOTAL 3D ELEMENTS: ${total3D} | TOTAL ENTITIES: ${totalEnts}`);
    console.log('========================================================================================\n');
  }
}
