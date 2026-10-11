# 0021. Walkthrough Replay Fullscreen Grand Theater & Synchronized Action Activity Feed

Date: 2026-10-10

## Status
Accepted

## Context
The Testing & Diagnostics Lab (`test.html`) features a walkthrough playback engine (`ReplayPlayer`) designed to review solver solutions, verify level solvability, and step through recorded player playthroughs. However, the user experience had several major limitations:
1. **Cramped 4:3 Side-by-Side Presentation**:
   The walkthrough viewer was constrained inside a rigid 800x600 fixed-dimension box with a small side column (`.theater-layout`), producing black letterboxing bars and tiny game elements that failed to convey the visual grandeur of the main game screen (`maze.html`).
2. **Missing Action Activity Feed**:
   While `maze.html` featured a live Action Activity Feed overlay with event category filtering (`All`, `📜 Lore`, `⚙️ Mech`, `🗝️ Items`) and animated notification cards, `test.html` lacked this feature entirely. Viewers could not observe switches toggled, doors unlocked, notes examined, or keys collected in real time.
3. **Missing Floating HUD Islands & Minimap Radar**:
   The replay canvas lacked the floating HUD top islands (level title, chapter, elevation, carried inventory keys with colorblind geometric shape glyphs, par time, step counters, 2.5D perspective switch, and camera rotation dial), as well as the tactical radar minimap.
4. **Rudimentary Playback Controls**:
   Playback controls were limited to basic play, pause, prev, and next buttons, lacking transport features like "Skip to End", continuous looping, audio FX toggling, scrubber timestamp readouts, and fullscreen theater immersion.

## Decision
1. **Expansive Grand Screen Theater Architecture (BL-112)**:
   - Replaced the cramped side-by-side layout in `test.html` with a full-width `.replay-stage-wrapper` and flexible `.replay-viewport` (`height: clamp(520px, 68vh, 800px)`).
   - Upgraded `ReplayPlayer` to dynamically resize its canvas and camera viewport (`replayPlayer.resize(w, h)`), driven by a `ResizeObserver` on `#replay-viewport` and window resize listeners.
   - Implemented a dedicated Fullscreen Theater Mode (`.replay-stage-wrapper.is-fullscreen`) with seamless toggle (<kbd>F</kbd> / <kbd>Esc</kbd>) and docking media controls.
2. **Real-Time Action Activity Feed Overlay**:
   - Added `#replay-activity-feed` overlay inside `#replay-viewport`, matching the styling and animations of `maze.html`.
   - Wired category filter pills (`All`, `📜 Lore`, `⚙️ Mech`, `🗝️ Items`) and an expandable/collapsible minimize toggle (`#btn-replay-feed-toggle`).
   - Connected `globalEvents` (`key:collected`, `door:unlocked`, `door:locked`, `lever:toggled`, `teleport:used`, `player:elevation_changed`, `note:examined`) to automatically post animated event cards with audio feedback during playback.
   - Added seek awareness (`replayPlayer.isSeeking`): suppressed audio and toast spam during batch seeking, clearing outdated cards and logging clean seek milestones.
3. **Authentic In-Game Floating HUD & Tactical Radar Minimap**:
   - Added floating HUD top islands (`#replay-level-card`, `#replay-inventory-card`, `#replay-stats-card`) displaying level title, chapter, elevation, live timer, and step progress.
   - Connected inventory synchronization displaying collected keys with color, glow, and accessible geometric colorblind shape glyphs via `getKeyColorblindShape`.
   - Added camera perspective toggle (`#btn-replay-perspective`, <kbd>V</kbd>) and 90° rotation dial (`#btn-replay-rotate-left`, `#btn-replay-rotate-right`, `#replay-compass-badge`, <kbd>Q</kbd> / <kbd>R</kbd>).
   - Integrated `#replay-minimap-canvas` into `ReplayPlayer` via `GameLoop` options, with minimap toggle (`#btn-replay-minimap-toggle`, <kbd>M</kbd>) and minimize controls (`#btn-replay-minimap-min`).
4. **Media Play Menu Deck & Transport Suite**:
   - Engineered `#media-play-deck` with:
     - Scrubber timeline with current timestamp (`#media-time-current`), total duration (`#media-time-total`), and step pill (`#media-step-pill`).
     - Transport group: Restart (`⏮`, <kbd>Home</kbd>/<kbd>0</kbd>), Prev Step (`◀`, <kbd>ArrowLeft</kbd>), Hero Play/Pause (`▶ Play` / `⏸ Pause`, <kbd>Space</kbd>), Next Step (`Next ▶`, <kbd>ArrowRight</kbd>), and Jump to End (`⏭`, <kbd>End</kbd>).
     - Live action telemetry badge (`#media-action-pill`) showing coordinates and target elevations.
     - Playback speed selectors (`0.5x`, `1x`, `2x`, `4x`, `8x`).
     - Audio FX toggle (`🔊 Sound: ON` / `🔇 Sound: OFF`).
     - Continuous loop toggle (`🔁 Loop: ON` / `🔁 Loop: OFF`).
5. **Engine & Test Suite Enhancements**:
   - Extended `ReplayPlayer` in `js/engine/replay-player.js` with `resize()`, `jumpToEnd()`, `setLooping()`, `toggleLoop()`, `togglePerspective()`, `rotateLeft()`, `rotateRight()`, and `getLevelInfo()`.
   - Added unit tests in `tests/unit/engine/replay-player.test.mjs` and created `tests/unit/ui/replay-theater-and-feed.test.mjs`.

## Consequences

### Positive
- **Visual Immersion**: Replay and walkthrough analysis now provides the full visual quality and layout of the main game, scaling to any aspect ratio or ultrawide display.
- **Synchronized Telemetry**: Observers immediately see lore discoveries, door unlocks, switches, and elevation transitions in the live activity feed.
- **Convenient Transport**: Jumping to the end of a long walkthrough or looping continuously allows fast inspection of complex solutions.
- **Accessibility & Navigation**: Complete keyboard shortcuts (<kbd>Space</kbd>, <kbd>ArrowLeft</kbd>/<kbd>Right</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>V</kbd>, <kbd>Q</kbd>/<kbd>R</kbd>, <kbd>M</kbd>, <kbd>F</kbd>) make inspection rapid and natural.
- **Regression Guarded**: Comprehensive tests in `tests/unit/engine/replay-player.test.mjs` and `tests/unit/ui/replay-theater-and-feed.test.mjs` ensure zero regressions in CI.

### Negative / Trade-Offs
- Higher DOM and canvas rendering footprint on `test.html` compared to the prior minimalist 4:3 box, but completely static with zero server runtime and lazy-loaded assets.
