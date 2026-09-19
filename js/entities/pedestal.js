/**
 * Pedestal Entity
 * Environmental slots and plinths where players place carryable RiddleItems.
 * Supports riddle inscriptions, item slotting/removal, satisfaction verification,
 * and group solving mechanisms.
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ, PEDESTAL_STYLES } from '../core/constants.js';

export class Pedestal {
  /**
   * @param {object} config
   */
  constructor(config = {}) {
    this.id = config.id || `pedestal_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.PEDESTAL;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.styleId = config.styleId || 'plinth_stone';
    const preset = PEDESTAL_STYLES.find(p => p.id === this.styleId);
    this.name = config.name || (preset ? preset.label : 'Ancient Pedestal');
    this.riddleHint = config.riddleHint || 'A stone pedestal with an empty socket awaiting an offering.';
    this.acceptedItemId = config.acceptedItemId || '';
    this.puzzleGroupId = config.puzzleGroupId || 'default_riddle_group';
    this.targetDoorId = config.targetDoorId || null;
    this.targetMechanismId = config.targetMechanismId || null;

    // Slotted item instance
    this.slottedItem = config.slottedItem || null;

    this.glowTimer = Math.random() * Math.PI * 2;
  }

  get elevation() {
    return this.z;
  }

  set elevation(value) {
    this.z = value;
  }

  /**
   * Canonical coordinate string
   * @returns {string}
   */
  getCoordString() {
    return formatXYZ(this.x, this.y, this.z);
  }

  /**
   * Check if currently slotted item satisfies the pedestal's riddle requirement
   * @returns {boolean}
   */
  isSatisfied() {
    if (!this.slottedItem) return false;
    if (!this.acceptedItemId) return true; // Any item satisfies if no requirement set
    return this.slottedItem.id === this.acceptedItemId || this.slottedItem.styleId === this.acceptedItemId;
  }

  /**
   * Place an item onto the pedestal
   * @param {object} item
   * @returns {boolean}
   */
  placeItem(item) {
    if (!item) return false;
    this.slottedItem = item;
    if (typeof item.slotInto === 'function') {
      item.slotInto(this);
    }
    return true;
  }

  /**
   * Remove slotted item from pedestal
   * @returns {object|null}
   */
  removeItem() {
    const item = this.slottedItem;
    if (item) {
      item.isSlotted = false;
      item.slottedPedestalId = null;
      this.slottedItem = null;
    }
    return item;
  }

  /**
   * Update animation
   * @param {number} dt
   */
  update(dt) {
    this.glowTimer += dt * 3;
    if (this.slottedItem && typeof this.slottedItem.update === 'function') {
      this.slottedItem.update(dt);
    }
  }

  /**
   * Render pedestal plinth and slotted item
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   * @param {string} [perspective]
   */
  render(ctx, screenX, screenY, tileSize, perspective = 'topdown') {
    ctx.save();
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const satisfied = this.isSatisfied();

    // 1. Pedestal Base Plinth
    const plinthW = tileSize * 0.72;
    const plinthH = tileSize * 0.72;
    const px = cx - plinthW / 2;
    const py = cy - plinthH / 2;

    // Plinth drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(px + 2, py + 4, plinthW, plinthH);

    // Stone stepped body
    ctx.fillStyle = '#334155'; // Slate base
    ctx.fillRect(px, py, plinthW, plinthH);

    // Inner socket plate
    ctx.fillStyle = satisfied ? '#065f46' : (this.slottedItem ? '#7f1d1d' : '#1e293b');
    const socketMargin = tileSize * 0.12;
    ctx.fillRect(px + socketMargin, py + socketMargin, plinthW - socketMargin * 2, plinthH - socketMargin * 2);

    // Plinth Border & Rune Inscription
    ctx.strokeStyle = satisfied ? '#10b981' : (this.slottedItem ? '#ef4444' : '#94a3b8');
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, plinthW, plinthH);

    // Socket Glow
    if (satisfied) {
      const pulse = Math.sin(this.glowTimer) * 0.2 + 0.8;
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.5 * pulse})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(px + socketMargin, py + socketMargin, plinthW - socketMargin * 2, plinthH - socketMargin * 2);
    }

    // 2. If slotted item exists, render item atop pedestal
    if (this.slottedItem) {
      // Slotted item aura
      const auraColor = satisfied ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.3)';
      const aura = ctx.createRadialGradient(cx, cy, tileSize * 0.05, cx, cy, tileSize * 0.38);
      aura.addColorStop(0, auraColor);
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, tileSize * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // Slotted Icon / Symbol
      ctx.font = `${Math.round(tileSize * 0.46)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.slottedItem.symbol || '🗿', cx, cy - 2);
    } else {
      // Empty socket marker (faint runic circle)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(cx, cy, tileSize * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  /**
   * Export to JSON
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      z: this.z,
      elevation: this.elevation,
      styleId: this.styleId,
      name: this.name,
      riddleHint: this.riddleHint,
      acceptedItemId: this.acceptedItemId,
      puzzleGroupId: this.puzzleGroupId,
      targetDoorId: this.targetDoorId,
      targetMechanismId: this.targetMechanismId,
      slottedItem: this.slottedItem ? (typeof this.slottedItem.toJSON === 'function' ? this.slottedItem.toJSON() : this.slottedItem) : null,
    };
  }
}
