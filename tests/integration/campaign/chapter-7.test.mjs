/**
 * Campaign Chapter 7 Playthrough Suite: Grand Synthesis (Levels 25–28)
 * Validates the synthesis of 3D geometry, warps, levers, sentries, and puzzles.
 */

import { describe, it } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';

describe('Campaign > Chapter 7: Grand Synthesis (Levels 25–28)', () => {
  const chapter7Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 25 && num <= 28;
  });

  chapter7Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });
});
