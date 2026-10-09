/**
 * Casual Maze Game — Hero Ambient Canvas Simulation
 * 
 * Provides a lightweight, high-performance, procedural 2D gameplay backdrop
 * running behind the hero section on the hub landing page.
 * 
 * Features:
 * - Autonomous glowing explorer traversing procedural corridors
 * - Dynamic torchlight attenuation with organic flicker
 * - Floating ambient embers / luminous dust motes
 * - Soft mouse parallax interaction
 * - Zero external assets or video files (100% static & battery friendly)
 * - Auto-pauses on visibilitychange and IntersectionObserver
 */

export class HeroAmbientCanvas {
  /**
   * @param {HTMLCanvasElement|string} canvasOrId
   * @param {object} [options]
   */
  constructor(canvasOrId, options = {}) {
    this.canvas = typeof canvasOrId === 'string'
      ? (typeof document !== 'undefined' ? document.getElementById(canvasOrId) : null)
      : canvasOrId;

    this.ctx = this.canvas && typeof this.canvas.getContext === 'function'
      ? this.canvas.getContext('2d')
      : null;

    this.options = {
      cellSize: 36,
      moteCount: 28,
      speed: 1.0,
      enableParallax: true,
      ...options,
    };

    this.running = false;
    this.paused = false;
    this.rafId = null;
    this.lastTime = 0;

    // Viewport dimensions
    this.width = 800;
    this.height = 400;
    this.dpr = typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;

    // Parallax
    this.parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Procedural mini maze grid (0 = path, 1 = wall, 2 = runic floor)
    this.gridCols = 23;
    this.gridRows = 13;
    this.grid = [];
    this._initGrid();

    // Autonomous Explorer Entity
    this.explorer = {
      gridX: 1,
      gridY: 1,
      targetX: 1,
      targetY: 1,
      renderX: 1,
      renderY: 1,
      direction: 'east',
      progress: 0,
      speed: 0.035,
      trail: [],
      torchHue: 38, // Warm amber / gold
      flicker: 0,
    };

    // Ambient floating embers
    this.motes = [];
    this._initMotes();

    // Event handlers for cleanup
    this._boundResize = this._handleResize.bind(this);
    this._boundMouseMove = this._handleMouseMove.bind(this);
    this._boundVisibility = this._handleVisibility.bind(this);
    this._observer = null;

    this._setupObservers();
    this._handleResize();
  }

  _initGrid() {
    // Generate an atmospheric symmetrical/organic labyrinth layout
    this.grid = [];
    for (let r = 0; r < this.gridRows; r++) {
      const row = [];
      for (let c = 0; c < this.gridCols; c++) {
        // Outer boundaries are walls
        if (r === 0 || r === this.gridRows - 1 || c === 0 || c === this.gridCols - 1) {
          row.push(1);
        } else if (r % 2 === 0 && c % 2 === 0) {
          // Pillars
          row.push(1);
        } else if ((r === 3 && c > 4 && c < 18) || (r === 9 && c > 4 && c < 18)) {
          // Horizontal corridors with selective breaks
          row.push(c % 4 === 0 ? 0 : (c % 2 === 0 ? 1 : 0));
        } else if (r % 3 === 0 && c % 3 === 0) {
          // Runic accent floors
          row.push(2);
        } else {
          row.push(0);
        }
      }
      this.grid.push(row);
    }
  }

  _initMotes() {
    this.motes = [];
    const count = this.options.moteCount;
    for (let i = 0; i < count; i++) {
      this.motes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.35 + 0.15),
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.7 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? 'gold' : 'cyan',
      });
    }
  }

  _setupObservers() {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', this._boundResize);
    window.addEventListener('mousemove', this._boundMouseMove);
    document.addEventListener('visibilitychange', this._boundVisibility);

    if ('IntersectionObserver' in window && this.canvas) {
      try {
        this._observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.resume();
            } else {
              this.pause();
            }
          }
        }, { threshold: 0.05 });
        this._observer.observe(this.canvas);
      } catch (_) {}
    }
  }

  _handleResize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || this.canvas.clientWidth || 800;
    this.height = rect.height || this.canvas.clientHeight || 360;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  _handleMouseMove(e) {
    if (!this.options.enableParallax || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    this.parallax.targetX = (e.clientX - cx) * 0.025;
    this.parallax.targetY = (e.clientY - cy) * 0.025;
  }

  _handleVisibility() {
    if (typeof document === 'undefined') return;
    if (document.visibilityState === 'hidden') {
      this.pause();
    } else {
      this.resume();
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this._loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.rafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (!this.running) {
      this.start();
      return;
    }
    if (this.paused) {
      this.paused = false;
      this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (!this.rafId) {
        this._loop(this.lastTime);
      }
    }
  }

  _loop(timestamp) {
    if (!this.running) return;
    if (!this.paused) {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      this.update(dt);
      this.render();
    }

    if (typeof requestAnimationFrame === 'function') {
      this.rafId = requestAnimationFrame((ts) => this._loop(ts));
    }
  }

  update(dt) {
    // 1. Smooth Parallax Spring
    this.parallax.x += (this.parallax.targetX - this.parallax.x) * 0.08;
    this.parallax.y += (this.parallax.targetY - this.parallax.y) * 0.08;

    // 2. Update Explorer
    this._updateExplorer(dt);

    // 3. Update Motes
    for (const m of this.motes) {
      m.y += m.speedY * (this.options.speed * 60 * dt);
      m.x += m.speedX * (this.options.speed * 60 * dt);
      m.pulseAngle += m.pulseSpeed;
      m.alpha = m.baseAlpha + Math.sin(m.pulseAngle) * 0.2;

      // Wrap around canvas bounds
      if (m.y < -10) {
        m.y = this.height + 10;
        m.x = Math.random() * this.width;
      }
      if (m.x < -10) m.x = this.width + 10;
      if (m.x > this.width + 10) m.x = -10;
    }
  }

  _updateExplorer(dt) {
    const exp = this.explorer;

    // Torch flicker oscillation
    exp.flicker = Math.sin(Date.now() * 0.007) * 3 + Math.cos(Date.now() * 0.019) * 2;

    if (exp.gridX === exp.targetX && exp.gridY === exp.targetY) {
      // Pick next valid neighbor in corridor
      const dirs = [
        { dx: 0, dy: -1, dir: 'north' },
        { dx: 0, dy: 1, dir: 'south' },
        { dx: 1, dy: 0, dir: 'east' },
        { dx: -1, dy: 0, dir: 'west' },
      ];

      // Shuffle directions for organic wandering
      dirs.sort(() => Math.random() - 0.5);

      let found = false;
      for (const d of dirs) {
        const nx = exp.gridX + d.dx;
        const ny = exp.gridY + d.dy;
        if (nx >= 0 && nx < this.gridCols && ny >= 0 && ny < this.gridRows) {
          if (this.grid[ny][nx] !== 1) {
            // Avoid immediate 180 backtrack if other paths exist
            const isOpposite = (d.dir === 'north' && exp.direction === 'south') ||
                               (d.dir === 'south' && exp.direction === 'north') ||
                               (d.dir === 'east' && exp.direction === 'west') ||
                               (d.dir === 'west' && exp.direction === 'east');
            if (!isOpposite || dirs.length === 1) {
              exp.targetX = nx;
              exp.targetY = ny;
              exp.direction = d.dir;
              exp.progress = 0;
              found = true;
              break;
            }
          }
        }
      }

      // If dead-end, allow backtrack
      if (!found) {
        for (const d of dirs) {
          const nx = exp.gridX + d.dx;
          const ny = exp.gridY + d.dy;
          if (nx >= 0 && nx < this.gridCols && ny >= 0 && ny < this.gridRows && this.grid[ny][nx] !== 1) {
            exp.targetX = nx;
            exp.targetY = ny;
            exp.direction = d.dir;
            exp.progress = 0;
            break;
          }
        }
      }
    } else {
      // Interpolate toward target
      exp.progress += exp.speed * (this.options.speed * 60 * dt);
      if (exp.progress >= 1.0) {
        exp.gridX = exp.targetX;
        exp.gridY = exp.targetY;
        exp.progress = 0;
        exp.renderX = exp.gridX;
        exp.renderY = exp.gridY;
      } else {
        exp.renderX = exp.gridX + (exp.targetX - exp.gridX) * exp.progress;
        exp.renderY = exp.gridY + (exp.targetY - exp.gridY) * exp.progress;
      }
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // Save state for parallax transform
    ctx.save();
    ctx.translate(this.parallax.x, this.parallax.y);

    // Center the maze grid inside the canvas
    const cellW = w / (this.gridCols - 1);
    const cellH = h / (this.gridRows - 1);

    // 1. Render Maze Corridors & Runic Floors
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const val = this.grid[r][c];
        const x = c * cellW;
        const y = r * cellH;

        if (val === 1) {
          // Subtle Stone Wall Structure
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
          ctx.fillRect(x, y, cellW, cellH);

          // Wall inner bevel border
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
        } else if (val === 2) {
          // Ancient Runic Inscription Floor
          ctx.fillStyle = 'rgba(25, 36, 60, 0.25)';
          ctx.fillRect(x, y, cellW, cellH);

          // Glowing runic motif
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + cellH / 2, cellW * 0.28, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Corridor pathway
          ctx.fillStyle = 'rgba(9, 14, 26, 0.2)';
          ctx.fillRect(x, y, cellW, cellH);
        }
      }
    }

    // 2. Render Explorer Entity & Dynamic Torch Light
    const exp = this.explorer;
    const expScreenX = exp.renderX * cellW + cellW / 2;
    const expScreenY = exp.renderY * cellH + cellH / 2;
    const torchRadius = Math.max(80, 110 + exp.flicker);

    // Dynamic Torch Light Radial Halo
    const torchGrad = ctx.createRadialGradient(
      expScreenX, expScreenY, 6,
      expScreenX, expScreenY, torchRadius
    );
    torchGrad.addColorStop(0, 'rgba(251, 191, 36, 0.32)');
    torchGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.16)');
    torchGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.05)');
    torchGrad.addColorStop(1, 'rgba(9, 13, 22, 0)');

    ctx.fillStyle = torchGrad;
    ctx.beginPath();
    ctx.arc(expScreenX, expScreenY, torchRadius, 0, Math.PI * 2);
    ctx.fill();

    // Explorer Sprite Avatar: Glowing Lantern Wisp
    ctx.save();
    ctx.translate(expScreenX, expScreenY);

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting spark ring
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // 3. Render Floating Ambient Motes / Embers
    for (const m of this.motes) {
      ctx.fillStyle = m.color === 'gold'
        ? `rgba(251, 191, 36, ${m.alpha})`
        : `rgba(56, 189, 248, ${m.alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 4. Smooth Cinematic Vignette Overlay (keeps hero text crystal clear)
    const vignette = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.25,
      w / 2, h / 2, Math.max(w, h) * 0.75
    );
    vignette.addColorStop(0, 'rgba(7, 10, 19, 0.25)');
    vignette.addColorStop(0.65, 'rgba(7, 10, 19, 0.7)');
    vignette.addColorStop(1, 'rgba(7, 10, 19, 0.96)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  destroy() {
    this.stop();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._boundResize);
      window.removeEventListener('mousemove', this._boundMouseMove);
      document.removeEventListener('visibilitychange', this._boundVisibility);
    }
    if (this._observer && this.canvas) {
      try {
        this._observer.unobserve(this.canvas);
        this._observer.disconnect();
      } catch (_) {}
    }
    this.canvas = null;
    this.ctx = null;
  }

  getState() {
    return {
      running: this.running,
      paused: this.paused,
      moteCount: this.motes.length,
      explorer: {
        gridX: this.explorer.gridX,
        gridY: this.explorer.gridY,
        targetX: this.explorer.targetX,
        targetY: this.explorer.targetY,
        direction: this.explorer.direction,
      },
      width: this.width,
      height: this.height,
    };
  }
}
