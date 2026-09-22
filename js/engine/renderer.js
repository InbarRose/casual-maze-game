/**
 * 2D Canvas Game Renderer
 * Multi-layer rendering pipeline (Ground -> Entities -> Overhead Bridges -> Player -> Fog -> Particles)
 */

import { TILES, THEMES, ELEVATION, FOG_STATE, ENTITY_TYPES } from '../core/constants.js';
import { assetLoader } from '../core/asset-loader.js';

export class GameRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.perspective = 'angled'; // 'angled' | 'topdown'
    this.particles = [];
    this.ambientParticles = [];
    this.maxAmbientParticles = 35;
    this.floatingTexts = [];
    this.shockwaves = [];
    this.exitPulseTimer = 0;
  }

  /**
   * Helper to retrieve cached vector asset image from AssetLoader
   * @param {string} idOrPath
   * @returns {HTMLImageElement|null}
   */
  getAssetImage(idOrPath) {
    return assetLoader.getImage(idOrPath);
  }

  /**
   * Switch perspective mode ('angled' | 'topdown')
   * @param {'angled'|'topdown'} mode
   */
  setPerspective(mode) {
    if (mode === 'angled' || mode === 'topdown') {
      this.perspective = mode;
    }
  }

  /**
   * Main render method
   * @param {object} level
   * @param {Player} player
   * @param {Array<Key|Door|Lever|Teleporter|TimedHazard|Patroller|PuzzleGate>} entities
   * @param {Camera} camera
   * @param {FogOfWar} fog
   * @param {number} dt
   * @param {{ x: number, y: number, time: number }|null} [clickTarget=null]
   * @param {Set<string>|Array<string>} [revealedSecrets=null]
   */
  render(level, player, entities, camera, fog, dt = 0, clickTarget = null, revealedSecrets = null) {
    const ctx = this.ctx;
    const tileSize = camera.tileSize;
    const { width: mazeW, height: mazeH } = level.dimensions;
    const theme = THEMES[level.config.theme] || THEMES.dungeon;
    if (!this.perspective) {
      this.perspective = level.config.viewPerspective || 'angled';
    }

    this.exitPulseTimer += dt * 3;
    this.updateEffects(dt, level, camera);

    // 1. Clear background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Viewport bounds (performance budget optimization: only iterate visible tiles)
    const bounds = camera.getViewportBounds(mazeW, mazeH, 2);

    // Apply smooth unified canvas rotation during camera rotation transition
    const isRotating = camera && typeof camera.isRotating === 'function' && camera.isRotating();
    if (isRotating) {
      let deltaDeg = (camera.rotation - camera.targetRotation) % 360;
      if (deltaDeg > 180) deltaDeg -= 360;
      if (deltaDeg < -180) deltaDeg += 360;
      const deltaRad = (deltaDeg * Math.PI) / 180;

      ctx.save();
      ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      ctx.rotate(-deltaRad);
      ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    }

    if (this.perspective === 'angled') {
      this.renderAngledPipeline(level, player, entities, camera, fog, bounds, theme, tileSize, revealedSecrets);
    } else {
      this.renderClassicPipeline(level, player, entities, camera, fog, bounds, theme, tileSize, revealedSecrets);
    }

    // Render Destination Click Ring
    if (clickTarget && clickTarget.time) {
      this.renderClickTarget(ctx, camera, clickTarget, tileSize);
    }

    // Render Particle Effects, Shockwaves, and In-World Floating Text
    this.renderWorldEffects(ctx, camera);

    if (isRotating) {
      ctx.restore();
    }
  }

  /**
   * Distinct Architectural Blueprint Pipeline (Minimal Top-Down Technical Drafting Mode — BL-44)
   */
  renderClassicPipeline(level, player, entities, camera, fog, bounds, theme, tileSize, revealedSecrets = null) {
    const ctx = this.ctx;
    const blueprintTheme = THEMES.blueprint || theme;

    // 1. Technical blueprint background with precision drafting sub-grid and CAD markings
    this.renderBlueprintBackdrop(ctx, level, bounds, camera, blueprintTheme, tileSize);

    // 2. Blueprint ground corridors & technical wall drafting with 45° crosshatching
    this.renderBlueprintGroundLayer(ctx, level, bounds, camera, blueprintTheme, tileSize, revealedSecrets);

    // 3. Spawns, Exits, and Mechanisms
    if (level.spawn) this.renderSpawnEntrance(ctx, level, camera, blueprintTheme, fog);
    if (level.exit) this.renderExit(ctx, level, camera, blueprintTheme, fog);

    this.renderEntities(ctx, entities, ELEVATION.GROUND, camera, fog);
    this.renderBlueprintOverheadLayer(ctx, level, bounds, camera, blueprintTheme, tileSize);
    this.renderEntities(ctx, entities, ELEVATION.OVERHEAD, camera, fog);

    const playerScreen = camera.worldToScreen(player.worldX, player.worldY, true);
    if (player.hasTorch && player.hasTorch()) {
      ctx.save();
      const pulse = Math.sin(this.exitPulseTimer * 1.5) * 0.1 + 0.9;
      const torchRadius = tileSize * 1.5 * pulse;
      const grad = ctx.createRadialGradient(playerScreen.x, playerScreen.y, tileSize * 0.15, playerScreen.x, playerScreen.y, torchRadius);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(playerScreen.x, playerScreen.y, torchRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const angle = camera ? camera.getDiscreteRotation() : 0;
    player.render(ctx, playerScreen.x, playerScreen.y, tileSize, this.perspective, angle);

    if (level.config.fogOfWar && fog) {
      this.renderFogOfWar(ctx, fog, bounds, camera, blueprintTheme, player, entities, level);
    }
  }

  /**
   * Technical Blueprint Drafting Backdrop
   */
  renderBlueprintBackdrop(ctx, level, bounds, camera, theme, tileSize) {
    ctx.save();
    ctx.fillStyle = theme.bg || '#0a192f';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Precision drafting sub-grid
    const subGrid = Math.max(8, tileSize / 4);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 0.5;
    if (ctx.beginPath && ctx.moveTo && ctx.lineTo) {
      ctx.beginPath();
      for (let x = 0; x <= this.canvas.width; x += subGrid) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.canvas.height);
      }
      for (let y = 0; y <= this.canvas.height; y += subGrid) {
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width, y);
      }
      if (ctx.stroke) ctx.stroke();
    }

    // Blueprint schematic header
    if (ctx.fillText) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('ARCHITECTURAL CAD BLUEPRINT // TOP-DOWN SCHEMATIC', 14, 20);
    }
    ctx.restore();
  }

  /**
   * Technical Blueprint Ground Layer with 45° crosshatch solid walls and schematic doorways
   */
  renderBlueprintGroundLayer(ctx, level, bounds, camera, theme, tileSize, revealedSecrets) {
    const ground = level.layers.ground;
    const isSecretRevealed = (x, y) => revealedSecrets && (
      (typeof revealedSecrets.has === 'function' && revealedSecrets.has(`${x},${y}`)) ||
      (Array.isArray(revealedSecrets) && revealedSecrets.includes(`${x},${y}`))
    );

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const tile = ground[y]?.[x];
        const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);

        if (tile === TILES.WALL || tile === TILES.SECRET_WALL) {
          const isSecret = tile === TILES.SECRET_WALL;
          const revealed = isSecret && isSecretRevealed(x, y);

          if (isSecret && revealed) {
            // Revealed Secret Passage: open dashed doorway
            ctx.fillStyle = '#0f2744';
            ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            if (ctx.setLineDash) ctx.setLineDash([3, 3]);
            if (ctx.strokeRect) ctx.strokeRect(screen.x + 2, screen.y + 2, tileSize - 4, tileSize - 4);
            if (ctx.setLineDash) ctx.setLineDash([]);

            if (ctx.fillText) {
              ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
              ctx.font = `${Math.round(tileSize * 0.42)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('✨', screen.x + tileSize / 2, screen.y + tileSize / 2);
            }
          } else {
            // Solid Masonry Wall with 45-degree Engineering Hatching
            ctx.fillStyle = '#0f223a';
            ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

            ctx.save();
            if (ctx.beginPath && ctx.rect && ctx.clip) {
              ctx.beginPath();
              ctx.rect(screen.x, screen.y, tileSize, tileSize);
              ctx.clip();
            }

            ctx.strokeStyle = isSecret ? 'rgba(56, 189, 248, 0.32)' : 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 1;
            const step = Math.max(6, tileSize / 4);
            if (ctx.beginPath && ctx.moveTo && ctx.lineTo) {
              ctx.beginPath();
              for (let offset = -tileSize; offset <= tileSize * 2; offset += step) {
                ctx.moveTo(screen.x + offset, screen.y);
                ctx.lineTo(screen.x + offset + tileSize, screen.y + tileSize);
              }
              if (ctx.stroke) ctx.stroke();

              // Subtle telltale fracture on unrevealed secret wall
              if (isSecret) {
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(screen.x + tileSize * 0.42, screen.y + tileSize * 0.2);
                ctx.lineTo(screen.x + tileSize * 0.54, screen.y + tileSize * 0.52);
                ctx.lineTo(screen.x + tileSize * 0.45, screen.y + tileSize * 0.82);
                if (ctx.stroke) ctx.stroke();
              }
            }

            ctx.restore();

            // Crisp drafting outer line
            ctx.strokeStyle = isSecret ? 'rgba(56, 189, 248, 0.85)' : '#38bdf8';
            ctx.lineWidth = 1.2;
            if (ctx.strokeRect) ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);
          }
        } else {
          // Corridor floor cell
          ctx.fillStyle = ((x + y) % 2 === 0) ? '#0a1d35' : '#08172c';
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

          // Sub-grid outline
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.lineWidth = 0.5;
          if (ctx.strokeRect) ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);

          // Center coordinate tick mark '+'
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 1;
          const cx = screen.x + tileSize / 2;
          const cy = screen.y + tileSize / 2;
          const tick = Math.min(3, tileSize * 0.1);
          if (ctx.beginPath && ctx.moveTo && ctx.lineTo) {
            ctx.beginPath();
            ctx.moveTo(cx - tick, cy);
            ctx.lineTo(cx + tick, cy);
            ctx.moveTo(cx, cy - tick);
            ctx.lineTo(cx, cy + tick);
            if (ctx.stroke) ctx.stroke();
          }

          // Bridge underpass in blueprint mode
          if (tile === TILES.BRIDGE_EW || tile === TILES.BRIDGE_NS) {
            const angle = camera ? camera.getDiscreteRotation() : 0;
            const isRotated90or270 = angle === 90 || angle === 270;
            const isHoriz = (tile === TILES.BRIDGE_EW) ? !isRotated90or270 : isRotated90or270;

            ctx.fillStyle = '#061324';
            ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
            ctx.lineWidth = 1;
            if (ctx.setLineDash) ctx.setLineDash([3, 2]);
            if (ctx.beginPath && ctx.moveTo && ctx.lineTo) {
              ctx.beginPath();
              if (isHoriz) {
                ctx.moveTo(screen.x, screen.y + tileSize * 0.2);
                ctx.lineTo(screen.x + tileSize, screen.y + tileSize * 0.2);
                ctx.moveTo(screen.x, screen.y + tileSize * 0.8);
                ctx.lineTo(screen.x + tileSize, screen.y + tileSize * 0.8);
              } else {
                ctx.moveTo(screen.x + tileSize * 0.2, screen.y);
                ctx.lineTo(screen.x + tileSize * 0.2, screen.y + tileSize);
                ctx.moveTo(screen.x + tileSize * 0.8, screen.y);
                ctx.lineTo(screen.x + tileSize * 0.8, screen.y + tileSize);
              }
              if (ctx.stroke) ctx.stroke();
            }
            if (ctx.setLineDash) ctx.setLineDash([]);
          }
        }
      }
    }
  }

  /**
   * Blueprint Overhead Layer (Bridges & Ramps)
   */
  renderBlueprintOverheadLayer(ctx, level, bounds, camera, theme, tileSize) {
    const overhead = level.layers.overhead;
    const ground = level.layers.ground;
    if (!overhead && !ground) return;

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const tile = overhead?.[y]?.[x] || ground?.[y]?.[x];
        const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);

        if (tile === TILES.BRIDGE_EW || tile === TILES.BRIDGE_NS) {
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(screen.x + 2, screen.y + 2, tileSize - 4, tileSize - 4);

          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 1.5;
          if (ctx.strokeRect) ctx.strokeRect(screen.x + 2, screen.y + 2, tileSize - 4, tileSize - 4);

          if (ctx.fillText) {
            ctx.fillStyle = '#7dd3fc';
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('L1', screen.x + tileSize / 2, screen.y + tileSize / 2);
          }
        } else if (this.isRampTile(tile)) {
          this.renderRamp(ctx, tile, screen.x, screen.y, tileSize, theme, camera);
        }
      }
    }
  }

  /**
   * Angled 2.5D Top-Down Sprite Pipeline with depth wall faces, pillars, and height lift
   */
  renderAngledPipeline(level, player, entities, camera, fog, bounds, theme, tileSize, revealedSecrets = null) {
    const ctx = this.ctx;
    const heightOffset = Math.round(tileSize * 0.45);

    // 1. Thematic Ambient Backdrop
    this.renderThematicBackdrop(ctx, level, bounds, camera, theme, tileSize);

    // 2. Ground Floors
    this.renderAngledFloors(ctx, level, bounds, camera, theme);

    // 3. Spawn Entrance & Exit Markers
    if (level.spawn) this.renderSpawnEntrance(ctx, level, camera, theme, fog);
    if (level.exit) this.renderExit(ctx, level, camera, theme, fog);

    // 4. Ground Layer Unified Interleaved Y-Sorted Pass (Walls, Entities, Player)
    // Resolves BL-33: character and moving entities are correctly occluded by walls to their south.
    this.renderAngledGroundLayerInterleaved(ctx, level, bounds, camera, theme, entities, player, fog, tileSize, revealedSecrets);

    // 5. Overhead Bridges & Ramps with vertical lift and support pillars
    this.renderAngledOverheadLayer(ctx, level, bounds, camera, theme, heightOffset);

    // 6. Overhead Entities & Player (if player overhead) with Y-sorting
    this.renderYSortedEntities(ctx, entities, player, ELEVATION.OVERHEAD, camera, fog, tileSize, heightOffset);

    // 9. Fog-of-War Mask with dynamic lighting gradients (BL-12)
    if (level.config.fogOfWar && fog) {
      this.renderFogOfWar(ctx, fog, bounds, camera, theme, player, entities, level);
    }
  }

  /**
   * Render ground floor tiles only in angled mode
   */
  renderAngledFloors(ctx, level, bounds, camera, theme) {
    const ground = level.layers.ground;
    const tileSize = camera.tileSize;
    const angle = camera ? camera.getDiscreteRotation() : 0;
    const isRotated90or270 = angle === 90 || angle === 270;
    const themeKey = theme.id || level.config?.theme || 'dungeon';

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const tile = ground[y]?.[x];
        if (tile === TILES.WALL) continue; // Walls drawn in wall pass

        const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);

        // Check for vector SVG floor asset (plain or cracked variation)
        const isCracked = ((x * 13 + y * 7) % 17 === 0);
        const variationId = isCracked ? `tile_floor_${themeKey}_cracked` : `tile_floor_${themeKey}`;
        const floorImg = this.getAssetImage(variationId) || this.getAssetImage(`tile_floor_${themeKey}`) || this.getAssetImage('tile_floor_generic');

        if (floorImg) {
          ctx.drawImage(floorImg, screen.x, screen.y, tileSize, tileSize);
        } else {
          const isAlt = (x + y) % 2 === 0;
          ctx.fillStyle = isAlt ? theme.floorAlt : theme.floor;
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
        }

        ctx.strokeStyle = theme.floorGrid || 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);

        // Bridge underpass tunnels
        if (tile === TILES.BRIDGE_EW || tile === TILES.BRIDGE_NS) {
          const isHorizUnderpass = (tile === TILES.BRIDGE_EW) ? !isRotated90or270 : isRotated90or270;
          ctx.fillStyle = theme.bridgeGround;
          if (isHorizUnderpass) {
            ctx.fillRect(screen.x, screen.y + tileSize * 0.12, tileSize, tileSize * 0.76);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(screen.x, screen.y + tileSize * 0.12, tileSize, tileSize * 0.1);
            ctx.fillRect(screen.x, screen.y + tileSize * 0.78, tileSize, tileSize * 0.1);
          } else {
            ctx.fillRect(screen.x + tileSize * 0.12, screen.y, tileSize * 0.76, tileSize);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(screen.x + tileSize * 0.12, screen.y, tileSize * 0.1, tileSize);
            ctx.fillRect(screen.x + tileSize * 0.78, screen.y, tileSize * 0.1, tileSize);
          }
        }
      }
    }
  }

  /**
   * Unified Y-sorted rendering pass for ground layer walls, entities, and player
   * Resolves BL-33: character and moving entities are correctly occluded by walls to their south.
   */
  renderAngledGroundLayerInterleaved(ctx, level, bounds, camera, theme, entities, player, fog, tileSize, revealedSecrets = null) {
    const ground = level.layers.ground;
    const drawables = [];
    const themeKey = level.config.theme || 'dungeon';
    const seed = (level.id ? String(level.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : 42);

    // 1. Collect all visible ground walls (and secret walls)
    const halfTile = tileSize / 2;
    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const tile = ground[y]?.[x];
        if (tile === TILES.WALL || tile === TILES.SECRET_WALL) {
          const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);
          const center = camera.worldToScreen(x * tileSize + halfTile, y * tileSize + halfTile, true);
          drawables.push({
            type: 'wall',
            x,
            y,
            screen,
            isSecret: tile === TILES.SECRET_WALL,
            sortY: center.y + halfTile,
            sortX: center.x,
          });
        }
      }
    }

    // 2. Collect visible ground entities
    for (const entity of entities) {
      if ((entity.elevation ?? 0) !== ELEVATION.GROUND) continue;

      if (fog) {
        let isEntityVisible = fog.isVisible(Math.round(entity.x), Math.round(entity.y));
        if (!isEntityVisible && entity.type === ENTITY_TYPES.WALL_DECOR) {
          const fx = entity.facing === 'east' ? 1 : (entity.facing === 'west' ? -1 : 0);
          const fy = entity.facing === 'south' ? 1 : (entity.facing === 'north' ? -1 : 0);
          const adjX = Math.round(entity.x) + fx;
          const adjY = Math.round(entity.y) + fy;
          if (fog.isVisible(adjX, adjY) || fog.isExplored(adjX, adjY)) {
            isEntityVisible = true;
          }
        }
        if (!isEntityVisible) continue;
      }

      const isContinuous = entity.worldX !== undefined && entity.worldY !== undefined;
      const worldX = isContinuous ? entity.worldX : (entity.x * tileSize + tileSize / 2);
      const worldY = isContinuous ? entity.worldY : (entity.y * tileSize + tileSize / 2);
      const screen = camera.worldToScreen(worldX, worldY, true);

      // Foot anchor in screen space:
      const sortY = screen.y + tileSize * 0.35;

      drawables.push({
        type: 'entity',
        ref: entity,
        screen,
        sortY,
        sortX: screen.x,
      });
    }

    // 3. Include player if on ground elevation
    if (player.elevation === ELEVATION.GROUND) {
      const screen = camera.worldToScreen(player.worldX, player.worldY, true);
      // Player center is at screen.y; feet baseline is at screen.y + 11 * (tileSize / 32) ~= screen.y + tileSize * 0.344
      const sortY = screen.y + tileSize * 0.344;
      drawables.push({
        type: 'player',
        ref: player,
        screen,
        sortY,
        sortX: screen.x,
      });
    }

    // 4. Sort ascending by sortY (back to front in screen space)
    drawables.sort((a, b) => {
      if (Math.abs(a.sortY - b.sortY) > 0.01) {
        return a.sortY - b.sortY;
      }
      return a.sortX - b.sortX;
    });

    // 5. Render sorted items
    for (const item of drawables) {
      if (item.type === 'wall') {
        this.renderAngledWall(ctx, item.x, item.y, item.screen.x, item.screen.y, tileSize, theme, ground, camera, item.isSecret, revealedSecrets);
        this.renderThematicPerimeterDecorTile(ctx, item.x, item.y, item.screen.x, item.screen.y, tileSize, themeKey, seed, ground, 0);
      } else if (item.type === 'player') {
        const screen = item.screen;
        if (player.hasTorch && player.hasTorch()) {
          ctx.save();
          const pulse = Math.sin(this.exitPulseTimer * 1.5) * 0.1 + 0.9;
          const torchRadius = tileSize * 1.5 * pulse;
          const grad = ctx.createRadialGradient(screen.x, screen.y, tileSize * 0.15, screen.x, screen.y, torchRadius);
          grad.addColorStop(0, 'rgba(251, 146, 60, 0.4)');
          grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.15)');
          grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, torchRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        const angle = camera ? camera.getDiscreteRotation() : 0;
        player.render(ctx, screen.x, screen.y, tileSize, this.perspective, angle);
      } else {
        const entity = item.ref;
        const isContinuous = entity.worldX !== undefined && entity.worldY !== undefined;
        const screen = isContinuous ? item.screen : (camera.tileToScreen ? camera.tileToScreen(entity.x, entity.y) : camera.worldToScreen(entity.x * tileSize, entity.y * tileSize, true));
        entity.render(ctx, screen.x, screen.y, tileSize, this.perspective);
      }
    }
  }

  /**
   * Render walls with 2.5D top cap, front vertical drop face, and masonry relief
   */
  renderAngledWalls(ctx, level, bounds, camera, theme) {
    const ground = level.layers.ground;
    const tileSize = camera.tileSize;

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        if (ground[y]?.[x] === TILES.WALL) {
          const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);
          this.renderAngledWall(ctx, x, y, screen.x, screen.y, tileSize, theme, ground, camera);
        }
      }
    }
  }

  /**
   * Render single 2.5D wall block with front drop face and bevels relative to active camera rotation
   */
  renderAngledWall(ctx, x, y, screenX, screenY, tileSize, theme, ground, camera, isSecret = false, revealedSecrets = null) {
    const wallH = Math.round(tileSize * 0.38); // e.g. 12px for 32px tile
    const angle = camera ? camera.getDiscreteRotation() : 0;
    const themeKey = theme?.id || 'dungeon';
    const wallImg = this.getAssetImage(`tile_wall_${themeKey}`) || this.getAssetImage('tile_wall_dungeon');

    const isSecretRevealed = isSecret && revealedSecrets && (
      (typeof revealedSecrets.has === 'function' && revealedSecrets.has(`${x},${y}`)) ||
      (Array.isArray(revealedSecrets) && revealedSecrets.includes(`${x},${y}`))
    );

    if (isSecret && isSecretRevealed) {
      // Ethereal translucent secret archway
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(screenX, screenY - wallH, tileSize, tileSize + wallH);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(screenX + 1, screenY - wallH + 1, tileSize - 2, tileSize + wallH - 2);
      ctx.setLineDash([]);

      ctx.fillStyle = '#38bdf8';
      ctx.font = `${Math.round(tileSize * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', screenX + tileSize / 2, screenY + (tileSize - wallH) / 2);
      ctx.restore();
      return;
    }

    const isWallTile = (tile) => tile === TILES.WALL || tile === TILES.SECRET_WALL;

    let hasFrontWall, hasLeftWall, hasRightWall;
    if (angle === 90) {
      // East is UP, West is DOWN (Front)
      hasFrontWall = isWallTile(ground[y]?.[x - 1]);
      hasLeftWall = isWallTile(ground[y - 1]?.[x]);
      hasRightWall = isWallTile(ground[y + 1]?.[x]);
    } else if (angle === 180) {
      // South is UP, North is DOWN (Front)
      hasFrontWall = isWallTile(ground[y - 1]?.[x]);
      hasLeftWall = isWallTile(ground[y]?.[x + 1]);
      hasRightWall = isWallTile(ground[y]?.[x - 1]);
    } else if (angle === 270) {
      // West is UP, East is DOWN (Front)
      hasFrontWall = isWallTile(ground[y]?.[x + 1]);
      hasLeftWall = isWallTile(ground[y + 1]?.[x]);
      hasRightWall = isWallTile(ground[y - 1]?.[x]);
    } else {
      // 0 deg: North is UP, South is DOWN (Front)
      hasFrontWall = isWallTile(ground[y + 1]?.[x]);
      hasLeftWall = isWallTile(ground[y]?.[x - 1]);
      hasRightWall = isWallTile(ground[y]?.[x + 1]);
    }

    // 1. Top Cap Face (Elevated by wallH)
    if (wallImg) {
      ctx.drawImage(wallImg, 0, 0, 64, 18, screenX, screenY - wallH, tileSize, tileSize);
    } else {
      ctx.fillStyle = theme.wallTop;
      ctx.fillRect(screenX, screenY - wallH, tileSize, tileSize);

      // Top highlight rim
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(screenX, screenY - wallH, tileSize, 2);
    }

    // 2. Front Face (Facing downward towards camera view)
    if (!hasFrontWall) {
      if (wallImg) {
        ctx.drawImage(wallImg, 0, 18, 64, 42, screenX, screenY - wallH + tileSize, tileSize, wallH);
      } else {
        // Main vertical front face
        ctx.fillStyle = theme.wall;
        ctx.fillRect(screenX, screenY - wallH + tileSize, tileSize, wallH);

        // Horizontal masonry mortar line
        ctx.fillStyle = theme.wallDetail || 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(screenX, screenY - wallH + tileSize + wallH * 0.5, tileSize, 1.5);

        // Vertical brick divider
        const brickSplit = (x % 2 === 0) ? 0.35 : 0.65;
        ctx.fillRect(screenX + tileSize * brickSplit, screenY - wallH + tileSize, 1.5, wallH * 0.5);
        ctx.fillRect(screenX + tileSize * (1 - brickSplit), screenY - wallH + tileSize + wallH * 0.5, 1.5, wallH * 0.5);
      }

      // Shadow cast onto floor beneath
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(screenX, screenY + tileSize, tileSize, wallH * 0.35);
    }

    // 3. Side vertical depth bevels
    if (!hasRightWall) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(screenX + tileSize - 2, screenY - wallH, 2, tileSize + (hasFrontWall ? 0 : wallH));
    }
    if (!hasLeftWall) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(screenX, screenY - wallH, 2, tileSize + (hasFrontWall ? 0 : wallH));
    }

    // Top border stroke
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX, screenY - wallH, tileSize, tileSize);

    // Subtle telltale fracture & faint shimmering particle on unrevealed secret wall
    if (isSecret && !isSecretRevealed) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(screenX + tileSize * 0.45, screenY - wallH + tileSize * 0.2);
      ctx.lineTo(screenX + tileSize * 0.55, screenY - wallH + tileSize * 0.55);
      ctx.lineTo(screenX + tileSize * 0.48, screenY - wallH + tileSize * 0.85);
      ctx.stroke();

      const pulse = Math.sin(this.exitPulseTimer * 2) * 0.15 + 0.25;
      ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
      ctx.beginPath();
      ctx.arc(screenX + tileSize * 0.55, screenY - wallH + tileSize * 0.55, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Translate ramp tile to screen orientation based on camera rotation
   * @param {string} rampTile
   * @param {number} angle
   * @returns {string}
   */
  getScreenRampTile(rampTile, angle = 0) {
    if (angle === 0) return rampTile;
    const rampOrder = [TILES.RAMP_N, TILES.RAMP_E, TILES.RAMP_S, TILES.RAMP_W];
    const idx = rampOrder.indexOf(rampTile);
    if (idx === -1) return rampTile;
    const shift = (4 - (Math.round(angle / 90) % 4)) % 4;
    return rampOrder[(idx + shift) % 4];
  }

  /**
   * Render Overhead Layer in Angled 2.5D Mode with vertical lift and support pillars
   */
  renderAngledOverheadLayer(ctx, level, bounds, camera, theme, heightOffset) {
    const overhead = level.layers.overhead;
    const ground = level.layers.ground;
    const tileSize = camera.tileSize;
    const angle = camera ? camera.getDiscreteRotation() : 0;
    const isRotated90or270 = angle === 90 || angle === 270;

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const overTile = overhead?.[y]?.[x];
        const gTile = ground?.[y]?.[x];
        const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);

        // Render Ramps connecting ground to elevated deck
        if (this.isRampTile(gTile)) {
          const screenRamp = this.getScreenRampTile(gTile, angle);
          this.renderAngledRamp(ctx, screenRamp, screen.x, screen.y, tileSize, theme, heightOffset);
        }

        // Render Overhead Bridges
        if (overTile === TILES.BRIDGE_EW || gTile === TILES.BRIDGE_EW) {
          const dir = isRotated90or270 ? 'EW' : 'NS';
          this.renderAngledBridgeSpan(ctx, dir, screen.x, screen.y, tileSize, theme, heightOffset);
        } else if (overTile === TILES.BRIDGE_NS || gTile === TILES.BRIDGE_NS) {
          const dir = isRotated90or270 ? 'NS' : 'EW';
          this.renderAngledBridgeSpan(ctx, dir, screen.x, screen.y, tileSize, theme, heightOffset);
        }
      }
    }
  }

  /**
   * Render elevated bridge span with support pillars anchored to the ground
   */
  renderAngledBridgeSpan(ctx, direction, screenX, screenY, tileSize, theme, heightOffset) {
    ctx.save();
    const elevatedY = screenY - heightOffset;

    // 1. Directional drop shadow onto ground below (BL-13)
    // Elevated bridge deck at Z=1 casts angled shadow with umbra and penumbra
    const shadowOffsetX = Math.round(tileSize * 0.08);
    const shadowOffsetY = Math.round(heightOffset * 0.42);

    if (direction === 'NS') {
      // Soft ambient penumbra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(
        screenX + tileSize * 0.12 + shadowOffsetX - 2,
        screenY + shadowOffsetY - 2,
        tileSize * 0.76 + 4,
        tileSize + 4
      );
      // Core directional umbra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.fillRect(
        screenX + tileSize * 0.12 + shadowOffsetX,
        screenY + shadowOffsetY,
        tileSize * 0.76,
        tileSize
      );
    } else {
      // Soft ambient penumbra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(
        screenX + shadowOffsetX - 2,
        screenY + tileSize * 0.12 + shadowOffsetY - 2,
        tileSize + 4,
        tileSize * 0.76 + 4
      );
      // Core directional umbra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.fillRect(
        screenX + shadowOffsetX,
        screenY + tileSize * 0.12 + shadowOffsetY,
        tileSize,
        tileSize * 0.76
      );
    }

    // 2. Vertical Support Pillars
    ctx.fillStyle = theme.bridgeGround || '#1e293b';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    const pillarW = tileSize * 0.12;
    const pillarH = heightOffset + tileSize * 0.15;

    if (direction === 'NS') {
      const p1x = screenX + tileSize * 0.12;
      const p2x = screenX + tileSize * 0.76;
      const py = elevatedY + tileSize * 0.85;

      ctx.fillRect(p1x, py, pillarW, pillarH);
      ctx.strokeRect(p1x, py, pillarW, pillarH);
      ctx.fillRect(p2x, py, pillarW, pillarH);
      ctx.strokeRect(p2x, py, pillarW, pillarH);
    } else {
      const p1y = elevatedY + tileSize * 0.12;
      const p2y = elevatedY + tileSize * 0.76;
      const px = screenX + tileSize * 0.85;

      ctx.fillRect(px, p1y, pillarW, pillarH);
      ctx.strokeRect(px, p1y, pillarW, pillarH);
      ctx.fillRect(px, p2y, pillarW, pillarH);
      ctx.strokeRect(px, p2y, pillarW, pillarH);
    }

    // 3. Render bridge deck at elevated Y
    this.renderBridgeSpan(ctx, direction, screenX, elevatedY, tileSize, theme);

    ctx.restore();
  }

  /**
   * Render Ramp in angled mode with incline slope and elevation drop shadow (BL-13)
   */
  renderAngledRamp(ctx, rampTile, screenX, screenY, tileSize, theme, heightOffset) {
    ctx.save();

    // 1. Incline elevation shadow cast by rising ramp deck (BL-13)
    const shadowOffsetX = Math.round(tileSize * 0.08);
    const shadowOffsetY = Math.round(heightOffset * 0.35);

    if (typeof ctx.createLinearGradient === 'function') {
      let grad;
      if (rampTile === TILES.RAMP_N) {
        grad = ctx.createLinearGradient(screenX, screenY + tileSize, screenX, screenY);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
      } else if (rampTile === TILES.RAMP_S) {
        grad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + tileSize);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
      } else if (rampTile === TILES.RAMP_E) {
        grad = ctx.createLinearGradient(screenX, screenY, screenX + tileSize, screenY);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
      } else {
        grad = ctx.createLinearGradient(screenX + tileSize, screenY, screenX, screenY);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(screenX + shadowOffsetX, screenY + shadowOffsetY, tileSize, tileSize);
    }

    this.renderRamp(ctx, rampTile, screenX, screenY, tileSize, theme);

    // Side railing slope
    ctx.strokeStyle = theme.bridgeRailing || '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (rampTile === TILES.RAMP_N) {
      ctx.moveTo(screenX + tileSize * 0.1, screenY + tileSize);
      ctx.lineTo(screenX + tileSize * 0.1, screenY - heightOffset);
      ctx.moveTo(screenX + tileSize * 0.9, screenY + tileSize);
      ctx.lineTo(screenX + tileSize * 0.9, screenY - heightOffset);
    } else if (rampTile === TILES.RAMP_S) {
      ctx.moveTo(screenX + tileSize * 0.1, screenY);
      ctx.lineTo(screenX + tileSize * 0.1, screenY + tileSize - heightOffset);
      ctx.moveTo(screenX + tileSize * 0.9, screenY);
      ctx.lineTo(screenX + tileSize * 0.9, screenY + tileSize - heightOffset);
    }
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Unified Y-sorted rendering pass for entities and player
   */
  renderYSortedEntities(ctx, entities, player, elevation, camera, fog, tileSize, heightOffset) {
    const drawables = [];

    // Collect entities on this elevation
    for (const entity of entities) {
      if ((entity.elevation ?? 0) !== elevation) continue;

      if (fog) {
        let isEntityVisible = fog.isVisible(Math.round(entity.x), Math.round(entity.y));
        if (!isEntityVisible && entity.type === ENTITY_TYPES.WALL_DECOR) {
          const fx = entity.facing === 'east' ? 1 : (entity.facing === 'west' ? -1 : 0);
          const fy = entity.facing === 'south' ? 1 : (entity.facing === 'north' ? -1 : 0);
          const adjX = Math.round(entity.x) + fx;
          const adjY = Math.round(entity.y) + fy;
          if (fog.isVisible(adjX, adjY) || fog.isExplored(adjX, adjY)) {
            isEntityVisible = true;
          }
        }
        if (!isEntityVisible) continue;
      }

      const isContinuous = entity.worldX !== undefined && entity.worldY !== undefined;
      const worldX = isContinuous ? entity.worldX : (entity.x * tileSize + tileSize / 2);
      const worldY = isContinuous ? entity.worldY : (entity.y * tileSize + tileSize / 2);

      drawables.push({
        type: 'entity',
        ref: entity,
        worldX,
        worldY,
        bottomY: worldY + tileSize * 0.4,
      });
    }

    // Include player if matching elevation
    if (player.elevation === elevation) {
      drawables.push({
        type: 'player',
        ref: player,
        worldX: player.worldX,
        worldY: player.worldY,
        bottomY: player.worldY + tileSize * 0.4,
      });
    }

    // Compute screen coordinates and sort ascending by screen.y (back to front in screen space)
    for (const item of drawables) {
      item.screen = camera.worldToScreen(item.worldX, item.worldY, true);
    }
    drawables.sort((a, b) => a.screen.y - b.screen.y);

    // Render sorted
    for (const item of drawables) {
      if (item.type === 'player') {
        const screen = item.screen;
        if (player.hasTorch && player.hasTorch()) {
          ctx.save();
          const pulse = Math.sin(this.exitPulseTimer * 1.5) * 0.1 + 0.9;
          const torchRadius = tileSize * 1.5 * pulse;
          const grad = ctx.createRadialGradient(screen.x, screen.y - heightOffset, tileSize * 0.15, screen.x, screen.y - heightOffset, torchRadius);
          grad.addColorStop(0, 'rgba(251, 146, 60, 0.4)');
          grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.15)');
          grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(screen.x, screen.y - heightOffset, torchRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        const angle = camera ? camera.getDiscreteRotation() : 0;
        player.render(ctx, screen.x, screen.y - heightOffset, tileSize, this.perspective, angle);
      } else {
        const entity = item.ref;
        const isContinuous = entity.worldX !== undefined && entity.worldY !== undefined;
        const screen = isContinuous ? item.screen : camera.worldToScreen(entity.x * tileSize, entity.y * tileSize, true);
        entity.render(ctx, screen.x, screen.y - heightOffset, tileSize, this.perspective);
      }
    }
  }

  /**
   * Render Ground Layer (Floors, Walls, Bridge Underpasses)
   */
  renderGroundLayer(ctx, level, bounds, camera, theme) {
    const ground = level.layers.ground;
    const tileSize = camera.tileSize;
    const themeKey = theme?.id || level.config?.theme || 'dungeon';
    const wallImg = this.getAssetImage(`tile_wall_${themeKey}`) || this.getAssetImage('tile_wall_dungeon');

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const tile = ground[y]?.[x];
        const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);

        if (tile === TILES.WALL) {
          if (wallImg) {
            ctx.drawImage(wallImg, screen.x, screen.y, tileSize, tileSize);
          } else {
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
          }
        } else {
          // Check for vector SVG floor asset (plain or cracked variation)
          const isCracked = ((x * 13 + y * 7) % 17 === 0);
          const variationId = isCracked ? `tile_floor_${themeKey}_cracked` : `tile_floor_${themeKey}`;
          const floorImg = this.getAssetImage(variationId) || this.getAssetImage(`tile_floor_${themeKey}`) || this.getAssetImage('tile_floor_generic');

          if (floorImg) {
            ctx.drawImage(floorImg, screen.x, screen.y, tileSize, tileSize);
          } else {
            // Floor tile (checkerboard subtle tint)
            const isAlt = (x + y) % 2 === 0;
            ctx.fillStyle = isAlt ? theme.floorAlt : theme.floor;
            ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
          }

          // Floor grid outline
          ctx.strokeStyle = theme.floorGrid || 'rgba(255, 255, 255, 0.02)';
          ctx.lineWidth = 1;
          ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);

          // Bridge underpass tunnel styling on ground layer
          if (tile === TILES.BRIDGE_EW || tile === TILES.BRIDGE_NS) {
            const angle = camera ? camera.getDiscreteRotation() : 0;
            const isRotated90or270 = angle === 90 || angle === 270;
            const isHorizUnderpass = (tile === TILES.BRIDGE_EW) ? !isRotated90or270 : isRotated90or270;
            ctx.fillStyle = theme.bridgeGround;

            if (isHorizUnderpass) {
              ctx.fillRect(screen.x, screen.y + tileSize * 0.12, tileSize, tileSize * 0.76);
              ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
              ctx.fillRect(screen.x, screen.y + tileSize * 0.12, tileSize, tileSize * 0.1);
              ctx.fillRect(screen.x, screen.y + tileSize * 0.78, tileSize, tileSize * 0.1);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
              ctx.fillRect(screen.x + tileSize * 0.15, screen.y + tileSize * 0.48, tileSize * 0.7, 2);
            } else {
              ctx.fillRect(screen.x + tileSize * 0.12, screen.y, tileSize * 0.76, tileSize);
              ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
              ctx.fillRect(screen.x + tileSize * 0.12, screen.y, tileSize * 0.1, tileSize);
              ctx.fillRect(screen.x + tileSize * 0.78, screen.y, tileSize * 0.1, tileSize);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
              ctx.fillRect(screen.x + tileSize * 0.48, screen.y + tileSize * 0.15, 2, tileSize * 0.7);
            }
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
    const angle = camera ? camera.getDiscreteRotation() : 0;
    const isRotated90or270 = angle === 90 || angle === 270;

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const overTile = overhead?.[y]?.[x];
        const gTile = ground?.[y]?.[x];
        const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);

        // Render Ramps
        if (this.isRampTile(gTile)) {
          const screenRamp = this.getScreenRampTile(gTile, angle);
          this.renderRamp(ctx, screenRamp, screen.x, screen.y, tileSize, theme);
        }

        // Render Overhead Bridge
        if (overTile === TILES.BRIDGE_EW || gTile === TILES.BRIDGE_EW) {
          const dir = isRotated90or270 ? 'NS' : 'EW';
          this.renderBridgeSpan(ctx, dir, screen.x, screen.y, tileSize, theme);
        } else if (overTile === TILES.BRIDGE_NS || gTile === TILES.BRIDGE_NS) {
          const dir = isRotated90or270 ? 'EW' : 'NS';
          this.renderBridgeSpan(ctx, dir, screen.x, screen.y, tileSize, theme);
        }
      }
    }
  }

  /**
   * Render bridge walkway with drop shadow and wooden/metal planks & railings
   */
  renderBridgeSpan(ctx, direction, screenX, screenY, tileSize, theme) {
    ctx.save();

    // 1. Drop shadow onto ground below (BL-13)
    const shadowOffsetX = 4;
    const shadowOffsetY = 4;
    if (direction === 'NS') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(screenX + tileSize * 0.12 + shadowOffsetX - 2, screenY + shadowOffsetY - 2, tileSize * 0.76 + 4, tileSize + 4);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(screenX + tileSize * 0.12 + shadowOffsetX, screenY + shadowOffsetY, tileSize * 0.76, tileSize);
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(screenX + shadowOffsetX - 2, screenY + tileSize * 0.12 + shadowOffsetY - 2, tileSize + 4, tileSize * 0.76 + 4);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(screenX + shadowOffsetX, screenY + tileSize * 0.12 + shadowOffsetY, tileSize, tileSize * 0.76);
    }

    // Check for vector SVG bridge asset
    const themeKey = theme?.id || 'dungeon';
    const dirLower = direction.toLowerCase();
    const bridgeImg = this.getAssetImage(`tile_bridge_${themeKey}_${dirLower}`) || this.getAssetImage(`tile_bridge_generic_${dirLower}`);
    if (bridgeImg) {
      ctx.drawImage(bridgeImg, screenX, screenY, tileSize, tileSize);
      ctx.restore();
      return;
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

    const dirMap = {
      [TILES.RAMP_N]: 'north',
      [TILES.RAMP_S]: 'south',
      [TILES.RAMP_E]: 'east',
      [TILES.RAMP_W]: 'west',
    };
    const dir = dirMap[rampTile] || 'north';
    const themeKey = theme?.id || 'dungeon';
    const rampImg = this.getAssetImage(`tile_ramp_${themeKey}_${dir}`) || this.getAssetImage(`tile_ramp_${dir}`);
    if (rampImg) {
      ctx.drawImage(rampImg, screenX, screenY, tileSize, tileSize);
      ctx.restore();
      return;
    }

    // Seamless Architectural Stone Masonry Incline (BL-47)
    ctx.fillStyle = theme.ramp || '#334155';
    ctx.fillRect(screenX, screenY, tileSize, tileSize);

    const isNorth = rampTile === TILES.RAMP_N;
    const isSouth = rampTile === TILES.RAMP_S;
    const isEast = rampTile === TILES.RAMP_E;
    const isWest = rampTile === TILES.RAMP_W;
    const isVertical = isNorth || isSouth;

    // 1. Four graduated masonry stone tread slabs rising toward elevated bridge
    const numSteps = 4;
    const stepSize = tileSize / numSteps;

    for (let i = 0; i < numSteps; i++) {
      // Step index from 0 (lowest) to 3 (highest)
      let stepLevel = i;
      if (isNorth) stepLevel = (numSteps - 1) - i; // North is top: higher as Y decreases
      else if (isSouth) stepLevel = i;             // South is bottom: higher as Y increases
      else if (isEast) stepLevel = i;              // East is right: higher as X increases
      else if (isWest) stepLevel = (numSteps - 1) - i;

      // Tread color lightens progressively as elevation ascends toward bridge deck
      const elevationAlpha = 0.08 + stepLevel * 0.09;
      ctx.fillStyle = `rgba(255, 255, 255, ${elevationAlpha})`;

      if (isVertical) {
        const sy = screenY + i * stepSize;
        ctx.fillRect(screenX + tileSize * 0.12, sy, tileSize * 0.76, stepSize);

        // Riser shadow & highlight bevel
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.12, sy + stepSize);
        ctx.lineTo(screenX + tileSize * 0.88, sy + stepSize);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.12, sy);
        ctx.lineTo(screenX + tileSize * 0.88, sy);
        ctx.stroke();
      } else {
        const sx = screenX + i * stepSize;
        ctx.fillRect(sx, screenY + tileSize * 0.12, stepSize, tileSize * 0.76);

        // Riser shadow & highlight bevel
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx + stepSize, screenY + tileSize * 0.12);
        ctx.lineTo(sx + stepSize, screenY + tileSize * 0.88);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(sx, screenY + tileSize * 0.12);
        ctx.lineTo(sx, screenY + tileSize * 0.88);
        ctx.stroke();
      }
    }

    // 2. Dual Side Masonry Curbs (Aligns seamlessly with bridge railings)
    const curbColor = theme.bridgeRailing || '#64748b';
    ctx.fillStyle = curbColor;
    if (isVertical) {
      ctx.fillRect(screenX + tileSize * 0.08, screenY, tileSize * 0.06, tileSize);
      ctx.fillRect(screenX + tileSize * 0.86, screenY, tileSize * 0.06, tileSize);
    } else {
      ctx.fillRect(screenX, screenY + tileSize * 0.08, tileSize, tileSize * 0.06);
      ctx.fillRect(screenX, screenY + tileSize * 0.86, tileSize, tileSize * 0.06);
    }

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
      if (fog) {
        let isEntityVisible = fog.isVisible(Math.round(entity.x), Math.round(entity.y));
        if (!isEntityVisible && entity.type === ENTITY_TYPES.WALL_DECOR) {
          const fx = entity.facing === 'east' ? 1 : (entity.facing === 'west' ? -1 : 0);
          const fy = entity.facing === 'south' ? 1 : (entity.facing === 'north' ? -1 : 0);
          const adjX = Math.round(entity.x) + fx;
          const adjY = Math.round(entity.y) + fy;
          if (fog.isVisible(adjX, adjY) || fog.isExplored(adjX, adjY)) {
            isEntityVisible = true;
          }
        }
        if (!isEntityVisible) continue;
      }

      const isContinuous = entity.worldX !== undefined && entity.worldY !== undefined;
      const screen = isContinuous
        ? camera.worldToScreen(entity.worldX, entity.worldY, true)
        : (camera.tileToScreen ? camera.tileToScreen(entity.x, entity.y) : camera.worldToScreen(entity.x * tileSize, entity.y * tileSize, true));
      entity.render(ctx, screen.x, screen.y, tileSize, this.perspective);
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
    const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);
    const cx = screen.x + tileSize / 2;
    const cy = screen.y + tileSize / 2;

    // Check for vector SVG spawn / entrance asset
    let spawnAssetId = 'exit_stairs_up';
    if (style === 'portal') spawnAssetId = 'exit_portal';
    else if (style === 'archway') spawnAssetId = 'exit_archway';
    const spawnImg = this.getAssetImage(spawnAssetId);
    if (spawnImg) {
      ctx.save();
      ctx.drawImage(spawnImg, screen.x, screen.y, tileSize, tileSize);
      ctx.restore();
      return;
    }

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
   * Render Exit (Stairs up, Portal, Archway) supporting multiple exits
   */
  renderExit(ctx, level, camera, theme, fog) {
    const exitList = Array.isArray(level.exits) && level.exits.length > 0 ? level.exits : (level.exit ? [level.exit] : []);
    for (const exit of exitList) {
      const { x, y, style = 'portal', label } = exit;
      if (fog && !fog.isExplored(x, y)) continue;

      let exitAssetId = 'exit_portal';
      if (style === 'stairs' || style === 'stairs_up') exitAssetId = 'exit_stairs_up';
      else if (style === 'archway' || style === 'gate') exitAssetId = 'exit_archway';
      else if (style === 'treasure' || style === 'chest') exitAssetId = 'exit_treasure_chest';
      else if (style === 'shrine') exitAssetId = 'exit_shrine';

      const exitImg = this.getAssetImage(exitAssetId);
      if (exitImg) {
        const tileSize = camera.tileSize;
        const screen = camera.worldToScreen(x * tileSize, y * tileSize, true);
        const pulse = Math.sin(this.exitPulseTimer) * 0.15 + 0.85;
        ctx.save();
        ctx.shadowColor = theme.accent || '#38bdf8';
        ctx.shadowBlur = 12 * pulse;
        ctx.drawImage(exitImg, screen.x, screen.y, tileSize, tileSize);
        ctx.restore();
      } else {
        if (style === 'stairs' || style === 'stairs_up') {
          this.renderExitStairs(ctx, x, y, camera, theme);
        } else if (style === 'archway' || style === 'gate') {
          this.renderExitArchway(ctx, x, y, camera, theme);
        } else {
          this.renderExitPortal(ctx, x, y, camera, theme, fog);
        }
      }

      // If exit has a destination label (e.g. "To Catacombs"), render tooltip badge
      if (label) {
        const tileSize = camera.tileSize;
        const screen = camera.worldToScreen(x * tileSize + tileSize / 2, y * tileSize - 8, true);
        ctx.save();
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(screen.x - textWidth / 2 - 5, screen.y - 13, textWidth + 10, 16);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(screen.x - textWidth / 2 - 5, screen.y - 13, textWidth + 10, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(label, screen.x, screen.y - 1);
        ctx.restore();
      }
    }
  }

  /**
   * Render Ascending Exit Stairs with Golden Daylight Beam
   */
  renderExitStairs(ctx, exitX, exitY, camera, theme) {
    const tileSize = camera.tileSize;
    const screen = camera.tileToScreen ? camera.tileToScreen(exitX, exitY) : camera.worldToScreen(exitX * tileSize, exitY * tileSize, true);
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
    const screen = camera.tileToScreen ? camera.tileToScreen(exitX, exitY) : camera.worldToScreen(exitX * tileSize, exitY * tileSize, true);
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
    const screen = camera.tileToScreen ? camera.tileToScreen(exitX, exitY) : camera.worldToScreen(exitX * tileSize, exitY * tileSize, true);
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
   * Render Fog-of-War overlay mask with dynamic radial lighting gradients (BL-12)
   */
  renderFogOfWar(ctx, fog, bounds, camera, theme, player = null, entities = [], level = null) {
    const tileSize = camera.tileSize;

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        const vis = fog.getVisibility(x, y);
        const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);

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

    // Dynamic Radial Lighting & Torch Glow (BL-12)
    this.renderFogLightingGradients(ctx, fog, camera, theme, player, entities, level, tileSize);
  }

  /**
   * Render soft radial lighting falloff and torch glow halos under Fog of War (BL-12)
   * @param {CanvasRenderingContext2D} ctx
   * @param {FogOfWar} fog
   * @param {Camera} camera
   * @param {object} theme
   * @param {Player|null} player
   * @param {Array<object>} entities
   * @param {object|null} level
   * @param {number} tileSize
   */
  renderFogLightingGradients(ctx, fog, camera, theme, player, entities = [], level = null, tileSize = 32) {
    ctx.save();

    // 1. Explorer Radial Lighting Aura
    if (player && typeof player.worldX === 'number' && typeof player.worldY === 'number') {
      const hasTorch = typeof player.hasTorch === 'function' && player.hasTorch();
      const baseRadius = hasTorch ? tileSize * 3.8 : tileSize * 2.6;
      const flicker = 0.94 + Math.sin(this.exitPulseTimer * 2.5) * 0.06;
      const radius = baseRadius * flicker;

      const playerScreen = camera.worldToScreen(player.worldX, player.worldY, true);

      if (typeof ctx.createRadialGradient === 'function') {
        const lightGrad = ctx.createRadialGradient(
          playerScreen.x,
          playerScreen.y,
          tileSize * 0.2,
          playerScreen.x,
          playerScreen.y,
          radius
        );

        if (hasTorch) {
          lightGrad.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
          lightGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.2)');
          lightGrad.addColorStop(0.75, 'rgba(249, 115, 22, 0.08)');
          lightGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        } else {
          lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
          lightGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.1)');
          lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        }

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(playerScreen.x, playerScreen.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Placed Wall Torches & Carriable Torches
    if (entities && entities.length > 0) {
      for (const ent of entities) {
        const isTorch = (ent.type === ENTITY_TYPES.WALL_DECOR && ent.decorType === 'torch') ||
                        (ent.type === ENTITY_TYPES.COLLECTIBLE && ent.itemId === 'torch');
        if (!isTorch) continue;

        const ex = Math.round(ent.x);
        const ey = Math.round(ent.y);
        // Only glow if tile is visible or explored
        if (fog && !fog.isExplored(ex, ey) && !fog.isVisible(ex, ey)) continue;

        const screen = camera.worldToScreen(ent.x * tileSize + tileSize / 2, ent.y * tileSize + tileSize / 2, true);
        const seed = (ex * 17 + ey * 31);
        const flicker = 0.9 + Math.sin(this.exitPulseTimer * 3.2 + seed) * 0.1;
        const torchRadius = tileSize * 2.2 * flicker;

        if (typeof ctx.createRadialGradient === 'function') {
          const torchGrad = ctx.createRadialGradient(
            screen.x,
            screen.y,
            tileSize * 0.1,
            screen.x,
            screen.y,
            torchRadius
          );
          torchGrad.addColorStop(0, 'rgba(254, 215, 170, 0.5)');
          torchGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.25)');
          torchGrad.addColorStop(0.8, 'rgba(249, 115, 22, 0.08)');
          torchGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');

          ctx.fillStyle = torchGrad;
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, torchRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Wall Sconce Variations in bounds (tile_wall_*_torch)
    if (level && level.layers && level.layers.ground) {
      const bounds = camera.getViewportBounds(level.dimensions.width, level.dimensions.height, 1);
      const ground = level.layers.ground;
      for (let y = bounds.startRow; y <= bounds.endRow; y++) {
        for (let x = bounds.startCol; x <= bounds.endCol; x++) {
          if (ground[y]?.[x] !== TILES.WALL) continue;
          const isTorchSconce = ((x * 19 + y * 29) % 23 === 0);
          if (!isTorchSconce) continue;

          if (fog && !fog.isExplored(x, y) && !fog.isVisible(x, y)) continue;

          const screen = camera.worldToScreen(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, true);
          const flicker = 0.91 + Math.sin(this.exitPulseTimer * 2.8 + x + y) * 0.09;
          const sconceRadius = tileSize * 1.8 * flicker;

          if (typeof ctx.createRadialGradient === 'function') {
            const sconceGrad = ctx.createRadialGradient(
              screen.x,
              screen.y,
              tileSize * 0.1,
              screen.x,
              screen.y,
              sconceRadius
            );
            sconceGrad.addColorStop(0, 'rgba(254, 215, 170, 0.42)');
            sconceGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.18)');
            sconceGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');

            ctx.fillStyle = sconceGrad;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, sconceRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    ctx.restore();
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
   * Update all particle, shockwave, floating text, and ambient particle lifetimes
   * @param {number} dt
   * @param {object|null} [level=null]
   * @param {Camera|null} [camera=null]
   */
  updateEffects(dt, level = null, camera = null) {
    // 1. Burst Particles
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

    // 4. Dynamic Atmospheric Particles (BL-11)
    if (level && camera) {
      this.updateAmbientParticles(dt, level, camera);
    }
  }

  /**
   * Update biome-specific ambient particle simulation (BL-11)
   * @param {number} dt
   * @param {object} level
   * @param {Camera} camera
   */
  updateAmbientParticles(dt, level, camera) {
    const themeKey = level?.config?.theme || 'dungeon';
    const tileSize = camera.tileSize || 32;
    const { width: mazeW, height: mazeH } = level.dimensions || { width: 20, height: 20 };
    const bounds = camera.getViewportBounds
      ? camera.getViewportBounds(mazeW, mazeH, 2)
      : { startCol: 0, endCol: mazeW - 1, startRow: 0, endRow: mazeH - 1 };

    const minX = bounds.startCol * tileSize;
    const maxX = (bounds.endCol + 1) * tileSize;
    const minY = bounds.startRow * tileSize;
    const maxY = (bounds.endRow + 1) * tileSize;

    // 1. Update existing ambient particles
    for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
      const p = this.ambientParticles[i];
      p.life -= dt;
      const sway = Math.sin(this.exitPulseTimer * p.swayFreq + p.seed) * p.swayAmp;
      p.x += (p.vx + sway) * dt;
      p.y += p.vy * dt;

      // Cull if lifetime expired or wandered too far outside active viewport
      if (p.life <= 0 || p.x < minX - 60 || p.x > maxX + 60 || p.y < minY - 60 || p.y > maxY + 60) {
        this.ambientParticles.splice(i, 1);
      }
    }

    // 2. Replenish ambient particles up to budget (max 35)
    while (this.ambientParticles.length < this.maxAmbientParticles) {
      const p = this.createAmbientParticle(themeKey, minX, maxX, minY, maxY);
      this.ambientParticles.push(p);
    }
  }

  /**
   * Spawn a new ambient particle tailored to the active biome (BL-11)
   * @param {string} themeKey
   * @param {number} minX
   * @param {number} maxX
   * @param {number} minY
   * @param {number} maxY
   * @returns {object}
   */
  createAmbientParticle(themeKey, minX, maxX, minY, maxY) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    const seed = Math.random() * 1000;

    switch (themeKey) {
      case 'magma': {
        // Rising glowing embers / fiery sparks
        const colors = ['#f97316', '#ef4444', '#fbbf24', '#f59e0b'];
        const maxLife = 1.4 + Math.random() * 1.0;
        return {
          x, y,
          vx: (Math.random() - 0.5) * 20,
          vy: -(35 + Math.random() * 45), // Rises upward
          swayAmp: 18,
          swayFreq: 2.8,
          seed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 2.0,
          life: maxLife,
          maxLife,
          baseAlpha: 0.85,
        };
      }
      case 'jungle': {
        // Floating emerald spores / glowing pollen
        const colors = ['#22c55e', '#86efac', '#4ade80', '#a7f3d0'];
        const maxLife = 2.2 + Math.random() * 1.4;
        return {
          x, y,
          vx: (Math.random() - 0.5) * 16,
          vy: 10 + Math.random() * 18, // Gently drifting downward
          swayAmp: 22,
          swayFreq: 1.6,
          seed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.8 + Math.random() * 1.8,
          life: maxLife,
          maxLife,
          baseAlpha: 0.75,
        };
      }
      case 'glacial': {
        // Falling snowflakes / frost sparkles
        const colors = ['#e0f2fe', '#38bdf8', '#ffffff', '#bae6fd'];
        const maxLife = 2.0 + Math.random() * 1.2;
        return {
          x, y,
          vx: (Math.random() - 0.5) * 12,
          vy: 28 + Math.random() * 32, // Falls like snow
          swayAmp: 14,
          swayFreq: 2.0,
          seed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 1.8,
          life: maxLife,
          maxLife,
          baseAlpha: 0.8,
        };
      }
      case 'temple': {
        // Floating golden dust / mystic glitter
        const colors = ['#fbbf24', '#fde047', '#d97706', '#fef08a'];
        const maxLife = 1.8 + Math.random() * 1.4;
        return {
          x, y,
          vx: 16 + Math.random() * 20, // Diagonal breeze
          vy: 8 + Math.random() * 14,
          swayAmp: 12,
          swayFreq: 2.2,
          seed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.4 + Math.random() * 1.8,
          life: maxLife,
          maxLife,
          baseAlpha: 0.8,
        };
      }
      case 'dungeon':
      default: {
        // Floating subterranean dust motes
        const colors = ['rgba(226, 232, 240, 0.45)', 'rgba(203, 213, 225, 0.4)', 'rgba(255, 255, 255, 0.35)'];
        const maxLife = 2.5 + Math.random() * 1.5;
        return {
          x, y,
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() - 0.5) * 14, // Omnidirectional lazy drift
          swayAmp: 8,
          swayFreq: 1.2,
          seed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.2 + Math.random() * 1.4,
          life: maxLife,
          maxLife,
          baseAlpha: 0.65,
        };
      }
    }
  }

  /**
   * Render all world effects (particles, shockwaves, floating text, ambient particles)
   * @param {CanvasRenderingContext2D} ctx
   * @param {Camera} camera
   */
  renderWorldEffects(ctx, camera) {
    // 1. Shockwaves
    if (this.shockwaves.length > 0) {
      ctx.save();
      for (const sw of this.shockwaves) {
        const screen = camera.worldToScreen(sw.x, sw.y, true);
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

    // 2. Burst Particles
    if (this.particles.length > 0) {
      ctx.save();
      for (const p of this.particles) {
        const screen = camera.worldToScreen(p.x, p.y, true);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Dynamic Atmospheric Particles (BL-11)
    if (this.ambientParticles && this.ambientParticles.length > 0) {
      ctx.save();
      for (const p of this.ambientParticles) {
        const screen = camera.worldToScreen(p.x, p.y, true);
        const progress = Math.max(0, Math.min(1, p.life / p.maxLife));
        const alpha = Math.sin(progress * Math.PI) * (p.baseAlpha || 0.75);

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Floating In-World Text
    if (this.floatingTexts.length > 0) {
      ctx.save();
      for (const ft of this.floatingTexts) {
        const screen = camera.worldToScreen(ft.x, ft.y, true);
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

  /**
   * Render ambient atmospheric backdrop and void silhouettes outside the maze bounds
   */
  renderThematicBackdrop(ctx, level, bounds, camera, theme, tileSize) {
    const themeKey = level.config.theme || 'dungeon';
    ctx.save();

    // 1. Subtle radial ambient gradient from viewport center
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const maxDim = Math.max(this.canvas.width, this.canvas.height);
    if (ctx.createRadialGradient) {
      const grad = ctx.createRadialGradient(cx, cy, maxDim * 0.1, cx, cy, maxDim * 0.7);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 2. Animated / deterministic atmospheric particles
    const time = this.exitPulseTimer;

    if (themeKey === 'lava') {
      ctx.fillStyle = '#f97316';
      for (let i = 0; i < 24; i++) {
        const px = ((i * 137.5 + time * 12) % this.canvas.width);
        const py = this.canvas.height - ((i * 83.1 + time * 35) % this.canvas.height);
        const sz = 1.5 + (i % 3) * 0.8;
        ctx.globalAlpha = 0.4 + Math.sin(time * 2 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (themeKey === 'sunset' || themeKey === 'cave') {
      ctx.fillStyle = themeKey === 'cave' ? '#c084fc' : '#fde047';
      for (let i = 0; i < 30; i++) {
        const px = (i * 173.3) % this.canvas.width;
        const py = (i * 127.7) % this.canvas.height;
        const sz = 1 + (i % 2) * 0.8;
        ctx.globalAlpha = 0.3 + Math.sin(time * 1.5 + i * 2) * 0.25;
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (themeKey === 'snow') {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 32; i++) {
        const px = ((i * 97.3 + Math.sin(time + i) * 20) % this.canvas.width);
        const py = ((i * 59.1 + time * 28) % this.canvas.height);
        const sz = 1.2 + (i % 3) * 0.7;
        ctx.globalAlpha = 0.4 + (i % 4) * 0.15;
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (themeKey === 'jungle') {
      ctx.fillStyle = '#a3e635';
      for (let i = 0; i < 20; i++) {
        const px = ((i * 149.2 + Math.cos(time * 0.8 + i) * 15) % this.canvas.width);
        const py = ((i * 71.9 + time * 14) % this.canvas.height);
        ctx.globalAlpha = 0.35 + Math.sin(time + i) * 0.2;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Render theme-specific decorative art on a single wall tile
   */
  renderThematicPerimeterDecorTile(ctx, x, y, screenX, sy, tileSize, themeKey, seed, ground, heightOffset = 0) {
    const hasSouthCorridor = ground[y + 1]?.[x] !== TILES.WALL && ground[y + 1]?.[x] !== undefined;
    const hash = this.getDecorHash(x, y, seed);

    if (themeKey === 'dungeon') {
      if (hasSouthCorridor && hash < 0.12) {
        this.renderDungeonSkeleton(ctx, screenX, sy, tileSize);
      } else if (hasSouthCorridor && hash >= 0.12 && hash < 0.26) {
        this.renderIronChains(ctx, screenX, sy, tileSize, hash);
      } else if (hash >= 0.26 && hash < 0.38) {
        this.renderCobweb(ctx, screenX, sy, tileSize, hash);
      }
    } else if (themeKey === 'jungle') {
      if (hasSouthCorridor && hash < 0.30) {
        this.renderJungleVines(ctx, screenX, sy, tileSize, hash);
      } else if (hasSouthCorridor && hash >= 0.30 && hash < 0.50) {
        this.renderFernPatch(ctx, screenX, sy, tileSize, hash);
      }
    } else if (themeKey === 'temple') {
      if (hasSouthCorridor && hash < 0.22) {
        this.renderTempleArch(ctx, screenX, sy, tileSize);
      } else if (hasSouthCorridor && hash >= 0.22 && hash < 0.45) {
        this.renderTempleGlyph(ctx, screenX, sy, tileSize, hash);
      }
    } else if (themeKey === 'cave') {
      if (hash < 0.25) {
        this.renderCrystalGeode(ctx, screenX, sy, tileSize, hash);
      } else if (hasSouthCorridor && hash >= 0.25 && hash < 0.45) {
        this.renderStalactite(ctx, screenX, sy, tileSize, hash);
      }
    } else if (themeKey === 'lava') {
      if (hash < 0.30) {
        this.renderMagmaFissure(ctx, screenX, sy, tileSize, hash);
      }
    } else if (themeKey === 'sunset') {
      if (hasSouthCorridor && hash < 0.25) {
        this.renderAstrolabeRings(ctx, screenX, sy, tileSize);
      }
    } else if (themeKey === 'snow') {
      if (hasSouthCorridor && hash < 0.35) {
        this.renderIcicles(ctx, screenX, sy, tileSize, hash);
      }
    }
  }

  /**
   * Render theme-specific decorative art in non-playable areas & deep wall blocks
   */
  renderThematicPerimeterDecor(ctx, level, bounds, camera, theme, tileSize, heightOffset = 0) {
    const ground = level.layers.ground;
    const themeKey = level.config.theme || 'dungeon';
    const seed = (level.id ? String(level.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : 42);

    for (let y = bounds.startRow; y <= bounds.endRow; y++) {
      for (let x = bounds.startCol; x <= bounds.endCol; x++) {
        if (ground[y]?.[x] !== TILES.WALL) continue;
        const screen = camera.tileToScreen ? camera.tileToScreen(x, y) : camera.worldToScreen(x * tileSize, y * tileSize, true);
        const sy = screen.y - heightOffset;
        this.renderThematicPerimeterDecorTile(ctx, x, y, screen.x, sy, tileSize, themeKey, seed, ground, heightOffset);
      }
    }
  }

  getDecorHash(x, y, seed = 42) {
    let h = (x * 374761393 + y * 668265263 + seed * 1013904223) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  renderDungeonSkeleton(ctx, screenX, screenY, tileSize) {
    ctx.save();
    const bx = screenX + tileSize * 0.48;
    const by = screenY + tileSize * 0.65;

    // Skull
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(bx, by, tileSize * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Eye sockets
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(bx - tileSize * 0.04, by - tileSize * 0.02, tileSize * 0.025, 0, Math.PI * 2);
    ctx.arc(bx + tileSize * 0.04, by - tileSize * 0.02, tileSize * 0.025, 0, Math.PI * 2);
    ctx.fill();

    // Ribs
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx - tileSize * 0.08, by + tileSize * 0.12);
    ctx.lineTo(bx + tileSize * 0.08, by + tileSize * 0.12);
    ctx.moveTo(bx - tileSize * 0.07, by + tileSize * 0.18);
    ctx.lineTo(bx + tileSize * 0.07, by + tileSize * 0.18);
    ctx.moveTo(bx - tileSize * 0.05, by + tileSize * 0.24);
    ctx.lineTo(bx + tileSize * 0.05, by + tileSize * 0.24);
    ctx.stroke();

    ctx.restore();
  }

  renderIronChains(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const cx = screenX + tileSize * (0.3 + (hash % 0.4));
    const cy = screenY + tileSize * 0.2;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, tileSize * 0.06, 0, Math.PI * 2); // Mount ring
    ctx.stroke();

    // Dangling links
    ctx.lineWidth = 1.2;
    for (let i = 1; i <= 3; i++) {
      ctx.strokeRect(cx - 1.5, cy + i * 5, 3, 5);
    }
    ctx.restore();
  }

  renderCobweb(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.25)';
    ctx.lineWidth = 1;
    const cornerRight = (hash > 0.33);
    const ox = cornerRight ? screenX + tileSize : screenX;
    const dir = cornerRight ? -1 : 1;

    ctx.beginPath();
    ctx.moveTo(ox, screenY);
    ctx.lineTo(ox + dir * tileSize * 0.35, screenY);
    ctx.moveTo(ox, screenY);
    ctx.lineTo(ox, screenY + tileSize * 0.35);
    ctx.moveTo(ox + dir * tileSize * 0.25, screenY);
    ctx.lineTo(ox, screenY + tileSize * 0.25);
    ctx.stroke();
    ctx.restore();
  }

  renderJungleVines(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const vx = screenX + tileSize * (0.2 + (hash % 0.6));
    const vy = screenY + tileSize * 0.1;

    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.bezierCurveTo(vx - 4, vy + 8, vx + 4, vy + 16, vx, vy + 24);
    ctx.stroke();

    // Leaves
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(vx - 3, vy + 10, 3, 1.5, -0.4, 0, Math.PI * 2);
    ctx.ellipse(vx + 3, vy + 18, 3, 1.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderFernPatch(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const fx = screenX + tileSize * 0.5;
    const fy = screenY + tileSize * 0.85;

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(fx - 4, fy, 5, 2, -0.5, 0, Math.PI * 2);
    ctx.ellipse(fx + 4, fy, 5, 2, 0.5, 0, Math.PI * 2);
    ctx.ellipse(fx, fy - 3, 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderTempleArch(ctx, screenX, screenY, tileSize) {
    ctx.save();
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize * 0.35;

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, tileSize * 0.3, Math.PI, 0);
    ctx.stroke();

    // Keystone
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cx - 2, cy - tileSize * 0.33, 4, 5);
    ctx.restore();
  }

  renderTempleGlyph(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const gx = screenX + tileSize / 2;
    const gy = screenY + tileSize * 0.5;

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(gx, gy, tileSize * 0.12, 0, Math.PI * 2);
    ctx.moveTo(gx - tileSize * 0.2, gy);
    ctx.lineTo(gx + tileSize * 0.2, gy);
    ctx.stroke();
    ctx.restore();
  }

  renderCrystalGeode(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const gx = screenX + tileSize * 0.5;
    const gy = screenY + tileSize * 0.5;

    const pulse = Math.sin(this.exitPulseTimer * 2 + hash * 10) * 0.2 + 0.8;
    ctx.fillStyle = '#c084fc';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(gx, gy - 6 * pulse);
    ctx.lineTo(gx + 4 * pulse, gy);
    ctx.lineTo(gx, gy + 6 * pulse);
    ctx.lineTo(gx - 4 * pulse, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  renderStalactite(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const sx = screenX + tileSize * (0.3 + (hash % 0.4));
    const sy = screenY + tileSize * 0.2;

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(sx - 3, sy);
    ctx.lineTo(sx + 3, sy);
    ctx.lineTo(sx, sy + 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderMagmaFissure(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const mx = screenX + tileSize * 0.5;
    const my = screenY + tileSize * 0.5;

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(mx - 8, my - 6);
    ctx.lineTo(mx - 2, my + 1);
    ctx.lineTo(mx + 8, my + 5);
    ctx.stroke();

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  renderAstrolabeRings(ctx, screenX, screenY, tileSize) {
    ctx.save();
    const ax = screenX + tileSize / 2;
    const ay = screenY + tileSize * 0.5;

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ax, ay, tileSize * 0.22, 0, Math.PI * 2);
    ctx.arc(ax, ay, tileSize * 0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  renderIcicles(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const ix = screenX + tileSize * 0.2;
    const iy = screenY + tileSize * 0.25;

    ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ix + 4, iy);
    ctx.lineTo(ix + 2, iy + 8);
    ctx.moveTo(ix + 8, iy);
    ctx.lineTo(ix + 12, iy);
    ctx.lineTo(ix + 10, iy + 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Render pulsing destination ring at clicked/tapped target
   * @param {CanvasRenderingContext2D} ctx
   * @param {Camera} camera
   * @param {{ x: number, y: number, time: number }} clickTarget
   * @param {number} tileSize
   */
  renderClickTarget(ctx, camera, clickTarget, tileSize) {
    const age = performance.now() - clickTarget.time;
    if (age > 1200) return;

    const t = age / 1200;
    const alpha = Math.max(0, 1 - t);
    const radius = (tileSize * 0.35) + (t * tileSize * 0.25);

    const worldX = clickTarget.x * tileSize + tileSize / 2;
    const worldY = clickTarget.y * tileSize + tileSize / 2;
    const screen = camera.worldToScreen(worldX, worldY, true);

    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, Math.max(2, radius), 0, Math.PI * 2);
    ctx.stroke();

    // Inner core dot
    ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, Math.max(1, 3 * (1 - t)), 0, Math.PI * 2);
    ctx.fill();

    // Crosshairs
    const arm = Math.max(2, 6 * (1 - t));
    ctx.beginPath();
    ctx.moveTo(screen.x - arm, screen.y);
    ctx.lineTo(screen.x + arm, screen.y);
    ctx.moveTo(screen.x, screen.y - arm);
    ctx.lineTo(screen.x, screen.y + arm);
    ctx.stroke();

    ctx.restore();
  }
}
