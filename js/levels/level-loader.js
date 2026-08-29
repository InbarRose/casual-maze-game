/**
 * Casual Maze Game - Level Loader & Procedural Generator
 */

import { TILES, DEFAULTS, LAYERS } from '../core/constants.js';
import { PRNG } from '../core/prng.js';
import { StorageManager } from '../core/storage.js';
import { CAMPAIGN_LEVELS } from './default-levels.js';

export class LevelLoader {
  /**
   * Load level from URL parameters, session storage, or campaign
   * @param {URLSearchParams} [params]
   * @returns {object} Canonical Level Object
   */
  static loadFromParams(params = new URLSearchParams(window.location.search)) {
    const mode = params.get('mode');
    const id = params.get('id') || '1';

    if (mode === 'custom') {
      const customData = StorageManager.loadCustomMaze();
      if (customData) {
        return this.normalizeLevel(customData);
      }
      console.warn('[LevelLoader] Custom maze requested but none found in session storage. Falling back to Level 1.');
    }

    // Check campaign levels
    const campaignMatch = CAMPAIGN_LEVELS.find(lvl => String(lvl.id) === String(id));
    if (campaignMatch) {
      return this.normalizeLevel(JSON.parse(JSON.stringify(campaignMatch)));
    }

    // Otherwise, generate deterministic procedural maze based on seed
    return this.generateProceduralLevel(id);
  }

  /**
   * Validate and normalize a level object
   * @param {object} raw
   * @returns {object}
   */
  static normalizeLevel(raw) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid level object');
    }

    const width = raw.dimensions?.width || 21;
    const height = raw.dimensions?.height || 21;

    const normalized = {
      $schema: raw.$schema || 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
      id: String(raw.id || 'custom'),
      title: raw.title || 'Untitled Labyrinth',
      author: raw.author || 'Anonymous',
      version: raw.version || 1,
      dimensions: { width, height },
      config: {
        fogOfWar: raw.config?.fogOfWar !== undefined ? !!raw.config.fogOfWar : DEFAULTS.FOG_OF_WAR,
        viewRadius: raw.config?.viewRadius || DEFAULTS.VIEW_RADIUS,
        allowFreePan: raw.config?.allowFreePan !== undefined ? !!raw.config.allowFreePan : DEFAULTS.ALLOW_FREE_PAN,
        tileSize: raw.config?.tileSize || DEFAULTS.TILE_SIZE,
        theme: raw.config?.theme || DEFAULTS.THEME,
      },
      spawn: {
        x: raw.spawn?.x ?? 1,
        y: raw.spawn?.y ?? 1,
        elevation: raw.spawn?.elevation ?? 0,
      },
      exit: {
        x: raw.exit?.x ?? width - 2,
        y: raw.exit?.y ?? height - 2,
      },
      layers: {
        ground: this.normalizeGrid(raw.layers?.ground, width, height, TILES.FLOOR),
        overhead: this.normalizeGrid(raw.layers?.overhead, width, height, 0),
      },
      entities: Array.isArray(raw.entities) ? raw.entities.map(e => ({ ...e })) : [],
    };

    return normalized;
  }

  /**
   * Ensure grid has exact dimensions and valid tile values
   * @param {Array<Array<*>>} grid
   * @param {number} width
   * @param {number} height
   * @param {*} defaultTile
   * @returns {Array<Array<*>>}
   */
  static normalizeGrid(grid, width, height, defaultTile = 0) {
    const result = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      const srcRow = grid && grid[y];
      for (let x = 0; x < width; x++) {
        if (srcRow && srcRow[x] !== undefined) {
          row.push(srcRow[x]);
        } else {
          // Perimeter is wall on ground layer
          if (defaultTile === TILES.FLOOR && (x === 0 || y === 0 || x === width - 1 || y === height - 1)) {
            row.push(TILES.WALL);
          } else {
            row.push(defaultTile);
          }
        }
      }
      result.push(row);
    }
    return result;
  }

  /**
   * Generates a solvable procedural labyrinth with bridge crossovers & keys
   * @param {string|number} seed
   * @param {number} [width=25]
   * @param {number} [height=25]
   * @returns {object}
   */
  static generateProceduralLevel(seed, width = 23, height = 23) {
    const prng = new PRNG(seed);
    // Ensure odd dimensions for proper maze cell grid
    if (width % 2 === 0) width++;
    if (height % 2 === 0) height++;

    // 1. Initialize ground layer with walls (1)
    const ground = Array.from({ length: height }, () => Array(width).fill(TILES.WALL));
    const overhead = Array.from({ length: height }, () => Array(width).fill(0));

    // 2. Randomized Recursive Backtracker / DFS
    const stack = [];
    const startX = 1;
    const startY = 1;
    ground[startY][startX] = TILES.FLOOR;
    stack.push({ x: startX, y: startY });

    const dirs = [
      { dx: 0, dy: -2 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 },
      { dx: 2, dy: 0 },
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];

      for (const d of dirs) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && ground[ny][nx] === TILES.WALL) {
          neighbors.push({ x: nx, y: ny, wallX: current.x + d.dx / 2, wallY: current.y + d.dy / 2 });
        }
      }

      if (neighbors.length > 0) {
        const next = prng.choice(neighbors);
        ground[next.wallY][next.wallX] = TILES.FLOOR;
        ground[next.y][next.x] = TILES.FLOOR;
        stack.push({ x: next.x, y: next.y });
      } else {
        stack.pop();
      }
    }

    // 3. Find Dead Ends and Potential Key / Exit Placements
    const deadEnds = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (ground[y][x] === TILES.FLOOR && !(x === startX && y === startY)) {
          let openNeighbors = 0;
          if (ground[y - 1][x] === TILES.FLOOR) openNeighbors++;
          if (ground[y + 1][x] === TILES.FLOOR) openNeighbors++;
          if (ground[y][x - 1] === TILES.FLOOR) openNeighbors++;
          if (ground[y][x + 1] === TILES.FLOOR) openNeighbors++;

          if (openNeighbors === 1) {
            deadEnds.push({ x, y });
          }
        }
      }
    }

    // Sort dead ends by distance to spawn
    deadEnds.sort((a, b) => {
      const distA = Math.hypot(a.x - startX, a.y - startY);
      const distB = Math.hypot(b.x - startX, b.y - startY);
      return distB - distA;
    });

    const exitPos = deadEnds.length > 0 ? deadEnds[0] : { x: width - 2, y: height - 2 };
    ground[exitPos.y][exitPos.x] = TILES.FLOOR;

    const entities = [];

    // Place Key in a distant dead end if available
    if (deadEnds.length > 1) {
      const keyPos = deadEnds[Math.min(deadEnds.length - 1, Math.floor(deadEnds.length / 2))];
      const keyId = `key_proc_${seed}_1`;
      entities.push({
        id: keyId,
        type: 'key',
        x: keyPos.x,
        y: keyPos.y,
        color: '#fbbf24',
        name: 'Prismatic Key',
      });

      // Find entrance tile to exit dead end to place door
      const doorCandidates = [
        { x: exitPos.x, y: exitPos.y - 1 },
        { x: exitPos.x, y: exitPos.y + 1 },
        { x: exitPos.x - 1, y: exitPos.y },
        { x: exitPos.x + 1, y: exitPos.y },
      ].filter(c => ground[c.y] && ground[c.y][c.x] === TILES.FLOOR);

      if (doorCandidates.length > 0) {
        const doorPos = doorCandidates[0];
        entities.push({
          id: `door_proc_${seed}_1`,
          type: 'door',
          x: doorPos.x,
          y: doorPos.y,
          requiresKey: keyId,
          color: '#fbbf24',
        });
      }
    }

    const themes = ['dungeon', 'emerald', 'sunset'];
    const selectedTheme = themes[Math.abs(PRNG.hashString(String(seed))) % themes.length];

    return {
      $schema: 'https://casual-maze-game.inbarrose.com/schemas/maze-v1.json',
      id: String(seed),
      title: `Procedural Labyrinth #${seed}`,
      author: 'Procedural Architect',
      version: 1,
      dimensions: { width, height },
      config: {
        fogOfWar: true,
        viewRadius: 6,
        allowFreePan: true,
        tileSize: 32,
        theme: selectedTheme,
      },
      spawn: { x: startX, y: startY, elevation: 0 },
      exit: exitPos,
      layers: {
        ground,
        overhead,
      },
      entities,
    };
  }
}
