/**
 * Unit Test: Clean Geometry Value Objects (BL-61)
 * Verifies immutable 2D coordinates, grid rectangles, and cardinal heading domain models.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Vec2, GridRect, Heading } from '../../../js/core/geometry.js';

describe('Core > Clean Geometry Value Objects (BL-61)', () => {
  it('instantiates immutable Vec2 with defaults and value getters', () => {
    const v1 = new Vec2(5, 12);
    assertEqual(v1.x, 5);
    assertEqual(v1.y, 12);
    assert(Object.isFrozen(v1), 'Vec2 is deeply immutable (frozen)');

    const vZero = Vec2.zero();
    assertEqual(vZero.x, 0);
    assertEqual(vZero.y, 0);

    const vFromArr = Vec2.from([3, 7]);
    assertEqual(vFromArr.x, 3);
    assertEqual(vFromArr.y, 7);

    const vFromObj = Vec2.from({ x: 9, y: -4 });
    assertEqual(vFromObj.x, 9);
    assertEqual(vFromObj.y, -4);
  });

  it('performs vector addition, subtraction, and scaling immutably', () => {
    const a = new Vec2(10, 20);
    const b = new Vec2(3, 4);

    const sum = a.add(b);
    assertEqual(sum.x, 13);
    assertEqual(sum.y, 24);
    assertEqual(a.x, 10, 'Original vector unchanged');

    const diff = a.sub(b);
    assertEqual(diff.x, 7);
    assertEqual(diff.y, 16);

    const scaled = b.scale(2.5);
    assertEqual(scaled.x, 7.5);
    assertEqual(scaled.y, 10);
  });

  it('computes euclidean and manhattan distance accurately', () => {
    const p1 = new Vec2(0, 0);
    const p2 = new Vec2(3, 4);

    assertEqual(p1.distanceTo(p2), 5, 'Euclidean distance (3-4-5 triangle)');
    assertEqual(p1.manhattanDistanceTo(p2), 7, 'Manhattan distance (|3| + |4|)');
  });

  it('handles equality, clamping, and string key serialization', () => {
    const a = new Vec2(4, 8);
    const b = new Vec2(4, 8);
    const c = new Vec2(4, 9);

    assert(a.equals(b), 'Equal vectors evaluate to true');
    assert(!a.equals(c), 'Non-equal vectors evaluate to false');

    const key = a.toKey();
    assertEqual(key, '4,8');
    const parsed = Vec2.fromKey(key);
    assert(parsed.equals(a), 'Vec2 round-trips through toKey and fromKey');

    const unclamped = new Vec2(15, -5);
    const clamped = unclamped.clamp(new Vec2(0, 0), new Vec2(10, 10));
    assertEqual(clamped.x, 10);
    assertEqual(clamped.y, 0);
  });

  it('rotates 90 degrees clockwise and counter-clockwise in screen coordinates', () => {
    // In screen coordinates: Right = (1, 0), Down = (0, 1), Left = (-1, 0), Up = (0, -1)
    const right = Vec2.right();
    const down = right.rotateCW();
    assertEqual(down.x, 0);
    assertEqual(down.y, 1);

    const left = down.rotateCW();
    assertEqual(left.x, -1);
    assertEqual(left.y, 0);

    const backToDown = left.rotateCCW();
    assertEqual(backToDown.x, 0);
    assertEqual(backToDown.y, 1);
  });

  it('verifies GridRect boundaries, containment, overlap, and point clamping', () => {
    const rect = new GridRect(2, 4, 10, 8);
    assertEqual(rect.left, 2);
    assertEqual(rect.right, 12);
    assertEqual(rect.top, 4);
    assertEqual(rect.bottom, 12);
    assert(Object.isFrozen(rect), 'GridRect is deeply immutable');

    // Containment tests
    assert(rect.contains(2, 4), 'Top-left corner is inside [inclusive]');
    assert(rect.contains(5, 7), 'Center point is inside');
    assert(!rect.contains(12, 10), 'Right boundary is outside [exclusive]');
    assert(!rect.contains(5, 12), 'Bottom boundary is outside [exclusive]');
    assert(!rect.contains(1, 4), 'Left of rect is outside');

    // Overlap tests
    const overlapping = new GridRect(8, 6, 6, 6);
    assert(rect.overlaps(overlapping), 'Intersecting rects overlap');
    const disjoint = new GridRect(15, 15, 4, 4);
    assert(!rect.overlaps(disjoint), 'Disjoint rects do not overlap');

    // Point clamping
    const outside = new Vec2(20, -5);
    const inside = rect.clamp(outside);
    assertEqual(inside.x, 11);
    assertEqual(inside.y, 4);
  });

  it('handles cardinal Heading conversions, deltas, and rotations', () => {
    assertEqual(Heading.fromDelta(1, 0), Heading.EAST);
    assertEqual(Heading.fromDelta(-1, 0), Heading.WEST);
    assertEqual(Heading.fromDelta(0, 1), Heading.SOUTH);
    assertEqual(Heading.fromDelta(0, -1), Heading.NORTH);

    const eastDelta = Heading.toDelta(Heading.EAST);
    assertEqual(eastDelta.x, 1);
    assertEqual(eastDelta.y, 0);

    // Rotations
    assertEqual(Heading.rotateCW(Heading.NORTH, 90), Heading.EAST);
    assertEqual(Heading.rotateCW(Heading.NORTH, 180), Heading.SOUTH);
    assertEqual(Heading.rotateCW(Heading.NORTH, 270), Heading.WEST);
    assertEqual(Heading.rotateCCW(Heading.NORTH, 90), Heading.WEST);

    // Angles
    assertEqual(Heading.toAngle(Heading.NORTH), 0);
    assertEqual(Heading.toAngle(Heading.EAST), 90);
    assertEqual(Heading.toAngle(Heading.SOUTH), 180);
    assertEqual(Heading.toAngle(Heading.WEST), 270);
  });
});
