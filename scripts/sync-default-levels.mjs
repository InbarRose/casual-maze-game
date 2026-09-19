import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manifestPath = path.join(rootDir, 'levels', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

const tutorialFiles = manifest.filter(m => m.category === 'tutorial').map(m => m.file);
const campaignFiles = manifest.filter(m => m.category === 'campaign').map(m => m.file);

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
