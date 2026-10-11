/**
 * Casual Maze Game — Procedural Maze Generator (BL-50)
 * Generates 100% solvable labyrinths with configurable dimensions, biomes,
 * loopiness/braid factor, and optional key-door puzzle gating.
 */

import { TILES, ENTITY_TYPES, KEY_COLOR_PRESETS } from './constants.js';
import { LevelValidator } from '../editor/level-validator.js';

export const BIOMES = Object.freeze(['dungeon', 'glacial', 'jungle', 'magma', 'temple']);

export class MazeGenerator {
  /**
   * Generate a fully-formed, schema-compliant and solvable level JSON
   * @param {Object} [options]
   * @param {number} [options.width=15] Maze width (clamped odd integer >= 7)
   * @param {number} [options.height=15] Maze height (clamped odd integer >= 7)
   * @param {string} [options.theme='dungeon'] Biome theme ('dungeon'|'glacial'|'jungle'|'magma'|'temple'|'random')
   * @param {number} [options.braid=0.25] Probability of removing dead ends to create loops [0.0, 1.0]
   * @param {number} [options.keyPairs=1] Number of key-door pairs to generate (0 to 3)
   * @param {boolean} [options.fogOfWar=true] Fog of war toggle
   * @param {number} [options.viewRadius=6] Fog view radius
   * @param {string} [options.title] Optional custom level title
   * @param {Function} [options.prng] Optional PRNG function returning [0, 1)
   * @returns {Object} Complete level object
   */
  static generate(options = {}) {
    const random = typeof options.prng === 'function' ? options.prng : Math.random;

    // 1. Dimensions: clamp to odd integers >= 7
    let w = Math.max(7, parseInt(options.width, 10) || 15);
    let h = Math.max(7, parseInt(options.height, 10) || 15);
    if (w % 2 === 0) w += 1;
    if (h % 2 === 0) h += 1;

    // 2. Biome Theme
    let theme = options.theme || 'dungeon';
    if (theme === 'random' || !BIOMES.includes(theme)) {
      theme = BIOMES[Math.floor(random() * BIOMES.length)];
    }

    // 3. Initialize grid: all solid walls
    const ground = [];
    const overhead = [];
    for (let y = 0; y < h; y++) {
      const gRow = [];
      const oRow = [];
      for (let x = 0; x < w; x++) {
        gRow.push(TILES.WALL);
        oRow.push(0);
      }
      ground.push(gRow);
      overhead.push(oRow);
    }

    // 4. Carve passages using Depth-First Search with backtracking
    const startX = 1;
    const startY = 1;
    ground[startY][startX] = TILES.FLOOR;

    const stack = [[startX, startY]];
    const directions = [
      [0, -2], // North
      [0, 2],  // South
      [-2, 0], // West
      [2, 0],  // East
    ];

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];

      // Shuffle directions
      const shuffled = [...directions].sort(() => random() - 0.5);
      let carved = false;

      for (const [dx, dy] of shuffled) {
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1 && ground[ny][nx] === TILES.WALL) {
          // Carve wall between (cx, cy) and (nx, ny)
          ground[cy + dy / 2][cx + dx / 2] = TILES.FLOOR;
          ground[ny][nx] = TILES.FLOOR;
          stack.push([nx, ny]);
          carved = true;
          break;
        }
      }

      if (!carved) {
        stack.pop();
      }
    }

    // 5. Braid Phase: remove dead ends to introduce cycles/loops
    const braidRate = Math.min(1.0, Math.max(0.0, options.braid ?? 0.25));
    if (braidRate > 0) {
      this.braidMaze(ground, w, h, braidRate, random);
    }

    // 6. Spawn and Exit
    const spawn = { x: startX, y: startY, elevation: 0, style: 'stairs_down' };

    // Run BFS to find cell with maximum distance from spawn
    const { distances, predecessors } = this.calculateDistances(ground, w, h, spawn.x, spawn.y);

    let maxDist = -1;
    let exitX = startX;
    let exitY = startY;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const d = distances[y][x];
        if (d > maxDist) {
          maxDist = d;
          exitX = x;
          exitY = y;
        }
      }
    }

    const exit = { x: exitX, y: exitY, elevation: 0, style: 'portal' };

    // 7. Key and Door Pairs
    const entities = [];
    const requestedKeys = Math.min(3, Math.max(0, parseInt(options.keyPairs, 10) || 0));

    if (requestedKeys > 0 && maxDist >= 8) {
      this.insertKeyDoorPuzzles(ground, w, h, spawn, exit, predecessors, requestedKeys, entities, random);
    }

    // 8. Par calculations
    const parSteps = Math.max(8, Math.ceil(maxDist * 1.25));
    const parTime = Math.max(6, Math.ceil(parSteps * 0.75));

    const themeTitle = theme.charAt(0).toUpperCase() + theme.slice(1);
    const title = options.title || `${themeTitle} Labyrinth`;

    const level = {
      id: options.id || `procedural_${Date.now()}`,
      title,
      chapter: 'procedural',
      zone: 'endless',
      author: 'Architect PRNG',
      version: 1,
      dimensions: { width: w, height: h },
      config: {
        fogOfWar: options.fogOfWar !== false,
        viewRadius: typeof options.viewRadius === 'number' ? options.viewRadius : 6,
        allowFreePan: true,
        tileSize: 32,
        theme,
      },
      spawn,
      exit,
      parSteps,
      parTime,
      architectNote: `Procedurally generated ${theme} labyrinth (${w}x${h}) with braid factor ${Math.round(braidRate * 100)}%.`,
      layers: {
        ground,
        overhead,
      },
      entities,
    };

    // 9. Validation
    const validation = LevelValidator.validate(level);
    if (!validation.valid) {
      console.warn('[MazeGenerator] LevelValidator found warnings, running autoFix:', validation.errors);
      LevelValidator.autoFix(level);
    }

    return level;
  }

  /**
   * Braid phase: convert dead-ends into loopbacks with probability `rate`
   */
  static braidMaze(ground, w, h, rate, random) {
    const deadEnds = [];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if (ground[y][x] !== TILES.FLOOR) continue;

        let openNeighbors = 0;
        if (ground[y - 1][x] === TILES.FLOOR) openNeighbors++;
        if (ground[y + 1][x] === TILES.FLOOR) openNeighbors++;
        if (ground[y][x - 1] === TILES.FLOOR) openNeighbors++;
        if (ground[y][x + 1] === TILES.FLOOR) openNeighbors++;

        if (openNeighbors === 1) {
          deadEnds.push([x, y]);
        }
      }
    }

    for (const [x, y] of deadEnds) {
      if (random() > rate) continue;

      const candidates = [];
      if (y > 2 && ground[y - 1][x] === TILES.WALL && ground[y - 2][x] === TILES.FLOOR) {
        candidates.push([x, y - 1]);
      }
      if (y < h - 3 && ground[y + 1][x] === TILES.WALL && ground[y + 2][x] === TILES.FLOOR) {
        candidates.push([x, y + 1]);
      }
      if (x > 2 && ground[y][x - 1] === TILES.WALL && ground[y][x - 2] === TILES.FLOOR) {
        candidates.push([x - 1, y]);
      }
      if (x < w - 3 && ground[y][x + 1] === TILES.WALL && ground[y][x + 2] === TILES.FLOOR) {
        candidates.push([x + 1, y]);
      }

      if (candidates.length > 0) {
        const [wx, wy] = candidates[Math.floor(random() * candidates.length)];
        ground[wy][wx] = TILES.FLOOR;
      }
    }
  }

  /**
   * Compute BFS distances from origin to all cells
   */
  static calculateDistances(ground, w, h, originX, originY) {
    const distances = Array.from({ length: h }, () => Array(w).fill(-1));
    const predecessors = Array.from({ length: h }, () => Array(w).fill(null));

    distances[originY][originX] = 0;
    const queue = [[originX, originY]];

    const cardinal = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];

    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      const currentDist = distances[cy][cx];

      for (const [dx, dy] of cardinal) {
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          if (ground[ny][nx] === TILES.FLOOR && distances[ny][nx] === -1) {
            distances[ny][nx] = currentDist + 1;
            predecessors[ny][nx] = [cx, cy];
            queue.push([nx, ny]);
          }
        }
      }
    }

    return { distances, predecessors };
  }

  /**
   * Insert key and door pairs along critical path with reachable key branches
   */
  static insertKeyDoorPuzzles(ground, w, h, spawn, exit, predecessors, count, entities, random) {
    // 1. Reconstruct main path from exit back to spawn
    const path = [];
    let cur = [exit.x, exit.y];

    while (cur) {
      path.push(cur);
      const [cx, cy] = cur;
      if (cx === spawn.x && cy === spawn.y) break;
      cur = predecessors[cy][cx];
    }
    path.reverse();

    if (path.length < 10) return;

    const availableColors = KEY_COLOR_PRESETS.map(c => c.id);

    for (let k = 0; k < count; k++) {
      const colorId = availableColors[k % availableColors.length];
      const doorId = `door_${colorId}_${k + 1}`;
      const keyId = `key_${colorId}_${k + 1}`;

      // Door placement along path (e.g., at 45% - 75% progress)
      const minIdx = Math.floor(path.length * 0.35);
      const maxIdx = Math.floor(path.length * 0.75);
      const doorIdx = minIdx + Math.floor(random() * (maxIdx - minIdx + 1));
      const [doorX, doorY] = path[doorIdx];

      // Key placement: find floor tiles reachable from spawn WITHOUT passing through (doorX, doorY)
      const reachableBeforeDoor = [];
      const visitedBeforeDoor = new Set();
      visitedBeforeDoor.add(`${spawn.x},${spawn.y}`);
      const q = [[spawn.x, spawn.y]];

      while (q.length > 0) {
        const [cx, cy] = q.shift();
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1) {
            if (nx === doorX && ny === doorY) continue; // Blocked by closed door
            const keyStr = `${nx},${ny}`;
            if (ground[ny][nx] === TILES.FLOOR && !visitedBeforeDoor.has(keyStr)) {
              visitedBeforeDoor.add(keyStr);
              reachableBeforeDoor.push([nx, ny]);
              q.push([nx, ny]);
            }
          }
        }
      }

      if (reachableBeforeDoor.length === 0) continue;

      let keyX = null;
      let keyY = null;

      // Prefer placing key in an off-path alcove reachable before the door
      const offPath = reachableBeforeDoor.filter(([rx, ry]) => !path.some(([px, py]) => px === rx && py === ry));
      if (offPath.length > 0) {
        const [kx, ky] = offPath[Math.floor(random() * offPath.length)];
        keyX = kx;
        keyY = ky;
      } else {
        // Otherwise place on path before door
        const [kx, ky] = reachableBeforeDoor[Math.floor(random() * reachableBeforeDoor.length)];
        keyX = kx;
        keyY = ky;
      }

      // Add Door Entity
      entities.push({
        id: doorId,
        type: ENTITY_TYPES.DOOR,
        x: doorX,
        y: doorY,
        elevation: 0,
        color: colorId,
        requiresKey: keyId,
        keyId,
        isOpen: false,
      });

      // Add Key Entity
      entities.push({
        id: keyId,
        type: ENTITY_TYPES.KEY,
        x: keyX,
        y: keyY,
        elevation: 0,
        color: colorId,
      });
    }
  }
}
