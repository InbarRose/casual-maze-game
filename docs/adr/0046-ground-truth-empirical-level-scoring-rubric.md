# ADR-0046: Ground-Truth Empirical Level Scoring Rubric & Sub-50% Reality Recalibration

## Status
Accepted

## Date
2026-10-20

## Context
Following the implementation of the 8-Chair Scoring Framework (ADR-0045, Rubric v4.1.0), the initial scoring pass yielded inflated scores (70.00–77.00 / 80.00, or 87%–96%). This occurred because the evaluation graded **data presence** (e.g. JSON containing `decorations: [...]`, `sw: [...]`, or `bridges: [...]`) rather than **practical player experience** during live gameplay.

In actual gameplay practice:
1. **Visual Depth vs. Cosmetic Placeholders**: Declaring a "wall decoration" entity does not produce visual atmosphere if that asset renders as a flat 2D decal, unshaded glyph, or grey box without dynamic normal mapping, light casting, or volumetric presence.
2. **Cognitive Challenge vs. Linear Chores**: Placing a key at the end of a corridor and a matching locked door at the other end is **not** a puzzle if there is only one hallway to traverse. It is a linear fetch chore with zero cognitive branching, zero risk, and zero deductive deduction.
3. **Spatial Traversal vs. Grid Homogeneity**: A labyrinth consisting purely of 1-tile wide corridors lacks architectural grandeur, vertical vantage points, and atmospheric pacing.

To expose the true deficits of the game and establish an honest, actionable roadmap for genuine game design and visual improvement, the scoring standard must be brutally recalibrated against industry benchmarks.

## Decision

1. **Establish Ground-Truth Rubric v5.0.0**:
   Overhaul [`docs/LEVEL_AUDIT_RUBRIC.md`](../LEVEL_AUDIT_RUBRIC.md) to provide **concrete, behavioral descriptions for every score from 1 to 10** across all 24 criteria under the 8 Domain Chairs.

2. **Anchor Points of the 1–10 Scale**:
   - **Score 1: Broken / Unplayable / Hostile**: Crashes, impossible geometry, softlocks, missing textures, zero player feedback.
   - **Score 2: Barebones Prototype**: Glitchy, highly disorienting, broken camera axes, missing key bindings or untelegraphed instant death.
   - **Score 3: Early Rough Draft**: Repetitive 1-tile grid maze, flat textures, trivial chore key placement along single paths, zero tactile feedback.
   - **Score 4: Serviceable Prototype**: Functional mechanics work without errors, but completely flat, predictable, lacking pacing, cosmetic decals without lighting.
   - **Score 5: Minimum Shippable Product (MSP)**: Functional baseline commercial release. Clean 60 FPS, zero bugs, solvable, but generic, zero "wow" factor, formulaic key/door gating, basic static tilesets.
   - **Score 6: Competent Commercial Indie**: Clear thematic personality, intentional corridor pacing, readable spatial landmarks, mild cognitive friction.
   - **Score 7: High-Quality Indie Benchmark** (*Monument Valley, Baba Is You, Stephen's Sausage Roll*): Elegant mechanical synthesis, distinct visual art style, rewarding "aha!" eureka moments, tight spatial pacing.
   - **Score 8: Polished Standout Experience**: Dynamic lighting/shaders casting real shadows, multi-tiered vertical sightlines, rich micro-interaction juice, high tension.
   - **Score 9: Masterwork Tier**: Flawless gameplay-art-sound harmony, deeply intuitive non-verbal guidance, indelible atmosphere and pacing.
   - **Score 10: AAA Best-In-Class Benchmark** (*Portal 2, Zelda Shrine/Dungeon Design*): Genre-defining perfection, breathtaking aesthetic and systemic synergy, indelible emotional and spatial impact.

3. **Current Reality Anchor (Columns 3–5, Strictly Below 50%)**:
   - The current game operates between **3 and 5** across most categories, with rare standout moments reaching 6.
   - Under this grounded reality check, **no level shall score above 50%** ($\le 40.00 / 80.00$ points).
   - Platform scores will realistically land in the **25.00 to 39.00 / 80.00** range (31.2% to 48.8%).

4. **Critical Deduction Philosophy**:
   - **Criterion 8.2 (Entity Economy & Logic)**: A key placed on a forced linear path without alternative branches or decision dilemmas is capped at **3.0 / 10.0**.
   - **Criterion 3.3 (Shaders & Lighting)**: Wall decorations that do not cast light, alter shadows, or react to player footsteps are capped at **3.5 / 10.0**.
   - **Criterion 1.1 (Spatial Architecture)**: Endless 1-tile wide hallway grids without varied room volumes or plazas are capped at **4.0 / 10.0**.
   - **Criterion 6.1 (Tactile Juice)**: Standard canvas step ticks without screen shake, particle bursts, or physics impulse are capped at **4.0 / 10.0**.

5. **Regenerate Master Scoring Register**:
   Update `scripts/build-scoring-register.mjs` and regenerate [`docs/LEVEL_SCORING_REGISTER.md`](../LEVEL_SCORING_REGISTER.md) to apply this unsparing rubric across all 53 official levels.

## Consequences

### Positive
- **Honest Engineering & Design Baseline**: Eliminates false confidence; provides an unvarnished diagnostic of exactly where levels fail in live gameplay.
- **Actionable Gap Analysis**: Gives developers and designers clear, objective steps to move any criterion from a 3 or 4 to a 6 or 7.
- **True AAA Benchmark Alignment**: Calibrates our evaluation against real masterpieces (Portal 2, Zelda, Monument Valley) rather than comparing our levels only against our own minimal prototypes.

### Negative / Trade-offs
- Previous high scores (80%–96%) are superseded; the entire campaign now sits in the C-Tier and D-Tier (30%–49%), requiring substantial future iterative design sprints to advance toward true indie quality (60%+).
