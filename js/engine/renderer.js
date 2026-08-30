/**
 * 2D Canvas Game Renderer
 * Multi-layer rendering pipeline (Ground -> Entities -> Overhead Bridges -> Player -> Fog -> Particles)
 */

import { TILES, THEMES, ELEVATION, FOG_STATE, ENTITY_TYPES } from '../core/constants.js';

export class GameRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.particles = [];
    this.exitPulseTimer = 0;
  }

  /**
   * Main render method
   * @param {object} level
   * @param {Player} player
   * @param {Array<Key|Door|Lever>} entities
   * @param {Camera} camera
   * @param {FogOfWar} fog
   * @param {number} dt
   */
  render(level, player, entities, camera, fog, dt) {
    const ctx = this.ctx;
    const { width: viewW, height: viewH } = camera;
    const tileSize = camera.tileSize;
    const { width: mazeW, height: mazeH } = level.dimensions;
    const theme = THEMES[level.config.theme] || THEMES.dungeon;

    this.exitPulseTimer += dt * 3;
    this.updateParticles(dt);

    // 1. Clear background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Viewport bounds (performance budget optimization: only iterate visible tiles)
    const bounds = camera.getViewportBounds(mazeW, mazeH, 2);

    // 2. Render Ground Layer
    this.renderGroundLayer(ctx, level, bounds, camera, theme);

    // 3. Render Exit Portal
    if (level.exit) {
      this.renderExitPortal(ctx, level.exit.x, level.exit.y, camera, theme, fog);
    }

    // 4. Render Ground Entities (Doors, Levers, Keys on elevation 0)
    this.renderEntities(ctx, entities, ELEVATION.GROUND, camera, fog);

    // 5. Render Overhead Bridges & Ramps
    this.renderOverheadLayer(ctx, level, bounds, camera, theme);

    // 6. Render Overhead Entities
    this.renderEntities(ctx, entities, ELEVATION.OVERHEAD, camera, fog);

    // 7. Render Player
    const playerScreen = camera.worldToScreen(player.worldX, player.worldY);
    player.render(ctx, playerScreen.x, playerScreen.y, tileSize);

    // 8. Render Fog-of-War Mask
    if (level.config.fogOfWar && fog) {
      this.renderFogOfWar(ctx, fog, bounds, camera, theme);
    }

    // 9. Render Particle Effects
    this.renderParticles(ctx, camera);
  }

  /**
   * Render Ground Layer (Floors, Walls, Bridge Underpasses)
   */
  renderGroundLayer(ctx, level, bounds, camera, theme) {
    const ground = level.layers.ground;
    const tileSize = camera.tileSize;

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const tile = ground[y]?.[x];
        const screen = camera.worldToScreen(x * tileSize, y * tileSize);

        if (tile === TILES.WALL) {
          // Base wall block
          ctx.fillStyle = theme.wall;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

          // Top 3D cap / bevel highlight
          ctx.fillStyle = theme.wallTop;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize * 0.22);

          // Thematic middle detail line / masonry brick pattern
          ctx.fillStyle = theme.wallDetail || 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(screen.x + tileSize * 0.1, screen.y + tileSize * 0.58, tileSize * 0.8, 1.5);
          ctx.fillRect(screen.x + tileSize * 0.5, screen.y + tileSize * 0.22, 1.5, tileSize * 0.36);

          // Dark outer edge stroke
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.lineWidth = 1;
          ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);
        } else {
          // Floor tile (checkerboard subtle tint)
          const isAlt = (x + y) % 2 === 0;
          ctx.fillStyle = isAlt ? theme.floorAlt : theme.floor;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

          // Floor grid outline
          ctx.strokeStyle = theme.floorGrid || 'rgba(255, 255, 255, 0.02)';
          ctx.lineWidth = 1;
          ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);

          // Bridge underpass tunnel styling on ground layer
          if (tile === TILES.BRIDGE_EW) {
            // E-W Ground corridor passing UNDER North-South bridge
            ctx.fillStyle = theme.bridgeGround;
            ctx.fillRect(screen.x, screen.y + tileSize * 0.12, tileSize, tileSize * 0.76);

            // Top and bottom underpass depth shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(screen.x, screen.y + tileSize * 0.12, tileSize, tileSize * 0.1);
            ctx.fillRect(screen.x, screen.y + tileSize * 0.78, tileSize, tileSize * 0.1);

            // Subtle corridor dashed center-line
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fillRect(screen.x + tileSize * 0.15, screen.y + tileSize * 0.48, tileSize * 0.7, 2);
          } else if (tile === TILES.BRIDGE_NS) {
            // N-S Ground corridor passing UNDER East-West bridge
            ctx.fillStyle = theme.bridgeGround;
            ctx.fillRect(screen.x + tileSize * 0.12, screen.y, tileSize * 0.76, tileSize);

            // Left and right underpass depth shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(screen.x + tileSize * 0.12, screen.y, tileSize * 0.1, tileSize);
            ctx.fillRect(screen.x + tileSize * 0.78, screen.y, tileSize * 0.1, tileSize);

            // Subtle corridor dashed center-line
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fillRect(screen.x + tileSize * 0.48, screen.y + tileSize * 0.15, 2, tileSize * 0.7);
          }
        }
      }
    }
  }

  /**
   * Render Overhead Layer (Elevated bridges and ramps)
   */
  renderOverheadLayer(ctx, level, bounds, camera, theme) {
    const overhead = level.layers.overhead;
    const ground = level.layers.ground;
    const tileSize = camera.tileSize;

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const overTile = overhead?.[y]?.[x];
        const gTile = ground?.[y]?.[x];
        const screen = camera.worldToScreen(x * tileSize, y * tileSize);

        // Render Ramps
        if (this.isRampTile(gTile)) {
          this.renderRamp(ctx, gTile, screen.x, screen.y, tileSize, theme);
        }

        // Render Overhead Bridge
        if (overTile === TILES.BRIDGE_EW || gTile === TILES.BRIDGE_EW) {
          // B_EW Overhead spans North-South across the EW tunnel below!
          this.renderBridgeSpan(ctx, 'NS', screen.x, screen.y, tileSize, theme);
        } else if (overTile === TILES.BRIDGE_NS || gTile === TILES.BRIDGE_NS) {
          // B_NS Overhead spans East-West across the NS tunnel below!
          this.renderBridgeSpan(ctx, 'EW', screen.x, screen.y, tileSize, theme);
        }
      }
    }
  }

  /**
   * Render bridge walkway with drop shadow and wooden/metal planks & railings
   */
  renderBridgeSpan(ctx, direction, screenX, screenY, tileSize, theme) {
    ctx.save();

    // 1. Drop shadow onto ground below
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    if (direction === 'NS') {
      ctx.fillRect(screenX + tileSize * 0.12 + 5, screenY + 4, tileSize * 0.76, tileSize);
    } else {
      ctx.fillRect(screenX + 4, screenY + tileSize * 0.12 + 5, tileSize, tileSize * 0.76);
    }

    // 2. Bridge Deck
    ctx.fillStyle = theme.bridgeOverhead;
    if (direction === 'NS') {
      ctx.fillRect(screenX + tileSize * 0.12, screenY, tileSize * 0.76, tileSize);

      // Wooden / stone planks
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const py = screenY + (tileSize / 5) * i;
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.12, py);
        ctx.lineTo(screenX + tileSize * 0.88, py);
        ctx.stroke();
      }

      // Dual Railings (West and East edges)
      ctx.fillStyle = theme.bridgeRailing;
      ctx.fillRect(screenX + tileSize * 0.10, screenY, tileSize * 0.08, tileSize);
      ctx.fillRect(screenX + tileSize * 0.82, screenY, tileSize * 0.08, tileSize);

      // Support post studs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX + tileSize * 0.11, screenY + tileSize * 0.1, tileSize * 0.06, tileSize * 0.15);
      ctx.fillRect(screenX + tileSize * 0.83, screenY + tileSize * 0.1, tileSize * 0.06, tileSize * 0.15);
      ctx.fillRect(screenX + tileSize * 0.11, screenY + tileSize * 0.75, tileSize * 0.06, tileSize * 0.15);
      ctx.fillRect(screenX + tileSize * 0.83, screenY + tileSize * 0.75, tileSize * 0.06, tileSize * 0.15);
    } else {
      ctx.fillRect(screenX, screenY + tileSize * 0.12, tileSize, tileSize * 0.76);

      // Wooden / stone planks
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const px = screenX + (tileSize / 5) * i;
        ctx.beginPath();
        ctx.moveTo(px, screenY + tileSize * 0.12);
        ctx.lineTo(px, screenY + tileSize * 0.88);
        ctx.stroke();
      }

      // Dual Railings (North and South edges)
      ctx.fillStyle = theme.bridgeRailing;
      ctx.fillRect(screenX, screenY + tileSize * 0.10, tileSize, tileSize * 0.08);
      ctx.fillRect(screenX, screenY + tileSize * 0.82, tileSize, tileSize * 0.08);

      // Support post studs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX + tileSize * 0.1, screenY + tileSize * 0.11, tileSize * 0.15, tileSize * 0.06);
      ctx.fillRect(screenX + tileSize * 0.1, screenY + tileSize * 0.83, tileSize * 0.15, tileSize * 0.06);
      ctx.fillRect(screenX + tileSize * 0.75, screenY + tileSize * 0.11, tileSize * 0.15, tileSize * 0.06);
      ctx.fillRect(screenX + tileSize * 0.75, screenY + tileSize * 0.83, tileSize * 0.15, tileSize * 0.06);
    }

    ctx.restore();
  }

  /**
   * Render Ramp with directional slope steps & glowing arrow
   */
  renderRamp(ctx, rampTile, screenX, screenY, tileSize, theme) {
    ctx.save();
    ctx.fillStyle = theme.ramp;
    ctx.fillRect(screenX, screenY, tileSize, tileSize);

    // Subtle stepped incline lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const offset = (tileSize / 4) * i;
      ctx.beginPath();
      if (rampTile === TILES.RAMP_N || rampTile === TILES.RAMP_S) {
        ctx.moveTo(screenX, screenY + offset);
        ctx.lineTo(screenX + tileSize, screenY + offset);
      } else {
        ctx.moveTo(screenX + offset, screenY);
        ctx.lineTo(screenX + offset, screenY + tileSize);
      }
      ctx.stroke();
    }

    // Directional chevron arrow in theme color
    const arrowColor = theme.rampArrow || theme.accent || '#38bdf8';
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = Math.max(2, tileSize * 0.08);
    ctx.shadowColor = arrowColor;
    ctx.shadowBlur = 6;

    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const arrowSize = tileSize * 0.28;

    ctx.beginPath();
    if (rampTile === TILES.RAMP_N) {
      // Slopes UP towards North
      ctx.moveTo(cx - arrowSize, cy + arrowSize * 0.4);
      ctx.lineTo(cx, cy - arrowSize * 0.5);
      ctx.lineTo(cx + arrowSize, cy + arrowSize * 0.4);
    } else if (rampTile === TILES.RAMP_S) {
      // Slopes UP towards South
      ctx.moveTo(cx - arrowSize, cy - arrowSize * 0.4);
      ctx.lineTo(cx, cy + arrowSize * 0.5);
      ctx.lineTo(cx + arrowSize, cy - arrowSize * 0.4);
    } else if (rampTile === TILES.RAMP_E) {
      // Slopes UP towards East
      ctx.moveTo(cx - arrowSize * 0.4, cy - arrowSize);
      ctx.lineTo(cx + arrowSize * 0.5, cy);
      ctx.lineTo(cx - arrowSize * 0.4, cy + arrowSize);
    } else if (rampTile === TILES.RAMP_W) {
      // Slopes UP towards West
      ctx.moveTo(cx + arrowSize * 0.4, cy - arrowSize);
      ctx.lineTo(cx - arrowSize * 0.5, cy);
      ctx.lineTo(cx + arrowSize * 0.4, cy + arrowSize);
    }
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render entities for a specific elevation layer
   */
  renderEntities(ctx, entities, elevation, camera, fog) {
    const tileSize = camera.tileSize;

    for (const entity of entities) {
      if ((entity.elevation ?? 0) !== elevation) continue;

      // Check fog visibility: dynamic entities are hidden unless active line of sight (VISIBLE = 2)
      if (fog && !fog.isVisible(entity.x, entity.y)) {
        continue;
      }

      const screen = camera.worldToScreen(entity.x * tileSize, entity.y * tileSize);
      entity.render(ctx, screen.x, screen.y, tileSize);
    }
  }

  /**
   * Render Animated Exit Portal with thematic swirling vortex
   */
  renderExitPortal(ctx, exitX, exitY, camera, theme, fog) {
    if (fog && !fog.isExplored(exitX, exitY)) return;

    const tileSize = camera.tileSize;
    const screen = camera.worldToScreen(exitX * tileSize, exitY * tileSize);
    const cx = screen.x + tileSize / 2;
    const cy = screen.y + tileSize / 2;
    const radius = tileSize * 0.4;
    const pulse = Math.sin(this.exitPulseTimer) * 0.18 + 0.88;

    const outerColor = theme.portalOuter || theme.accent || '#0284c7';
    const innerColor = theme.portalInner || '#ffffff';

    ctx.save();

    // Portal Glow Aura
    ctx.shadowColor = innerColor;
    ctx.shadowBlur = 18 * pulse;

    // Outer spinning dashed glyph ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.exitPulseTimer * 0.8);
    ctx.strokeStyle = outerColor;
    ctx.lineWidth = Math.max(2, tileSize * 0.07);
    ctx.setLineDash([tileSize * 0.15, tileSize * 0.1]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Inner counter-rotating ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.exitPulseTimer * 1.2);
    ctx.strokeStyle = innerColor;
    ctx.lineWidth = Math.max(1.5, tileSize * 0.05);
    ctx.setLineDash([tileSize * 0.1, tileSize * 0.08]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Dimensional Core gradient
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 0.65);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, innerColor);
    grad.addColorStop(1, outerColor);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.58 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Render Fog-of-War overlay mask
   */
  renderFogOfWar(ctx, fog, bounds, camera, theme) {
    const tileSize = camera.tileSize;

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const vis = fog.getVisibility(x, y);
        const screen = camera.worldToScreen(x * tileSize, y * tileSize);

        if (vis === FOG_STATE.UNEXPLORED) {
          // Solid Black Mask
          ctx.fillStyle = theme.fogUnexplored;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
        } else if (vis === FOG_STATE.EXPLORED) {
          // Explored / Memory: Dimmed 65% dark overlay
          ctx.fillStyle = theme.fogMemory;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
        }
        // VISIBLE (2) has no mask, revealing full brightness
      }
    }
  }

  /**
   * Spawn particle effects (e.g. key collect or level victory)
   * @param {number} worldX
   * @param {number} worldY
   * @param {string} color
   * @param {number} [count=20]
   */
  spawnParticles(worldX, worldY, color = '#fbbf24', count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 30;
      this.particles.push({
        x: worldX,
        y: worldY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: Math.random() * 1.5 + 0.8,
      });
    }
  }

  /**
   * Update particle lifetimes
   * @param {number} dt
   */
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles in world space
   */
  renderParticles(ctx, camera) {
    if (this.particles.length === 0) return;

    ctx.save();
    for (const p of this.particles) {
      const screen = camera.worldToScreen(p.x, p.y);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Helper to check if tile is a ramp
   */
  isRampTile(tile) {
    return (
      tile === TILES.RAMP_N ||
      tile === TILES.RAMP_S ||
      tile === TILES.RAMP_E ||
      tile === TILES.RAMP_W
    );
  }
}
