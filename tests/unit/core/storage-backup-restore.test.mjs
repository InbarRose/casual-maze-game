/**
 * Unit Test: Full Save State & Profile Backup / Restore (BL-53)
 * Verifies cloudless serialization, export, validation, and restoration of all user data.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';

describe('Core > Storage Backup & Restore (BL-53)', () => {
  it('exports a complete, versioned backup payload with profile, progress, and settings', () => {
    localStorage.clear();

    // Setup user profile
    StorageManager.setPlayerName('Theseus');
    StorageManager.saveLevelCompletion('1', {
      time: 2500,
      steps: 10,
      earnedParSteps: true,
      earnedParTime: true,
      flawless: true,
    });
    StorageManager.saveTutorialCompletion('1', { time: 1000, steps: 5 });
    StorageManager.saveStoryProgress('novice_initiation', 1, { time: 3000, steps: 12 });
    StorageManager.setSetting('high_contrast', true);

    const backup = StorageManager.exportFullBackup();

    assertEqual(backup.schemaVersion, '1.0.0');
    assertEqual(backup.game, 'casual-maze-game');
    assert(backup.exportedAt !== undefined, 'Has exportedAt timestamp');
    assertEqual(backup.profile.name, 'Theseus', 'Exports player identity');
    assertEqual(backup.settings.high_contrast, true, 'Exports custom settings');
    assert(backup.progress.campaign['1'] !== undefined, 'Exports campaign level 1');
    assert(backup.progress.tutorial['1'] !== undefined, 'Exports tutorial 1');
    assert(backup.progress.stories['novice_initiation']['1'] !== undefined, 'Exports story chapter');
  });

  it('generates standard backup file name with current ISO date', () => {
    const filename = StorageManager.downloadFullBackupFile();
    assert(filename.startsWith('casual_maze_save_'), 'Filename has standard prefix');
    assert(filename.endsWith('.json'), 'Filename has .json extension');
  });

  it('restores all game state from a valid backup JSON payload', () => {
    localStorage.clear();

    const sampleBackup = {
      schemaVersion: '1.0.0',
      game: 'casual-maze-game',
      exportedAt: '2026-10-02T12:00:00.000Z',
      profile: { name: 'Daedalus' },
      progress: {
        campaign: {
          '1': { completed: true, bestTime: 1200, bestSteps: 8, medals: { completion: true } },
          '2': { completed: true, bestTime: 2400, bestSteps: 14, medals: { completion: true } },
        },
        tutorial: {
          '1': { completed: true, bestTime: 800, bestSteps: 4 },
        },
        stories: {
          'relics_of_the_guardians': {
            '1': { completed: true, bestTime: 5000, bestSteps: 20 },
          },
        },
      },
      settings: {
        volume_master: 0.75,
        high_contrast: true,
      },
      projects: {
        'proj_test': { id: 'proj_test', title: 'Minotaur Lair', author: 'Architect' },
      },
    };

    const result = StorageManager.importFullBackup(sampleBackup);
    assertEqual(result.success, true);
    assertEqual(result.stats.campaignLevels, 2);
    assertEqual(result.stats.tutorialLevels, 1);
    assertEqual(result.stats.storyChapters, 1);
    assertEqual(result.stats.projects, 1);

    // Verify localStorage restored correctly
    const profile = StorageManager.getPlayerProfile();
    assertEqual(profile.name, 'Daedalus', 'Player codename restored');

    const campaign = StorageManager.loadCampaignProgress();
    assertEqual(campaign['1'].completed, true);
    assertEqual(campaign['2'].completed, true);

    const settings = StorageManager.loadSettings();
    assertEqual(settings.volume_master, 0.75);
    assertEqual(settings.high_contrast, true);

    const project = StorageManager.loadProject('proj_test');
    assertEqual(project.title, 'Minotaur Lair');
  });

  it('throws descriptive error on invalid or corrupted save payloads', () => {
    let errorThrown = false;
    try {
      StorageManager.importFullBackup('invalid-non-json');
    } catch (e) {
      errorThrown = true;
      assert(e.message.includes('Failed to import save data'), 'Error informs caller of corrupt payload');
    }
    assert(errorThrown, 'Corrupt backup string correctly throws error');
  });
});
