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
          // Wall rendering with 3D bevel / top cap
          ctx.fillStyle = theme.wall;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

          // Top highlight
          ctx.fillStyle = theme.wallTop;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize * 0.2);

          // Border stroke
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);
        } else {
          // Floor tile (checkerboard subtle tint)
          const isAlt = (x + y) % 2 === 0;
          ctx.fillStyle = isAlt ? theme.floorAlt : theme.floor;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

          // Subtle floor grid line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
          ctx.lineWidth = 1;
          ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);

          // If bridge tile, draw underpass tunnel styling
          if (tile === TILES.BRIDGE_EW) {
            ctx.fillStyle = theme.bridgeGround;
            ctx.fillRect(screen.x, screen.y + tileSize * 0.15, tileSize, tileSize * 0.7);
            // Tunnel arrow E-W
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(screen.x + tileSize * 0.2, screen.y + tileSize * 0.45, tileSize * 0.6, tileSize * 0.1);
          } else if (tile === TILES.BRIDGE_NS) {
            ctx.fillStyle = theme.bridgeGround;
            ctx.fillRect(screen.x + tileSize * 0.15, screen.y, tileSize * 0.7, tileSize);
            // Tunnel arrow N-S
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(screen.x + tileSize * 0.45, screen.y + tileSize * 0.2, tileSize * 0.1, tileSize * 0.6);
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    if (direction === 'NS') {
      ctx.fillRect(screenX + tileSize * 0.15 + 4, screenY + 4, tileSize * 0.7, tileSize);
    } else {
      ctx.fillRect(screenX + 4, screenY + tileSize * 0.15 + 4, tileSize, tileSize * 0.7);
    }

    // 2. Bridge Deck
    ctx.fillStyle = theme.bridgeOverhead;
    if (direction === 'NS') {
      ctx.fillRect(screenX + tileSize * 0.15, screenY, tileSize * 0.7, tileSize);

      // Planks
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const py = screenY + (tileSize / 4) * i;
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.15, py);
        ctx.lineTo(screenX + tileSize * 0.85, py);
        ctx.stroke();
      }

      // Railings
      ctx.fillStyle = theme.bridgeRailing;
      ctx.fillRect(screenX + tileSize * 0.12, screenY, tileSize * 0.08, tileSize);
      ctx.fillRect(screenX + tileSize * 0.80, screenY, tileSize * 0.08, tileSize);
    } else {
      ctx.fillRect(screenX, screenY + tileSize * 0.15, tileSize, tileSize * 0.7);

      // Planks
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const px = screenX + (tileSize / 4) * i;
        ctx.beginPath();
        ctx.moveTo(px, screenY + tileSize * 0.15);
        ctx.lineTo(px, screenY + tileSize * 0.85);
        ctx.stroke();
      }

      // Railings
      ctx.fillStyle = theme.bridgeRailing;
      ctx.fillRect(screenX, screenY + tileSize * 0.12, tileSize, tileSize * 0.08);
      ctx.fillRect(screenX, screenY + tileSize * 0.80, tileSize, tileSize * 0.08);
    }

    ctx.restore();
  }

  /**
   * Render Ramp with directional slope steps
   */
  renderRamp(ctx, rampTile, screenX, screenY, tileSize, theme) {
    ctx.save();
    ctx.fillStyle = theme.ramp;
    ctx.fillRect(screenX, screenY, tileSize, tileSize);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;

    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const arrowSize = tileSize * 0.25;

    // Draw slope step lines & directional arrow pointing UP
    ctx.beginPath();
    if (rampTile === TILES.RAMP_N) {
      // Slopes UP towards North
      ctx.moveTo(cx, cy - arrowSize);
      ctx.lineTo(cx - arrowSize, cy + arrowSize * 0.5);
      ctx.moveTo(cx, cy - arrowSize);
      ctx.lineTo(cx + arrowSize, cy + arrowSize * 0.5);
    } else if (rampTile === TILES.RAMP_S) {
      // Slopes UP towards South
      ctx.moveTo(cx, cy + arrowSize);
      ctx.lineTo(cx - arrowSize, cy - arrowSize * 0.5);
      ctx.moveTo(cx, cy + arrowSize);
      ctx.lineTo(cx + arrowSize, cy - arrowSize * 0.5);
    } else if (rampTile === TILES.RAMP_E) {
      // Slopes UP towards East
      ctx.moveTo(cx + arrowSize, cy);
      ctx.lineTo(cx - arrowSize * 0.5, cy - arrowSize);
      ctx.moveTo(cx + arrowSize, cy);
      ctx.lineTo(cx - arrowSize * 0.5, cy + arrowSize);
    } else if (rampTile === TILES.RAMP_W) {
      // Slopes UP towards West
      ctx.moveTo(cx - arrowSize, cy);
      ctx.lineTo(cx + arrowSize * 0.5, cy - arrowSize);
      ctx.moveTo(cx - arrowSize, cy);
      ctx.lineTo(cx + arrowSize * 0.5, cy + arrowSize);
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
   * Render Exit Portal
   */
  renderExitPortal(ctx, exitX, exitY, camera, theme, fog) {
    if (fog && !fog.isExplored(exitX, exitY)) return;

    const tileSize = camera.tileSize;
    const screen = camera.worldToScreen(exitX * tileSize, exitY * tileSize);
    const cx = screen.x + tileSize / 2;
    const cy = screen.y + tileSize / 2;
    const radius = tileSize * 0.38;
    const pulse = Math.sin(this.exitPulseTimer) * 0.2 + 0.8;

    ctx.save();

    // Portal Glow
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16 * pulse;

    // Outer spinning ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(2, tileSize * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Inner core
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 0.7);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#38bdf8');
    grad.addColorStop(1, '#0284c7');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
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
