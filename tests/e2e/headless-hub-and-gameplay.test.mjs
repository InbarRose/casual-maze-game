/**
 * Headless Browser E2E Test Suite: Hub Navigation, Level Selection & Gameplay Execution
 * Verifies that index.html Hub is navigatable, levels load without stalling at "Loading...",
 * and gameplay executes with active input and live physics.
 * 
 * Runs in GitHub Actions CI as a quality gate on PRs to main branch (BL-114, ADR-0026).
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, execSync } from 'child_process';
import { describe, it, assert, assertEqual } from '../harness/index.mjs';

const rootDir = process.cwd();
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function findBrowserBinary() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  if (process.env.BROWSER_PATH && fs.existsSync(process.env.BROWSER_PATH)) return process.env.BROWSER_PATH;

  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
    ];
    for (const p of candidates) {
      if (p && fs.existsSync(p)) return p;
    }
  } else if (process.platform === 'darwin') {
    const candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
  } else {
    // Linux / Ubuntu GitHub Actions runners
    const candidates = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
      try {
        const out = execSync(`which ${name} 2>/dev/null`, { encoding: 'utf8' }).trim();
        if (out && fs.existsSync(out)) return out;
      } catch {}
    }
  }
  return null;
}

class HeadlessBrowserSession {
  constructor() {
    this.server = null;
    this.port = null;
    this.browserProc = null;
    this.debugPort = 9226 + Math.floor(Math.random() * 500);
    this.binary = findBrowserBinary();
    this.userDataDir = path.join(os.tmpdir(), `cmg-chrome-${Date.now()}-${Math.floor(Math.random() * 10000)}`);
  }

  async start() {
    if (!this.binary) return false;

    // Start ephemeral static server
    await new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        const urlPath = req.url.split('?')[0];
        const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
        let filePath = path.join(rootDir, safePath === '/' ? 'index.html' : safePath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }

        if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
          const ext = path.extname(filePath).toLowerCase();
          const mime = mimeTypes[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
          fs.createReadStream(filePath).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });
      this.server.listen(0, '127.0.0.1', () => {
        this.port = this.server.address().port;
        resolve();
      });
    });

    // Create unique user data directory for clean isolation
    try {
      fs.mkdirSync(this.userDataDir, { recursive: true });
    } catch {}

    // Launch headless browser with robust isolation flags
    this.browserProc = spawn(this.binary, [
      '--headless=new',
      `--remote-debugging-port=${this.debugPort}`,
      `--user-data-dir=${this.userDataDir}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-client-side-phishing-detection',
      '--disable-default-apps',
      '--disable-hang-monitor',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',
      'about:blank',
    ]);

    // Poll for CDP readiness with generous 7.5s allowance for VM runners
    let ready = false;
    for (let i = 0; i < 50; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${this.debugPort}/json/version`);
        if (res.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise(r => setTimeout(r, 150));
    }
    return ready;
  }

  async openPage(relativeUrl) {
    const fullUrl = `http://127.0.0.1:${this.port}/${relativeUrl}`;
    const newTabRes = await fetch(`http://127.0.0.1:${this.debugPort}/json/new?${encodeURIComponent(fullUrl)}`, { method: 'PUT' });
    const tab = await newTabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();
    const consoleLogs = [];
    const exceptions = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
        consoleLogs.push({ type: msg.params.type, text });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        exceptions.push(msg.params.exceptionDetails);
      }
    };

    await new Promise(r => ws.onopen = r);

    const send = (method, params = {}) => new Promise((resolve) => {
      const id = msgId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Runtime.enable');
    await send('Page.enable');

    return {
      tabId: tab.id,
      consoleLogs,
      exceptions,
      send,
      evaluate: async (expression) => {
        const res = await send('Runtime.evaluate', { expression, returnByValue: true });
        return res.result?.result?.value;
      },
      waitForFunction: async (fnExpression, timeoutMs = 10000, pollIntervalMs = 50) => {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
          try {
            const res = await send('Runtime.evaluate', { expression: fnExpression, returnByValue: true });
            const val = res.result?.result?.value;
            if (val) return val;
          } catch {}
          await new Promise(r => setTimeout(r, pollIntervalMs));
        }
        const lastErr = exceptions.map(e => e.exception?.description || e.text || JSON.stringify(e)).join('; ');
        throw new Error(`Timeout after ${timeoutMs}ms waiting for condition: "${fnExpression}". Exceptions: ${lastErr || 'none'}`);
      },
      close: async () => {
        try {
          await fetch(`http://127.0.0.1:${this.debugPort}/json/close/${tab.id}`);
        } catch {}
        ws.close();
      },
    };
  }

  async stop() {
    if (this.browserProc) {
      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /pid ${this.browserProc.pid} /T /F 2>nul`);
        } else {
          this.browserProc.kill('SIGKILL');
        }
      } catch {}
      this.browserProc = null;
    }
    if (this.server) {
      try {
        this.server.close();
      } catch {}
      this.server = null;
    }
    if (this.userDataDir && fs.existsSync(this.userDataDir)) {
      try {
        fs.rmSync(this.userDataDir, { recursive: true, force: true });
      } catch {}
    }
  }
}

describe('Headless E2E > Hub Navigation, Level Selection & Live Gameplay', () => {
  let session = null;
  let browserAvailable = false;

  it('initializes headless browser environment or reports system capability', async () => {
    session = new HeadlessBrowserSession();
    browserAvailable = await session.start();
    if (!browserAvailable) {
      console.warn('⚠️ No Chrome/Chromium binary found in environment; skipping browser E2E tests.');
      return;
    }
    assert(browserAvailable, 'Headless browser initialized and listening on CDP endpoint');
  });

  it('navigates Hub (index.html), switches game modes, and audits level rosters', async () => {
    if (!browserAvailable) return;
    const page = await session.openPage('index.html');
    await page.waitForFunction('Boolean(window.__hubReady && document.querySelectorAll(".campaign-levels .level-pill").length >= 32)');

    const hubState = await page.evaluate(`({
      title: document.title,
      campaignCount: document.querySelectorAll('.campaign-levels .level-pill').length,
      hasTabCampaign: Boolean(document.getElementById('tab-campaign')),
      hasTabStories: Boolean(document.getElementById('tab-stories')),
      hasTabArchitect: Boolean(document.getElementById('tab-architect')),
      campaignVisibleInitial: document.getElementById('campaign-section-container')?.style.display !== 'none',
      storiesVisibleInitial: document.getElementById('stories-section-container')?.style.display !== 'none'
    })`);

    assert(hubState.title.includes('Casual Maze Game'), 'Hub title matches');
    assert(hubState.hasTabCampaign, 'Campaign tab button exists');
    assert(hubState.hasTabStories, 'Stories tab button exists');
    assert(hubState.hasTabArchitect, 'Architect tab button exists');
    assert(hubState.campaignCount >= 32, 'All 32+ campaign level pills are present');

    // Switch to Stories tab
    await page.evaluate(`document.getElementById('tab-stories').click()`);
    await page.waitForFunction('document.getElementById("stories-section-container")?.style.display === "block"');

    const storiesState = await page.evaluate(`({
      storiesVisible: document.getElementById('stories-section-container')?.style.display === 'block',
      campaignVisible: document.getElementById('campaign-section-container')?.style.display === 'none'
    })`);
    assert(storiesState.storiesVisible, 'Stories container is visible after clicking tab');
    assert(storiesState.campaignVisible, 'Campaign container is hidden after clicking tab');

    // Switch back to Campaign tab
    await page.evaluate(`document.getElementById('tab-campaign').click()`);
    await page.waitForFunction('document.getElementById("campaign-section-container")?.style.display === "block"');

    const backToCampaign = await page.evaluate(`document.getElementById('campaign-section-container')?.style.display === 'block'`);
    assert(backToCampaign, 'Campaign container restored to visible');

    assertEqual(page.exceptions.length, 0, `Zero exceptions thrown during hub interactions: ${page.exceptions.map(e => e.exception?.description || e.text).join('; ')}`);
    await page.close();
  });

  it('selects Campaign Level 1, starts GameLoop, and transitions from "Loading..."', async () => {
    if (!browserAvailable) return;
    const page = await session.openPage('maze.html?id=1');
    await page.waitForFunction('Boolean(window.gameLoop && window.gameLoop.isRunning && document.getElementById("hud-level-title")?.textContent && document.getElementById("hud-level-title").textContent !== "Loading...")');

    const levelState = await page.evaluate(`({
      levelTitle: document.getElementById('hud-level-title')?.textContent,
      elevation: document.getElementById('hud-elevation')?.textContent,
      hasGameLoop: Boolean(window.gameLoop),
      isRunning: window.gameLoop?.isRunning,
      levelId: window.gameLoop?.level?.id,
      playerX: window.gameLoop?.player?.x,
      playerY: window.gameLoop?.player?.y,
      steps: window.gameLoop?.player?.stepsTaken
    })`);

    assert(levelState.hasGameLoop, 'window.gameLoop is initialized');
    assert(levelState.isRunning, 'GameLoop is running');
    assertEqual(levelState.levelId, '1', 'Level 1 loaded');
    assertEqual(levelState.levelTitle, 'First Footsteps', 'HUD level title resolved from Loading state');
    assertEqual(levelState.elevation, 'Ground Floor', 'Starting elevation is Ground Floor');
    assert(levelState.playerX > 0 && levelState.playerY > 0, 'Player spawned at valid grid coordinates');

    assertEqual(page.exceptions.length, 0, `Zero exceptions during Level 1 boot: ${page.exceptions.map(e => e.exception?.description || e.text).join('; ')}`);
    await page.close();
  });

  it('executes live gameplay movement and verifies step counter and elapsed timer', async () => {
    if (!browserAvailable) return;
    const page = await session.openPage('maze.html?id=1');
    await page.waitForFunction('Boolean(window.gameLoop && window.gameLoop.isRunning && window.gameLoop.player)');

    const initialPos = await page.evaluate(`({ x: window.gameLoop.player.gridX, y: window.gameLoop.player.gridY, steps: window.gameLoop.player.stepsTaken })`);

    // Step player to the right (walkable floor in Level 1)
    const moved = await page.evaluate(`window.gameLoop.tryMoveDirection('RIGHT')`);
    assert(moved, 'Player move initiated towards East');

    // Dynamically wait for movement to complete and player to reach destination tile
    await page.waitForFunction(`Boolean(window.gameLoop && window.gameLoop.player && !window.gameLoop.player.isMoving && window.gameLoop.player.gridX === ${initialPos.x + 1})`);

    const moveResult = await page.evaluate(`({
      steps: window.gameLoop.player.stepsTaken,
      gridX: window.gameLoop.player.gridX,
      gridY: window.gameLoop.player.gridY,
      hudStepsText: document.getElementById('hud-steps')?.textContent,
      elapsedTime: window.gameLoop.elapsedTime
    })`);

    assert(moveResult.steps > initialPos.steps, 'Player steps incremented');
    assertEqual(moveResult.gridX, initialPos.x + 1, 'Player advanced to next grid tile');
    assertEqual(moveResult.hudStepsText, String(moveResult.steps), 'HUD steps text reflects steps taken');
    assert(moveResult.elapsedTime > 0, 'Timer tracked gameplay time');

    await page.close();
  });

  it('validates multi-mode launching (Tutorial, Story Quest, and Chapter 2)', async () => {
    if (!browserAvailable) return;

    // 1. Tutorial 1
    const tutPage = await session.openPage('maze.html?tutorial=1');
    await tutPage.waitForFunction('Boolean(window.gameLoop && window.gameLoop.isRunning && document.getElementById("hud-level-title")?.textContent && document.getElementById("hud-level-title").textContent !== "Loading...")');
    const tutTitle = await tutPage.evaluate(`document.getElementById('hud-level-title')?.textContent`);
    assertEqual(tutTitle, 'First Steps', 'Tutorial 1 loaded with correct title');
    await tutPage.close();

    // 2. Story Quest: Relics of the Four Guardians Ch. 1
    const storyPage = await session.openPage('maze.html?story=relics_of_the_guardians&chapter=1');
    await storyPage.waitForFunction('Boolean(window.gameLoop && window.gameLoop.isRunning && document.getElementById("hud-level-title")?.textContent && document.getElementById("hud-level-title").textContent !== "Loading...")');
    const storyTitle = await storyPage.evaluate(`document.getElementById('hud-level-title')?.textContent`);
    assertEqual(storyTitle, 'The Whispering Ruins', 'Story Quest Ch 1 loaded with correct title');
    await storyPage.close();

    // 3. Campaign Chapter 2 Level 5
    const ch2Page = await session.openPage('maze.html?id=5');
    await ch2Page.waitForFunction('Boolean(window.gameLoop && window.gameLoop.isRunning && document.getElementById("hud-level-title")?.textContent && document.getElementById("hud-level-title").textContent !== "Loading...")');
    const ch2Title = await ch2Page.evaluate(`document.getElementById('hud-level-title')?.textContent`);
    assertEqual(ch2Title, 'The Canopy Bridge', 'Chapter 2 Level 5 loaded with correct title');
    await ch2Page.close();
  });

  it('verifies Settings and Player Profile modals open cleanly from Hub, Game HUD, Pause Drawer, and Architect Studio (BL-115)', async () => {
    if (!browserAvailable) return;

    // 1. Hub (index.html): Header Settings, Hero Settings, and Header Profile
    const hubPage = await session.openPage('index.html');
    await hubPage.waitForFunction('Boolean(window.__hubReady && document.getElementById("btn-hero-settings") && document.getElementById("btn-app-settings"))');

    // Test Hero Settings
    const heroSettingsRes = await hubPage.evaluate(`(() => {
      document.getElementById('btn-hero-settings')?.click();
      const modal = document.getElementById('settings-modal');
      const open = modal && modal.style.display === 'flex' && modal.classList.contains('active');
      document.getElementById('btn-close-settings')?.click();
      return open;
    })()`);
    assert(heroSettingsRes, 'Settings modal opened from Hero Settings button in Hub');

    // Test App Header Settings
    const headerSettingsRes = await hubPage.evaluate(`(() => {
      document.getElementById('btn-app-settings')?.click();
      const modal = document.getElementById('settings-modal');
      const open = modal && modal.style.display === 'flex' && modal.classList.contains('active');
      document.getElementById('btn-close-settings')?.click();
      return open;
    })()`);
    assert(headerSettingsRes, 'Settings modal opened from App Header Settings button in Hub');

    // Test App Header Profile
    const headerProfileRes = await hubPage.evaluate(`(() => {
      document.getElementById('btn-app-profile')?.click();
      const modal = document.getElementById('profile-modal');
      const open = modal && modal.style.display === 'flex' && modal.classList.contains('active');
      document.getElementById('btn-close-profile')?.click();
      return open;
    })()`);
    assert(headerProfileRes, 'Player Profile modal opened from App Header Profile button in Hub without error');
    await hubPage.close();

    // 2. Active Game View (maze.html?id=1): HUD buttons and Pause Drawer buttons
    const gamePage = await session.openPage('maze.html?id=1');
    await gamePage.waitForFunction('Boolean(window.gameLoop && window.gameLoop.isRunning)');

    // Test In-Game HUD Settings button
    const hudSettingsRes = await gamePage.evaluate(`(() => {
      document.getElementById('hud-btn-settings')?.click();
      const modal = document.getElementById('settings-modal');
      const open = modal && modal.style.display === 'flex' && modal.classList.contains('active');
      document.getElementById('btn-close-settings')?.click();
      return open;
    })()`);
    assert(hudSettingsRes, 'Settings modal opened from direct HUD button in maze.html');

    // Test In-Game HUD Profile button
    const hudProfileRes = await gamePage.evaluate(`(() => {
      document.getElementById('hud-btn-profile')?.click();
      const modal = document.getElementById('profile-modal');
      const open = modal && modal.style.display === 'flex' && modal.classList.contains('active');
      document.getElementById('btn-close-profile')?.click();
      return open;
    })()`);
    assert(hudProfileRes, 'Player Profile modal opened from direct HUD button in maze.html');

    // Test Pause Drawer Settings and Profile buttons
    const pauseMenuRes = await gamePage.evaluate(`(() => {
      document.getElementById('btn-open-menu')?.click();
      // Click pause settings
      document.getElementById('btn-pause-settings')?.click();
      const settingsModal = document.getElementById('settings-modal');
      const settingsOpen = settingsModal && settingsModal.style.display === 'flex';
      document.getElementById('btn-close-settings')?.click();

      // Click pause profile
      document.getElementById('btn-pause-profile')?.click();
      const profileModal = document.getElementById('profile-modal');
      const profileOpen = profileModal && profileModal.style.display === 'flex';
      document.getElementById('btn-close-profile')?.click();

      // Resume game
      document.getElementById('btn-pause-close')?.click();
      return { settingsOpen, profileOpen };
    })()`);
    assert(pauseMenuRes.settingsOpen, 'Settings modal opened from pause drawer in maze.html');
    assert(pauseMenuRes.profileOpen, 'Player Profile modal opened from pause drawer in maze.html');
    await gamePage.close();

    // 3. Architect Studio (editor.html): Toolbar Settings and Profile buttons
    const edPage = await session.openPage('editor.html');
    await edPage.waitForFunction('Boolean(window.editorUI && document.getElementById("btn-editor-settings"))');

    const edRes = await edPage.evaluate(`(() => {
      document.getElementById('btn-editor-settings')?.click();
      const settingsModal = document.getElementById('settings-modal');
      const settingsOpen = settingsModal && settingsModal.style.display === 'flex';
      document.getElementById('btn-close-settings')?.click();

      document.getElementById('btn-editor-profile')?.click();
      const profileModal = document.getElementById('profile-modal');
      const profileOpen = profileModal && profileModal.style.display === 'flex';
      document.getElementById('btn-close-profile')?.click();

      return { settingsOpen, profileOpen };
    })()`);
    assert(edRes.settingsOpen, 'Settings modal opened from Architect Studio toolbar');
    assert(edRes.profileOpen, 'Player Profile modal opened from Architect Studio toolbar');
    await edPage.close();
  });

  it('cleans up headless browser session', async () => {
    if (session) {
      await session.stop();
    }
  });
});
