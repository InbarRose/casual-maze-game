import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { BaseEntity } from '../../../js/entities/base-entity.js';
import { Key } from '../../../js/entities/key.js';
import { Door } from '../../../js/entities/door.js';
import { Lever } from '../../../js/entities/lever.js';
import { Vec2 } from '../../../js/core/geometry.js';
import { ENTITY_TYPES, ELEVATION } from '../../../js/core/constants.js';

describe('Entities > Polymorphic BaseEntity & Contracts (BL-57)', () => {
  it('instantiates BaseEntity with coordinates and Vec2 position Value Object', () => {
    const entity = new BaseEntity({
      type: 'test_node',
      id: 'node_1',
      x: 5,
      y: 9,
      z: 1,
      name: 'Test Node',
    });

    assertEqual(entity.id, 'node_1');
    assertEqual(entity.type, 'test_node');
    assertEqual(entity.x, 5);
    assertEqual(entity.y, 9);
    assertEqual(entity.z, 1);
    assertEqual(entity.elevation, 1);
    assertEqual(entity.getCoordString(), '(5, 9, 1)');

    // Vec2 position getter
    const pos = entity.position;
    assert(pos instanceof Vec2, 'Position is an instance of Vec2');
    assertEqual(pos.x, 5);
    assertEqual(pos.y, 9);
    assert(Object.isFrozen(pos), 'Vec2 position is deeply immutable');

    // Mutating position via setPosition
    entity.setPosition(new Vec2(14, 22));
    assertEqual(entity.x, 14);
    assertEqual(entity.y, 22);

    entity.setPosition(7, 3);
    assertEqual(entity.x, 7);
    assertEqual(entity.y, 3);
  });

  it('calculates Manhattan distances and validates interaction reachability', () => {
    const entity = new BaseEntity({
      type: 'shrine',
      x: 10,
      y: 10,
      z: 0,
    });

    // Distance to coordinates
    assertEqual(entity.distanceTo(10, 10), 0);
    assertEqual(entity.distanceTo(10, 11), 1);
    assertEqual(entity.distanceTo(12, 13), 5); // |10-12| + |10-13| = 2 + 3 = 5

    // canInteract
    assert(entity.canInteract(10, 10, 0), 'Can interact on same cell');
    assert(entity.canInteract(10, 9, 0), 'Can interact orthogonally adjacent (North)');
    assert(entity.canInteract(11, 10, 0), 'Can interact orthogonally adjacent (East)');
    assert(!entity.canInteract(12, 10, 0), 'Cannot interact 2 steps away');
    assert(!entity.canInteract(10, 10, 1), 'Cannot interact from different elevation (Z=1 vs Z=0)');
  });

  it('guarantees polymorphic domain model inheritance for Key, Door, and Lever', () => {
    const key = new Key({ id: 'key_gold_1', x: 3, y: 4, color: '#fbbf24', name: 'Golden Sun Key' });
    const door = new Door({ id: 'door_gold_1', x: 8, y: 8, requiresKey: 'key_gold_1' });
    const lever = new Lever({ id: 'lever_1', x: 2, y: 2, targets: [] });

    assert(key instanceof BaseEntity, 'Key inherits from BaseEntity');
    assert(door instanceof BaseEntity, 'Door inherits from BaseEntity');
    assert(lever instanceof BaseEntity, 'Lever inherits from BaseEntity');

    // Prompts
    assertEqual(key.getPrompt(), 'Collect Golden Sun Key');
    assertEqual(door.getPrompt(), 'Unlock Gate (key_gold_1)');
    assertEqual(lever.getPrompt(), 'Activate Switch');

    // Door blocking contract
    assert(door.isBlocking(8, 8, 0), 'Closed door is blocking');
    door.open();
    assert(!door.isBlocking(8, 8, 0), 'Open door is not blocking');
    assertEqual(door.getPrompt(), 'Open Passage');
  });
});
