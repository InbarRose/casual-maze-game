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
* [0023: Universal Menu Navigation, Modal Stacking Isolation, and Comprehensive Menu Test Suite](0023-universal-menu-navigation-modal-stacking-and-test-suite.md) — Modal backdrop .active class lifecycle, home hero settings trigger, editor modal namespace isolation, z-index stacking hierarchy, and automated test suite.
* [0024: Walkthrough Replay Fullscreen Grand Theater & Synchronized Action Activity Feed](0024-walkthrough-replay-fullscreen-theater-and-activity-feed.md) — Expansive responsive viewport, synchronized real-time action activity feed, floating HUD islands, tactical radar minimap, and comprehensive media play menu deck.
* [0025: Platform Component Audit Test Coverage, Subsystem Quality Scoring & Thematic Asset Unification](0025-component-coverage-scoring-and-thematic-asset-unification.md) — Dedicated component test suites (CMP-01 to CMP-19), 6-chair scoring registers, and canonical biome family asset unification.
* [0026: Resilient Level Loader Strategy, Fallback Watchdog, and Headless Browser CI Gating](0026-resilient-level-loader-and-headless-browser-ci.md) — Chapter routing optimization, fetch abort timeouts, file:// protocol detection dialog, loading watchdog recovery, and zero-dependency headless browser CI testing.
* [0027: Universal Settings and Player Profile Accessibility, Stacked Modal Resilience, and Continuous Version Incrementing](0027-universal-settings-profile-access-and-versioning.md) — Player entity avatar preview sprite alias, direct in-game HUD triggers, architect toolbar buttons, stacked modal scroll lock resilience, and automatic version incrementing.
* [0028: Discrete Stepped Viewport Zoom, Mobile Touch Navigation Modes, Top Activity Feed Docking & Streamlined Command HUD](0028-discrete-step-zoom-mobile-controls-and-hud-streamlining.md) — Discrete integer/half-integer zoom ladder, Replay Theatre character facing/cadence parity, mobile tap-to-move BFS vs hold-to-steer toggle, draggable top mobile activity feed, and wrap-proof HUD clustering.
* [0029: UI Overlay Conflict Detection, Visibility Coordinator & Firm Top Navigation Bar](0029-overlay-conflict-detection-and-firm-top-bar.md) — Priority-based overlay coordinator, automated modal suppression, mobile mutual exclusion between radar minimap and activity feed, firm top navigation bar, and spatial collision resolution.
* [0030: Preset Avatar Archetypes, Universal Top Bar, Overlay Menu Toggles & Minimal Mode Exit](0030-preset-avatar-archetypes-universal-topbar-and-minimal-exit.md) — 8 preset fantasy avatar archetypes, curated primary/secondary color palette, universal top navigation bar layout, glowing canvas render frame border, mobile safe area bottom buffer, pause menu overlay toggles, and floating minimal exit button.
* [0031: Compact Minimal Top Bar, Single-Button Menus & Toggleable HUD Overlays](0031-compact-minimal-topbar-and-single-button-menus.md) — Elimination of menu bloat via single-button dropdown triggers, standardized 42px top bar height, streamlined dialogs/feeds, and dismissable/toggleable controls hint bar.
* [0032: Non-Persistent Viewport Zoom, Mobile Virtual Controls More Drawer & Browser-Safe Hotkeys](0032-non-persistent-zoom-mobile-more-drawer-browser-safe-hotkeys.md) — Default 1.0x non-persistent zoom lifecycle, in-menu zoom widget, mobile 4-direction + USE + More drawer, and browser-safe hotkey pruning.
* [0033: Universal Click-and-Drag Menu Scrolling, Vertical Main Menu Scroll & Dynamic Size Detection](0033-click-and-drag-menu-scroll-and-dynamic-size-detection.md) — Universal mouse & touch drag-to-scroll, grab cursor states, vertical pause menu scrolling, ResizeObserver container monitoring, and dynamic pagination / overflow cues.
* [0034: Settings Switch Styling, Architect Sidebar Flex Stabilization & Whispering Citadel Gating](0034-settings-switch-styles-architect-sidebar-flex-and-citadel-spawns.md) — Complete toggle switch CSS component, inherited dropdown font, Q/C camera rotation labels, uncollapsible Architect sidebar flex-shrink rules, Whispering Citadel spawn decoupling, and engine-level spawn debounce guard.
* [0035: GameLoop Decomposition, Visual Fidelity Polish & Campaign Expansion](0035-gameloop-decomposition-ui-polish-and-content-expansion.md) — Single responsibility split of GameLoop into MovementController, InteractionDispatcher, and GameStateManager; visual glassmorphism and mobile drawer; Chapters 9–10 and Sunken Vaults saga.
* [0036: Smart Change-Driven Test Runner, Result Caching & CI Domain Splitting](0036-smart-change-driven-testing-and-ci-matrix.md) — Dependency graph register, Git diff inspection, SHA-256 pass result caching, and segmented domain test matrix.
* [0037: Modular Level Package Architecture (Per-Level Directory Structure)](0037-modular-level-package-architecture.md) — Directory-per-level packaging with manifest.json, README.md, layers.json, and entities.json, compiled for zero-backend static runtime execution.
* [0038: Elevated Platforms, Wall-Top Walkways, Underpass Traversal, and Progressive Hazard Escalation](0038-elevated-platforms-wall-walkways-and-progressive-hazard-escalation.md) — Dynamic campaign upper bound, 2D walkable overhead platforms, battlement wall walks, multi-elevation underpasses, 3D drop shadow rendering, and Chapter 9 escalation.
* [0039: Compounding Mechanics Matrix, Zero Dead Space Standard, and Campaign Level Overhaul Framework](0039-compounding-mechanics-matrix-and-campaign-level-overhaul.md) — Rigorous audit, zero dead space standard, compounding mechanics ladder across Chapters 1–10, and phased level overhaul roadmap.
* [0040: Multi-Elevation Fog-of-War Line-of-Sight & Ground Wall Occlusion](0040-multi-elevation-fog-of-war-visibility.md) — Multi-elevation raycasting illuminating lower rooms and halls from upper battlements while preserving ground wall occlusion and shadow casting.
