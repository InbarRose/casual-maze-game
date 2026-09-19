/**
 * User Journey Test: Progressive Campaign & Mechanical Escalation
 * Simulates player progressing through the tiered chapter campaign, reading
 * the Architect's Journal notes, earning par medals, and accumulating stars.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { LevelLoader } from '../../../js/levels/level-loader.js';
import { StorageManager } from '../../../js/core/storage.js';
import { globalEvents } from '../../../js/core/events.js';
import { CAMPAIGN_CHAPTERS } from '../../../js/core/constants.js';
import fs from 'fs';
import path from 'path';

describe('User Journey > Progressive Campaign & Mechanical Escalation', () => {
  it('guides an explorer through Chapter 1, discovering Architect Notes and earning medals', async () => {
    // 1. Verify Campaign Chapters Structure
    assertEqual(CAMPAIGN_CHAPTERS.length, 8, 'Campaign is organized into 8 distinct thematic chapters');
    assertEqual(CAMPAIGN_CHAPTERS[0].id, 'chapter_1');
    assertEqual(CAMPAIGN_CHAPTERS[0].title, 'The Foundation');
    assertEqual(CAMPAIGN_CHAPTERS[1].title, 'The Vertical Dimension');
    assertEqual(CAMPAIGN_CHAPTERS[4].title, 'Rhythm & Danger');
    assertEqual(CAMPAIGN_CHAPTERS[7].title, 'The Shifting Monolith');

    // 2. Load Level 1 JSON
    const level1Raw = JSON.parse(fs.readFileSync(path.resolve('levels/chapter_1/level_1.json'), 'utf8'));
    const level1 = LevelLoader.normalizeLevel(level1Raw);

    assertEqual(level1.id, '1');
    assertEqual(level1.chapter, 'chapter_1');
    assertEqual(level1.parSteps, 35);
    assertEqual(level1.parTime, 20);

    // Verify Signpost exists in level definition
    const signpostEntity = level1.entities.find(e => e.type === 'signpost');
    assert(signpostEntity, 'Signpost entity exists in Level 1');
    assertEqual(signpostEntity.x, 2);
    assertEqual(signpostEntity.y, 1);

    // 3. Set up GameLoop
    const eventsRecorded = [];
    const eventUnsubs = [
      globalEvents.on('signpost:read', (data) => eventsRecorded.push({ type: 'signpost:read', data })),
      globalEvents.on('key:collected', (data) => eventsRecorded.push({ type: 'key:collected', data })),
      globalEvents.on('door:unlocked', (data) => eventsRecorded.push({ type: 'door:unlocked', data })),
      globalEvents.on('level:completed', (data) => eventsRecorded.push({ type: 'level:completed', data })),
    ];

    let victoryAchieved = false;
    let victoryStats = null;

    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        fillText: () => {},
        strokeText: () => {},
        measureText: () => ({ width: 10 }),
        setLineDash: () => {},
        roundRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        drawImage: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
      }),
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    const gameLoop = new GameLoop({
      mainCanvas: mockCanvas,
      minimapCanvas: mockCanvas,
      level: level1,
      uiCallbacks: {
        onVictory: (stats) => {
          victoryAchieved = true;
          victoryStats = stats;
        },
      },
    });

    // 4. Explorer steps onto the adjacent Signpost at (2, 1)
    gameLoop.player.gridX = 2;
    gameLoop.player.gridY = 1;
    gameLoop.player.elevation = 0;
    gameLoop.player.worldX = 2 * 32 + 16;
    gameLoop.player.worldY = 1 * 32 + 16;
    gameLoop.handleCellArrival();

    // Verify Signpost interaction event was dispatched
    const signReadEvent = eventsRecorded.find(e => e.type === 'signpost:read');
    assert(signReadEvent, 'signpost:read event emitted upon arriving at signpost');
    assertEqual(signReadEvent.data.title, "Architect's Note #1");
    assert(signReadEvent.data.text.includes('Every grand labyrinth begins with a single step'));

    // 5. Explorer moves to Key location at (1, 11)
    gameLoop.player.gridX = 1;
    gameLoop.player.gridY = 11;
    gameLoop.player.worldX = 1 * 32 + 16;
    gameLoop.player.worldY = 11 * 32 + 16;
    gameLoop.handleCellArrival();

    const keyEvent = eventsRecorded.find(e => e.type === 'key:collected');
    assert(keyEvent, 'key:collected event emitted upon stepping on key');
    assert(gameLoop.player.hasKey('key_gold_1'), 'Player holds Dungeon Master Key');

    // 6. Explorer unlocks door at (7, 7)
    const door = level1.entities.find(e => e.id === 'door_gold_1');
    assert(door, 'Gold door exists in level');

    // Simulate stepping through door
    gameLoop.player.gridX = 7;
    gameLoop.player.gridY = 7;
    gameLoop.player.worldX = 7 * 32 + 16;
    gameLoop.player.worldY = 7 * 32 + 16;
    gameLoop.handleCellArrival();

    // 7. Explorer steps to exit portal at (13, 13) within par thresholds
    gameLoop.player.gridX = 13;
    gameLoop.player.gridY = 13;
    gameLoop.player.worldX = 13 * 32 + 16;
    gameLoop.player.worldY = 13 * 32 + 16;
    gameLoop.player.stepsTaken = 24; // Less than parSteps: 35
    gameLoop.elapsedTime = 12500;    // 12.5s, less than parTime: 20s

    gameLoop.handleVictory();

    assert(victoryAchieved, 'Level victory achieved upon reaching exit');
    assert(victoryStats.earnedParSteps, 'Explorer achieved Par Steps medal');
    assert(victoryStats.earnedParTime, 'Explorer achieved Par Time speedrunner medal');

    // 8. Verify persistent storage records all 3 medals (Clear, Steps, Time)
    const progress = StorageManager.loadCampaignProgress();
    const record = progress['1'];
    assert(record, 'Level 1 completion saved to StorageManager');
    assertEqual(record.completed, true);
    assertEqual(record.medals.completion, true);
    assertEqual(record.medals.parSteps, true);
    assertEqual(record.medals.parTime, true);

    // 9. Verify Chapter 1 Stars Calculation
    const chapter1Levels = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
    const ch1Stars = StorageManager.getChapterStars(chapter1Levels, progress);
    assertEqual(ch1Stars, 3, 'Chapter 1 awards 3 stars for Level 1 (Clear + Steps + Time)');

    // Cleanup
    gameLoop.destroy();
    for (const unsub of eventUnsubs) unsub();
  });
});
