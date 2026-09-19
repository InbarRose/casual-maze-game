/**
 * ValidationModal Controller
 * Runs LevelValidator diagnostics, updates header status badge,
 * and displays solvability errors, warnings, and hints.
 */

import { LevelValidator } from '../level-validator.js';

export class ValidationModal {
  /**
   * @param {object} editor
   */
  constructor(editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    const modal = document.getElementById('validation-modal');
    const btnBadge = document.getElementById('btn-validate');
    const btnClose = document.getElementById('val-btn-close');
    const btnDismiss = document.getElementById('val-btn-dismiss');
    const btnRecheck = document.getElementById('val-btn-recheck');

    btnBadge?.addEventListener('click', () => this.open());
    btnClose?.addEventListener('click', () => this.close());
    btnDismiss?.addEventListener('click', () => this.close());
    btnRecheck?.addEventListener('click', () => {
      this.updateValidationState();
      this.renderValidationModalContent();
      this.editor.showToast('Validation refreshed!', 'info');
    });
  }

  open() {
    const modal = document.getElementById('validation-modal');
    this.updateValidationState();
    this.renderValidationModalContent();
    modal?.classList.add('active');
  }

  close() {
    const modal = document.getElementById('validation-modal');
    modal?.classList.remove('active');
  }

  updateValidationState() {
    const report = LevelValidator.validate(this.editor.level);
    const badge = document.getElementById('btn-validate');
    const iconEl = document.getElementById('val-badge-icon');
    const textEl = document.getElementById('val-badge-text');

    if (!badge) return report;

    badge.classList.remove('valid', 'warning', 'error');

    if (!report.valid) {
      badge.classList.add('error');
      if (iconEl) iconEl.textContent = '❌';
      if (textEl) textEl.textContent = `${report.errors.length} Issue${report.errors.length > 1 ? 's' : ''}`;
    } else if (report.warnings.length > 0) {
      badge.classList.add('warning');
      if (iconEl) iconEl.textContent = '⚠️';
      if (textEl) textEl.textContent = `${report.warnings.length} Warn`;
    } else {
      badge.classList.add('valid');
      if (iconEl) iconEl.textContent = '✅';
      if (textEl) textEl.textContent = 'Valid';
    }

    return report;
  }

  renderValidationModalContent() {
    const body = document.getElementById('val-modal-body');
    const title = document.getElementById('val-modal-title');
    if (!body) return;

    const report = LevelValidator.validate(this.editor.level);

    if (title) {
      title.textContent = report.valid ? 'Level Validation Report (Passed)' : 'Level Validation Report (Issues Found)';
    }

    let html = '';

    // Summary banner
    if (report.valid && report.warnings.length === 0) {
      html += `
        <div style="background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; color: var(--emerald); font-size: 0.875rem;">
          <strong>✓ All checks passed!</strong> The labyrinth is structurally sound, has a valid spawn and exit, and is 100% solvable.
        </div>
      `;
    } else if (report.valid && report.warnings.length > 0) {
      html += `
        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; color: var(--gold); font-size: 0.875rem;">
          <strong>⚠️ Solvable with warnings.</strong> The maze can be completed, but check the non-blocking notes below.
        </div>
      `;
    } else {
      html += `
        <div style="background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; color: var(--rose); font-size: 0.875rem;">
          <strong>❌ Solvability blockers detected!</strong> The maze cannot be completed in its current state. Please fix the errors below.
        </div>
      `;
    }

    // Diagnostics List
    html += `<div class="diag-list">`;

    for (const err of report.errors) {
      html += `
        <div class="diag-item error">
          <span>❌</span>
          <div style="flex: 1;">
            <div>${this.editor.escapeHtml(err.message)}</div>
            ${err.x !== undefined ? `<div style="font-family: var(--font-mono); font-size: 0.75rem; margin-top: 0.2rem; opacity: 0.8;">Coordinate: (${err.x}, ${err.y})</div>` : ''}
          </div>
        </div>
      `;
    }

    for (const warn of report.warnings) {
      html += `
        <div class="diag-item warning">
          <span>⚠️</span>
          <div style="flex: 1;">
            <div>${this.editor.escapeHtml(warn.message)}</div>
            ${warn.x !== undefined ? `<div style="font-family: var(--font-mono); font-size: 0.75rem; margin-top: 0.2rem; opacity: 0.8;">Coordinate: (${warn.x}, ${warn.y})</div>` : ''}
          </div>
        </div>
      `;
    }

    for (const inf of report.info) {
      html += `
        <div class="diag-item info">
          <span>ℹ️</span>
          <div>${this.editor.escapeHtml(inf)}</div>
        </div>
      `;
    }

    html += `</div>`;
    body.innerHTML = html;
  }
}
