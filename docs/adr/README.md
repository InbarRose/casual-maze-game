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
