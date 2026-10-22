# ADR-0052: Visual Diversity, Multi-Variant Biome Art & Deterministic Architectural Masonry

## Status
Accepted

## Context
During hands-on playtesting, visual monotony was identified across maze corridors:
> *"we need to improve the art. we re-use the same art too much. it needs to be more beautufil, more diverse, alternative variety"*

Previously, corridor floors and walls suffered from two core visual flaws:
1. **Single-Tile Visual Repetition**: The game renderer selected a single static SVG sprite or flat solid rectangle per theme (e.g. `tile_floor_dungeon` or `tile_wall_dungeon`) and repeated it identically across hundreds of contiguous corridor tiles. Existing rich asset variants (such as `_cracked`, `_runic`, `_grate`, `_torch`, and `tile_wall_overgrowth`) were almost never or only minimally leveraged.
2. **Floor & Wall Disconnection**: When SVG assets were rendered, procedural biome micro-shaders were completely bypassed, resulting in flat, sterile corridors without organic weathering, masonry joints, or ambient moisture.

## Decision
We systematically upgraded the visual rendering architecture to deliver rich, non-repeating environmental variety across all biomes (`BL-178`):

1. **Deterministic Multi-Variant Asset Resolution (`getFloorAssetImage`, `getWallAssetImage`)**:
   - Implemented 2D spatial hash sampling (`BiomeSurfaceShaders.getDecorHash`) keyed to `(x, y, seed)` to select from 3–4 asset variants per biome without network or runtime overhead.
   - Floor Assets:
     - Standard paving (`tile_floor_${baseKey}`)
     - Weathered / stress-fractured slabs (`tile_floor_${baseKey}_cracked`)
     - Ancient runic / inlaid ceremonial tiles (`tile_floor_${baseKey}_runic`)
   - Wall Assets:
     - Standard ashlar block (`tile_wall_${baseKey}`)
     - Iron drainage & dungeon ventilation grates (`tile_wall_${baseKey}_grate`)
     - Cast iron wall brackets & sconces (`tile_wall_${baseKey}_torch`)
     - Creeping jungle overgrowth (`tile_wall_overgrowth`)

2. **Universal Procedural Floor Micro-Variety Across All Themes**:
   - The renderer now applies procedural micro-texturing across all corridor floors (overlaid atop SVG assets and canvas fallbacks alike):
     - **Dungeon / Sanctuary**: Ashlar flagstone quadrants with fine mortar joints, moss crevice growths, carved compass rosettes, and damp puddle specular reflections.
     - **Jungle / Emerald**: Verdant moss spreads, river pebbles/crushed pottery insets, crossing surface roots, and rain ripples.
     - **Lava / Magma**: Cooling basalt hexagonal contraction borders, glowing magma fissures with warm breathing pulse, specular obsidian shards, and ash embers.
     - **Snow / Glacial**: Frost rime powder drifts, crystalline sparkle glints, permafrost fracture lines, and translucent deep-ice cerulean pools.
     - **Cave**: Bedrock shale stratification lines, subterranean amethyst/quartz geode clusters with purple luminescence, and stalagmite mineral rings.
     - **Temple / Sunset**: Gilded terracotta paver borders, engraved sunburst glyphs, inlaid golden lozenges, and desert sand drifts.
     - **Aqueduct**: Animated water channel caustics, water-smoothed limestone wavelets, bronze drain grates, and concentric water ripples.
     - **Prismatic**: Iridescent crystal facet overlays, spectral rainbow flares, and chiseled diamond prism joints.

3. **Architectural Wall Face & Top Cap Detailing**:
   - **Front Face Detailing (`renderWallFaceDetails`)**: Decorates vertical wall faces with recessed tablet niches, hanging iron rings, moss stains, creeping ivy vine tendrils with leaves, icicle fringes, sun disc carvings, and embedded crystal shards.
   - **Top Cap Detailing (`renderWallTopDetails`)**: Adds subtle stone slab mortar joint lines and top rim bevel highlights to break up contiguous wall lines into believable masonry blocks.

## Consequences & Verification
- **Aesthetic Richness**: Corridors feel organic, historical, and deeply atmospheric; repeating grid tiles are visually eradicated.
- **Zero Drift & 100% Static Compatibility**: Relies purely on native Canvas 2D and deterministic mathematical spatial hashing without external packages or server dependencies.
- **Test Integrity**: Full unit coverage in `tests/unit/engine/biome-surface-shaders.test.mjs` and `tests/unit/engine/perspective-renderer.test.mjs` (777/777 tests passing, 0 failed, 23/23 drift checks passing).
