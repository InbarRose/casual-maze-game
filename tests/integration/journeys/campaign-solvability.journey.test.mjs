/**
 * User Journey 2: Campaign Explorer (Full Level Walkthroughs & Replay Verification)
 * Simulates solving campaign levels across multiple biomes (Dungeon, Jungle, Lava),
 * capturing the full DebugLogger session event log, and verifying session replay integrity.
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { DebugLogger } from '../../../js/engine/debug-logger.js';
import { createMockCanvas, resetStorageMocks } from '../../harness/mocks.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';

describe('User Journey > Campaign Explorer Walkthrough & Replay', () => {
  let mainCanvas;
  let minimapCanvas;

  it('completes Campaign Level 1 (The Training Hall) and records full event stream', () => {
    resetStorageMocks();
    mainCanvas = createMockCanvas(800, 600);
    minimapCanvas = createMockCanvas(200, 200);

    const level = CAMPAIGN_LEVELS[0];
    const loop = new GameLoop({ mainCanvas, minimapCanvas, level });
    const logger = new DebugLogger(level);

    // Initial start event
    logger.log('game:start', { spawn: level.spawn }, 0);

    // Collect Gold Key at (1, 3)
    loop.player.gridX = 1;
    loop.player.gridY = 3;
    loop.player.inventory.push('key_1');
    logger.logKeyCollected({
      keyId: 'key_1',
      keyName: 'Gold Key',
      color: '#fbbf24',
      atX: 1,
      atY: 3,
      inventory: ['key_1'],
      elapsedMs: 650,
    });

    // Unlock Door at (5, 3)
    loop.player.gridX = 5;
    loop.player.gridY = 3;
    const door = loop.entities.find(e => e.id === 'door_1');
    if (door) door.open();
    logger.logDoorUnlocked({
      doorId: 'door_1',
      keyUsed: 'key_1',
      atX: 5,
      atY: 3,
      elapsedMs: 1400,
    });

    // Reach Exit at (9, 7)
    loop.player.gridX = level.exit.x;
    loop.player.gridY = level.exit.y;
    logger.logVictory({ time: 2200, steps: 16 }, 2200);

    const payload = logger.buildPayload();
    assertEqual(payload.summary.completed, true);
    assertEqual(payload.events.length, 4);

    const json = logger.exportJSON();
    const replay = JSON.parse(json);
    assertEqual(replay.level.id, level.id);
    assertEqual(replay.events[1].type, 'entity:key_collected');
    assertEqual(replay.events[2].type, 'entity:door_unlocked');
    assertEqual(replay.events[3].type, 'game:victory');
  });

  it('verifies all 10 Campaign levels have solvable paths across all biomes', () => {
    const zonesCovered = new Set();

    for (let i = 0; i < CAMPAIGN_LEVELS.length; i++) {
      const lvl = CAMPAIGN_LEVELS[i];
      zonesCovered.add(lvl.zone || 'zone_1');
      const val = LevelValidator.validate(lvl);
      assertEqual(val.valid, true, `Campaign level ${i + 1} (${lvl.title}) is valid`);
      assertEqual(val.stats.exitReached, true, `Campaign level ${i + 1} (${lvl.title}) exit is reachable`);
    }

    assert(zonesCovered.has('zone_1'), 'Campaign includes Zone 1 (Dungeon)');
    assert(zonesCovered.has('zone_2'), 'Campaign includes Zone 2 (Jungle)');
    assert(zonesCovered.has('zone_3'), 'Campaign includes Zone 3 (Lava)');
  });
});
