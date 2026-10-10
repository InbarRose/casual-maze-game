/**
 * Unit Test Suite: Mobile Feed Accessibility & Download Feedback (BL-97)
 */

import { describe, it, beforeEach, assert, assertEqual, setupMocks } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { DebugLogger } from '../../../js/engine/debug-logger.js';
import { JsonExporter } from '../../../js/editor/json-exporter.js';

describe('Mobile Feed & Download Feedback (BL-97)', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('StorageManager downloadSaveFile returns filename and downloads file', () => {
    const fn = StorageManager.downloadSaveFile('test_backup.json');
    assertEqual(fn, 'test_backup.json');
  });

  it('DebugLogger download returns filename string upon export', () => {
    const logger = new DebugLogger({ id: 1, title: 'Test Level' });
    const fn = logger.download('test_debug_log.json');
    assertEqual(fn, 'test_debug_log.json');
  });

  it('DebugLogger downloadReplay returns filename string upon export', () => {
    const logger = new DebugLogger({ id: 1, title: 'Test Level' });
    const fn = logger.downloadReplay('test_replay.json');
    assertEqual(fn, 'test_replay.json');
  });

  it('JsonExporter exportToFile returns filename string upon export', () => {
    const levelData = {
      id: 'custom_test',
      version: 2,
      dimensions: { width: 5, height: 5 },
      layers: { ground: [] }
    };
    const fn = JsonExporter.exportToFile(levelData);
    assertEqual(fn, 'custom_test_v2.json');
  });

  it('verifies mobile feed pill button toggles minimized state', () => {
    const feed = document.createElement('div');
    feed.id = 'game-activity-feed';
    feed.className = 'game-activity-feed';
    document.body.appendChild(feed);

    const pill = document.createElement('button');
    pill.id = 'btn-hud-feed-pill';
    document.body.appendChild(pill);

    pill.addEventListener('click', () => {
      const isMin = feed.classList.toggle('minimized');
      pill.classList.toggle('active', !isMin);
    });

    assert(!feed.classList.contains('minimized'), 'Initially feed should not be minimized');

    pill.click();
    assert(feed.classList.contains('minimized'), 'Feed should be minimized after click');
    assert(!pill.classList.contains('active'), 'Pill should not be active when minimized');

    pill.click();
    assert(!feed.classList.contains('minimized'), 'Feed should be restored after second click');
    assert(pill.classList.contains('active'), 'Pill should be active when feed is expanded');
  });
});
