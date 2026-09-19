/**
 * Hazard & Patroller Entities
 * Timed cyclical traps (spikes, flame vents) and moving waypoint-patrolling obstacles/enemies.
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ } from '../core/constants.js';

export class TimedHazard {
  /**
   * @param {object} config
   */
  constructor(config) {
    this.id = config.id || `hazard_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.HAZARD;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.style = config.style || 'spikes'; // 'spikes' | 'fire_jet'
    this.interval = Number(config.interval) || 2.0; // Total cycle seconds
    this.activeDuration = Number(config.activeDuration) || 1.0; // Seconds active per cycle
    this.timer = Number(config.initialOffset) || 0;
    this.isActive = false;
    this.color = config.color || (this.style === 'fire_jet' ? '#f97316' : '#f43f5e');
    this.name = config.name || (this.style === 'fire_jet' ? 'Flame Vent' : 'Floor Spikes');

    // Visual animation
    this.animProgress = 0; // 0 to 1 transition
    this.pulseTimer = 0;
  }

  /**
   * Canonical (X, Y, Z) coordinate string
   * @returns {string}
   */
  getCoordString() {
    return formatXYZ(this.x, this.y, this.z);
  }

  /**
   * Check if hazard is lethal to player at coordinates
   * @param {number} px
   * @param {number} py
   * @param {number} pz
   * @returns {boolean}
   */
  isLethalAt(px, py, pz = ELEVATION.GROUND) {
    return this.isActive && this.x === px && this.y === py && (this.z ?? ELEVATION.GROUND) === pz;
  }

  /**
   * Update cycle timer and transition state
   * @param {number} dt
   */
  update(dt) {
    this.timer = (this.timer + dt) % this.interval;
    const wasActive = this.isActive;
    this.isActive = this.timer < this.activeDuration;

    // Smooth visual pop up / down
    const targetAnim = this.isActive ? 1 : 0;
    this.animProgress += (targetAnim - this.animProgress) * Math.min(1, dt * 14);
    this.pulseTimer += dt * 4;
  }

  /**
   * Render hazard
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const pulse = Math.sin(this.pulseTimer) * 0.15 + 0.85;

    ctx.save();

    if (this.style === 'fire_jet') {
      // Base grate
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      ctx.fillRect(screenX + tileSize * 0.1, screenY + tileSize * 0.1, tileSize * 0.8, tileSize * 0.8);
      ctx.strokeRect(screenX + tileSize * 0.1, screenY + tileSize * 0.1, tileSize * 0.8, tileSize * 0.8);

      // Slits
      ctx.strokeStyle = '#0c0a09';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const offset = tileSize * (0.28 + i * 0.18);
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.2, screenY + offset);
        ctx.lineTo(screenX + tileSize * 0.8, screenY + offset);
        ctx.stroke();
      }

      if (this.animProgress > 0.05) {
        // Erupting fire pillar
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 18 * this.animProgress * pulse;

        const flameH = tileSize * 0.85 * this.animProgress;
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, flameH);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#fde047');
        grad.addColorStop(0.7, '#ea580c');
        grad.addColorStop(1, 'rgba(234, 88, 12, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, flameH * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Floor spikes
      // Base plate
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fillRect(screenX + tileSize * 0.1, screenY + tileSize * 0.1, tileSize * 0.8, tileSize * 0.8);
      ctx.strokeRect(screenX + tileSize * 0.1, screenY + tileSize * 0.1, tileSize * 0.8, tileSize * 0.8);

      // Spike holes (4 points)
      const points = [
        { x: cx - tileSize * 0.22, y: cy - tileSize * 0.22 },
        { x: cx + tileSize * 0.22, y: cy - tileSize * 0.22 },
        { x: cx - tileSize * 0.22, y: cy + tileSize * 0.22 },
        { x: cx + tileSize * 0.22, y: cy + tileSize * 0.22 },
      ];

      for (const pt of points) {
        // Hole shadow
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, tileSize * 0.09, 0, Math.PI * 2);
        ctx.fill();

        // Extended spike tip
        if (this.animProgress > 0.05) {
          const spikeLen = tileSize * 0.32 * this.animProgress;
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pt.x - tileSize * 0.06, pt.y);
          ctx.lineTo(pt.x, pt.y - spikeLen);
          ctx.lineTo(pt.x + tileSize * 0.06, pt.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }
}

export class Patroller {
  /**
   * @param {object} config
   */
  constructor(config) {
    this.id = config.id || `patroller_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.PATROLLER;

    // Waypoints array e.g. [{x: 2, y: 3, z: 0}, {x: 8, y: 3, z: 0}]
    this.waypoints = Array.isArray(config.waypoints) && config.waypoints.length > 0
      ? config.waypoints.map(w => ({
          x: Number(w.x) || 0,
          y: Number(w.y) || 0,
          z: w.z !== undefined ? Number(w.z) : (w.elevation !== undefined ? Number(w.elevation) : ELEVATION.GROUND),
        }))
      : [
          { x: Number(config.x) || 0, y: Number(config.y) || 0, z: Number(config.z || config.elevation || 0) },
        ];

    this.currentWaypointIndex = 0;
    this.nextWaypointIndex = this.waypoints.length > 1 ? 1 : 0;
    this.direction = 1; // 1 = forward, -1 = reverse (for pingpong)
    this.behavior = config.behavior || 'pingpong'; // 'pingpong' | 'loop'

    // Initial position
    const startWp = this.waypoints[0];
    this.x = startWp.x;
    this.y = startWp.y;
    this.z = startWp.z;
    this.elevation = this.z;

    this.tileSize = config.tileSize || 32;
    this.worldX = this.x * this.tileSize + this.tileSize / 2;
    this.worldY = this.y * this.tileSize + this.tileSize / 2;

    this.speed = Number(config.speed) || 2.2; // tiles per second
    this.style = config.style || 'sentinel'; // 'sentinel' | 'boulder'
    this.color = config.color || (this.style === 'boulder' ? '#78716c' : '#a855f7');
    this.name = config.name || (this.style === 'boulder' ? 'Rolling Boulder' : 'Patrol Sentinel');
    this.facing = 'east';
    this.rotation = 0;
    this.hoverBob = 0;
  }

  /**
   * Canonical (X, Y, Z) coordinate string
   * @returns {string}
   */
  getCoordString() {
    return formatXYZ(Math.round(this.x), Math.round(this.y), this.z);
  }

  /**
   * Check collision with player
   * @param {number} playerWorldX
   * @param {number} playerWorldY
   * @param {number} playerElevation
   * @param {number} tileSize
   * @returns {boolean}
   */
  checkCollision(playerWorldX, playerWorldY, playerElevation, tileSize = 32) {
    if (this.elevation !== playerElevation) return false;
    const dx = playerWorldX - this.worldX;
    const dy = playerWorldY - this.worldY;
    const distSq = dx * dx + dy * dy;
    const radius = tileSize * 0.42;
    return distSq < (radius * 2) * (radius * 2);
  }

  /**
   * Advance position along waypoints
   * @param {number} dt
   */
  update(dt) {
    if (this.waypoints.length <= 1) return;

    const targetWp = this.waypoints[this.nextWaypointIndex];
    const targetWorldX = targetWp.x * this.tileSize + this.tileSize / 2;
    const targetWorldY = targetWp.y * this.tileSize + this.tileSize / 2;

    const dx = targetWorldX - this.worldX;
    const dy = targetWorldY - this.worldY;
    const dist = Math.hypot(dx, dy);

    // Update facing direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'east' : 'west';
    } else if (Math.abs(dy) > 0) {
      this.facing = dy > 0 ? 'south' : 'north';
    }

    const step = this.speed * this.tileSize * dt;

    if (dist <= step || dist < 1.0) {
      // Reached waypoint
      this.worldX = targetWorldX;
      this.worldY = targetWorldY;
      this.x = targetWp.x;
      this.y = targetWp.y;
      this.z = targetWp.z;
      this.elevation = this.z;

      this.currentWaypointIndex = this.nextWaypointIndex;

      if (this.behavior === 'loop') {
        this.nextWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
      } else {
        // Ping-pong
        let nextIdx = this.currentWaypointIndex + this.direction;
        if (nextIdx >= this.waypoints.length) {
          this.direction = -1;
          nextIdx = this.waypoints.length - 2;
        } else if (nextIdx < 0) {
          this.direction = 1;
          nextIdx = 1;
        }
        this.nextWaypointIndex = Math.max(0, Math.min(this.waypoints.length - 1, nextIdx));
      }
    } else {
      // Step towards target
      this.worldX += (dx / dist) * step;
      this.worldY += (dy / dist) * step;
      this.x = (this.worldX - this.tileSize / 2) / this.tileSize;
      this.y = (this.worldY - this.tileSize / 2) / this.tileSize;
    }

    // Animation updates
    this.rotation += dt * (this.speed * 2.5);
    this.hoverBob += dt * 4;
  }

  /**
   * Render patroller
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    const cx = screenX;
    const cy = screenY;
    const radius = tileSize * 0.38;
    const bob = Math.sin(this.hoverBob) * (tileSize * 0.08);

    ctx.save();

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + radius * 0.9, radius * 0.9, radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    const drawY = cy - bob;

    if (this.style === 'boulder') {
      // Rolling kinetic boulder
      ctx.save();
      ctx.translate(cx, drawY);
      ctx.rotate(this.rotation);

      ctx.fillStyle = '#57534e';
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rock fissures
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.5, -radius * 0.3);
      ctx.lineTo(0, 0);
      ctx.lineTo(radius * 0.6, radius * 0.4);
      ctx.moveTo(0, 0);
      ctx.lineTo(-radius * 0.3, radius * 0.6);
      ctx.stroke();

      ctx.restore();
    } else {
      // Clockwork Sentinel
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;

      // Outer hull
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, drawY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing sentinel visor eye
      let eyeDx = 0;
      let eyeDy = 0;
      if (this.facing === 'north') eyeDy = -radius * 0.4;
      else if (this.facing === 'south') eyeDy = radius * 0.4;
      else if (this.facing === 'east') eyeDx = radius * 0.4;
      else if (this.facing === 'west') eyeDx = -radius * 0.4;

      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx + eyeDx, drawY + eyeDy, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + eyeDx, drawY + eyeDy, radius * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
