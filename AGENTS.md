# Agent Operating Guidelines — Casual Maze Game

This document outlines the standard operating procedures, architectural principles, development practices, and project management workflows for all AI agents working on the **Casual Maze Game** codebase.

---

## 1. Core Operating Principles

### A. Pure Static Compatibility (GitHub Pages)
* **Zero Backend / Zero Server Runtime**: The game must run 100% statically in modern web browsers (hosted on GitHub Pages via custom domain `casual-maze-game.inbarrose.com` configured in `CNAME`).
* **Technology Stack**:
  * Pure Vanilla HTML5 & CSS3.
  * Modern JavaScript (ES6+ native browser modules via `import`/`export`).
  * HTML5 Canvas 2D API for all grid, entity, and fog rendering.
* **No Runtime Dependencies**: Never introduce `npm` packages or build tools that require a Node/Express server runtime in production. The browser must directly load HTML, CSS, and JS.

### B. Small, Atomic Changes & Auto-Commits
* **Frequent Commits**: Keep edits small, focused, and single-purpose so changes can be reviewed and tracked cleanly.
* **Auto-Commit Standard**: Agents must automatically commit verified, passing work to Git using conventional commit messages (e.g. `feat(editor): ...`, `fix(engine): ...`, `test: ...`, `docs: ...`). Do not leave unstaged/uncommitted files at task completion.
* **No Giant Monolithic Refactors**: If implementing a feature or refactoring, break the work down into atomic incremental steps (e.g., model/constants -> logic/engine -> UI/integration -> tests).
* **Documentation Integrity**: Preserve all existing non-conflicting comments, docstrings, and schema types unless deliberately deprecating them.

### C. Mandatory Testing & Validation
* **Automated Tests**: Every new game mechanic, entity type, collision rule, PRNG enhancement, or schema mutation **must** include automated tests in `test-suite.mjs`.
* **Test Command**: Always run `npm test` before concluding any task and ensure all tests pass (`0 failed`).
* **Manual Verification**: When modifying UI, CSS, canvas layout, touch controls, or editor tools, verify them with a local static server (`python -m http.server 8000`) or direct browser testing.

---

## 2. Codebase Architecture & File Structure

```text
casual-maze-game/
├── CNAME                         # Custom domain mapping (casual-maze-game.inbarrose.com)
├── README.md                     # User-facing overview, gameplay controls, and quickstart
├── AGENTS.md                     # Agent operating guidelines and standards (this file)
├── PROJECT_CONTEXT.md            # Technical context and subsystem reference
├── index.html                    # Hub / Level Select / Custom File Import
├── maze.html                     # Game canvas viewport interface
├── editor.html                   # Handcrafted maze architect and JSON level designer
├── docs/                         # Project management, roadmaps, and architecture records
│   ├── PROJECT_MANAGEMENT.md     # Release status, active roadmap, and TODO backlog
│   └── adr/                      # Architectural Decision Records (ADRs)
│       ├── README.md             # ADR index and template
│       ├── 0001-static-canvas-modular-engine.md
│       └── 0002-multi-elevation-bridge-system.md
├── css/
│   ├── main.css                  # Design tokens, typography, hub styling
│   ├── game.css                  # Canvas overlay, HUD, minimap, mobile d-pad
│   └── editor.css                # Editor toolbars, entity inspector, palette
├── js/
│   ├── core/
│   │   ├── constants.js          # Tile definitions, entity enums, key mappings
│   │   ├── prng.js               # Mulberry32 deterministic pseudo-random generator
│   │   ├── events.js             # Pub/Sub EventBus for decoupled engine communication
│   │   └── storage.js            # LocalStorage / SessionStorage persistence wrapper
│   ├── engine/
│   │   ├── camera.js             # Viewport translation, lerp follow, free-pan mode
│   │   ├── collision.js          # Elevation-aware collision & directional bridge traversal
│   │   ├── fog.js                # 3-state fog-of-war (Unexplored, Explored, Visible)
│   │   ├── game-loop.js          # Delta-time coordinator and animation loop
│   │   ├── minimap.js            # Dedicated HUD minimap canvas renderer
│   │   ├── renderer.js           # 2D canvas drawing pipeline (clamped to viewport)
│   │   └── debug-logger.js       # Runtime debug telemetry
│   ├── entities/
│   │   ├── player.js             # Position, elevation state, inventory, input listener
│   │   ├── key.js                # Collectible colored key entities
│   │   ├── door.js               # Locked barrier entities
│   │   └── lever.js              # State-switching trigger entities (mutates grid tiles)
│   ├── levels/
│   │   ├── level-loader.js       # Schema validator, URL param parser, static level loader
│   │   └── default-levels.js     # Hardcoded fallback campaign levels (Levels 1–5)
│   └── editor/
│       ├── editor-canvas.js      # Grid painting, drag-placement, coordinate preview
│       ├── editor-ui.js          # Palette selection, layer toggling, toolbar bindings
│       ├── entity-inspector.js   # Interactive lever-to-target wiring panel
│       └── json-exporter.js      # File export/import parser via Web File API
├── levels/
│   ├── manifest.json             # Manifest of campaign levels
│   ├── level_1.json .. level_5.json # Canonical JSON level definitions
├── package.json                  # Test script runner (`npm test`)
└── test-suite.mjs                # Pure Node ES-module test runner
```

---

## 3. Engineering Guidelines & Constraints

### A. Performance Budget & Rendering Rules
* **Viewport Culling**: Never loop through the entire tile grid inside `render()` or `fog.update()`. Always use `Camera.getViewportBounds()` to clamp loops to visible tiles.
* **Canvas State Hygiene**: Always pair `ctx.save()` with `ctx.restore()` when altering canvas transforms, opacity, or clipping regions.
* **Decoupled State**: Use the `EventBus` (`events.js`) to publish gameplay state changes (e.g. `player:moved`, `door:unlocked`, `lever:toggled`, `level:completed`) rather than tightly coupling entities to UI components.

### B. Elevation & Collision Rules
* Ground layer is `elevation: 0`, overhead layer is `elevation: 1`.
* Bridge tiles:
  * `B_EW`: Allows East <-> West traversal on `Layer 0`; allows North <-> South traversal on `Layer 1`.
  * `B_NS`: Allows North <-> South traversal on `Layer 0`; allows East <-> West traversal on `Layer 1`.
* Ramp tiles (`R_N`, `R_S`, `R_E`, `R_W`): Dynamically transition the player's elevation between `0` and `1` based on movement vector.
* Always pass current elevation when evaluating collisions via `CollisionEngine.checkMove()`.

### C. Level Schema Integrity
* All levels must conform to the canonical schema defined in `PROJECT_CONTEXT.md` and validated in `LevelLoader.normalizeLevel()`.
* When adding or updating campaign levels:
  1. Add/modify `levels/level_N.json`.
  2. Update `levels/manifest.json`.
  3. Mirror in `js/levels/default-levels.js` for offline/fallback reliability.
  4. Ensure `test-suite.mjs` verifies the level.

---

## 4. Project Management & Tracking Workflow

Agents must actively maintain project state documentation:

1. **Architecture Decisions (ADRs)**:
   * When introducing significant structural changes, new systems, or altering engine conventions, create an ADR in `docs/adr/NNNN-title.md` following the template in `docs/adr/README.md`.
2. **Progress & Backlog Tracking**:
   * Refer to and update `docs/PROJECT_MANAGEMENT.md` when completing tasks or planning future backlog items.
   * Mark completed TODO items with `[x]`, document version releases, and record any newly discovered technical debt or feature requests.

---

## 5. Agent Checklist for Tasks

Before concluding any task or reporting back to the user, ensure:
- [ ] Changes are modular and atomic.
- [ ] Zero server dependencies added (remains 100% static on GitHub Pages).
- [ ] New logic or entity types are covered by tests in `test-suite.mjs`.
- [ ] `npm test` runs and passes with `0 failed`.
- [ ] Relevant documentation (`docs/PROJECT_MANAGEMENT.md`, `PROJECT_CONTEXT.md`, or `docs/adr/`) is updated.
- [ ] Work is committed with conventional, atomic git commit messages.
