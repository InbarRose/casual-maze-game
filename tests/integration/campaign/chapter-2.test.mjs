/**
 * Campaign Chapter 2 Playthrough Suite: Verticality & Elevation (Levels 5–8)
 * Validates directional ramps, elevated bridges, and multi-layer paths.
 */

import { describe, it } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';

describe('Campaign > Chapter 2: Verticality & Elevation (Levels 5–8)', () => {
  const chapter2Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 5 && num <= 8;
  });

  chapter2Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });
});
