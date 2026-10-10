import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { InputManager, GAMEPAD_BUTTONS, GAME_COMMANDS } from '../../../js/engine/input-manager.js';

describe('Engine > InputManager & Gamepad API (BL-40, BL-59)', () => {
  it('manages keyboard states and calculates orthogonal movement vectors', () => {
    const input = new InputManager();

    // Initial state: no movement
    let poll = input.poll();
    assertEqual(poll.hasInput, false);
    assertEqual(poll.dx, 0);
    assertEqual(poll.dy, 0);

    // Press KeyW / ArrowUp
    input.handleKeyDown({ code: 'KeyW', key: 'w' });
    assertEqual(input.isDown('KeyW'), true);
    poll = input.poll();
    assertEqual(poll.hasInput, true);
    assertEqual(poll.dx, 0);
    assertEqual(poll.dy, -1);

    // Add KeyD (diagonal input -> orthogonal clamp to horizontal)
    input.handleKeyDown({ code: 'KeyD', key: 'd' });
    poll = input.poll();
    assertEqual(poll.dx, 1);
    assertEqual(poll.dy, 0); // Orthogonally clamped

    // Release KeyD
    input.handleKeyUp({ code: 'KeyD', key: 'd' });
    poll = input.poll();
    assertEqual(poll.dx, 0);
    assertEqual(poll.dy, -1);

    // Release KeyW
    input.handleKeyUp({ code: 'KeyW', key: 'w' });
    poll = input.poll();
    assertEqual(poll.hasInput, false);
    assertEqual(poll.dx, 0);
    assertEqual(poll.dy, 0);
  });

  it('dispatches semantic commands on keypress and obeys hotkey gating', () => {
    const input = new InputManager({ hotkeysEnabled: true });
    const commandsReceived = [];

    input.on(GAME_COMMANDS.INTERACT, (p) => commandsReceived.push({ cmd: 'interact', p }));
    input.on(GAME_COMMANDS.ROTATE_LEFT, (p) => commandsReceived.push({ cmd: 'rotate_left', p }));
    input.on(GAME_COMMANDS.PAUSE, (p) => commandsReceived.push({ cmd: 'pause', p }));
    input.on(GAME_COMMANDS.TOGGLE_VIEW_MODE, (p) => commandsReceived.push({ cmd: 'toggle_view_mode', p }));

    // Interact with KeyE
    input.handleKeyDown({ code: 'KeyE', key: 'e' });
    assertEqual(commandsReceived.length, 1);
    assertEqual(commandsReceived[0].cmd, 'interact');

    // Rotate with KeyQ
    input.handleKeyDown({ code: 'KeyQ', key: 'q' });
    assertEqual(commandsReceived.length, 2);
    assertEqual(commandsReceived[1].cmd, 'rotate_left');

    // Pause with Escape
    input.handleKeyDown({ code: 'Escape', key: 'Escape' });
    assertEqual(commandsReceived.length, 3);
    assertEqual(commandsReceived[2].cmd, 'pause');

    // Disable secondary hotkeys (e.g. Simple Keyboard Mode)
    input.setHotkeysEnabled(false);

    // Try rotating with KeyQ -> should NOT emit command
    input.handleKeyDown({ code: 'KeyQ', key: 'q' });
    assertEqual(commandsReceived.length, 3);

    // But essential Interact and Pause MUST still emit
    input.handleKeyDown({ code: 'Space', key: ' ' });
    assertEqual(commandsReceived.length, 4);
    assertEqual(commandsReceived[3].cmd, 'interact');

    input.handleKeyDown({ code: 'KeyP', key: 'p' });
    assertEqual(commandsReceived.length, 5);
    assertEqual(commandsReceived[4].cmd, 'pause');
  });

  it('processes Gamepad analog stick input with deadzone filtering', () => {
    const input = new InputManager({ deadzone: 0.25 });

    // Mock gamepad object
    const mockPad = {
      index: 0,
      connected: true,
      axes: [0.1, 0.15], // Below 0.25 deadzone
      buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
    };

    // Provide mock gamepad getter
    input.getGamepad = () => mockPad;

    let poll = input.poll();
    assertEqual(poll.hasInput, false);
    assertEqual(poll.dx, 0);
    assertEqual(poll.dy, 0);

    // Push stick to the right (X = 0.85)
    mockPad.axes[0] = 0.85;
    mockPad.axes[1] = 0.05;
    poll = input.poll();
    assertEqual(poll.hasInput, true);
    assertEqual(poll.dx, 1);
    assertEqual(poll.dy, 0);

    // Push stick down (Y = -0.9)
    mockPad.axes[0] = 0.0;
    mockPad.axes[1] = -0.9;
    poll = input.poll();
    assertEqual(poll.dx, 0);
    assertEqual(poll.dy, -1);
  });

  it('processes Gamepad D-pad input and button edge-trigger debounce', () => {
    const input = new InputManager();
    const emitted = [];
    input.on(GAME_COMMANDS.INTERACT, (p) => emitted.push('interact'));
    input.on(GAME_COMMANDS.ROTATE_LEFT, (p) => emitted.push('rotate_left'));
    input.on(GAME_COMMANDS.ROTATE_RIGHT, (p) => emitted.push('rotate_right'));
    input.on(GAME_COMMANDS.PAUSE, (p) => emitted.push('pause'));

    const mockButtons = Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }));
    const mockPad = {
      index: 0,
      connected: true,
      axes: [0, 0],
      buttons: mockButtons,
    };
    input.getGamepad = () => mockPad;

    // D-Pad Down (button 13)
    mockButtons[GAMEPAD_BUTTONS.DPAD_DOWN].pressed = true;
    let poll = input.poll();
    assertEqual(poll.hasInput, true);
    assertEqual(poll.dy, 1);
    mockButtons[GAMEPAD_BUTTONS.DPAD_DOWN].pressed = false;

    // Button A (0) press -> Interact command
    mockButtons[GAMEPAD_BUTTONS.A].pressed = true;
    input.poll();
    assertEqual(emitted.length, 1);
    assertEqual(emitted[0], 'interact');

    // Button A held on next frame -> no duplicate command (debounced edge trigger)
    input.poll();
    assertEqual(emitted.length, 1);

    // Button A released and pressed again -> second interact command
    mockButtons[GAMEPAD_BUTTONS.A].pressed = false;
    input.poll();
    mockButtons[GAMEPAD_BUTTONS.A].pressed = true;
    input.poll();
    assertEqual(emitted.length, 2);

    // Left Bumper (4) and Right Bumper (5)
    mockButtons[GAMEPAD_BUTTONS.LB].pressed = true;
    input.poll();
    assertEqual(emitted[2], 'rotate_left');

    mockButtons[GAMEPAD_BUTTONS.RB].pressed = true;
    input.poll();
    assertEqual(emitted[3], 'rotate_right');

    // Start button (9) -> Pause command
    mockButtons[GAMEPAD_BUTTONS.START].pressed = true;
    input.poll();
    assertEqual(emitted[4], 'pause');
  });

  it('safely handles attach and detach lifecycle without memory leaks', () => {
    const input = new InputManager();

    const mockElement = {
      listeners: {},
      addEventListener(type, fn) {
        this.listeners[type] = fn;
      },
      removeEventListener(type, fn) {
        delete this.listeners[type];
      },
    };

    input.attach(mockElement);
    assertEqual(typeof mockElement.listeners.keydown, 'function');
    assertEqual(typeof mockElement.listeners.keyup, 'function');

    // Keydown through attached target
    mockElement.listeners.keydown({ code: 'KeyA', key: 'a' });
    assertEqual(input.isDown('KeyA'), true);

    // Detach
    input.detach();
    assertEqual(mockElement.listeners.keydown, undefined);
    assertEqual(mockElement.listeners.keyup, undefined);
    assertEqual(input.isDown('KeyA'), false);
  });

  it('supports configurable movement keybinding presets (Issue #63, BL-100)', () => {
    const input = new InputManager({ keybindingPreset: 'arrows_only' });

    // With arrows_only preset, KeyW should NOT trigger movement
    input.handleKeyDown({ code: 'KeyW', key: 'w' });
    let poll = input.poll();
    assertEqual(poll.hasInput, false, 'KeyW should not move explorer under arrows_only preset');

    // ArrowUp should trigger movement
    input.handleKeyDown({ code: 'ArrowUp', key: 'ArrowUp' });
    poll = input.poll();
    assertEqual(poll.hasInput, true, 'ArrowUp should move explorer under arrows_only preset');
    assertEqual(poll.dy, -1);
    input.clearKeys();

    // Switch to ESDF preset
    input.setKeybindingPreset('esdf');
    input.handleKeyDown({ code: 'KeyE', key: 'e' });
    poll = input.poll();
    assertEqual(poll.hasInput, true, 'KeyE should move explorer up under ESDF preset');
    assertEqual(poll.dy, -1);
    input.clearKeys();

    // Switch to AZERTY preset
    input.setKeybindingPreset('azerty');
    input.handleKeyDown({ code: 'KeyZ', key: 'z' });
    poll = input.poll();
    assertEqual(poll.hasInput, true, 'KeyZ should move explorer up under AZERTY preset');
    assertEqual(poll.dy, -1);
    input.clearKeys();
  });
});

