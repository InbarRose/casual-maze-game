/**
 * Lever Entity
 * Interactive switch that toggles runtime tiles or triggers remote mechanisms.
 */

import { ENTITY_TYPES } from '../core/constants.js';
import { globalEvents } from '../core/events.js';

export class Lever {
  /**
   * @param {object} config
   */
  constructor(config) {
    this.id = config.id || `lever_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.LEVER;
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.state = !!config.state; // false = unpulled, true = pulled
    this.elevation = config.elevation ?? 0;
    this.name = config.name || 'Switch';
    this.targets = Array.isArray(config.targets) ? JSON.parse(JSON.stringify(config.targets)) : [];

    // Visual animation for switch handle
    this.handleAngle = this.state ? 0.6 : -0.6;
  }

  /**
   * Toggle lever state and apply mutations to level
   * @param {object} level Canonical level object
   * @returns {boolean} new state
   */
  toggle(level) {
    this.state = !this.state;

    // Apply all target actions
    for (const target of this.targets) {
      if (target.action === 'toggle_tile') {
        const layerName = target.layer === 'overhead' ? 'overhead' : 'ground';
        const layer = level.layers[layerName];

        if (layer && layer[target.y] && layer[target.y][target.x] !== undefined) {
          const targetValue = this.state ? (target.stateA ?? 0) : (target.stateB ?? 1);
          layer[target.y][target.x] = targetValue;

          globalEvents.emit('tile:toggled', {
            x: target.x,
            y: target.y,
            layer: layerName,
            newValue: targetValue,
            leverId: this.id,
          });
        }
      }
    }

    return this.state;
  }

  /**
   * Update handle animation
   * @param {number} dt
   */
  update(dt) {
    const targetAngle = this.state ? 0.6 : -0.6;
    this.handleAngle += (targetAngle - this.handleAngle) * Math.min(1, dt * 15);
  }

  /**
   * Render lever base, indicator LED, and handle
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const baseW = tileSize * 0.6;
    const baseH = tileSize * 0.35;

    ctx.save();

    // Base plate
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(1, tileSize * 0.04);
    ctx.beginPath();
    ctx.roundRect(cx - baseW / 2, cy + tileSize * 0.1, baseW, baseH, tileSize * 0.08);
    ctx.fill();
    ctx.stroke();

    // Status LED
    const ledColor = this.state ? '#34d399' : '#f43f5e';
    ctx.fillStyle = ledColor;
    ctx.shadowColor = ledColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(cx - baseW * 0.25, cy + tileSize * 0.25, tileSize * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Lever shaft & knob
    ctx.translate(cx + baseW * 0.1, cy + tileSize * 0.15);
    ctx.rotate(this.handleAngle);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = Math.max(2, tileSize * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -tileSize * 0.45);
    ctx.stroke();

    // Knob
    ctx.fillStyle = this.state ? '#38bdf8' : '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, -tileSize * 0.45, tileSize * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
