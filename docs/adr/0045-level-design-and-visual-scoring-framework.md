# ADR-0045: Comprehensive Level Game Design, Visual Storytelling & 8-Chair Scoring Framework

## Status
Accepted (Enhanced to 8-Chair Master Standard)

## Date
2026-10-19

## Context
Following the universal level package migration (BL-160, ADR-0044), all 53 platform levels are contained in modular packages with $\text{DeadSpace}_{\ge 4\times 4} = 0$ and 3D elevation support. To evaluate and continuously polish levels, the platform requires an exhaustive, industry-grade framework covering:
- **Game Design**: Spatial topology, corridor inertia ($\ge 70\%$), non-corner wayfinding anchors, decision branch density, loopbacks, and zero empty backtracking.
- **Visual Storytelling**: Environmental narrative, architectural purpose (cisterns, foundries, cathedrals), worn stone masonry, and diegetic visual clues.
- **Novelty & Subversion**: Kishōtenketsu twists (*Ten*), spatial paradigm shifts, unexpected route openings, and cognitive "Aha!" eureka moments.
- **Art & Aesthetics**: Biome color harmony, 2.5D architectural bevel drops, Roman underpass keystones, dynamic surface shaders (caustics, magma, crystal glints), and light cones.
- **Fun, Juice & Humor**: Tactile micro-interactions, pickup feedback, wry Architect Journal entries, self-aware humor, and playful secret discoveries.
- **Tension & Suspense**: Suspenseful hazard rhythms, near-miss sentinel evasion, narrowing sightlines under Fog of War, and vertiginous catwalks over chasms.
- **Challenge & Gating Integrity**: Mathematically unbypassable gating (*10/10 gatekeeper*), multi-step logical deduction, and empirical par step calibration ($parSteps \approx 1.15 \times \text{BFS}_{\text{optimal}}$).

## Decision

1. **Establish 8-Chair Master Expert Panel Architecture (Rubric v4.1.0)**:
   Overhaul [`docs/LEVEL_AUDIT_RUBRIC.md`](../LEVEL_AUDIT_RUBRIC.md) to define 8 domain chairs, each assessing 3 granular criteria on an absolute **1.0 to 10.0 scale** (24 criteria total):
   - **Chair 1: Spatial & Labyrinth Architecture (10.0 pts)**
     - *1.1*: Corridor Inertia & Anti-Homogeneity ($\ge 70\%$ persistence, organic turns, no generic boxes)
     - *1.2*: Dynamic Spatial Anchors & Wayfinding (central courtyards, non-corner spawn/exit variety)
     - *1.3*: Transit Flow & Loopback Shortcuts (circular return loops, zero empty backtrack $> 8$ tiles)
   - **Chair 2: 3D Systems & Verticality Mechanics (10.0 pts)**
     - *2.1*: Multi-Elevation Viaducts & Underpasses (bridges `B_EW`/`B_NS`, `PLATFORM`, lower tunnels)
     - *2.2*: Wall-Walk Ramparts & Overlook Scouting (battlement walkways `WALL_WALK`, scouting from above)
     - *2.3*: Directional Ramp Alignment & Traversal Ease (longitudinal ramp axis, smooth height lift)
   - **Chair 3: Art, Visual Aesthetics & Shader Polish (10.0 pts)**
     - *3.1*: Thematic Palette Harmony & Contrast (floor/wall/hazard visual separation, biome color schemes)
     - *3.2*: 2.5D Architectural Depth, Drop Shadows & Masonry Bevels (flagstone pavers, underpass keystones)
     - *3.3*: Dynamic Surface Shaders & Light Cones (water caustics, magma bubbling, crystal glints, torches)
   - **Chair 4: Visual Storytelling & Environmental Narrative (10.0 pts)**
     - *4.1*: Diegetic Antiquity & Architectural Purpose (authentic ruin identity: cisterns, foundries, cathedrals)
     - *4.2*: Environmental Narrative Clues & Worn Ruins (cracked masonry, moss, visual hints)
     - *4.3*: Climactic Sanctum Framing & Milestone Payoff (sunlit exit archways, ascending spiral stairs)
   - **Chair 5: Novelty, Subversion & "Aha!" Discovery (10.0 pts)**
     - *5.1*: Kishōtenketsu Stage Progression & Mechanical Novelty (Ki intro, Shō dev, Ten twist, Ketsu synthesis)
     - *5.2*: Spatial Subversion & Expectation Defiance (apparent dead-ends opening, portal warps, camera rotation)
     - *5.3*: Cognitive "Aha!" Eureka Moments (satisfying spatial realizations without brute-force wandering)
   - **Chair 6: Fun, Juice, Tactile Delight & Whimsical Humor (10.0 pts)**
     - *6.1*: Micro-Interactions, Tactile Feel & Juice (satisfying lever clicks, key unlocks, gem sparkles)
     - *6.2*: Wry Architect Journal Notes & Diegetic Humor (witty ancient commentary, self-aware warnings)
     - *6.3*: Playful Secrets & Easter Egg Discoveries (hidden secret wall `SW` alcoves, humorous relics)
   - **Chair 7: Tension, Suspense & Perilous Hazards (10.0 pts)**
     - *7.1*: Hazard Rhythm & Suspenseful Timing (timed flame vents and floor spikes with safe harbor beats)
     - *7.2*: Sentinel Patrol Stealth & Near-Miss Evasion (patrolling sentinels, evasion alcoves, turn timings)
     - *7.3*: Fog-of-War Dread & Vertiginous Catwalks (narrowing sightlines, un-railed catwalks over chasms)
   - **Chair 8: Cognitive Challenge, Gating & Calibration (10.0 pts)**
     - *8.1*: Zero-Bypass Gating Integrity (*Mandatory Gatekeeper: 10.0/10.0*) (mathematically airtight)
     - *8.2*: Entity Economy & Multi-Step Logic (no orphaned keys, purposeful dependencies)
     - *8.3*: Empirical Par Step Calibration ($parSteps \in [1.12, 1.25] \times \text{BFS}_{\text{optimal}}$)

2. **Mathematical Formulation**:
   $$\text{Category Score}_k = \frac{\text{Crit}_{k.1} + \text{Crit}_{k.2} + \text{Crit}_{k.3}}{3} \quad (1.00 \le \text{Category Score}_k \le 10.00)$$
   $$\text{Master Quality Score} = \sum_{k=1}^8 \text{Category Score}_k \quad (8.00 \le \text{Master Score} \le 80.00)$$
   $$\text{Normalized Percentage} = \frac{\text{Master Quality Score}}{80.00} \times 100.0\%$$

3. **Official Quality Tiers**:
   - **S+-Tier** (72.00–80.00 pts / 90.0%–100.0%): Masterwork Landmark Standard
   - **S-Tier** (68.00–71.99 pts / 85.0%–89.9%): Exemplary Architecture & Delight
   - **A+-Tier** (64.00–67.99 pts / 80.0%–84.9%): High-Polish Release Candidate
   - **A-Tier** (60.00–63.99 pts / 75.0%–79.9%): Production Release Standard (Minimum Gate: $\ge 60.00 / 80.00$)
   - **B-Tier** (50.00–59.99 pts / 62.5%–74.9%): Polish Needed
   - **C-Tier** (38.00–49.99 pts / 47.5%–62.4%): Work-in-Progress Prototype
   - **F-Tier** (< 38.00 pts / < 47.5%): Critical Overhaul Required

4. **Integration with Automated Telemetry & Test Suite**:
   - Compute empirical metrics via `scripts/audit-level-metrics.mjs`.
   - Maintain 53 granular scorecards in [`docs/LEVEL_SCORING_REGISTER.md`](../LEVEL_SCORING_REGISTER.md) generated by `scripts/build-scoring-register.mjs`.
   - Validate via `tests/unit/levels/level-scoring-framework.test.mjs`.

## Consequences
- **Positive**:
  - Incorporates the complete breadth of modern game design criticism: visuals, visual storytelling, novelty, art, fun, humor, tension, and cognitive challenge.
  - Every level is scrutinized across 24 distinct criteria with constructive deductions and explicit directives.
  - Keeps the scoring register synchronized with real game data.
- **Negative / Trade-offs**:
  - 8 categories requires maintaining comprehensive scorecards for all 53 platform levels.
