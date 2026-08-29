/**
 * Mulberry32 Seeded Pseudo-Random Number Generator
 */

export class PRNG {
  /**
   * @param {number|string} seed
   */
  constructor(seed = Date.now()) {
    this.initialSeed = seed;
    this.seed = typeof seed === 'string' ? PRNG.hashString(seed) : (seed >>> 0);
  }

  /**
   * Hash a string to a 32-bit unsigned integer
   * @param {string} str
   * @returns {number}
   */
  static hashString(str) {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return (hash >>> 0);
  }

  /**
   * Resets PRNG to original seed
   */
  reset() {
    this.seed = typeof this.initialSeed === 'string' ? PRNG.hashString(this.initialSeed) : (this.initialSeed >>> 0);
  }

  /**
   * Generates a float in [0, 1)
   * @returns {number}
   */
  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a float in [min, max)
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  randFloat(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  /**
   * Generates an integer in [min, max] inclusive
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  randInt(min, max) {
    return Math.floor(this.randFloat(min, max + 1));
  }

  /**
   * Returns a random element from an array
   * @template T
   * @param {T[]} array
   * @returns {T}
   */
  choice(array) {
    if (!array || array.length === 0) return null;
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }

  /**
   * In-place or cloned Fisher-Yates array shuffle
   * @template T
   * @param {T[]} array
   * @param {boolean} [inPlace=false]
   * @returns {T[]}
   */
  shuffle(array, inPlace = false) {
    const arr = inPlace ? array : [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
