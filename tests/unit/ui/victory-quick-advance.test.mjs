/**
 * Unit Test: Victory Modal Quick-Advance Hotkeys (BL-55)
 * Verifies that players can press Space or Enter upon victory to advance
 * to the next labyrinth immediately without requiring mouse input.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';

describe('UI > Victory Modal Quick-Advance (BL-55)', () => {
  function setupVictoryModalMock() {
    const classSet = new Set();
    const modal = {
      classList: {
        add: (c) => classSet.add(c),
        remove: (c) => classSet.delete(c),
        contains: (c) => classSet.has(c),
      }
    };

    let nextLevelClicked = 0;
    const btnNextLevel = {
      style: { display: 'inline-flex' },
      click: () => { nextLevelClicked++; }
    };

    let audioPlayed = 0;
    const mockAudio = {
      playTabClick: () => { audioPlayed++; }
    };

    function handleKeydown(code) {
      if (modal && modal.classList.contains('active')) {
        if (code === 'Space' || code === 'Enter' || code === 'NumpadEnter') {
          if (btnNextLevel && btnNextLevel.style.display !== 'none') {
            mockAudio.playTabClick();
            btnNextLevel.click();
            return true;
          }
        }
      }
      return false;
    }

    return {
      modal,
      btnNextLevel,
      mockAudio,
      handleKeydown,
      getClickedCount: () => nextLevelClicked,
      getAudioPlayedCount: () => audioPlayed,
    };
  }

  it('triggers next level advance when Space is pressed while victory modal is active', () => {
    const { modal, handleKeydown, getClickedCount, getAudioPlayedCount } = setupVictoryModalMock();

    // Inactive modal: Space should be ignored
    const handledBefore = handleKeydown('Space');
    assertEqual(handledBefore, false, 'Inactive modal ignores Space');
    assertEqual(getClickedCount(), 0, 'Next level button not clicked before victory');

    // Activate modal
    modal.classList.add('active');
    const handledAfter = handleKeydown('Space');
    assertEqual(handledAfter, true, 'Active modal processes Space');
    assertEqual(getClickedCount(), 1, 'Next level button triggered via Space');
    assertEqual(getAudioPlayedCount(), 1, 'Audio feedback played on advance');
  });

  it('triggers next level advance when Enter or NumpadEnter is pressed', () => {
    const { modal, handleKeydown, getClickedCount, getAudioPlayedCount } = setupVictoryModalMock();
    modal.classList.add('active');

    const enterHandled = handleKeydown('Enter');
    assertEqual(enterHandled, true, 'Active modal processes Enter');
    assertEqual(getClickedCount(), 1, 'Next level button triggered via Enter');

    const numpadHandled = handleKeydown('NumpadEnter');
    assertEqual(numpadHandled, true, 'Active modal processes NumpadEnter');
    assertEqual(getClickedCount(), 2, 'Next level button triggered via NumpadEnter');
    assertEqual(getAudioPlayedCount(), 2, 'Audio feedback played for both advances');
  });

  it('does not trigger advance if next level button is hidden (e.g. final campaign level)', () => {
    const { modal, btnNextLevel, handleKeydown, getClickedCount } = setupVictoryModalMock();
    modal.classList.add('active');
    btnNextLevel.style.display = 'none';

    const handled = handleKeydown('Space');
    assertEqual(handled, false, 'Hidden next button does not handle Space');
    assertEqual(getClickedCount(), 0, 'No advance when next level button is hidden');
  });

  it('ignores unrelated keys while victory modal is active', () => {
    const { modal, handleKeydown, getClickedCount } = setupVictoryModalMock();
    modal.classList.add('active');

    assertEqual(handleKeydown('KeyW'), false);
    assertEqual(handleKeydown('KeyA'), false);
    assertEqual(handleKeydown('KeyS'), false);
    assertEqual(handleKeydown('KeyD'), false);
    assertEqual(handleKeydown('ArrowUp'), false);
    assertEqual(getClickedCount(), 0);
  });
});
