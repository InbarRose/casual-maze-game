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
});
