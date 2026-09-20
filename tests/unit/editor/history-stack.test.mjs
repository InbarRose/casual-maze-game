/**
 * Unit Tests: Editor Action History Stack & Continuous Drag-to-Paint Smoothing (BL-18, BL-19)
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { EditorCanvas } from '../../../js/editor/editor-canvas.js';
import { EditorUI } from '../../../js/editor/editor-ui.js';
import { TILES, LAYERS } from '../../../js/core/constants.js';

describe('Editor > Action History Stack & Drag-to-Paint Smoothing Suite (BL-18, BL-19)', () => {
  const createMockCanvas = () => ({
    width: 800,
    height: 600,
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      measureText: () => ({ width: 60 }),
      roundRect: () => {},
      setLineDash: () => {},
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    style: {},
  });

  const createTestLevel = () => ({
    id: 'history_test_labyrinth',
    title: 'History Test Labyrinth',
    author: 'Architect',
    version: 1,
    dimensions: { width: 10, height: 10 },
    config: { theme: 'dungeon' },
    spawn: { x: 1, y: 1, elevation: 0 },
    exit: { x: 8, y: 8, elevation: 0 },
    layers: {
      ground: Array.from({ length: 10 }, () => Array(10).fill(0)),
      overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
    },
    entities: [
      { id: 'key_gold_1', type: 'key', name: 'Golden Key', color: '#fbbf24', x: 2, y: 2 },
    ],
  });

  /* =========================================================
   * 1. ACTION HISTORY STACK (BL-18)
   * ========================================================= */
  describe('Editor Action History Stack (BL-18)', () => {
    it('initializes with maxHistory 50 and single initial state', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();
      const canvas = new EditorCanvas({ canvas: mockCanvas, level });

      // Mock DOM element lookups for EditorUI
      const mockElements = {};
      const getOrCreateMock = (id) => {
        if (!mockElements[id]) {
          mockElements[id] = {
            value: '',
            disabled: false,
            setAttribute: (k, v) => { mockElements[id][k] = v; },
            addEventListener: () => {},
            classList: { add: () => {}, remove: () => {}, toggle: () => {} },
            textContent: '',
          };
        }
        return mockElements[id];
      };

      // Mock UI container
      const ui = Object.create(EditorUI.prototype);
      ui.history = [];
      ui.historyIndex = -1;
      ui.maxHistory = 50;
      ui.level = JSON.parse(JSON.stringify(level));
      ui.editorCanvas = canvas;
      ui.showToast = () => {};
      ui.autoSave = () => {};
      ui.updateValidationState = () => {};
      ui.updateZoomBadge = () => {};

      // Seed initial history
      ui.pushHistory();

      assertEqual(ui.maxHistory, 50, 'Max history depth is 50');
      assertEqual(ui.history.length, 1, 'Initial history length is 1');
      assertEqual(ui.historyIndex, 0, 'Initial history index is 0');
      assertEqual(ui.canUndo(), false, 'Cannot undo at start');
      assertEqual(ui.canRedo(), false, 'Cannot redo at start');

      const state = ui.getHistoryState();
      assertEqual(state.index, 0);
      assertEqual(state.count, 1);
      assertEqual(state.canUndo, false);
      assertEqual(state.canRedo, false);
    });

    it('records multiple actions, undos, and redos level states', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();
      const canvas = new EditorCanvas({ canvas: mockCanvas, level });

      const ui = Object.create(EditorUI.prototype);
      ui.history = [];
      ui.historyIndex = -1;
      ui.maxHistory = 50;
      ui.level = JSON.parse(JSON.stringify(level));
      ui.editorCanvas = canvas;
      ui.showToast = () => {};
      ui.autoSave = () => {};
      ui.updateValidationState = () => {};
      ui.updateZoomBadge = () => {};

      ui.pushHistory(); // State 0

      // Action 1: Paint a wall at (3, 3)
      ui.level.layers.ground[3][3] = TILES.WALL;
      ui.pushHistory(); // State 1

      assertEqual(ui.history.length, 2);
      assertEqual(ui.historyIndex, 1);
      assertEqual(ui.canUndo(), true);
      assertEqual(ui.canRedo(), false);

      // Action 2: Add a door at (5, 5)
      ui.level.entities.push({ id: 'door_gold_1', type: 'door', x: 5, y: 5 });
      ui.pushHistory(); // State 2

      assertEqual(ui.history.length, 3);
      assertEqual(ui.historyIndex, 2);
      assertEqual(ui.canUndo(), true);
      assertEqual(ui.canRedo(), false);
      assertEqual(ui.level.entities.length, 2);

      // Undo Action 2
      ui.undo();
      assertEqual(ui.historyIndex, 1);
      assertEqual(ui.level.entities.length, 1, 'Door entity undone');
      assertEqual(ui.level.layers.ground[3][3], TILES.WALL, 'Wall still present');
      assertEqual(ui.canUndo(), true);
      assertEqual(ui.canRedo(), true);

      // Undo Action 1
      ui.undo();
      assertEqual(ui.historyIndex, 0);
      assertEqual(ui.level.layers.ground[3][3], 0, 'Wall paint undone');
      assertEqual(ui.canUndo(), false);
      assertEqual(ui.canRedo(), true);

      // Redo Action 1
      ui.redo();
      assertEqual(ui.historyIndex, 1);
      assertEqual(ui.level.layers.ground[3][3], TILES.WALL, 'Wall paint redone');
      assertEqual(ui.canUndo(), true);
      assertEqual(ui.canRedo(), true);

      // Redo Action 2
      ui.redo();
      assertEqual(ui.historyIndex, 2);
      assertEqual(ui.level.entities.length, 2, 'Door entity redone');
      assertEqual(ui.canUndo(), true);
      assertEqual(ui.canRedo(), false);
    });

    it('truncates future branched history when modifying after undo', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();
      const canvas = new EditorCanvas({ canvas: mockCanvas, level });

      const ui = Object.create(EditorUI.prototype);
      ui.history = [];
      ui.historyIndex = -1;
      ui.maxHistory = 50;
      ui.level = JSON.parse(JSON.stringify(level));
      ui.editorCanvas = canvas;
      ui.showToast = () => {};
      ui.autoSave = () => {};
      ui.updateValidationState = () => {};
      ui.updateZoomBadge = () => {};

      ui.pushHistory(); // 0

      // Stroke A
      ui.level.layers.ground[1][1] = TILES.WALL;
      ui.pushHistory(); // 1

      // Stroke B
      ui.level.layers.ground[2][2] = TILES.WALL;
      ui.pushHistory(); // 2

      assertEqual(ui.history.length, 3);

      // Undo back to 1
      ui.undo();
      assertEqual(ui.historyIndex, 1);

      // Branch with Stroke C at (3, 3)
      ui.level.layers.ground[3][3] = TILES.WALL;
      ui.pushHistory(); // 2 (branched)

      assertEqual(ui.history.length, 3, 'Old future truncated, history stays at 3');
      assertEqual(ui.historyIndex, 2);
      assertEqual(ui.canRedo(), false, 'Cannot redo into discarded future');
    });

    it('caps history stack at maxHistory (50 entries) without overflow', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();
      const canvas = new EditorCanvas({ canvas: mockCanvas, level });

      const ui = Object.create(EditorUI.prototype);
      ui.history = [];
      ui.historyIndex = -1;
      ui.maxHistory = 50;
      ui.level = JSON.parse(JSON.stringify(level));
      ui.editorCanvas = canvas;
      ui.showToast = () => {};
      ui.autoSave = () => {};
      ui.updateValidationState = () => {};
      ui.updateZoomBadge = () => {};

      // Push 60 distinct states
      for (let i = 0; i < 60; i++) {
        ui.level.title = `Step ${i}`;
        ui.pushHistory();
      }

      assertEqual(ui.history.length, 50, 'History capped at exactly 50 states');
      assertEqual(ui.historyIndex, 49, 'Index at the tail of 50-item stack');
      assertEqual(ui.canUndo(), true);
      assertEqual(ui.canRedo(), false);
    });

    it('ignores pushHistory when level state has not changed (idempotent)', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();
      const canvas = new EditorCanvas({ canvas: mockCanvas, level });

      const ui = Object.create(EditorUI.prototype);
      ui.history = [];
      ui.historyIndex = -1;
      ui.maxHistory = 50;
      ui.level = JSON.parse(JSON.stringify(level));
      ui.editorCanvas = canvas;
      ui.showToast = () => {};
      ui.autoSave = () => {};
      ui.updateValidationState = () => {};
      ui.updateZoomBadge = () => {};

      ui.pushHistory();
      assertEqual(ui.history.length, 1);

      // Push again without mutation
      ui.pushHistory();
      ui.pushHistory();
      assertEqual(ui.history.length, 1, 'Consecutive identical states are ignored');
    });

    it('synchronizes level metadata, dimensions, and theme on undo/redo', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();
      const canvas = new EditorCanvas({ canvas: mockCanvas, level });

      const ui = Object.create(EditorUI.prototype);
      ui.history = [];
      ui.historyIndex = -1;
      ui.maxHistory = 50;
      ui.level = JSON.parse(JSON.stringify(level));
      ui.editorCanvas = canvas;
      ui.showToast = () => {};
      ui.autoSave = () => {};
      ui.updateValidationState = () => {};
      ui.updateZoomBadge = () => {};
      ui.updateUndoRedoButtons = () => {};

      ui.pushHistory(); // State 0 (theme: dungeon, 10x10)

      // Change theme to lava and dimensions to 15x15
      ui.level.config.theme = 'lava';
      ui.level.dimensions = { width: 15, height: 15 };
      ui.pushHistory(); // State 1

      assertEqual(ui.level.config.theme, 'lava');
      assertEqual(ui.level.dimensions.width, 15);

      // Undo
      ui.undo();
      assertEqual(ui.level.config.theme, 'dungeon', 'Theme restored to dungeon');
      assertEqual(ui.level.dimensions.width, 10, 'Dimensions restored to 10');

      // Redo
      ui.redo();
      assertEqual(ui.level.config.theme, 'lava', 'Theme restored to lava');
      assertEqual(ui.level.dimensions.width, 15, 'Dimensions restored to 15');
    });
  });

  /* =========================================================
   * 2. CONTINUOUS DRAG-TO-PAINT SMOOTHING (BL-19)
   * ========================================================= */
  describe('Continuous Drag-to-Paint Smoothing (BL-19)', () => {
    it('interpolates intermediate coordinates during rapid mouse drag without gaps', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();
      let paintCount = 0;

      const canvas = new EditorCanvas({
        canvas: mockCanvas,
        level,
        onTilePaint: () => { paintCount++; },
      });

      canvas.setTool('pencil');
      canvas.setSelectedTile(TILES.WALL);

      // 1. Mouse down at (1, 1)
      canvas.handleMouseDown({
        clientX: 1 * canvas.baseTileSize + canvas.panX + 5,
        clientY: 1 * canvas.baseTileSize + canvas.panY + 5,
        button: 0,
      });

      assertEqual(level.layers.ground[1][1], TILES.WALL, 'Initial tile (1, 1) stamped');
      assertEqual(canvas.lastPaintedGridPos.x, 1);
      assertEqual(canvas.lastPaintedGridPos.y, 1);

      // 2. Rapid drag jumping directly to (6, 1) in a single mousemove event
      canvas.handleMouseMove({
        clientX: 6 * canvas.baseTileSize + canvas.panX + 5,
        clientY: 1 * canvas.baseTileSize + canvas.panY + 5,
      });

      // Verify that every single intermediate cell from 1 to 6 was stamped (no gaps)
      for (let x = 1; x <= 6; x++) {
        assertEqual(
          level.layers.ground[1][x],
          TILES.WALL,
          `Intermediate cell (x=${x}, y=1) stamped via Bresenham interpolation`
        );
      }

      // 3. Rapid diagonal drag jumping to (6, 5)
      canvas.handleMouseMove({
        clientX: 6 * canvas.baseTileSize + canvas.panX + 5,
        clientY: 5 * canvas.baseTileSize + canvas.panY + 5,
      });

      for (let y = 1; y <= 5; y++) {
        assertEqual(
          level.layers.ground[y][6],
          TILES.WALL,
          `Vertical line cell (x=6, y=${y}) stamped without gaps`
        );
      }

      // 4. Mouse up finishes stroke
      canvas.handleMouseUp();
      assertEqual(canvas.lastPaintedGridPos, null, 'lastPaintedGridPos reset on mouseup');
      assertEqual(canvas.isMouseDown, false, 'isMouseDown false');
      assertEqual(paintCount, 1, 'onTilePaint called exactly once for the entire continuous stroke');
    });

    it('interpolates eraser tool during drag to cleanly clear regions', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();

      // Pre-fill row 2 with walls
      for (let x = 0; x < 10; x++) {
        level.layers.ground[2][x] = TILES.WALL;
      }

      const canvas = new EditorCanvas({ canvas: mockCanvas, level });
      canvas.setTool('eraser');

      // Drag eraser from (2, 2) to (7, 2)
      canvas.handleMouseDown({
        clientX: 2 * canvas.baseTileSize + canvas.panX + 5,
        clientY: 2 * canvas.baseTileSize + canvas.panY + 5,
        button: 0,
      });

      canvas.handleMouseMove({
        clientX: 7 * canvas.baseTileSize + canvas.panX + 5,
        clientY: 2 * canvas.baseTileSize + canvas.panY + 5,
      });

      canvas.handleMouseUp();

      // Cells (2, 2) through (7, 2) must be erased to 0
      for (let x = 2; x <= 7; x++) {
        assertEqual(level.layers.ground[2][x], 0, `Cell (${x}, 2) successfully erased`);
      }
      // Cells outside the drag remain walls
      assertEqual(level.layers.ground[2][0], TILES.WALL, 'Cell (0, 2) remains wall');
      assertEqual(level.layers.ground[2][9], TILES.WALL, 'Cell (9, 2) remains wall');
    });

    it('handles mobile and tablet touch events with scroll cancellation', () => {
      const mockCanvas = createMockCanvas();
      const level = createTestLevel();
      const canvas = new EditorCanvas({ canvas: mockCanvas, level });

      canvas.setTool('pencil');
      canvas.setSelectedTile(TILES.WALL);

      let defaultPrevented = false;
      const mockTouchEvent = (x, y) => ({
        cancelable: true,
        touches: [{ clientX: x * canvas.baseTileSize + canvas.panX + 5, clientY: y * canvas.baseTileSize + canvas.panY + 5 }],
        preventDefault: () => { defaultPrevented = true; },
      });

      // Touch start at (3, 3)
      defaultPrevented = false;
      canvas.handleTouchStart(mockTouchEvent(3, 3));
      assert(defaultPrevented, 'e.preventDefault() called on touchstart');
      assertEqual(level.layers.ground[3][3], TILES.WALL, 'Tile stamped on touch start');

      // Touch move to (5, 3)
      defaultPrevented = false;
      canvas.handleTouchMove(mockTouchEvent(5, 3));
      assert(defaultPrevented, 'e.preventDefault() called on touchmove');
      assertEqual(level.layers.ground[3][4], TILES.WALL, 'Interpolated touch cell (4, 3) stamped');
      assertEqual(level.layers.ground[3][5], TILES.WALL, 'Target touch cell (5, 3) stamped');

      // Touch end
      defaultPrevented = false;
      canvas.handleTouchEnd({
        cancelable: true,
        preventDefault: () => { defaultPrevented = true; },
      });
      assert(defaultPrevented, 'e.preventDefault() called on touchend');
      assertEqual(canvas.isMouseDown, false, 'Touch release reset mouse down');
    });
  });
});
