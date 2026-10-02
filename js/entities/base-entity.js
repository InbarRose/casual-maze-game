/**
 * Casual Maze Game — Base Entity Domain Model (BL-57)
 * Implements the polymorphic entity interface contract and common coordinate math
 * adhering to SOLID (Open/Closed Principle & Liskov Substitution Principle).
 */

import { Vec2 } from '../core/geometry.js';
import { ELEVATION } from '../core/constants.js';

export class BaseEntity {
  /**
   * @param {Object} config
   * @param {string} config.type Entity type discriminator
   * @param {string} [config.id] Unique entity identifier
   * @param {number} [config.x=0] Grid X coordinate
   * @param {number} [config.y=0] Grid Y coordinate
   * @param {number} [config.z=0] Grid elevation (0 = ground, 1 = overhead)
   * @param {number} [config.elevation] Alias for z
   * @param {string} [config.name] Human-readable display label
   */
  constructor(config = {}) {
    if (!config.type) {
      throw new Error('[BaseEntity] Entity type is required.');
    }

    this.id = config.id || `${config.type}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = config.type;
    this.x = typeof config.x === 'number' ? config.x : 0;
    this.y = typeof config.y === 'number' ? config.y : 0;
    this.z = typeof config.z === 'number' ? config.z : (typeof config.elevation === 'number' ? config.elevation : ELEVATION.GROUND);
    this.name = config.name || this.type;
  }

  /**
   * Elevation getter/setter for compatibility with legacy code
   */
  get elevation() {
    return this.z;
  }

  set elevation(val) {
    this.z = typeof val === 'number' ? val : 0;
  }

  /**
   * Immutable Vec2 value object representation of entity grid coordinates
   * @returns {Vec2}
   */
  get position() {
    return new Vec2(this.x, this.y);
  }

  /**
   * Set grid position using either numbers or Vec2
   * @param {number|Vec2} xOrVec
   * @param {number} [y]
   */
  setPosition(xOrVec, y) {
    if (xOrVec instanceof Vec2 || (typeof xOrVec === 'object' && xOrVec !== null && 'x' in xOrVec && 'y' in xOrVec)) {
      this.x = xOrVec.x;
      this.y = xOrVec.y;
    } else {
      this.x = typeof xOrVec === 'number' ? xOrVec : 0;
      this.y = typeof y === 'number' ? y : 0;
    }
  }

  /**
   * Canonical (X, Y, Z) coordinate string
   * @returns {string}
   */
  getCoordString() {
    return `(${this.x}, ${this.y}, ${this.z ?? 0})`;
  }

  /**
   * Distance in Manhattan grid steps to another entity or coordinate
   * @param {number|Vec2} xOrTarget
   * @param {number} [y]
   * @returns {number}
   */
  distanceTo(xOrTarget, y) {
    const target = xOrTarget instanceof Vec2 ? xOrTarget : (typeof xOrTarget === 'object' && xOrTarget !== null ? new Vec2(xOrTarget.x, xOrTarget.y) : new Vec2(xOrTarget, y));
    return this.position.manhattanDistanceTo(target);
  }

  /**
   * Check if entity can be interacted with from specified position and elevation
   * @param {number} playerX
   * @param {number} playerY
   * @param {number} [playerZ=0]
   * @returns {boolean}
   */
  canInteract(playerX, playerY, playerZ = ELEVATION.GROUND) {
    if (this.z !== playerZ) return false;
    return this.distanceTo(playerX, playerY) <= 1;
  }

  /**
   * Contextual interaction prompt description
   * @returns {string}
   */
  getPrompt() {
    return `Examine ${this.name}`;
  }

  /**
   * Polymorphic interaction handler
   * @param {Object} [context]
   * @returns {Object}
   */
  onInteract(context = {}) {
    return { handled: false, entity: this };
  }

  /**
   * Check collision with player movement
   * @param {number} toX
   * @param {number} toY
   * @param {number} [toElevation=0]
   * @returns {boolean} True if solid/blocking
   */
  isBlocking(toX, toY, toElevation = ELEVATION.GROUND) {
    return this.x === toX && this.y === toY && this.z === toElevation;
  }

  /**
   * Lifecycle animation/physics update loop
   * @param {number} dt Delta time in seconds
   */
  update(dt) {
    // Default no-op for static entities
  }

  /**
   * Canvas 2D render loop
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX Projected center X
   * @param {number} screenY Projected center Y
   * @param {number} tileSize Tile dimensions
   */
  render(ctx, screenX, screenY, tileSize) {
    // Derived classes implement custom or vector sprite rendering
  }
}
