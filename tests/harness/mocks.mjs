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
    globalThis.navigator = { clipboard: new MockClipboard() };
  } else if (!globalThis.navigator.clipboard) {
    globalThis.navigator.clipboard = new MockClipboard();
  }

  if (typeof globalThis.document === 'undefined') {
    const createMockElement = (tagName) => {
      if (tagName.toLowerCase() === 'canvas') {
        return new MockCanvas();
      }
      return {
        tagName: tagName.toUpperCase(),
        style: {},
        dataset: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          toggle(c, force) {
            if (force === true) this.classes.add(c);
            else if (force === false) this.classes.delete(c);
            else if (this.classes.has(c)) this.classes.delete(c);
            else this.classes.add(c);
          },
          contains(c) { return this.classes.has(c); },
        },
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => createMockElement('div'),
        querySelectorAll: () => [],
        click: () => {},
      };
    };

    globalThis.document = {
      createElement: createMockElement,
      querySelector: () => createMockElement('div'),
      querySelectorAll: () => [],
      body: {
        appendChild: () => {},
        removeChild: () => {},
      },
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
