# ADR-0022: Architect View Menu Streamlining, Minimap De-cluttering & 2D/2.5D Perspective Switching

## Status
Accepted

## Date
2026-10-10

## Context & Problem Statement
In the level authoring studio ("Maze Architect" / `editor.html`), several layout and UX pain points caused menus and controls to clutter and overlap:
1. **Viewport HUD Collision**: The floating interactive Mini-Map Radar overview (`#editor-minimap-hud`) and the viewport zoom overlay controls (`.viewport-overlay-controls`) were anchored to the exact same bottom-right screen coordinates (`bottom: 1.25rem; right: 1.25rem` vs `bottom: 1rem; right: 1rem`). When the mini-map was open, it completely covered the zoom and fit buttons, creating visual chaos and preventing user interaction.
2. **Left Sidebar Asset Clutter & Readability**:
   - The left asset sidebar (`.editor-sidebar`) had six accordion sections, all expanded simultaneously by default (`class="sidebar-accordion active"`), creating an endless vertical scroll of dark, low-contrast buttons.
   - The `.color-palette-subgrid` was constrained to 5 cramped columns in a 300px sidebar (~50px per item). Long labels like "Amethyst", "Sapphire", "Chalice", "Falcon", and "Serpent" were microscopic (`0.65rem`), truncated, or clipped.
   - Riddle Relics (6 items) in a 5-column grid left a single orphan item hanging on a second row.
   - There was no search or category filtering, requiring architects to scroll back and forth to find entities or prefabs.
3. **Missing Perspective Toggle**: The editor only rendered in flat 2D blueprint drafting mode. Architects had no way to preview or author labyrinths in the game's actual 2.5D isometric/oblique perspective without launching the full playtest runner.

The user requested:
> *"in archtiect view menus are hard to read and clutter over eachother. especially the bar on the left with all the assets. but the minimap also, and there should be a way to switch from 2 to 2.5 view"*

## Decision
1. **Zero Viewport Collisions & Minimap Integration (BL-110)**:
   - Re-anchored `.viewport-overlay-controls` directly above the mini-map (`bottom: calc(160px + 3.2rem); right: 1rem;`).
   - Added an automatic smooth CSS sibling transition (`.editor-minimap-hud.minimized + .viewport-overlay-controls { bottom: 3.4rem; }`) so the controls glide into the bottom corner when the mini-map is minimized.
   - Improved the mini-map toggle button with clear `−` (collapse) and `▲` (expand) indicators and descriptive tooltips.
2. **Left Sidebar Category Navigation & Real-Time Filter**:
   - Widened the sidebar from 300px to 320px for comfortable breathing room.
   - Added a category pill navigation bar at the top of the sidebar:
     `[ All ] [ 🛠️ Tools ] [ 🧱 Tiles ] [ 🏛️ Prefabs ] [ 📦 Entities ]`
   - Added a real-time live search filter (`#sidebar-asset-search`) with instant clear button (`#btn-clear-asset-search`) that matches button names, data attributes, titles, and item types across all accordions in real time.
   - Updated default accordion states: essential tool and tile palettes remain open, while elevation ramps, prefabs, and entities start neatly collapsed, reducing initial vertical height by $>60\%$.
   - Redesigned `.color-palette-subgrid` to a clean 3-column layout (`repeat(3, 1fr)`) with comfortable button heights (34px), readable fonts (0.74rem), and crisp labels. Riddle Relics now render in 2 clean, balanced rows of 3 items.
3. **2D Blueprint / 2.5D Angled Perspective Switching in Architect Studio**:
   - Implemented `setPerspective(mode)`, `togglePerspective()`, and `getPerspective()` in `EditorCanvas`.
   - In 2.5D mode (`perspective === '2.5d'`):
     - Walls are rendered with 3D front faces (`wallH = Math.round(effTile * 0.38)`), top caps, masonry lines, bevels, and ground cast shadows on south-adjacent open tiles.
     - Overhead bridges and walkways render with vertical lift, ground underpass shadows, and 3D railing posts.
     - Spawn, test spawn, exit portals, keys, doors, and relics cast soft elliptical ground contact shadows (`rgba(0, 0, 0, 0.32)`).
     - Subtle blueprint grid lines remain visible for precise tile placement.
   - In 2D mode (`perspective === '2d'`):
     - Renders crisp CAD technical drafting schematic mode.
   - Added perspective toggle buttons in both `.viewport-overlay-controls` (`#btn-perspective`) and `#editor-layer-hud` (`#btn-hud-perspective`).
   - Bound keyboard shortcut `<kbd>3</kbd>` for instant perspective toggling.
   - Status bar telemetry displays active mode: `📐 Mode: 2D Blueprint` vs `📐 Mode: 2.5D Angled`.

## Consequences
### Positive
- **Zero UI Collisions**: Viewport zoom controls and the radar mini-map no longer collide or occlude each other on any viewport.
- **Superior Authoring Ergonomics**: Finding assets via category pills or real-time search takes seconds, eliminating endless vertical scrolling.
- **In-Editor Visual Parity**: Architects can now design, inspect, and evaluate labyrinths directly in 2.5D with authentic height extrusion and shadow casting, matching the core player experience.

### Negative / Trade-offs
- In 2.5D mode, south-facing wall drop faces extend beyond tile boundaries, which is visually authentic to the gameplay renderer but required ensuring hover and selection highlights remain tied to the underlying grid coordinates.
