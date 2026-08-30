# 0004. Zone Grouping, Thematic Tilesets, and Directional Graphics

Date: 2026-08-30

## Status
Accepted

## Context
As the level count grew with the addition of the Tutorial Academy and campaign puzzles, players and level creators needed:
1. **Curated Progression Hierarchy**: Grouping levels into thematic, mechanically focused tiers (Tutorial Academy, Zone 1: Whispering Dungeon, Zone 2: Emerald Jungle, Zone 3: Molten Core, Zone 4: Glacial Expanse, Zone 5: Amethyst Caverns).
2. **Visual Variety & Thematic Tilesets**: Moving beyond a single monochrome palette by introducing authentic Canvas 2D thematic renderers (Dungeon stone, Jungle foliage, Molten lava, Glacial frost, Amethyst cavern, Sunset citadel).
3. **Directional Object & Structural Aesthetics**: Providing distinctive visual treatments for horizontal vs vertical gate bars, elevation bridge planking with drop shadows, ramp gradient chevrons, gemstone key bowheads, and explorer player avatars.
4. **Editor & Hub Integration**: Allowing level architects to select themes with live canvas rendering, and enabling players to browse and track progress per zone.

## Decision
1. **Constants & Themes Registry (`js/core/constants.js`)**:
   - Expanded `THEMES` with full visual token specifications (`bg`, `floor`, `floorAlt`, `floorGrid`, `wall`, `wallTop`, `wallDetail`, `bridgeGround`, `bridgeOverhead`, `bridgeRailing`, `ramp`, `rampArrow`, `portalOuter`, `portalInner`, `fogUnexplored`, `fogMemory`).
   - Added `ZONES` registry with named categories, titles, badges, default themes, and descriptions.
2. **Canvas 2D Rendering Enhancements (`js/engine/renderer.js` & `js/editor/editor-canvas.js`)**:
   - Enhanced ground layers with masonry brick lines, theme floor tinting, and shaded underpass corridors.
   - Enhanced overhead layers with multi-layer drop shadows, directional plank spacing, and dual side railings with support posts.
   - Enhanced ramp slopes with step shading and directional chevron arrows in theme accent colors.
   - Enhanced exit portals with dual counter-rotating glyph rings and a pulsating core.
   - Enhanced player avatars with directional explorer visors/headlamps, step motion bobbing, and levitation elevation rings.
3. **Canonical Zone Levels (`levels/`, `levels/manifest.json`, `js/levels/default-levels.js`)**:
   - Added Zone 2 (Jungle) Levels 6–8 and Zone 3 (Lava) Levels 9–10, all BFS reachability verified via `LevelValidator`.
   - Updated `manifest.json` to tag all 16 levels with their corresponding `zone`.
4. **Hub & Editor UI Integration (`index.html`, `editor.html`, `js/editor/editor-ui.js`)**:
   - Redesigned the Hub into dedicated Zone Showcases with Tier badges and star progress tracking per level.
   - Added 6 theme options with emoji indicators to the Editor Properties modal and wired real-time canvas previewing.

## Consequences
### Positive
* **Rich Visual Atmosphere**: Each zone possesses distinct visual identities without any heavy image assets or external downloads.
* **100% Static & Performant**: All rendering utilizes standard HTML5 Canvas 2D vector primitives, maintaining instant loading and 60 FPS performance on GitHub Pages.
* **Seamless Backward Compatibility**: Existing levels and custom JSON files load effortlessly with automatic default theme resolution.
* **Comprehensive Test Coverage**: Expanded test suite to 215 automated assertions.

### Negative / Trade-offs
* Canvas drawing pipelines require careful `ctx.save()` / `ctx.restore()` pairs to avoid transform state leaks.
