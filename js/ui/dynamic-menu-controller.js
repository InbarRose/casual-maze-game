/**
 * Casual Maze Game — Dynamic Menu Size Detection & Pagination Controller (BL-123, ADR-0033)
 *
 * Continuously monitors menu container dimensions via ResizeObserver, detects horizontal
 * and vertical clipping, exposes visual scroll state cues, and provisions dynamic page
 * navigation (‹ Page X/Y ›) or overflow collapsing for compact and mobile screens.
 */

import { DragScroller } from './drag-scroll.js';

export class DynamicMenuController {
  /**
   * @param {HTMLElement} container - Menu container to monitor and control
   * @param {object} [options={}]
   * @param {'x'|'y'} [options.axis='x'] - Monitoring orientation
   * @param {boolean} [options.enablePaging=false] - Whether to generate or manage pager step controls
   * @param {HTMLElement|string|null} [options.pagerContainer=null] - Optional element or selector to host pager controls
   * @param {boolean} [options.enableDragScroll=true] - Whether to attach DragScroller automatically
   * @param {number} [options.pageStepRatio=0.8] - Fraction of client view to shift per page click
   * @param {function(object): void} [options.onResize=null] - Metrics update callback
   */
  constructor(container, options = {}) {
    if (!container) {
      throw new Error('DynamicMenuController requires a valid DOM element');
    }

    this.container = container;
    this.axis = options.axis || 'x';
    this.enablePaging = options.enablePaging ?? false;
    this.pagerContainer = typeof options.pagerContainer === 'string'
      ? (container.ownerDocument || document).querySelector(options.pagerContainer)
      : options.pagerContainer;
    this.enableDragScroll = options.enableDragScroll ?? true;
    this.pageStepRatio = options.pageStepRatio ?? 0.8;
    this.onResize = options.onResize || null;

    this.isOverflowing = false;
    this.canScrollStart = false;
    this.canScrollEnd = false;
    this.currentPage = 1;
    this.totalPages = 1;

    this.dragScroller = null;
    this.resizeObserver = null;
    this.pagerEl = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.pageLabelEl = null;

    this._onScroll = this._handleScroll.bind(this);
    this._onWindowResize = () => this.update();

    this._init();
  }

  _init() {
    if (this.enableDragScroll) {
      this.dragScroller = new DragScroller(this.container, {
        axis: this.axis === 'y' ? 'y' : 'x',
        onScroll: () => this._handleScroll(),
      });
    }

    this.container.addEventListener('scroll', this._onScroll, { passive: true });

    // Use ResizeObserver if available
    const win = this.container.ownerDocument ? this.container.ownerDocument.defaultView || window : window;
    if (typeof win.ResizeObserver === 'function') {
      this.resizeObserver = new win.ResizeObserver(() => {
        this.update();
      });
      this.resizeObserver.observe(this.container);
    } else if (win.addEventListener) {
      win.addEventListener('resize', this._onWindowResize);
    }

    if (this.enablePaging) {
      this._buildPager();
    }

    this.update();
  }

  _buildPager() {
    const doc = this.container.ownerDocument || document;
    this.pagerEl = doc.createElement('div');
    this.pagerEl.className = 'dynamic-menu-pager';
    this.pagerEl.style.display = 'none';

    this.prevBtn = doc.createElement('button');
    this.prevBtn.type = 'button';
    this.prevBtn.className = 'dynamic-pager-btn dynamic-pager-prev';
    this.prevBtn.innerHTML = '‹';
    this.prevBtn.title = 'Previous Menu Section';
    this.prevBtn.setAttribute('aria-label', 'Previous Menu Page');
    this.prevBtn.onclick = (e) => {
      e.stopPropagation();
      this.prevPage();
    };

    this.pageLabelEl = doc.createElement('span');
    this.pageLabelEl.className = 'dynamic-pager-indicator';
    this.pageLabelEl.textContent = '1/1';

    this.nextBtn = doc.createElement('button');
    this.nextBtn.type = 'button';
    this.nextBtn.className = 'dynamic-pager-btn dynamic-pager-next';
    this.nextBtn.innerHTML = '›';
    this.nextBtn.title = 'Next Menu Section';
    this.nextBtn.setAttribute('aria-label', 'Next Menu Page');
    this.nextBtn.onclick = (e) => {
      e.stopPropagation();
      this.nextPage();
    };

    this.pagerEl.appendChild(this.prevBtn);
    this.pagerEl.appendChild(this.pageLabelEl);
    this.pagerEl.appendChild(this.nextBtn);

    if (this.pagerContainer) {
      this.pagerContainer.appendChild(this.pagerEl);
    } else if (this.container.parentNode) {
      this.container.parentNode.insertBefore(this.pagerEl, this.container.nextSibling);
    }
  }

  /**
   * Re-evaluates container geometry and updates classes & pagination
   */
  update() {
    if (!this.container) return;

    const isX = this.axis === 'x';
    const clientSize = isX ? this.container.clientWidth : this.container.clientHeight;
    const scrollSize = isX ? this.container.scrollWidth : this.container.scrollHeight;
    const scrollPos = isX ? this.container.scrollLeft : this.container.scrollTop;

    // Tolerance of 2px for subpixel rendering variations
    this.isOverflowing = (scrollSize - clientSize) > 2;
    this.canScrollStart = scrollPos > 3;
    this.canScrollEnd = (scrollSize - clientSize - scrollPos) > 3;

    // Update container classes
    if (this.container.classList) {
      const pfx = isX ? 'x' : 'y';
      this.container.classList.toggle(`is-overflowing-${pfx}`, this.isOverflowing);
      this.container.classList.toggle(`can-scroll-start-${pfx}`, this.canScrollStart);
      this.container.classList.toggle(`can-scroll-end-${pfx}`, this.canScrollEnd);

      if (isX) {
        this.container.classList.toggle('can-scroll-left', this.canScrollStart);
        this.container.classList.toggle('can-scroll-right', this.canScrollEnd);
      } else {
        this.container.classList.toggle('can-scroll-up', this.canScrollStart);
        this.container.classList.toggle('can-scroll-down', this.canScrollEnd);
      }
    }

    // Update pagination
    if (clientSize > 0) {
      this.totalPages = Math.max(1, Math.ceil(scrollSize / (clientSize * this.pageStepRatio)));
      const rawPage = Math.floor(scrollPos / (clientSize * this.pageStepRatio)) + 1;
      this.currentPage = Math.min(this.totalPages, Math.max(1, rawPage));
    } else {
      this.totalPages = 1;
      this.currentPage = 1;
    }

    if (this.pagerEl) {
      if (this.isOverflowing) {
        this.pagerEl.style.display = 'inline-flex';
        if (this.pageLabelEl) {
          this.pageLabelEl.textContent = `${this.currentPage}/${this.totalPages}`;
        }
        if (this.prevBtn) {
          this.prevBtn.disabled = !this.canScrollStart;
        }
        if (this.nextBtn) {
          this.nextBtn.disabled = !this.canScrollEnd;
        }
      } else {
        this.pagerEl.style.display = 'none';
      }
    }

    if (typeof this.onResize === 'function') {
      this.onResize({
        isOverflowing: this.isOverflowing,
        canScrollStart: this.canScrollStart,
        canScrollEnd: this.canScrollEnd,
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        clientSize,
        scrollSize,
        scrollPos,
      });
    }
  }

  _handleScroll() {
    this.update();
  }

  /**
   * Navigate forward by one viewport section
   */
  nextPage() {
    const isX = this.axis === 'x';
    const clientSize = isX ? this.container.clientWidth : this.container.clientHeight;
    const delta = Math.round(clientSize * this.pageStepRatio);

    if (this.dragScroller) {
      this.dragScroller.scrollByOffset(isX ? delta : 0, isX ? 0 : delta);
    } else if (typeof this.container.scrollBy === 'function') {
      this.container.scrollBy({
        left: isX ? delta : 0,
        top: isX ? 0 : delta,
        behavior: 'smooth',
      });
    } else {
      if (isX) this.container.scrollLeft += delta;
      else this.container.scrollTop += delta;
    }
  }

  /**
   * Navigate backward by one viewport section
   */
  prevPage() {
    const isX = this.axis === 'x';
    const clientSize = isX ? this.container.clientWidth : this.container.clientHeight;
    const delta = -Math.round(clientSize * this.pageStepRatio);

    if (this.dragScroller) {
      this.dragScroller.scrollByOffset(isX ? delta : 0, isX ? 0 : delta);
    } else if (typeof this.container.scrollBy === 'function') {
      this.container.scrollBy({
        left: isX ? delta : 0,
        top: isX ? 0 : delta,
        behavior: 'smooth',
      });
    } else {
      if (isX) this.container.scrollLeft += delta;
      else this.container.scrollTop += delta;
    }
  }

  /**
   * Clean up observers, drag scroller, and injected elements
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    const win = this.container.ownerDocument ? this.container.ownerDocument.defaultView || window : window;
    if (win.removeEventListener) {
      win.removeEventListener('resize', this._onWindowResize);
    }

    this.container.removeEventListener('scroll', this._onScroll);

    if (this.dragScroller) {
      this.dragScroller.destroy();
      this.dragScroller = null;
    }

    if (this.pagerEl && this.pagerEl.parentNode) {
      this.pagerEl.parentNode.removeChild(this.pagerEl);
    }

    if (this.container.classList) {
      this.container.classList.remove(
        'is-overflowing-x',
        'is-overflowing-y',
        'can-scroll-start-x',
        'can-scroll-end-x',
        'can-scroll-start-y',
        'can-scroll-end-y',
        'can-scroll-left',
        'can-scroll-right',
        'can-scroll-up',
        'can-scroll-down'
      );
    }
  }
}

/**
 * Convenient factory function
 * @param {HTMLElement} container
 * @param {object} [options]
 * @returns {DynamicMenuController}
 */
export function attachDynamicMenu(container, options = {}) {
  return new DynamicMenuController(container, options);
}
