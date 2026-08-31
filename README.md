# Casual Maze Game

A top-down 2D puzzle maze and labyrinth engine built with Vanilla HTML5, CSS3, Modern JavaScript (ES6+ native modules), and HTML5 Canvas 2D. 

Hosted statically on GitHub Pages at [casual-maze-game.inbarrose.com](https://casual-maze-game.inbarrose.com).

---

## 🎮 Features

* **Multi-Elevation Bridges & Ramps**: Walk over bridges or tunnel beneath them (`B_EW`, `B_NS`) using directional ramps (`R_N`, `R_S`, `R_E`, `R_W`).
* **Thematic Visual Tilesets (6 Biomes)**: Authentic Canvas 2D renderers for 🏰 Dungeon, 🌴 Emerald Jungle, 🌋 Molten Core, ❄️ Glacial Expanse, 🔮 Amethyst Caverns, and 🌅 Sunset Citadel.
* **Reactive Puzzle Mechanics**: Collect color-coded keys (Ruby, Sapphire, Emerald, Gold, Purple), unlock matching gates, and pull levers to dynamically open passages.
* **Persistent Inventory HUD Bar**: Always-visible top interface displaying held items, color-coded badges, and empty slot status.
* **Dynamic Fog-of-War & Minimap**: 3-state raycasting line-of-sight with memory dimming and an interactive HUD minimap.
* **Tutorial Academy & Campaign Progression**: 6 structured introductory onboarding lessons plus 10 campaign labyrinths across 3 themed zones.
* **In-Browser Level Architect**: Design custom mazes with stroke-batched Undo/Redo, live theme previewing, and an intelligent topological BFS solvability validator with bypass & deadlock warnings.
* **Zero Backend**: 100% static client-side architecture with zero runtime dependencies.

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` / Arrow Keys | On-screen Virtual D-Pad |
| **Interact / Pull Lever** | `E`, `Space`, or `Enter` | `USE` button |
| **Free-Pan Map** | `M` | Tap Map Button / Minimap |
| **Restart Level** | `R` | Restart Button `🔄` |

---

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
npm test
```

All test assertions will report `0 FAILED` with exit code `0`.

---

## 📚 Documentation & Technical Specifications

Detailed architecture, schemas, testing plans, and operational guides are organized in the [`docs/`](docs/) directory:

* **[docs/TESTING_PLAN.md](docs/TESTING_PLAN.md)**: Zero-dependency test harness, subsystem coverage matrices, user journeys, future activity templates, and CI gating.
* **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Deep technical subsystems, 2D raycasting LoS, collision engine, and full file map.
* **[docs/LEVEL_SCHEMA.md](docs/LEVEL_SCHEMA.md)**: Canonical JSON level schema, tile codes, entity definitions, and config flags.
* **[docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)**: Release milestones, active roadmap, and backlog tracking.
* **[docs/adr/](docs/adr/)**: Architectural Decision Records (ADRs).
* **[AGENTS.md](AGENTS.md)**: Agent operating guidelines, protected branch workflow, and GitHub MCP integration.
