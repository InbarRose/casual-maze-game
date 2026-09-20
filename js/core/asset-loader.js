/**
 * Asset Loader & Cache Manager
 * Loads and caches SVG vector assets defined in assets/manifest.json
 * Supports zero-dependency pure static execution on GitHub Pages.
 */

export const CANONICAL_ASSET_PATHS = {
  // Generic Tiles
  'tile_floor_generic': 'assets/tiles/ground/floor.svg',
  'tile_bridge_generic_ew': 'assets/tiles/bridges/bridge_ew.svg',
  'tile_bridge_generic_ns': 'assets/tiles/bridges/bridge_ns.svg',
  'tile_ramp_east': 'assets/tiles/ramps/ramp_east.svg',
  'tile_ramp_west': 'assets/tiles/ramps/ramp_west.svg',
  'tile_ramp_north': 'assets/tiles/ramps/ramp_north.svg',
  'tile_ramp_south': 'assets/tiles/ramps/ramp_south.svg',

  // Biome Floors & Variations
  'tile_floor_dungeon': 'assets/tiles/ground/floor_dungeon.svg',
  'tile_floor_dungeon_cracked': 'assets/tiles/variations/floor_dungeon_cracked.svg',
  'tile_floor_dungeon_runic': 'assets/tiles/variations/floor_dungeon_runic.svg',
  'tile_floor_glacial': 'assets/tiles/ground/floor_glacial.svg',
  'tile_floor_glacial_cracked': 'assets/tiles/variations/floor_glacial_cracked.svg',
  'tile_floor_jungle': 'assets/tiles/ground/floor_jungle.svg',
  'tile_floor_jungle_mossy': 'assets/tiles/variations/floor_jungle_mossy.svg',
  'tile_floor_magma': 'assets/tiles/ground/floor_magma.svg',
  'tile_floor_magma_cracked': 'assets/tiles/variations/floor_magma_cracked.svg',
  'tile_floor_temple': 'assets/tiles/ground/floor_temple.svg',
  'tile_floor_temple_hieroglyph': 'assets/tiles/variations/floor_temple_hieroglyph.svg',

  // Biome Walls & Variations
  'tile_wall_dungeon': 'assets/tiles/ground/wall_dungeon.svg',
  'tile_wall_dungeon_grate': 'assets/tiles/variations/wall_dungeon_grate.svg',
  'tile_wall_dungeon_torch': 'assets/tiles/variations/wall_dungeon_torch.svg',
  'tile_wall_angled_dungeon': 'assets/tiles/angled/wall_angled_dungeon.svg',
  'tile_wall_glacial': 'assets/tiles/ground/wall_glacial.svg',
  'tile_wall_glacial_grate': 'assets/tiles/variations/wall_glacial_grate.svg',
  'tile_wall_glacial_torch': 'assets/tiles/variations/wall_glacial_torch.svg',
  'tile_wall_jungle': 'assets/tiles/ground/wall_jungle.svg',
  'tile_wall_overgrowth': 'assets/tiles/ground/wall_overgrowth.svg',
  'tile_wall_magma': 'assets/tiles/ground/wall_magma.svg',
  'tile_wall_temple': 'assets/tiles/ground/wall_temple.svg',

  // Biome Bridges
  'tile_bridge_dungeon_ew': 'assets/tiles/bridges/bridge_dungeon_ew.svg',
  'tile_bridge_dungeon_ns': 'assets/tiles/bridges/bridge_dungeon_ns.svg',
  'tile_bridge_glacial_ew': 'assets/tiles/bridges/bridge_glacial_ew.svg',
  'tile_bridge_glacial_ns': 'assets/tiles/bridges/bridge_glacial_ns.svg',
  'tile_bridge_jungle_ew': 'assets/tiles/bridges/bridge_jungle_ew.svg',
  'tile_bridge_jungle_ns': 'assets/tiles/bridges/bridge_jungle_ns.svg',
  'tile_bridge_magma_ew': 'assets/tiles/bridges/bridge_magma_ew.svg',
  'tile_bridge_magma_ns': 'assets/tiles/bridges/bridge_magma_ns.svg',
  'tile_bridge_temple_ew': 'assets/tiles/bridges/bridge_temple_ew.svg',
  'tile_bridge_temple_ns': 'assets/tiles/bridges/bridge_temple_ns.svg',

  // Doors
  'door_classic': 'assets/entities/doors/door_classic.svg',
  'door_portcullis': 'assets/entities/doors/door_portcullis.svg',
  'door_crystal_spikes': 'assets/entities/doors/door_crystal_spikes.svg',
  'door_laser_barrier': 'assets/entities/doors/door_laser_barrier.svg',
  'door_magic_seal': 'assets/entities/doors/door_magic_seal.svg',
  'door_vault_hatch': 'assets/entities/doors/door_vault_hatch.svg',
  'door_dungeon_horizontal': 'assets/entities/doors/door_dungeon_h.svg',
  'door_dungeon_vertical': 'assets/entities/doors/door_dungeon_v.svg',
  'door_glacial_horizontal': 'assets/entities/doors/door_glacial_h.svg',
  'door_glacial_vertical': 'assets/entities/doors/door_glacial_v.svg',
  'door_jungle_horizontal': 'assets/entities/doors/door_jungle_h.svg',
  'door_jungle_vertical': 'assets/entities/doors/door_jungle_v.svg',
  'door_magma_horizontal': 'assets/entities/doors/door_magma_h.svg',
  'door_magma_vertical': 'assets/entities/doors/door_magma_v.svg',
  'door_temple_horizontal': 'assets/entities/doors/door_temple_h.svg',
  'door_temple_vertical': 'assets/entities/doors/door_temple_v.svg',

  // Keys
  'key_classic': 'assets/entities/keys/key_classic.svg',
  'key_crystal': 'assets/entities/keys/key_crystal.svg',
  'key_dungeon_iron': 'assets/entities/keys/key_dungeon_iron.svg',
  'key_glacial_frost': 'assets/entities/keys/key_glacial_frost.svg',
  'key_jungle_jade': 'assets/entities/keys/key_jungle_jade.svg',
  'key_magma_ruby': 'assets/entities/keys/key_magma_ruby.svg',
  'key_temple_scarab': 'assets/entities/keys/key_temple_scarab.svg',
  'key_orb': 'assets/entities/keys/key_orb.svg',
  'key_ornate': 'assets/entities/keys/key_ornate.svg',
  'key_relic': 'assets/entities/keys/key_relic.svg',
  'key_skull': 'assets/entities/keys/key_skull.svg',

  // Levers & Mechanisms
  'lever_switch_off': 'assets/entities/levers/lever_switch_off.svg',
  'lever_switch_on': 'assets/entities/levers/lever_switch_on.svg',
  'cog_valve_off': 'assets/entities/levers/cog_valve_off.svg',
  'cog_valve_on': 'assets/entities/levers/cog_valve_on.svg',
  'crystal_inactive': 'assets/entities/levers/crystal_inactive.svg',
  'crystal_active': 'assets/entities/levers/crystal_active.svg',
  'pedestal_inactive': 'assets/entities/levers/pedestal_inactive.svg',
  'pedestal_active': 'assets/entities/levers/pedestal_active.svg',
  'runic_plate_off': 'assets/entities/levers/runic_plate_off.svg',
  'runic_plate_on': 'assets/entities/levers/runic_plate_on.svg',

  // Exits & Spawn
  'exit_portal': 'assets/environment/exit/exit_portal.svg',
  'exit_archway': 'assets/environment/exit/exit_archway.svg',
  'exit_stairs_up': 'assets/environment/exit/exit_stairs_up.svg',
  'exit_treasure_chest': 'assets/environment/exit/exit_treasure_chest.svg',
  'exit_shrine': 'assets/environment/exit/exit_shrine.svg',

  // Activities & Hazards
  'patroller_sentinel': 'assets/entities/patrollers/patroller_sentinel.svg',
  'hazard_flame_vent': 'assets/entities/hazards/hazard_flame_vent.svg',
  'teleporter_portal': 'assets/entities/teleporters/teleporter_portal.svg',
  'puzzle_gate_rune': 'assets/entities/puzzle_gates/puzzle_gate_rune.svg',
  'puzzle_gate_cipher': 'assets/entities/puzzle_gates/puzzle_gate_cipher.svg',
  'signpost_lore': 'assets/entities/signposts/signpost_lore.svg',
};

export class AssetLoader {
  constructor() {
    this.manifest = null;
    this.imageCache = new Map();
    this.svgTextCache = new Map();
    this.idToPath = new Map(Object.entries(CANONICAL_ASSET_PATHS));
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
      if (typeof window !== 'undefined' && typeof fetch === 'function' && window.location?.protocol?.startsWith('http')) {
        const res = await fetch(manifestPath);
        if (res.ok) {
          this.manifest = await res.json();
          this.isLoaded = true;
          if (Array.isArray(this.manifest?.assets)) {
            for (const asset of this.manifest.assets) {
              if (asset.id && asset.path) {
                this.idToPath.set(asset.id, asset.path);
              }
            }
          }
          return this.manifest;
        }
      } else if (typeof process !== 'undefined' && process.versions?.node) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const fullPath = path.resolve(process.cwd(), manifestPath);
          if (fs.existsSync(fullPath)) {
            this.manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            this.isLoaded = true;
            if (Array.isArray(this.manifest?.assets)) {
              for (const asset of this.manifest.assets) {
                if (asset.id && asset.path) {
                  this.idToPath.set(asset.id, asset.path);
                }
              }
            }
            return this.manifest;
          }
        } catch {
          // Node fs loading error
        }
      }
    } catch (e) {
      console.warn(`[MazeGame:AssetLoader] Failed to fetch manifest (${e.message})`);
    }

    return null;
  }

  /**
   * Resolve logical asset ID or file path to canonical asset path
   * @param {string} idOrPath
   * @returns {string|null}
   */
  resolvePath(idOrPath) {
    if (!idOrPath || typeof idOrPath !== 'string') return null;
    if (idOrPath.startsWith('assets/') || idOrPath.endsWith('.svg')) {
      return idOrPath;
    }
    return this.idToPath.get(idOrPath) || null;
  }

  /**
   * Synchronously retrieve loaded HTMLImageElement for canvas rendering.
   * If not cached and in browser, starts asynchronous background load and returns null.
   * Returns null if loading, failed, or in headless environment.
   * @param {string} idOrPath
   * @returns {HTMLImageElement|null}
   */
  getImage(idOrPath) {
    const path = this.resolvePath(idOrPath);
    if (!path) return null;

    if (this.imageCache.has(path)) {
      const img = this.imageCache.get(path);
      return (img && img.complete && img.naturalWidth > 0) ? img : null;
    }

    if (typeof Image !== 'undefined') {
      const img = new Image();
      this.imageCache.set(path, img);
      img.src = path;
      return null;
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

  /**
   * Preload core assets for a given biome theme
   * @param {string} [theme='dungeon']
   * @returns {Promise<void>}
   */
  async preloadTheme(theme = 'dungeon') {
    const keys = [
      `tile_floor_${theme}`,
      `tile_floor_${theme}_cracked`,
      `tile_floor_${theme}_runic`,
      `tile_wall_${theme}`,
      `tile_wall_${theme}_torch`,
      `tile_wall_${theme}_grate`,
      `tile_bridge_${theme}_ew`,
      `tile_bridge_${theme}_ns`,
      `door_${theme}_horizontal`,
      `door_${theme}_vertical`,
      'tile_floor_generic',
      'door_classic',
      'key_classic',
      'lever_switch_off',
      'lever_switch_on',
      'exit_portal',
      'exit_stairs_up',
    ];
    const promises = keys.map(k => {
      const p = this.resolvePath(k);
      return p ? this.loadImage(p).catch(() => null) : Promise.resolve(null);
    });
    await Promise.all(promises);
  }

  /**
   * Preload all registered assets
   * @returns {Promise<void>}
   */
  async preloadAll() {
    const paths = new Set(this.idToPath.values());
    if (Array.isArray(this.manifest?.assets)) {
      for (const a of this.manifest.assets) {
        if (a.path) paths.add(a.path);
      }
    }
    const promises = Array.from(paths).map(p => this.loadImage(p).catch(() => null));
    await Promise.all(promises);
  }
}

// Global Singleton Instance
export const assetLoader = new AssetLoader();
