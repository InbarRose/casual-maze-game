# Expert Panel Level Audit Rubric & Quality Control Standard

This document establishes the official multi-perspective judging rubric, granular scoring dimensions, scrutiny standards, and quality thresholds for auditing all campaign levels, tutorial chapters, and episodic story sagas in the **Casual Maze Game**.

* **Audit Standard**: Expert Panel Quality Control Standard (Game Design, Visual Storytelling & Aesthetics Edition)
* **Version**: `4.1.0`
* **Governing ADR**: [`docs/adr/0045-level-design-and-visual-scoring-framework.md`](adr/0045-level-design-and-visual-scoring-framework.md)
* **Auditing Philosophy**: **Simulated 8-Chair Expert Panel Review.** Every level across the platform is subjected to rigorous scrutiny by eight domain expert judges specializing in Game Design, 3D Spatial Traversal, Visual Art & Shaders, Visual Storytelling, Novelty & Subversion, Fun & Whimsical Humor, Tension & Suspense, and Cognitive Challenge. Each judge evaluates three distinct criteria on an absolute **1.0 to 10.0 scale** (24 criteria total). The Category score is computed as the arithmetic mean of these three criteria, producing a Master Quality Score out of 80.00 (and normalized percentage out of 100.0%).

---

## 1. Expert Panel Evaluation Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        8-CHAIR EXPERT PANEL AUDIT SYSTEM (RUBRIC v4.1.0)                         │
├─────────────────────────────────┬─────────────────────────────────┬──────────────────────────────┤
│ Chair 1: Spatial & Labyrinth    │ Chair 2: 3D Systems & Vertical  │ Chair 3: Art & Shaders       │
│ • 1.1 Corridor Inertia (1–10)   │ • 2.1 Viaducts & Underpasses(10)│ • 3.1 Biome Harmony (1–10)   │
│ • 1.2 Landmarks & Wayfinding(10)│ • 2.2 Wall-Walk Ramparts (1–10) │ • 3.2 2.5D Depth & Shading(10│
│ • 1.3 Flow & Loopbacks (1–10)   │ • 2.3 Ramp Traversal Ease (1–10)│ • 3.3 Dynamic Shaders (1–10) │
│ Category 1: Avg (1.00–10.00)    │ Category 2: Avg (1.00–10.00)    │ Category 3: Avg (1.00–10.00) │
├─────────────────────────────────┼─────────────────────────────────┼──────────────────────────────┤
│ Chair 4: Visual Storytelling    │ Chair 5: Novelty & Subversion   │ Chair 6: Fun, Juice & Humor  │
│ • 4.1 Diegetic Antiquity (1–10) │ • 5.1 Kishōtenketsu Novelty(10) │ • 6.1 Tactile Feel & Juice(10│
│ • 4.2 Environmental Clues (1–10)│ • 5.2 Spatial Subversion (1–10) │ • 6.2 Wry Architect Notes(10)│
│ • 4.3 Sanctum Framing (1–10)    │ • 5.3 Cognitive "Aha!" (1–10)   │ • 6.3 Playful Secrets (1–10) │
│ Category 4: Avg (1.00–10.00)    │ Category 5: Avg (1.00–10.00)    │ Category 6: Avg (1.00–10.00) │
├─────────────────────────────────┼─────────────────────────────────┴──────────────────────────────┤
│ Chair 7: Tension & Suspense     │ Chair 8: Cognitive Challenge & Gating                          │
│ • 7.1 Hazard Rhythm (1–10)      │ • 8.1 Zero-Bypass Gating (1–10 - Gatekeeper)                   │
│ • 7.2 Sentinel Evasion (1–10)   │ • 8.2 Entity Economy & Logic (1–10)                            │
│ • 7.3 Fog Dread & Catwalks (1–10│ • 8.3 Empirical Par Calibration (1–10)                         │
│ Category 7: Avg (1.00–10.00)    │ Category 8: Avg (1.00–10.00)                                   │
├─────────────────────────────────┴────────────────────────────────────────────────────────────────┤
│ MASTER LEVEL QUALITY SCORE = Sum of Categories 1–8 (8.00 – 80.00 pts / 10.0% – 100.0%)           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mathematical Formulation
For each Category $C_k$ ($k \in \{1, \dots, 8\}$):
$$\text{Category Score}_k = \frac{\text{Criterion}_{k.1} + \text{Criterion}_{k.2} + \text{Criterion}_{k.3}}{3} \quad (1.00 \le \text{Category Score}_k \le 10.00)$$

$$\text{Master Quality Score} = \sum_{k=1}^{8} \text{Category Score}_k \quad (8.00 \le \text{Master Score} \le 80.00)$$

$$\text{Normalized Percentage} = \frac{\text{Master Quality Score}}{80.00} \times 100.0\%$$

---

## 2. Detailed 8-Chair Rubrics & Scoring Criteria

### Chair 1: Chief Spatial Architect — Spatial Architecture & Labyrinth Topology
*Domain: Maze corridor flow, directional inertia, spatial rhythm, wayfinding landmarks, and avoidance of barren transit.*

* **Criterion 1.1: Corridor Inertia & Anti-Homogeneity (1.0–10.0)**
  * *10*: Masterful maze cadence. Features winding, organic corridors with high directional inertia ($\ge 70\%$ persistence along straight hallway runs $\ge 3$ tiles) alternating with purposeful 90° blind corners, deceptive dead-ends, and expansive central chambers (3–5 tiles wide). Zero solid $4\times 4$ dead spaces ($\text{DeadSpace}_{\ge 4\times 4} = 0$).
  * *7–9*: Strong layout variety with solid directional inertia, though occasional segments feel slightly square.
  * *4–6*: Moderate layout; repetitive 1-tile grid tracks or excessive sharp zigzags lacking spatial breathing room.
  * *1–3*: Monotonous, uniform grid box; dead space voids $\ge 4\times 4$ present or barcode stripe corridors.

* **Criterion 1.2: Dynamic Spatial Anchors & Wayfinding (1.0–10.0)**
  * *10*: Exceptional mental mapping. Features prominent visual anchors (central courtyards, fountain basins, stone daises, archways, distinct floor inlays). Dynamic spawn and exit placements (e.g., center courtyard, west terrace, sunken crypt) rather than repetitive generic corner-to-corner defaults (`(1,1) -> (W-2, H-2)`).
  * *7–9*: Clear landmarks and varied anchors; spawn/exit decoupled from corners with good thematic punch.
  * *4–6*: Moderate orientation anchors; layout is somewhat disorienting under fog or lacks memorable centerpieces.
  * *1–3*: Featureless, symmetrical maze with zero navigational landmarks, forcing blind trial-and-error.

* **Criterion 1.3: Transit Flow & Zero-Backtrack Loopbacks (1.0–10.0)**
  * *10*: Flawless circular circulation. Upon retrieving a distant objective (key, relic, lever activation), circular ambulatory loopbacks, unlocked shortcut gates, or one-way passages route the explorer forward to the next challenge with **zero empty backtracking** ($0$ empty steps through cleared halls).
  * *7–9*: Minimal backtracking ($< 6$ empty steps) to return to main intersections.
  * *4–6*: Noticeable backtracking penalty ($7–15$ empty steps) through cleared corridors.
  * *1–3*: Punishing backtracking slog ($> 16$ empty steps) retracing footsteps across barren hallways.

---

### Chair 2: 3D Systems & Verticality Director — Multi-Elevation & 3D Traversal
*Domain: Elevated viaducts, underpasses, rampart battlements, directional ramps, and vertical perspective.*

* **Criterion 2.1: Multi-Elevation Viaducts & Underpasses (1.0–10.0)**
  * *10*: Deep three-dimensional spatial interplay. Overhead bridges (`B_EW`, `B_NS`) and elevated stone platforms (`PLATFORM`) span across lower ground corridors, creating true underpass tunnels. Players cross over or under separate transit networks with zero collision ambiguity.
  * *7–9*: Clean multi-elevation crossings; underpasses and overpasses connect distinct regions logically.
  * *4–6*: Single isolated bridge with limited spatial connection to surrounding architecture.
  * *1–3*: Completely flat 2D layout without elevation, or broken bridge decks blocking travel axes.

* **Criterion 2.2: Wall-Walk Ramparts & Overlook Scouting (1.0–10.0)**
  * *10*: Elevated vantage points. High battlements (`WALL_WALK`) encircle lower courtyards, allowing players to scout lower keys, doors, and patroller routes from above via multi-elevation Fog of War line-of-sight before descending into the labyrinth.
  * *7–9*: Walkable ramparts providing good overview of surrounding rooms and hazards.
  * *4–6*: Wall walkways present but visually occluded or offering limited reconnaissance value.
  * *1–3*: Inaccessible walls or impassable rampart dead-ends.

* **Criterion 2.3: Directional Ramp Alignment & Traversal Ease (1.0–10.0)**
  * *10*: Flawless ramp transitions. Directional ramps (`R_N`, `R_S`, `R_E`, `R_W`) are perfectly aligned along their longitudinal travel axis, featuring smooth height interpolation without sprite clipping, and clear chevron arrows guiding ascent/descent.
  * *7–9*: Intuitive ramp placement with clear approach corridors.
  * *4–6*: Minor approach awkwardness (e.g., perpendicular hallway entrance requiring tight pivot).
  * *1–3*: Broken ramp orientations blocking entry or causing false collision rejections.

---

### Chair 3: Art & Visual Aesthetics Director — Visual Aesthetics, Shaders & Vector Polish
*Domain: Biome thematic fidelity, 2.5D architectural depth, lighting, surface shaders, and decorative props.*

* **Criterion 3.1: Thematic Palette Harmony & Contrast (1.0–10.0)**
  * *10*: Exquisite color harmony matching the biome theme (Dungeon, Temple, Caverns, Jungle, Lava, Citadel, Aqueduct, Prismatic). High visual contrast between passable floors, solid walls, interactive items, and hazard zones. Zero eye strain or muddy visual confusion.
  * *7–9*: Cohesive thematic palette with crisp contrast across floor, wall, and entity elements.
  * *4–6*: Standard palette with acceptable contrast, but lacks visual warmth or thematic flair.
  * *1–3*: Muddy, low-contrast canvas fills or jarring colors obscuring walkable tiles or hazards.

* **Criterion 3.2: 2.5D Architectural Depth, Drop Shadows & Masonry Bevels (1.0–10.0)**
  * *10*: Superb spatial depth perception. High-definition vector SVG rendering with 4-stage stone bevels, textured flagstone pavers, Roman vaulted underpass archways with masonry keystones and tunnel mouth drop shadows, crenellated coping on wall walks, and dual elevation player drop shadows (contact upper shadow + detached ground shadow at Z=0).
  * *7–9*: Rich 2.5D depth cueing with clean drop shadows, wall drops, and visible bridge decks.
  * *4–6*: Basic depth sorting with flat drop shadows; lacks underpass archway details or stone bevels.
  * *1–3*: Flat Canvas 2D rectangle fills devoid of elevation cues, bevels, or depth perspective.

* **Criterion 3.3: Dynamic Surface Shaders & Light Cones (1.0–10.0)**
  * *10*: Richly dressed environmental atmosphere: animated wall torch sconces casting radial light flares, procedural surface shaders (water caustics, magma bubbling, crystal glints), ambient props (moss patches, water lilies, fallen pebbles, runic carvings), and secret wall (`SW`) fracture lines.
  * *7–9*: Generous decorative props and ambient details creating an authentic sense of antiquity.
  * *4–6*: Sparse decoration; occasional torches or signposts placed in otherwise bare halls.
  * *1–3*: Completely barren, sterile slate walls with zero props, shaders, or decorative embellishments.

---

### Chair 4: World-Building & Narrative Lead — Visual Storytelling & Environmental Narrative
*Domain: Diegetic history, ruin purpose, environmental clues, and climactic milestone payoff.*

* **Criterion 4.1: Diegetic Antiquity & Architectural Purpose (1.0–10.0)**
  * *10*: The space makes visceral architectural sense. Corridors and chambers do not feel like arbitrary puzzle mazes; they convey the physical history of a sunken aqueduct drainage vault, a molten foundry blast furnace, a monastic scriptorium archive, or an astronomical observatory.
  * *7–9*: Strong thematic atmosphere that suggests an authentic physical environment.
  * *4–6*: Recognizable theme, though spatial layout feels somewhat artificial.
  * *1–3*: Purely an abstract artificial grid with arbitrary walls and zero sense of place.

* **Criterion 4.2: Environmental Narrative Clues & Worn Ruins (1.0–10.0)**
  * *10*: Environmental storytelling. Cracked flagstones, water seepages, ancient inscriptions, and carved murals provide organic clues for secret walls (`SW`), puzzle sequences, and navigating fog-shrouded labyrinths without relying on intrusive text popups.
  * *7–9*: Good visual clues and atmospheric carvings that reward observant players.
  * *4–6*: Decorative elements are purely cosmetic with no connection to puzzle solutions.
  * *1–3*: Sterile, untextured walls devoid of history, clues, or environmental personality.

* **Criterion 4.3: Climactic Sanctum Framing & Milestone Payoff (1.0–10.0)**
  * *10*: Exhilarating conclusion. The exit portal or final chamber feels like an earned sanctum, rewarding the explorer with visual fanfare (glowing sunlight rays, daylight exit stairs, portal halos), story advancement, and a genuine milestone feeling.
  * *7–9*: Satisfying exit placement with clear visual indicators and thematic framing.
  * *4–6*: Standard exit placement with adequate visual cues.
  * *1–3*: Anticlimactic exit jammed into a random corridor corner without fanfare.

---

### Chair 5: Innovation & Novelty Lead — Novelty, Subversion & "Aha!" Discovery
*Domain: Kishōtenketsu twists, spatial subversion, mechanical innovation, and cognitive discovery.*

* **Criterion 5.1: Kishōtenketsu Stage Progression & Novelty (1.0–10.0)**
  * *10*: Absolute fidelity to its structural role with fresh novelty:
    * *Ki (Intro)*: Clean presentation of the core mechanic in isolation with safe experimentation.
    * *Shō (Development)*: Harmonious expansion across parallel wings, dual paths, or layered obstacles.
    * *Ten (Twist)*: Genuine subversion of player expectations with fresh constraints, inverted levers, or perspective shifts.
    * *Ketsu (Synthesis)*: Grand, multi-layered culmination harmonizing all chapter mechanics into a memorable finale.
  * *7–9*: Clear alignment with its stage purpose; solid pacing curve within the chapter arc.
  * *4–6*: Minor conceptual dilution; acts somewhat interchangeably with adjacent levels.
  * *1–3*: Disjointed or chaotic design that ignores the chapter's pacing curve.

* **Criterion 5.2: Spatial Subversion & Expectation Defiance (1.0–10.0)**
  * *10*: Daring spatial surprise. Defies conventional maze tropes: apparent dead-ends open into grand hidden halls upon flipping a distant counterweight lever, two-way teleporters create non-Euclidean shortcuts, or 4-way camera rotation ([Q]/[R]) reveals previously occluded underpass tunnels.
  * *7–9*: Clever layout twists that surprise the player without feeling unfair or confusing.
  * *4–6*: Conventional maze layout with minor predictable twists.
  * *1–3*: Monotonous predictability; identical corridor branches without spatial subversion.

* **Criterion 5.3: Cognitive "Aha!" Eureka Moments (1.0–10.0)**
  * *10*: Rewarding intellectual payoff. Puzzles and labyrinth geography require mental deduction, elevation foresight, or color resonance planning. The solution feels brilliantly obvious in hindsight, producing a genuine smile upon discovery.
  * *7–9*: Engaging puzzles that require logical thought and clear observation.
  * *4–6*: Somewhat straightforward mechanics requiring minimal deduction.
  * *1–3*: Mindless wandering, tedious trial-and-error, or brute-force key hunting.

---

### Chair 6: Fun & Juice Director — Fun, Juice, Tactile Delight & Whimsical Humor
*Domain: Juicy micro-interactions, playful secrets, wry architect humor, and moment-to-moment delight.*

* **Criterion 6.1: Micro-Interactions, Tactile Feel & Juice (1.0–10.0)**
  * *10*: Sensory delight on every movement. Crisp lever toggle clicks, key unlock sparkles, gem collection glints, smooth character step bobbing with pitch-jittered footsteps, and responsive HUD feedback that makes moving through the labyrinth inherently joyful.
  * *7–9*: Polished audiovisual feedback with satisfying interactive responses.
  * *4–6*: Basic feedback; actions work but lack sensory flair or celebratory particle bursts.
  * *1–3*: Stiff, silent, or unresponsive interactions with zero tactile feedback.

* **Criterion 6.2: Wry Architect Journal Notes & Diegetic Humor (1.0–10.0)**
  * *10*: Atmospheric, witty worldbuilding. Architect Journal tablets feature dry, humorous observations ("The master builder was obsessed with dead ends; he died in one"), cheeky warnings, or ancient guild banter that injects personality without breaking fantasy immersion.
  * *7–9*: Well-written, atmospheric lore notes with engaging tone and occasional wit.
  * *4–6*: Dry, purely functional notes ("Switch activates door").
  * *1–3*: Completely absent lore or generic placeholder text.

* **Criterion 6.3: Playful Secrets & Easter Egg Discoveries (1.0–10.0)**
  * *10*: Delightful optional discoveries. Subtle cracked walls (`SW`) invite keen-eyed players to find hidden sanctuaries housing radiant sunstones, gilded animal statues, or cheeky dead-end tablets ("Nothing here. Except this pristine sapphire.").
  * *7–9*: Rewarding secret chambers with good visual hints and valuable collectibles.
  * *4–6*: Few or no secret rooms, but main path is enjoyable.
  * *1–3*: Zero secrets, easter eggs, or optional discoveries; strictly linear transit.

---

### Chair 7: Tension & Danger Lead — Tension, Suspense & Perilous Hazards
*Domain: Suspenseful hazard rhythms, sentinel evasion, fog-of-war dread, and near-miss thrills.*

* **Criterion 7.1: Hazard Rhythm & Suspenseful Timing (1.0–10.0)**
  * *10*: Pulse-pounding rhythmic timing. Timed flame vents and floor spike traps cycle with clear audio-visual anticipation (glowing embers, hiss warnings). Safe harbors are placed just within reach, rewarding calm observation and decisive dashes.
  * *7–9*: Well-calibrated hazard cycles with fair telegraphing and clear evasion windows.
  * *4–6*: Static or overly forgiving hazards with minimal threat level.
  * *1–3*: Unfair instant kills with zero telegraphing, or frustrating desynchronized timings.

* **Criterion 7.2: Sentinel Patrol Stealth & Near-Miss Evasion (1.0–10.0)**
  * *10*: Thrilling stealth dynamics. Patrolling sentinels trace predictable routes with visible facing directions. Winding corridors feature tactical alcoves where the explorer can duck out of sight as the sentinel glides past within a hair's breadth.
  * *7–9*: Clean patrol routes with accessible evasion alcoves and fair detection ranges.
  * *4–6*: Sentinels present but easily avoided without tension, or confined to small loops.
  * *1–3*: Telepathic sentinels with unavoidable collision traps, or completely broken patrol loops.

* **Criterion 7.3: Fog-of-War Dread & Vertiginous Catwalks (1.0–10.0)**
  * *10*: Atmospheric suspense. Fog of war naturally obscures distant corners, heightening the thrill of turning blind 90° elbows. Narrow elevated catwalks crossing over black bottomless chasms create authentic vertigo and caution.
  * *7–9*: Atmospheric fog with good tension on unexplored paths; clean light radii.
  * *4–6*: Fog is somewhat flat or provides too much vision, dampening tension.
  * *1–3*: Completely absent tension, or impenetrable blackness that causes blind stumbling.

---

### Chair 8: Systems & Calibration Lead — Cognitive Challenge, Gating & Calibration
*Domain: Mathematical solvability, unbypassable locks, entity economy, and empirical par calibration.*

* **Criterion 8.1: Zero-Bypass Gating Integrity (1.0–10.0 - Gatekeeper)**
  * *10*: 100% mathematically airtight. Verified by automated BFS state-space solver that every single door, key, lever, ramp, or bridge deck on the critical path is strictly required. Zero bypasses exist.
  * *7–9*: Mechanically secure and unbypassable, but allows minor non-critical key reordering.
  * ***AUTOMATIC 0/10 & AUDIT REJECTION***: Any level where the exit can be reached while bypassing a locked door or puzzle mechanism.

* **Criterion 8.2: Entity Economy & Multi-Step Logic (1.0–10.0)**
  * *10*: Pristine entity economy. Every key, door, lever, and hazard has an unambiguous, critical purpose in a multi-step dependency chain. Zero orphaned keys, redundant barriers, or misleading clutter.
  * *7–9*: Solid entity economy with clear cause-and-effect puzzle links.
  * *4–6*: Slight entity clutter or keys placed adjacent to their own door.
  * *1–3*: Sloppy entity placement, unused keys, or broken puzzle links.

* **Criterion 8.3: Empirical Par Step Calibration (1.0–10.0)**
  * *10*: Mathematically calibrated par targets. Par steps are calculated strictly as $parSteps \in [1.12, 1.25] \times \text{BFS}_{\text{optimal}}$, allowing a fair 15–20% margin for human exploration. Par times accurately reflect steady player transit.
  * *7–9*: Par steps within $\pm 10\%$ of optimal curve; fair for casual play.
  * *4–6*: Par targets slightly loose or tight, requiring minor recalibration.
  * *1–3*: Impossible par targets ($< \text{BFS}$ length) or excessively lenient filler budgets.

---

## 3. Official Quality Tiers & Release Gating

| Quality Tier | Master Score Range (/80) | Normalized % | Quality Classification & Release Policy |
| :---: | :---: | :---: | :--- |
| **S+-Tier** | **72.00 – 80.00** | **90.0% – 100.0%** | **Masterwork Landmark**: Exemplary spatial cadence, deep 3D verticality, exquisite vector art, palpable tension, delightful humor, and profound worldbuilding. Approved for spotlight features. |
| **S-Tier** | **68.00 – 71.99** | **85.0% – 89.9%** | **Exemplary Architecture & Delight**: High mechanical polish, airtight gating, underpass archways, witty lore notes, and suspenseful hazard pacing. |
| **A+-Tier** | **64.00 – 67.99** | **80.0% – 84.9%** | **High-Polish Release Candidate**: Airtight gating, zero dead space, rich props, tactile juice, and empirically calibrated pars. Meets all production release standards. |
| **A-Tier** | **60.00 – 63.99** | **75.0% – 79.9%** | **Production Release Standard (Minimum Gate)**: Solid foundation, unbypassable locks, good transit flow, clean visuals, and satisfying challenge. |
| **B-Tier** | **50.00 – 59.99** | **62.5% – 74.9%** | **Polish Needed**: Structurally sound, unbypassable, but requires loopback shortcuts, wider rooms, or richer vector textures. |
| **C-Tier** | **38.00 – 49.99** | **47.5% – 62.4%** | **Work-in-Progress / Prototype**: Functional but compromised by empty backtracking, 1-tile corridor grids, flat canvas fills, or pacing drag. |
| **F-Tier** | **< 38.00** | **< 47.5%** | **Unacceptable / Immediate Overhaul Required**: Fails gating integrity, bypassable, disorienting, or mechanically broken. |

### Mandatory Automated Release Gate Thresholds
For a level to be approved for production release:
1. **Master Score** must be $\ge 60.00 / 80.00$ (**A-Tier** or higher, $\ge 75.0\%$).
2. **Chair 8 (Gating Integrity)** must score **10.0 / 10.0** (Criterion 8.1 is an unbypassable gatekeeper).
3. **Dead Space Metric**: $\text{DeadSpace}_{\ge 4\times 4} = 0$ (Zero solid $4\times 4$ bedrock blocks).
4. **Transit Backtracking (Criterion 1.3)** must score $\ge 7.0 / 10.0$ (Zero empty runs $> 8$ tiles).
5. **Par Step Calibration (Criterion 8.3)** must be empirically verified by solver ($parSteps \in [1.12, 1.25] \times \text{BFS}_{\text{optimal}}$).
