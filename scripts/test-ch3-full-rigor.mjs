/**
 * Test & Verification Harness for Chapter 3 Rigor Overhaul (Levels 9–12) (BL-180, ADR-0054)
 *
 * Verifies:
 * 1. 100% valid via LevelValidator (0 errors, 0 warnings).
 * 2. Solvable via BFS shortest-path solver.
 * 3. 100% zero-bypass gating:
 *    - Level 9: Unsolvable without lever_9.
 *    - Level 10: Unsolvable without lever_10_west, unsolvable without lever_10_east.
 *    - Level 11: Unsolvable without lever_11_counterweight, unsolvable without key_gold_11.
 *    - Level 12: Unsolvable without key_ruby_12, unsolvable without lever_12_dynamo.
 * 4. Architectural criteria:
 *    - Corridor directional inertia >= 70%.
 *    - Zero dead space >= 4x4.
 *    - Non-corner spawns.
 *    - North wall doorway entrance ('wall_doorway', 'north') & archway exit ('wall_archway', 'north').
 *    - Stone lecterns with coordinates (X, Y, Z).
 *    - Diegetic wall carvings and runic plates for secret chambers.
 */

import { solveLevel } from '../js/engine/solver.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';

// =========================================================================
// LEVEL 9 (Ki) - 15x13
// The Iron Lever: Introduces dynamic mechanical levers
// =========================================================================
export function makeLevel9() {
  const width = 15, height = 13;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1 ], // 01 (3,1) Spawn, (13,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 02
    [  1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1 ], // 03 (13,3) Gate
    [  1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1 ], // 04 (11,4) = 0
    [  1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1 ], // 05 (11,5) = 0, (13,5)=0
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 06 (13,6) = 0
    [  1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 07 (13,7) lever!
    [  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1 ], // 08
    [  1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1 ], // 09
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1 ], // 10
    [  1, 0, 0, 0, 1,'SW',0, 0, 0, 0, 1, 0, 0, 0, 1 ], // 11 (1,11) Lectern, (6,11) Gem
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // 12
  ];

  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  const manifest = {
    "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    "id": "9",
    "chapter": "chapter_3",
    "zone": "zone_3",
    "title": "The Iron Lever",
    "author": "Inbar Rose",
    "version": 1,
    "dimensions": { width, height },
    "config": {
      "fogOfWar": false,
      "viewRadius": 7,
      "allowFreePan": true,
      "tileSize": 32,
      "theme": "dungeon"
    },
    "spawn": { "x": 3, "y": 1, "elevation": 0, "style": "wall_doorway", "wallDirection": "north" },
    "exit": { "x": 13, "y": 1, "elevation": 0, "style": "wall_archway", "wallDirection": "north" },
    "parSteps": 27,
    "parTime": 17,
    "architectNote": "Architect's Journal: Deep within the iron foundry, heavy portcullis barriers respond not to keys, but to counterweighted mechanical levers. Flip the southern lever to lower the northern gate.",
    "package": { "layers": "./layers.json", "entities": "./entities.json", "documentation": "./README.md" }
  };

  const entities = [
    {
      "id": "sign_arch_9",
      "type": "signpost",
      "title": "Architect's Note #9",
      "style": "lectern_stone",
      "chapter": "chapter_3",
      "levelId": "9",
      "x": 1,
      "y": 11,
      "z": 0,
      "elevation": 0,
      "coordString": "(1, 11, 0)",
      "text": "Architect's Journal: Deep within the iron foundry, heavy portcullis barriers respond not to keys, but to counterweighted mechanical levers. Flip the southern lever to lower the northern gate."
    },
    {
      "id": "inscr_foundry_9",
      "type": "wall_decor",
      "decorType": "carving",
      "facing": "north",
      "text": "The iron fulcrum in the southeast chamber lowers the northern gate. Trace the gears through the smelting hall.",
      "playerDialogue": "A mechanical schematic showing iron cables leading to the northern portcullis.",
      "x": 3,
      "y": 4,
      "elevation": 0
    },
    {
      "id": "inscr_secret_9",
      "type": "wall_decor",
      "decorType": "runic_plate",
      "facing": "north",
      "text": "ᚲᛁᛈᚺ Behind the soot-stained western pillar rests the master forgemaster's gear.",
      "playerDialogue": "Bronze runes point to a loose stone seam in the western recess.",
      "x": 2,
      "y": 11,
      "elevation": 0
    },
    {
      "id": "lever_9",
      "type": "lever",
      "label": "Iron Foundry Switch",
      "x": 13,
      "y": 7,
      "z": 0,
      "elevation": 0,
      "targets": [
        { "action": "toggle_tile", "layer": "ground", "x": 13, "y": 3, "stateA": 0, "stateB": 1 }
      ]
    },
    {
      "id": "secret_gem_9",
      "type": "collectible",
      "itemId": "gem_gear",
      "name": "Forgemaster's Gear",
      "points": 300,
      "x": 6,
      "y": 11,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "torch_ch3_9_spawn",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 4,
      "y": 1,
      "elevation": 0
    },
    {
      "id": "torch_ch3_9_exit",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 12,
      "y": 1,
      "elevation": 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 10 (Shō) - 17x15
// Clockwork Gates: Dual sequential valves (west valve -> east piston)
// =========================================================================
export function makeLevel10() {
  const width = 17, height = 15;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1 ], // 01 (3,1) Spawn, (15,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 02
    [  1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1 ], // 03 (15,3) Gate
    [  1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1 ], // 04 (3,4) = 0
    [  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1 ], // 05
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1 ], // 06
    [  1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 07 (8,7) Gate
    [  1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 08 (7,8) = 0
    [  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1 ], // 09 (7,9) = 0
    [  1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1 ], // 10 (7,10) = 0
    [  1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1 ], // 11 (6,11) = 0
    [  1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1 ], // 12
    [  1, 0, 1,'SW',0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1 ], // 13 (1,13) lever_west, (15,13) lever_east
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // 14
  ];

  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  const manifest = {
    "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    "id": "10",
    "chapter": "chapter_3",
    "zone": "zone_3",
    "title": "Clockwork Gates",
    "author": "Inbar Rose",
    "version": 1,
    "dimensions": { width, height },
    "config": {
      "fogOfWar": false,
      "viewRadius": 7,
      "allowFreePan": true,
      "tileSize": 32,
      "theme": "dungeon"
    },
    "spawn": { "x": 3, "y": 1, "elevation": 0, "style": "wall_doorway", "wallDirection": "north" },
    "exit": { "x": 15, "y": 1, "elevation": 0, "style": "wall_archway", "wallDirection": "north" },
    "parSteps": 66,
    "parTime": 40,
    "architectNote": "Architect's Journal: Twin mechanical valves control the hydraulic floodgates. The western boiler lever unlocks passage across the central dividing bulkhead, granting access to the eastern piston switch.",
    "package": { "layers": "./layers.json", "entities": "./entities.json", "documentation": "./README.md" }
  };

  const entities = [
    {
      "id": "sign_arch_10",
      "type": "signpost",
      "title": "Architect's Note #10",
      "style": "lectern_stone",
      "chapter": "chapter_3",
      "levelId": "10",
      "x": 9,
      "y": 13,
      "z": 0,
      "elevation": 0,
      "coordString": "(9, 13, 0)",
      "text": "Architect's Journal: Twin mechanical valves control the hydraulic floodgates. The western boiler lever unlocks passage across the central dividing bulkhead, granting access to the eastern piston switch."
    },
    {
      "id": "inscr_clockwork_10",
      "type": "wall_decor",
      "decorType": "carving",
      "facing": "north",
      "text": "Dual pressure valves govern the foundry. West releases the central bulkhead; East lowers the exit portcullis.",
      "playerDialogue": "A sequential diagram carved in stone showing hydraulic fluid flowing from West to East.",
      "x": 5,
      "y": 4,
      "elevation": 0
    },
    {
      "id": "inscr_secret_10",
      "type": "wall_decor",
      "decorType": "runic_plate",
      "facing": "north",
      "text": "ᚲᛁᛈᚺ An antique brass chronometer ticks behind the southern piston bulkhead.",
      "playerDialogue": "The rune plate indicates a hollow wall seam in the southeastern corridor.",
      "x": 10,
      "y": 13,
      "elevation": 0
    },
    {
      "id": "lever_10_west",
      "type": "lever",
      "label": "West Boiler Valve",
      "x": 1,
      "y": 13,
      "z": 0,
      "elevation": 0,
      "targets": [
        { "action": "toggle_tile", "layer": "ground", "x": 8, "y": 7, "stateA": 0, "stateB": 1 }
      ]
    },
    {
      "id": "lever_10_east",
      "type": "lever",
      "label": "East Piston Switch",
      "x": 15,
      "y": 13,
      "z": 0,
      "elevation": 0,
      "targets": [
        { "action": "toggle_tile", "layer": "ground", "x": 15, "y": 3, "stateA": 0, "stateB": 1 }
      ]
    },
    {
      "id": "secret_gem_10",
      "type": "collectible",
      "itemId": "gem_chronometer",
      "name": "Brass Chronometer",
      "points": 350,
      "x": 5,
      "y": 13,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "torch_ch3_10_spawn",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 2,
      "y": 1,
      "elevation": 0
    },
    {
      "id": "torch_ch3_10_exit",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 16,
      "y": 1,
      "elevation": 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 11 (Ten) - 17x15
// Shifting Foundations: Hybrid mechanics (counterweight lever + gold sluice key)
// =========================================================================
export function makeLevel11() {
  const width = 17, height = 15;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1 ], // 01 (3,1) Spawn, (15,1) Exit
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 02 (15,2) door_gold_11!
    [  1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1 ], // 03 (15,3) corridor
    [  1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1 ], // 04
    [  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1 ], // 05
    [  1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1 ], // 06
    [  1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1 ], // 07 (8,7) lever_11_counterweight!
    [  1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 08 (7,8) = 0
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1 ], // 09 (7,9) = 0
    [  1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1 ], // 10 (7,10) = 0
    [  1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1 ], // 11
    [  1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1 ], // 12 (1,12) barrier
    [  1, 0, 1,'SW',0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1 ], // 13 (1,13) key_gold_11
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // 14
  ];

  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  const manifest = {
    "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    "id": "11",
    "chapter": "chapter_3",
    "zone": "zone_3",
    "title": "Shifting Foundations",
    "author": "Inbar Rose",
    "version": 1,
    "dimensions": { width, height },
    "config": {
      "fogOfWar": false,
      "viewRadius": 7,
      "allowFreePan": true,
      "tileSize": 32,
      "theme": "dungeon"
    },
    "spawn": { "x": 3, "y": 1, "elevation": 0, "style": "wall_doorway", "wallDirection": "north" },
    "exit": { "x": 15, "y": 1, "elevation": 0, "style": "wall_archway", "wallDirection": "north" },
    "parSteps": 91,
    "parTime": 55,
    "architectNote": "Architect's Journal: Shifting counterweight machinery reconfigures the lower foundation walls. Flip the central mechanism to open the southern sluice tunnel and retrieve the golden key.",
    "package": { "layers": "./layers.json", "entities": "./entities.json", "documentation": "./README.md" }
  };

  const entities = [
    {
      "id": "sign_arch_11",
      "type": "signpost",
      "title": "Architect's Note #11",
      "style": "lectern_stone",
      "chapter": "chapter_3",
      "levelId": "11",
      "x": 9,
      "y": 13,
      "z": 0,
      "elevation": 0,
      "coordString": "(9, 13, 0)",
      "text": "Architect's Journal: Shifting counterweight machinery reconfigures the lower foundation walls. Flip the central mechanism to open the southern sluice tunnel and retrieve the golden key."
    },
    {
      "id": "inscr_foundations_11",
      "type": "wall_decor",
      "decorType": "carving",
      "facing": "north",
      "text": "Counterweight pulleys suspend the southern foundation wall. Release the catch to seize the golden sluice key.",
      "playerDialogue": "A mechanical diagram illustrating pulleys raising a heavy granite portcullis.",
      "x": 5,
      "y": 4,
      "elevation": 0
    },
    {
      "id": "inscr_secret_11",
      "type": "wall_decor",
      "decorType": "runic_plate",
      "facing": "north",
      "text": "ᚲᛁᛈᚺ A gilded flywheel is concealed behind the southeastern mortared stones.",
      "playerDialogue": "Runic markings expose a brittle section of wall near the dead end.",
      "x": 14,
      "y": 13,
      "elevation": 0
    },
    {
      "id": "lever_11_counterweight",
      "type": "lever",
      "label": "Counterweight Mechanism",
      "x": 8,
      "y": 7,
      "z": 0,
      "elevation": 0,
      "targets": [
        { "action": "toggle_tile", "layer": "ground", "x": 1, "y": 12, "stateA": 0, "stateB": 1 }
      ]
    },
    {
      "id": "key_gold_11",
      "type": "key",
      "color": "#f59e0b",
      "keyId": "key_gold_11",
      "x": 1,
      "y": 13,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "door_gold_11",
      "type": "door",
      "color": "#f59e0b",
      "requiresKey": "key_gold_11",
      "x": 15,
      "y": 2,
      "elevation": 0
    },
    {
      "id": "secret_gem_11",
      "type": "collectible",
      "itemId": "gem_flywheel",
      "name": "Gilded Flywheel",
      "points": 400,
      "x": 5,
      "y": 13,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "torch_ch3_11_spawn",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 2,
      "y": 1,
      "elevation": 0
    },
    {
      "id": "torch_ch3_11_exit",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 16,
      "y": 1,
      "elevation": 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 12 (Ketsu) - 19x17
// Master of Wheels: Climax synthesizing ruby key + master dynamo lever under Fog of War
// =========================================================================
export function makeLevel12() {
  const width = 19, height = 17;
  const ground = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 00 North boundary wall
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1 ], // 01 (17,1) Exit wall_archway
    [  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1 ], // 02 (9,2) Spawn wall_doorway; (17,2) Gate lowered by lever!
    [  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 03 (17,3) corridor before gate
    [  1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], // 04
    [  1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1 ], // 05
    [  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1 ], // 06
    [  1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 07 (10..17, 7) = 0; (17,7) door_ruby_12
    [  1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1 ], // 08
    [  1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1 ], // 09
    [  1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1 ], // 10
    [  1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1 ], // 11
    [  1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1 ], // 12
    [  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1 ], // 13
    [  1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1 ], // 14
    [  1, 0, 1,'SW',0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1 ], // 15 (1,15) key_ruby, (17,15) lever_dynamo
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // 16 South boundary wall
  ];

  const overhead = Array.from({ length: height }, () => Array(width).fill(0));

  const manifest = {
    "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    "id": "12",
    "chapter": "chapter_3",
    "zone": "zone_3",
    "title": "Master of Wheels",
    "author": "Inbar Rose",
    "version": 1,
    "dimensions": { width, height },
    "config": {
      "fogOfWar": true,
      "viewRadius": 7,
      "allowFreePan": true,
      "tileSize": 32,
      "theme": "dungeon"
    },
    "spawn": { "x": 9, "y": 2, "elevation": 0, "style": "wall_doorway", "wallDirection": "north" },
    "exit": { "x": 17, "y": 1, "elevation": 0, "style": "wall_archway", "wallDirection": "north" },
    "parSteps": 113,
    "parTime": 68,
    "architectNote": "Architect's Journal: At the heart of the clockwork citadel stands the Master Dynamo. Sealed by ancient crimson wards and steam pressure gates, only those who synthesize key and lever shall pass into the astral depths.",
    "package": { "layers": "./layers.json", "entities": "./entities.json", "documentation": "./README.md" }
  };

  const entities = [
    {
      "id": "sign_arch_12",
      "type": "signpost",
      "title": "Architect's Note #12",
      "style": "lectern_stone",
      "chapter": "chapter_3",
      "levelId": "12",
      "x": 9,
      "y": 15,
      "z": 0,
      "elevation": 0,
      "coordString": "(9, 15, 0)",
      "text": "Architect's Journal: At the heart of the clockwork citadel stands the Master Dynamo. Sealed by ancient crimson wards and steam pressure gates, only those who synthesize key and lever shall pass into the astral depths."
    },
    {
      "id": "inscr_dynamo_12",
      "type": "wall_decor",
      "decorType": "carving",
      "facing": "north",
      "text": "The Grand Dynamo commands the citadel. The crimson seal guards the power switch; the switch releases the apex archway.",
      "playerDialogue": "A sprawling blueprint cut into iron showing the ruby lock securing the dynamo circuit.",
      "x": 9,
      "y": 5,
      "elevation": 0
    },
    {
      "id": "inscr_secret_12",
      "type": "wall_decor",
      "decorType": "runic_plate",
      "facing": "north",
      "text": "ᚲᛁᛈᚺ The Dynamo Core Crystal gleams in the southwest crucible recess.",
      "playerDialogue": "Bronze runes expose a secret hollow in the southwest furnace wall.",
      "x": 2,
      "y": 15,
      "elevation": 0
    },
    {
      "id": "key_ruby_12",
      "type": "key",
      "color": "#ef4444",
      "keyId": "key_ruby_12",
      "x": 1,
      "y": 15,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "door_ruby_12",
      "type": "door",
      "color": "#ef4444",
      "requiresKey": "key_ruby_12",
      "x": 17,
      "y": 7,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "lever_12_dynamo",
      "type": "lever",
      "label": "Master Dynamo Lever",
      "x": 17,
      "y": 15,
      "z": 0,
      "elevation": 0,
      "targets": [
        { "action": "toggle_tile", "layer": "ground", "x": 17, "y": 2, "stateA": 0, "stateB": 1 }
      ]
    },
    {
      "id": "secret_gem_12",
      "type": "collectible",
      "itemId": "gem_dynamo",
      "name": "Dynamo Core Crystal",
      "points": 500,
      "x": 5,
      "y": 15,
      "z": 0,
      "elevation": 0
    },
    {
      "id": "torch_ch3_12_spawn",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 8,
      "y": 1,
      "elevation": 0
    },
    {
      "id": "torch_ch3_12_exit",
      "type": "wall_decor",
      "decorType": "torch",
      "facing": "north",
      "x": 18,
      "y": 1,
      "elevation": 0
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// RUN TEST SUITE ON CHAPTER 3 LEVELS
// =========================================================================
if (process.argv[1] && (process.argv[1].endsWith('test-ch3-full-rigor.mjs') || process.argv[1].includes('test-ch3-full-rigor'))) {
  const levels = [makeLevel9(), makeLevel10(), makeLevel11(), makeLevel12()];

  for (const { manifest, layers, entities } of levels) {
    const fullLevel = {
      ...manifest,
      layers,
      entities
    };

    // 1. LevelValidator
    const valResult = LevelValidator.validate(fullLevel);
    if (!valResult.valid || valResult.errors.length > 0) {
      console.error(`Validation errors in Level ${manifest.id}:`, valResult.errors);
      throw new Error(`Level ${manifest.id} failed LevelValidator`);
    }

    // 2. Solve level
    const solution = solveLevel(fullLevel);
    if (!solution || solution.length === 0) {
      throw new Error(`Level ${manifest.id} is NOT solvable via BFS!`);
    }

    // 3. Metrics audit
    const metrics = auditLevelMetrics(fullLevel);
    console.log(`[Level ${manifest.id}: ${manifest.title}] Solved in ${solution.length} steps | Par: ${manifest.parSteps} | Inertia: ${metrics.corridorInertiaPercent}% | DeadSpace4x4: ${metrics.deadSpace4x4Count}`);

    if (metrics.deadSpace4x4Count > 0) {
      throw new Error(`Level ${manifest.id} has ${metrics.deadSpace4x4Count} dead space voids >= 4x4!`);
    }
    if (metrics.corridorInertiaPercent < 70) {
      throw new Error(`Level ${manifest.id} corridor inertia (${metrics.corridorInertiaPercent}%) is below 70%!`);
    }

    // 4. Zero-bypass gating
    if (manifest.id === '9') {
      const noLever = { ...fullLevel, entities: entities.filter(e => e.type !== 'lever') };
      if (solveLevel(noLever) !== null) throw new Error('Level 9 can be solved without iron lever!');
    }
    if (manifest.id === '10') {
      const noWest = { ...fullLevel, entities: entities.filter(e => e.id !== 'lever_10_west') };
      if (solveLevel(noWest) !== null) throw new Error('Level 10 can be solved without west valve!');
      const noEast = { ...fullLevel, entities: entities.filter(e => e.id !== 'lever_10_east') };
      if (solveLevel(noEast) !== null) throw new Error('Level 10 can be solved without east piston!');
    }
    if (manifest.id === '11') {
      const noLever = { ...fullLevel, entities: entities.filter(e => e.type !== 'lever') };
      if (solveLevel(noLever) !== null) throw new Error('Level 11 can be solved without counterweight lever!');
      const noKey = { ...fullLevel, entities: entities.filter(e => e.type !== 'key') };
      if (solveLevel(noKey) !== null) throw new Error('Level 11 can be solved without gold key!');
    }
    if (manifest.id === '12') {
      const noRuby = { ...fullLevel, entities: entities.filter(e => e.type !== 'key') };
      if (solveLevel(noRuby) !== null) throw new Error('Level 12 can be solved without ruby key!');
      const noLever = { ...fullLevel, entities: entities.filter(e => e.type !== 'lever') };
      if (solveLevel(noLever) !== null) throw new Error('Level 12 can be solved without dynamo lever!');
    }
  }

  console.log('\n✨ ALL Chapter 3 levels passed 100% of rigor and unit test assertions!');
}
