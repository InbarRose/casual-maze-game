/**
 * Asset Loader & Cache Manager
 * Loads and caches SVG vector assets defined in assets/manifest.json
 * Supports zero-dependency pure static execution on GitHub Pages.
 */

export class AssetLoader {
  constructor() {
    this.manifest = null;
    this.imageCache = new Map();
    this.svgTextCache = new Map();
    this.isLoaded = false;
  }

  /**
   * Load and parse assets/manifest.json
   * @param {string} [manifestPath='assets/manifest.json']
   * @returns {Promise<object>}
   */
  async loadManifest(manifestPath = 'assets/manifest.json') {
    if (this.manifest) return this.manifest;

    try {
      if (typeof fetch === 'function') {
        const res = await fetch(manifestPath);
        if (res.ok) {
          this.manifest = await res.json();
          this.isLoaded = true;
          return this.manifest;
        }
      }
    } catch (e) {
      console.warn(`[MazeGame:AssetLoader] Failed to fetch manifest (${e.message})`);
    }

    return null;
  }

  /**
   * Get asset metadata by ID
   * @param {string} id
   * @returns {object|null}
   */
  getAssetInfo(id) {
    if (!this.manifest?.assets) return null;
    return this.manifest.assets.find(a => a.id === id) || null;
  }

  /**
   * Filter assets by type or category
   * @param {object} criteria
   * @param {string} [criteria.type]
   * @param {string} [criteria.category]
   * @param {string} [criteria.style]
   * @returns {Array<object>}
   */
  findAssets({ type, category, style } = {}) {
    if (!this.manifest?.assets) return [];
    return this.manifest.assets.filter(a => {
      if (type && a.type !== type) return false;
      if (category && a.category !== category) return false;
      if (style && a.style !== style) return false;
      return true;
    });
  }

  /**
   * Load an HTMLImageElement for canvas rendering (cached)
   * @param {string} path
   * @returns {Promise<HTMLImageElement>}
   */
  async loadImage(path) {
    if (this.imageCache.has(path)) {
      return this.imageCache.get(path);
    }

    if (typeof Image === 'undefined') {
      return null;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(path, img);
        resolve(img);
      };
      img.onerror = (err) => {
        console.warn(`[MazeGame:AssetLoader] Failed to load image asset: "${path}"`);
        reject(err);
      };
      img.src = path;
    });
  }

  /**
   * Load raw SVG text string for DOM inlining
   * @param {string} path
   * @returns {Promise<string>}
   */
  async loadSvgText(path) {
    if (this.svgTextCache.has(path)) {
      return this.svgTextCache.get(path);
    }

    if (typeof fetch === 'function') {
      const res = await fetch(path);
      if (res.ok) {
        const text = await res.text();
        this.svgTextCache.set(path, text);
        return text;
      }
    }

    throw new Error(`Could not load SVG text from "${path}"`);
  }
}

// Global Singleton Instance
export const assetLoader = new AssetLoader();
