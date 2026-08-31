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
    this.floatingTexts = [];
    this.shockwaves = [];
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
    this.updateEffects(dt);

    // 1. Clear background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Viewport bounds (performance budget optimization: only iterate visible tiles)
    const bounds = camera.getViewportBounds(mazeW, mazeH, 2);

    // 2. Render Ground Layer
    this.renderGroundLayer(ctx, level, bounds, camera, theme);

    // 3. Render Spawn Entrance & Exit Markers
    if (level.spawn) {
      this.renderSpawnEntrance(ctx, level, camera, theme, fog);
    }
    if (level.exit) {
      this.renderExit(ctx, level, camera, theme, fog);
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

    // 9. Render Particle Effects, Shockwaves, and In-World Floating Text
    this.renderWorldEffects(ctx, camera);
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
   * Render Entrance Marker on spawn tile (Stairs down, Portal, Archway)
   */
  renderSpawnEntrance(ctx, level, camera, theme, fog) {
    if (!level.spawn) return;
    const { x, y, style = 'stairs_down' } = level.spawn;
    if (fog && !fog.isExplored(x, y)) return;

    const tileSize = camera.tileSize;
    const screen = camera.worldToScreen(x * tileSize, y * tileSize);
    const cx = screen.x + tileSize / 2;
    const cy = screen.y + tileSize / 2;

    ctx.save();

    if (style === 'portal') {
      // Cyan/Emerald summoning rift
      const radius = tileSize * 0.36;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${Math.floor(tileSize * 0.35)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▼', cx, cy);
    } else if (style === 'archway') {
      // Heavy stone archway entry threshold
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(screen.x + tileSize * 0.1, screen.y + tileSize * 0.1, tileSize * 0.8, tileSize * 0.8);

      ctx.strokeStyle = theme.wallTop || '#484f58';
      ctx.lineWidth = 3;
      ctx.strokeRect(screen.x + tileSize * 0.15, screen.y + tileSize * 0.15, tileSize * 0.7, tileSize * 0.7);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, tileSize * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // stairs_down (default entrance) - Recessed stairwell into the dungeon
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(screen.x + tileSize * 0.08, screen.y + tileSize * 0.08, tileSize * 0.84, tileSize * 0.84);

      // Stone stair risers descending down
      for (let i = 0; i < 4; i++) {
        const py = screen.y + tileSize * (0.15 + i * 0.18);
        const h = tileSize * 0.12;
        const shade = Math.floor(40 + i * 20);
        ctx.fillStyle = `rgb(${shade}, ${shade + 5}, ${shade + 10})`;
        ctx.fillRect(screen.x + tileSize * 0.12, py, tileSize * 0.76, h);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screen.x + tileSize * 0.12, py, tileSize * 0.76, h);
      }

      // Wooden/stone side banisters
      ctx.fillStyle = theme.bridgeOverhead || '#78350f';
      ctx.fillRect(screen.x + tileSize * 0.08, screen.y + tileSize * 0.08, tileSize * 0.08, tileSize * 0.84);
      ctx.fillRect(screen.x + tileSize * 0.84, screen.y + tileSize * 0.08, tileSize * 0.08, tileSize * 0.84);

      // Entrance icon indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = `${Math.floor(tileSize * 0.25)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('IN', cx, screen.y + tileSize * 0.88);
    }

    ctx.restore();
  }

  /**
   * Render Exit (Stairs up, Portal, Archway)
   */
  renderExit(ctx, level, camera, theme, fog) {
    if (!level.exit) return;
    const { x, y, style = 'portal' } = level.exit;
    if (fog && !fog.isExplored(x, y)) return;

    if (style === 'stairs' || style === 'stairs_up') {
      this.renderExitStairs(ctx, x, y, camera, theme);
    } else if (style === 'archway' || style === 'gate') {
      this.renderExitArchway(ctx, x, y, camera, theme);
    } else {
      this.renderExitPortal(ctx, x, y, camera, theme, fog);
    }
  }

  /**
   * Render Ascending Exit Stairs with Golden Daylight Beam
   */
  renderExitStairs(ctx, exitX, exitY, camera, theme) {
    const tileSize = camera.tileSize;
    const screen = camera.worldToScreen(exitX * tileSize, exitY * tileSize);
    const cx = screen.x + tileSize / 2;
    const cy = screen.y + tileSize / 2;
    const pulse = Math.sin(this.exitPulseTimer) * 0.15 + 0.85;

    ctx.save();

    // Golden ambient daylight aura
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 16 * pulse;

    // Dark well base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(screen.x + tileSize * 0.05, screen.y + tileSize * 0.05, tileSize * 0.9, tileSize * 0.9);

    // Stone Steps ascending upwards
    for (let i = 0; i < 4; i++) {
      const stepY = screen.y + tileSize * (0.65 - i * 0.16);
      const stepW = tileSize * (0.8 - i * 0.06);
      const stepX = cx - stepW / 2;
      const stepH = tileSize * 0.14;

      // Tread color getting brighter near the top exit
      const brightness = Math.floor(130 + i * 35);
      ctx.fillStyle = `rgb(${brightness}, ${Math.floor(brightness * 0.9)}, ${Math.floor(brightness * 0.7)})`;
      ctx.fillRect(stepX, stepY, stepW, stepH);

      // Tread edge
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(stepX, stepY, stepW, stepH);
    }

    // Top Daylight Gateway / Sunbeams
    const sunGrad = ctx.createRadialGradient(cx, screen.y + tileSize * 0.15, 2, cx, screen.y + tileSize * 0.15, tileSize * 0.45);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.5, '#fef08a');
    sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, screen.y + tileSize * 0.18, tileSize * 0.4 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Exit badge / upward chevron
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.font = `bold ${Math.floor(tileSize * 0.35)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▲', cx, screen.y + tileSize * 0.2);

    ctx.restore();
  }

  /**
   * Render Archway Exit
   */
  renderExitArchway(ctx, exitX, exitY, camera, theme) {
    const tileSize = camera.tileSize;
    const screen = camera.worldToScreen(exitX * tileSize, exitY * tileSize);
    const cx = screen.x + tileSize / 2;
    const cy = screen.y + tileSize / 2;
    const pulse = Math.sin(this.exitPulseTimer) * 0.15 + 0.85;

    ctx.save();

    // Glowing arch threshold
    ctx.shadowColor = theme.accent || '#38bdf8';
    ctx.shadowBlur = 14 * pulse;

    // Stone pillars
    ctx.fillStyle = theme.wallTop || '#475569';
    ctx.fillRect(screen.x + tileSize * 0.1, screen.y + tileSize * 0.15, tileSize * 0.18, tileSize * 0.75);
    ctx.fillRect(screen.x + tileSize * 0.72, screen.y + tileSize * 0.15, tileSize * 0.18, tileSize * 0.75);

    // Arch keystone top
    ctx.fillStyle = theme.wall || '#334155';
    ctx.fillRect(screen.x + tileSize * 0.08, screen.y + tileSize * 0.08, tileSize * 0.84, tileSize * 0.2);

    // Luminous doorway
    const portalGrad = ctx.createLinearGradient(cx, screen.y + tileSize * 0.28, cx, screen.y + tileSize * 0.9);
    portalGrad.addColorStop(0, '#ffffff');
    portalGrad.addColorStop(0.5, theme.accent || '#38bdf8');
    portalGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = portalGrad;
    ctx.fillRect(screen.x + tileSize * 0.28, screen.y + tileSize * 0.28, tileSize * 0.44, tileSize * 0.62);

    ctx.restore();
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
   * Spawn expanding shockwave ring (e.g. lever activation or door unlock)
   * @param {number} worldX
   * @param {number} worldY
   * @param {string} [color='#34d399']
   * @param {number} [maxRadius=36]
   */
  spawnShockwave(worldX, worldY, color = '#34d399', maxRadius = 36) {
    this.shockwaves.push({
      x: worldX,
      y: worldY,
      color,
      radius: 4,
      maxRadius,
      life: 1.0,
    });
  }

  /**
   * Spawn floating text rising above a tile/entity
   * @param {number} worldX
   * @param {number} worldY
   * @param {string} text
   * @param {string} [color='#ffffff']
   */
  spawnFloatingText(worldX, worldY, text, color = '#ffffff') {
    this.floatingTexts.push({
      x: worldX,
      y: worldY - 8,
      text,
      color,
      life: 1.0,
      vy: -28,
    });
  }

  /**
   * Update all particle, shockwave, and floating text lifetimes
   * @param {number} dt
   */
  updateEffects(dt) {
    // 1. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // 2. Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * Math.min(1, dt * 8);
      sw.life -= dt * 2.2;
      if (sw.life <= 0) this.shockwaves.splice(i, 1);
    }

    // 3. Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt * 0.9;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  /**
   * Render all world effects (particles, shockwaves, floating text)
   * @param {CanvasRenderingContext2D} ctx
   * @param {Camera} camera
   */
  renderWorldEffects(ctx, camera) {
    // 1. Shockwaves
    if (this.shockwaves.length > 0) {
      ctx.save();
      for (const sw of this.shockwaves) {
        const screen = camera.worldToScreen(sw.x, sw.y);
        ctx.globalAlpha = Math.max(0, sw.life * 0.85);
        ctx.strokeStyle = sw.color;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = Math.max(2, sw.life * 3.5);
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Particles
    if (this.particles.length > 0) {
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

    // 3. Floating In-World Text
    if (this.floatingTexts.length > 0) {
      ctx.save();
      for (const ft of this.floatingTexts) {
        const screen = camera.worldToScreen(ft.x, ft.y);
        const alpha = Math.min(1, ft.life * 1.5);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // Dark text outline for readability against bright tiles
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, screen.x, screen.y);

        // Bright fill color
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, screen.x, screen.y);
      }
      ctx.restore();
    }
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
