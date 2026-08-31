/**
 * Unit Tests: StorageManager Subsystem
 */

import { describe, it, beforeEach, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { resetStorageMocks } from '../../harness/mocks.mjs';
import { StorageManager } from '../../../js/core/storage.js';

describe('Core > StorageManager', () => {
  beforeEach(() => {
    resetStorageMocks();
  });

  it('saves, lists, loads, and deletes custom projects', () => {
    const project = {
      id: 'proj_alpha',
      title: 'Alpha Chamber',
      author: 'Tester',
      dimensions: { width: 10, height: 10 },
      layers: { ground: [], overhead: [] },
      entities: [],
    };

    const savedId = StorageManager.saveProject(project);
    assertEqual(savedId, 'proj_alpha', 'Returns project id');

    const list = StorageManager.listProjects();
    assert(list.some(p => p.id === 'proj_alpha'), 'Project listed in listProjects');

    const loaded = StorageManager.loadProject('proj_alpha');
    assertEqual(loaded.title, 'Alpha Chamber', 'Loaded project retains title');
    assertEqual(loaded.author, 'Tester', 'Loaded project retains author');

    const deleted = StorageManager.deleteProject('proj_alpha');
    assertEqual(deleted, true, 'deleteProject returns true');

    const listAfter = StorageManager.listProjects();
    assert(!listAfter.some(p => p.id === 'proj_alpha'), 'Deleted project no longer listed');
  });

  it('handles editor draft save, load, and clear with timestamps', () => {
    const draft = {
      id: 'draft_test',
      title: 'Draft Maze',
      dimensions: { width: 8, height: 8 },
    };

    StorageManager.saveEditorDraft(draft);
    const loadedDraft = StorageManager.loadEditorDraft();
    assert(loadedDraft !== null, 'Draft successfully loaded');
    assertEqual(loadedDraft.id, 'draft_test');
    assert(typeof loadedDraft._lastSaved === 'number' && loadedDraft._lastSaved > 0, 'Draft includes _lastSaved timestamp');

    StorageManager.clearEditorDraft();
    const emptyDraft = StorageManager.loadEditorDraft();
    assertEqual(emptyDraft, null, 'Draft is null after clearing');
  });

  it('persists tutorial progress and tracks best completion time/steps', () => {
    StorageManager.saveTutorialProgress('tutorial_1', { time: 5000, steps: 15 });
    let prog = StorageManager.loadTutorialProgress();
    assert(prog.tutorial_1 && prog.tutorial_1.completed === true, 'Tutorial 1 marked completed');
    assertEqual(prog.tutorial_1.bestTime, 5000, 'Best time stored');
    assertEqual(prog.tutorial_1.bestSteps, 15, 'Best steps stored');

    // Faster run updates best time
    StorageManager.saveTutorialProgress('tutorial_1', { time: 3200, steps: 12 });
    prog = StorageManager.loadTutorialProgress();
    assertEqual(prog.tutorial_1.bestTime, 3200, 'Best time updated with faster run');
    assertEqual(prog.tutorial_1.bestSteps, 12, 'Best steps updated');

    // Slower run preserves existing best time
    StorageManager.saveTutorialProgress('tutorial_1', { time: 6000, steps: 20 });
    prog = StorageManager.loadTutorialProgress();
    assertEqual(prog.tutorial_1.bestTime, 3200, 'Best time preserved after slower run');
  });

  it('automatically routes tutorial level IDs to tutorial storage via saveLevelCompletion', () => {
    StorageManager.saveLevelCompletion('tutorial_2', { time: 4100, steps: 14 });
    const tutProg = StorageManager.loadTutorialProgress();
    assert(tutProg.tutorial_2 && tutProg.tutorial_2.completed === true, 'tutorial_2 routed to tutorial storage');

    StorageManager.saveLevelCompletion('1', { time: 8500, steps: 25 });
    const levelProg = StorageManager.loadCampaignProgress();
    assert(levelProg['1'] && levelProg['1'].completed === true, '1 routed to campaign progress');
  });
});
