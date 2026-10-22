/**
 * Unit Tests: Storyline 4 — The Sunken Vaults of the Deep (BL-130, ADR-0035)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import {
  STORYLINES,
  getStoryline,
  getStoryChapter,
  getNextStoryChapter,
} from '../../../js/stories/storylines.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';

describe('Storylines > The Sunken Vaults of the Deep (BL-130)', () => {
  it('registers Sunken Vaults of the Deep storyline with 3 chapters', () => {
    const story = getStoryline('sunken_vaults_of_the_deep');
    assert(story !== null, 'Sunken Vaults storyline must exist');
    assertEqual(story.id, 'sunken_vaults_of_the_deep');
    assertEqual(story.title, 'The Sunken Vaults of the Deep');
    assertEqual(story.totalChapters, 3);
    assertEqual(story.chapters.length, 3);
    assertEqual(story.theme, 'aqueduct');
    assertEqual(story.difficulty, 'Advanced');
  });

  it('validates all Sunken Vaults chapters pass LevelValidator with 0 errors and 0 warnings', () => {
    for (let chNum = 1; chNum <= 3; chNum++) {
      const ch = getStoryChapter('sunken_vaults_of_the_deep', chNum);
      assert(ch !== null, `Chapter ${chNum} must exist`);
      const rep = LevelValidator.validate(ch);
      assertEqual(rep.valid, true, `Chapter ${chNum} is valid`);
      assertEqual(rep.errors.length, 0, `Chapter ${chNum} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Chapter ${chNum} has 0 validation warnings`);
      assertEqual(rep.stats.exitReached, true, `Chapter ${chNum} exit is BFS reachable`);
    }
  });

  it('validates Chapter 1 (The Flooded Siphon) solvability and zero bypass', () => {
    const ch1 = getStoryChapter('sunken_vaults_of_the_deep', 1);
    assertEqual(ch1.id, 'story_sunken_vaults_1');
    const sol = solveLevel(ch1);
    assert(sol !== null, 'Chapter 1 must be solvable');
    assertEqual(sol.length, 61, 'Optimal path is 61 steps');

    // Without key, unsolvable
    const noKey = JSON.parse(JSON.stringify(ch1));
    noKey.entities = noKey.entities.filter(e => e.id !== 'key_siphon_1');
    assertEqual(solveLevel(noKey), null, 'Chapter 1 requires siphon key');
  });

  it('validates Chapter 2 (The Pressure Reservoir) solvability and zero bypass', () => {
    const ch2 = getStoryChapter('sunken_vaults_of_the_deep', 2);
    assertEqual(ch2.id, 'story_sunken_vaults_2');
    const sol = solveLevel(ch2);
    assert(sol !== null, 'Chapter 2 must be solvable');
    assertEqual(sol.length, 25, 'Optimal path is 25 steps');

    // Without key, unsolvable
    const noKey = JSON.parse(JSON.stringify(ch2));
    noKey.entities = noKey.entities.filter(e => e.id !== 'key_reservoir_2');
    assertEqual(solveLevel(noKey), null, 'Chapter 2 requires reservoir key');
  });

  it('validates Chapter 3 (The Abyssal Sanctuary) dual-key climax solvability', () => {
    const ch3 = getStoryChapter('sunken_vaults_of_the_deep', 3);
    assertEqual(ch3.id, 'story_sunken_vaults_3');
    const sol = solveLevel(ch3);
    assert(sol !== null, 'Chapter 3 must be solvable');
    assertEqual(sol.length, 99, 'Optimal path is 99 steps');

    // Has both keys
    const keyIds = ch3.entities.filter(e => e.type === 'key').map(e => e.id);
    assertEqual(keyIds.includes('key_azure_3'), true, 'Has azure key');
    assertEqual(keyIds.includes('key_abyssal_3'), true, 'Has abyssal key');
  });

  it('validates chapter-to-chapter narrative progression', () => {
    const s1 = getNextStoryChapter('sunken_vaults_of_the_deep', 1);
    assertEqual(s1.hasNext, true);
    assertEqual(s1.nextChapterNumber, 2);
    assertEqual(s1.isStoryComplete, false);

    const s2 = getNextStoryChapter('sunken_vaults_of_the_deep', 2);
    assertEqual(s2.hasNext, true);
    assertEqual(s2.nextChapterNumber, 3);
    assertEqual(s2.isStoryComplete, false);

    const s3 = getNextStoryChapter('sunken_vaults_of_the_deep', 3);
    assertEqual(s3.hasNext, false);
    assertEqual(s3.isStoryComplete, true);
  });

  it('validates each Sunken Vaults chapter contains an Architect Folio stone lectern with coordinate tracking (BL-176, BL-187)', () => {
    for (let i = 1; i <= 3; i++) {
      const ch = getStoryChapter('sunken_vaults_of_the_deep', i);
      const sign = (ch.entities || []).find(e => e.type === 'signpost' || e.type === 'architect_note');
      assert(sign !== undefined, `Sunken Vaults Chapter ${i} contains an Architect Folio signpost`);
      assertEqual(sign.style, 'lectern_stone', `Sunken Vaults Chapter ${i} uses lectern_stone style`);
      assertEqual(sign.title, `Architect's Folio #${50 + i}`, `Sunken Vaults Chapter ${i} matches Folio #${50 + i}`);
      assert(typeof sign.coordString === 'string' && sign.coordString.length > 0, `Sunken Vaults Chapter ${i} records coordinates`);
      assert(typeof (sign.text || sign.message) === 'string' && (sign.text || sign.message).length > 20, `Sunken Vaults Chapter ${i} has substantive lore`);
    }
  });
});
