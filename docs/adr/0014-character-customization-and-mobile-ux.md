# 0014. Character Visual Customization, Replay Theater Graphics, and Mobile UX Polish

Date: 2026-10-10

## Status
Accepted

## Context
1. **Player Profile Visual Character Customization (BL-95)**:
   - Players could select from 7 outfit palettes (`EXPLORER_OUTFITS`), but the explorer sprite was strictly hardcoded to a short-hair male presentation with fixed bangs, no gender/body-type toggle (male, female, neutral), no hair style variations (ponytail, curls, bob, bald), and no custom hair color or skin tone picker.
   - Players requested character visual customization including male/female options and stylistic options directly inside the Player Profile modal.
2. **Replay & Walkthrough In-Game Graphics Fidelity (BL-96)**:
   - When inspecting replays or computing solver walkthroughs in `test.html`, `ReplayPlayer` used hardcoded `32` coordinate increments (`action.to.x * 32 + 16`) instead of `this.gameLoop.tileSize` (default 36px), causing player coordinate misalignment from tile grid and camera bounds.
   - In addition, vector SVG assets were not preloaded in `test.html`, resulting in primitive canvas fallbacks rather than the rich visual fidelity seen in the main maze engine.
3. **Mobile Feed Accessibility, Download Feedback, and Button Verification (BL-97)**:
   - On small screens and mobile viewports, `.game-activity-feed` docked at `bottom: 0.5rem; left: 0.5rem;`, directly overlapping or being occluded by `.virtual-controls`. In addition, when the HUD was collapsed, there was no quick mobile pill to inspect the feed.
   - When actions triggered a file download (save backups, walkthrough exports, debug logs), mobile browsers downloaded files quietly without communicating where the file was saved or that the action succeeded.
   - Various interactive buttons across desktop and mobile required audit and verification to ensure seamless event listening and tactile feedback.

## Decision
1. **Domain Constants & Customization Architecture (`BL-95`)**:
   - Introduce `CHARACTER_CUSTOMIZATION` constants in `js/core/constants.js`:
     - `GENDER`: `MALE`, `FEMALE`, `NEUTRAL`.
     - `HAIR_STYLES`: `SHORT`, `PONYTAIL`, `CURLS`, `BOB`, `BALD`.
     - `HAIR_COLORS`: `#78350f` (Brunette), `#1c1917` (Raven), `#d97706` (Blonde), `#b91c1c` (Auburn), `#e2e8f0` (Silver), `#a855f7` (Amethyst).
     - `SKIN_TONES`: `#fed7aa` (Fair), `#fcd34d` (Warm), `#d97706` (Olive), `#854d0e` (Bronze), `#451a03` (Deep).
   - Add `StorageManager.getPlayerCustomization()` and `StorageManager.setPlayerCustomization(data)`.
   - Update `Player.prototype.drawExplorerSprite` and `renderTopDownExplorer` to dynamically render selected gender silhouettes, hair styles, hair colors, and skin tones.
   - Update `ProfileModal` to render an interactive "Character Appearance" section with live avatar preview canvas and controls for gender, hair style, hair color, and skin tone.
2. **Replay Theater Tile Alignment & Vector Preloading (`BL-96`)**:
   - Update `ReplayPlayer._executeAction` to compute world coordinates using `this.gameLoop.tileSize`:
     `this.gameLoop.player.worldX = action.to.x * ts + ts / 2;`
     `this.gameLoop.player.worldY = action.to.y * ts + ts / 2;`
   - In `test.html`, preload the asset manifest (`assets/manifest.json`) and level theme before starting replay or walkthrough playback.
3. **Mobile Feed Docking & Download Notice Clarity (`BL-97`)**:
   - In `css/game.css`, adjust mobile feed positioning to `bottom: 5.5rem; left: 0.5rem;` so it floats safely above touch controls.
   - Add `#hud-feed-pill` to the collapsed HUD island, allowing players to open the feed drawer with a single tap.
   - Implement `showDownloadNotice(filename, description)` providing clear feedback that a file has been saved to the device's Downloads directory.
   - Audit and verify all menu buttons, settings controls, and options across all pages.

## Consequences
### Positive
* Players can customize their explorer character (gender, hair style, hair color, skin tone) and see their choices reflected in real-time in both top-down and 2.5D modes.
* Replays and solver walkthroughs render with complete vector graphics, proper camera centering, and pixel-perfect coordinate alignment.
* Mobile players can easily view and toggle the activity feed without layout clashes.
* File exports provide reassuring feedback on mobile devices.

### Negative / Trade-offs
* Additional hair rendering geometry adds minor draw calls per frame, mitigated by lightweight path drawing.
