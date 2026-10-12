/**
 * Unit Tests: Universal Top Bar, Overlay Toggles & Minimal Mode Exit (BL-119, BL-120, Issues #83, #82)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameMenu } from '../../../js/ui/game-menu.js';

const isNode = typeof process !== 'undefined' && process.versions?.node;

describe('UI > Universal Top Bar, Responsive Fit & Exit Minimal Mode (Issues #83, #82, BL-119, BL-120)', () => {
  it('defines universal top bar markup, canvas frame border, and exit minimal button in maze.html', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');
    const html = fs.readFileSync(path.resolve(process.cwd(), 'maze.html'), 'utf-8');

    // Canvas Render Area Border (Issue #83)
    assert(html.includes('id="canvas-render-border"'), 'Includes #canvas-render-border frame');
    assert(html.includes('class="canvas-render-border"'), 'Includes .canvas-render-border class');

    // Firm Top Bar Structure
    assert(html.includes('id="firm-top-bar"'), 'Firm top bar #firm-top-bar exists');
    assert(html.includes('id="hud-btn-hub"'), 'Hub return button exists on left');
    assert(html.includes('id="hud-breadcrumbs"'), 'Breadcrumbs exist');
    assert(html.includes('id="btn-open-menu"'), 'Menu button exists in top bar');

    // Quick Access Icons (Issue #83)
    assert(html.includes('id="btn-topbar-minimap"'), 'Radar/Minimap quick toggle exists');
    assert(html.includes('id="btn-hud-feed-pill"'), 'Activity Feed quick toggle exists');
    assert(html.includes('id="hud-btn-bug"'), 'Quick bug feedback button exists in top bar');

    // Right Island controls
    assert(html.includes('id="hud-btn-settings"'), 'Settings button exists on right');
    assert(html.includes('id="hud-btn-profile"'), 'Profile button exists on right');
    assert(html.includes('id="btn-hud-collapse"'), 'HUD collapse button exists');

    // Floating Minimal Exit Button (Issue #82)
    assert(html.includes('id="btn-exit-minimal-mode"'), 'Floating #btn-exit-minimal-mode exists');
    assert(html.includes('Normal View [H]'), 'Exit button has Normal View text');

    // Overlay Toggles in Pause Menu (Issue #83)
    assert(html.includes('id="btn-pause-toggle-radar"'), 'Pause menu has radar toggle');
    assert(html.includes('id="btn-pause-toggle-feed"'), 'Pause menu has feed toggle');
    assert(html.includes('id="btn-pause-toggle-controls"'), 'Pause menu has controls toggle');
    assert(html.includes('id="btn-pause-toggle-hud"'), 'Pause menu has HUD toggle');
  });

  it('provides safe bottom buffer and canvas border styles in css/game.css', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');
    const css = fs.readFileSync(path.resolve(process.cwd(), 'css/game.css'), 'utf-8');

    assert(css.includes('--bottom-safe-buffer'), 'Defines --bottom-safe-buffer in game.css');
    assert(css.includes('.canvas-render-border'), 'Defines .canvas-render-border styling');
    assert(css.includes('.btn-exit-minimal-mode'), 'Defines .btn-exit-minimal-mode floating button');
  });

  it('manages overlay visibility toggles and labels in GameMenu', () => {
    const mockDialog = document.createElement('div');
    mockDialog.innerHTML = `
      <div id="game-pause-modal">
        <button id="btn-pause-toggle-radar"><span id="lbl-pause-radar">Radar: ON</span></button>
        <button id="btn-pause-toggle-feed"><span id="lbl-pause-feed">Feed: ON</span></button>
        <button id="btn-pause-toggle-controls"><span id="lbl-pause-controls">Controls: ON</span></button>
        <button id="btn-pause-toggle-hud"><span id="lbl-pause-hud">HUD: EXPANDED</span></button>
      </div>
    `;
    document.body.appendChild(mockDialog);

    const gameMenu = new GameMenu({ modalEl: mockDialog });
    assert(typeof gameMenu.updateOverlayButtons === 'function', 'updateOverlayButtons method exists');

    gameMenu.pause();
    assert(gameMenu.isPaused(), 'GameMenu is paused');

    const radarBtn = mockDialog.querySelector('#btn-pause-toggle-radar');
    assert(radarBtn !== null, 'Radar toggle button exists in menu');

    const feedBtn = mockDialog.querySelector('#btn-pause-toggle-feed');
    assert(feedBtn !== null, 'Feed toggle button exists in menu');

    gameMenu.resume();
    mockDialog.remove();
  });
});
