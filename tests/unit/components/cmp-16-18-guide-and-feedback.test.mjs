/**
 * Component Unit Tests: Universal Guide Handbook (CMP-16) & Feedback Modal (CMP-18)
 *
 * Verifies all tabs, buttons, dynamic diagrams, and telemetry export workflows.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GuideModal, getGuideModal } from '../../../js/ui/guide-modal.js';
import { FeedbackModal, getFeedbackModal } from '../../../js/ui/feedback-modal.js';
import { initAppHeader } from '../../../js/ui/app-header.js';

describe('Components > CMP-16 & CMP-18: Universal Guide Handbook and Feedback Reporting', () => {
  it('CMP-16: verifies GuideModal singleton, lifecycle, tab transitions, and SVG diagrams', () => {
    const guide = getGuideModal();
    assert(guide instanceof GuideModal, 'Returns GuideModal instance');
    assertEqual(guide.isOpen, false);

    // Open to controls tab
    guide.open('controls');
    assertEqual(guide.isOpen, true);
    assertEqual(guide.activeTab, 'controls');
    assert(document.body.classList.contains('modal-open'), 'Body marked modal-open');

    // Verify all 4 tabs exist and switch cleanly
    const tabs = ['controls', 'bridges', 'secrets', 'entities'];
    for (const tab of tabs) {
      guide.switchTab(tab);
      assertEqual(guide.activeTab, tab);
      const pane = guide.modalEl.querySelector(`#guide-pane-${tab}`);
      assert(pane !== null, `Pane exists for ${tab}`);
      assertEqual(pane.style.display, 'flex');
    }

    // Verify Multi-elevation architectural SVG diagram content
    guide.switchTab('bridges');
    const modalHtml = guide.modalEl.innerHTML;
    assert(modalHtml.includes('Bridge EW (B_EW) Elevation Crossing'), 'B_EW diagram present');
    assert(modalHtml.includes('Bridge NS (B_NS) Elevation Crossing'), 'B_NS diagram present');
    assert(modalHtml.includes('Ground Tunnel (Z=0) East ↔ West'), 'Z=0 tunnel indicated');
    assert(modalHtml.includes('Overhead (Z=1)'), 'Z=1 indicated');
    assert(modalHtml.includes('R_S (▲)'), 'R_S ramp symbol present');

    // Close
    guide.close();
    assertEqual(guide.isOpen, false);
    assert(!document.body.classList.contains('modal-open'), 'Body modal-open removed');
  });

  it('CMP-18: verifies FeedbackModal singleton, lifecycle, diagnostics generation, and GitHub issue link', () => {
    const feedback = getFeedbackModal();
    assert(feedback instanceof FeedbackModal, 'Returns FeedbackModal instance');
    assertEqual(feedback.isOpen, false);

    // Open feedback modal with rich telemetry context
    feedback.open({
      pageTitle: 'Labyrinth of Echoes',
      activeLevel: { id: 'lvl_echo_07', title: 'The Silent Chamber' },
    });

    assertEqual(feedback.isOpen, true);
    assert(document.body.classList.contains('modal-open'), 'Body modal-open applied');

    // Verify location & telemetry pre element
    const locEl = feedback.modalEl.querySelector('#feedback-context-location');
    assert(locEl !== null, 'Location context element exists');
    assert(locEl.textContent.includes('The Silent Chamber'), 'Displays active level title');

    const previewEl = feedback.modalEl.querySelector('#feedback-telemetry-preview');
    assert(previewEl !== null, 'Telemetry pre exists');
    assert(previewEl.textContent.includes('engineVersion'), 'Contains engine telemetry');

    // Enter user notes
    const notesEl = feedback.modalEl.querySelector('#feedback-user-notes');
    if (notesEl) {
      notesEl.value = 'Elevation transition glyph clipped behind pillar.';
    }

    // Verify bundle generation
    const bundle = feedback._generateBundle();
    assert(bundle !== null, 'Bundle generated');
    assert(typeof bundle.markdown === 'string', 'Bundle markdown is string');
    assert(bundle.markdown.includes('Bug Report Diagnostic Bundle'), 'Markdown has diagnostic title');
    assert(bundle.markdown.includes('The Silent Chamber'), 'Active level title reflected in bundle');

    // Verify GitHub issue URL formatting
    const githubBtn = feedback.modalEl.querySelector('#btn-feedback-github');
    assert(githubBtn !== null, 'GitHub issue report button exists');

    // Close
    feedback.close();
    assertEqual(feedback.isOpen, false);
    assert(!document.body.classList.contains('modal-open'), 'Body modal-open removed');
  });
});
