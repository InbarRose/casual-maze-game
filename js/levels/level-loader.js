/**
 * Casual Maze Game - Level Loader & Validator
 */

import { TILES, DEFAULTS, LAYERS } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';
import { CAMPAIGN_LEVELS, TUTORIAL_LEVELS, getStoryline, getStoryChapter, getAllStoryLevels } from './default-levels.js';

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
        console.info('[MazeGame:LevelLoader] Successfully loaded custom maze from session storage');
        return this.normalizeLevel(customData);
      }
      console.warn('[MazeGame:LevelLoader] Custom maze requested but none found in session storage. Falling back to Level 1.');
    }

    // Comprehensive Story Parameter Detection:
    // ?story=relics_of_the_guardians&chapter=1 or ?saga=... or ?story_id=...
    const storyParam = params.get('story') ?? params.get('story_id') ?? params.get('saga');
    const chapterParam = params.get('chapter') ?? params.get('ch') ?? params.get('level') ?? params.get('c');

    if (storyParam || mode === 'story') {
      const resolvedStoryId = storyParam || 'novice_initiation';
      const resolvedChapterNum = chapterParam || params.get('id') || '1';
      const storyChapter = getStoryChapter(resolvedStoryId, resolvedChapterNum);
      if (storyChapter) {
        console.info(`[MazeGame:LevelLoader] Loaded story chapter "${resolvedStoryId}" Ch.${resolvedChapterNum} ("${storyChapter.title}")`);
        return this.normalizeLevel(JSON.parse(JSON.stringify(storyChapter)));
      }
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

    // Check story level match by targetId directly (e.g. story_guardians_1)
    const directStoryMatch = getAllStoryLevels().find(lvl =>
      lvl.id === targetId || String(lvl.id) === String(rawId)
    );
    if (directStoryMatch) {
      console.info(`[MazeGame:LevelLoader] Loaded story level match: "${directStoryMatch.id}" ("${directStoryMatch.title}")`);
      return this.normalizeLevel(JSON.parse(JSON.stringify(directStoryMatch)));
    }


    // 1. Try fetching JSON file from /levels subdirectories
    if (typeof fetch === 'function') {
      const chapterParam = params.get('chapter') ?? params.get('ch');
      const fileParam = params.get('file');

      const fileNames = isTutorialMode
        ? [
            `levels/tutorial/tutorial_${cleanId}.json`,
            `./levels/tutorial/tutorial_${cleanId}.json`,
            `levels/tutorial_${cleanId}.json`
          ]
        : [
            ...(fileParam ? [fileParam, `./${fileParam}`] : []),
            ...(chapterParam ? [
              `levels/${chapterParam}/level_${cleanId}.json`,
              `./levels/${chapterParam}/level_${cleanId}.json`,
              `levels/chapter_${chapterParam.replace(/\D/g, '')}/level_${cleanId}.json`,
              `./levels/chapter_${chapterParam.replace(/\D/g, '')}/level_${cleanId}.json`,
            ] : []),
            `levels/chapter_1/level_${cleanId}.json`,
            `levels/chapter_2/level_${cleanId}.json`,
            `levels/chapter_3/level_${cleanId}.json`,
            `levels/chapter_4/level_${cleanId}.json`,
            `levels/chapter_5/level_${cleanId}.json`,
            `levels/chapter_6/level_${cleanId}.json`,
            `levels/chapter_7/level_${cleanId}.json`,
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
            console.info(`[MazeGame:LevelLoader] Loaded level from remote/disk JSON: "${fileName}"`);
            return this.normalizeLevel(json);
          }
        } catch (e) {
          console.warn(`[MazeGame:LevelLoader] Fetch failed for "${fileName}" (${e.message}), trying next source...`);
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
        console.info(`[MazeGame:LevelLoader] Using embedded tutorial fallback for "${targetId}"`);
        return this.normalizeLevel(JSON.parse(JSON.stringify(tutorialMatch)));
      }
    }

    // 3. Check campaign fallback levels
    const campaignMatch = CAMPAIGN_LEVELS.find(lvl =>
      String(lvl.id) === String(targetId) ||
      String(lvl.id) === String(cleanId)
    );
    if (campaignMatch) {
      console.info(`[MazeGame:LevelLoader] Using embedded campaign fallback for Level "${targetId}"`);
      return this.normalizeLevel(JSON.parse(JSON.stringify(campaignMatch)));
    }

    // Default fallback to first tutorial or campaign level
    console.warn(`[MazeGame:LevelLoader] Could not resolve Level "${targetId}". Using default starter level.`);
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
      chapter: raw.chapter || raw.zone || undefined,
      storyId: raw.storyId ? String(raw.storyId) : undefined,
      chapterNumber: raw.chapterNumber !== undefined ? Number(raw.chapterNumber) : undefined,
      chapterTitle: raw.chapterTitle ? String(raw.chapterTitle) : undefined,
      chapterSubtitle: raw.chapterSubtitle ? String(raw.chapterSubtitle) : undefined,
      prologueText: raw.prologueText ? String(raw.prologueText) : undefined,
      title: raw.title || 'Untitled Labyrinth',
      author: raw.author || 'Anonymous',
      architectNote: raw.architectNote ? String(raw.architectNote) : undefined,
      parSteps: raw.parSteps !== undefined ? Number(raw.parSteps) : undefined,
      parTime: raw.parTime !== undefined ? Number(raw.parTime) : undefined,
      version: raw.version || 1,
      dimensions: { width, height },
      config: {
        fogOfWar: raw.config?.fogOfWar !== undefined ? !!raw.config.fogOfWar : DEFAULTS.FOG_OF_WAR,
        mapRevealed: raw.config?.mapRevealed !== undefined ? !!raw.config.mapRevealed : DEFAULTS.MAP_REVEALED,
        viewRadius: raw.config?.viewRadius !== undefined ? Number(raw.config.viewRadius) : DEFAULTS.VIEW_RADIUS,
        allowFreePan: raw.config?.allowFreePan !== undefined ? !!raw.config.allowFreePan : DEFAULTS.ALLOW_FREE_PAN,
        tileSize: raw.config?.tileSize || DEFAULTS.TILE_SIZE,
        theme: raw.config?.theme || DEFAULTS.THEME,
        viewPerspective: raw.config?.viewPerspective || DEFAULTS.VIEW_PERSPECTIVE || 'angled',
      },
      help: raw.help ? {
        title: String(raw.help.title || ''),
        message: String(raw.help.message || ''),
      } : null,
      spawn: {
        x: raw.spawn?.x ?? 1,
        y: raw.spawn?.y ?? 1,
        z: raw.spawn?.z ?? raw.spawn?.elevation ?? 0,
        elevation: raw.spawn?.z ?? raw.spawn?.elevation ?? 0,
        style: raw.spawn?.style || 'stairs_down',
      },
      exit: {
        x: raw.exit?.x ?? width - 2,
        y: raw.exit?.y ?? height - 2,
        z: raw.exit?.z ?? raw.exit?.elevation ?? 0,
        elevation: raw.exit?.z ?? raw.exit?.elevation ?? 0,
        style: raw.exit?.style || 'portal',
      },
      layers: {
        ground: this.normalizeGrid(raw.layers?.ground, width, height, TILES.FLOOR),
        overhead: this.normalizeGrid(raw.layers?.overhead, width, height, 0),
      },
      entities: Array.isArray(raw.entities) ? raw.entities.map(e => ({
        ...e,
        z: e.z ?? e.elevation ?? 0,
        elevation: e.z ?? e.elevation ?? 0,
        targetZ: e.targetZ !== undefined ? e.targetZ : (e.targetElevation !== undefined ? e.targetElevation : (e.z ?? e.elevation ?? 0)),
        targetElevation: e.targetZ !== undefined ? e.targetZ : (e.targetElevation !== undefined ? e.targetElevation : (e.z ?? e.elevation ?? 0)),
      })) : [],
      testSpawn: raw.testSpawn ? {
        x: Number(raw.testSpawn.x ?? raw.spawn?.x ?? 1),
        y: Number(raw.testSpawn.y ?? raw.spawn?.y ?? 1),
        z: Number(raw.testSpawn.z ?? raw.testSpawn.elevation ?? 0),
        elevation: Number(raw.testSpawn.z ?? raw.testSpawn.elevation ?? 0),
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

