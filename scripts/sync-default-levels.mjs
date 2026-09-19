import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tutorialFiles = [
  'levels/tutorial/tutorial_1.json',
  'levels/tutorial/tutorial_2.json',
  'levels/tutorial/tutorial_3.json',
  'levels/tutorial/tutorial_4.json',
  'levels/tutorial/tutorial_5.json',
  'levels/tutorial/tutorial_6.json',
];

const campaignFiles = [
  'levels/zone_1/level_1.json',
  'levels/zone_1/level_2.json',
  'levels/zone_1/level_3.json',
  'levels/zone_1/level_4.json',
  'levels/zone_1/level_5.json',
  'levels/zone_2/level_6.json',
  'levels/zone_2/level_7.json',
  'levels/zone_2/level_8.json',
  'levels/zone_3/level_9.json',
  'levels/zone_3/level_10.json',
];

const tutorials = tutorialFiles.map(f => JSON.parse(fs.readFileSync(path.join(rootDir, f), 'utf-8')));
const campaigns = campaignFiles.map(f => JSON.parse(fs.readFileSync(path.join(rootDir, f), 'utf-8')));

const outputContent = `/**
 * Casual Maze Game - Default Embedded Levels & Tutorials
 * Embedded fallbacks ensuring zero server dependency on GitHub Pages
 */

export const TUTORIAL_LEVELS = Object.freeze(${JSON.stringify(tutorials, null, 2)});

export const CAMPAIGN_LEVELS = Object.freeze(${JSON.stringify(campaigns, null, 2)});
`;

fs.writeFileSync(path.join(rootDir, 'js/levels/default-levels.js'), outputContent, 'utf-8');
console.log('✅ Synchronized js/levels/default-levels.js with levels/ JSON files');
