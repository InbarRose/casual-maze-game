/**
 * Casual Maze Game — Replay Player Engine
 * 
 * Provides an interactive visual playback controller for recorded sessions
 * and computed walkthroughs. Supports play, pause, step-by-step advance/rewind,
 * timeline seeking, and variable playback speeds.
 */

import { GameLoop } from './game-loop.js';
import { ENTITY_TYPES } from '../core/constants.js';

export const REPLAY_STATES = Object.freeze({
  IDLE: 'IDLE',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
});

export class ReplayPlayer {
  /**
   * @param {object} options
   * @param {HTMLCanvasElement} options.canvas
   * @param {HTMLCanvasElement} [options.minimapCanvas]
   * @param {object} [options.level]
   * @param {object} [options.replay]
   * @param {Function} [options.onStep]
   * @param {Function} [options.onStateChange]
   * @param {number} [options.baseStepDelay=280] Delay per step in ms at 1x speed
   */
  constructor(options = {}) {
    this.canvas = options.canvas || null;
    this.minimapCanvas = options.minimapCanvas || null;
    this.onStep = options.onStep || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.baseStepDelay = options.baseStepDelay || 280;

    this.level = null;
    this.replay = null;
    this.gameLoop = null;

    this.currentStep = 0;
    this.totalSteps = 0;
    this.state = REPLAY_STATES.IDLE;
    this.speed = 1.0;
    this._timer = null;

    if (options.level && options.replay) {
      this.load(options.level, options.replay);
    }
  }

  /**
   * Load level and replay payload
   * @param {object} level
   * @param {object} replay
   */
  load(level, replay) {
    this.pause();
    this.level = JSON.parse(JSON.stringify(level));
    this.replay = JSON.parse(JSON.stringify(replay));

    // Force map revealed for clear visual debugging and walkthrough inspection
    if (this.level.config) {
      this.level.config.mapRevealed = true;
    }

    const actions = this.replay?.actions || [];
    this.totalSteps = actions.length;
    this.currentStep = 0;

    this._initGameLoop();
    this._setState(REPLAY_STATES.PAUSED);
    this._notifyStep();
  }

  /**
   * Initialize internal GameLoop instance
   * @private
   */
  _initGameLoop() {
    if (this.gameLoop) {
      this.gameLoop.destroy();
      this.gameLoop = null;
    }

    if (!this.canvas || !this.level) return;

    const minimap = this.minimapCanvas || this.canvas;
    this.gameLoop = new GameLoop({
      mainCanvas: this.canvas,
      minimapCanvas: minimap,
      level: JSON.parse(JSON.stringify(this.level)),
      uiCallbacks: {},
    });

    // Start renderer and initial paint
    if (typeof requestAnimationFrame !== 'undefined') {
      this.gameLoop.start();
    } else {
      this.gameLoop.isRunning = true;
    }
    if (this.gameLoop.renderer && typeof this.gameLoop.renderer.render === 'function') {
      this.gameLoop.render();
    }
  }

  /**
   * Transition playback state
   * @private
   * @param {string} newState
   */
  _setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.onStateChange(this.state);
  }

  /**
   * Notify step listener
   * @private
   */
  _notifyStep() {
    const action = this.replay?.actions?.[this.currentStep - 1] || null;
    this.onStep({
      currentStep: this.currentStep,
      totalSteps: this.totalSteps,
      action,
      timeMs: action ? action.elapsedMs : 0,
      isFinished: this.currentStep >= this.totalSteps,
    });
  }

  /**
   * Play replay continuously
   */
  play() {
    if (!this.replay || this.totalSteps === 0) return;

    if (this.currentStep >= this.totalSteps) {
      this.seekTo(0);
    }

    this._setState(REPLAY_STATES.PLAYING);
    this._scheduleNextTick();
  }

  /**
   * Pause playback
   */
  pause() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this.state === REPLAY_STATES.PLAYING) {
      this._setState(REPLAY_STATES.PAUSED);
    }
  }

  /**
   * Toggle between play and pause
   */
  togglePlay() {
    if (this.state === REPLAY_STATES.PLAYING) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Schedule the next replay step
   * @private
   */
  _scheduleNextTick() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    if (this.state !== REPLAY_STATES.PLAYING) return;

    const delay = Math.max(20, Math.round(this.baseStepDelay / this.speed));
    this._timer = setTimeout(() => {
      const advanced = this.stepForward();
      if (advanced && this.state === REPLAY_STATES.PLAYING) {
        this._scheduleNextTick();
      }
    }, delay);
  }

  /**
   * Execute single action
   * @private
   * @param {object} action
   */
  _executeAction(action) {
    if (!this.gameLoop || !action) return;

    if (action.action === 'teleport' || action.isWarp) {
      this.gameLoop.player.gridX = action.to.x;
      this.gameLoop.player.gridY = action.to.y;
      this.gameLoop.player.elevation = action.to.elevation || 0;
      this.gameLoop.player.worldX = action.to.x * 32 + 16;
      this.gameLoop.player.worldY = action.to.y * 32 + 16;
      this.gameLoop.player.isMoving = false;
      this.gameLoop.handleCellArrival();
    } else if (action.action === 'move') {
      // Auto-unlock puzzle gate if encountering one during playback
      const targetPuzzle = this.gameLoop.entities.find(
        e => e.type === ENTITY_TYPES.PUZZLE_GATE && e.x === action.to.x && e.y === action.to.y
      );
      if (targetPuzzle && !targetPuzzle.isUnlocked) {
        targetPuzzle.unlock();
      }

      this.gameLoop.tryMove(action.to.x, action.to.y);
      this.gameLoop.player.gridX = action.to.x;
      this.gameLoop.player.gridY = action.to.y;
      this.gameLoop.player.elevation = action.to.elevation || 0;
      this.gameLoop.player.worldX = action.to.x * 32 + 16;
      this.gameLoop.player.worldY = action.to.y * 32 + 16;
      this.gameLoop.player.isMoving = false;
      this.gameLoop.handleCellArrival();
    } else if (action.action === 'rotate') {
      if (this.gameLoop.camera) {
        const targetAngle = action.toAngle !== undefined ? action.toAngle : action.angle;
        if (targetAngle !== undefined) {
          this.gameLoop.camera.setRotation(targetAngle, true);
        } else if (action.direction === 'left' || action.direction === 'ccw') {
          this.gameLoop.rotateLeft();
        } else {
          this.gameLoop.rotateRight();
        }
      }
    } else if (action.action === 'interact') {
      if (action.target === 'lever') {
        const lever = this.gameLoop.entities.find(e => e.type === 'lever' && (action.leverId ? e.id === action.leverId : (e.x === action.x && e.y === action.y)));
        if (lever) {
          lever.toggle(this.gameLoop.level);
        }
      } else {
        this.gameLoop.handleManualInteract();
      }
    }

    this.gameLoop.update(0.016);
    if (this.gameLoop.render) {
      this.gameLoop.render();
    }
  }

  /**
   * Advance one step forward
   * @returns {boolean} Whether step was executed
   */
  stepForward() {
    if (!this.replay || this.currentStep >= this.totalSteps) {
      this.pause();
      this._setState(REPLAY_STATES.COMPLETED);
      return false;
    }

    const action = this.replay.actions[this.currentStep];
    this.currentStep++;
    this._executeAction(action);
    this._notifyStep();

    if (this.currentStep >= this.totalSteps) {
      this.pause();
      this._setState(REPLAY_STATES.COMPLETED);
    }

    return true;
  }

  /**
   * Step backward one step
   */
  stepBackward() {
    if (this.currentStep <= 0) return;
    this.seekTo(this.currentStep - 1);
  }

  /**
   * Seek to arbitrary step index
   * @param {number} targetIndex
   */
  seekTo(targetIndex) {
    if (!this.replay) return;

    this.pause();
    const clamped = Math.max(0, Math.min(this.totalSteps, Math.round(targetIndex)));

    // Re-initialize clean loop and fast-forward actions
    this._initGameLoop();
    for (let i = 0; i < clamped; i++) {
      this._executeAction(this.replay.actions[i]);
    }

    this.currentStep = clamped;
    this._setState(clamped >= this.totalSteps ? REPLAY_STATES.COMPLETED : REPLAY_STATES.PAUSED);
    this._notifyStep();
  }

  /**
   * Restart replay from beginning
   */
  restart() {
    this.seekTo(0);
  }

  /**
   * Set playback speed multiplier (e.g. 0.5, 1.0, 2.0, 4.0)
   * @param {number} speed
   */
  setSpeed(speed) {
    this.speed = Math.max(0.1, Math.min(10.0, Number(speed) || 1.0));
  }

  /**
   * Teardown and clean up resources
   */
  destroy() {
    this.pause();
    if (this.gameLoop) {
      this.gameLoop.destroy();
      this.gameLoop = null;
    }
  }
}
