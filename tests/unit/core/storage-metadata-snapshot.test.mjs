/**
 * Unit Tests: StorageManager Backup Metadata & Emergency Snapshot Rollback (BL-76, CMP-13)
 */

import { describe, it, beforeEach, assert, assertEqual, setupMocks } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { ENGINE_VERSION } from '../../../js/core/version.js';

describe('Core > Storage Backup Metadata & Snapshots (BL-76, CMP-13)', () => {
  beforeEach(() => {
    setupMocks();
    localStorage.clear();
  });

  it('exportSaveProfile includes rich metadata with engine version and metrics', () => {
    // Save some level completions
    StorageManager.saveLevelCompletion(1, { time: 3000, steps: 12, earnedParSteps: true, earnedParTime: true });
    StorageManager.setPlayerName('Aria');

    const backup = StorageManager.exportSaveProfile();
    assert(backup, 'Backup payload should exist');
    assert(backup.metadata, 'Backup should have metadata');
    assertEqual(backup.metadata.engineVersion, ENGINE_VERSION);
    assertEqual(backup.metadata.playerName, 'Aria');
    assert(backup.metadata.completedLevels >= 1, 'Completed levels should be at least 1');
    assert(backup.metadata.totalStars >= 1, 'Total stars should be at least 1');
    assertEqual(typeof backup.metadata.timestamp, 'number');
  });

  it('creates and restores emergency snapshots before destructive operations', () => {
    // Initial state
    StorageManager.saveLevelCompletion(1, { time: 2500, steps: 10, earnedParSteps: true, earnedParTime: true });
    StorageManager.saveLevelCompletion(2, { time: 4000, steps: 18, earnedParSteps: true });
    const initialProg = StorageManager.loadCampaignProgress();
    assertEqual(Object.keys(initialProg).length, 2);

    // Resetting progress automatically creates a snapshot
    StorageManager.resetAllProgress();
    const afterResetProg = StorageManager.loadCampaignProgress();
    assertEqual(Object.keys(afterResetProg).length, 0);

    // Verify snapshot exists
    const snapshot = StorageManager.getEmergencySnapshot();
    assert(snapshot, 'Emergency snapshot should exist');
    assertEqual(snapshot.reason, 'pre_reset');
    assert(snapshot.backup.campaign['1'], 'Snapshot should contain level 1');

    // Rollback from emergency snapshot
    const res = StorageManager.rollbackEmergencySnapshot();
    assert(res.success, 'Rollback should succeed');

    const restoredProg = StorageManager.loadCampaignProgress();
    assertEqual(Object.keys(restoredProg).length, 2);
    assertEqual(restoredProg['1'].completed, true);

    // Snapshot key should be cleaned up after successful rollback
    assertEqual(StorageManager.getEmergencySnapshot(), null);
  });

  it('auto-creates snapshot before importing backup file', () => {
    StorageManager.saveLevelCompletion(1, { time: 1000, steps: 5 });
    
    const fakeBackup = {
      game: 'casual-maze-game',
      progress: {
        campaign: {
          '10': { completed: true, bestTime: 5000, bestSteps: 20 },
        },
      },
    };

    StorageManager.importSaveProfile(fakeBackup);

    // Verify snapshot captured previous state ('1')
    const snapshot = StorageManager.getEmergencySnapshot();
    assert(snapshot, 'Emergency snapshot should exist');
    assertEqual(snapshot.reason, 'pre_restore');
    assert(snapshot.backup.campaign['1'], 'Snapshot should contain pre-import state');

    // Verify new state was imported ('10')
    const current = StorageManager.loadCampaignProgress();
    assert(current['10'], 'New level 10 should be imported');
  });
});
