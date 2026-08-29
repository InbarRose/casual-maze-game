/**
 * Viewport Camera Engine
 * Handles smooth follow lerping, free-panning mode, coordinate projections, and viewport clipping.
 */

export class Camera {
  /**
   * @param {number} viewportWidth
   * @param {number} viewportHeight
   * @param {number} tileSize
   */
  constructor(viewportWidth = 800, viewportHeight = 600, tileSize = 32) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.tileSize = tileSize;

    this.x = 0; // Center X in world pixels
    this.y = 0; // Center Y in world pixels
    this.targetX = 0;
    this.targetY = 0;

    this.lerpSpeed = 0.12;
    this.mode = 'follow'; // 'follow' | 'freepan'
    this.panSpeed = 480; // pixels per second when panning
  }

  get width() {
    return this.viewportWidth;
  }

  get height() {
    return this.viewportHeight;
  }

  /**
   * Resize viewport dimensions
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Set camera mode
   * @param {'follow'|'freepan'} mode
   */
  setMode(mode) {
    this.mode = mode;
  }

  /**
   * Set immediate camera center without lerp
   * @param {number} worldX
   * @param {number} worldY
   * @param {number} mazeWidth
   * @param {number} mazeHeight
   */
  snapTo(worldX, worldY, mazeWidth, mazeHeight) {
    this.x = worldX;
    this.y = worldY;
    this.targetX = worldX;
    this.targetY = worldY;
    this.clampToBounds(mazeWidth, mazeHeight);
  }

  /**
   * Update camera position each frame
   * @param {number} targetWorldX
   * @param {number} targetWorldY
   * @param {number} dt
   * @param {number} mazeWidth
   * @param {number} mazeHeight
   */
  update(targetWorldX, targetWorldY, dt, mazeWidth, mazeHeight) {
    if (this.mode === 'follow') {
      this.targetX = targetWorldX;
      this.targetY = targetWorldY;

      // Smooth lerp follow
      const factor = 1 - Math.pow(1 - this.lerpSpeed, dt * 60);
      this.x += (this.targetX - this.x) * factor;
      this.y += (this.targetY - this.y) * factor;
    }

    this.clampToBounds(mazeWidth, mazeHeight);
  }

  /**
   * Manually pan the camera (for Free-Pan Mode)
   * @param {number} dx
   * @param {number} dy
   * @param {number} mazeWidth
   * @param {number} mazeHeight
   */
  panBy(dx, dy, mazeWidth, mazeHeight) {
    this.x += dx;
    this.y += dy;
    this.targetX = this.x;
    this.targetY = this.y;
    this.clampToBounds(mazeWidth, mazeHeight);
  }

  /**
   * Clamp camera so viewport stays within maze boundaries (or centered if smaller than viewport)
   * @param {number} mazeWidth
   * @param {number} mazeHeight
   */
  clampToBounds(mazeWidth, mazeHeight) {
    const totalPixelWidth = mazeWidth * this.tileSize;
    const totalPixelHeight = mazeHeight * this.tileSize;

    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;

    if (totalPixelWidth <= this.viewportWidth) {
      this.x = totalPixelWidth / 2;
    } else {
      this.x = Math.max(halfW, Math.min(totalPixelWidth - halfW, this.x));
    }

    if (totalPixelHeight <= this.viewportHeight) {
      this.y = totalPixelHeight / 2;
    } else {
      this.y = Math.max(halfH, Math.min(totalPixelHeight - halfH, this.y));
    }
  }

  /**
   * Convert world coordinates (pixels) to screen coordinates (pixels)
   * @param {number} worldX
   * @param {number} worldY
   * @returns {{x: number, y: number}}
   */
  worldToScreen(worldX, worldY) {
    return {
      x: Math.round(worldX - this.x + this.viewportWidth / 2),
      y: Math.round(worldY - this.y + this.viewportHeight / 2),
    };
  }

  /**
   * Convert screen coordinates (pixels) to world coordinates (pixels)
   * @param {number} screenX
   * @param {number} screenY
   * @returns {{x: number, y: number}}
   */
  screenToWorld(screenX, screenY) {
    return {
      x: screenX - this.viewportWidth / 2 + this.x,
      y: screenY - this.viewportHeight / 2 + this.y,
    };
  }

  /**
   * Calculate visible tile indices for viewport culling
   * @param {number} mazeWidth
   * @param {number} mazeHeight
   * @param {number} [padding=1] extra tile buffer around edges
   * @returns {{startCol: number, endCol: number, startRow: number, endRow: number}}
   */
  getViewportBounds(mazeWidth, mazeHeight, padding = 1) {
    const left = this.x - this.viewportWidth / 2;
    const right = this.x + this.viewportWidth / 2;
    const top = this.y - this.viewportHeight / 2;
    const bottom = this.y + this.viewportHeight / 2;

    const startCol = Math.max(0, Math.floor(left / this.tileSize) - padding);
    const endCol = Math.min(mazeWidth - 1, Math.ceil(right / this.tileSize) + padding);
    const startRow = Math.max(0, Math.floor(top / this.tileSize) - padding);
    const endRow = Math.min(mazeHeight - 1, Math.ceil(bottom / this.tileSize) + padding);

    return { startCol, endCol, startRow, endRow };
  }
}
