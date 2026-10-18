/**
 * MovementController
 * Manages player movement execution, screen-to-world directional translation,
 * ramp elevation changes, collision arbitration, and auto-move path following.
 * Adheres to SRP and ADR-007 / ADR-0035 standards (<= 300 lines).
 */

import { SCREEN_TO_WORLD_DELTAS, KEY_CODES } from '../core/constants.js';

export class MovementController {
  /**
   * @param {object} options
   * @param {object} options.gameLoop Parent game loop facade reference
   */
  constructor({ gameLoop }) {
    this.gameLoop = gameLoop;
  }

  get player() { return this.gameLoop.player; }
  get camera() { return this.gameLoop.camera; }
  get level() { return this.gameLoop.level; }
  get entities() { return this.gameLoop.entities; }
  get inputManager() { return this.gameLoop.inputManager; }
  get keysDown() { return this.gameLoop.keysDown; }

  /**
   * Attempt to move player one step in the specified screen direction
   * @param {'UP'|'DOWN'|'LEFT'|'RIGHT'|'up'|'down'|'left'|'right'} direction
   * @returns {boolean} Whether step was started
   */
  tryMoveDirection(direction) {
    if (this.player.isMoving || this.camera.mode === 'freepan' || (this.camera?.isRotating?.() ?? false)) return false;
    const angle = this.camera?.getDiscreteRotation?.() ?? 0;
    const mapping = SCREEN_TO_WORLD_DELTAS[angle] || SCREEN_TO_WORLD_DELTAS[0];
    const delta = mapping[direction?.toUpperCase()];
    if (!delta) return false;
    return this.tryMove(this.player.gridX + delta.dx, this.player.gridY + delta.dy);
  }

  /**
   * Attempt to move player towards target cell coordinate
   * @param {number} targetX
   * @param {number} targetY
   * @returns {boolean} Whether movement was allowed and started
   */
  tryMove(targetX, targetY) {
    return this.gameLoop.tryMove(targetX, targetY);
  }

  /**
   * Process continuous directional movement input (screen-relative)
   */
  processPlayerMovement() {
    if (this.player.isMoving || this.camera.mode === 'freepan' || (this.camera?.isRotating?.() ?? false)) return;

    let screenDx = 0;
    let screenDy = 0;

    if (this.inputManager) {
      const poll = this.inputManager.poll();
      screenDx = poll.dx;
      screenDy = poll.dy;
    } else {
      for (const code of this.keysDown) {
        if (KEY_CODES.UP.includes(code)) screenDy -= 1;
        else if (KEY_CODES.DOWN.includes(code)) screenDy += 1;
        else if (KEY_CODES.LEFT.includes(code)) screenDx -= 1;
        else if (KEY_CODES.RIGHT.includes(code)) screenDx += 1;
      }
      if (screenDx !== 0) screenDy = 0;
    }

    // Cancel auto-move path if player presses directional keys
    if (screenDx !== 0 || screenDy !== 0) {
      this.gameLoop.autoMovePath = null;
      this.gameLoop.clickTarget = null;
    }

    // Restrict to orthogonal movement
    if (screenDx !== 0) screenDy = 0;

    if (screenDx !== 0 || screenDy !== 0) {
      const angle = this.camera?.getDiscreteRotation?.() ?? 0;
      const mapping = SCREEN_TO_WORLD_DELTAS[angle] || SCREEN_TO_WORLD_DELTAS[0];

      let worldDx = 0;
      let worldDy = 0;

      if (screenDy < 0) { worldDx += mapping.UP.dx; worldDy += mapping.UP.dy; }
      else if (screenDy > 0) { worldDx += mapping.DOWN.dx; worldDy += mapping.DOWN.dy; }
      else if (screenDx < 0) { worldDx += mapping.LEFT.dx; worldDy += mapping.LEFT.dy; }
      else if (screenDx > 0) { worldDx += mapping.RIGHT.dx; worldDy += mapping.RIGHT.dy; }

      this.tryMove(this.player.gridX + worldDx, this.player.gridY + worldDy);
      return;
    }

    // Auto-move path following when no directional keys held
    this.processAutoMoveStep();
  }

  /**
   * Follow queued auto-move BFS path one step at a time
   */
  processAutoMoveStep() {
    if (!this.gameLoop.autoMovePath || this.gameLoop.autoMovePath.length === 0) return;

    const nextStep = this.gameLoop.autoMovePath[0];
    const dx = Math.abs(nextStep.x - this.player.gridX);
    const dy = Math.abs(nextStep.y - this.player.gridY);

    if (dx + dy === 1) {
      const success = this.tryMove(nextStep.x, nextStep.y);
      if (success) {
        this.gameLoop.autoMovePath.shift();
        if (this.gameLoop.autoMovePath.length === 0) {
          this.gameLoop.autoMovePath = null;
          this.gameLoop.clickTarget = null;
        }
      } else {
        // Path blocked: cancel remaining path
        this.gameLoop.autoMovePath = null;
        this.gameLoop.clickTarget = null;
      }
    } else {
      // Discontinuous step: clear invalid path
      this.gameLoop.autoMovePath = null;
      this.gameLoop.clickTarget = null;
    }
  }

  /**
   * Process free pan manual camera scrolling
   * @param {number} dt
   */
  processFreePanMovement(dt) {
    let screenDx = 0;
    let screenDy = 0;

    if (this.inputManager) {
      const poll = this.inputManager.poll(dt);
      screenDx = poll.dx;
      screenDy = poll.dy;
    } else {
      for (const code of this.keysDown) {
        if (KEY_CODES.UP.includes(code)) screenDy -= 1;
        else if (KEY_CODES.DOWN.includes(code)) screenDy += 1;
        else if (KEY_CODES.LEFT.includes(code)) screenDx -= 1;
        else if (KEY_CODES.RIGHT.includes(code)) screenDx += 1;
      }
    }

    if (screenDx !== 0 || screenDy !== 0) {
      const speed = this.camera.panSpeed * dt;
      const angle = this.camera?.getDiscreteRotation?.() ?? 0;
      const mapping = SCREEN_TO_WORLD_DELTAS[angle] || SCREEN_TO_WORLD_DELTAS[0];
      let worldDx = 0;
      let worldDy = 0;

      if (screenDy < 0) { worldDx += mapping.UP.dx; worldDy += mapping.UP.dy; }
      if (screenDy > 0) { worldDx += mapping.DOWN.dx; worldDy += mapping.DOWN.dy; }
      if (screenDx < 0) { worldDx += mapping.LEFT.dx; worldDy += mapping.LEFT.dy; }
      if (screenDx > 0) { worldDx += mapping.RIGHT.dx; worldDy += mapping.RIGHT.dy; }

      this.camera.panBy(
        worldDx * speed,
        worldDy * speed,
        this.level.dimensions.width,
        this.level.dimensions.height
      );
    }
  }
}
