/**
 * Casual Maze Game - Level Loader & Validator
 */

import { TILES, DEFAULTS, LAYERS } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';
import { CAMPAIGN_LEVELS } from './default-levels.js';

export class LevelLoader {
  /**
   * Load level from URL parameters, session storage, or campaign
   * @param {URLSearchParams} [params]
   * @returns {object} Canonical Level Object
   */
  static async loadFromParams(params) {
    if (!params && typeof window !== 'undefined') {
      let search = window.location.search;
      if (!search && window.location.hash) {
        const hash = window.location.hash.substring(1);
        search = hash.includes('=') ? `?${hash}` : `?id=${hash}`;
      }
      params = new URLSearchParams(search);
    } else if (!params) {
      params = new URLSearchParams();
    }

    const mode = params.get('mode');
    const id = params.get('id') || '1';

    if (mode === 'custom') {
      const customData = StorageManager.loadCustomMaze();
      if (customData) {
        return this.normalizeLevel(customData);
      }
      console.warn('[LevelLoader] Custom maze requested but none found in session storage. Falling back to Level 1.');
    }

    // Try fetching JSON file first from /levels directory
    if (typeof fetch === 'function') {
      try {
        const res = await fetch(`levels/level_${id}.json`);
        if (res.ok) {
          const json = await res.json();
          return this.normalizeLevel(json);
        }
      } catch (e) {
        // Fall back to embedded campaign level
      }
    }

    // Check campaign levels fallback
    const campaignMatch = CAMPAIGN_LEVELS.find(lvl => String(lvl.id) === String(id));
    if (campaignMatch) {
      return this.normalizeLevel(JSON.parse(JSON.stringify(campaignMatch)));
    }

    // Default fallback to first campaign level (Training Hall)
    return this.normalizeLevel(JSON.parse(JSON.stringify(CAMPAIGN_LEVELS[0])));
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
}

