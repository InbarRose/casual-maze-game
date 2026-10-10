import { ENGINE_VERSION, SAVE_PROFILE_SCHEMA_VERSION } from './version.js';
import { CHARACTER_CUSTOMIZATION } from './constants.js';

const STORAGE_KEYS = {
  CUSTOM_MAZE: 'casual_maze_custom_data',
  PROGRESS: 'casual_maze_campaign_progress',
  TUTORIAL_PROGRESS: 'casual_maze_tutorial_progress',
  STORY_PROGRESS: 'casual_maze_story_progress',
  SETTINGS: 'casual_maze_user_settings',
  EDITOR_AUTOSAVE: 'casual_maze_editor_autosave',
  SAVED_PROJECTS: 'casual_maze_saved_projects',
  VERSION: 'casual_maze_save_version',
};

export class StorageManager {
  /**
   * Save custom maze payload to SessionStorage
   * @param {object} mazeData
   */
  static saveCustomMaze(mazeData) {
    try {
      sessionStorage.setItem(STORAGE_KEYS.CUSTOM_MAZE, JSON.stringify(mazeData));
      console.info(`[MazeGame:Storage] Saved custom maze "${mazeData?.title || 'Custom'}" (${mazeData?.id}) to session storage`);
      return true;
    } catch (e) {
      console.error('[MazeGame:Storage] Failed to save custom maze to session storage:', e);
      return false;
    }
  }

  /**
   * Load custom maze payload from SessionStorage
   * @returns {object|null}
   */
  static loadCustomMaze() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.CUSTOM_MAZE) || sessionStorage.getItem('custom_maze_data');
      if (raw) {
        console.info('[MazeGame:Storage] Loaded custom maze from session storage');
      }
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[MazeGame:Storage] Failed to parse custom maze from session storage:', e);
      return null;
    }
  }

  /**
   * Save campaign or story level completion
   * @param {string|number} levelId
   * @param {{ time: number, steps: number }} stats
   */
  static saveLevelCompletion(levelId, stats) {
    try {
      const idKey = String(levelId);
      const isTutorial = idKey.startsWith('tutorial_') || idKey.startsWith('tut_') || /^t\d+$/i.test(idKey);
      
      if (isTutorial) {
        const numMatch = idKey.match(/\d+/);
        const chNum = numMatch ? numMatch[0] : '1';
        this.saveStoryProgress('novice_initiation', chNum, stats);
        return this.saveTutorialProgress(idKey, stats);
      }

      if (idKey.startsWith('story_guardians_')) {
        const numMatch = idKey.match(/\d+/);
        const chNum = numMatch ? numMatch[0] : '1';
        return this.saveStoryProgress('relics_of_the_guardians', chNum, stats);
      }


      const progress = this.loadCampaignProgress();
      const existing = progress[idKey];
      const bestTime = Math.min(stats.time, existing?.bestTime ?? Infinity);
      const bestSteps = Math.min(stats.steps, existing?.bestSteps ?? Infinity);
      const existingMedals = existing?.medals || {};
      const parSteps = !!(stats.earnedParSteps || existingMedals.parSteps);
      const parTime = !!(stats.earnedParTime || existingMedals.parTime);
      const flawless = !!(stats.flawless || existingMedals.flawless);
      const secretSleuth = !!(
        stats.secretSleuth ||
        (stats.totalSecrets > 0 && stats.secretsFound >= stats.totalSecrets) ||
        existingMedals.secretSleuth
      );

      let tier = stats.tier || existingMedals.tier || 'bronze';
      if ((parSteps && parTime) || (secretSleuth && (parSteps || parTime))) {
        tier = 'gold';
      } else if (parSteps || parTime || secretSleuth || flawless) {
        tier = tier === 'gold' ? 'gold' : 'silver';
      }

      const bestSecrets = Math.max(stats.secretsFound || 0, existing?.bestSecrets || 0);
      const bestScore = Math.max(stats.performanceScore || 0, existing?.bestScore || 0);

      progress[idKey] = {
        completed: true,
        bestTime,
        bestSteps,
        bestSecrets,
        bestScore,
        medals: {
          completion: true,
          parSteps,
          parTime,
          flawless,
          secretSleuth,
          tier,
        },
        lastPlayed: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      console.info(`[MazeGame:Storage] Saved completion record for Campaign Level "${idKey}"`, progress[idKey]);
      return true;
    } catch (e) {
      console.error(`[MazeGame:Storage] Failed to save campaign completion for "${levelId}":`, e);
      return false;
    }
  }

  /**
   * Load campaign progress
   * @returns {Record<string, { completed: boolean, bestTime: number, bestSteps: number }>}
   */
  static loadCampaignProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('[StorageManager] Failed to load campaign progress:', e);
      return {};
    }
  }

  /**
   * Save entire campaign progress map
   * @param {Record<string, object>} progress
   * @returns {boolean}
   */
  static saveCampaignProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      return true;
    } catch (e) {
      console.error('[StorageManager] Failed to save campaign progress map:', e);
      return false;
    }
  }

  /**
   * Calculate total earned stars for a list of chapter levels
   * @param {Array<{ id: string|number }>} levels
   * @param {Record<string, object>} [progress]
   * @returns {number}
   */
  static getChapterStars(levels, progress) {
    const prog = progress || this.loadCampaignProgress();
    let stars = 0;
    if (!Array.isArray(levels)) return stars;
    for (const lvl of levels) {
      const record = prog[String(lvl.id)];
      if (record?.completed) {
        stars += 1;
        if (record.medals?.parSteps) stars += 1;
        if (record.medals?.parTime) stars += 1;
      }
    }
    return stars;
  }

  /**
   * Save tutorial level completion
   * @param {string|number} levelId
   * @param {{ time: number, steps: number }} stats
   */
  static saveTutorialProgress(levelId, stats) {
    try {
      const progress = this.loadTutorialProgress();
      const idKey = String(levelId);
      const existing = progress[idKey];

      if (!existing || stats.time < existing.bestTime) {
        progress[idKey] = {
          completed: true,
          bestTime: Math.min(stats.time, existing ? existing.bestTime : Infinity),
          bestSteps: Math.min(stats.steps, existing ? existing.bestSteps : Infinity),
          lastPlayed: Date.now(),
        };
      }

      localStorage.setItem(STORAGE_KEYS.TUTORIAL_PROGRESS, JSON.stringify(progress));
      return true;
    } catch (e) {
      console.error('[StorageManager] Failed to save tutorial progress:', e);
      return false;
    }
  }

  /**
   * Alias for saveTutorialProgress
   * @param {string|number} levelId
   * @param {{ time: number, steps: number }} stats
   */
  static saveTutorialCompletion(levelId, stats) {
    return this.saveTutorialProgress(levelId, stats);
  }

  /**
   * Load tutorial progress
   * @returns {Record<string, { completed: boolean, bestTime: number, bestSteps: number }>}
   */
  static loadTutorialProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TUTORIAL_PROGRESS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('[StorageManager] Failed to load tutorial progress:', e);
      return {};
    }
  }

  /**
   * Save story chapter completion
   * @param {string} storyId
   * @param {number|string} chapterNum
   * @param {{ time: number, steps: number }} stats
   * @returns {boolean}
   */
  static saveStoryProgress(storyId, chapterNum, stats) {
    try {
      const progress = this.loadStoryProgress();
      if (!progress[storyId]) {
        progress[storyId] = {};
      }
      const chKey = String(chapterNum);
      const existing = progress[storyId][chKey];

      progress[storyId][chKey] = {
        completed: true,
        bestTime: Math.min(stats.time, existing ? existing.bestTime : Infinity),
        bestSteps: Math.min(stats.steps, existing ? existing.bestSteps : Infinity),
        lastPlayed: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(progress));

      // Keep legacy tutorial storage synchronized for novice_initiation
      if (storyId === 'novice_initiation') {
        const tutId = `tutorial_${chKey}`;
        this.saveTutorialProgress(tutId, stats);
      }

      console.info(`[MazeGame:Storage] Saved story progress for "${storyId}" Chapter ${chKey}`, progress[storyId][chKey]);
      return true;
    } catch (e) {
      console.error('[StorageManager] Failed to save story progress:', e);
      return false;
    }
  }

  /**
   * Load story progress
   * @returns {Record<string, Record<string, { completed: boolean, bestTime: number, bestSteps: number, lastPlayed?: number }>>}
   */
  static loadStoryProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STORY_PROGRESS);
      const data = raw ? JSON.parse(raw) : {};

      // Seamlessly populate novice_initiation from legacy tutorial progress if absent
      const tutProgress = this.loadTutorialProgress();
      if (tutProgress && Object.keys(tutProgress).length > 0) {
        if (!data['novice_initiation']) {
          data['novice_initiation'] = {};
        }
        for (const [key, val] of Object.entries(tutProgress)) {
          const match = key.match(/\d+/);
          if (match && val && val.completed) {
            const chNum = match[0];
            if (!data['novice_initiation'][chNum]) {
              data['novice_initiation'][chNum] = { ...val };
            }
          }
        }
      }

      return data;
    } catch (e) {
      console.error('[StorageManager] Failed to load story progress:', e);
      return {};
    }
  }

  /**
   * Count completed chapters in a story
   * @param {string} storyId
   * @returns {number}
   */
  static getStoryCompletedCount(storyId) {
    const progress = this.loadStoryProgress();
    const storyData = progress[storyId];
    if (!storyData) return 0;
    return Object.values(storyData).filter(ch => ch && ch.completed).length;
  }


  /**
   * Save editor auto-save level
   * @param {object} mazeData
   */
  static saveEditorDraft(mazeData) {
    try {
      const draft = {
        ...mazeData,
        _lastSaved: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.EDITOR_AUTOSAVE, JSON.stringify(draft));
      return true;
    } catch (e) {
      console.error('[StorageManager] Failed to save editor draft:', e);
      return false;
    }
  }

  /**
   * Load editor draft
   * @returns {object|null}
   */
  static loadEditorDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EDITOR_AUTOSAVE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[StorageManager] Failed to load editor draft:', e);
      return null;
    }
  }

  /**
   * Clear editor draft
   */
  static clearEditorDraft() {
    try {
      localStorage.removeItem(STORAGE_KEYS.EDITOR_AUTOSAVE);
    } catch (e) {
      console.error('[StorageManager] Failed to clear editor draft:', e);
    }
  }

  /**
   * Save a named project to local storage
   * @param {object} mazeData
   * @returns {string} project ID
   */
  static saveProject(mazeData) {
    try {
      const projects = this.getSavedProjectsMap();
      const id = String(mazeData.id || `project_${Date.now()}`);
      const project = {
        ...mazeData,
        id,
        updatedAt: Date.now(),
      };
      projects[id] = project;
      localStorage.setItem(STORAGE_KEYS.SAVED_PROJECTS, JSON.stringify(projects));
      return id;
    } catch (e) {
      console.error('[StorageManager] Failed to save project:', e);
      return null;
    }
  }

  /**
   * Internal helper to load raw projects map
   * @returns {Record<string, object>}
   */
  static getSavedProjectsMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROJECTS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('[StorageManager] Failed to read saved projects map:', e);
      return {};
    }
  }

  /**
   * List all saved custom projects sorted by most recently modified
   * @returns {Array<{ id: string, title: string, author: string, dimensions: object, updatedAt: number }>}
   */
  static listProjects() {
    const map = this.getSavedProjectsMap();
    return Object.values(map)
      .map(p => ({
        id: p.id,
        title: p.title || 'Untitled Labyrinth',
        author: p.author || 'Architect',
        dimensions: p.dimensions || { width: 21, height: 21 },
        updatedAt: p.updatedAt || 0,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Load a specific saved project by ID
   * @param {string} id
   * @returns {object|null}
   */
  static loadProject(id) {
    const map = this.getSavedProjectsMap();
    return map[id] ? JSON.parse(JSON.stringify(map[id])) : null;
  }

  /**
   * Delete a saved project by ID
   * @param {string} id
   * @returns {boolean}
   */
  static deleteProject(id) {
    try {
      const map = this.getSavedProjectsMap();
      if (map[id]) {
        delete map[id];
        localStorage.setItem(STORAGE_KEYS.SAVED_PROJECTS, JSON.stringify(map));
        return true;
      }
      return false;
    } catch (e) {
      console.error('[StorageManager] Failed to delete project:', e);
      return false;
    }
  }

  /**
   * Save user settings
   * @param {object} settings
   */
  static saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('[StorageManager] Failed to save settings:', e);
    }
  }

  /**
   * Load user settings
   * @returns {object}
   */
  static loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Get a specific setting value
   * @param {string} key
   * @param {*} [defaultValue=null]
   * @returns {*}
   */
  static getSetting(key, defaultValue = null) {
    const settings = this.loadSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  /**
   * Set a specific setting value and persist
   * @param {string} key
   * @param {*} value
   * @returns {*}
   */
  static setSetting(key, value) {
    const settings = this.loadSettings();
    settings[key] = value;
    this.saveSettings(settings);
    return value;
  }

  /* =========================================================
   * FULL GAME PROGRESS EXPORT & IMPORT (JSON BACKUP)
   * ========================================================= */

  /**
   * Export all game progress, tutorial completions, saved editor projects, and settings (BL-76)
   * @returns {object} Full save profile object with rich metadata
   */
  static exportSaveProfile() {
    const campaign = this.loadCampaignProgress();
    const tutorial = this.loadTutorialProgress();
    const stories = this.loadStoryProgress();
    const profile = this.getPlayerProfile();
    const projects = this.getSavedProjectsMap();
    const settings = this.loadSettings();

    // Calculate summary statistics
    let totalStars = 0;
    let completedLevels = 0;
    for (const rec of Object.values(campaign)) {
      if (rec?.completed) {
        completedLevels++;
        const m = rec.medals || {};
        totalStars += (m.completion ? 1 : 0) + (m.parSteps ? 1 : 0) + (m.parTime ? 1 : 0) + (m.secretSleuth ? 1 : 0) + (m.flawless ? 1 : 0);
      }
    }

    return {
      schemaVersion: SAVE_PROFILE_SCHEMA_VERSION || '1.1.0',
      game: 'casual-maze-game',
      exportedAt: new Date().toISOString(),
      metadata: {
        engineVersion: ENGINE_VERSION,
        timestamp: Date.now(),
        exportedDateFormatted: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        playerName: profile?.name || 'Explorer',
        prestigeRank: profile?.rank || 'Initiate',
        totalStars,
        completedLevels,
        totalProjects: Object.keys(projects).length,
      },
      profile,
      progress: {
        campaign,
        tutorial,
        stories,
      },
      projects,
      settings,
    };
  }

  static EMERGENCY_SNAPSHOT_KEY = 'casual_maze_emergency_snapshot';

  /**
   * Create an emergency rollback snapshot of current data before destructive actions (BL-76)
   * @param {string} [reason='pre_restore']
   * @returns {boolean}
   */
  static createEmergencySnapshot(reason = 'pre_restore') {
    try {
      if (typeof localStorage === 'undefined') return false;
      const snapshot = {
        reason,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        backup: {
          campaign: this.loadCampaignProgress(),
          tutorial: this.loadTutorialProgress(),
          stories: this.loadStoryProgress(),
          projects: this.getSavedProjectsMap(),
          settings: this.loadSettings(),
          profile: this.getPlayerProfile(),
        },
      };
      localStorage.setItem(this.EMERGENCY_SNAPSHOT_KEY, JSON.stringify(snapshot));
      console.info(`[MazeGame:Storage] Created emergency snapshot (${reason})`);
      return true;
    } catch (e) {
      console.warn('[MazeGame:Storage] Failed to create emergency snapshot:', e);
      return false;
    }
  }

  /**
   * Check if an emergency rollback snapshot exists (BL-76)
   * @returns {object|null}
   */
  static getEmergencySnapshot() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.EMERGENCY_SNAPSHOT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Rollback to the emergency snapshot (BL-76)
   * @returns {{ success: boolean, stats: object }}
   */
  static rollbackEmergencySnapshot() {
    const snapshot = this.getEmergencySnapshot();
    if (!snapshot || !snapshot.backup) {
      throw new Error('No emergency snapshot available to rollback.');
    }
    const result = this.importSaveProfile(snapshot.backup);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.EMERGENCY_SNAPSHOT_KEY);
      }
    } catch {}
    return result;
  }

  /**
   * Alias for exportSaveProfile adhering to backup domain terminology
   * @returns {object}
   */
  static exportFullBackup() {
    return this.exportSaveProfile();
  }

  /**
   * Import and restore a save profile into local storage (BL-76)
   * @param {object|string} rawSaveData
   * @returns {{ success: boolean, stats: { campaignLevels: number, tutorialLevels: number, storyChapters: number, projects: number } }}
   */
  static importSaveProfile(rawSaveData) {
    try {
      let data = rawSaveData;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid save file format. Expected a JSON object.');
      }

      // Auto-create snapshot before modifying state
      this.createEmergencySnapshot('pre_restore');

      // Restore Campaign Progress
      const campaign = data.progress?.campaign || data.campaign || {};
      if (typeof campaign === 'object') {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(campaign));
      }

      // Restore Tutorial Progress
      const tutorial = data.progress?.tutorial || data.tutorial || {};
      if (typeof tutorial === 'object') {
        localStorage.setItem(STORAGE_KEYS.TUTORIAL_PROGRESS, JSON.stringify(tutorial));
      }

      // Restore Stories Progress
      const stories = data.progress?.stories || data.stories || {};
      if (typeof stories === 'object') {
        localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(stories));
      }

      // Restore Projects
      const projects = data.projects || {};
      if (typeof projects === 'object') {
        localStorage.setItem(STORAGE_KEYS.SAVED_PROJECTS, JSON.stringify(projects));
      }

      // Restore Settings
      const settings = data.settings || {};
      if (typeof settings === 'object') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }

      // Restore Player Identity (Codename)
      const playerProfile = data.profile || data.playerProfile;
      if (playerProfile && typeof playerProfile === 'object' && playerProfile.name) {
        this.setPlayerName(playerProfile.name);
      }

      const campaignCount = Object.keys(campaign).length;
      const tutorialCount = Object.keys(tutorial).length;
      let storyCount = 0;
      for (const s of Object.values(stories)) {
        if (s && typeof s === 'object') {
          storyCount += Object.keys(s).length;
        }
      }
      const projectCount = Object.keys(projects).length;

      return {
        success: true,
        stats: {
          campaignLevels: campaignCount,
          tutorialLevels: tutorialCount,
          storyChapters: storyCount,
          projects: projectCount,
        },
      };
    } catch (e) {
      console.error('[StorageManager] Failed to import save profile:', e);
      throw new Error(`Failed to import save data: ${e.message}`);
    }
  }

  /**
   * Alias for importSaveProfile adhering to backup domain terminology
   * @param {object|string} rawSaveData
   * @returns {{ success: boolean, stats: object }}
   */
  static importFullBackup(rawSaveData) {
    return this.importSaveProfile(rawSaveData);
  }

  /**
   * Alias for downloadSaveFile adhering to backup domain terminology
   * @param {string} [customFilename]
   * @returns {string}
   */
  static downloadFullBackupFile(customFilename) {
    return this.downloadSaveFile(customFilename);
  }

  /**
   * Trigger browser file download of the current save state
   * @param {string} [customFilename]
   * @returns {string} Download filename
   */
  static downloadSaveFile(customFilename) {
    const profile = this.exportSaveProfile();
    const jsonString = JSON.stringify(profile, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = customFilename || `casual_maze_save_${dateStr}.json`;

    if (typeof document !== 'undefined') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return filename;
  }

  /**
   * Load and parse a save profile file from a browser File instance
   * @param {File} file
   * @returns {Promise<{ success: boolean, stats: object }>}
   */
  static importSaveFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('No file provided'));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = this.importSaveProfile(e.target.result);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read save file'));
      reader.readAsText(file);
    });
  }

  /**
   * Copy the full save state JSON to clipboard
   * @returns {Promise<string>}
   */
  static async copySaveProfileToClipboard() {
    const profile = this.exportSaveProfile();
    const jsonString = JSON.stringify(profile, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(jsonString);
      return jsonString;
    }
    throw new Error('Clipboard API unavailable');
  }

  /**
   * Migrate legacy storage keys and data structures to latest schema
   * @returns {{ migrated: boolean, version: string, details: string[] }}
   */
  static migrateSaveData() {
    const details = [];
    let migrated = false;

    try {
      // 1. Migrate legacy campaign progress missing modern medal or secrets schema
      const campaign = this.loadCampaignProgress();
      let campaignUpdated = false;
      for (const [id, record] of Object.entries(campaign)) {
        if (record && typeof record === 'object') {
          if (!record.medals) {
            record.medals = {
              completion: !!record.completed,
              parSteps: !!record.parSteps,
              parTime: !!record.parTime,
              flawless: false,
              secretSleuth: false,
              tier: record.tier || 'bronze',
            };
            campaignUpdated = true;
          }
          if (record.bestSecrets === undefined) {
            record.bestSecrets = 0;
            campaignUpdated = true;
          }
          if (record.bestScore === undefined) {
            record.bestScore = 0;
            campaignUpdated = true;
          }
        }
      }
      if (campaignUpdated) {
        this.saveCampaignProgress(campaign);
        details.push('Normalized campaign level records with medals, secrets, and scores');
        migrated = true;
      }

      // 2. Migrate legacy sound toggle to settings object
      try {
        const legacyMute = localStorage.getItem('casual_maze_sound_muted');
        if (legacyMute !== null) {
          const settings = this.loadSettings();
          if (settings.muted === undefined) {
            settings.muted = legacyMute === 'true';
            this.saveSettings(settings);
            details.push('Migrated legacy sound mute state to settings object');
            migrated = true;
          }
        }
      } catch (_) {}

      // 3. Set version stamp
      try {
        localStorage.setItem(STORAGE_KEYS.VERSION, SAVE_PROFILE_SCHEMA_VERSION);
      } catch (_) {}

      return { migrated, version: SAVE_PROFILE_SCHEMA_VERSION, details };
    } catch (err) {
      console.warn('[MazeGame:Storage] Migration warning:', err);
      return { migrated: false, version: '1.0.0', details: [err.message] };
    }
  }

  /**
   * Export comprehensive diagnostic bundle for GitHub issue reporting or debugging
   * @param {object} [context={}] Runtime game context (level, player, moves, errors)
   * @returns {{ json: object, markdown: string, githubUrl: string }}
   */
  static exportDiagnosticBugBundle(context = {}) {
    const profile = this.getPlayerProfile();
    const settings = this.loadSettings();
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const scr = typeof window !== 'undefined' && window.screen ? window.screen : null;

    const bundle = {
      timestamp: new Date().toISOString(),
      engineVersion: ENGINE_VERSION,
      schemaVersion: SAVE_PROFILE_SCHEMA_VERSION,
      client: {
        userAgent: nav?.userAgent || 'Node.js/Headless',
        language: nav?.language || 'en-US',
        platform: nav?.platform || 'Unknown',
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A',
        screen: scr ? `${scr.width}x${scr.height}` : 'N/A',
        devicePixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
        touchSupport: typeof window !== 'undefined' && ('ontouchstart' in window || (nav && nav.maxTouchPoints > 0)),
      },
      playerProfile: {
        name: profile.name,
        rank: `${profile.rankIcon} ${profile.rankTitle}`,
        totalStars: profile.totalStars,
        conqueredCampaignLevels: profile.campaignLevels,
      },
      settings: {
        theme: settings.theme || 'default',
        masterVolume: settings.masterVolume ?? 1.0,
        muted: !!settings.muted,
        perspective: settings.perspective || '2.5d',
        highContrast: !!settings.highContrast,
        hotkeysEnabled: settings.hotkeysEnabled ?? true,
        keybindingPreset: settings.keybinding_preset || 'wasd_arrows',
        mouseMoveMode: settings.mouse_move_mode || 'click_path',
      },
      activeLevel: {
        id: String(context.activeLevel?.id || context.levelId || context.level?.id || 'unknown'),
        title: context.activeLevel?.title || context.levelTitle || context.level?.title || 'Unknown Labyrinth',
        chapter: context.chapterNumber || context.level?.chapterNumber || null,
        dimensions: context.level?.dimensions ? `${context.level.dimensions.width}x${context.level.dimensions.height}` : null,
      },
      playerState: {
        position: context.player ? { x: context.player.x, y: context.player.y, elevation: context.player.elevation ?? 0 } : null,
        facing: context.player?.facing || null,
        stepsTaken: context.steps ?? context.player?.stepsTaken ?? 0,
        elapsedTimeFormatted: context.elapsedTimeFormatted || null,
        inventory: context.inventory || (context.player?.inventory?.map(i => i.id || i)) || [],
        carriedItems: context.carriedItems || [],
      },
      recentTelemetry: (context.recentActions || context.telemetry || []).slice(-20),
      recentErrors: (context.errors || []).slice(-10),
    };

    const markdown = [
      '### Bug Report Diagnostic Bundle',
      `- **Engine Version**: \`v${bundle.engineVersion}\``,
      `- **Active Level**: ${bundle.activeLevel.title} (\`${bundle.activeLevel.id}\`)`,
      `- **Player Coordinates**: ${bundle.playerState.position ? `(${bundle.playerState.position.x}, ${bundle.playerState.position.y}, Z=${bundle.playerState.position.elevation})` : 'N/A'} | Steps: ${bundle.playerState.stepsTaken}`,
      `- **Client / Platform**: ${bundle.client.userAgent}`,
      `- **Viewport**: ${bundle.client.viewport} (DPR: ${bundle.client.devicePixelRatio}) | Touch: ${bundle.client.touchSupport}`,
      '',
      '<details><summary><b>Full Diagnostic JSON Payload</b></summary>',
      '',
      '```json',
      JSON.stringify(bundle, null, 2),
      '```',
      '</details>',
    ].join('\n');

    const issueTitle = `[Bug] Issue in Level "${bundle.activeLevel.title}" (${bundle.activeLevel.id})`;
    const issueBody = encodeURIComponent(
      `## Bug Description\n<!-- Please describe what happened and what you expected to happen -->\n\n## Reproduction Steps\n1. Play level "${bundle.activeLevel.id}"\n2. \n\n${markdown}`
    );
    const githubUrl = `https://github.com/InbarRose/casual-maze-game/issues/new?title=${encodeURIComponent(issueTitle)}&body=${issueBody}&labels=bug`;

    return {
      json: bundle,
      markdown,
      githubUrl,
      githubIssueUrl: githubUrl,
    };
  }

  /**
   * Get player profile metadata and computed rank statistics
   * @returns {{ name: string, totalStars: number, campaignLevels: number, storyChapters: number, totalSteps: number, rankTitle: string, rankIcon: string }}
   */
  static getPlayerProfile() {
    const name = this.getSetting('player_name', 'Explorer');
    const campaign = this.loadCampaignProgress();
    const tutorial = this.loadTutorialProgress();
    const stories = this.loadStoryProgress();

    let totalStars = 0;
    let campaignLevels = 0;
    let totalSteps = 0;

    for (const lvl of Object.values(campaign)) {
      if (lvl && lvl.completed) {
        campaignLevels++;
        totalStars += 1;
        if (lvl.medals?.parSteps) totalStars += 1;
        if (lvl.medals?.parTime) totalStars += 1;
        if (lvl.medals?.flawless) totalStars += 1;
        if (lvl.medals?.secretSleuth) totalStars += 1;
        if (lvl.bestSteps && lvl.bestSteps !== Infinity) {
          totalSteps += lvl.bestSteps;
        }
      }
    }

    let storyChapters = 0;
    for (const s of Object.values(stories)) {
      if (s && typeof s === 'object') {
        for (const ch of Object.values(s)) {
          if (ch && ch.completed) {
            storyChapters++;
            totalStars += 1;
          }
        }
      }
    }

    for (const t of Object.values(tutorial)) {
      if (t && t.completed) {
        totalStars += 1;
      }
    }

    let rankTitle = 'Novice Pathfinder';
    let rankIcon = '🧭';

    if (totalStars >= 50) {
      rankTitle = 'Grand Labyrinth Sovereign';
      rankIcon = '👑';
    } else if (totalStars >= 25) {
      rankTitle = 'Master Architect';
      rankIcon = '🏛️';
    } else if (totalStars >= 12) {
      rankTitle = 'Dungeon Cartographer';
      rankIcon = '📜';
    } else if (totalStars >= 4) {
      rankTitle = 'Labyrinth Scout';
      rankIcon = '🗺️';
    }

    const outfit = this.getPlayerOutfit();
    const customization = this.getPlayerCustomization();

    return {
      name,
      outfit,
      customization,
      totalStars,
      campaignLevels,
      storyChapters,
      totalSteps,
      rankTitle,
      rankIcon,
    };
  }

  /**
   * Get player outfit identifier (BL-78)
   * @returns {string}
   */
  static getPlayerOutfit() {
    return this.getSetting('player_outfit', 'classic');
  }

  /**
   * Set and persist player outfit identifier (BL-78)
   * @param {string} outfitId
   * @returns {boolean}
   */
  static setPlayerOutfit(outfitId) {
    const valid = ['classic', 'emerald', 'arctic', 'desert', 'obsidian', 'alchemist'];
    const chosen = valid.includes(outfitId) ? outfitId : 'classic';
    return this.setSetting('player_outfit', chosen);
  }

  /**
   * Get player visual customization options (BL-95, ADR-0014)
   * @returns {{ gender: string, hairStyle: string, hairColor: string, skinTone: string }}
   */
  static getPlayerCustomization() {
    const defaults = CHARACTER_CUSTOMIZATION?.DEFAULTS || {
      gender: 'male',
      hairStyle: 'short',
      hairColor: 'brunette',
      skinTone: 'fair',
    };
    const saved = this.getSetting('player_customization', null);
    if (!saved || typeof saved !== 'object') {
      return { ...defaults };
    }
    return {
      gender: saved.gender || defaults.gender,
      hairStyle: saved.hairStyle || defaults.hairStyle,
      hairColor: saved.hairColor || defaults.hairColor,
      skinTone: saved.skinTone || defaults.skinTone,
    };
  }

  /**
   * Set and persist player visual customization options (BL-95, ADR-0014)
   * @param {object} customization
   * @returns {boolean}
   */
  static setPlayerCustomization(customization) {
    const current = this.getPlayerCustomization();
    const updated = {
      ...current,
      ...(customization || {}),
    };
    return this.setSetting('player_customization', updated);
  }

  /**
   * Set and persist player display name
   * @param {string} name
   */
  static setPlayerName(name) {
    const clean = String(name || 'Explorer').trim().slice(0, 24);
    return this.setSetting('player_name', clean || 'Explorer');
  }

  /**
   * Reset all campaign, tutorial, and story progress (Destructive action)
   * @returns {boolean}
   */
  static resetAllProgress() {
    try {
      this.createEmergencySnapshot('pre_reset');
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        localStorage.removeItem(STORAGE_KEYS.TUTORIAL_PROGRESS);
        localStorage.removeItem(STORAGE_KEYS.STORY_PROGRESS);
      }
      console.info('[MazeGame:Storage] Reset all campaign, tutorial, and story progress.');
      return true;
    } catch (e) {
      console.error('[MazeGame:Storage] Failed to reset progress:', e);
      return false;
    }
  }
}
