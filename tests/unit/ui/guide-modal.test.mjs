/**
 * Unit Tests: Universal Guide & Mechanics Handbook Modal (BL-71, CMP-16)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GuideModal, getGuideModal } from '../../../js/ui/guide-modal.js';
import { initAppHeader } from '../../../js/ui/app-header.js';

describe('UI > Universal Guide & Mechanics Handbook Modal (BL-71, CMP-16)', () => {
  it('initializes GuideModal and returns singleton instance', () => {
    const guide1 = getGuideModal();
    const guide2 = getGuideModal();

    assert(guide1 instanceof GuideModal, 'Returns GuideModal instance');
    assertEqual(guide1, guide2);
    assertEqual(guide1.isOpen, false);
  });

  it('manages open, tab switching, and close lifecycle', () => {
    const guide = getGuideModal();

    guide.open('controls');
    assertEqual(guide.isOpen, true);
    assertEqual(guide.activeTab, 'controls');
    assert(document.body.classList.contains('modal-open'), 'Body has modal-open class');

    const controlsPane = guide.modalEl.querySelector('#guide-pane-controls');
    assert(controlsPane !== null, 'Controls pane exists');
    assertEqual(controlsPane.style.display, 'flex');

    // Switch to Bridges tab
    guide.switchTab('bridges');
    assertEqual(guide.activeTab, 'bridges');
    const bridgesPane = guide.modalEl.querySelector('#guide-pane-bridges');
    assert(bridgesPane !== null, 'Bridges pane exists');
    assertEqual(bridgesPane.style.display, 'flex');
    assertEqual(controlsPane.style.display, 'none');

    // Switch to Secrets tab
    guide.switchTab('secrets');
    assertEqual(guide.activeTab, 'secrets');
    const secretsPane = guide.modalEl.querySelector('#guide-pane-secrets');
    assert(secretsPane !== null, 'Secrets pane exists');
    assertEqual(secretsPane.style.display, 'flex');

    // Switch to Entities tab
    guide.switchTab('entities');
    assertEqual(guide.activeTab, 'entities');
    const entitiesPane = guide.modalEl.querySelector('#guide-pane-entities');
    assert(entitiesPane !== null, 'Entities pane exists');
    assertEqual(entitiesPane.style.display, 'flex');

    // Close modal
    guide.close();
    assertEqual(guide.isOpen, false);
    assert(!document.body.classList.contains('modal-open'), 'Body modal-open class removed');
  });

  it('verifies visual SVG diagrams and multi-elevation architectural rules', () => {
    const guide = getGuideModal();
    guide.open('bridges');

    const modalHtml = guide.modalEl.innerHTML;

    // Check SVG diagrams exist for both bridge configurations
    assert(modalHtml.includes('Bridge EW (B_EW) Elevation Crossing'), 'B_EW diagram title exists');
    assert(modalHtml.includes('Bridge NS (B_NS) Elevation Crossing'), 'B_NS diagram title exists');
    assert(modalHtml.includes('Ground Tunnel (Z=0) East ↔ West'), 'B_EW ground tunnel indicated');
    assert(modalHtml.includes('Ground (Z=0) N ↔ S'), 'B_NS ground tunnel indicated');
    assert(modalHtml.includes('Overhead (Z=1)'), 'Overhead bridge deck indicated');

    // Check directional ramps
    assert(modalHtml.includes('R_S (▲)'), 'Includes Ramp South');
    assert(modalHtml.includes('R_N (▼)'), 'Includes Ramp North');
    assert(modalHtml.includes('R_E (▶)'), 'Includes Ramp East');
    assert(modalHtml.includes('R_W (◀)'), 'Includes Ramp West');

    guide.close();
  });

  it('verifies universal app header mounts guide triggers and returns guideModal', () => {
    const { header, footer, guideModal } = initAppHeader({ activeTab: 'hub' });

    assert(guideModal instanceof GuideModal, 'initAppHeader returns guideModal instance');
    assert(header.querySelector('#btn-app-guide') !== null, 'Header contains #btn-app-guide button');
    assert(footer.querySelector('#btn-footer-guide') !== null, 'Footer contains #btn-footer-guide button');
  });
});
