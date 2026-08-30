# Casual Maze Game

A top-down 2D puzzle maze and labyrinth engine built with Vanilla HTML5, CSS3, Modern JavaScript (ES6+ native modules), and HTML5 Canvas 2D. 

Hosted statically on GitHub Pages at [casual-maze-game.inbarrose.com](https://casual-maze-game.inbarrose.com).

---

## 🎮 Features

* **Multi-Elevation Bridges & Ramps**: Walk over bridges or tunnel beneath them (`B_EW`, `B_NS`) using directional ramps (`R_N`, `R_S`, `R_E`, `R_W`).
* **Reactive Puzzle Mechanics**: Collect color-coded keys, unlock matching gates, and pull levers to dynamically open passages.
* **Dynamic Fog-of-War & Minimap**: 3-state raycasting line-of-sight with memory dimming and an interactive HUD minimap.
* **Tutorial Academy & Campaign**: 6 interactive training lessons followed by 5 handcrafted master labyrinths.
* **In-Browser Level Architect**: Design custom mazes with stroke-batched Undo/Redo, an intelligent BFS solvability validator, and local project save/load.
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

## 🚀 Quickstart & Local Development

Run locally with automatic live-reload on file changes:

```bash
# Start local development server with auto-reload (live-server)
npm start

# Or using Python HTTP server (manual refresh)
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

Run the automated test suite:

```bash
npm test
```

---

## 📚 Documentation & Technical Specifications

Detailed architecture, schemas, and operational guides are organized in the [`docs/`](docs/) directory:

* **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Deep technical subsystems, 2D raycasting LoS, collision engine, and full file map.
* **[docs/LEVEL_SCHEMA.md](docs/LEVEL_SCHEMA.md)**: Canonical JSON level schema, tile codes, entity definitions, and config flags.
* **[docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)**: Release milestones, active roadmap, and backlog tracking.
* **[docs/adr/](docs/adr/)**: Architectural Decision Records (ADRs).
* **[AGENTS.md](AGENTS.md)**: Agent operating guidelines, protected branch workflow, and GitHub MCP integration.
