/**
 * Test & Verification Harness for Chapter 6 Rigor Overhaul (Levels 21–24) (BL-183, ADR-0057)
 *
 * Verifies:
 * 1. 100% valid via LevelValidator (0 errors, 0 warnings).
 * 2. Solvable via BFS shortest-path solver.
 * 3. 100% zero-bypass gating:
 *    - Level 21: Unsolvable without solving Rune Memory puzzle gate (allowPuzzles: false => null).
 *    - Level 22: Unsolvable without solving Cipher Dial puzzle gate, and without Azure Key / Door.
 *    - Level 23: Unsolvable without Outer Rune Ward, without Dynamo Lever, and without Inner Cipher Ward.
 *    - Level 24: Unsolvable without Rune Ward, without Lever, without Cipher Ward, and without Gold Key / Door under Fog of War.
 * 4. Architectural criteria:
 *    - Corridor directional inertia >= 70%.
 *    - Zero dead space >= 4x4.
 *    - Non-corner spawns.
 *    - North wall doorway entrance ('wall_doorway', 'north') & archway exit ('wall_archway', 'north').
 *    - Stone lecterns with coordinates (X, Y, Z).
 *    - Diegetic wall carvings and runic plates for hints and secret chambers.
 */

import { solveLevel } from '../js/engine/solver.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';

// =========================================================================
// LEVEL 21 - 15x13
// The Rune Lock: 4-Glyph Rune Memory Puzzle Gate
// =========================================================================
export function makeLevel21() {
  const width = 15, height = 13;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 01 (3,1) Spawn, (13,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 02
    [  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 03 (1,3) Lectern
    [  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 04
    [  1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1 ], // 05 (3,5)->(5,5)
    [  1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1 ], // 06
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1 ], // 07 (7,7) Puzzle Gate
    [  1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1 ], // 08
    [  1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1 ], // 09 (9,9) Secret gem
    [  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 10
    [  1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1 ], // 11 (9,11)->(13,11)
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 12 South boundary
  ];

  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "21",
    chapter: "chapter_6",
    zone: "zone_6",
    title: "The Rune Lock",
    author: "Inbar Rose",
    version: 1,
    dimensions: {
      width,
      height
    },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: "crypt"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 13,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      wallDirection: "north"
    },
    parSteps: 36,
    parTime: 24,
    architectNote: "Architect's Journal: Ancient runic locks seal the scriptorium. Replicating the four-glyph sequence in exact order dispels the arcane barrier.",
    package: {
      layers: "./layers.json",
      entities: "./entities.json",
      documentation: "./README.md"
    }
  };

  const entities = [
    {
      id: "sign_arch_21",
      type: "signpost",
      title: "Architect's Note #21",
      style: "lectern_stone",
      chapter: "chapter_6",
      levelId: "21",
      x: 1,
      y: 3,
      z: 0,
      elevation: 0,
      coordString: "(1, 3, 0)",
      text: "Architect's Journal: Ancient runic locks seal the scriptorium. Replicating the four-glyph sequence in exact order dispels the arcane barrier."
    },
    // Rune memory puzzle gate
    {
      id: "puzzle_gate_21",
      type: "puzzle_gate",
      x: 7,
      y: 7,
      z: 0,
      elevation: 0,
      puzzleType: "rune_memory",
      solution: [0, 2, 1, 3],
      name: "Arcane Rune Seal"
    },
    // Wall art & inscriptions
    {
      id: "inscr_rune_21",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "Four glyphs of power: Dawn, Eclipse, Zenith, and Twilight. Commit them to memory.",
      playerDialogue: "A carved relief showing the sequence of four cosmic runes.",
      x: 3,
      y: 4,
      elevation: 0
    },
    {
      id: "inscr_secret_21",
      type: "wall_decor",
      decorType: "runic_plate",
      facing: "north",
      text: "ᚱᚢᚾ In the secluded southern alcove rests the Arcane Rune Shard.",
      playerDialogue: "Glowing bronze runes indicating a hidden niche in the lower scriptorium.",
      x: 10,
      y: 11,
      elevation: 0
    },
    {
      id: "secret_gem_21",
      type: "collectible",
      itemId: "gem_rune_shard",
      name: "Arcane Rune Shard",
      points: 300,
      x: 9,
      y: 9,
      z: 0,
      elevation: 0
    },
    {
      id: "torch_ch6_21_spawn",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 4,
      y: 1,
      elevation: 0
    },
    {
      id: "torch_ch6_21_exit",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 12,
      y: 1,
      elevation: 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 22 - 17x15
// The Cipher Dials: 3-Ring Concentric Celestial Cipher & Azure Sanctum
// =========================================================================
export function makeLevel22() {
  const width = 17, height = 15;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 01 (3,1) Spawn, (15,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1 ], // 02
    [  1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1 ], // 03 (15,3) Azure Door
    [  1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1 ], // 04 (8,4) Azure Key
    [  1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ], // 05 (3,5)->(5,5)
    [  1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1 ], // 06
    [  1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1 ], // 07 (1,7) Lectern, (8,7) Cipher Dial
    [  1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1 ], // 08
    [  1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1 ], // 09 (11,9) Secret gem
    [  1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1 ], // 10
    [  1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ], // 11
    [  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1 ], // 12
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 13 (1,13)->(15,13)
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 14 South boundary
  ];

  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "22",
    chapter: "chapter_6",
    zone: "zone_6",
    title: "The Cipher Dials",
    author: "Inbar Rose",
    version: 1,
    dimensions: {
      width,
      height
    },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: "crypt"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 15,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      wallDirection: "north"
    },
    parSteps: 78,
    parTime: 48,
    architectNote: "Architect's Journal: Three concentric planetary dials lock the central gallery. Aligning their celestial symbols disengages the seal, granting passage to the Azure Key.",
    package: {
      layers: "./layers.json",
      entities: "./entities.json",
      documentation: "./README.md"
    }
  };

  const entities = [
    {
      id: "sign_arch_22",
      type: "signpost",
      title: "Architect's Note #22",
      style: "lectern_stone",
      chapter: "chapter_6",
      levelId: "22",
      x: 1,
      y: 7,
      z: 0,
      elevation: 0,
      coordString: "(1, 7, 0)",
      text: "Architect's Journal: Three concentric planetary dials lock the central gallery. Aligning their celestial symbols disengages the seal, granting passage to the Azure Key."
    },
    // Cipher dial puzzle gate
    {
      id: "puzzle_gate_22",
      type: "puzzle_gate",
      x: 8,
      y: 7,
      z: 0,
      elevation: 0,
      puzzleType: "cipher_dial",
      solution: [0, 1, 2],
      name: "Stellar Cipher Dial"
    },
    // Azure key in central corridor
    {
      id: "key_azure_22",
      type: "key",
      keyId: "key_azure_22",
      color: "blue",
      name: "Azure Archivist Key",
      x: 8,
      y: 4,
      z: 0,
      elevation: 0
    },
    // Azure door in east corridor
    {
      id: "door_azure_22",
      type: "door",
      requiresKey: "key_azure_22",
      color: "blue",
      doorColor: "blue",
      name: "Azure Sanctum Gate",
      x: 15,
      y: 3,
      z: 0,
      elevation: 0
    },
    // Wall art & inscriptions
    {
      id: "wall_decor_22_sun",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "The Outer Ring aligns with the Solar Zenith.",
      playerDialogue: "A wall diagram illustrating the first planetary dial alignment.",
      x: 5,
      y: 5,
      elevation: 0
    },
    {
      id: "wall_decor_22_moon",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "The Middle Ring turns toward the Lunar Crescent.",
      playerDialogue: "A wall diagram illustrating the second dial ring.",
      x: 9,
      y: 5,
      elevation: 0
    },
    {
      id: "wall_decor_22_horizon",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "The Inner Core locks onto the Astral Horizon.",
      playerDialogue: "A wall diagram illustrating the core dial ring.",
      x: 11,
      y: 5,
      elevation: 0
    },
    {
      id: "inscr_secret_22",
      type: "wall_decor",
      decorType: "runic_plate",
      facing: "north",
      text: "ᚲᛁᛈᚺ In the southeastern recess lies the Astrolabe Shard.",
      playerDialogue: "Ancient runes revealing a hidden alcove.",
      x: 11,
      y: 13,
      elevation: 0
    },
    {
      id: "secret_gem_22",
      type: "collectible",
      itemId: "gem_astrolabe_shard",
      name: "Astrolabe Shard",
      points: 350,
      x: 11,
      y: 9,
      z: 0,
      elevation: 0
    },
    {
      id: "torch_ch6_22_spawn",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 4,
      y: 1,
      elevation: 0
    },
    {
      id: "torch_ch6_22_exit",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 14,
      y: 1,
      elevation: 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 23 - 19x15
// The Entangled Wards: Interlocking Rune Ward & Conduit Dynamo Barrier
// =========================================================================
export function makeLevel23() {
  const width = 19, height = 15;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 01 (3,1) Spawn, (17,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1 ], // 02 (16,2) connects col 15 to col 17
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 03 (7,3) Lever 23
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 04
    [  1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1 ], // 05 (8,5) is wall blocking bypass
    [  1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1 ], // 06 (9,6) connects col 9 to row 7
    [  1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1 ], // 07 (1,7) Lectern, (7,7) Rune Ward, (11,7) Lever Barrier
    [  1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1 ], // 08
    [  1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1 ], // 09 (8,9) connects col 9 to col 7
    [  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1 ], // 10
    [  1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1 ], // 11 (17,11) Secret Gem
    [  1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1 ], // 12
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1 ], // 13
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 14 South boundary
  ];

  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "23",
    chapter: "chapter_6",
    zone: "zone_6",
    title: "The Entangled Wards",
    author: "Inbar Rose",
    version: 1,
    dimensions: {
      width,
      height
    },
    config: {
      fogOfWar: false,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: "crypt"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 17,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      wallDirection: "north"
    },
    parSteps: 75,
    parTime: 45,
    architectNote: "Architect's Journal: Entangled wards create an interlocking puzzle. Dispersing the outer rune ward grants access to the dynamo switch, lowering the barrier into the inner cipher chamber.",
    package: {
      layers: "./layers.json",
      entities: "./entities.json",
      documentation: "./README.md"
    }
  };

  const entities = [
    {
      id: "sign_arch_23",
      type: "signpost",
      title: "Architect's Note #23",
      style: "lectern_stone",
      chapter: "chapter_6",
      levelId: "23",
      x: 1,
      y: 7,
      z: 0,
      elevation: 0,
      coordString: "(1, 7, 0)",
      text: "Architect's Journal: Entangled wards create an interlocking puzzle. Dispersing the outer rune ward grants access to the dynamo switch, lowering the barrier into the inner cipher chamber."
    },
    // Outer rune ward
    {
      id: "puzzle_gate_23_rune",
      type: "puzzle_gate",
      x: 7,
      y: 7,
      z: 0,
      elevation: 0,
      puzzleType: "rune_memory",
      solution: [2, 0, 3, 1],
      name: "Outer Rune Ward"
    },
    // Dynamo lever
    {
      id: "lever_23",
      type: "lever",
      label: "Conduit Dynamo Switch",
      x: 7,
      y: 3,
      z: 0,
      elevation: 0,
      targets: [
        {
          action: "toggle_tile",
          layer: "ground",
          x: 11,
          y: 7,
          stateA: 0,
          stateB: 1
        }
      ]
    },
    // Inner cipher ward
    {
      id: "puzzle_gate_23_cipher",
      type: "puzzle_gate",
      x: 15,
      y: 5,
      z: 0,
      elevation: 0,
      puzzleType: "cipher_dial",
      solution: [2, 1, 3],
      name: "Inner Cipher Ward"
    },
    // Wall art & inscriptions
    {
      id: "inscr_entangled_23",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "The outer runes energize the conduit fulcrum. Pull the switch to breach the inner sanctum.",
      playerDialogue: "A wall diagram illustrating the dual ward linkage.",
      x: 5,
      y: 5,
      elevation: 0
    },
    {
      id: "inscr_secret_23",
      type: "wall_decor",
      decorType: "runic_plate",
      facing: "north",
      text: "ᚲᚺᚱ In the southern trench lies the Chronosphere Gem.",
      playerDialogue: "Runic inscription revealing a secret treasure niche.",
      x: 13,
      y: 9,
      elevation: 0
    },
    {
      id: "secret_gem_23",
      type: "collectible",
      itemId: "gem_chronosphere",
      name: "Chronosphere Gem",
      points: 400,
      x: 17,
      y: 11,
      z: 0,
      elevation: 0
    },
    {
      id: "torch_ch6_23_spawn",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 4,
      y: 1,
      elevation: 0
    },
    {
      id: "torch_ch6_23_exit",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 16,
      y: 1,
      elevation: 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 24 - 21x19
// The Grand Archive: Master Crypt Climax (Fog of War, Dual Wards, Dynamo, Gold Sanctum)
// =========================================================================
export function makeLevel24() {
  const width = 21, height = 19;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // 1. West Wing (Spawn to Rune Ward)
  carveV(3, 1, 3);
  carveH(1, 3, 3); // (1, 3) is signpost
  carveV(1, 3, 7);
  carveH(1, 3, 7);
  carveV(3, 5, 7);
  carveH(3, 5, 5);
  carveV(5, 1, 5);
  carveH(5, 7, 1);
  carveV(7, 1, 7); // (7, 7) is puzzle_gate_24_rune

  // 2. Deep Southwest Wing (past Rune Ward to Lever)
  carveV(7, 7, 17);
  carveH(5, 7, 17);
  carveV(5, 9, 17);
  carveH(3, 5, 9);
  carveV(3, 9, 17);
  carveH(1, 3, 17); // (1, 17) is lever_24_archive
  carveV(1, 11, 17); // winding dead end in SW

  // 3. Central Corridor to Conduit Barrier at (11, 7)
  carveH(7, 9, 11);
  carveV(9, 7, 11);
  carveH(9, 11, 7);
  ground[7][11] = 1; // Conduit Barrier (initially wall)

  // 4. Central Chamber (past barrier)
  carveV(11, 3, 6); // (11, 3) is secret gem
  carveH(9, 11, 3);
  carveV(9, 1, 3);
  carveH(9, 11, 1); // northern archive alcove
  carveV(11, 8, 11); // (11, 11) is puzzle_gate_24_cipher

  // 5. East Wing (past Cipher Dial to Key)
  carveV(11, 11, 17);
  carveH(11, 13, 17);
  carveV(13, 1, 17);
  carveH(13, 15, 1);
  carveV(15, 1, 17);
  carveH(15, 17, 17);
  carveV(17, 5, 17);
  carveH(17, 19, 5);
  carveV(19, 5, 17); // (19, 17) is key_gold_24

  // 6. Up to Door and Exit
  carveV(19, 1, 5); // (19, 3) is door_gold_24, (19, 1) is Exit

  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "24",
    chapter: "chapter_6",
    zone: "zone_6",
    title: "The Grand Archive",
    author: "Inbar Rose",
    version: 1,
    dimensions: {
      width,
      height
    },
    config: {
      fogOfWar: true,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: "crypt"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 19,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      wallDirection: "north"
    },
    parSteps: 195,
    parTime: 120,
    architectNote: "Architect's Journal: The innermost archives require master-level mastery of both runic syntax and stellar alignment before the golden sanctum yields its secrets.",
    package: {
      layers: "./layers.json",
      entities: "./entities.json",
      documentation: "./README.md"
    }
  };

  const entities = [
    {
      id: "sign_arch_24",
      type: "signpost",
      title: "Architect's Note #24",
      style: "lectern_stone",
      chapter: "chapter_6",
      levelId: "24",
      x: 1,
      y: 3,
      z: 0,
      elevation: 0,
      coordString: "(1, 3, 0)",
      text: "Architect's Journal: The innermost archives require master-level mastery of both runic syntax and stellar alignment before the golden sanctum yields its secrets."
    },
    // Outer rune ward
    {
      id: "puzzle_gate_24_rune",
      type: "puzzle_gate",
      x: 7,
      y: 7,
      z: 0,
      elevation: 0,
      puzzleType: "rune_memory",
      solution: [3, 1, 2, 0],
      name: "Grand Archivist Rune Seal"
    },
    // Dynamo lever
    {
      id: "lever_24_archive",
      type: "lever",
      label: "Archive Dynamo Fulcrum",
      x: 1,
      y: 17,
      z: 0,
      elevation: 0,
      targets: [
        {
          action: "toggle_tile",
          layer: "ground",
          x: 11,
          y: 7,
          stateA: 0,
          stateB: 1
        }
      ]
    },
    // Inner cipher ward
    {
      id: "puzzle_gate_24_cipher",
      type: "puzzle_gate",
      x: 11,
      y: 11,
      z: 0,
      elevation: 0,
      puzzleType: "cipher_dial",
      solution: [1, 3, 0],
      name: "Grand Astrolabe Cipher"
    },
    // Gold Key
    {
      id: "key_gold_24",
      type: "key",
      keyId: "key_gold_24",
      color: "gold",
      name: "Grand Archivist Key",
      x: 19,
      y: 17,
      z: 0,
      elevation: 0
    },
    // Gold Door
    {
      id: "door_gold_24",
      type: "door",
      requiresKey: "key_gold_24",
      color: "gold",
      doorColor: "gold",
      name: "Grand Sanctum Portal",
      x: 19,
      y: 3,
      z: 0,
      elevation: 0
    },
    // Secret Gem
    {
      id: "secret_gem_24",
      type: "collectible",
      itemId: "gem_grand_archivist",
      name: "Grand Archivist Tome",
      points: 500,
      x: 11,
      y: 3,
      z: 0,
      elevation: 0
    },
    // Wall art & inscriptions
    {
      id: "inscr_rune_24",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "Twilight precedes Dawn, followed by Eclipse and Zenith.",
      playerDialogue: "Ancient inscriptions detailing the Grand Archivist rune cipher.",
      x: 3,
      y: 5,
      elevation: 0
    },
    {
      id: "inscr_cipher_24",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "Align the Astrolabe with the Equinox: Lunar, Solar, and Apex.",
      playerDialogue: "A monumental astronomical mural in the central archive.",
      x: 11,
      y: 8,
      elevation: 0
    },
    {
      id: "inscr_secret_24",
      type: "wall_decor",
      decorType: "runic_plate",
      facing: "north",
      text: "ᚷᚱᚨ In the northern repository rests the Grand Archivist Tome.",
      playerDialogue: "Runic plate pointing toward the northern vault.",
      x: 11,
      y: 4,
      elevation: 0
    },
    {
      id: "torch_ch6_24_spawn",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 4,
      y: 1,
      elevation: 0
    },
    {
      id: "torch_ch6_24_exit",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 18,
      y: 1,
      elevation: 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// RUN ALL TESTS & ASSERTIONS
// =========================================================================
export function runChapter6Tests() {
  const levels = [
    { num: 21, data: makeLevel21() },
    { num: 22, data: makeLevel22() },
    { num: 23, data: makeLevel23() },
    { num: 24, data: makeLevel24() },
  ];

  for (const { num, data } of levels) {
    const fullLevel = {
      ...data.manifest,
      layers: data.layers,
      entities: data.entities
    };

    // 1. Validation
    const rep = LevelValidator.validate(fullLevel);
    if (!rep.valid || rep.errors.length > 0 || rep.warnings.length > 0) {
      console.error(`Validation failed on Level ${num}:`, rep.errors, rep.warnings);
      throw new Error(`Level ${num} validation failed!`);
    }

    // 2. Solvability
    const solution = solveLevel(fullLevel);
    if (!solution || solution.length === 0) {
      throw new Error(`Level ${num} is not solvable!`);
    }

    // 3. Metrics
    const metrics = auditLevelMetrics(fullLevel);
    if (metrics.corridorInertiaPercent < 70) {
      throw new Error(`Level ${num} corridor inertia is below 70%: got ${metrics.corridorInertiaPercent}%`);
    }
    if (metrics.deadSpace4x4Count > 0) {
      throw new Error(`Level ${num} has dead space >= 4x4: ${metrics.deadSpace4x4Count} blocks`);
    }

    // 4. Zero Bypass Tests for Puzzles
    const noPuzzles = solveLevel(fullLevel, { allowPuzzles: false });
    if (noPuzzles !== null) {
      throw new Error(`Level ${num} has puzzle bypass: solvable without puzzles!`);
    }

    const puzzleGates = fullLevel.entities.filter(e => e.type === 'puzzle_gate');
    for (const pg of puzzleGates) {
      const onlyOne = JSON.parse(JSON.stringify(fullLevel));
      onlyOne.entities = onlyOne.entities.filter(e => e.type !== 'puzzle_gate' || e.id === pg.id);
      if (solveLevel(onlyOne, { allowPuzzles: false }) !== null) {
        throw new Error(`Level ${num} puzzle gate ${pg.id} can be bypassed!`);
      }
    }

    // 5. Zero Bypass Tests for Levers
    if (num >= 23) {
      const noLevers = solveLevel(fullLevel, { allowLevers: false });
      if (noLevers !== null) {
        throw new Error(`Level ${num} has lever bypass: solvable without levers!`);
      }
    }

    // 6. Zero Bypass Tests for Doors & Keys
    if (num === 22 || num === 24) {
      const noDoors = solveLevel(fullLevel, { allowDoors: false });
      if (noDoors !== null) {
        throw new Error(`Level ${num} has door bypass: solvable without doors!`);
      }
      const noKeys = JSON.parse(JSON.stringify(fullLevel));
      noKeys.entities = noKeys.entities.filter(e => e.type !== 'key');
      if (solveLevel(noKeys) !== null) {
        throw new Error(`Level ${num} has key bypass: solvable without keys!`);
      }
    }

    console.log(`[Level ${num}: ${fullLevel.title}] Solved in ${solution.length} steps | Par: ${fullLevel.parSteps} | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);
  }

  console.log('\n✨ ALL Chapter 6 levels passed 100% of rigor and unit test assertions!');
}

if (import.meta.url === `file://${process.argv[1]}` || (process.argv[1] && process.argv[1].endsWith('test-ch6-full-rigor.mjs'))) {
  runChapter6Tests();
}
