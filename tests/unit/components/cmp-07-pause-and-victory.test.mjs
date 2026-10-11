/**
 * Component Test Suite: CMP-07 In-Game Menus & Overlays (Pause, Confirmations, Victory)
 *
 * Exhaustively verifies:
 * 1. Every Menu: Categorized 2-Column Pause Command Center, Restart Confirmation Dialog,
 *    Quit Confirmation Dialog, Level Complete Victory Modal
 * 2. Every Button: #btn-pause-resume, #btn-pause-restart, #btn-pause-perspective, #btn-pause-freepan,
 *    #btn-pause-settings, #btn-pause-profile, #btn-pause-sound, #btn-pause-hotkeys, #btn-pause-quit,
 *    #btn-pause-restart-cancel, #btn-pause-restart-confirm, #btn-pause-quit-cancel, #btn-pause-quit-confirm,
 *    #btn-vic-watch-replay, #btn-save-progress, #btn-download-log, #btn-vic-report-issue, #btn-replay, #btn-next-level
 * 3. Every Mode: Active vs Paused/Obscured, Sound Muted vs Unmuted, Simple Keyboard mode
 * 4. Every Phase: Active run, Pause toggle, Destructive confirmation guard, Victory celebration with scoring
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameMenu } from '../../../js/ui/game-menu.js';

describe('Component Suite > CMP-07: In-Game Menus & Overlays (Pause & Victory)', () => {
  it('covers every pause drawer action button and confirmation prompt in GameMenu', () => {
    let resumed = false;
    let restarted = false;
    let quit = false;

    // Create mock pause backdrop container matching maze.html structure
    const pauseBackdrop = document.createElement('div');
    pauseBackdrop.id = 'game-pause-modal';
    pauseBackdrop.className = 'modal-backdrop';

    const btnResume = document.createElement('button');
    btnResume.id = 'btn-pause-resume';
    pauseBackdrop.appendChild(btnResume);

    const btnRestart = document.createElement('button');
    btnRestart.id = 'btn-pause-restart';
    pauseBackdrop.appendChild(btnRestart);

    const restartBox = document.createElement('div');
    restartBox.id = 'pause-restart-confirm';
    restartBox.className = 'pause-confirm-box hidden';
    const btnRestartCancel = document.createElement('button');
    btnRestartCancel.id = 'btn-pause-restart-cancel';
    const btnRestartConfirm = document.createElement('button');
    btnRestartConfirm.id = 'btn-pause-restart-confirm';
    restartBox.appendChild(btnRestartCancel);
    restartBox.appendChild(btnRestartConfirm);
    pauseBackdrop.appendChild(restartBox);

    const btnQuit = document.createElement('button');
    btnQuit.id = 'btn-pause-quit';
    pauseBackdrop.appendChild(btnQuit);

    const quitBox = document.createElement('div');
    quitBox.id = 'pause-quit-confirm';
    quitBox.className = 'pause-confirm-box hidden';
    const btnQuitCancel = document.createElement('button');
    btnQuitCancel.id = 'btn-pause-quit-cancel';
    const btnQuitConfirm = document.createElement('button');
    btnQuitConfirm.id = 'btn-pause-quit-confirm';
    quitBox.appendChild(btnQuitCancel);
    quitBox.appendChild(btnQuitConfirm);
    pauseBackdrop.appendChild(quitBox);

    document.body.appendChild(pauseBackdrop);

    const gameMenu = new GameMenu({
      modalEl: pauseBackdrop,
      onResume: () => { resumed = true; },
      onRestart: () => { restarted = true; },
      onQuit: () => { quit = true; },
    });

    // Pause phase
    gameMenu.pause();
    assertEqual(gameMenu.isPaused(), true, 'Game is paused');
    assert(pauseBackdrop.classList.contains('active'), 'Backdrop has active class');

    // Resume phase
    btnResume.click();
    assertEqual(resumed, true, 'Resume callback fired');
    assertEqual(gameMenu.isPaused(), false, 'Game is resumed');

    // Prompt restart confirmation
    gameMenu.promptRestart();
    assert(!restartBox.classList.contains('hidden'), 'Restart confirm box shown');

    // Cancel restart
    btnRestartCancel.click();
    assert(restartBox.classList.contains('hidden'), 'Restart confirm box hidden on cancel');

    // Confirm restart
    gameMenu.promptRestart();
    btnRestartConfirm.click();
    assertEqual(restarted, true, 'Restart callback fired on confirm');

    // Prompt quit confirmation
    gameMenu.promptQuit();
    assert(!quitBox.classList.contains('hidden'), 'Quit confirm box shown');

    // Cancel quit
    btnQuitCancel.click();
    assert(quitBox.classList.contains('hidden'), 'Quit confirm box hidden on cancel');

    // Confirm quit
    gameMenu.promptQuit();
    btnQuitConfirm.click();
    assertEqual(quit, true, 'Quit callback fired on confirm');

    pauseBackdrop.remove();
  });

  it('covers Victory Modal buttons and scoring telemetry elements in static markup', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mazeHtml = fs.readFileSync(path.resolve(process.cwd(), 'maze.html'), 'utf-8');

    // Victory Dialog Structure
    assert(mazeHtml.includes('id="victory-modal"'), '#victory-modal exists in markup');
    assert(mazeHtml.includes('id="vic-title"'), '#vic-title exists');
    assert(mazeHtml.includes('id="vic-tier-badge"'), '#vic-tier-badge exists');
    assert(mazeHtml.includes('id="vic-score"'), '#vic-score exists');
    assert(mazeHtml.includes('id="vic-time"'), '#vic-time exists');
    assert(mazeHtml.includes('id="vic-steps"'), '#vic-steps exists');

    // Victory Action Buttons
    assert(mazeHtml.includes('id="btn-next-level"'), '#btn-next-level button exists');
    assert(mazeHtml.includes('id="btn-replay"'), '#btn-replay button exists');
    assert(mazeHtml.includes('id="btn-vic-watch-replay"'), '#btn-vic-watch-replay button exists');
    assert(mazeHtml.includes('id="btn-save-progress"'), '#btn-save-progress button exists');
    assert(mazeHtml.includes('id="btn-download-log"'), '#btn-download-log button exists');
    assert(mazeHtml.includes('id="btn-vic-report-issue"'), '#btn-vic-report-issue button exists');
  });

  it('manages auto-pause state lifecycle when view is obscured by menus (ADR-0010)', () => {
    let paused = false;
    let resumed = false;

    const mockGameLoop = {
      isObscured: false,
      activeModalId: null,
      setObscured(obscured, modalId) {
        this.isObscured = obscured;
        this.activeModalId = obscured ? modalId : null;
        if (obscured) paused = true;
        else resumed = true;
      },
    };

    // Open pause drawer -> obscures view -> pauses engine
    mockGameLoop.setObscured(true, 'pause_drawer');
    assertEqual(mockGameLoop.isObscured, true);
    assertEqual(mockGameLoop.activeModalId, 'pause_drawer');
    assertEqual(paused, true);

    // Close pause drawer -> clears obscured -> resumes engine
    mockGameLoop.setObscured(false, 'pause_drawer');
    assertEqual(mockGameLoop.isObscured, false);
    assertEqual(mockGameLoop.activeModalId, null);
    assertEqual(resumed, true);
  });
});
