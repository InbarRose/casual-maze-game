/**
 * Unit Tests: Constants & Schema Registries
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import {
  TILES,
  ENTITY_TYPES,
  LAYERS,
  ELEVATION,
  FOG_STATE,
  DIRECTIONS,
  OPPOSITE_DIRECTIONS,
  KEY_CODES,
  KEY_COLORS,
  KEY_COLOR_PRESETS,
  LEVER_TILE_OPTIONS,
  DEFAULTS,
  THEMES,
  ZONES,
} from '../../../js/core/constants.js';

describe('Core > Constants & Registries', () => {
  it('defines valid tile identifiers and elevation layers', () => {
    assertEqual(TILES.FLOOR, 0);
    assertEqual(TILES.WALL, 1);
    assertEqual(TILES.BRIDGE_EW, 'B_EW');
    assertEqual(TILES.BRIDGE_NS, 'B_NS');
    assertEqual(TILES.RAMP_N, 'R_N');
    assertEqual(TILES.RAMP_S, 'R_S');
    assertEqual(TILES.RAMP_E, 'R_E');
    assertEqual(TILES.RAMP_W, 'R_W');

    assertEqual(ELEVATION.GROUND, 0);
    assertEqual(ELEVATION.OVERHEAD, 1);
  });

  it('defines inverse opposite directions consistently', () => {
    assertEqual(OPPOSITE_DIRECTIONS.north, 'south');
    assertEqual(OPPOSITE_DIRECTIONS.south, 'north');
    assertEqual(OPPOSITE_DIRECTIONS.east, 'west');
    assertEqual(OPPOSITE_DIRECTIONS.west, 'east');
  });

  it('contains valid directional delta vectors', () => {
    assertDeepEqual(DIRECTIONS.NORTH, { x: 0, y: -1, name: 'north' });
    assertDeepEqual(DIRECTIONS.SOUTH, { x: 0, y: 1, name: 'south' });
    assertDeepEqual(DIRECTIONS.WEST, { x: -1, y: 0, name: 'west' });
    assertDeepEqual(DIRECTIONS.EAST, { x: 1, y: 0, name: 'east' });
  });

  it('contains key color presets and lever tile mutation options', () => {
    assert(Array.isArray(KEY_COLOR_PRESETS), 'KEY_COLOR_PRESETS is an array');
    assert(KEY_COLOR_PRESETS.length >= 5, 'Has at least 5 key presets');
    for (const preset of KEY_COLOR_PRESETS) {
      assert(preset.id && preset.name && preset.color && preset.label, `Preset ${preset.id} has valid schema`);
    }

    assert(Array.isArray(LEVER_TILE_OPTIONS), 'LEVER_TILE_OPTIONS is an array');
    assert(LEVER_TILE_OPTIONS.length >= 8, 'Has all floor/wall/bridge/ramp options');
  });

  it('contains complete visual styling tokens for all 6 themes', () => {
    const themeKeys = ['dungeon', 'jungle', 'lava', 'snow', 'cave', 'sunset'];
    const requiredTokens = ['bg', 'wall', 'wallTop', 'floor', 'bridgeOverhead', 'bridgeRailing'];

    for (const key of themeKeys) {
      const theme = THEMES[key];
      assert(theme !== undefined, `Theme "${key}" exists in THEMES`);
      for (const token of requiredTokens) {
        assert(theme[token] !== undefined, `Theme "${key}" defines style token "${token}"`);
      }
    }
  });

  it('contains valid zone metadata and progression mapping for all 6 zones', () => {
    const zoneKeys = ['tutorial', 'zone_1', 'zone_2', 'zone_3', 'zone_4', 'zone_5'];

    for (const key of zoneKeys) {
      const zone = ZONES[key];
      assert(zone !== undefined, `Zone "${key}" exists in ZONES`);
      assert(typeof zone.id === 'string', `Zone "${key}" has id`);
      assert(typeof zone.title === 'string', `Zone "${key}" has title`);
      assert(typeof zone.badge === 'string', `Zone "${key}" has badge`);
      assert(typeof zone.theme === 'string' && THEMES[zone.theme], `Zone "${key}" references valid theme "${zone.theme}"`);
      assert(typeof zone.desc === 'string', `Zone "${key}" has desc`);
    }
  });
});
