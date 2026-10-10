# Architecture Decision Records (ADRs)

This directory contains records for significant architectural decisions made for the **Casual Maze Game**.

## Format
Each record uses the following template:

```markdown
# [Number]. [Title]

Date: YYYY-MM-DD

## Status
[Proposed | Accepted | Superseded | Deprecated]

## Context
What is the problem or architectural consideration being addressed?

## Decision
What is the change or solution being adopted?

## Consequences
### Positive
* ...

### Negative / Trade-offs
* ...
```

* [0001: Static Canvas 2D Engine with ES6 Modules](0001-static-canvas-modular-engine.md) — Pure client-side static hosting on GitHub Pages.
* [0002: Two-Layer Elevation and Directional Bridges](0002-multi-elevation-bridge-system.md) — 2D elevation coordinate and bridge crossing model.
* [0003: Tutorial Academy, In-Game Hint System, and Level Design Toggles](0003-tutorial-system-and-level-toggles.md) — Progressive tutorial system, contextual hints, fog memory mode, and multi-color keys.
* [0004: Zone Grouping, Thematic Tilesets, and Directional Graphics](0004-zone-grouping-and-thematic-tilesets.md) — Zone progression hierarchy, 6 visual tilesets, and enhanced directional entity graphics.
* [0005: Angled Top-Down (2.5D) Perspective and Dynamic Activities](0005-angled-topdown-perspective-and-dynamic-activities.md) — Dual-plane 2.5D canvas rendering, Y-depth sorting, teleporters, timed hazards, patrollers, and puzzle minigames.
* [0006: Camera World Rotation, Branching Levels, and Multi-Room Dungeons](0006-camera-world-rotation-branching-rooms.md) — 90° camera world rotation, screen-relative navigation, multi-exit branching routes, and persistent multi-room dungeon state.
* [0007: SOLID Coding Principles, Graceful Object-Oriented Design, and Code Elegance Standards](0007-solid-principles-and-code-elegance.md) — SRP file budgets, BaseEntity polymorphism, early return guard clauses, and value object immutability.
* [0008: Lever Manual Interaction Separation and Floor-Plate Trap Mechanics](0008-lever-interaction-separation-and-floor-plate-traps.md) — Separation of deliberate switch engagement from step arrival, and introduction of single-fire spring traps.
* [0009: Translucent Disambiguation and Two-Stage Interaction Reveal](0009-translucent-disambiguation-and-two-stage-reveal.md) — Semi-translucent glass indicators and two-stage [E] reveal preventing avatar occlusion.
* [0010: Responsive HUD Collapse, Mobile Clutter Elimination, and Obscured Menu Auto-Pause](0010-responsive-hud-collapse-and-menu-auto-pause.md) — 1-tap collapsible HUD pills, non-overlapping mobile layouts, and engine auto-pausing when view is obscured.
* [0011: Strategic Fog of War Expansion and Exploratory Vision Dynamics](0011-strategic-fog-of-war-expansion.md) — Atmospheric Fog of War expansion across climatic chapter finales with 360-degree raycasting and dynamic torch lighting.
* [0012: Macro-Labyrinth Expansion and Classical Maze Topologies](0012-macro-labyrinth-and-classical-maze-topologies.md) — 27x27 multi-wing macro-labyrinth design with concentric rings, pillared chambers, and puzzle gating without discarding existing levels.
* [0013: Viewport Zoom Isolation and Interactive Action Feed History](0013-viewport-zoom-isolation-and-feed-history.md) — Viewport zoom upper/lower bounds clamping, UI menu decoupling, in-world indicator optical scaling, and interactive action feed history.
* [0014: Character Visual Customization, Replay Theater Graphics, and Mobile UX Polish](0014-character-customization-and-mobile-ux.md) — Explorer gender/hair/skin customization, replay coordinate alignment, SVG asset preloading, and mobile feed docking.
* [0015: Mobile Footer Shortcuts Drawer and Colorblind Inventory Glyphs](0015-mobile-shortcuts-drawer-and-colorblind-inventory-glyphs.md) — Expandable footer cheatsheet drawer on small viewports and geometric shape badges on held inventory keys.
* [0016: Keybinding Schemes and Pointer Click-to-Move vs Drag Navigation Toggle](0016-keybinding-options-and-mouse-movement-toggle.md) — Configurable keyboard movement presets (WASD, Arrows, ESDF, AZERTY, Numpad) and pointer navigation toggle (Click-to-Move pathfinding, Drag-only, or Disabled).
* [0017: Environmental Visual Fidelity Engine and AAA Map Editor Studio Overhaul](0017-visual-fidelity-and-aaa-editor-studio-overhaul.md) — Procedural floor masonry textures, animated wall torch sconces with warm radial light flares, corner ambient occlusion, and professional dark glassmorphic Map Editor studio suite.
* [0018: Interactive Map Editor Mini-Map Overview HUD and Environmental Surface Shaders](0018-editor-minimap-hud-and-environmental-surface-shaders.md) — Floating radar mini-map overview with viewport indicator, accordion tool palette cards, and reflective puddle ripple / molten bubbling shaders.
* [0019: In-Game Pause Menu Drawer Categorization and Segmented Settings Navigation](0019-settings-and-overlay-consolidation.md) — Responsive 2-column pause command center and categorized tabbed navigation in settings modal.
* [0020: Replay Theater In-Game Graphics Parity and Minimap Isolation](0020-replay-graphics-parity-and-minimap-isolation.md) — Eradication of canvas resolution corruption, PiP mini radar HUD, perspective switching, and theme asset preload re-render.
* [0021: Level Victory Screen Streamlining and Collapsible More Drawer](0021-victory-screen-streamlining-and-collapsible-drawer.md) — Elimination of victory button clutter, single-row primary action bar, 1-tap quick icons, collapsible 6-action utility drawer, and compact metric typography.
* [0022: Architect View Menu Streamlining, Minimap De-cluttering & 2D/2.5D Perspective Switching](0022-architect-view-streamlining-and-perspective-switching.md) — Elimination of viewport HUD/minimap collisions, left asset sidebar category pills & real-time search, 3-column subgrids, and live 2D/2.5D perspective switching in level editor.

