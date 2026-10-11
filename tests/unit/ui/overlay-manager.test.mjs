/**
 * Unit Tests: OverlayManager & Conflict Detection Coordinator (BL-117, ADR-0029)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { OverlayManager, OVERLAY_PRIORITIES, OVERLAY_CATEGORIES } from '../../../js/ui/overlay-manager.js';
import { globalEvents } from '../../../js/core/events.js';

function createMockElement(id, rect = { left: 0, top: 0, width: 100, height: 100 }) {
  const classes = new Set();
  const attributes = new Map();
  const listeners = {};

  return {
    id,
    classList: {
      add: (...c) => c.forEach(cls => classes.add(cls)),
      remove: (...c) => c.forEach(cls => classes.delete(cls)),
      contains: (cls) => classes.has(cls),
      toggle: (cls, force) => {
        const has = classes.has(cls);
        const should = force !== undefined ? force : !has;
        if (should) classes.add(cls);
        else classes.delete(cls);
        return should;
      },
    },
    dataset: {},
    style: {},
    offsetParent: {}, // truthy means visible in DOM
    setAttribute: (k, v) => attributes.set(k, String(v)),
    getAttribute: (k) => attributes.get(k) || null,
    removeAttribute: (k) => attributes.delete(k),
    getBoundingClientRect: () => rect,
    querySelector: () => null,
    addEventListener: (evt, fn) => {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
    },
  };
}

describe('UI > OverlayManager & Conflict Detection Coordinator (BL-117)', () => {
  it('registers and unregisters overlays with categories and priorities', () => {
    const manager = new OverlayManager();
    const minimap = createMockElement('minimap-container');
    const modal = createMockElement('settings-modal');

    manager.register('minimap', minimap, {
      category: OVERLAY_CATEGORIES.FLOATING,
      priority: OVERLAY_PRIORITIES.MINIMAP,
    });
    manager.register('settingsModal', modal, {
      category: OVERLAY_CATEGORIES.MODAL,
      priority: OVERLAY_PRIORITIES.MODAL,
    });

    assertEqual(manager.has('minimap'), true);
    assertEqual(manager.has('settingsModal'), true);
    assertEqual(manager.get('minimap').priority, 60);
    assertEqual(manager.get('settingsModal').priority, 100);

    manager.unregister('minimap');
    assertEqual(manager.has('minimap'), false);
  });

  it('suppresses floating overlays when a blocking modal opens and restores on close', () => {
    const manager = new OverlayManager();
    const feed = createMockElement('game-activity-feed');
    const minimap = createMockElement('minimap-container');
    let suppressedCallbacks = 0;
    let restoredCallbacks = 0;

    manager.register('activityFeed', feed, {
      category: OVERLAY_CATEGORIES.FLOATING,
      onSuppress: () => { suppressedCallbacks++; },
      onRestore: () => { restoredCallbacks++; },
    });
    manager.register('minimap', minimap, {
      category: OVERLAY_CATEGORIES.FLOATING,
    });

    assertEqual(manager.isAnyModalActive(), false);
    assertEqual(manager.isSuppressed(), false);

    // 1. Open first modal (pause_menu)
    manager.setModalActive('pause_menu', true);
    assertEqual(manager.isAnyModalActive(), true);
    assertEqual(manager.isSuppressed(), true);
    assert(feed.classList.contains('overlay-suppressed'), 'Feed is suppressed');
    assert(minimap.classList.contains('overlay-suppressed'), 'Minimap is suppressed');
    assertEqual(suppressedCallbacks, 1);

    // 2. Open second nested modal (settings_modal)
    manager.setModalActive('settings_modal', true);
    assertEqual(manager.isAnyModalActive(), true);
    assertEqual(manager.isSuppressed(), true);

    // 3. Close settings_modal (pause_menu still open)
    manager.setModalActive('settings_modal', false);
    assertEqual(manager.isAnyModalActive(), true);
    assertEqual(manager.isSuppressed(), true, 'Still suppressed because pause_menu is open');

    // 4. Close pause_menu -> all clear!
    manager.setModalActive('pause_menu', false);
    assertEqual(manager.isAnyModalActive(), false);
    assertEqual(manager.isSuppressed(), false);
    assert(!feed.classList.contains('overlay-suppressed'), 'Feed suppression removed');
    assert(!minimap.classList.contains('overlay-suppressed'), 'Minimap suppression removed');
    assertEqual(restoredCallbacks, 1);
  });

  it('enforces mobile mutual exclusion: expanding minimap collapses activity feed', () => {
    const mockWindow = { innerWidth: 390 }; // Mobile iPhone viewport
    const manager = new OverlayManager({ windowObj: mockWindow });

    const feed = createMockElement('game-activity-feed');
    const minimap = createMockElement('minimap-container');

    manager.register('activityFeed', feed);
    manager.register('minimap', minimap);

    assertEqual(manager.isMobile(), true);

    // Initially start with feed expanded
    feed.classList.remove('minimized');
    minimap.classList.add('is-minimized');

    // User expands minimap on mobile!
    manager.toggleMinimap(false); // false = not minimized -> expanded

    assert(!minimap.classList.contains('is-minimized'), 'Minimap is expanded');
    assert(feed.classList.contains('minimized'), 'Activity feed was auto-minimized to prevent collision');
  });

  it('enforces mobile mutual exclusion: expanding activity feed collapses minimap', () => {
    const mockWindow = { innerWidth: 412 }; // Mobile Android viewport
    const manager = new OverlayManager({ windowObj: mockWindow });

    const feed = createMockElement('game-activity-feed');
    const minimap = createMockElement('minimap-container');

    manager.register('activityFeed', feed);
    manager.register('minimap', minimap);

    // Minimap is currently expanded
    minimap.classList.remove('is-minimized');
    feed.classList.add('minimized');

    // User expands activity feed!
    manager.toggleActivityFeed(false);

    assert(!feed.classList.contains('minimized'), 'Activity feed is expanded');
    assert(minimap.classList.contains('is-minimized'), 'Minimap was auto-minimized to prevent collision');
  });

  it('detects spatial AABB intersection and resolves overlay collisions', () => {
    const manager = new OverlayManager({ windowObj: { innerWidth: 1024 } });

    // Element A: Rect [10, 10, 100, 100] (left: 10, top: 10, right: 110, bottom: 110)
    const elA = createMockElement('elA', { left: 10, top: 10, width: 100, height: 100, right: 110, bottom: 110 });

    // Element B: Overlapping Rect [50, 50, 100, 100] (left: 50, top: 50, right: 150, bottom: 150)
    const elB = createMockElement('elB', { left: 50, top: 50, width: 100, height: 100, right: 150, bottom: 150 });

    // Element C: Non-overlapping Rect [300, 300, 50, 50] (left: 300, top: 300, right: 350, bottom: 350)
    const elC = createMockElement('elC', { left: 300, top: 300, width: 50, height: 50, right: 350, bottom: 350 });

    assertEqual(manager.checkSpatialIntersection(elA, elB), true, 'elA and elB overlap');
    assertEqual(manager.checkSpatialIntersection(elA, elC), false, 'elA and elC do not overlap');
  });

  it('detectAndResolveConflicts automatically resolves simultaneously expanded overlays on mobile', () => {
    const mockWindow = { innerWidth: 360 };
    const manager = new OverlayManager({ windowObj: mockWindow });

    const feed = createMockElement('game-activity-feed');
    const minimap = createMockElement('minimap-container');

    manager.register('activityFeed', feed);
    manager.register('minimap', minimap);

    // Force both to be expanded (e.g. simulated conflict state)
    feed.classList.remove('minimized');
    minimap.classList.remove('is-minimized');

    const resolved = manager.detectAndResolveConflicts();
    assertEqual(resolved.length, 1, 'Resolved 1 mobile conflict');

    // Exactly one should now be minimized
    const feedMin = feed.classList.contains('minimized');
    const miniMin = minimap.classList.contains('is-minimized');
    assert(feedMin || miniMin, 'One of the overlays was minimized');
    assert(!(feedMin && miniMin), 'They are not both minimized');
  });
});
