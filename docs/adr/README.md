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
