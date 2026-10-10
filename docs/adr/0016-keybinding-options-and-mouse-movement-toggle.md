# 0016. Custom Key Bindings and Click-to-Move vs Drag Navigation Toggle

Date: 2026-10-10

## Status
Accepted

## Context
In GitHub Issue [#63](https://github.com/InbarRose/casual-maze-game/issues/63) ("*[Idea]: setting options for key binding and mouse click to move toggle*"), players requested:
1. Configurable movement key bindings (e.g. WASD vs Arrow Keys vs custom schemes like ESDF, IJKL, ZQSD/AZERTY, Numpad).
2. A configurable mouse/touch movement interaction mode:
   - **Click to Move (BFS Pathfinding)**: Clicking/tapping corridor floor executes pathfinding to destination.
   - **Direct Drag / Steer Only**: Clicking on floor does not auto-pathfind; navigation requires holding/dragging or keys.
   - **Disabled**: Only keyboard/gamepad/virtual buttons move the player.

The issue was opened via the feedback button flow, verifying the diagnostic bundle and issue template submission. Implementing this addresses Issue #63 directly while improving player ergonomics and accessibility (CMP-04, CMP-15, CMP-19).

## Decision
1. **Configurable Key Schemes in `InputManager` & `constants.js`**:
   - Introduce `KEYBINDING_PRESETS`:
     - `WASD`: Primary WASD + Arrow Keys fallback
     - `ARROWS`: Arrow Keys only
     - `ESDF`: Modern touch-typist layout
     - `AZERTY`: French keyboard layout (ZQSD)
     - `NUMPAD`: Numeric keypad movement (8/4/6/2)
   - Allow customizable directional key bindings stored in `StorageManager` (`keybinding_preset`, `custom_keybindings`).
2. **Mouse/Pointer Movement Mode Toggle**:
   - Introduce `MOUSE_MOVE_MODES` in `constants.js`:
     - `'click_path'` (Default): Tap/Click to pathfind via BFS corridor search.
     - `'drag_only'`: Tap does not pathfind; only dragging/swiping or keys steer.
     - `'disabled'`: Pointer clicks on canvas do not move the explorer (interact only).
   - Persist in `StorageManager` under `mouse_move_mode` (default `'click_path'`).
   - In `GameLoop.prototype.handleCanvasPointerDown`, respect `mouse_move_mode`.
3. **Settings Modal UI Integration (`CMP-15`)**:
   - In `SettingsModal`, add a dedicated **Controls & Navigation** configuration card:
     - Dropdown for **Keyboard Preset** (`WASD & Arrows`, `Arrow Keys Only`, `ESDF`, `AZERTY (ZQSD)`, `Numpad`).
     - Dropdown for **Mouse & Tap Movement Mode** (`Click/Tap to Move (Pathfinding)`, `Drag/Swipe Steering Only`, `Keyboard/Gamepad Only`).
   - Synchronize live changes with `GameLoop` via `globalEvents` (`settings:controls_changed`).

## Consequences
### Positive
* Direct fulfillment of user-submitted GitHub Issue #63.
* Accommodates players with non-QWERTY keyboards (AZERTY, Dvorak), alternative hand positions, and preferences against accidental auto-pathfinding.
* Elevates quality scores for **CMP-04 (Controls & Input Handling)**, **CMP-15 (Settings & Configuration)**, and **CMP-19 (Accessibility)**.
* Remains 100% static, client-side, zero-dependency.

### Negative / Trade-offs
* Settings modal has additional dropdown fields; organized into clean sub-groups to prevent visual clutter.
