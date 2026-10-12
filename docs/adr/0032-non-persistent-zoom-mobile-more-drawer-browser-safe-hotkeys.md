# ADR-0032: Non-Persistent Viewport Zoom, Mobile Virtual Controls More Drawer & Browser-Safe Hotkeys

## Status
Accepted

## Context
Following user and player ergonomic feedback:
> *"the zoom should be reset to the default for each page each time it loads, not persist. game levels, game menu, architect, etc. zoom should be on the menu as well. control menu fo rmobile screens should have just the 4 directoins and use button visible and then "more" button to open rotate and view and other buttons and toggles that a mobile player can not access due to no keyboard. for non mobile users, not everything needs a hotkey, only the most used things. and everything should always have a game button to do for it. do not take hotkeys that are normally belong to the browser, like r and [] and such. minimal friction."*

Prior to this decision:
1. **Persistent Viewport Zoom**: Zoom levels persisted across reloads and levels in `localStorage` (`viewport_zoom`), causing unexpected scales (e.g. 200% or 50%) when opening new levels or returning to the game.
2. **Missing In-Menu Zoom**: Viewport zoom could only be adjusted through top bar controls; players inside the Pause Menu had no way to inspect or adjust zoom directly.
3. **Cluttered Mobile D-Pad vs Missing Mobile Functionality**: The mobile virtual D-pad displayed corner camera rotation buttons (`↺`, `↻`) occupying prime real estate, while mobile players without keyboards lacked convenient access to other controls (minimap, feed, zoom, touch mode toggle, lore journal, minimal view).
4. **Browser Hotkey Conflicts**: Keys such as <kbd>R</kbd> (Browser Reload) and <kbd>[</kbd> / <kbd>]</kbd> (Browser History/Zoom) were bound to camera rotation, intercepting browser functionality and causing severe UX friction.

## Decisions

### 1. Viewport Zoom Resets to 1.0x Default & Is Non-Persistent
- Viewport zoom initializes strictly to default `1.0` ($100\%$) upon every page load across `maze.html`, `editor.html`, `test.html`, and `index.html`.
- Removed persistent storage writes to `localStorage` for `viewport_zoom`.
- Starting or restarting a level (`restartLevel()`) resets zoom back to default `1.0`.
- Legacy `viewport_zoom` stored in `localStorage` is automatically pruned in `StorageManager.loadSettings()`.

### 2. Viewport Zoom Controls in Pause Menu
- Added a dedicated `#pause-zoom-row` widget inside the View & Exploration section of `#game-pause-modal`:
  - Zoom Out (`#btn-pause-zoom-out`, `−`)
  - Zoom Reset & Percentage Badge (`#btn-pause-zoom-reset`, `100%`)
  - Zoom In (`#btn-pause-zoom-in`, `+`)
- Wired to `GameLoop.zoomOut()`, `GameLoop.resetZoom()`, and `GameLoop.zoomIn()`, updating the percentage label dynamically.

### 3. Mobile Virtual Controls: 4 Directions + USE + "More" Drawer
- Simplified the primary visible mobile D-pad to display **only the 4 cardinal directions** (▲, ▼, ◀, ▶), the center **USE** button (`#vbtn-act`), and a dedicated **More** button (`#vbtn-more`, `⋮ More`).
- Added `#mobile-more-drawer` action sheet providing complete mobile feature parity:
  - Camera Rotation (`#vbtn-rot-l`: `↺ Left 90°`, `#vbtn-rot-r`: `↻ Right 90°`)
  - Viewport Zoom (`#mbtn-zoom-out`, `#mbtn-zoom-reset`, `#mbtn-zoom-in`)
  - View & Overlay toggles (`#mbtn-minimap`, `#mbtn-feed`, `#mbtn-touch-mode`, `#mbtn-minimal-view`, `#mbtn-journal`, `#mbtn-pause`)
- Dismissable via `✕` button, outside tap, or re-tapping `⋮ More`.

### 4. Browser-Safe Hotkeys & Universal Button Coverage
- **Pruned Browser Conflicts**:
  - Removed `KeyR`, `r`, `R`, `BracketRight`, `]` from `KEY_CODES.ROTATE_RIGHT`.
  - Removed `BracketLeft`, `[` from `KEY_CODES.ROTATE_LEFT`.
  - Preserves standard browser functionality (e.g. reload via <kbd>R</kbd> or <kbd>Ctrl+R</kbd>).
- **Core-Only Keyboard Hotkeys**:
  - Movement: WASD / Arrows
  - Action / Inspect: E / Space / Enter
  - Pause: Escape / P
- **100% On-Screen Button Coverage**: Every action has an accessible on-screen button across the firm top bar dropdowns, pause menu, and mobile more drawer. Zero features gated behind keyboard hotkeys.

## Consequences

### Positive
- **Predictable Camera Scale**: Players and level designers always start at the intended 1.0x baseline zoom without unexpected zoom inheritance from previous levels.
- **Clean Ergonomic Mobile D-Pad**: The primary virtual pad is uncluttered and focused purely on navigation and interaction.
- **Complete Mobile Feature Parity**: Mobile touch players have 1-tap access to all game toggles without needing a keyboard.
- **Zero Browser Friction**: Browser reload and navigation shortcuts remain completely unhindered.
- **Full Backward Compatibility**: All button IDs and test contracts remain intact.

### Compliance
- **Static GitHub Pages Architecture**: Pure vanilla HTML5, CSS3, and ES6 browser modules. Zero server runtimes.
- **Component Quality Scores**: Directly advances CMP-04 (Controls & Input), CMP-06 (In-Game HUD), CMP-07 (Pause Menu), and CMP-13 (Virtual Mobile Controls).
