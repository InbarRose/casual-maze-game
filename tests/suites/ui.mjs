/**
 * UI and Component Test Suite Runner for Casual Maze Game
 * Runs UI, modals, menus, navigation, audio, and CMP-01 through CMP-19 audited suites.
 */

import { run } from '../harness/index.mjs';

// UI
import '../unit/ui/audio-fx.test.mjs';
import '../unit/ui/audio-ambience.test.mjs';
import '../unit/ui/game-menu.test.mjs';
import '../unit/ui/app-header.test.mjs';
import '../unit/ui/hero-ambient-canvas.test.mjs';
import '../unit/ui/lore-journal.test.mjs';
import '../unit/ui/celestial-cipher-dials.test.mjs';
import '../unit/ui/overlay-manager.test.mjs';
import '../unit/ui/avatar-presets.test.mjs';
import '../unit/ui/mobile-topbar-and-minimal-exit.test.mjs';
import '../unit/ui/compact-topbar-and-menus.test.mjs';
import '../unit/ui/zoom-reset-and-mobile-controls.test.mjs';
import '../unit/ui/drag-scroll-and-dynamic-menu.test.mjs';
import '../unit/ui/github-issues-89-90-91.test.mjs';
import '../unit/ui/touch-controls.test.mjs';
import '../unit/ui/victory-quick-advance.test.mjs';
import '../unit/ui/victory-modal-streamline.test.mjs';
import '../unit/ui/breadcrumbs-navigation.test.mjs';
import '../unit/ui/high-contrast-mode.test.mjs';
import '../unit/ui/mobile-controls.test.mjs';
import '../unit/ui/mobile-movement-and-minimap.test.mjs';
import '../unit/ui/feedback-modal.test.mjs';
import '../unit/ui/guide-modal.test.mjs';
import '../unit/ui/elevation-audio.test.mjs';
import '../unit/ui/profile-customization.test.mjs';
import '../unit/ui/mobile-feed-and-download.test.mjs';
import '../unit/ui/replay-theater-and-feed.test.mjs';
import '../unit/ui/maze-html-bootstrap.test.mjs';

// Platform Component Audited Suites (CMP-01 to CMP-19)
import '../unit/components/cmp-01-app-shell.test.mjs';
import '../unit/components/cmp-05-06-hud-and-action-feedback.test.mjs';
import '../unit/components/cmp-07-pause-and-victory.test.mjs';
import '../unit/components/cmp-08-10-editor-studio.test.mjs';
import '../unit/components/cmp-11-asset-pipeline-and-scoring.test.mjs';
import '../unit/components/cmp-14-profile-and-progression.test.mjs';
import '../unit/components/cmp-15-settings-system.test.mjs';
import '../unit/components/cmp-16-18-guide-and-feedback.test.mjs';
import '../unit/components/cmp-17-diagnostic-lab-theater.test.mjs';

await run();
