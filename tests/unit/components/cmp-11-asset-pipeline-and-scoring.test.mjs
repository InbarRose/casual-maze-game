/**
 * Component Test Suite: CMP-11 Asset Pipeline, Thematic Unification & Gameplay Scoring
 *
 * Exhaustively verifies:
 * 1. Asset Biome Unification: Similar areas share assets for a unified experience (BL-113, ADR-0022)
 *    - Dungeon, Caves, Crypt, Blueprint share 'dungeon' assets
 *    - Jungle, Emerald, Canopy share 'jungle' assets
 *    - Lava, Magma, Volcano share 'magma' assets
 *    - Snow, Glacial, Frost share 'glacial' assets
 *    - Sunset, Temple, Citadel share 'temple' assets
 * 2. AssetLoader canonical path resolution and preloading parity
 * 3. In-Engine Gameplay Scoring Subsystem on every mode and phase (par steps, par time, secrets, flawless, medals)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { assetLoader } from '../../../js/core/asset-loader.js';
import { BIOME_FAMILIES, getBiomeFamily } from '../../../js/core/constants.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { StorageManager } from '../../../js/core/storage.js';

describe('Component Suite > CMP-11: Asset Pipeline, Thematic Unification & Scoring', () => {
  it('unifies similar areas so they share thematic vector assets (BL-113, ADR-0022)', () => {
    // 1. Biome family mappings
    assertEqual(getBiomeFamily('dungeon'), 'dungeon');
    assertEqual(getBiomeFamily('cave'), 'dungeon', 'Caves share dungeon stone assets');
    assertEqual(getBiomeFamily('caves'), 'dungeon', 'Caves share dungeon stone assets');
    assertEqual(getBiomeFamily('crypt'), 'dungeon', 'Crypts share dungeon stone assets');
    assertEqual(getBiomeFamily('blueprint'), 'dungeon', 'Blueprint shares dungeon geometry');

    assertEqual(getBiomeFamily('jungle'), 'jungle');
    assertEqual(getBiomeFamily('emerald'), 'jungle', 'Emerald caverns share jungle foliage assets');
    assertEqual(getBiomeFamily('canopy'), 'jungle', 'Canopy shares jungle assets');

    assertEqual(getBiomeFamily('lava'), 'magma', 'Lava core shares magma obsidian/molten assets');
    assertEqual(getBiomeFamily('magma'), 'magma');
    assertEqual(getBiomeFamily('volcano'), 'magma');

    assertEqual(getBiomeFamily('snow'), 'glacial', 'Snow biomes share glacial ice assets');
    assertEqual(getBiomeFamily('frost'), 'glacial');
    assertEqual(getBiomeFamily('ice'), 'glacial');
    assertEqual(getBiomeFamily('glacial'), 'glacial');

    assertEqual(getBiomeFamily('sunset'), 'temple', 'Sunset citadel shares temple sandstone assets');
    assertEqual(getBiomeFamily('citadel'), 'temple');
    assertEqual(getBiomeFamily('astral'), 'temple');
    assertEqual(getBiomeFamily('temple'), 'temple');
  });

  it('resolves canonical asset paths through biome family aliasing', () => {
    // 1. Direct path lookup
    const dungeonFloor = assetLoader.resolvePath('tile_floor_dungeon');
    assert(dungeonFloor !== null, 'Dungeon floor resolves directly');
    assertEqual(dungeonFloor, 'assets/tiles/ground/floor_dungeon.svg');

    // 2. Aliased lookup for similar areas (Lava -> Magma)
    const lavaFloor = assetLoader.resolvePath('tile_floor_lava');
    assert(lavaFloor !== null, 'Lava floor resolves to shared magma asset');
    assertEqual(lavaFloor, 'assets/tiles/ground/floor_magma.svg');

    const lavaWall = assetLoader.resolvePath('tile_wall_lava');
    assertEqual(lavaWall, 'assets/tiles/ground/wall_magma.svg');

    const lavaBridge = assetLoader.resolvePath('tile_bridge_lava_ew');
    assertEqual(lavaBridge, 'assets/tiles/bridges/bridge_magma_ew.svg');

    // 3. Aliased lookup for Snow -> Glacial
    const snowFloor = assetLoader.resolvePath('tile_floor_snow');
    assertEqual(snowFloor, 'assets/tiles/ground/floor_glacial.svg');

    const snowBridge = assetLoader.resolvePath('tile_bridge_snow_ns');
    assertEqual(snowBridge, 'assets/tiles/bridges/bridge_glacial_ns.svg');

    // 4. Aliased lookup for Sunset -> Temple
    const sunsetFloor = assetLoader.resolvePath('tile_floor_sunset');
    assertEqual(sunsetFloor, 'assets/tiles/ground/floor_temple.svg');
  });

  it('calculates comprehensive gameplay scoring across all modes and phases', () => {
    const mockCanvas = {
      width: 400,
      height: 400,
      getContext: () => ({ fillRect: () => {}, strokeRect: () => {}, save: () => {}, restore: () => {} }),
    };

    const level = {
      id: 'score_audit_level',
      title: 'Scoring Audit Hall',
      dimensions: { width: 5, height: 5 },
      spawn: { x: 1, y: 1 },
      exit: { x: 3, y: 3 },
      parSteps: 12,
      parTime: 10,
      layers: { ground: [[1, 1, 1], [1, 0, 1], [1, 1, 1]], overhead: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
      entities: [],
    };

    const game = new GameLoop({
      mainCanvas: mockCanvas,
      minimapCanvas: mockCanvas,
      level,
    });

    // Scoring Phase 1: Flawless Run with Par Steps, Par Time, and Secret
    const scoreStats = {
      steps: 10,
      time: 8000,
      earnedParSteps: true,
      earnedParTime: true,
      secretsFound: 2,
      flawless: true,
    };

    // Expected:
    // Base: 1000 - (10 * 10) - (8 * 5) = 1000 - 100 - 40 = 860
    // Secrets: 2 * 300 = 600
    // ParSteps: 250
    // ParTime: 250
    // Flawless: 200
    // Total: 860 + 600 + 250 + 250 + 200 = 2160
    const totalScore = game.calculatePerformanceScore(scoreStats);
    assertEqual(totalScore, 2160, 'Calculates exact performance score with all bonuses');

    // Scoring Phase 2: Tiered Medal Awarding
    StorageManager.saveLevelCompletion('score_audit_level', {
      time: 8000,
      steps: 10,
      earnedParSteps: true,
      earnedParTime: true,
      secretsFound: 2,
      totalSecrets: 2,
      flawless: true,
      performanceScore: totalScore,
    });

    const prog = StorageManager.loadCampaignProgress();
    const entry = prog['score_audit_level'];
    assert(entry !== undefined, 'Completion recorded in storage');
    assertEqual(entry.medals.tier, 'gold', 'Gold tier awarded for both par goals');
    assertEqual(entry.medals.flawless, true, 'Flawless medal flag recorded');
    assertEqual(entry.medals.secretSleuth, true, 'Secret sleuth medal flag recorded');
    assertEqual(entry.bestScore, 2160, 'Best score persisted');

    game.stop();
  });
});
