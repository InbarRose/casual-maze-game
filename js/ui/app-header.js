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

let profileModalInstance = null;
let settingsModalInstance = null;

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
  } = options;

  const profileModal = getProfileModal();
  const settingsModal = getSettingsModal();

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

        <!-- Settings Button -->
        <button type="button" id="btn-app-settings" class="app-action-btn icon-btn" title="Open Game Settings [Audio, Video, Controls]">
          <span>⚙️</span>
        </button>

        <!-- GitHub / Issue Report -->
        <a href="https://github.com/InbarRose/casual-maze-game/issues" target="_blank" rel="noopener" class="app-action-btn icon-btn" title="Report Bug / Feedback on GitHub Issues">
          <span>🐞</span>
        </a>
      </div>
    </div>
  `;

  // Bind Header Button Events
  const profileBtn = header.querySelector('#btn-app-profile');
  if (profileBtn) {
    profileBtn.onclick = () => profileModal.open();
  }

  const settingsBtn = header.querySelector('#btn-app-settings');
  if (settingsBtn) {
    settingsBtn.onclick = () => settingsModal.open();
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
        <span><kbd>WASD</kbd> Move</span>
        <span><kbd>Q/E</kbd> Rotate 90°</span>
        <span><kbd>V</kbd> 2.5D Mode</span>
        <span><kbd>M</kbd> Minimap</span>
        <span><kbd>Esc</kbd> Menu</span>
      </div>

      <div class="footer-right">
        <a href="test.html?mode=diagnostics" class="footer-link">🐞 Report Issue</a>
        <span class="footer-dot">•</span>
        <a href="test.html?mode=replay" class="footer-link">🎬 Replay Theater</a>
        <span class="footer-dot">•</span>
        <a href="art-catalog.html" class="footer-link">🎨 Art Catalog</a>
        <span class="footer-dot">•</span>
        <a href="https://github.com/InbarRose/casual-maze-game" target="_blank" rel="noopener" class="footer-link">GitHub</a>
      </div>
    </div>
  `;

  return { header, footer, profileModal, settingsModal };
}
