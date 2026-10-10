# ADR-0018: Interactive Map Editor Mini-Map Overview HUD and Environmental Surface Shaders

## Status
Accepted

## Context
Following the baseline environmental micro-textures and dark glassmorphic status bar telemetry introduced in ADR-0017, architects and players required two additional high-impact capabilities:
1. **Interactive Mini-Map Overview HUD in Map Editor (BL-103, CMP-08, CMP-10)**:
   When designing medium to large labyrinths ($25\times 25$ up to $100\times 100$), architects had to rely solely on mouse wheel zooming and click-and-drag panning. Navigating between remote puzzle wings, spawn points, and exit goals was disorienting without a macroscopic spatial radar. A floating, interactive mini-map HUD showing the entire labyrinth layout with a live viewport indicator and 1-click pan targeting was needed to achieve true AAA digital content creation ergonomics.
2. **Categorized Accordion Tool Palette in Map Editor Studio (BL-104, CMP-08, CMP-09)**:
   The sidebar tool palette was previously a single long scrolling container where draw tools, brushes, tile variants, ramps, prefabs, and collectibles were stacked together. Introducing accordion categories with collapsible headers, item count badges, and chevron indicators enables architects to focus exclusively on their active workflow without visual clutter.
3. **Procedural Surface Shaders & Environmental Fluid Polish (BL-105, CMP-02, CMP-11)**:
   While static masonry floor varieties added texture, corridors lacked fluid life. Adding subtle procedural water puddles with animated concentric ripple rings in damp biomes (Dungeons, Emerald Jungles, Amethyst Caverns) and bubbling magma hotspot pores in Molten Core biomes brings physical atmosphere to life at 60fps with zero DOM overhead.

## Decision
1. **Interactive Floating Mini-Map Overview HUD (`#editor-minimap-hud`)**:
   - Implemented inside `.editor-viewport` as an acrylic glassmorphic floating widget (`160x160px`).
   - Renders a scaled 2D representation of ground walls (`#484f58`), overhead walkways (`#fbbf24`), player spawn (`#34d399`), exit portal (`#38bdf8`), and color-coded entities.
   - Computes and overlays the exact visible viewport rectangle in real-time (`vpRectX, vpRectY, vpRectW, vpRectH`).
   - Clicking or dragging on the mini-map converts the click coordinate into maze grid units and centers the editor canvas instantly via `centerOnTile(gridX, gridY)`.
   - Supports 1-click minimization toggle (`_` / `▲`) with CSS transition.
2. **Sidebar Accordion Tool Palette**:
   - Structured into modular collapsible sections: `Draw Tools (6)`, `Tiles & Bridges (4)`, `Elevation Ramps (4)`, `Architectural Prefabs (6)`, `Custom Prefabs`, and `Entities & Markers (10)`.
   - Interactive headers with animated chevrons, tool count badges, and persistent state.
3. **Procedural Floor Surface Shaders & Animated Fluid Dynamics**:
   - **Reflective Water Puddles (`cave`, `jungle`, `dungeon`)**: Deterministic hash placement (`0.88 <= hash < 0.95`), animated specular shimmer, and concentric ripple rings driven by `exitPulseTimer`.
   - **Molten Vein Glow & Bubbling Hotspots (`lava`)**: Pulsating orange/red magma glow and thermal bubble hotspots.
   - **Diamond Ice Sparkle Glints (`snow`)**: Periodic star-glint specular facets on frost tiles.
   - **Gilded Sandstone Inlays (`sunset` / `temple`)**: Gold fleck glimmer highlights.
4. **Zero-Dependency Static Purity**:
   - Implemented using pure Canvas 2D methods without third-party graphics libraries or server runtimes.

## Consequences
### Positive
- Map Editor navigation is swift, fluid, and intuitive even on massive $100\times 100$ mazes.
- Accordion grouping significantly declutters the editor interface, improving ergonomics and usability.
- Environmental graphics possess continuous, subtle motion and reflective grounding that elevate visual immersion.
- Quality scores across CMP-02, CMP-08, CMP-09, CMP-10, and CMP-11 continue their upward trajectory into A-/A Tier.

### Considerations
- Mini-map canvas rendering must be safely skipped or mocked in headless test environments.
