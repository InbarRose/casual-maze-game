/**
 * Casual Maze Game — Universal Click-and-Drag Momentum Scroll Controller (BL-123, ADR-0033)
 *
 * Enables fluid mouse and touch drag-to-scroll across horizontal navigation bars,
 * top command bars, vertical main menus, and modal sheets.
 */

export class DragScroller {
  /**
   * @param {HTMLElement} element - Target scrollable container
   * @param {object} [options={}]
   * @param {'x'|'y'|'both'} [options.axis='x'] - Scroll axis constraint
   * @param {number} [options.dragThreshold=5] - Minimum displacement in px to treat gesture as drag
   * @param {boolean} [options.cursor=true] - Whether to manage grab/grabbing cursor classes
   * @param {function(number, number): void} [options.onScroll=null] - Scroll callback (scrollLeft, scrollTop)
   * @param {function(boolean): void} [options.onDragStateChange=null] - Dragging state transition callback
   */
  constructor(element, options = {}) {
    if (!element) {
      throw new Error('DragScroller requires a valid DOM element');
    }

    this.element = element;
    this.axis = options.axis || 'x';
    this.dragThreshold = options.dragThreshold ?? 5;
    this.cursor = options.cursor ?? true;
    this.onScroll = options.onScroll || null;
    this.onDragStateChange = options.onDragStateChange || null;

    this.isMouseDown = false;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.startScrollLeft = 0;
    this.startScrollTop = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rafId = null;

    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onScroll = this._handleScroll.bind(this);

    this._init();
  }

  _init() {
    if (this.cursor && this.element.classList) {
      if (this.axis === 'x') {
        this.element.classList.add('drag-scroll-x');
      } else if (this.axis === 'y') {
        this.element.classList.add('drag-scroll-y');
      } else {
        this.element.classList.add('drag-scroll-both');
      }
    }

    this.element.addEventListener('mousedown', this._onMouseDown);
    this.element.addEventListener('scroll', this._onScroll, { passive: true });
  }

  _handleMouseDown(e) {
    // Only respond to primary left mouse button
    if (e.button !== 0) return;

    // Do not initiate drag if clicking form controls like inputs, textareas, or selects
    const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    this.isMouseDown = true;
    this.isDragging = false;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.startScrollLeft = this.element.scrollLeft || 0;
    this.startScrollTop = this.element.scrollTop || 0;
    this.velocityX = 0;
    this.velocityY = 0;

    if (this.rafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const doc = this.element.ownerDocument || document;
    doc.addEventListener('mousemove', this._onMouseMove);
    doc.addEventListener('mouseup', this._onMouseUp);
  }

  _handleMouseMove(e) {
    if (!this.isMouseDown) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const distance = Math.hypot(dx, dy);

    if (!this.isDragging && distance >= this.dragThreshold) {
      this.isDragging = true;
      if (this.element.classList) {
        this.element.classList.add('is-dragging');
      }
      if (typeof this.onDragStateChange === 'function') {
        this.onDragStateChange(true);
      }
    }

    if (this.isDragging) {
      // Prevent browser text selection while actively dragging
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      this.velocityX = e.clientX - this.lastX;
      this.velocityY = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;

      if (this.axis === 'x' || this.axis === 'both') {
        this.element.scrollLeft = this.startScrollLeft - dx;
      }
      if (this.axis === 'y' || this.axis === 'both') {
        this.element.scrollTop = this.startScrollTop - dy;
      }
    }
  }

  _handleMouseUp(e) {
    if (!this.isMouseDown) return;

    const doc = this.element.ownerDocument || document;
    doc.removeEventListener('mousemove', this._onMouseMove);
    doc.removeEventListener('mouseup', this._onMouseUp);

    this.isMouseDown = false;

    if (this.isDragging) {
      if (this.element.classList) {
        this.element.classList.remove('is-dragging');
      }
      if (typeof this.onDragStateChange === 'function') {
        this.onDragStateChange(false);
      }

      // Suppress accidental click events triggered on buttons/links after dragging
      const preventClick = (clickEvent) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        doc.removeEventListener('click', preventClick, true);
      };
      doc.addEventListener('click', preventClick, true);
      setTimeout(() => {
        doc.removeEventListener('click', preventClick, true);
      }, 60);

      // Apply light inertial deceleration glide
      this._applyMomentum();
    }
  }

  _applyMomentum() {
    if (typeof requestAnimationFrame !== 'function') return;

    let vx = this.velocityX;
    let vy = this.velocityY;
    const friction = 0.92;

    const step = () => {
      if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) {
        this.rafId = null;
        return;
      }

      vx *= friction;
      vy *= friction;

      if (this.axis === 'x' || this.axis === 'both') {
        this.element.scrollLeft -= vx;
      }
      if (this.axis === 'y' || this.axis === 'both') {
        this.element.scrollTop -= vy;
      }

      this.rafId = requestAnimationFrame(step);
    };

    if (Math.abs(vx) >= 1 || Math.abs(vy) >= 1) {
      this.rafId = requestAnimationFrame(step);
    }
  }

  _handleScroll() {
    if (typeof this.onScroll === 'function') {
      this.onScroll(this.element.scrollLeft, this.element.scrollTop);
    }
  }

  /**
   * Scroll smoothly by an offset
   * @param {number} deltaX
   * @param {number} deltaY
   */
  scrollByOffset(deltaX = 0, deltaY = 0) {
    if (typeof this.element.scrollBy === 'function') {
      this.element.scrollBy({ left: deltaX, top: deltaY, behavior: 'smooth' });
    } else {
      if (deltaX) this.element.scrollLeft = (this.element.scrollLeft || 0) + deltaX;
      if (deltaY) this.element.scrollTop = (this.element.scrollTop || 0) + deltaY;
    }
  }

  /**
   * Unbind listeners and clean up element styles
   */
  destroy() {
    if (this.rafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const doc = this.element.ownerDocument || document;
    doc.removeEventListener('mousemove', this._onMouseMove);
    doc.removeEventListener('mouseup', this._onMouseUp);

    this.element.removeEventListener('mousedown', this._onMouseDown);
    this.element.removeEventListener('scroll', this._onScroll);

    if (this.element.classList) {
      this.element.classList.remove('drag-scroll-x', 'drag-scroll-y', 'drag-scroll-both', 'is-dragging');
    }
  }
}

/**
 * Convenient factory function
 * @param {HTMLElement} element
 * @param {object} [options]
 * @returns {DragScroller}
 */
export function enableDragScroll(element, options = {}) {
  return new DragScroller(element, options);
}

/**
 * Automatically inspects the DOM and initializes drag scrolling on elements with data-drag-scroll
 * @param {Document|HTMLElement} [root=document]
 * @returns {DragScroller[]}
 */
export function autoInitDragScroll(root = document) {
  if (!root || typeof root.querySelectorAll !== 'function') return [];

  const elements = root.querySelectorAll('[data-drag-scroll]');
  const instances = [];

  elements.forEach(el => {
    const axis = el.getAttribute('data-drag-scroll') || 'x';
    instances.push(new DragScroller(el, { axis }));
  });

  return instances;
}
