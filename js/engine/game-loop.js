/**
 * Game Loop & State Coordinator
 * Ties together input, physics/collision, entities, camera, fog, and rendering.
 */

import { TILES, KEY_CODES, ELEVATION, ENTITY_TYPES, SCREEN_TO_WORLD_DELTAS, isApproachAllowed, MOUSE_MOVE_MODES, getKeyCodesForPreset } from '../core/constants.js';
import { globalEvents } from '../core/events.js';
import { CollisionEngine } from './collision.js';
import { Key } from '../entities/key.js';
import { Door } from '../entities/door.js';
import { Lever } from '../entities/lever.js';
import { Teleporter } from '../entities/teleporter.js';
import { TimedHazard, Patroller } from '../entities/hazard.js';
import { PuzzleGate } from '../entities/puzzle-gate.js';
import { Signpost } from '../entities/signpost.js';
import { WallDecor } from '../entities/wall-decor.js';
import { Checkpoint } from '../entities/checkpoint.js';
import { Collectible } from '../entities/collectible.js';
import { Pedestal } from '../entities/pedestal.js';
import { RiddleItem } from '../entities/riddle-item.js';
import { Player } from '../entities/player.js';
import { Camera } from './camera.js';
import { FogOfWar } from './fog.js';
import { GameRenderer } from './renderer.js';
import { Minimap } from './minimap.js';
import { StorageManager } from '../core/storage.js';
import { DebugLogger } from './debug-logger.js';
import { PuzzleModal } from '../ui/puzzle-modal.js';
import { assetLoader } from '../core/asset-loader.js';
import { audioFX } from '../ui/audio-fx.js';
import { InputManager, GAME_COMMANDS } from './input-manager.js';

export class GameLoop {
  /**
   * @param {object} options
   * @param {HTMLCanvasElement} options.mainCanvas
   * @param {HTMLCanvasElement} options.minimapCanvas
   * @param {object} options.level
   * @param {object} [options.uiCallbacks]
   */
  constructor(optionsOrLevel, maybeMainCanvas, maybeMinimapCanvas, maybeUiCallbacks = {}) {
    let mainCanvas, minimapCanvas, level, uiCallbacks;
    if (optionsOrLevel && optionsOrLevel.mainCanvas) {
      ({ mainCanvas, minimapCanvas, level, uiCallbacks = {} } = optionsOrLevel);
    } else {
      level = optionsOrLevel;
      mainCanvas = maybeMainCanvas;
      minimapCanvas = maybeMinimapCanvas;
      uiCallbacks = maybeUiCallbacks;
    }
    this.mainCanvas = mainCanvas;
    this.canvas = mainCanvas;
    this.minimapCanvas = minimapCanvas;
    this.autoMovePath = null;
    this.clickTarget = null;
    this.level = JSON.parse(JSON.stringify(level));
    this.uiCallbacks = uiCallbacks || {};

    this.isRunning = false;
    this.isPaused = false;
    this.obscuringOverlays = new Set();
    this.isWon = false;
    this.lastTime = 0;
    this.elapsedTime = 0; // in milliseconds

    // Telemetry & Debug Logger
    this.logger = new DebugLogger(this.level);
    this.logger.log('game:start', {
      spawn: {
        x: this.level.spawn?.x ?? 1,
        y: this.level.spawn?.y ?? 1,
        elevation: this.level.spawn?.elevation || 0,
      },
    }, 0);

    // Multi-Room State Management
    this.roomStates = {};
    this.activeRoomId = null;
    this.currentRoom = null;
    this.lastRoomTransitionTime = -10000;
    this.isMultiRoom = Boolean(this.level.rooms && Object.keys(this.level.rooms).length > 0);

    let initialRoomDef = null;
    if (this.isMultiRoom) {
      this.activeRoomId = this.level.initialRoom || Object.keys(this.level.rooms)[0];
      initialRoomDef = this.level.rooms[this.activeRoomId];
      if (initialRoomDef) {
        this.currentRoom = initialRoomDef;
        this.level.dimensions = initialRoomDef.dimensions || this.level.dimensions;
        this.level.theme = initialRoomDef.theme || this.level.theme;
        this.level.backgroundArt = initialRoomDef.backgroundArt || this.level.backgroundArt || null;
        this.level.exits = initialRoomDef.exits || (initialRoomDef.exit ? [initialRoomDef.exit] : []);
        this.level.exit = this.level.exits[0] || null;
      }
    }

    // Subsystems
    const tileSize = this.level.config?.tileSize || 36;
    this.tileSize = tileSize;
    const savedZoom = StorageManager.getSetting('viewport_zoom', 1.0);
    this.camera = new Camera(mainCanvas.width, mainCanvas.height, tileSize, savedZoom);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.setProperty('--camera-zoom', String(this.camera.zoom));
    }
    this.fog = this.level.config?.fogOfWar
      ? new FogOfWar(this.level.dimensions.width, this.level.dimensions.height)
      : null;
    if (this.fog && this.level.config?.mapRevealed) {
      this.fog.reset(true);
    }
    const savedPerspective = StorageManager.getSetting('perspective');
    const initialPerspective = savedPerspective || this.level.config?.viewPerspective || 'angled';
    this.renderer = new GameRenderer(mainCanvas);
    this.renderer.setPerspective(initialPerspective);
    this.minimap = new Minimap(minimapCanvas);

    // Asynchronously preload vector assets in browser environment
    if (typeof fetch === 'function' && typeof window !== 'undefined') {
      const theme = this.level.config?.theme || 'dungeon';
      assetLoader.preloadTheme(theme).catch(() => {});
      assetLoader.loadManifest('assets/manifest.json').then(() => {
        assetLoader.preloadTheme(theme).catch(() => {});
      }).catch(() => {});
    }

    // Determine effective spawn coordinates (custom test spawn takes precedence in playtest mode)
    const effectiveSpawnX = this.level.testSpawn?.x ?? initialRoomDef?.spawn?.x ?? this.level.spawn?.x ?? 1;
    const effectiveSpawnY = this.level.testSpawn?.y ?? initialRoomDef?.spawn?.y ?? this.level.spawn?.y ?? 1;
    const effectiveElevation = this.level.testSpawn?.elevation ?? initialRoomDef?.spawn?.elevation ?? this.level.spawn?.elevation ?? 0;
    const initialInventory = Array.isArray(this.level.testInventory) ? [...this.level.testInventory] : [];

    // Instantiate Player
    this.player = new Player(
      effectiveSpawnX,
      effectiveSpawnY,
      effectiveElevation,
      tileSize,
      initialInventory
    );

    // Instantiate Entities & Room Layers
    if (this.isMultiRoom && initialRoomDef) {
      this.level.layers = JSON.parse(JSON.stringify(initialRoomDef.layers));
      this.entities = this.createEntities(initialRoomDef.entities || []);
      this.snapshotCurrentRoom();
    } else {
      this.entities = [];
      this.initEntities();
    }

    // Input state
    const savedKeybindingPreset = StorageManager.getSetting('keybinding_preset', 'wasd_arrows');
    this.mouseMoveMode = StorageManager.getSetting('mouse_move_mode', MOUSE_MOVE_MODES.CLICK_PATH);
    this.inputManager = new InputManager({
      hotkeysEnabled: this.areHotkeysEnabled(),
      keybindingPreset: savedKeybindingPreset,
    });
    this.keysDown = this.inputManager.keysDown;
    this.panVelocity = { x: 0, y: 0 };
    this.isDraggingMinimap = false;

    // React to live control settings changes (BL-100)
    globalEvents.on('settings:controls_changed', ({ keybindingPreset, mouseMoveMode }) => {
      if (keybindingPreset && this.inputManager) {
        this.inputManager.setKeybindingPreset(keybindingPreset);
      }
      if (mouseMoveMode) {
        this.mouseMoveMode = mouseMoveMode;
      }
    });

    // Checkpoint & snapshot state
    this.activeCheckpoint = null;
    this.checkpointSnapshot = null;

    // Snap camera to spawn
    this.camera.snapTo(
      this.player.worldX,
      this.player.worldY,
      this.level.dimensions.width,
      this.level.dimensions.height
    );

    // Puzzle modal state
    this.puzzleModal = new PuzzleModal();
    this.isPuzzleOpen = false;

    // Secret rooms & scoring metrics (BL-51, BL-52)
    this.revealedSecrets = new Set();
    this.secretsFound = 0;
    this.totalSecrets = this.calculateTotalSecrets();
    this.hazardHits = 0;

    // Level Lore Journal state (BL-81)
    this.levelJournal = [];

    // Multi-target interaction disambiguation state (BL-85, BL-91, ADR-009)
    this.isDisambiguating = false;

    // Initial fog update
    this.updateFog();

    // Bind listeners
    this.bindInputs();
    this.notifyUI();
  }

  /**
   * Helper to construct entity instances from plain entity definition objects
   * @param {Array<object>} entityDefs
   * @returns {Array<object>}
   */
  createEntities(entityDefs) {
    const riddleItems = [];
    const pedestals = [];

    const entities = (entityDefs || []).map(e => {
      if (e.type === ENTITY_TYPES.KEY) return new Key(e);
      if (e.type === ENTITY_TYPES.DOOR) return new Door(e);
      if (e.type === ENTITY_TYPES.LEVER) return new Lever(e);
      if (e.type === ENTITY_TYPES.TELEPORTER) return new Teleporter(e);
      if (e.type === ENTITY_TYPES.HAZARD) return new TimedHazard(e);
      if (e.type === ENTITY_TYPES.PATROLLER) return new Patroller(e);
      if (e.type === ENTITY_TYPES.PUZZLE_GATE) return new PuzzleGate(e);
      if (e.type === ENTITY_TYPES.SIGNPOST) return new Signpost(e);
      if (e.type === ENTITY_TYPES.WALL_DECOR) return new WallDecor(e);
      if (e.type === ENTITY_TYPES.CHECKPOINT) return new Checkpoint(e);
      if (e.type === ENTITY_TYPES.COLLECTIBLE) return new Collectible(e);
      if (e.type === ENTITY_TYPES.RIDDLE_ITEM) {
        const item = new RiddleItem(e);
        riddleItems.push(item);
        return item;
      }
      if (e.type === ENTITY_TYPES.PEDESTAL) {
        const ped = new Pedestal(e);
        pedestals.push(ped);
        return ped;
      }
      return null;
    }).filter(Boolean);

    // Link any initially slotted items
    for (const ped of pedestals) {
      if (ped.slottedItem && !(ped.slottedItem instanceof RiddleItem)) {
        const matchingItem = riddleItems.find(r => r.id === ped.slottedItem.id || r.id === ped.slottedItem);
        if (matchingItem) {
          ped.placeItem(matchingItem);
        } else {
          ped.placeItem(new RiddleItem(ped.slottedItem));
        }
      }
    }

    return entities;
  }

  /**
   * Instantiate entities from level definition
   */
  initEntities() {
    this.entities = this.createEntities(this.level.entities || []);
  }

  /**
   * Count total secret wall tiles configured across level layers
   * @returns {number}
   */
  calculateTotalSecrets() {
    let count = 0;
    const countInLayers = (layers) => {
      if (Array.isArray(layers?.ground)) {
        for (const row of layers.ground) {
          if (Array.isArray(row)) {
            for (const cell of row) {
              if (cell === TILES.SECRET_WALL) count++;
            }
          }
        }
      }
    };

    countInLayers(this.level?.layers);
    if (this.level?.rooms) {
      for (const room of Object.values(this.level.rooms)) {
        countInLayers(room?.layers);
      }
    }
    return count;
  }

  /**
   * Calculate overall numerical performance score (0 - 3000+)
   * @param {object} stats
   * @returns {number}
   */
  calculatePerformanceScore(stats) {
    const baseScore = 1000;
    const stepPenalty = Math.max(0, (stats.steps || 0) * 10);
    const timePenalty = Math.max(0, Math.floor((stats.time || 0) / 1000) * 5);
    const runScore = Math.max(0, baseScore - stepPenalty - timePenalty);

    const secretBonus = (stats.secretsFound || 0) * 300;
    const parStepsBonus = stats.earnedParSteps ? 250 : 0;
    const parTimeBonus = stats.earnedParTime ? 250 : 0;
    const flawlessBonus = stats.flawless ? 200 : 0;

    return runScore + secretBonus + parStepsBonus + parTimeBonus + flawlessBonus;
  }

  /**
   * Toggle perspective between angled 2.5D and flat top-down
   */
  togglePerspective() {
    const current = this.renderer.perspective || 'angled';
    const next = current === 'angled' ? 'topdown' : 'angled';
    this.renderer.setPerspective(next);
    StorageManager.setSetting('perspective', next);
    globalEvents.emit('perspective:toggled', { mode: next });
    if (this.uiCallbacks.onPerspectiveChange) {
      this.uiCallbacks.onPerspectiveChange(next);
    }
  }

  /**
   * Rotate world camera 90 degrees counter-clockwise
   */
  rotateLeft() {
    if (!this.camera) return;
    const prevAngle = this.camera.getDiscreteRotation();
    this.camera.rotateLeft();
    const newAngle = this.camera.getDiscreteRotation();
    if (this.logger) {
      this.logger.logCameraRotation({ fromAngle: prevAngle, toAngle: newAngle, elapsedMs: this.elapsedTime });
    }
    this.notifyUI();
    if (typeof window !== 'undefined' && window.audioFX?.playClick) {
      window.audioFX.playClick();
    }
    globalEvents.emit('camera:rotated', {
      rotation: this.camera.rotation,
      discreteRotation: this.camera.getDiscreteRotation(),
      heading: this.camera.getCompassHeading(),
    });
  }

  /**
   * Rotate world camera 90 degrees clockwise
   */
  rotateRight() {
    if (!this.camera) return;
    const prevAngle = this.camera.getDiscreteRotation();
    this.camera.rotateRight();
    const newAngle = this.camera.getDiscreteRotation();
    if (this.logger) {
      this.logger.logCameraRotation({ fromAngle: prevAngle, toAngle: newAngle, elapsedMs: this.elapsedTime });
    }
    this.notifyUI();
    if (typeof window !== 'undefined' && window.audioFX?.playClick) {
      window.audioFX.playClick();
    }
    globalEvents.emit('camera:rotated', {
      rotation: this.camera.rotation,
      discreteRotation: this.camera.getDiscreteRotation(),
      heading: this.camera.getCompassHeading(),
    });
  }

  /**
   * Set viewport zoom level
   * @param {number} level
   * @returns {number}
   */
  setZoom(level) {
    if (!this.camera) return 1.0;
    const newZoom = this.camera.setZoom(level);
    this.tileSize = this.camera.tileSize;
    StorageManager.setSetting('viewport_zoom', newZoom);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.setProperty('--camera-zoom', String(newZoom));
    }
    this.notifyUI();
    globalEvents.emit('camera:zoom_changed', {
      zoom: newZoom,
      tileSize: this.camera.tileSize,
    });
    return newZoom;
  }

  /**
   * Zoom in by step
   * @param {number} [step=0.1]
   * @returns {number}
   */
  zoomIn(step = 0.1) {
    if (!this.camera) return 1.0;
    const newZoom = this.camera.zoomIn(step);
    this.tileSize = this.camera.tileSize;
    StorageManager.setSetting('viewport_zoom', newZoom);
    this.notifyUI();
    globalEvents.emit('camera:zoom_changed', {
      zoom: newZoom,
      tileSize: this.camera.tileSize,
    });
    return newZoom;
  }

  /**
   * Zoom out by step
   * @param {number} [step=0.1]
   * @returns {number}
   */
  zoomOut(step = 0.1) {
    if (!this.camera) return 1.0;
    const newZoom = this.camera.zoomOut(step);
    this.tileSize = this.camera.tileSize;
    StorageManager.setSetting('viewport_zoom', newZoom);
    this.notifyUI();
    globalEvents.emit('camera:zoom_changed', {
      zoom: newZoom,
      tileSize: this.camera.tileSize,
    });
    return newZoom;
  }

  /**
   * Reset zoom to default 1.0x
   * @returns {number}
   */
  resetZoom() {
    if (!this.camera) return 1.0;
    const newZoom = this.camera.resetZoom();
    this.tileSize = this.camera.tileSize;
    StorageManager.setSetting('viewport_zoom', newZoom);
    this.notifyUI();
    globalEvents.emit('camera:zoom_changed', {
      zoom: newZoom,
      tileSize: this.camera.tileSize,
    });
    return newZoom;
  }

  /**
   * Initialize and switch active room in a multi-room level
   * @param {string} roomId
   * @param {object|null} [spawnOverride=null]
   * @param {boolean} [shouldSnapshot=true]
   */
  initActiveRoom(roomId, spawnOverride = null, shouldSnapshot = true) {
    if (!this.level.rooms || !this.level.rooms[roomId]) {
      console.warn(`[MazeGame:Engine] Room "${roomId}" not found in level definition`);
      return;
    }

    if (shouldSnapshot && this.activeRoomId) {
      this.snapshotCurrentRoom();
    }

    const roomDef = this.level.rooms[roomId];
    this.activeRoomId = roomId;
    this.currentRoom = roomDef;

    // Apply room properties to active level context
    this.level.dimensions = roomDef.dimensions || this.level.dimensions;
    this.level.theme = roomDef.theme || this.level.theme || 'stone';
    this.level.backgroundArt = roomDef.backgroundArt || this.level.backgroundArt || null;
    this.level.exits = roomDef.exits || (roomDef.exit ? [roomDef.exit] : []);
    this.level.exit = this.level.exits[0] || null;

    // Restore cached room state or initialize new
    if (this.roomStates[roomId]) {
      this.entities = this.roomStates[roomId].entities;
      this.level.layers = this.roomStates[roomId].layers;
    } else {
      this.level.layers = JSON.parse(JSON.stringify(roomDef.layers));
      this.entities = this.createEntities(roomDef.entities || []);
      this.snapshotCurrentRoom();
    }

    // Position player if player is instantiated
    const spawnX = spawnOverride?.x ?? roomDef.spawn?.x ?? 1;
    const spawnY = spawnOverride?.y ?? roomDef.spawn?.y ?? 1;
    const spawnElev = spawnOverride?.elevation ?? spawnOverride?.z ?? roomDef.spawn?.elevation ?? roomDef.spawn?.z ?? 0;

    if (this.player) {
      this.player.teleport(spawnX, spawnY, spawnElev);
      this.camera.snapTo(
        this.player.worldX,
        this.player.worldY,
        this.level.dimensions.width,
        this.level.dimensions.height
      );
    }

    // Re-create fog for this room's dimensions if fog is enabled
    if (this.level.config?.fogOfWar) {
      this.fog = new FogOfWar(this.level.dimensions.width, this.level.dimensions.height);
      if (this.level.config.mapRevealed) {
        this.fog.reset(true);
      }
    }

    this.updateFog();
    this.notifyUI();
    if (this.isRunning) {
      try {
        const theme = this.level.theme || this.level.config?.theme || 'dungeon';
        audioFX.startAmbience(theme);
      } catch {}
    }
    globalEvents.emit('room:entered', {
      roomId,
      title: roomDef.title || roomId,
      levelId: this.level.id,
    });
  }

  /**
   * Save current room state (mutable entities, modified layers) to cache
   */
  snapshotCurrentRoom() {
    if (!this.activeRoomId) return;
    this.roomStates[this.activeRoomId] = {
      entities: this.entities,
      layers: this.level.layers,
    };
  }

  /**
   * Seamlessly travel player between interconnected rooms
   * @param {string} targetRoomId
   * @param {object|null} [targetSpawn=null]
   */
  transitionToRoom(targetRoomId, targetSpawn = null, force = false) {
    const now = performance.now();
    if (!force && now - this.lastRoomTransitionTime < 300) return;
    this.lastRoomTransitionTime = now;

    if (!this.level.rooms || !this.level.rooms[targetRoomId]) {
      console.warn(`[MazeGame:Engine] Cannot transition to unknown room: ${targetRoomId}`);
      return;
    }

    const prevRoomId = this.activeRoomId;
    this.initActiveRoom(targetRoomId, targetSpawn, true);

    // Particle & shockwave flare at new spawn
    this.renderer.spawnParticles(this.player.worldX, this.player.worldY, '#38bdf8', 35);
    this.renderer.spawnShockwave(this.player.worldX, this.player.worldY, '#38bdf8', 45);
    const roomTitle = this.currentRoom?.title || targetRoomId;
    this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY - 24, `🚪 ${roomTitle}`, '#38bdf8');

    this.logger.log('room:transition', {
      fromRoom: prevRoomId,
      toRoom: targetRoomId,
      spawn: targetSpawn,
      elapsedMs: this.elapsedTime,
    });

    globalEvents.emit('room:transition', {
      fromRoom: prevRoomId,
      toRoom: targetRoomId,
      roomTitle,
    });

    if (this.uiCallbacks.onRoomTransition) {
      this.uiCallbacks.onRoomTransition({
        fromRoom: prevRoomId,
        toRoom: targetRoomId,
        roomTitle,
      });
    }
  }

  /**
   * Find matching exit at given player coordinates and elevation
   * @param {number} px
   * @param {number} py
   * @param {number} pe
   * @returns {object|null}
   */
  getMatchingExit(px, py, pe) {
    const exits = Array.isArray(this.level.exits) && this.level.exits.length > 0
      ? this.level.exits
      : (this.level.exit ? [this.level.exit] : []);

    return exits.find(e => {
      const ex = e.x;
      const ey = e.y;
      const ez = e.elevation ?? e.z ?? ELEVATION.GROUND;
      return px === ex && py === ey && pe === ez;
    }) || null;
  }

  /**
   * Move player one step in the specified screen direction ('UP', 'DOWN', 'LEFT', 'RIGHT')
   * Translates screen-relative direction according to current camera rotation angle.
   * @param {'UP'|'DOWN'|'LEFT'|'RIGHT'|'up'|'down'|'left'|'right'} direction
   * @returns {boolean}
   */
  tryMoveDirection(direction) {
    if (this.player.isMoving || this.camera.mode === 'freepan' || (this.camera?.isRotating?.() ?? false)) return false;
    const angle = this.camera?.getDiscreteRotation?.() ?? 0;
    const mapping = SCREEN_TO_WORLD_DELTAS[angle] || SCREEN_TO_WORLD_DELTAS[0];
    const delta = mapping[direction?.toUpperCase()];
    if (!delta) return false;
    return this.tryMove(this.player.gridX + delta.dx, this.player.gridY + delta.dy);
  }

  /**
   * Check whether single-letter shortcut hotkeys (Q, R, T, M, V) are enabled.
   * If false, the game operates in Simple Keyboard Mode (WASD/Arrows + Space/Enter only).
   * @returns {boolean}
   */
  areHotkeysEnabled() {
    const hotkeysEnabled = StorageManager.getSetting('hotkeys_enabled', true);
    const simpleMode = StorageManager.getSetting('simple_keyboard_mode', false);
    return !!hotkeysEnabled && !simpleMode;
  }

  /**
   * Toggle or set single-letter hotkeys on or off.
   * @param {boolean} enabled
   */
  setHotkeysEnabled(enabled) {
    const val = !!enabled;
    StorageManager.setSetting('hotkeys_enabled', val);
    StorageManager.setSetting('simple_keyboard_mode', !val);
    if (this.inputManager) {
      this.inputManager.setHotkeysEnabled(val);
    }
    globalEvents.emit('hotkeys:toggled', { enabled: val });
    if (typeof this.uiCallbacks.onHotkeysChanged === 'function') {
      this.uiCallbacks.onHotkeysChanged(val);
    }
  }

  /**
   * Bind keyboard, mouse, gamepad, and touch events
   */
  bindInputs() {
    if (this.inputManager) {
      this.inputManager.on(GAME_COMMANDS.INTERACT, () => {
        this.triggerInteract();
      });
      this.inputManager.on(GAME_COMMANDS.SELECT_OPTION, ({ index }) => {
        this.handleManualInteract(index);
      });
      this.inputManager.on(GAME_COMMANDS.ROTATE_LEFT, () => {
        this.rotateLeft();
      });
      this.inputManager.on(GAME_COMMANDS.ROTATE_RIGHT, () => {
        this.rotateRight();
      });
      this.inputManager.on(GAME_COMMANDS.TOGGLE_VIEW_MODE, () => {
        this.togglePerspective();
      });
      this.inputManager.on(GAME_COMMANDS.ZOOM_IN, () => {
        this.zoomIn();
      });
      this.inputManager.on(GAME_COMMANDS.ZOOM_OUT, () => {
        this.zoomOut();
      });
      this.inputManager.on(GAME_COMMANDS.ZOOM_RESET, () => {
        this.resetZoom();
      });
      this.inputManager.on(GAME_COMMANDS.TOGGLE_MAP, () => {
        this.toggleFreePan();
      });
      this.inputManager.on(GAME_COMMANDS.RESTART, () => {
        if (typeof this.uiCallbacks.onRequestRestart === 'function') {
          this.uiCallbacks.onRequestRestart();
        } else {
          this.restartLevel();
        }
      });
      this.inputManager.on(GAME_COMMANDS.PAUSE, () => {
        if (this.isDisambiguating) {
          this.closeDisambiguation();
          return;
        }
        if (typeof this.uiCallbacks.onTogglePause === 'function') {
          this.uiCallbacks.onTogglePause();
        } else {
          globalEvents.emit('game:pause_toggle');
        }
      });
    }

    // Auto-Pause & Resume synchronization (BL-92, ADR-0010)
    globalEvents.on('game:paused', () => {
      this.isPaused = true;
    });
    globalEvents.on('game:resumed', () => {
      this.isPaused = false;
      this.lastTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    });

    this.handleKeyDown = (e) => {
      if (this.inputManager) {
        this.inputManager.handleKeyDown(e);
      }
    };

    this.handleKeyUp = (e) => {
      if (this.inputManager) {
        this.inputManager.handleKeyUp(e);
      }
    };

    if (typeof window !== 'undefined' && this.inputManager) {
      this.inputManager.attach(window);
    }

    // Minimap Click & Drag for Free-Pan, Pinch-to-Zoom & Double-Tap (BL-17)
    let initialPinchDist = 0;
    let initialMinimapZoom = 1.0;
    let lastMinimapTapTime = 0;
    let touchMinimapStartX = 0;
    let touchMinimapStartY = 0;

    this.handleMinimapMouseDown = (e) => {
      this.isDraggingMinimap = true;
      if (this.minimap.zoom <= 1.05) {
        this.panToMinimapClick(e);
      }
    };

    this.handleMinimapMouseMove = (e) => {
      if (this.isDraggingMinimap) {
        if (this.minimap.zoom > 1.05) {
          const rect = this.minimapCanvas?.getBoundingClientRect?.() || { width: 180, height: 180 };
          const gridDeltaX = -((e.movementX || 0) / (rect.width || 1)) * (this.level.dimensions.width / this.minimap.zoom);
          const gridDeltaY = -((e.movementY || 0) / (rect.height || 1)) * (this.level.dimensions.height / this.minimap.zoom);
          this.minimap.panBy(gridDeltaX, gridDeltaY, this.level);
        } else {
          this.panToMinimapClick(e);
        }
      }
    };

    this.handleMinimapMouseUp = () => {
      this.isDraggingMinimap = false;
    };

    this.handleMinimapWheel = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      this.minimap.zoomBy(delta);
    };

    this.handleMinimapTouchStart = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (e.touches?.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialMinimapZoom = this.minimap.zoom;
      } else if (e.touches?.length === 1) {
        touchMinimapStartX = e.touches[0].clientX;
        touchMinimapStartY = e.touches[0].clientY;

        const now = performance.now();
        if (lastMinimapTapTime > 0 && (now - lastMinimapTapTime) < 300) {
          if (this.minimap.zoom > 1.05) {
            this.minimap.resetView();
          } else {
            this.minimap.setZoom(2.2);
          }
          lastMinimapTapTime = 0;
          return;
        }
        lastMinimapTapTime = now;

        this.isDraggingMinimap = true;
        if (this.minimap.zoom <= 1.05) {
          this.panToMinimapClick(e.touches[0]);
        }
      }
    };

    this.handleMinimapTouchMove = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (e.touches?.length === 2 && initialPinchDist > 0) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const scale = currentDist / (initialPinchDist || 1);
        this.minimap.setZoom(initialMinimapZoom * scale);
      } else if (e.touches?.length === 1 && this.isDraggingMinimap) {
        const curX = e.touches[0].clientX;
        const curY = e.touches[0].clientY;
        const deltaPixelX = curX - touchMinimapStartX;
        const deltaPixelY = curY - touchMinimapStartY;
        touchMinimapStartX = curX;
        touchMinimapStartY = curY;

        if (this.minimap.zoom > 1.05) {
          const rect = this.minimapCanvas?.getBoundingClientRect?.() || { width: 180, height: 180 };
          const gridDeltaX = -(deltaPixelX / (rect.width || 1)) * (this.level.dimensions.width / this.minimap.zoom);
          const gridDeltaY = -(deltaPixelY / (rect.height || 1)) * (this.level.dimensions.height / this.minimap.zoom);
          this.minimap.panBy(gridDeltaX, gridDeltaY, this.level);
        } else {
          this.panToMinimapClick(e.touches[0]);
        }
      }
    };

    this.handleMinimapTouchEnd = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (!e.touches || e.touches.length < 2) {
        initialPinchDist = 0;
      }
      if (!e.touches || e.touches.length === 0) {
        this.isDraggingMinimap = false;
      }
    };

    if (this.minimapCanvas && typeof this.minimapCanvas.addEventListener === 'function') {
      this.minimapCanvas.addEventListener('mousedown', this.handleMinimapMouseDown);
      this.minimapCanvas.addEventListener('touchstart', this.handleMinimapTouchStart, { passive: false });
      this.minimapCanvas.addEventListener('touchmove', this.handleMinimapTouchMove, { passive: false });
      this.minimapCanvas.addEventListener('touchend', this.handleMinimapTouchEnd, { passive: false });
      this.minimapCanvas.addEventListener('touchcancel', this.handleMinimapTouchEnd, { passive: false });
      this.minimapCanvas.addEventListener('wheel', this.handleMinimapWheel, { passive: false });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.handleMinimapMouseMove);
      window.addEventListener('mouseup', this.handleMinimapMouseUp);
    }

    // Click / Tap to Move & Interact on Canvas
    this.handleCanvasPointerDown = (e) => {
      if (this.camera.mode === 'freepan' || (this.camera?.isRotating?.() ?? false)) return;
      if (e.button !== undefined && e.button !== 0) return;

      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / (rect.width || 1);
      const scaleY = this.canvas.height / (rect.height || 1);
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;

      const worldPos = this.camera.screenToWorld(canvasX, canvasY, true);
      const targetGridX = Math.floor(worldPos.x / this.tileSize);
      const targetGridY = Math.floor(worldPos.y / this.tileSize);

      if (targetGridX < 0 || targetGridX >= this.level.dimensions.width || targetGridY < 0 || targetGridY >= this.level.dimensions.height) {
        return;
      }

      // If clicking own tile: interact!
      if (targetGridX === this.player.gridX && targetGridY === this.player.gridY) {
        this.handleManualInteract();
        return;
      }

      // If clicking an adjacent interactable: face it and interact
      const dist = Math.abs(targetGridX - this.player.gridX) + Math.abs(targetGridY - this.player.gridY);
      if (dist === 1) {
        const hasInteractable = this.entities.some(
          ent => ent.x === targetGridX && ent.y === targetGridY && (ent.elevation ?? ELEVATION.GROUND) === this.player.elevation
        );
        if (hasInteractable) {
          if (targetGridX > this.player.gridX) this.player.facing = 'east';
          else if (targetGridX < this.player.gridX) this.player.facing = 'west';
          else if (targetGridY > this.player.gridY) this.player.facing = 'south';
          else if (targetGridY < this.player.gridY) this.player.facing = 'north';
          this.handleManualInteract();
          return;
        }
      }

      // Pointer navigation check (BL-100)
      if (this.mouseMoveMode === MOUSE_MOVE_MODES.DISABLED) {
        return; // Movement via pointer is disabled
      }
      if (this.mouseMoveMode === MOUSE_MOVE_MODES.DRAG_ONLY) {
        return; // Click-to-move pathfinding disabled; only drag/steering permitted
      }

      const path = this.findPathTo(targetGridX, targetGridY);
      if (path && path.length > 0) {
        this.autoMovePath = path;
        this.clickTarget = {
          x: targetGridX,
          y: targetGridY,
          time: performance.now(),
          path: path.slice(0, 24),
        };
      }
    };

    // Main Canvas Mouse Wheel Zoom (BL-87)
    this.handleCanvasWheel = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      this.setZoom(this.camera.zoom + delta);
    };

    // Main Canvas Touch & Continuous Drag Steering Controls with 2-finger Pinch Zoom (BL-16, BL-67, BL-87)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchHasMoved = false;
    let touchSteeringActive = false;
    let touchSteerDirection = null;
    let touchSteerInterval = null;
    let canvasPinchDist = 0;
    let canvasPinchStartZoom = 1.0;

    this.stopTouchSteer = () => {
      if (touchSteerInterval) {
        clearInterval(touchSteerInterval);
        touchSteerInterval = null;
      }
      touchSteeringActive = false;
      touchSteerDirection = null;
    };

    this.handleCanvasTouchStart = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      this.stopTouchSteer();
      if (e.touches?.length === 2) {
        // Two-finger pinch to zoom
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        canvasPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        canvasPinchStartZoom = this.camera ? this.camera.zoom : 1.0;
        return;
      }
      if (e.touches?.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
        touchHasMoved = false;
      }
    };

    this.handleCanvasTouchMove = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (e.touches?.length === 2 && canvasPinchDist > 0) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const scale = currentDist / (canvasPinchDist || 1);
        this.setZoom(canvasPinchStartZoom * scale);
        return;
      }
      if (e.touches?.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          touchHasMoved = true;
        }

        // Continuous directional drag: deadzone threshold 20px (easier on mobile touch)
        if (dist >= 20) {
          const absX = Math.abs(dx);
          const absY = Math.abs(dy);
          const direction = absX > absY ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP');

          if (direction !== touchSteerDirection) {
            touchSteerDirection = direction;
            touchSteeringActive = true;
            this.autoMovePath = null;
            this.clickTarget = null;
            this.tryMoveDirection(direction);

            if (touchSteerInterval) clearInterval(touchSteerInterval);
            touchSteerInterval = setInterval(() => {
              if (touchSteerDirection) {
                this.tryMoveDirection(touchSteerDirection);
              }
            }, 120);
          }
        }
      }
    };

    this.handleCanvasTouchEnd = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (canvasPinchDist > 0 && e.touches?.length < 2) {
        canvasPinchDist = 0;
        return;
      }
      const hadSteering = touchSteeringActive;
      this.stopTouchSteer();

      if (e.changedTouches?.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - touchStartX;
        const dy = endY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const elapsed = performance.now() - touchStartTime;

        // If continuous drag steering already executed, finish cleanly
        if (hadSteering) {
          return;
        }

        // Swipe detected: distance >= 20px within 600ms
        if ((absX >= 20 || absY >= 20) && elapsed < 600) {
          const direction = absX > absY ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP');
          this.autoMovePath = null;
          this.clickTarget = null;
          this.tryMoveDirection(direction);
          return;
        }

        // Tap detected: pathfind / interact (no deadzone!)
        this.handleCanvasPointerDown({
          clientX: endX,
          clientY: endY,
          button: 0,
        });
      }
    };

    if (this.canvas && typeof this.canvas.addEventListener === 'function') {
      this.canvas.addEventListener('pointerdown', this.handleCanvasPointerDown);
      this.canvas.addEventListener('wheel', this.handleCanvasWheel, { passive: false });
      this.canvas.addEventListener('touchstart', this.handleCanvasTouchStart, { passive: false });
      this.canvas.addEventListener('touchmove', this.handleCanvasTouchMove, { passive: false });
      this.canvas.addEventListener('touchend', this.handleCanvasTouchEnd, { passive: false });
      this.canvas.addEventListener('touchcancel', this.handleCanvasTouchEnd, { passive: false });
    }
  }

  /**
   * Cleanup listeners
   */
  destroy() {
    this.stop();
    if (typeof this.stopTouchSteer === 'function') {
      this.stopTouchSteer();
    }
    if (this.puzzleModal) {
      this.puzzleModal.close();
    }
    if (this.inputManager) {
      this.inputManager.detach();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('mousemove', this.handleMinimapMouseMove);
      window.removeEventListener('mouseup', this.handleMinimapMouseUp);
    }
    if (this.minimapCanvas && typeof this.minimapCanvas.removeEventListener === 'function') {
      this.minimapCanvas.removeEventListener('mousedown', this.handleMinimapMouseDown);
      this.minimapCanvas.removeEventListener('touchstart', this.handleMinimapTouchStart);
      this.minimapCanvas.removeEventListener('touchmove', this.handleMinimapTouchMove);
      this.minimapCanvas.removeEventListener('touchend', this.handleMinimapTouchEnd);
      this.minimapCanvas.removeEventListener('touchcancel', this.handleMinimapTouchEnd);
      this.minimapCanvas.removeEventListener('wheel', this.handleMinimapWheel);
    }
    if (this.canvas && typeof this.canvas.removeEventListener === 'function') {
      this.canvas.removeEventListener('pointerdown', this.handleCanvasPointerDown);
      this.canvas.removeEventListener('wheel', this.handleCanvasWheel);
      this.canvas.removeEventListener('touchstart', this.handleCanvasTouchStart);
      this.canvas.removeEventListener('touchmove', this.handleCanvasTouchMove);
      this.canvas.removeEventListener('touchend', this.handleCanvasTouchEnd);
      this.canvas.removeEventListener('touchcancel', this.handleCanvasTouchEnd);
    }
  }

  /**
   * Toggle between player follow and free pan
   */
  toggleFreePan() {
    if (!this.level.config.allowFreePan) return;
    const nextMode = this.camera.mode === 'follow' ? 'freepan' : 'follow';
    this.camera.setMode(nextMode);
    globalEvents.emit('freepan:toggled', { mode: nextMode });
    if (this.uiCallbacks.onFreePanChange) {
      this.uiCallbacks.onFreePanChange(nextMode);
    }
  }

  /**
   * Pan camera to minimap point
   */
  panToMinimapClick(e) {
    const { gridX, gridY } = this.minimap.mapClickToGrid(e.clientX, e.clientY, this.level, this.player);
    const tileSize = this.camera.tileSize;
    this.camera.setMode('freepan');
    this.camera.x = gridX * tileSize + tileSize / 2;
    this.camera.y = gridY * tileSize + tileSize / 2;
    this.camera.clampToBounds(this.level.dimensions.width, this.level.dimensions.height);
    if (this.uiCallbacks.onFreePanChange) {
      this.uiCallbacks.onFreePanChange('freepan');
    }
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    try {
      const theme = this.level?.config?.theme || this.level?.theme || 'dungeon';
      audioFX.startAmbience(theme);
    } catch {}
    console.info(
      `[MazeGame:Engine] Game loop started for level "${this.level.title}" (ID: ${this.level.id}) | Dimensions: ${this.level.dimensions.width}x${this.level.dimensions.height} | Entities: ${this.entities.length}`
    );
    this.loop(this.lastTime);
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.isRunning = false;
    try {
      audioFX.pauseAmbience();
    } catch {}
    console.info('[MazeGame:Engine] Game loop stopped');
  }

  /**
   * Reset the current level state
   */
  restartLevel() {
    try {
      const theme = this.level?.config?.theme || this.level?.theme || 'dungeon';
      audioFX.startAmbience(theme);
    } catch {}
    this.roomStates = {};
    this.autoMovePath = null;
    this.clickTarget = null;
    let effectiveSpawnX = 1;
    let effectiveSpawnY = 1;
    let effectiveElevation = 0;
    const initialInventory = Array.isArray(this.level.testInventory) ? [...this.level.testInventory] : [];

    if (this.isMultiRoom) {
      const initialId = this.level.initialRoom || Object.keys(this.level.rooms)[0];
      const initialRoom = this.level.rooms[initialId];
      effectiveSpawnX = this.level.testSpawn?.x ?? initialRoom?.spawn?.x ?? 1;
      effectiveSpawnY = this.level.testSpawn?.y ?? initialRoom?.spawn?.y ?? 1;
      effectiveElevation = this.level.testSpawn?.elevation ?? initialRoom?.spawn?.elevation ?? 0;

      this.player.reset(
        effectiveSpawnX,
        effectiveSpawnY,
        effectiveElevation,
        initialInventory
      );
      this.initActiveRoom(initialId, { x: effectiveSpawnX, y: effectiveSpawnY, elevation: effectiveElevation }, false);
    } else {
      effectiveSpawnX = this.level.testSpawn?.x ?? this.level.spawn?.x ?? 1;
      effectiveSpawnY = this.level.testSpawn?.y ?? this.level.spawn?.y ?? 1;
      effectiveElevation = this.level.testSpawn?.elevation ?? this.level.spawn?.elevation ?? 0;

      this.player.reset(
        effectiveSpawnX,
        effectiveSpawnY,
        effectiveElevation,
        initialInventory
      );
      this.initEntities();
      if (this.fog) {
        this.fog.reset(!!this.level.config.mapRevealed);
      }
      this.camera.snapTo(
        this.player.worldX,
        this.player.worldY,
        this.level.dimensions.width,
        this.level.dimensions.height
      );
      this.updateFog();
    }

    this.isWon = false;
    this.elapsedTime = 0;
    this.revealedSecrets = new Set();
    this.secretsFound = 0;
    this.hazardHits = 0;
    this.levelJournal = [];
    this.camera.setMode('follow');

    // Reset logger for new attempt
    this.logger = new DebugLogger(this.level);
    this.logger.log('game:restarted', {
      spawn: {
        x: effectiveSpawnX,
        y: effectiveSpawnY,
        elevation: effectiveElevation,
      },
    }, 0);

    console.info(`[MazeGame:Engine] Level restarted at (${effectiveSpawnX}, ${effectiveSpawnY}, ${effectiveElevation})`);
    this.notifyUI();
    globalEvents.emit('game:restarted');
    if (this.uiCallbacks.onRestart) {
      this.uiCallbacks.onRestart();
    }
  }

  /**
   * Main animation frame loop
   */
  loop(currentTime) {
    if (!this.isRunning) return;

    try {
      const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
      this.lastTime = currentTime;

      if (!this.isPaused && !this.isWon) {
        this.elapsedTime += dt * 1000;
        this.update(dt);
      }

      this.render(dt);
    } catch (err) {
      console.error('[MazeGame:Engine] Exception inside animation loop:', err);
      if (this.logger) {
        this.logger.logError({
          message: err.message || 'GameLoop iteration error',
          stack: err.stack,
          source: 'animation_frame_loop',
          elapsedMs: this.elapsedTime,
        });
      }
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Game state updates
   */
  update(dt) {
    if (this.isPuzzleOpen) return;

    // 1. Process continuous movement input
    this.processPlayerMovement();

    // 2. Process Free-Pan manual camera panning
    if (this.camera.mode === 'freepan') {
      this.processFreePanMovement(dt);
    }

    // 3. Update Player
    const prevGridX = this.player.gridX;
    const prevGridY = this.player.gridY;
    const prevElevation = this.player.elevation;

    this.player.update(dt);

    // If player just finished a step onto a new cell
    if (!this.player.isMoving && (prevGridX !== this.player.gridX || prevGridY !== this.player.gridY || prevElevation !== this.player.elevation)) {
      if (prevElevation !== this.player.elevation) {
        this.logger.logElevationChange({
          fromElevation: prevElevation,
          toElevation: this.player.elevation,
          atX: this.player.gridX,
          atY: this.player.gridY,
          triggerTile: this.level.layers.ground[this.player.gridY]?.[this.player.gridX],
          elapsedMs: this.elapsedTime,
        });
      }

      this.logger.logStepCompleted({
        stepIndex: this.player.stepsTaken,
        x: this.player.gridX,
        y: this.player.gridY,
        elevation: this.player.elevation,
        facing: this.player.facing,
        elapsedMs: this.elapsedTime,
      });

      this.handleCellArrival();
    }

    // 4. Update Entities and check dynamic hazard collisions
    for (const entity of this.entities) {
      entity.update(dt);

      if (entity.type === ENTITY_TYPES.PATROLLER) {
        if (entity.checkCollision(this.player.worldX, this.player.worldY, this.player.elevation, this.camera.tileSize)) {
          this.handleHazardHit(entity);
        }
      } else if (entity.type === ENTITY_TYPES.HAZARD) {
        if (entity.isLethalAt(this.player.gridX, this.player.gridY, this.player.elevation)) {
          this.handleHazardHit(entity);
        }
      }
    }

    // 5. Update Camera
    this.camera.update(
      this.player.worldX,
      this.player.worldY,
      dt,
      this.level.dimensions.width,
      this.level.dimensions.height
    );

    // 6. Update Fog
    this.updateFog();

    // 7. Check Victory Condition or Room Transition (Player must match exit coordinates and elevation)
    if (!this.isWon && !this.player.isMoving) {
      const matchingExit = this.getMatchingExit(this.player.gridX, this.player.gridY, this.player.elevation);
      if (matchingExit) {
        if (matchingExit.targetRoom) {
          this.transitionToRoom(matchingExit.targetRoom, matchingExit.targetSpawn);
        } else {
          this.handleVictory(matchingExit);
        }
      }
    }

    // 8. Check for available contextual interaction (BL-42, BL-85, BL-91)
    this.checkContextualInteraction();
  }

  /**
   * Check for input direction and initiate player movement (screen-relative)
   */
  processPlayerMovement() {
    if (this.player.isMoving || this.camera.mode === 'freepan' || (this.camera?.isRotating?.() ?? false)) return;

    let screenDx = 0;
    let screenDy = 0;

    if (this.inputManager) {
      const poll = this.inputManager.poll();
      screenDx = poll.dx;
      screenDy = poll.dy;
    } else {
      for (const code of this.keysDown) {
        if (KEY_CODES.UP.includes(code)) screenDy -= 1;
        else if (KEY_CODES.DOWN.includes(code)) screenDy += 1;
        else if (KEY_CODES.LEFT.includes(code)) screenDx -= 1;
        else if (KEY_CODES.RIGHT.includes(code)) screenDx += 1;
      }
      if (screenDx !== 0) screenDy = 0;
    }

    // Cancel auto-move path if player presses directional keys
    if (screenDx !== 0 || screenDy !== 0) {
      this.autoMovePath = null;
      this.clickTarget = null;
    }

    // Restrict to orthogonal movement
    if (screenDx !== 0) screenDy = 0;

    if (screenDx !== 0 || screenDy !== 0) {
      const angle = this.camera?.getDiscreteRotation?.() ?? 0;
      const mapping = SCREEN_TO_WORLD_DELTAS[angle] || SCREEN_TO_WORLD_DELTAS[0];
      let worldDx = 0;
      let worldDy = 0;

      if (screenDy < 0) {
        worldDx = mapping.UP.dx;
        worldDy = mapping.UP.dy;
      } else if (screenDy > 0) {
        worldDx = mapping.DOWN.dx;
        worldDy = mapping.DOWN.dy;
      } else if (screenDx < 0) {
        worldDx = mapping.LEFT.dx;
        worldDy = mapping.LEFT.dy;
      } else if (screenDx > 0) {
        worldDx = mapping.RIGHT.dx;
        worldDy = mapping.RIGHT.dy;
      }

      const targetX = this.player.gridX + worldDx;
      const targetY = this.player.gridY + worldDy;
      this.tryMove(targetX, targetY);
      return;
    }

    // Process next step along autoMovePath if active and no directional keys are held
    if (this.autoMovePath && this.autoMovePath.length > 0) {
      const nextStep = this.autoMovePath.shift();
      const moved = this.tryMove(nextStep.x, nextStep.y);
      if (!moved) {
        this.autoMovePath = null;
        this.clickTarget = null;
      }
    }
  }

  /**
   * Find the shortest walkable path to the target grid coordinate using Breadth-First Search (BFS).
   * Respects elevation, ramps, bridges, and door keys using CollisionEngine.checkMove.
   * If the target cell is a solid obstacle (e.g. wall, lever on wall, closed gate),
   * finds the path to the closest walkable adjacent cell.
   * @param {number} targetX
   * @param {number} targetY
   * @returns {Array<{x: number, y: number}>|null} Array of path steps, or null if unreachable
   */
  findPathTo(targetX, targetY) {
    if (targetX < 0 || targetX >= this.level.dimensions.width || targetY < 0 || targetY >= this.level.dimensions.height) {
      return null;
    }

    const startX = this.player.gridX;
    const startY = this.player.gridY;
    const startElev = this.player.elevation;

    if (startX === targetX && startY === targetY) {
      return [];
    }

    const queue = [{ x: startX, y: startY, elevation: startElev, path: [] }];
    const visited = new Set([`${startX},${startY},${startElev}`]);
    let bestAdjacentPath = null;

    let iterations = 0;
    const maxIterations = 3500;

    while (queue.length > 0 && iterations++ < maxIterations) {
      const curr = queue.shift();

      // If we directly reached target:
      if (curr.x === targetX && curr.y === targetY) {
        return curr.path;
      }

      // If target tile itself is adjacent and non-walkable directly (e.g. wall, closed door, lever), record shortest adjacent path
      if (!bestAdjacentPath && Math.abs(curr.x - targetX) + Math.abs(curr.y - targetY) === 1) {
        bestAdjacentPath = curr.path;
      }

      const neighbors = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];

      for (const n of neighbors) {
        const nx = curr.x + n.dx;
        const ny = curr.y + n.dy;

        if (nx < 0 || nx >= this.level.dimensions.width || ny < 0 || ny >= this.level.dimensions.height) {
          continue;
        }

        const check = CollisionEngine.checkMove(
          curr.x,
          curr.y,
          nx,
          ny,
          curr.elevation,
          this.level,
          this.entities,
          this.player.inventory
        );

        if (check.allowed) {
          const nextElevation = check.nextElevation;
          const key = `${nx},${ny},${nextElevation}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({
              x: nx,
              y: ny,
              elevation: nextElevation,
              path: [...curr.path, { x: nx, y: ny }],
            });
          }
        }
      }
    }

    return bestAdjacentPath;
  }

  /**
   * Retrieve all available interaction candidates adjacent to or at player's location (BL-85).
   * Respects entity directional interaction restrictions (interactDirections) and elevation.
   * @returns {Array<{ id: string, index: number, type: string, label: string, name: string, icon: string, keyHint: string, x: number, y: number, entity?: object, canInteract: boolean }>}
   */
  getAllAvailableInteractions() {
    if (!this.player || this.isPuzzleOpen || this.isWon || this.camera?.mode === 'freepan') return [];

    const px = this.player.gridX;
    const py = this.player.gridY;
    const pe = this.player.elevation;

    const facingDx = this.player.facing === 'east' ? 1 : (this.player.facing === 'west' ? -1 : 0);
    const facingDy = this.player.facing === 'south' ? 1 : (this.player.facing === 'north' ? -1 : 0);
    const facingX = px + facingDx;
    const facingY = py + facingDy;

    const rawCandidates = [];

    // Helper to test if entity can be interacted with
    const canEntityInteract = (ent) => {
      if (!ent) return false;
      if (typeof ent.canInteract === 'function') {
        return ent.canInteract(px, py, pe);
      }
      if ((ent.elevation ?? ent.z ?? ELEVATION.GROUND) !== pe) return false;
      const dist = Math.abs(ent.x - px) + Math.abs(ent.y - py);
      if (dist > 1) return false;
      return isApproachAllowed(ent.x, ent.y, px, py, ent.interactDirections);
    };

    // 1. Locked PuzzleGate
    for (const g of this.entities) {
      if (g.type === ENTITY_TYPES.PUZZLE_GATE && !g.isUnlocked && canEntityInteract(g)) {
        rawCandidates.push({
          id: g.id || `puzzle_gate_${g.x}_${g.y}`,
          type: 'puzzle_gate',
          label: g.name ? `Solve ${g.name}` : 'Solve Seal',
          name: g.name || 'Puzzle Seal',
          icon: '🧩',
          x: g.x,
          y: g.y,
          elevation: g.elevation ?? ELEVATION.GROUND,
          entity: g,
          canInteract: true,
        });
      }
    }

    // 2. Pedestals
    for (const ped of this.entities) {
      if (ped.type === ENTITY_TYPES.PEDESTAL && canEntityInteract(ped)) {
        const hasCarried = this.player.hasCarriedRiddleItem();
        let label = `Inspect ${ped.name || 'Pedestal'}`;
        let icon = '🦅';
        if (hasCarried && !ped.slottedItem) {
          label = `Place ${this.player.carriedRiddleItem.name || 'Relic'}`;
          icon = '📥';
        } else if (!hasCarried && ped.slottedItem) {
          label = `Take ${ped.slottedItem.name || 'Relic'}`;
          icon = '📤';
        }
        rawCandidates.push({
          id: ped.id || `pedestal_${ped.x}_${ped.y}`,
          type: 'pedestal',
          label,
          name: ped.name || 'Pedestal',
          icon,
          x: ped.x,
          y: ped.y,
          elevation: ped.elevation ?? ELEVATION.GROUND,
          entity: ped,
          canInteract: true,
        });
      }
    }

    // 3. Levers
    for (const lever of this.entities) {
      if ((lever.type === 'lever' || lever.type === ENTITY_TYPES.LEVER) && canEntityInteract(lever)) {
        rawCandidates.push({
          id: lever.id || `lever_${lever.x}_${lever.y}`,
          type: 'lever',
          label: lever.state ? `Switch Off (${lever.name || 'Switch'})` : `Pull ${lever.name || 'Switch'}`,
          name: lever.name || 'Switch',
          icon: '🕹️',
          x: lever.x,
          y: lever.y,
          elevation: lever.elevation ?? ELEVATION.GROUND,
          entity: lever,
          canInteract: true,
        });
      }
    }

    // 4. Signposts
    for (const s of this.entities) {
      if (s.type === ENTITY_TYPES.SIGNPOST && canEntityInteract(s)) {
        rawCandidates.push({
          id: s.id || `signpost_${s.x}_${s.y}`,
          type: 'signpost',
          label: s.title ? `Read "${s.title}"` : 'Read Signpost',
          name: s.title || 'Signpost',
          icon: '📜',
          x: s.x,
          y: s.y,
          elevation: s.elevation ?? ELEVATION.GROUND,
          entity: s,
          canInteract: true,
        });
      }
    }

    // 5. WallDecor
    for (const d of this.entities) {
      if (d.type === ENTITY_TYPES.WALL_DECOR && canEntityInteract(d)) {
        const icon = d.decorType === 'note' ? '📝' : (d.decorType === 'painting' ? '🖼️' : '🏛️');
        rawCandidates.push({
          id: d.id || `wall_decor_${d.x}_${d.y}`,
          type: 'wall_decor',
          label: d.title ? `Examine "${d.title}"` : 'Examine Lore',
          name: d.title || 'Wall Lore',
          icon,
          x: d.x,
          y: d.y,
          elevation: d.elevation ?? ELEVATION.GROUND,
          entity: d,
          canInteract: true,
        });
      }
    }

    // 6. Floor RiddleItems
    for (const item of this.entities) {
      if (item.type === ENTITY_TYPES.RIDDLE_ITEM && !item.isCarried && !item.isSlotted && canEntityInteract(item)) {
        rawCandidates.push({
          id: item.id || `riddle_item_${item.x}_${item.y}`,
          type: 'riddle_item',
          label: this.player.hasCarriedRiddleItem() ? `Swap for ${item.name || 'Relic'}` : `Pick Up ${item.name || 'Relic'}`,
          name: item.name || 'Relic',
          icon: '🗿',
          x: item.x,
          y: item.y,
          elevation: item.elevation ?? ELEVATION.GROUND,
          entity: item,
          canInteract: true,
        });
      }
    }

    // 7. Doors
    for (const d of this.entities) {
      if (d.type === ENTITY_TYPES.DOOR && !d.isOpen && canEntityInteract(d)) {
        const hasKey = this.player.hasKey(d.requiresKey);
        rawCandidates.push({
          id: d.id || `door_${d.x}_${d.y}`,
          type: 'door',
          label: hasKey ? `Unlock ${d.name || 'Door'}` : `Locked (${d.name || 'Door'})`,
          name: d.name || 'Door',
          icon: hasKey ? '🗝️' : '🔒',
          x: d.x,
          y: d.y,
          elevation: d.elevation ?? ELEVATION.GROUND,
          entity: d,
          canInteract: hasKey,
        });
      }
    }

    // 8. Exit
    const exit = this.getMatchingExit(px, py, pe);
    if (exit) {
      rawCandidates.push({
        id: `exit_${px}_${py}`,
        type: 'exit',
        label: exit.targetRoom ? 'Proceed to Room' : 'Exit Portal',
        name: exit.targetRoom ? 'Room Portal' : 'Maze Exit',
        icon: '🌀',
        x: px,
        y: py,
        elevation: pe,
        exit,
        canInteract: true,
      });
    }

    // Sort candidates:
    // 0: in front of player (facingX, facingY)
    // 1: on player's tile (px, py)
    // 2: adjacent on sides or behind
    rawCandidates.sort((a, b) => {
      const aFacing = (a.x === facingX && a.y === facingY) ? 0 : ((a.x === px && a.y === py) ? 1 : 2);
      const bFacing = (b.x === facingX && b.y === facingY) ? 0 : ((b.x === px && b.y === py) ? 1 : 2);
      if (aFacing !== bFacing) return aFacing - bFacing;
      const aDist = Math.abs(a.x - px) + Math.abs(a.y - py);
      const bDist = Math.abs(b.x - px) + Math.abs(b.y - py);
      return aDist - bDist;
    });

    // Assign indices (1-based) and keyHints
    return rawCandidates.map((c, idx) => ({
      ...c,
      index: idx + 1,
      keyHint: rawCandidates.length > 1 ? String(idx + 1) : 'E',
    }));
  }

  /**
   * Get primary interactable entity or tile action available at or adjacent to player's current location (BL-42, BL-85)
   * @returns {{ type: string, label: string, icon: string, keyHint: string, x: number, y: number, canInteract: boolean, candidates: Array<object> }|null}
   */
  getAvailableInteraction() {
    const candidates = this.getAllAvailableInteractions();
    if (!candidates || candidates.length === 0) return null;
    return { ...candidates[0], candidates };
  }

  /**
   * Check for available contextual interactions and invoke UI callbacks (BL-42, BL-85, BL-91)
   */
  checkContextualInteraction() {
    if (typeof this.uiCallbacks.onInteractionAvailable !== 'function') return;

    const candidates = this.getAllAvailableInteractions();
    let interaction = null;
    let targetScreenPos = null;
    let playerScreenPos = null;
    let candidatesWithPos = [];

    if (this.camera && this.player) {
      playerScreenPos = this.camera.worldToScreen(this.player.worldX, this.player.worldY, true);
    }

    if (candidates && candidates.length > 0) {
      candidatesWithPos = candidates.map(c => {
        let screenPos = null;
        if (this.camera && c.x !== undefined && c.y !== undefined) {
          const tileTopLeft = this.camera.tileToScreen ? this.camera.tileToScreen(c.x, c.y) : this.camera.worldToScreen(c.x * this.camera.tileSize, c.y * this.camera.tileSize, true);
          screenPos = {
            x: tileTopLeft.x + this.camera.tileSize / 2,
            y: tileTopLeft.y + this.camera.tileSize / 2,
          };
        }
        return { ...c, screenPos };
      });

      const primary = candidatesWithPos[0];
      targetScreenPos = primary.screenPos;
      interaction = { ...primary, candidates: candidatesWithPos, isDisambiguating: this.isDisambiguating };
    } else {
      if (this.isDisambiguating) {
        this.isDisambiguating = false;
      }
    }

    this.uiCallbacks.onInteractionAvailable(interaction, targetScreenPos || playerScreenPos, targetScreenPos, playerScreenPos, candidatesWithPos, this.isDisambiguating);
  }

  /**
   * Attempt to move player towards target cell coordinate
   * @param {number} targetX
   * @param {number} targetY
   * @returns {boolean} Whether movement was allowed and started
   */
  tryMove(targetX, targetY) {
    if (this.player.isMoving || this.camera.mode === 'freepan' || (this.camera?.isRotating?.() ?? false)) return false;

    // Check collision & elevation change
    const check = CollisionEngine.checkMove(
      this.player.gridX,
      this.player.gridY,
      targetX,
      targetY,
      this.player.elevation,
      this.level,
      this.entities,
      this.player.inventory
    );

    this.logger.logMoveAttempt({
      fromX: this.player.gridX,
      fromY: this.player.gridY,
      fromElevation: this.player.elevation,
      toX: targetX,
      toY: targetY,
      allowed: check.allowed,
      nextElevation: check.nextElevation,
      reason: check.reason,
      elapsedMs: this.elapsedTime,
    });

    if (check.allowed) {
      if (this.isDisambiguating) {
        this.closeDisambiguation();
      }
      // If door was unlocked
      if (check.doorToUnlock) {
        check.doorToUnlock.open();
        this.player.removeKey(check.doorToUnlock.requiresKey);
        const doorWx = targetX * this.camera.tileSize + this.camera.tileSize / 2;
        const doorWy = targetY * this.camera.tileSize + this.camera.tileSize / 2;
        this.renderer.spawnParticles(doorWx, doorWy, check.doorToUnlock.color, 25);
        this.renderer.spawnShockwave(doorWx, doorWy, check.doorToUnlock.color, 36);
        this.renderer.spawnFloatingText(doorWx, doorWy, '🔓 Gate Unlocked!', check.doorToUnlock.color || '#38bdf8');
        this.logger.logDoorUnlocked({
          doorId: check.doorToUnlock.id,
          keyUsed: check.doorToUnlock.requiresKey,
          atX: targetX,
          atY: targetY,
          elapsedMs: this.elapsedTime,
        });
        globalEvents.emit('door:unlocked', {
          doorId: check.doorToUnlock.id,
          doorName: check.doorToUnlock.name || 'Gate',
          keyUsed: check.doorToUnlock.requiresKey,
          color: check.doorToUnlock.color,
          x: targetX,
          y: targetY,
        });
        this.notifyUI();
      }

      if (check.nextElevation !== this.player.elevation) {
        globalEvents.emit('player:elevation_changed', {
          from: this.player.elevation,
          to: check.nextElevation,
          ascending: check.nextElevation > this.player.elevation,
        });
      }

      this.player.startMove(targetX, targetY, check.nextElevation);
      return true;
    } else if (check.reason === 'door_locked' && check.doorToUnlock) {
      const now = performance.now();
      if (!this.lastLockedDoorFeedback || now - this.lastLockedDoorFeedback > 450) {
        this.lastLockedDoorFeedback = now;
        const reqKey = this.entities.find(e => e.id === check.doorToUnlock.requiresKey);
        const reqKeyName = reqKey?.name || 'Matching Key';
        const doorWx = targetX * this.camera.tileSize + this.camera.tileSize / 2;
        const doorWy = targetY * this.camera.tileSize + this.camera.tileSize / 2;
        this.renderer.spawnFloatingText(doorWx, doorWy, `🔒 Needs ${reqKeyName}`, check.doorToUnlock.color || '#f43f5e');
        globalEvents.emit('door:locked', {
          doorId: check.doorToUnlock.id,
          doorName: check.doorToUnlock.name || 'Gate',
          requiredKeyId: check.doorToUnlock.requiresKey,
          requiredKeyName: reqKeyName,
          color: check.doorToUnlock.color || '#f43f5e',
          x: targetX,
          y: targetY,
        });
      }
      return false;
    } else if (check.reason === 'puzzle_gate_locked' && check.puzzleGate) {
      const now = performance.now();
      if (!this.lastPuzzleGateFeedback || now - this.lastPuzzleGateFeedback > 600) {
        this.lastPuzzleGateFeedback = now;
        this.openPuzzleGateModal(check.puzzleGate);
      }
      return false;
    }
    return false;
  }

  /**
   * Process manual camera pan when in Free-Pan mode
   */
  processFreePanMovement(dt) {
    let screenDx = 0;
    let screenDy = 0;

    if (this.inputManager) {
      const poll = this.inputManager.poll(dt);
      screenDx = poll.dx;
      screenDy = poll.dy;
    } else {
      for (const code of this.keysDown) {
        if (KEY_CODES.UP.includes(code)) screenDy -= 1;
        else if (KEY_CODES.DOWN.includes(code)) screenDy += 1;
        else if (KEY_CODES.LEFT.includes(code)) screenDx -= 1;
        else if (KEY_CODES.RIGHT.includes(code)) screenDx += 1;
      }
    }

    if (screenDx !== 0 || screenDy !== 0) {
      const speed = this.camera.panSpeed * dt;
      const angle = this.camera?.getDiscreteRotation?.() ?? 0;
      const mapping = SCREEN_TO_WORLD_DELTAS[angle] || SCREEN_TO_WORLD_DELTAS[0];
      let worldDx = 0;
      let worldDy = 0;

      if (screenDy < 0) { worldDx += mapping.UP.dx; worldDy += mapping.UP.dy; }
      if (screenDy > 0) { worldDx += mapping.DOWN.dx; worldDy += mapping.DOWN.dy; }
      if (screenDx < 0) { worldDx += mapping.LEFT.dx; worldDy += mapping.LEFT.dy; }
      if (screenDx > 0) { worldDx += mapping.RIGHT.dx; worldDy += mapping.RIGHT.dy; }

      this.camera.panBy(
        worldDx * speed,
        worldDy * speed,
        this.level.dimensions.width,
        this.level.dimensions.height
      );
    }
  }

  /**
   * Handle when player steps onto a new grid cell
   */
  handleCellArrival() {
    const px = this.player.gridX;
    const py = this.player.gridY;
    const pe = this.player.elevation;

    // 0. Check Secret Wall Discovery (BL-51)
    const currentGround = this.level.layers?.ground?.[py]?.[px];
    if (currentGround === TILES.SECRET_WALL && pe === ELEVATION.GROUND) {
      const secretKey = `${px},${py}`;
      if (!this.revealedSecrets.has(secretKey)) {
        this.revealedSecrets.add(secretKey);
        this.secretsFound = (this.secretsFound || 0) + 1;

        if (typeof window !== 'undefined' && window.audioFX?.playSecretFound) {
          window.audioFX.playSecretFound();
        }

        const secWx = px * this.camera.tileSize + this.camera.tileSize / 2;
        const secWy = py * this.camera.tileSize + this.camera.tileSize / 2;
        this.renderer.spawnParticles(secWx, secWy, '#38bdf8', 35);
        this.renderer.spawnShockwave(secWx, secWy, '#38bdf8', 42);
        this.renderer.spawnFloatingText(secWx, secWy, '✨ Secret Chamber Unveiled!', '#38bdf8');

        if (this.logger?.logSecretFound) {
          this.logger.logSecretFound({ atX: px, atY: py, totalFound: this.secretsFound, elapsedMs: this.elapsedTime });
        }
        globalEvents.emit('secret:found', { x: px, y: py, totalFound: this.secretsFound });
        this.updateFog();
        this.notifyUI();
      }
    }

    // 1. Check Key pickup (must match entity elevation, default 0)
    const key = this.entities.find(e => e.type === 'key' && !e.isCollected && e.x === px && e.y === py && (e.elevation || ELEVATION.GROUND) === pe);
    if (key) {
      key.isCollected = true;
      this.player.addKey(key.id);
      this.renderer.spawnParticles(this.player.worldX, this.player.worldY, key.color || '#fbbf24', 30);
      this.renderer.spawnShockwave(this.player.worldX, this.player.worldY, key.color || '#fbbf24', 32);
      this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY, `+ ${key.name || 'Key'}`, key.color || '#fbbf24');
      this.logger.logKeyCollected({
        keyId: key.id,
        keyName: key.name,
        color: key.color,
        atX: px,
        atY: py,
        inventory: this.player.inventory,
        elapsedMs: this.elapsedTime,
      });
      globalEvents.emit('key:collected', {
        keyId: key.id,
        name: key.name || 'Key',
        color: key.color || '#fbbf24',
        inventoryCount: this.player.inventory.length,
        x: px,
        y: py,
      });
      this.notifyUI();
    }

    // 2. Check Step-Triggered Floor Plates / Traps (must match entity elevation, default 0)
    // Standard levers do NOT auto-toggle on step; only floor plates / step triggers do.
    const stepPlate = this.entities.find(e =>
      (e.type === 'lever' || e.type === ENTITY_TYPES.LEVER) &&
      (e.triggerOnStep || e.style === 'floor_plate') &&
      (!e.autoTriggerOnce || !e.hasTriggered) &&
      e.x === px && e.y === py &&
      (e.elevation || ELEVATION.GROUND) === pe
    );
    if (stepPlate) {
      stepPlate.hasTriggered = true;
      stepPlate.toggle(this.level);
      const isPlateTrap = stepPlate.style === 'floor_plate';
      const plateColor = isPlateTrap ? '#ef4444' : (stepPlate.state ? '#34d399' : '#f43f5e');
      const plateStateLabel = stepPlate.state ? 'ACTIVE' : 'INACTIVE';
      const plateActionLabel = stepPlate.state ? 'Mechanism Triggered' : 'Mechanism Reset';

      this.renderer.spawnParticles(this.player.worldX, this.player.worldY, plateColor, 20);
      this.renderer.spawnShockwave(this.player.worldX, this.player.worldY, plateColor, 36);
      this.renderer.spawnFloatingText(
        this.player.worldX,
        this.player.worldY,
        `${isPlateTrap ? '⚠️' : '⚡'} ${stepPlate.name || 'Floor Plate'}: ${plateStateLabel}`,
        plateColor
      );

      // Trigger effects at all target coordinates
      if (Array.isArray(stepPlate.targets)) {
        for (const target of stepPlate.targets) {
          if (target.x !== undefined && target.y !== undefined) {
            const targetWx = target.x * this.camera.tileSize + this.camera.tileSize / 2;
            const targetWy = target.y * this.camera.tileSize + this.camera.tileSize / 2;
            this.renderer.spawnParticles(targetWx, targetWy, plateColor, 15);
            this.renderer.spawnShockwave(targetWx, targetWy, plateColor, 28);
            this.renderer.spawnFloatingText(targetWx, targetWy, stepPlate.state ? '🔓 Mechanism Fired' : '🔒 Mechanism Closed', plateColor);
          }
        }
      }

      this.logger.logLeverToggled({
        leverId: stepPlate.id,
        state: stepPlate.state,
        atX: px,
        atY: py,
        targets: stepPlate.targets,
        elapsedMs: this.elapsedTime,
      });

      globalEvents.emit('lever:toggled', {
        leverId: stepPlate.id,
        name: stepPlate.name || (isPlateTrap ? 'Floor Plate Trap' : 'Switch'),
        state: stepPlate.state,
        stateLabel: plateStateLabel,
        actionLabel: plateActionLabel,
        targets: stepPlate.targets,
        x: px,
        y: py,
      });

      this.notifyUI();
    }

    // 3. Check Teleporter warp trigger (must match entity elevation, default 0)
    const teleporter = this.entities.find(
      e => e.type === ENTITY_TYPES.TELEPORTER && e.x === px && e.y === py && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (teleporter && teleporter.canWarp()) {
      const dest = teleporter.triggerWarp();
      this.handleTeleport(teleporter, dest);
    }

    // 4. Check Signpost step trigger (BL-81)
    // Note stepping does not blast modals or toasts; it registers as an active
    // interaction candidate so only a single prompt [E] appears.
    const signpost = this.entities.find(
      e => e.type === ENTITY_TYPES.SIGNPOST && e.x === px && e.y === py && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (signpost) {
      globalEvents.emit('signpost:stepped', { signpost, x: px, y: py });
    }

    // 5. Check Checkpoint step trigger
    const checkpoint = this.entities.find(
      e => e.type === ENTITY_TYPES.CHECKPOINT && e.x === px && e.y === py && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (checkpoint && !checkpoint.activated) {
      checkpoint.activate();
      this.activeCheckpoint = checkpoint;
      this.checkpointSnapshot = {
        x: checkpoint.x,
        y: checkpoint.y,
        z: checkpoint.elevation ?? checkpoint.z ?? ELEVATION.GROUND,
        inventory: [...this.player.inventory],
        score: this.player.score || 0,
        carriedItems: [...(this.player.carriedItems || [])],
        carriedRiddleItem: this.player.carriedRiddleItem || null,
      };
      const cpWx = checkpoint.x * this.camera.tileSize + this.camera.tileSize / 2;
      const cpWy = checkpoint.y * this.camera.tileSize + this.camera.tileSize / 2;
      this.renderer.spawnParticles(cpWx, cpWy, checkpoint.color || '#38bdf8', 35);
      this.renderer.spawnShockwave(cpWx, cpWy, checkpoint.color || '#38bdf8', 42);
      this.renderer.spawnFloatingText(cpWx, cpWy, `🚩 Checkpoint: ${checkpoint.name}`, checkpoint.color || '#38bdf8');
      globalEvents.emit('checkpoint:activated', checkpoint);
      if (this.uiCallbacks.onCheckpointActivated) {
        this.uiCallbacks.onCheckpointActivated(checkpoint);
      }
    }

    // 6. Check Collectible pickup (bonus points or carriable utility)
    const collectible = this.entities.find(
      e => e.type === ENTITY_TYPES.COLLECTIBLE && !e.isCollected && e.x === px && e.y === py && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (collectible) {
      const data = collectible.collect(this.player);
      const cWx = this.player.worldX;
      const cWy = this.player.worldY;
      this.renderer.spawnParticles(cWx, cWy, collectible.color || '#fbbf24', 25);
      this.renderer.spawnShockwave(cWx, cWy, collectible.color || '#fbbf24', 32);

      if (data.isCarriable) {
        this.renderer.spawnFloatingText(cWx, cWy, `🔥 Equipped: ${data.name}`, '#f97316');
        this.updateFog();
      } else {
        this.renderer.spawnFloatingText(cWx, cWy, `+${data.scoreValue} pts (${data.name})`, collectible.color || '#fbbf24');
      }

      globalEvents.emit('collectible:collected', data);
      if (this.uiCallbacks.onCollectibleCollected) {
        this.uiCallbacks.onCollectibleCollected(data);
      }
    }

    // 7. Check RiddleItem floor pickup
    const riddleItemOnCell = this.entities.find(
      e => e.type === ENTITY_TYPES.RIDDLE_ITEM && !e.isCarried && !e.isSlotted && e.x === px && e.y === py && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (riddleItemOnCell && !this.player.hasCarriedRiddleItem()) {
      this.player.pickUpRiddleItem(riddleItemOnCell);
      const cWx = this.player.worldX;
      const cWy = this.player.worldY;
      this.renderer.spawnParticles(cWx, cWy, riddleItemOnCell.color || '#38bdf8', 25);
      this.renderer.spawnShockwave(cWx, cWy, riddleItemOnCell.color || '#38bdf8', 30);
      this.renderer.spawnFloatingText(cWx, cWy, `🗿 Found ${riddleItemOnCell.name}`, riddleItemOnCell.color || '#38bdf8');
      globalEvents.emit('riddle_item:collected', {
        itemId: riddleItemOnCell.id,
        name: riddleItemOnCell.name,
        symbol: riddleItemOnCell.symbol,
        itemType: riddleItemOnCell.itemType,
      });
      if (this.uiCallbacks.onRiddleItemCollected) {
        this.uiCallbacks.onRiddleItemCollected(riddleItemOnCell);
      }
    }

    this.notifyUI();
  }

  /**
   * Handle teleporter warp mechanics
   * @param {Teleporter} teleporter
   * @param {{ x: number, y: number, z: number, elevation: number }} dest
   */
  handleTeleport(teleporter, dest) {
    const fromWx = this.player.worldX;
    const fromWy = this.player.worldY;
    this.renderer.spawnParticles(fromWx, fromWy, teleporter.color || '#38bdf8', 25);
    this.renderer.spawnShockwave(fromWx, fromWy, teleporter.color || '#38bdf8', 36);

    // Relocate player to destination
    this.player.gridX = dest.x;
    this.player.gridY = dest.y;
    this.player.fromGridX = dest.x;
    this.player.fromGridY = dest.y;
    this.player.targetGridX = dest.x;
    this.player.targetGridY = dest.y;
    this.player.elevation = dest.elevation ?? dest.z ?? ELEVATION.GROUND;
    this.player.gridZ = this.player.elevation;
    this.player.targetElevation = this.player.elevation;
    this.player.worldX = dest.x * this.camera.tileSize + this.camera.tileSize / 2;
    this.player.worldY = dest.y * this.camera.tileSize + this.camera.tileSize / 2;

    const toWx = this.player.worldX;
    const toWy = this.player.worldY;
    this.renderer.spawnParticles(toWx, toWy, teleporter.color || '#38bdf8', 30);
    this.renderer.spawnShockwave(toWx, toWy, teleporter.color || '#38bdf8', 42);
    this.renderer.spawnFloatingText(toWx, toWy, `🌀 Warped to (${dest.x}, ${dest.y}, ${dest.z})`, teleporter.color || '#38bdf8');

    // Trigger destination teleporter cooldown to avoid instant bounce loop
    const targetTeleporter = this.entities.find(
      e => e.type === ENTITY_TYPES.TELEPORTER && e.x === dest.x && e.y === dest.y && (e.elevation ?? ELEVATION.GROUND) === dest.z
    );
    if (targetTeleporter) {
      targetTeleporter.triggerWarp();
    }

    this.camera.snapTo(toWx, toWy, this.level.dimensions.width, this.level.dimensions.height);
    this.updateFog();
    this.notifyUI();

    this.logger.log('teleport:warped', {
      teleporterId: teleporter.id,
      fromX: teleporter.x,
      fromY: teleporter.y,
      fromZ: teleporter.z,
      toX: dest.x,
      toY: dest.y,
      toZ: dest.z,
      elapsedMs: this.elapsedTime,
    });

    globalEvents.emit('teleport:warped', {
      teleporterId: teleporter.id,
      name: teleporter.name,
      from: { x: teleporter.x, y: teleporter.y, z: teleporter.z },
      to: dest,
    });
  }

  /**
   * Handle hazard / patroller damage hit on player
   * @param {TimedHazard|Patroller} hazard
   */
  handleHazardHit(hazard) {
    const now = performance.now();
    if (this.lastHazardHit && now - this.lastHazardHit < 1000) return;
    this.lastHazardHit = now;
    this.hazardHits = (this.hazardHits || 0) + 1;

    const wx = this.player.worldX;
    const wy = this.player.worldY;
    this.renderer.spawnParticles(wx, wy, '#f43f5e', 35);
    this.renderer.spawnShockwave(wx, wy, '#f43f5e', 42);
    this.renderer.spawnFloatingText(wx, wy, `⚠️ Hit by ${hazard.name || 'Hazard'}!`, '#f43f5e');

    this.logger.log('player:hazard_hit', {
      hazardId: hazard.id,
      hazardType: hazard.type,
      atX: this.player.gridX,
      atY: this.player.gridY,
      elevation: this.player.elevation,
      elapsedMs: this.elapsedTime,
    });

    globalEvents.emit('player:hazard_hit', {
      hazardId: hazard.id,
      name: hazard.name,
      x: this.player.gridX,
      y: this.player.gridY,
    });

    // Check if active checkpoint exists: respawn at checkpoint with restored snapshot!
    if (this.activeCheckpoint && this.checkpointSnapshot) {
      const snap = this.checkpointSnapshot;
      this.player.reset(snap.x, snap.y, snap.z, snap.inventory, snap.score, snap.carriedItems, snap.carriedRiddleItem);
      this.camera.snapTo(this.player.worldX, this.player.worldY, this.level.dimensions.width, this.level.dimensions.height);
      this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY - 22, '🛡️ Respawned at Checkpoint', '#38bdf8');
      this.updateFog();
      this.notifyUI();
      return;
    }

    // Reset player back to starting spawn
    const spawnX = this.level.testSpawn?.x ?? this.level.spawn?.x ?? 1;
    const spawnY = this.level.testSpawn?.y ?? this.level.spawn?.y ?? 1;
    const spawnZ = this.level.testSpawn?.elevation ?? this.level.spawn?.elevation ?? 0;
    this.player.reset(spawnX, spawnY, spawnZ, this.player.inventory, this.player.score, this.player.carriedItems, null);
    this.camera.snapTo(this.player.worldX, this.player.worldY, this.level.dimensions.width, this.level.dimensions.height);
    this.updateFog();
    this.notifyUI();
  }

  /**
   * Open the puzzle modal overlay for a PuzzleGate
   * @param {PuzzleGate} puzzleGate
   */
  openPuzzleGateModal(puzzleGate) {
    if (this.isPuzzleOpen) return;
    this.isPuzzleOpen = true;

    this.puzzleModal.open(
      puzzleGate,
      () => {
        this.isPuzzleOpen = false;
        const gateWx = puzzleGate.x * this.camera.tileSize + this.camera.tileSize / 2;
        const gateWy = puzzleGate.y * this.camera.tileSize + this.camera.tileSize / 2;
        this.renderer.spawnParticles(gateWx, gateWy, puzzleGate.color || '#a855f7', 30);
        this.renderer.spawnShockwave(gateWx, gateWy, puzzleGate.color || '#a855f7', 40);
        this.renderer.spawnFloatingText(gateWx, gateWy, '✨ Seal Dissolved!', '#34d399');
        this.notifyUI();
      },
      () => {
        this.isPuzzleOpen = false;
      }
    );
  }

  /**
   * Execute an interaction candidate (BL-42, BL-85)
   * @param {object} candidate
   * @returns {boolean}
   */
  executeInteraction(candidate) {
    if (!candidate) return false;
    const entity = candidate.entity;

    if (candidate.type === 'puzzle_gate' || (entity && entity.type === ENTITY_TYPES.PUZZLE_GATE)) {
      this.openPuzzleGateModal(entity);
      return true;
    }

    if (candidate.type === 'signpost' || (entity && entity.type === ENTITY_TYPES.SIGNPOST)) {
      const data = entity.readSign();
      this.recordJournalEntry(data);
      this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY - 22, `📜 ${data.title}`, '#38bdf8');
      globalEvents.emit('signpost:read', data);
      if (this.uiCallbacks.onSignpostRead) {
        this.uiCallbacks.onSignpostRead(data);
      }
      return true;
    }

    if (candidate.type === 'wall_decor' || (entity && entity.type === ENTITY_TYPES.WALL_DECOR)) {
      const data = entity.inspect();
      this.recordJournalEntry(data);
      const decorIcon = data.decorType === 'note' ? '📝' : (data.decorType === 'painting' ? '🖼️' : (data.decorType === 'tapestry' ? '🚩' : '🏛️'));
      this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY - 22, `${decorIcon} ${data.title}`, '#fbbf24');
      globalEvents.emit('wall_decor:inspected', data);
      if (this.uiCallbacks.onWallDecorInspected) {
        this.uiCallbacks.onWallDecorInspected(data);
      }
      return true;
    }

    if (candidate.type === 'lever' || (entity && (entity.type === 'lever' || entity.type === ENTITY_TYPES.LEVER))) {
      entity.toggle(this.level);
      const leverColor = entity.state ? '#34d399' : '#f43f5e';
      const leverStateLabel = entity.state ? 'ON' : 'OFF';
      const leverActionLabel = entity.state ? 'Mechanism Opened' : 'Mechanism Closed';
      const leverWx = entity.x * this.camera.tileSize + this.camera.tileSize / 2;
      const leverWy = entity.y * this.camera.tileSize + this.camera.tileSize / 2;

      this.renderer.spawnParticles(leverWx, leverWy, leverColor, 20);
      this.renderer.spawnShockwave(leverWx, leverWy, leverColor, 36);
      this.renderer.spawnFloatingText(leverWx, leverWy, `⚡ ${entity.name || 'Switch'}: ${leverStateLabel}`, leverColor);

      if (Array.isArray(entity.targets)) {
        for (const target of entity.targets) {
          if (target.x !== undefined && target.y !== undefined) {
            const targetWx = target.x * this.camera.tileSize + this.camera.tileSize / 2;
            const targetWy = target.y * this.camera.tileSize + this.camera.tileSize / 2;
            this.renderer.spawnParticles(targetWx, targetWy, leverColor, 15);
            this.renderer.spawnShockwave(targetWx, targetWy, leverColor, 28);
            this.renderer.spawnFloatingText(targetWx, targetWy, entity.state ? '🔓 Passage Opened' : '🔒 Passage Closed', leverColor);
          }
        }
      }

      this.logger.logLeverToggled({
        leverId: entity.id,
        state: entity.state,
        atX: entity.x,
        atY: entity.y,
        targets: entity.targets,
        elapsedMs: this.elapsedTime,
      });

      globalEvents.emit('lever:toggled', {
        leverId: entity.id,
        name: entity.name || 'Switch',
        state: entity.state,
        stateLabel: leverStateLabel,
        actionLabel: leverActionLabel,
        targets: entity.targets,
        x: entity.x,
        y: entity.y,
      });

      this.notifyUI();
      return true;
    }

    if (candidate.type === 'pedestal' || (entity && entity.type === ENTITY_TYPES.PEDESTAL)) {
      const pedestal = entity;
      const hasCarried = this.player.hasCarriedRiddleItem();

      if (hasCarried && !pedestal.slottedItem) {
        // Place carried item onto empty pedestal
        const placedItem = this.player.carriedRiddleItem;
        this.player.placeRiddleItem(pedestal);
        const satisfied = pedestal.isSatisfied();
        const pedWx = pedestal.x * this.camera.tileSize + this.camera.tileSize / 2;
        const pedWy = pedestal.y * this.camera.tileSize + this.camera.tileSize / 2;

        this.renderer.spawnParticles(pedWx, pedWy, satisfied ? '#10b981' : '#f59e0b', 25);
        this.renderer.spawnShockwave(pedWx, pedWy, satisfied ? '#10b981' : '#f59e0b', 32);
        this.renderer.spawnFloatingText(pedWx, pedWy, `📥 Placed ${placedItem.name}`, satisfied ? '#10b981' : '#f59e0b');

        globalEvents.emit('pedestal:placed', {
          pedestalId: pedestal.id,
          pedestalName: pedestal.name,
          itemId: placedItem.id,
          itemName: placedItem.name,
          isSatisfied: satisfied,
          puzzleGroupId: pedestal.puzzleGroupId,
        });

        if (this.uiCallbacks.onPedestalInteract) {
          this.uiCallbacks.onPedestalInteract({
            action: 'placed',
            pedestal,
            item: placedItem,
            isSatisfied: satisfied,
          });
        }

        this.evaluateRiddleGroup(pedestal.puzzleGroupId);
        this.notifyUI();
        return true;
      } else if (hasCarried && pedestal.slottedItem) {
        // Swap carried item with pedestal's slotted item
        const oldItem = pedestal.removeItem();
        const newItem = this.player.carriedRiddleItem;
        this.player.placeRiddleItem(pedestal);
        this.player.pickUpRiddleItem(oldItem);

        const satisfied = pedestal.isSatisfied();
        const pedWx = pedestal.x * this.camera.tileSize + this.camera.tileSize / 2;
        const pedWy = pedestal.y * this.camera.tileSize + this.camera.tileSize / 2;

        this.renderer.spawnParticles(pedWx, pedWy, satisfied ? '#10b981' : '#38bdf8', 20);
        this.renderer.spawnFloatingText(pedWx, pedWy, `🔄 Swapped for ${oldItem.name}`, '#38bdf8');

        globalEvents.emit('pedestal:placed', {
          pedestalId: pedestal.id,
          pedestalName: pedestal.name,
          itemId: newItem.id,
          itemName: newItem.name,
          isSatisfied: satisfied,
          puzzleGroupId: pedestal.puzzleGroupId,
        });

        this.evaluateRiddleGroup(pedestal.puzzleGroupId);
        this.notifyUI();
        return true;
      } else if (!hasCarried && pedestal.slottedItem) {
        // Retrieve slotted item from pedestal into hands
        const retrieved = pedestal.removeItem();
        this.player.pickUpRiddleItem(retrieved);

        const pedWx = pedestal.x * this.camera.tileSize + this.camera.tileSize / 2;
        const pedWy = pedestal.y * this.camera.tileSize + this.camera.tileSize / 2;
        this.renderer.spawnFloatingText(pedWx, pedWy, `📤 Retrieved ${retrieved.name}`, '#38bdf8');

        globalEvents.emit('pedestal:removed', {
          pedestalId: pedestal.id,
          pedestalName: pedestal.name,
          itemId: retrieved.id,
          itemName: retrieved.name,
          puzzleGroupId: pedestal.puzzleGroupId,
        });

        if (this.uiCallbacks.onPedestalInteract) {
          this.uiCallbacks.onPedestalInteract({
            action: 'removed',
            pedestal,
            item: retrieved,
            isSatisfied: false,
          });
        }

        this.evaluateRiddleGroup(pedestal.puzzleGroupId);
        this.notifyUI();
        return true;
      } else {
        // Empty pedestal and player has no item: inspect riddle inscription!
        const pedWx = pedestal.x * this.camera.tileSize + this.camera.tileSize / 2;
        const pedWy = pedestal.y * this.camera.tileSize + this.camera.tileSize / 2;
        this.renderer.spawnFloatingText(pedWx, pedWy, `🔍 Inscription: "${pedestal.riddleHint}"`, '#fbbf24');

        globalEvents.emit('pedestal:inspected', {
          pedestalId: pedestal.id,
          pedestalName: pedestal.name,
          riddleHint: pedestal.riddleHint,
          puzzleGroupId: pedestal.puzzleGroupId,
        });

        if (this.uiCallbacks.onPedestalInspect) {
          this.uiCallbacks.onPedestalInspect({
            pedestalId: pedestal.id,
            pedestalName: pedestal.name,
            riddleHint: pedestal.riddleHint,
            puzzleGroupId: pedestal.puzzleGroupId,
            socketedItem: pedestal.item ? { id: pedestal.item.id, name: pedestal.item.name, symbol: pedestal.item.symbol } : null,
            isSatisfied: pedestal.isSatisfied(),
            acceptedItemId: pedestal.acceptedItemId,
          });
        }
        return true;
      }
    }

    if (candidate.type === 'riddle_item' || (entity && entity.type === ENTITY_TYPES.RIDDLE_ITEM)) {
      const item = entity;
      if (!this.player.hasCarriedRiddleItem()) {
        this.player.pickUpRiddleItem(item);
        const iWx = this.player.worldX;
        const iWy = this.player.worldY;
        this.renderer.spawnParticles(iWx, iWy, item.color || '#38bdf8', 25);
        this.renderer.spawnShockwave(iWx, iWy, item.color || '#38bdf8', 30);
        this.renderer.spawnFloatingText(iWx, iWy, `🗿 Picked up ${item.name}`, item.color || '#38bdf8');

        globalEvents.emit('riddle_item:collected', {
          itemId: item.id,
          name: item.name,
          symbol: item.symbol,
          itemType: item.itemType,
        });

        if (this.uiCallbacks.onRiddleItemCollected) {
          this.uiCallbacks.onRiddleItemCollected(item);
        }

        this.notifyUI();
        return true;
      } else {
        // Swap carried item with floor item
        this.player.dropRiddleItem(item.x, item.y, item.elevation);
        this.player.pickUpRiddleItem(item);
        this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY, `🔄 Swapped for ${item.name}`, '#38bdf8');
        this.notifyUI();
        return true;
      }
    }

    if (candidate.type === 'door' || (entity && entity.type === ENTITY_TYPES.DOOR)) {
      if (!entity.isOpen && this.player.hasKey(entity.requiresKey)) {
        entity.open();
        const dwx = entity.x * this.camera.tileSize + this.camera.tileSize / 2;
        const dwy = entity.y * this.camera.tileSize + this.camera.tileSize / 2;
        this.renderer.spawnParticles(dwx, dwy, entity.color || '#fbbf24', 30);
        this.renderer.spawnShockwave(dwx, dwy, entity.color || '#fbbf24', 40);
        this.renderer.spawnFloatingText(dwx, dwy, `🗝️ Unlocked ${entity.name || 'Door'}`, entity.color || '#fbbf24');
        this.notifyUI();
        return true;
      }
    }

    if (candidate.type === 'exit') {
      const exit = candidate.exit || this.getMatchingExit(this.player.gridX, this.player.gridY, this.player.elevation);
      if (exit) {
        if (exit.targetRoom) {
          this.transitionToRoom(exit.targetRoom, exit.targetSpawn);
        } else {
          this.handleVictory(exit);
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Handle manual interact button (E / Space / Enter or numeric key 1..9 or direct target)
   * @param {number|object} [target=1] 1-based candidate index, or candidate object/entity
   */
  handleManualInteract(target = 1) {
    if (this.isDisambiguating) {
      this.isDisambiguating = false;
      if (typeof this.uiCallbacks.onDisambiguationModeChanged === 'function') {
        this.uiCallbacks.onDisambiguationModeChanged(false);
      }
    }

    const candidates = this.getAllAvailableInteractions();
    if (!candidates || candidates.length === 0) return;

    let chosen = null;
    if (typeof target === 'number') {
      const idx = target - 1;
      if (idx >= 0 && idx < candidates.length) {
        chosen = candidates[idx];
      }
    } else if (target && typeof target === 'object') {
      chosen = candidates.find(c => c.entity === target || c.id === target.id || c === target) || candidates[0];
    }

    if (!chosen) {
      chosen = candidates[0];
    }

    this.executeInteraction(chosen);
    this.checkContextualInteraction();
  }

  /**
   * Trigger interaction with two-stage reveal support for multi-target situations (BL-91, ADR-009)
   */
  triggerInteract() {
    const candidates = this.getAllAvailableInteractions();
    if (!candidates || candidates.length === 0) return;

    if (candidates.length > 1 && !this.isDisambiguating) {
      // Stage 1 -> Stage 2: Reveal numbered pills and action drawer
      this.isDisambiguating = true;
      if (typeof this.uiCallbacks.onDisambiguationModeChanged === 'function') {
        this.uiCallbacks.onDisambiguationModeChanged(true, candidates);
      }
      this.checkContextualInteraction();
      return;
    }

    // Either single interaction, or player confirmed primary candidate while disambiguation is active
    this.handleManualInteract(1);
  }

  /**
   * Close multi-target disambiguation mode back to Stage 1 (BL-91, ADR-009)
   */
  closeDisambiguation() {
    if (!this.isDisambiguating) return;
    this.isDisambiguating = false;
    if (typeof this.uiCallbacks.onDisambiguationModeChanged === 'function') {
      this.uiCallbacks.onDisambiguationModeChanged(false);
    }
    this.checkContextualInteraction();
  }

  /**
   * Pause gameplay simulation (timer, entity ticks, movement)
   */
  pause() {
    this.isPaused = true;
    globalEvents.emit('game:paused');
  }

  /**
   * Resume gameplay simulation
   */
  resume() {
    this.isPaused = false;
    this.lastTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    globalEvents.emit('game:resumed');
  }

  /**
   * Automatically pause or resume gameplay when an obscuring modal or overlay covers the maze view (BL-92, ADR-0010)
   * @param {boolean} obscured Whether the view is now obscured
   * @param {string} [overlayId='overlay'] Identifier for the obscuring UI element
   */
  setObscured(obscured, overlayId = 'overlay') {
    if (!this.obscuringOverlays) {
      this.obscuringOverlays = new Set();
    }
    if (obscured) {
      this.obscuringOverlays.add(overlayId);
      this.isPaused = true;
      globalEvents.emit('game:paused', { reason: `obscured:${overlayId}` });
    } else {
      this.obscuringOverlays.delete(overlayId);
      if (this.obscuringOverlays.size === 0) {
        this.isPaused = false;
        this.lastTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        globalEvents.emit('game:resumed', { reason: `unobscured:${overlayId}` });
      }
    }
  }

  /**
   * Evaluate a riddle puzzle group to check if all pedestals are satisfied
   * @param {string} groupId
   */
  evaluateRiddleGroup(groupId) {
    if (!groupId) return;
    const groupPedestals = this.entities.filter(
      e => e.type === ENTITY_TYPES.PEDESTAL && e.puzzleGroupId === groupId
    );
    if (groupPedestals.length === 0) return;

    const allSatisfied = groupPedestals.every(p => p.isSatisfied());

    if (allSatisfied) {
      const targetDoorIds = [...new Set(groupPedestals.map(p => p.targetDoorId).filter(Boolean))];
      for (const doorId of targetDoorIds) {
        const door = this.entities.find(e => e.type === ENTITY_TYPES.DOOR && e.id === doorId);
        if (door && !door.isOpen) {
          door.open();
          const dwx = door.x * this.camera.tileSize + this.camera.tileSize / 2;
          const dwy = door.y * this.camera.tileSize + this.camera.tileSize / 2;
          this.renderer.spawnParticles(dwx, dwy, '#10b981', 40);
          this.renderer.spawnShockwave(dwx, dwy, '#10b981', 50);
          this.renderer.spawnFloatingText(dwx, dwy, '✨ Riddle Solved! Seal Broken!', '#10b981');
        }
      }

      globalEvents.emit('puzzle:riddle_solved', {
        groupId,
        pedestals: groupPedestals.map(p => ({ id: p.id, name: p.name, slotted: p.slottedItem?.id })),
      });
      if (this.uiCallbacks.onRiddleSolved) {
        this.uiCallbacks.onRiddleSolved({ groupId, pedestals: groupPedestals });
      }
    }
  }

  /**
   * Record a discovered architect note or lore inscription into the level journal (BL-81)
   * @param {object} entry
   * @returns {Array<object>} Current level journal entries
   */
  recordJournalEntry(entry) {
    if (!this.levelJournal) {
      this.levelJournal = [];
    }
    const id = entry.id || `${entry.title || 'Note'}_${entry.text || ''}`;
    const exists = this.levelJournal.some(e => (e.id && e.id === id) || (e.title === entry.title && e.text === entry.text));
    if (!exists) {
      const journalItem = {
        id,
        title: entry.title || "Architect's Note",
        author: entry.author || 'The Architect',
        text: entry.text || entry.message || '',
        decorType: entry.decorType || 'note',
        response: entry.response || '',
        facing: entry.facing || '',
        discoveredAtSteps: this.player ? this.player.stepsTaken : 0,
        discoveredAtTime: this.elapsedTime || 0,
      };
      this.levelJournal.push(journalItem);
      globalEvents.emit('journal:entry_added', journalItem);
    }
    return this.levelJournal;
  }

  /**
   * Get all journal entries discovered in the current level (BL-81)
   * @returns {Array<object>}
   */
  getJournalEntries() {
    return this.levelJournal || [];
  }

  /**
   * Update fog raycasting
   */
  updateFog() {
    if (this.fog && this.level.config.fogOfWar) {
      this.fog.update(
        this.player.gridX,
        this.player.gridY,
        this.player.elevation,
        this.level.layers.ground,
        this.level.layers.overhead,
        this.getEffectiveViewRadius(),
        this.revealedSecrets
      );
    }
  }

  /**
   * Get effective fog-of-war vision radius (expanded by +3 when holding torch)
   * @returns {number}
   */
  getEffectiveViewRadius() {
    const baseRadius = this.level.config.viewRadius || 6;
    return baseRadius + (this.player && this.player.hasTorch && this.player.hasTorch() ? 3 : 0);
  }

  /**
   * Handle level completion
   * @param {object|null} [exit=null]
   */
  handleVictory(exit = null) {
    this.isWon = true;
    try {
      audioFX.stopAmbience();
    } catch {}
    this.renderer.spawnParticles(this.player.worldX, this.player.worldY, '#38bdf8', 60);

    const earnedParSteps = this.level.parSteps !== undefined ? this.player.stepsTaken <= this.level.parSteps : false;
    const earnedParTime = this.level.parTime !== undefined ? (this.elapsedTime / 1000) <= this.level.parTime : false;
    const flawless = (this.hazardHits || 0) === 0;
    const secretsFound = this.secretsFound || 0;
    const totalSecrets = this.totalSecrets || 0;
    const secretSleuth = totalSecrets > 0 && secretsFound >= totalSecrets;

    let tier = 'bronze';
    if ((earnedParSteps && earnedParTime) || (secretSleuth && (earnedParSteps || earnedParTime))) {
      tier = 'gold';
    } else if (earnedParSteps || earnedParTime || secretSleuth || flawless) {
      tier = 'silver';
    }

    const rawStats = {
      time: this.elapsedTime,
      steps: this.player.stepsTaken,
      earnedParSteps,
      earnedParTime,
      parSteps: this.level.parSteps,
      parTime: this.level.parTime,
      secretsFound,
      totalSecrets,
      secretSleuth,
      flawless,
      hazardHits: this.hazardHits || 0,
      tier,
      targetLevel: exit?.targetLevel || null,
      branchLabel: exit?.label || null,
      exitId: exit?.id || null,
    };

    const performanceScore = this.calculatePerformanceScore(rawStats);
    const stats = {
      ...rawStats,
      performanceScore,
    };

    console.info(`[MazeGame:Engine] Victory achieved on level "${this.level.title}" (${this.level.id})!`, {
      timeFormatted: (this.elapsedTime / 1000).toFixed(2) + 's',
      steps: this.player.stepsTaken,
      finalInventory: [...this.player.inventory],
      earnedParSteps,
      earnedParTime,
      tier,
      performanceScore,
      targetLevel: stats.targetLevel,
      branchLabel: stats.branchLabel,
    });

    this.logger.logVictory(stats, this.elapsedTime);
    StorageManager.saveLevelCompletion(this.level.id, stats);
    globalEvents.emit('level:completed', { levelId: this.level.id, stats });

    if (this.uiCallbacks.onVictory) {
      this.uiCallbacks.onVictory(stats);
    }
  }

  /**
   * Export telemetry / debug log as JSON string
   * @returns {string}
   */
  getDebugLogJSON() {
    return this.logger.exportJSON();
  }

  /**
   * Download debug log file to client
   * @param {string} [customFilename]
   */
  downloadDebugLog(customFilename) {
    return this.logger.download(customFilename);
  }

  /**
   * Export the current session as a structured Replay payload
   * @returns {object}
   */
  getReplayPayload() {
    return this.logger.toReplayPayload();
  }

  /**
   * Download session replay JSON file to client
   * @param {string} [customFilename]
   * @returns {string|undefined}
   */
  downloadReplay(customFilename) {
    return this.logger.downloadReplay(customFilename);
  }

  /**
   * Notify HUD / UI of state changes
   */
  notifyUI() {
    if (this.uiCallbacks.onStateUpdate) {
      this.uiCallbacks.onStateUpdate({
        levelTitle: this.level.title,
        roomTitle: this.currentRoom?.title || null,
        roomId: this.activeRoomId || null,
        rotation: this.camera ? this.camera.getDiscreteRotation() : 0,
        compassHeading: this.camera ? this.camera.getCompassHeading() : 'N',
        help: this.level.help || null,
        elevation: this.player.elevation === ELEVATION.OVERHEAD ? 'Bridge (Elevation 1)' : 'Ground Floor',
        inventory: [...this.player.inventory],
        keys: this.entities.filter(e => e.type === 'key' && this.player.inventory.includes(e.id)),
        score: this.player.score || 0,
        activeCheckpoint: this.activeCheckpoint ? this.activeCheckpoint.name : null,
        carriedItems: [...(this.player.carriedItems || [])],
        carriedRiddleItem: this.player.carriedRiddleItem ? {
          id: this.player.carriedRiddleItem.id,
          name: this.player.carriedRiddleItem.name,
          symbol: this.player.carriedRiddleItem.symbol,
          itemType: this.player.carriedRiddleItem.itemType,
          color: this.player.carriedRiddleItem.color,
        } : null,
        steps: this.player.stepsTaken,
        time: this.elapsedTime,
        cameraMode: this.camera.mode,
      });
    }
  }

  /**
   * Render frame
   */
  render(dt) {
    this.renderer.render(
      this.level,
      this.player,
      this.entities,
      this.camera,
      this.fog,
      dt,
      this.clickTarget,
      this.revealedSecrets
    );

    this.minimap.render(this.level, this.player, this.fog, dt, this.revealedSecrets);
  }
}
