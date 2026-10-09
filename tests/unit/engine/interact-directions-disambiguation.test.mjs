import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { isApproachAllowed, INTERACT_APPROACHES, KEY_CODES, ELEVATION, ENTITY_TYPES } from '../../../js/core/constants.js';
import { BaseEntity } from '../../../js/entities/base-entity.js';
import { Signpost } from '../../../js/entities/signpost.js';
import { WallDecor } from '../../../js/entities/wall-decor.js';
import { Lever } from '../../../js/entities/lever.js';
import { PuzzleGate } from '../../../js/entities/puzzle-gate.js';
import { Pedestal } from '../../../js/entities/pedestal.js';
import { RiddleItem } from '../../../js/entities/riddle-item.js';
import { Door } from '../../../js/entities/door.js';
import { InputManager, GAME_COMMANDS } from '../../../js/engine/input-manager.js';
import { GameLoop } from '../../../js/engine/game-loop.js';

describe('Engine > Directional Proximity & Multi-Target Disambiguation (BL-85)', () => {
  it('correctly calculates allowed approach directions with isApproachAllowed', () => {
    const ex = 5;
    const ey = 5;

    // Default: all directions allowed if omitted or null
    assert(isApproachAllowed(ex, ey, 5, 4, null), 'North allowed by default');
    assert(isApproachAllowed(ex, ey, 5, 6, undefined), 'South allowed by default');
    assert(isApproachAllowed(ex, ey, 4, 5, []), 'West allowed by default');
    assert(isApproachAllowed(ex, ey, 6, 5), 'East allowed by default');
    assert(isApproachAllowed(ex, ey, 5, 5), 'Self allowed by default');

    // Restrict to south only (player standing below entity at 5, 6)
    const southOnly = ['south'];
    assert(isApproachAllowed(ex, ey, 5, 6, southOnly), 'Player at south is allowed');
    assert(!isApproachAllowed(ex, ey, 5, 4, southOnly), 'Player at north is rejected');
    assert(!isApproachAllowed(ex, ey, 4, 5, southOnly), 'Player at west is rejected');
    assert(!isApproachAllowed(ex, ey, 6, 5, southOnly), 'Player at east is rejected');
    assert(!isApproachAllowed(ex, ey, 5, 5, southOnly), 'Player on tile is rejected when south only');

    // Restrict to cardinal approaches only (no standing on tile)
    const cardinals = ['north', 'south', 'east', 'west'];
    assert(isApproachAllowed(ex, ey, 5, 4, cardinals), 'North allowed');
    assert(isApproachAllowed(ex, ey, 5, 6, cardinals), 'South allowed');
    assert(isApproachAllowed(ex, ey, 4, 5, cardinals), 'West allowed');
    assert(isApproachAllowed(ex, ey, 6, 5, cardinals), 'East allowed');
    assert(!isApproachAllowed(ex, ey, 5, 5, cardinals), 'Self rejected');

    // Distant cells
    assert(!isApproachAllowed(ex, ey, 8, 8, null), 'Distant cell rejected');
  });

  it('enforces interactDirections in BaseEntity and all subclass entities', () => {
    // BaseEntity
    const base = new BaseEntity({
      type: 'test_entity',
      x: 3,
      y: 3,
      interactDirections: ['north', 'east'],
    });
    assert(base.canInteract(3, 2, 0), 'Player north can interact');
    assert(base.canInteract(4, 3, 0), 'Player east can interact');
    assert(!base.canInteract(3, 4, 0), 'Player south cannot interact');
    assert(!base.canInteract(2, 3, 0), 'Player west cannot interact');

    // Signpost
    const sign = new Signpost({
      x: 10,
      y: 10,
      title: 'Guidepost',
      text: 'Read me from the South',
      interactDirections: ['south'],
    });
    assert(sign.canInteract(10, 11, 0), 'Signpost interactable from South');
    assert(!sign.canInteract(10, 9, 0), 'Signpost not interactable from North');

    // WallDecor
    const decor = new WallDecor({
      x: 2,
      y: 0,
      title: 'North Wall Mural',
      interactDirections: ['south'], // Mounted on north wall, viewed from south
    });
    assert(decor.canInteract(2, 1, 0), 'Wall decor viewable facing north from south');
    assert(!decor.canInteract(2, 0, 0), 'Cannot interact standing on wall tile');

    // Lever
    const lever = new Lever({
      x: 7,
      y: 7,
      name: 'Pillar Switch',
      interactDirections: ['west', 'east'],
    });
    assert(lever.canInteract(6, 7, 0), 'Lever interactable from West');
    assert(lever.canInteract(8, 7, 0), 'Lever interactable from East');
    assert(!lever.canInteract(7, 6, 0), 'Lever blocked from North');

    // PuzzleGate
    const gate = new PuzzleGate({
      x: 4,
      y: 4,
      interactDirections: ['south'],
    });
    assert(gate.canInteract(4, 5, 0), 'PuzzleGate accessible from front (south)');
    assert(!gate.canInteract(4, 3, 0), 'PuzzleGate blocked from back (north)');

    // Pedestal
    const ped = new Pedestal({
      x: 8,
      y: 8,
      interactDirections: ['north', 'south', 'east', 'west'],
    });
    assert(ped.canInteract(8, 7, 0), 'Pedestal accessible from north');
    assert(!ped.canInteract(8, 8, 0), 'Pedestal cannot be interacted from self when self not in directions');
  });

  it('InputManager dispatches SELECT_OPTION on numeric keypresses (1..9)', () => {
    const input = new InputManager();
    const optionsEmitted = [];

    input.on(GAME_COMMANDS.SELECT_OPTION, (payload) => {
      optionsEmitted.push(payload);
    });

    // Press Digit1
    input.handleKeyDown({ code: 'Digit1', key: '1' });
    assertEqual(optionsEmitted.length, 1);
    assertEqual(optionsEmitted[0].index, 1);

    // Press Digit2
    input.handleKeyDown({ code: 'Digit2', key: '2' });
    assertEqual(optionsEmitted.length, 2);
    assertEqual(optionsEmitted[1].index, 2);

    // Press Numpad3
    input.handleKeyDown({ code: 'Numpad3', key: '3' });
    assertEqual(optionsEmitted.length, 3);
    assertEqual(optionsEmitted[2].index, 3);

    // Press digit 9
    input.handleKeyDown({ code: 'Digit9', key: '9' });
    assertEqual(optionsEmitted.length, 4);
    assertEqual(optionsEmitted[3].index, 9);
  });

  it('GameLoop disambiguates multiple adjacent interactables with numbered candidates', () => {
    const mockLevel = {
      id: 99,
      name: 'Disambiguation Chamber',
      dimensions: { width: 10, height: 10 },
      spawn: { x: 5, y: 5 },
      exits: [],
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      entities: [
        // Entity 1: Signpost at (5, 4) - North of player
        { type: ENTITY_TYPES.SIGNPOST, id: 'sign_1', x: 5, y: 4, title: 'North Tablet', text: 'Lore text' },
        // Entity 2: Lever at (6, 5) - East of player
        { type: ENTITY_TYPES.LEVER, id: 'lever_1', x: 6, y: 5, name: 'East Switch', state: false },
        // Entity 3: WallDecor at (5, 6) - South of player, but restricted to West only
        { type: ENTITY_TYPES.WALL_DECOR, id: 'decor_1', x: 5, y: 6, title: 'Secret Fresco', interactDirections: ['west'] },
      ],
    };

    const mockCanvas = {
      getContext: () => ({
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        clearRect: () => {},
        fillRect: () => {},
        drawImage: () => {},
      }),
      width: 800,
      height: 600,
      getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }),
    };

    let interactionReceived = null;
    let allCandidatesReceived = null;

    const gameLoop = new GameLoop({
      mainCanvas: mockCanvas,
      minimapCanvas: mockCanvas,
      level: mockLevel,
      uiCallbacks: {
        onInteractionAvailable: (interaction, targetPos, targetScreen, playerScreen, allCandidates) => {
          interactionReceived = interaction;
          allCandidatesReceived = allCandidates;
        },
      },
    });

    gameLoop.player.gridX = 5;
    gameLoop.player.gridY = 5;
    gameLoop.player.facing = 'north';

    const candidates = gameLoop.getAllAvailableInteractions();
    // decor_1 at (5, 6) is rejected because player is North of it (at 5, 5), but decor requires ['west']
    assertEqual(candidates.length, 2, 'Exactly 2 candidates valid');

    // Since player is facing north, candidate 1 must be the signpost at (5, 4)
    assertEqual(candidates[0].type, 'signpost');
    assertEqual(candidates[0].index, 1);
    assertEqual(candidates[0].keyHint, '1');
    assertEqual(candidates[0].id, 'sign_1');

    // Candidate 2 is the lever at (6, 5)
    assertEqual(candidates[1].type, 'lever');
    assertEqual(candidates[1].index, 2);
    assertEqual(candidates[1].keyHint, '2');
    assertEqual(candidates[1].id, 'lever_1');

    // Verify getAvailableInteraction() wraps primary candidate with .candidates list
    const primary = gameLoop.getAvailableInteraction();
    assert(primary !== null, 'Primary interaction exists');
    assertEqual(primary.id, 'sign_1');
    assertEqual(primary.candidates.length, 2);

    // Test handleManualInteract(2) pulls candidate 2 (the lever)
    const leverEntity = gameLoop.entities.find(e => e.id === 'lever_1');
    assertEqual(leverEntity.state, false, 'Lever initially false');
    gameLoop.handleManualInteract(2);
    assertEqual(leverEntity.state, true, 'Lever toggled by handleManualInteract(2)');

    // Test handleManualInteract(1) or handleManualInteract() triggers candidate 1 (signpost)
    let signpostRead = false;
    gameLoop.uiCallbacks.onSignpostRead = (data) => {
      signpostRead = true;
      assertEqual(data.title, 'North Tablet');
    };
    gameLoop.handleManualInteract(1);
    assert(signpostRead, 'Signpost read triggered by handleManualInteract(1)');

    gameLoop.stop();
  });

  it('re-orders primary candidate when player turns facing direction', () => {
    const mockLevel = {
      id: 100,
      name: 'Facing Chamber',
      dimensions: { width: 10, height: 10 },
      spawn: { x: 5, y: 5 },
      exits: [],
      grid: Array(10).fill(null).map(() => Array(10).fill(0)),
      entities: [
        { type: ENTITY_TYPES.SIGNPOST, id: 'sign_north', x: 5, y: 4, title: 'North Tablet' },
        { type: ENTITY_TYPES.LEVER, id: 'lever_east', x: 6, y: 5, name: 'East Switch' },
      ],
    };

    const mockCanvas = {
      getContext: () => ({
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        clearRect: () => {},
        fillRect: () => {},
        drawImage: () => {},
      }),
      width: 800,
      height: 600,
      getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }),
    };

    const gameLoop = new GameLoop({
      mainCanvas: mockCanvas,
      minimapCanvas: mockCanvas,
      level: mockLevel,
    });

    gameLoop.player.gridX = 5;
    gameLoop.player.gridY = 5;

    // Face North: candidate 1 is signpost
    gameLoop.player.facing = 'north';
    let candidates = gameLoop.getAllAvailableInteractions();
    assertEqual(candidates[0].id, 'sign_north');
    assertEqual(candidates[1].id, 'lever_east');

    // Turn East: candidate 1 becomes lever!
    gameLoop.player.facing = 'east';
    candidates = gameLoop.getAllAvailableInteractions();
    assertEqual(candidates[0].id, 'lever_east');
    assertEqual(candidates[1].id, 'sign_north');

    gameLoop.stop();
  });
});
