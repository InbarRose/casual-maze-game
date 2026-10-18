# ADR-0035: GameLoop SRP Decomposition, Visual Fidelity Polish & Campaign Expansion

## Status
Accepted

## Date
2026-10-17

## Context
Following the completion and verification of `v1.27.0` (PR #92), the Casual Maze Game platform was subjected to a comprehensive quality assessment against the 6-Chair Expert Panel rubrics (`docs/COMPONENT_AUDIT_RUBRIC.md` and `docs/LEVEL_AUDIT_RUBRIC.md`).
The audit revealed three primary improvement frontiers:
1. **Architectural God-Class (`GameLoop`)**: At 2,629 lines, `js/engine/game-loop.js` mediates movement interpolation, pathfinding execution, collision arbitration, entity interaction triggers, scoring records, par calculations, and UI presenter callbacks. This violates Single Responsibility Principle (SRP) and ADR-007 file size guidelines ($\le 300$ lines).
2. **Visual & UI/UX Fidelity**: While functionally complete, user interfaces (Hub, Top Bar, modal dialogs, and card elevation) benefit from modern glassmorphic polish, glowing accent states, and responsive navigation drawers for ultra-compact viewports ($< 400\text{px}$). Additionally, level canvas rendering scores an average of only 5.6/10 on Chair 3 (Art & Visuals) due to static water/lava surfaces and sparse ambient props.
3. **Content Breadth & Puzzle Complexity**: The campaign has 32 levels across 8 chapters and 3 narrative sagas. Expanding with Chapter 9 (The Sunken Aqueducts), Chapter 10 (The Prismatic Labyrinth), and a new multi-room narrative saga ("The Sunken Vaults of the Deep") introduces rich water mechanics, classical macro-mazes, and multi-room progression.

## Decision
1. **GameLoop SRP Decomposition (`BL-56`)**:
   - Extract `MovementController` (`js/engine/movement-controller.js`): Responsible exclusively for tile-to-tile coordinate motion, velocity/interpolation, BFS path step execution, step count incrementation, camera tracking, and movement command execution.
   - Extract `InteractionDispatcher` (`js/engine/interaction-dispatcher.js`): Responsible exclusively for proximity entity scanning, entity activation (doors, keys, levers, pedestals, portals, traps), and floating contextual prompts.
   - Extract `GameStateManager` (`js/engine/game-state-manager.js`): Responsible exclusively for level lifecycle, timer tracking, victory detection, par scoring evaluation, and persistence event emission.
   - Retain `GameLoop` as an elegant facade orchestrating these sub-controllers, ensuring 100% backward compatibility for all existing public methods (`start()`, `stop()`, `restart()`, `movePlayer()`, etc.).
2. **Visual & UI/UX Polish (`BL-126`, `BL-127`)**:
   - Refine CSS styling in `css/main.css`, `css/game.css`, and `css/editor.css` with enhanced glassmorphic backdrops, smooth micro-interactions, tactile button glows, and ultra-compact mobile header drawer for viewports $< 400\text{px}$.
   - Add procedural animated water ripple shaders, lava vein pulsation, and decorative biome props to `js/engine/renderer.js`.
3. **Content Expansion (`BL-128`, `BL-129`, `BL-130`)**:
   - Implement Chapter 9 (Levels 33–36: The Sunken Aqueducts) featuring water gates, sluices, and stepping stone bridges.
   - Implement Chapter 10 (Levels 37–40: The Prismatic Labyrinth) featuring macro-scale concentric labyrinths, camera rotation puzzles, and prismatic wards.
   - Author "The Sunken Vaults of the Deep" multi-room story quest with 3 interconnected chambers.

## Consequences
- **Positive**:
  - `GameLoop` is decoupled into testable, focused single-responsibility modules under 300 lines each.
  - Adding new puzzle mechanics (e.g. water sluices, pressure tiles) is localized to `InteractionDispatcher` or `MovementController` without touching core game loop orchestration.
  - Significantly elevated visual delight and UI polish across desktop and mobile devices.
  - 8 new campaign levels and 1 new narrative saga substantially increase player engagement and replayability.
- **Negative / Trade-offs**:
  - Requires careful delegation and test coverage to maintain 100% compatibility with existing test suites and DOM callbacks.
