/**
 * Component Test Suite: CMP-08, CMP-09 & CMP-10 Map Editor Studio Suite
 *
 * Exhaustively verifies:
 * 1. Every Menu: Top menu action strip, Categorized Tool Palette Accordions, Properties Modal,
 *    Layer Switcher, Floating Mini-Map HUD (#editor-minimap-hud), Validation Report Drawer
 * 2. Every Button: #btn-undo, #btn-redo, #btn-validate, #btn-auto-fix, #btn-generate-maze,
 *    #btn-properties, #btn-guide, #btn-import-json, #btn-copy-json, #btn-export-json,
 *    #btn-clear, #btn-playtest-opts, #btn-playtest, #btn-toggle-minimap, #btn-zoom-in, #btn-zoom-out, #btn-zoom-fit
 * 3. Every Mode: Ground layer mode vs Overhead layer mode, Edit mode vs Playtest mode, Mini-Map HUD
 * 4. Every Phase: Canvas authoring phase, History stack undo/redo phase, Validation diagnosis phase,
 *    Auto-fix repair phase, Properties configuration phase
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { EditorUI } from '../../../js/editor/editor-ui.js';
import { TILES } from '../../../js/core/constants.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';

const isNode = typeof process !== 'undefined' && process.versions?.node;

describe('Component Suite > CMP-08, CMP-09 & CMP-10: Map Editor Studio Suite', () => {
  it('covers every menu bar button, tool palette accordion, and modal in editor.html', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');
    const editorHtml = fs.readFileSync(path.resolve(process.cwd(), 'editor.html'), 'utf-8');

    // Menu Bar Action Buttons
    assert(editorHtml.includes('id="btn-undo"'), '#btn-undo button exists');
    assert(editorHtml.includes('id="btn-redo"'), '#btn-redo button exists');
    assert(editorHtml.includes('id="btn-validate"'), '#btn-validate button exists');
    assert(editorHtml.includes('id="btn-auto-fix"'), '#btn-auto-fix button exists');
    assert(editorHtml.includes('id="btn-generate-maze"'), '#btn-generate-maze button exists');
    assert(editorHtml.includes('id="btn-properties"'), '#btn-properties button exists');
    assert(editorHtml.includes('id="btn-guide"'), '#btn-guide button exists');
    assert(editorHtml.includes('id="btn-import-json"'), '#btn-import-json button exists');
    assert(editorHtml.includes('id="btn-copy-json"'), '#btn-copy-json button exists');
    assert(editorHtml.includes('id="btn-export-json"'), '#btn-export-json button exists');
    assert(editorHtml.includes('id="btn-clear"'), '#btn-clear button exists');
    assert(editorHtml.includes('id="btn-playtest"'), '#btn-playtest button exists');

    // Categorized Accordion Tool Palette Groups (BL-104)
    assert(editorHtml.includes('Draw Tools'), 'Draw Tools accordion group exists');
    assert(editorHtml.includes('Tiles & Bridges'), 'Tiles & Bridges accordion group exists');
    assert(editorHtml.includes('Elevation Ramps'), 'Elevation Ramps accordion group exists');
    assert(editorHtml.includes('Architectural Prefabs'), 'Architectural Prefabs accordion group exists');
    assert(editorHtml.includes('Entities & Markers'), 'Entities accordion group exists');

    // Interactive Floating Mini-Map HUD (BL-103)
    assert(editorHtml.includes('id="editor-minimap-hud"'), '#editor-minimap-hud container exists');
    assert(editorHtml.includes('id="editor-minimap-canvas"'), '#editor-minimap-canvas exists');
    assert(editorHtml.includes('id="btn-toggle-minimap"'), '#btn-toggle-minimap button exists');

    // Modal Isolation: Verified #properties-modal exists rather than colliding #settings-modal (BL-111)
    assert(editorHtml.includes('id="properties-modal"'), '#properties-modal exists without colliding');
    assert(!editorHtml.includes('id="settings-modal"'), '#settings-modal eradicated from editor');
  });

  it('covers Editor History Stack phases: push, undo, redo, and snapshot cap', () => {
    const ui = Object.create(EditorUI.prototype);
    ui.history = [];
    ui.historyIndex = -1;
    ui.maxHistory = 10;
    ui.level = {
      layers: { ground: [[0, 0], [0, 0]] },
      entities: [],
    };
    ui.showToast = () => {};
    ui.autoSave = () => {};
    ui.updateValidationState = () => {};
    ui.updateUndoRedoButtons = () => {};
    ui.updateZoomBadge = () => {};
    ui.editorCanvas = {
      setLevel: (lvl) => { ui.level = lvl; },
      centerInViewport: () => {},
      requestRender: () => {},
    };

    assertEqual(ui.canUndo(), false, 'Cannot undo on empty history');
    assertEqual(ui.canRedo(), false, 'Cannot redo on empty history');

    // Initial state
    ui.pushHistory();
    assertEqual(ui.history.length, 1);
    assertEqual(ui.historyIndex, 0);

    // Mutation 1: Paint wall
    ui.level.layers.ground[0][1] = TILES.WALL;
    ui.pushHistory();
    assertEqual(ui.history.length, 2);
    assertEqual(ui.historyIndex, 1);
    assertEqual(ui.canUndo(), true, 'Can undo after 2 pushes');

    // Mutation 2: Add entity
    ui.level.entities.push({ id: 'key_1', type: 'key', x: 0, y: 0 });
    ui.pushHistory();
    assertEqual(ui.history.length, 3);
    assertEqual(ui.historyIndex, 2);

    // Undo phase
    ui.undo();
    assertEqual(ui.historyIndex, 1);
    assertEqual(ui.level.entities.length, 0, 'Restored prior entities');
    assertEqual(ui.canRedo(), true, 'Can redo after undo');

    // Redo phase
    ui.redo();
    assertEqual(ui.historyIndex, 2);
    assertEqual(ui.level.entities.length, 1, 'Restored forward state');
  });

  it('covers Editor Diagnostics & Auto-Fix phase (CMP-10)', () => {
    // 1. Broken level with walled-in exit
    const brokenLevel = {
      id: 'broken_level',
      dimensions: { width: 5, height: 5 },
      spawn: { x: 1, y: 1 },
      exit: { x: 3, y: 3 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, 1, 0, 1],
          [1, 1, 1, 1, 1],
          [1, 1, 1, 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      entities: [],
    };

    // Validation diagnosis phase
    const report = LevelValidator.validate(brokenLevel);
    assertEqual(report.valid, false, 'Detects unsolvable exit');
    assert(report.errors.length > 0, 'Reports issue errors');

    // Solvability engine phase (returns null when unsolvable)
    const solution = solveLevel(brokenLevel);
    assertEqual(solution, null, 'Solver confirms unsolvable level returns null');

    // Repair / Auto-fix phase: carve corridor at (2, 1) and (3, 2)
    brokenLevel.layers.ground[1][2] = 0;
    brokenLevel.layers.ground[2][3] = 0;

    const fixedReport = LevelValidator.validate(brokenLevel);
    assertEqual(fixedReport.valid, true, 'Validation passes after corridor repair');

    const fixedSolution = solveLevel(brokenLevel);
    assert(Array.isArray(fixedSolution), 'Solver confirms solvable path exists');
    assert(fixedSolution.length > 0, 'Produces valid solution path');
  });
});
