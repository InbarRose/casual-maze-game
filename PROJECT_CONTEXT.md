# Casual Maze Game — System Architecture & Context Specification

## 1. Project Overview & Objectives

* **Domain:** `casual-maze-game.inbarrose.com`
* **Hosting:** GitHub Pages (Static hosting, zero backend, zero external database).
* **Stack:** Vanilla HTML5, CSS3, Modern JavaScript (ES6+ native browser modules), HTML5 Canvas 2D.
* **Core Concept:** A 2D top-down, tile-based puzzle maze engine supporting handcrafted tutorial and campaign labyrinths, user-designed custom levels, multi-layer elevation (bridges/tunnels), reactive mechanics (levers, keys, color-locked doors), dynamic fog-of-war, viewport cameras with free-panning, a minimap HUD, and a browser-based level editor with live validation and JSON import/export.

---

## 2. Documentation Map

Detailed technical specifications are modularized across `docs/`:

* **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Deep technical subsystems, 2D raycasting LoS, camera viewport math, multi-elevation bridges & ramps, debug telemetry logger, and complete directory tree.
* **[docs/LEVEL_SCHEMA.md](docs/LEVEL_SCHEMA.md)**: Canonical JSON level format, entity schema (`key`, `door`, `lever`), and configuration flags.
* **[docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)**: Milestone tracking, roadmap & active backlog.
* **[docs/adr/](docs/adr/)**: Architectural Decision Records (ADRs).
* **[AGENTS.md](AGENTS.md)**: Agent operating guidelines and protected branch workflows.
* **[README.md](README.md)**: User-facing overview, gameplay controls, and quickstart.

---

## 3. High-Level Subsystems Summary

* **Elevation & Collision**: Ground layer (`0`) and Overhead layer (`1`). Bridges `B_EW` & `B_NS` allow crossing over / under. Ramps `R_N`, `R_S`, `R_E`, `R_W` transition elevation.
* **Fog of War**: 3-state visibility array (`0: Unexplored`, `1: Explored`, `2: Visible`) updated via 2D raycasting line of sight.
* **Interactive Entities**: Colored keys, matching locked doors, and levers wired to mutate grid tiles at runtime.
* **Editor & Solvability Validator**: In-browser editor with stroke-batched Undo/Redo, project persistence in `localStorage`, and multi-pass BFS solvability validation.
