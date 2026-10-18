/**
 * InteractionDispatcher
 * Manages proximity detection, disambiguation, contextual interaction prompts,
 * and entity execution (doors, keys, levers, pedestals, portals, riddles, checkpoints, wall decor, exits).
 * Adheres to SRP and ADR-007 / ADR-0035 standards (<= 300 lines).
 */

import { ENTITY_TYPES, ELEVATION, isApproachAllowed } from '../core/constants.js';

export class InteractionDispatcher {
  /**
   * @param {object} options
   * @param {object} options.gameLoop Parent game loop facade reference
   */
  constructor({ gameLoop }) {
    this.gameLoop = gameLoop;
    this.isDisambiguating = false;
  }

  get player() { return this.gameLoop.player; }
  get entities() { return this.gameLoop.entities; }
  get level() { return this.gameLoop.level; }
  get camera() { return this.gameLoop.camera; }
  get renderer() { return this.gameLoop.renderer; }
  get uiCallbacks() { return this.gameLoop.uiCallbacks || {}; }

  /**
   * Retrieve all available interaction candidates adjacent to or at player's location (BL-85).
   * Respects entity directional interaction restrictions (interactDirections) and elevation.
   * @returns {Array<object>}
   */
  getAllAvailableInteractions() {
    if (!this.player || this.gameLoop.isPuzzleOpen || this.gameLoop.isWon || this.camera?.mode === 'freepan') return [];

    const px = this.player.gridX;
    const py = this.player.gridY;
    const pe = this.player.elevation;

    const facingDx = this.player.facing === 'east' ? 1 : (this.player.facing === 'west' ? -1 : 0);
    const facingDy = this.player.facing === 'south' ? 1 : (this.player.facing === 'north' ? -1 : 0);
    const facingX = px + facingDx;
    const facingY = py + facingDy;

    const rawCandidates = [];

    const canEntityInteract = (ent) => {
      if (!ent) return false;
      if (typeof ent.canInteract === 'function') {
        return ent.canInteract(px, py, pe);
      }
      if ((ent.elevation ?? ent.z ?? ELEVATION.GROUND) !== pe) return false;
      const dist = Math.abs(ent.x - px) + Math.abs(ent.y - py);
      if (dist > 1) return false;
      return isApproachAllowed(ent.x, ent.y, px, py, ent.interactDirections);
    };

    // 1. Locked PuzzleGate
    for (const g of this.entities) {
      if (g.type === ENTITY_TYPES.PUZZLE_GATE && !g.isUnlocked && canEntityInteract(g)) {
        rawCandidates.push({
          id: g.id || `puzzle_gate_${g.x}_${g.y}`,
          type: 'puzzle_gate',
          label: g.name ? `Solve ${g.name}` : 'Solve Seal',
          name: g.name || 'Puzzle Seal',
          icon: '🧩',
          x: g.x,
          y: g.y,
          elevation: g.elevation ?? ELEVATION.GROUND,
          entity: g,
          canInteract: true,
        });
      }
    }

    // 2. Pedestals
    for (const ped of this.entities) {
      if (ped.type === ENTITY_TYPES.PEDESTAL && canEntityInteract(ped)) {
        const hasCarried = this.player.hasCarriedRiddleItem();
        let label = `Inspect ${ped.name || 'Pedestal'}`;
        let icon = '🦅';
        if (hasCarried && !ped.slottedItem) {
          label = `Place ${this.player.carriedRiddleItem.name || 'Relic'}`;
          icon = '📥';
        } else if (!hasCarried && ped.slottedItem) {
          label = `Take ${ped.slottedItem.name || 'Relic'}`;
          icon = '📤';
        }
        rawCandidates.push({
          id: ped.id || `pedestal_${ped.x}_${ped.y}`,
          type: 'pedestal',
          label,
          name: ped.name || 'Pedestal',
          icon,
          x: ped.x,
          y: ped.y,
          elevation: ped.elevation ?? ELEVATION.GROUND,
          entity: ped,
          canInteract: true,
        });
      }
    }

    // 3. Levers
    for (const lever of this.entities) {
      if (lever.type === ENTITY_TYPES.LEVER && canEntityInteract(lever)) {
        rawCandidates.push({
          id: lever.id || `lever_${lever.x}_${lever.y}`,
          type: 'lever',
          label: lever.isOn ? `Pull ${lever.name || 'Lever'} (Off)` : `Pull ${lever.name || 'Lever'} (On)`,
          name: lever.name || 'Lever',
          icon: '🕹️',
          x: lever.x,
          y: lever.y,
          elevation: lever.elevation ?? ELEVATION.GROUND,
          entity: lever,
          canInteract: true,
        });
      }
    }

    // 4. Signposts
    for (const s of this.entities) {
      if (s.type === ENTITY_TYPES.SIGNPOST && canEntityInteract(s)) {
        rawCandidates.push({
          id: s.id || `signpost_${s.x}_${s.y}`,
          type: 'signpost',
          label: s.title ? `Read "${s.title}"` : 'Read Signpost',
          name: s.title || 'Signpost',
          icon: '📜',
          x: s.x,
          y: s.y,
          elevation: s.elevation ?? ELEVATION.GROUND,
          entity: s,
          canInteract: true,
        });
      }
    }

    // 5. WallDecor
    for (const d of this.entities) {
      if (d.type === ENTITY_TYPES.WALL_DECOR && canEntityInteract(d)) {
        const icon = d.decorType === 'note' ? '📝' : (d.decorType === 'painting' ? '🖼️' : '🏛️');
        rawCandidates.push({
          id: d.id || `wall_decor_${d.x}_${d.y}`,
          type: 'wall_decor',
          label: d.title ? `Examine "${d.title}"` : 'Examine Lore',
          name: d.title || 'Wall Lore',
          icon,
          x: d.x,
          y: d.y,
          elevation: d.elevation ?? ELEVATION.GROUND,
          entity: d,
          canInteract: true,
        });
      }
    }

    // 6. Floor RiddleItems
    for (const item of this.entities) {
      if (item.type === ENTITY_TYPES.RIDDLE_ITEM && !item.isCarried && !item.isSlotted && canEntityInteract(item)) {
        rawCandidates.push({
          id: item.id || `riddle_item_${item.x}_${item.y}`,
          type: 'riddle_item',
          label: this.player.hasCarriedRiddleItem() ? `Swap for ${item.name || 'Relic'}` : `Pick Up ${item.name || 'Relic'}`,
          name: item.name || 'Relic',
          icon: '🗿',
          x: item.x,
          y: item.y,
          elevation: item.elevation ?? ELEVATION.GROUND,
          entity: item,
          canInteract: true,
        });
      }
    }

    // 7. Doors
    for (const d of this.entities) {
      if (d.type === ENTITY_TYPES.DOOR && !d.isOpen && canEntityInteract(d)) {
        const hasKey = this.player.hasKey(d.requiresKey);
        rawCandidates.push({
          id: d.id || `door_${d.x}_${d.y}`,
          type: 'door',
          label: hasKey ? `Unlock ${d.name || 'Door'}` : `Locked (${d.name || 'Door'})`,
          name: d.name || 'Door',
          icon: hasKey ? '🗝️' : '🔒',
          x: d.x,
          y: d.y,
          elevation: d.elevation ?? ELEVATION.GROUND,
          entity: d,
          canInteract: hasKey,
        });
      }
    }

    // 8. Exit
    const exit = this.gameLoop.getMatchingExit(px, py, pe);
    if (exit) {
      rawCandidates.push({
        id: `exit_${px}_${py}`,
        type: 'exit',
        label: exit.targetRoom ? 'Proceed to Room' : 'Exit Portal',
        name: exit.targetRoom ? 'Room Portal' : 'Maze Exit',
        icon: '🌀',
        x: px,
        y: py,
        elevation: pe,
        exit,
        canInteract: true,
      });
    }

    // Sort: 0=facing, 1=on tile, 2=adjacent
    rawCandidates.sort((a, b) => {
      const aFacing = (a.x === facingX && a.y === facingY) ? 0 : ((a.x === px && a.y === py) ? 1 : 2);
      const bFacing = (b.x === facingX && b.y === facingY) ? 0 : ((b.x === px && b.y === py) ? 1 : 2);
      if (aFacing !== bFacing) return aFacing - bFacing;
      const aDist = Math.abs(a.x - px) + Math.abs(a.y - py);
      const bDist = Math.abs(b.x - px) + Math.abs(b.y - py);
      return aDist - bDist;
    });

    return rawCandidates.map((c, idx) => ({
      ...c,
      index: idx + 1,
      keyHint: rawCandidates.length > 1 ? String(idx + 1) : 'E',
    }));
  }

  /**
   * Primary interact trigger with two-stage reveal support
   */
  triggerInteract() {
    const candidates = this.getAllAvailableInteractions();
    if (!candidates || candidates.length === 0) return;

    if (candidates.length > 1 && !this.isDisambiguating) {
      this.isDisambiguating = true;
      if (typeof this.uiCallbacks.onDisambiguationModeChanged === 'function') {
        this.uiCallbacks.onDisambiguationModeChanged(true, candidates);
      }
      this.checkContextualInteraction();
      return;
    }

    this.handleManualInteract(1);
  }

  /**
   * Handle manual interact button or numeric selection
   * @param {number|object} [target=1]
   */
  handleManualInteract(target = 1) {
    if (this.isDisambiguating) {
      this.isDisambiguating = false;
      if (typeof this.uiCallbacks.onDisambiguationModeChanged === 'function') {
        this.uiCallbacks.onDisambiguationModeChanged(false);
      }
    }

    const candidates = this.getAllAvailableInteractions();
    if (!candidates || candidates.length === 0) return;

    let chosen = null;
    if (typeof target === 'number') {
      const idx = target - 1;
      if (idx >= 0 && idx < candidates.length) {
        chosen = candidates[idx];
      }
    } else if (target && typeof target === 'object') {
      chosen = candidates.find(c => c.entity === target || c.id === target.id || c === target) || candidates[0];
    }

    if (!chosen) chosen = candidates[0];

    this.executeInteraction(chosen);
    this.checkContextualInteraction();
  }

  /**
   * Close multi-target disambiguation mode back to Stage 1
   */
  closeDisambiguation() {
    if (!this.isDisambiguating) return;
    this.isDisambiguating = false;
    if (typeof this.uiCallbacks.onDisambiguationModeChanged === 'function') {
      this.uiCallbacks.onDisambiguationModeChanged(false);
    }
    this.checkContextualInteraction();
  }

  /**
   * Check for contextual interactions and invoke UI callbacks
   */
  checkContextualInteraction() {
    if (typeof this.uiCallbacks.onInteractionAvailable !== 'function') return;

    const candidates = this.getAllAvailableInteractions();
    let interaction = null;
    let targetScreenPos = null;
    let playerScreenPos = null;
    let candidatesWithPos = [];

    if (this.camera && this.player) {
      playerScreenPos = this.camera.worldToScreen(this.player.worldX, this.player.worldY, true);
    }

    if (candidates && candidates.length > 0) {
      candidatesWithPos = candidates.map(c => {
        let screenPos = null;
        if (this.camera && c.x !== undefined && c.y !== undefined) {
          const tileTopLeft = this.camera.tileToScreen ? this.camera.tileToScreen(c.x, c.y) : this.camera.worldToScreen(c.x * this.camera.tileSize, c.y * this.camera.tileSize, true);
          screenPos = {
            x: tileTopLeft.x + this.camera.tileSize / 2,
            y: tileTopLeft.y + this.camera.tileSize / 2,
          };
        }
        return { ...c, screenPos };
      });

      const primary = candidatesWithPos[0];
      targetScreenPos = primary.screenPos;
      interaction = { ...primary, candidates: candidatesWithPos, isDisambiguating: this.isDisambiguating };
    } else {
      if (this.isDisambiguating) {
        this.isDisambiguating = false;
      }
    }

    this.uiCallbacks.onInteractionAvailable(interaction, targetScreenPos || playerScreenPos, targetScreenPos, playerScreenPos, candidatesWithPos, this.isDisambiguating);
  }

  /**
   * Execute chosen candidate interaction
   * @param {object} candidate
   * @returns {boolean}
   */
  executeInteraction(candidate) {
    if (!candidate || !candidate.canInteract) return false;
    return this.gameLoop.executeInteraction(candidate);
  }
}
