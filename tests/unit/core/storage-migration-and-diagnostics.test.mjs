/**
 * Unit Tests: Storage Migration & Diagnostic Bug Exporter (BL-34, BL-36)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { ENGINE_VERSION, SAVE_PROFILE_SCHEMA_VERSION } from '../../../js/core/version.js';

describe('Core > Storage Migration & Diagnostic Exporter (BL-34, BL-36)', () => {
  it('migrates legacy save schema and keys to current standards', () => {
    // Setup mock legacy state in localStorage
    const legacyCampaign = {
      '1': {
        completed: true,
        bestTime: 4200,
        bestSteps: 18,
        // missing medals, bestSecrets, bestScore
      },
    };
    localStorage.setItem('casual_maze_campaign_progress', JSON.stringify(legacyCampaign));
    localStorage.setItem('casual_maze_sound_muted', 'true');
    localStorage.removeItem('casual_maze_user_settings');
    localStorage.removeItem('casual_maze_save_version');

    const result = StorageManager.migrateSaveData();
    assert(result.migrated, 'migrateSaveData returns migrated: true when updating legacy records');
    assertEqual(result.version, SAVE_PROFILE_SCHEMA_VERSION, 'Sets latest save schema version stamp');

    // Verify campaign record was normalized
    const updatedCampaign = StorageManager.loadCampaignProgress();
    assert(updatedCampaign['1'].medals !== undefined, 'Record has medals object injected');
    assertEqual(updatedCampaign['1'].medals.completion, true, 'Medal completion is true');
    assertEqual(updatedCampaign['1'].bestSecrets, 0, 'bestSecrets initialized to 0');
    assertEqual(updatedCampaign['1'].bestScore, 0, 'bestScore initialized to 0');

    // Verify settings adopted legacy mute state
    const settings = StorageManager.loadSettings();
    assertEqual(settings.muted, true, 'Settings object migrated legacy muted status');

    // Second run should report clean state
    const rerun = StorageManager.migrateSaveData();
    assertEqual(rerun.details.length, 0, 'Subsequent migration runs have 0 pending mutations');
  });

  it('exports comprehensive diagnostic bug bundle with pre-filled GitHub URL (BL-34)', () => {
    const mockContext = {
      levelId: '2',
      levelTitle: 'The Overpass',
      chapterNumber: 1,
      level: {
        id: '2',
        title: 'The Overpass',
        chapterNumber: 1,
        dimensions: { width: 21, height: 21 },
      },
      player: { x: 5, y: 7, elevation: 1, facing: 'north', stepsTaken: 24 },
      steps: 24,
      elapsedTimeFormatted: '00:15.4',
      inventory: ['key_gold_1'],
      carriedItems: [],
      recentActions: ['move:north', 'step_on_ramp', 'move:north'],
      errors: ['Sample non-fatal diagnostic warning'],
    };

    const bundle = StorageManager.exportDiagnosticBugBundle(mockContext);
    assert(bundle !== null, 'exportDiagnosticBugBundle returns bundle object');
    assert(typeof bundle.json === 'object', 'Bundle contains structured JSON payload');
    assert(typeof bundle.markdown === 'string', 'Bundle contains formatted markdown');
    assert(typeof bundle.githubUrl === 'string', 'Bundle contains GitHub Issue URL');

    // Verify JSON payload details
    assertEqual(bundle.json.engineVersion, ENGINE_VERSION, 'Bundle records exact engine version');
    assertEqual(bundle.json.activeLevel.id, '2', 'Bundle records active level ID');
    assertEqual(bundle.json.activeLevel.title, 'The Overpass', 'Bundle records active level title');
    assertEqual(bundle.json.playerState.position.x, 5, 'Records player X coordinate');
    assertEqual(bundle.json.playerState.position.y, 7, 'Records player Y coordinate');
    assertEqual(bundle.json.playerState.position.elevation, 1, 'Records player elevation');
    assertEqual(bundle.json.playerState.stepsTaken, 24, 'Records step count');
    assertEqual(bundle.json.recentTelemetry.length, 3, 'Records telemetry moves');
    assertEqual(bundle.json.recentErrors.length, 1, 'Records diagnostic errors');

    // Verify markdown text
    assert(bundle.markdown.includes('The Overpass'), 'Markdown includes level title');
    assert(bundle.markdown.includes('(5, 7, Z=1)'), 'Markdown includes coordinate string');
    assert(bundle.markdown.includes(ENGINE_VERSION), 'Markdown includes engine version');

    // Verify GitHub Issue URL
    assert(bundle.githubUrl.startsWith('https://github.com/InbarRose/casual-maze-game/issues/new'), 'URL targets repository issue creation');
    assert(bundle.githubUrl.includes('The%20Overpass') || bundle.githubUrl.includes('The+Overpass'), 'URL includes encoded level title');
  });
});
