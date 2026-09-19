/**
 * Campaign Chapter 1 Playthrough Suite: The Foundation (Levels 1–4)
 * Validates navigational flow, key-door locks, and win state execution.
 */

import { describe, it } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';

describe('Campaign > Chapter 1: The Foundation (Levels 1–4)', () => {
  const chapter1Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 1 && num <= 4;
  });

  chapter1Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });
});
