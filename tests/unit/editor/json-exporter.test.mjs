/**
 * Unit Tests: JsonExporter Subsystem
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { JsonExporter } from '../../../js/editor/json-exporter.js';

describe('Editor > JsonExporter', () => {
  const sampleLevel = {
    id: 'export_test',
    title: 'Export Testing Maze',
    author: 'Architect',
    dimensions: { width: 6, height: 6 },
    spawn: { x: 1, y: 1, elevation: 0 },
    exit: { x: 4, y: 4 },
    layers: {
      ground: [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1],
      ],
      overhead: Array.from({ length: 6 }, () => Array(6).fill(0)),
    },
    entities: [
      { id: 'key_gold', type: 'key', x: 2, y: 2, color: '#fbbf24' },
    ],
  };

  it('imports valid JSON string cleanly into normalized level schema', () => {
    const rawJson = JSON.stringify(sampleLevel);
    const parsed = JsonExporter.importFromText(rawJson);

    assertEqual(parsed.id, 'export_test');
    assertEqual(parsed.title, 'Export Testing Maze');
    assertEqual(parsed.dimensions.width, 6);
    assertEqual(parsed.entities.length, 1);
  });

  it('copies canonical JSON to clipboard mock', async () => {
    const success = await JsonExporter.copyToClipboard(sampleLevel);
    assertEqual(success, true);
    const clipboardContent = await globalThis.navigator.clipboard.readText();
    assert(clipboardContent.includes('Export Testing Maze'), 'Clipboard contains level JSON');
  });

  it('imports level from File blob object mock', async () => {
    const jsonStr = JSON.stringify(sampleLevel);
    const file = new globalThis.Blob([jsonStr], { type: 'application/json' });
    const imported = await JsonExporter.importFromFile(file);

    assertEqual(imported.title, 'Export Testing Maze');
    assertEqual(imported.dimensions.height, 6);
  });
});
