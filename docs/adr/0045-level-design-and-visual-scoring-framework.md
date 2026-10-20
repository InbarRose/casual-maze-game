# ADR-0045: Level Game Design & Visual Aesthetics Scoring Framework

## Status
Accepted

## Date
2026-10-19

## Context
Following the completion of BL-160 and ADR-0044, all 53 levels across the platform (40 Campaign Levels, 6 Tutorial Academy chapters, 3 Relics of the Guardians chapters, 1 multi-room Whispering Citadel saga, and 3 Sunken Vaults of the Deep chapters) have been fully migrated to the Modular Level Package Directory Architecture (`manifest.json`, `layers.json`, `entities.json`, `README.md`). All $\ge 4\times 4$ dead spaces have been eliminated ($\text{DeadSpace}_{\ge 4\times 4} = 0$), and 3D multi-elevation verticality has been integrated platform-wide.

However, to guarantee ongoing quality and guide future level creation, the platform requires an exhaustive, rigorous evaluation framework and a dedicated scoring repository analogous to the component scoring register ([`docs/COMPONENT_SCORING_REGISTER.md`](../COMPONENT_SCORING_REGISTER.md)). Previous level scoring was either summarized at chapter boundaries or contained legacy ratings prior to the introduction of true maze topology, 3D bridges, and vector rendering.

Furthermore, level evaluation must prioritize **game design** (corridor inertia, wayfinding anchors, loopbacks, anti-backtracking, Kishōtenketsu pacing, puzzle solvability, and cognitive 'aha!' moments) and **visual aesthetics** (biome color harmony, contrast, 2.5D depth perception, underpass archways, surface shaders, decorative props, and visual juice).

## Decision

1. **Establish Level Audit Rubric v4.0.0**:
   Overhaul [`docs/LEVEL_AUDIT_RUBRIC.md`](../LEVEL_AUDIT_RUBRIC.md) to define a 6-Chair simulated expert evaluation system specifically tailored to Game Design and Visual Aesthetics:
   * **Category 1: Labyrinth Topology & Spatial Architecture (10.0 pts)**
     * *Crit 1.1*: Corridor Inertia & Anti-Homogeneity ($\ge 70\%$ direction persistence, organic forks, no generic 1-tile grid boxes)
     * *Crit 1.2*: Spatial Anchoring & Wayfinding (distinct landmarks, central courtyards, dynamic non-corner spawn/exit placements)
     * *Crit 1.3*: Transit Flow & Loopback Shortcuts (circular return loops upon objective retrieval, zero empty backtrack $> 8$ tiles)
   * **Category 2: 3D Verticality & Mechanical Systems (10.0 pts)**
     * *Crit 2.1*: Multi-Elevation Architecture (bridges `B_EW`/`B_NS`, `PLATFORM`, wall walks `WW`, directional ramps `RAMP_*`)
     * *Crit 2.2*: Zero-Bypass Gating Integrity (mathematically airtight, BFS solver proof, every lock/lever required)
     * *Crit 2.3*: Entity Economy & Puzzle Escalation (purposeful entity placements, cognitive insight, compounding mechanics)
   * **Category 3: Visual Aesthetics, Atmosphere & Biome Fidelity (10.0 pts)**
     * *Crit 3.1*: Thematic Palette Harmony & Contrast (floor/wall/hazard visual separation, biome color schemes)
     * *Crit 3.2*: 2.5D Architectural Depth & Shading (drop shadows, Roman underpass arches, wall bevels, multi-elevation depth cues)
     * *Crit 3.3*: Environmental Detailing & Thematic Props (torches, runes, water caustics, moss, crystal clusters, architectural trims)
   * **Category 4: Kishōtenketsu Pacing & Cognitive Flow (10.0 pts)**
     * *Crit 4.1*: Stage Purity & Intent (Ki intro, Shō development, Ten twist, Ketsu synthesis)
     * *Crit 4.2*: Mechanical Novelty & Subversion (unique spatial setups, unexpected twists, non-derivative layouts)
     * *Crit 4.3*: Tension Curve & Challenge Balancing (fair escalation, lack of frustrating deadlocks, satisfying climax)
   * **Category 5: Player Ergonomics, UX & Calibration (10.0 pts)**
     * *Crit 5.1*: Empirical Par Step Calibration ($parSteps = \lceil BFS_{\text{optimal}} \times 1.15 \rceil$, steady time targets)
     * *Crit 5.2*: Sightline Clarity & Fog-of-War Ergonomics (horizon peeks, no cheap blind traps, comfortable reveal radius)
     * *Crit 5.3*: Multi-Input Fluidity & Navigation (desktop keyboard, click-to-move BFS auto-pathing, touch clearance)
   * **Category 6: Narrative Immersion & Diegetic Worldbuilding (10.0 pts)**
     * *Crit 6.1*: Diegetic Inscriptions & Lore Tablets (evocative Architect Journal notes, ancient carvings, subtle hints)
     * *Crit 6.2*: Environmental Believability (functional spaces: cisterns, foundries, cathedrals, astral spires)
     * *Crit 6.3*: Climactic Sanctum & Milestone Payoff (exit portal presentation, reward feeling, chapter closure)

2. **Scoring Mechanics & Quality Tiers**:
   * Each Chair evaluates 3 sub-criteria on a 1.0 to 10.0 scale:
     $$\text{Category Score}_k = \frac{\text{Crit}_{k.1} + \text{Crit}_{k.2} + \text{Crit}_{k.3}}{3}$$
     $$\text{Master Score} = \sum_{k=1}^6 \text{Category Score}_k \in [6.00, 60.00]$$
     $$\text{Normalized Percentage} = \frac{\text{Master Score}}{60.00} \times 100\%$$
   * Quality Tiers:
     * **S+-Tier** (54.00–60.00 pts / 90.0%–100.0%): Masterwork Landmark Standard.
     * **S-Tier** (51.00–53.99 pts / 85.0%–89.9%): Exemplary Architectural Standard.
     * **A+-Tier** (48.00–50.99 pts / 80.0%–84.9%): High-Polish Release Candidate.
     * **A-Tier** (45.00–47.99 pts / 75.0%–79.9%): Production Release Standard (Minimum Gate).
     * **B-Tier** (37.00–44.99 pts / 61.7%–74.8%): Polish Needed.
     * **C-Tier** (28.00–36.99 pts / 46.7%–61.5%): Work-in-Progress Prototype.
     * **F-Tier** (< 28.00 pts / < 46.7%): Critical Overhaul Required.

3. **Master Level Scoring Register Format ([`docs/LEVEL_SCORING_REGISTER.md`](../LEVEL_SCORING_REGISTER.md))**:
   * Model the level scoring register on [`docs/COMPONENT_SCORING_REGISTER.md`](../COMPONENT_SCORING_REGISTER.md).
   * Feature a complete Master League Table summarizing all 53 platform levels.
   * Provide an exhaustive, scrutinized scorecard for each level containing:
     * Level Metadata (ID, Title, Biome, Dimensions, Spawn $\to$ Exit, Par Steps/Time, Mechanics)
     * Category Scores ($C_1$ to $C_6$) and Sub-criteria Breakdown
     * Master Quality Score, Normalized %, and Quality Tier
     * Game Design & Spatial Rhythm Critique
     * Visual Aesthetics, Depth & Thematic Atmosphere Critique
     * Puzzle Mechanics & Gating Verification
     * **Scrutinized Gaps & Critical Deductions** (rigorous deductions for corridor bottlenecks, contrast imbalances, minor backtracks, or prop density opportunities)
     * **Actionable Improvement Directives**

4. **Empirical Automated Level Metrics Tool (`scripts/audit-level-metrics.mjs`)**:
   * Build a dedicated Node script to compute hard mathematical telemetry across all level packages:
     * Playable tile count vs solid wall ratio
     * Dead space blocks ($\ge 4\times 4$)
     * Corridor inertia index (% of 3+ straight corridor runs)
     * 3D verticality counts (bridges, ramps, platforms, wall walks)
     * Entity economy counts (keys, doors, levers, hazards, sentinels, secrets)
     * Par calibration validation ($parSteps / BFS_{optimal}$)
   * Integrate automated regression assertions into `tests/unit/levels/level-scoring-framework.test.mjs`.

## Consequences
- **Positive**:
  - Establishes a permanent, standardized record of level quality matching the depth of the component scoring register.
  - Elevates focus onto game design and visual aesthetics, ensuring every corridor, chamber, and visual asset is scrutinized.
  - Backs qualitative expert reviews with automated mathematical telemetry.
  - Provides clear, actionable directives for future content creation and polishing passes.
- **Negative / Trade-offs**:
  - Requires maintaining 53 comprehensive scorecards as levels evolve.
  - Automated level metrics must be updated whenever level package geometry changes.
