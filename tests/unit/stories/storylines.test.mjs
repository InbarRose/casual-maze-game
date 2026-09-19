/**
 * Unit Tests: Storylines Registry & Narrative Chapter Validation
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import {
  STORYLINES,
  getStoryline,
  getStoryChapter,
  getNextStoryChapter,
  getAllStoryLevels,
} from '../../../js/stories/storylines.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';

describe('Storylines > Registry & Chapter Structure', () => {
  it('registers all storylines with required metadata and chapters', () => {
    assert(Array.isArray(STORYLINES), 'STORYLINES is an array');
    assertEqual(STORYLINES.length >= 2, true, 'At least 2 storylines registered');

    const novice = getStoryline('novice_initiation');
    assert(novice !== null, 'Novice Initiation story exists');
    assertEqual(novice.totalChapters, 6);
    assertEqual(novice.chapters.length, 6);
    assertEqual(novice.title, "The Novice's Initiation");
    assert(novice.description.length > 20);

    const guardians = getStoryline('relics_of_the_guardians');
    assert(guardians !== null, 'Relics of the Guardians story exists');
    assertEqual(guardians.totalChapters, 3);
    assertEqual(guardians.chapters.length, 3);
    assertEqual(guardians.title, 'Relics of the Four Guardians');
  });

  it('retrieves chapters correctly via getStoryChapter()', () => {
    const ch1 = getStoryChapter('novice_initiation', 1);
    assert(ch1 !== null, 'Chapter 1 exists');
    assertEqual(ch1.storyId, 'novice_initiation');
    assertEqual(ch1.chapterNumber, 1);
    assertEqual(ch1.chapterTitle, 'The Waking Hall');

    const ch6 = getStoryChapter('novice_initiation', 6);
    assert(ch6 !== null, 'Chapter 6 exists');
    assertEqual(ch6.chapterTitle, "The Guildmaster's Rite");

    const invalidCh = getStoryChapter('novice_initiation', 99);
    assertEqual(invalidCh, null, 'Out of bounds chapter returns null');

    const invalidStory = getStoryChapter('non_existent', 1);
    assertEqual(invalidStory, null, 'Non-existent story returns null');
  });

  it('navigates next chapter progression via getNextStoryChapter()', () => {
    const step1 = getNextStoryChapter('novice_initiation', 1);
    assertEqual(step1.hasNext, true);
    assertEqual(step1.nextChapterNumber, 2);
    assertEqual(step1.isStoryComplete, false);

    const stepLast = getNextStoryChapter('novice_initiation', 6);
    assertEqual(stepLast.hasNext, false);
    assertEqual(stepLast.isStoryComplete, true);

    const guardStep1 = getNextStoryChapter('relics_of_the_guardians', 1);
    assertEqual(guardStep1.hasNext, true);
    assertEqual(guardStep1.nextChapterNumber, 2);

    const guardStepLast = getNextStoryChapter('relics_of_the_guardians', 3);
    assertEqual(guardStepLast.hasNext, false);
    assertEqual(guardStepLast.isStoryComplete, true);
  });

  it('flattens all story levels via getAllStoryLevels()', () => {
    const all = getAllStoryLevels();
    assertEqual(all.length, 6 + 3, 'Total 9 story levels in registry');
  });
});

describe('Storylines > Level Solvability & Mechanics Validation', () => {
  it('validates all Novice Initiation chapters pass LevelValidator with 0 errors', () => {
    const story = getStoryline('novice_initiation');
    story.chapters.forEach((chapter, idx) => {
      const report = LevelValidator.validate(chapter);
      assertEqual(report.valid, true, `Novice Chapter ${idx + 1} (${chapter.chapterTitle}) valid`);
      assertEqual(report.errors.length, 0, `Novice Chapter ${idx + 1} has 0 validation errors`);
      assertEqual(report.stats.exitReached, true, `Novice Chapter ${idx + 1} exit is reachable via BFS`);
    });
  });

  it('validates all Relics of the Four Guardians chapters pass LevelValidator', () => {
    const story = getStoryline('relics_of_the_guardians');
    story.chapters.forEach((chapter, idx) => {
      const report = LevelValidator.validate(chapter);
      assertEqual(report.valid, true, `Guardians Chapter ${idx + 1} (${chapter.chapterTitle}) valid`);
      assertEqual(report.errors.length, 0, `Guardians Chapter ${idx + 1} has 0 validation errors`);
    });
  });

  it('validates Guardians Chapter 1 entity and reachability mechanics', () => {
    const ch1 = getStoryChapter('relics_of_the_guardians', 1);
    assert(ch1.entities.some(e => e.type === 'checkpoint'), 'Has checkpoint');
    assert(ch1.entities.some(e => e.type === 'collectible' && e.collectibleType === 'gem'), 'Has bonus gems');
    assert(ch1.entities.some(e => e.type === 'wall_decor' && e.decorType === 'note'), 'Has wall decor notes');
    assert(ch1.entities.some(e => e.type === 'timed_hazard'), 'Has timed hazard');

    const key = ch1.entities.find(e => e.type === 'key');
    const door = ch1.entities.find(e => e.type === 'door');
    assertEqual(key.color, door.color, 'Key and door colors match');
  });

  it('validates Guardians Chapter 2 carryable riddle relic mechanics', () => {
    const ch2 = getStoryChapter('relics_of_the_guardians', 2);
    const statue = ch2.entities.find(e => e.type === 'riddle_item');
    assert(statue !== undefined, 'Has Falcon statue riddle item');
    assertEqual(statue.itemStyle, 'falcon');

    const pedestal = ch2.entities.find(e => e.type === 'pedestal');
    assert(pedestal !== undefined, 'Has sky pedestal');
    assertEqual(pedestal.acceptedItemId, statue.id, 'Pedestal accepts the Falcon statue');
    assertEqual(pedestal.targetDoorId, 'door_terrace_gate');
  });

  it('validates Guardians Chapter 3 Four Guardians Sanctum riddle group', () => {
    const ch3 = getStoryChapter('relics_of_the_guardians', 3);
    const statues = ch3.entities.filter(e => e.type === 'riddle_item');
    assertEqual(statues.length, 4, '4 animal guardian statues present');

    const pedestals = ch3.entities.filter(e => e.type === 'pedestal');
    assertEqual(pedestals.length, 4, '4 pedestals present');

    for (const ped of pedestals) {
      assertEqual(ped.puzzleGroupId, 'guardians_sanctum_group', 'All pedestals share group ID');
      assertEqual(ped.targetDoorId, 'door_sanctum_gate', 'All pedestals target sanctum gate');
      assert(statues.some(s => s.id === ped.acceptedItemId), `Pedestal ${ped.id} accepts a valid statue`);
    }
  });
});
