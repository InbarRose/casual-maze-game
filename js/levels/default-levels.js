/**
 * Casual Maze Game - Default Embedded Levels Aggregator
 * Re-exports modular tutorial and chapter datasets with 100% backward compatibility.
 */

import { TUTORIAL_LEVELS } from './tutorials.js';
import { CAMPAIGN_CH1_LEVELS } from './campaign-ch1.js';
import { CAMPAIGN_CH2_LEVELS } from './campaign-ch2.js';
import { CAMPAIGN_CH3_LEVELS } from './campaign-ch3.js';
import { CAMPAIGN_CH4_LEVELS } from './campaign-ch4.js';
import { CAMPAIGN_CH5_LEVELS } from './campaign-ch5.js';
import { CAMPAIGN_CH6_LEVELS } from './campaign-ch6.js';
import { CAMPAIGN_CH7_LEVELS } from './campaign-ch7.js';

import { STORYLINES, getStoryline, getStoryChapter, getNextStoryChapter, getAllStoryLevels } from '../stories/storylines.js';

export { TUTORIAL_LEVELS, STORYLINES, getStoryline, getStoryChapter, getNextStoryChapter, getAllStoryLevels };

export const CAMPAIGN_LEVELS = Object.freeze([
  ...CAMPAIGN_CH1_LEVELS,
  ...CAMPAIGN_CH2_LEVELS,
  ...CAMPAIGN_CH3_LEVELS,
  ...CAMPAIGN_CH4_LEVELS,
  ...CAMPAIGN_CH5_LEVELS,
  ...CAMPAIGN_CH6_LEVELS,
  ...CAMPAIGN_CH7_LEVELS,
]);

