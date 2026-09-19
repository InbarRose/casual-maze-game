import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manifestPath = path.join(rootDir, 'levels', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// 1. Tutorials
const tutorialFiles = manifest.filter(m => m.category === 'tutorial').map(m => m.file);
const tutorials = tutorialFiles.map(f => JSON.parse(fs.readFileSync(path.join(rootDir, f), 'utf-8')));

const tutorialContent = `/**
 * Casual Maze Game - Tutorial Levels
 */

export const TUTORIAL_LEVELS = Object.freeze(${JSON.stringify(tutorials, null, 2)});
`;
fs.writeFileSync(path.join(rootDir, 'js/levels/tutorials.js'), tutorialContent, 'utf-8');

// 2. Campaign Chapters 1 through 7
for (let ch = 1; ch <= 7; ch++) {
  const chapterKey = `chapter_${ch}`;
  const chapterFiles = manifest
    .filter(m => m.category === 'campaign' && m.chapter === chapterKey)
    .map(m => m.file);
  const chapterLevels = chapterFiles.map(f => JSON.parse(fs.readFileSync(path.join(rootDir, f), 'utf-8')));

  const chapterContent = `/**
 * Casual Maze Game - Campaign Chapter ${ch} Levels
 */

export const CAMPAIGN_CH${ch}_LEVELS = Object.freeze(${JSON.stringify(chapterLevels, null, 2)});
`;
  fs.writeFileSync(path.join(rootDir, `js/levels/campaign-ch${ch}.js`), chapterContent, 'utf-8');
}

// 3. Combined Aggregator default-levels.js
const aggregatorContent = `/**
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

export { TUTORIAL_LEVELS };

export const CAMPAIGN_LEVELS = Object.freeze([
  ...CAMPAIGN_CH1_LEVELS,
  ...CAMPAIGN_CH2_LEVELS,
  ...CAMPAIGN_CH3_LEVELS,
  ...CAMPAIGN_CH4_LEVELS,
  ...CAMPAIGN_CH5_LEVELS,
  ...CAMPAIGN_CH6_LEVELS,
  ...CAMPAIGN_CH7_LEVELS,
]);
`;

fs.writeFileSync(path.join(rootDir, 'js/levels/default-levels.js'), aggregatorContent, 'utf-8');
console.log('✅ Successfully generated modular js/levels/ files and default-levels.js aggregator');
