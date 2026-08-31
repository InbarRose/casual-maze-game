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
    this.style = config.style || 'switch_lever'; // 'switch_lever' | 'pressure_pedestal' | 'crystal_switch' | 'runic_plate' | 'cog_wheel'
    this.oneWay = !!config.oneWay;
    this.elevation = config.elevation ?? 0;
    this.name = config.name || 'Switch';
    this.targets = Array.isArray(config.targets) ? JSON.parse(JSON.stringify(config.targets)) : [];

    // Visual animation for switch handle / cog rotation
    this.handleAngle = this.state ? 0.6 : -0.6;
    this.cogRotation = this.state ? Math.PI : 0;
  }

  /**
   * Toggle lever state and apply mutations to level
   * @param {object} level Canonical level object
   * @returns {boolean} new state
   */
  toggle(level) {
    if (this.oneWay && this.state) {
      return this.state; // Already triggered one-way mechanism
    }

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
    const targetCog = this.state ? Math.PI : 0;
    this.cogRotation += (targetCog - this.cogRotation) * Math.min(1, dt * 12);
    this.pulseTimer = (this.pulseTimer || 0) + dt * 4;
  }

  /**
   * Render lever / mechanism with customized visual style
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

    if (this.style === 'pressure_pedestal') {
      // Stone Pressure Pedestal
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = this.state ? '#34d399' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, tileSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Depressed Center Button Plate
      const btnRadius = tileSize * (this.state ? 0.22 : 0.26);
      ctx.fillStyle = this.state ? '#059669' : '#0f172a';
      ctx.shadowColor = this.state ? '#34d399' : 'transparent';
      ctx.shadowBlur = this.state ? 12 : 0;
      ctx.beginPath();
      ctx.arc(cx, cy, btnRadius, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.style === 'crystal_switch') {
      // Resonance Crystal Switch
      ctx.shadowColor = this.state ? '#34d399' : '#38bdf8';
      ctx.shadowBlur = this.state ? 16 * pulse : 6;
      ctx.fillStyle = this.state ? '#34d399' : '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(cx, cy - tileSize * 0.4);
      ctx.lineTo(cx + tileSize * 0.22, cy);
      ctx.lineTo(cx, cy + tileSize * 0.4);
      ctx.lineTo(cx - tileSize * 0.22, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.style === 'runic_plate') {
      // Runic Floor Inscription
      ctx.shadowColor = this.state ? '#34d399' : '#a855f7';
      ctx.shadowBlur = this.state ? 14 : 4;
      ctx.strokeStyle = this.state ? '#34d399' : '#a855f7';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(cx, cy, tileSize * 0.35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = this.state ? '#34d399' : '#a855f7';
      ctx.font = `${Math.floor(tileSize * 0.35)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.state ? '⚡' : '📜', cx, cy);
    } else if (this.style === 'cog_wheel') {
      // Industrial Valve Crank Wheel
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.cogRotation);

      ctx.strokeStyle = this.state ? '#34d399' : '#cbd5e1';
      ctx.lineWidth = Math.max(2, tileSize * 0.08);
      ctx.beginPath();
      ctx.arc(0, 0, tileSize * 0.32, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(i * Math.PI / 2) * tileSize * 0.32, Math.sin(i * Math.PI / 2) * tileSize * 0.32);
        ctx.stroke();
      }

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(0, 0, tileSize * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Standard Floor / Wall Toggle Lever
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

      // 2. Status LED
      const ledColor = this.state ? '#34d399' : '#f43f5e';
      const ledX = cx - baseW * 0.28;
      const ledY = cy + tileSize * 0.22;
      const ledRadius = tileSize * 0.08;

      ctx.shadowColor = ledColor;
      ctx.shadowBlur = this.state ? 10 * pulse : 4;
      ctx.fillStyle = ledColor;
      ctx.beginPath();
      ctx.arc(ledX, ledY, ledRadius, 0, Math.PI * 2);
      ctx.fill();

      // Status text
      ctx.fillStyle = this.state ? '#a7f3d0' : '#fca5a5';
      ctx.font = `bold ${Math.max(8, Math.floor(tileSize * 0.18))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.state ? 'ON' : 'OFF', cx - baseW * 0.28, cy + tileSize * 0.38);

      // 3. Lever Handle
      ctx.save();
      const pivotX = cx + baseW * 0.22;
      const pivotY = cy + tileSize * 0.18;
      ctx.translate(pivotX, pivotY);
      ctx.rotate(this.handleAngle);

      ctx.strokeStyle = this.state ? '#38bdf8' : '#cbd5e1';
      ctx.lineWidth = Math.max(2.5, tileSize * 0.08);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -tileSize * 0.48);
      ctx.stroke();

      ctx.fillStyle = this.state ? '#38bdf8' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, -tileSize * 0.48, tileSize * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
