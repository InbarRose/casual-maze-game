/**
 * Campaign Chapter 10 Playthrough Suite: The Prismatic Labyrinth (Levels 37–40)
 * Validates Kishōtenketsu progression, chromatic refraction, multi-elevation crystal bridges, and apex seals.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';
import { TILES } from '../../../js/core/constants.js';

describe('Campaign > Chapter 10: The Prismatic Labyrinth (Levels 37–40)', () => {
  const chapter10Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 37 && num <= 40;
  });

  assertEqual(chapter10Levels.length, 4, 'Chapter 10 contains 4 levels');

  chapter10Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });

  it('validates Level 37 (The Spectral Gate) chromatic barriers and secret refraction alcove', () => {
    const l37 = chapter10Levels.find(l => l.id === '37');
    assert(l37 !== undefined, 'Level 37 exists');
    assertEqual(l37.title, 'The Spectral Gate');
    assertEqual(l37.config.theme, 'prismatic', 'Uses prismatic theme');
    assert(l37.entities.some(e => e.id === 'key_amber_37'), 'Has amber key');
    assert(l37.entities.some(e => e.id === 'door_amber_37'), 'Has amber door');
    assert(l37.entities.some(e => e.id === 'key_violet_37'), 'Has violet key');
    assert(l37.entities.some(e => e.id === 'door_violet_37'), 'Has violet door');
  });

  it('validates Level 38 (Concentric Trestles) elevated crystalline overpasses and directional ramps', () => {
    const l38 = chapter10Levels.find(l => l.id === '38');
    assert(l38 !== undefined, 'Level 38 exists');
    assertEqual(l38.title, 'Concentric Trestles');
    assertEqual(l38.layers.ground[12][6], TILES.RAMP_E, 'Ramp ascends East on ground');
    assertEqual(l38.layers.overhead[7][12], TILES.BRIDGE_NS, 'Overhead trestle spans North-South');
    assert(l38.entities.some(e => e.id === 'key_prism_38'), 'Has prism key');
    assert(l38.entities.some(e => e.id === 'door_prism_38'), 'Has sanctum door');
  });

  it('validates Level 39 (Harmonic Mirror Seals) resonant tuning and inner sanctum forcefield', () => {
    const l39 = chapter10Levels.find(l => l.id === '39');
    assert(l39 !== undefined, 'Level 39 exists');
    assertEqual(l39.title, 'Harmonic Mirror Seals');
    assert(l39.entities.some(e => e.id === 'key_silver_39'), 'Has silver key');
    assert(l39.entities.some(e => e.id === 'door_silver_39'), 'Has harmonic forcefield');
    assertEqual(l39.layers.ground[4][22], TILES.SECRET_WALL, 'Has secret wall guarding gem');
  });

  it('validates Level 40 (Heart of the Prism) 4-quadrant climax macro-puzzle', () => {
    const l40 = chapter10Levels.find(l => l.id === '40');
    assert(l40 !== undefined, 'Level 40 exists');
    assertEqual(l40.title, 'Heart of the Prism');
    assert(l40.entities.some(e => e.id === 'key_ruby_40'), 'Has ruby key');
    assert(l40.entities.some(e => e.id === 'key_emerald_40'), 'Has emerald key');
    assert(l40.entities.some(e => e.id === 'key_sapphire_40'), 'Has sapphire key');
    assert(l40.entities.some(e => e.id === 'key_apex_40'), 'Has apex core key');
  });
});
