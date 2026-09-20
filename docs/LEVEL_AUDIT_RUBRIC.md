# Level Audit Rubric & Rigorous Quality Standards

This document establishes the official multi-perspective judging rubric, granular scoring dimensions, and uncompromising quality standards for auditing all levels in the **Casual Maze Game**.

* **Audit Standard**: Critical Quality Assurance & Player Experience Audit
* **Version**: `2.0.0`
* **Auditing Philosophy**: **Strict, critical, and realistic.** Levels are judged by actual player experience, visual rendering polish, movement flow, and architectural distinctiveness. Flat primitives, excessive backtracking, and repetitive corridors receive harsh, explicit penalties.

---

## 1. Multi-Perspective Evaluation Axes (60 Points Total)

Every level is evaluated across six rigorous axes, each scored from **0 to 10 points** with explicit sub-criteria and mandatory point deductions:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   6-AXIS RIGOROUS LEVEL QUALITY RADAR                  │
├────────────────────────┬───────────────────────┬───────────────────────┤
│ 1. Kishōtenketsu Stage │ 2. Gating Integrity   │ 3. Spatial Architecture│
│    Alignment (0–10)    │    & Logic (0–10)     │    & Novelty (0–10)   │
├────────────────────────┼───────────────────────┼───────────────────────┤
│ 4. Gameplay Flow       │ 5. Visual Aesthetics  │ 6. Calibration &      │
│    & Backtrack (0–10)  │    & Textures (0–10)  │    Ergonomics (0–10)  │
└────────────────────────┴───────────────────────┴───────────────────────┘
```

---

### Axis 1: Design & Kishōtenketsu Stage Alignment (0–10 pts)
Evaluates how cleanly the level fulfills its specific narrative and mechanical role in the chapter's 4-stage progression:

* **Sub-Criteria**:
  * **Role Fidelity (3 pts)**: Strictly adheres to its designated stage:
    * *Ki (Intro)*: Introduces a single concept with absolute conceptual clarity.
    * *Shō (Development)*: Expands the concept through dual paths, branching, or pairing.
    * *Ten (Twist)*: Subverts player assumptions with counter-intuitive constraints or perspective shifts.
    * *Ketsu (Synthesis)*: Combines all prior chapter elements into a cohesive, multi-layered crescendo.
  * **Pacing & Escalation (3 pts)**: Natural flow of tension; puzzles build organically without abrupt difficulty spikes.
  * **Mechanical Purity (2 pts)**: Avoids distracting, unintroduced mechanics that belong to later chapters.
  * **Lore & Narrative Context (2 pts)**: Meaningful, immersive Architect's Journal note that provides subtle environmental clues without spoon-feeding.
* **Mandatory Deductions**:
  * `-3 pts`: Level repeats an identical structural concept or geometry from an earlier stage in the chapter.
  * `-2 pts`: Stage role is muddy or indistinct (e.g., a *Ki* level with bloated puzzle clutter, or a *Ten* level that lacks a genuine twist).
  * `-2 pts`: Generic or filler Architect Note that adds no narrative value or spatial context.

---

### Axis 2: Functionality & Gating Integrity (0–10 pts - Gatekeeper)
Evaluates logical solvability, key economy, and total circumvention prevention:

* **Sub-Criteria**:
  * **Zero Circumvention (4 pts)**: Strict mathematical necessity. Every single locked door, gate, lever, or mechanism must lie on the critical path.
  * **Key Economy & Relevance (3 pts)**: Every key placed has a unique purpose and is consumed. Zero orphaned keys, redundant doors, or useless inventory items.
  * **Chokepoint Placement (3 pts)**: Gates are placed at strategic architectural bottlenecks (bridge thresholds, archways, vault gates) rather than arbitrary corridor midpoints.
* **Mandatory Deductions**:
  * **AUTOMATIC 0/10 & REJECTION**: Any level where a player can reach the exit while bypassing *any* locked door, puzzle gate, or required lever.
  * `-3 pts`: Keys placed immediately adjacent to their corresponding door with zero spatial exploration required.
  * `-2 pts`: Arbitrary dead-ends that contain no keys, lore tablets, bonuses, or landmarks.

---

### Axis 3: Spatial Architecture & Room Rhythm (0–10 pts)
Evaluates architectural creativity, spatial variety, and avoidance of monotonous corridor grids:

* **Sub-Criteria**:
  * **Anti-Box Floorplan (3 pts)**: Varied spatial rhythm. Alternates between open chambers, colonnades, circular courtyards, and narrow connecting corridors.
  * **Landmark Focal Points (3 pts)**: Memorable architectural set pieces (e.g., central sanctum, sunken moat, elevated balconies, dual wings, twin altars) that provide instant mental orientation.
  * **Dynamic Anchor Points (2 pts)**: Spawn and exit locations are integrated into the architecture (e.g., West terrace to East dais), strictly avoiding generic top-left to bottom-right corner traps.
  * **Corridor Hierarchy (2 pts)**: Main thoroughfares are distinct from secondary alcoves and secret niches.
* **Mandatory Deductions**:
  * `-4 pts`: Level is predominantly a uniform 1-tile grid maze (a "grid box") lacking distinct rooms or plazas.
  * `-3 pts`: Spawn is locked at `(1, 1)` and exit at `(W-2, H-2)` without architectural justification.
  * `-2 pts`: Repetitive, parallel corridor runs that make different wings of the maze feel interchangeable.

---

### Axis 4: Gameplay Flow, Backtracking & Fun (0–10 pts)
Evaluates player engagement, deduction satisfaction, and elimination of tedious transit:

* **Sub-Criteria**:
  * **"Aha!" Deduction (3 pts)**: Provides genuine moments of realization when a player discovers how a key, lever, or bridge alters the path forward.
  * **Backtracking Minimization (3 pts)**: Efficient loopback architecture. Once an objective is retrieved, short-cuts or one-way drops return the player toward the lock without retracing dozens of empty tiles.
  * **Sightline & Horizon Readability (2 pts)**: Strategic view radius and open archways allow players to glimpse goals or landmarks ahead, guiding exploration naturally.
  * **Player Agency & Branching (2 pts)**: Meaningful exploration choices that reward deduction rather than blind trial-and-error guessing.
* **Mandatory Deductions**:
  * `-1 pt for every 8 steps` of empty backtracking through already-cleared, barren corridors to return to a locked gate (up to `-4 pts`).
  * `-3 pts`: Disorienting blind fog-of-war stumbling where exploration feels like a chore rather than an adventure.
  * `-2 pts`: Frustrating trial-and-error dead ends that punish exploration without clues.

---

### Axis 5: Visual Presentation, Textures & Polish (0–10 pts)
Evaluates the actual on-screen rendering quality, visual depth, textures, and camera rotation behavior:

* **Sub-Criteria**:
  * **Biome Thematic Fidelity (2 pts)**: Cohesive palette and distinct identity matching the designated theme (Dungeon, Jungle, Lava, Snow, Caverns, Citadel).
  * **Texture & Sprite Detail (2 pts)**: Use of detailed vector sprites, stone masonry patterns, foliage, and relief rather than flat solid-color Canvas fills. *(Note: Flat Canvas 2D color fills score 0/2).*
  * **Depth & Drop Shadows (2 pts)**: Proper 2.5D visual hierarchy with drop facades, cast shadows beneath elevated bridges, and ambient lighting.
  * **Decor & Prop Density (2 pts)**: Well-placed environmental props (wall torches, cracked stones, trailing vines, puddles, ancient runes, wall banners).
  * **Camera Rotation Readability (2 pts)**: Flawless rendering under 0°, 90°, 180°, and 270° camera angles with zero sprite clipping, zero inverted bridge planks, and proper Y-depth sorting.
* **Mandatory Deductions**:
  * `-4 pts`: Level visuals rely primarily on flat, untextured solid-color Canvas 2D rectangles.
  * `-3 pts`: Walls and floors are completely bare with zero decorative props, wall decor, or environmental details.
  * `-2 pts`: Visual distortion, inverted planks, or clipping when the camera is rotated.

---

### Axis 6: Calibration, Difficulty & Ergonomics (0–10 pts)
Evaluates mathematical balance, par step/time accuracy, and input ergonomics:

* **Sub-Criteria**:
  * **Par Steps Accuracy (3 pts)**: Empirically calibrated against optimal BFS solver solutions, providing a fair 15% to 25% allowance for exploratory pathing.
  * **Par Time Accuracy (2 pts)**: Calibrated against real-time traversal at standard player walk speed with a 20% speedrunner margin.
  * **Cognitive Load Curve (3 pts)**: Appropriate mental challenge for the level's position within the game; avoids both brainless triviality and overwhelming cognitive exhaustion.
  * **Input & Mobile Ergonomics (2 pts)**: Layout allows smooth navigation without frustrating 1-tile zig-zags that cause mis-taps on mobile or virtual D-pads.
* **Mandatory Deductions**:
  * `-3 pts`: Par steps or times are set arbitrarily without empirical BFS solver calibration.
  * `-2 pts`: Unreasonable difficulty spike or steep cliff relative to preceding levels.
  * `-2 pts`: Cluttered, narrow corridors that cause high input friction or collision snagging.

---

## 2. Realistic Quality Tiers & Acceptance Thresholds

Total Score is calculated out of **60 points**:

| Tier | Score Range | Classification | Meaning & Action Required |
| :---: | :---: | :--- | :--- |
| **S-Tier** | **54–60** | **Masterpiece** | Gold standard; custom vector sprites, dynamic lighting, zero backtrack tedium, brilliant architectural novelty. |
| **A-Tier** | **46–53** | **Production Ready** | High quality, distinct floorplan, strong visual atmosphere, tight pacing. Release candidate standard. |
| **B-Tier** | **38–45** | **Provisional / Acceptable** | Mechanically solid and 100% unbypassable, but visual presentation is basic, or minor backtracking exists. |
| **C-Tier** | **28–37** | **Underperforming / Needs Polish** | Functional and solvable, but visibly flat/plain, relies on basic Canvas rectangles, or has noticeable backtrack transit. Current baseline for initial rework. |
| **F-Tier** | **< 28** | **Deficient / Broken** | Fails release gate. Repetitive clone, broken gating, flat box maze, or severe visual/input flaws. |

### Minimum Release Gate for Production Campaign:
1. **Total Score**: Must achieve at least **B-Tier ($\ge 38 / 60$)** for beta, and **A-Tier ($\ge 46 / 60$)** for final production release.
2. **Gating Integrity**: Strictly **10 / 10** (Zero bypasses).
3. **Solver Reachability**: BFS solver returns a valid path (`solveLevel !== null`).
4. **Par Calibration**: Par steps $\ge \text{optimal BFS steps} \times 1.15$.
5. **Asset Drift**: SHA-256 hash in `levels/manifest.json` matches file bytes exactly.

---

## 3. Auditing Checklist & Scorecard Template

When conducting an audit, evaluators must fill out this exact scorecard with explicit justifications:

```markdown
### Level Audit: Level [ID] — "[Title]"
* **Chapter / Zone**: [Chapter Name]
* **Kishōtenketsu Stage**: [Ki / Shō / Ten / Ketsu]
* **Grid Dimensions**: [W x H]
* **Spawn -> Exit**: [Spawn (x, y)] -> [Exit (x, y)]

| Axis | Max | Score | Specific Deductions & Evidence |
| :--- | :---: | :---: | :--- |
| 1. Kishōtenketsu Alignment | 10 | [Score] | [Deductions taken with rationale] |
| 2. Gating Integrity | 10 | [Score] | [Must be 10/10 or instant fail] |
| 3. Spatial Architecture | 10 | [Score] | [Deductions for 1-tile corridors or box shape] |
| 4. Flow & Backtracking | 10 | [Score] | [Deductions for empty backtrack steps] |
| 5. Visual Aesthetics | 10 | [Score] | [Deductions for flat canvas primitives / no props] |
| 6. Calibration & Ergonomics| 10 | [Score] | [Deductions for par accuracy and input friction] |
| **Total** | **60** | **[Total]** | **Tier: [S / A / B / C / F]** |

* **Key Strengths**:
  - ...
* **Critical Deficiencies**:
  - ...
* **Actionable Next Iteration Tasks**:
  1. ...
  2. ...
```
