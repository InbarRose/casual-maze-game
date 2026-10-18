/**
 * Casual Maze Game — Mobile Navigation Drawer Component (BL-126, ADR-0035)
 *
 * Provides a responsive, accessible slide-over navigation drawer for viewports
 * <= 900px, complete with quick links, profile badge overview, modal shortcuts,
 * and backdrop dismiss interactions.
 */

/**
 * Generates the HTML template string for the mobile navigation drawer and its backdrop.
 * @param {string} activeTab Currently active navigation tab ('hub'|'game'|'editor'|'test'|'art')
 * @param {{ rankIcon: string, name: string, totalStars: number, rank: number }} profile Player profile stats
 * @param {string} engineVersion Current semantic version of the game engine
 * @returns {string} HTML markup
 */
export function renderMobileNavDrawer(activeTab = 'hub', profile = {}, engineVersion = '1.0.0') {
  return `
    <!-- Mobile Navigation Drawer (BL-126, ADR-0035) -->
    <div id="mobile-nav-backdrop" class="mobile-nav-backdrop" aria-hidden="true"></div>
    <aside id="mobile-nav-drawer" class="mobile-nav-drawer" aria-label="Mobile Navigation Menu" aria-hidden="true">
      <div class="mobile-drawer-header">
        <div class="mobile-drawer-brand">
          <span class="app-brand-icon">🧭</span>
          <span class="app-brand-name">CASUAL MAZE</span>
          <span class="app-version-badge">v${engineVersion}</span>
        </div>
        <button type="button" id="btn-close-mobile-nav" class="mobile-drawer-close-btn" aria-label="Close Navigation Menu">✕</button>
      </div>

      <div class="mobile-drawer-profile">
        <div class="mobile-profile-avatar">${profile.rankIcon || '🌱'}</div>
        <div class="mobile-profile-info">
          <div class="mobile-profile-name">${profile.name || 'Explorer'}</div>
          <div class="mobile-profile-stats">★ ${profile.totalStars || 0} Stars • Rank ${profile.rank || 1}</div>
        </div>
        <button type="button" id="btn-mobile-drawer-profile" class="mobile-drawer-profile-btn" title="Edit Profile">👤 Edit</button>
      </div>

      <nav class="mobile-drawer-links">
        <a href="index.html" class="mobile-nav-link ${activeTab === 'hub' ? 'active' : ''}">
          <span class="nav-icon">🎮</span>
          <div class="nav-desc">
            <span class="nav-title">Play Hub</span>
            <span class="nav-sub">Campaign, stories & level selection</span>
          </div>
        </a>
        <a href="maze.html" class="mobile-nav-link ${activeTab === 'game' ? 'active' : ''}">
          <span class="nav-icon">🗺️</span>
          <div class="nav-desc">
            <span class="nav-title">Play Maze</span>
            <span class="nav-sub">Active megalabyrinth exploration</span>
          </div>
        </a>
        <a href="editor.html" class="mobile-nav-link ${activeTab === 'editor' ? 'active' : ''}">
          <span class="nav-icon">🏗️</span>
          <div class="nav-desc">
            <span class="nav-title">Architect Studio</span>
            <span class="nav-sub">Build, test & export custom labyrinths</span>
          </div>
        </a>
        <a href="test.html" class="mobile-nav-link ${activeTab === 'test' ? 'active' : ''}">
          <span class="nav-icon">🧪</span>
          <div class="nav-desc">
            <span class="nav-title">Replay & Lab</span>
            <span class="nav-sub">Solver telemetry & diagnostic tests</span>
          </div>
        </a>
        <a href="art-catalog.html" class="mobile-nav-link ${activeTab === 'art' ? 'active' : ''}">
          <span class="nav-icon">🎨</span>
          <div class="nav-desc">
            <span class="nav-title">Art Catalog</span>
            <span class="nav-sub">Vector sprite & decor reference</span>
          </div>
        </a>
      </nav>

      <div class="mobile-drawer-actions">
        <button type="button" id="btn-mobile-drawer-guide" class="mobile-action-card">
          <span class="action-icon">📖</span>
          <span class="action-text">Handbook & Guide</span>
        </button>
        <button type="button" id="btn-mobile-drawer-settings" class="mobile-action-card">
          <span class="action-icon">⚙️</span>
          <span class="action-text">Settings</span>
        </button>
        <button type="button" id="btn-mobile-drawer-feedback" class="mobile-action-card">
          <span class="action-icon">🐞</span>
          <span class="action-text">Bug / Feedback</span>
        </button>
      </div>
    </aside>
  `;
}

/**
 * Initializes interactions and lifecycle controls for the mobile navigation drawer.
 * @param {object} params
 * @param {HTMLElement} params.rootElement Root container containing the drawer markup
 * @param {object} [params.profileModal] Profile modal instance
 * @param {object} [params.settingsModal] Settings modal instance
 * @param {object} [params.guideModal] Guide handbook modal instance
 * @param {object} [params.feedbackModal] Bug/feedback modal instance
 * @param {object} [params.audioFX] Sound effects controller
 * @returns {{ open: Function, close: Function, isOpen: Function }} Controller handle
 */
export function initMobileNavDrawer({
  rootElement,
  profileModal = null,
  settingsModal = null,
  guideModal = null,
  feedbackModal = null,
  audioFX = null,
} = {}) {
  if (!rootElement) return null;

  const toggleBtn = rootElement.querySelector('#btn-app-mobile-menu');
  const drawer = rootElement.querySelector('#mobile-nav-drawer');
  const backdrop = rootElement.querySelector('#mobile-nav-backdrop');
  const closeBtn = rootElement.querySelector('#btn-close-mobile-nav');

  const open = () => {
    if (!drawer || !backdrop) return;
    drawer.classList.add('open');
    backdrop.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');
    try { audioFX?.playClick?.(); } catch (_) {}
  };

  const close = () => {
    if (!drawer || !backdrop) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
  };

  const isOpen = () => drawer?.classList.contains('open') ?? false;

  if (toggleBtn) toggleBtn.onclick = open;
  if (closeBtn) closeBtn.onclick = close;
  if (backdrop) backdrop.onclick = close;

  const mobileProfileBtn = rootElement.querySelector('#btn-mobile-drawer-profile');
  if (mobileProfileBtn && profileModal) {
    mobileProfileBtn.onclick = () => { close(); profileModal.open(); };
  }

  const mobileGuideBtn = rootElement.querySelector('#btn-mobile-drawer-guide');
  if (mobileGuideBtn && guideModal) {
    mobileGuideBtn.onclick = () => { close(); guideModal.open(); };
  }

  const mobileSettingsBtn = rootElement.querySelector('#btn-mobile-drawer-settings');
  if (mobileSettingsBtn && settingsModal) {
    mobileSettingsBtn.onclick = () => { close(); settingsModal.open(); };
  }

  const mobileFeedbackBtn = rootElement.querySelector('#btn-mobile-drawer-feedback');
  if (mobileFeedbackBtn && feedbackModal) {
    mobileFeedbackBtn.onclick = () => {
      close();
      feedbackModal.open({ pageTitle: typeof document !== 'undefined' ? document.title : 'Casual Maze Game' });
    };
  }

  return { open, close, isOpen };
}
