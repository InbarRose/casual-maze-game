/**
 * Game Loop & State Coordinator
 * Ties together input, physics/collision, entities, camera, fog, and rendering.
 */

import { KEY_CODES, ELEVATION, ENTITY_TYPES, SCREEN_TO_WORLD_DELTAS } from '../core/constants.js';
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
    const tileSize = this.level.config?.tileSize || 32;
    this.tileSize = tileSize;
    this.camera = new Camera(mainCanvas.width, mainCanvas.height, tileSize);
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
    this.keysDown = new Set();
    this.panVelocity = { x: 0, y: 0 };
    this.isDraggingMinimap = false;

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
    this.camera.rotateLeft();
    this.notifyUI();
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
    this.camera.rotateRight();
    this.notifyUI();
    globalEvents.emit('camera:rotated', {
      rotation: this.camera.rotation,
      discreteRotation: this.camera.getDiscreteRotation(),
      heading: this.camera.getCompassHeading(),
    });
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
    globalEvents.emit('hotkeys:toggled', { enabled: val });
    if (typeof this.uiCallbacks.onHotkeysChanged === 'function') {
      this.uiCallbacks.onHotkeysChanged(val);
    }
  }

  /**
   * Bind keyboard, mouse, and touch events
   */
  bindInputs() {
    this.handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      this.keysDown.add(e.code);
      if (e.key) this.keysDown.add(e.key);

      // Handle Instant Actions (gated by hotkeys toggle / simple keyboard mode)
      const hotkeysActive = this.areHotkeysEnabled();
      const isMap = hotkeysActive && (KEY_CODES.MAP.includes(e.code) || (e.key && KEY_CODES.MAP.includes(e.key)));
      const isRestart = hotkeysActive && (KEY_CODES.RESTART.includes(e.code) || (e.key && KEY_CODES.RESTART.includes(e.key)));
      const isInteract = KEY_CODES.INTERACT.includes(e.code) || (e.key && KEY_CODES.INTERACT.includes(e.key));
      const isViewMode = hotkeysActive && KEY_CODES.VIEW_MODE && (KEY_CODES.VIEW_MODE.includes(e.code) || (e.key && KEY_CODES.VIEW_MODE.includes(e.key)));
      const isRotateLeft = hotkeysActive && KEY_CODES.ROTATE_LEFT && (KEY_CODES.ROTATE_LEFT.includes(e.code) || (e.key && KEY_CODES.ROTATE_LEFT.includes(e.key)));
      const isRotateRight = hotkeysActive && KEY_CODES.ROTATE_RIGHT && (KEY_CODES.ROTATE_RIGHT.includes(e.code) || (e.key && KEY_CODES.ROTATE_RIGHT.includes(e.key)));

      if (isMap) {
        this.toggleFreePan();
      } else if (isRestart) {
        if (typeof this.uiCallbacks.onRequestRestart === 'function') {
          this.uiCallbacks.onRequestRestart();
        } else {
          this.restartLevel();
        }
      } else if (isInteract) {
        this.handleManualInteract();
      } else if (isViewMode) {
        this.togglePerspective();
      } else if (isRotateLeft) {
        e.preventDefault();
        this.rotateLeft();
      } else if (isRotateRight) {
        e.preventDefault();
        this.rotateRight();
      }
    };

    this.handleKeyUp = (e) => {
      this.keysDown.delete(e.code);
      if (e.key) this.keysDown.delete(e.key);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
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

      const path = this.findPathTo(targetGridX, targetGridY);
      if (path && path.length > 0) {
        this.autoMovePath = path;
        this.clickTarget = {
          x: targetGridX,
          y: targetGridY,
          time: performance.now(),
        };
      }
    };

    // Canvas Touch & Swipe Controls (BL-16)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchHasMoved = false;

    this.handleCanvasTouchStart = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (e.touches?.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
        touchHasMoved = false;
      }
    };

    this.handleCanvasTouchMove = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (e.touches?.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (Math.hypot(dx, dy) > 10) {
          touchHasMoved = true;
        }
      }
    };

    this.handleCanvasTouchEnd = (e) => {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (e.changedTouches?.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - touchStartX;
        const dy = endY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const elapsed = performance.now() - touchStartTime;

        // Swipe detected: distance >= 24px within 600ms
        if (touchHasMoved && (absX >= 24 || absY >= 24) && elapsed < 600) {
          const direction = absX > absY ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP');
          this.autoMovePath = null;
          this.clickTarget = null;
          this.tryMoveDirection(direction);
          return;
        }

        // Tap detected: pathfind / interact
        if (!touchHasMoved || Math.hypot(dx, dy) < 15) {
          this.handleCanvasPointerDown({
            clientX: endX,
            clientY: endY,
            button: 0,
          });
        }
      }
    };

    if (this.canvas && typeof this.canvas.addEventListener === 'function') {
      this.canvas.addEventListener('pointerdown', this.handleCanvasPointerDown);
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
    if (this.puzzleModal) {
      this.puzzleModal.close();
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
    console.info('[MazeGame:Engine] Game loop stopped');
  }

  /**
   * Reset the current level state
   */
  restartLevel() {
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

    // 8. Check for available contextual interaction
    if (typeof this.uiCallbacks.onInteractionAvailable === 'function') {
      const interaction = this.getAvailableInteraction();
      let screenPos = null;
      if (interaction && this.camera) {
        screenPos = this.camera.worldToScreen(this.player.worldX, this.player.worldY, true);
      }
      this.uiCallbacks.onInteractionAvailable(interaction, screenPos);
    }
  }

  /**
   * Check for input direction and initiate player movement (screen-relative)
   */
  processPlayerMovement() {
    if (this.player.isMoving || this.camera.mode === 'freepan' || (this.camera?.isRotating?.() ?? false)) return;

    let screenDx = 0;
    let screenDy = 0;

    for (const code of this.keysDown) {
      if (KEY_CODES.UP.includes(code)) screenDy -= 1;
      else if (KEY_CODES.DOWN.includes(code)) screenDy += 1;
      else if (KEY_CODES.LEFT.includes(code)) screenDx -= 1;
      else if (KEY_CODES.RIGHT.includes(code)) screenDx += 1;
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

    // Check if target tile can ever be entered from any adjacent direction
    const isTargetWalkable = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }].some(d => {
      const ax = targetX + d.dx;
      const ay = targetY + d.dy;
      if (ax < 0 || ax >= this.level.dimensions.width || ay < 0 || ay >= this.level.dimensions.height) return false;
      const chk = CollisionEngine.checkMove(ax, ay, targetX, targetY, startElev, this.level, this.entities, this.player.inventory);
      return chk.allowed;
    });

    const queue = [{ x: startX, y: startY, elevation: startElev, path: [] }];
    const visited = new Set([`${startX},${startY},${startElev}`]);
    let bestAdjacentPath = null;

    let iterations = 0;
    const maxIterations = 2500;

    while (queue.length > 0 && iterations++ < maxIterations) {
      const curr = queue.shift();

      // If target is directly walkable and we reached it:
      if (isTargetWalkable && curr.x === targetX && curr.y === targetY) {
        return curr.path;
      }

      // If target is solid and we reached an adjacent cell:
      if (!isTargetWalkable && Math.abs(curr.x - targetX) + Math.abs(curr.y - targetY) === 1) {
        if (!bestAdjacentPath || curr.path.length < bestAdjacentPath.length) {
          bestAdjacentPath = curr.path;
          return bestAdjacentPath; // First adjacent encountered in BFS is guaranteed shortest
        }
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
   * Get interactable entity or tile action available at or adjacent to the player's current location
   * @returns {{ type: string, label: string, icon: string, keyHint: string, x: number, y: number, canInteract: boolean }|null}
   */
  getAvailableInteraction() {
    if (!this.player || this.isPuzzleOpen || this.isWon || this.camera?.mode === 'freepan') return null;

    const px = this.player.gridX;
    const py = this.player.gridY;
    const pe = this.player.elevation;

    const facingDx = this.player.facing === 'east' ? 1 : (this.player.facing === 'west' ? -1 : 0);
    const facingDy = this.player.facing === 'south' ? 1 : (this.player.facing === 'north' ? -1 : 0);
    const facingX = px + facingDx;
    const facingY = py + facingDy;

    const sortByFacing = (list) => {
      return [...list].sort((a, b) => {
        const aFacing = (a.x === facingX && a.y === facingY) ? 0 : ((a.x === px && a.y === py) ? 1 : 2);
        const bFacing = (b.x === facingX && b.y === facingY) ? 0 : ((b.x === px && b.y === py) ? 1 : 2);
        return aFacing - bFacing;
      });
    };

    // 1. Check adjacent locked PuzzleGate
    const adjacentGates = sortByFacing(this.entities.filter(
      e => e.type === ENTITY_TYPES.PUZZLE_GATE && !e.isUnlocked && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    ));
    if (adjacentGates.length > 0) {
      const g = adjacentGates[0];
      return { type: 'puzzle_gate', label: g.name ? `Solve ${g.name}` : 'Solve Seal', icon: '🧩', keyHint: 'Space', x: g.x, y: g.y, canInteract: true };
    }

    // 2. Check adjacent Pedestal
    const adjacentPedestals = sortByFacing(this.entities.filter(
      e => e.type === ENTITY_TYPES.PEDESTAL && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    ));
    if (adjacentPedestals.length > 0) {
      const ped = adjacentPedestals[0];
      const hasCarried = this.player.hasCarriedRiddleItem();
      if (hasCarried && !ped.slottedItem) {
        return { type: 'pedestal', label: `Place ${this.player.carriedRiddleItem.name || 'Relic'}`, icon: '📥', keyHint: 'Space', x: ped.x, y: ped.y, canInteract: true };
      } else if (!hasCarried && ped.slottedItem) {
        return { type: 'pedestal', label: `Take ${ped.slottedItem.name || 'Relic'}`, icon: '📤', keyHint: 'Space', x: ped.x, y: ped.y, canInteract: true };
      } else {
        return { type: 'pedestal', label: `Inspect ${ped.name || 'Pedestal'}`, icon: '🦅', keyHint: 'Space', x: ped.x, y: ped.y, canInteract: true };
      }
    }

    // 3. Check adjacent Lever
    const adjacentLevers = sortByFacing(this.entities.filter(
      e => e.type === 'lever' && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation || ELEVATION.GROUND) === pe
    ));
    if (adjacentLevers.length > 0) {
      const lever = adjacentLevers[0];
      return { type: 'lever', label: lever.state ? 'Switch Off' : 'Pull Switch', icon: '🕹️', keyHint: 'Space', x: lever.x, y: lever.y, canInteract: true };
    }

    // 4. Check adjacent Signpost
    const adjacentSigns = sortByFacing(this.entities.filter(
      e => e.type === ENTITY_TYPES.SIGNPOST && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    ));
    if (adjacentSigns.length > 0) {
      const s = adjacentSigns[0];
      return { type: 'signpost', label: s.title ? `Read "${s.title}"` : 'Read Signpost', icon: '📜', keyHint: 'Space', x: s.x, y: s.y, canInteract: true };
    }

    // 5. Check adjacent WallDecor
    const adjacentDecor = sortByFacing(this.entities.filter(
      e => e.type === ENTITY_TYPES.WALL_DECOR && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    ));
    if (adjacentDecor.length > 0) {
      const d = adjacentDecor[0];
      const icon = d.decorType === 'note' ? '📝' : (d.decorType === 'painting' ? '🖼️' : '🏛️');
      return { type: 'wall_decor', label: d.title ? `Examine "${d.title}"` : 'Examine Lore', icon, keyHint: 'Space', x: d.x, y: d.y, canInteract: true };
    }

    // 6. Check floor RiddleItem
    const floorRiddleItems = this.entities.filter(
      e => e.type === ENTITY_TYPES.RIDDLE_ITEM && !e.isCarried && !e.isSlotted && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (floorRiddleItems.length > 0 && !this.player.hasCarriedRiddleItem()) {
      const item = floorRiddleItems[0];
      return { type: 'riddle_item', label: `Pick Up ${item.name || 'Relic'}`, icon: '🗿', keyHint: 'Space', x: item.x, y: item.y, canInteract: true };
    }

    // 7. Check adjacent Door
    const adjacentDoors = sortByFacing(this.entities.filter(
      e => e.type === ENTITY_TYPES.DOOR && !e.isOpen && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    ));
    if (adjacentDoors.length > 0) {
      const d = adjacentDoors[0];
      const hasKey = this.player.hasKey(d.requiresKey);
      return {
        type: 'door',
        label: hasKey ? `Unlock ${d.name || 'Door'}` : `Locked (${d.name || 'Door'})`,
        icon: hasKey ? '🗝️' : '🔒',
        keyHint: 'Space',
        x: d.x,
        y: d.y,
        canInteract: hasKey,
      };
    }

    // 8. Check on-cell Exit
    const exit = this.getMatchingExit(px, py, pe);
    if (exit) {
      return {
        type: 'exit',
        label: exit.targetRoom ? 'Proceed to Room' : 'Exit Portal',
        icon: '🌀',
        keyHint: 'Space',
        x: px,
        y: py,
        canInteract: true,
      };
    }

    return null;
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

    for (const code of this.keysDown) {
      if (KEY_CODES.UP.includes(code)) screenDy -= 1;
      else if (KEY_CODES.DOWN.includes(code)) screenDy += 1;
      else if (KEY_CODES.LEFT.includes(code)) screenDx -= 1;
      else if (KEY_CODES.RIGHT.includes(code)) screenDx += 1;
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

    // 2. Check Lever step trigger (must match entity elevation, default 0)
    const lever = this.entities.find(e => e.type === 'lever' && e.x === px && e.y === py && (e.elevation || ELEVATION.GROUND) === pe);
    if (lever) {
      lever.toggle(this.level);
      const leverColor = lever.state ? '#34d399' : '#f43f5e';
      const leverStateLabel = lever.state ? 'ON' : 'OFF';
      const leverActionLabel = lever.state ? 'Mechanism Opened' : 'Mechanism Closed';

      this.renderer.spawnParticles(this.player.worldX, this.player.worldY, leverColor, 20);
      this.renderer.spawnShockwave(this.player.worldX, this.player.worldY, leverColor, 36);
      this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY, `⚡ ${lever.name || 'Switch'}: ${leverStateLabel}`, leverColor);

      // Trigger effects at all target coordinates
      if (Array.isArray(lever.targets)) {
        for (const target of lever.targets) {
          if (target.x !== undefined && target.y !== undefined) {
            const targetWx = target.x * this.camera.tileSize + this.camera.tileSize / 2;
            const targetWy = target.y * this.camera.tileSize + this.camera.tileSize / 2;
            this.renderer.spawnParticles(targetWx, targetWy, leverColor, 15);
            this.renderer.spawnShockwave(targetWx, targetWy, leverColor, 28);
            this.renderer.spawnFloatingText(targetWx, targetWy, lever.state ? '🔓 Passage Opened' : '🔒 Passage Closed', leverColor);
          }
        }
      }

      this.logger.logLeverToggled({
        leverId: lever.id,
        state: lever.state,
        atX: px,
        atY: py,
        targets: lever.targets,
        elapsedMs: this.elapsedTime,
      });

      globalEvents.emit('lever:toggled', {
        leverId: lever.id,
        name: lever.name || 'Switch',
        state: lever.state,
        stateLabel: leverStateLabel,
        actionLabel: leverActionLabel,
        targets: lever.targets,
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

    // 4. Check Signpost step trigger
    const signpost = this.entities.find(
      e => e.type === ENTITY_TYPES.SIGNPOST && e.x === px && e.y === py && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (signpost) {
      const data = signpost.readSign();
      this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY - 22, `📜 ${data.title}`, '#38bdf8');
      globalEvents.emit('signpost:read', data);
      if (this.uiCallbacks.onSignpostRead) {
        this.uiCallbacks.onSignpostRead(data);
      }
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
   * Handle manual interact button (E / Space / Enter)
   */
  handleManualInteract() {
    const px = this.player.gridX;
    const py = this.player.gridY;
    const pe = this.player.elevation;

    const facingDx = this.player.facing === 'east' ? 1 : (this.player.facing === 'west' ? -1 : 0);
    const facingDy = this.player.facing === 'south' ? 1 : (this.player.facing === 'north' ? -1 : 0);
    const facingX = px + facingDx;
    const facingY = py + facingDy;

    const sortByFacing = (list) => {
      return [...list].sort((a, b) => {
        const aFacing = (a.x === facingX && a.y === facingY) ? 0 : ((a.x === px && a.y === py) ? 1 : 2);
        const bFacing = (b.x === facingX && b.y === facingY) ? 0 : ((b.x === px && b.y === py) ? 1 : 2);
        return aFacing - bFacing;
      });
    };

    // Check adjacent locked PuzzleGate
    const adjacentPuzzleGates = sortByFacing(this.entities.filter(
      e => e.type === ENTITY_TYPES.PUZZLE_GATE && !e.isUnlocked && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    ));
    if (adjacentPuzzleGates.length > 0) {
      this.openPuzzleGateModal(adjacentPuzzleGates[0]);
      return;
    }

    // Check if player is on or adjacent to a Signpost
    const adjacentSignposts = this.entities.filter(
      e => e.type === ENTITY_TYPES.SIGNPOST && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (adjacentSignposts.length > 0) {
      const signpost = adjacentSignposts[0];
      const data = signpost.readSign();
      this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY - 22, `📜 ${data.title}`, '#38bdf8');
      globalEvents.emit('signpost:read', data);
      if (this.uiCallbacks.onSignpostRead) {
        this.uiCallbacks.onSignpostRead(data);
      }
      return;
    }

    // Check if player is adjacent to a WallDecor
    const adjacentDecor = this.entities.filter(
      e => e.type === ENTITY_TYPES.WALL_DECOR && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (adjacentDecor.length > 0) {
      const decor = adjacentDecor[0];
      const data = decor.inspect();
      const decorIcon = data.decorType === 'note' ? '📝' : (data.decorType === 'painting' ? '🖼️' : (data.decorType === 'tapestry' ? '🚩' : '🏛️'));
      this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY - 22, `${decorIcon} ${data.title}`, '#fbbf24');
      globalEvents.emit('wall_decor:inspected', data);
      if (this.uiCallbacks.onWallDecorInspected) {
        this.uiCallbacks.onWallDecorInspected(data);
      }
      return;
    }

    // Check if player is on or adjacent to a lever at matching elevation
    const adjacentLevers = this.entities.filter(
      e => e.type === 'lever' && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation || ELEVATION.GROUND) === pe
    );

    if (adjacentLevers.length > 0) {
      const lever = adjacentLevers[0];
      lever.toggle(this.level);
      const leverColor = lever.state ? '#34d399' : '#f43f5e';
      const leverStateLabel = lever.state ? 'ON' : 'OFF';
      const leverActionLabel = lever.state ? 'Mechanism Opened' : 'Mechanism Closed';
      const leverWx = lever.x * this.camera.tileSize + this.camera.tileSize / 2;
      const leverWy = lever.y * this.camera.tileSize + this.camera.tileSize / 2;

      this.renderer.spawnParticles(leverWx, leverWy, leverColor, 20);
      this.renderer.spawnShockwave(leverWx, leverWy, leverColor, 36);
      this.renderer.spawnFloatingText(leverWx, leverWy, `⚡ ${lever.name || 'Switch'}: ${leverStateLabel}`, leverColor);

      if (Array.isArray(lever.targets)) {
        for (const target of lever.targets) {
          if (target.x !== undefined && target.y !== undefined) {
            const targetWx = target.x * this.camera.tileSize + this.camera.tileSize / 2;
            const targetWy = target.y * this.camera.tileSize + this.camera.tileSize / 2;
            this.renderer.spawnParticles(targetWx, targetWy, leverColor, 15);
            this.renderer.spawnShockwave(targetWx, targetWy, leverColor, 28);
            this.renderer.spawnFloatingText(targetWx, targetWy, lever.state ? '🔓 Passage Opened' : '🔒 Passage Closed', leverColor);
          }
        }
      }

      this.logger.logLeverToggled({
        leverId: lever.id,
        state: lever.state,
        atX: lever.x,
        atY: lever.y,
        targets: lever.targets,
        elapsedMs: this.elapsedTime,
      });

      globalEvents.emit('lever:toggled', {
        leverId: lever.id,
        name: lever.name || 'Switch',
        state: lever.state,
        stateLabel: leverStateLabel,
        actionLabel: leverActionLabel,
        targets: lever.targets,
        x: lever.x,
        y: lever.y,
      });

      this.notifyUI();
      return;
    }

    // Check if player is on or adjacent to a Pedestal
    const adjacentPedestals = sortByFacing(this.entities.filter(
      e => e.type === ENTITY_TYPES.PEDESTAL && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    ));
    if (adjacentPedestals.length > 0) {
      const pedestal = adjacentPedestals[0];
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
        return;
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
        return;
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
        return;
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
        return;
      }
    }

    // Check if player is on or adjacent to a RiddleItem on the floor
    const adjacentRiddleItems = this.entities.filter(
      e => e.type === ENTITY_TYPES.RIDDLE_ITEM && !e.isCarried && !e.isSlotted && Math.abs(e.x - px) + Math.abs(e.y - py) <= 1 && (e.elevation ?? ELEVATION.GROUND) === pe
    );
    if (adjacentRiddleItems.length > 0) {
      const item = adjacentRiddleItems[0];
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
        return;
      } else {
        // Swap carried item with floor item
        this.player.dropRiddleItem(item.x, item.y, item.elevation);
        this.player.pickUpRiddleItem(item);
        this.renderer.spawnFloatingText(this.player.worldX, this.player.worldY, `🔄 Swapped for ${item.name}`, '#38bdf8');
        this.notifyUI();
        return;
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
        this.getEffectiveViewRadius()
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
    this.renderer.spawnParticles(this.player.worldX, this.player.worldY, '#38bdf8', 60);

    const earnedParSteps = this.level.parSteps !== undefined ? this.player.stepsTaken <= this.level.parSteps : false;
    const earnedParTime = this.level.parTime !== undefined ? (this.elapsedTime / 1000) <= this.level.parTime : false;

    const stats = {
      time: this.elapsedTime,
      steps: this.player.stepsTaken,
      earnedParSteps,
      earnedParTime,
      parSteps: this.level.parSteps,
      parTime: this.level.parTime,
      targetLevel: exit?.targetLevel || null,
      branchLabel: exit?.label || null,
      exitId: exit?.id || null,
    };

    console.info(`[MazeGame:Engine] Victory achieved on level "${this.level.title}" (${this.level.id})!`, {
      timeFormatted: (this.elapsedTime / 1000).toFixed(2) + 's',
      steps: this.player.stepsTaken,
      finalInventory: [...this.player.inventory],
      earnedParSteps,
      earnedParTime,
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
    this.logger.download(customFilename);
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
   */
  downloadReplay(customFilename) {
    this.logger.downloadReplay(customFilename);
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
      this.clickTarget
    );

    this.minimap.render(this.level, this.player, this.fog, dt);
  }
}
