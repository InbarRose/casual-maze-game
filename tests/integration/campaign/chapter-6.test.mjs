/**
 * Campaign Chapter 6 Playthrough Suite: Arcane Seals (Levels 21–24)
 * Validates cipher dials and memory runes minigames unlocking celestial gates.
 */

import { describe, it } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';

describe('Campaign > Chapter 6: Arcane Seals (Levels 21–24)', () => {
  const chapter6Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 21 && num <= 24;
  });

  chapter6Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });
});
