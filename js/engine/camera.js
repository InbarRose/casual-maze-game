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

    // World / View 90-degree Rotation
    this.rotation = 0; // Current angle in degrees (0, 90, 180, 270)
    this.targetRotation = 0;
    this.rotationLerpSpeed = 0.22;
  }

  get width() {
    return this.viewportWidth;
  }

  get height() {
    return this.viewportHeight;
  }

  /**
   * Set target rotation angle in degrees (snapped to 0, 90, 180, 270)
   * @param {number} angle
   * @param {boolean} [immediate=false]
   */
  setRotation(angle, immediate = false) {
    this.targetRotation = ((Math.round(angle / 90) * 90) % 360 + 360) % 360;
    if (immediate) {
      this.rotation = this.targetRotation;
    }
  }

  /**
   * Rotate 90 degrees counter-clockwise (Left)
   */
  rotateLeft() {
    this.targetRotation = (this.targetRotation - 90 + 360) % 360;
  }

  /**
   * Rotate 90 degrees clockwise (Right)
   */
  rotateRight() {
    this.targetRotation = (this.targetRotation + 90) % 360;
  }

  /**
   * Get current canonical discrete rotation (0, 90, 180, 270)
   * @returns {0|90|180|270}
   */
  getDiscreteRotation() {
    return ((Math.round(this.targetRotation / 90) % 4) + 4) % 4 * 90;
  }

  /**
   * Get compass heading ('N', 'E', 'S', 'W')
   * @returns {'N'|'E'|'S'|'W'}
   */
  getCompassHeading() {
    const headings = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };
    return headings[this.getDiscreteRotation()] || 'N';
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

    // Smooth rotation lerp
    if (Math.abs(this.targetRotation - this.rotation) > 0.01) {
      let delta = (this.targetRotation - this.rotation) % 360;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const rFactor = 1 - Math.pow(1 - this.rotationLerpSpeed, dt * 60);
      this.rotation += delta * rFactor;
      if (Math.abs(delta) < 0.1) {
        this.rotation = this.targetRotation;
      }
    } else {
      this.rotation = this.targetRotation;
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

    const angle = this.getDiscreteRotation();
    const effViewportW = (angle === 90 || angle === 270) ? this.viewportHeight : this.viewportWidth;
    const effViewportH = (angle === 90 || angle === 270) ? this.viewportWidth : this.viewportHeight;

    const halfW = effViewportW / 2;
    const halfH = effViewportH / 2;

    if (totalPixelWidth <= effViewportW) {
      this.x = totalPixelWidth / 2;
    } else {
      this.x = Math.max(halfW, Math.min(totalPixelWidth - halfW, this.x));
    }

    if (totalPixelHeight <= effViewportH) {
      this.y = totalPixelHeight / 2;
    } else {
      this.y = Math.max(halfH, Math.min(totalPixelHeight - halfH, this.y));
    }
  }

  /**
   * Convert world coordinates (pixels) to screen coordinates (pixels)
   * Takes current camera rotation into account.
   * @param {number} worldX
   * @param {number} worldY
   * @param {boolean} [useDiscrete=false] Whether to use discrete 90-degree angle for pixel-perfect tile alignment
   * @returns {{x: number, y: number}}
   */
  worldToScreen(worldX, worldY, useDiscrete = false) {
    const angleDeg = useDiscrete ? this.getDiscreteRotation() : this.rotation;
    const dx = worldX - this.x;
    const dy = worldY - this.y;

    if (angleDeg === 0) {
      return {
        x: Math.round(dx + this.viewportWidth / 2),
        y: Math.round(dy + this.viewportHeight / 2),
      };
    }

    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Coordinate rotation: screen = R(-theta) * (world - center)
    const rx = dx * cos + dy * sin;
    const ry = -dx * sin + dy * cos;

    return {
      x: Math.round(rx + this.viewportWidth / 2),
      y: Math.round(ry + this.viewportHeight / 2),
    };
  }

  /**
   * Convert screen coordinates (pixels) to world coordinates (pixels)
   * Inverse of worldToScreen.
   * @param {number} screenX
   * @param {number} screenY
   * @param {boolean} [useDiscrete=false]
   * @returns {{x: number, y: number}}
   */
  screenToWorld(screenX, screenY, useDiscrete = false) {
    const angleDeg = useDiscrete ? this.getDiscreteRotation() : this.rotation;
    const rx = screenX - this.viewportWidth / 2;
    const ry = screenY - this.viewportHeight / 2;

    if (angleDeg === 0) {
      return {
        x: rx + this.x,
        y: ry + this.y,
      };
    }

    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Inverse rotation: world = R(+theta) * screen + center
    const dx = rx * cos - ry * sin;
    const dy = rx * sin + ry * cos;

    return {
      x: dx + this.x,
      y: dy + this.y,
    };
  }

  /**
   * Calculate visible tile indices for viewport culling
   * @param {number} mazeWidth
   * @param {number} mazeHeight
   * @param {number} [padding=2] extra tile buffer around edges
   * @returns {{startCol: number, endCol: number, startRow: number, endRow: number}}
   */
  getViewportBounds(mazeWidth, mazeHeight, padding = 2) {
    if (this.rotation === 0 && this.targetRotation === 0) {
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

    // Rotated bounding box: unproject 4 corners of screen
    const c1 = this.screenToWorld(0, 0);
    const c2 = this.screenToWorld(this.viewportWidth, 0);
    const c3 = this.screenToWorld(0, this.viewportHeight);
    const c4 = this.screenToWorld(this.viewportWidth, this.viewportHeight);

    const minX = Math.min(c1.x, c2.x, c3.x, c4.x);
    const maxX = Math.max(c1.x, c2.x, c3.x, c4.x);
    const minY = Math.min(c1.y, c2.y, c3.y, c4.y);
    const maxY = Math.max(c1.y, c2.y, c3.y, c4.y);

    const startCol = Math.max(0, Math.floor(minX / this.tileSize) - padding);
    const endCol = Math.min(mazeWidth - 1, Math.ceil(maxX / this.tileSize) + padding);
    const startRow = Math.max(0, Math.floor(minY / this.tileSize) - padding);
    const endRow = Math.min(mazeHeight - 1, Math.ceil(maxY / this.tileSize) + padding);

    return { startCol, endCol, startRow, endRow };
  }
}
