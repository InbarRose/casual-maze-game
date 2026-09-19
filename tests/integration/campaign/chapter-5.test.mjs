/**
 * Campaign Chapter 5 Playthrough Suite: Rhythm & Danger (Levels 17–20)
 * Validates cyclical flame vents and waypoint sentry patrols in molten chambers.
 */

import { describe, it } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';

describe('Campaign > Chapter 5: Rhythm & Danger (Levels 17–20)', () => {
  const chapter5Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 17 && num <= 20;
  });

  chapter5Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });
});
