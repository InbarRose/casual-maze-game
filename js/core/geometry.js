/**
 * Casual Maze Game — Clean Geometry Value Objects
 * 
 * Provides immutable, robust, Object-Oriented domain primitives adhering to
 * Single Responsibility Principle (SRP) and pure functional immutability.
 */

/**
 * Immutable 2D Coordinate / Vector Value Object
 */
export class Vec2 {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x = 0, y = 0) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    Object.freeze(this);
  }

  /**
   * Create a Vec2 from an object, array, or existing Vec2
   * @param {object|Array|Vec2} obj
   * @returns {Vec2}
   */
  static from(obj) {
    if (!obj) return Vec2.zero();
    if (obj instanceof Vec2) return obj;
    if (Array.isArray(obj)) return new Vec2(obj[0], obj[1]);
    return new Vec2(obj.x, obj.y);
  }

  static zero() {
    return new Vec2(0, 0);
  }

  static up() {
    return new Vec2(0, -1);
  }

  static down() {
    return new Vec2(0, 1);
  }

  static left() {
    return new Vec2(-1, 0);
  }

  static right() {
    return new Vec2(1, 0);
  }

  /**
   * Parse a "x,y" string key into a Vec2
   * @param {string} str
   * @returns {Vec2}
   */
  static fromKey(str) {
    if (typeof str !== 'string') return Vec2.zero();
    const parts = str.split(',');
    return new Vec2(parseFloat(parts[0]) || 0, parseFloat(parts[1]) || 0);
  }

  /**
   * Returns coordinate formatted as standard hash key "x,y"
   * @returns {string}
   */
  toKey() {
    return `${this.x},${this.y}`;
  }

  /**
   * Vector addition
   * @param {Vec2|object} other
   * @returns {Vec2}
   */
  add(other) {
    const v = Vec2.from(other);
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  /**
   * Vector subtraction
   * @param {Vec2|object} other
   * @returns {Vec2}
   */
  sub(other) {
    const v = Vec2.from(other);
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  /**
   * Scalar multiplication
   * @param {number} scalar
   * @returns {Vec2}
   */
  scale(scalar) {
    const s = Number(scalar) || 0;
    return new Vec2(this.x * s, this.y * s);
  }

  /**
   * Euclidean distance to another point
   * @param {Vec2|object} other
   * @returns {number}
   */
  distanceTo(other) {
    const v = Vec2.from(other);
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  /**
   * Manhattan (grid / taxicab) distance to another point
   * @param {Vec2|object} other
   * @returns {number}
   */
  manhattanDistanceTo(other) {
    const v = Vec2.from(other);
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  /**
   * Checks value equality
   * @param {Vec2|object} other
   * @returns {boolean}
   */
  equals(other) {
    if (!other) return false;
    const v = Vec2.from(other);
    return this.x === v.x && this.y === v.y;
  }

  /**
   * Clamps vector components between minimum and maximum bounds
   * @param {Vec2|object} minVec
   * @param {Vec2|object} maxVec
   * @returns {Vec2}
   */
  clamp(minVec, maxVec) {
    const min = Vec2.from(minVec);
    const max = Vec2.from(maxVec);
    return new Vec2(
      Math.max(min.x, Math.min(max.x, this.x)),
      Math.max(min.y, Math.min(max.y, this.y))
    );
  }

  /**
   * Rotate 90° Clockwise around origin (screen coordinates: Y points down)
   * (x, y) -> (-y, x)
   * @returns {Vec2}
   */
  rotateCW() {
    return new Vec2(-this.y, this.x);
  }

  /**
   * Rotate 90° Counter-Clockwise around origin (screen coordinates: Y points down)
   * (x, y) -> (y, -x)
   * @returns {Vec2}
   */
  rotateCCW() {
    return new Vec2(this.y, -this.x);
  }
}

/**
 * Immutable Grid Rectangle Value Object
 */
export class GridRect {
  /**
   * @param {number} x Top-left X
   * @param {number} y Top-left Y
   * @param {number} width
   * @param {number} height
   */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    this.width = Math.max(0, Number(width) || 0);
    this.height = Math.max(0, Number(height) || 0);
    Object.freeze(this);
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.width;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.height;
  }

  /**
   * Tests if a point or Vec2 is contained within rectangle [inclusive left/top, exclusive right/bottom]
   * @param {number|Vec2|object} xOrVec
   * @param {number} [optY]
   * @returns {boolean}
   */
  contains(xOrVec, optY) {
    let px = 0;
    let py = 0;
    if (typeof xOrVec === 'object' && xOrVec !== null) {
      px = xOrVec.x ?? 0;
      py = xOrVec.y ?? 0;
    } else {
      px = Number(xOrVec) || 0;
      py = Number(optY) || 0;
    }
    return px >= this.left && px < this.right && py >= this.top && py < this.bottom;
  }

  /**
   * Tests if this rectangle overlaps with another rectangle
   * @param {GridRect} other
   * @returns {boolean}
   */
  overlaps(other) {
    if (!other) return false;
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }

  /**
   * Clamps a coordinate point to stay within rectangle bounds
   * @param {Vec2|object} vec
   * @returns {Vec2}
   */
  clamp(vec) {
    const v = Vec2.from(vec);
    const maxX = this.width > 0 ? this.right - 1 : this.left;
    const maxY = this.height > 0 ? this.bottom - 1 : this.top;
    return new Vec2(
      Math.max(this.left, Math.min(maxX, v.x)),
      Math.max(this.top, Math.min(maxY, v.y))
    );
  }
}

/**
 * Cardinal Direction & Heading Helpers
 */
export class Heading {
  static NORTH = 'N';
  static EAST = 'E';
  static SOUTH = 'S';
  static WEST = 'W';

  /**
   * Derives primary cardinal heading from a directional coordinate delta
   * @param {number} dx
   * @param {number} dy
   * @returns {'N'|'E'|'S'|'W'|null}
   */
  static fromDelta(dx, dy) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx > 0) return Heading.EAST;
      if (dx < 0) return Heading.WEST;
    }
    if (dy > 0) return Heading.SOUTH;
    if (dy < 0) return Heading.NORTH;
    return null;
  }

  /**
   * Returns unit Vec2 delta for a cardinal heading
   * @param {'N'|'E'|'S'|'W'|string} heading
   * @returns {Vec2}
   */
  static toDelta(heading) {
    switch (heading?.toUpperCase()) {
      case 'N':
      case 'NORTH':
      case 'UP':
        return Vec2.up();
      case 'E':
      case 'EAST':
      case 'RIGHT':
        return Vec2.right();
      case 'S':
      case 'SOUTH':
      case 'DOWN':
        return Vec2.down();
      case 'W':
      case 'WEST':
      case 'LEFT':
        return Vec2.left();
      default:
        return Vec2.zero();
    }
  }

  /**
   * Rotates heading clockwise by 90, 180, or 270 degrees
   * @param {'N'|'E'|'S'|'W'} heading
   * @param {number} degrees
   * @returns {'N'|'E'|'S'|'W'}
   */
  static rotateCW(heading, degrees = 90) {
    const order = [Heading.NORTH, Heading.EAST, Heading.SOUTH, Heading.WEST];
    const idx = order.indexOf(heading?.toUpperCase());
    if (idx === -1) return Heading.NORTH;
    const steps = Math.round((degrees % 360) / 90);
    const newIdx = (idx + steps + 4) % 4;
    return order[newIdx];
  }

  /**
   * Rotates heading counter-clockwise by degrees
   * @param {'N'|'E'|'S'|'W'} heading
   * @param {number} degrees
   * @returns {'N'|'E'|'S'|'W'}
   */
  static rotateCCW(heading, degrees = 90) {
    return Heading.rotateCW(heading, -degrees);
  }

  /**
   * Returns angle in degrees (North = 0°, East = 90°, South = 180°, West = 270°)
   * @param {'N'|'E'|'S'|'W'} heading
   * @returns {number}
   */
  static toAngle(heading) {
    switch (heading?.toUpperCase()) {
      case Heading.NORTH: return 0;
      case Heading.EAST: return 90;
      case Heading.SOUTH: return 180;
      case Heading.WEST: return 270;
      default: return 0;
    }
  }
}
