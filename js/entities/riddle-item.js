/**
 * RiddleItem Entity
 * Carryable items (Statues, Elemental Orbs, Runestones) that players can pick up,
 * carry in hand/backpack, and place onto environmental Pedestals to solve non-automatic riddle puzzles.
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ, RIDDLE_ITEM_STYLES } from '../core/constants.js';

export class RiddleItem {
  /**
   * @param {object} config
   */
  constructor(config = {}) {
    this.id = config.id || `riddle_item_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.RIDDLE_ITEM;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.itemType = config.itemType || 'statue'; // 'statue' | 'orb' | 'rune'
    this.styleId = config.styleId || 'statue_falcon';

    // Preset lookup
    const preset = RIDDLE_ITEM_STYLES.find(s => s.id === this.styleId);
    this.name = config.name || (preset ? preset.label : 'Ancient Relic');
    this.symbol = config.symbol || (preset ? preset.icon : '🗿');
    this.description = config.description || (preset ? preset.desc : 'An enigmatic ancient artifact waiting to be placed.');
    this.color = config.color || (this.itemType === 'statue' ? '#38bdf8' : (this.itemType === 'orb' ? '#f59e0b' : '#a855f7'));

    this.isCarried = !!config.isCarried;
    this.isSlotted = !!config.isSlotted;
    this.slottedPedestalId = config.slottedPedestalId || null;

    // Animation timer for subtle floating
    this.animTimer = Math.random() * Math.PI * 2;
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
   * Pick up by player
   */
  pickup() {
    this.isCarried = true;
    this.isSlotted = false;
    this.slottedPedestalId = null;
  }

  /**
   * Drop onto floor
   * @param {number} x
   * @param {number} y
   * @param {number} [elevation]
   */
  drop(x, y, elevation = ELEVATION.GROUND) {
    this.x = x;
    this.y = y;
    this.z = elevation;
    this.elevation = elevation;
    this.isCarried = false;
    this.isSlotted = false;
    this.slottedPedestalId = null;
  }

  /**
   * Slot onto a pedestal
   * @param {object} pedestal
   */
  slotInto(pedestal) {
    this.x = pedestal.x;
    this.y = pedestal.y;
    this.z = pedestal.z ?? pedestal.elevation ?? ELEVATION.GROUND;
    this.elevation = this.z;
    this.isCarried = false;
    this.isSlotted = true;
    this.slottedPedestalId = pedestal.id;
  }

  /**
   * Update animation
   * @param {number} dt
   */
  update(dt) {
    this.animTimer += dt * 2.5;
  }

  /**
   * Render item on floor
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   * @param {string} [perspective]
   */
  render(ctx, screenX, screenY, tileSize, perspective = 'topdown') {
    // If carried, it is rendered in HUD or on the player
    if (this.isCarried) return;

    ctx.save();
    const bob = Math.sin(this.animTimer) * (tileSize * 0.08);
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2 + bob;

    // Floor Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, screenY + tileSize * 0.8, tileSize * 0.3, tileSize * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Radial Aura Glow
    const auraRadius = tileSize * 0.45;
    const aura = ctx.createRadialGradient(cx, cy, tileSize * 0.1, cx, cy, auraRadius);
    aura.addColorStop(0, `${this.color}55`);
    aura.addColorStop(1, `${this.color}00`);
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Base plinth/mat on the floor
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, tileSize * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Render Symbol / Icon
    ctx.font = `${Math.round(tileSize * 0.48)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, cx, cy);

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
      itemType: this.itemType,
      styleId: this.styleId,
      name: this.name,
      symbol: this.symbol,
      description: this.description,
      color: this.color,
      isCarried: this.isCarried,
      isSlotted: this.isSlotted,
      slottedPedestalId: this.slottedPedestalId,
    };
  }
}
