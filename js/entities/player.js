/**
 * Player Entity
 * Handles position, elevation state, inventory, movement smoothing, and rendering.
 */

import { ELEVATION, DEFAULTS, EXPLORER_OUTFITS, CHARACTER_CUSTOMIZATION } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';

function drawRoundRect(ctx, x, y, w, h, r = 0) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else if (typeof ctx.rect === 'function') {
    ctx.rect(x, y, w, h);
  }
}

export class Player {
  /**
   * @param {number} startX Grid X
   * @param {number} startY Grid Y
   * @param {number} [startElevation=0]
   * @param {number} [tileSize=32]
   * @param {string[]} [initialInventory=[]]
   * @param {string} [outfitId=null]
   * @param {object} [customization=null]
   */
  constructor(startX = 1, startY = 1, startElevation = 0, tileSize = 32, initialInventory = [], outfitId = null, customization = null) {
    this.gridX = startX;
    this.gridY = startY;
    this.gridZ = startElevation;
    this.fromGridX = startX;
    this.fromGridY = startY;
    this.targetGridX = startX;
    this.targetGridY = startY;

    this.elevation = startElevation;
    this.targetElevation = startElevation;

    this.tileSize = tileSize;
    this.worldX = startX * tileSize + tileSize / 2;
    this.worldY = startY * tileSize + tileSize / 2;

    this.inventory = Array.isArray(initialInventory) ? [...initialInventory] : []; // Array of key IDs e.g. ["key_gold_1"]
    this.score = 0;
    this.carriedItems = [];
    this.carriedRiddleItem = null;
    this.facing = 'south'; // 'north' | 'south' | 'east' | 'west'

    this.isMoving = false;
    this.moveProgress = 0; // 0 to 1
    this.speed = DEFAULTS.PLAYER_SPEED; // tiles per second
    this.stepsTaken = 0;

    // Visual bobbing and glow pulse
    this.pulseTimer = 0;

    // Explorer Outfit & Wardrobe Palette (BL-78)
    let savedOutfit = 'classic';
    let savedCustomization = null;
    try {
      if (typeof StorageManager !== 'undefined') {
        if (typeof StorageManager.getPlayerOutfit === 'function') {
          savedOutfit = StorageManager.getPlayerOutfit();
        }
        if (typeof StorageManager.getPlayerCustomization === 'function') {
          savedCustomization = StorageManager.getPlayerCustomization();
        }
      }
    } catch (_) {}

    this.outfitId = outfitId || savedOutfit;
    this.palette = EXPLORER_OUTFITS[this.outfitId] || EXPLORER_OUTFITS.classic;
    this.customization = customization || savedCustomization || {
      gender: 'male',
      hairStyle: 'short',
      hairColor: 'brunette',
      skinTone: 'fair',
    };

    this._outfitListener = (e) => {
      if (e?.detail?.outfitId) {
        this.setOutfit(e.detail.outfitId);
      }
    };
    this._customizationListener = (e) => {
      if (e?.detail) {
        this.setCustomization(e.detail);
      }
    };
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('player:outfit_changed', this._outfitListener);
      window.addEventListener('player:customization_changed', this._customizationListener);
    }
  }

  /**
   * Update active explorer outfit and colorway palette (BL-78)
   * @param {string} outfitId
   */
  setOutfit(outfitId) {
    if (EXPLORER_OUTFITS[outfitId]) {
      this.outfitId = outfitId;
      this.palette = EXPLORER_OUTFITS[outfitId];
    }
  }

  /**
   * Update active explorer character visual customization (BL-95, ADR-0014)
   * @param {object} customization
   */
  setCustomization(customization) {
    if (customization && typeof customization === 'object') {
      this.customization = {
        ...this.customization,
        ...customization,
      };
    }
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    if (typeof window !== 'undefined' && window.removeEventListener) {
      if (this._outfitListener) {
        window.removeEventListener('player:outfit_changed', this._outfitListener);
      }
      if (this._customizationListener) {
        window.removeEventListener('player:customization_changed', this._customizationListener);
      }
    }
  }

  get x() {
    return this.gridX;
  }

  set x(value) {
    this.gridX = value;
    this.fromGridX = value;
    this.targetGridX = value;
    this.worldX = value * this.tileSize + this.tileSize / 2;
  }

  get y() {
    return this.gridY;
  }

  set y(value) {
    this.gridY = value;
    this.fromGridY = value;
    this.targetGridY = value;
    this.worldY = value * this.tileSize + this.tileSize / 2;
  }

  get z() {
    return this.elevation;
  }

  set z(value) {
    this.elevation = value;
    this.gridZ = value;
  }

  /**
   * Returns current canonical (X, Y, Z) coordinate string
   * @returns {string} E.g. "(6, 6, 1)"
   */
  getCoordString() {
    return `(${this.gridX}, ${this.gridY}, ${this.elevation ?? 0})`;
  }

  /**
   * Check if player holds a specific key ID
   * @param {string} keyId
   * @returns {boolean}
   */
  hasKey(keyId) {
    return this.inventory.includes(keyId);
  }

  /**
   * Add a key to inventory
   * @param {string} keyId
   */
  addKey(keyId) {
    if (!this.inventory.includes(keyId)) {
      this.inventory.push(keyId);
    }
  }

  /**
   * Add bonus score points
   * @param {number} points
   */
  addScore(points) {
    this.score = (this.score || 0) + (Number(points) || 0);
  }

  /**
   * Add a carried utility item
   * @param {object} item
   */
  addCarriedItem(item) {
    if (!this.carriedItems) this.carriedItems = [];
    this.carriedItems.push(item);
  }

  /**
   * Check if player carries an item by type or id
   * @param {string} idOrType
   * @returns {boolean}
   */
  hasItem(idOrType) {
    const inCarried = (this.carriedItems || []).some(item => item.id === idOrType || item.itemType === idOrType);
    const inInventory = (this.inventory || []).includes(idOrType);
    return inCarried || inInventory;
  }

  /**
   * Check if player holds a torch
   * @returns {boolean}
   */
  hasTorch() {
    return this.hasItem('torch');
  }

  /**
   * Pick up a carryable riddle item
   * @param {object} item
   * @returns {object}
   */
  pickUpRiddleItem(item) {
    this.carriedRiddleItem = item;
    if (item && typeof item.pickup === 'function') {
      item.pickup();
    }
    return item;
  }

  /**
   * Drop currently carried riddle item to target coordinates
   * @param {number} x
   * @param {number} y
   * @param {number} [elevation]
   * @returns {object|null}
   */
  dropRiddleItem(x, y, elevation = this.elevation) {
    const item = this.carriedRiddleItem;
    if (item) {
      if (typeof item.drop === 'function') {
        item.drop(x, y, elevation);
      }
      this.carriedRiddleItem = null;
    }
    return item;
  }

  /**
   * Place currently carried riddle item onto an environmental pedestal
   * @param {object} pedestal
   * @returns {boolean}
   */
  placeRiddleItem(pedestal) {
    const item = this.carriedRiddleItem;
    if (item && pedestal) {
      if (typeof pedestal.placeItem === 'function') {
        pedestal.placeItem(item);
      }
      this.carriedRiddleItem = null;
      return true;
    }
    return false;
  }

  /**
   * Check if player is carrying a riddle item
   * @returns {boolean}
   */
  hasCarriedRiddleItem() {
    return Boolean(this.carriedRiddleItem);
  }

  /**
   * Reset player to initial spawn coordinates
   * @param {number} spawnX
   * @param {number} spawnY
   * @param {number} elevation
   * @param {string[]} [initialInventory=[]]
   * @param {number} [initialScore=0]
   * @param {Array<object>} [initialCarriedItems=[]]
   * @param {object|null} [initialCarriedRiddleItem=null]
   */
  reset(spawnX, spawnY, elevation = 0, initialInventory = [], initialScore = 0, initialCarriedItems = [], initialCarriedRiddleItem = null) {
    this.gridX = spawnX;
    this.gridY = spawnY;
    this.gridZ = elevation;
    this.fromGridX = spawnX;
    this.fromGridY = spawnY;
    this.targetGridX = spawnX;
    this.targetGridY = spawnY;
    this.elevation = elevation;
    this.targetElevation = elevation;

    this.worldX = spawnX * this.tileSize + this.tileSize / 2;
    this.worldY = spawnY * this.tileSize + this.tileSize / 2;

    this.inventory = Array.isArray(initialInventory) ? [...initialInventory] : [];
    this.score = initialScore || 0;
    this.carriedItems = Array.isArray(initialCarriedItems) ? [...initialCarriedItems] : [];
    this.carriedRiddleItem = initialCarriedRiddleItem || null;
    this.facing = 'south';
    this.isMoving = false;
    this.moveProgress = 0;
    this.stepsTaken = 0;
  }

  /**
   * Teleport player directly to target coordinates without resetting inventory or score
   * @param {number} x
   * @param {number} y
   * @param {number} [elevation=0]
   */
  teleport(x, y, elevation = 0) {
    this.gridX = x;
    this.gridY = y;
    this.gridZ = elevation;
    this.fromGridX = x;
    this.fromGridY = y;
    this.targetGridX = x;
    this.targetGridY = y;
    this.elevation = elevation;
    this.targetElevation = elevation;
    this.worldX = x * this.tileSize + this.tileSize / 2;
    this.worldY = y * this.tileSize + this.tileSize / 2;
    this.isMoving = false;
    this.moveProgress = 0;
  }

  /**
   * Update active tile size and recalibrate world coordinate centering
   * @param {number} size
   */
  setTileSize(size) {
    if (typeof size !== 'number' || size <= 0 || size === this.tileSize) return;
    this.tileSize = size;
    if (this.isMoving) {
      const fromWorldX = this.fromGridX * this.tileSize + this.tileSize / 2;
      const fromWorldY = this.fromGridY * this.tileSize + this.tileSize / 2;
      const toWorldX = this.targetGridX * this.tileSize + this.tileSize / 2;
      const toWorldY = this.targetGridY * this.tileSize + this.tileSize / 2;
      const t = this.moveProgress;
      const smoothT = t * t * (3 - 2 * t);
      this.worldX = fromWorldX + (toWorldX - fromWorldX) * smoothT;
      this.worldY = fromWorldY + (toWorldY - fromWorldY) * smoothT;
    } else {
      this.worldX = this.gridX * this.tileSize + this.tileSize / 2;
      this.worldY = this.gridY * this.tileSize + this.tileSize / 2;
    }
  }

  /**
   * Set player cardinal facing with automatic alias normalization
   * @param {string} dir 'north'|'south'|'east'|'west'|'up'|'down'|'left'|'right'
   */
  setFacing(dir) {
    if (!dir) return;
    const map = {
      up: 'north',
      down: 'south',
      left: 'west',
      right: 'east',
      north: 'north',
      south: 'south',
      east: 'east',
      west: 'west',
    };
    const norm = map[String(dir).toLowerCase()];
    if (norm) {
      this.facing = norm;
    }
  }

  /**
   * Translate world facing ('north', 'south', 'east', 'west') to screen facing given camera rotation
   * @param {'north'|'south'|'east'|'west'|string} worldFacing
   * @param {number} [rotationAngle=0]
   * @returns {'north'|'south'|'east'|'west'}
   */
  getScreenFacing(worldFacing, rotationAngle = 0) {
    const map = {
      up: 'north',
      down: 'south',
      left: 'west',
      right: 'east',
      north: 'north',
      south: 'south',
      east: 'east',
      west: 'west',
    };
    const norm = map[String(worldFacing).toLowerCase()] || 'south';
    const angle = ((Math.round(rotationAngle) % 360) + 360) % 360;
    if (angle === 90) {
      if (norm === 'north') return 'west';
      if (norm === 'south') return 'east';
      if (norm === 'east') return 'north';
      if (norm === 'west') return 'south';
    } else if (angle === 180) {
      if (norm === 'north') return 'south';
      if (norm === 'south') return 'north';
      if (norm === 'east') return 'west';
      if (norm === 'west') return 'east';
    } else if (angle === 270) {
      if (norm === 'north') return 'east';
      if (norm === 'south') return 'west';
      if (norm === 'east') return 'south';
      if (norm === 'west') return 'north';
    }
    return norm;
  }

  /**
   * Initiate a step move to an adjacent grid cell
   * @param {number} targetX
   * @param {number} targetY
   * @param {number} nextElevation
   */
  startMove(targetX, targetY, nextElevation = this.elevation) {
    if (this.isMoving) return;

    this.fromGridX = this.gridX;
    this.fromGridY = this.gridY;
    this.targetGridX = targetX;
    this.targetGridY = targetY;
    this.targetElevation = nextElevation;

    const dx = targetX - this.gridX;
    const dy = targetY - this.gridY;

    if (dx > 0) this.facing = 'east';
    else if (dx < 0) this.facing = 'west';
    else if (dy > 0) this.facing = 'south';
    else if (dy < 0) this.facing = 'north';

    this.isMoving = true;
    this.moveProgress = 0;
    this.stepsTaken++;
  }

  /**
   * Update movement interpolation
   * @param {number} dt
   */
  update(dt) {
    this.pulseTimer += dt * 4;

    if (this.isMoving) {
      this.moveProgress += dt * this.speed;

      if (this.moveProgress >= 1) {
        this.moveProgress = 1;
        this.gridX = this.targetGridX;
        this.gridY = this.targetGridY;
        this.elevation = this.targetElevation;
        this.gridZ = this.targetElevation;
        this.isMoving = false;
      }

      // Smooth step easing
      const t = this.moveProgress;
      const smoothT = t * t * (3 - 2 * t);

      const fromWorldX = this.fromGridX * this.tileSize + this.tileSize / 2;
      const fromWorldY = this.fromGridY * this.tileSize + this.tileSize / 2;
      const toWorldX = this.targetGridX * this.tileSize + this.tileSize / 2;
      const toWorldY = this.targetGridY * this.tileSize + this.tileSize / 2;

      this.worldX = fromWorldX + (toWorldX - fromWorldX) * smoothT;
      this.worldY = fromWorldY + (toWorldY - fromWorldY) * smoothT;
    } else {
      this.worldX = this.gridX * this.tileSize + this.tileSize / 2;
      this.worldY = this.gridY * this.tileSize + this.tileSize / 2;
    }
  }

  /**
   * Add key to player inventory
   * @param {string} keyId
   */
  addKey(keyId) {
    if (!this.inventory.includes(keyId)) {
      this.inventory.push(keyId);
    }
  }

  /**
   * Remove key from player inventory upon using
   * @param {string} keyId
   */
  removeKey(keyId) {
    this.inventory = this.inventory.filter(id => id !== keyId);
  }

  /**
   * Render player avatar (Human Explorer: Blue Jeans, Flannel Shirt, Brown Backpack)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX Center screen pixel X
   * @param {number} screenY Center screen pixel Y
   * @param {number} tileSize
   * @param {'angled'|'topdown'} [perspective='angled']
   * @param {number} [rotationAngle=0]
   */
  render(ctx, screenX, screenY, tileSize, perspective = 'angled', rotationAngle = 0) {
    if (perspective === 'topdown') {
      this.renderTopDownExplorer(ctx, screenX, screenY, tileSize, rotationAngle);
    } else {
      this.renderAngledExplorer(ctx, screenX, screenY, tileSize, rotationAngle);
    }
  }

  /**
   * Render 2.5D explorer sprite centered at (screenX, screenY)
   * Compatibility alias for profile and UI previews (BL-115)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} [tileSize=32]
   * @param {number} [rotationAngle=0]
   */
  drawExplorerSprite(ctx, screenX, screenY, tileSize = 32, rotationAngle = 0) {
    this.renderAngledExplorer(ctx, screenX, screenY, tileSize, rotationAngle);
  }

  /**
   * Render 2.5D Angled Explorer (Flannel shirt, blue jeans, brown backpack)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   * @param {number} [rotationAngle=0]
   */
  renderAngledExplorer(ctx, screenX, screenY, tileSize, rotationAngle = 0) {
    const isOverhead = this.elevation === ELEVATION.OVERHEAD;
    const s = tileSize / 32;
    const stepCycle = this.isMoving ? this.moveProgress * Math.PI * 2 : 0;
    const walkBob = this.isMoving ? Math.abs(Math.sin(stepCycle)) * (2.5 * s) : Math.sin(this.pulseTimer * 1.5) * (0.6 * s);
    const legStride = this.isMoving ? Math.sin(stepCycle) * (4 * s) : 0;
    const armStride = this.isMoving ? -Math.sin(stepCycle) * (3.5 * s) : 0;
    const pulse = Math.sin(this.pulseTimer) * 0.15 + 0.85;

    ctx.save();

    // 1. Drop Shadow on the floor beneath feet
    const shadowY = screenY + (isOverhead ? 16 * s : 11 * s);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(screenX, shadowY, 9 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Elevation Indicator Ring (when overhead)
    if (isOverhead) {
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 * pulse})`;
      ctx.lineWidth = Math.max(1.5, 2 * s);
      ctx.beginPath();
      ctx.ellipse(screenX, shadowY, 13 * s, 5.5 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const py = screenY - walkBob;

    // Directional flags mapped to screen orientation
    const screenFacing = this.getScreenFacing(this.facing, rotationAngle);
    const isNorth = screenFacing === 'north';
    const isSouth = screenFacing === 'south';
    const isEast = screenFacing === 'east';
    const isWest = screenFacing === 'west';

    const p = this.palette || EXPLORER_OUTFITS.classic;
    const custom = this.customization || {};
    const archetype = custom.archetype || 'adventurer';
    const primaryColor = custom.primaryColor || p.shirt;
    const secondaryColor = custom.secondaryColor || p.shirtDark;
    const skinColor = CHARACTER_CUSTOMIZATION?.SKIN_TONES?.[custom.skinTone]?.color || p.skin;
    const hairColor = CHARACTER_CUSTOMIZATION?.HAIR_COLORS?.[custom.hairColor]?.color || p.hair;
    const hairStyle = custom.hairStyle || 'short';
    const isFemale = custom.gender === 'female';

    // 3. Explorer Back Gear (Drawn behind body when facing south, or on back when facing north/east/west)
    const drawBackpack = (x, y, scale = 1, isBackView = false) => {
      ctx.save();

      if (archetype === 'fighter' || archetype === 'paladin') {
        // Shield strapped to back
        ctx.fillStyle = secondaryColor;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.ellipse(x, y, 7 * s * scale, 9 * s * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(x, y, 3 * s * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      if (archetype === 'wizard' || archetype === 'rogue') {
        // Flowing Cloak / Mantle
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(x - 6.5 * s * scale, y - 6 * s * scale);
        ctx.lineTo(x + 6.5 * s * scale, y - 6 * s * scale);
        ctx.lineTo(x + 8 * s * scale, y + 10 * s * scale);
        ctx.lineTo(x - 8 * s * scale, y + 10 * s * scale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return;
      }

      if (archetype === 'ranger') {
        // Wooden Quiver with Arrow Fletchings
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(x - 3 * s * scale, y - 8 * s * scale, 6 * s * scale, 14 * s * scale);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x - 2 * s * scale, y - 11 * s * scale, 1.5 * s * scale, 3 * s * scale);
        ctx.fillRect(x + 0.8 * s * scale, y - 11 * s * scale, 1.5 * s * scale, 3 * s * scale);
        ctx.restore();
        return;
      }

      if (archetype === 'bard') {
        // Slung Lute Instrument
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(x, y + 2 * s * scale, 5 * s * scale, 7 * s * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x - 1.5 * s * scale, y - 9 * s * scale, 3 * s * scale, 8 * s * scale);
        ctx.restore();
        return;
      }

      if (archetype === 'cleric') {
        // Sacred Relic Pouch
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(x - 5 * s * scale, y - 5 * s * scale, 10 * s * scale, 11 * s * scale);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x, y + 0.5 * s * scale, 2.5 * s * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      // Classic Adventurer Backpack
      ctx.fillStyle = p.pack;
      ctx.strokeStyle = p.packDark;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      drawRoundRect(ctx, x - 6 * s * scale, y - 6 * s * scale, 12 * s * scale, 12 * s * scale, 3 * s);
      ctx.fill();
      ctx.stroke();

      // Flap
      ctx.fillStyle = p.packFlap;
      ctx.beginPath();
      drawRoundRect(ctx, x - 5.5 * s * scale, y - 6 * s * scale, 11 * s * scale, 5 * s * scale, 2 * s);
      ctx.fill();

      // Brass Buckle / clasp
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 1.5 * s * scale, y - 1.5 * s * scale, 3 * s * scale, 2 * s * scale);

      // Bedroll / blanket strapped to top
      ctx.fillStyle = p.bedroll;
      ctx.beginPath();
      drawRoundRect(ctx, x - 7 * s * scale, y - 9.5 * s * scale, 14 * s * scale, 4 * s * scale, 2 * s);
      ctx.fill();
      ctx.strokeStyle = p.packDark;
      ctx.stroke();

      // Bedroll tie straps
      ctx.fillStyle = p.packDark;
      ctx.fillRect(x - 4 * s * scale, y - 9.5 * s * scale, 1.5 * s * scale, 4 * s * scale);
      ctx.fillRect(x + 2.5 * s * scale, y - 9.5 * s * scale, 1.5 * s * scale, 4 * s * scale);

      ctx.restore();
    };

    // If facing South, draw backpack behind torso first so edges peek through
    if (isSouth) {
      drawBackpack(screenX, py - 4 * s, 0.95);
    }

    // 4. Pants & Boots (Legs)
    const drawLeg = (lx, ly, offset, footOffset) => {
      // Pants leg
      ctx.fillStyle = p.pants;
      ctx.fillRect(lx - 2.5 * s, ly, 5 * s, 6 * s);

      // Seam & cuff
      ctx.fillStyle = p.pantsDark;
      ctx.fillRect(lx - 2.5 * s, ly + 5 * s, 5 * s, 1.2 * s);

      // Hiking Boot
      ctx.fillStyle = p.boots;
      ctx.fillRect(lx - 3 * s + footOffset, ly + 6 * s, 6 * s, 3.2 * s);
      // Sole
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(lx - 3.2 * s + footOffset, ly + 8.2 * s, 6.4 * s, 1.4 * s);
      // Laces / highlight
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(lx - 1 * s + footOffset, ly + 6.5 * s, 2 * s, 1 * s);
    };

    if (isEast) {
      // Side profile: back leg + front leg
      drawLeg(screenX - 1 * s - legStride, py + 2 * s, 0, 1.5 * s);
      drawLeg(screenX + 1 * s + legStride, py + 2 * s, 0, 1.5 * s);
    } else if (isWest) {
      // Side profile: back leg + front leg
      drawLeg(screenX + 1 * s - legStride, py + 2 * s, 0, -1.5 * s);
      drawLeg(screenX - 1 * s + legStride, py + 2 * s, 0, -1.5 * s);
    } else {
      // South or North: two parallel legs
      drawLeg(screenX - 4 * s, py + 2 * s + legStride, 0, 0);
      drawLeg(screenX + 4 * s, py + 2 * s - legStride, 0, 0);
    }

    // Belt
    ctx.fillStyle = '#78350f';
    ctx.fillRect(screenX - 6.5 * s, py + 1.2 * s, 13 * s, 1.8 * s);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(screenX - 1.5 * s, py + 1.2 * s, 3 * s, 1.8 * s);

    // 5. Torso Garments (Archetype-specific)
    const torsoW = (isEast || isWest) ? 10 * s : 13 * s;
    const torsoH = 9 * s;
    const torsoX = screenX - torsoW / 2;
    const torsoY = py - 7 * s;

    if (archetype === 'fighter' || archetype === 'paladin') {
      // Plate Armor Breastplate
      ctx.fillStyle = primaryColor;
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(torsoX, torsoY, torsoW, 2 * s);
      ctx.fillRect(torsoX, torsoY + torsoH - 2 * s, torsoW, 2 * s);
      ctx.fillRect(screenX - 1 * s, torsoY, 2 * s, torsoH);
      // Brass rivets
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(torsoX + 1.5 * s, torsoY + 3.5 * s, 1.5 * s, 1.5 * s);
      ctx.fillRect(torsoX + torsoW - 3 * s, torsoY + 3.5 * s, 1.5 * s, 1.5 * s);
    } else if (archetype === 'wizard' || archetype === 'cleric') {
      // Mystic Robes
      ctx.fillStyle = primaryColor;
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(screenX - 2.5 * s, torsoY, 5 * s, torsoH);
      // Holy/Mystic medallion
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(screenX, torsoY + 4 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (archetype === 'rogue') {
      // Leather Jerkin
      ctx.fillStyle = primaryColor;
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(torsoX, torsoY + 2 * s, torsoW, 2 * s);
      ctx.fillRect(torsoX + 2 * s, torsoY, 2 * s, torsoH);
      ctx.fillRect(torsoX + torsoW - 4 * s, torsoY, 2 * s, torsoH);
    } else if (archetype === 'ranger') {
      // Huntsman Tunic with diagonal quiver baldric
      ctx.fillStyle = primaryColor;
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(torsoX + 2 * s, torsoY + 1 * s, torsoW - 4 * s, 2.5 * s);
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(torsoX, torsoY);
      ctx.lineTo(torsoX + 3 * s, torsoY);
      ctx.lineTo(torsoX + torsoW, torsoY + torsoH);
      ctx.lineTo(torsoX + torsoW - 3 * s, torsoY + torsoH);
      ctx.closePath();
      ctx.fill();
    } else if (archetype === 'bard') {
      // Doublet with ornate bands
      ctx.fillStyle = primaryColor;
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(screenX - 2 * s, torsoY, 4 * s, torsoH);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(screenX - 3.5 * s, torsoY + 2.5 * s, 7 * s, 1.5 * s);
      ctx.fillRect(screenX - 3.5 * s, torsoY + 5.5 * s, 7 * s, 1.5 * s);
    } else {
      // Adventurer Plaid Flannel Shirt
      ctx.fillStyle = primaryColor;
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(torsoX, torsoY + 2 * s, torsoW, 2 * s);
      ctx.fillRect(torsoX, torsoY + 6 * s, torsoW, 2 * s);
      if (isEast || isWest) {
        ctx.fillRect(torsoX + 3 * s, torsoY, 2 * s, torsoH);
        ctx.fillRect(torsoX + 7 * s, torsoY, 2 * s, torsoH);
      } else {
        ctx.fillRect(torsoX + 2.5 * s, torsoY, 2 * s, torsoH);
        ctx.fillRect(torsoX + 8.5 * s, torsoY, 2 * s, torsoH);
      }
    }

    // Details for South Facing (Front Buttons & Straps)
    if (isSouth) {
      if (archetype === 'adventurer') {
        // Placket
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(screenX - 1.2 * s, torsoY, 2.4 * s, torsoH);
        // Buttons
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(screenX - 0.7 * s, torsoY + 1.5 * s, 1.4 * s, 1.4 * s);
        ctx.fillRect(screenX - 0.7 * s, torsoY + 4 * s, 1.4 * s, 1.4 * s);
        ctx.fillRect(screenX - 0.7 * s, torsoY + 6.5 * s, 1.4 * s, 1.4 * s);
        // Backpack straps
        ctx.fillStyle = p.packDark;
        ctx.fillRect(screenX - 5 * s, torsoY, 2 * s, torsoH);
        ctx.fillRect(screenX + 3 * s, torsoY, 2 * s, torsoH);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(screenX - 5.2 * s, torsoY + 4 * s, 2.4 * s, 1.5 * s);
        ctx.fillRect(screenX + 2.8 * s, torsoY + 4 * s, 2.4 * s, 1.5 * s);
      }
    }

    // If facing North: Draw backpack ON TOP of the shirt back!
    if (isNorth) {
      drawBackpack(screenX, py - 4 * s, 1.05, true);
    }

    // If facing East: Draw backpack on the left (West side)
    if (isEast) {
      drawBackpack(screenX - 6 * s, py - 4 * s, 0.9);
    }

    // If facing West: Draw backpack on the right (East side)
    if (isWest) {
      drawBackpack(screenX + 6 * s, py - 4 * s, 0.9);
    }

    // 6. Arms & Sleeves
    const drawArm = (ax, ay, swing) => {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(ax - 2 * s, ay, 4 * s, 7 * s);
      // Cuff
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(ax - 2 * s, ay + 5.5 * s, 4 * s, 1.5 * s);
      // Hand (Skin tone)
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(ax, ay + 8 * s + swing * 0.3, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    };

    if (isSouth || isNorth) {
      drawArm(screenX - 7.5 * s, torsoY + 1 * s, armStride);
      drawArm(screenX + 7.5 * s, torsoY + 1 * s, -armStride);
    } else if (isEast) {
      drawArm(screenX + 1 * s, torsoY + 1 * s, armStride);
    } else if (isWest) {
      drawArm(screenX - 1 * s, torsoY + 1 * s, -armStride);
    }

    // 7. Head & Adventure Hair (BL-95 Customization)
    const headY = py - 12.5 * s;
    const headR = isFemale ? 5.2 * s : 5.5 * s;

    // Face Skin Base
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(screenX + (isEast ? 1 * s : isWest ? -1 * s : 0), headY + 1 * s, headR, 0, Math.PI * 2);
    ctx.fill();

    // Hair Base & Texture (respecting hair style)
    if (hairStyle !== 'bald') {
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      // Hair cap
      ctx.arc(screenX, headY - 1 * s, headR + 0.8 * s, Math.PI, Math.PI * 2);
      ctx.fill();

      // Side tufts / curls / bob
      if (hairStyle === 'bob') {
        ctx.fillRect(screenX - 5.5 * s, headY - 1 * s, 2.5 * s, 6 * s);
        ctx.fillRect(screenX + 3.0 * s, headY - 1 * s, 2.5 * s, 6 * s);
      } else if (hairStyle === 'curls') {
        ctx.beginPath();
        ctx.arc(screenX - 5 * s, headY - 1 * s, 3 * s, 0, Math.PI * 2);
        ctx.arc(screenX + 5 * s, headY - 1 * s, 3 * s, 0, Math.PI * 2);
        ctx.arc(screenX - 4.5 * s, headY + 2 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.arc(screenX + 4.5 * s, headY + 2 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // short or ponytail tufts
        ctx.beginPath();
        ctx.arc(screenX - 4.5 * s, headY - 1 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.arc(screenX + 4.5 * s, headY - 1 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ponytail specific extension
      if (hairStyle === 'ponytail') {
        const ponySwing = this.isMoving ? Math.sin(stepCycle) * 3 * s : 0;
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        if (isNorth) {
          ctx.arc(screenX + ponySwing, headY - 5 * s, 3.5 * s, 0, Math.PI * 2);
          ctx.fillRect(screenX - 2.5 * s + ponySwing, headY - 5 * s, 5 * s, 7 * s);
        } else if (isSouth) {
          // Peek behind head
          ctx.arc(screenX + 3.5 * s + ponySwing, headY - 4 * s, 3 * s, 0, Math.PI * 2);
        } else if (isEast) {
          ctx.arc(screenX - 5 * s + ponySwing, headY - 3 * s, 3.5 * s, 0, Math.PI * 2);
          ctx.fillRect(screenX - 7 * s + ponySwing, headY - 3 * s, 4 * s, 6 * s);
        } else if (isWest) {
          ctx.arc(screenX + 5 * s + ponySwing, headY - 3 * s, 3.5 * s, 0, Math.PI * 2);
          ctx.fillRect(screenX + 3 * s + ponySwing, headY - 3 * s, 4 * s, 6 * s);
        }
        ctx.fill();
      }
    } else {
      // Bald / Cap: draw explorer cap
      ctx.fillStyle = p.cap || '#991b1b';
      ctx.beginPath();
      ctx.arc(screenX, headY - 0.5 * s, headR + 0.6 * s, Math.PI, Math.PI * 2);
      ctx.fill();
      // Cap visor
      ctx.fillRect(screenX - (isWest ? 6.5 * s : 5 * s), headY - 1 * s, (isEast || isWest ? 11 * s : 10 * s), 2 * s);
    }

    if (isNorth) {
      if (hairStyle !== 'bald') {
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(screenX, headY, headR + 0.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (isSouth) {
      if (hairStyle !== 'bald') {
        // Bangs / fringe
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.moveTo(screenX - 5 * s, headY - 2 * s);
        ctx.lineTo(screenX - 2 * s, headY + 0.5 * s);
        ctx.lineTo(screenX, headY - 1 * s);
        ctx.lineTo(screenX + 3 * s, headY + 0.8 * s);
        ctx.lineTo(screenX + 5 * s, headY - 2 * s);
        ctx.closePath();
        ctx.fill();
      }

      // Expressive Eyes (with lashes for female presentation)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(screenX - 2.2 * s, headY + 2 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.arc(screenX + 2.2 * s, headY + 2 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();

      if (isFemale) {
        // Eyelashes
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.9 * s;
        ctx.beginPath();
        ctx.moveTo(screenX - 3.4 * s, headY + 1.2 * s);
        ctx.lineTo(screenX - 2.2 * s, headY + 0.9 * s);
        ctx.moveTo(screenX + 3.4 * s, headY + 1.2 * s);
        ctx.lineTo(screenX + 2.2 * s, headY + 0.9 * s);
        ctx.stroke();
      }

      // Eye catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX - 2.6 * s, headY + 1.6 * s, 0.5 * s, 0, Math.PI * 2);
      ctx.arc(screenX + 1.8 * s, headY + 1.6 * s, 0.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = isFemale ? '#9f1239' : '#7c2d12';
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.arc(screenX, headY + 3.6 * s, 2 * s, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else if (isEast) {
      // Profile eyes facing right
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(screenX + 3.5 * s, headY + 2 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
      if (isFemale) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.9 * s;
        ctx.beginPath();
        ctx.moveTo(screenX + 4.5 * s, headY + 1.2 * s);
        ctx.lineTo(screenX + 3.5 * s, headY + 0.9 * s);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX + 3.8 * s, headY + 1.6 * s, 0.5 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (isWest) {
      // Profile eyes facing left
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(screenX - 3.5 * s, headY + 2 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
      if (isFemale) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.9 * s;
        ctx.beginPath();
        ctx.moveTo(screenX - 4.5 * s, headY + 1.2 * s);
        ctx.lineTo(screenX - 3.5 * s, headY + 0.9 * s);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX - 3.8 * s, headY + 1.6 * s, 0.5 * s, 0, Math.PI * 2);
    }

    // 8. Archetype Headgear & Accents
    if (archetype === 'wizard') {
      // Conical Wizard Hat
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(screenX - 7 * s, headY - 1.5 * s);
      ctx.lineTo(screenX + 7 * s, headY - 1.5 * s);
      ctx.lineTo(screenX, headY - 14 * s);
      ctx.closePath();
      ctx.fill();
      // Hat Brim
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(screenX - 8.5 * s, headY - 2.5 * s, 17 * s, 2.5 * s);
      // Gold Star / Rune
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(screenX, headY - 7 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (archetype === 'fighter') {
      // Warrior Iron Helm
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(screenX, headY - 1 * s, headR + 1 * s, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(screenX - (headR + 1 * s), headY - 2 * s, (headR + 1 * s) * 2, 2.5 * s);
    } else if (archetype === 'paladin') {
      // Greathelm with Golden Crest
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(screenX, headY - 1 * s, headR + 1 * s, Math.PI, Math.PI * 2);
      ctx.fill();
      // Golden Crown Crest
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(screenX - 2 * s, headY - 9 * s, 4 * s, 5 * s);
      ctx.fillRect(screenX - 4 * s, headY - 7 * s, 8 * s, 3 * s);
    } else if (archetype === 'rogue') {
      // Shadow Cowl Hood
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.arc(screenX, headY - 1.5 * s, headR + 1.2 * s, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
    } else if (archetype === 'cleric') {
      // Radiant Sun Circlet
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.ellipse(screenX, headY - 5 * s, 7 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (archetype === 'ranger') {
      // Huntsman Cap with Plumage
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.ellipse(screenX, headY - 2 * s, 6.5 * s, 3.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Crimson/Gold Feather
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(screenX + 3 * s, headY - 2 * s);
      ctx.lineTo(screenX + 7 * s, headY - 8 * s);
      ctx.lineTo(screenX + 4.5 * s, headY - 3 * s);
      ctx.closePath();
      ctx.fill();
    } else if (archetype === 'bard') {
      // Feathered Beret
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.ellipse(screenX + 1 * s, headY - 3 * s, 7 * s, 3.5 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.arc(screenX - 2 * s, headY - 3 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render Top-Down Explorer (Orthographic plan view of human explorer)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   * @param {number} [rotationAngle=0]
   */
  renderTopDownExplorer(ctx, screenX, screenY, tileSize, rotationAngle = 0) {
    const isOverhead = this.elevation === ELEVATION.OVERHEAD;
    const s = tileSize / 32;
    const stepBob = this.isMoving ? Math.sin(this.moveProgress * Math.PI) * (1.5 * s) : 0;
    const pulse = Math.sin(this.pulseTimer) * 0.15 + 0.85;

    ctx.save();

    // 1. Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 2 * s, 10 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Overhead indicator
    if (isOverhead) {
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 * pulse})`;
      ctx.lineWidth = Math.max(1.5, 2 * s);
      ctx.beginPath();
      ctx.arc(screenX, screenY, 14 * s, 0, Math.PI * 2);
      ctx.stroke();
    }

    const py = screenY - stepBob;
    const screenFacing = this.getScreenFacing(this.facing, rotationAngle);
    const p = this.palette || EXPLORER_OUTFITS.classic;
    const custom = this.customization || {};
    const primaryColor = custom.primaryColor || p.shirt;
    const secondaryColor = custom.secondaryColor || p.shirtDark;

    // 2. Backpack (offset opposite facing)
    let packX = screenX;
    let packY = py;
    if (screenFacing === 'south') packY -= 5 * s;
    else if (screenFacing === 'north') packY += 5 * s;
    else if (screenFacing === 'east') packX -= 5 * s;
    else if (screenFacing === 'west') packX += 5 * s;

    ctx.fillStyle = p.pack;
    ctx.strokeStyle = p.packDark;
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    drawRoundRect(ctx, packX - 6 * s, packY - 5 * s, 12 * s, 10 * s, 3 * s);
    ctx.fill();
    ctx.stroke();

    // Bedroll on backpack
    ctx.fillStyle = p.bedroll;
    ctx.beginPath();
    drawRoundRect(ctx, packX - 5 * s, packY - 6.5 * s, 10 * s, 3 * s, 1.5 * s);
    ctx.fill();

    // 3. Shoulders with Outfit Pattern
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(screenX, py, 11 * s, 6.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outfit Secondary Trim / Plaid
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(screenX - 8 * s, py - 1 * s, 16 * s, 2 * s);
    ctx.fillRect(screenX - 4 * s, py - 2 * s, 2 * s, 4 * s);
    ctx.fillRect(screenX + 2 * s, py - 2 * s, 2 * s, 4 * s);

    // 4. Pants Cuffs Peeking (when moving)
    if (this.isMoving) {
      const legOffset = Math.sin(this.moveProgress * Math.PI * 2) * 3 * s;
      ctx.fillStyle = p.pants;
      if (screenFacing === 'south' || screenFacing === 'north') {
        ctx.fillRect(screenX - 5 * s, py + 5 * s + legOffset, 3 * s, 2 * s);
        ctx.fillRect(screenX + 2 * s, py + 5 * s - legOffset, 3 * s, 2 * s);
      } else {
        ctx.fillRect(screenX - 2 * s + legOffset, py + 5 * s, 4 * s, 2 * s);
      }
    }

    // 5. Head with Hair (BL-95 Customization)
    const hairColor = CHARACTER_CUSTOMIZATION?.HAIR_COLORS?.[custom.hairColor]?.color || p.hair;
    const hairStyle = custom.hairStyle || 'short';

    if (hairStyle === 'bald') {
      ctx.fillStyle = p.cap || '#991b1b';
      ctx.beginPath();
      ctx.arc(screenX, py - 1 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(screenX, py - 1 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();

      // Hair texture & tufts
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      if (hairStyle === 'curls') {
        ctx.arc(screenX - 4 * s, py - 2 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.arc(screenX + 4 * s, py - 2 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.arc(screenX, py - 5 * s, 3.5 * s, 0, Math.PI * 2);
      } else if (hairStyle === 'ponytail') {
        // Ponytail tuft sticking out back
        let pX = screenX;
        let pY = py - 1 * s;
        if (screenFacing === 'north') pY += 6 * s;
        else if (screenFacing === 'south') pY -= 6 * s;
        else if (screenFacing === 'east') pX -= 6 * s;
        else if (screenFacing === 'west') pX += 6 * s;
        ctx.arc(pX, pY, 3.8 * s, 0, Math.PI * 2);
      } else if (hairStyle === 'bob') {
        ctx.arc(screenX - 4 * s, py - 1 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.arc(screenX + 4 * s, py - 1 * s, 3.5 * s, 0, Math.PI * 2);
      } else {
        ctx.arc(screenX - 2 * s, py - 2 * s, 3 * s, 0, Math.PI * 2);
        ctx.arc(screenX + 2 * s, py - 2 * s, 3 * s, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // 6. Directional Facing Compass / Visor
    let dirX = 0;
    let dirY = 0;
    if (screenFacing === 'north') dirY = -7 * s;
    else if (screenFacing === 'south') dirY = 7 * s;
    else if (screenFacing === 'east') dirX = 7 * s;
    else if (screenFacing === 'west') dirX = -7 * s;

    // Golden compass needle / directional indicator
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(screenX + dirX, py + dirY, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // 7. Carried Riddle Item indicator floating above shoulder
    if (this.carriedRiddleItem) {
      const badgeX = screenX + 9 * s;
      const badgeY = py - 10 * s;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = this.carriedRiddleItem.color || '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 6.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = `${Math.round(8 * s)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.carriedRiddleItem.symbol || '🗿', badgeX, badgeY);
    }

    ctx.restore();
  }
}
