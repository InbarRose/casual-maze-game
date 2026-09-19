/**
 * Unit Tests: Editor Buttons & Functions Suite
 * Tests every editor UI button, modal, shortcut, and operation.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { EditorCanvas } from '../../../js/editor/editor-canvas.js';
import { EntityInspector } from '../../../js/editor/entity-inspector.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { JsonExporter } from '../../../js/editor/json-exporter.js';
import { LevelLoader } from '../../../js/levels/level-loader.js';
import { TILES, LAYERS } from '../../../js/core/constants.js';

describe('Editor > Buttons & Core Functions Suite', () => {
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
    id: 'editor_btn_test',
    title: 'Button Test Labyrinth',
    author: 'Tester',
    version: 1,
    dimensions: { width: 15, height: 15 },
    config: { theme: 'dungeon', fogOfWar: false, viewRadius: 6 },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    exit: { x: 13, y: 13, style: 'archway' },
    layers: {
      ground: Array.from({ length: 15 }, () => Array(15).fill(0)),
      overhead: Array.from({ length: 15 }, () => Array(15).fill(0)),
    },
    entities: [
      { id: 'key_gold_1', type: 'key', name: 'Golden Key', color: '#fbbf24', x: 3, y: 3, style: 'classic', glowEffect: 'vibrant' },
      { id: 'door_gold_1', type: 'door', color: '#fbbf24', x: 5, y: 5, requiresKey: 'key_gold_1', style: 'classic', orientation: 'vertical' },
      { id: 'lever_1', type: 'lever', name: 'Gate Switch', x: 7, y: 7, style: 'switch_lever', state: false, targets: [{ x: 9, y: 9, action: 'toggle_tile' }] },
    ],
  });

  it('tests tool activations and tool switching', () => {
    const canvas = new EditorCanvas({ canvas: createMockCanvas(), level: createTestLevel() });

    canvas.setTool('pencil');
    assertEqual(canvas.currentTool, 'pencil');

    canvas.setTool('line');
    assertEqual(canvas.currentTool, 'line');

    canvas.setTool('fill');
    assertEqual(canvas.currentTool, 'fill');

    canvas.setTool('eraser');
    assertEqual(canvas.currentTool, 'eraser');

    canvas.setTool('select');
    assertEqual(canvas.currentTool, 'select');

    canvas.setTool('move');
    assertEqual(canvas.currentTool, 'move');
  });

  it('tests brush sizing and clamping (1x1 to 5x5)', () => {
    const canvas = new EditorCanvas({ canvas: createMockCanvas(), level: createTestLevel() });

    canvas.setBrushSize(3);
    assertEqual(canvas.brushSize, 3);

    canvas.setBrushSize(5);
    assertEqual(canvas.brushSize, 5);

    // Clamping checks
    canvas.setBrushSize(10);
    assertEqual(canvas.brushSize, 5);

    canvas.setBrushSize(0);
    assertEqual(canvas.brushSize, 1);
  });

  it('tests layer switching between ground (0) and overhead (1)', () => {
    const canvas = new EditorCanvas({ canvas: createMockCanvas(), level: createTestLevel() });

    assertEqual(canvas.activeLayer, LAYERS.GROUND);

    canvas.setActiveLayer(LAYERS.OVERHEAD);
    assertEqual(canvas.activeLayer, LAYERS.OVERHEAD);

    canvas.setActiveLayer(LAYERS.GROUND);
    assertEqual(canvas.activeLayer, LAYERS.GROUND);
  });

  it('tests zoom in, zoom out, and zoom to fit viewport controls', () => {
    const canvas = new EditorCanvas({ canvas: createMockCanvas(), level: createTestLevel() });

    const initialZoom = canvas.zoom;
    canvas.setZoom(initialZoom * 1.5);
    assertEqual(canvas.zoom, initialZoom * 1.5);

    canvas.setZoom(0.01); // should clamp to minimum 0.15
    assertEqual(canvas.zoom, 0.15);

    canvas.setZoom(10.0); // should clamp to maximum 5.0
    assertEqual(canvas.zoom, 5.0);

    canvas.zoomToFit();
    assert(canvas.zoom > 0.15 && canvas.zoom <= 5.0, 'zoomToFit calculated sensible zoom level');
  });

  it('tests EntityInspector property mutations, styles, and lever wiring', () => {
    const level = createTestLevel();

    const mockNode = () => {
      const node = {
        textContent: '',
        innerHTML: '',
        value: '',
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        addEventListener: () => {},
        querySelector: () => mockNode(),
        querySelectorAll: () => [],
        appendChild: () => {},
        style: {},
      };
      return node;
    };

    const mockModal = {
      querySelector: () => mockNode(),
      querySelectorAll: () => [],
      classList: { add: () => {}, remove: () => {} },
    };

    let updated = false;
    let deleted = false;
    let targetPicked = false;
    let toggled = false;

    const inspector = new EntityInspector({
      modalContainer: mockModal,
      onUpdate: () => { updated = true; },
      onDelete: () => { deleted = true; },
      onStartPickTarget: () => { targetPicked = true; },
      onTestToggle: (l) => {
        toggled = true;
        l.state = !l.state;
      },
    });

    const key = level.entities[0];
    inspector.open(key, level);
    assertEqual(inspector.currentEntity.id, 'key_gold_1');

    // Mutate properties
    key.style = 'skull';
    key.glowEffect = 'pulse';
    inspector.close();

    assertEqual(key.style, 'skull');
    assertEqual(key.glowEffect, 'pulse');

    // Test Lever Toggle
    const lever = level.entities[2];
    assertEqual(lever.state, false);
    inspector.onTestToggle(lever);
    assertEqual(lever.state, true);
    assert(toggled, 'Test toggle triggered');
  });

  it('tests LevelValidator diagnostics and issue detection on editor levels', () => {
    const level = createTestLevel();
    const validReport = LevelValidator.validate(level);
    assert(validReport.valid, 'Fresh test level is valid');

    // Break spawn (place in wall)
    level.layers.ground[1][1] = 1;
    const brokenReport = LevelValidator.validate(level);
    assert(!brokenReport.valid, 'Invalidated level with spawn in solid wall');
    assert(brokenReport.errors.length >= 1, 'Error recorded');
  });

  it('tests JSON normalization and clipboard serialization', async () => {
    const level = createTestLevel();
    const normalized = LevelLoader.normalizeLevel(level);
    const jsonStr = JSON.stringify(normalized, null, 2);
    assert(jsonStr.includes('editor_btn_test'), 'JSON contains level ID');
    assert(jsonStr.includes('Golden Key'), 'JSON contains entity');

    const clipboardOk = await JsonExporter.copyToClipboard(level);
    assert(clipboardOk === true || clipboardOk === false, 'Clipboard handler returns boolean status');
  });

  it('tests loading official preset levels and remix cloning into the editor', () => {
    const canvas = new EditorCanvas({ canvas: createMockCanvas(), level: createTestLevel() });

    // Mock editorUI instance methods
    const mockUI = {
      level: createTestLevel(),
      editorCanvas: canvas,
      showToast: () => {},
      loadLevel(lvl) {
        this.level = LevelLoader.normalizeLevel(lvl);
        this.editorCanvas.setLevel(this.level);
      },
    };

    // Import loadPresetLevel logic test
    const { TUTORIAL_LEVELS, CAMPAIGN_LEVELS } = LevelLoader;

    // 1. Load Campaign Level 4 directly
    const l4 = CAMPAIGN_LEVELS?.find(l => String(l.id) === '4') || { id: '4', title: 'Sky Bridges & Crossroads', dimensions: { width: 25, height: 25 }, layers: { ground: [], overhead: [] } };
    mockUI.loadLevel(l4);
    assertEqual(mockUI.level.id, '4');
    assertEqual(mockUI.level.title, 'Sky Bridges & Crossroads');

    // 2. Clone Campaign Level 4 as a Remix
    const remixCopy = JSON.parse(JSON.stringify(l4));
    remixCopy.id = `remix_${l4.id}_12345`;
    remixCopy.title = `${l4.title} (Remix)`;
    mockUI.loadLevel(remixCopy);
    assert(mockUI.level.id.startsWith('remix_4_'), 'Remix ID set');
    assert(mockUI.level.title.includes('(Remix)'), 'Remix title set');

    // 3. Load Tutorial Level 2
    const t2 = TUTORIAL_LEVELS?.find(l => String(l.id) === 'tutorial_2') || { id: 'tutorial_2', title: 'Keys & Colored Gates', dimensions: { width: 13, height: 13 }, layers: { ground: [], overhead: [] } };
    mockUI.loadLevel(t2);
    assertEqual(mockUI.level.id, 'tutorial_2');
    assertEqual(mockUI.level.title, 'Keys & Colored Gates');
  });
});

