# 0019. In-Game Pause Menu Drawer Categorization and Segmented Settings Navigation

Date: 2026-10-10

## Status
Accepted

## Context
As the game evolved with new diagnostic utilities, accessibility features, camera modes, telemetry tools, and audio controls, both the in-game pause menu and the global settings dialog experienced severe visual clutter:
1. **In-Game Pause Menu (`#game-pause-modal`)**: The pause drawer expanded into an unwieldy 14-button monolithic vertical stack (`Resume`, `Restart`, `View: 2.5D`, `Free-Pan`, `Objective & Lore`, `Activity Log`, `Solver Walkthrough`, `Game Settings`, `Player Profile`, `Report Issue`, `Sound FX: ON`, `Hotkeys: ON`, `Save Game Progress`, `Return to Level Select`). On laptop screens and mobile viewports, this created excessive vertical scrolling and visual friction.
2. **Settings Modal (`SettingsModal`)**: The modal aggregated audio, perspective, keyboard schemes, mouse navigation toggles, single-letter hotkeys, full gamepad tester, save backup/restore, emergency rollback snapshots, progress wipe, and diagnostic telemetry into a single 70vh scrollable pane. Navigating to gamepad testing or save backup required tedious scrolling past audio and display controls.
3. **Ergonomic Demand**: Players need quick, prominent access to common actions (`Resume`, `Restart`) while secondary exploration controls (`2.5D View`, `Free-Pan`, `Walkthrough`) and system options (`Audio`, `Hotkeys`, `Settings`, `Profile`) are organized predictably without screen bloat.

## Decision
1. **Categorized Command Center for Pause Menu (BL-106)**:
   - Restructured `.pause-menu-actions` into semantic groups:
     - **Primary Actions**: Prominent `Resume Labyrinth` callout and `Restart Level` with safe inline confirmation.
     - **View & Exploration**: 2-column responsive grid containing `View: 2.5D / Top-Down [V]`, `Free-Pan Mode [M]`, `Objective & Lore`, `Watch Solver Walkthrough`, and `Activity Log & Telemetry [L]`.
     - **Preferences & System**: 2-column responsive grid containing `Sound FX Toggle`, `Hotkeys Toggle`, `Game Settings`, `Player Profile`, `Save Game (.json)`, and `Report Issue`.
     - **Session Exit**: Isolated danger block with `Return to Level Select` and destructive confirmation safety.
   - Retained 100% backward-compatible element IDs (`#btn-pause-resume`, `#btn-pause-restart`, `#btn-pause-perspective`, `#btn-pause-freepan`, `#btn-pause-sound`, etc.) ensuring existing keyboard shortcuts, controllers, and unit tests continue functioning without modification.
2. **Segmented Tab Navigation in Settings Modal (BL-107)**:
   - Added a horizontal categorized tab bar (`#settings-tab-bar`) across 5 dedicated categories:
     - 🔊 **Audio**: Master volume, SFX volume, Ambient BGM, and Mute All toggle.
     - 🎥 **Display**: Camera perspective (2.5D vs flat 2D), smooth camera rotation easing, high contrast grid, and note presentation mode.
     - 🎮 **Controls**: Simple mode toggle, selectable keyboard movement schemes (WASD, Arrows, ESDF, AZERTY, Numpad), pointer navigation mode (Click Path, Drag Steering, Disabled), hotkey guide, and interactive Gamepad Layout & Live Input Tester.
     - 💾 **Save Data**: Cloudless save export (`.json`), backup restore, emergency snapshot rollback, and destructive progress reset.
     - 🔬 **Support**: Replay theater/test lab navigation and telemetry bug reporting launcher.
   - Added `switchTab(tabId)` method and enhanced `open(targetTab)` to allow direct linking into specific tabs from menus or hotkeys.
   - Preserved all input and button IDs (`#setting-mute-all`, `#setting-vol-master`, `#setting-keybinding-select`, `#setting-mouse-mode-select`, etc.) ensuring complete test suite compatibility.

## Consequences

### Positive
- **Visual Ergonomics**: The in-game pause drawer is compact ($\le 540\text{px}$ width), utilizing a responsive 2-column grid that fits comfortably within laptop and mobile viewports without vertical overflow.
- **Cognitive Clarity**: Actions are logically categorized by frequency and intent rather than being mixed in an undifferentiated 14-button list.
- **Frictionless Settings**: Players jump directly to the configuration domain they care about without scanning an unsegmented long-scroll form.
- **Zero Breaking Changes**: All DOM IDs, event handlers, hotkey listeners, and unit test assertions remain 100% operational.

### Negative / Trade-offs
- Tab navigation requires tab switching clicks if a user needs to adjust settings across multiple categories simultaneously. Defaulting to the `Audio` tab or passing the target tab to `open(tab)` minimizes this overhead.
