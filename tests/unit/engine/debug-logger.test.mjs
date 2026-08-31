/**
 * Unit Tests: DebugLogger Subsystem & Replay Schema Export
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { DebugLogger } from '../../../js/engine/debug-logger.js';

describe('Engine > DebugLogger', () => {
  const dummyLevel = {
    id: 'test_level_log',
    title: 'Logger Test Arena',
    version: 1,
    dimensions: { width: 10, height: 10 },
  };

  it('records structured gameplay event stream with timestamps', () => {
    const logger = new DebugLogger(dummyLevel);
    logger.log('game:start', { spawn: { x: 1, y: 1, elevation: 0 } }, 0);

    logger.logMoveAttempt({
      fromX: 1,
      fromY: 1,
      fromElevation: 0,
      toX: 2,
      toY: 1,
      allowed: true,
      nextElevation: 0,
      elapsedMs: 200,
    });

    logger.logKeyCollected({
      keyId: 'key_gold_1',
      keyName: 'Golden Key',
      color: '#fbbf24',
      atX: 2,
      atY: 1,
      inventory: ['key_gold_1'],
      elapsedMs: 400,
    });

    logger.logDoorUnlocked({
      doorId: 'door_gold_1',
      keyUsed: 'key_gold_1',
      atX: 3,
      atY: 1,
      elapsedMs: 600,
    });

    logger.logElevationChange({
      fromElevation: 0,
      toElevation: 1,
      atX: 5,
      atY: 1,
      triggerTile: 'R_E',
      elapsedMs: 900,
    });

    logger.logVictory({ time: 1200, steps: 5 }, 1200);

    const payload = logger.buildPayload();
    assertEqual(payload.schemaVersion, '1.0.0', 'Schema version is 1.0.0');
    assertEqual(payload.level.id, 'test_level_log');
    assertEqual(payload.summary.completed, true, 'Records completion');
    assertEqual(payload.events.length, 6, 'Contains 6 logged events');
    assertEqual(payload.events[0].type, 'game:start');
    assertEqual(payload.events[5].type, 'game:victory');
  });

  it('serializes cleanly to valid parseable JSON via exportJSON()', () => {
    const logger = new DebugLogger(dummyLevel);
    logger.log('game:start', { spawn: { x: 1, y: 1 } }, 0);
    logger.logVictory({ time: 500, steps: 2 }, 500);

    const json = logger.exportJSON();
    assert(typeof json === 'string', 'exportJSON returns a string');

    const parsed = JSON.parse(json);
    assertEqual(parsed.summary.completed, true);
    assert(parsed.sessionId !== undefined, 'Contains unique sessionId');
  });
});
