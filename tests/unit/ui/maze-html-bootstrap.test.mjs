/**
 * Unit & Integration Test: maze.html Bootstrap & UI Callbacks Lifecycle
 * Verifies that the embedded script in maze.html executes cleanly in a DOM environment
 * without Temporal Dead Zone (TDZ) ReferenceErrors or uninitialized callback dependencies.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';

const isNode = typeof process !== 'undefined' && process.versions?.node;

function createMockElement(id = '', tagName = 'div') {
  const classes = new Set();
  const classList = {
    add(...cls) { cls.forEach(c => classes.add(c)); },
    remove(...cls) { cls.forEach(c => classes.delete(c)); },
    contains(c) { return classes.has(c); },
    toggle(c, force) {
      const has = classes.has(c);
      const shouldHave = force !== undefined ? force : !has;
      if (shouldHave) classes.add(c);
      else classes.delete(c);
      return shouldHave;
    },
  };

  const listeners = {};
  const children = [];

  return {
    id,
    tagName: tagName.toUpperCase(),
    classList,
    style: {},
    textContent: '',
    innerHTML: '',
    width: 1024,
    height: 768,
    children,
    getAttribute(attr) { return this[attr] || null; },
    setAttribute(attr, val) { this[attr] = val; },
    removeAttribute(attr) { delete this[attr]; },
    appendChild(child) {
      children.push(child);
      return child;
    },
    remove() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener(evt, fn) {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
    },
    removeEventListener(evt, fn) {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(f => f !== fn);
      }
    },
    getContext() {
      return {
        fillRect: () => {},
        strokeRect: () => {},
        fillText: () => {},
        strokeText: () => {},
        measureText: () => ({ width: 10 }),
        setLineDash: () => {},
        roundRect: () => {},
        rect: () => {},
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        drawImage: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        ellipse: () => {},
        bezierCurveTo: () => {},
        quadraticCurveTo: () => {},
        clip: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
      };
    },
  };
}

describe('UI > maze.html Bootstrap & UI Callbacks Lifecycle', () => {
  it('executes maze.html module script without ReferenceError or TDZ errors', async () => {
    if (!isNode) return;
    const { default: fs } = await import('fs');
    const { default: path } = await import('path');

    const rootDir = process.cwd();
    const mazeHtmlPath = path.join(rootDir, 'maze.html');
    const htmlContent = fs.readFileSync(mazeHtmlPath, 'utf8');

    // Extract the <script type="module"> contents
    const scriptMatch = htmlContent.match(/<script\s+type=["']module["']>([\s\S]*?)<\/script>/i);
    assert(scriptMatch !== null, 'Found <script type="module"> inside maze.html');
    const scriptCode = scriptMatch[1];

    // Build mock DOM environment
    const elements = new Map();
    function getOrCreateElement(id) {
      if (!elements.has(id)) {
        elements.set(id, createMockElement(id));
      }
      return elements.get(id);
    }

    const prevWindow = globalThis.window;
    const prevDocument = globalThis.document;
    const prevFetch = globalThis.fetch;
    const prevSessionStorage = globalThis.sessionStorage;
    const prevLocalStorage = globalThis.localStorage;

    const mockStorage = new Map();
    const sessionStorageObj = {
      getItem(k) { return mockStorage.get(k) || null; },
      setItem(k, v) { mockStorage.set(k, String(v)); },
      removeItem(k) { mockStorage.delete(k); },
    };

    const prevRaf = globalThis.requestAnimationFrame;
    const prevCaf = globalThis.cancelAnimationFrame;
    const mockRaf = (cb) => setTimeout(cb, 16);
    const mockCaf = (id) => clearTimeout(id);

    globalThis.requestAnimationFrame = mockRaf;
    globalThis.cancelAnimationFrame = mockCaf;

    globalThis.window = {
      innerWidth: 1024,
      innerHeight: 768,
      location: {
        search: '?id=1',
        hash: '',
        href: 'http://localhost/maze.html?id=1',
      },
      addEventListener() {},
      removeEventListener() {},
      sessionStorage: sessionStorageObj,
      localStorage: sessionStorageObj,
      navigator: {
        clipboard: { writeText: async () => {} },
      },
      requestAnimationFrame: mockRaf,
      cancelAnimationFrame: mockCaf,
      gameLoop: null,
    };

    globalThis.document = {
      getElementById(id) { return getOrCreateElement(id); },
      createElement(tag) { return createMockElement('', tag); },
      querySelector(sel) {
        if (sel.startsWith('#')) return getOrCreateElement(sel.substring(1));
        return null;
      },
      querySelectorAll() { return []; },
      addEventListener() {},
      removeEventListener() {},
    };

    globalThis.sessionStorage = sessionStorageObj;
    globalThis.localStorage = sessionStorageObj;
    globalThis.location = globalThis.window.location;

    globalThis.fetch = async function (url) {
      const cleanPath = url.replace(/^\.\//, '').split('?')[0];
      const filePath = path.resolve(rootDir, cleanPath);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        return {
          ok: true,
          status: 200,
          json: async () => JSON.parse(raw),
          text: async () => raw,
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    // Write extracted script to temporary runner in root so relative imports resolve cleanly
    const tempScriptPath = path.join(rootDir, '.test_maze_bootstrap_temp.mjs');
    fs.writeFileSync(tempScriptPath, scriptCode, 'utf8');

    let importError = null;
    try {
      // Dynamically import the script, executing its top-level code
      const cacheBust = Date.now();
      await import(`../../../.test_maze_bootstrap_temp.mjs?t=${cacheBust}`);
    } catch (err) {
      importError = err;
    } finally {
      if (fs.existsSync(tempScriptPath)) {
        try { fs.unlinkSync(tempScriptPath); } catch (_) {}
      }
    }

    assertEqual(importError, null, `maze.html script executed cleanly without errors: ${importError?.message}`);

    // Verify gameLoop was created and attached to window
    assert(globalThis.window.gameLoop !== null, 'window.gameLoop was initialized');
    assertEqual(globalThis.window.gameLoop.level.id, '1', 'Level 1 was loaded into gameLoop');

    // Verify onStateUpdate correctly populated HUD elements during constructor execution
    const titleEl = getOrCreateElement('hud-level-title');
    assertEqual(titleEl.textContent, 'First Footsteps', 'Level title HUD element populated on state update');

    const elevationEl = getOrCreateElement('hud-elevation');
    assertEqual(elevationEl.textContent, 'Ground Floor', 'Elevation HUD element populated');

    // Test onStateUpdate step change doesn't throw TDZ errors
    globalThis.window.gameLoop.player.stepsTaken = 1;
    globalThis.window.gameLoop.notifyUI();

    // Verify interaction available callback runs cleanly
    const tileIndicator = getOrCreateElement('hud-tile-indicator');
    const btnContextual = getOrCreateElement('hud-contextual-interact');
    assert(tileIndicator !== null, 'hud-tile-indicator exists');
    assert(btnContextual !== null, 'hud-contextual-interact exists');

    // Simulate inspection trigger
    const wallDecorEvent = {
      decorType: 'carving',
      title: "Architect's Carving",
      author: 'Master Mason',
      text: 'Follow the northern arches.',
      response: 'A clear guide.',
      facing: 'North',
    };
    globalThis.window.gameLoop.uiCallbacks.onWallDecorInspected(wallDecorEvent);

    const hudLoreCard = getOrCreateElement('hud-lore-card');
    assert(!hudLoreCard.classList.contains('hidden'), 'Lore card becomes visible after inspection');
    const hudLoreTitle = getOrCreateElement('hud-lore-title');
    assertEqual(hudLoreTitle.textContent, "Architect's Carving", 'Lore card title populated');

    // Step player and verify onStateUpdate auto-dismisses lore card
    globalThis.window.gameLoop.player.stepsTaken = 2;
    globalThis.window.gameLoop.notifyUI();
    assert(hudLoreCard.classList.contains('hidden'), 'Lore card automatically dismissed on player move');

    // Simulate pedestal inspect
    globalThis.window.gameLoop.uiCallbacks.onPedestalInspect({
      pedestalName: 'Solar Altar',
      riddleHint: 'Place the sunstone crystal here.',
      socketedItem: null,
    });
    const pedestalModal = getOrCreateElement('pedestal-modal');
    assert(pedestalModal.classList.contains('active'), 'Pedestal modal activated on inspection');

    // Simulate victory trigger and verify modal & medal pills render without error
    globalThis.window.gameLoop.uiCallbacks.onVictory({
      time: 12500,
      timeFormatted: '12.5s',
      steps: 18,
      tier: 'gold',
      performanceScore: 1650,
      earnedParSteps: true,
      earnedParTime: true,
      secretsFound: 1,
      totalSecrets: 1,
      flawless: true,
      secretSleuth: true,
      targetLevel: null,
      branchLabel: null,
    });

    const victoryModal = getOrCreateElement('victory-modal');
    assert(victoryModal.classList.contains('active'), 'Victory modal activated');
    const vicScore = getOrCreateElement('vic-score');
    assertEqual(vicScore.textContent, '1,650', 'Performance score formatted in victory modal');

    const vicTierBadge = getOrCreateElement('vic-tier-badge');
    assert(vicTierBadge.classList.contains('tier-gold'), 'Gold Vanguard tier shield applied');

    const medalsContainer = getOrCreateElement('victory-medals-container');
    assert(medalsContainer.children.length >= 4, 'Prestige badges rendered for clear, par, secrets, and flawless');

    // Clean up globals
    if (globalThis.window.gameLoop?.stop) {
      globalThis.window.gameLoop.stop();
    }
    globalThis.requestAnimationFrame = prevRaf;
    globalThis.cancelAnimationFrame = prevCaf;
    globalThis.window = prevWindow;
    globalThis.document = prevDocument;
    globalThis.fetch = prevFetch;
    globalThis.sessionStorage = prevSessionStorage;
    globalThis.localStorage = prevLocalStorage;
  });
});
