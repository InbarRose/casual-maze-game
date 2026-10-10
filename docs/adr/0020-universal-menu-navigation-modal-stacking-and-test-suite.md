# 0020. Universal Menu Navigation, Modal Stacking Isolation, and Comprehensive Menu Test Suite

Date: 2026-10-10

## Status
Accepted

## Context
During interactive playtesting and navigation audits, several critical UI button and modal failures were discovered across the game menus:
1. **Unclickable / Invisible Modal Backdrops**:
   In `css/main.css`, the `.modal-backdrop` rule defines `opacity: 0; pointer-events: none; transition: opacity 0.22s ease;`, while `.modal-backdrop.active` sets `opacity: 1; pointer-events: auto;`. However, `SettingsModal`, `ProfileModal`, and `FeedbackModal` were previously toggling `this.modalEl.style.display = 'flex'`, but never adding or removing the `.active` class! Because of this, the modal backdrop remained at `opacity: 0; pointer-events: none;` — rendering the dialog completely invisible, transparent, or unclickable to the player.
2. **Editor Modal ID Collision**:
   `editor.html` hardcoded `<div class="modal-backdrop" id="settings-modal">` for its internal Level Properties modal. When `getSettingsModal()` ran in `initAppHeader()`, it checked `document.getElementById('settings-modal')` and bound global Game Settings event listeners onto the editor's Labyrinth Properties dialog instead of creating and displaying the real game settings modal.
3. **Modal Stacking & Z-Index Inversion**:
   In `maze.html`, the in-game pause drawer (`#game-pause-modal`) shares the `.modal-backdrop` class (`z-index: 1000`). When `#btn-pause-settings` or `#btn-pause-profile` was triggered from the pause menu, the global settings or profile modals could end up behind the pause dialog depending on DOM insertion order.
4. **Missing Direct Triggers on Home Hub**:
   On `index.html`, while the universal top navigation bar had a gear button, there was no prominent hero settings action alongside "Play Campaign", "Browse Chapters", and "Level Architect", creating user friction when seeking configuration options from the home landing view.
5. **Absence of Dedicated Menu & Action Button Test Suite**:
   Prior test suites tested underlying storage and engine loop pauses, but lacked end-to-end unit verification for all header buttons, hero buttons, pause drawer buttons, settings tab panels, and profile codename event dispatches.

## Decision
1. **Strict Modal `.active` Class Lifecycle (BL-111)**:
   - Updated `SettingsModal.prototype.open()` and `close()`: explicitly toggle `this.modalEl.classList.add('active')` and `document.body.classList.add('modal-open')` upon open, and remove both upon close.
   - Updated `ProfileModal.prototype.open()` and `close()`: explicitly toggle `.active` and `.modal-open` in matching fashion.
   - Updated `FeedbackModal.prototype.open()` and `close()`: toggle `.active` consistently with `GuideModal`.
2. **Editor Modal Namespace Isolation**:
   - Renamed the editor's Level Properties modal from `#settings-modal` to `#properties-modal` in `editor.html` and `js/editor/editor-ui.js`.
   - Renamed `#btn-settings` to `#btn-properties`, `#settings-btn-close` to `#properties-btn-close`, and `#settings-btn-save` to `#properties-btn-save`.
   - Added backward-compatible fallback in `initSettingsModal()` so legacy scripts targeting either ID resolve smoothly.
3. **Modal Stacking Z-Index Elevation**:
   - Added explicit CSS stacking rule in `css/main.css`:
     ```css
     #settings-modal,
     #profile-modal,
     #feedback-modal,
     #guide-modal {
       z-index: 1100;
     }
     ```
     This guarantees that global modal dialogues always render cleanly above in-game pause and level victory backdrops (`z-index: 1000`).
4. **Home Page Hero Settings Action**:
   - Added `#btn-hero-settings` to the hero action buttons strip on `index.html`.
   - Imported `getSettingsModal` in `index.html` module script and bound click event with tactile audio feedback (`audioFX.playClick()`).
5. **Comprehensive Menus & Settings Automated Test Suite**:
   - Created `tests/unit/ui/menus-and-buttons.test.mjs` covering:
     - Header action buttons (`#btn-app-profile`, `#btn-app-settings`, `#btn-app-guide`, `#btn-app-feedback`) and `.active` class lifecycle.
     - Home page hero settings button click dispatch.
     - In-game pause menu action buttons (`#btn-pause-settings`, `#btn-pause-profile`, `#btn-pause-resume`, `#btn-pause-restart`, `#btn-pause-quit`, `#btn-pause-sound`, `#btn-pause-hotkeys`).
     - Settings modal categorized tab navigation across all 5 panels (`audio`, `display`, `controls`, `save`, `diagnostics`).
     - Profile modal explorer codename updates and live `player-profile:updated` event synchronization.
     - Editor properties modal isolation from global settings modal ID.
   - Registered the suite in `tests/run-all.mjs`.

## Consequences

### Positive
- **100% Interactive Modals**: Settings, Player Profile, Feedback, and Guide modals open smoothly with full opacity and interactive pointer events across all pages and viewports.
- **Clean In-Game Stacking**: When opened from inside the active pause drawer, settings and profile modals float cleanly in front of the pause menu.
- **Architect Studio Disambiguation**: The Level Architect properties dialog no longer collides with or hijacks global Game Settings.
- **Robust Automated Verification**: All buttons and menus are protected by automated tests in CI (`npm test`).

### Negative / Trade-offs
- Setting higher `z-index: 1100` requires future global modals to adhere to the established layering hierarchy (Game Overlays: 1000, Global Modals: 1100, Toast Notifications: 1200+).
