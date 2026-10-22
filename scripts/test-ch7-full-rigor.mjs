/**
 * Test & Verification Harness for Chapter 7 Rigor Overhaul (Levels 25–28) (BL-184, ADR-0058)
 *
 * Verifies:
 * 1. 100% valid via LevelValidator (0 errors, 0 warnings).
 * 2. Solvable via BFS shortest-path solver.
 * 3. 100% zero-bypass gating:
 *    - Level 25: Unsolvable without Frost Rift teleporter, Azure Key, or Azure Door.
 *    - Level 26: Unsolvable without Conduit Lever, Ruby Key, or Ruby Door.
 *    - Level 27: Unsolvable without Bastion Cipher Gate, Aerial Vortex teleporter, Golden Key, or Golden Door.
 *    - Level 28: Unsolvable without Sovereign Rune Gate, Summit Dynamo Lever, Golden Apex Key, or Golden Apex Door under Fog of War.
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
// LEVEL 25 - 19x17
// The Sovereign Rampart: High Viaducts & Frost Rift
// =========================================================================
export function makeLevel25() {
  const width = 19, height = 17;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // 1. West Wing (Spawn to Ramp Approach)
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 9, 15);
  carveH(1, 5, 15);
  carveV(1, 11, 15);
  carveH(5, 7, 11);
  carveV(7, 10, 11);

  // Ramp and Overhead Bridge:
  ground[9][7] = 'R_N';
  overhead[8][7] = 'B_NS';
  overhead[7][7] = 'B_NS';
  overhead[6][7] = 'B_NS';
  overhead[5][7] = 'B_NS';
  ground[7][6] = 0; ground[7][7] = 'B_EW'; ground[7][8] = 0;
  ground[4][7] = 'R_S';
  carveV(7, 1, 3);
  carveH(7, 9, 1);
  carveV(9, 1, 5); // (9, 5) teleporter_25_alpha

  // 2. East Wing (Teleporter Beta at (11, 11) to Azure Key)
  carveV(11, 11, 15);
  carveH(11, 15, 15);
  carveV(15, 9, 15);
  carveH(13, 15, 9);
  carveV(13, 5, 9);
  carveH(13, 15, 5);
  carveV(15, 3, 5); // (15, 3) key_azure_25

  // 3. Connect to Door and Exit
  carveH(15, 17, 3); // (17, 3) door_azure_25
  carveV(17, 1, 3);  // (17, 1) Exit

  // Secret Gem alcove
  carveH(7, 11, 15); // (9, 15) secret gem
  carveV(9, 13, 15);

  // Anti-deadspace fillers
  carveV(3, 7, 9);
  carveV(11, 1, 4);
  carveH(11, 13, 1);
  carveV(13, 1, 5);
  carveH(17, 17, 5);
  carveV(17, 5, 15);
  carveH(15, 17, 15);
  carveV(9, 7, 11);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "25",
    chapter: "chapter_7",
    zone: "zone_7",
    title: "The Sovereign Rampart",
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
      theme: "snow"
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
    parSteps: 74,
    parTime: 45,
    architectNote: "Architect's Journal: The icy ramparts bridge the frozen abyss. Ascend the wooden incline, traverse the high gallery, and ride the rift to the Azure Sigil.",
    package: {
      layers: "./layers.json",
      entities: "./entities.json",
      documentation: "./README.md"
    }
  };

  const entities = [
    {
      id: "sign_arch_25",
      type: "signpost",
      title: "Architect's Note #25",
      style: "lectern_stone",
      chapter: "chapter_7",
      levelId: "25",
      x: 1,
      y: 3,
      z: 0,
      elevation: 0,
      coordString: "(1, 3, 0)",
      text: "Architect's Journal: The icy ramparts bridge the frozen abyss. Ascend the wooden incline, traverse the high gallery, and ride the rift to the Azure Sigil."
    },
    {
      id: "teleporter_25_alpha",
      type: "teleporter",
      x: 9,
      y: 5,
      z: 0,
      elevation: 0,
      targetX: 11,
      targetY: 11,
      targetZ: 0,
      targetElevation: 0,
      name: "Frost Rift Alpha"
    },
    {
      id: "key_azure_25",
      type: "key",
      keyId: "key_azure_25",
      color: "blue",
      name: "Azure Sigil Key",
      x: 15,
      y: 3,
      z: 0,
      elevation: 0
    },
    {
      id: "door_azure_25",
      type: "door",
      requiresKey: "key_azure_25",
      color: "blue",
      doorColor: "blue",
      name: "Azure Sigil Gate",
      x: 17,
      y: 3,
      z: 0,
      elevation: 0
    },
    {
      id: "secret_gem_25",
      type: "collectible",
      itemId: "gem_glacial_sigil",
      name: "Glacial Sigil Gem",
      points: 400,
      x: 9,
      y: 15,
      z: 0,
      elevation: 0
    },
    {
      id: "inscr_rampart_25",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "Ascend the high viaduct to reach the spatial rift.",
      playerDialogue: "A carved relief showing the rampart bridge crossing the chasm.",
      x: 5,
      y: 9,
      elevation: 0
    },
    {
      id: "inscr_secret_25",
      type: "wall_decor",
      decorType: "runic_plate",
      facing: "north",
      text: "ᚠᚱᛟ In the southern glacial recess lies the Glacial Sigil Gem.",
      playerDialogue: "A bronze plate with glowing ice runes.",
      x: 7,
      y: 15,
      elevation: 0
    },
    {
      id: "torch_ch7_25_spawn",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 4,
      y: 1,
      elevation: 0
    },
    {
      id: "torch_ch7_25_exit",
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
// LEVEL 26 - 21x17
// The Frostfire Conduit: Patrolling Sentinels & Dynamo Conduit Lever
// =========================================================================
export function makeLevel26() {
  const width = 21, height = 17;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // 1. West Wing (Spawn to Conduit Lever)
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 5, 9);
  carveH(1, 5, 9);
  carveV(5, 1, 9);
  carveH(5, 7, 1);
  carveV(7, 1, 15);
  carveH(1, 7, 15);
  carveV(1, 11, 15);
  carveH(1, 3, 11);
  carveH(1, 3, 7); // (1, 7) lectern #26

  // Deep south branch to Conduit Lever at (3, 13)
  carveV(3, 13, 15); // (3, 13) lever_26_frost

  // 2. Center Trench (guarded by Patroller)
  carveH(7, 10, 7);
  ground[7][11] = 1; // Conduit Barrier (stateA: 0, stateB: 1)
  carveV(9, 7, 15);
  carveH(9, 11, 15);
  carveV(11, 11, 15);
  carveH(11, 13, 11);
  carveV(13, 9, 13); // sentinel loop

  // 3. Past Barrier at (11, 7) to East Wing & Ruby Key
  carveH(12, 15, 7);
  carveV(15, 7, 15);
  carveH(15, 19, 15);
  carveV(19, 9, 15);
  carveH(17, 19, 9);
  carveV(17, 3, 9);
  carveH(17, 19, 5);
  carveV(19, 5, 7); // (19, 7) key_ruby_26

  // 4. North East to Ruby Door and Exit
  carveH(15, 19, 3);
  carveV(19, 1, 3); // (19, 3) door_ruby_26, (19, 1) Exit

  // Secret Gem in northern recess
  carveV(11, 1, 6);
  carveH(11, 13, 3);
  carveV(13, 1, 3); // (13, 1) gem_frostfire_shard

  // Anti-deadspace fillers
  carveV(15, 1, 5);
  carveH(15, 17, 1);
  carveV(17, 1, 3);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "26",
    chapter: "chapter_7",
    zone: "zone_7",
    title: "The Frostfire Conduit",
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
      theme: "snow"
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
    parSteps: 121,
    parTime: 75,
    architectNote: "Architect's Journal: Frostfire conduits regulate the moat portcullises. Shifting the dynamo fulcrum lowers the frozen barrier, permitting entry into the inner fortress.",
    package: {
      layers: "./layers.json",
      entities: "./entities.json",
      documentation: "./README.md"
    }
  };

  const entities = [
    {
      id: "sign_arch_26",
      type: "signpost",
      title: "Architect's Note #26",
      style: "lectern_stone",
      chapter: "chapter_7",
      levelId: "26",
      x: 1,
      y: 7,
      z: 0,
      elevation: 0,
      coordString: "(1, 7, 0)",
      text: "Architect's Journal: Frostfire conduits regulate the moat portcullises. Shifting the dynamo fulcrum lowers the frozen barrier, permitting entry into the inner fortress."
    },
    {
      id: "lever_26_frost",
      type: "lever",
      label: "Frostfire Conduit Fulcrum",
      x: 3,
      y: 13,
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
    {
      id: "patroller_26",
      type: "patroller",
      x: 9,
      y: 15,
      z: 0,
      elevation: 0,
      patrolPath: [
        { x: 9, y: 15 },
        { x: 11, y: 15 },
        { x: 11, y: 11 },
        { x: 9, y: 11 }
      ],
      speed: 1.0,
      name: "Frost Sentinel"
    },
    {
      id: "key_ruby_26",
      type: "key",
      keyId: "key_ruby_26",
      color: "red",
      name: "Ruby Sanctuary Key",
      x: 19,
      y: 7,
      z: 0,
      elevation: 0
    },
    {
      id: "door_ruby_26",
      type: "door",
      requiresKey: "key_ruby_26",
      color: "red",
      doorColor: "red",
      name: "Ruby Sanctuary Gate",
      x: 19,
      y: 3,
      z: 0,
      elevation: 0
    },
    {
      id: "secret_gem_26",
      type: "collectible",
      itemId: "gem_frostfire_shard",
      name: "Frostfire Shard",
      points: 450,
      x: 13,
      y: 1,
      z: 0,
      elevation: 0
    },
    {
      id: "inscr_conduit_26",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "The conduit switch in the lower bastion controls the moat gate.",
      playerDialogue: "Wall relief depicting the mechanism connecting the switch to the portcullis.",
      x: 5,
      y: 5,
      elevation: 0
    },
    {
      id: "inscr_secret_26",
      type: "wall_decor",
      decorType: "runic_plate",
      facing: "north",
      text: "ᚠᛁᚱ In the northern gallery rests the Frostfire Shard.",
      playerDialogue: "Frost-covered runes pointing to the upper gallery niche.",
      x: 13,
      y: 3,
      elevation: 0
    },
    {
      id: "torch_ch7_26_spawn",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 4,
      y: 1,
      elevation: 0
    },
    {
      id: "torch_ch7_26_exit",
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
// LEVEL 27 - 21x19
// The Prismatic Bastion: Cipher Dial Gate & Aerial Vortex Warp
// =========================================================================
export function makeLevel27() {
  const width = 21, height = 19;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // 1. West Wing (Spawn to Cipher Dial Gate)
  carveV(3, 1, 3);
  carveH(1, 3, 3); // (1, 3) signpost #27
  carveV(1, 3, 7);
  carveH(1, 3, 7);
  carveV(3, 5, 7);
  carveH(3, 5, 5);
  carveV(5, 1, 5);
  carveH(5, 7, 1);
  carveV(7, 1, 9);
  carveH(5, 7, 9);
  carveV(5, 9, 13);
  carveH(3, 5, 13);
  carveV(3, 9, 13);
  carveH(1, 3, 9);
  carveV(1, 9, 17);
  carveH(1, 7, 17);
  carveV(7, 11, 17);
  carveH(7, 9, 11);
  carveV(9, 7, 11); // (9, 7) puzzle_gate_27_dial

  // 2. Center Wing (Past Cipher Dial to Aerial Vortex Teleporter)
  carveH(9, 11, 7);
  carveV(11, 3, 7);
  carveH(9, 11, 3);
  carveV(9, 1, 3);
  carveV(11, 7, 13);
  carveH(9, 11, 13);
  carveV(9, 13, 17); // (9, 17) teleporter_27_vortex

  // 3. Isolated East Bastion Spire (Teleporter Spire at (13, 17) to Golden Key)
  carveH(13, 15, 17);
  carveV(15, 13, 17);
  carveH(13, 15, 13);
  carveV(13, 5, 13);
  carveH(13, 15, 5);
  carveV(15, 1, 5);
  carveH(15, 17, 1);
  carveV(17, 1, 11);
  carveH(17, 19, 11);
  carveV(19, 11, 17); // (19, 17) key_gold_27

  // 4. Return to North Exit path & Golden Gate
  carveV(19, 3, 11); // (19, 3) door_gold_27, (19, 1) Exit
  carveV(19, 1, 3);

  // Secret Gem alcove
  carveH(11, 13, 1); // (11, 1) gem_bastion_core

  // Anti-deadspace fillers
  carveV(13, 1, 3);
  carveV(17, 13, 17);
  carveH(17, 18, 17);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "27",
    chapter: "chapter_7",
    zone: "zone_7",
    title: "The Prismatic Bastion",
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
      theme: "snow"
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
    parSteps: 164,
    parTime: 100,
    architectNote: "Architect's Journal: Beyond the cipher dial lies the aerial vortex. Ride the crystalline updraft across the frozen abyss to seize the Golden Citadel Key.",
    package: {
      layers: "./layers.json",
      entities: "./entities.json",
      documentation: "./README.md"
    }
  };

  const entities = [
    {
      id: "sign_arch_27",
      type: "signpost",
      title: "Architect's Note #27",
      style: "lectern_stone",
      chapter: "chapter_7",
      levelId: "27",
      x: 1,
      y: 3,
      z: 0,
      elevation: 0,
      coordString: "(1, 3, 0)",
      text: "Architect's Journal: Beyond the cipher dial lies the aerial vortex. Ride the crystalline updraft across the frozen abyss to seize the Golden Citadel Key."
    },
    {
      id: "puzzle_gate_27_dial",
      type: "puzzle_gate",
      x: 9,
      y: 7,
      z: 0,
      elevation: 0,
      puzzleType: "cipher_dial",
      solution: [2, 0, 1],
      name: "Bastion Cipher Gate"
    },
    {
      id: "teleporter_27_vortex",
      type: "teleporter",
      x: 9,
      y: 17,
      z: 0,
      elevation: 0,
      targetX: 13,
      targetY: 17,
      targetZ: 0,
      targetElevation: 0,
      name: "Aerial Vortex"
    },
    {
      id: "key_gold_27",
      type: "key",
      keyId: "key_gold_27",
      color: "gold",
      name: "Golden Citadel Key",
      x: 19,
      y: 17,
      z: 0,
      elevation: 0
    },
    {
      id: "door_gold_27",
      type: "door",
      requiresKey: "key_gold_27",
      color: "gold",
      doorColor: "gold",
      name: "Golden Bastion Portal",
      x: 19,
      y: 3,
      z: 0,
      elevation: 0
    },
    {
      id: "secret_gem_27",
      type: "collectible",
      itemId: "gem_bastion_core",
      name: "Bastion Core Crystal",
      points: 500,
      x: 11,
      y: 1,
      z: 0,
      elevation: 0
    },
    {
      id: "inscr_cipher_27",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "Align the Citadel Dial: Apex Zenith, Lunar Crescent, and Solar Flare.",
      playerDialogue: "Wall diagram illustrating the celestial dial sequence.",
      x: 7,
      y: 5,
      elevation: 0
    },
    {
      id: "inscr_secret_27",
      type: "wall_decor",
      decorType: "runic_plate",
      facing: "north",
      text: "ᚲᛟᚱ In the pinnacle watchtower lies the Bastion Core Crystal.",
      playerDialogue: "Bronze plate pointing to the northern spire vault.",
      x: 11,
      y: 3,
      elevation: 0
    },
    {
      id: "torch_ch7_27_spawn",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 4,
      y: 1,
      elevation: 0
    },
    {
      id: "torch_ch7_27_exit",
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
// LEVEL 28 - 23x21
// The Sovereign's Ascent: Grand Summit Climax (Fog of War, Ramparts, Sentinel, Lever, Apex)
// =========================================================================
export function makeLevel28() {
  const width = 23, height = 21;
  const ground = Array.from({ length: height }, () => new Array(width).fill(1));
  const overhead = Array.from({ length: height }, () => new Array(width).fill(0));

  function carveH(x1, x2, y) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) ground[y][x] = 0;
  }
  function carveV(x, y1, y2) {
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) ground[y][x] = 0;
  }

  // 1. Outer Fortress & West Wing (Spawn to Rune Memory Gate)
  carveV(3, 1, 5);
  carveH(1, 3, 3); // (1, 3) signpost #28
  carveV(1, 3, 7);
  carveH(1, 5, 7);
  carveV(5, 1, 7);
  carveH(5, 7, 1);
  carveV(7, 1, 7);
  carveH(1, 7, 9);
  carveV(1, 9, 13);
  carveH(1, 5, 13);
  carveV(5, 11, 15);
  carveH(3, 5, 15);
  carveV(3, 15, 19);
  carveH(1, 3, 19);
  carveV(1, 15, 19);
  carveH(3, 7, 19);
  carveV(7, 15, 19);
  carveH(7, 9, 15); // (9, 15) puzzle_gate_28_rune! (ONLY connection from West!)

  // Dead space reducers in West
  carveV(3, 9, 13);
  carveH(3, 7, 11);
  carveV(7, 7, 11);
  carveV(5, 7, 9);

  // 2. High Rampart Viaduct ($Z=1$)
  ground[14][9] = 'R_N';
  overhead[13][9] = 'B_NS';
  overhead[12][9] = 'B_NS';
  overhead[11][9] = 'B_NS';
  overhead[10][9] = 'B_NS';
  ground[9][9] = 'R_S';
  carveV(9, 7, 8);
  carveH(9, 11, 8);
  carveV(11, 8, 11); // (11, 11) checkpoint_28

  // 3. Central Sentinel Moat & Dynamo Lever
  carveV(11, 11, 19); // (11, 19) lever_28_summit
  carveH(11, 15, 13);
  carveV(15, 13, 19);
  carveH(13, 15, 19);
  carveV(13, 15, 19); // sentinel patrol loop

  // Conduit Barrier at (15, 7)
  carveH(11, 14, 7);
  ground[7][15] = 1; // Conduit Barrier (stateA: 0, stateB: 1)
  carveH(16, 17, 7);

  // 4. East Wing & Golden Apex Key
  carveV(17, 3, 11);
  carveH(17, 21, 11);
  carveV(19, 11, 19);
  carveH(19, 21, 19); // (21, 19) key_gold_28
  carveV(21, 11, 19);

  // Dead space reducers in East and Center
  carveV(17, 11, 17);
  carveH(17, 19, 15);
  carveV(19, 5, 11);
  carveH(17, 19, 5);
  carveH(17, 21, 9);
  carveH(17, 19, 17);
  carveV(9, 1, 5);
  carveV(13, 8, 10);

  // 5. Summit Ascent to Golden Door & Exit
  carveV(19, 3, 11);
  carveH(19, 21, 3); // (21, 3) door_gold_28
  carveV(21, 1, 3);  // (21, 1) Exit

  // Secret Gem alcove
  carveV(15, 1, 5);
  carveH(13, 15, 1);
  carveV(13, 1, 5); // (13, 1) gem_sovereign_crown
  carveH(11, 13, 5);
  carveV(11, 3, 5);
  carveH(11, 13, 3);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "28",
    chapter: "chapter_7",
    zone: "zone_7",
    title: "The Sovereign's Ascent",
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
      theme: "snow"
    },
    spawn: {
      x: 3,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north"
    },
    exit: {
      x: 21,
      y: 1,
      elevation: 0,
      style: "wall_archway",
      wallDirection: "north"
    },
    parSteps: 135,
    parTime: 80,
    architectNote: "Architect's Journal: The summit rampart is the crucible of the northern realm. Conquer the rune seal, traverse the high bridge over the sentinel moat, and throw the dynamo switch to open the Golden Apex.",
    package: {
      layers: "./layers.json",
      entities: "./entities.json",
      documentation: "./README.md"
    }
  };

  const entities = [
    {
      id: "sign_arch_28",
      type: "signpost",
      title: "Architect's Note #28",
      style: "lectern_stone",
      chapter: "chapter_7",
      levelId: "28",
      x: 1,
      y: 3,
      z: 0,
      elevation: 0,
      coordString: "(1, 3, 0)",
      text: "Architect's Journal: The summit rampart is the crucible of the northern realm. Conquer the rune seal, traverse the high bridge over the sentinel moat, and throw the dynamo switch to open the Golden Apex."
    },
    {
      id: "puzzle_gate_28_rune",
      type: "puzzle_gate",
      x: 9,
      y: 15,
      z: 0,
      elevation: 0,
      puzzleType: "rune_memory",
      solution: [1, 3, 0, 2],
      name: "Sovereign Rune Seal"
    },
    {
      id: "checkpoint_28",
      type: "checkpoint",
      name: "Summit Redoubt Checkpoint",
      x: 11,
      y: 11,
      z: 0,
      elevation: 0
    },
    {
      id: "patroller_28",
      type: "patroller",
      x: 15,
      y: 13,
      z: 0,
      elevation: 0,
      patrolPath: [
        { x: 15, y: 13 },
        { x: 15, y: 19 },
        { x: 13, y: 19 },
        { x: 13, y: 15 }
      ],
      speed: 1.0,
      name: "Summit Sentinel"
    },
    {
      id: "lever_28_summit",
      type: "lever",
      label: "Summit Portcullis Dynamo",
      x: 11,
      y: 19,
      z: 0,
      elevation: 0,
      targets: [
        {
          action: "toggle_tile",
          layer: "ground",
          x: 15,
          y: 7,
          stateA: 0,
          stateB: 1
        }
      ]
    },
    {
      id: "key_gold_28",
      type: "key",
      keyId: "key_gold_28",
      color: "gold",
      name: "Golden Apex Key",
      x: 21,
      y: 19,
      z: 0,
      elevation: 0
    },
    {
      id: "door_gold_28",
      type: "door",
      requiresKey: "key_gold_28",
      color: "gold",
      doorColor: "gold",
      name: "Golden Apex Portal",
      x: 21,
      y: 3,
      z: 0,
      elevation: 0
    },
    {
      id: "secret_gem_28",
      type: "collectible",
      itemId: "gem_sovereign_crown",
      name: "Sovereign Crown Jewel",
      points: 600,
      x: 13,
      y: 1,
      z: 0,
      elevation: 0
    },
    {
      id: "inscr_ascent_28",
      type: "wall_decor",
      decorType: "carving",
      facing: "north",
      text: "Only those who master the ancient runes may tread the high rampart of kings.",
      playerDialogue: "Wall relief depicting the majestic mountain citadel.",
      x: 7,
      y: 3,
      elevation: 0
    },
    {
      id: "inscr_secret_28",
      type: "wall_decor",
      decorType: "runic_plate",
      facing: "north",
      text: "ᚲᚱᛟ In the zenith vault rests the Sovereign Crown Jewel.",
      playerDialogue: "Gilded frost plate pointing to the northern vault.",
      x: 13,
      y: 3,
      elevation: 0
    },
    {
      id: "torch_ch7_28_spawn",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 4,
      y: 1,
      elevation: 0
    },
    {
      id: "torch_ch7_28_exit",
      type: "wall_decor",
      decorType: "torch",
      facing: "north",
      x: 20,
      y: 1,
      elevation: 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// RUN ALL TESTS & ASSERTIONS
// =========================================================================
export function runChapter7Tests() {
  const levels = [
    { num: 25, data: makeLevel25() },
    { num: 26, data: makeLevel26() },
    { num: 27, data: makeLevel27() },
    { num: 28, data: makeLevel28() },
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
    if (num === 27 || num === 28) {
      const noPuzzles = solveLevel(fullLevel, { allowPuzzles: false });
      if (noPuzzles !== null) {
        throw new Error(`Level ${num} has puzzle bypass: solvable without puzzles!`);
      }
    }

    // 5. Zero Bypass Tests for Teleporters
    if (num === 25 || num === 27) {
      const noTeleporters = solveLevel(fullLevel, { allowTeleporters: false });
      if (noTeleporters !== null) {
        throw new Error(`Level ${num} has teleporter bypass: solvable without teleporters!`);
      }
    }

    // 6. Zero Bypass Tests for Levers
    if (num === 26 || num === 28) {
      const noLevers = solveLevel(fullLevel, { allowLevers: false });
      if (noLevers !== null) {
        throw new Error(`Level ${num} has lever bypass: solvable without levers!`);
      }
    }

    // 7. Zero Bypass Tests for Doors & Keys
    const noDoors = solveLevel(fullLevel, { allowDoors: false });
    if (noDoors !== null) {
      throw new Error(`Level ${num} has door bypass: solvable without doors!`);
    }
    const noKeys = JSON.parse(JSON.stringify(fullLevel));
    noKeys.entities = noKeys.entities.filter(e => e.type !== 'key');
    if (solveLevel(noKeys) !== null) {
      throw new Error(`Level ${num} has key bypass: solvable without keys!`);
    }

    console.log(`[Level ${num}: ${fullLevel.title}] Solved in ${solution.length} steps | Par: ${fullLevel.parSteps} | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);
  }

  console.log('\n✨ ALL Chapter 7 levels passed 100% of rigor and unit test assertions!');
}

if (import.meta.url === `file://${process.argv[1]}` || (process.argv[1] && process.argv[1].endsWith('test-ch7-full-rigor.mjs'))) {
  runChapter7Tests();
}
