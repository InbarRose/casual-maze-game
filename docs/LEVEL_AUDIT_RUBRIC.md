# Expert Panel Level Audit Rubric & Quality Control Standard

This document establishes the official multi-perspective judging rubric, granular scoring dimensions, and uncompromising quality standards for auditing all campaign levels and episodic story chapters in the **Casual Maze Game**.

* **Audit Standard**: Expert Panel Quality Control Standard
* **Version**: `3.0.0`
* **Auditing Philosophy**: **Simulated Expert Panel Review.** Levels and story chapters are subjected to an in-depth, multi-faceted evaluation by six domain expert judges. Each judge assesses three distinct criteria on an absolute **1 to 10 scale**. Category scores are computed from the average of these criteria, producing a rigorous master score out of 60 (and normalized percentage).

---

## 1. Expert Panel Evaluation Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        6-CHAIR EXPERT PANEL AUDIT SYSTEM                               │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ Chair 1: Spatial Architecture │ Chair 2: Systems & Puzzles    │ Chair 3: Art & Visuals │
│ • 1.1 Room-to-Corridor (1–10) │ • 2.1 Zero-Bypass Gating(1–10)│ • 3.1 Biome Palette(1–10)│
│ • 1.2 Landmarks/Anchors (1–10)│ • 2.2 Entity Economy (1–10)   │ • 3.2 Depth/Shading(1–10)│
│ • 1.3 Transit Loopbacks (1–10)│ • 2.3 Cognitive Escalation(10)│ • 3.3 Props/Murals (1–10)│
│ Category 1: Avg (1.0–10.0)    │ Category 2: Avg (1.0–10.0)    │ Category 3: Avg (1.0–10.0)│
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ Chair 4: Pacing & Structure   │ Chair 5: UX & Calibration     │ Chair 6: Narrative     │
│ • 4.1 Stage Purity (1–10)     │ • 5.1 Par Step Accuracy (1–10)│ • 6.1 Diegetic Lore(1–10)│
│ • 4.2 Mechanical Novelty(1–10)│ • 5.2 Sightline Clarity (1–10)│ • 6.2 Sense of Place(1–10)│
│ • 4.3 Tension Curve (1–10)    │ • 5.3 Multi-Input Comfort(1–10)│ • 6.3 Climax Payoff (1–10)│
│ Category 4: Avg (1.0–10.0)    │ Category 5: Avg (1.0–10.0)    │ Category 6: Avg (1.0–10.0)│
├───────────────────────────────┴───────────────────────────────┴────────────────────────┤
│ MASTER LEVEL SCORE = Sum of Categories 1–6 (6.0 – 60.0 pts / 10.0% – 100.0%)           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mathematical Formulation
For each Category $C_k$ ($k \in \{1, \dots, 6\}$):
$$\text{Category Score}_k = \frac{\text{Criterion}_{k.1} + \text{Criterion}_{k.2} + \text{Criterion}_{k.3}}{3} \quad (1.00 \le \text{Category Score}_k \le 10.00)$$

$$\text{Master Quality Score} = \sum_{k=1}^{6} \text{Category Score}_k \quad (6.00 \le \text{Master Score} \le 60.00)$$

$$\text{Normalized Percentage} = \frac{\text{Master Quality Score}}{60} \times 100\%$$

---

## 2. Detailed Expert Panel Rubrics & Scoring Criteria

### Chair 1: Chief Spatial Architect — Spatial Architecture & Layout Rhythm
*Domain: Room geometry, architectural variety, wayfinding landmarks, and avoidance of empty transit.*

* **Criterion 1.1: Room-to-Corridor Hierarchy & Anti-Box Geometry (1–10)**
  * *10*: Masterful spatial cadence. Alternates fluidly between expansive vaulted chambers (3–5 tiles wide), colonnades, circular atriums, and tight transition halls. Central open areas contain stone pillar columns (`WALL` islands) or sunken plazas.
  * *6–8*: Varied rooms with clear hierarchy, though some sections still feel like grid mazes.
  * *1–5*: Dominantly a monotonous 1-tile grid box with uniform corridor widths and zero architectural room feel.

* **Criterion 1.2: Spatial Landmarks & Wayfinding Anchors (1–10)**
  * *10*: Strong visual centers (altars, fountain basins, stone dais, archways) that provide instant cognitive orientation. Spawns and exits are integrated into the architecture (e.g., West terrace to North altar), avoiding generic corner-to-corner traps.
  * *6–8*: Moderate orientation anchors; spawn and exit are decoupled from corners, but landmarks lack strong thematic punch.
  * *1–5*: Generic corner-to-corner layout (`(1, 1)` spawn, `(W-2, H-2)` exit) with interchangeable, featureless branches.

* **Criterion 1.3: Transit Flow & Loopback Shortcuts (1–10)**
  * *10*: Flawless circular flow. Upon retrieving an objective (key, lever, relic), circular loopbacks, unlocked shortcut doors, or one-way passages route the player forward to the next challenge with **zero empty backtracking**.
  * *6–8*: Minimal backtracking ($< 8$ empty steps) to return to main intersections.
  * *1–5*: Severe backtracking penalty. Player must retrace 16–35+ steps through cleared, barren corridors to return to a locked door.

---

### Chair 2: Systems & Puzzle Mechanics Director — Gating Integrity & Logic
*Domain: Mathematical solvability, lock-and-key dependencies, key economy, and cognitive satisfaction.*

* **Criterion 2.1: Zero-Bypass Gating & Sequence Security (1–10 - Gatekeeper)**
  * *10*: 100% mathematically airtight. Verified by state-space BFS solver that every single door, key, lever, ramp, or bridge deck on the critical path is strictly required. Zero bypasses exist.
  * *6–8*: Mechanically secure, but sequence allows accidental key reordering without consequence.
  * ***AUTOMATIC 0/10 & AUDIT REJECTION***: Any level where the exit can be reached while bypassing a locked door or puzzle mechanism.

* **Criterion 2.2: Key & Entity Economy (1–10)**
  * *10*: Pristine entity economy. Every placed key, switch, and obstacle has an unambiguous, critical purpose. Zero orphaned keys, redundant barriers, or misleading clutter.
  * *6–8*: Good economy, but secondary bonus items feel disconnected from the environment.
  * *1–5*: Sloppy entity placement; keys placed adjacent to their own door, or unused keys left over upon reaching the exit.

* **Criterion 2.3: Cognitive Insight & "Aha!" Escalation (1–10)**
  * *10*: Rewarding "Aha!" realizations. Progress requires spatial deduction, elevation foresight, or color-resonance planning rather than brute-force wandering.
  * *6–8*: Engaging puzzles that require logical thought, though steps are somewhat straightforward.
  * *1–5*: Mindless maze transit requiring zero thought; purely a test of patience in finding a hidden dead-end.

---

### Chair 3: Art & Visual Director — Visual Aesthetics & Environmental Polish
*Domain: Biome thematic fidelity, texture depth, lighting, props, and camera rotation stability.*

* **Criterion 3.1: Thematic Palette & Biome Cohesion (1–10)**
  * *10*: Exquisite color harmony matching the biome theme (Dungeon, Temple, Caverns, Jungle, Lava, Citadel). High contrast between passable floors, solid walls, and interactive entities.
  * *6–8*: Clean thematic palette with good contrast, but standard color schemes.
  * *1–5*: Muddy or jarring color contrasts that cause visual fatigue or obscure game elements.

* **Criterion 3.2: Surface Depth, Shading & Vector Fidelity (1–10)**
  * *10*: High-definition vector SVG rendering with multi-layered stone bevels, flagstone paving patterns, drop shadows under elevated bridges, and wall drop relief.
  * *6–8*: Partial vector assets or textured fills with decent 2.5D elevation cues.
  * *1–5*: Flat solid-color Canvas 2D rectangle fills (`#1e293b`, `#334155`) lacking textures, surface grain, or shading depth.

* **Criterion 3.3: Environmental Props & Thematic Detailing (1–10)**
  * *10*: Richly furnished environment: wall sconces, glowing braziers, trailing moss/vines, carved floor inlays, ancient runes, and cracked stonework.
  * *6–8*: Moderate prop density (placed torches and occasional wall decor).
  * *1–5*: Barren, clinical slate walls devoid of decorative props or environmental storytelling items.

---

### Chair 4: Creative Director / Pacing Lead — Kishōtenketsu Structure & Pacing
*Domain: 4-stage narrative progression, mechanical novelty, and tension escalation.*

* **Criterion 4.1: Kishōtenketsu Stage Purity & Focus (1–10)**
  * *10*: Absolute fidelity to its structural role:
    * *Ki (Intro)*: Crystal-clear presentation of the core mechanic in isolation.
    * *Shō (Development)*: Harmonious expansion across parallel wings or dual paths.
    * *Ten (Twist)*: Genuine subversion of player expectations with fresh constraints or perspective shifts.
    * *Ketsu (Synthesis)*: Grand, multi-layered culmination harmonizing all chapter mechanics.
  * *6–8*: Clear alignment with the stage, but slight conceptual dilution.
  * *1–5*: Disjointed or chaotic design that ignores the chapter's pacing curve.

* **Criterion 4.2: Mechanical Novelty & Innovation (1–10)**
  * *10*: Fresh spatial paradigm (e.g., perpendicular bridge weaves, elevated key altars, carryable animal statues, rotating camera perspective).
  * *6–8*: Standard application of established mechanics with a minor fresh twist.
  * *1–5*: Derivative clone of an earlier level with geometry scaled up or corridors lengthened.

* **Criterion 4.3: Tension Curve & Complexity Progression (1–10)**
  * *10*: Impeccable cognitive flow. Builds suspense and spatial curiosity without creating player fatigue or frustrating deadlocks.
  * *6–8*: Solid progression with minor pacing lulls.
  * *1–5*: Sudden erratic difficulty spikes, tedious transit slogs, or trivial non-challenges.

---

### Chair 5: UX & Accessibility Lead — Ergonomics, Calibration & Controls
*Domain: Par calibration, sightline readability, touch ergonomics, and click-to-move navigation.*

* **Criterion 5.1: Empirical Par Step Calibration (1–10)**
  * *10*: Mathematically rigorous par benchmarks. Par steps calculated strictly as $\lceil \text{BFS}_{\text{optimal}} \times 1.15 \rceil$, allowing a 15% margin for human pathing. Par times reflect steady movement.
  * *6–8*: Par steps within $\pm 10\%$ of optimal curve; fair for casual play.
  * *1–5*: Impossible par targets ($< \text{BFS}$ length) or excessively lenient filler budgets.

* **Criterion 5.2: Sightline Clarity & Fog-of-War Ergonomics (1–10)**
  * *10*: Comfortable view radius (6–8 tiles). Strategic wall cutaways and wide archways reveal glimpses of distant rewards, guiding exploration organically. Fog reveals smoothly without disorienting blind spots.
  * *6–8*: Adequate visibility; occasional tight corner turns under fog.
  * *1–5*: Blind stumbling through opaque darkness with zero horizon cues, forcing tedious tile-by-tile hugging.

* **Criterion 5.3: Multi-Input Comfort & Touch Playability (1–10)**
  * *10*: Flawless playability across desktop keyboard (WASD/Arrows), click-to-move BFS auto-pathing, and mobile touch. Ample room clearance for easy touch targeting.
  * *6–8*: Clean desktop play, minor touch targeting friction on dense corners.
  * *1–5*: Frustrating input collisions, claustrophobic 1-tile bottlenecks that impede touch tap-to-move.

---

### Chair 6: Narrative & World-Building Director — Narrative Immersion & Storytelling
*Domain: Diegetic lore, environmental storytelling, sense of antiquity, and quest payoff.*

* **Criterion 6.1: Diegetic Lore & Inscriptions (1–10)**
  * *10*: Atmospheric, evocative Architect Journal notes, ancient stone carvings (`inscriptions`), and environmental riddle tablets that deepen world lore while offering subtle navigational guidance.
  * *6–8*: Pleasant lore tablets with basic narrative context.
  * *1–5*: Generic filler text ("Level 2: Find the key") or completely absent lore notes.

* **Criterion 6.2: Sense of Place & Environmental Believability (1–10)**
  * *10*: The level feels like an authentic ancient ruin, forgotten cathedral, sunken temple, or clockwork bastion—not an abstract math maze. Architectural spaces make functional sense.
  * *6–8*: Good thematic touches that hint at an authentic space.
  * *1–5*: Purely an abstract artificial grid with arbitrary walls and zero sense of place.

* **Criterion 6.3: Climactic Payoff & Milestone Resolution (1–10)**
  * *10*: Exhilarating conclusion. The exit portal or final chamber feels like an earned sanctum, rewarding the player with visual fanfare, story advancement, and a genuine milestone feeling.
  * *6–8*: Satisfying exit placement with clear visual indicators.
  * *1–5*: Anticlimactic exit jammed into a random corridor corner.

---

## 3. Official Quality Tiers & Release Gating

| Quality Tier | Master Score Range (/60) | Percentage | Quality Classification & Release Policy |
| :---: | :---: | :---: | :--- |
| **S-Tier** | **52.00 – 60.00** | **86.7% – 100.0%** | **Masterwork Standard**: Exemplary architecture, zero backtrack, rich vector art, perfect par calibration. Approved for spotlight features. |
| **A-Tier** | **45.00 – 51.99** | **75.0% – 86.5%** | **Release Candidate Standard**: High mechanical polish, airtight gating, room hierarchy, and engaging narrative. Meets all production release criteria. |
| **B-Tier** | **37.00 – 44.99** | **61.7% – 74.8%** | **Solid Foundation / Polish Needed**: Structurally sound, unbypassable, but requires loopback shortcuts, wider rooms, or richer vector textures. |
| **C-Tier** | **28.00 – 36.99** | **46.7% – 61.5%** | **Work-in-Progress / Prototype**: Functional but compromised by empty backtracking, 1-tile corridor grids, flat canvas fills, or pacing drag. |
| **F-Tier** | **< 28.00** | **< 46.7%** | **Unacceptable / Immediate Overhaul Required**: Fails gating integrity, bypassable, disorienting, or mechanically broken. |

### Automated Release Gate Thresholds
For a level to be approved for production release:
1. **Master Score** must be $\ge 45.00 / 60.00$ (**A-Tier** or higher).
2. **Chair 2 (Gating Integrity)** must score a minimum of **9.50 / 10.00** (Criterion 2.1 must be **10.0 / 10.0**).
3. **Transit Backtracking (Criterion 1.3)** must score $\ge 7.0 / 10.0$ (Zero empty runs $> 8$ tiles).
4. **Par Step Calibration (Criterion 5.1)** must be empirically verified by solver ($parSteps = \lceil BFS \times 1.15 \rceil$).
