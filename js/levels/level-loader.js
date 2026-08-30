/**
 * Casual Maze Game - Level Loader & Validator
 */

import { TILES, DEFAULTS, LAYERS } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';
import { CAMPAIGN_LEVELS, TUTORIAL_LEVELS } from './default-levels.js';

export class LevelLoader {
  /**
   * Load level from URL parameters, session storage, campaign, or tutorial
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

    if (mode === 'custom' || params.has('custom')) {
      const customData = StorageManager.loadCustomMaze();
      if (customData) {
        return this.normalizeLevel(customData);
      }
      console.warn('[LevelLoader] Custom maze requested but none found in session storage. Falling back to Level 1.');
    }

    // Comprehensive Tutorial Parameter Detection:
    // 1. ?tutorial=X or ?tut=X or ?t=X
    // 2. ?id=tutorial_X or ?id=tutorial-X or ?id=tutorialX or ?id=tX
    // 3. ?tutorial_X or ?tutorial-X or ?tX (bare boolean flag)
    // 4. ?mode=tutorial&id=X
    let rawTutorialId = params.get('tutorial') ?? params.get('tut') ?? params.get('t');
    let rawId = params.get('id');

    // Check bare query keys (e.g. ?tutorial_1 or ?t1 or ?tutorial-1)
    if (rawTutorialId === null && rawId === null) {
      for (const key of params.keys()) {
        const lowerKey = key.toLowerCase();
        if (/^(tutorial[_-]?\d+|t\d+)$/i.test(lowerKey)) {
          rawTutorialId = lowerKey;
          break;
        } else if (/^\d+$/.test(lowerKey)) {
          rawId = lowerKey;
          break;
        }
      }
    }

    const isTutorialMode = mode === 'tutorial' ||
      rawTutorialId !== null ||
      params.has('tutorial') ||
      (rawId && /^(tutorial[_-]?\d+|t\d+)$/i.test(String(rawId)));

    let cleanId = '1';
    let targetId = '1';

    if (isTutorialMode) {
      const candidate = String(rawTutorialId ?? rawId ?? '1');
      const numMatch = candidate.match(/\d+/);
      cleanId = numMatch ? numMatch[0] : '1';
      targetId = `tutorial_${cleanId}`;
    } else {
      targetId = String(rawId ?? '1');
      cleanId = targetId;
    }

    // 1. Try fetching JSON file from /levels subdirectories
    if (typeof fetch === 'function') {
      const fileNames = isTutorialMode
        ? [
            `levels/tutorial/tutorial_${cleanId}.json`,
            `./levels/tutorial/tutorial_${cleanId}.json`,
            `levels/tutorial_${cleanId}.json`
          ]
        : [
            `levels/zone_1/level_${cleanId}.json`,
            `levels/zone_2/level_${cleanId}.json`,
            `levels/zone_3/level_${cleanId}.json`,
            `./levels/zone_1/level_${cleanId}.json`,
            `./levels/zone_2/level_${cleanId}.json`,
            `./levels/zone_3/level_${cleanId}.json`,
            `levels/level_${cleanId}.json`
          ];

      for (const fileName of fileNames) {
        try {
          const res = await fetch(fileName);
          if (res.ok) {
            const json = await res.json();
            return this.normalizeLevel(json);
          }
        } catch (e) {
          // Try next path or fall back to embedded levels
        }
      }
    }

    // 2. Check tutorial fallback levels if tutorial
    if (isTutorialMode) {
      const tutorialMatch = TUTORIAL_LEVELS.find(lvl =>
        lvl.id === targetId ||
        lvl.id === `tutorial_${cleanId}` ||
        String(lvl.id) === String(cleanId)
      );
      if (tutorialMatch) {
        return this.normalizeLevel(JSON.parse(JSON.stringify(tutorialMatch)));
      }
    }

    // 3. Check campaign fallback levels
    const campaignMatch = CAMPAIGN_LEVELS.find(lvl =>
      String(lvl.id) === String(targetId) ||
      String(lvl.id) === String(cleanId)
    );
    if (campaignMatch) {
      return this.normalizeLevel(JSON.parse(JSON.stringify(campaignMatch)));
    }

    // Default fallback to first tutorial or campaign level
    if (isTutorialMode && TUTORIAL_LEVELS.length > 0) {
      return this.normalizeLevel(JSON.parse(JSON.stringify(TUTORIAL_LEVELS[0])));
    }
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
      zone: raw.zone || (raw.id && String(raw.id).startsWith('tutorial') ? 'tutorial' : 'zone_1'),
      title: raw.title || 'Untitled Labyrinth',
      author: raw.author || 'Anonymous',
      version: raw.version || 1,
      dimensions: { width, height },
      config: {
        fogOfWar: raw.config?.fogOfWar !== undefined ? !!raw.config.fogOfWar : DEFAULTS.FOG_OF_WAR,
        mapRevealed: raw.config?.mapRevealed !== undefined ? !!raw.config.mapRevealed : DEFAULTS.MAP_REVEALED,
        viewRadius: raw.config?.viewRadius !== undefined ? Number(raw.config.viewRadius) : DEFAULTS.VIEW_RADIUS,
        allowFreePan: raw.config?.allowFreePan !== undefined ? !!raw.config.allowFreePan : DEFAULTS.ALLOW_FREE_PAN,
        tileSize: raw.config?.tileSize || DEFAULTS.TILE_SIZE,
        theme: raw.config?.theme || DEFAULTS.THEME,
      },
      help: raw.help ? {
        title: String(raw.help.title || ''),
        message: String(raw.help.message || ''),
      } : null,
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
      testSpawn: raw.testSpawn ? {
        x: Number(raw.testSpawn.x ?? raw.spawn?.x ?? 1),
        y: Number(raw.testSpawn.y ?? raw.spawn?.y ?? 1),
        elevation: Number(raw.testSpawn.elevation ?? 0),
      } : undefined,
      testInventory: Array.isArray(raw.testInventory) ? [...raw.testInventory] : undefined,
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

