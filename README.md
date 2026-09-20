# Casual Maze Game

A top-down 2D puzzle maze and labyrinth engine built with Vanilla HTML5, CSS3, Modern JavaScript (ES6+ native modules), and HTML5 Canvas 2D. 

Hosted statically on GitHub Pages at [casual-maze-game.inbarrose.com](https://casual-maze-game.inbarrose.com).

---

## 🎮 Features

* **Universal Glassmorphic Navigation**: Sleek persistent top header and bottom footer with direct tab navigation, Player Profile pill, live stars counter, global Settings modal, and GitHub issue reporting.
* **Player Profile & Save Management**: Dynamic Explorer codenames, computed progression ranks (from *Novice Pathfinder* to *Grand Labyrinth Sovereign*), and 1-click JSON save backups, downloads, and clipboard exports.
* **Global Settings Modal**: Real-time procedural audio sliders (Master, SFX, BGM), 2.5D Angled vs Flat Top-Down perspective toggling, animated smooth camera rotation, and High Contrast accessibility mode.
* **Synchronized Camera World Rotation**: Turn the world 90° clockwise/counter-clockwise (`Q`/`E`) with unified Canvas 2D matrix transformation keeping multi-elevation bridges and explorers in rigid lockstep, with screen-relative input translation.
* **Multi-Elevation Bridges & Ramps**: Walk over bridges or tunnel beneath them (`B_EW`, `B_NS`) using directional ramps (`R_N`, `R_S`, `R_E`, `R_W`).
* **Thematic Visual Tilesets (6 Biomes)**: Authentic Canvas 2D renderers for 🏰 Dungeon, 🌴 Emerald Jungle, 🌋 Molten Core, ❄️ Glacial Expanse, 🔮 Amethyst Caverns, and 🌅 Sunset Citadel.
* **Reactive Puzzle Mechanics**: Collect color-coded keys (Ruby, Sapphire, Emerald, Gold, Purple), unlock matching gates, carry riddle relics into pedestal sockets, and pull levers to dynamically open passages.
* **Architect Studio Map Editor Overhaul**: Modern grouped toolbars, multi-layer switching (Ground Floor Z=0 vs Overhead Walkway Z=1), multi-colored entity palettes, brush sizing (1x1 to 5x5), grab & move tool, live solvability diagnostic reports, and test play with custom spawns.
* **Replay Theater & Diagnostics Lab**: In-browser test runner, deterministic solver walkthrough replay visualizer, and diagnostic reporting bundle generator.
* **Click-to-Move & Mobile Pointer Navigation**: Tap or click anywhere on the game canvas to route the explorer via BFS shortest-path navigation around obstacles, across multi-elevation ramps/bridges, and through open doors with an animated pulsing destination indicator.
* **Contextual Floating Action Button**: Seamless one-tap interaction for mobile and mouse users; a dynamic glassmorphic pill button appears above the character whenever adjacent to levers, riddle pedestals, signposts, lore notes, puzzle seals, doors, or portals.
* **Simple Keyboard Mode & Hotkey Isolation**: Clean separation of restart (`T`) from camera rotation (`Q`/`R`). Hotkeys can be toggled on/off in the Pause Menu or Settings modal to disable single-letter shortcuts (`Q`, `R`, `T`, `M`, `V`, `L`) and prevent accidental restarts during play.
* **Dynamic Fog-of-War & Minimap**: 3-state raycasting line-of-sight with memory dimming and an interactive HUD minimap.
* **Tutorial Academy & 32-Level Campaign Progression**: 6 structured introductory onboarding lessons plus 32 megalabyrinths across 8 themed zones.
* **Zero Backend**: 100% static client-side architecture with zero runtime dependencies.

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile / Mouse |
| :--- | :--- | :--- |
| **Move Explorer** | `W`, `A`, `S`, `D` / Arrow Keys | **Click-to-Move** (tap destination on canvas) / Virtual D-Pad |
| **Rotate Camera 90°** | `Q` or `[` (CCW) / `R` or `]` (CW) | Compass Dial Buttons `↺` / `↻` |
| **Interact / Pull Lever** | `Space` or `Enter` | **Contextual Floating Action Pill** / `USE` button |
| **Restart Level** | `T` *(isolated from camera rotation)* | Pause Menu / Restart Button `🔄` |
| **Toggle Perspective** | `V` *(when hotkeys enabled)* | Pause Menu / Settings Modal |
| **Free-Pan Map** | `M` *(when hotkeys enabled)* | Tap Map Button / Minimap |
| **Activity Log** | `L` *(when hotkeys enabled)* | Pause Menu `📜` |
| **Pause & Options** | `P` or `Esc` | Menu Button `⏸️` |
| **Simple Keyboard Mode** | Toggle in Pause Menu or Settings | Pause Menu -> Hotkeys Toggle |



## 🚀 Quick Start & Local Testing Guide

Because this game is built using **native ES6 JavaScript modules** (`import`/`export`) and the browser **Fetch API** for loading level JSON manifests, modern browsers block direct execution from raw `file:///` paths due to browser CORS security policies. 

To test and play the game on your local device without pushing to GitHub Pages, run a lightweight static HTTP server from the project directory.

### 1. Launch a Local Static Server

Choose any of the following 1-line commands in your terminal:

#### Option A: Node / npm with Live-Reload (Recommended)
```bash
# Start local development server with auto-reload (live-server)
npm start

# Or lightweight static server:
npm run serve
```

#### Option B: Python 3
```bash
# Windows / macOS / Linux
python -m http.server 8000
# On systems where Python 3 is aliased as python3:
python3 -m http.server 8000
```

#### Option C: VS Code Live Server
1. Install the **Live Server** extension (`ritwickdey.LiveServer`) in VS Code.
2. Right-click [`index.html`](index.html) in the file explorer and select **"Open with Live Server"**.

#### Option D: PHP Built-in Server
```bash
php -S localhost:8000
```

---

### 2. Local Navigation URLs

Once the server is running, open your web browser to:

| Area | Local URL | Description |
| :--- | :--- | :--- |
| **Hub / Level Select** | [http://localhost:8000](http://localhost:8000) | Browse Tutorial Academy and Zone 1–3 campaign stages. |
| **Tutorial Academy** | [http://localhost:8000/maze.html?tutorial=1](http://localhost:8000/maze.html?tutorial=1) | Play the 6 introductory tutorial mazes (`tutorial=1` to `tutorial=6`). |
| **Campaign Mode** | [http://localhost:8000/maze.html?id=1](http://localhost:8000/maze.html?id=1) | Play campaign levels 1 through 10 (`id=1` to `id=10`). |
| **Level Editor** | [http://localhost:8000/editor.html](http://localhost:8000/editor.html) | Design custom labyrinths, test solvability, and export JSON. |

---

### 3. Run Automated Tests Before Pushing

Before committing or pushing changes to GitHub, run the local automated test suite to ensure all collision rules, level schemas, BFS reachability paths, and validator diagnostics pass:

```bash
# Full test suite (all 62+ suites including 32-level campaign solver)
npm test

# Instant fast test run (skips heavy 32-level campaign solver, ~350ms)
npm run test:fast

# Granular targeted test suites
npm run test:unit       # Core, engine, entities, editor, UI unit tests
npm run test:engine     # Collision, raycasting, camera, solver, replay
npm run test:levels     # Storylines, JSON integrity, bypass routing
npm run test:entities   # Player, collectibles, pedestals, mechanisms
npm run test:journeys   # End-to-end multi-elevation user journeys
npm run test:campaign   # 32-level campaign walkthrough solvers
```

All test assertions will report `0 FAILED` with exit code `0`.


---

## 📚 Documentation & Technical Specifications

Detailed architecture, schemas, testing plans, level design methodology, and operational guides are organized in the [`docs/`](docs/) directory:

* **[docs/LEVEL_DESIGN_PHILOSOPHY.md](docs/LEVEL_DESIGN_PHILOSOPHY.md)**: 4-stage *Kishōtenketsu* methodology, anti-box spatial labyrinth rules, and zero-bypass gating guarantees.
* **[docs/LEVEL_AUDIT_RUBRIC.md](docs/LEVEL_AUDIT_RUBRIC.md)**: 6-axis 60-point multi-perspective evaluation rubric with automated release quality thresholds.
* **[docs/LEVEL_SCORING_REGISTER.md](docs/LEVEL_SCORING_REGISTER.md)**: Baseline scoring register, chapter audits, and workshopping iteration logs across all 38 levels.
* **[docs/GAP_ANALYSIS_AND_IMPROVEMENT_PLAN.md](docs/GAP_ANALYSIS_AND_IMPROVEMENT_PLAN.md)**: Root-cause diagnosis and remediation roadmaps for 8 reported UX, engine, mobile, and editor gaps.
* **[docs/TESTING_PLAN.md](docs/TESTING_PLAN.md)**: Zero-dependency test harness, subsystem coverage matrices, user journeys, future activity templates, and CI gating.
* **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Deep technical subsystems, 2D raycasting LoS, collision engine, and full file map.
* **[docs/LEVEL_SCHEMA.md](docs/LEVEL_SCHEMA.md)**: Canonical JSON level schema, tile codes, entity definitions, and config flags.
* **[docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)**: Release milestones, active roadmap, and backlog tracking.
* **[docs/adr/](docs/adr/)**: Architectural Decision Records (ADRs).
* **[AGENTS.md](AGENTS.md)**: Agent operating guidelines, protected branch workflow, and GitHub MCP integration.
