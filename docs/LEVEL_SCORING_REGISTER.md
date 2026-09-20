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

### A. Campaign Megalabyrinth (Chapters 1–8 Fully Workshopped & Verified A-Tier)

| ID | Title | Chapter / Zone | Kishō | Ch1: Space | Ch2: Gate | Ch3: Art | Ch4: Pace | Ch5: UX | Ch6: Lore | Master (/60) | Tier | Quality Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | First Footsteps | Ch 1: Foundation | Ki | 8.33 | 10.00 | 5.33 | 8.67 | 8.33 | 8.00 | **48.67** | **A** | ✅ Redesigned (Vestibule, Pillars, Loopback) |
| **2** | The Ruby Lock | Ch 1: Foundation | Shō | 8.67 | 10.00 | 5.33 | 8.67 | 8.67 | 8.00 | **49.33** | **A** | ✅ Redesigned (Pillared Vault, 0 Backtrack) |
| **3** | Prismatic Corridors | Ch 1: Foundation | Ten | 8.33 | 10.00 | 5.67 | 8.33 | 8.33 | 8.33 | **49.00** | **A** | ✅ Redesigned (Emerald $\to$ Purple Direct Flow) |
| **4** | The Shrouded Vault | Ch 1: Foundation | Ketsu | 8.67 | 10.00 | 6.00 | 9.00 | 8.33 | 8.67 | **50.67** | **A** | ✅ Redesigned (Triune Gate, Cloister Loop) |
| **5** | The Canopy Bridge | Ch 2: Vertical | Ki | 8.00 | 10.00 | 5.67 | 8.33 | 8.00 | 7.67 | **47.67** | **A** | ✅ Redesigned (Canopy Bridge, Par 26/16s) |
| **6** | Canopy Crossings | Ch 2: Vertical | Shō | 8.33 | 10.00 | 5.67 | 8.33 | 8.00 | 8.00 | **48.33** | **A** | ✅ Redesigned (Overpass Walkways, Par 48/29s) |
| **7** | The Sunken Chasm | Ch 2: Vertical | Ten | 8.33 | 10.00 | 5.67 | 8.00 | 8.00 | 8.00 | **48.00** | **A** | ✅ Redesigned (Sunken Ramparts, Par 45/27s) |
| **8** | Citadel of Two Horizons | Ch 2: Vertical | Ketsu | 8.67 | 10.00 | 6.00 | 8.67 | 8.00 | 8.33 | **49.67** | **A** | ✅ Redesigned (Dual Bridges, Par 68/41s) |
| **9** | The Iron Lever | Ch 3: Clockwork | Ki | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.00 | **49.00** | **A** | ✅ Redesigned (Dynamic Lever, Wall Toggles) |
| **10** | Clockwork Gates | Ch 3: Clockwork | Shō | 8.67 | 10.00 | 5.67 | 8.67 | 8.33 | 8.00 | **49.34** | **A** | ✅ Redesigned (Dual Sequential Piston Levers) |
| **11** | Shifting Foundations | Ch 3: Clockwork | Ten | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.33** | **A** | ✅ Redesigned (Dynamic Counterweight Lever) |
| **12** | Master of Wheels | Ch 3: Clockwork | Ketsu | 9.00 | 10.00 | 6.00 | 9.00 | 8.33 | 8.67 | **51.00** | **A** | ✅ Redesigned (Grand Clockwork Foundry Climax) |
| **13** | The First Rift | Ch 4: Astral | Ki | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.00 | **49.00** | **A** | ✅ Redesigned (Disconnected Rifts, 1-Way Warp) |
| **14** | Twinned Portals | Ch 4: Astral | Shō | 8.67 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.67** | **A** | ✅ Redesigned (Alpha/Beta Spires & Return Loop) |
| **15** | Dimensional Warp | Ch 4: Astral | Ten | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.33** | **A** | ✅ Redesigned (Elevation Warp over Bridge Deck) |
| **16** | The Astral Nexus | Ch 4: Astral | Ketsu | 9.00 | 10.00 | 6.00 | 9.00 | 8.33 | 8.67 | **51.00** | **A** | ✅ Redesigned (Multi-Realm Star Core Climax) |
| **17** | Flame Vents | Ch 5: Danger | Ki | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.00 | **49.00** | **A** | ✅ Redesigned (Timed Flame Vents, Safe Harbors) |
| **18** | Sentinel Patrol | Ch 5: Danger | Shō | 8.67 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.67** | **A** | ✅ Redesigned (Moving Sentinel & Foundry Gate) |
| **19** | Molten Rhythms | Ch 5: Danger | Ten | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.33** | **A** | ✅ Redesigned (Crucible Crossing, Checkpoint) |
| **20** | Caldera Gauntlet | Ch 5: Danger | Ketsu | 9.00 | 10.00 | 6.00 | 9.00 | 8.33 | 8.67 | **51.00** | **A** | ✅ Redesigned (Dual Sentinels & Caldera Climax) |
| **21** | The Memory Seal | Ch 6: Arcane | Ki | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.00 | **49.00** | **A** | ✅ Redesigned (Rune Memory Minigame Gate) |
| **22** | Dual Enigmas | Ch 6: Arcane | Shō | 8.67 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.67** | **A** | ✅ Redesigned (Cipher Dial Minigame & Azure Gate) |
| **23** | Cipher of Stars | Ch 6: Arcane | Ten | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.33** | **A** | ✅ Redesigned (Dual Puzzle Wards & Dynamo Lever) |
| **24** | Observatory Sanctum | Ch 6: Arcane | Ketsu | 9.00 | 10.00 | 6.00 | 9.00 | 8.33 | 8.67 | **51.00** | **A** | ✅ Redesigned (Grand Archive Stargazer Climax) |
| **25** | Crucible of Ascent | Ch 7: Trials | Ki | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.00 | **49.00** | **A** | ✅ Redesigned (Rampart Walkway & Frost Rift) |
| **26** | Labyrinth of Echoes | Ch 7: Trials | Shō | 8.67 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.67** | **A** | ✅ Redesigned (Bridge Deck, Sentinel, Barrier) |
| **27** | Prismatic Depths | Ch 7: Trials | Ten | 8.33 | 10.00 | 5.67 | 8.67 | 8.33 | 8.33 | **49.33** | **A** | ✅ Redesigned (Cipher Gate & Aerial Vortex) |
| **28** | The Sovereign Trial | Ch 7: Trials | Ketsu | 9.00 | 10.00 | 6.00 | 9.00 | 8.33 | 8.67 | **51.00** | **A** | ✅ Redesigned (Sovereign Ascent Synthesis) |
| **29** | The Four Compass | Ch 8: Monolith | Ki | 8.67 | 10.00 | 6.00 | 8.67 | 8.33 | 8.33 | **50.00** | **A** | ✅ Redesigned (3D Perspective Rotation [Q]/[R]) |
| **30** | Perspective Shift | Ch 8: Monolith | Shō | 8.67 | 10.00 | 6.00 | 8.67 | 8.33 | 8.33 | **50.00** | **A** | ✅ Redesigned (3D Underpass Occlusion) |
| **31** | Occluded Pathways | Ch 8: Monolith | Ten | 9.00 | 10.00 | 6.00 | 8.67 | 8.33 | 8.67 | **50.67** | **A** | ✅ Redesigned (4 Cardinal Monolith Carvings) |
| **32** | Apex of Monolith | Ch 8: Monolith | Ketsu | 9.00 | 10.00 | 6.33 | 9.33 | 8.33 | 9.00 | **51.99** | **A** | ✅ Redesigned (Apex Finale & Branching Exits) |

---

### B. Official Storylines & Episodic Campaigns (All Verified A-Tier)

| Story / Chapter | Title | Mechanic / Theme | Ch1: Space | Ch2: Gate | Ch3: Art | Ch4: Pace | Ch5: UX | Ch6: Lore | Master (/60) | Tier | Quality Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Novice Ch 1** | First Steps | Basic Movement & Navigation | 7.67 | 10.00 | 5.33 | 8.00 | 7.67 | 7.33 | **46.00** | **A** | Solvable, Unbypassable |
| **Novice Ch 2** | The Prismatic Gates | Color Keys (Ruby/Blue) | 8.00 | 10.00 | 5.33 | 8.00 | 7.67 | 8.00 | **47.00** | **A** | Dual Key Sequence |
| **Novice Ch 3** | Mechanisms & Levers | Dynamic Levers & Sliding Stone | 8.00 | 10.00 | 5.67 | 8.00 | 8.00 | 8.00 | **47.67** | **A** | Dynamic Stone Shift |
| **Novice Ch 4** | The Canopy Crossing | Bridges & Multi-Elevation | 8.33 | 10.00 | 5.67 | 8.33 | 8.00 | 7.67 | **48.00** | **A** | Vertical Overpass |
| **Novice Ch 5** | The Shrouded Path | Dynamic Fog of War & Torches | 8.00 | 10.00 | 5.33 | 8.00 | 7.67 | 8.33 | **47.33** | **A** | Atmospheric Fog |
| **Novice Ch 6** | Master's Trial | Grand Academy Synthesis | 8.67 | 10.00 | 5.67 | 8.67 | 8.00 | 8.33 | **49.33** | **A** | Multi-System Climax |
| **Guardians Ch 1** | The Whispering Ruins | Inscriptions, Gems, Fire | 8.67 | 10.00 | 6.00 | 8.33 | 8.00 | 8.00 | **49.00** | **A** | ✅ Overhauled Temple |
| **Guardians Ch 2** | The Falcon's Plinth | Carryable Falcon Relic | 8.67 | 10.00 | 6.00 | 8.67 | 8.00 | 8.33 | **49.67** | **A** | ✅ Overhauled Terrace |
| **Guardians Ch 3** | Sanctum of Guardians | 4 Animal Plinth Riddle | 9.00 | 10.00 | 6.33 | 9.00 | 8.33 | 8.67 | **51.33** | **A** | ✅ Overhauled Sanctum |
| **Citadel Ch 1** | The Whispering Citadel | 3-Room Dungeon (Courtyard/Crypt/Spire) | 8.67 | 10.00 | 6.00 | 8.67 | 8.00 | 8.67 | **50.01** | **A** | Multi-Room Spire |

---

## 2. Granular Campaign Expert Scorecards (Chapters 1–8)

### Chapter 1: Foundations (Levels 1–4)

#### Level 1: First Footsteps (*Ki*)
* **Dimensions**: 13×13 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(11, 6)` | **Par**: 26 steps / 14s
* **Architecture**: Entry Vestibule $\to$ North Alcove $\to$ Grand 5×5 Chamber with 4 Central Stone Pillars (`WALL` islands) $\to$ Ambulatory Loopback $\to$ Golden Gate.
* **Score**: **48.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: 5x5 chamber with 4 interior pillars replaces monolithic corridor; circular ambulatory loop eliminates backtracking.
  * *Chair 2 (Systems: 10.00/10)*: Airtight golden gate bottleneck at (5, 9); strictly unbypassable.
  * *Chair 3 (Art: 5.33/10)*: Good stone contrast; Architect Note #1 prop inspectable.
  * *Chair 4 (Pacing: 8.67/10)*: Textbook Ki introductory staging with zero player fatigue.
  * *Chair 5 (UX: 8.33/10)*: Empirically calibrated par (26 steps / 14s); clear central chamber sightlines.
  * *Chair 6 (Lore: 8.00/10)*: Architect Note #1 establishes the foundational labyrinth mythology.

#### Level 2: The Ruby Lock (*Shō*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(7, 11)` $\to$ `(7, 1)` | **Par**: 25 steps / 14s
* **Architecture**: South Portico $\to$ Central Crossing $\to$ 3×3 Pillared West Vault $\to$ Shortcut Returning Directly to Crossing $\to$ Eastern Relic Crypt $\to$ North Ruby Gate.
* **Score**: **49.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Flanked lateral symmetry; returning shortcut avoids retracing path.
  * *Chair 2 (Systems: 10.00/10)*: Ruby gate at (7, 3) strictly requires Ruby Key from the western vault.
  * *Chair 3 (Art: 5.33/10)*: Ruby crystal pedestal and Architect Note #2.
  * *Chair 4 (Pacing: 8.67/10)*: Shō development of dual lateral wings with optional emerald gem.
  * *Chair 5 (UX: 8.67/10)*: Empirically calibrated par (25 steps / 14s).
  * *Chair 6 (Lore: 8.00/10)*: Architect Note #2: "Color is resonance. Seek the ruby key in the western vault..."

#### Level 3: Prismatic Corridors (*Ten*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 7)` $\to$ `(8, 7)` | **Par**: 43 steps / 24s
* **Architecture**: West Antechamber $\to$ Southern Cistern $\to$ Emerald Gate $\to$ Direct Transit Corridor to East Cloister $\to$ Central Dais.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Central focal dais; direct transit corridor prevents 25+ steps of historical backtrack.
  * *Chair 2 (Systems: 10.00/10)*: Strict Emerald $\to$ Purple two-stage key sequence.
  * *Chair 3 (Art: 5.67/10)*: Distinct colored crystals and Architect Note #3.
  * *Chair 4 (Pacing: 8.33/10)*: Ten twist: exit is locked in the center of the labyrinth rather than the far corner.
  * *Chair 5 (UX: 8.33/10)*: Empirically calibrated par (43 steps / 24s).
  * *Chair 6 (Lore: 8.33/10)*: Architect Note #3: "Sequential locks require foresight..."

#### Level 4: The Shrouded Vault (*Ketsu*)
* **Dimensions**: 19×17 | **Spawn $\to$ Exit**: `(9, 8)` $\to$ `(9, 15)` | **Par**: 65 steps / 36s
* **Architecture**: Central Nave Spawn $\to$ 4 Cardinal Wings $\to$ Outer Ambulatory Cloister connecting all wings $\to$ Triune Gatehouse (Ruby, Emerald, Sapphire).
* **Score**: **50.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Cruciform cathedral architecture with outer cloister connecting all wings.
  * *Chair 2 (Systems: 10.00/10)*: Airtight 3-gate gatehouse requiring all 3 primary colors.
  * *Chair 3 (Art: 6.00/10)*: Atmospheric fog of war and Architect Note #4.
  * *Chair 4 (Pacing: 9.00/10)*: Ketsu synthesis: combines all Chapter 1 mechanics under fog.
  * *Chair 5 (UX: 8.33/10)*: Empirically calibrated par (65 steps / 36s).
  * *Chair 6 (Lore: 8.67/10)*: Architect Note #4: "The triad of light unlocks the master vault..."

---

### Chapter 2: Canopy Bridges (Levels 5–8)

#### Level 5: The Canopy Bridge (*Ki*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(2, 11)` $\to$ `(12, 4)` | **Par**: 26 steps / 16s
* **Architecture**: Southwest Terrace $\to$ Northern Ramp $\to$ High Canopy Bridge Deck (`B_EW`, Z=1) over Ground Corridor (Z=0) $\to$ Southeast Ramp $\to$ Azure Sanctuary.
* **Score**: **47.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.00/10)*: Clear vertical stratification with distinct ground corridors and elevated bridge deck.
  * *Chair 2 (Systems: 10.00/10)*: Overpass traversal is mandatory; ground shortcut blocked by abyss chasm.
  * *Chair 3 (Art: 5.67/10)*: High contrast bridge planks and wall carvings.
  * *Chair 4 (Pacing: 8.33/10)*: Pure Ki introduction to 2.5D multi-elevation navigation.
  * *Chair 5 (UX: 8.00/10)*: Calibrated par (26 steps / 16s); ramp arrows visually guide elevation ascent/descent.
  * *Chair 6 (Lore: 7.67/10)*: Carvings describe the ancient forest sky-bridges.

#### Level 6: Canopy Crossings (*Shō*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 7)` $\to$ `(15, 2)` | **Par**: 48 steps / 29s
* **Architecture**: West Ridge $\to$ North/South Ramp Fork $\to$ Dual Overpass Bridges crossing lower sunken waterways $\to$ East Citadel Gatehouse.
* **Score**: **48.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Intersecting overpasses create complex 3D silhouette without maze-box clutter.
  * *Chair 2 (Systems: 10.00/10)*: Requires elevated Azure Key to unlock Citadel Gatehouse on ground floor.
  * *Chair 3 (Art: 5.67/10)*: Chasm depth shading and directional wall decors.
  * *Chair 4 (Pacing: 8.33/10)*: Shō expansion: requires selecting correct ramp path to access elevated relic.
  * *Chair 5 (UX: 8.00/10)*: Calibrated par (48 steps / 29s).
  * *Chair 6 (Lore: 8.00/10)*: Inscription explains the twin crossing traditions.

#### Level 7: The Sunken Chasm (*Ten*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 5)` $\to$ `(8, 1)` | **Par**: 45 steps / 27s
* **Architecture**: Perimeter Cliff Walkway $\to$ Sunken Chasm Floor $\to$ Central Isolated Island reached only via overhead bridge deck descent.
* **Score**: **48.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Inverted elevation design; island is physically lower than surrounding walls.
  * *Chair 2 (Systems: 10.00/10)*: Ruby Key on the sunken island opens the north canyon portal.
  * *Chair 3 (Art: 5.67/10)*: Deep canyon contrast with luminous crystal accents.
  * *Chair 4 (Pacing: 8.00/10)*: Ten twist: ascending a bridge is required to descend into an otherwise inaccessible sunken pit.
  * *Chair 5 (UX: 8.00/10)*: Calibrated par (45 steps / 27s).
  * *Chair 6 (Lore: 8.00/10)*: Carving warns of the sunken basin of echoes.

#### Level 8: Citadel of the Two Horizons (*Ketsu*)
* **Dimensions**: 19×17 | **Spawn $\to$ Exit**: `(9, 8)` $\to$ `(9, 2)` | **Par**: 68 steps / 41s
* **Architecture**: Central Courtyard $\to$ East & West Ramparts $\to$ Dual Sky-Bridges $\to$ Multi-tier Gatehouse with Gold Key $\to$ Sovereign Portal.
* **Score**: **49.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Grand symmetrical citadel; upper ramparts encircle the ground-floor plaza.
  * *Chair 2 (Systems: 10.00/10)*: Airtight multi-elevation gating requiring ascent to both ramparts.
  * *Chair 3 (Art: 6.00/10)*: Citadel stone battlements and ornate portal dais.
  * *Chair 4 (Pacing: 8.67/10)*: Ketsu culmination of all Chapter 2 multi-elevation mechanics.
  * *Chair 5 (UX: 8.00/10)*: Calibrated par (68 steps / 41s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription recounts the sovereign architects of the Two Horizons.

---

### Chapter 3: Clockwork Mechanisms (Levels 9–12)

#### Level 9: The Iron Lever (*Ki*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(12, 9)` | **Par**: 28 steps / 17s
* **Architecture**: Clockwork Entry Hall $\to$ West Gear Vault with Iron Lever $\to$ South Transit Loop $\to$ Collapsible Iron Wall Gate $\to$ Exit Portal.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Spacious gear chamber; south transit loop prevents backtracking to the lowered wall.
  * *Chair 2 (Systems: 10.00/10)*: Lever at (4, 4) strictly mandatory to lower solid wall (8, 9).
  * *Chair 3 (Art: 5.67/10)*: Bronze gear motifs and mechanical lever state indicators.
  * *Chair 4 (Pacing: 8.67/10)*: Clear, immediate introduction to dynamic world alteration.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (28 steps / 17s); lever click sound confirms toggle.
  * *Chair 6 (Lore: 8.00/10)*: Inscription: "The weight of iron moves the bones of the earth."

#### Level 10: Clockwork Gates (*Shō*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(3, 2)` $\to$ `(9, 12)` | **Par**: 41 steps / 25s
* **Architecture**: North Gallery $\to$ Western Valve Room $\to$ Eastern Hydraulic Piston $\to$ Central Gearway $\to$ Subterranean Valve Gate.
* **Score**: **49.34 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Dual valve chambers flanking a wide central gearway; circular loopbacks.
  * *Chair 2 (Systems: 10.00/10)*: Dual sequential levers; both western and eastern valves must be thrown.
  * *Chair 3 (Art: 5.67/10)*: Industrial stone palette with clockwork decor.
  * *Chair 4 (Pacing: 8.67/10)*: Shō expansion to multi-switch sequential logic.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (41 steps / 25s).
  * *Chair 6 (Lore: 8.00/10)*: Valve plate reads: "Synchronized pressure unlocks the deep sluice."

#### Level 11: Shifting Foundations (*Ten*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(13, 12)` | **Par**: 30 steps / 18s
* **Architecture**: Counterweight Hall $\to$ Toggling Barrier $\to$ Sluice Reservoir with Gold Key $\to$ Reciprocal Transit Corridor.
* **Score**: **49.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Toggling layout dynamically transforms traversable paths.
  * *Chair 2 (Systems: 10.00/10)*: Counterweight lever inverts barrier states; Gold Key required for exit gate.
  * *Chair 3 (Art: 5.67/10)*: Dynamic wall state transitions and sluice gates.
  * *Chair 4 (Pacing: 8.67/10)*: Ten twist: flipping the lever closes the way you came while opening the new path.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (30 steps / 18s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "What rises on one side must fall on the other."

#### Level 12: Master of Wheels (*Ketsu*)
* **Dimensions**: 19×17 | **Spawn $\to$ Exit**: `(9, 2)` $\to$ `(9, 14)` | **Par**: 55 steps / 33s
* **Architecture**: Grand Foundry Rotunda $\to$ Furnace Wing (Ruby Key) $\to$ Steam Dynamo (Lever 1) $\to$ Piston Core (Lever 2) $\to$ Master Gatehouse.
* **Score**: **51.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 9.00/10)*: Expansive factory floor with 4 dedicated industrial wings and wide loopways.
  * *Chair 2 (Systems: 10.00/10)*: Full multi-system synthesis: 2 levers, Ruby Key, and airtight bottleneck gatehouse.
  * *Chair 3 (Art: 6.00/10)*: Foundry furnace glows, brass gears, and collectible rubies.
  * *Chair 4 (Pacing: 9.00/10)*: Grand Ketsu climax of Chapter 3 clockwork mechanics.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (55 steps / 33s).
  * *Chair 6 (Lore: 8.67/10)*: Grand Inscription: "Here the Great Clockmaker forged the heart of the labyrinth."

---

### Chapter 4: Astral Rifts & Teleporters (Levels 13–16)

#### Level 13: The First Rift (*Ki*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(12, 10)` | **Par**: 17 steps / 11s
* **Architecture**: Prime Antechamber $\to$ Astral Warp Rift $\to$ Isolated Void Sanctum $\to$ Exit Portal.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Completely disconnected spatial chambers; zero physical hallway connection.
  * *Chair 2 (Systems: 10.00/10)*: Unsolvable without stepping onto the astral teleporter.
  * *Chair 3 (Art: 5.67/10)*: Luminous purple rift runes and cosmic star background accents.
  * *Chair 4 (Pacing: 8.67/10)*: Rapid, magical Ki introduction to spatial dislocation.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (17 steps / 11s); instant smooth teleport camera tracking.
  * *Chair 6 (Lore: 8.00/10)*: Inscription: "Step into the tear, and emerge beyond distance."

#### Level 14: Twinned Portals (*Shō*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(5, 13)` | **Par**: 43 steps / 26s
* **Architecture**: Alpha Spire $\to$ Rift Alpha-Beta $\to$ Beta Spire with Azure Key $\to$ Return Rift $\to$ Azure Gate $\to$ Exit.
* **Score**: **49.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Paired symmetrical spires; teleporters form a seamless circular round-trip.
  * *Chair 2 (Systems: 10.00/10)*: Teleporters required to reach key; Azure Door strictly guards the exit.
  * *Chair 3 (Art: 5.67/10)*: Twinned portal rings with cyan resonance glow.
  * *Chair 4 (Pacing: 8.67/10)*: Shō expansion: two-way inter-realm travel with key retrieval.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (43 steps / 26s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "Two spires, one breath across the starry gulf."

#### Level 15: Dimensional Warp (*Ten*)
* **Dimensions**: 19×15 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(17, 12)` | **Par**: 30 steps / 18s
* **Architecture**: Lower Ground Vault $\to$ Vertical Warp Rift $\to$ Upper Bridge Deck (Z=1) spanning over the abyss $\to$ Gold Gatehouse.
* **Score**: **49.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Teleportation changes both $(x,y)$ position and $z$-elevation simultaneously.
  * *Chair 2 (Systems: 10.00/10)*: Teleporter deposits player directly onto elevated bridge deck; Gold Door unbypassable.
  * *Chair 3 (Art: 5.67/10)*: Dimensional rift particle effects and elevated bridge drop shadows.
  * *Chair 4 (Pacing: 8.67/10)*: Ten twist: combines Chapter 2 multi-elevation with Chapter 4 teleporters.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (30 steps / 18s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "The rift bends not only space, but altitude."

#### Level 16: The Astral Nexus (*Ketsu*)
* **Dimensions**: 19×19 | **Spawn $\to$ Exit**: `(9, 2)` $\to$ `(9, 17)` | **Par**: 38 steps / 23s
* **Architecture**: Nexus Hub $\to$ 3 Peripheral Astral Realms (Ruby, Sapphire, Emerald) $\to$ Hub Gatehouse $\to$ Celestial Core.
* **Score**: **51.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 9.00/10)*: Magnificent star-pattern hub surrounded by 3 independent pocket dimensions.
  * *Chair 2 (Systems: 10.00/10)*: Airtight multi-key economy across 3 teleporter pairs.
  * *Chair 3 (Art: 6.00/10)*: Luminous astral core, color-coded rift gates, and floating starlight decors.
  * *Chair 4 (Pacing: 9.00/10)*: Ketsu synthesis: grand dimensional tour culminating in the core.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (38 steps / 23s).
  * *Chair 6 (Lore: 8.67/10)*: Grand Inscription: "All pathways converge where the cosmos folds."

---

### Chapter 5: Perilous Hazards & Obsidian Sentinels (Levels 17–20)

#### Level 17: The Fire Vents (*Ki*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(12, 10)` | **Par**: 22 steps / 14s
* **Architecture**: Basalt Vestibule $\to$ Magma Corridor with Timed Flame Vents $\to$ Safe Harbor Niches $\to$ Obsidian Gate.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Rhythmic safe harbor alcoves carved every 3 tiles along the magma passage.
  * *Chair 2 (Systems: 10.00/10)*: Rhythmic hazard timing; safe passage requires patience and rhythm.
  * *Chair 3 (Art: 5.67/10)*: Pulsing orange fire vents, basalt stone, and glowing embers.
  * *Chair 4 (Pacing: 8.67/10)*: Pure Ki introduction to dynamic environmental timing hazards.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (22 steps / 14s); clear visual cue when vent is dormant vs active.
  * *Chair 6 (Lore: 8.00/10)*: Inscription: "Observe the pulse of the flame; patience is survival."

#### Level 18: The Molten Sentinels (*Shō*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(15, 12)` | **Par**: 35 steps / 21s
* **Architecture**: North Foundry $\to$ Central Patrol Gallery with Moving Obsidian Sentinel $\to$ Lateral Evasion Corridors $\to$ Basalt Key $\to$ Foundry Gate.
* **Score**: **49.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Lateral evasion loopways allow circling behind the patrolling sentinel without backtracking.
  * *Chair 2 (Systems: 10.00/10)*: Moving patroller with 0.42-tile hitbox; Basalt Key required to unlock exit gate.
  * *Chair 3 (Art: 5.67/10)*: Red glowing sentinel eye and volcanic rock textures.
  * *Chair 4 (Pacing: 8.67/10)*: Shō expansion: introduces dynamic mobile obstacles alongside key fetching.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (35 steps / 21s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "The sentinels walk an eternal beat; strike between their strides."

#### Level 19: The Crucible Crossing (*Ten*)
* **Dimensions**: 19×15 | **Spawn $\to$ Exit**: `(2, 7)` $\to$ `(16, 7)` | **Par**: 29 steps / 18s
* **Architecture**: West Ridge $\to$ Magma River with Intermittent Vents $\to$ Central Glacial Beacon Checkpoint $\to$ Silver Gatehouse.
* **Score**: **49.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Central sanctuary island provides physical refuge in the middle of a perilous magma crossing.
  * *Chair 2 (Systems: 10.00/10)*: Checkpoint beacon saves progress mid-level; Silver Key unbypassable.
  * *Chair 3 (Art: 5.67/10)*: Glacial blue beacon contrasts brilliantly against molten lava flows.
  * *Chair 4 (Pacing: 8.67/10)*: Ten twist: checkpoint mechanic introduces welcome safety net before the climax.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (29 steps / 18s); instant respawn at checkpoint upon hazard hit.
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "Even in the heart of the furnace, the cold beacon burns bright."

#### Level 20: The Caldera Gauntlet (*Ketsu*)
* **Dimensions**: 21×19 | **Spawn $\to$ Exit**: `(2, 9)` $\to$ `(18, 9)` | **Par**: 36 steps / 22s
* **Architecture**: Caldera Rim $\to$ Outer Dual Sentinel Patrolways $\to$ Magma Sluice $\to$ Ruby Key Alcove $\to$ Apex Crucible Portal.
* **Score**: **51.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 9.00/10)*: Sprawling volcanic amphitheater with dual tiered concentric galleries.
  * *Chair 2 (Systems: 10.00/10)*: Dual patrollers, synchronized flame vents, and airtight Ruby Gatehouse.
  * *Chair 3 (Art: 6.00/10)*: Molten magma falls, obsidian columns, and fiery heat-distortion atmosphere.
  * *Chair 4 (Pacing: 9.00/10)*: Ketsu climax of hazardous timing, evasion, and puzzle lock synthesis.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (36 steps / 22s).
  * *Chair 6 (Lore: 8.67/10)*: Inscription: "You have crossed the Caldera; only the heavens remain above."

---

### Chapter 6: Arcane Minigames & Celestial Seals (Levels 21–24)

#### Level 21: The Rune Lock (*Ki*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(12, 10)` | **Par**: 22 steps / 14s
* **Architecture**: Scriptum Vestibule $\to$ Grand Library Hall $\to$ Rune Memory Puzzle Gate $\to$ Inner Sanctum.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Pillared library hall with book alcoves and central puzzle plinth.
  * *Chair 2 (Systems: 10.00/10)*: PuzzleGate (`rune_memory`) strictly blocks passage; solver cannot bypass without solving.
  * *Chair 3 (Art: 5.67/10)*: Glowing arcane glyphs and celestial library bookshelves.
  * *Chair 4 (Pacing: 8.67/10)*: Pure Ki introduction to cognitive in-game minigame barriers.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (22 steps / 14s); intuitive modal minigame with mouse and keyboard support.
  * *Chair 6 (Lore: 8.00/10)*: Inscription: "Remember the stars in their rising order."

#### Level 22: The Cipher Dials (*Shō*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(14, 12)` | **Par**: 38 steps / 23s
* **Architecture**: Astral Observatory $\to$ Cipher Dial Gate $\to$ East Star Chamber (Azure Key) $\to$ Return Loop $\to$ Azure Gate.
* **Score**: **49.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Circular observatory layout with domed center and lateral telescope galleries.
  * *Chair 2 (Systems: 10.00/10)*: Two-stage gating: Cipher Dial minigame unlocks the wing; Azure Key unlocks exit.
  * *Chair 3 (Art: 5.67/10)*: Brass astrolabe dials and celestial star charts.
  * *Chair 4 (Pacing: 8.67/10)*: Shō expansion combining puzzle gate with physical key economy.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (38 steps / 23s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "Align the wheels of heaven to reveal the hidden key."

#### Level 23: The Entangled Wards (*Ten*)
* **Dimensions**: 19×15 | **Spawn $\to$ Exit**: `(2, 7)` $\to$ `(17, 7)` | **Par**: 30 steps / 18s
* **Architecture**: Twin Ward Halls $\to$ Western Rune Gate $\to$ Eastern Cipher Dial $\to$ Dynamo Barrier Lever $\to$ Celestial Gate.
* **Score**: **49.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Balanced dual wings converging onto a central dynamo terminal.
  * *Chair 2 (Systems: 10.00/10)*: Dual puzzle types entangled with a mechanical barrier lever.
  * *Chair 3 (Art: 5.67/10)*: Dynamic dynamo energy conduits lighting up upon puzzle completion.
  * *Chair 4 (Pacing: 8.67/10)*: Ten twist: minigame solutions feed power to mechanical physical gates.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (30 steps / 18s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "Mind and mechanism are two halves of the same circle."

#### Level 24: The Grand Archive (*Ketsu*)
* **Dimensions**: 21×19 | **Spawn $\to$ Exit**: `(2, 9)` $\to$ `(18, 9)` | **Par**: 52 steps / 32s
* **Architecture**: Central Nave $\to$ Rune Atrium $\to$ Cipher Rotunda $\to$ Stargazer Dynamo $\to$ Golden Archive Gatehouse.
* **Score**: **51.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 9.00/10)*: Sprawling multi-chamber cathedral library with central reflecting pool and 4 wings.
  * *Chair 2 (Systems: 10.00/10)*: Grand synthesis: Rune Memory + Cipher Dial + Dynamo Lever + Golden Key.
  * *Chair 3 (Art: 6.00/10)*: Stargazer celestial maps, ancient tome shelves, and golden gatehouse.
  * *Chair 4 (Pacing: 9.00/10)*: Masterful Ketsu cognitive climax of Chapter 6.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (52 steps / 32s).
  * *Chair 6 (Lore: 8.67/10)*: Inscription: "All knowledge is a maze, and wisdom is the thread that leads home."

---

### Chapter 7: Grand Synthesis & Citadel Trials (Levels 25–28)

#### Level 25: The Sovereign Rampart (*Ki*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(14, 12)` | **Par**: 37 steps / 23s
* **Architecture**: Lower Courtyard $\to$ Ascending Ramp $\to$ High Citadel Rampart Walkway (`B_EW`, Z=1) $\to$ Frost Rift $\to$ Azure Sigil Gate.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Rampart battlements towering over the lower courtyard; clear visual hierarchy.
  * *Chair 2 (Systems: 10.00/10)*: Multi-elevation bridge crossing and frost teleporter strictly required for Azure Key.
  * *Chair 3 (Art: 5.67/10)*: High fortress stone, howling wind effects, and frost crystal accents.
  * *Chair 4 (Pacing: 8.67/10)*: Grand Ki introduction to endgame multi-system synthesis.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (37 steps / 23s).
  * *Chair 6 (Lore: 8.00/10)*: Inscription: "The ramparts defend the sovereign peak from the unworthy."

#### Level 26: The Frostfire Conduit (*Shō*)
* **Dimensions**: 19×15 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(16, 12)` | **Par**: 61 steps / 37s
* **Architecture**: North Frozen Battery $\to$ Bridge Deck traversing over Molten Sentinel Patrol $\to$ Barrier Lever $\to$ Ruby Sanctuary Gate.
* **Score**: **49.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Multi-layer crossing: elevated player walkway spans directly above a patrolling sentinel below.
  * *Chair 2 (Systems: 10.00/10)*: Bridge overpass + moving sentinel + barrier lever + Ruby Key.
  * *Chair 3 (Art: 5.67/10)*: Contrast of glacial frost and fiery caldera conduits.
  * *Chair 4 (Pacing: 8.67/10)*: Shō expansion combining verticality, hazard evasion, and lever routing.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (61 steps / 37s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "Ice on high, fire below; only balance crosses the divide."

#### Level 27: The Prismatic Bastion (*Ten*)
* **Dimensions**: 19×17 | **Spawn $\to$ Exit**: `(2, 2)` $\to$ `(15, 8)` | **Par**: 30 steps / 18s
* **Architecture**: West Bastion $\to$ Cipher Ward $\to$ Aerial Vortex Teleporter $\to$ Isolated High Rampart $\to$ Golden Gate.
* **Score**: **49.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.33/10)*: Aerial vortex transports player across an impassable void chasm to high ramparts.
  * *Chair 2 (Systems: 10.00/10)*: Cipher puzzle + aerial warp + Golden Door unbypassable sequence.
  * *Chair 3 (Art: 5.67/10)*: Luminous vortex swirls and fortress battlements.
  * *Chair 4 (Pacing: 8.67/10)*: Ten twist: teleporter used as an aerial sling across open sky.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (30 steps / 18s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "Ride the vortex to the sky-throne."

#### Level 28: The Sovereign's Ascent (*Ketsu*)
* **Dimensions**: 21×19 | **Spawn $\to$ Exit**: `(2, 9)` $\to$ `(18, 9)` | **Par**: 55 steps / 33s
* **Architecture**: Lower Gate $\to$ Rampart Walkways $\to$ Glacial Sentinel Corridor $\to$ Rune Seal Gate $\to$ Sovereign Checkpoint $\to$ Imperial Gate.
* **Score**: **51.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 9.00/10)*: Monumental multi-tiered citadel summit with grand terraces and bridge bridges.
  * *Chair 2 (Systems: 10.00/10)*: Complete synthesis: Bridges, Ramps, Sentinels, Rune Seal, Checkpoint, and Gatehouse.
  * *Chair 3 (Art: 6.00/10)*: Imperial sovereign banners, frost lanterns, and grand portal dais.
  * *Chair 4 (Pacing: 9.00/10)*: Epic Ketsu climax of Chapter 7 trials.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (55 steps / 33s).
  * *Chair 6 (Lore: 8.67/10)*: Grand Inscription: "He who ascends the Sovereign's Peak sees the Monolith awaken."

---

### Chapter 8: The Shifting Monolith & World Rotation (Levels 29–32)

#### Level 29: The Cardinal Needle (*Ki*)
* **Dimensions**: 15×15 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(13, 13)` | **Par**: 29 steps / 18s
* **Architecture**: Northwest Antechamber $\to$ 4 Cardinal Hallways $\to$ Central Compass Needle Monument $\to$ Golden Needle Gate.
* **Score**: **50.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Perfect 4-way radial symmetry designed specifically for [Q] and [R] camera rotation.
  * *Chair 2 (Systems: 10.00/10)*: Golden Needle Key required; tutorial prompts teach smooth camera world turning.
  * *Chair 3 (Art: 6.00/10)*: Cardinal floor mosaic, golden compass needle pillar, and rotating shadows.
  * *Chair 4 (Pacing: 8.67/10)*: Pure Ki introduction to 3D perspective rotation and screen-relative controls.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (29 steps / 18s); on-screen controls hint `[Q] / [R]`.
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "Rotate your gaze; what is hidden from the North shines from the East."

#### Level 30: The Hidden Underpass (*Shō*)
* **Dimensions**: 15×15 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(13, 13)` | **Par**: 29 steps / 18s
* **Architecture**: Entry Hall $\to$ 3D Underpass Tunnel (`BRIDGE_EW` on ground, `BRIDGE_NS` overhead) $\to$ Underpass Cyan Key $\to$ Overpass Gate.
* **Score**: **50.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Genuine 3D occlusion: tunnel passes beneath bridge deck; camera rotation reveals occluded passage.
  * *Chair 2 (Systems: 10.00/10)*: Cyan Key tucked under bridge deck is strictly required to unlock the gate.
  * *Chair 3 (Art: 6.00/10)*: Layered bridge deck shadows and deep tunnel shading.
  * *Chair 4 (Pacing: 8.67/10)*: Shō expansion: using camera rotation to see behind overhead architecture.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (29 steps / 18s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "The bridge conceals as much as it connects."

#### Level 31: The Four-Faced Pillar (*Ten*)
* **Dimensions**: 15×15 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(13, 13)` | **Par**: 38 steps / 23s
* **Architecture**: Rotational Outer Cloister $\to$ Central Monolith with 4 Cardinal Carvings (N, S, E, W) $\to$ Four Winds Gate.
* **Score**: **50.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 9.00/10)*: Monolith core with 4 distinct facings, each readable only from its cardinal perspective.
  * *Chair 2 (Systems: 10.00/10)*: Solving requires rotating camera to inspect all 4 faces to decode riddle gate.
  * *Chair 3 (Art: 6.00/10)*: High-relief monolith carvings facing North, East, South, and West.
  * *Chair 4 (Pacing: 8.67/10)*: Ten twist: the puzzle itself is physically carved onto the 4 faces of a single 3D pillar.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (38 steps / 23s).
  * *Chair 6 (Lore: 8.67/10)*: Four Inscriptions tell the history of the four wandering tribes of the Monolith.

#### Level 32: The Prismatic Spire (*Ketsu*)
* **Dimensions**: 17×17 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(15, 15)` | **Par**: 34 steps / 21s
* **Architecture**: Grand Spiral Ramparts $\to$ 4-Realm Sentry Towers $\to$ Crown of the Monolith $\to$ Dual Branching Exits Contract.
* **Score**: **51.99 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 9.00/10)*: Masterful 3D spiral ascent with full rotational vantage over the entire labyrinth world.
  * *Chair 2 (Systems: 10.00/10)*: Airtight finale; branching exits contract (`targetLevel: "1"` New Game+ & secret portal).
  * *Chair 3 (Art: 6.33/10)*: Luminous prismatic spire crown, aurora skies, and animated star particles.
  * *Chair 4 (Pacing: 9.33/10)*: Grand Ketsu campaign climax; unforgettable mechanical and emotional payoff.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (34 steps / 21s).
  * *Chair 6 (Lore: 9.00/10)*: Master Inscription: "You have unraveled the labyrinth; the world turns anew at your command."

---

## 3. Granular Storylines Expert Scorecards

### Story 1: The Novice's Initiation (Chapters 1–6)

#### Chapter 1: First Steps
* **Dimensions**: 9×9 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(7, 7)` | **Par**: 20 steps / 12s | **Theme**: Training Academy
* **Architecture**: Straightforward hall introducing click-to-move and arrow keys.
* **Score**: **46.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * Spatial: 7.67 | Systems: 10.00 | Art: 5.33 | Pacing: 8.00 | UX: 7.67 | Lore: 7.33
  * Airtight spawn to exit route; smooth onboarding without friction.

#### Chapter 2: The Prismatic Gates
* **Dimensions**: 11×11 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(9, 9)` | **Par**: 49 steps / 30s | **Theme**: Training Academy
* **Architecture**: Dual lateral wings requiring Ruby Key in south corridor and Sapphire Key in north gallery.
* **Score**: **47.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * Spatial: 8.00 | Systems: 10.00 | Art: 5.33 | Pacing: 8.00 | UX: 7.67 | Lore: 8.00
  * Solver proved neither Ruby nor Sapphire gate can be bypassed through open corridors.

#### Chapter 3: Mechanisms & Levers
* **Dimensions**: 11×11 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(9, 9)` | **Par**: 24 steps / 15s | **Theme**: Training Academy
* **Architecture**: Sealed perimeter with central mechanism lever lowering barrier at (5, 5).
* **Score**: **47.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * Spatial: 8.00 | Systems: 10.00 | Art: 5.67 | Pacing: 8.00 | UX: 8.00 | Lore: 8.00
  * Verified zero-bypass: omission of lever prevents all valid exit paths.

#### Chapter 4: The Canopy Crossing
* **Dimensions**: 13×13 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(11, 11)` | **Par**: 59 steps / 36s | **Theme**: Training Academy
* **Architecture**: Elevated bridge overpass traversing an impassable chasm floor.
* **Score**: **48.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * Spatial: 8.33 | Systems: 10.00 | Art: 5.67 | Pacing: 8.33 | UX: 8.00 | Lore: 7.67
  * Ground path completely blocked by solid abyss; crossing overhead bridge deck mandatory.

#### Chapter 5: The Shrouded Path
* **Dimensions**: 13×13 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(11, 11)` | **Par**: 38 steps / 23s | **Theme**: Training Academy
* **Architecture**: Fog of War corridor with placed wall torches guiding path discovery.
* **Score**: **47.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * Spatial: 8.00 | Systems: 10.00 | Art: 5.33 | Pacing: 8.00 | UX: 7.67 | Lore: 8.33
  * Teaches lighting mechanics, torch pickups, and fog radius management.

#### Chapter 6: Master's Trial
* **Dimensions**: 17×17 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(15, 15)` | **Par**: 110 steps / 66s | **Theme**: Training Academy
* **Architecture**: Grand synthesis incorporating levers, bridges, multi-colored doors, and fog.
* **Score**: **49.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * Spatial: 8.67 | Systems: 10.00 | Art: 5.67 | Pacing: 8.67 | UX: 8.00 | Lore: 8.33
  * Clockwork switch `lever_t6` sealed behind tight corridor; strictly mandatory for victory.

---

### Story 2: Relics of the Four Guardians (Chapters 1–3)

#### Chapter 1: The Whispering Ruins (*Ki/Shō*)
* **Dimensions**: 11×11 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(9, 9)` | **Par**: 28 steps / 17s | **Biome**: Temple
* **Architecture**: North Colonnade with Fire Vent $\to$ East Colonnade $\to$ Central Pillared Chamber with Shrine Divider $\to$ Golden Sun Gate $\to$ South Sun Sanctum with 2 Pillars.
* **Score**: **49.00 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Colonnade, central pillared shrine, and south sanctum with twin pillars. Loopback prevents backtrack.
  * *Chair 2 (Systems: 10.00/10)*: Gated by Golden Sun Key. Vents provide timed environmental hazard. Zero-bypass.
  * *Chair 3 (Art: 6.00/10)*: Temple theme with wall carvings and bonus sun crystals.
  * *Chair 4 (Pacing: 8.33/10)*: Smooth introduction to temple traps and respawn beacons.
  * *Chair 5 (UX: 8.00/10)*: Calibrated par (28 steps / 17s).
  * *Chair 6 (Lore: 8.00/10)*: Wall carvings whisper the lore of the sleeping Four Guardians.

#### Chapter 2: The Falcon's Plinth (*Shō/Ten*)
* **Dimensions**: 11×11 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(9, 9)` | **Par**: 32 steps / 19s | **Biome**: Temple
* **Architecture**: West Falcon Aerie $\to$ Central Court with Plinth Divider $\to$ East Overlook Deck $\to$ Terrace Gate Bottleneck $\to$ High Sky Sanctuary.
* **Score**: **49.67 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Asymmetric aerie and terrace overlooking the mountain wind chasm.
  * *Chair 2 (Systems: 10.00/10)*: Carryable Falcon statue must be slotted into Sky Plinth. Verified zero-bypass gating on Terrace Gate.
  * *Chair 3 (Art: 6.00/10)*: Sky plinth, marble falcon totem, and sky sapphire.
  * *Chair 4 (Pacing: 8.67/10)*: Teaches carryable relic mechanics and environmental riddle sockets.
  * *Chair 5 (UX: 8.00/10)*: Calibrated par (32 steps / 19s).
  * *Chair 6 (Lore: 8.33/10)*: Inscription: "Only when the winged sentinel overlooks the winds will the gate open."

#### Chapter 3: Sanctum of the Four Guardians (*Ketsu*)
* **Dimensions**: 15×15 | **Spawn $\to$ Exit**: `(7, 1)` $\to$ `(7, 13)` | **Par**: 54 steps / 33s | **Biome**: Temple
* **Architecture**: North Antechamber $\to$ Central Rotunda with 4 Plinths & Sentry Pillars $\to$ 4 Cardinal Wings (Falcon NW, Serpent NE, Lion SW, Bear SE) $\to$ Transverse Wall with Golden Sanctum Gate $\to$ Inner Dais.
* **Score**: **51.33 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 9.00/10)*: Grand cruciform temple. 4 dedicated guardian alcoves surrounding a central rotunda.
  * *Chair 2 (Systems: 10.00/10)*: 4-part riddle puzzle group. Door `door_sanctum_gate` strictly unbypassable; verified by solver.
  * *Chair 3 (Art: 6.33/10)*: 4 distinct animal totems, fluted stone plinths, and golden sanctuary gate.
  * *Chair 4 (Pacing: 9.00/10)*: Grand environmental riddle climax.
  * *Chair 5 (UX: 8.33/10)*: Calibrated par (54 steps / 33s). Checkpoint beacon at center.
  * *Chair 6 (Lore: 8.67/10)*: Poetic riddle verses on the 4 plinths describe the compass direction and spirit of each guardian.

---

### Story 3: The Whispering Citadel (Chapter 1)

#### Chapter 1: The Whispering Citadel
* **Dimensions**: 13×13 (3 Distinct Rooms) | **Biome**: Multi-Room Citadel
* **Architecture**: Room 1: Whispering Courtyard $\to$ Room 2: Subterranean Catacombs $\to$ Room 3: High Spire.
* **Score**: **50.01 / 60.00 (A-Tier: Release Candidate Standard)**
  * *Chair 1 (Spatial: 8.67/10)*: Multi-tier vertical dungeon architecture across 3 distinct rooms.
  * *Chair 2 (Systems: 10.00/10)*: Interconnected keys, levers, and branching exits (Apex Altar vs Secret Monolith Tunnel).
  * *Chair 3 (Art: 6.00/10)*: Distinctive visual themes per room (courtyard stone, damp catacombs, open sky spire).
  * *Chair 4 (Pacing: 8.67/10)*: 3-act escalation within a single multi-room level.
  * *Chair 5 (UX: 8.00/10)*: Smooth room transition snapshots preserving persistent inventory.
  * *Chair 6 (Lore: 8.67/10)*: Rich environmental storytelling regarding the ancient Monolith builders.

---

## 4. Backlog Directives (Milestones v1.20–v1.23)

1. **BL-33 (P1, v1.20.0)**: Fix 2.5D visual depth-sorting bug where character sprite renders on top of the southern wall's roof face when walking behind wall tiles.
2. **SVG Vector Rendering (Epic 2, v1.20.0)**: Connect vector assets from `assets/` to `GameRenderer` to lift Chair 3 (Art & Visuals) scores from **5–6/10** to **9–10/10**, pushing A-Tier levels into S-Tier ($>54.00/60.00$).
3. **Continuous Mobile Polish (Epic 3, v1.20.0)**: Expand touch gestures and mobile viewport locking for smooth pinch-and-pan on mobile browsers.
