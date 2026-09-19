/**
 * GuideModal Controller
 * Displays the Architect Handbook, design guides, and keyboard shortcuts reference.
 */

export class GuideModal {
  /**
   * @param {object} editor
   */
  constructor(editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    const modal = document.getElementById('guide-modal');
    const btnClose = document.getElementById('guide-btn-close');
    const btnDismiss = document.getElementById('guide-btn-dismiss');

    btnClose?.addEventListener('click', () => this.close());
    btnDismiss?.addEventListener('click', () => this.close());
  }

  open() {
    const modal = document.getElementById('guide-modal');
    modal?.classList.add('active');
  }

  close() {
    const modal = document.getElementById('guide-modal');
    modal?.classList.remove('active');
  }
}
