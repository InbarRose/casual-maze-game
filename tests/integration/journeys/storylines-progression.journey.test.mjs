/**
 * User Journey: Storylines Progression & Thematic Quests
 *
 * Validates the complete player progression through both official storylines:
 * 1. "The Novice's Initiation" (6 Chapters)
 * 2. "Relics of the Four Guardians" (3 Chapters: lore notes, respawn beacons, carryable statues & riddle pedestals)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { resetStorageMocks, createMockCanvas } from '../../harness/mocks.mjs';
import {
  STORYLINES,
  getStoryline,
  getStoryChapter,
  getNextStoryChapter,
} from '../../../js/stories/storylines.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { StorageManager } from '../../../js/core/storage.js';
import { CollisionEngine } from '../../../js/engine/collision.js';

describe('User Journey > Storylines Progression & Thematic Quests', () => {
  it('progresses through "The Novice\'s Initiation" saga to completion', () => {
    resetStorageMocks();
    const mainCanvas = createMockCanvas(800, 600);
    const minimapCanvas = createMockCanvas(200, 200);

    const story = getStoryline('novice_initiation');
    assertEqual(story.totalChapters, 6);

    for (let ch = 1; ch <= 6; ch++) {
      const chapterLevel = getStoryChapter('novice_initiation', ch);
      assert(chapterLevel !== null, `Novice Chapter ${ch} loaded`);

      const loop = new GameLoop({ mainCanvas, minimapCanvas, level: chapterLevel });
      assertEqual(loop.player.gridX, chapterLevel.spawn.x);
      assertEqual(loop.player.gridY, chapterLevel.spawn.y);

      // Simulate player reaching exit and triggering victory
      loop.player.gridX = chapterLevel.exit.x;
      loop.player.gridY = chapterLevel.exit.y;
      loop.handleCellArrival();

      // Save chapter completion
      StorageManager.saveStoryProgress('novice_initiation', ch, { time: 3000 + ch * 500, steps: 10 + ch * 4 });

      const nextInfo = getNextStoryChapter('novice_initiation', ch);
      if (ch < 6) {
        assertEqual(nextInfo.hasNext, true);
        assertEqual(nextInfo.nextChapterNumber, ch + 1);
        assertEqual(nextInfo.isStoryComplete, false);
      } else {
        assertEqual(nextInfo.hasNext, false);
        assertEqual(nextInfo.isStoryComplete, true);
      }
      loop.stop();
    }

    assertEqual(StorageManager.getStoryCompletedCount('novice_initiation'), 6, 'All 6 Novice chapters completed');
  });

  it('progresses through "Relics of the Four Guardians" riddle saga to completion', () => {
    resetStorageMocks();
    const mainCanvas = createMockCanvas(800, 600);
    const minimapCanvas = createMockCanvas(200, 200);

    const story = getStoryline('relics_of_the_guardians');
    assertEqual(story.totalChapters, 3);

    // ========================================================
    // CHAPTER 1: The Whispering Ruins
    // ========================================================
    const ch1 = getStoryChapter('relics_of_the_guardians', 1);
    const loop1 = new GameLoop({ mainCanvas, minimapCanvas, level: ch1 });

    // 1. Inspect note at (1, 2) while at (1, 1) facing South
    loop1.player.gridX = 1;
    loop1.player.gridY = 1;
    loop1.player.facing = 'S';
    let inspectedLore = null;
    loop1.uiCallbacks.onWallDecorInspected = (data) => {
      inspectedLore = data;
    };
    loop1.handleManualInteract();
    assert(inspectedLore !== null, 'Wall decor note inspected');
    assert(inspectedLore.text.includes('Four Guardians'));


    // 2. Collect Sun gem at (3, 1)
    loop1.player.gridX = 3;
    loop1.player.gridY = 1;
    loop1.handleCellArrival();
    assert(loop1.player.score > 0, 'Bonus gem increases score');

    // 3. Activate checkpoint beacon at (5, 1)
    loop1.player.gridX = 5;
    loop1.player.gridY = 1;
    loop1.handleCellArrival();
    const chk = loop1.entities.find(e => e.id === 'chk_ruins_beacon');
    assertEqual(chk.isActivated, true, 'Ruins beacon checkpoint activated');

    // 4. Collect gold key at (9, 1)
    loop1.player.gridX = 9;
    loop1.player.gridY = 1;
    loop1.handleCellArrival();
    assert(loop1.player.inventory.includes('key_ruins_gold'), 'Gold key collected');

    // 5. Unlock sun gate at (5, 6)
    const door1 = loop1.entities.find(e => e.id === 'door_ruins_gold');
    assertEqual(door1.isOpen, false);
    loop1.player.gridX = 5;
    loop1.player.gridY = 5;
    loop1.player.facing = 'S';
    const moved = loop1.tryMove(5, 6);
    assert(moved, 'Door unlocks with gold key');
    assertEqual(door1.isOpen, true, 'Sun gate is now open');

    // 6. Reach exit at (9, 9)
    loop1.player.gridX = 9;
    loop1.player.gridY = 9;
    loop1.handleCellArrival();
    StorageManager.saveStoryProgress('relics_of_the_guardians', 1, { time: 8200, steps: 22 });
    loop1.stop();


    const nextFrom1 = getNextStoryChapter('relics_of_the_guardians', 1);
    assertEqual(nextFrom1.hasNext, true);
    assertEqual(nextFrom1.nextChapterNumber, 2);

    // ========================================================
    // CHAPTER 2: The Falcon's Plinth
    // ========================================================
    const ch2 = getStoryChapter('relics_of_the_guardians', 2);
    const loop2 = new GameLoop({ mainCanvas, minimapCanvas, level: ch2 });

    // 1. Pick up Falcon Statue at (1, 5)
    loop2.player.gridX = 1;
    loop2.player.gridY = 5;
    const falconStatue = loop2.entities.find(e => e.id === 'statue_falcon');
    assertEqual(falconStatue.isCarried, false);
    loop2.handleCellArrival();
    assertEqual(falconStatue.isCarried, true, 'Falcon statue picked up');
    assertEqual(loop2.player.carriedRiddleItem.id, 'statue_falcon');

    // 2. Bring statue to Sky Plinth at (7, 3)
    loop2.player.gridX = 7;
    loop2.player.gridY = 2;
    loop2.player.facing = 'S';
    const ped2 = loop2.entities.find(e => e.id === 'ped_falcon');
    assertEqual(ped2.isSatisfied(), false);

    // Place statue on pedestal
    loop2.handleManualInteract();
    assertEqual(ped2.isSatisfied(), true, 'Falcon statue placed on plinth');
    assertEqual(loop2.player.carriedRiddleItem, null, 'Player hands empty');

    // Verify terrace gate unlocked
    const gate2 = loop2.entities.find(e => e.id === 'door_terrace_gate');
    assertEqual(gate2.isOpen, true, 'Terrace gate opened by pedestal satisfaction');

    // 3. Reach exit at (9, 9)
    loop2.player.gridX = 9;
    loop2.player.gridY = 9;
    loop2.handleCellArrival();
    StorageManager.saveStoryProgress('relics_of_the_guardians', 2, { time: 10400, steps: 28 });
    loop2.stop();

    const nextFrom2 = getNextStoryChapter('relics_of_the_guardians', 2);
    assertEqual(nextFrom2.hasNext, true);
    assertEqual(nextFrom2.nextChapterNumber, 3);

    // ========================================================
    // CHAPTER 3: Sanctum of the Four Guardians
    // ========================================================
    const ch3 = getStoryChapter('relics_of_the_guardians', 3);
    const loop3 = new GameLoop({ mainCanvas, minimapCanvas, level: ch3 });

    const pedSky = loop3.entities.find(e => e.id === 'ped_sky');
    const pedFire = loop3.entities.find(e => e.id === 'ped_fire');
    const pedWater = loop3.entities.find(e => e.id === 'ped_water');
    const pedEarth = loop3.entities.find(e => e.id === 'ped_earth');
    const sanctumGate = loop3.entities.find(e => e.id === 'door_sanctum_gate');

    assertEqual(sanctumGate.isOpen, false, 'Golden sanctum gate locked');

    // Retrieve Falcon -> Plinth of Winds
    loop3.player.gridX = 1;
    loop3.player.gridY = 3;
    loop3.handleCellArrival();
    assertEqual(loop3.player.carriedRiddleItem.id, 'riddle_falcon_s3');
    loop3.player.gridX = 5;
    loop3.player.gridY = 6;
    loop3.player.facing = 'S';
    loop3.handleManualInteract();
    assertEqual(pedSky.isSatisfied(), true);

    // Retrieve Lion -> Plinth of Sun
    loop3.player.gridX = 1;
    loop3.player.gridY = 11;
    loop3.handleCellArrival();
    assertEqual(loop3.player.carriedRiddleItem.id, 'riddle_lion_s3');
    loop3.player.gridX = 6;
    loop3.player.gridY = 6;
    loop3.player.facing = 'S';
    loop3.handleManualInteract();
    assertEqual(pedFire.isSatisfied(), true);

    // Retrieve Serpent -> Plinth of Waters
    loop3.player.gridX = 13;
    loop3.player.gridY = 3;
    loop3.handleCellArrival();
    assertEqual(loop3.player.carriedRiddleItem.id, 'riddle_serpent_s3');
    loop3.player.gridX = 8;
    loop3.player.gridY = 6;
    loop3.player.facing = 'S';
    loop3.handleManualInteract();
    assertEqual(pedWater.isSatisfied(), true);

    // Door still locked with 3 of 4 statues
    assertEqual(sanctumGate.isOpen, false, 'Sanctum gate remains locked before 4th statue');

    // Retrieve Bear -> Plinth of Mountains
    loop3.player.gridX = 13;
    loop3.player.gridY = 11;
    loop3.handleCellArrival();
    assertEqual(loop3.player.carriedRiddleItem.id, 'riddle_bear_s3');
    loop3.player.gridX = 9;
    loop3.player.gridY = 6;
    loop3.player.facing = 'S';
    loop3.handleManualInteract();
    assertEqual(pedEarth.isSatisfied(), true);

    // All 4 pedestals now satisfied -> sanctum gate opens!
    assertEqual(sanctumGate.isOpen, true, 'All 4 pedestals satisfied -> Golden Sanctum Gate unlocked!');

    // Reach exit at (7, 13)
    loop3.player.gridX = 7;
    loop3.player.gridY = 13;
    loop3.handleCellArrival();
    StorageManager.saveStoryProgress('relics_of_the_guardians', 3, { time: 18500, steps: 48 });
    loop3.stop();


    const nextFrom3 = getNextStoryChapter('relics_of_the_guardians', 3);
    assertEqual(nextFrom3.hasNext, false);
    assertEqual(nextFrom3.isStoryComplete, true, 'Final chapter completed -> isStoryComplete is true');

    assertEqual(StorageManager.getStoryCompletedCount('relics_of_the_guardians'), 3, 'All 3 Guardians chapters completed');
  });
});
