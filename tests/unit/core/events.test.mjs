/**
 * Unit Tests: EventBus Subsystem
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { EventBus } from '../../../js/core/events.js';

describe('Core > EventBus', () => {
  it('delivers emitted payloads to subscribed listeners', () => {
    const bus = new EventBus();
    let received = null;

    bus.on('player:move', (data) => {
      received = data;
    });

    bus.emit('player:move', { x: 5, y: 10, elevation: 0 });
    assertDeepEqual(received, { x: 5, y: 10, elevation: 0 }, 'Listener receives payload');
  });

  it('notifies multiple subscribers for the same event', () => {
    const bus = new EventBus();
    const calls = [];

    bus.on('game:save', () => calls.push('sub1'));
    bus.on('game:save', () => calls.push('sub2'));

    bus.emit('game:save');
    assertDeepEqual(calls, ['sub1', 'sub2'], 'Both subscribers called in order');
  });

  it('executes once() handlers exactly once and auto-unsubscribes', () => {
    const bus = new EventBus();
    let triggerCount = 0;

    bus.once('level:win', () => {
      triggerCount++;
    });

    bus.emit('level:win', { score: 100 });
    bus.emit('level:win', { score: 200 });
    bus.emit('level:win', { score: 300 });

    assertEqual(triggerCount, 1, 'once handler triggered exactly once');
  });

  it('allows unsubscribing with off()', () => {
    const bus = new EventBus();
    let count = 0;
    const handler = () => { count++; };

    bus.on('tick', handler);
    bus.emit('tick');
    assertEqual(count, 1, 'Initial trigger received');

    bus.off('tick', handler);
    bus.emit('tick');
    assertEqual(count, 1, 'No further triggers after unsubscription');
  });

  it('safely handles emitting events with no listeners', () => {
    const bus = new EventBus();
    bus.emit('unregistered:event', { foo: 'bar' });
    assert(true, 'No error on unhandled event emission');
  });
});
