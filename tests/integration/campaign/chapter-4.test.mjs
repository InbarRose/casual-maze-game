/**
 * Campaign Chapter 4 Playthrough Suite: Astral Anomalies (Levels 13–16)
 * Validates dimensional portal teleporters warping across disconnected chambers.
 */

import { describe, it } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';

describe('Campaign > Chapter 4: Astral Anomalies (Levels 13–16)', () => {
  const chapter4Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 13 && num <= 16;
  });

  chapter4Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });
});
