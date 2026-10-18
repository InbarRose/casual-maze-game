/**
 * Generator & Verifier for Episodic Storyline: "The Sunken Vaults of the Deep" (BL-130)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TILES, ELEVATION } from '../js/core/constants.js';
import { LevelValidator } from '../js/editor/level-validator.js';
import { solveLevel } from '../js/engine/solver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function makeGrid(w, h, fill = 1) {
  const g = [];
  for (let y = 0; y < h; y++) {
    g.push(new Array(w).fill(fill));
  }
  return g;
}

// -------------------------------------------------------------
// Chapter 1: The Flooded Siphon (13x13)
// -------------------------------------------------------------
function buildVaults1() {
  const w = 13;
  const h = 13;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // West corridor from spawn (1,1) down to key (1,11)
  for (let y = 1; y <= 11; y++) ground[y][1] = 0;

  // North avenue connecting to central cistern
  for (let x = 1; x <= 6; x++) ground[1][x] = 0;
  for (let y = 1; y <= 6; y++) ground[y][6] = 0;

  // South corridor from (1, 11) to door at (9, 11)
  for (let x = 1; x <= 9; x++) ground[11][x] = 0;

  // Chamber behind door at (9, 11) leading to Exit at (11, 11)
  ground[11][10] = 0;
  ground[11][11] = 0;

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "story_sunken_vaults_1",
    storyId: "sunken_vaults_of_the_deep",
    chapterNumber: 1,
    chapterTitle: "The Flooded Siphon",
    chapterSubtitle: "Hydraulic Siphons & Submerged Flumes",
    prologueText: "You step into the subterranean vaults below the aqueducts. Dark water rushes through ancient stone siphons, vibrating through the flooded masonry.",
    title: "The Flooded Siphon",
    author: "Deep Vault Cartographers",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled",
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 11,
      y: 11,
      elevation: 0,
      style: "portal",
      label: "Pressure Conduit",
      wallDirection: "none",
    },
    parSteps: 34,
    parTime: 22,
    architectNote: "Retrieve the Siphon Valve Key from the southern intake pool to disengage the outflow gate.",
    help: {
      title: "Chapter 1: The Flooded Siphon",
      message: "The outflow gate is sealed by water pressure. Scour the south intake channel for the Siphon Key.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_siphon_1",
        type: "key",
        color: "#0284c7",
        name: "Siphon Valve Key",
        x: 1,
        y: 11,
        elevation: 0,
      },
      {
        id: "door_siphon_1",
        type: "door",
        color: "#0284c7",
        name: "Siphon Pressure Gate",
        requiresKey: "key_siphon_1",
        x: 9,
        y: 11,
        elevation: 0,
      },
      {
        id: "checkpoint_vaults_1",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Intake Beacon",
        x: 6,
        y: 6,
        elevation: 0,
        color: "#38bdf8",
      },
      {
        id: "decor_note_vaults_1",
        type: "wall_decor",
        decorType: "carving",
        title: "Siphon Directive",
        text: "The siphons maintain hydraulic equilibrium across the deep vaults. Never seal the lower intake.",
        author: "Chief Hydrologist",
        x: 1,
        y: 5,
        facing: "east",
        elevation: 0,
      },
      {
        id: "gem_vaults_1",
        type: "collectible",
        collectibleType: "gem",
        name: "Cistern Sapphire",
        scoreValue: 200,
        color: "#0284c7",
        x: 6,
        y: 3,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// -------------------------------------------------------------
// Chapter 2: The Pressure Reservoir (15x15)
// -------------------------------------------------------------
function buildVaults2() {
  const w = 15;
  const h = 15;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Spawn (1,1) along north corridor to key at (13, 1)
  for (let x = 1; x <= 13; x++) ground[1][x] = 0;

  // Path down east corridor to door at (13, 10)
  for (let y = 1; y <= 10; y++) ground[y][13] = 0;

  // South approach to central cistern
  for (let y = 1; y <= 7; y++) ground[y][1] = 0;
  for (let x = 1; x <= 7; x++) ground[7][x] = 0;

  // Secret alcove at (3, 11)
  ground[8][3] = TILES.SECRET_WALL;
  ground[9][3] = 0;
  ground[10][3] = 0;

  // Chamber behind door at (13, 10) leading to Exit at (13, 13)
  for (let y = 10; y <= 13; y++) ground[y][13] = 0;

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "story_sunken_vaults_2",
    storyId: "sunken_vaults_of_the_deep",
    chapterNumber: 2,
    chapterTitle: "The Pressure Reservoir",
    chapterSubtitle: "Thermal Vents & Secret Conduits",
    prologueText: "Scalding geysers echo through the cavernous reservoir. The water level fluctuates as steam pulses from the abyssal vents.",
    title: "The Pressure Reservoir",
    author: "Deep Vault Cartographers",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 6,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled",
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 13,
      y: 13,
      elevation: 0,
      style: "portal",
      label: "Abyssal Shaft",
      wallDirection: "none",
    },
    parSteps: 44,
    parTime: 28,
    architectNote: "Navigate past the pulsing steam vents to retrieve the Reservoir Key in the northeastern valve terrace.",
    help: {
      title: "Chapter 2: The Pressure Reservoir",
      message: "The way to the lower sanctuary is locked. Retrieve the bronze key in the northeast chamber.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_reservoir_2",
        type: "key",
        color: "#06b6d4",
        name: "Reservoir Bronze Key",
        x: 13,
        y: 1,
        elevation: 0,
      },
      {
        id: "door_reservoir_2",
        type: "door",
        color: "#06b6d4",
        name: "Reservoir Outflow Gate",
        requiresKey: "key_reservoir_2",
        x: 13,
        y: 10,
        elevation: 0,
      },
      {
        id: "checkpoint_vaults_2",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Valve Station Beacon",
        x: 7,
        y: 7,
        elevation: 0,
        color: "#06b6d4",
      },
      {
        id: "decor_note_vaults_2",
        type: "wall_decor",
        decorType: "plaque",
        title: "Thermal Warning",
        text: "Extreme thermal buildup detected in reservoir basin. Disengage bypass valve before entering.",
        author: "Overseer Moran",
        x: 1,
        y: 7,
        facing: "east",
        elevation: 0,
      },
      {
        id: "gem_secret_vaults_2",
        type: "collectible",
        collectibleType: "gem",
        name: "Deep Aquamarine",
        scoreValue: 300,
        color: "#38bdf8",
        x: 3,
        y: 10,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// -------------------------------------------------------------
// Chapter 3: The Abyssal Sanctuary (17x17)
// -------------------------------------------------------------
function buildVaults3() {
  const w = 17;
  const h = 17;
  const ground = makeGrid(w, h, 1);
  const overhead = makeGrid(w, h, 0);

  // Spawn (1,1) east to (15,1) where Azure Key is located
  for (let x = 1; x <= 15; x++) ground[1][x] = 0;

  // Single path from (8,1) south to (8,8) through Azure Gate at (8,4)
  for (let y = 1; y <= 8; y++) ground[y][8] = 0;

  // Path from (8,8) west to (1,8), then south to Abyssal Key at (1,15)
  for (let x = 1; x <= 8; x++) ground[8][x] = 0;
  for (let y = 8; y <= 15; y++) ground[y][1] = 0;

  // South avenue from (1, 15) east to Abyssal Gate at (13, 15)
  for (let x = 1; x <= 13; x++) ground[15][x] = 0;

  // Exit chamber at (15, 15) behind door at (13, 15)
  for (let x = 13; x <= 15; x++) ground[15][x] = 0;

  const lvl = {
    $schema: "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
    id: "story_sunken_vaults_3",
    storyId: "sunken_vaults_of_the_deep",
    chapterNumber: 3,
    chapterTitle: "The Abyssal Sanctuary",
    chapterSubtitle: "The Ancient Subterranean Sanctum",
    prologueText: "At the very foundation of the sunken realm stands the Abyssal Sanctuary. Here, the Primal Water Core pulses in radiant cerulean luminescence.",
    title: "The Abyssal Sanctuary",
    author: "Deep Vault Cartographers",
    version: 1,
    dimensions: { width: w, height: h },
    config: {
      fogOfWar: true,
      viewRadius: 7,
      allowFreePan: true,
      tileSize: 32,
      theme: "aqueduct",
      viewPerspective: "angled",
    },
    spawn: {
      x: 1,
      y: 1,
      elevation: 0,
      style: "wall_doorway",
      wallDirection: "north",
    },
    exit: {
      x: 15,
      y: 15,
      elevation: 0,
      style: "portal",
      label: "Vaults Apex",
      wallDirection: "none",
    },
    parSteps: 58,
    parTime: 36,
    architectNote: "The climax of the Sunken Vaults. Recover the Azure Key and Abyssal Pearl to breach the Sanctuary Apex.",
    help: {
      title: "Chapter 3: The Abyssal Sanctuary",
      message: "Both the Azure and Abyssal keys are required to unlock the sanctuary gates and claim the Primal Core.",
    },
    layers: { ground, overhead },
    entities: [
      {
        id: "key_azure_3",
        type: "key",
        color: "#0284c7",
        name: "Azure Hydrolock Key",
        x: 15,
        y: 1,
        elevation: 0,
      },
      {
        id: "door_azure_3",
        type: "door",
        color: "#0284c7",
        name: "Sanctuary Azure Barrier",
        requiresKey: "key_azure_3",
        x: 8,
        y: 4,
        elevation: 0,
      },
      {
        id: "key_abyssal_3",
        type: "key",
        color: "#38bdf8",
        name: "Abyssal Pearl Key",
        x: 1,
        y: 15,
        elevation: 0,
      },
      {
        id: "door_abyssal_3",
        type: "door",
        color: "#38bdf8",
        name: "Sanctuary Apex Gate",
        requiresKey: "key_abyssal_3",
        x: 13,
        y: 15,
        elevation: 0,
      },
      {
        id: "checkpoint_vaults_3",
        type: "checkpoint",
        style: "crystal_beacon",
        name: "Abyssal Sanctuary Beacon",
        x: 8,
        y: 8,
        elevation: 0,
        color: "#38bdf8",
      },
      {
        id: "decor_note_vaults_3",
        type: "wall_decor",
        decorType: "monolith",
        title: "Monolith of the Depths",
        text: "Water is life, memory, and path. Those who respect its depths shall never be lost in the labyrinth.",
        author: "Primal Hydrologist",
        x: 8,
        y: 7,
        facing: "south",
        elevation: 0,
      },
      {
        id: "gem_vaults_3",
        type: "collectible",
        collectibleType: "gem",
        name: "Primal Water Core",
        scoreValue: 500,
        color: "#0284c7",
        x: 8,
        y: 8,
        elevation: 0,
      },
    ],
  };

  return lvl;
}

// -------------------------------------------------------------
// Main execution
// -------------------------------------------------------------
async function main() {
  const levels = [buildVaults1(), buildVaults2(), buildVaults3()];
  const storiesDir = path.resolve(rootDir, 'levels', 'stories');

  for (const lvl of levels) {
    console.log(`\n--- Validating & Solving Story Level: "${lvl.title}" (${lvl.dimensions.width}x${lvl.dimensions.height}) ---`);

    const valResult = LevelValidator.validate(lvl);
    if (!valResult.valid || valResult.errors.length > 0 || valResult.warnings.length > 0) {
      console.error(`Validation errors in ${lvl.id}:`, valResult.errors, valResult.warnings);
      process.exit(1);
    }
    console.log(`✓ Schema & topology validation passed (0 errors, 0 warnings)`);

    const solution = solveLevel(lvl);
    if (!solution) {
      console.error(`Level ${lvl.id} is NOT solvable!`);
      process.exit(1);
    }
    const optimalSteps = solution.length;
    console.log(`✓ Solvable! Optimal path: ${optimalSteps} steps`);

    lvl.parSteps = Math.ceil(optimalSteps * 1.15) + 2;
    lvl.parTime = Math.max(15, Math.ceil(optimalSteps * 0.7));

    const filePath = path.resolve(storiesDir, `${lvl.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(lvl, null, 2) + '\n', 'utf8');
    console.log(`✓ Written to ${path.relative(rootDir, filePath)}`);
  }

  console.log('\nAll Sunken Vaults of the Deep storyline levels verified & written successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
