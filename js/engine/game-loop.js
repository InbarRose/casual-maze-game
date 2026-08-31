/**
 * Game Loop & State Coordinator
 * Ties together input, physics/collision, entities, camera, fog, and rendering.
 */

import { KEY_CODES, ELEVATION } from '../core/constants.js';
import { globalEvents } from '../core/events.js';
import { CollisionEngine } from './collision.js';
import { Key } from '../entities/key.js';
import { Door } from '../entities/door.js';
import { Lever } from '../entities/lever.js';
import { Player } from '../entities/player.js';
import { Camera } from './camera.js';
import { FogOfWar } from './fog.js';
import { GameRenderer } from './renderer.js';
import { Minimap } from './minimap.js';
import { StorageManager } from '../core/storage.js';
import { DebugLogger } from './debug-logger.js';

export class GameLoop {
  /**
   * @param {object} options
   * @param {HTMLCanvasElement} options.mainCanvas
   * @param {HTMLCanvasElement} options.minimapCanvas
   * @param {object} options.level
   * @param {object} [options.uiCallbacks]
   */
  constructor({ mainCanvas, minimapCanvas, level, uiCallbacks = {} }) {
    this.mainCanvas = mainCanvas;
    this.minimapCanvas = minimapCanvas;
    this.level = JSON.parse(JSON.stringify(level));
    this.uiCallbacks = uiCallbacks;

    this.isRunning = false;
    this.isPaused = false;
    this.isWon = false;
    this.lastTime = 0;
    this.elapsedTime = 0; // in milliseconds

    // Telemetry & Debug Logger
    this.logger = new DebugLogger(this.level);
    this.logger.log('game:start', {
      spawn: {
        x: this.level.spawn.x,
        y: this.level.spawn.y,
        elevation: this.level.spawn.elevation || 0,
      },
    }, 0);

    // Subsystems
    const tileSize = this.level.config.tileSize || 32;
    this.camera = new Camera(mainCanvas.width, mainCanvas.height, tileSize);
    this.fog = this.level.config.fogOfWar
      ? new FogOfWar(this.level.dimensions.width, this.level.dimensions.height)
      : null;
    if (this.fog && this.level.config.mapRevealed) {
      this.fog.reset(true);
    }
    this.renderer = new GameRenderer(mainCanvas);
    this.minimap = new Minimap(minimapCanvas);

    // Determine effective spawn coordinates (custom test spawn takes precedence in playtest mode)
    const effectiveSpawnX = this.level.testSpawn?.x ?? this.level.spawn?.x ?? 1;
    const effectiveSpawnY = this.level.testSpawn?.y ?? this.level.spawn?.y ?? 1;
    const effectiveElevation = this.level.testSpawn?.elevation ?? this.level.spawn?.elevation ?? 0;
    const initialInventory = Array.isArray(this.level.testInventory) ? [...this.level.testInventory] : [];

    // Instantiate Player
    this.player = new Player(
      effectiveSpawnX,
      effectiveSpawnY,
      effectiveElevation,
      tileSize,
      initialInventory
    );

    // Instantiate Entities
    this.entities = [];
    this.initEntities();

    // Input state
    this.keysDown = new Set();
    this.panVelocity = { x: 0, y: 0 };
    this.isDraggingMinimap = false;

    // Snap camera to spawn
    this.camera.snapTo(
      this.player.worldX,
      this.player.worldY,
      this.level.dimensions.width,
      this.level.dimensions.height
    );

    // Initial fog update
    this.updateFog();

    // Bind listeners
    this.bindInputs();
    this.notifyUI();
  }

  /**
   * Instantiate entities from level definition
   */
  initEntities() {
    this.entities = (this.level.entities || []).map(e => {
      if (e.type === 'key') return new Key(e);
      if (e.type === 'door') return new Door(e);
      if (e.type === 'lever') return new Lever(e);
      return null;
    }).filter(Boolean);
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

      // Handle Instant Actions
      const isMap = KEY_CODES.MAP.includes(e.code) || (e.key && KEY_CODES.MAP.includes(e.key));
      const isRestart = KEY_CODES.RESTART.includes(e.code) || (e.key && KEY_CODES.RESTART.includes(e.key));
      const isInteract = KEY_CODES.INTERACT.includes(e.code) || (e.key && KEY_CODES.INTERACT.includes(e.key));

      if (isMap) {
        this.toggleFreePan();
      } else if (isRestart) {
        this.restartLevel();
      } else if (isInteract) {
        this.handleManualInteract();
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

    // Minimap Click & Drag for Free-Pan
    this.handleMinimapMouseDown = (e) => {
      this.isDraggingMinimap = true;
      this.panToMinimapClick(e);
    };

    this.handleMinimapMouseMove = (e) => {
      if (this.isDraggingMinimap) {
        this.panToMinimapClick(e);
      }
    };

    this.handleMinimapMouseUp = () => {
      this.isDraggingMinimap = false;
    };

    if (this.minimapCanvas && typeof this.minimapCanvas.addEventListener === 'function') {
      this.minimapCanvas.addEventListener('mousedown', this.handleMinimapMouseDown);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.handleMinimapMouseMove);
      window.addEventListener('mouseup', this.handleMinimapMouseUp);
    }
  }

  /**
   * Cleanup listeners
   */
  destroy() {
    this.stop();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('mousemove', this.handleMinimapMouseMove);
      window.removeEventListener('mouseup', this.handleMinimapMouseUp);
    }
    if (this.minimapCanvas && typeof this.minimapCanvas.removeEventListener === 'function') {
      this.minimapCanvas.removeEventListener('mousedown', this.handleMinimapMouseDown);
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
    const { gridX, gridY } = this.minimap.mapClickToGrid(e.clientX, e.clientY, this.level);
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
    this.loop(this.lastTime);
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Reset the current level state
   */
  restartLevel() {
    const effectiveSpawnX = this.level.testSpawn?.x ?? this.level.spawn?.x ?? 1;
    const effectiveSpawnY = this.level.testSpawn?.y ?? this.level.spawn?.y ?? 1;
    const effectiveElevation = this.level.testSpawn?.elevation ?? this.level.spawn?.elevation ?? 0;
    const initialInventory = Array.isArray(this.level.testInventory) ? [...this.level.testInventory] : [];

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
    this.isWon = false;
    this.elapsedTime = 0;
    this.camera.setMode('follow');
    this.camera.snapTo(
      this.player.worldX,
      this.player.worldY,
      this.level.dimensions.width,
      this.level.dimensions.height
    );
    this.updateFog();

    // Reset logger for new attempt
    this.logger = new DebugLogger(this.level);
    this.logger.log('game:restarted', {
      spawn: {
        x: effectiveSpawnX,
        y: effectiveSpawnY,
        elevation: effectiveElevation,
      },
    }, 0);

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

    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    if (!this.isPaused && !this.isWon) {
      this.elapsedTime += dt * 1000;
      this.update(dt);
    }

    this.render(dt);
    requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Game state updates
   */
  update(dt) {
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

    // 4. Update Entities
    for (const entity of this.entities) {
      entity.update(dt);
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

    // 7. Check Victory Condition (Player must be on ground unless exit is specifically overhead)
    const requiredExitElevation = this.level.exit?.elevation || ELEVATION.GROUND;
    if (
      !this.isWon &&
      this.level.exit &&
      this.player.gridX === this.level.exit.x &&
      this.player.gridY === this.level.exit.y &&
      this.player.elevation === requiredExitElevation
    ) {
      this.handleVictory();
    }
  }

  /**
   * Check for input direction and initiate player movement
   */
  processPlayerMovement() {
    if (this.player.isMoving || this.camera.mode === 'freepan') return;

    let dx = 0;
    let dy = 0;

    for (const code of this.keysDown) {
      if (KEY_CODES.UP.includes(code)) dy -= 1;
      else if (KEY_CODES.DOWN.includes(code)) dy += 1;
      else if (KEY_CODES.LEFT.includes(code)) dx -= 1;
      else if (KEY_CODES.RIGHT.includes(code)) dx += 1;
    }

    // Restrict to orthogonal movement
    if (dx !== 0) dy = 0;

    if (dx === 0 && dy === 0) return;

    const targetX = this.player.gridX + dx;
    const targetY = this.player.gridY + dy;

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
    }
  }

  /**
   * Process manual camera pan when in Free-Pan mode
   */
  processFreePanMovement(dt) {
    let dx = 0;
    let dy = 0;

    for (const code of this.keysDown) {
      if (KEY_CODES.UP.includes(code)) dy -= 1;
      else if (KEY_CODES.DOWN.includes(code)) dy += 1;
      else if (KEY_CODES.LEFT.includes(code)) dx -= 1;
      else if (KEY_CODES.RIGHT.includes(code)) dx += 1;
    }

    if (dx !== 0 || dy !== 0) {
      const speed = this.camera.panSpeed * dt;
      this.camera.panBy(
        dx * speed,
        dy * speed,
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
      });

      this.notifyUI();
    }

    this.notifyUI();
  }

  /**
   * Handle manual interact button (E / Space / Enter)
   */
  handleManualInteract() {
    // Check if player is on or adjacent to a lever at matching elevation
    const px = this.player.gridX;
    const py = this.player.gridY;
    const pe = this.player.elevation;

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
      });

      this.notifyUI();
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
        this.level.config.viewRadius
      );
    }
  }

  /**
   * Handle level completion
   */
  handleVictory() {
    this.isWon = true;
    this.renderer.spawnParticles(this.player.worldX, this.player.worldY, '#38bdf8', 60);

    const stats = {
      time: this.elapsedTime,
      steps: this.player.stepsTaken,
    };

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
   * Notify HUD / UI of state changes
   */
  notifyUI() {
    if (this.uiCallbacks.onStateUpdate) {
      this.uiCallbacks.onStateUpdate({
        levelTitle: this.level.title,
        help: this.level.help || null,
        elevation: this.player.elevation === ELEVATION.OVERHEAD ? 'Bridge (Elevation 1)' : 'Ground Floor',
        keys: this.entities.filter(e => e.type === 'key' && this.player.inventory.includes(e.id)),
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
      dt
    );

    this.minimap.render(this.level, this.player, this.fog, dt);
  }
}
