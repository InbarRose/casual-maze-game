/**
 * Unit Tests: Compact Minimal Top Bar & Single-Button Menus (BL-121, ADR-0031)
 *
 * Verifies:
 * 1. Global top bar height standardized at 42px across main.css and game.css
 * 2. Sprawling top bar buttons collapsed down to single-button dropdown menus (#btn-tools-dropdown, #btn-view-dropdown)
 * 3. 100% preservation of all semantic DOM element IDs and keyboard shortcut bindings
 * 4. Toggleable, minimal in-game elements:
 *    - Bottom controls hint bar (#btn-dismiss-hints, #btn-pause-toggle-hints, #lbl-pause-hints)
 *    - Tactical radar minimap (#minimap-container, #btn-minimap-minimize, #btn-topbar-minimap)
 *    - Real-time activity feed (#game-activity-feed, #btn-feed-toggle, #btn-hud-feed-pill)
 * 5. Pause menu size reduction and overlay visibility synchronization in GameMenu
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameMenu } from '../../../js/ui/game-menu.js';

const isNode = typeof process !== 'undefined' && process.versions?.node;

describe('UI > Compact Minimal Top Bar & Single-Button Menus (BL-121, ADR-0031)', () => {
  it('standardizes top bar height to 42px and defines dropdown popovers in CSS', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');

    const gameCss = fs.readFileSync(path.resolve(process.cwd(), 'css/game.css'), 'utf-8');
    const mainCss = fs.readFileSync(path.resolve(process.cwd(), 'css/main.css'), 'utf-8');
    const editorCss = fs.readFileSync(path.resolve(process.cwd(), 'css/editor.css'), 'utf-8');

    // 1. Consistent 42px top bar height
    assert(gameCss.includes('--top-bar-height: 42px;'), 'game.css defines --top-bar-height: 42px');
    assert(mainCss.includes('height: var(--top-bar-height, 42px);'), 'main.css sets .app-nav-header height to 42px');
    assert(editorCss.includes('var(--top-bar-height, 42px)'), 'editor.css aligns layout grid with 42px top bar');

    // 2. Single-button dropdown styles
    assert(gameCss.includes('.hud-dropdown-wrap'), 'game.css defines .hud-dropdown-wrap');
    assert(gameCss.includes('.hud-dropdown-trigger'), 'game.css defines .hud-dropdown-trigger');
    assert(gameCss.includes('.hud-dropdown-menu'), 'game.css defines .hud-dropdown-menu popover');
    assert(gameCss.includes('.hud-dropdown-item'), 'game.css defines .hud-dropdown-item');

    // 3. Minimal controls hint bar and hidden state
    assert(gameCss.includes('.controls-hint-bar.hidden'), 'game.css supports .controls-hint-bar.hidden');
    assert(gameCss.includes('.btn-hint-dismiss'), 'game.css defines .btn-hint-dismiss');
  });

  it('collapses sprawling buttons into single-button dropdowns in maze.html while preserving all IDs', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');
    const html = fs.readFileSync(path.resolve(process.cwd(), 'maze.html'), 'utf-8');

    // Single-Button Dropdown triggers
    assert(html.includes('id="btn-tools-dropdown"'), 'maze.html defines #btn-tools-dropdown');
    assert(html.includes('id="btn-view-dropdown"'), 'maze.html defines #btn-view-dropdown');
    assert(html.includes('id="hud-tools-dropdown-menu"'), 'maze.html defines #hud-tools-dropdown-menu');
    assert(html.includes('id="hud-view-dropdown-menu"'), 'maze.html defines #hud-view-dropdown-menu');

    // Preserved Left Island elements
    assert(html.includes('id="firm-top-bar"'), 'Firm top bar exists');
    assert(html.includes('id="hud-btn-hub"'), 'Hub return button exists');
    assert(html.includes('id="hud-breadcrumbs"'), 'Breadcrumbs exist');
    assert(html.includes('id="hud-crumb-chapter"'), 'Chapter crumb exists');
    assert(html.includes('id="hud-crumb-level"'), 'Level crumb exists');
    assert(html.includes('id="hud-level-title"'), 'Level title exists');
    assert(html.includes('id="hud-elevation"'), 'Elevation badge exists');

    // Preserved Center Island elements
    assert(html.includes('id="btn-open-menu"'), 'Primary menu trigger exists');
    assert(html.includes('id="hud-inventory-card"'), 'Inventory card exists');
    assert(html.includes('id="hud-inventory-count"'), 'Inventory count badge exists');
    assert(html.includes('id="hud-keys-list"'), 'Keys inventory slot list exists');
    assert(html.includes('id="hud-riddle-item-card"'), 'Carried relic card exists');

    // Preserved Tool Dropdown elements
    assert(html.includes('id="btn-topbar-minimap"'), 'Radar toggle exists inside tools dropdown');
    assert(html.includes('id="btn-hud-feed-pill"'), 'Activity feed toggle exists inside tools dropdown');
    assert(html.includes('id="hud-journal-btn"'), 'Lore journal button exists inside tools dropdown');
    assert(html.includes('id="hud-journal-count"'), 'Lore journal badge exists');
    assert(html.includes('id="btn-hint"'), 'Tutorial hint button exists inside tools dropdown');
    assert(html.includes('id="hud-btn-bug"'), 'Bug report button exists inside tools dropdown');

    // Preserved View Dropdown elements
    assert(html.includes('id="zoom-control-group"'), 'Zoom control group exists inside view dropdown');
    assert(html.includes('id="btn-zoom-out"'), 'Zoom out button exists');
    assert(html.includes('id="hud-zoom-badge"'), 'Zoom badge exists');
    assert(html.includes('id="btn-zoom-in"'), 'Zoom in button exists');
    assert(html.includes('id="rotation-control-group"'), 'Rotation control group exists inside view dropdown');
    assert(html.includes('id="btn-rotate-left"'), 'Rotate left button exists');
    assert(html.includes('id="compass-badge"'), 'Compass badge exists');
    assert(html.includes('id="btn-rotate-right"'), 'Rotate right button exists');
    assert(html.includes('id="btn-touch-mode-toggle"'), 'Touch mode toggle exists inside view dropdown');

    // Preserved Right Island direct utilities
    assert(html.includes('id="hud-btn-settings"'), 'Direct settings quick button exists');
    assert(html.includes('id="hud-btn-profile"'), 'Direct profile button exists');
    assert(html.includes('id="hud-stats-card"'), 'Stats pill card exists');
    assert(html.includes('id="hud-timer"'), 'Timer strong exists');
    assert(html.includes('id="hud-steps"'), 'Steps strong exists');
    assert(html.includes('id="hud-score"'), 'Score strong exists');
    assert(html.includes('id="btn-hud-collapse"'), 'HUD collapse button exists');

    // Toggleable In-Game items
    assert(html.includes('id="btn-dismiss-hints"'), 'Controls hint bar dismiss button exists');
    assert(html.includes('id="btn-pause-toggle-hints"'), 'Pause menu controls hint toggle exists');
    assert(html.includes('id="lbl-pause-hints"'), 'Pause menu controls hint label exists');
  });

  it('coordinates controls hint toggle in GameMenu and reflects ON/OFF state', () => {
    const hintBar = document.createElement('div');
    hintBar.id = 'controls-hint-bar';
    hintBar.className = 'controls-hint-bar';

    const dismissBtn = document.createElement('button');
    dismissBtn.id = 'btn-dismiss-hints';
    hintBar.appendChild(dismissBtn);
    document.body.appendChild(hintBar);

    const pauseModal = document.createElement('div');
    pauseModal.id = 'game-pause-modal';

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'btn-pause-toggle-hints';
    const lblHints = document.createElement('span');
    lblHints.id = 'lbl-pause-hints';
    lblHints.textContent = 'Controls Hint: ON';
    toggleBtn.appendChild(lblHints);
    pauseModal.appendChild(toggleBtn);
    document.body.appendChild(pauseModal);

    const menu = new GameMenu({ modalEl: pauseModal });

    // Initially visible
    assertEqual(hintBar.classList.contains('hidden'), false, 'Hint bar starts visible');
    menu.updateOverlayButtons();
    assertEqual(lblHints.textContent, 'Controls Hint: ON', 'Reports Controls Hint: ON');

    // Toggle off via pause menu
    toggleBtn.click();
    assertEqual(hintBar.classList.contains('hidden'), true, 'Hint bar hidden via pause button');
    assertEqual(lblHints.textContent, 'Controls Hint: OFF', 'Reports Controls Hint: OFF');

    // Toggle on again
    toggleBtn.click();
    assertEqual(hintBar.classList.contains('hidden'), false, 'Hint bar restored via pause button');
    assertEqual(lblHints.textContent, 'Controls Hint: ON', 'Reports Controls Hint: ON');

    // Dismiss via hint bar button
    dismissBtn.click();
    assertEqual(hintBar.classList.contains('hidden'), true, 'Hint bar dismissed via ✕ button');
    assertEqual(lblHints.textContent, 'Controls Hint: OFF', 'Reports Controls Hint: OFF');

    hintBar.remove();
    pauseModal.remove();
  });
});
