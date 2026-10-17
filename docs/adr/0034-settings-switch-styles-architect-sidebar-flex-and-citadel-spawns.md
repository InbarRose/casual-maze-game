# ADR-0034: Settings Switch Styling, Architect Sidebar Flex Stabilization & Whispering Citadel Gating

## Status
Accepted

## Date
2026-10-17

## Context
User defect feedback and GitHub issues (#89, #90, #91) reported three distinct frontend and level design regressions:
1. **GitHub Issue #91 (Broken Settings Menu)**:
   - Toggle switch controls (`#setting-smooth-rotation`, `#setting-high-contrast`, `#setting-hotkeys-toggle`) in the Settings modal lacked complete CSS definitions in `css/main.css`. Without `.slider::before` and `.switch input:checked + .slider`, toggles rendered as non-functional dark shapes without sliding thumbs or active accent indicators.
   - Form dropdown inputs used `font-family: var(--font-mono)`, causing abnormally wide monospaced options (`2.5D   Angled   View`).
   - Outdated rotation shortcut references (`[Q/E]` and `[Q/R]`) remained in help text despite rotation being standardized to `[Q/C]` to prevent conflict with browser reload shortcuts.

2. **GitHub Issue #90 (Broken Architect Mode Sidebar View)**:
   - In constrained viewports or smaller displays, the left sidebar `.editor-sidebar` crushed its flex children (`.sidebar-category-nav`, `.palette-grid`, accordions) into thin 2–3px collapsed ribbons because child elements defaulted to `flex-shrink: 1` and the sidebar lacked `min-height: 0` inside the grid layout.
   - Sidebar tools and tiles became completely unclickable and invisible.

3. **GitHub Issue #89 (Whispering Citadel Teleport Loop & Zero Challenge)**:
   - In multi-room campaign story level "The Whispering Citadel" (`story_citadel_1`), room exit stairs specified `targetSpawn` coordinates that were identical to the return exit portal coordinates in the destination room (`exit_courtyard_to_catacombs` targeted `(1, 1)` where `exit_catacombs_to_courtyard` was placed; `exit_courtyard_to_spire` targeted `(1, 1)` where `exit_spire_to_courtyard` was placed). Players stepping into a room were immediately placed on the return exit, creating an infinite bouncing teleport ping-pong loop.
   - In the Whispering Spire room, the ground level lacked physical barriers between the north and south halves, allowing players to walk straight across to the victory portal on the ground, bypassing the 3D elevated bridge puzzle entirely.
   - When approaching locked gates, missing cross-room entity resolution resulted in generic `"🔒 Needs Matching Key"` floating feedback instead of identifying `"🔒 Needs Spire Keystone"`.

## Decision
1. **Toggle Switch Component & Form Typography (Issue #91)**:
   - Defined modern, responsive `.switch`, `.switch input`, `.switch .slider`, `.switch .slider::before`, and `.switch input:checked + .slider` styling in `css/main.css` with 16px circular thumb animation and glowing accent fill (`var(--accent, #38bdf8)`).
   - Removed conflicting inline `background-color` overrides from `js/ui/settings-modal.js`.
   - Updated `.input-field, .select-field` in `css/main.css` to use clean `font-family: inherit` instead of monospaced fonts.
   - Synchronized all rotation shortcut hints across `js/ui/settings-modal.js` and `js/ui/app-header.js` to `[Q/C]`.

2. **Architect Sidebar Flexbox Stabilization (Issue #90)**:
   - Updated `.editor-sidebar` in `css/editor.css` to enforce `min-height: 0`, `overflow-y: auto`, and `overflow-x: hidden`.
   - Enforced `.editor-sidebar > * { flex-shrink: 0; }` so categories, tool palettes, theme selectors, and accordions maintain their intended dimensions regardless of screen height.
   - Added `data-drag-scroll="y"` to aside `.editor-sidebar` in `editor.html` for smooth vertical click-and-drag and touch panning.

3. **Whispering Citadel Spawn Decoupling & Engine Guard (Issue #89)**:
   - Decoupled `targetSpawn` from exit tiles across all three rooms:
     - `courtyard -> catacombs` targets walkable platform `(1, 2)`.
     - `catacombs -> courtyard` targets landing platform `(1, 10)`.
     - `courtyard -> high_spire` targets walkable platform `(1, 2)`.
     - `high_spire -> courtyard` targets doorway `(11, 10)`.
   - Added an architectural safeguard to `GameLoop` (`this.lastRoomSpawn`): upon room initialization, the arrival coordinate is recorded, and the engine suppresses exit trigger re-activation until the player moves off the spawn tile.
   - Divided the ground layer of `high_spire` at row 6 with chasm/wall tiles and boundary guards at `(2, 7)` and `(10, 5)`. The only pathway to cross from north to south is climbing `RAMP_E` at `(3, 6)`, crossing the elevated `BRIDGE_EW` at elevation 1, and descending `RAMP_W` at `(9, 6)`.
   - Enhanced locked door floating feedback to query `level.rooms` definitions, displaying the true key name (e.g. `"🔒 Needs Spire Keystone"`) when the key entity resides in another room.

## Consequences

### Positive
- Settings switches now render beautiful animated toggles with clear visual feedback for checked states across all browsers.
- Architect Mode sidebar retains its full height and button usability on any display size without compression.
- Whispering Citadel operates smoothly with zero spawn ping-pong loops, requiring the player to retrieve the Spire Keystone in the Catacombs, unlock the courtyard barrier, and traverse the elevated mountain bridge to reach the Apex Altar.
- The engine-level `lastRoomSpawn` guard permanently protects all future multi-room dungeons from instant teleport recursion even if designer coordinates inadvertently overlap.

### Negative
- High Spire ground traversal is strictly blocked across the central chasm, preventing accidental backward shortcutting and requiring intentional bridge ascension.
