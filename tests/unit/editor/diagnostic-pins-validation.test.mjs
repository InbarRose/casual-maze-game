/**
 * Unit Tests: Map Editor Diagnostic Issue Pins & Level Validator Sanity (BL-75, CMP-10)
 */

import { describe, it, beforeEach, assert, assertEqual, setupMocks } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { EditorCanvas } from '../../../js/editor/editor-canvas.js';
import { TILES } from '../../../js/core/constants.js';

describe('Editor > Diagnostics & Issue Pins (BL-75, CMP-10)', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('detects isolated bridge tiles without connections and reports exact coordinates', () => {
    const level = {
      id: 'test_isolated_bridge',
      title: 'Isolated Bridge Test',
      dimensions: { width: 9, height: 9 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 7, y: 7, elevation: 0 },
      layers: {
        ground: Array.from({ length: 9 }, () => Array(9).fill(TILES.FLOOR)),
        overhead: Array.from({ length: 9 }, () => Array(9).fill(0)),
      },
      entities: [],
    };

    // Place an isolated B_EW bridge at (4, 4) with no ramps or neighbors
    level.layers.overhead[4][4] = TILES.BRIDGE_EW;

    const report = LevelValidator.validate(level);
    assertEqual(report.valid, true); // Warning, not blocker

    const bridgeWarn = report.warnings.find(w => w.message.includes('Isolated bridge tile'));
    assert(bridgeWarn, 'Should find isolated bridge warning');
    assertEqual(bridgeWarn.x, 4);
    assertEqual(bridgeWarn.y, 4);
    assertEqual(bridgeWarn.z, 1);
  });

  it('detects directional ramps pointing into solid walls and reports coordinates', () => {
    const level = {
      id: 'test_ramp_wall',
      title: 'Ramp Into Wall Test',
      dimensions: { width: 9, height: 9 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 7, y: 7, elevation: 0 },
      layers: {
        ground: Array.from({ length: 9 }, () => Array(9).fill(TILES.FLOOR)),
        overhead: Array.from({ length: 9 }, () => Array(9).fill(0)),
      },
      entities: [],
    };

    // RAMP_N at (3, 3) leads to (3, 2). Place wall on overhead at (3, 2)
    level.layers.ground[3][3] = TILES.RAMP_N;
    level.layers.overhead[2][3] = TILES.WALL;

    const report = LevelValidator.validate(level);
    const rampWarn = report.warnings.find(w => w.message.includes('leads directly into an overhead solid wall'));
    assert(rampWarn, 'Should find ramp into wall warning');
    assertEqual(rampWarn.x, 3);
    assertEqual(rampWarn.y, 3);
    assertEqual(rampWarn.z, 0);
  });

  it('validates 4-way rotation compatibility for levels with rotation enabled', () => {
    const level = {
      id: 'test_rotation',
      title: 'Rotation Test',
      dimensions: { width: 9, height: 9 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 7, y: 7, elevation: 0 },
      config: { allowRotation: true },
      layers: {
        ground: Array.from({ length: 9 }, () => Array(9).fill(TILES.FLOOR)),
        overhead: Array.from({ length: 9 }, () => Array(9).fill(0)),
      },
      entities: [],
    };

    const res = LevelValidator.checkRotationCompatibility(level);
    assertEqual(res.compatible, true);
    assert(res.notes.some(n => n.includes('Verified 4-way camera rotation')), 'Should include rotation note');

    const report = LevelValidator.validate(level);
    assert(report.info.some(i => i.includes('Verified 4-way camera rotation')), 'Report info should note rotation check');
  });

  it('EditorCanvas manages diagnostic pin lifecycle and centerOnTile correctly', () => {
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    const level = {
      id: 'test_canvas',
      dimensions: { width: 10, height: 10 },
      config: { theme: 'dungeon' },
      layers: {
        ground: Array.from({ length: 10 }, () => Array(10).fill(TILES.FLOOR)),
        overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
      },
      entities: [],
    };

    const canvas = new EditorCanvas({
      canvas: mockCanvas,
      level,
      onTilePaint: () => {},
      onEntityClick: () => {},
    });

    assertEqual(canvas.diagnosticPin, null);

    // Center on specific tile (5, 5)
    canvas.centerOnTile(5, 5);
    const effTile = canvas.getEffectiveTileSize();
    assertEqual(canvas.panX, Math.round(400 - 5.5 * effTile));
    assertEqual(canvas.panY, Math.round(300 - 5.5 * effTile));

    // Set diagnostic pin
    canvas.setDiagnosticPin({
      x: 3,
      y: 4,
      z: 1,
      message: 'Orphan bridge span',
      type: 'warning',
    });

    assert(canvas.diagnosticPin, 'Pin should be set');
    assertEqual(canvas.diagnosticPin.x, 3);
    assertEqual(canvas.diagnosticPin.y, 4);
    assertEqual(canvas.diagnosticPin.type, 'warning');

    // Clear diagnostic pin
    canvas.clearDiagnosticPin();
    assertEqual(canvas.diagnosticPin, null);
  });
});
