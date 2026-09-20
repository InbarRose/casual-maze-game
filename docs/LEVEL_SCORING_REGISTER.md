# Level Scoring Register & Chapter Audit

This document maintains the official audit register, critical evaluation scores, deduction breakdowns, and iteration directives for all campaign levels and story chapters in the **Casual Maze Game** based on the rigorous [Expert Panel Level Audit Rubric v3.0](LEVEL_AUDIT_RUBRIC.md).

* **Audit Standard**: Expert Panel Quality Control Standard (v3.0.0)
* **Audit Date**: 2026-09-20
* **Auditing Chairs**:
  1. *Chair 1*: Chief Spatial Architect (Room-to-Corridor Hierarchy, Landmarks, Transit Loopbacks)
  2. *Chair 2*: Systems & Puzzle Mechanics Director (Zero-Bypass Gating, Entity Economy, Cognitive Escalation)
  3. *Chair 3*: Art & Visual Director (Biome Palette, Surface Depth/Shading, Environmental Props)
  4. *Chair 4*: Creative Director & Pacing Lead (Kishō Stage Purity, Mechanical Novelty, Tension Curve)
  5. *Chair 5*: UX & Accessibility Lead (Empirical Par Steps, Sightline Clarity, Multi-Input Comfort)
  6. *Chair 6*: Narrative & World-Building Director (Diegetic Lore, Sense of Place, Climax Payoff)
* **Engine Version**: `v1.18.0`
* **Scoring Mechanics**: Each of the 6 Chairs scores 3 granular criteria from **1.0 to 10.0**. The Chair's Category score is the average of its 3 criteria:
  $$\text{Category Score}_k = \frac{\text{Crit}_{k.1} + \text{Crit}_{k.2} + \text{Crit}_{k.3}}{3}, \quad \text{Master Score} = \sum_{k=1}^6 \text{Category Score}_k \in [6.0, 60.0]$$

---

## 1. Master Audit Summary Table

### A. Campaign Megalabyrinth (Chapters 1 & 2 Workshoped; Chapters 3–8 Baseline)

| ID | Title | Chapter / Zone | Kishō | Ch1: Space | Ch2: Gate | Ch3: Art | Ch4: Pace | Ch5: UX | Ch6: Lore | Master (/60) | Tier | Quality Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | First Footsteps | Ch 1: Foundation | Ki | 8.33 | 10.00 | 5.33 | 8.67 | 8.33 | 8.00 | **48.67** | **A** | ✅ Redesigned (Vestibule, Pillars, Loopback) |
| **2** | The Ruby Lock | Ch 1: Foundation | Shō | 8.67 | 10.00 | 5.33 | 8.67 | 8.67 | 8.00 | **49.33** | **A** | ✅ Redesigned (Pillared Vault, 0 Backtrack) |
| **3** | Prismatic Corridors | Ch 1: Foundation | Ten | 8.33 | 10.00 | 5.67 | 8.33 | 8.33 | 8.33 | **49.00** | **A** | ✅ Redesigned (Emerald $\to$ Purple Direct Flow) |
| **4** | The Shrouded Vault | Ch 1: Foundation | Ketsu | 8.67 | 10.00 | 6.00 | 9.00 | 8.33 | 8.67 | **50.67** | **A** | ✅ Redesigned (Triune Gate, Cloister Loop) |
| **5** | The Canopy Bridge | Ch 2: Vertical | Ki | 8.00 | 10.00 | 5.67 | 8.33 | 8.00 | 7.67 | **47.67** | **A** | ✅ Calibrated (Wall Carvings, Par 26/16s) |
| **6** | Canopy Crossings | Ch 2: Vertical | Shō | 8.33 | 10.00 | 5.67 | 8.33 | 8.00 | 8.00 | **48.33** | **A** | ✅ Calibrated (Wall Carvings, Par 48/29s) |
| **7** | The Sunken Chasm | Ch 2: Vertical | Ten | 8.33 | 10.00 | 5.67 | 8.00 | 8.00 | 8.00 | **48.00** | **A** | ✅ Calibrated (Wall Carvings, Par 45/27s) |
| **8** | Citadel of Two Horizons | Ch 2: Vertical | Ketsu | 8.67 | 10.00 | 6.00 | 8.67 | 8.00 | 8.33 | **49.67** | **A** | ✅ Calibrated (Wall Carvings, Par 68/41s) |
| **9** | The Iron Lever | Ch 3: Clockwork | Ki | 5.00 | 7.00 | 3.00 | 5.00 | 5.00 | 5.00 | **30.00** | C | Scheduled v1.20 |
| **10** | Clockwork Gates | Ch 3: Clockwork | Shō | 5.00 | 7.00 | 3.00 | 5.00 | 5.00 | 5.00 | **30.00** | C | Scheduled v1.20 |
| **11** | Shifting Foundations | Ch 3: Clockwork | Ten | 5.00 | 7.00 | 3.00 | 5.00 | 5.00 | 5.00 | **30.00** | C | Scheduled v1.20 |
| **12** | Master of Wheels | Ch 3: Clockwork | Ketsu | 5.00 | 7.00 | 3.00 | 5.00 | 5.00 | 5.00 | **30.00** | C | Scheduled v1.20 |
| **13** | The First Rift | Ch 4: Astral | Ki | 5.00 | 7.00 | 3.00 | 5.00 | 5.00 | 5.00 | **30.00** | C | Scheduled v1.21 |
| **14** | Twinned Portals | Ch 4: Astral | Shō | 5.00 | 7.00 | 3.00 | 5.00 | 5.00 | 5.00 | **30.00** | C | Scheduled v1.21 |
| **15** | Dimensional Warp | Ch 4: Astral | Ten | 5.00 | 7.00 | 3.00 | 5.00 | 5.00 | 5.00 | **30.00** | C | Scheduled v1.21 |
| **16** | The Astral Nexus | Ch 4: Astral | Ketsu | 5.00 | 7.00 | 3.00 | 5.00 | 5.00 | 5.00 | **30.00** | C | Scheduled v1.21 |
| **17** | Flame Vents | Ch 5: Danger | Ki | 6.00 | 8.00 | 4.00 | 6.00 | 6.00 | 6.00 | **36.00** | C | Scheduled v1.22 |
| **18** | Sentinel Patrol | Ch 5: Danger | Shō | 6.00 | 8.00 | 4.00 | 6.00 | 6.00 | 6.00 | **36.00** | C | Scheduled v1.22 |
| **19** | Molten Rhythms | Ch 5: Danger | Ten | 6.00 | 8.00 | 4.00 | 5.00 | 6.00 | 6.00 | **35.00** | C | Scheduled v1.22 |
| **20** | Caldera Gauntlet | Ch 5: Danger | Ketsu | 6.00 | 8.00 | 4.00 | 5.00 | 6.00 | 6.00 | **35.00** | C | Scheduled v1.22 |
| **21** | The Memory Seal | Ch 6: Arcane | Ki | 7.00 | 9.00 | 5.00 | 7.00 | 6.00 | 6.00 | **40.00** | B | Approved Minigame |
| **22** | Dual Enigmas | Ch 6: Arcane | Shō | 7.00 | 9.00 | 5.00 | 6.00 | 6.00 | 6.00 | **39.00** | B | Approved Minigame |
| **23** | Cipher of Stars | Ch 6: Arcane | Ten | 7.00 | 9.00 | 5.00 | 6.00 | 6.00 | 6.00 | **39.00** | B | Approved Minigame |
| **24** | Observatory Sanctum | Ch 6: Arcane | Ketsu | 7.00 | 9.00 | 5.00 | 6.00 | 6.00 | 6.00 | **39.00** | B | Approved Minigame |
| **25** | Crucible of Ascent | Ch 7: Trials | Ki | 6.00 | 8.00 | 4.00 | 6.00 | 6.00 | 6.00 | **36.00** | C | Scheduled v1.23 |
| **26** | Labyrinth of Echoes | Ch 7: Trials | Shō | 6.00 | 8.00 | 4.00 | 5.00 | 6.00 | 6.00 | **35.00** | C | Scheduled v1.23 |
| **27** | Prismatic Depths | Ch 7: Trials | Ten | 6.00 | 8.00 | 4.00 | 5.00 | 6.00 | 6.00 | **35.00** | C | Scheduled v1.23 |
| **28** | The Sovereign Trial | Ch 7: Trials | Ketsu | 7.00 | 9.00 | 5.00 | 6.00 | 6.00 | 7.00 | **40.00** | B | Scheduled v1.23 |
| **29** | The Four Compass | Ch 8: Monolith | Ki | 7.00 | 9.00 | 5.00 | 7.00 | 6.00 | 7.00 | **41.00** | B | Approved Rotation |
| **30** | Perspective Shift | Ch 8: Monolith | Shō | 7.00 | 9.00 | 5.00 | 7.00 | 6.00 | 7.00 | **41.00** | B | Approved Rotation |
| **31** | Occluded Pathways | Ch 8: Monolith | Ten | 7.00 | 9.00 | 5.00 | 7.00 | 6.00 | 7.00 | **41.00** | B | Approved Rotation |
| **32** | Apex of Monolith | Ch 8: Monolith | Ketsu | 8.00 | 10.00 | 5.00 | 7.00 | 6.00 | 8.00 | **44.00** | B | Approved Finale |

---

### B. Official Storylines & Episodic Campaigns

| Story / Chapter | Title | Mechanic / Theme | Ch1: Space | Ch2: Gate | Ch3: Art | Ch4: Pace | Ch5: UX | Ch6: Lore | Master (/60) | Tier | Quality Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Novice Ch 1** | The Waking Hall | Basic Movement | 7.67 | 10.00 | 5.33 | 8.00 | 7.67 | 7.33 | **46.00** | **A** | Solvable, Unbypassable |
| **Novice Ch 2** | The Prismatic Gates | Color Keys (Ruby/Blue) | 8.00 | 10.00 | 5.33 | 8.00 | 7.67 | 8.00 | **47.00** | **A** | Dual Key Sequence |
| **Novice Ch 3** | Clockwork Mechanisms | Dynamic Levers | 8.00 | 10.00 | 5.67 | 8.00 | 8.00 | 8.00 | **47.67** | **A** | Dynamic Stone Shift |
| **Novice Ch 4** | The Canopy Crossing | Bridges & Elevation | 8.33 | 10.00 | 5.67 | 8.33 | 8.00 | 7.67 | **48.00** | **A** | Vertical Overpass |
| **Novice Ch 5** | The Shrouded Vaults | Dynamic Fog of War | 8.00 | 10.00 | 5.33 | 8.00 | 7.67 | 8.33 | **47.33** | **A** | Atmospheric Fog |
| **Novice Ch 6** | The Guildmaster's Rite | Grand Synthesis | 8.67 | 10.00 | 5.67 | 8.67 | 8.00 | 8.33 | **49.33** | **A** | Multi-System Climax |
| **Guardians Ch 1** | The Whispering Ruins | Inscriptions, Gems, Fire | 8.67 | 10.00 | 6.00 | 8.33 | 8.00 | 8.00 | **49.00** | **A** | ✅ Overhauled Temple |
| **Guardians Ch 2** | The Falcon's Plinth | Carryable Falcon Relic | 8.67 | 10.00 | 6.00 | 8.67 | 8.00 | 8.33 | **49.67** | **A** | ✅ Overhauled Terrace |
| **Guardians Ch 3** | Sanctum of Guardians | 4 Animal Plinth Riddle | 9.00 | 10.00 | 6.33 | 9.00 | 8.33 | 8.67 | **51.33** | **A** | ✅ Overhauled Sanctum |
| **Citadel Ch 1** | The Whispering Citadel | 3-Room Dungeon | 8.67 | 10.00 | 6.00 | 8.67 | 8.00 | 8.67 | **50.01** | **A** | Multi-Room Spire |

---

## 2. Granular Chapter 1 Expert Scorecards (Levels 1–4)

### Level 1: First Footsteps (*Ki*)
* **Dimensions**: 13×13 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(11, 11)` | **Par**: 26 steps / 14s | **Biome**: Stone Dungeon
* **Architecture**: Entry Vestibule $\to$ North Alcove $\to$ Grand 5×5 Chamber with 4 Central Stone Pillars (`WALL` islands) $\to$ Ambulatory Loopback $\to$ Golden Gate.
* **Score**: **48.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1: Spatial Architecture (8.33/10)*:
    * Crit 1.1 Room Hierarchy: **9/10** (Expansive 5x5 chamber with 4 interior pillars replaces monolithic corridor).
    * Crit 1.2 Landmarks: **8/10** (Grand pillared hall and gilded portal serve as natural orientation anchors).
    * Crit 1.3 Loopback Transit: **8/10** (Circular ambulatory loop lets player circle around pillars to the door with 0 backtracking).
  * *Chair 2: Systems & Puzzles (10.00/10)*:
    * Crit 2.1 Zero-Bypass Gating: **10/10** (Airtight bottleneck; door at (5, 9) cannot be bypassed).
    * Crit 2.2 Entity Economy: **10/10** (Pristine 1-key, 1-door economy).
    * Crit 2.3 Cognitive Escalation: **10/10** (Pure isolation of single-key lock introduction).
  * *Chair 3: Art & Visuals (5.33/10)*:
    * Crit 3.1 Biome Palette: **6/10** (Good stone contrast).
    * Crit 3.2 Depth/Shading: **4/10** (Primitive canvas shading awaiting SVG vector textures).
    * Crit 3.3 Props: **6/10** (Architect's Note #1 inspectable lore carving added).
  * *Chair 4: Pacing & Structure (8.67/10)*:
    * Crit 4.1 Stage Purity: **9/10** (Textbook Ki: introduces foundational mechanic in spacious context).
    * Crit 4.2 Novelty: **8/10** (Pillared chamber architecture).
    * Crit 4.3 Tension Curve: **9/10** (Smooth, zero player fatigue).
  * *Chair 5: UX & Calibration (8.33/10)*:
    * Crit 5.1 Par Accuracy: **9/10** (Empirically calibrated to 26 steps / 14s).
    * Crit 5.2 Sightline Clarity: **8/10** (Full visibility across central chamber).
    * Crit 5.3 Multi-Input Comfort: **8/10** (Wide 2-tile ambulatory facilitates click-to-move).
  * *Chair 6: Narrative & World-Building (8.00/10)*:
    * Crit 6.1 Diegetic Lore: **8/10** (Architect's Note #1: "Every grand labyrinth begins with a single threshold...").
    * Crit 6.2 Sense of Place: **8/10** (Feels like an authentic entry temple).
    * Crit 6.3 Climax Payoff: **8/10** (Clear portal chamber transition).

---

### Level 2: The Ruby Lock (*Shō*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(7, 11)` $\to$ `(7, 1)` | **Par**: 25 steps / 14s | **Biome**: Stone Dungeon
* **Architecture**: South Portico $\to$ Central Crossing $\to$ 3×3 Pillared West Vault $\to$ Shortcut Returning Directly to Crossing $\to$ Eastern Relic Crypt $\to$ North Ruby Gate.
* **Score**: **49.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1: Spatial Architecture (8.67/10)*:
    * Crit 1.1 Room Hierarchy: **9/10** (Flanked symmetry with open central crossing and pillared west vault).
    * Crit 1.2 Landmarks: **9/10** (Central crossing with north ruby gate and south portico).
    * Crit 1.3 Loopback Transit: **8/10** (Returning shortcut bypasses previous corridor entirely).
  * *Chair 2: Systems & Puzzles (10.00/10)*:
    * Crit 2.1 Zero-Bypass Gating: **10/10** (Airtight Ruby Gate at (7, 3)).
    * Crit 2.2 Entity Economy: **10/10** (Ruby key and optional Emerald relic gem).
    * Crit 2.3 Cognitive Escalation: **10/10** (Introduces branch selection).
  * *Chair 3: Art & Visuals (5.33/10)*:
    * Crit 3.1 Biome: **6/10** | Crit 3.2 Depth: **4/10** | Crit 3.3 Props: **6/10** (Architect's Note #2).
  * *Chair 4: Pacing & Structure (8.67/10)*:
    * Crit 4.1 Stage Purity: **9/10** (Shō development of dual lateral wings).
    * Crit 4.2 Novelty: **8/10** | Crit 4.3 Tension: **9/10**.
  * *Chair 5: UX & Calibration (8.67/10)*:
    * Crit 5.1 Par Accuracy: **9/10** (Calibrated 25 steps / 14s).
    * Crit 5.2 Sightline: **9/10** | Crit 5.3 Input Comfort: **8/10**.
  * *Chair 6: Narrative & World-Building (8.00/10)*:
    * Crit 6.1 Diegetic Lore: **8/10** (Architect's Note #2: "Color is resonance. Seek the ruby key in the western vault...").
    * Crit 6.2 Sense of Place: **8/10** | Crit 6.3 Climax Payoff: **8/10**.

---

### Level 3: Prismatic Corridors (*Ten*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(1, 7)` $\to$ `(8, 7)` | **Par**: 43 steps / 24s | **Biome**: Stone Dungeon
* **Architecture**: West Antechamber $\to$ Southern Cistern $\to$ Emerald Gate $\to$ Direct Transit Corridor to East Cloister $\to$ Central Dais.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1: Spatial Architecture (8.33/10)*:
    * Crit 1.1 Room Hierarchy: **8/10** (Distinct Cistern, Cloister, and Central Dais).
    * Crit 1.2 Landmarks: **9/10** (Central Purple Dais visible as an unreached focal island).
    * Crit 1.3 Loopback Transit: **8/10** (Direct transit corridor eliminated 25+ steps of historical backtracking).
  * *Chair 2: Systems & Puzzles (10.00/10)*:
    * Crit 2.1 Zero-Bypass Gating: **10/10** (Strict Emerald $\to$ Purple sequence).
    * Crit 2.2 Entity Economy: **10/10** (2 keys, 2 gates, zero clutter).
    * Crit 2.3 Cognitive Escalation: **10/10** (Requires two-stage sequential deduction).
  * *Chair 3: Art & Visuals (5.67/10)*:
    * Crit 3.1 Biome: **6/10** | Crit 3.2 Depth: **4/10** | Crit 3.3 Props: **7/10** (Architect's Note #3 & Prismatic crystals).
  * *Chair 4: Pacing & Structure (8.33/10)*:
    * Crit 4.1 Stage Purity: **9/10** (Ten: Subverts expectation by locking exit in center).
    * Crit 4.2 Novelty: **8/10** | Crit 4.3 Tension: **8/10**.
  * *Chair 5: UX & Calibration (8.33/10)*:
    * Crit 5.1 Par Accuracy: **9/10** (Calibrated 43 steps / 24s).
    * Crit 5.2 Sightlines: **8/10** | Crit 5.3 Input Comfort: **8/10**.
  * *Chair 6: Narrative & World-Building (8.33/10)*:
    * Crit 6.1 Diegetic Lore: **9/10** (Architect's Note #3: "Sequential locks require foresight...").
    * Crit 6.2 Sense of Place: **8/10** | Crit 6.3 Climax Payoff: **8/10**.

---

### Level 4: The Shrouded Vault (*Ketsu*)
* **Dimensions**: 19×17 | **Spawn $\to$ Exit**: `(9, 8)` $\to$ `(2, 8)` | **Par**: 65 steps / 36s | **Biome**: Stone Dungeon (Fog of War)
* **Architecture**: Central Nave Spawn $\to$ 4 Cardinal Wings $\to$ Outer Ambulatory Cloister connecting all wings $\to$ Triune Gatehouse (Ruby, Emerald, Sapphire).
* **Score**: **50.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1: Spatial Architecture (8.67/10)*:
    * Crit 1.1 Room Hierarchy: **9/10** (Grand cruciform cathedral with central crossing and peripheral wings).
    * Crit 1.2 Landmarks: **9/10** (Central nave and grand western altar).
    * Crit 1.3 Loopback Transit: **8/10** (Outer ambulatory cloister allows seamless wing-to-wing transit without re-crossing the nave).
  * *Chair 2: Systems & Puzzles (10.00/10)*:
    * Crit 2.1 Zero-Bypass Gating: **10/10** (Airtight 3-gate gatehouse).
    * Crit 2.2 Entity Economy: **10/10** (3 color keys, 3 matching gates).
    * Crit 2.3 Cognitive Escalation: **10/10** (Tripartite synthesis under fog).
  * *Chair 3: Art & Visuals (6.00/10)*:
    * Crit 3.1 Biome: **7/10** | Crit 3.2 Depth: **4/10** | Crit 3.3 Props: **7/10** (Architect's Note #4).
  * *Chair 4: Pacing & Structure (9.00/10)*:
    * Crit 4.1 Stage Purity: **10/10** (Ketsu: Culmination of all Chapter 1 mechanics).
    * Crit 4.2 Novelty: **8/10** | Crit 4.3 Tension: **9/10** (High suspense under fog).
  * *Chair 5: UX & Calibration (8.33/10)*:
    * Crit 5.1 Par Accuracy: **9/10** (Calibrated 65 steps / 36s).
    * Crit 5.2 Sightlines: **8/10** (Fog radius 6 tiles) | Crit 5.3 Input Comfort: **8/10**.
  * *Chair 6: Narrative & World-Building (8.67/10)*:
    * Crit 6.1 Diegetic Lore: **9/10** (Architect's Note #4: "The triad of light unlocks the master vault...").
    * Crit 6.2 Sense of Place: **9/10** | Crit 6.3 Climax Payoff: **8/10**.

---

## 3. Granular Storylines Expert Scorecards

### Story 2: Relics of the Four Guardians (Chapters 1–3)

#### Chapter 1: The Whispering Ruins (*Ki/Shō*)
* **Dimensions**: 11×11 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(9, 9)` | **Par**: 28 steps / 17s | **Biome**: Temple
* **Architecture**: North Colonnade with Fire Vent $\to$ East Colonnade $\to$ Central Pillared Chamber with Shrine Divider $\to$ Golden Sun Gate $\to$ South Sun Sanctum with 2 Pillars.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1: Spatial Architecture (8.67/10)*: Colonnade, central pillared shrine, and south sanctum with twin pillars. Loopback prevents backtrack.
  * *Chair 2: Systems & Puzzles (10.00/10)*: Gated by Golden Sun Key. Vents provide timed environmental hazard. Zero-bypass.
  * *Chair 3: Art & Visuals (6.00/10)*: Temple theme with wall carvings and bonus sun crystals.
  * *Chair 4: Pacing & Structure (8.33/10)*: Smooth introduction to temple traps and respawn beacons.
  * *Chair 5: UX & Calibration (8.00/10)*: Calibrated par (28 steps / 17s).
  * *Chair 6: Narrative & World-Building (8.00/10)*: Wall carvings whisper the lore of the sleeping Four Guardians.

#### Chapter 2: The Falcon's Plinth (*Shō/Ten*)
* **Dimensions**: 11×11 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(9, 9)` | **Par**: 32 steps / 19s | **Biome**: Temple
* **Architecture**: West Falcon Aerie $\to$ Central Court with Plinth Divider $\to$ East Overlook Deck $\to$ Terrace Gate Bottleneck $\to$ High Sky Sanctuary.
* **Score**: **49.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1: Spatial Architecture (8.67/10)*: Asymmetric aerie and terrace overlooking the mountain wind chasm.
  * *Chair 2: Systems & Puzzles (10.00/10)*: Carryable Falcon statue must be slotted into Sky Plinth. Verified zero-bypass gating on Terrace Gate.
  * *Chair 3: Art & Visuals (6.00/10)*: Sky plinth, marble falcon totem, and sky sapphire.
  * *Chair 4: Pacing & Structure (8.67/10)*: Teaches carryable relic mechanics and environmental riddle sockets.
  * *Chair 5: UX & Calibration (8.00/10)*: Calibrated par (32 steps / 19s).
  * *Chair 6: Narrative & World-Building (8.33/10)*: Inscription: "Only when the winged sentinel overlooks the winds will the gate open."

#### Chapter 3: Sanctum of the Four Guardians (*Ketsu*)
* **Dimensions**: 15×15 | **Spawn $\to$ Exit**: `(7, 1)` $\to$ `(7, 13)` | **Par**: 54 steps / 33s | **Biome**: Temple
* **Architecture**: North Antechamber $\to$ Central Rotunda with 4 Plinths & Sentry Pillars $\to$ 4 Cardinal Wings (Falcon NW, Serpent NE, Lion SW, Bear SE) $\to$ Transverse Wall with Golden Sanctum Gate $\to$ Inner Dais.
* **Score**: **51.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1: Spatial Architecture (9.00/10)*: Grand cruciform temple. 4 dedicated guardian alcoves surrounding a central rotunda.
  * *Chair 2: Systems & Puzzles (10.00/10)*: 4-part riddle puzzle group. Door `door_sanctum_gate` strictly unbypassable; verified by solver.
  * *Chair 3: Art & Visuals (6.33/10)*: 4 distinct animal totems, fluted stone plinths, and golden sanctuary gate.
  * *Chair 4: Pacing & Structure (9.00/10)*: Grand environmental riddle climax.
  * *Chair 5: UX & Calibration (8.33/10)*: Calibrated par (54 steps / 33s). Checkpoint beacon at center.
  * *Chair 6: Narrative & World-Building (8.67/10)*: Poetic riddle verses on the 4 plinths describe the compass direction and spirit of each guardian.

---

### Story 3: The Whispering Citadel (Chapter 1)
* **Dimensions**: 13×13 (3 Rooms) | **Biome**: Multi-Room Citadel
* **Architecture**: Room 1: Whispering Courtyard $\to$ Room 2: Subterranean Catacombs $\to$ Room 3: High Spire.
* **Score**: **50.01 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1: Spatial Architecture (8.67/10)*: Multi-tier vertical dungeon architecture across 3 distinct rooms.
  * *Chair 2: Systems & Puzzles (10.00/10)*: Interconnected keys, levers, and branching exits (Apex Altar vs Secret Monolith Tunnel).
  * *Chair 3: Art & Visuals (6.00/10)*: Distinctive visual themes per room (courtyard stone, damp catacombs, open sky spire).
  * *Chair 4: Pacing & Structure (8.67/10)*: 3-act escalation within a single multi-room level.
  * *Chair 5: UX & Calibration (8.00/10)*: Smooth room transition snapshots preserving persistent inventory.
  * *Chair 6: Narrative & World-Building (8.67/10)*: Rich environmental storytelling regarding the ancient Monolith builders.

---

## 4. Backlog Directives (Milestones v1.20–v1.23)

1. **BL-33 (P1, v1.20.0)**: Fix 2.5D visual depth-sorting bug where character sprite renders on top of the southern wall's roof face when walking behind wall tiles.
2. **SVG Vector Rendering (Epic 2, v1.20.0)**: Connect vector assets from `assets/` to `GameRenderer` to lift Chair 3 (Art & Visuals) scores from **5–6/10** to **9–10/10**, pushing A-Tier levels into S-Tier.
3. **Chapters 3–8 Systematic Overhaul**: Workshop Chapters 3 to 8 using the proven room hierarchy, loopback transit, and zero-bypass gating patterns established in Chapters 1 and 2.
