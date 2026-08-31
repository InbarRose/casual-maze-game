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
   * Update handle animation and visual pulse
   * @param {number} dt
   */
  update(dt) {
    const targetAngle = this.state ? 0.65 : -0.65;
    this.handleAngle += (targetAngle - this.handleAngle) * Math.min(1, dt * 16);
    this.pulseTimer = (this.pulseTimer || 0) + dt * 4;
  }

  /**
   * Render lever base, prominent ON/OFF indicator LED, status badge, and animated handle
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const baseW = tileSize * 0.76;
    const baseH = tileSize * 0.44;
    const pulse = Math.sin(this.pulseTimer || 0) * 0.15 + 0.85;

    ctx.save();

    // 1. Base Plate with State-Driven Glow
    if (this.state) {
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 8 * pulse;
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#34d399';
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
    }

    ctx.lineWidth = Math.max(1.5, tileSize * 0.05);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(cx - baseW / 2, cy + tileSize * 0.06, baseW, baseH, tileSize * 0.08);
    } else {
      ctx.rect(cx - baseW / 2, cy + tileSize * 0.06, baseW, baseH);
    }
    ctx.fill();
    ctx.stroke();

    // 2. Etched Power Conduit Lines
    ctx.strokeStyle = this.state ? 'rgba(52, 211, 153, 0.6)' : 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = Math.max(1, tileSize * 0.03);
    ctx.beginPath();
    ctx.moveTo(cx - baseW * 0.4, cy + tileSize * 0.38);
    ctx.lineTo(cx + baseW * 0.4, cy + tileSize * 0.38);
    ctx.stroke();

    // 3. Status LED & Text Indicator Badge (ON / OFF)
    const ledColor = this.state ? '#34d399' : '#f43f5e';
    const ledX = cx - baseW * 0.28;
    const ledY = cy + tileSize * 0.22;
    const ledRadius = tileSize * 0.08;

    // LED Outer Glow
    ctx.shadowColor = ledColor;
    ctx.shadowBlur = this.state ? 10 * pulse : 4;
    ctx.fillStyle = ledColor;
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledRadius, 0, Math.PI * 2);
    ctx.fill();

    // LED Core Highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ledX - ledRadius * 0.25, ledY - ledRadius * 0.25, ledRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ON / OFF State Text Label on Plate
    ctx.fillStyle = this.state ? '#a7f3d0' : '#fca5a5';
    ctx.font = `bold ${Math.max(8, Math.floor(tileSize * 0.18))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.state ? 'ON' : 'OFF', cx - baseW * 0.28, cy + tileSize * 0.38);

    // 4. Pivot Bracket & Mechanical Slot
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx + baseW * 0.05, cy + tileSize * 0.12, baseW * 0.35, tileSize * 0.12);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(cx + baseW * 0.05, cy + tileSize * 0.12, baseW * 0.35, tileSize * 0.12);

    // 5. Lever Shaft & Handle
    ctx.save();
    const pivotX = cx + baseW * 0.22;
    const pivotY = cy + tileSize * 0.18;
    ctx.translate(pivotX, pivotY);
    ctx.rotate(this.handleAngle);

    // Metallic Shaft
    ctx.strokeStyle = this.state ? '#38bdf8' : '#cbd5e1';
    ctx.lineWidth = Math.max(2.5, tileSize * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -tileSize * 0.48);
    ctx.stroke();

    // Handle Knob with Pulse Glow
    const knobColor = this.state ? '#38bdf8' : '#e2e8f0';
    ctx.fillStyle = knobColor;
    ctx.shadowColor = this.state ? '#38bdf8' : 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = this.state ? 8 * pulse : 2;
    ctx.beginPath();
    ctx.arc(0, -tileSize * 0.48, tileSize * 0.11, 0, Math.PI * 2);
    ctx.fill();

    // Knob specular glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-tileSize * 0.03, -tileSize * 0.51, tileSize * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 6. Pivot Bolt
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, tileSize * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
