/**
 * Unit Test Suite: GitHub Issues #89, #90, and #91 Verification
 *
 * Verifies regression prevention for:
 * 1. Issue #91: Settings modal toggle switch styles, dropdown typography, and Q/C rotation hotkeys.
 * 2. Issue #90: Architect Mode left sidebar flex-shrink rules and vertical drag scroll.
 * 3. Issue #89: Whispering Citadel room spawn separation, bridge chasm gating, and engine spawn loop guard.
 */

import fs from 'fs';
import path from 'path';
import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { getStoryline } from '../../../js/stories/storylines.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { LevelLoader } from '../../../js/levels/level-loader.js';

describe('Defect Regression > GitHub Issues #89, #90, and #91', () => {

  // --------------------------------------------------------------------------
  // Issue #91: Settings Modal Toggle Switch Styles & Dropdown Typography
  // --------------------------------------------------------------------------
  it('Issue #91: verifies toggle switch styles, knob thumb, and checked accent in css/main.css', () => {
    const cssPath = path.resolve('css/main.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    assert(cssContent.includes('.switch {'), 'Defines .switch container style');
    assert(cssContent.includes('.switch input {'), 'Hides default native checkbox in .switch input');
    assert(cssContent.includes('.switch .slider {'), 'Defines .switch .slider track style');
    assert(cssContent.includes('.switch .slider::before'), 'Defines .switch .slider::before sliding knob thumb');
    assert(cssContent.includes('.switch input:checked + .slider'), 'Defines .switch input:checked + .slider accent background');
    assert(cssContent.includes('transform: translateX('), 'Defines knob translateX animation on checked');
  });

  it('Issue #91: verifies .select-field uses clean inherited typography rather than wide mono font', () => {
    const cssPath = path.resolve('css/main.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const selectFieldBlock = cssContent.match(/\.input-field,\s*\.select-field\s*\{([^}]+)\}/);
    assert(selectFieldBlock !== null, 'Found .input-field, .select-field CSS rule');
    assert(selectFieldBlock[1].includes('font-family: inherit'), 'Uses font-family: inherit instead of wide monospaced font');
  });

  it('Issue #91: verifies settings modal and footer strip display Q/C camera rotation shortcuts', () => {
    const settingsPath = path.resolve('js/ui/settings-modal.js');
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    assert(settingsContent.includes('[Q/C]'), 'Settings modal mentions [Q/C] camera rotation');
    assert(settingsContent.includes('Allow Q/C (Rotate)'), 'Settings hotkey toggle mentions Q/C');
    assert(/Q<\/kbd>\s*\/\s*<kbd[^>]*>C<\/kbd>\s*:\s*Rotate Camera 90°/.test(settingsContent), 'Settings table displays Q/C');

    const headerPath = path.resolve('js/ui/app-header.js');
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    assert(headerContent.includes('<kbd>Q/C</kbd> Rotate 90°'), 'Footer shortcuts strip displays Q/C');
  });

  // --------------------------------------------------------------------------
  // Issue #90: Architect Mode Viewport Compression Prevention
  // --------------------------------------------------------------------------
  it('Issue #90: verifies editor sidebar has min-height 0 and flex-shrink 0 to prevent tool crushing', () => {
    const editorCssPath = path.resolve('css/editor.css');
    const editorCssContent = fs.readFileSync(editorCssPath, 'utf8');

    assert(editorCssContent.includes('.editor-sidebar {'), 'Defines .editor-sidebar rule');
    assert(editorCssContent.includes('min-height: 0;'), '.editor-sidebar has min-height: 0 to allow vertical flex overflow');
    assert(editorCssContent.includes('.editor-sidebar > * {') && editorCssContent.includes('flex-shrink: 0;'), '.editor-sidebar children have flex-shrink: 0');
  });

  it('Issue #90: verifies editor.html includes vertical drag scroll on aside.editor-sidebar', () => {
    const htmlPath = path.resolve('editor.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    assert(htmlContent.includes('<aside class="editor-sidebar" data-drag-scroll="y">'), 'editor.html sidebar has data-drag-scroll="y"');
  });

  // --------------------------------------------------------------------------
  // Issue #89: Whispering Citadel Spawn Loops & Spire Bridge Chasm
  // --------------------------------------------------------------------------
  it('Issue #89: verifies Whispering Citadel room spawns never collide with return exit tiles', () => {
    const story = getStoryline('the_whispering_citadel');
    assert(story !== null, 'Storyline found');
    const level = story.chapters[0];

    for (const [roomId, room] of Object.entries(level.rooms)) {
      for (const exit of room.exits || []) {
        if (!exit.targetRoom) continue;
        const targetRoom = level.rooms[exit.targetRoom];
        assert(targetRoom !== undefined, `Target room "${exit.targetRoom}" exists`);

        const spawn = exit.targetSpawn || targetRoom.spawn;
        assert(spawn !== undefined, `Exit ${exit.id} specifies targetSpawn or targetRoom has spawn`);

        // Check against all exits in target room
        for (const targetExit of targetRoom.exits || []) {
          const spawnElev = spawn.elevation ?? spawn.z ?? 0;
          const exitElev = targetExit.elevation ?? targetExit.z ?? 0;
          const isDirectCollision = spawn.x === targetExit.x && spawn.y === targetExit.y && spawnElev === exitElev;
          assert(!isDirectCollision, `Room transition from ${roomId} via ${exit.id} must not spawn player directly on ${targetExit.id} at (${spawn.x}, ${spawn.y}) in ${exit.targetRoom}`);
        }
      }
    }
  });

  it('Issue #89: verifies Whispering Spire ground row 6 contains chasm walls preventing bridge bypass', () => {
    const story = getStoryline('the_whispering_citadel');
    const level = story.chapters[0];
    const spire = level.rooms.high_spire;

    const row6Ground = spire.layers.ground[6];
    assert(row6Ground !== undefined, 'Row 6 exists in high_spire ground layer');
    assertEqual(row6Ground[0], 1, 'Outer west wall');
    assertEqual(row6Ground[1], 1, 'Chasm blocks x=1');
    assertEqual(row6Ground[2], 0, 'Walkable ramp approach platform at x=2');
    assertEqual(row6Ground[3], 'R_E', 'Ramp up east onto bridge deck at x=3');
    assertEqual(row6Ground[4], 1, 'Chasm under bridge at x=4');
    assertEqual(row6Ground[8], 1, 'Chasm under bridge at x=8');
    assertEqual(row6Ground[9], 'R_W', 'Ramp down west from bridge deck at x=9');
    assertEqual(row6Ground[10], 0, 'Walkable descent landing platform at x=10');
    assertEqual(row6Ground[11], 1, 'Chasm blocks x=11');
    assertEqual(row6Ground[12], 1, 'Outer east wall');

    // Barriers preventing walking directly around ramp approaches
    assertEqual(spire.layers.ground[7][2], 1, 'Ground at (2, 7) is blocked, forcing player onto R_E');
    assertEqual(spire.layers.ground[5][10], 1, 'Ground at (10, 5) is blocked, forcing player across bridge to reach south');
  });

  it('Issue #89: verifies GameLoop lastRoomSpawn guard prevents infinite teleport ping-pong loops', () => {
    const story = getStoryline('the_whispering_citadel');
    const level = LevelLoader.normalizeLevel(story.chapters[0]);

    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {}, strokeRect: () => {}, fillText: () => {}, strokeText: () => {},
        measureText: () => ({ width: 10 }), drawImage: () => {}, beginPath: () => {},
        arc: () => {}, fill: () => {}, stroke: () => {}, save: () => {}, restore: () => {},
        translate: () => {}, rotate: () => {},
      }),
    };

    const loop = new GameLoop(level, mockCanvas, mockCanvas);
    assertEqual(loop.activeRoomId, 'courtyard');

    // Step onto catacombs exit
    loop.player.teleport(1, 11, 0);
    loop.update(0.016);
    assertEqual(loop.activeRoomId, 'catacombs', 'Transitioned to catacombs');

    // Simulate arriving on catacombs spawn (1, 2)
    assertEqual(loop.player.gridX, 1);
    assertEqual(loop.player.gridY, 2);
    assert(loop.lastRoomSpawn !== null, 'Recorded lastRoomSpawn');
    assertEqual(loop.lastRoomSpawn.x, 1);
    assertEqual(loop.lastRoomSpawn.y, 2);

    // If an exit were maliciously placed at (1, 2), loop update should NOT re-trigger transition while on lastRoomSpawn
    loop.level.exits.push({ id: 'dummy_loop_exit', x: 1, y: 2, elevation: 0, targetRoom: 'courtyard' });
    loop.lastRoomTransitionTime = -10000;
    loop.update(0.016);
    assertEqual(loop.activeRoomId, 'catacombs', 'Remained in catacombs thanks to lastRoomSpawn guard');

    // Moving off spawn clears lastRoomSpawn
    const moved = loop.tryMove(1, 3);
    assertEqual(moved, true, 'Moved off arrival spawn');
    assertEqual(loop.lastRoomSpawn, null, 'Cleared lastRoomSpawn after moving');

    loop.stop();
  });
});
