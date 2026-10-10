# ADR-0017: Environmental Visual Fidelity Engine and AAA Map Editor Studio Overhaul

## Status
Accepted

## Context
Player feedback and design evaluations highlighted two major areas requiring significant visual and ergonomic elevation:
1. **In-Game Visual Fidelity (BL-101, CMP-02, CMP-11)**:
   While the 2.5D rendering pipeline successfully solved depth sorting (`BL-33`), camera rotation (`BL-43`), and high contrast contours (`BL-26`), floor corridors and walls remained relatively uniform. The world needed rich environmental textures, fine masonry details, animated wall torch sconces casting ambient warmth, corridor pebble/moss details, and corner ambient occlusion to look and feel like a modern indie adventure (such as *The Witness*, *Tunic*, or *Death's Door*).
2. **AAA Map Editor Studio Experience (BL-102, CMP-08, CMP-09, CMP-10)**:
   The Map Editor UI (`editor.html`, `css/editor.css`) functioned adequately for basic tile stamping, but lacked the sleek, organized aesthetics and ergonomics expected of a professional, AAA-grade web tool (e.g. Figma or Unreal Engine tile editors). The palette was a flat column of buttons, lacking collapsible categories, visual tooltips, an interactive mini-map overview HUD, or a rich status bar displaying grid dimensions and entity counts.

## Decision
1. **Procedural Environmental Fidelity Engine (`js/engine/renderer.js`)**:
   - Introduce procedural floor micro-textures based on deterministic tile hash algorithms (`getDecorHash(x, y, seed)`):
     - **Dungeon**: Flagstone pavers with mortar bevels, worn cobble accents, iron drain grates, and edge stone trims.
     - **Jungle**: Overgrown flagstones with moss fringes, fallen leaf specks, and cracked stone creeping vines.
     - **Magma / Lava**: Basalt slabs with glowing molten seams, obsidian shards, and scorched floor cracks.
     - **Glacial / Snow**: Frost-rimmed flagstones, crystalline ice patches, and drifting snow drifts.
     - **Caverns / Cave**: Uneven subterranean stone pavers with sparkling mineral geodes and moisture sheens.
     - **Sunset / Temple**: Polished sandstone tiles with decorative geometric borders and golden inlay flecks.
   - Introduce **Dynamic Animated Wall Torches / Sconces**:
     - Deterministically placed on select wall drop faces adjacent to walkable pathways (`hash < 0.22`).
     - Animated flame flickering with dual-tone radial light halos (`torchFlickerTimer`), throwing warm atmospheric orange-gold ambient glow into corridors.
   - Implement **Corner Ambient Occlusion & Edge Shadows**:
     - Soft darkening along wall edges and inside corridor corners where walls meet floors, providing authentic depth and spatial grounding.
2. **AAA Map Editor Studio Redesign (`editor.html`, `css/editor.css`, `js/editor/editor-ui.js`)**:
   - **Glassmorphic Studio Aesthetic**: Dark high-contrast palette, sleek acrylic headers, subtle border glows, and crisp typography (`Plus Jakarta Sans` + `JetBrains Mono`).
   - **Accordion Tool Palette**: Clean grouped sections with collapsible headers, item count badges, and clear tool type indicators (`Tools`, `Tiles & Bridges`, `Ramps & Elevation`, `Architectural Prefabs`, `Entities & Collectibles`).
   - **Interactive Canvas Mini-Map HUD (`#editor-minimap-hud`)**: Floating overview thumbnail in bottom-right corner showing current viewport bounds, quick-pan click targeting, and entity indicators.
   - **Live Telemetry Status Bar (`#editor-status-bar`)**: Real-time cursor coordinates, active layer indicator with color pip, map dimensions ($W \times H$), total entity count, and instant solvability verification badge.
3. **Pure Static Zero-Dependency Compatibility**:
   - All visual additions use pure Canvas 2D methods (`arc`, `createRadialGradient`, `fillRect`, `strokeRect`) and native CSS without external web dependencies.

## Consequences
### Positive
- Vastly richer, more immersive visual experience for players with zero runtime overhead or external asset dependencies.
- Map Editor feels like a modern commercial game-engine studio suite, encouraging creative map creation and sharing.
- Component quality scores for CMP-02 (2.5D Canvas Rendering), CMP-08 (Map Editor Canvas), CMP-09 (Editor History & Prefabs), and CMP-11 (Asset Pipeline) significantly elevated.
- Fully backwards compatible with all existing campaign levels and custom saves.

### Considerations
- Headless unit tests for `GameRenderer` mock canvas contexts must maintain safe guard checks for gradient and path methods.
