/**
 * Unit Test: Visual Multi-Elevation Bridge & Ramp Guide (BL-37)
 * Verifies that the Architect Handbook in editor.html contains explanatory
 * vector SVG diagrams showing over/under elevation crossing geometries.
 */

import { describe, it, assert } from '../../harness/index.mjs';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const editorHtmlPath = resolve(__dirname, '../../../editor.html');

describe('Editor > Multi-Elevation Bridge & Ramp Guide (BL-37)', () => {
  it('includes interactive SVG crossing diagrams in the Architect Handbook', () => {
    const html = readFileSync(editorHtmlPath, 'utf8');

    assert(html.includes('id="guide-modal"'), 'Guide modal exists in editor.html');
    assert(html.includes('bridge-diagrams-grid'), 'Includes bridge diagrams grid container');
    assert(html.includes('Bridge EW (B_EW) Elevation Crossing'), 'Includes B_EW diagram heading');
    assert(html.includes('Bridge NS (B_NS) Elevation Crossing'), 'Includes B_NS diagram heading');

    // Verify directional ramp labels and SVGs
    assert(html.includes('R_S (▲)'), 'Diagram includes Ramp South (R_S)');
    assert(html.includes('R_N (▼)'), 'Diagram includes Ramp North (R_N)');
    assert(html.includes('R_E (▶)'), 'Diagram includes Ramp East (R_E)');
    assert(html.includes('R_W (◀)'), 'Diagram includes Ramp West (R_W)');

    // Verify ground tunnel and overhead deck distinctions
    assert(html.includes('Ground Tunnel (Z=0) East ↔ West'), 'B_EW shows East-West ground tunnel');
    assert(html.includes('Ground (Z=0) N ↔ S'), 'B_NS shows North-South ground tunnel');
    assert(html.includes('Overhead (Z=1)'), 'Indicates elevated overhead layer');
  });
});
