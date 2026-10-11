# ADR-0027: Universal Settings and Player Profile Accessibility, Stacked Modal Resilience, and Continuous Version Incrementing

## Status
Accepted

## Date
2026-10-11

## Context & Problem Statement
Users reported being unable to open or access the Game Settings menu and Player Profile modal across multiple entry points (`BL-115`).
Investigation uncovered several root causes across the rendering pipeline, modal lifecycle, and navigation architecture:

1. **Player Profile Canvas Preview Crash**:
   In `js/ui/profile-modal.js`, the avatar preview rendering called `previewPlayer.drawExplorerSprite(actx, 40, 44, 48, 0)`. The `Player` entity only implemented `renderAngledExplorer(...)` and lacked `drawExplorerSprite(...)`. This threw a runtime `TypeError` inside `ProfileModal.refresh()`, halting execution before `this.modalEl.style.display = 'flex'` or `.classList.add('active')` was executed. The modal failed silently on every click.
2. **Missing Direct In-Game HUD Triggers in `maze.html`**:
   While `index.html`, `editor.html`, and `test.html` displayed the global app header or dedicated triggers, active gameplay (`maze.html`) had no direct Settings or Profile buttons on the primary HUD. Players had to navigate through the pause drawer.
3. **Stacked Modal Body Scroll Lock Conflicts**:
   When opening Settings or Profile from within the in-game pause drawer, closing the nested modal invoked `document.body.classList.remove('modal-open')` indiscriminately, stripping the scroll lock and blur state even though the parent pause backdrop was still active underneath.
4. **Keydown Escape Conflicts in Active Game**:
   The `isOtherModalOpen()` predicate in `maze.html` omitted checks for `#settings-modal` and `#profile-modal`, causing <kbd>Esc</kbd> to toggle the pause menu underneath when dismissing settings or profile.
5. **Architect Studio Direct Toolbar Access**:
   `editor.html` featured a `#btn-properties` button for labyrinth dimensions and rules, but lacked direct toolbar buttons for global Game Settings and Player Profile.
6. **Continuous Version Incrementing Mandate**:
   To ensure strict traceability between commits, deployments, and client caches, every batch of changes must increment the engine semantic version.

## Decision Drivers
- **Zero-Crash Modal Guarantees**: Profile and settings modals must never fail to open due to sub-component canvas or context errors.
- **Universal Multi-Surface Access**: Players must be able to access settings and their player profile from any screen at any time: Hub, In-Game HUD, In-Game Pause Drawer, Architect Studio Toolbar, and Replay Lab.
- **Clean Modal Stacking**: Closing a child modal must respect whether parent backdrops remain active.
- **Traceability**: Continuous semantic version bumps (`package.json`, `version.js`, HUD badges).

## Considered Alternatives
1. *Keep modal access restricted to the Pause Drawer in `maze.html`*:
   - Rejected: Forces unnecessary friction and obscuration when players just want to adjust audio or check their profile.
2. *Rely strictly on the global `.app-nav-header` on every page*:
   - In `maze.html`, the HUD needs to remain an immersive, minimalist floating island interface rather than having a full top banner consuming vertical height. Direct HUD icon buttons provide superior ergonomics.

## Decision
1. **Compatibility Alias & Resilient Preview Rendering**:
   - Added `drawExplorerSprite(ctx, screenX, screenY, tileSize, rotationAngle)` to `Player` (`js/entities/player.js`), delegating to `renderAngledExplorer`.
   - Wrapped avatar canvas rendering in `ProfileModal.refresh()` within a `try...catch` block.
   - Guarded `open()` in both `ProfileModal` and `SettingsModal` with error boundaries so DOM display and active class activation always complete.
2. **In-Game HUD Direct Access & Hotkeys**:
   - Added `#hud-btn-settings` (`⚙️ Settings`) and `#hud-btn-profile` (`🧭 Profile`) directly onto the right HUD island in `maze.html`.
   - Bound keyboard shortcuts: <kbd>O</kbd> for Settings and <kbd>U</kbd> for Player Profile.
   - Updated `isOtherModalOpen()` in `maze.html` to recognize active settings and profile modals, preventing unwanted pause toggling on <kbd>Esc</kbd>.
3. **Architect Studio Toolbar Triggers**:
   - Added `#btn-editor-settings` and `#btn-editor-profile` to `.editor-header` toolbar in `editor.html`.
4. **Modal Stacking & Body Scroll Lock**:
   - Updated `close()` in `SettingsModal` and `ProfileModal` to check `document.querySelector('.modal-backdrop.active')` before removing `modal-open` from `document.body`.
5. **Version Bump to `v1.20.0`**:
   - Incremented version to `1.20.0` across `package.json`, `js/core/version.js`, `test.html`, and documentation.
6. **Automated Verification**:
   - Added unit tests in `tests/unit/ui/menus-and-buttons.test.mjs` verifying `drawExplorerSprite` and stacked modal lifecycle.
   - Added headless browser E2E test in `tests/e2e/headless-hub-and-gameplay.test.mjs` verifying Settings and Profile modals open cleanly across Hub, HUD, Pause Drawer, and Architect Studio.

## Consequences
### Positive
- Players can now access settings and their player profile from every single source across the game.
- The `TypeError` crash is permanently resolved with dual safeguards.
- Stacked modal interactions are smooth and clean.
- CI automatically validates real browser modal interactions on every PR.

### Negative / Trade-offs
- Added two compact buttons to the right HUD island; managed via responsive typography (`.hide-mobile`) to prevent layout clipping on small viewports.
