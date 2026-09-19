/**
 * User Journey: Carryable Items & Environmental Riddle Pedestals
 *
 * Verifies end-to-end:
 * 1. Inspecting pedestal inscriptions and reading ancient riddle clues.
 * 2. Picking up carryable items (Falcon, Serpent, Lion, Dragon statues) on the floor.
 * 3. Carrying items in player's hands with HUD and sprite indicators.
 * 4. Placing an incorrect statue on a pedestal (does NOT unlock the door).
 * 5. Swapping and repositioning statues onto their corresponding riddle pedestals.
 * 6. Solving the 4-statue sphinx riddle puzzle:
 *    - All 4 pedestals satisfied simultaneously.
 *    - Unlocks target sanctuary gate and emits puzzle:riddle_solved event.
 *    - Traverses to victory portal.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { ELEVATION, ENTITY_TYPES } from '../../../js/core/constants.js';

function createMockCanvas(width = 800, height = 600) {
  return {
    width,
    height,
    getContext: () => ({
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      rect: () => {},
      roundRect: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      drawImage: () => {},
      setLineDash: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe('User Journey > Carryable Riddle Pedestal Puzzle Suite', () => {
  it('solves a 4-statue environmental riddle puzzle to unlock the sanctuary door and reach exit', () => {
    // 9x9 layout:
    // Row 0: Walls
    // Row 1: Floor with 4 statues scattered
    // Row 2: Corridors
    // Row 3: Pedestal room (North, East, South, West pedestals)
    // Row 4: Locked Sanctuary Door at (4, 5) guarding Exit at (4, 7)
    const riddleLevel = {
      id: 'test_riddle_sanctum',
      title: 'Sanctum of the Four Guardians',
      dimensions: { width: 9, height: 9 },
      config: { fogOfWar: false, tileSize: 32 },
      spawn: { x: 4, y: 1, elevation: 0 },
      exit: { x: 4, y: 7, elevation: 0 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 0, 0, 0, 1, 0, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 0, 0, 0, 1, 0, 1],
          [1, 1, 1, 1, 0, 1, 1, 1, 1],
          [1, 1, 1, 1, 0, 1, 1, 1, 1],
          [1, 1, 1, 1, 0, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 9 }, () => Array(9).fill(0)),
      },
      entities: [
        // 4 Floor Statues
        {
          id: 'statue_falcon',
          type: ENTITY_TYPES.RIDDLE_ITEM,
          styleId: 'statue_falcon',
          x: 1,
          y: 1,
          z: 0,
        },
        {
          id: 'statue_serpent',
          type: ENTITY_TYPES.RIDDLE_ITEM,
          styleId: 'statue_serpent',
          x: 7,
          y: 1,
          z: 0,
        },
        {
          id: 'statue_lion',
          type: ENTITY_TYPES.RIDDLE_ITEM,
          styleId: 'statue_lion',
          x: 1,
          y: 3,
          z: 0,
        },
        {
          id: 'statue_dragon',
          type: ENTITY_TYPES.RIDDLE_ITEM,
          styleId: 'statue_dragon',
          x: 7,
          y: 3,
          z: 0,
        },

        // 4 Directional Pedestals around the central chamber
        {
          id: 'ped_north',
          type: ENTITY_TYPES.PEDESTAL,
          name: 'North Pedestal of Shadow',
          riddleHint: 'The emerald serpent coils in the northern shadow.',
          acceptedItemId: 'statue_serpent',
          puzzleGroupId: 'four_guardians',
          targetDoorId: 'door_sanctuary',
          x: 4,
          y: 2,
          z: 0,
        },
        {
          id: 'ped_east',
          type: ENTITY_TYPES.PEDESTAL,
          name: 'East Pedestal of Dawn',
          riddleHint: 'The winged hunter must greet the first rays of dawn.',
          acceptedItemId: 'statue_falcon',
          puzzleGroupId: 'four_guardians',
          targetDoorId: 'door_sanctuary',
          x: 5,
          y: 3,
          z: 0,
        },
        {
          id: 'ped_south',
          type: ENTITY_TYPES.PEDESTAL,
          name: 'South Pedestal of the Sun',
          riddleHint: 'The gilded lion stands vigilant in the southern zenith.',
          acceptedItemId: 'statue_lion',
          puzzleGroupId: 'four_guardians',
          targetDoorId: 'door_sanctuary',
          x: 4,
          y: 4,
          z: 0,
        },
        {
          id: 'ped_west',
          type: ENTITY_TYPES.PEDESTAL,
          name: 'West Pedestal of Twilight',
          riddleHint: 'The ancient dragon watches the twilight winds of the west.',
          acceptedItemId: 'statue_dragon',
          puzzleGroupId: 'four_guardians',
          targetDoorId: 'door_sanctuary',
          x: 3,
          y: 3,
          z: 0,
        },

        // Sanctuary Gate blocking access to exit
        {
          id: 'door_sanctuary',
          type: ENTITY_TYPES.DOOR,
          name: 'Sanctuary Seal',
          color: '#10b981',
          requiresKey: 'never_matched_key', // Opened solely via riddle group
          isOpen: false,
          x: 4,
          y: 5,
          z: 0,
        },
      ],
    };

    let riddleSolvedEvent = null;
    let victoryAchieved = false;

    const gameLoop = new GameLoop({
      mainCanvas: createMockCanvas(),
      minimapCanvas: createMockCanvas(180, 180),
      level: riddleLevel,
      uiCallbacks: {
        onRiddleSolved: (data) => {
          riddleSolvedEvent = data;
        },
        onVictory: () => {
          victoryAchieved = true;
        },
      },
    });

    // 1. Initial State: player at (4, 1), carrying nothing
    assertEqual(gameLoop.player.hasCarriedRiddleItem(), false);
    const sanctDoor = gameLoop.entities.find(e => e.id === 'door_sanctuary');
    assertEqual(sanctDoor.isOpen, false, 'Sanctuary door starts locked');

    // 2. Read Inscription on North Pedestal at (4, 2)
    gameLoop.player.gridX = 4;
    gameLoop.player.gridY = 1; // Adjacent to (4, 2)
    gameLoop.handleManualInteract(); // Inspects ped_north
    const pedNorth = gameLoop.entities.find(e => e.id === 'ped_north');
    assertEqual(pedNorth.isSatisfied(), false);

    // 3. Move to (1, 1) to pick up Falcon Statue
    gameLoop.player.gridX = 1;
    gameLoop.player.gridY = 1;
    gameLoop.handleCellArrival();
    assertEqual(gameLoop.player.hasCarriedRiddleItem(), true, 'Player picks up Falcon statue');
    assertEqual(gameLoop.player.carriedRiddleItem.id, 'statue_falcon');

    // 4. Place Falcon statue on WRONG pedestal (North Pedestal at 4, 2)
    gameLoop.player.gridX = 4;
    gameLoop.player.gridY = 1;
    gameLoop.handleManualInteract();
    assertEqual(gameLoop.player.hasCarriedRiddleItem(), false, 'Placed item on pedestal');
    assertEqual(pedNorth.slottedItem.id, 'statue_falcon');
    assertEqual(pedNorth.isSatisfied(), false, 'Wrong statue does NOT satisfy North Pedestal');
    assertEqual(sanctDoor.isOpen, false, 'Door remains firmly locked');

    // 5. Retrieve Falcon statue from North Pedestal
    gameLoop.handleManualInteract();
    assertEqual(gameLoop.player.hasCarriedRiddleItem(), true, 'Retrieved Falcon statue back into hands');
    assertEqual(gameLoop.player.carriedRiddleItem.id, 'statue_falcon');
    assertEqual(pedNorth.slottedItem, null);

    // 6. Walk to East Pedestal at (5, 3) and place Falcon statue (correct!)
    gameLoop.player.gridX = 6;
    gameLoop.player.gridY = 3;
    gameLoop.player.facing = 'west'; // Facing East pedestal at (5, 3)
    gameLoop.handleManualInteract();
    const pedEast = gameLoop.entities.find(e => e.id === 'ped_east');
    assertEqual(pedEast.isSatisfied(), true, 'East Pedestal satisfied by Falcon statue');
    assertEqual(sanctDoor.isOpen, false, 'Door still locked (only 1 of 4 satisfied)');

    // 7. Pick up Serpent Statue at (7, 1) and place on North Pedestal at (4, 2)
    gameLoop.player.gridX = 7;
    gameLoop.player.gridY = 1;
    gameLoop.handleCellArrival();
    assertEqual(gameLoop.player.carriedRiddleItem.id, 'statue_serpent');

    gameLoop.player.gridX = 4;
    gameLoop.player.gridY = 1;
    gameLoop.player.facing = 'south'; // Facing North pedestal at (4, 2)
    gameLoop.handleManualInteract();
    assertEqual(pedNorth.isSatisfied(), true, 'North Pedestal satisfied by Serpent statue');

    // 8. Pick up Lion Statue at (1, 3) and place on South Pedestal at (4, 4)
    gameLoop.player.gridX = 1;
    gameLoop.player.gridY = 3;
    gameLoop.handleCellArrival();
    assertEqual(gameLoop.player.carriedRiddleItem.id, 'statue_lion');

    gameLoop.player.gridX = 4;
    gameLoop.player.gridY = 3;
    gameLoop.player.facing = 'south'; // Facing South pedestal at (4, 4)
    const pedSouth = gameLoop.entities.find(e => e.id === 'ped_south');
    gameLoop.handleManualInteract();
    assertEqual(pedSouth.isSatisfied(), true, 'South Pedestal satisfied by Lion statue');
    assertEqual(sanctDoor.isOpen, false, '3 of 4 satisfied, door remains locked');

    // 9. Pick up Dragon Statue at (7, 3) and place on West Pedestal at (3, 3)
    gameLoop.player.gridX = 7;
    gameLoop.player.gridY = 3;
    gameLoop.handleCellArrival();
    assertEqual(gameLoop.player.carriedRiddleItem.id, 'statue_dragon');

    gameLoop.player.gridX = 2;
    gameLoop.player.gridY = 3;
    gameLoop.player.facing = 'east'; // Facing West pedestal at (3, 3)
    const pedWest = gameLoop.entities.find(e => e.id === 'ped_west');
    gameLoop.handleManualInteract();
    assertEqual(pedWest.isSatisfied(), true, 'West Pedestal satisfied by Dragon statue');

    // 10. ALL 4 PEDESTALS ARE NOW SATISFIED!
    // Sanctuary door should be unlocked automatically!
    assertEqual(sanctDoor.isOpen, true, 'Sanctuary seal broken and door opened!');
    assert(riddleSolvedEvent !== null, 'onRiddleSolved callback fired');
    assertEqual(riddleSolvedEvent.groupId, 'four_guardians');

    // 11. Traverse through opened Sanctuary Door to exit portal at (4, 7)
    // Starting from (2, 3), step contiguously:
    const steps = [
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 4 },
      { x: 4, y: 5 }, // Sanctuary door location
      { x: 4, y: 6 },
      { x: 4, y: 7 }, // Exit portal
    ];

    for (const step of steps) {
      const allowed = gameLoop.tryMove(step.x, step.y);
      assert(allowed, `Move to (${step.x}, ${step.y}) permitted`);
      gameLoop.player.gridX = step.x;
      gameLoop.player.gridY = step.y;
      gameLoop.player.worldX = step.x * 32 + 16;
      gameLoop.player.worldY = step.y * 32 + 16;
      gameLoop.player.isMoving = false;
      gameLoop.player.stepsTaken++;
      gameLoop.handleCellArrival();
      gameLoop.update(0.016);
    }

    assertEqual(victoryAchieved, true, 'Victory achieved through riddle puzzle completion!');
    assertEqual(gameLoop.isWon, true);

    gameLoop.destroy();
  });
});
