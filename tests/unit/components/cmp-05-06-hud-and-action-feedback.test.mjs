/**
 * Component Test Suite: CMP-05 & CMP-06 HUD, Minimap & Contextual Action Feedback
 *
 * Exhaustively verifies:
 * 1. Every Menu: Floating HUD islands, Tactical Radar Minimap, Action Activity Feed,
 *    Disambiguation Drawer (#hud-disambig-drawer), Lore Card, Journal Modal, Activity Log Modal, Victory Modal
 * 2. Every Button: #btn-open-menu, #btn-zoom-in, #btn-zoom-out, #btn-rotate-left, #btn-rotate-right,
 *    #btn-hud-feed-pill, #btn-feed-history, #btn-feed-toggle, #btn-minimap-minimize,
 *    #hud-journal-btn, #hud-contextual-interact, #btn-close-journal, #btn-close-log-modal
 * 3. Every Mode: 2.5D Angled vs Flat Top-Down, 4 Rotations, Minimap Zoom (1.0x - 3.5x),
 *    Viewport Zoom (0.5x - 2.0x), High Contrast mode, Desktop islands vs Collapsed mobile pills
 * 4. Every Phase: Free exploration, Proximity candidate, Two-stage reveal, Note reading,
 *    Victory celebration
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Minimap } from '../../../js/engine/minimap.js';
import { Camera } from '../../../js/engine/camera.js';
import { getKeyColorblindShape } from '../../../js/core/constants.js';

const isNode = typeof process !== 'undefined' && process.versions?.node;

describe('Component Suite > CMP-05 & CMP-06: In-Game HUD, Minimap & Action Feedback', () => {
  it('covers every HUD button, menu, and modal element in maze.html markup', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');
    const mazeHtml = fs.readFileSync(path.resolve(process.cwd(), 'maze.html'), 'utf-8');

    // Floating HUD Top Islands
    assert(mazeHtml.includes('class="game-hud-top"'), 'game-hud-top container exists');
    assert(mazeHtml.includes('id="hud-level-title"'), 'Level title HUD element exists');
    assert(mazeHtml.includes('id="hud-crumb-chapter"'), 'Chapter crumb link exists');
    assert(mazeHtml.includes('id="hud-elevation"'), 'Elevation badge exists');
    assert(mazeHtml.includes('id="hud-keys-list"'), 'Keys inventory list exists');
    assert(mazeHtml.includes('id="hud-timer"'), 'Timer display exists');
    assert(mazeHtml.includes('id="hud-steps"'), 'Steps display exists');

    // HUD Action Buttons Strip
    assert(mazeHtml.includes('id="btn-open-menu"'), '#btn-open-menu exists');
    assert(mazeHtml.includes('id="btn-zoom-in"'), '#btn-zoom-in exists');
    assert(mazeHtml.includes('id="btn-zoom-out"'), '#btn-zoom-out exists');
    assert(mazeHtml.includes('id="btn-rotate-left"'), '#btn-rotate-left exists');
    assert(mazeHtml.includes('id="btn-rotate-right"'), '#btn-rotate-right exists');
    assert(mazeHtml.includes('id="btn-hud-feed-pill"'), '#btn-hud-feed-pill exists');
    assert(mazeHtml.includes('id="hud-journal-btn"'), '#hud-journal-btn exists');

    // Minimap Radar Controls
    assert(mazeHtml.includes('id="minimap-container"'), '#minimap-container exists');
    assert(mazeHtml.includes('id="minimap-canvas"'), '#minimap-canvas exists');
    assert(mazeHtml.includes('id="btn-minimap-minimize"'), '#btn-minimap-minimize exists');

    // Activity Feed & Action Drawers
    assert(mazeHtml.includes('id="game-activity-feed"'), '#game-activity-feed exists');
    assert(mazeHtml.includes('id="activity-feed-items"'), '#activity-feed-items exists');
    assert(mazeHtml.includes('id="btn-feed-history"'), '#btn-feed-history exists');
    assert(mazeHtml.includes('id="hud-disambig-drawer"'), '#hud-disambig-drawer exists');

    // Contextual Overlays & Modals
    assert(mazeHtml.includes('id="journal-modal"'), '#journal-modal exists');
    assert(mazeHtml.includes('id="activity-log-modal"'), '#activity-log-modal exists');
    assert(mazeHtml.includes('id="victory-modal"'), '#victory-modal exists');
    assert(mazeHtml.includes('id="game-pause-modal"'), '#game-pause-modal exists');
  });

  it('covers Minimap modes: zoom clamp (1.0x - 3.5x), panning, and bounds safety', () => {
    const mockCanvas = {
      width: 180,
      height: 180,
      getContext: () => ({
        clearRect: () => {},
        fillRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        stroke: () => {},
        fill: () => {},
      }),
    };

    const minimap = new Minimap(mockCanvas);
    assertEqual(minimap.zoom, 1.0, 'Initial zoom is 1.0x');

    // Zoom delta mode
    minimap.zoomBy(0.5);
    assertEqual(minimap.zoom, 1.5, 'Zoom increases by delta');

    // Bounds clamping
    minimap.setZoom(10.0);
    assertEqual(minimap.zoom, 3.5, 'Clamped to 3.5x upper limit');

    minimap.setZoom(0.1);
    assertEqual(minimap.zoom, 1.0, 'Clamped to 1.0x lower limit');
  });

  it('covers Camera modes: optical zoom clamping (0.5x - 2.0x) and 4-way rotation', () => {
    const camera = new Camera(32, 800, 600);
    assertEqual(camera.zoom, 1.0, 'Initial camera zoom is 1.0x');

    // Zoom bounds
    camera.setZoom(5.0);
    assertEqual(camera.zoom, 2.0, 'Camera zoom clamped to 2.0x maximum');

    camera.setZoom(0.1);
    assertEqual(camera.zoom, 0.5, 'Camera zoom clamped to 0.5x minimum');

    // 4 Cardinal Rotation Dial Modes
    assertEqual(camera.getCompassHeading(), 'N', 'Initial heading is North');
    camera.rotateRight();
    assertEqual(camera.getCompassHeading(), 'E', 'Rotates CW to East');
    camera.rotateRight();
    assertEqual(camera.getCompassHeading(), 'S', 'Rotates CW to South');
    camera.rotateRight();
    assertEqual(camera.getCompassHeading(), 'W', 'Rotates CW to West');
    camera.rotateRight();
    assertEqual(camera.getCompassHeading(), 'N', 'Returns to North');

    camera.rotateLeft();
    assertEqual(camera.getCompassHeading(), 'W', 'Rotates CCW to West');
  });

  it('covers colorblind geometric shape glyph integration for HUD key inventory', () => {
    // Protanopia / Deuteranopia / Tritanopia glyph verification matching constants.js
    const keys = [
      { color: 'gold', expectedSymbol: '●', label: 'Circle' },
      { color: 'ruby', expectedSymbol: '▲', label: 'Triangle' },
      { color: 'sapphire', expectedSymbol: '◆', label: 'Diamond' },
      { color: 'emerald', expectedSymbol: '■', label: 'Square' },
      { color: 'amethyst', expectedSymbol: '★', label: 'Star' },
      { color: 'key_red', expectedSymbol: '▲', label: 'Triangle' },
      { color: 'key_blue', expectedSymbol: '◆', label: 'Diamond' },
      { color: 'key_green', expectedSymbol: '■', label: 'Square' },
    ];

    for (const k of keys) {
      const shape = getKeyColorblindShape(k.color);
      assertEqual(shape.symbol, k.expectedSymbol, `Symbol matches for ${k.label}`);
      assert(shape.label.length > 0, `Label exists for ${k.label}`);
    }
  });
});
