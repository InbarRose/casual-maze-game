# Level Audit Rubric & Quality Standards

This document establishes the official multi-perspective judging rubric, scoring dimensions, and quality thresholds for auditing and evaluating all levels in the **Casual Maze Game**.

---

## 1. Multi-Perspective Evaluation Axes (60 Points Total)

Every level is evaluated across six distinct architectural and gameplay perspectives, each scored on a 0 to 10 scale:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        6-AXIS LEVEL QUALITY RADAR                      │
├────────────────────────┬───────────────────────┬───────────────────────┤
│ 1. Kishōtenketsu Stage │ 2. Gating Integrity   │ 3. Spatial Identity   │
│    Alignment (0–10)    │    & Bypass (0–10)    │    & Novelty (0–10)   │
├────────────────────────┼───────────────────────┼───────────────────────┤
│ 4. Gameplay Flow       │ 5. Aesthetics &       │ 6. Complexity &       │
│    & Fun (0–10)        │    Readability (0–10) │    Calibration (0–10) │
└────────────────────────┴───────────────────────┴───────────────────────┘
```

---

### Axis 1: Design & Kishōtenketsu Alignment (0–10)
Evaluates whether the level fulfills its specific role within the chapter's four-stage narrative arc:
* **9–10 (Exemplary)**: Perfect adherence to its designated stage (Ki, Shō, Ten, or Ketsu). Clear narrative intent; mechanic is isolated (Ki), branched (Shō), subverted (Ten), or synthesized (Ketsu) with precision.
* **7–8 (Good)**: Intent is recognizable, but exhibits slight pacing friction or minor extraneous elements.
* **5–6 (Mediocre)**: Generic puzzle design that lacks stage identity; mechanic is present but not structured into the Kishōtenketsu arc.
* **0–4 (Failing)**: Completely disjointed design; repeats previous stages without evolution, or acts as a clone of another level.

### Axis 2: Functionality & Gating Integrity (0–10)
Evaluates structural solvability, chokepoint necessity, and bypass prevention:
* **10 (Strict Requirement)**: 100% solvable via BFS solver. Every key, lever, gate, or mechanism is physically mandatory to reach the exit. Zero perimeter bypasses, walkarounds, or sequence breaks.
* **5–9 (Flawed)**: Solvable, but at least one key or obstacle can be circumvented via an alternate path.
* **0–4 (Broken)**: Level has softlocks, unreachable exits, broken elevation transitions, or missing key pairs.

> [!CRITICAL]
> **Zero-Bypass Gating Policy**: Any level scoring below **10/10** on Gating Integrity fails the quality gate immediately and cannot be merged.

### Axis 3: Novelty & Spatial Identity (0–10)
Evaluates architectural creativity, room rhythm, and avoidance of homogeneous corridor grids:
* **9–10 (Exemplary)**: Highly distinctive floor plan. Features recognizable landmarks (central courtyard, twin wings, grand nave, sunken moat, elevated balconies). Avoids generic box mazes.
* **7–8 (Good)**: Varied corridor widths and identifiable chambers, with some conventional labyrinth sections.
* **5–6 (Mediocre)**: Uniform 1-tile grid with arbitrary dead ends and lack of memorable focal points.
* **0–4 (Failing)**: Monotonous, repetitive corridor grid generated simply by increasing grid dimensions (+2 or +4) from the previous stage.

### Axis 4: Gameplay Flow & Fun (0–10)
Evaluates pacing, "Aha!" discovery, and player satisfaction:
* **9–10 (Exemplary)**: Engaging flow with minimal tedious backtracking. Clear visual clues reward spatial deduction. Produces satisfying eureka moments when solving gates or elevation puzzles.
* **7–8 (Good)**: Fun and engaging with minor backtracking or slight route ambiguity.
* **5–6 (Mediocre)**: Tedious navigation; excessive blind trial-and-error under fog-of-war.
* **0–4 (Failing)**: Frustrating or disorienting; repetitive dead-ends that punish exploration without clues.

### Axis 5: Visual Aesthetics & Readability (0–10)
Evaluates thematic coherence, lighting, contrast, and multi-angle camera readability:
* **9–10 (Exemplary)**: Stunning 2.5D visual hierarchy. Drop facades, shadows, bridge deck planks, and wall decor form an atmospheric, coherent biome. 100% clean rendering under 0°, 90°, 180°, and 270° camera rotation.
* **7–8 (Good)**: Strong visual presentation with minor clipping or slight contrast issues in dark corners.
* **5–6 (Mediocre)**: Flat or plain layout with sparse decor and generic tile usage.
* **0–4 (Failing)**: Visual bugs during rotation (inverted planks, overlapping walls) or illegible under fog-of-war.

### Axis 6: Complexity & Calibration (0–10)
Evaluates appropriate difficulty scaling, step budgets, and par metrics:
* **9–10 (Exemplary)**: Grid scale, step count, and par times are tightly calibrated against optimal solver data. Difficulty curve fits smoothly within chapter progression.
* **7–8 (Good)**: Well-balanced with slight discrepancy in par time or par steps (+/- 15%).
* **5–6 (Mediocre)**: Overly inflated or deflated par values; difficulty spikes abruptly.
* **0–4 (Failing)**: Impossible par metrics or trivially uncalibrated values (e.g., par steps lower than the BFS shortest path).

---

## 2. Quality Tiers & Acceptance Thresholds

Total Score is calculated out of 60 points:

| Tier | Score Range | Status | Action Required |
| :--- | :--- | :--- | :--- |
| **S-Tier** | 55–60 | **Exemplary** | Gold standard; reference model for future level authoring. |
| **A-Tier** | 48–54 | **Approved** | High quality; production ready. |
| **B-Tier** | 42–47 | **Provisional** | Acceptable for release; minor polish recommended in future iterations. |
| **C-Tier** | 35–41 | **Needs Work** | Fails release quality gate; targeted workshopping required. |
| **F-Tier** | <35 | **Deficient** | Complete overhaul or removal required. |

### Minimum Automated Release Gates
To be certified for the production campaign, a level must satisfy:
1. **Total Score**: $\ge 45 / 60$ ($\ge 75\%$).
2. **Gating Integrity**: Strictly **10 / 10** (Zero bypasses).
3. **Solver Reachability**: BFS solver returns a valid path (`solveLevel !== null`).
4. **Par Calibration**: Par steps $\ge \text{optimal BFS steps} + 4$.
5. **Asset Drift**: SHA-256 hash in `levels/manifest.json` matches file bytes exactly.

---

## 3. Auditing Process & Cadence

1. **Phase 1: Automated Verification**:
   - Run `npm run test:levels` to verify solver reachability and bypass resistance.
2. **Phase 2: Architectural Inspection**:
   - Evaluate floor plan against Kishōtenketsu role, spatial rhythm, and spawn/exit positioning.
3. **Phase 3: Visual & Rotation Audit**:
   - Test level under 0°, 90°, 180°, and 270° camera angles to inspect bridge decks and wall drop facades.
4. **Phase 4: Score Registration**:
   - Log audit date, evaluator, scores across all 6 axes, and findings in `docs/LEVEL_SCORING_REGISTER.md`.
