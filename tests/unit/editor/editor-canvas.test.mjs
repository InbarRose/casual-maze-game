/**
 * Unit Tests: EditorCanvas Grab & Move Subsystem
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { EditorCanvas } from '../../../js/editor/editor-canvas.js';
import { TILES, LAYERS } from '../../../js/core/constants.js';

describe('Editor > EditorCanvas Grab & Move Tool', () => {
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
    id: 'test_grab_move',
    title: 'Grab Test Labyrinth',
    dimensions: { width: 10, height: 10 },
    spawn: { x: 1, y: 1, elevation: 0 },
    testSpawn: { x: 2, y: 2, elevation: 0 },
    exit: { x: 8, y: 8 },
    config: { theme: 'dungeon' },
    layers: {
      ground: Array.from({ length: 10 }, () => Array(10).fill(0)),
      overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
    },
    entities: [
      { id: 'key_emerald_1', type: 'key', name: 'Emerald Key', color: '#34d399', x: 4, y: 4 },
      { id: 'door_emerald_1', type: 'door', name: 'Emerald Gate', color: '#34d399', x: 5, y: 4, requiresKey: 'key_emerald_1' },
      { id: 'lever_1', type: 'lever', name: 'Wall Lever', x: 6, y: 4, targets: [{ x: 7, y: 4, action: 'toggle_tile' }] },
    ],
  });

  it('correctly identifies movable objects (key, door, lever, spawn, test_spawn, exit) at coordinates', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level });

    const keyObj = editorCanvas.findObjectAt(4, 4);
    assert(keyObj !== null, 'Found key entity at (4, 4)');
    assertEqual(keyObj.type, 'entity');
    assertEqual(keyObj.name, 'Emerald Key');

    const doorObj = editorCanvas.findObjectAt(5, 4);
    assert(doorObj !== null, 'Found door entity at (5, 4)');
    assertEqual(doorObj.name, 'Emerald Gate');

    const leverObj = editorCanvas.findObjectAt(6, 4);
    assert(leverObj !== null, 'Found lever entity at (6, 4)');

    const spawnObj = editorCanvas.findObjectAt(1, 1);
    assert(spawnObj !== null, 'Found spawn at (1, 1)');
    assertEqual(spawnObj.type, 'spawn');

    const testSpawnObj = editorCanvas.findObjectAt(2, 2);
    assert(testSpawnObj !== null, 'Found test spawn at (2, 2)');
    assertEqual(testSpawnObj.type, 'test_spawn');

    const exitObj = editorCanvas.findObjectAt(8, 8);
    assert(exitObj !== null, 'Found exit at (8, 8)');
    assertEqual(exitObj.type, 'exit');

    const emptyObj = editorCanvas.findObjectAt(0, 0);
    assertEqual(emptyObj, null, 'Empty tile returns null');
  });

  it('activates move tool and updates canvas cursor state', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level });

    editorCanvas.setTool('move');
    assertEqual(editorCanvas.currentTool, 'move');
    assertEqual(mockCanvas.style.cursor, 'grab');

    editorCanvas.setTool('pencil');
    assertEqual(editorCanvas.currentTool, 'pencil');
    assertEqual(mockCanvas.style.cursor, 'default');
  });

  it('moves grabbed key entity to new coordinates and invokes onObjectMoved', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    let movedEvent = null;

    const editorCanvas = new EditorCanvas({
      canvas: mockCanvas,
      level,
      onObjectMoved: (type, ref, fromX, fromY, toX, toY) => {
        movedEvent = { type, ref, fromX, fromY, toX, toY };
      },
    });

    editorCanvas.setTool('move');

    // Simulate clicking on the key at (4, 4)
    const obj = editorCanvas.findObjectAt(4, 4);
    editorCanvas.isDraggingObject = true;
    editorCanvas.draggedObject = {
      ...obj,
      origX: 4,
      origY: 4,
      currentX: 7,
      currentY: 8,
    };

    // Simulate mouse release
    editorCanvas.handleMouseUp();

    assertEqual(level.entities[0].x, 7, 'Key X updated to 7');
    assertEqual(level.entities[0].y, 8, 'Key Y updated to 8');
    assert(movedEvent !== null, 'onObjectMoved fired');
    assertEqual(movedEvent.fromX, 4);
    assertEqual(movedEvent.fromY, 4);
    assertEqual(movedEvent.toX, 7);
    assertEqual(movedEvent.toY, 8);
    assertEqual(editorCanvas.isDraggingObject, false);
    assertEqual(editorCanvas.draggedObject, null);
  });

  it('calculates Bresenham line coordinates for straight horizontal, vertical, and diagonals', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level });

    // Horizontal line from (1, 1) to (4, 1)
    const hLine = editorCanvas.getLineCoordinates(1, 1, 4, 1);
    assertEqual(hLine.length, 4);
    assertDeepEqual(hLine, [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }]);

    // Vertical line from (2, 2) to (2, 5)
    const vLine = editorCanvas.getLineCoordinates(2, 2, 2, 5);
    assertEqual(vLine.length, 4);
    assertDeepEqual(vLine, [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }]);

    // Diagonal line from (0, 0) to (3, 3)
    const dLine = editorCanvas.getLineCoordinates(0, 0, 3, 3);
    assertEqual(dLine.length, 4);
    assertDeepEqual(dLine, [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }]);
  });

  it('calculates brush stamp footprints for 1x1, 2x2, 3x3, 4x4, and 5x5', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level });

    const b1 = editorCanvas.getBrushCoordinates(5, 5, 1);
    assertEqual(b1.length, 1);

    const b2 = editorCanvas.getBrushCoordinates(5, 5, 2);
    assertEqual(b2.length, 4);

    const b3 = editorCanvas.getBrushCoordinates(5, 5, 3);
    assertEqual(b3.length, 9);

    const b4 = editorCanvas.getBrushCoordinates(5, 5, 4);
    assertEqual(b4.length, 16);

    const b5 = editorCanvas.getBrushCoordinates(5, 5, 5);
    assertEqual(b5.length, 25);
  });

  it('draws a straight wall line using the Line tool from start to end coordinate', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    let paintTriggered = false;

    const editorCanvas = new EditorCanvas({
      canvas: mockCanvas,
      level,
      onTilePaint: () => { paintTriggered = true; },
    });

    editorCanvas.setTool('line');
    editorCanvas.setSelectedTile(TILES.WALL);
    editorCanvas.setBrushSize(1);

    // Mouse down at (1, 3)
    editorCanvas.isDrawingLine = true;
    editorCanvas.lineStartPos = { x: 1, y: 3 };
    editorCanvas.hoverGridPos = { x: 5, y: 3 };

    // Mouse up at (5, 3)
    editorCanvas.handleMouseUp();

    assertEqual(level.layers.ground[3][1], TILES.WALL, 'Wall stamped at (1, 3)');
    assertEqual(level.layers.ground[3][2], TILES.WALL, 'Wall stamped at (2, 3)');
    assertEqual(level.layers.ground[3][3], TILES.WALL, 'Wall stamped at (3, 3)');
    assertEqual(level.layers.ground[3][4], TILES.WALL, 'Wall stamped at (4, 3)');
    assertEqual(level.layers.ground[3][5], TILES.WALL, 'Wall stamped at (5, 3)');
    assertEqual(paintTriggered, true, 'onTilePaint fired after line completion');
    assertEqual(editorCanvas.isDrawingLine, false);
  });

  it('supports zoom level clamping and zoomToFit calculations', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level });

    editorCanvas.setZoom(0.01);
    assertEqual(editorCanvas.zoom, 0.15, 'Zoom clamped to min 0.15x');

    editorCanvas.setZoom(10.0);
    assertEqual(editorCanvas.zoom, 5.0, 'Zoom clamped to max 5.0x');

    editorCanvas.zoomToFit();
    assert(editorCanvas.zoom >= 0.15 && editorCanvas.zoom <= 3.0, 'zoomToFit computed valid zoom level');
  });

  it('selects and triggers inspection for keys, doors, levers, spawn, and exit', () => {
    const mockCanvas = createMockCanvas();
    const level = createTestLevel();
    let inspectedObject = null;

    const editorCanvas = new EditorCanvas({
      canvas: mockCanvas,
      level,
      onEntityClick: (obj) => {
        inspectedObject = obj;
      },
    });

    editorCanvas.setTool('select');

    // Click Key at (4, 4)
    editorCanvas.applyToolAt(4, 4);
    assert(inspectedObject !== null, 'Key inspection triggered');
    assertEqual(inspectedObject.type, 'key');
    assertEqual(inspectedObject.id, 'key_emerald_1');

    // Click Spawn at (1, 1)
    editorCanvas.applyToolAt(1, 1);
    assert(inspectedObject !== null, 'Spawn inspection triggered');
    assertEqual(inspectedObject.type, 'spawn');

    // Click Exit at (8, 8)
    editorCanvas.applyToolAt(8, 8);
    assert(inspectedObject !== null, 'Exit inspection triggered');
    assertEqual(inspectedObject.type, 'exit');
  });

  it('preserves alternative art styles and custom settings on entity models', async () => {
    const { Key } = await import('../../../js/entities/key.js');
    const { Door } = await import('../../../js/entities/door.js');
    const { Lever } = await import('../../../js/entities/lever.js');

    const crystalKey = new Key({
      id: 'k_crys',
      x: 1,
      y: 1,
      style: 'crystal',
      glowEffect: 'pulse',
      color: '#38bdf8',
    });
    assertEqual(crystalKey.style, 'crystal');
    assertEqual(crystalKey.glowEffect, 'pulse');

    const barrierDoor = new Door({
      id: 'd_barrier',
      x: 2,
      y: 2,
      style: 'laser_barrier',
      orientation: 'horizontal',
      color: '#f43f5e',
    });
    assertEqual(barrierDoor.style, 'laser_barrier');
    assertEqual(barrierDoor.orientation, 'horizontal');

    const oneWayLever = new Lever({
      id: 'lev_oneway',
      x: 3,
      y: 3,
      style: 'crystal_switch',
      oneWay: true,
    });
    assertEqual(oneWayLever.style, 'crystal_switch');
    assertEqual(oneWayLever.oneWay, true);
    assertEqual(oneWayLever.state, false);

    // Toggle once -> true
    oneWayLever.toggle({ layers: { ground: [[]], overhead: [[]] } });
    assertEqual(oneWayLever.state, true);

    // Toggle second time -> remains true because oneWay = true
    oneWayLever.toggle({ layers: { ground: [[]], overhead: [[]] } });
    assertEqual(oneWayLever.state, true);
  });
});
