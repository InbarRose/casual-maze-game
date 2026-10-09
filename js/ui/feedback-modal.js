/**
 * Casual Maze Game — Universal Feedback & Bug Reporting Modal
 * 
 * Provides 1-click diagnostic bundle generation, telemetry inspection,
 * clipboard export, and pre-filled GitHub issue creation across all pages.
 */

import { ENGINE_VERSION } from '../core/version.js';
import { StorageManager } from '../core/storage.js';
import { audioFX } from './audio-fx.js';

export class FeedbackModal {
  constructor() {
    this.modalEl = null;
    this.isOpen = false;
    this.context = {};
    this._boundKeyHandler = this._handleKeyDown.bind(this);
    this.ensureDom();
  }

  ensureDom() {
    if (typeof document === 'undefined') return;

    let existing = document.getElementById('feedback-modal');
    if (existing) {
      this.modalEl = existing;
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.className = 'modal-backdrop';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-card feedback-card" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.5rem;">🐞</span>
            <div>
              <h3 id="feedback-modal-title" style="margin: 0; font-size: 1.25rem;">Feedback &amp; Bug Report</h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Engine v${ENGINE_VERSION} • 100% Client-Side Telemetry</span>
            </div>
          </div>
          <button type="button" class="btn-close" id="btn-close-feedback" title="Close (Esc)">&times;</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem; max-height: 72vh; overflow-y: auto; padding-right: 0.3rem;">
          
          <!-- Context Banner -->
          <div style="background: rgba(15, 23, 42, 0.6); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.82rem;">
              <span style="color: var(--text-muted);">Current Location: </span>
              <strong id="feedback-context-location" style="color: var(--accent);">Hub</strong>
            </div>
            <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-muted);" id="feedback-context-client">
              Web Browser
            </div>
          </div>

          <!-- Notes / Description Area -->
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <label for="feedback-user-notes" style="font-size: 0.85rem; font-weight: 600; color: #f8fafc;">
              Describe what happened or share your feedback:
            </label>
            <textarea id="feedback-user-notes" rows="4" placeholder="e.g. When moving across the bridge in Level 5, the camera rotation briefly clipped..." style="width: 100%; background: rgba(0, 0, 0, 0.35); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); color: var(--text); padding: 0.6rem 0.75rem; font-family: inherit; font-size: 0.85rem; resize: vertical; outline: none;"></textarea>
          </div>

          <!-- Telemetry Preview Accordion -->
          <details style="background: rgba(0, 0, 0, 0.25); border-radius: var(--radius-sm); border: 1px solid var(--border-glass); padding: 0.5rem 0.75rem;">
            <summary style="font-size: 0.8rem; font-weight: 600; color: var(--accent); cursor: pointer; user-select: none;">
              🔍 Inspect Auto-Generated Diagnostic Bundle
            </summary>
            <pre id="feedback-telemetry-preview" style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8; max-height: 160px; overflow-y: auto; margin-top: 0.5rem; background: #05070a; padding: 0.5rem; border-radius: 4px; white-space: pre-wrap; word-break: break-all;"></pre>
          </details>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <button type="button" id="btn-feedback-copy" class="btn btn-secondary btn-sm" style="flex: 1; min-width: 150px; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
              <span>📋</span> Copy Diagnostic Markdown
            </button>
            <button type="button" id="btn-feedback-github" class="btn btn-primary btn-sm" style="flex: 1; min-width: 150px; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
              <span>🚀</span> Open GitHub Issue
            </button>
          </div>

          <!-- Status Message -->
          <div id="feedback-status-msg" style="font-size: 0.8rem; min-height: 1.2rem; text-align: center; font-weight: 600;"></div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-glass); padding-top: 0.8rem; margin-top: 0.2rem;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-feedback-done">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this._attachEvents();
  }

  _attachEvents() {
    if (!this.modalEl) return;

    const closeBtn = this.modalEl.querySelector('#btn-close-feedback');
    const doneBtn = this.modalEl.querySelector('#btn-feedback-done');
    const copyBtn = this.modalEl.querySelector('#btn-feedback-copy');
    const githubBtn = this.modalEl.querySelector('#btn-feedback-github');

    if (closeBtn) closeBtn.onclick = () => this.close();
    if (doneBtn) doneBtn.onclick = () => this.close();

    // Close on backdrop click
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    if (copyBtn) {
      copyBtn.onclick = () => this.copyToClipboard();
    }

    if (githubBtn) {
      githubBtn.onclick = () => this.openGitHubIssue();
    }
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      e.preventDefault();
      this.close();
    }
  }

  /**
   * Open the feedback modal with optional context
   * @param {Object} [context]
   */
  open(context = {}) {
    this.ensureDom();
    if (!this.modalEl) return;

    this.context = context;
    this.isOpen = true;

    // Reset status and input
    const statusEl = this.modalEl.querySelector('#feedback-status-msg');
    const notesEl = this.modalEl.querySelector('#feedback-user-notes');
    if (statusEl) statusEl.textContent = '';
    if (notesEl) notesEl.value = '';

    // Generate bundle
    const bundle = this._generateBundle();

    // Populate context banner
    const locEl = this.modalEl.querySelector('#feedback-context-location');
    const clientEl = this.modalEl.querySelector('#feedback-context-client');
    const previewEl = this.modalEl.querySelector('#feedback-telemetry-preview');

    if (locEl) {
      locEl.textContent = bundle.json?.activeLevel?.title 
        ? `${bundle.json.activeLevel.title} (${bundle.json.activeLevel.id})`
        : (context.pageTitle || 'Casual Maze Hub');
    }
    if (clientEl && bundle.json?.client) {
      clientEl.textContent = `${bundle.json.client.viewport} • DPR ${bundle.json.client.devicePixelRatio}`;
    }
    if (previewEl) {
      previewEl.textContent = JSON.stringify(bundle.json, null, 2);
    }

    this.modalEl.style.display = 'flex';
    document.body.classList.add('modal-open');

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._boundKeyHandler);
    }

    try { audioFX.playClick(); } catch (_) {}
  }

  close() {
    if (!this.modalEl) return;
    this.isOpen = false;
    this.modalEl.style.display = 'none';
    document.body.classList.remove('modal-open');

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._boundKeyHandler);
    }

    try { audioFX.playClick(); } catch (_) {}
  }

  _generateBundle() {
    const userNotes = this.modalEl?.querySelector('#feedback-user-notes')?.value?.trim() || '';
    const bundle = StorageManager.exportDiagnosticBugBundle({
      ...this.context,
      userNotes,
    });
    return bundle;
  }

  copyToClipboard() {
    const bundle = this._generateBundle();
    const userNotes = this.modalEl?.querySelector('#feedback-user-notes')?.value?.trim() || '';
    
    let textToCopy = bundle.markdown;
    if (userNotes) {
      textToCopy = `### Player Feedback\n${userNotes}\n\n` + textToCopy;
    }

    const showSuccess = () => {
      const statusEl = this.modalEl?.querySelector('#feedback-status-msg');
      if (statusEl) {
        statusEl.textContent = '✅ Diagnostic bundle copied to clipboard!';
        statusEl.style.color = 'var(--emerald, #10b981)';
      }
      try { audioFX.playVictory(); } catch (_) {}
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).then(showSuccess).catch(() => {
        this._fallbackCopy(textToCopy, showSuccess);
      });
    } else {
      this._fallbackCopy(textToCopy, showSuccess);
    }
  }

  _fallbackCopy(text, onSuccess) {
    if (typeof document === 'undefined') return;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (onSuccess) onSuccess();
    } catch (_) {}
    document.body.removeChild(textarea);
  }

  openGitHubIssue() {
    const bundle = this._generateBundle();
    const userNotes = this.modalEl?.querySelector('#feedback-user-notes')?.value?.trim() || '';
    
    let url = bundle.githubIssueUrl || bundle.githubUrl;
    if (userNotes) {
      const issueTitle = `[Bug/Feedback] ${bundle.json?.activeLevel?.title || 'Game'} (${bundle.json?.activeLevel?.id || 'General'})`;
      const issueBody = encodeURIComponent(
        `## User Description\n${userNotes}\n\n## Reproduction Steps\n1. \n2. \n\n${bundle.markdown}`
      );
      url = `https://github.com/InbarRose/casual-maze-game/issues/new?title=${encodeURIComponent(issueTitle)}&body=${issueBody}&labels=bug`;
    }

    if (typeof window !== 'undefined' && url) {
      window.open(url, '_blank');
      const statusEl = this.modalEl?.querySelector('#feedback-status-msg');
      if (statusEl) {
        statusEl.textContent = '🚀 Opening GitHub Issue in new tab...';
        statusEl.style.color = 'var(--accent, #38bdf8)';
      }
      try { audioFX.playClick(); } catch (_) {}
    }
  }
}

let feedbackModalInstance = null;

export function getFeedbackModal() {
  if (!feedbackModalInstance && typeof document !== 'undefined') {
    feedbackModalInstance = new FeedbackModal();
  }
  return feedbackModalInstance;
}
