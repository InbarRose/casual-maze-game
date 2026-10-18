/**
 * Campaign Chapter 9 Playthrough Suite: The Sunken Aqueducts (Levels 33–36)
 * Validates Kishōtenketsu progression, water channel navigation, multi-elevation crossings, and dual sluice seals.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';
import { TILES } from '../../../js/core/constants.js';

describe('Campaign > Chapter 9: The Sunken Aqueducts (Levels 33–36)', () => {
  const chapter9Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 33 && num <= 36;
  });

  assertEqual(chapter9Levels.length, 4, 'Chapter 9 contains 4 levels');

  chapter9Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });

  it('validates Level 33 (The Sluice Gate) water flumes and bronze sluice key', () => {
    const l33 = chapter9Levels.find(l => l.id === '33');
    assert(l33 !== undefined, 'Level 33 exists');
    assertEqual(l33.title, 'The Sluice Gate');
    assertEqual(l33.config.theme, 'aqueduct', 'Uses aqueduct theme');
    assert(l33.entities.some(e => e.type === 'key' && e.id === 'key_sluice_33'), 'Has bronze sluice key');
    assert(l33.entities.some(e => e.type === 'door' && e.id === 'door_sluice_33'), 'Has central sluice gate');
  });

  it('validates Level 34 (Submerged Crossings) elevated aqueduct bridge and canal', () => {
    const l34 = chapter9Levels.find(l => l.id === '34');
    assert(l34 !== undefined, 'Level 34 exists');
    assertEqual(l34.title, 'Submerged Crossings');
    assertEqual(l34.layers.ground[5][8], TILES.BRIDGE_NS, 'Ground layer has BRIDGE_NS canal tile');
    assertEqual(l34.layers.overhead[5][8], TILES.BRIDGE_EW, 'Overhead layer has BRIDGE_EW bridge deck tile');
    assert(l34.entities.some(e => e.id === 'key_canal_34' && e.x === 8 && e.y === 14), 'Canal key is at (8, 14, 0)');
  });

  it('validates Level 35 (The Pressure Basin) timed hazards and secret conduit', () => {
    const l35 = chapter9Levels.find(l => l.id === '35');
    assert(l35 !== undefined, 'Level 35 exists');
    assertEqual(l35.title, 'The Pressure Basin');
    assertEqual(l35.layers.ground[15][1], TILES.SECRET_WALL, 'Ground layer has SECRET_WALL');
    assert(l35.entities.some(e => e.type === 'timed_hazard'), 'Has timed hazard');
    assert(l35.entities.some(e => e.id === 'gem_secret_35' && e.x === 3 && e.y === 15), 'Secret gem in conduit');
  });

  it('validates Level 36 (Grand Aqueduct Reservoir) dual-key multi-layer progression', () => {
    const l36 = chapter9Levels.find(l => l.id === '36');
    assert(l36 !== undefined, 'Level 36 exists');
    assertEqual(l36.title, 'Grand Aqueduct Reservoir');
    assert(l36.entities.some(e => e.id === 'key_cyan_36'), 'Has cyan key');
    assert(l36.entities.some(e => e.id === 'door_cyan_36'), 'Has cyan door');
    assert(l36.entities.some(e => e.id === 'key_amethyst_36'), 'Has amethyst key');
    assert(l36.entities.some(e => e.id === 'door_amethyst_36'), 'Has amethyst door');
  });
});
