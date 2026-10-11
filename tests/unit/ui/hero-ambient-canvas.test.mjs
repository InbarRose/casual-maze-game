/**
 * Unit Tests: Hero Ambient Canvas Simulation (BL-80)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { HeroAmbientCanvas } from '../../../js/ui/hero-ambient-canvas.js';

describe('UI > Hero Ambient Canvas Simulation (BL-80)', () => {
  it('safely handles null/missing canvas in headless environment without crashing', () => {
    const hero = new HeroAmbientCanvas(null);
    assertEqual(hero.running, false);
    assertEqual(hero.paused, false);

    // Lifecycle methods should not throw
    hero.start();
    hero.pause();
    assertEqual(hero.paused, true);
    hero.resume();
    assertEqual(hero.paused, false);
    hero.stop();
    assertEqual(hero.running, false);
    hero.destroy();
  });

  it('initializes grid, motes, and explorer state correctly', () => {
    const hero = new HeroAmbientCanvas(null, { moteCount: 20 });
    const state = hero.getState();

    assertEqual(state.moteCount, 20);
    assert(state.explorer.gridX >= 0, 'Explorer gridX is valid');
    assert(state.explorer.gridY >= 0, 'Explorer gridY is valid');
    assert(typeof state.explorer.direction === 'string', 'Explorer direction is tracked');
    hero.destroy();
  });

  it('updates motes, parallax, and explorer position during tick', () => {
    const hero = new HeroAmbientCanvas(null, { speed: 1.5 });
    hero.parallax.targetX = 10;
    hero.parallax.targetY = -5;

    const initialMoteY = hero.motes[0].y;
    hero.update(0.016);

    assert(hero.parallax.x !== 0, 'Parallax x moved toward target');
    assert(hero.parallax.y !== 0, 'Parallax y moved toward target');
    assert(hero.motes[0].y !== initialMoteY, 'Mote Y position updated');

    hero.destroy();
  });

  it('executes full render pipeline with mock 2D canvas context', () => {
    const calls = [];
    const mockCtx = {
      clearRect: (...args) => calls.push(['clearRect', ...args]),
      save: () => calls.push(['save']),
      restore: () => calls.push(['restore']),
      translate: (...args) => calls.push(['translate', ...args]),
      scale: (...args) => calls.push(['scale', ...args]),
      setTransform: (...args) => calls.push(['setTransform', ...args]),
      fillRect: (...args) => calls.push(['fillRect', ...args]),
      strokeRect: (...args) => calls.push(['strokeRect', ...args]),
      beginPath: () => calls.push(['beginPath']),
      arc: (...args) => calls.push(['arc', ...args]),
      stroke: () => calls.push(['stroke']),
      fill: () => calls.push(['fill']),
      createRadialGradient: () => ({
        addColorStop: () => {},
      }),
    };

    const mockCanvas = {
      getContext: (type) => (type === '2d' ? mockCtx : null),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 400 }),
      width: 800,
      height: 400,
      clientWidth: 800,
      clientHeight: 400,
    };

    const hero = new HeroAmbientCanvas(mockCanvas);
    hero.render();

    assert(calls.some(c => c[0] === 'clearRect'), 'Canvas clearRect called');
    assert(calls.some(c => c[0] === 'fillRect'), 'Canvas fillRect called for corridors/vignette');
    assert(calls.some(c => c[0] === 'arc'), 'Canvas arc called for light/motes/avatar');

    hero.destroy();
  });
});
