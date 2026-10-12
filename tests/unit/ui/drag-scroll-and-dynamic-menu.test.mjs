/**
 * Unit Tests: Click-and-Drag Menu Scrolling, Vertical Main Menu Scroll & Dynamic Size Detection (BL-123, ADR-0033)
 *
 * Verifies:
 * 1. DragScroller lifecycle, mouse gesture recognition, click vs drag threshold, and axis constraints.
 * 2. DynamicMenuController dimensional inspection, overflow detection, edge state toggles, and pagination.
 * 3. CSS drag-scroll and pager styling across main.css and game.css.
 * 4. Integration across maze.html, index.html, editor.html, and app-header.js.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { DragScroller, enableDragScroll, autoInitDragScroll } from '../../../js/ui/drag-scroll.js';
import { DynamicMenuController, attachDynamicMenu } from '../../../js/ui/dynamic-menu-controller.js';

const isNode = typeof process !== 'undefined' && process.versions?.node;

// Mock DOM Element Factory for Node tests
function createMockElement(tagName = 'div', attributes = {}) {
  const classListSet = new Set();
  const listeners = {};
  const dataset = {};

  const element = {
    tagName: tagName.toUpperCase(),
    clientWidth: 300,
    clientHeight: 100,
    scrollWidth: 600,
    scrollHeight: 200,
    scrollLeft: 0,
    scrollTop: 0,
    style: {},
    dataset,
    ownerDocument: null,
    parentNode: null,
    nextSibling: null,
    children: [],

    getAttribute(name) {
      return attributes[name] || null;
    },
    setAttribute(name, val) {
      attributes[name] = String(val);
    },
    hasAttribute(name) {
      return name in attributes;
    },

    classList: {
      add(...classes) {
        classes.forEach(c => classListSet.add(c));
      },
      remove(...classes) {
        classes.forEach(c => classListSet.delete(c));
      },
      contains(c) {
        return classListSet.has(c);
      },
      toggle(c, force) {
        if (force === undefined) {
          if (classListSet.has(c)) classListSet.delete(c);
          else classListSet.add(c);
        } else if (force) {
          classListSet.add(c);
        } else {
          classListSet.delete(c);
        }
        return classListSet.has(c);
      },
    },

    addEventListener(event, fn, opts) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    removeEventListener(event, fn) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(h => h !== fn);
    },
    dispatchEvent(event) {
      const fns = listeners[event.type] || [];
      fns.forEach(fn => fn(event));
      return true;
    },

    scrollBy(options) {
      if (typeof options === 'object') {
        this.scrollLeft += options.left || 0;
        this.scrollTop += options.top || 0;
      }
    },

    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    insertBefore(child, reference) {
      child.parentNode = this;
      const idx = this.children.indexOf(reference);
      if (idx >= 0) this.children.splice(idx, 0, child);
      else this.children.push(child);
      return child;
    },
    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) this.children.splice(idx, 1);
      child.parentNode = null;
      return child;
    },
  };

  const mockDoc = {
    createElement(tag) {
      return createMockElement(tag);
    },
    addEventListener(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    removeEventListener(event, fn) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(h => h !== fn);
    },
    dispatchEvent(event) {
      const fns = listeners[event.type] || [];
      fns.forEach(fn => fn(event));
      return true;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };
  element.ownerDocument = mockDoc;

  return element;
}

describe('UI > DragScroller & DynamicMenuController (BL-123, ADR-0033)', () => {
  it('initializes DragScroller with horizontal and vertical axis constraints', () => {
    const elX = createMockElement('div');
    const scrollerX = enableDragScroll(elX, { axis: 'x' });

    assert(elX.classList.contains('drag-scroll-x'), 'Adds .drag-scroll-x class');
    assertEqual(scrollerX.axis, 'x', 'Axis is configured to x');

    const elY = createMockElement('div');
    const scrollerY = enableDragScroll(elY, { axis: 'y' });
    assert(elY.classList.contains('drag-scroll-y'), 'Adds .drag-scroll-y class');

    scrollerX.destroy();
    scrollerY.destroy();
    assert(!elX.classList.contains('drag-scroll-x'), 'Removes classes on destroy');
    assert(!elY.classList.contains('drag-scroll-y'), 'Removes classes on destroy');
  });

  it('manages drag threshold: ignores subtle pointer clicks and engages on drag movement', () => {
    const el = createMockElement('div');
    el.scrollLeft = 50;
    let dragStateChanges = [];

    const scroller = new DragScroller(el, {
      axis: 'x',
      dragThreshold: 6,
      onDragStateChange: (isDragging) => dragStateChanges.push(isDragging),
    });

    // 1. Mouse down at (100, 100)
    el.dispatchEvent({
      type: 'mousedown',
      button: 0,
      clientX: 100,
      clientY: 100,
      target: el,
      preventDefault() {},
      stopPropagation() {},
    });
    assertEqual(scroller.isMouseDown, true, 'isMouseDown flag set on mouse down');
    assertEqual(scroller.isDragging, false, 'isDragging remains false until threshold exceeded');

    // 2. Small jitter movement (delta = 3px < 6px threshold)
    el.ownerDocument.dispatchEvent({
      type: 'mousemove',
      clientX: 103,
      clientY: 100,
      preventDefault() {},
      stopPropagation() {},
    });
    assertEqual(scroller.isDragging, false, 'Still not dragging under threshold');
    assertEqual(el.scrollLeft, 50, 'scrollLeft untouched');

    // 3. Significant movement (delta = 20px >= 6px threshold)
    el.ownerDocument.dispatchEvent({
      type: 'mousemove',
      clientX: 120,
      clientY: 100,
      preventDefault() {},
      stopPropagation() {},
    });
    assertEqual(scroller.isDragging, true, 'isDragging engaged beyond threshold');
    assert(el.classList.contains('is-dragging'), '.is-dragging class applied');
    // Movement was +20px (from 100 to 120), so content scrolls left by dx: 50 - 20 = 30
    assertEqual(el.scrollLeft, 30, 'scrollLeft updated correctly during drag');

    // 4. Mouse up concludes drag
    el.ownerDocument.dispatchEvent({
      type: 'mouseup',
      button: 0,
      preventDefault() {},
      stopPropagation() {},
    });
    assertEqual(scroller.isMouseDown, false, 'isMouseDown cleared on mouse up');
    assert(!el.classList.contains('is-dragging'), '.is-dragging removed on mouse up');
    assert(dragStateChanges.includes(true), 'Registered transition to dragging');
    assert(dragStateChanges.includes(false), 'Registered transition back from dragging');

    scroller.destroy();
  });

  it('autoInitDragScroll discovers and initializes data-drag-scroll elements', () => {
    const el1 = createMockElement('div', { 'data-drag-scroll': 'x' });
    const el2 = createMockElement('div', { 'data-drag-scroll': 'y' });

    const mockRoot = {
      querySelectorAll(selector) {
        if (selector === '[data-drag-scroll]') return [el1, el2];
        return [];
      },
    };

    const instances = autoInitDragScroll(mockRoot);
    assertEqual(instances.length, 2, 'Initializes both matched elements');
    assert(el1.classList.contains('drag-scroll-x'), 'el1 has drag-scroll-x class');
    assert(el2.classList.contains('drag-scroll-y'), 'el2 has drag-scroll-y class');

    instances.forEach(i => i.destroy());
  });

  it('DynamicMenuController detects overflow and updates scroll state indicators', () => {
    const container = createMockElement('div');
    container.clientWidth = 200;
    container.scrollWidth = 500;
    container.scrollLeft = 0;

    let resizeMetrics = null;
    const controller = attachDynamicMenu(container, {
      axis: 'x',
      enablePaging: false,
      enableDragScroll: false,
      onResize: (m) => { resizeMetrics = m; },
    });

    assert(controller.isOverflowing, 'Correctly flags isOverflowing = true');
    assert(!controller.canScrollStart, 'Cannot scroll start at scrollLeft = 0');
    assert(controller.canScrollEnd, 'Can scroll end when scrollWidth > clientWidth');
    assert(container.classList.contains('is-overflowing-x'), 'Has .is-overflowing-x class');
    assert(container.classList.contains('can-scroll-right'), 'Has .can-scroll-right class');
    assert(!container.classList.contains('can-scroll-left'), 'Does not have .can-scroll-left at start');

    // Simulate scrolled forward
    container.scrollLeft = 150;
    controller.update();

    assert(controller.canScrollStart, 'Now can scroll start');
    assert(controller.canScrollEnd, 'Can still scroll end');
    assert(container.classList.contains('can-scroll-left'), 'Now has .can-scroll-left class');
    assert(container.classList.contains('can-scroll-right'), 'Retains .can-scroll-right class');

    // Simulate scrolled to the very end
    container.scrollLeft = 300;
    controller.update();
    assert(controller.canScrollStart, 'Can scroll start');
    assert(!controller.canScrollEnd, 'Cannot scroll end when at tail');
    assert(!container.classList.contains('can-scroll-right'), '.can-scroll-right removed at end');

    controller.destroy();
  });

  it('DynamicMenuController manages pagination steps (nextPage / prevPage)', () => {
    const container = createMockElement('div');
    container.clientWidth = 200;
    container.scrollWidth = 600;
    container.scrollLeft = 0;

    const controller = new DynamicMenuController(container, {
      axis: 'x',
      enablePaging: true,
      enableDragScroll: false,
      pageStepRatio: 0.8,
    });

    assertEqual(controller.totalPages, 4, 'Total pages calculated based on step ratio');
    assertEqual(controller.currentPage, 1, 'Initial page is 1');

    // Next page shifts by clientWidth * 0.8 = 160
    controller.nextPage();
    assertEqual(container.scrollLeft, 160, 'scrollLeft shifted by page step delta');

    controller.prevPage();
    assertEqual(container.scrollLeft, 0, 'scrollLeft returned to 0 on prevPage');

    controller.destroy();
  });

  it('verifies CSS definitions for drag-scroll and dynamic menu pager in main.css and game.css', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');

    const mainCss = fs.readFileSync(path.resolve(process.cwd(), 'css/main.css'), 'utf-8');
    const gameCss = fs.readFileSync(path.resolve(process.cwd(), 'css/game.css'), 'utf-8');

    // main.css classes
    assert(mainCss.includes('.drag-scroll-x'), 'main.css defines .drag-scroll-x');
    assert(mainCss.includes('.drag-scroll-y'), 'main.css defines .drag-scroll-y');
    assert(mainCss.includes('.dynamic-menu-pager'), 'main.css defines .dynamic-menu-pager');
    assert(mainCss.includes('.dynamic-pager-btn'), 'main.css defines .dynamic-pager-btn');
    assert(mainCss.includes('.can-scroll-left'), 'main.css defines .can-scroll-left');
    assert(mainCss.includes('.can-scroll-right'), 'main.css defines .can-scroll-right');

    // game.css firm-top-bar responsive overflow-x support
    assert(gameCss.includes('overflow-x: auto'), 'game.css firm-top-bar supports overflow-x auto');
    assert(gameCss.includes('touch-action: pan-x'), 'game.css firm-top-bar supports touch-action pan-x');
  });

  it('verifies integration of DynamicMenuController across maze.html, index.html, editor.html, and app-header.js', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');

    const mazeHtml = fs.readFileSync(path.resolve(process.cwd(), 'maze.html'), 'utf-8');
    const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
    const editorHtml = fs.readFileSync(path.resolve(process.cwd(), 'editor.html'), 'utf-8');
    const appHeaderJs = fs.readFileSync(path.resolve(process.cwd(), 'js/ui/app-header.js'), 'utf-8');

    // maze.html
    assert(mazeHtml.includes("import { DynamicMenuController } from './js/ui/dynamic-menu-controller.js'"), 'maze.html imports DynamicMenuController');
    assert(mazeHtml.includes("new DynamicMenuController(firmTopBarEl"), 'maze.html attaches DynamicMenuController to firmTopBarEl');
    assert(mazeHtml.includes("new DynamicMenuController(pauseModalBodyEl"), 'maze.html attaches DynamicMenuController to pause modal body');

    // index.html
    assert(indexHtml.includes("import { DynamicMenuController } from './js/ui/dynamic-menu-controller.js'"), 'index.html imports DynamicMenuController');
    assert(indexHtml.includes("new DynamicMenuController(modeTabsNav"), 'index.html attaches DynamicMenuController to mode tabs nav');

    // editor.html
    assert(editorHtml.includes('data-drag-scroll="x"'), 'editor.html enables data-drag-scroll on category nav');

    // app-header.js
    assert(appHeaderJs.includes('DynamicMenuController'), 'app-header.js imports DynamicMenuController');
    assert(appHeaderJs.includes('header._dynamicMenu'), 'app-header.js attaches dynamic menu controller to nav links');
  });
});
