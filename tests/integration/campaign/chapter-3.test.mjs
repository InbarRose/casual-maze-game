/**
 * Campaign Chapter 3 Playthrough Suite: Shifting Architecture (Levels 9–12)
 * Validates clockwork levers, mutating wall barriers, and pathway inversions.
 */

import { describe, it } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';

describe('Campaign > Chapter 3: Shifting Architecture (Levels 9–12)', () => {
  const chapter3Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 9 && num <= 12;
  });

  chapter3Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });
});
