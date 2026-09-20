# Level Scoring Register & Chapter Audit

This document maintains the official audit register, critical evaluation scores, deduction breakdowns, and iteration directives for all levels in the **Casual Maze Game** based on the rigorous [Level Audit Rubric v2.0](LEVEL_AUDIT_RUBRIC.md).

* **Audit Standard**: Critical Quality & Player Experience Audit (v2.0)
* **Audit Date**: 2026-09-20
* **Auditor**: Antigravity Quality Assurance Engine
* **Engine Version**: `v1.18.0`
* **Auditing Philosophy**: **Brutally critical and realistic.** Levels are penalized for flat Canvas primitives, excessive backtracking transit, 1-tile corridor grids, and basic prop density. Mechanically sound and unbypassable levels currently sit in the **34–42 / 60 range (C to B- Tiers)** until rich vector textures, lighting, and room architecture are introduced.

---

## 1. Master Audit Summary Table

| ID | Title | Chapter / Zone | Kishō Stage | D1: Des (10) | D2: Gate (10) | D3: Arch (10) | D4: Flow (10) | D5: Vis (10) | D6: Cal (10) | Total (/60) | Tier | Quality Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **T1** | Moving Forward | Tutorial | Ki | 7 | 10 | 6 | 7 | 4 | 7 | **41** | B | Provisional |
| **T2** | The Golden Key | Tutorial | Shō | 7 | 10 | 6 | 7 | 4 | 7 | **41** | B | Provisional |
| **T3** | The Hidden Lever | Tutorial | Ten | 7 | 10 | 6 | 6 | 4 | 7 | **40** | B | Provisional (Repaired) |
| **T4** | Elevation & Ramps | Tutorial | Ki | 7 | 10 | 6 | 7 | 4 | 7 | **41** | B | Provisional |
| **T5** | The High Bridge | Tutorial | Shō | 7 | 10 | 6 | 7 | 4 | 7 | **41** | B | Provisional |
| **T6** | Dimensional Portal | Tutorial | Ketsu | 7 | 10 | 6 | 6 | 4 | 7 | **40** | B | Provisional (Repaired) |
| **1** | First Footsteps | Ch 1: Foundation | Ki | 7 | 10 | 5 | 5 | 3 | 7 | **37** | C | ⚠️ Backtrack & Flat Art |
| **2** | The Ruby Lock | Ch 1: Foundation | Shō | 7 | 10 | 6 | 6 | 3 | 6 | **38** | B | ⚠️ Flat Art & 1-Tile Corridors |
| **3** | Prismatic Corridors | Ch 1: Foundation | Ten | 7 | 10 | 6 | 5 | 3 | 6 | **37** | C | ⚠️ Heavy Backtrack & Flat Art |
| **4** | The Shrouded Vault | Ch 1: Foundation | Ketsu | 8 | 10 | 6 | 5 | 3 | 6 | **38** | B | ⚠️ Wing Backtrack & Flat Art |
| **5** | The Canopy Bridge | Ch 2: Vertical | Ki | 8 | 10 | 6 | 7 | 4 | 7 | **42** | B | Functional / Needs Foliage Art |
| **6** | Canopy Crossings | Ch 2: Vertical | Shō | 8 | 10 | 6 | 6 | 4 | 6 | **40** | B | Functional / Needs Foliage Art |
| **7** | The Sunken Chasm | Ch 2: Vertical | Ten | 8 | 10 | 6 | 6 | 4 | 6 | **40** | B | Functional / Needs Chasm Polish |
| **8** | Citadel of the Two Horizons | Ch 2: Vertical | Ketsu | 8 | 10 | 7 | 6 | 4 | 6 | **41** | B | Good Architecture / Needs Textures |
| **9** | The Iron Lever | Ch 3: Clockwork | Ki | 5 | 7 | 5 | 5 | 3 | 5 | **30** | C | Scheduled v1.20 |
| **10** | Clockwork Gates | Ch 3: Clockwork | Shō | 5 | 7 | 5 | 5 | 3 | 5 | **30** | C | Scheduled v1.20 |
| **11** | Shifting Foundations | Ch 3: Clockwork | Ten | 5 | 7 | 5 | 5 | 3 | 5 | **30** | C | Scheduled v1.20 |
| **12** | Master of Wheels | Ch 3: Clockwork | Ketsu | 5 | 7 | 5 | 5 | 3 | 5 | **30** | C | Scheduled v1.20 |
| **13** | The First Rift | Ch 4: Astral | Ki | 5 | 7 | 5 | 5 | 3 | 5 | **30** | C | Scheduled v1.21 |
| **14** | Twinned Portals | Ch 4: Astral | Shō | 5 | 7 | 5 | 5 | 3 | 5 | **30** | C | Scheduled v1.21 |
| **15** | Dimensional Warp | Ch 4: Astral | Ten | 5 | 7 | 5 | 5 | 3 | 5 | **30** | C | Scheduled v1.21 |
| **16** | The Astral Nexus | Ch 4: Astral | Ketsu | 5 | 7 | 5 | 5 | 3 | 5 | **30** | C | Scheduled v1.21 |
| **17** | Flame Vents | Ch 5: Danger | Ki | 6 | 8 | 6 | 6 | 4 | 6 | **36** | C | Scheduled v1.22 |
| **18** | Sentinel Patrol | Ch 5: Danger | Shō | 6 | 8 | 6 | 6 | 4 | 6 | **36** | C | Scheduled v1.22 |
| **19** | Molten Rhythms | Ch 5: Danger | Ten | 6 | 8 | 6 | 5 | 4 | 6 | **35** | C | Scheduled v1.22 |
| **20** | Caldera Gauntlet | Ch 5: Danger | Ketsu | 6 | 8 | 6 | 5 | 4 | 6 | **35** | C | Scheduled v1.22 |
| **21** | The Memory Seal | Ch 6: Arcane | Ki | 7 | 9 | 6 | 7 | 5 | 6 | **40** | B | Approved Minigame |
| **22** | Dual Enigmas | Ch 6: Arcane | Shō | 7 | 9 | 6 | 6 | 5 | 6 | **39** | B | Approved Minigame |
| **23** | Cipher of Stars | Ch 6: Arcane | Ten | 7 | 9 | 6 | 6 | 5 | 6 | **39** | B | Approved Minigame |
| **24** | Observatory Sanctum | Ch 6: Arcane | Ketsu | 7 | 9 | 6 | 6 | 5 | 6 | **39** | B | Approved Minigame |
| **25** | Crucible of Ascent | Ch 7: Trials | Ki | 6 | 8 | 6 | 6 | 4 | 6 | **36** | C | Scheduled v1.23 |
| **26** | Labyrinth of Echoes | Ch 7: Trials | Shō | 6 | 8 | 6 | 5 | 4 | 6 | **35** | C | Scheduled v1.23 |
| **27** | Prismatic Depths | Ch 7: Trials | Ten | 6 | 8 | 6 | 5 | 4 | 6 | **35** | C | Scheduled v1.23 |
| **28** | The Sovereign Trial | Ch 7: Trials | Ketsu | 7 | 9 | 7 | 6 | 5 | 6 | **40** | B | Scheduled v1.23 |
| **29** | The Four Compass Points | Ch 8: Monolith | Ki | 7 | 9 | 7 | 7 | 5 | 6 | **41** | B | Approved Rotation |
| **30** | Perspective Shift | Ch 8: Monolith | Shō | 7 | 9 | 7 | 7 | 5 | 6 | **41** | B | Approved Rotation |
| **31** | Occluded Pathways | Ch 8: Monolith | Ten | 7 | 9 | 7 | 7 | 5 | 6 | **41** | B | Approved Rotation |
| **32** | Apex of the Monolith | Ch 8: Monolith | Ketsu | 8 | 10 | 8 | 7 | 5 | 6 | **44** | B | Approved Finale |

---

## 2. In-Depth Chapter 1 Critical Scorecards (Levels 1–4)

### Level 1: First Footsteps (*Ki*)
* **Dimensions**: 15×15 | **Spawn $\to$ Exit**: `(1, 1)` $\to$ `(13, 13)` | **Par**: 35 steps / 20s
* **Audit Score**: **37 / 60 (C-Tier: Underperforming / Needs Polish)**
  * *D1: Kishō Alignment (7/10)*: Clean introduction to single key and door. -2 for spatial bloat (15x15 is oversized for a simple intro), -1 for pacing.
  * *D2: Gating Integrity (10/10)*: Strictly unbypassable. Golden key required for golden door.
  * *D3: Spatial Architecture (5/10)*: -3 for dominant 1-tile grid corridors without open rooms, -2 for traditional corner-to-corner anchors.
  * *D4: Flow & Backtracking (5/10)*: -3 penalty for ~16 steps of empty backtracking from key at `(1, 11)` back to corridor split at row 5. -2 for lack of a loopback shortcut.
  * *D5: Visual Aesthetics (3/10)*: -4 penalty for flat solid-color Canvas 2D rectangles without textures; -3 for barren slate walls lacking decorative wall props or torches.
  * *D6: Calibration (7/10)*: Solver par steps (35) match, but movement through narrow 1-tile turns feels plain. -2 for input friction, -1 for pacing.
* **Critical Directives**:
  1. Add vector masonry textures and dynamic torch lighting.
  2. Open the starting area into a small entry vestibule and add a one-way ledge or shortcut returning from the key alcove to eliminate empty backtracking.

---

### Level 2: The Ruby Lock (*Shō*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(7, 11)` $\to$ `(7, 1)` | **Par**: 38 steps / 22s
* **Audit Score**: **38 / 60 (B-Tier: Provisional)**
  * *D1: Kishō Alignment (7/10)*: South-to-North progression develops the vertical axis. Branching between western Ruby vault and eastern crypt. -2 for basic branch concept, -1 for lore depth.
  * *D2: Gating Integrity (10/10)*: Strictly unbypassable. Ruby key at `(3, 3)` unlocks Ruby door at `(7, 3)`.
  * *D3: Spatial Architecture (6/10)*: Center spawn to center exit breaks corner-to-corner template. -2 for 1-tile corridor grid, -2 for lack of architectural focal set pieces.
  * *D4: Flow & Backtracking (6/10)*: Better flow than Level 1, but still requires ~12 steps of backtracking out of the Ruby chamber. -2 for backtracking, -2 for blind fog exploration.
  * *D5: Visual Aesthetics (3/10)*: -4 for flat solid color Canvas fills; door is a simple colored rectangle; zero wall decor.
  * *D6: Calibration (6/10)*: Well balanced step budget. -2 for touch control friction, -2 for difficulty jump.
* **Critical Directives**:
  1. Expand the Ruby vault into an octagonal room with decorative braziers.
  2. Implement SVG vector door with metallic portcullis bars and glowing lock rune.

---

### Level 3: Prismatic Corridors (*Ten*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(1, 7)` $\to$ `(8, 7)` | **Par**: 65 steps / 38s
* **Audit Score**: **37 / 60 (C-Tier: Underperforming / Needs Polish)**
  * *D1: Kishō Alignment (7/10)*: Good twist: central dais is locked by Purple gate, forcing player into perimeter catacombs for Emerald key to reach the Purple key. -2 for steep complexity jump, -1 for narrative delivery.
  * *D2: Gating Integrity (10/10)*: Strictly unbypassable. Emerald key $\to$ Emerald door $\to$ Purple key $\to$ Purple door $\to$ Dais.
  * *D3: Spatial Architecture (6/10)*: Center dais at `(8, 7)` provides a strong anchor point. -2 for repetitive symmetric corridors, -2 for 1-tile grid lines.
  * *D4: Flow & Backtracking (5/10)*: Severe backtracking penalty (-4)! Player walks south to `(3, 12)` for Emerald key, backtracks all the way north to `(7, 1)` to unlock gate, walks east to `(15, 2)` for Purple key, then backtracks to center dais. Over 30 steps of re-traversal! -1 for fog disorientation.
  * *D5: Visual Aesthetics (3/10)*: -4 for flat canvas primitives, -3 for bare corridor walls without crystals or gems.
  * *D6: Calibration (6/10)*: Par steps (65) verified by solver, but total traversal time feels fatigued due to backtracks.
* **Critical Directives**:
  1. Add looping corridors connecting South catacombs to East gallery so player doesn't have to retrace the entire western hall.
  2. Decorate catacombs with amethyst crystals and wall sconces.

---

### Level 4: The Shrouded Vault (*Ketsu*)
* **Dimensions**: 19×17 | **Spawn $\to$ Exit**: `(9, 8)` $\to$ `(2, 8)` | **Par**: 90 steps / 52s
* **Audit Score**: **38 / 60 (B-Tier: Provisional)**
  * *D1: Kishō Alignment (8/10)*: Grand synthesis of Chapter 1. 4-wing layout requiring Gold, Ruby, and Sapphire keys under Fog of War. -1 for pacing, -1 for lore integration.
  * *D2: Gating Integrity (10/10)*: Strictly unbypassable. All 3 colored keys required to reach the West Altar.
  * *D3: Spatial Architecture (6/10)*: Center courtyard spawn at `(9, 8)` with 4 distinct cardinal wings is an excellent structural improvement. -2 for 1-tile corridor grid inside wings, -2 for lack of distinct decorative theming per wing.
  * *D4: Flow & Backtracking (5/10)*: -3 for traversing into each wing and backtracking back out to the courtyard (~30 steps total). -2 for disorienting fog navigation.
  * *D5: Visual Aesthetics (3/10)*: -4 for flat canvas primitives; altar is a simple portal tile; no stone pillars or cathedral rugs.
  * *D6: Calibration (6/10)*: Par steps (90) solver benchmarked. -2 for fatigue on mobile, -2 for difficulty jump.
* **Critical Directives**:
  1. Add distinctive color-coded lighting/motes in each wing (red embers in ruby wing, blue mist in sapphire wing, gold motes in gilded wing).
  2. Add loopback side-passages between wings to reduce courtyard re-crossings.

---

## 3. In-Depth Chapter 2 Critical Scorecards (Levels 5–8)

### Level 5: The Canopy Bridge (*Ki*)
* **Dimensions**: 15×13 | **Spawn $\to$ Exit**: `(2, 11)` $\to$ `(12, 4)` | **Par**: 28 steps / 18s
* **Audit Score**: **42 / 60 (B-Tier: Provisional)**
  * *D1: Kishō Alignment (8/10)*: Strong introduction to elevated canopy bridge (`B_EW`) and directional ramps (`R_N`/`R_S`). Canopy key perched at $z=1$. -1 for simple lore, -1 for pacing.
  * *D2: Gating Integrity (10/10)*: Strictly unbypassable. Ramp $\to$ Bridge $\to$ Key $\to$ Ramp $\to$ Door $\to$ Exit.
  * *D3: Spatial Architecture (6/10)*: Diagonal traverse from SW to NE. Elevated bridge spans over an underpass tunnel. -2 for 1-tile corridors on ground, -2 for lack of canopy treehouse landmarks.
  * *D4: Flow & Backtracking (7/10)*: Best flow in the chapter! Player naturally ascends, crosses the bridge while collecting the key, and descends directly near the exit. Minimal backtracking (-2 for dead-end side underpass, -1 for sightline obstruction).
  * *D5: Visual Aesthetics (4/10)*: Bridge deck has wooden plank rendering, but jungle terrain relies on flat green canvas tiles without vines, tree trunks, or drop shadows beneath the bridge (-3 for flat primitives, -3 for bare foliage).
  * *D6: Calibration (7/10)*: Tightly calibrated par steps (28) and time (18s).
* **Critical Directives**:
  1. Add vector vine sprites trailing off bridge railings and render cast shadows on the ground underpass.
  2. Decorate jungle clearing with fern props.

---

### Level 6: Canopy Crossings (*Shō*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 7)` $\to$ `(15, 2)` | **Par**: 44 steps / 26s
* **Audit Score**: **40 / 60 (B-Tier: Provisional)**
  * *D1: Kishō Alignment (8/10)*: Strong mechanical development. Teaches dual traversal: ground tunnel underpass first to retrieve Amber key, then elevated bridge deck overpass to retrieve Emerald key. -1 for subtle narrative, -1 for pacing.
  * *D2: Gating Integrity (10/10)*: Strictly unbypassable. Amber key unlocks southern ramp; Emerald key unlocks northern sanctuary.
  * *D3: Spatial Architecture (6/10)*: Bridge in center, lower eastern glen, northern cliff trail. -2 for 1-tile grid corridor lines, -2 for lack of distinctive canopy structures.
  * *D4: Flow & Backtracking (6/10)*: Looping under the bridge to the lower glen works well, but traveling from the Amber key at `(14, 12)` back to the southern ramp at `(8, 11)` has ~12 steps of backtrack transit (-2). -2 for path ambiguity.
  * *D5: Visual Aesthetics (4/10)*: -3 for flat canvas fills; -3 for lack of jungle vegetation and cliff drop facades.
  * *D6: Calibration (6/10)*: Par steps (44) calibrated against solver. -2 for touch control friction, -2 for pacing.
* **Critical Directives**:
  1. Add a visual waterfall or ancient jungle ruin in the lower eastern glen.
  2. Implement wooden plank bridge textures and foliage canopies.

---

### Level 7: The Sunken Chasm (*Ten*)
* **Dimensions**: 17×15 | **Spawn $\to$ Exit**: `(2, 5)` $\to$ `(8, 1)` | **Par**: 48 steps / 28s
* **Audit Score**: **40 / 60 (B-Tier: Provisional)**
  * *D1: Kishō Alignment (8/10)*: Good twist: two perpendicular bridges (`B_NS` East-West deck and `B_EW` North-South deck) creating an intersecting 3D chasm puzzle. -1 for lore delivery, -1 for transition clarity.
  * *D2: Gating Integrity (10/10)*: Strictly unbypassable. Both bridges mandatory to claim Azure key and reach exit.
  * *D3: Spatial Architecture (6/10)*: Interlocking bridges provide genuine 3D multi-elevation navigation. -2 for 1-tile corridors on ground, -2 for lack of chasm/cliff wall relief.
  * *D4: Flow & Backtracking (6/10)*: Crossing bridge 1 to bridge 2 is rewarding, but returning from the southern descent back to the northern door involves ~14 steps of transit (-2). -2 for camera disorientation on perpendicular spans.
  * *D5: Visual Aesthetics (4/10)*: Void areas are drawn as plain dark canvas rather than an atmospheric mist-filled sunken chasm (-3 for flat primitives, -3 for bare gorge).
  * *D6: Calibration (6/10)*: Par steps (48) calibrated against solver. -2 for camera turning disorientation, -2 for touch control turns.
* **Critical Directives**:
  1. Render atmospheric mist and bottomless chasm drop visuals beneath bridge decks.
  2. Add stone pillar supports holding up the perpendicular spans.

---

### Level 8: Citadel of the Two Horizons (*Ketsu*)
* **Dimensions**: 19×17 | **Spawn $\to$ Exit**: `(9, 8)` $\to$ `(9, 2)` | **Par**: 68 steps / 40s
* **Audit Score**: **41 / 60 (B-Tier: Provisional)**
  * *D1: Kishō Alignment (8/10)*: Grand synthesis of Chapter 2. Central courtyard flanked by twin parallel bridges, with sequential Ruby and Gold locks guarding the apex altar. -1 for narrative climax, -1 for pacing.
  * *D2: Gating Integrity (10/10)*: Strictly unbypassable. West bridge $\to$ Ruby key $\to$ Ruby door $\to$ East bridge $\to$ Gold key $\to$ Gold door $\to$ Apex Altar.
  * *D3: Spatial Architecture (7/10)*: Strongest architectural plan in Chapter 2: central courtyard (5×3 plaza), twin bridges, north apex altar. -2 for 1-tile side corridors, -1 for lack of citadel tower visuals.
  * *D4: Flow & Backtracking (6/10)*: Logical progression through courtyard and wings, but returning from West wing back into the courtyard requires ~16 steps of transit (-2). -2 for blind exploration.
  * *D5: Visual Aesthetics (4/10)*: Great potential for an epic citadel climax, but currently rendered with basic green/brown canvas colors without stone masonry textures, torches, or citadel battlements (-3 for flat primitives, -3 for lack of props).
  * *D6: Calibration (6/10)*: Par steps (68) solver-benchmarked. -2 for length fatigue on mobile, -2 for input friction.
* **Critical Directives**:
  1. Implement citadel stone wall textures and flaming wall braziers along the central courtyard.
  2. Add victory pedestal glow at the apex altar portal.

---

## 4. Workshopping & Polish Backlog (Milestones v1.20–v1.23)

Based on these critical scores, the immediate priorities in the [Master Backlog](BACKLOG.md) are:
1. **Epic 2 (Visuals)**: Connect SVG vector assets from `assets/` into `js/engine/renderer.js` to lift Aesthetics scores from **3–4/10** to **8–9/10** across all levels.
2. **Backtrack Reduction**: Add loopback shortcuts and one-way ledges in Levels 1, 3, 4, 6, and 8 to eliminate empty backtracking transit.
3. **Room Expansion**: Replace narrow 1-tile corridor grids with distinct geometric chambers, courtyards, and colonnades.
