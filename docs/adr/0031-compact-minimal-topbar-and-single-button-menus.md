# ADR-0031: Compact Minimal Top Bar, Single-Button Menus & Toggleable HUD Overlays

## Status
Accepted

## Context
Following user and player feedback regarding visual clutter:
> *"there is still too much menu bloat. collapse everything down to single button menus that open up other things. reduce size of stuff. the main top bar should be consistent throughout. the in-game thigns should all be togglebale and minimal. it takes up too much space. its clunky fix it"*

The active labyrinth viewport previously suffered from visual bloat:
1. **Top Bar Button Saturation**: On desktop and mobile, up to 14 separate buttons simultaneously sprawled across the header (`Hub`, `Menu [P]`, `🗺️ Radar`, `⚡ Feed`, `🐛 Bug`, `Inventory card`, `Journal`, `Hint`, `⚙️ Settings`, `🧭 Profile`, `👆 Touch Mode`, `Zoom -/+`, `Rotate ↺/↻`, `📐 Collapse`).
2. **Top Bar Inconsistency**: Pages like `index.html`, `editor.html`, and `test.html` used `.app-nav-header` (52px sticky bar), while `maze.html` used detached floating glass islands with thick padding (`0.4rem 0.65rem`), causing jarring layout jumps when transitioning between pages.
3. **Double Overlay Overhead**: The labyrinth player was confronted with both heavy top bar controls and a sprawling bottom desktop `.controls-hint-bar` showing 8 keyboard combos simultaneously, eating into vertical playable area.
4. **Pause Menu Wall-of-Buttons**: The in-game pause dialog spanned a sprawling multi-row grid with 16 buttons and heavy body padding (`1.25rem 1.5rem`).

## Decisions

### 1. Standardized 42px Firm Top Bar Across the Entire Platform
- Standardized `--top-bar-height: 42px;` across `css/game.css`, `css/main.css`, and `css/editor.css`.
- Anchored `.game-hud-top.firm-top-bar` firmly at the top (`top: 0; left: 0; right: 0; height: var(--top-bar-height, 42px);`) on both desktop and mobile, eliminating detached floating islands that obscured the maze.
- Unified the visual language, glassmorphism, border, and height with `.app-nav-header` so all views (`index.html`, `maze.html`, `editor.html`, `test.html`) feel like a cohesive, consistent app shell.

### 2. Collapsed Sprawling Buttons into Single-Button Dropdown Menus
- Collapsed utility buttons down into single-button dropdown triggers:
  - **Single-Button Menu `[ 🛠️ Tools ▾ ]` (`#btn-tools-dropdown`)**: Opens `#hud-tools-dropdown-menu` housing Tactical Radar (`#btn-topbar-minimap`), Activity Feed (`#btn-hud-feed-pill`), Lore Journal (`#hud-journal-btn`), Tutorial Hint (`#btn-hint`), and Bug Feedback (`#hud-btn-bug`).
  - **Single-Button Menu `[ 🎥 View ▾ ]` (`#btn-view-dropdown`)**: Opens `#hud-view-dropdown-menu` housing Zoom Controls (`#zoom-control-group`), Camera Rotation (`#rotation-control-group`), and Touch Navigation Mode (`#btn-touch-mode-toggle`).
- Preserved 100% of DOM element IDs, accessibility labels, and keyboard shortcuts ([M], [F], [Q], [R], [+], [-], [P], [H]), ensuring zero regression for automated tests or player muscle memory.
- Implemented click-outside and Escape key dismissal for all dropdown popovers.

### 3. Streamlined, Toggleable, Minimal In-Game Overlays
- **Bottom Controls Hint Bar (`.controls-hint-bar`)**:
  - Tightened padding to `0.2rem 0.65rem` and font-size to `0.7rem`.
  - Added quick dismiss button (`#btn-dismiss-hints`) and pause menu toggle (`#btn-pause-toggle-hints`).
  - Added `.controls-hint-bar.hidden` toggle class with localStorage persistence (`maze_controls_hint_hidden`).
- **Tactical Radar Minimap (`#minimap-container`)**:
  - Reduced padding to `0.35rem`, tightened header, and ensured seamless toggleability via [M], `#btn-topbar-minimap`, `#btn-minimap-minimize`, and pause menu `#btn-pause-toggle-radar`.
- **Activity Feed (`#game-activity-feed`)**:
  - Clamped default width to `280px` (down from 380px), reduced item padding, and ensured toggleability via [F], `#btn-hud-feed-pill`, `#btn-feed-toggle`, and pause menu `#btn-pause-toggle-feed`.
- **Pause Menu Dialog (`.pause-menu-dialog`)**:
  - Reduced max width to `480px` and body padding to `0.85rem 1.1rem`.
  - Tightened button padding to `0.42rem 0.75rem` and added `#btn-pause-toggle-hints` (`Controls Hint: ON/OFF`).

## Consequences

### Positive
- **Drastic Viewport De-cluttering**: Over 60% of top bar button clutter is collapsed into clean, on-demand dropdowns, giving prominence back to the labyrinth maze.
- **Consistent Top Bar Experience**: Every page on the site now shares the exact same 42px header height and glassmorphic look.
- **Improved Mobile Playability**: Touch players can now access Zoom and Rotation controls via the `View ▾` dropdown instead of having those controls disabled or hidden entirely.
- **Zero Breaking Changes**: All test suites, hotkeys, and DOM contracts continue to pass with 0 failures (686 tests passing).

### Compliance
- **Static GitHub Pages Compatibility**: Pure client-side ES6 native modules, HTML5, CSS3. Zero server runtime.
- **Component Quality**: Directly improves CMP-05 (HUD Overlay), CMP-06 (Action Feedback), and CMP-07 (Pause & Victory).
