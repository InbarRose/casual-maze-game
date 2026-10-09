/**
 * Unit Tests: Celestial Cipher Dials & Thematic Wall Murals (BL-83)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { CELESTIAL_SYMBOLS } from '../../../js/core/constants.js';
import { PuzzleGate } from '../../../js/entities/puzzle-gate.js';
import { PuzzleModal } from '../../../js/ui/puzzle-modal.js';
import { globalEvents } from '../../../js/core/events.js';

describe('UI > Celestial Cipher Dials & Thematic Wall Murals (BL-83)', () => {
  it('defines CELESTIAL_SYMBOLS constants with 6 celestial bodies', () => {
    assertEqual(Array.isArray(CELESTIAL_SYMBOLS), true, 'CELESTIAL_SYMBOLS is an array');
    assertEqual(CELESTIAL_SYMBOLS.length, 6, 'Contains 6 celestial symbols');

    const expectedKeys = ['sun', 'moon', 'horizon', 'star', 'planet', 'comet'];
    expectedKeys.forEach((key, idx) => {
      assertEqual(CELESTIAL_SYMBOLS[idx].id, idx, `Symbol ${idx} id is ${idx}`);
      assertEqual(CELESTIAL_SYMBOLS[idx].key, key, `Symbol ${idx} key is ${key}`);
      assert(CELESTIAL_SYMBOLS[idx].icon, `Symbol ${idx} has an icon`);
      assert(CELESTIAL_SYMBOLS[idx].label, `Symbol ${idx} has a label`);
      assert(CELESTIAL_SYMBOLS[idx].color, `Symbol ${idx} has a color hex`);
    });
  });

  it('initializes PuzzleGate with celestial symbols for cipher_dial by default', () => {
    const gate = new PuzzleGate({
      id: 'gate_celestial_test',
      x: 7,
      y: 7,
      puzzleType: 'cipher_dial',
      solution: [0, 1, 2], // Sun, Moon, Horizon
    });

    assertEqual(gate.puzzleType, 'cipher_dial', 'Puzzle type is cipher_dial');
    assertEqual(Array.isArray(gate.symbols), true, 'Symbols array is initialized');
    assertEqual(gate.symbols.length, 6, 'Contains 6 celestial symbols');
    assertEqual(gate.verifySolution([0, 1, 2]), true, 'Correct solution [0, 1, 2] verified');
    assertEqual(gate.verifySolution([1, 2, 0]), false, 'Incorrect permutation rejected');
  });

  it('renders celestial symbols and dial controls in PuzzleModal HTML', () => {
    const gate = new PuzzleGate({
      id: 'gate_celestial_modal_test',
      puzzleType: 'cipher_dial',
      solution: [0, 1, 2],
    });

    const modal = new PuzzleModal();
    modal.activeGate = gate;

    const html = modal.renderCipherStageHTML();
    assert(html.includes('cipher-dial-column'), 'Contains dial columns');
    assert(html.includes('celestial-dial'), 'Contains celestial-dial styling');
    assert(html.includes('☀️'), 'Contains initial Sun icon');
    assert(html.includes('Sun'), 'Contains initial Sun label');
    assert(html.includes('data-dial="0"'), 'Dial 0 is present');
    assert(html.includes('data-dial="1"'), 'Dial 1 is present');
    assert(html.includes('data-dial="2"'), 'Dial 2 is present');
  });

  it('cycles values and verifies solution correctly on cipher submit', () => {
    const gate = new PuzzleGate({
      id: 'gate_celestial_wrap_test',
      puzzleType: 'cipher_dial',
      solution: [0, 1, 2], // Sun, Moon, Horizon
    });

    const modal = new PuzzleModal();
    modal.activeGate = gate;
    modal.dialValues = [0, 0, 0];

    // Simulate dialing: dial 0 remains 0 (Sun)
    // dial 1: increment by 1 -> 1 (Moon)
    const totalSymbols = gate.symbols.length;
    modal.dialValues[1] = (modal.dialValues[1] + 1 + totalSymbols) % totalSymbols;
    assertEqual(modal.dialValues[1], 1, 'Dial 1 moved to Moon');

    // dial 2: increment by 2 -> 2 (Horizon)
    modal.dialValues[2] = (modal.dialValues[2] + 2 + totalSymbols) % totalSymbols;
    assertEqual(modal.dialValues[2], 2, 'Dial 2 moved to Horizon');

    // Verify verification against solution
    assertEqual(gate.verifySolution(modal.dialValues), true, 'Verification succeeds for [0, 1, 2]');

    // Test backward wrap on dial 0: decrement by 1 from 0 -> 5 (Comet)
    modal.dialValues[0] = (modal.dialValues[0] - 1 + totalSymbols) % totalSymbols;
    assertEqual(modal.dialValues[0], 5, 'Dial 0 wrapped backwards to Comet (5)');
    assertEqual(gate.verifySolution(modal.dialValues), false, 'Verification rejected for [5, 1, 2]');
  });
});
