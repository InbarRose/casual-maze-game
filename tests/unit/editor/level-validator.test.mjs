/**
 * Unit Tests: LevelValidator Subsystem
 * Edge cases, invalid structures, deadlocks, and bypass warnings.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';

describe('Editor > LevelValidator', () => {
  it('catches spawn placed inside a solid wall', () => {
    const badLevel = {
      dimensions: { width: 7, height: 7 },
      spawn: { x: 0, y: 0, elevation: 0 },
      exit: { x: 5, y: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 7 }, () => Array(7).fill(0)),
      },
      entities: [],
    };

    const report = LevelValidator.validate(badLevel);
    assertEqual(report.valid, false);
    assert(report.errors.some(e => e.message.includes('wall')), 'Flags spawn inside wall');
  });

  it('catches exit walled off and unreachable', () => {
    const blockedLevel = {
      dimensions: { width: 7, height: 7 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 5, y: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 0, 1, 0, 0, 0, 1],
          [1, 0, 1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1], // Full dividing wall
          [1, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 7 }, () => Array(7).fill(0)),
      },
      entities: [],
    };

    const report = LevelValidator.validate(blockedLevel);
    assertEqual(report.valid, false);
    assert(report.errors.some(e => e.message.includes('UNREACHABLE')), 'Flags unreachable exit');
  });

  it('catches door requiring non-existent key', () => {
    const missingKeyLevel = {
      dimensions: { width: 7, height: 7 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 5, y: 1 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 3 }, () => Array(7).fill(0)),
      },
      entities: [
        { id: 'door_ghost', type: 'door', x: 3, y: 1, requiresKey: 'key_nonexistent' },
      ],
    };

    const report = LevelValidator.validate(missingKeyLevel);
    assertEqual(report.valid, false);
    assert(report.errors.some(e => e.message.includes('no such key exists')), 'Flags missing key');
  });

  it('catches lever targeting out-of-bounds coordinate', () => {
    const badLeverLevel = {
      dimensions: { width: 7, height: 7 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 5, y: 1 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 3 }, () => Array(7).fill(0)),
      },
      entities: [
        { id: 'lever_1', type: 'lever', x: 2, y: 1, targets: [{ x: 99, y: 99 }] },
      ],
    };

    const report = LevelValidator.validate(badLeverLevel);
    assertEqual(report.valid, false);
    assert(report.errors.some(e => e.message.includes('out-of-bounds')), 'Flags out-of-bounds target');
  });

  it('flags key-behind-door deadlock as invalid', () => {
    const deadlockLevel = {
      dimensions: { width: 7, height: 7 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 5, y: 1 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 3 }, () => Array(7).fill(0)),
      },
      entities: [
        { id: 'door_blocker', type: 'door', x: 2, y: 1, requiresKey: 'key_trapped', color: '#f43f5e' },
        { id: 'key_trapped', type: 'key', x: 4, y: 1, color: '#f43f5e', name: 'Trapped Key' },
      ],
    };

    const report = LevelValidator.validate(deadlockLevel);
    assertEqual(report.valid, false, 'Deadlock makes level invalid');
    assert(report.errors.some(e => e.message.includes('unreachable before unlocking this door')), 'Explains key is behind door');
  });

  it('warns when a locked gate can be bypassed without unlocking', () => {
    const bypassedLevel = {
      dimensions: { width: 9, height: 9 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 7, y: 7 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 1, 1, 1, 1, 0, 1],
          [1, 0, 1, 0, 0, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 0, 0, 1, 0, 1],
          [1, 0, 1, 1, 1, 1, 1, 0, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 9 }, () => Array(9).fill(0)),
      },
      entities: [
        { id: 'key_side', type: 'key', x: 1, y: 3, color: '#fbbf24', name: 'Side Key' },
        { id: 'door_side', type: 'door', x: 3, y: 3, requiresKey: 'key_side', color: '#fbbf24' },
      ],
    };

    const report = LevelValidator.validate(bypassedLevel);
    assertEqual(report.valid, true, 'Solvable level remains valid');
    assert(report.warnings.some(w => w.message.includes('bypassed')), 'Issues bypass warning');
  });
});
