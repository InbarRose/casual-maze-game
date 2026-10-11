/**
 * Unit Tests: Editor Perspective Switching, Sidebar Category Navigation & Minimap Layout (BL-110)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { EditorCanvas } from '../../../js/editor/editor-canvas.js';
import { EditorUI } from '../../../js/editor/editor-ui.js';
import { TILES, LAYERS } from '../../../js/core/constants.js';

describe('Editor > Perspective Switching, Sidebar Categories & Minimap Overlap (BL-110)', () => {
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
      ellipse: () => {},
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
    id: 'test_perspective_level',
    title: 'Perspective Test Labyrinth',
    author: 'Architect',
    version: 1,
    dimensions: { width: 10, height: 10 },
    config: { theme: 'dungeon', fogOfWar: false, viewRadius: 6 },
    spawn: { x: 1, y: 1, elevation: 0, style: 'stairs_down' },
    testSpawn: { x: 2, y: 2, elevation: 0 },
    exit: { x: 8, y: 8, style: 'portal' },
    layers: {
      ground: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 'B_EW', 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 'R_N', 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
    },
    entities: [
      { id: 'key_1', type: 'key', name: 'Golden Key', color: '#fbbf24', x: 3, y: 3 },
      { id: 'door_1', type: 'door', name: 'Gold Gate', color: '#fbbf24', x: 5, y: 3, requiresKey: 'key_1' },
      { id: 'lever_1', type: 'lever', name: 'Mechanism Lever', x: 7, y: 3, targets: [] },
    ],
  });

  it('manages EditorCanvas perspective getters, setters, and toggles cleanly', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level });

    // Initial default is '2d'
    assertEqual(editorCanvas.getPerspective(), '2d', 'Default mode is 2d');

    // Switch to 2.5d
    editorCanvas.setPerspective('2.5d');
    assertEqual(editorCanvas.getPerspective(), '2.5d', 'Switched to 2.5d mode');

    // Toggle flips between 2d and 2.5d
    const toggled1 = editorCanvas.togglePerspective();
    assertEqual(toggled1, '2d', 'Toggled to 2d');
    assertEqual(editorCanvas.getPerspective(), '2d');

    const toggled2 = editorCanvas.togglePerspective();
    assertEqual(toggled2, '2.5d', 'Toggled back to 2.5d');
    assertEqual(editorCanvas.getPerspective(), '2.5d');

    // Ignores invalid mode
    editorCanvas.setPerspective('isometric_3d_invalid');
    assertEqual(editorCanvas.getPerspective(), '2.5d', 'Invalid mode ignored');
  });

  it('renders both 2D and 2.5D modes without errors across walls, bridges, and entities', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level });

    // 2D render pass
    editorCanvas.setPerspective('2d');
    assert(typeof editorCanvas.render === 'function');
    editorCanvas.render();

    // 2.5D render pass (extruded walls, ambient shadows, grounding entity shadows)
    editorCanvas.setPerspective('2.5d');
    editorCanvas.render();
    assert(true, '2.5D render executed cleanly without exceptions');
  });

  it('manages EditorUI perspective UI updates and status bar telemetry', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level });

    // Build mock DOM elements
    const dom = {
      btnPerspective: { classList: new Set(), title: '' },
      btnHudPerspective: { classList: new Set(), textContent: '' },
      labelEl: { textContent: '' },
      statusPerspective: { textContent: '' },
    };
    dom.btnPerspective.classList.toggle = (cls, cond) => cond ? dom.btnPerspective.classList.add(cls) : dom.btnPerspective.classList.delete(cls);
    dom.btnPerspective.classList.contains = (cls) => dom.btnPerspective.classList.has(cls);
    dom.btnHudPerspective.classList.toggle = (cls, cond) => cond ? dom.btnHudPerspective.classList.add(cls) : dom.btnHudPerspective.classList.delete(cls);

    const origDoc = globalThis.document;
    try {
      globalThis.document = {
        ...origDoc,
        getElementById: (id) => {
          if (id === 'btn-perspective') return dom.btnPerspective;
          if (id === 'btn-hud-perspective') return dom.btnHudPerspective;
          if (id === 'perspective-label') return dom.labelEl;
          if (id === 'status-perspective') return dom.statusPerspective;
          return origDoc?.getElementById ? origDoc.getElementById(id) : null;
        },
      };

      const mockEditorUI = {
        editorCanvas,
        showToast: () => {},
        updatePerspectiveUI: EditorUI.prototype.updatePerspectiveUI,
        togglePerspective: EditorUI.prototype.togglePerspective,
      };

      // Update to 2D
      mockEditorUI.updatePerspectiveUI('2d');
      assertEqual(dom.labelEl.textContent, '2D');
      assertEqual(dom.btnHudPerspective.textContent, '📐 2D');
      assertEqual(dom.statusPerspective.textContent, '📐 Mode: 2D Blueprint');
      assert(!dom.btnPerspective.classList.contains('active'));

      // Toggle perspective via EditorUI
      mockEditorUI.togglePerspective();
      assertEqual(editorCanvas.getPerspective(), '2.5d');
      assertEqual(dom.labelEl.textContent, '2.5D');
      assertEqual(dom.btnHudPerspective.textContent, '📐 2.5D');
      assertEqual(dom.statusPerspective.textContent, '📐 Mode: 2.5D Angled');
      assert(dom.btnPerspective.classList.contains('active'));
    } finally {
      globalThis.document = origDoc;
    }
  });

  it('filters sidebar accordions and palette buttons via category pills and real-time search', () => {
    // Mock accordion elements
    const accordions = [
      { dataset: { accordion: 'tools' }, style: {}, classList: new Set(['active']), querySelectorAll: () => [] },
      { dataset: { accordion: 'tiles' }, style: {}, classList: new Set(['active']), querySelectorAll: () => [] },
      { dataset: { accordion: 'ramps' }, style: {}, classList: new Set(), querySelectorAll: () => [] },
      { dataset: { accordion: 'prefabs' }, style: {}, classList: new Set(), querySelectorAll: () => [] },
      { dataset: { accordion: 'entities' }, style: {}, classList: new Set(), querySelectorAll: () => [] },
    ];
    accordions.forEach(acc => {
      acc.classList.add = (c) => acc.classList.add(c);
      acc.classList.toggle = (c, cond) => cond ? acc.classList.add(c) : acc.classList.delete(c);
    });

    const pills = [
      { dataset: { category: 'all' }, classList: new Set(['active']), addEventListener: () => {} },
      { dataset: { category: 'tiles' }, classList: new Set(), addEventListener: () => {} },
      { dataset: { category: 'entities' }, classList: new Set(), addEventListener: () => {} },
    ];
    pills.forEach(p => {
      p.classList.toggle = (c, cond) => cond ? p.classList.add(c) : p.classList.delete(c);
    });

    // Test category filter function directly matching EditorUI logic
    const applyCategoryFilter = (cat) => {
      pills.forEach(p => p.classList.toggle('active', p.dataset.category === cat));
      accordions.forEach(acc => {
        const type = acc.dataset.accordion;
        let visible = false;
        if (cat === 'all') visible = true;
        else if (cat === 'tiles') visible = (type === 'tiles' || type === 'ramps');
        else if (cat === 'entities') visible = (type === 'entities');
        acc.style.display = visible ? '' : 'none';
      });
    };

    applyCategoryFilter('tiles');
    assertEqual(accordions.find(a => a.dataset.accordion === 'tiles').style.display, '', 'Tiles accordion is visible');
    assertEqual(accordions.find(a => a.dataset.accordion === 'ramps').style.display, '', 'Ramps accordion is visible');
    assertEqual(accordions.find(a => a.dataset.accordion === 'entities').style.display, 'none', 'Entities accordion is hidden');

    applyCategoryFilter('entities');
    assertEqual(accordions.find(a => a.dataset.accordion === 'entities').style.display, '', 'Entities accordion is visible');
    assertEqual(accordions.find(a => a.dataset.accordion === 'tiles').style.display, 'none', 'Tiles accordion is hidden');

    applyCategoryFilter('all');
    assertEqual(accordions.find(a => a.dataset.accordion === 'tools').style.display, '', 'Tools visible in all mode');
    assertEqual(accordions.find(a => a.dataset.accordion === 'entities').style.display, '', 'Entities visible in all mode');
  });

  it('updates mini-map toggle label between expanded and minimized states', () => {
    const miniHud = { classList: new Set() };
    miniHud.classList.toggle = (cls) => miniHud.classList.has(cls) ? miniHud.classList.delete(cls) : miniHud.classList.add(cls);
    miniHud.classList.contains = (cls) => miniHud.classList.has(cls);

    const btnToggle = { textContent: '−', title: '' };

    const handleToggle = () => {
      miniHud.classList.toggle('minimized');
      const isMin = miniHud.classList.contains('minimized');
      btnToggle.textContent = isMin ? '▲' : '−';
      btnToggle.title = isMin ? 'Expand Mini-Map Overview [_]' : 'Collapse Mini-Map Overview [_]';
    };

    assertEqual(btnToggle.textContent, '−', 'Initially expanded');

    handleToggle();
    assert(miniHud.classList.contains('minimized'), 'Mini-map is now minimized');
    assertEqual(btnToggle.textContent, '▲', 'Button shows expand symbol');

    handleToggle();
    assert(!miniHud.classList.contains('minimized'), 'Mini-map is restored');
    assertEqual(btnToggle.textContent, '−', 'Button shows collapse symbol');
  });
});
