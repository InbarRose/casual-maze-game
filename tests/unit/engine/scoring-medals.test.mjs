/**
 * Unit Tests: Performance Scoring & Tiered Victory Medals (BL-52)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { StorageManager } from '../../../js/core/storage.js';

describe('Engine > Performance Scoring & Tiered Victory Medals (BL-52)', () => {
  it('calculates deterministic performance score with par bonuses and secret bonuses', () => {
    const mockCanvas = {
      width: 400,
      height: 400,
      getContext: () => ({ fillRect: () => {}, strokeRect: () => {}, save: () => {}, restore: () => {} }),
    };

    const level = {
      id: 'test_score_level',
      title: 'Scoring Arena',
      dimensions: { width: 5, height: 5 },
      spawn: { x: 1, y: 1 },
      exit: { x: 3, y: 3 },
      parSteps: 10,
      parTime: 15,
      layers: { ground: [[1, 1, 1], [1, 0, 1], [1, 1, 1]], overhead: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
      entities: [],
    };

    const game = new GameLoop({
      mainCanvas: mockCanvas,
      minimapCanvas: mockCanvas,
      level,
    });

    // 1. Perfect run: 8 steps, 6000ms (6s), earnedParSteps = true, earnedParTime = true, 1 secret, flawless
    const perfectStats = {
      steps: 8,
      time: 6000,
      earnedParSteps: true,
      earnedParTime: true,
      secretsFound: 1,
      flawless: true,
    };
    // Expected:
    // Base: 1000 - (8 * 10) - (6 * 5) = 1000 - 80 - 30 = 890
    // Secret: 1 * 300 = 300
    // ParSteps: 250
    // ParTime: 250
    // Flawless: 200
    // Total: 890 + 300 + 250 + 250 + 200 = 1890
    const perfectScore = game.calculatePerformanceScore(perfectStats);
    assertEqual(perfectScore, 1890, 'Computes correct score for flawless run with par goals & secret');

    // 2. Slow run with high step count (penalties clamped to zero base)
    const heavyRunStats = {
      steps: 150,
      time: 120000, // 120s
      earnedParSteps: false,
      earnedParTime: false,
      secretsFound: 0,
      flawless: false,
    };
    // Base score clamps to 0
    const heavyScore = game.calculatePerformanceScore(heavyRunStats);
    assertEqual(heavyScore, 0, 'Score does not drop below 0 when heavily penalized');

    game.stop();
  });

  it('determines Tiered Victory Medals (Gold, Silver, Bronze)', () => {
    // StorageManager.saveLevelCompletion evaluates medal tiers
    const levelId = 'test_medal_level';

    // 1. Gold: Completed + Both Par Goals Met
    StorageManager.saveLevelCompletion(levelId, {
      time: 5000,
      steps: 8,
      earnedParSteps: true,
      earnedParTime: true,
      secretsFound: 0,
      totalSecrets: 0,
      flawless: true,
    });

    const prog1 = StorageManager.loadCampaignProgress();
    assertEqual(prog1[levelId]?.medals?.tier, 'gold', 'Awards Gold Medal when both par goals are met');

    // 2. Silver: Only 1 Par Goal Met
    const levelId2 = 'test_medal_level_2';
    StorageManager.saveLevelCompletion(levelId2, {
      time: 25000,
      steps: 8,
      earnedParSteps: true,
      earnedParTime: false,
      secretsFound: 0,
      totalSecrets: 0,
      flawless: false,
    });

    const prog2 = StorageManager.loadCampaignProgress();
    assertEqual(prog2[levelId2]?.medals?.tier, 'silver', 'Awards Silver Medal when at least 1 par goal is met');

    // 3. Bronze: Level completed with no par goals or secrets
    const levelId3 = 'test_medal_level_3';
    StorageManager.saveLevelCompletion(levelId3, {
      time: 60000,
      steps: 99,
      earnedParSteps: false,
      earnedParTime: false,
      secretsFound: 0,
      totalSecrets: 0,
      flawless: false,
    });

    const prog3 = StorageManager.loadCampaignProgress();
    assertEqual(prog3[levelId3]?.medals?.tier, 'bronze', 'Awards Bronze Medal on baseline completion');
  });

  it('awards Secret Sleuth badge and prestige star when all level secrets are found', () => {
    const levelId = 'test_secret_sleuth';
    StorageManager.saveLevelCompletion(levelId, {
      time: 10000,
      steps: 20,
      earnedParSteps: false,
      earnedParTime: false,
      secretsFound: 2,
      totalSecrets: 2,
      flawless: true,
    });

    const prog = StorageManager.loadCampaignProgress();
    assertEqual(prog[levelId]?.medals?.secretSleuth, true, 'Awards Secret Sleuth medal');
    assertEqual(prog[levelId]?.bestSecrets, 2, 'Persists bestSecrets discovered');
  });
});
