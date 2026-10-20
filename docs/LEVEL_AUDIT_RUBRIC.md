# Expert Panel Level Audit Rubric & Quality Control Standard

This document establishes the official multi-perspective judging rubric, granular scoring dimensions, scrutiny standards, and quality thresholds for auditing all campaign levels, tutorial chapters, and episodic story sagas in the **Casual Maze Game**.

* **Audit Standard**: Expert Panel Quality Control Standard (Game Design & Visual Aesthetics Edition)
* **Version**: `4.0.0`
* **Governing ADR**: [`docs/adr/0045-level-design-and-visual-scoring-framework.md`](adr/0045-level-design-and-visual-scoring-framework.md)
* **Auditing Philosophy**: **Simulated Expert Panel Review.** Every level across the platform is subjected to rigorous scrutiny by six domain expert judges specializing in Game Design, Spatial Labyrinth Dynamics, Visual Aesthetics, Puzzle Logic, Player Ergonomics, and Narrative Immersion. Each judge evaluates three distinct criteria on an absolute **1.0 to 10.0 scale**. The Category score is computed as the arithmetic mean of these three criteria, producing a rigorous Master Quality Score out of 60.00 (and normalized percentage out of 100.0%).

---

## 1. Expert Panel Evaluation Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        6-CHAIR EXPERT PANEL AUDIT SYSTEM (RUBRIC v4.0.0)                         │
├─────────────────────────────────┬─────────────────────────────────┬──────────────────────────────┤
│ Chair 1: Spatial & Labyrinth    │ Chair 2: 3D Systems & Mechanics │ Chair 3: Art, Visuals & FX   │
│ • 1.1 Corridor Inertia (1–10)   │ • 2.1 Multi-Elevation (1–10)    │ • 3.1 Biome Harmony (1–10)   │
│ • 1.2 Landmarks & Wayfinding(10)│ • 2.2 Zero-Bypass Gating (1–10) │ • 3.2 2.5D Depth & Shading(10│
│ • 1.3 Flow & Loopbacks (1–10)   │ • 2.3 Puzzle Escalation (1–10)  │ • 3.3 Props & Caustics (1–10)│
│ Category 1: Avg (1.00–10.00)    │ Category 2: Avg (1.00–10.00)    │ Category 3: Avg (1.00–10.00) │
├─────────────────────────────────┼─────────────────────────────────┼──────────────────────────────┤
│ Chair 4: Pacing & Structure     │ Chair 5: UX & Ergonomics        │ Chair 6: Narrative & Lore    │
│ • 4.1 Stage Purity (1–10)       │ • 5.1 Par Step Calibration(1–10)│ • 6.1 Diegetic Lore (1–10)   │
│ • 4.2 Mechanical Novelty (1–10) │ • 5.2 Sightline Clarity (1–10)  │ • 6.2 Environmental Sense(10)│
│ • 4.3 Tension Curve (1–10)      │ • 5.3 Multi-Input Comfort (1–10)│ • 6.3 Sanctum Payoff (1–10)  │
│ Category 4: Avg (1.00–10.00)    │ Category 5: Avg (1.00–10.00)    │ Category 6: Avg (1.00–10.00) │
├─────────────────────────────────┴─────────────────────────────────┴──────────────────────────────┤
│ MASTER LEVEL QUALITY SCORE = Sum of Categories 1–6 (6.00 – 60.00 pts / 10.0% – 100.0%)           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mathematical Formulation
For each Category $C_k$ ($k \in \{1, \dots, 6\}$):
$$\text{Category Score}_k = \frac{\text{Criterion}_{k.1} + \text{Criterion}_{k.2} + \text{Criterion}_{k.3}}{3} \quad (1.00 \le \text{Category Score}_k \le 10.00)$$

$$\text{Master Quality Score} = \sum_{k=1}^{6} \text{Category Score}_k \quad (6.00 \le \text{Master Score} \le 60.00)$$

$$\text{Normalized Percentage} = \frac{\text{Master Quality Score}}{60.00} \times 100\%$$

---

## 2. Detailed Expert Panel Rubrics & Scoring Criteria

### Chair 1: Chief Spatial Architect — Labyrinth Topology & Spatial Architecture
*Domain: Maze corridor flow, directional inertia, spatial rhythm, wayfinding landmarks, and avoidance of barren transit.*

* **Criterion 1.1: Corridor Inertia & Anti-Homogeneity (1.0–10.0)**
  * *10*: Masterful maze cadence. Features winding, organic corridors with high directional inertia ($\ge 70\%$ persistence along straight hallway runs $\ge 3$ tiles) alternating with purposeful 90° blind corners, deceptive dead-ends, and expansive central chambers (3–5 tiles wide). Zero solid $4\times 4$ dead spaces ($\text{DeadSpace}_{\ge 4\times 4} = 0$).
  * *7–9*: Strong layout variety with solid directional inertia, though occasional segments feel slightly square.
  * *4–6*: Moderate layout; repetitive 1-tile grid tracks or excessive sharp zigzags lacking spatial breathing room.
  * *1–3*: Monotonous, uniform grid box; dead space voids $\ge 4\times 4$ present or barcode stripe corridors.

* **Criterion 1.2: Spatial Anchoring & Wayfinding (1.0–10.0)**
  * *10*: Exceptional mental mapping. Features prominent visual anchors (central courtyards, fountain basins, stone daises, archways, distinct floor inlays). Dynamic spawn and exit placements (e.g., center courtyard, west terrace, sunken crypt) rather than repetitive generic corner-to-corner defaults (`(1,1) -> (W-2, H-2)`).
  * *7–9*: Clear landmarks and varied anchors; spawn/exit decoupled from corners with good thematic punch.
  * *4–6*: Moderate orientation anchors; layout is somewhat disorienting under fog or lacks memorable centerpieces.
  * *1–3*: Featureless, symmetrical maze with zero navigational landmarks, forcing blind trial-and-error.

* **Criterion 1.3: Transit Flow & Loopback Shortcuts (1.0–10.0)**
  * *10*: Flawless circular circulation. Upon retrieving a distant objective (key, relic, lever activation), circular ambulatory loopbacks, unlocked shortcut gates, or one-way passages route the explorer forward to the next challenge with **zero empty backtracking** ($0$ empty steps through cleared halls).
  * *7–9*: Minimal backtracking ($< 6$ empty steps) to return to main intersections.
  * *4–6*: Noticeable backtracking penalty ($7–15$ empty steps) through cleared corridors.
  * *1–3*: Punishing backtracking slog ($> 16$ empty steps) retracing footsteps across barren hallways.

---

### Chair 2: Systems & Puzzle Mechanics Director — 3D Verticality & Mechanical Systems
*Domain: Mathematical solvability, lock-and-key economy, multi-elevation traversal, and cognitive satisfaction.*

* **Criterion 2.1: Multi-Elevation Integration (1.0–10.0)**
  * *10*: Deep three-dimensional spatial integration. Overhead bridges (`B_EW`, `B_NS`), elevated stone platforms (`PLATFORM`), wall-top battlement walkways (`WALL_WALK`), and directional ramps (`R_*`) create meaningful vertical crossways and underpass intersections. Upper decks allow scouting lower chambers from above.
  * *7–9*: Clean multi-elevation crossings; ramps and bridges are well-positioned with good functional utility.
  * *4–6*: Cosmetic elevation with limited gameplay interplay, or minor ramp alignment friction.
  * *1–3*: Completely flat 2D layout without elevation, or broken bridges blocking travel axes.

* **Criterion 2.2: Zero-Bypass Gating Integrity (1.0–10.0 - Gatekeeper)**
  * *10*: 100% mathematically airtight. Verified by state-space BFS solver that every single door, key, lever, ramp, or bridge deck on the critical path is strictly required. Zero bypasses exist.
  * *7–9*: Mechanically secure and unbypassable, but allows minor non-critical key reordering.
  * ***AUTOMATIC 0/10 & AUDIT REJECTION***: Any level where the exit can be reached while bypassing a locked door or puzzle mechanism.

* **Criterion 2.3: Entity Economy & Puzzle Escalation (1.0–10.0)**
  * *10*: Pristine entity economy and rewarding "Aha!" realization. Every key, switch, hazard, and inspectable has an unambiguous, critical purpose. Progress demands spatial deduction, timing foresight, or color resonance rather than brute-force wandering. Hazards compound progressively with level themes.
  * *7–9*: Solid puzzle design and good entity placement; logical progression throughout.
  * *4–6*: Cluttered entity placement or keys located immediately adjacent to their corresponding door.
  * *1–3*: Pointless busywork, broken lever links, or unchallenging filler items.

---

### Chair 3: Art & Visual Director — Visual Aesthetics, Atmosphere & Biome Fidelity
*Domain: Biome thematic fidelity, 2.5D architectural depth, lighting, surface shaders, and decorative props.*

* **Criterion 3.1: Thematic Palette Harmony & Biome Contrast (1.0–10.0)**
  * *10*: Exquisite color harmony matching the biome theme (Dungeon, Temple, Caverns, Jungle, Lava, Citadel, Aqueduct, Prismatic). High visual contrast between passable floors, solid walls, interactive items, and hazard zones. Zero eye strain or muddy visual confusion.
  * *7–9*: Cohesive thematic palette with crisp contrast across floor, wall, and entity elements.
  * *4–6*: Standard palette with acceptable contrast, but lacks visual warmth or thematic flair.
  * *1–3*: Muddy, low-contrast canvas fills or jarring colors obscuring walkable tiles or hazards.

* **Criterion 3.2: 2.5D Architectural Depth & Shading (1.0–10.0)**
  * *10*: Superb spatial depth perception. High-definition vector SVG rendering with 4-stage stone bevels, textured flagstone pavers, Roman vaulted underpass archways with masonry keystones and tunnel mouth drop shadows, crenellated coping on wall walks, and dual elevation player drop shadows (contact upper shadow + detached ground shadow at Z=0).
  * *7–9*: Rich 2.5D depth cueing with clean drop shadows, wall drops, and visible bridge decks.
  * *4–6*: Basic depth sorting with flat drop shadows; lacks underpass archway details or stone bevels.
  * *1–3*: Flat Canvas 2D rectangle fills devoid of elevation cues, bevels, or depth perspective.

* **Criterion 3.3: Environmental Detailing & Thematic Props (1.0–10.0)**
  * *10*: Richly dressed environmental atmosphere: animated wall torch sconces casting radial light flares, procedural surface shaders (water caustics, magma bubbling, crystal glints), ambient props (moss patches, water lilies, fallen pebbles, runic carvings), and secret wall (`SW`) fracture lines.
  * *7–9*: Generous decorative props and ambient details creating an authentic sense of antiquity.
  * *4–6*: Sparse decoration; occasional torches or signposts placed in otherwise bare halls.
  * *1–3*: Completely barren, sterile slate walls with zero props, shaders, or decorative embellishments.

---

### Chair 4: Creative Director / Pacing Lead — Kishōtenketsu Pacing & Cognitive Flow
*Domain: 4-stage narrative progression, mechanical novelty, and tension escalation.*

* **Criterion 4.1: Kishōtenketsu Stage Purity & Intent (1.0–10.0)**
  * *10*: Absolute fidelity to its structural role:
    * *Ki (Intro)*: Crystal-clear presentation of the core mechanic in isolation with safe experimentation.
    * *Shō (Development)*: Harmonious expansion across parallel wings, dual paths, or layered obstacles.
    * *Ten (Twist)*: Genuine subversion of player expectations with fresh constraints, inverted levers, or perspective shifts.
    * *Ketsu (Synthesis)*: Grand, multi-layered culmination harmonizing all chapter mechanics into a memorable finale.
  * *7–9*: Clear alignment with its stage purpose; solid pacing curve within the chapter arc.
  * *4–6*: Minor conceptual dilution; acts somewhat interchangeably with adjacent levels.
  * *1–3*: Disjointed or chaotic design that ignores the chapter's pacing curve.

* **Criterion 4.2: Mechanical Novelty & Subversion (1.0–10.0)**
  * *10*: Fresh spatial paradigm (e.g., perpendicular bridge weaves, camera perspective shifts [Q]/[R], carryable animal plinths, dynamic counterweight walls, spectral rift routing).
  * *7–9*: Engaging application of mechanics with a distinctive situational twist.
  * *4–6*: Standard application of existing mechanics without significant novelty.
  * *1–3*: Derivative clone of an earlier level with geometry scaled up or corridors lengthened.

* **Criterion 4.3: Tension Curve & Challenge Balancing (1.0–10.0)**
  * *10*: Impeccable cognitive flow. Builds suspense and spatial curiosity through progressive hazard encounters (timed flame vents, patrolling sentinels, deceptive dead-ends) without creating player fatigue or frustrating deadlocks.
  * *7–9*: Well-balanced tension with steady difficulty progression and fair challenge recovery.
  * *4–6*: Minor pacing lulls or mild difficulty spikes.
  * *1–3*: Frustrating deadlocks, cheap instant fails, or trivial non-challenges.

---

### Chair 5: UX & Accessibility Lead — Player Ergonomics, UX & Calibration
*Domain: Par calibration, sightline readability, touch ergonomics, and multi-input navigation.*

* **Criterion 5.1: Empirical Par Step Calibration (1.0–10.0)**
  * *10*: Mathematically rigorous par benchmarks. Par steps calculated strictly as $\lceil \text{BFS}_{\text{optimal}} \times 1.15 \rceil$ to $1.20\times$, providing a fair 15–20% margin for human exploration. Par times accurately reflect steady player transit.
  * *7–9*: Par steps within $\pm 10\%$ of optimal curve; fair for casual play.
  * *4–6*: Par targets slightly loose or tight, requiring minor recalibration.
  * *1–3*: Impossible par targets ($< \text{BFS}$ length) or excessively lenient filler budgets.

* **Criterion 5.2: Sightline Clarity & Fog-of-War Ergonomics (1.0–10.0)**
  * *10*: Comfortable exploration view radius (6–8 tiles). Multi-elevation raycasting illuminates lower ground corridors from upper battlements while stopping at ground walls. Wide archways reveal glimpses of distant rewards, guiding exploration organically without disorienting blind spots.
  * *7–9*: Clean sightlines and fair fog visibility; smooth light attenuation.
  * *4–6*: Occasional tight corner turns under fog or slight visual occlusion behind southern wall drops.
  * *1–3*: Blind stumbling through opaque darkness with zero horizon cues, forcing tedious tile-by-tile hugging.

* **Criterion 5.3: Multi-Input Fluidity & Navigation (1.0–10.0)**
  * *10*: Flawless playability across desktop keyboard (WASD/Arrows), click-to-move BFS auto-pathing, canvas pointer interaction, and mobile touch. Ample room clearance for easy touch targeting; multi-target disambiguation handles nearby items smoothly.
  * *7–9*: Clean desktop play with responsive mouse clicking and smooth movement.
  * *4–6*: Minor touch targeting friction on dense corners or narrow 1-tile bottlenecks.
  * *1–3*: Frustrating input collisions, broken pathfinding, or unresponsive interaction targets.

---

### Chair 6: Narrative & World-Building Director — Narrative Immersion & Diegetic Worldbuilding
*Domain: Diegetic lore, environmental storytelling, sense of antiquity, and quest payoff.*

* **Criterion 6.1: Diegetic Lore & Inscriptions (1.0–10.0)**
  * *10*: Atmospheric, evocative Architect Journal notes, ancient stone carvings (`inscriptions`), and environmental riddle tablets that deepen world lore while offering subtle navigational guidance.
  * *7–9*: Evocative lore tablets with good worldbuilding context and flavor text.
  * *4–6*: Basic lore notes with functional text; somewhat generic phrasing.
  * *1–3*: Generic filler text ("Find the key") or completely absent lore notes.

* **Criterion 6.2: Sense of Place & Environmental Believability (1.0–10.0)**
  * *10*: The level feels like an authentic ancient ruin, sunken aqueduct, clockwork foundry, or celestial observatory—not an abstract math maze. Architectural spaces make functional sense (sluice gates, drainage canals, bell towers, forge chimneys).
  * *7–9*: Strong thematic atmosphere that suggests an authentic physical environment.
  * *4–6*: Recognizable theme, though spatial layout feels somewhat artificial.
  * *1–3*: Purely an abstract artificial grid with arbitrary walls and zero sense of place.

* **Criterion 6.3: Climactic Sanctum & Milestone Payoff (1.0–10.0)**
  * *10*: Exhilarating conclusion. The exit portal or final chamber feels like an earned sanctum, rewarding the explorer with visual fanfare (glowing sunlight rays, daylight exit stairs, portal halos), story advancement, and a genuine milestone feeling.
  * *7–9*: Satisfying exit placement with clear visual indicators and thematic framing.
  * *4–6*: Standard exit placement with adequate visual cues.
  * *1–3*: Anticlimactic exit jammed into a random corridor corner without fanfare.

---

## 3. Official Quality Tiers & Release Gating

| Quality Tier | Master Score Range (/60) | Normalized % | Quality Classification & Release Policy |
| :---: | :---: | :---: | :--- |
| **S+-Tier** | **54.00 – 60.00** | **90.0% – 100.0%** | **Masterwork Landmark**: Exemplary spatial cadence, deep 3D verticality, exquisite vector art, flawless par calibration, and profound narrative immersion. Approved for spotlight features. |
| **S-Tier** | **51.00 – 53.99** | **85.0% – 89.9%** | **Exemplary Architecture**: High mechanical polish, airtight gating, expansive rooms, underpass archways, and engaging pacing. |
| **A+-Tier** | **48.00 – 50.99** | **80.0% – 84.9%** | **High-Polish Release Candidate**: Airtight gating, zero dead space, rich props, and empirically calibrated pars. Meets all production release standards. |
| **A-Tier** | **45.00 – 47.99** | **75.0% – 79.9%** | **Production Release Standard (Minimum Gate)**: Solid foundation, unbypassable locks, good transit flow, and clean visuals. |
| **B-Tier** | **37.00 – 44.99** | **61.7% – 74.8%** | **Polish Needed**: Structurally sound, unbypassable, but requires loopback shortcuts, wider rooms, or richer vector textures. |
| **C-Tier** | **28.00 – 36.99** | **46.7% – 61.5%** | **Work-in-Progress / Prototype**: Functional but compromised by empty backtracking, 1-tile corridor grids, flat canvas fills, or pacing drag. |
| **F-Tier** | **< 28.00** | **< 46.7%** | **Unacceptable / Immediate Overhaul Required**: Fails gating integrity, bypassable, disorienting, or mechanically broken. |

### Mandatory Automated Release Gate Thresholds
For a level to be approved for production release:
1. **Master Score** must be $\ge 45.00 / 60.00$ (**A-Tier** or higher).
2. **Chair 2 (Gating Integrity)** must score **10.0 / 10.0** (Criterion 2.2 is an unbypassable gatekeeper).
3. **Dead Space Metric**: $\text{DeadSpace}_{\ge 4\times 4} = 0$ (Zero solid $4\times 4$ bedrock blocks).
4. **Transit Backtracking (Criterion 1.3)** must score $\ge 7.0 / 10.0$ (Zero empty runs $> 8$ tiles).
5. **Par Step Calibration (Criterion 5.1)** must be empirically verified by solver ($parSteps \in [1.12, 1.25] \times \text{BFS}_{\text{optimal}}$).
