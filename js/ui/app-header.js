/**
 * Casual Maze Game — Universal Global App Navigation Header & Footer
 * 
 * Injects and manages unified navigation across index.html, maze.html,
 * editor.html, test.html, and art-catalog.html.
 */

import { ENGINE_VERSION } from '../core/version.js';
import { StorageManager } from '../core/storage.js';
import { ProfileModal } from './profile-modal.js';
import { SettingsModal } from './settings-modal.js';
import { FeedbackModal, getFeedbackModal } from './feedback-modal.js';
import { GuideModal, getGuideModal } from './guide-modal.js';
import { audioFX } from './audio-fx.js';

let profileModalInstance = null;
let settingsModalInstance = null;

export { getFeedbackModal, getGuideModal };

export function getProfileModal() {
  if (!profileModalInstance && typeof document !== 'undefined') {
    profileModalInstance = new ProfileModal();
  }
  return profileModalInstance;
}

export function getSettingsModal() {
  if (!settingsModalInstance && typeof document !== 'undefined') {
    settingsModalInstance = new SettingsModal();
  }
  return settingsModalInstance;
}

/**
 * Initialize universal header and footer across pages
 * @param {object} options
 * @param {'hub'|'game'|'editor'|'test'|'art'} [options.activeTab='hub']
 * @param {HTMLElement|null} [options.headerContainer=null]
 * @param {HTMLElement|null} [options.footerContainer=null]
 */
export function initAppHeader(options = {}) {
  if (typeof document === 'undefined') return;

  const {
    activeTab = 'hub',
    headerContainer = null,
    footerContainer = null,
    breadcrumbs = [],
  } = options;

  // Apply High Contrast Mode if persisted
  try {
    if (StorageManager.getSetting('high_contrast', false)) {
      document.body.classList.add('high-contrast-mode');
    }
  } catch (_) {}

  const profileModal = getProfileModal();
  const settingsModal = getSettingsModal();
  const feedbackModal = getFeedbackModal();
  const guideModal = getGuideModal();

  // 1. Mount or Update Header
  let header = document.querySelector('.app-nav-header');
  if (!header) {
    header = document.createElement('header');
    header.className = 'app-nav-header';
    if (headerContainer) {
      headerContainer.appendChild(header);
    } else {
      document.body.prepend(header);
    }
  }

  const profile = StorageManager.getPlayerProfile();

  let breadcrumbsHtml = '';
  if (breadcrumbs && breadcrumbs.length > 0) {
    const crumbItems = breadcrumbs.map((crumb, idx) => {
      const isLast = idx === breadcrumbs.length - 1 || crumb.active;
      const icon = crumb.icon ? `<span class="crumb-icon">${crumb.icon}</span>` : '';
      if (isLast) {
        return `<span class="crumb-item active" aria-current="page">${icon}<span class="crumb-label">${crumb.label}</span></span>`;
      }
      const href = crumb.href || '#';
      return `<a href="${href}" class="crumb-item crumb-link">${icon}<span class="crumb-label">${crumb.label}</span></a>`;
    }).join('<span class="crumb-separator" aria-hidden="true">❯</span>');

    breadcrumbsHtml = `
      <nav class="app-breadcrumbs-bar" aria-label="Breadcrumb Navigation">
        <div class="breadcrumbs-inner">
          <a href="index.html" class="crumb-item crumb-link" title="Casual Maze Game Hub">
            <span class="crumb-icon">🏠</span><span class="crumb-label hide-mobile">Hub</span>
          </a>
          <span class="crumb-separator" aria-hidden="true">❯</span>
          ${crumbItems}
        </div>
      </nav>
    `;
  }

  header.innerHTML = `
    <div class="app-nav-inner">
      <!-- Left: Brand Logo & Version -->
      <div class="app-nav-brand">
        <a href="index.html" class="app-brand-link" title="Casual Maze Game Hub">
          <span class="app-brand-icon">🧭</span>
          <span class="app-brand-name">CASUAL MAZE</span>
        </a>
        <span class="app-version-badge" title="Engine Version">v${ENGINE_VERSION}</span>
      </div>

      <!-- Center: Main Navigation Tabs -->
      <nav class="app-nav-links" aria-label="Main Navigation">
        <a href="index.html" class="nav-item ${activeTab === 'hub' ? 'active' : ''}" title="Game Hub, Stories & Level Select">
          <span class="nav-icon">🎮</span> <span class="nav-text">Play Hub</span>
        </a>
        <a href="maze.html" class="nav-item ${activeTab === 'game' ? 'active' : ''}" title="Active Megalabyrinth Game View">
          <span class="nav-icon">🗺️</span> <span class="nav-text">Play Maze</span>
        </a>
        <a href="editor.html" class="nav-item ${activeTab === 'editor' ? 'active' : ''}" title="Architect Studio Map Editor">
          <span class="nav-icon">🏗️</span> <span class="nav-text">Architect Studio</span>
        </a>
        <a href="test.html" class="nav-item ${activeTab === 'test' ? 'active' : ''}" title="Replay Theater & Diagnostics Lab">
          <span class="nav-icon">🧪</span> <span class="nav-text">Replay & Lab</span>
        </a>
        <a href="art-catalog.html" class="nav-item ${activeTab === 'art' ? 'active' : ''}" title="Vector Asset & Decor Catalog">
          <span class="nav-icon">🎨</span> <span class="nav-text">Art Catalog</span>
        </a>
      </nav>

      <!-- Right: User Profile, Settings, and Issues Link -->
      <div class="app-nav-actions">
        <!-- Player Profile Button -->
        <button type="button" id="btn-app-profile" class="app-action-btn profile-pill-btn" title="Open Player Profile & Save Management">
          <span id="app-profile-avatar">${profile.rankIcon}</span>
          <span id="app-profile-name" class="profile-name-text">${profile.name}</span>
          <span id="app-profile-stars" class="profile-stars-badge">★ ${profile.totalStars}</span>
        </button>

        <!-- Handbook & Guide Button (BL-71) -->
        <button type="button" id="btn-app-guide" class="app-action-btn icon-btn" title="Open Explorer &amp; Architect Handbook [Controls, Bridges, Secrets]">
          <span>📖</span>
        </button>

        <!-- Settings Button -->
        <button type="button" id="btn-app-settings" class="app-action-btn icon-btn" title="Open Game Settings [Audio, Video, Controls]">
          <span>⚙️</span>
        </button>

        <!-- Feedback & Issue Report Button -->
        <button type="button" id="btn-app-feedback" class="app-action-btn icon-btn" title="Send Feedback / Report Bug [Diagnostic Bundle]">
          <span>🐞</span>
        </button>
      </div>
    </div>
    ${breadcrumbsHtml}
  `;

  // Attach tactile audio to header navigation links
  header.querySelectorAll('.nav-item, .crumb-link, .app-action-btn').forEach(el => {
    el.addEventListener('click', () => {
      try { audioFX.playTabClick(); } catch (_) {}
    });
  });

  // Bind Header Button Events
  const profileBtn = header.querySelector('#btn-app-profile');
  if (profileBtn) {
    profileBtn.onclick = () => profileModal.open();
  }

  const guideBtn = header.querySelector('#btn-app-guide');
  if (guideBtn) {
    guideBtn.onclick = () => guideModal.open();
  }

  const settingsBtn = header.querySelector('#btn-app-settings');
  if (settingsBtn) {
    settingsBtn.onclick = () => settingsModal.open();
  }

  const feedbackBtn = header.querySelector('#btn-app-feedback');
  if (feedbackBtn) {
    feedbackBtn.onclick = () => feedbackModal.open({ pageTitle: typeof document !== 'undefined' ? document.title : 'Casual Maze Game' });
  }

  // Update profile badges live
  window.addEventListener('player-profile:updated', (e) => {
    const updated = e.detail;
    const nameEl = header.querySelector('#app-profile-name');
    const starsEl = header.querySelector('#app-profile-stars');
    const avatarEl = header.querySelector('#app-profile-avatar');
    if (nameEl) nameEl.textContent = updated.name;
    if (starsEl) starsEl.textContent = `★ ${updated.totalStars}`;
    if (avatarEl) avatarEl.textContent = updated.rankIcon;
  });

  // 2. Mount or Update Footer
  let footer = document.querySelector('.app-nav-footer');
  if (!footer) {
    footer = document.createElement('footer');
    footer.className = 'app-nav-footer';
    if (footerContainer) {
      footerContainer.appendChild(footer);
    } else {
      document.body.appendChild(footer);
    }
  }

  footer.innerHTML = `
    <div class="app-footer-inner">
      <div class="footer-left">
        <span class="footer-brand">Casual Maze Game</span>
        <span class="footer-dot">•</span>
        <span class="footer-copy">100% Client-Side Pure Static (GitHub Pages)</span>
        <span class="footer-dot">•</span>
        <span class="footer-ver">v${ENGINE_VERSION}</span>
      </div>

      <div class="footer-center shortcuts-hint">
        <button type="button" id="btn-footer-shortcuts-toggle" class="footer-shortcuts-btn" title="Toggle Controls &amp; Shortcuts Cheat Sheet">
          ⌨️ <span class="shortcuts-btn-text">Controls</span>
        </button>
        <div class="desktop-shortcuts-strip">
          <span><kbd>WASD</kbd> Move</span>
          <span><kbd>Q/R</kbd> Rotate 90°</span>
          <span><kbd>V</kbd> 2.5D Mode</span>
          <span><kbd>M</kbd> Minimap</span>
          <span><kbd>Esc</kbd> Menu</span>
        </div>
      </div>

      <div class="footer-right">
        <button type="button" id="btn-footer-guide" class="footer-link" style="background:none;border:none;padding:0;cursor:pointer;color:inherit;font:inherit;">📖 Handbook</button>
        <span class="footer-dot">•</span>
        <button type="button" id="btn-footer-feedback" class="footer-link" style="background:none;border:none;padding:0;cursor:pointer;color:inherit;font:inherit;">🐞 Feedback &amp; Bug Report</button>
        <span class="footer-dot">•</span>
        <a href="test.html?mode=diagnostics" class="footer-link">🧪 Diagnostics Lab</a>
        <span class="footer-dot">•</span>
        <a href="test.html?mode=replay" class="footer-link">🎬 Replay Theater</a>
        <span class="footer-dot">•</span>
        <a href="art-catalog.html" class="footer-link">🎨 Art Catalog</a>
        <span class="footer-dot">•</span>
        <a href="https://github.com/InbarRose/casual-maze-game" target="_blank" rel="noopener" class="footer-link">GitHub</a>
      </div>
    </div>

    <!-- Mobile Expandable Controls Drawer (BL-98) -->
    <div id="footer-shortcuts-drawer" class="footer-shortcuts-drawer hidden" aria-label="Controls and gestures cheat sheet">
      <div class="shortcuts-drawer-inner">
        <div class="shortcuts-drawer-section">
          <strong>🎮 Movement &amp; Touch</strong>
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / <kbd>Arrows</kbd> / Touch Drag Steering</span>
          <span>Tap corridor floor: Click-to-Move BFS Pathfinding</span>
        </div>
        <div class="shortcuts-drawer-section">
          <strong>✨ Mechanisms &amp; Camera</strong>
          <span><kbd>E</kbd> / <kbd>Space</kbd> Interact | <kbd>1</kbd>..<kbd>9</kbd> Disambiguate</span>
          <span><kbd>Q</kbd>/<kbd>R</kbd> Rotate World | <kbd>+</kbd>/<kbd>−</kbd> Zoom (0.5x..2.0x)</span>
          <span><kbd>V</kbd> Toggle 2.5D / Top-Down | <kbd>F</kbd> Action Feed | <kbd>H</kbd> HUD Bar</span>
        </div>
        <div class="shortcuts-drawer-section">
          <strong>📜 Journal &amp; System</strong>
          <span><kbd>J</kbd> Lore Journal | <kbd>M</kbd> Minimap | <kbd>Esc</kbd>/<kbd>P</kbd> Menu</span>
        </div>
      </div>
    </div>
  `;

  const footerGuideBtn = footer.querySelector('#btn-footer-guide');
  if (footerGuideBtn) {
    footerGuideBtn.onclick = () => guideModal.open();
  }

  const footerFeedbackBtn = footer.querySelector('#btn-footer-feedback');
  if (footerFeedbackBtn) {
    footerFeedbackBtn.onclick = () => feedbackModal.open({ pageTitle: typeof document !== 'undefined' ? document.title : 'Casual Maze Game' });
  }

  const shortcutsToggleBtn = footer.querySelector('#btn-footer-shortcuts-toggle');
  const shortcutsDrawer = footer.querySelector('#footer-shortcuts-drawer');
  if (shortcutsToggleBtn && shortcutsDrawer) {
    shortcutsToggleBtn.onclick = () => {
      const isHidden = shortcutsDrawer.classList.toggle('hidden');
      shortcutsToggleBtn.classList.toggle('active', !isHidden);
      try { audioFX.playClick(); } catch (_) {}
    };
  }

  return { header, footer, profileModal, settingsModal, feedbackModal, guideModal };
}
