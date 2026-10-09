/**
 * Casual Maze Game Test Harness — Mocks & Polyfills
 * Zero-dependency browser environment shims for Node.js test runs.
 */

class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(String(key)) ?? null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }
  readAsText(blob) {
    const deliver = (text) => {
      this.result = text;
      if (this.onload) {
        this.onload({ target: { result: text } });
      }
    };

    setTimeout(async () => {
      try {
        if (!blob) {
          deliver('');
        } else if (typeof blob.text === 'function') {
          const text = await blob.text();
          deliver(text);
        } else if (blob.content !== undefined) {
          deliver(blob.content);
        } else {
          deliver(String(blob));
        }
      } catch (err) {
        if (this.onerror) this.onerror(err);
      }
    }, 0);
  }
}

class MockBlob {
  constructor(parts = [], options = {}) {
    this.content = parts.join('');
    this.type = options.type || '';
    this.size = this.content.length;
  }
  async text() {
    return this.content;
  }
}

class MockCanvasContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.font = '10px sans-serif';
    this.textAlign = 'left';
    this.textBaseline = 'alphabetic';
    this.globalAlpha = 1.0;
    this.shadowColor = 'transparent';
    this.shadowBlur = 0;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
  }

  save() {}
  restore() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  ellipse() {}
  rect() {}
  roundRect() {}
  fill() {}
  stroke() {}
  fillRect() {}
  strokeRect() {}
  clearRect() {}
  drawImage() {}
  translate() {}
  rotate() {}
  scale() {}
  setTransform() {}
  resetTransform() {}
  setLineDash() {}
  getLineDash() { return []; }
  createLinearGradient() {
    return { addColorStop: () => {} };
  }
  createRadialGradient() {
    return { addColorStop: () => {} };
  }
  measureText(text) {
    return { width: (text || '').length * 8 };
  }
  fillText() {}
  strokeText() {}
}

class MockCanvas {
  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.style = {};
    this.ctx = new MockCanvasContext2D(this);
  }
  getContext(type) {
    if (type === '2d') return this.ctx;
    return null;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.width, height: this.height, right: this.width, bottom: this.height };
  }
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

class MockClipboard {
  constructor() {
    this.text = '';
  }
  async writeText(text) {
    this.text = String(text);
    return Promise.resolve();
  }
  async readText() {
    return Promise.resolve(this.text);
  }
}

export function setupMocks() {
  if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.setItem) {
    globalThis.localStorage = new MockStorage();
  }
  if (typeof globalThis.sessionStorage === 'undefined' || !globalThis.sessionStorage.setItem) {
    globalThis.sessionStorage = new MockStorage();
  }
  if (typeof globalThis.Blob === 'undefined') {
    globalThis.Blob = MockBlob;
  }
  if (typeof globalThis.FileReader === 'undefined') {
    globalThis.FileReader = MockFileReader;
  }
  if (typeof globalThis.URL === 'undefined') {
    globalThis.URL = {
      createObjectURL: () => 'blob:mock-url-' + Math.random().toString(36).slice(2),
      revokeObjectURL: () => {},
    };
  } else {
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = () => 'blob:mock-url-' + Math.random().toString(36).slice(2);
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = () => {};
    }
  }

  if (typeof globalThis.navigator === 'undefined') {
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: new MockClipboard() },
      configurable: true,
      writable: true,
    });
  } else if (!globalThis.navigator.clipboard) {
    try {
      globalThis.navigator.clipboard = new MockClipboard();
    } catch {
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        value: new MockClipboard(),
        configurable: true,
        writable: true,
      });
    }
  }

  if (typeof globalThis.window === 'undefined') {
    globalThis.window = globalThis;
  }
  const _windowListeners = globalThis._windowListeners || (globalThis._windowListeners = new Map());
  globalThis.window.addEventListener = (event, handler) => {
    if (!_windowListeners.has(event)) _windowListeners.set(event, []);
    _windowListeners.get(event).push(handler);
  };
  globalThis.window.removeEventListener = (event, handler) => {
    if (_windowListeners.has(event)) {
      const list = _windowListeners.get(event).filter(h => h !== handler);
      _windowListeners.set(event, list);
    }
  };
  globalThis.window.dispatchEvent = (event) => {
    const type = event?.type;
    if (type && _windowListeners.has(type)) {
      const handlers = [..._windowListeners.get(type)];
      for (const h of handlers) {
        try { h(event); } catch (err) { console.error(err); }
      }
    }
    return true;
  };

  if (typeof globalThis.document === 'undefined') {
    const elementsById = new Map();
    const createMockElement = (tagName) => {
      if (tagName.toLowerCase() === 'canvas') {
        return new MockCanvas();
      }
      let _id = '';
      let _className = '';
      const classes = new Set();
      const children = [];
      const el = {
        tagName: tagName.toUpperCase(),
        get id() { return _id; },
        set id(val) {
          _id = String(val);
          elementsById.set(_id, el);
        },
        get className() { return _className; },
        set className(val) {
          _className = String(val);
          classes.clear();
          _className.split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
        },
        style: {},
        dataset: {},
        classList: {
          add(c) { classes.add(c); _className = Array.from(classes).join(' '); },
          remove(c) { classes.delete(c); _className = Array.from(classes).join(' '); },
          toggle(c, force) {
            if (force === true) classes.add(c);
            else if (force === false) classes.delete(c);
            else if (classes.has(c)) classes.delete(c);
            else classes.add(c);
            _className = Array.from(classes).join(' ');
          },
          contains(c) { return classes.has(c); },
        },
        innerHTML: '',
        textContent: '',
        value: '',
        remove() {
          if (this.parentNode && this.parentNode.removeChild) {
            this.parentNode.removeChild(this);
          }
        },
        setAttribute: (k, v) => {
          if (k === 'id') el.id = v;
        },
        getAttribute: (k) => (k === 'id' ? el.id : null),
        appendChild: (child) => {
          children.push(child);
          Object.defineProperty(child, 'parentNode', { value: el, writable: true, configurable: true, enumerable: false });
          return child;
        },
        prepend: (child) => {
          children.unshift(child);
          Object.defineProperty(child, 'parentNode', { value: el, writable: true, configurable: true, enumerable: false });
          return child;
        },
        removeChild: (child) => {
          const idx = children.indexOf(child);
          if (idx !== -1) children.splice(idx, 1);
          return child;
        },
        addEventListener: (event, handler) => {
          if (!el._listeners) el._listeners = {};
          if (!el._listeners[event]) el._listeners[event] = [];
          el._listeners[event].push(handler);
        },
        removeEventListener: (event, handler) => {
          if (el._listeners?.[event]) {
            el._listeners[event] = el._listeners[event].filter(h => h !== handler);
          }
        },
        querySelector: (sel) => {
          if (sel?.startsWith('#')) {
            const targetId = sel.slice(1);
            if (elementsById.has(targetId)) {
              const existing = elementsById.get(targetId);
              if (!children.includes(existing)) {
                el.appendChild(existing);
              }
              return existing;
            }
            const child = createMockElement('div');
            child.id = targetId;
            el.appendChild(child);
            return child;
          }
          return el.querySelectorAll(sel)[0] || null;
        },
        querySelectorAll: (sel) => {
          const results = [];
          const collect = (node) => {
            if (sel?.startsWith('.')) {
              const cls = sel.slice(1);
              if (node.classList?.contains?.(cls)) results.push(node);
            } else if (sel?.startsWith('#')) {
              if (node.id === sel.slice(1)) results.push(node);
            } else if (sel === '*' || (node.tagName && node.tagName.toLowerCase() === sel.toLowerCase())) {
              results.push(node);
            }
            if (Array.isArray(node.children)) {
              node.children.forEach(collect);
            }
          };
          children.forEach(collect);
          return results;
        },
        click: function() {
          if (typeof this.onclick === 'function') {
            this.onclick({ type: 'click', target: this });
          }
          if (this._listeners?.click) {
            for (const h of this._listeners.click) {
              h({ type: 'click', target: this });
            }
          }
        },
      };

      Object.defineProperty(el, 'children', { value: children, writable: true, configurable: true, enumerable: false });
      Object.defineProperty(el, 'parentNode', { value: { removeChild: () => {} }, writable: true, configurable: true, enumerable: false });

      return el;
    };

    const mockBody = createMockElement('body');

    globalThis.document = {
      createElement: createMockElement,
      getElementById: (id) => elementsById.get(String(id)) || null,
      querySelector: (sel) => {
        if (sel?.startsWith('#')) {
          const targetId = sel.slice(1);
          return elementsById.get(targetId) || null;
        }
        return createMockElement('div');
      },
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      body: mockBody,
    };
  }
}

export function createMockCanvas(width = 800, height = 600) {
  return new MockCanvas(width, height);
}

export function resetStorageMocks() {
  if (globalThis.localStorage && globalThis.localStorage.clear) {
    globalThis.localStorage.clear();
  }
  if (globalThis.sessionStorage && globalThis.sessionStorage.clear) {
    globalThis.sessionStorage.clear();
  }
}
