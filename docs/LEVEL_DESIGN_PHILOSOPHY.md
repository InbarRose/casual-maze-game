# Level Design Philosophy & Architectural Principles

This document establishes the official level design standard for the **Casual Maze Game**. It outlines the core four-stage design methodology, spatial composition rules, gating integrity requirements, and quality standards for all campaign chapters, tutorials, and player-authored labyrinths.

---

## 1. Core Philosophy: The 4-Stage *Kishōtenketsu* Framework

All multi-level chapters in Casual Maze Game are structured around the four-act Japanese narrative and game design framework (*Kishōtenketsu*), made famous by classic puzzle design (Nintendo, *Portal*, *The Witness*). 

Rather than simply increasing maze dimensions from level to level (e.g. 15×15 → 17×17 → 19×19), each 4-level chapter arc must progress through four distinct, purposeful stages:

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     STAGE 1     │ ──> │     STAGE 2     │ ──> │     STAGE 3     │ ──> │     STAGE 4     │
│   Ki (起)       │     │   Shō (承)      │     │   Ten (転)      │     │   Ketsu (結)    │
│  Introduction   │     │   Development   │     │      Twist      │     │    Synthesis    │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
 • Core mechanic in     • Expanded context    • Inversion / shock   • Grand culmination
   isolation              with obstacles        subverting assumptions• Complete mastery
 • Compact & readable   • Meaningful choice   • Spatial friction    • Memorable layout
 • Safe experimentation • Multi-step gating   • Counter-intuitive   • High payoff
```

### Stage 1: Ki (起) — Introduction
* **Objective**: Introduce the chapter's defining mechanic in pure isolation.
* **Layout Characteristics**:
  * Compact scale (e.g. 11×11 to 13×13).
  * High visual readability; clear sightlines from spawn to the objective.
  * Zero extraneous distractions, red herrings, or punishing dead-ends.
  * Player learns through direct, safe cause-and-effect (e.g., picking up the first key, stepping onto a single ramp, or flipping a switch that visibly moves a wall).

### Stage 2: Shō (承) — Development
* **Objective**: Apply the introduced mechanic in a standard problem context with light friction.
* **Layout Characteristics**:
  * Moderate scale (e.g. 15×13 to 15×15).
  * Multiple branching paths or twin wings; the player must decide which direction to explore first.
  * Layered gating (e.g., Key A opens Door A, which reveals Key B).
  * Environmental feedback reinforcing the core rule before complexity escalates.

### Stage 3: Ten (転) — Twist / Complication
* **Objective**: Subvert the player's assumptions by introducing unexpected constraints, spatial inversions, or counter-intuitive friction.
* **Layout Characteristics**:
  * Focused, puzzle-dense scale (e.g. 17×15 to 17×17).
  * The obvious or intuitive path is intentionally blocked or leads to a trap/lock, forcing the player to reconsider their spatial mental model.
  * Introduces surprising mechanical combinations (e.g., an underpass that seems impassable until approached from an elevated overlook, or an inverted lever that opens one gate while closing another).
  * Delivers the chapter's signature "Aha!" moment.

### Stage 4: Ketsu (結) — Synthesis / Culmination
* **Objective**: Test comprehensive mastery of all mechanics introduced throughout the chapter.
* **Layout Characteristics**:
  * Grand architectural scale (e.g. 19×17 to 21×21).
  * Multiple interconnected wings or elevation tiers converging on a central sanctuary.
  * Demands sequential problem-solving, strategic route planning, and navigation under fog-of-war.
  * Concludes with high narrative and visual payoff (e.g., unlocking a grand gilded gate leading to an illuminated altar exit).

---

## 2. Labyrinth Architecture & Spatial Rules

### A. The "Anti-Box" Rule: Ban Homogeneous Grids
* **No Generic Mazes**: Levels must never be generated as uniform, homogeneous corridor grids where every hallway is 1-tile wide with arbitrary dead-ends.
* **Spatial Rhythm & Contrast**:
  * Alternate between **Open Chambers** (3×3 or 4×4 rooms, courtyards, sanctums) and **Transition Corridors** (1-tile choke points, winding halls).
  * Form distinct architectural zones (e.g., West Library, Central Fountain, East Crypt, High Walkway).
  * Give each room a recognizable footprint (T-junctions, crossways, ring galleries).

### B. Dynamic Anchor Positioning: Break Corner-to-Corner Monotony
* **Ban Fixed (1,1) Spawn to (W-2, H-2) Exit Defaults**:
  * Spawning at top-left and exiting at bottom-right across all levels creates repetitive diagonals.
  * **Varied Spawns**: Center courtyard spawn with radiating wings; West gate entrance; Subterranean emergence.
  * **Varied Exits**: Elevated overlook exit; Central sanctum portal; Northern grand gateway; Loopback destination.

### C. Zero-Bypass Gating Guarantee
* **Strict Chokepoint Requirement**:
  * Every key, lever, bridge, or puzzle entity placed in a level **must be physically required** to reach the exit.
  * Never leave parallel corridors or perimeter bypass paths that allow a player to walk around a locked gate without solving the puzzle.
  * Automated regression tests (`npm run test:levels`) must prove that removing any required entity renders the level unsolvable.

### D. Multi-Elevation Layering (Z=0 vs Z=1)
* **Bridges as Three-Dimensional Intersections**:
  * Overhead bridges (`B_EW`, `B_NS`) and ramps (`R_N`, `R_S`, `R_E`, `R_W`) must create meaningful vertical crossings, not cosmetic overlays.
  * The path beneath a bridge (underpass) should connect separate regions from the path traversing the top deck (overpass).
  * Players should see destinations through underpasses before finding the ramp to ascend.

---

## 3. Visual & Aesthetic Hierarchy

1. **Architectural Readability**:
   * Wall heights (2.5D drops) and cast shadows must clearly delineate walkable floor from solid obstacles.
   * Ramps and bridge railings must visually match their traversal direction.
2. **Thematic Consistency**:
   * Every chapter belongs to a cohesive biome (🏰 Dungeon, 🌴 Jungle, 🌋 Molten Core, ❄️ Glacial Expanse, 🔮 Amethyst Caverns, 🌅 Sunset Citadel).
   * Wall decor, notes, and props should reflect the lore of the biome.
3. **Fog-of-War Memory & Landmarks**:
   * Because fog-of-war obscures distant vision, prominent landmarks (signposts, decorated wall tablets, distinct flooring, color gates) must serve as mental navigational anchors.

---

## 4. Calibration & Par Metrics

Each level's par metrics must be calibrated to provide a fair, rewarding challenge for speedrunners and pathfinders:

| Stage Type | Target Grid Dimensions | Par Steps Formula | Par Time Formula |
| :--- | :--- | :--- | :--- |
| **Stage 1 (Ki / Intro)** | 11×11 to 13×13 | Optimal BFS Steps + 4–8 steps | Optimal Time + 6–10 seconds |
| **Stage 2 (Shō / Develop)** | 13×13 to 15×15 | Optimal BFS Steps + 8–12 steps | Optimal Time + 10–14 seconds |
| **Stage 3 (Ten / Twist)** | 15×15 to 17×17 | Optimal BFS Steps + 10–16 steps | Optimal Time + 12–18 seconds |
| **Stage 4 (Ketsu / Master)** | 17×17 to 21×21 | Optimal BFS Steps + 14–22 steps | Optimal Time + 16–25 seconds |

---

## 5. Level Authoring Checklist

Before any level is merged into the campaign or storyline catalog:
- [ ] Level belongs to an explicit Kishōtenketsu stage (Ki, Shō, Ten, or Ketsu).
- [ ] Spawn and exit positions are intentionally placed and not default diagonal corners.
- [ ] The room layout features varied spatial rhythm (open chambers vs corridors).
- [ ] Zero bypasses exist (all keys, doors, and levers are strictly mandatory).
- [ ] Automated BFS solver reaches the exit (`solveLevel(level) !== null`).
- [ ] Visual orientation and bridge railings render correctly under camera rotation (0°, 90°, 180°, 270°).
- [ ] Par steps and par time are calibrated from actual solver data.
- [ ] Manifest entry and SHA-256 cryptographic hashes are synchronized.
