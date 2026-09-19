/**
 * User Journey Test: Multi-Room Dungeon Progression (The Whispering Citadel)
 * Simulates full traversal between Courtyard, Catacombs, and High Spire,
 * verifying inter-room key retrieval, locked gate unlocking, elevated bridges,
 * and branching exit options.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { LevelLoader } from '../../../js/levels/level-loader.js';
import { getStoryline } from '../../../js/stories/storylines.js';
import { globalEvents } from '../../../js/core/events.js';

describe('User Journey > Multi-Room Dungeon Progression (The Whispering Citadel)', () => {
  const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 10 }),
      drawImage: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
    }),
  };

  it('progresses through The Whispering Citadel: Courtyard -> Catacombs -> Spire -> Victory', () => {
    const story = getStoryline('the_whispering_citadel');
    assert(story !== null, 'Storyline exists');
    const rawLevel = story.chapters[0];
    const level = LevelLoader.normalizeLevel(rawLevel);

    const events = [];
    const unsubs = [
      globalEvents.on('room:entered', d => events.push({ type: 'room:entered', data: d })),
      globalEvents.on('key:collected', d => events.push({ type: 'key:collected', data: d })),
      globalEvents.on('door:unlocked', d => events.push({ type: 'door:unlocked', data: d })),
      globalEvents.on('level:completed', d => events.push({ type: 'level:completed', data: d })),
    ];

    let victoryStats = null;
    const loop = new GameLoop(level, mockCanvas, mockCanvas, {
      onVictory: stats => { victoryStats = stats; },
    });

    // 1. Initial State: Grand Courtyard
    assertEqual(loop.activeRoomId, 'courtyard', 'Starts in Grand Courtyard');
    assertEqual(loop.player.x, 1);
    assertEqual(loop.player.y, 1);
    assertEqual(loop.player.elevation, 0);

    // Read Courtyard Signpost
    const signpost = loop.entities.find(e => e.type === 'signpost');
    assert(signpost !== undefined, 'Signpost found');
    assert(signpost.message.includes('Spire Key'), 'Signpost mentions Spire Key');

    // 2. Descend into Catacombs via exit at (1, 11)
    loop.player.teleport(1, 11, 0);
    // Simulate exit stepping in loop update
    loop.update(0.016);

    assertEqual(loop.activeRoomId, 'catacombs', 'Transitioned to Sunken Catacombs');
    assertEqual(loop.level.theme, 'dungeon', 'Theme updated to dungeon');
    assert(events.some(e => e.type === 'room:entered' && e.data.roomId === 'catacombs'), 'Emitted room:entered event');

    // 3. In Catacombs: Collect Spire Keystone and Bonus Gem
    const spireKey = loop.entities.find(e => e.id === 'key_citadel_spire');
    assert(spireKey !== undefined, 'Spire Keystone exists in Catacombs');

    // Move to key position (11, 11)
    loop.player.teleport(11, 11, 0);
    loop.player.addKey(spireKey.id);
    loop.player.score += 250; // Crypt gem bonus

    assertEqual(loop.player.hasKey('key_citadel_spire'), true, 'Player collected Spire Keystone');
    assertEqual(loop.player.score, 250);

    // 4. Return to Courtyard via staircase at (1, 1)
    // Wait past the 300ms transition cooldown
    loop.lastRoomTransitionTime = -10000;
    loop.player.teleport(1, 1, 0);
    loop.update(0.016);

    assertEqual(loop.activeRoomId, 'courtyard', 'Returned to Grand Courtyard');
    assertEqual(loop.player.hasKey('key_citadel_spire'), true, 'Inventory persisted: holds Spire Keystone in Courtyard');
    assertEqual(loop.player.score, 250, 'Score persisted back into Courtyard');

    // 5. Unlock Spire Gate at (11, 10)
    const spireGate = loop.entities.find(e => e.id === 'door_spire_gate');
    assert(spireGate !== undefined, 'Spire Barrier Gate found in Courtyard');
    assertEqual(spireGate.isOpen, false, 'Gate initially closed');

    // Try moving into door to unlock
    loop.player.teleport(11, 9, 0);
    const unlocked = loop.tryMove(11, 10);
    assertEqual(unlocked, true, 'Successfully unlocked Spire Barrier Gate');
    assertEqual(spireGate.isOpen, true, 'Gate is now open');

    // 6. Ascend to High Spire via exit at (11, 11)
    loop.lastRoomTransitionTime = -10000;
    loop.player.teleport(11, 11, 0);
    loop.update(0.016);

    assertEqual(loop.activeRoomId, 'high_spire', 'Ascended to Whispering Spire');
    assertEqual(loop.level.theme, 'snow', 'Theme updated to snow');

    // 7. In High Spire: Ascend Ramp onto Elevated Bridge
    // Player approaches RAMP_E at (3, 6) from ground at (2, 6)
    loop.player.teleport(2, 6, 0);
    const climbedRamp = loop.tryMove(3, 6);
    loop.player.update(1.0);
    assertEqual(climbedRamp, true, 'Climbed East onto RAMP_E');
    assertEqual(loop.player.elevation, 1, 'Player now at Elevation 1 (Overhead)');

    const movedOntoBridge = loop.tryMove(4, 6);
    loop.player.update(1.0);
    assertEqual(movedOntoBridge, true, 'Stepped East from ramp onto bridge deck');

    // Activate Checkpoint at (6, 6)
    loop.player.teleport(6, 6, 1);
    const checkpoint = loop.entities.find(e => e.id === 'checkpoint_spire_altar');
    assert(checkpoint !== undefined, 'Found spire checkpoint');
    checkpoint.activate();
    assertEqual(checkpoint.isActive, true, 'Checkpoint activated on bridge');

    // Descend ramp at (9, 6) back to ground (10, 6)
    loop.player.teleport(8, 6, 1);
    const steppedOnDescentRamp = loop.tryMove(9, 6);
    loop.player.update(1.0);
    assertEqual(steppedOnDescentRamp, true, 'Stepped onto descent ramp');

    const descendedRamp = loop.tryMove(10, 6);
    loop.player.update(1.0);
    assertEqual(descendedRamp, true, 'Descended ramp to ground');
    assertEqual(loop.player.elevation, 0, 'Player back on ground level');

    // 8. Reach Apex Victory Exit at (11, 11)
    loop.lastRoomTransitionTime = -10000;
    loop.player.teleport(11, 11, 0);
    loop.update(0.016);

    assert(victoryStats !== null, 'Victory was achieved at the Apex Altar');
    assertEqual(victoryStats.branchLabel, 'Apex Altar of the Monolith');

    // 9. Clean up
    unsubs.forEach(u => u());
    loop.stop();
  });

  it('supports branching exit routing to alternate level targets', () => {
    const story = getStoryline('the_whispering_citadel');
    const rawLevel = story.chapters[0];
    const level = LevelLoader.normalizeLevel(rawLevel);

    let victoryStats = null;
    const loop = new GameLoop(level, mockCanvas, mockCanvas, {
      onVictory: stats => { victoryStats = stats; },
    });

    // Jump directly to High Spire room
    loop.initActiveRoom('high_spire', { x: 1, y: 1, elevation: 0 });
    assertEqual(loop.activeRoomId, 'high_spire');

    // Step onto Secret Monolith Branch Exit at (11, 1)
    loop.lastRoomTransitionTime = -10000;
    loop.player.teleport(11, 1, 0);
    loop.update(0.016);

    assert(victoryStats !== null, 'Branch exit triggered victory/transition');
    assertEqual(victoryStats.targetLevel, '29', 'Branch exit targets Campaign Level 29');
    assertEqual(victoryStats.branchLabel, 'Secret Monolith Tunnel');

    loop.stop();
  });
});
