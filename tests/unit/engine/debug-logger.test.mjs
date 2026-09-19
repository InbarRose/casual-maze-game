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

  it('captures system warnings and error exceptions in event telemetry', () => {
    const logger = new DebugLogger(dummyLevel);
    logger.logWarning({ message: 'Low memory warning', context: { usage: '85%' }, elapsedMs: 150 });
    logger.logError({ message: 'Null reference exception', stack: 'Error at GameLoop.update', source: 'loop', elapsedMs: 300 });

    const payload = logger.buildPayload();
    assertEqual(payload.events.length, 2);
    assertEqual(payload.events[0].type, 'system:warning');
    assertEqual(payload.events[0].message, 'Low memory warning');
    assertEqual(payload.events[1].type, 'system:error');
    assertEqual(payload.events[1].message, 'Null reference exception');
    assertEqual(payload.events[1].source, 'loop');
  });

  it('records camera rotation, riddle interactions, and room transitions', () => {
    const logger = new DebugLogger(dummyLevel);
    logger.logCameraRotation({ fromAngle: 0, toAngle: 90, elapsedMs: 300 });
    logger.logRiddleAction({ action: 'placed', itemId: 'falcon_statue', pedestalId: 'pedestal_air', atX: 4, atY: 4, elapsedMs: 600 });
    logger.logRoomTransition({ fromRoom: 'courtyard', toRoom: 'catacombs', spawn: { x: 2, y: 2 }, elapsedMs: 900 });

    const payload = logger.buildPayload();
    assertEqual(payload.events.length, 3);
    assertEqual(payload.events[0].type, 'camera:rotation');
    assertEqual(payload.events[0].toAngle, 90);
    assertEqual(payload.events[1].type, 'entity:riddle_action');
    assertEqual(payload.events[1].action, 'placed');
    assertEqual(payload.events[2].type, 'room:transition');
    assertEqual(payload.events[2].toRoom, 'catacombs');
  });

  it('constructs a deterministic replay payload from logged step events', () => {
    const logger = new DebugLogger(dummyLevel);
    logger.logStepCompleted({ stepIndex: 1, x: 2, y: 1, elevation: 0, facing: 'right', elapsedMs: 250 });
    logger.logStepCompleted({ stepIndex: 2, x: 2, y: 2, elevation: 0, facing: 'down', elapsedMs: 500 });
    logger.logVictory({ time: 600, steps: 2 }, 600);

    const replay = logger.toReplayPayload();
    assertEqual(replay.schemaVersion, '1.0.0');
    assertEqual(replay.type, 'casual-maze-replay');
    assertEqual(replay.levelId, 'test_level_log');
    assertEqual(replay.actions.length, 2);
    assertEqual(replay.actions[0].direction, 'right');
    assertEqual(replay.actions[1].direction, 'down');
    assertEqual(replay.summary.completed, true);

    const json = logger.exportReplayJSON();
    assert(typeof json === 'string');
    const parsed = JSON.parse(json);
    assertEqual(parsed.actions.length, 2);
  });
});
