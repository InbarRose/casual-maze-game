/**
 * Level Editor JSON Exporter & Importer
 */

import { LevelLoader } from '../levels/level-loader.js';

export class JsonExporter {
  /**
   * Export level to a downloadable .json file
   * @param {object} levelData
   */
  static exportToFile(levelData) {
    const normalized = LevelLoader.normalizeLevel(levelData);
    const jsonStr = JSON.stringify(normalized, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const filename = `${normalized.id || 'custom_maze'}_v${normalized.version || 1}.json`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy canonical JSON to clipboard
   * @param {object} levelData
   * @returns {Promise<boolean>}
   */
  static async copyToClipboard(levelData) {
    try {
      const normalized = LevelLoader.normalizeLevel(levelData);
      const jsonStr = JSON.stringify(normalized, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      return true;
    } catch (err) {
      console.error('[JsonExporter] Clipboard write failed:', err);
      return false;
    }
  }

  /**
   * Import level data from a File object
   * @param {File} file
   * @returns {Promise<object>}
   */
  static importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('No file provided'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const normalized = LevelLoader.normalizeLevel(json);
          resolve(normalized);
        } catch (err) {
          reject(new Error('Invalid JSON format: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Import level data from text string
   * @param {string} text
   * @returns {object}
   */
  static importFromText(text) {
    const json = JSON.parse(text);
    return LevelLoader.normalizeLevel(json);
  }
}
