# Level Scoring Register & Chapter Audit

This document maintains the master audit register, baseline evaluation scores, and iteration history for all levels in the **Casual Maze Game** based on the [Level Audit Rubric](LEVEL_AUDIT_RUBRIC.md).

* **Audit Date**: 2026-09-20
* **Auditor**: Antigravity Quality Assurance Engine
* **Engine Version**: `v1.18.0`
* **Audit Scope**: 32 Campaign Levels (Chapters 1–8) + 6 Tutorial Academy Lessons

---

## 1. Master Audit Summary Table

| ID | Title | Chapter / Zone | Kishō Stage | D1: Des (10) | D2: Gate (10) | D3: Nov (10) | D4: Flow (10) | D5: Vis (10) | D6: Cal (10) | Total (/60) | Tier | Audit Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **T1** | Moving Forward | Tutorial | Ki | 9 | 10 | 8 | 9 | 8 | 9 | **53** | A | Approved |
| **T2** | The Golden Key | Tutorial | Shō | 9 | 10 | 8 | 9 | 8 | 9 | **53** | A | Approved |
| **T3** | The Hidden Lever | Tutorial | Ten | 9 | 10 | 8 | 8 | 8 | 9 | **52** | A | Approved (Repaired) |
| **T4** | Elevation & Ramps | Tutorial | Ki | 8 | 10 | 8 | 8 | 8 | 9 | **51** | A | Approved |
| **T5** | The High Bridge | Tutorial | Shō | 8 | 10 | 8 | 8 | 8 | 9 | **51** | A | Approved |
| **T6** | Dimensional Portal | Tutorial | Ketsu | 9 | 10 | 8 | 8 | 8 | 9 | **52** | A | Approved (Repaired) |
| **1** | First Footsteps | Ch 1: Foundation | Ki | 6 | 10 | 5 | 7 | 7 | 8 | **43** | B | ⚠️ Queue: Workshop |
| **2** | The Ruby Lock | Ch 1: Foundation | Shō | 6 | 10 | 5 | 6 | 7 | 8 | **42** | B | ⚠️ Queue: Workshop |
| **3** | Prismatic Corridors | Ch 1: Foundation | Ten | 5 | 10 | 5 | 6 | 6 | 7 | **39** | C | ⚠️ Queue: Workshop |
| **4** | The Shrouded Vault | Ch 1: Foundation | Ketsu | 6 | 10 | 5 | 6 | 6 | 7 | **40** | C | ⚠️ Queue: Workshop |
| **5** | The Wooden Ramp | Ch 2: Vertical | Ki | 6 | 10 | 6 | 7 | 5 | 8 | **42** | B | ⚠️ Queue: Workshop |
| **6** | Canopy Crossings | Ch 2: Vertical | Shō | 6 | 10 | 5 | 6 | 5 | 7 | **39** | C | ⚠️ Queue: Workshop |
| **7** | Emerald Overlook | Ch 2: Vertical | Ten | 5 | 10 | 5 | 6 | 5 | 7 | **38** | C | ⚠️ Queue: Workshop |
| **8** | Skyway Citadel | Ch 2: Vertical | Ketsu | 6 | 10 | 6 | 6 | 5 | 7 | **40** | C | ⚠️ Queue: Workshop |
| **9** | The Iron Lever | Ch 3: Clockwork | Ki | 7 | 10 | 7 | 7 | 7 | 8 | **46** | B | Scheduled v1.19 |
| **10** | Clockwork Gates | Ch 3: Clockwork | Shō | 7 | 10 | 7 | 7 | 7 | 8 | **46** | B | Scheduled v1.19 |
| **11** | Shifting Foundations | Ch 3: Clockwork | Ten | 7 | 10 | 7 | 7 | 7 | 7 | **45** | B | Scheduled v1.19 |
| **12** | Master of Wheels | Ch 3: Clockwork | Ketsu | 7 | 10 | 7 | 7 | 7 | 7 | **45** | B | Scheduled v1.19 |
| **13** | The First Rift | Ch 4: Astral | Ki | 7 | 10 | 7 | 7 | 7 | 8 | **46** | B | Scheduled v1.20 |
| **14** | Twinned Portals | Ch 4: Astral | Shō | 7 | 10 | 7 | 7 | 7 | 8 | **46** | B | Scheduled v1.20 |
| **15** | Dimensional Warp | Ch 4: Astral | Ten | 7 | 10 | 8 | 7 | 7 | 7 | **46** | B | Scheduled v1.20 |
| **16** | The Astral Nexus | Ch 4: Astral | Ketsu | 7 | 10 | 8 | 7 | 7 | 7 | **46** | B | Scheduled v1.20 |
| **17** | Flame Vents | Ch 5: Danger | Ki | 8 | 10 | 7 | 8 | 7 | 8 | **48** | A | Approved |
| **18** | Sentinel Patrol | Ch 5: Danger | Shō | 8 | 10 | 7 | 7 | 7 | 8 | **47** | B | Approved |
| **19** | Molten Rhythms | Ch 5: Danger | Ten | 7 | 10 | 7 | 7 | 7 | 7 | **45** | B | Approved |
| **20** | Caldera Gauntlet | Ch 5: Danger | Ketsu | 8 | 10 | 8 | 7 | 7 | 7 | **47** | B | Approved |
| **21** | The Memory Seal | Ch 6: Arcane | Ki | 8 | 10 | 8 | 8 | 8 | 8 | **50** | A | Approved |
| **22** | Dual Enigmas | Ch 6: Arcane | Shō | 8 | 10 | 8 | 7 | 8 | 8 | **49** | A | Approved |
| **23** | Cipher of Stars | Ch 6: Arcane | Ten | 8 | 10 | 8 | 7 | 8 | 7 | **48** | A | Approved |
| **24** | Observatory Sanctum | Ch 6: Arcane | Ketsu | 8 | 10 | 8 | 7 | 8 | 8 | **49** | A | Approved |
| **25** | Crucible of Ascent | Ch 7: Trials | Ki | 8 | 10 | 8 | 7 | 8 | 8 | **49** | A | Approved |
| **26** | Labyrinth of Echoes | Ch 7: Trials | Shō | 7 | 10 | 7 | 7 | 8 | 7 | **46** | B | Approved |
| **27** | Prismatic Depths | Ch 7: Trials | Ten | 7 | 10 | 8 | 7 | 8 | 7 | **47** | B | Approved |
| **28** | The Sovereign Trial | Ch 7: Trials | Ketsu | 8 | 10 | 8 | 8 | 8 | 8 | **50** | A | Approved |
| **29** | The Four Compass Points | Ch 8: Monolith | Ki | 8 | 10 | 8 | 8 | 8 | 8 | **50** | A | Approved |
| **30** | Perspective Shift | Ch 8: Monolith | Shō | 8 | 10 | 8 | 8 | 8 | 8 | **50** | A | Approved |
| **31** | Occluded Pathways | Ch 8: Monolith | Ten | 8 | 10 | 9 | 8 | 8 | 8 | **51** | A | Approved |
| **32** | Apex of the Monolith | Ch 8: Monolith | Ketsu | 9 | 10 | 9 | 8 | 8 | 8 | **52** | A | Approved |

---

## 2. Key Audit Findings & Shortcomings

### A. The "Monotonous Scale" Anti-Pattern in Chapters 1 & 2
* **Uniform Grids**: Levels 1–4 and 5–8 exhibit the exact same structural template:
  * Spawn is consistently locked at top-left `(1, 1)`.
  * Exit is consistently locked at bottom-right `(W-2, H-2)`.
  * The geometry simply expands in grid size:
    * Chapter 1: 15×15 (Level 1) → 15×15 (Level 2) → 17×17 (Level 3) → 19×19 (Level 4).
    * Chapter 2: 15×15 (Level 5) → 17×17 (Level 6) → 19×19 (Level 7) → 21×21 (Level 8).
* **Missing Kishōtenketsu Progression**:
  * Level 1 is overly spacious for an introductory level; contains multiple dead-ends rather than isolating the single-key mechanic cleanly.
  * Level 3 (Twist) does not subvert any expectations; it just adds a third key color in a slightly larger maze.
  * Level 5 (Bridge introduction) uses an overly long, generic maze before the first ramp.
* **Rotation Visual Flaws in Chapter 2**:
  * Bridges scored low on Aesthetics (5/10) due to inverted plank orientation (`renderOverheadLayer`) drawing horizontal bridges as vertical decks.

### B. High-Performing Chapters (Chapters 6 & 8)
* **Chapter 6 (Arcane Seals)** scores consistently high (48–50/60) due to memorable Simon and Cipher minigame encounters.
* **Chapter 8 (The Shifting Monolith)** scores highest (50–52/60) due to 4-way camera rotation puzzles and multi-exit non-Euclidean routing.

---

## 3. Workshopping Target Plan: Chapters 1 & 2

### Chapter 1: The Foundation (Whispering Dungeon)

| Level | Current Score | Target Score | Workshop Objective |
| :---: | :---: | :---: | :--- |
| **Level 1** (*Ki*) | 43 (B) | **54+ (A/S)** | Compact 11×11 atrium. West spawn, East exit sanctuary. Zero dead-ends; purely teaches key pickup and door unlock. |
| **Level 2** (*Shō*) | 42 (B) | **53+ (A)** | 15×13 twin-vault dungeon. South spawn. Branching choice between East Ruby Vault and West Sapphire Crypt. |
| **Level 3** (*Ten*) | 39 (C) | **52+ (A)** | 17×15 crossroad twist. Direct path to exit is barred by a 3-gate sequence; forces counter-intuitive perimeter routing. |
| **Level 4** (*Ketsu*) | 40 (C) | **54+ (A/S)** | 19×17 grand four-wing cathedral. Synthesizes 3 key colors, fog-of-war exploration, and sequential wing mastery. |

### Chapter 2: The Vertical Dimension (Emerald Canopy)

| Level | Current Score | Target Score | Workshop Objective |
| :---: | :---: | :---: | :--- |
| **Level 5** (*Ki*) | 42 (B) | **54+ (A/S)** | Compact 13×11 forest clearing. Teaches Ramp-Up (`R_N`), Bridge Deck traversal (`B_EW`), and Underpass crossing in pure clarity. |
| **Level 6** (*Shō*) | 39 (C) | **53+ (A)** | 15×13 canopy crossroads. Lower ground key unlocks an elevated bridge gate, teaching vertical interdependence. |
| **Level 7** (*Ten*) | 38 (C) | **52+ (A)** | 17×15 sunken chasm. Crossing bridges weave between upper and lower tiers to navigate past blocked underpasses. |
| **Level 8** (*Ketsu*) | 40 (C) | **54+ (A/S)** | 19×17 canopy citadel. Synthesizes 4-way ramps, interlocking bridge decks, and key isolation into a grand vertical sanctuary. |
