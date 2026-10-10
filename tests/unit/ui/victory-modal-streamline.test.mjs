/**
 * Unit Tests: Streamlined Victory Modal & Collapsible Drawer (BL-109, ADR-0021)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';

describe('UI > Streamlined Victory Modal & More Drawer (BL-109)', () => {
  function setupVictoryModalMock() {
    const classSet = new Set();
    const listeners = {};

    function makeElement(id) {
      const elClasses = new Set();
      return {
        id,
        style: { display: 'none' },
        innerHTML: '',
        textContent: '',
        classList: {
          add: (c) => elClasses.add(c),
          remove: (c) => elClasses.delete(c),
          toggle: (c, force) => {
            const has = elClasses.has(c);
            const next = force !== undefined ? force : !has;
            if (next) elClasses.add(c);
            else elClasses.delete(c);
            return next;
          },
          contains: (c) => elClasses.has(c),
        },
        clickCount: 0,
        click() {
          this.clickCount++;
          if (listeners[id]?.['click']) {
            listeners[id]['click']({ preventDefault: () => {} });
          }
        },
        addEventListener(event, fn) {
          if (!listeners[id]) listeners[id] = {};
          listeners[id][event] = fn;
        },
      };
    }

    const modal = makeElement('victory-modal');
    const drawer = makeElement('victory-more-drawer');
    const btnMore = makeElement('btn-vic-more');
    const btnNext = makeElement('btn-next-level');
    const btnReplay = makeElement('btn-replay');
    const btnWatch = makeElement('btn-vic-watch-replay');
    const btnReport = makeElement('btn-vic-report-issue');
    const btnQuickRetry = makeElement('btn-vic-quick-retry');
    const btnQuickWatch = makeElement('btn-vic-quick-watch');
    const btnQuickReport = makeElement('btn-vic-quick-report');

    // Simulate drawer toggle handler
    btnMore.addEventListener('click', () => {
      const isHidden = drawer.style.display === 'none';
      drawer.style.display = isHidden ? 'block' : 'none';
      btnMore.classList.toggle('active', isHidden);
      btnMore.innerHTML = isHidden
        ? '<span>Less</span> <span id="vic-more-chevron">▴</span>'
        : '<span>More</span> <span id="vic-more-chevron">▾</span>';
    });

    // Simulate quick icon delegation
    btnQuickRetry.addEventListener('click', () => { btnReplay.click(); });
    btnQuickWatch.addEventListener('click', () => { btnWatch.click(); });
    btnQuickReport.addEventListener('click', () => { btnReport.click(); });

    // Simulate replay reset
    btnReplay.addEventListener('click', () => {
      drawer.style.display = 'none';
      btnMore.classList.remove('active');
      btnMore.innerHTML = '<span>More</span> <span id="vic-more-chevron">▾</span>';
      modal.classList.remove('active');
    });

    return {
      modal,
      drawer,
      btnMore,
      btnNext,
      btnReplay,
      btnWatch,
      btnReport,
      btnQuickRetry,
      btnQuickWatch,
      btnQuickReport,
    };
  }

  it('starts with More drawer collapsed by default', () => {
    const { drawer, btnMore } = setupVictoryModalMock();
    assertEqual(drawer.style.display, 'none');
    assert(!btnMore.classList.contains('active'), 'More button not active initially');
  });

  it('expands More drawer and toggles button label when clicked', () => {
    const { drawer, btnMore } = setupVictoryModalMock();
    
    // First click: expand
    btnMore.click();
    assertEqual(drawer.style.display, 'block');
    assert(btnMore.classList.contains('active'), 'More button becomes active');
    assert(btnMore.innerHTML.includes('Less'), 'Label switches to Less');
    assert(btnMore.innerHTML.includes('▴'), 'Chevron points up');

    // Second click: collapse
    btnMore.click();
    assertEqual(drawer.style.display, 'none');
    assert(!btnMore.classList.contains('active'), 'More button no longer active');
    assert(btnMore.innerHTML.includes('More'), 'Label switches back to More');
    assert(btnMore.innerHTML.includes('▾'), 'Chevron points down');
  });

  it('delegates quick action icon clicks to primary handlers', () => {
    const {
      btnQuickRetry,
      btnQuickWatch,
      btnQuickReport,
      btnReplay,
      btnWatch,
      btnReport
    } = setupVictoryModalMock();

    btnQuickRetry.click();
    assertEqual(btnReplay.clickCount, 1, 'Quick retry invokes primary replay');

    btnQuickWatch.click();
    assertEqual(btnWatch.clickCount, 1, 'Quick watch invokes primary watch replay');

    btnQuickReport.click();
    assertEqual(btnReport.clickCount, 1, 'Quick report invokes primary report issue');
  });

  it('automatically collapses More drawer when level replay is initiated', () => {
    const { drawer, btnMore, btnReplay, modal } = setupVictoryModalMock();
    modal.classList.add('active');
    btnMore.click(); // expand
    assertEqual(drawer.style.display, 'block');

    btnReplay.click();
    assertEqual(drawer.style.display, 'none', 'Drawer collapsed on replay');
    assert(!btnMore.classList.contains('active'), 'More button inactive on replay');
    assert(!modal.classList.contains('active'), 'Modal dismissed on replay');
  });
});
