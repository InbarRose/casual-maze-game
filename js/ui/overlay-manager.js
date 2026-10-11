/**
 * Casual Maze Game — UI Overlay Conflict Detection & Visibility Coordinator
 *
 * Implements BL-117 and ADR-0029.
 * Coordinates visibility, mutual exclusion, spatial conflict detection, and
 * suppression across all floating overlays and modal dialogs.
 */

import { globalEvents } from '../core/events.js';

export const OVERLAY_PRIORITIES = Object.freeze({
  MODAL: 100,
  PAUSE_MENU: 90,
  TOP_BAR: 80,
  VIRTUAL_CONTROLS: 70,
  MINIMAP: 60,
  ACTIVITY_FEED: 50,
  TUTORIAL_HINT: 40,
});

export const OVERLAY_CATEGORIES = Object.freeze({
  FLOATING: 'floating',
  MODAL: 'modal',
  DRAWER: 'drawer',
  BAR: 'bar',
});

export class OverlayManager {
  /**
   * @param {Object} [options]
   * @param {number} [options.mobileBreakpoint=768]
   * @param {Window} [options.windowObj]
   */
  constructor(options = {}) {
    this.mobileBreakpoint = options.mobileBreakpoint ?? 768;
    this.windowObj = options.windowObj ?? (typeof window !== 'undefined' ? window : null);

    /** @type {Map<string, { id: string, element: HTMLElement, category: string, priority: number, options: Object }>} */
    this.overlays = new Map();

    /** @type {Set<string>} */
    this.activeModals = new Set();

    /** @type {boolean} */
    this._suppressed = false;

    /** @type {string|null} */
    this._lastActiveFloating = null;
  }

  /**
   * Check if current viewport represents a mobile/compact screen
   * @returns {boolean}
   */
  isMobile() {
    if (!this.windowObj) return false;
    return (this.windowObj.innerWidth ?? 1024) <= this.mobileBreakpoint;
  }

  /**
   * Register an overlay element with priority and category
   * @param {string} id Unique overlay identifier
   * @param {HTMLElement} element DOM element
   * @param {Object} [options]
   * @param {string} [options.category='floating']
   * @param {number} [options.priority=50]
   * @param {Function} [options.onSuppress]
   * @param {Function} [options.onRestore]
   */
  register(id, element, options = {}) {
    if (!id || !element) return;
    this.overlays.set(id, {
      id,
      element,
      category: options.category || OVERLAY_CATEGORIES.FLOATING,
      priority: options.priority ?? (OVERLAY_PRIORITIES[id.toUpperCase()] ?? 50),
      options,
    });
  }

  /**
   * Unregister an overlay element
   * @param {string} id
   */
  unregister(id) {
    this.overlays.delete(id);
    this.activeModals.delete(id);
  }

  /**
   * Check if an overlay is registered
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return this.overlays.has(id);
  }

  /**
   * Get registered overlay record
   * @param {string} id
   * @returns {Object|null}
   */
  get(id) {
    return this.overlays.get(id) || null;
  }

  /**
   * Record modal open or close status and automatically manage floating overlay suppression
   * @param {string} modalId
   * @param {boolean} active
   */
  setModalActive(modalId, active) {
    if (!modalId) return;

    if (active) {
      this.activeModals.add(modalId);
    } else {
      this.activeModals.delete(modalId);
    }

    const shouldSuppress = this.activeModals.size > 0;
    this.suppressFloatingOverlays(shouldSuppress);

    globalEvents.emit('overlay:modal_state_changed', {
      modalId,
      active,
      activeCount: this.activeModals.size,
    });
  }

  /**
   * Check if any modal is currently blocking
   * @returns {boolean}
   */
  isAnyModalActive() {
    return this.activeModals.size > 0;
  }

  /**
   * Suppress or unsuppress all floating HUD overlays
   * @param {boolean} suppress
   */
  suppressFloatingOverlays(suppress) {
    if (this._suppressed === suppress) return;
    this._suppressed = suppress;

    for (const [id, entry] of this.overlays.entries()) {
      if (entry.category === OVERLAY_CATEGORIES.FLOATING) {
        if (entry.element?.classList) {
          entry.element.classList.toggle('overlay-suppressed', suppress);
          if (suppress) {
            entry.element.setAttribute('data-overlay-suppressed', 'true');
          } else {
            entry.element.removeAttribute('data-overlay-suppressed');
          }
        }
        if (suppress && typeof entry.options.onSuppress === 'function') {
          entry.options.onSuppress();
        } else if (!suppress && typeof entry.options.onRestore === 'function') {
          entry.options.onRestore();
        }
      }
    }

    globalEvents.emit('overlay:suppression_changed', { suppressed: suppress });
  }

  /**
   * Check if floating overlays are currently suppressed
   * @returns {boolean}
   */
  isSuppressed() {
    return this._suppressed;
  }

  /**
   * Check if two elements spatially intersect on screen (AABB Collision)
   * @param {HTMLElement} elA
   * @param {HTMLElement} elB
   * @returns {boolean}
   */
  checkSpatialIntersection(elA, elB) {
    if (!elA || !elB || typeof elA.getBoundingClientRect !== 'function' || typeof elB.getBoundingClientRect !== 'function') {
      return false;
    }

    const rectA = elA.getBoundingClientRect();
    const rectB = elB.getBoundingClientRect();

    // Check if both elements have valid dimensions
    if (rectA.width <= 0 || rectA.height <= 0 || rectB.width <= 0 || rectB.height <= 0) {
      return false;
    }

    // AABB intersection test
    const overlaps = (
      rectA.left < rectB.right &&
      rectA.right > rectB.left &&
      rectA.top < rectB.bottom &&
      rectA.bottom > rectB.top
    );

    return overlaps;
  }

  /**
   * Toggle Minimap Radar visibility while maintaining mobile mutual exclusion with Activity Feed
   * @param {boolean} [forceState] Optional explicit minimized state
   * @returns {boolean} New minimized state
   */
  toggleMinimap(forceState) {
    const minimapEntry = this.overlays.get('minimap');
    const minimapEl = minimapEntry?.element;
    if (!minimapEl) return false;

    const isCurrentlyMin = minimapEl.classList.contains('is-minimized');
    const nextMin = forceState !== undefined ? forceState : !isCurrentlyMin;

    if (nextMin) {
      minimapEl.classList.add('is-minimized');
    } else {
      minimapEl.classList.remove('is-minimized');
      this._lastActiveFloating = 'minimap';

      // On mobile viewports, enforce mutual exclusion: expanding minimap collapses activity feed
      if (this.isMobile()) {
        const feedEntry = this.overlays.get('activityFeed');
        if (feedEntry?.element && !feedEntry.element.classList.contains('minimized')) {
          feedEntry.element.classList.add('minimized');
          this._updateFeedToggleButton(feedEntry.element, true);
          globalEvents.emit('overlay:conflict_resolved', {
            source: 'minimap',
            target: 'activityFeed',
            action: 'auto_minimized',
          });
        }
      }
    }

    this._updateMinimapToggleButton(minimapEl, nextMin);
    globalEvents.emit('overlay:state_changed', { id: 'minimap', minimized: nextMin });
    return nextMin;
  }

  /**
   * Toggle Activity Feed visibility while maintaining mobile mutual exclusion with Minimap
   * @param {boolean} [forceState] Optional explicit minimized state
   * @returns {boolean} New minimized state
   */
  toggleActivityFeed(forceState) {
    const feedEntry = this.overlays.get('activityFeed');
    const feedEl = feedEntry?.element;
    if (!feedEl) return false;

    const isCurrentlyMin = feedEl.classList.contains('minimized');
    const nextMin = forceState !== undefined ? forceState : !isCurrentlyMin;

    if (nextMin) {
      feedEl.classList.add('minimized');
    } else {
      feedEl.classList.remove('minimized');
      this._lastActiveFloating = 'activityFeed';

      // On mobile viewports, enforce mutual exclusion: expanding activity feed collapses minimap
      if (this.isMobile()) {
        const minimapEntry = this.overlays.get('minimap');
        if (minimapEntry?.element && !minimapEntry.element.classList.contains('is-minimized')) {
          minimapEntry.element.classList.add('is-minimized');
          this._updateMinimapToggleButton(minimapEntry.element, true);
          globalEvents.emit('overlay:conflict_resolved', {
            source: 'activityFeed',
            target: 'minimap',
            action: 'auto_minimized',
          });
        }
      }
    }

    this._updateFeedToggleButton(feedEl, nextMin);
    globalEvents.emit('overlay:state_changed', { id: 'activityFeed', minimized: nextMin });
    return nextMin;
  }

  /**
   * Detect and automatically resolve conflicts between visible floating overlays
   * @returns {Array<{ source: string, target: string, action: string }>} Resolved conflicts
   */
  detectAndResolveConflicts() {
    const resolved = [];

    // 1. Mobile mutual exclusion check between Minimap and Activity Feed
    if (this.isMobile()) {
      const minimap = this.overlays.get('minimap')?.element;
      const feed = this.overlays.get('activityFeed')?.element;

      if (minimap && feed) {
        const minimapExpanded = !minimap.classList.contains('is-minimized');
        const feedExpanded = !feed.classList.contains('minimized');

        if (minimapExpanded && feedExpanded) {
          // Both are expanded on a compact mobile screen: resolve conflict by minimizing the older one
          if (this._lastActiveFloating === 'activityFeed') {
            minimap.classList.add('is-minimized');
            this._updateMinimapToggleButton(minimap, true);
            resolved.push({ source: 'activityFeed', target: 'minimap', action: 'auto_minimized' });
          } else {
            feed.classList.add('minimized');
            this._updateFeedToggleButton(feed, true);
            resolved.push({ source: 'minimap', target: 'activityFeed', action: 'auto_minimized' });
          }
        }
      }
    }

    // 2. Spatial collision check between Virtual Controls and other visible overlays
    const controls = this.overlays.get('virtualControls')?.element;
    if (controls && controls.offsetParent !== null && !controls.classList.contains('minimized')) {
      for (const [id, entry] of this.overlays.entries()) {
        if (id === 'virtualControls' || entry.category !== OVERLAY_CATEGORIES.FLOATING) continue;
        const targetEl = entry.element;
        if (!targetEl || targetEl.offsetParent === null) continue;

        if (this.checkSpatialIntersection(controls, targetEl)) {
          // If virtual controls collide with a higher-priority overlay, dock controls to bottom
          if (controls.dataset && controls.dataset.dock !== 'bottom-left' && controls.dataset.dock !== 'bottom-right') {
            controls.dataset.dock = 'bottom-left';
            if (typeof controls.setAttribute === 'function') {
              controls.setAttribute('data-dock', 'bottom-left');
            }
            controls.style.top = '';
            controls.style.left = '';
            controls.style.right = '';
            controls.style.bottom = '';
            resolved.push({ source: id, target: 'virtualControls', action: 'relocated_dock' });
          }
        }
      }
    }

    if (resolved.length > 0) {
      globalEvents.emit('overlay:conflicts_detected_and_resolved', { conflicts: resolved });
    }

    return resolved;
  }

  /**
   * Helper to update Minimap toggle buttons across HUD and Top Bar
   * @private
   */
  _updateMinimapToggleButton(minimapEl, isMin) {
    const minBtn = minimapEl?.querySelector?.('#btn-minimap-minimize') ||
      (this.windowObj?.document?.getElementById?.('btn-minimap-minimize'));
    if (minBtn) {
      minBtn.textContent = isMin ? '▲' : '_';
    }

    const topBarBtn = this.windowObj?.document?.getElementById?.('btn-topbar-minimap');
    if (topBarBtn) {
      topBarBtn.classList.toggle('active', !isMin);
      topBarBtn.title = isMin ? 'Open Tactical Radar (Minimap) [M]' : 'Close Tactical Radar (Minimap) [M]';
    }
  }

  /**
   * Helper to update Activity Feed toggle buttons across HUD and Top Bar
   * @private
   */
  _updateFeedToggleButton(feedEl, isMin) {
    const toggleBtn = feedEl?.querySelector?.('#btn-feed-toggle') ||
      (this.windowObj?.document?.getElementById?.('btn-feed-toggle'));
    if (toggleBtn) {
      toggleBtn.textContent = isMin ? '▲' : '_';
    }

    const topBarBtn = this.windowObj?.document?.getElementById?.('btn-hud-feed-pill');
    if (topBarBtn) {
      topBarBtn.classList.toggle('active', !isMin);
      topBarBtn.title = isMin ? 'Open Activity Feed [F]' : 'Minimize Activity Feed [F]';
    }
  }
}

// Singleton instance for global browser environment
export const overlayManager = new OverlayManager();
if (typeof window !== 'undefined') {
  window.overlayManager = overlayManager;
}
