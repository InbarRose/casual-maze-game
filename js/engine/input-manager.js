/**
 * Casual Maze Game - Input Manager
 * Adheres to SOLID (Single Responsibility Principle) by centralizing all
 * hardware input collection (keyboard, gamepad, directional axes) and
 * dispatching discrete semantic game commands.
 */

import { KEY_CODES, getKeyCodesForPreset } from '../core/constants.js';

export const GAMEPAD_BUTTONS = Object.freeze({
  A: 0,           // Xbox A / PlayStation Cross: Interact / Inspect
  B: 1,           // Xbox B / PlayStation Circle: Back / Pause
  X: 2,           // Xbox X / PlayStation Square: View mode toggle
  Y: 3,           // Xbox Y / PlayStation Triangle
  LB: 4,          // Left Bumper: Rotate Camera Left
  RB: 5,          // Right Bumper: Rotate Camera Right
  LT: 6,          // Left Trigger
  RT: 7,          // Right Trigger
  SELECT: 8,      // Back / Share: Toggle Map / Free-pan
  START: 9,       // Start / Options: Pause Menu
  LS_CLICK: 10,   // Left Stick Click
  RS_CLICK: 11,   // Right Stick Click
  DPAD_UP: 12,    // D-Pad Up
  DPAD_DOWN: 13,  // D-Pad Down
  DPAD_LEFT: 14,  // D-Pad Left
  DPAD_RIGHT: 15, // D-Pad Right
});

export const GAME_COMMANDS = Object.freeze({
  MOVE: 'move',
  INTERACT: 'interact',
  SELECT_OPTION: 'select_option',
  ROTATE_LEFT: 'rotate_left',
  ROTATE_RIGHT: 'rotate_right',
  TOGGLE_MAP: 'toggle_map',
  TOGGLE_VIEW_MODE: 'toggle_view_mode',
  ZOOM_IN: 'zoom_in',
  ZOOM_OUT: 'zoom_out',
  ZOOM_RESET: 'zoom_reset',
  RESTART: 'restart',
  PAUSE: 'pause',
});

export class InputManager {
  /**
   * @param {Object} [options]
   * @param {number} [options.deadzone=0.28] Gamepad analog stick deadzone
   * @param {boolean} [options.hotkeysEnabled=true] Whether secondary hotkeys are enabled
   * @param {string} [options.keybindingPreset='wasd_arrows'] Movement keybinding preset ID
   * @param {Function} [options.onCommand] Callback invoked on semantic command
   */
  constructor(options = {}) {
    this.deadzone = typeof options.deadzone === 'number' ? options.deadzone : 0.28;
    this.hotkeysEnabled = options.hotkeysEnabled !== false;
    this.keybindingPreset = options.keybindingPreset || 'wasd_arrows';
    this.directionalKeys = getKeyCodesForPreset(this.keybindingPreset);
    this.onCommandCallback = typeof options.onCommand === 'function' ? options.onCommand : null;

    /** @type {Set<string>} Active pressed keys (both e.code and e.key) */
    this.keysDown = new Set();

    /** @type {Map<string, Set<Function>>} Command listeners */
    this.commandListeners = new Map();

    /** @type {Window|HTMLElement|null} */
    this.attachedTarget = null;

    /** @type {Map<number, boolean>} Button previous state for debounce */
    this.prevGamepadButtons = new Map();

    /** @type {number} Timestamp of last directional gamepad pulse */
    this.lastGamepadMoveTime = 0;
    this.gamepadMoveRepeatDelay = 180; // ms between continuous stick steps

    /** @type {boolean} Gamepad connection status */
    this.hasGamepad = false;
    this.activeGamepadIndex = null;

    // Bound listeners for clean detachment
    this._handleKeyDown = this.handleKeyDown.bind(this);
    this._handleKeyUp = this.handleKeyUp.bind(this);
    this._handleGamepadConnected = this.handleGamepadConnected.bind(this);
    this._handleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);
  }

  /**
   * Register a listener for a semantic command
   * @param {string} command
   * @param {Function} handler
   */
  on(command, handler) {
    if (typeof handler !== 'function') return;
    if (!this.commandListeners.has(command)) {
      this.commandListeners.set(command, new Set());
    }
    this.commandListeners.get(command).add(handler);
  }

  /**
   * Unregister a listener for a semantic command
   * @param {string} command
   * @param {Function} handler
   */
  off(command, handler) {
    if (this.commandListeners.has(command)) {
      this.commandListeners.get(command).delete(handler);
    }
  }

  /**
   * Emit a semantic game command to registered listeners
   * @param {string} command
   * @param {Object} [payload]
   */
  emitCommand(command, payload = {}) {
    if (this.onCommandCallback) {
      this.onCommandCallback(command, payload);
    }
    const listeners = this.commandListeners.get(command);
    if (listeners) {
      for (const fn of listeners) {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[InputManager] Error in command listener for "${command}":`, err);
        }
      }
    }
  }

  /**
   * Attach hardware event listeners
   * @param {Window|HTMLElement} [target=window]
   */
  attach(target = (typeof window !== 'undefined' ? window : null)) {
    if (!target) return;
    this.detach();
    this.attachedTarget = target;

    target.addEventListener('keydown', this._handleKeyDown);
    target.addEventListener('keyup', this._handleKeyUp);

    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', this._handleGamepadConnected);
      window.addEventListener('gamepaddisconnected', this._handleGamepadDisconnected);
    }
  }

  /**
   * Detach hardware event listeners and clear active state
   */
  detach() {
    if (this.attachedTarget) {
      this.attachedTarget.removeEventListener('keydown', this._handleKeyDown);
      this.attachedTarget.removeEventListener('keyup', this._handleKeyUp);
      this.attachedTarget = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('gamepadconnected', this._handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', this._handleGamepadDisconnected);
    }

    this.keysDown.clear();
    this.prevGamepadButtons.clear();
  }

  /**
   * Set hotkeys active state
   * @param {boolean} enabled
   */
  setHotkeysEnabled(enabled) {
    this.hotkeysEnabled = !!enabled;
  }

  /**
   * Set keybinding preset ID (BL-100)
   * @param {string} presetId
   */
  setKeybindingPreset(presetId) {
    this.keybindingPreset = presetId || 'wasd_arrows';
    this.directionalKeys = getKeyCodesForPreset(this.keybindingPreset);
  }

  /**
   * Check if a specific key code or key is currently down
   * @param {string} code
   * @returns {boolean}
   */
  isDown(code) {
    return this.keysDown.has(code);
  }

  /**
   * Clear all active pressed keys
   */
  clearKeys() {
    this.keysDown.clear();
  }

  /**
   * Hardware KeyDown handler
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    if (!e) return;
    const isNavigation = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) ||
                         ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key);
    if (isNavigation && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (e.code) this.keysDown.add(e.code);
    if (e.key) this.keysDown.add(e.key);

    const hotkeysActive = this.hotkeysEnabled;

    // Instant Action Commands
    if (KEY_CODES.INTERACT.includes(e.code) || (e.key && KEY_CODES.INTERACT.includes(e.key))) {
      this.emitCommand(GAME_COMMANDS.INTERACT, { source: 'keyboard', event: e });
    } else if (KEY_CODES.NUMERIC_SELECT && (KEY_CODES.NUMERIC_SELECT.includes(e.code) || (e.key && KEY_CODES.NUMERIC_SELECT.includes(e.key)))) {
      const match = (e.key || e.code || '').match(/[1-9]/);
      if (match) {
        const optionIndex = parseInt(match[0], 10);
        this.emitCommand(GAME_COMMANDS.SELECT_OPTION, { index: optionIndex, source: 'keyboard', event: e });
      }
    } else if (KEY_CODES.PAUSE && (KEY_CODES.PAUSE.includes(e.code) || (e.key && KEY_CODES.PAUSE.includes(e.key)))) {
      this.emitCommand(GAME_COMMANDS.PAUSE, { source: 'keyboard', event: e });
    } else if (hotkeysActive && KEY_CODES.ROTATE_LEFT && (KEY_CODES.ROTATE_LEFT.includes(e.code) || (e.key && KEY_CODES.ROTATE_LEFT.includes(e.key)))) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      this.emitCommand(GAME_COMMANDS.ROTATE_LEFT, { source: 'keyboard', event: e });
    } else if (hotkeysActive && KEY_CODES.ROTATE_RIGHT && (KEY_CODES.ROTATE_RIGHT.includes(e.code) || (e.key && KEY_CODES.ROTATE_RIGHT.includes(e.key)))) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      this.emitCommand(GAME_COMMANDS.ROTATE_RIGHT, { source: 'keyboard', event: e });
    } else if (hotkeysActive && KEY_CODES.MAP && (KEY_CODES.MAP.includes(e.code) || (e.key && KEY_CODES.MAP.includes(e.key)))) {
      this.emitCommand(GAME_COMMANDS.TOGGLE_MAP, { source: 'keyboard', event: e });
    } else if (hotkeysActive && KEY_CODES.RESTART && (KEY_CODES.RESTART.includes(e.code) || (e.key && KEY_CODES.RESTART.includes(e.key)))) {
      this.emitCommand(GAME_COMMANDS.RESTART, { source: 'keyboard', event: e });
    } else if (hotkeysActive && KEY_CODES.VIEW_MODE && (KEY_CODES.VIEW_MODE.includes(e.code) || (e.key && KEY_CODES.VIEW_MODE.includes(e.key)))) {
      this.emitCommand(GAME_COMMANDS.TOGGLE_VIEW_MODE, { source: 'keyboard', event: e });
    } else if (hotkeysActive && KEY_CODES.ZOOM_IN && (KEY_CODES.ZOOM_IN.includes(e.code) || (e.key && KEY_CODES.ZOOM_IN.includes(e.key)))) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      this.emitCommand(GAME_COMMANDS.ZOOM_IN, { source: 'keyboard', event: e });
    } else if (hotkeysActive && KEY_CODES.ZOOM_OUT && (KEY_CODES.ZOOM_OUT.includes(e.code) || (e.key && KEY_CODES.ZOOM_OUT.includes(e.key)))) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      this.emitCommand(GAME_COMMANDS.ZOOM_OUT, { source: 'keyboard', event: e });
    } else if (hotkeysActive && KEY_CODES.ZOOM_RESET && (KEY_CODES.ZOOM_RESET.includes(e.code) || (e.key && KEY_CODES.ZOOM_RESET.includes(e.key)))) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      this.emitCommand(GAME_COMMANDS.ZOOM_RESET, { source: 'keyboard', event: e });
    }
  }

  /**
   * Hardware KeyUp handler
   * @param {KeyboardEvent} e
   */
  handleKeyUp(e) {
    if (!e) return;
    if (e.code) this.keysDown.delete(e.code);
    if (e.key) this.keysDown.delete(e.key);
  }

  /**
   * Gamepad Connected Handler
   * @param {GamepadEvent} e
   */
  handleGamepadConnected(e) {
    this.hasGamepad = true;
    if (e.gamepad) {
      this.activeGamepadIndex = e.gamepad.index;
      console.log(`[InputManager] Gamepad connected: "${e.gamepad.id}" (Index: ${e.gamepad.index})`);
    }
  }

  /**
   * Gamepad Disconnected Handler
   * @param {GamepadEvent} e
   */
  handleGamepadDisconnected(e) {
    console.log(`[InputManager] Gamepad disconnected (Index: ${e.gamepad?.index})`);
    if (this.activeGamepadIndex === e.gamepad?.index) {
      this.activeGamepadIndex = null;
      this.hasGamepad = false;
    }
    this.prevGamepadButtons.clear();
  }

  /**
   * Retrieve active gamepad from browser API
   * @returns {Gamepad|null}
   */
  getGamepad() {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
      return null;
    }
    const gamepads = navigator.getGamepads();
    if (!gamepads) return null;

    if (this.activeGamepadIndex !== null && gamepads[this.activeGamepadIndex]) {
      return gamepads[this.activeGamepadIndex];
    }

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        this.activeGamepadIndex = i;
        this.hasGamepad = true;
        return gamepads[i];
      }
    }

    this.hasGamepad = false;
    return null;
  }

  /**
   * Poll hardware state (gamepads, repeating axes) on each engine frame
   * @param {number} [dt=0.016] Delta time in seconds
   * @returns {{ dx: number, dy: number, hasInput: boolean, gamepadActive: boolean }}
   */
  poll(dt = 0.016) {
    const pad = this.getGamepad();
    let gamepadDx = 0;
    let gamepadDy = 0;

    if (pad) {
      this.pollGamepadButtons(pad);

      // Analog Stick (Axes 0 & 1)
      const axisX = pad.axes?.[0] ?? 0;
      const axisY = pad.axes?.[1] ?? 0;

      if (Math.abs(axisX) > this.deadzone) {
        gamepadDx = axisX > 0 ? 1 : -1;
      }
      if (Math.abs(axisY) > this.deadzone) {
        gamepadDy = axisY > 0 ? 1 : -1;
      }

      // D-Pad Buttons (12: Up, 13: Down, 14: Left, 15: Right)
      if (pad.buttons?.[GAMEPAD_BUTTONS.DPAD_UP]?.pressed) gamepadDy = -1;
      if (pad.buttons?.[GAMEPAD_BUTTONS.DPAD_DOWN]?.pressed) gamepadDy = 1;
      if (pad.buttons?.[GAMEPAD_BUTTONS.DPAD_LEFT]?.pressed) gamepadDx = -1;
      if (pad.buttons?.[GAMEPAD_BUTTONS.DPAD_RIGHT]?.pressed) gamepadDx = 1;
    }

    // Keyboard Directional Input (Using active directional keybinding preset)
    let keyDx = 0;
    let keyDy = 0;
    const dirs = this.directionalKeys || getKeyCodesForPreset(this.keybindingPreset);
    for (const code of this.keysDown) {
      if (dirs.UP.includes(code)) keyDy -= 1;
      else if (dirs.DOWN.includes(code)) keyDy += 1;
      else if (dirs.LEFT.includes(code)) keyDx -= 1;
      else if (dirs.RIGHT.includes(code)) keyDx += 1;
    }

    // Combine Keyboard & Gamepad (Gamepad takes priority if keyboard is idle)
    let combinedDx = keyDx !== 0 ? keyDx : gamepadDx;
    let combinedDy = keyDy !== 0 ? keyDy : gamepadDy;

    // Restrict to orthogonal direction
    if (combinedDx !== 0) combinedDy = 0;

    return {
      dx: Math.sign(combinedDx),
      dy: Math.sign(combinedDy),
      hasInput: combinedDx !== 0 || combinedDy !== 0,
      gamepadActive: !!pad,
    };
  }

  /**
   * Process discrete gamepad button presses with edge-trigger debouncing
   * @param {Gamepad} pad
   */
  pollGamepadButtons(pad) {
    if (!pad || !pad.buttons) return;

    const checkButtonEdge = (buttonIndex) => {
      const isPressed = !!pad.buttons[buttonIndex]?.pressed;
      const wasPressed = !!this.prevGamepadButtons.get(buttonIndex);
      this.prevGamepadButtons.set(buttonIndex, isPressed);
      return isPressed && !wasPressed; // edge-triggered on press
    };

    // Button 0 (A / Cross): Interact / Inspect
    if (checkButtonEdge(GAMEPAD_BUTTONS.A)) {
      this.emitCommand(GAME_COMMANDS.INTERACT, { source: 'gamepad' });
    }

    // Button 1 (B / Circle) or Button 9 (Start / Options): Pause
    if (checkButtonEdge(GAMEPAD_BUTTONS.B) || checkButtonEdge(GAMEPAD_BUTTONS.START)) {
      this.emitCommand(GAME_COMMANDS.PAUSE, { source: 'gamepad' });
    }

    // Bumpers: Camera Rotations
    if (checkButtonEdge(GAMEPAD_BUTTONS.LB)) {
      this.emitCommand(GAME_COMMANDS.ROTATE_LEFT, { source: 'gamepad' });
    }
    if (checkButtonEdge(GAMEPAD_BUTTONS.RB)) {
      this.emitCommand(GAME_COMMANDS.ROTATE_RIGHT, { source: 'gamepad' });
    }

    // Face Button X: View Mode Toggle
    if (checkButtonEdge(GAMEPAD_BUTTONS.X)) {
      this.emitCommand(GAME_COMMANDS.TOGGLE_VIEW_MODE, { source: 'gamepad' });
    }

    // Button 8 (Select / Back): Map Free-pan Toggle
    if (checkButtonEdge(GAMEPAD_BUTTONS.SELECT)) {
      this.emitCommand(GAME_COMMANDS.TOGGLE_MAP, { source: 'gamepad' });
    }
  }
}
