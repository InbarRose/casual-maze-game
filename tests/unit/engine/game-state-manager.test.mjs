import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameStateManager } from '../../../js/engine/game-state-manager.js';
import { TILES } from '../../../js/core/constants.js';

describe('Engine > GameStateManager (BL-56, ADR-0035)', () => {
  const sampleLevel = {
    id: 'test_level_1',
    title: 'State Test Sanctuary',
    parSteps: 20,
    parTime: 15,
    layers: {
      ground: [
        [TILES.WALL, TILES.WALL, TILES.WALL],
        [TILES.WALL, TILES.FLOOR, TILES.SECRET_WALL],
        [TILES.WALL, TILES.WALL, TILES.WALL],
      ],
    },
  };

  it('initializes default state and calculates total secrets correctly', () => {
    const sm = new GameStateManager({ level: sampleLevel });
    assertEqual(sm.totalSecrets, 1);
    assertEqual(sm.secretsFound, 0);
    assertEqual(sm.elapsedTime, 0);
    assertEqual(sm.isPaused, false);
    assertEqual(sm.isWon, false);
  });

  it('ticks elapsed time only when running and not paused or won', () => {
    const sm = new GameStateManager({ level: sampleLevel });
    sm.isRunning = true;
    sm.tick(0.5);
    assertEqual(sm.elapsedTime, 500);

    sm.pause();
    assertEqual(sm.isPaused, true);
    sm.tick(0.5);
    assertEqual(sm.elapsedTime, 500); // Unchanged during pause

    sm.resume();
    assertEqual(sm.isPaused, false);
    sm.tick(0.5);
    assertEqual(sm.elapsedTime, 1000);
  });

  it('handles obscuring overlay auto-pause tracking', () => {
    const sm = new GameStateManager({ level: sampleLevel });
    sm.setObscured(true, 'modal-1');
    assertEqual(sm.isPaused, true);
    assert(sm.obscuringOverlays.has('modal-1'));

    sm.setObscured(true, 'modal-2');
    assertEqual(sm.isPaused, true);

    sm.setObscured(false, 'modal-1');
    assertEqual(sm.isPaused, true); // Still obscured by modal-2

    sm.setObscured(false, 'modal-2');
    assertEqual(sm.isPaused, false); // All obscuring overlays cleared
  });

  it('records secrets without duplicate counting', () => {
    const sm = new GameStateManager({ level: sampleLevel });
    assertEqual(sm.recordSecret(2, 1), true);
    assertEqual(sm.secretsFound, 1);
    assertEqual(sm.recordSecret(2, 1), false);
    assertEqual(sm.secretsFound, 1);
  });

  it('calculates performance score accurately across tiers', () => {
    const sm = new GameStateManager({ level: sampleLevel });
    const score = sm.calculatePerformanceScore({
      steps: 10,
      time: 5000,
      secretsFound: 1,
      earnedParSteps: true,
      earnedParTime: true,
      flawless: true,
    });
    // Base 1000 - 100 step penalty - 25 time penalty = 875
    // + 300 (secret) + 250 (parSteps) + 250 (parTime) + 200 (flawless) = 1875
    assertEqual(score, 1875);
  });

  it('completes level and computes medal tiers correctly', () => {
    let victoryReport = null;
    const sm = new GameStateManager({
      level: sampleLevel,
      uiCallbacks: {
        onVictory: (stats) => { victoryReport = stats; },
      },
    });

    const mockPlayer = {
      stepsTaken: 15,
      inventory: ['key_gold'],
    };

    sm.elapsedTime = 10000; // 10s (under par 15s)
    const stats = sm.completeLevel(mockPlayer, { id: 'exit_1' });

    assertEqual(sm.isWon, true);
    assertEqual(stats.earnedParSteps, true);
    assertEqual(stats.earnedParTime, true);
    assertEqual(stats.tier, 'gold');
    assert(victoryReport !== null);
  });

  it('records and returns journal entries without duplicates', () => {
    const sm = new GameStateManager({ level: sampleLevel });
    const entry1 = { title: 'Ancient Inscription', text: 'Beware the shifting tides.' };
    sm.recordJournalEntry(entry1, 5);

    assertEqual(sm.getJournalEntries().length, 1);
    assertEqual(sm.getJournalEntries()[0].title, 'Ancient Inscription');

    // Duplicate addition is ignored
    sm.recordJournalEntry(entry1, 10);
    assertEqual(sm.getJournalEntries().length, 1);
  });
});
