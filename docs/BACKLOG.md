# Casual Maze Game — Master Product Backlog

This document serves as the authoritative, prioritized master backlog for all features, technical debt, level overhauls, engine enhancements, and UX improvements in the **Casual Maze Game**.

* **Audited & Updated**: 2026-09-20
* **Status**: Active & Maintained
* **Priority Schema**:
  * **P0 (Blocker / Critical)**: Must be addressed immediately; breaks gameplay, solvability, or core architecture.
  * **P1 (High)**: Major user friction, visual deficiency, or core gameplay gap.
  * **P2 (Medium)**: Quality-of-life improvement, polish, or progressive feature expansion.
  * **P3 (Low / Polish)**: Nice-to-have visual micro-interactions, extra sound design, or minor enhancements.

---

## 1. Backlog Summary by Epic

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MASTER BACKLOG OVERVIEW                         │
├──────────────────────────────────────┬──────────┬───────────┬──────────┤
│ Epic Name                            │ Items    │ Priority  │ Status   │
├──────────────────────────────────────┼──────────┼───────────┼──────────┤
│ 1. Level Design & Kishōtenketsu      │ BL-01–08 │ P0 / P1   │ Completed│
│ 2. Visual Engine & Vector Rendering  │ BL-09–13,33│ P1      │ Ready    │
│ 3. Game Feel, Controls & Mobile UX   │ BL-14–17 │ P1        │ Ready    │
│ 4. Map Editor Studio Overhaul        │ BL-18–22 │ P1 / P2   │ Ready    │
│ 5. Universal Navigation, HUD & Save  │ BL-23–26 │ P1        │ Ready    │
│ 6. Audio FX & Ambience Engine        │ BL-27–28 │ P2        │ Ready    │
│ 7. QA Automation & Test Scale        │ BL-29–32 │ P0 / P1   │ Completed│
└──────────────────────────────────────┴──────────┴───────────┴──────────┘
```

---

## 2. Detailed Backlog Items

### Epic 1: Level Design & Kishōtenketsu Campaign Overhaul
*Objective: Eliminate monotonous corner-to-corner templates and ensure every level adheres to the 4-stage Kishōtenketsu methodology with 100% zero-bypass gating.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-01** | **Level Design Philosophy & Audit Rubric** | **P0** | `v1.19.0` | Publish `docs/LEVEL_DESIGN_PHILOSOPHY.md` and critical 6-axis 60-point `docs/LEVEL_AUDIT_RUBRIC.md`. | **Completed** |
| **BL-02** | **Master Level Scoring Register** | **P0** | `v1.19.0` | Audit all 38 levels in `docs/LEVEL_SCORING_REGISTER.md` with realistic, critical baseline scores. | **Completed** |
| **BL-03** | **Chapter 1 Workshop (The Foundation)** | **P0** | `v1.19.0` | Redesign Levels 1–4 with non-uniform dimensions, dynamic spawns, unbypassable locks, and zero empty backtracking. | **Completed** |
| **BL-04** | **Chapter 2 Workshop (Vertical Dimension)** | **P0** | `v1.19.0` | Redesign Levels 5–8 with multi-elevation bridges (`B_EW`, `B_NS`), directional ramps (`R_*`), and elevated keys. | **Completed** |
| **BL-05** | **Chapter 3 Workshop (Shifting Clockwork)** | **P1** | `v1.19.0` | Redesign Levels 9–12: Clockwork levers, dynamic wall-state gates, multi-target toggles with zero bypass. | **Completed** |
| **BL-06** | **Chapter 4 Workshop (Astral Teleporters)** | **P1** | `v1.19.0` | Redesign Levels 13–16: 3D teleporter networks, non-Euclidean shortcuts, anti-softlock teleport loops. | **Completed** |
| **BL-07** | **Chapter 5 Workshop (Molten Danger)** | **P1** | `v1.19.0` | Redesign Levels 17–20: Timed flame vents, rhythm gauntlets, patroller sentinels, mid-level checkpoints. | **Completed** |
| **BL-08** | **Chapters 6–8 Polish & Synthesis** | **P2** | `v1.19.0` | Polish minigame seals (Ch 6), grand trial synthesis (Ch 7), and 4-way camera rotation puzzles (Ch 8). | **Completed** |

---

### Epic 2: Visual Engine & SVG Vector Rendering Pipeline
*Objective: Replace flat solid-color Canvas 2D rectangles with rich vector SVG sprites, layered textures, and atmospheric lighting.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-09** | **SVG Sprite Rendering in Game Canvas** | **P1** | `v1.20.0` | Connect `assets/manifest.json` SVG vector assets into `js/engine/renderer.js` for walls, floors, doors, and keys. | **Completed** |
| **BL-10** | **Biome Floor Textures & Wall Drop Relief** | **P1** | `v1.20.0` | Render cobblestone, flagstone, moss, and crystal floor textures instead of flat monochromatic fills. | **Completed** |
| **BL-11** | **Dynamic Atmospheric Particle Systems** | **P2** | `v1.21.0` | Add subtle canvas particle effects: rising embers in Lava, drifting pollen in Jungle, floating motes in Caverns. | **Completed** |
| **BL-12** | **Lighting Gradients & Torch Glow** | **P2** | `v1.21.0` | Dynamic radial gradient lighting around the explorer and placed wall torches under Fog of War. | **Completed** |
| **BL-13** | **Elevation Drop Shadows & Visual Depth** | **P2** | `v1.21.0` | Render realistic directional drop shadows cast by elevated bridge spans and high platforms onto lower terrain. | **Completed** |
| **BL-33** | **2.5D Depth-Sorting & Wall Front/Roof Occlusion** | **P1** | `v1.20.0` | Resolve visual anomaly where explorer renders over southern wall roofs. Implement unified Y-sorted or row-interleaved painter pass so character walking behind/north of a wall tile is properly occluded by its elevated front face and top cap. | **Completed** |

---

### Epic 3: Game Feel, Controls & Mobile Ergonomics
*Objective: Deliver a responsive, delightful control experience across both desktop keyboards and mobile touchscreens.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-14** | **Click-to-Move BFS Pathfinding Engine** | **P0** | `v1.18.0` | One-tap navigation routing explorer around obstacles and through open doors with animated target indicator. | **Completed** |
| **BL-15** | **Contextual Floating Action Pill** | **P0** | `v1.18.0` | Glassmorphic floating interact button positioned above character for one-tap mobile activation. | **Completed** |
| **BL-16** | **Mobile Touch Viewport & Scroll Locking** | **P1** | `v1.20.0` | Prevent accidental page rubber-banding and scrolling during canvas drag gestures on iOS Safari & Android Chrome. | **Completed** |
| **BL-17** | **Minimap Pinch-to-Zoom & Pan Gesture** | **P2** | `v1.22.0` | Touch gesture support for zooming and panning the HUD minimap overlay on mobile viewports. | **Completed** |

---

### Epic 4: Map Editor Studio Overhaul
*Objective: Transform the map editor into a modern, fluid authoring environment with undo/redo, brush tools, and instant diagnostics.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-18** | **Action History Stack (Undo / Redo)** | **P1** | `v1.20.0` | Full undo/redo stack (`Ctrl+Z` / `Ctrl+Y`) for brush strokes, tile edits, and entity placement. | **Completed** |
| **BL-19** | **Continuous Drag-to-Paint Smoothing** | **P1** | `v1.20.0` | Smooth interpolated line stamping during rapid mouse drag across canvas (no broken tile gaps). | **Completed** |
| **BL-20** | **Multi-Tile Stamp & Prefab Palette** | **P2** | `v1.21.0` | Pre-built architectural prefabs (bridge crossings, locked vault gates, 4-way intersections) for 1-click stamping. | Planned |
| **BL-21** | **One-Click Diagnostic Auto-Fixer** | **P2** | `v1.22.0` | Editor action to automatically resolve common errors (e.g. adding missing ramp next to bridge or matching door key). | Planned |
| **BL-22** | **Visual Layer Switcher HUD** | **P2** | `v1.22.0` | Real-time visual overlay highlighting active editing elevation (Ground Z=0 vs Overhead Z=1) with translucent previews. | Planned |

---

### Epic 5: Universal Navigation, HUD, Profile & Save Management
*Objective: Modern, cohesive glassmorphic app chrome, in-game modal access, and cloudless export/import.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-23** | **Universal App Header & Footer** | **P0** | `v1.16.0` | Persistent glassmorphic header and footer with live star count, profile pill, and settings modal. | **Completed** |
| **BL-24** | **In-Game Settings & Profile Modals** | **P1** | `v1.19.0` | Mount `#app-header` and modal triggers inside `maze.html` so players can adjust settings without leaving active game. | **Completed** |
| **BL-25** | **Real-Time Audio Gain Sliders** | **P1** | `v1.19.0` | Connect Master, SFX, and BGM sliders directly to `WebAudioEngine` gain nodes with live volume changes. | **Completed** |
| **BL-26** | **High-Contrast Accessibility Mode** | **P2** | `v1.21.0` | High-contrast visual mode with sharp white/black borders, colorblind key glyphs, and high-visibility explorer. | Planned |

---

### Epic 6: Audio FX & Environmental Ambience
*Objective: Satisfying zero-dependency procedural Web Audio sound design for physical feedback and atmosphere.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-27** | **Procedural Sound FX Engine** | **P0** | `v1.16.0` | Web Audio synthesizer triggers for footsteps, key pickup, door unlock, lever flip, and victory chimes. | **Completed** |
| **BL-28** | **Continuous Environmental Ambience** | **P2** | `v1.22.0` | Ambient procedural background loops: dungeon wind whispers, jungle forest chirps, subterranean cavern drips. | **Completed** |

---

### Epic 7: QA Automation, Test Architecture & Scalability
*Objective: Ensure 100% test coverage, modular per-chapter test organization, fast CI gating, and zero cryptographic drift.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-29** | **Export `ALL_LEVELS` & Fix Test Runner** | **P0** | `v1.19.0` | Export `ALL_LEVELS` in `default-levels.js` resolving module syntax crash in `test.html`. | **Completed** |
| **BL-30** | **Modular Per-Chapter Unit Tests** | **P0** | `v1.19.0` | Dedicated test files per chapter (`chapter-1.test.mjs` through `chapter-8.test.mjs`, plus story suites) instead of multi-chapter bundles. | **Completed** |
| **BL-31** | **Automated Zero-Bypass Regression Tests** | **P0** | `v1.19.0` | Prove with BFS solver that `solveLevel(lvl, { allowDoors: false }) === null` for all gated levels. | **Completed** |
| **BL-32** | **Test Harness Failure Summary Diagnostics** | **P1** | `v1.19.0` | Print concise failure summaries and stack traces at the end of `runner.mjs` executions. | **Completed** |

---

## 3. Sprint Planning & Delivery Roadmap

```mermaid
flowchart LR
    subgraph Sprint 1: Foundation & Audit [v1.19.0 Current]
        S1A["Level Design Philosophy & Critical Rubric"] --> S1B["Audit Register & Gap Analysis"]
        S1B --> S1C["Chapter 1 & 2 Kishōtenketsu Workshop"]
        S1C --> S1D["Per-Chapter Modular Unit Tests"]
    end

    subgraph Sprint 2: Visual Engine & Polish [v1.20.0 Next]
        S2A["SVG Asset Pipeline in Renderer"] --> S2B["Biome Floor Textures & Shadows"]
        S2B --> S2C["Chapter 3 Clockwork Workshop"]
        S2C --> S2D["Editor Undo/Redo Stack"]
    end

    subgraph Sprint 3: Dynamics & Ambience [v1.21.0 Future]
        S3A["Atmospheric Particle Systems"] --> S3B["Chapter 4 Astral Workshop"]
        S3B --> S3C["Torch & Radial Fog Lighting"]
        S3C --> S3D["Mobile Touch Gesture Polish"]
    end

    Sprint 1 --> Sprint 2 --> Sprint 3
```

---

## 4. Backlog Governance & Updating Guidelines
1. **New Issues & User Feedback**: When new gaps, bugs, or user requests are identified, record them immediately in this document with an ID (`BL-XX`), priority, and clear acceptance criteria.
2. **Atomic Commits**: As backlog items are completed, link the conventional commit or PR number in the status column.
3. **Traceability**: All items in `docs/PROJECT_MANAGEMENT.md` and `docs/GAP_ANALYSIS_AND_IMPROVEMENT_PLAN.md` must cross-reference this master backlog.
