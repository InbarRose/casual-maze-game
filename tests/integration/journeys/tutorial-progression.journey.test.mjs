/**
 * User Journey 1: Novice Player Tutorial Academy Onboarding
 * Simulates a first-time player playing through all 6 tutorial levels in sequence,
 * validating mechanics, step progression, level completion, and storage persistence.
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { TUTORIAL_LEVELS } from '../../../js/levels/default-levels.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { StorageManager } from '../../../js/core/storage.js';
import { resetStorageMocks, createMockCanvas } from '../../harness/mocks.mjs';
import { CollisionEngine } from '../../../js/engine/collision.js';

describe('User Journey > Novice Player Tutorial Academy', () => {
  let mainCanvas;
  let minimapCanvas;

  it('progresses through the entire 6-level Tutorial Academy seamlessly', () => {
    resetStorageMocks();
    mainCanvas = createMockCanvas(800, 600);
    minimapCanvas = createMockCanvas(200, 200);

    // --- Tutorial 1: First Steps (Basic Movement) ---
    const tut1 = TUTORIAL_LEVELS[0];
    const loop1 = new GameLoop({ mainCanvas, minimapCanvas, level: tut1 });
    assertEqual(loop1.player.gridX, 1);
    assertEqual(loop1.player.gridY, 1);

    // Navigate path through winding corridor to (7, 7)
    const tut1Path = [
      { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
      { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 },
      { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 },
      { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 },
    ];

    let steps1 = 0;
    for (const step of tut1Path) {
      const move = CollisionEngine.checkMove(
        loop1.player.gridX,
        loop1.player.gridY,
        step.x,
        step.y,
        loop1.player.elevation,
        loop1.level,
        loop1.entities,
        loop1.player.inventory
      );
      assert(move.allowed, `Step to (${step.x}, ${step.y}) allowed in Tutorial 1`);
      loop1.player.gridX = step.x;
      loop1.player.gridY = step.y;
      steps1++;
    }
    assertEqual(loop1.player.gridX, tut1.exit.x);
    assertEqual(loop1.player.gridY, tut1.exit.y);
    StorageManager.saveLevelCompletion('tutorial_1', { time: 2500, steps: steps1 });

    // --- Tutorial 2: Keys & Colored Gates ---
    const tut2 = TUTORIAL_LEVELS[1];
    const loop2 = new GameLoop({ mainCanvas, minimapCanvas, level: tut2 });

    // Player cannot bypass Red Door at (1, 5) without ruby key
    const blockedByRed = CollisionEngine.checkMove(1, 4, 1, 5, 0, loop2.level, loop2.entities, loop2.player.inventory);
    assertEqual(blockedByRed.allowed, false, 'Red door blocks passage initially');

    // Move to collect Ruby Key at (3, 3)
    loop2.player.gridX = 3;
    loop2.player.gridY = 3;
    loop2.player.inventory.push('key_red_t2');
    assertEqual(loop2.player.inventory.includes('key_red_t2'), true);

    // Unlock Red Door at (1, 5)
    const unlockRed = CollisionEngine.checkMove(1, 4, 1, 5, 0, loop2.level, loop2.entities, loop2.player.inventory);
    assertEqual(unlockRed.allowed, true, 'Red door unlocked by Ruby Key');
    loop2.entities.find(e => e.id === 'door_red_t2').open();

    // Move to collect Sapphire Key at (7, 3)
    loop2.player.gridX = 7;
    loop2.player.gridY = 3;
    loop2.player.inventory.push('key_blue_t2');
    assertEqual(loop2.player.inventory.includes('key_blue_t2'), true);

    // Unlock Sapphire Door at (7, 7) and reach Exit at (9, 9)
    const unlockBlue = CollisionEngine.checkMove(7, 6, 7, 7, 0, loop2.level, loop2.entities, loop2.player.inventory);
    assertEqual(unlockBlue.allowed, true, 'Blue door unlocked by Sapphire Key');
    loop2.entities.find(e => e.id === 'door_blue_t2').open();
    loop2.player.gridX = tut2.exit.x;
    loop2.player.gridY = tut2.exit.y;
    StorageManager.saveLevelCompletion('tutorial_2', { time: 4500, steps: 18 });

    // --- Tutorial 3: Mechanisms & Levers ---
    const tut3 = TUTORIAL_LEVELS[2];
    const loop3 = new GameLoop({ mainCanvas, minimapCanvas, level: tut3 });
    const lever = loop3.entities.find(e => e.type === 'lever');
    assert(lever !== undefined, 'Tutorial 3 contains lever');

    // Target corridor is initially solid wall (1)
    const target = lever.targets[0];
    assertEqual(loop3.level.layers.ground[target.y][target.x], 1, 'Passage initially blocked by wall');

    // Player steps to lever and toggles it
    loop3.player.gridX = lever.x;
    loop3.player.gridY = lever.y;
    lever.toggle(loop3.level);
    assertEqual(loop3.level.layers.ground[target.y][target.x], 0, 'Lever lowers wall to open floor');

    // Player walks through newly opened passage to exit
    loop3.player.gridX = tut3.exit.x;
    loop3.player.gridY = tut3.exit.y;
    StorageManager.saveLevelCompletion('tutorial_3', { time: 3800, steps: 14 });

    // --- Tutorial 4: Bridges & Elevation ---
    const tut4 = TUTORIAL_LEVELS[3];
    const loop4 = new GameLoop({ mainCanvas, minimapCanvas, level: tut4 });

    // Move to (6, 4) on Ground
    loop4.player.gridX = 6;
    loop4.player.gridY = 4;
    loop4.player.elevation = 0;

    // Step South onto Ramp R_S at (6, 5) -> transitions to Elevation 1 (Overhead)
    const rampMove = CollisionEngine.checkMove(6, 4, 6, 5, 0, loop4.level, loop4.entities, loop4.player.inventory);
    assertEqual(rampMove.allowed, true, 'Step South onto R_S ramp allowed');
    assertEqual(rampMove.nextElevation, 1, 'Climbs to overhead elevation');
    loop4.player.gridX = 6;
    loop4.player.gridY = 5;
    loop4.player.elevation = 1;

    // Step South across bridge deck B_EW at (6, 6) on Overhead
    const bridgeMove = CollisionEngine.checkMove(6, 5, 6, 6, 1, loop4.level, loop4.entities, loop4.player.inventory);
    assertEqual(bridgeMove.allowed, true, 'Crosses elevated bridge deck');
    assertEqual(bridgeMove.nextElevation, 1);
    loop4.player.gridX = 6;
    loop4.player.gridY = 6;

    // Step South onto Ramp R_N at (6, 7) -> descends back to Ground (0)
    const descendMove = CollisionEngine.checkMove(6, 6, 6, 7, 1, loop4.level, loop4.entities, loop4.player.inventory);
    assertEqual(descendMove.allowed, true, 'Descends via R_N south');
    assertEqual(descendMove.nextElevation, 0, 'Returns to Ground elevation');
    loop4.player.gridX = 6;
    loop4.player.gridY = 7;
    loop4.player.elevation = 0;

    // Reach Exit at (11, 11)
    loop4.player.gridX = tut4.exit.x;
    loop4.player.gridY = tut4.exit.y;
    StorageManager.saveLevelCompletion('tutorial_4', { time: 4200, steps: 16 });

    // --- Tutorial 5: The Shrouded Path (Fog & Vision) ---
    const tut5 = TUTORIAL_LEVELS[4];
    const loop5 = new GameLoop({ mainCanvas, minimapCanvas, level: tut5 });
    assertEqual(loop5.level.config.fogOfWar, true, 'Fog of war active in Tutorial 5');
    assertEqual(loop5.level.config.viewRadius, 4, 'Vision radius is 4 tiles');
    loop5.fog.update(loop5.player.gridX, loop5.player.gridY, 0, loop5.level.layers.ground, loop5.level.layers.overhead, 4);
    assert(loop5.fog.isExplored(loop5.player.gridX, loop5.player.gridY), 'Spawn area explored');
    StorageManager.saveLevelCompletion('tutorial_5', { time: 5100, steps: 22 });

    // --- Tutorial 6: Master's Trial ---
    const tut6 = TUTORIAL_LEVELS[5];
    const loop6 = new GameLoop({ mainCanvas, minimapCanvas, level: tut6 });
    StorageManager.saveLevelCompletion('tutorial_6', { time: 7800, steps: 35 });

    // --- Verify Overall Tutorial Academy Completion in Storage ---
    const allProgress = StorageManager.loadTutorialProgress();
    for (let i = 1; i <= 6; i++) {
      const key = `tutorial_${i}`;
      assert(allProgress[key] && allProgress[key].completed === true, `Tutorial ${i} saved as completed in storage`);
      assert(typeof allProgress[key].bestTime === 'number' && allProgress[key].bestTime > 0, `Tutorial ${i} has recorded bestTime`);
    }
  });
});
