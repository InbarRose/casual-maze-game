# ADR-0064: Visual Noise Reduction & Non-Functional Art Demarcation

## Status
Accepted

## Date
2026-10-24

## Context & Problem Statement
Following the visual variety update (ADR-0052, BL-178), playtesters reported excessive visual clutter in dungeon corridors:
1. **Misleading Functional Floor Runes**: Vector asset variations `tile_floor_*_runic.svg` rendered bright neon cyan/gold glowing circles, concentric dashed rings, hexagrams, and central bright nodes. In dark labyrinth corridors, players repeatedly mistook these purely decorative background tiles for interactive teleporters, spell traps, or ritual circles.
2. **Excessive Procedural Frequency**:
   - `getFloorAssetImage()` selected runic tiles for `h > 0.88` (12% of all corridor floor tiles) and cracked tiles for `h > 0.68` (20%), leaving only 68% of floor tiles plain.
   - `getWallAssetImage()` spawned wall sconce torches on 14% of wall tiles (`h > 0.86`) and grates on 14% (`h > 0.72`), cluttering 42% of wall faces.
3. **Overbearing Animated Procedural Shaders**:
   - `BiomeSurfaceShaders.renderFloorDetails()` drew high-contrast procedural overlays on 65%+ of tiles, including glowing pulsating lava fissures, purple pulsing amethyst clusters, and flashing caustics. This overwhelmed players and obscured subtle puzzle clues.

## Decision
1. **Non-Functional Decorative Art Demarcation (SVG Asset Overhaul)**:
   - Redesigned all five biome runic floor assets (`floor_dungeon_runic.svg`, `floor_glacial_runic.svg`, `floor_jungle_runic.svg`, `floor_magma_runic.svg`, `floor_temple_runic.svg`).
   - Removed glowing neon saturated strokes (`#38bdf8`, `#fbbf24`), dashed orbital lines, and glowing central dots.
   - Replaced with subtle, debossed masonry relief engravings with soft dual-tone shadow lines (`rgba(0, 0, 0, 0.35)` and `rgba(255, 255, 255, 0.16)`).
   - The tiles are unmistakably aged stone floor engravings, eliminating any resemblance to active gameplay triggers.
2. **Frequency Reduction & Procedural Gating**:
   - In `getFloorAssetImage()`: Elevated `_runic` threshold to `h > 0.96` (~4% of tiles) and `_cracked` to `h > 0.88` (~8% of tiles). Standard serene base floor tiles now constitute 88% of corridor space.
   - In `getWallAssetImage()`: Elevated torch sconce threshold to `h > 0.94` (~6%) and grates to `h > 0.90` (~4%).
3. **Master Decor Gate in Procedural Shaders (`BiomeSurfaceShaders`)**:
   - Added master decor gate at the entrance of `renderFloorDetails()`:
     `const decorGate = this.getDecorHash(x, y, seed + 997); if (decorGate > 0.08) return;`
   - Stripped animated high-alpha `Math.sin()` pulsing strokes across all biomes, replacing them with subtle, static, low-contrast masonry textures (`rgba(0, 0, 0, 0.12)`).
   - Removed dead-zone gaps in variant selection so the sparse 8% of decorated tiles receive cohesive, gentle ambient textures.

## Consequences & Verification
- Corridors are clean, serene, and atmospheric ("sparse but present, novel and interesting, not bland, never overbearing").
- Floor art is clearly separated from interactive puzzle entities (e.g. puzzle gates, pedestals, levers, teleporters).
- Cryptographic asset manifests (`assets/manifest.json`) updated and verified with SHA-256 hashes.
- 23/23 drift checks passed (`npm run validate:drift`).
- 787/787 automated unit and E2E tests pass (`npm test`).
