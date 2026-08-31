/**
 * LocalStorage and SessionStorage persistence helper
 */

const STORAGE_KEYS = {
  CUSTOM_MAZE: 'casual_maze_custom_data',
  PROGRESS: 'casual_maze_campaign_progress',
  TUTORIAL_PROGRESS: 'casual_maze_tutorial_progress',
  SETTINGS: 'casual_maze_user_settings',
  EDITOR_AUTOSAVE: 'casual_maze_editor_autosave',
  SAVED_PROJECTS: 'casual_maze_saved_projects',
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
   * Save campaign level completion
   * @param {string|number} levelId
   * @param {{ time: number, steps: number }} stats
   */
  static saveLevelCompletion(levelId, stats) {
    try {
      const idKey = String(levelId);
      const isTutorial = idKey.startsWith('tutorial_') || idKey.startsWith('t');
      
      if (isTutorial) {
        return this.saveTutorialProgress(idKey, stats);
      }

      const progress = this.loadCampaignProgress();
      const existing = progress[idKey];

      if (!existing || stats.time < existing.bestTime) {
        progress[idKey] = {
          completed: true,
          bestTime: Math.min(stats.time, existing ? existing.bestTime : Infinity),
          bestSteps: Math.min(stats.steps, existing ? existing.bestSteps : Infinity),
          lastPlayed: Date.now(),
        };
      }

      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      console.info(`[MazeGame:Storage] Saved completion record for Campaign Level "${idKey}"`, stats);
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

  /* =========================================================
   * FULL GAME PROGRESS EXPORT & IMPORT (JSON BACKUP)
   * ========================================================= */

  /**
   * Export all game progress, tutorial completions, saved editor projects, and settings
   * @returns {object} Full save profile object
   */
  static exportSaveProfile() {
    return {
      schemaVersion: '1.0.0',
      game: 'casual-maze-game',
      exportedAt: new Date().toISOString(),
      progress: {
        campaign: this.loadCampaignProgress(),
        tutorial: this.loadTutorialProgress(),
      },
      projects: this.getSavedProjectsMap(),
      settings: this.loadSettings(),
    };
  }

  /**
   * Import and restore a save profile into local storage
   * @param {object|string} rawSaveData
   * @returns {{ success: boolean, stats: { campaignLevels: number, tutorialLevels: number, projects: number } }}
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

      const campaignCount = Object.keys(campaign).length;
      const tutorialCount = Object.keys(tutorial).length;
      const projectCount = Object.keys(projects).length;

      return {
        success: true,
        stats: {
          campaignLevels: campaignCount,
          tutorialLevels: tutorialCount,
          projects: projectCount,
        },
      };
    } catch (e) {
      console.error('[StorageManager] Failed to import save profile:', e);
      throw new Error(`Failed to import save data: ${e.message}`);
    }
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
}
