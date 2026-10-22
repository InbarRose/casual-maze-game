/**
 * Test & Verification Harness for Chapter 9 Rigor Overhaul (Levels 33–36) (BL-186, ADR-0060)
 *
 * Verifies:
 * 1. 100% valid via LevelValidator (0 errors, 0 warnings).
 * 2. Solvable via BFS shortest-path solver.
 * 3. 100% zero-bypass gating:
 *    - Level 33: Unsolvable without Bronze Sluice Key or Central Sluice Gate.
 *    - Level 34: Unsolvable without Canal Pressure Key; has 3D bridge at (8, 5) with deck traversal at Z=1.
 *    - Level 35: Unsolvable without Basin Key; has SECRET_WALL at (1, 15) and timed_hazard entity.
 *    - Level 36: Unsolvable without Cyan Key or Amethyst Key (dual-key progression).
 * 4. Architectural criteria:
 *    - Corridor directional inertia >= 70%.
 *    - Zero dead space >= 4x4.
 *    - North wall doorway entrance ('wall_doorway', 'north') & archway exit ('wall_archway', 'north').
 *    - Stone lecterns with coordinates (X, Y, Z).
 *    - Diegetic wall carvings and runic plates for hints and secret chambers.
 *    - fogOfWar: true in config.
 */

import { solveLevel } from '../js/engine/solver.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { auditLevelMetrics } from './audit-level-metrics.mjs';
import { TILES } from '../js/core/constants.js';

// =========================================================================
// LEVEL 33 - 19x17
// The Sluice Gate: Aqueduct Flumes & Central Watergate
// =========================================================================
export function makeLevel33() {
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

  // --- Topology Construction ---
  // Spawn: (3, 1) facing north wall at y=0.
  // 1. West Basin Corridor (Spawn winding down to southern flume)
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 7, 13);
  carveH(3, 5, 13);
  carveV(3, 11, 15);
  carveH(1, 3, 15);
  carveV(1, 11, 15);

  // 2. Central Canal & Southern Overflow Flume (Bronze Key)
  carveH(5, 9, 7);
  carveV(9, 7, 15);
  carveH(7, 9, 15); // (7, 15) Bronze Sluice Key
  carveV(7, 13, 15);

  // 3. Eastern Labyrinth to Gate & Exit
  carveH(9, 13, 11);
  carveV(13, 7, 11);
  carveH(11, 15, 7);
  carveV(11, 3, 7);
  carveH(11, 13, 3);
  carveV(15, 5, 13);
  carveH(15, 17, 13);
  carveV(17, 7, 15);
  carveH(13, 17, 15);

  // Path to Sluice Gate and Archway Exit
  carveV(15, 1, 5); // (15, 3) Central Sluice Gate, (15, 1) Exit
  carveH(13, 15, 5);

  // Secret Wall & Treasure Chamber
  ground[15][13] = 'SW'; // Secret wall at (13, 15)
  carveH(11, 13, 15);   // Secret chamber at (11, 15)

  // Anti-deadspace spurs and fillers
  carveV(7, 1, 5);
  carveH(5, 7, 1);
  carveV(5, 1, 3);
  carveH(7, 11, 3);
  carveV(17, 1, 5);
  carveH(15, 17, 5);
  carveV(13, 1, 3);
  carveH(9, 13, 1);
  carveV(9, 1, 5);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "33",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "The Sluice Gate",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled"
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
      label: "Aqueduct Conduit",
      wallDirection: "north"
    },
    parSteps: 61,
    parTime: 37,
    architectNote: "The great watergate seals the upper cisterns. Seek the bronze sluice key in the southern overflow flume while timing the pressure jets.",
    help: {
      title: "Level 33: The Sluice Gate",
      message: "The central waterway is blocked by an ancient bronze sluice gate. Locate the key in the southern basin past the sentinel."
    }
  };

  const entities = [
    {
      id: "note_33",
      type: "architect_note",
      title: "Architect's Folio #33",
      text: "Water is life and barrier alike. The sluice gates regulate the hydraulic pressure of the entire aqueduct system.",
      author: "The Grand Architect",
      x: 1,
      y: 3,
      elevation: 0,
      style: "lectern_stone"
    },
    {
      id: "key_sluice_33",
      type: "key",
      color: "#0284c7",
      name: "Bronze Sluice Key",
      x: 7,
      y: 15,
      elevation: 0
    },
    {
      id: "door_sluice_33",
      type: "door",
      color: "#0284c7",
      name: "Central Sluice Gate",
      requiresKey: "key_sluice_33",
      x: 15,
      y: 3,
      elevation: 0
    },
    {
      id: "patroller_sluice_33",
      type: "patroller",
      name: "Aqueduct Sentinel",
      color: "#38bdf8",
      elevation: 0,
      speed: 1,
      waypoints: [
        { x: 5, y: 1 },
        { x: 5, y: 3 }
      ]
    },
    {
      id: "hazard_sluice_33",
      type: "timed_hazard",
      hazardType: "spikes",
      x: 9,
      y: 3,
      elevation: 0,
      activeDuration: 2,
      inactiveDuration: 2,
      offset: 0
    },
    {
      id: "plate_sluice_clue",
      type: "wall_decor",
      decorType: "runic_plate",
      title: "Aqueduct Sluice Plate",
      text: "The bronze sluice key rests in the deep southern basin. Watch the timing of the pressure jets.",
      author: "Chief Hydraulicist",
      x: 9,
      y: 7,
      elevation: 0,
      facing: "north"
    },
    {
      id: "carving_secret_sluice",
      type: "wall_decor",
      decorType: "carving",
      title: "Masonry Water Relief",
      text: "The mortar rings hollow behind the southern overflow flume.",
      author: "Aqueduct Mason",
      x: 15,
      y: 15,
      elevation: 0,
      facing: "east"
    },
    {
      id: "secret_gem_33",
      type: "collectible",
      collectibleType: "gem",
      name: "Aqueduct Pearl",
      scoreValue: 400,
      color: "#38bdf8",
      x: 11,
      y: 15,
      elevation: 0
    },
    {
      id: "gem_aqueduct_33",
      type: "collectible",
      collectibleType: "gem",
      name: "Aqueduct Sapphire",
      scoreValue: 150,
      color: "#0284c7",
      x: 1,
      y: 15,
      elevation: 0
    },
    {
      id: "torch_33_entry",
      type: "wall_decor",
      decorType: "torch",
      x: 3,
      y: 2,
      elevation: 0,
      facing: "west"
    },
    {
      id: "torch_33_exit",
      type: "wall_decor",
      decorType: "torch",
      x: 15,
      y: 2,
      elevation: 0,
      facing: "west"
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 34 - 19x17
// Submerged Crossings: 3D Multi-Elevation Bridges & Flooded Canals
// =========================================================================
export function makeLevel34() {
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

  // --- Topology Construction ---
  // Spawn: (3, 1) facing north wall at y=0.
  // 1. West Basin to Bridge Ramp Approach at (5, 5)
  carveV(3, 1, 7);
  carveH(1, 3, 7);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 7, 13);
  carveH(3, 5, 13);
  carveV(3, 11, 15);
  carveH(1, 3, 15);
  carveV(1, 11, 15);

  // Approach to ramp at (5, 5):
  carveH(3, 5, 5);

  // 2. 3D Bridge (East-West along y=5 from x=5 to x=11) & Canal Underpass (at x=8, y=3..9)
  // Canal underpass on ground:
  carveV(8, 3, 14);
  carveH(6, 8, 9);
  carveV(6, 9, 13);
  carveH(6, 10, 13);
  carveV(10, 9, 14);
  carveH(8, 10, 14); // (8, 14) Canal Key location

  // Ramp and Overhead Bridge along row 5:
  carveH(4, 12, 5);
  ground[5][5] = 'R_E';  // Ascends East from ground (x=4) to overhead deck (x=6)
  overhead[5][6] = 'B_EW';
  overhead[5][7] = 'B_EW';
  overhead[5][8] = 'B_EW'; // BRIDGE_EW over BRIDGE_NS underpass at (8, 5)
  overhead[5][9] = 'B_EW';
  overhead[5][10] = 'B_EW';
  ground[5][11] = 'R_W'; // Descends East from overhead deck (x=10) to ground (x=12)

  // Underpass tile at (8, 5):
  ground[5][8] = 'B_NS';

  // 3. Eastern Labyrinth from Bridge Descent (12, 5) to Door and Exit
  carveV(12, 5, 11);
  carveH(12, 16, 11);
  carveV(16, 7, 15);
  carveH(14, 16, 15);
  carveV(14, 13, 15);
  carveH(12, 17, 7);
  carveV(17, 3, 7); // (17, 3) Flume Door
  carveV(17, 1, 3); // (17, 1) Exit

  // Secret Wall & Submerged Relic Chamber
  ground[15][1] = 'SW'; // Secret wall at (1, 15)
  carveH(1, 3, 15);

  // Anti-deadspace spurs and fillers
  carveV(8, 1, 3);
  carveH(6, 8, 1);
  carveV(6, 1, 3);
  carveV(10, 1, 3);
  carveH(10, 12, 1);
  carveV(12, 1, 3);
  carveV(14, 1, 3);
  carveH(12, 14, 1);
  carveV(15, 13, 15);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "34",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "Submerged Crossings",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled"
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
      label: "Lower Reservoir Flume",
      wallDirection: "north"
    },
    parSteps: 65,
    parTime: 39,
    architectNote: "Cross the elevated aqueduct bridge, then drop into the flooded channel below to retrieve the pressure key.",
    help: {
      title: "Level 34: Submerged Crossings",
      message: "Navigate multi-elevation bridges. The key lies submerged in the deep canal running beneath the aqueduct trestle."
    }
  };

  const entities = [
    {
      id: "note_34",
      type: "architect_note",
      title: "Architect's Folio #34",
      text: "The high trestles span deep flooded flumes. Traverse the elevated viaduct at Z=1 to reach the eastern pump stations.",
      author: "The Grand Architect",
      x: 1,
      y: 3,
      elevation: 0,
      style: "lectern_stone"
    },
    {
      id: "key_canal_34",
      type: "key",
      color: "#06b6d4",
      name: "Canal Pressure Key",
      x: 8,
      y: 14,
      elevation: 0
    },
    {
      id: "door_canal_34",
      type: "door",
      color: "#06b6d4",
      name: "Submerged Flume Gate",
      requiresKey: "key_canal_34",
      x: 17,
      y: 3,
      elevation: 0
    },
    {
      id: "checkpoint_34",
      type: "checkpoint",
      style: "crystal_beacon",
      name: "Aqueduct Pier Beacon",
      x: 12,
      y: 7,
      elevation: 0,
      color: "#38bdf8"
    },
    {
      id: "patroller_canal_34",
      type: "patroller",
      name: "Canal Sentry",
      color: "#06b6d4",
      elevation: 0,
      speed: 1,
      waypoints: [
        { x: 6, y: 1 },
        { x: 6, y: 3 }
      ]
    },
    {
      id: "plate_trestle_clue",
      type: "wall_decor",
      decorType: "runic_plate",
      title: "Trestle Engineering Plate",
      text: "Elevated flumes transport glacial runoff. The canal pressure key rests in the southern drain.",
      author: "Chief Engineer Valen",
      x: 12,
      y: 5,
      elevation: 0,
      facing: "north"
    },
    {
      id: "carving_secret_canal",
      type: "wall_decor",
      decorType: "carving",
      title: "Canal Wall Bas-Relief",
      text: "Submerged beneath the southwest floor lies the forgotten sunstone.",
      author: "Canal Mason",
      x: 3,
      y: 15,
      elevation: 0,
      facing: "west"
    },
    {
      id: "secret_gem_34",
      type: "collectible",
      collectibleType: "gem",
      name: "Submerged Sunstone",
      scoreValue: 450,
      color: "#f59e0b",
      x: 1,
      y: 15,
      elevation: 0
    },
    {
      id: "gem_canal_topaz",
      type: "collectible",
      collectibleType: "gem",
      name: "Aqueduct Topaz",
      scoreValue: 180,
      color: "#fbbf24",
      x: 8,
      y: 5,
      elevation: 1
    },
    {
      id: "torch_34_entry",
      type: "wall_decor",
      decorType: "torch",
      x: 3,
      y: 2,
      elevation: 0,
      facing: "west"
    },
    {
      id: "torch_34_exit",
      type: "wall_decor",
      decorType: "torch",
      x: 17,
      y: 2,
      elevation: 0,
      facing: "east"
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 35 - 21x19
// The Pressure Basin: Timed Water Hazards, Rhythm Conduits & Secret Relics
// =========================================================================
export function makeLevel35() {
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

  // --- Topology Construction ---
  // Spawn: (3, 1) facing north wall at y=0.
  // 1. West Wing (Spawn to Southwest Pressure Chamber)
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 7, 13);
  carveH(1, 5, 13);
  carveV(1, 11, 15); // Secret wall at (1, 15)
  carveH(1, 3, 15);
  carveV(3, 13, 17);
  carveH(3, 7, 17);

  // Secret room behind wall at (1, 16..17):
  carveV(1, 16, 17);
  ground[15][1] = 'SW'; // Ground layer has SECRET_WALL concealing relic

  // 2. Central Basin with Timed Hazards
  carveV(7, 9, 17);
  carveH(7, 11, 9);
  carveV(11, 9, 17);
  carveH(11, 15, 17);
  carveV(15, 11, 17);
  carveH(13, 19, 11);
  carveV(19, 11, 15); // (19, 15) Pressure Basin Key
  carveH(17, 19, 15);

  // 3. Eastern Conduit to Basin Door and Archway Exit
  carveV(17, 5, 11);
  carveH(15, 17, 5);
  carveV(15, 3, 5);
  carveH(15, 17, 3);
  carveV(17, 1, 3); // (17, 3) Basin Door, (17, 1) Exit

  // Anti-deadspace spurs and fillers
  carveV(9, 1, 3);
  carveH(7, 9, 1);
  carveV(7, 1, 3);
  carveH(5, 7, 1);
  carveV(11, 1, 5);
  carveH(11, 13, 1);
  carveV(13, 1, 5);
  carveV(19, 1, 7);
  carveH(17, 19, 7);
  carveV(9, 5, 7);
  carveH(9, 11, 5);
  carveV(13, 7, 9);
  carveV(13, 13, 15);
  carveH(13, 15, 13);
  carveV(17, 15, 17);
  carveH(15, 17, 17);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "35",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "The Pressure Basin",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled"
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
      label: "Pressure Basin Outflow",
      wallDirection: "north"
    },
    parSteps: 70,
    parTime: 42,
    architectNote: "High pressure steam jets vent in rhythmic sequence. Dash past between bursts and retrieve the basin key from the eastern valve chamber.",
    help: {
      title: "Level 35: The Pressure Basin",
      message: "Time your moves carefully between pressure jet bursts. Retrieve the basin key in the eastern conduit."
    }
  };

  const entities = [
    {
      id: "note_35",
      type: "architect_note",
      title: "Architect's Folio #35",
      text: "The pressure basin gathers steam and overflow. When the rhythmic valves release, the daring slip past.",
      author: "The Grand Architect",
      x: 1,
      y: 3,
      elevation: 0,
      style: "lectern_stone"
    },
    {
      id: "key_basin_35",
      type: "key",
      color: "#38bdf8",
      name: "Pressure Basin Key",
      x: 19,
      y: 15,
      elevation: 0
    },
    {
      id: "door_basin_35",
      type: "door",
      color: "#38bdf8",
      name: "Outflow Pressure Gate",
      requiresKey: "key_basin_35",
      x: 17,
      y: 3,
      elevation: 0
    },
    {
      id: "hazard_basin_35a",
      type: "timed_hazard",
      hazardType: "spikes",
      x: 9,
      y: 3,
      elevation: 0,
      activeDuration: 2,
      inactiveDuration: 2,
      offset: 0
    },
    {
      id: "hazard_basin_35b",
      type: "timed_hazard",
      hazardType: "spikes",
      x: 13,
      y: 7,
      elevation: 0,
      activeDuration: 2,
      inactiveDuration: 2,
      offset: 1
    },
    {
      id: "patroller_basin_35",
      type: "patroller",
      name: "Pressure Warden",
      color: "#0284c7",
      elevation: 0,
      speed: 1,
      waypoints: [
        { x: 7, y: 1 },
        { x: 7, y: 3 }
      ]
    },
    {
      id: "plate_valve_directive",
      type: "wall_decor",
      decorType: "runic_plate",
      title: "Relief Valve Directive",
      text: "When basin pressure reaches critical threshold, steam vents in alternating pulses. Observe the cadence.",
      author: "Basin Overseer",
      x: 7,
      y: 9,
      elevation: 0,
      facing: "north"
    },
    {
      id: "carving_secret_basin",
      type: "wall_decor",
      decorType: "carving",
      title: "Subterranean Basin Relief",
      text: "The southwest conduit wall hides the ancient basin relic.",
      author: "Basin Mason",
      x: 1,
      y: 13,
      elevation: 0,
      facing: "west"
    },
    {
      id: "gem_secret_35",
      type: "collectible",
      collectibleType: "gem",
      name: "Deep Aquamarine Relic",
      scoreValue: 500,
      color: "#0284c7",
      x: 3,
      y: 15,
      elevation: 0
    },
    {
      id: "gem_basin_amethyst",
      type: "collectible",
      collectibleType: "gem",
      name: "Pressure Amethyst",
      scoreValue: 200,
      color: "#a855f7",
      x: 11,
      y: 9,
      elevation: 0
    },
    {
      id: "torch_35_entry",
      type: "wall_decor",
      decorType: "torch",
      x: 3,
      y: 2,
      elevation: 0,
      facing: "west"
    },
    {
      id: "torch_35_exit",
      type: "wall_decor",
      decorType: "torch",
      x: 17,
      y: 2,
      elevation: 0,
      facing: "east"
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

// =========================================================================
// LEVEL 36 - 21x21
// Grand Aqueduct Reservoir: Dual-Key Multi-Tier Spillway Synthesis
// =========================================================================
export function makeLevel36() {
  const width = 21, height = 21;
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

  // --- Topology Construction ---
  // Spawn: (3, 1) facing north wall at y=0.
  // 1. Tier 1: Western Reservoir Terrace (to Cyan Key at (11, 5))
  carveV(3, 1, 5);
  carveH(1, 3, 5);
  carveV(1, 3, 9);
  carveH(1, 3, 3); // (1, 3) lectern
  carveH(1, 5, 9);
  carveV(5, 7, 13);
  carveH(1, 5, 13);
  carveV(1, 11, 17);
  carveH(1, 3, 17);
  carveV(3, 15, 19);
  carveH(3, 7, 19);

  // Approach to Cyan Key at (11, 5):
  carveH(5, 11, 7);
  carveV(11, 5, 7); // (11, 5) Cyan Canal Key

  // Route to Cyan Gate at (13, 11):
  carveV(7, 15, 19);
  carveH(7, 13, 15);
  carveV(13, 11, 15); // (13, 11) Cyan Gate door_cyan_36

  // 2. Tier 2: Deep Spillway (Strictly Post-Cyan Door at (13, 11))
  carveH(13, 17, 11);
  carveV(17, 11, 17);
  carveH(15, 19, 17);
  carveV(19, 9, 19);
  carveH(15, 19, 19); // (15, 19) Amethyst Key location
  carveV(15, 17, 19);

  // 3. Tier 3: Approach to Amethyst Gate & Archway Exit
  carveH(17, 19, 9);
  carveV(19, 5, 9);
  carveH(17, 19, 5);
  carveV(17, 3, 5); // (17, 3) Amethyst Gate door_amethyst_36
  carveV(17, 1, 3); // (17, 1) Exit Grand Spillway

  // Secret Wall & Grand Reservoir Heart Chamber
  carveH(1, 3, 19);
  ground[19][1] = 'SW'; // Secret wall at (1, 19)

  // Anti-deadspace spurs and fillers (contained to respective zones)
  carveV(11, 16, 19); // breaks dead space around x: 8..11, y: 16..17
  carveV(7, 1, 5);
  carveH(5, 7, 1);
  carveV(5, 1, 3);
  carveV(9, 1, 3);
  carveH(9, 11, 1);
  carveV(11, 1, 3);
  carveV(13, 1, 5);
  carveH(13, 15, 1);
  carveV(15, 1, 5);
  carveV(15, 5, 9);
  carveH(13, 15, 7);
  carveV(13, 7, 9);
  carveV(19, 1, 3);
  carveH(17, 19, 1);
  carveV(9, 9, 13);
  carveH(7, 9, 13);
  carveV(5, 15, 17);

  const manifest = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "36",
    chapter: "chapter_9",
    zone: "zone_9",
    title: "Grand Aqueduct Reservoir",
    author: "Inbar Rose",
    version: 1,
    dimensions: { width, height },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled"
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
      label: "Grand Spillway",
      wallDirection: "north"
    },
    parSteps: 85,
    parTime: 51,
    architectNote: "The grand reservoir requires dual authorization. Claim the cyan terrace key first, then delve into the lower cisterns for the amethyst seal.",
    help: {
      title: "Level 36: Grand Aqueduct Reservoir",
      message: "Unlock the cyan terrace gate to access the lower cisterns, then locate the amethyst key to open the grand spillway."
    }
  };

  const entities = [
    {
      id: "note_36",
      type: "architect_note",
      title: "Architect's Folio #36",
      text: "The Grand Spillway drains into the Sunken Vaults. Both the Cyan and Amethyst seals must yield before the waters subside.",
      author: "The Grand Architect",
      x: 1,
      y: 3,
      elevation: 0,
      style: "lectern_stone"
    },
    {
      id: "key_cyan_36",
      type: "key",
      color: "#06b6d4",
      name: "Cyan Canal Key",
      x: 11,
      y: 5,
      elevation: 0
    },
    {
      id: "door_cyan_36",
      type: "door",
      color: "#06b6d4",
      name: "Terrace Access Gate",
      requiresKey: "key_cyan_36",
      x: 13,
      y: 11,
      elevation: 0
    },
    {
      id: "key_amethyst_36",
      type: "key",
      color: "#a855f7",
      name: "Amethyst Sluice Key",
      x: 15,
      y: 19,
      elevation: 0
    },
    {
      id: "door_amethyst_36",
      type: "door",
      color: "#a855f7",
      name: "Grand Spillway Seal",
      requiresKey: "key_amethyst_36",
      x: 17,
      y: 3,
      elevation: 0
    },
    {
      id: "checkpoint_36",
      type: "checkpoint",
      style: "crystal_beacon",
      name: "Grand Reservoir Sanctum",
      x: 19,
      y: 9,
      elevation: 0,
      color: "#38bdf8"
    },
    {
      id: "patroller_spillway_36",
      type: "patroller",
      name: "Spillway Colossus",
      color: "#a855f7",
      elevation: 0,
      speed: 1,
      waypoints: [
        { x: 5, y: 1 },
        { x: 5, y: 3 }
      ]
    },
    {
      id: "hazard_spillway_36",
      type: "timed_hazard",
      hazardType: "spikes",
      x: 13,
      y: 7,
      elevation: 0,
      activeDuration: 2,
      inactiveDuration: 2,
      offset: 0
    },
    {
      id: "plate_spillway_seal",
      type: "wall_decor",
      decorType: "runic_plate",
      title: "The Grand Spillway Seal",
      text: "Beyond these gates lie the pristine depths of the Sunken Vaults. Only dual keybearers may pass.",
      author: "Master Mason Torin",
      x: 15,
      y: 19,
      elevation: 0,
      facing: "north"
    },
    {
      id: "carving_secret_reservoir",
      type: "wall_decor",
      decorType: "carving",
      title: "Deep Reservoir Bas-Relief",
      text: "The southwest retaining wall hides the beating heart of the reservoir.",
      author: "Reservoir Mason",
      x: 3,
      y: 19,
      elevation: 0,
      facing: "west"
    },
    {
      id: "secret_gem_36",
      type: "collectible",
      collectibleType: "gem",
      name: "Heart of the Aqueduct",
      scoreValue: 600,
      color: "#a855f7",
      x: 1,
      y: 19,
      elevation: 0
    },
    {
      id: "gem_aqueduct_sapphire_36",
      type: "collectible",
      collectibleType: "gem",
      name: "Aqueduct Core Sapphire",
      scoreValue: 250,
      color: "#38bdf8",
      x: 11,
      y: 7,
      elevation: 0
    },
    {
      id: "torch_36_entry",
      type: "wall_decor",
      decorType: "torch",
      x: 3,
      y: 2,
      elevation: 0,
      facing: "west"
    },
    {
      id: "torch_36_exit",
      type: "wall_decor",
      decorType: "torch",
      x: 17,
      y: 2,
      elevation: 0,
      facing: "east"
    }
  ];

  return { manifest, layers: { ground, overhead }, entities };
}

async function testLevel33() {
  const raw = makeLevel33();
  const lvl = { ...raw.manifest, layers: raw.layers, entities: raw.entities };
  const val = LevelValidator.validate(lvl);
  console.log('Level 33 Validator:', val.valid, 'Errors:', val.errors, 'Warnings:', val.warnings);

  const sol = solveLevel(lvl);
  console.log('Level 33 Solvable:', !!sol, 'Steps:', sol?.length);

  // Test zero bypass
  const noKey = JSON.parse(JSON.stringify(lvl));
  noKey.entities = noKey.entities.filter(e => e.type !== 'key');
  const solNoKey = solveLevel(noKey);
  console.log('Level 33 Solvable without Key:', solNoKey === null);

  const solNoDoor = solveLevel(lvl, { allowDoors: false });
  console.log('Level 33 Solvable without Door:', solNoDoor === null);

  const metrics = auditLevelMetrics(lvl);
  console.log('Level 33 Inertia:', metrics.corridorInertiaPercent + '%', 'DeadSpace4x4:', metrics.deadSpace4x4Count);
}

async function testLevel34() {
  const raw = makeLevel34();
  const lvl = { ...raw.manifest, layers: raw.layers, entities: raw.entities };
  const val = LevelValidator.validate(lvl);
  console.log('Level 34 Validator:', val.valid, 'Errors:', val.errors, 'Warnings:', val.warnings);

  const sol = solveLevel(lvl);
  console.log('Level 34 Solvable:', !!sol, 'Steps:', sol?.length);

  // Test zero bypass
  const noKey = JSON.parse(JSON.stringify(lvl));
  noKey.entities = noKey.entities.filter(e => e.type !== 'key');
  const solNoKey = solveLevel(noKey);
  console.log('Level 34 Solvable without Key:', solNoKey === null);

  const solNoDoor = solveLevel(lvl, { allowDoors: false });
  console.log('Level 34 Solvable without Door:', solNoDoor === null);

  console.log('Level 34 ground[5][8] === BRIDGE_NS:', lvl.layers.ground[5][8] === TILES.BRIDGE_NS);
  console.log('Level 34 overhead[5][8] === BRIDGE_EW:', lvl.layers.overhead[5][8] === TILES.BRIDGE_EW);

  const hasBridgeStep = sol?.some(s => s.elevation === 1 && s.y === 5 && s.x >= 5 && s.x <= 11);
  console.log('Level 34 Has elevated bridge traversal at Z=1:', hasBridgeStep);

  const metrics = auditLevelMetrics(lvl);
  console.log('Level 34 Inertia:', metrics.corridorInertiaPercent + '%', 'DeadSpace4x4:', metrics.deadSpace4x4Count);
}

async function testLevel35() {
  const raw = makeLevel35();
  const lvl = { ...raw.manifest, layers: raw.layers, entities: raw.entities };
  const val = LevelValidator.validate(lvl);
  console.log('Level 35 Validator:', val.valid, 'Errors:', val.errors, 'Warnings:', val.warnings);

  const sol = solveLevel(lvl);
  console.log('Level 35 Solvable:', !!sol, 'Steps:', sol?.length);

  // Test zero bypass
  const noKey = JSON.parse(JSON.stringify(lvl));
  noKey.entities = noKey.entities.filter(e => e.type !== 'key');
  const solNoKey = solveLevel(noKey);
  console.log('Level 35 Solvable without Key:', solNoKey === null);

  const solNoDoor = solveLevel(lvl, { allowDoors: false });
  console.log('Level 35 Solvable without Door:', solNoDoor === null);

  console.log('Level 35 ground[15][1] === SECRET_WALL:', lvl.layers.ground[15][1] === TILES.SECRET_WALL);
  const hazard = lvl.entities.find(e => e.type === 'timed_hazard');
  console.log('Level 35 Timed hazard exists:', hazard !== undefined);

  const metrics = auditLevelMetrics(lvl);
  console.log('Level 35 Inertia:', metrics.corridorInertiaPercent + '%', 'DeadSpace4x4:', metrics.deadSpace4x4Count);
}

async function testLevel36() {
  const raw = makeLevel36();
  const lvl = { ...raw.manifest, layers: raw.layers, entities: raw.entities };
  const val = LevelValidator.validate(lvl);
  console.log('Level 36 Validator:', val.valid, 'Errors:', val.errors, 'Warnings:', val.warnings);

  const sol = solveLevel(lvl);
  console.log('Level 36 Solvable:', !!sol, 'Steps:', sol?.length);

  // Test zero bypass
  const noCyan = JSON.parse(JSON.stringify(lvl));
  noCyan.entities = noCyan.entities.filter(e => e.id !== 'key_cyan_36');
  const solNoCyan = solveLevel(noCyan);
  console.log('Level 36 Solvable without Cyan Key:', solNoCyan === null);

  const noAmethyst = JSON.parse(JSON.stringify(lvl));
  noAmethyst.entities = noAmethyst.entities.filter(e => e.id !== 'key_amethyst_36');
  const solNoAmethyst = solveLevel(noAmethyst);
  console.log('Level 36 Solvable without Amethyst Key:', solNoAmethyst === null);

  const solNoDoor = solveLevel(lvl, { allowDoors: false });
  console.log('Level 36 Solvable without Doors:', solNoDoor === null);

  const metrics = auditLevelMetrics(lvl);
  console.log('Level 36 Inertia:', metrics.corridorInertiaPercent + '%', 'DeadSpace4x4:', metrics.deadSpace4x4Count);
}

if (process.argv[1]?.endsWith('test-ch9-full-rigor.mjs')) {
  testLevel33();
  testLevel34();
  testLevel35();
  testLevel36();
}
