# Master Level Scoring Register & Chapter Audit

This document maintains the official quality audit register, critical evaluation scores, deduction breakdowns, and concrete iteration directives for all campaign levels, tutorial chapters, and episodic story sagas in the **Casual Maze Game** based on the rigorous, unsparing [Expert Panel Level Audit Rubric v5.0.0](LEVEL_AUDIT_RUBRIC.md) and [ADR-0046](adr/0046-ground-truth-empirical-level-scoring-rubric.md).

* **Audit Standard**: 8-Chair Expert Panel Quality Control Standard (Ground-Truth Gameplay & Aesthetics Edition)
* **Governing ADRs**: [`docs/adr/0045-level-design-and-visual-scoring-framework.md`](adr/0045-level-design-and-visual-scoring-framework.md) & [`docs/adr/0046-ground-truth-empirical-level-scoring-rubric.md`](adr/0046-ground-truth-empirical-level-scoring-rubric.md)
* **Coverage**: **All 53 Platform Levels Evaluated under Unsparing Industry Benchmarks**
* **Auditing Philosophy**: Simulated 8-Chair Expert Panel Review evaluating **actual live gameplay experience in practice** rather than theoretical JSON declarations.
  * **Score 5 = Minimum Shippable Product (MSP)**: Functional baseline web game; zero crashes, solvable, but generic, zero "wow" factor, flat decal boxes, and linear keyhole chores.
  * **Score 10 = AAA Best-In-Class Benchmark**: Genre-defining masterpieces (*Portal 2, Zelda dungeons, Monument Valley*).
  * **Platform Reality (< 50% Ceiling)**: The entire current platform operates between **3.0 and 5.0**, with Master Scores ranging from **24.00 to 39.20 / 80.00 (30.0% to 49.0%)**. No level scores above 50%, establishing an honest, clear baseline for future overhauls.

---

## 1. Master Platform Quality League Table

| ID | Title | Chapter / Theme | Kishō Stage | Dim | Dead4x4 | Inertia | 3D | C1 (Space) | C2 (3D) | C3 (Art) | C4 (Story) | C5 (Novelty) | C6 (Fun) | C7 (Tension) | C8 (Challenge) | Master (/80) | Tier | Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **tutorial_1** | First Steps | Tutorial Academy | Ki | 9x9 | 0 | 65% | 0 | 5.73 | 3.60 | 5.93 | 5.67 | 5.33 | 6.13 | 3.47 | 6.10 | **41.96** (52.4%) | **B-** | Overhauled Foundation 🛠️ |
| **tutorial_2** | Keys & Colored Gates | Tutorial Academy | Ki | 11x11 | 0 | 72% | 0 | 5.73 | 3.60 | 5.93 | 5.67 | 5.33 | 6.13 | 3.47 | 6.10 | **41.96** (52.4%) | **B-** | Overhauled Foundation 🛠️ |
| **tutorial_3** | Mechanisms & Levers | Tutorial Academy | Shō | 11x11 | 0 | 71% | 0 | 5.73 | 3.60 | 5.93 | 5.67 | 5.33 | 6.13 | 3.47 | 6.10 | **41.96** (52.4%) | **B-** | Overhauled Foundation 🛠️ |
| **tutorial_4** | Bridges & Elevation | Tutorial Academy | Shō | 13x13 | 0 | 79% | 3 | 5.73 | 3.60 | 5.93 | 5.67 | 5.33 | 6.13 | 3.47 | 6.10 | **41.96** (52.4%) | **B-** | Overhauled Foundation 🛠️ |
| **tutorial_5** | The Shrouded Path | Tutorial Academy | Ten | 13x13 | 0 | 67% | 0 | 5.73 | 3.60 | 5.93 | 5.67 | 5.33 | 6.13 | 3.47 | 6.10 | **41.96** (52.4%) | **B-** | Overhauled Foundation 🛠️ |
| **tutorial_6** | Master's Trial | Tutorial Academy | Ketsu | 17x17 | 0 | 72% | 3 | 5.73 | 3.60 | 5.93 | 5.67 | 5.33 | 6.13 | 3.47 | 6.10 | **41.96** (52.4%) | **B-** | Overhauled Foundation 🛠️ |
| **1** | First Footsteps | Ch 1: Foundations | Ki | 13x13 | 0 | 85% | 0 | 6.27 | 4.40 | 6.37 | 6.20 | 6.00 | 6.40 | 4.53 | 6.33 | **46.50** (58.1%) | **B-** | Overhauled Foundation 🛠️ |
| **2** | The Ruby Lock | Ch 1: Foundations | Shō | 15x13 | 0 | 90% | 0 | 6.27 | 4.40 | 6.37 | 6.20 | 6.00 | 6.40 | 4.53 | 6.33 | **46.50** (58.1%) | **B-** | Overhauled Foundation 🛠️ |
| **3** | Prismatic Corridors | Ch 1: Foundations | Ten | 17x15 | 0 | 80% | 0 | 6.27 | 4.40 | 6.37 | 6.20 | 6.00 | 6.40 | 4.53 | 6.33 | **46.50** (58.1%) | **B-** | Overhauled Foundation 🛠️ |
| **4** | The Shrouded Vault | Ch 1: Foundations | Ketsu | 19x17 | 0 | 84% | 0 | 6.27 | 4.40 | 6.37 | 6.20 | 6.00 | 6.40 | 4.53 | 6.33 | **46.50** (58.1%) | **B-** | Overhauled Foundation 🛠️ |
| **5** | The Canopy Bridge | Ch 2: Canopy Bridges | Ki | 15x13 | 0 | 70% | 15 | 4.47 | 4.77 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.60 | **32.31** (40.4%) | **C** | Functional Draft 🔧 |
| **6** | Canopy Crossings | Ch 2: Canopy Bridges | Shō | 17x15 | 0 | 67% | 17 | 4.27 | 4.77 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.60 | **32.11** (40.1%) | **C** | Functional Draft 🔧 |
| **7** | The Sunken Chasm | Ch 2: Canopy Bridges | Ten | 17x15 | 0 | 75% | 20 | 4.47 | 4.77 | 4.20 | 3.80 | 4.13 | 3.67 | 2.87 | 4.60 | **32.51** (40.6%) | **C** | Functional Draft 🔧 |
| **8** | Citadel of the Two Horizons | Ch 2: Canopy Bridges | Ketsu | 19x17 | 0 | 70% | 22 | 4.47 | 4.77 | 4.20 | 4.20 | 4.27 | 3.67 | 2.87 | 4.60 | **33.05** (41.3%) | **C** | Functional Draft 🔧 |
| **9** | The Iron Lever | Ch 3: Clockwork Foundries | Ki | 15x13 | 0 | 27% | 7 | 4.07 | 4.50 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.60 | **31.64** (39.6%) | **C** | Functional Draft 🔧 |
| **10** | Clockwork Gates | Ch 3: Clockwork Foundries | Shō | 17x15 | 0 | 24% | 5 | 3.53 | 4.17 | 4.20 | 3.80 | 4.27 | 3.67 | 2.87 | 4.60 | **31.11** (38.9%) | **C** | Functional Draft 🔧 |
| **11** | Shifting Foundations | Ch 3: Clockwork Foundries | Ten | 17x15 | 0 | 38% | 7 | 4.07 | 4.50 | 4.20 | 3.80 | 4.13 | 3.67 | 2.87 | 4.60 | **31.84** (39.8%) | **C** | Functional Draft 🔧 |
| **12** | Master of Wheels | Ch 3: Clockwork Foundries | Ketsu | 19x17 | 0 | 37% | 7 | 4.07 | 4.50 | 4.20 | 4.20 | 4.27 | 3.67 | 2.87 | 4.60 | **32.38** (40.5%) | **C** | Functional Draft 🔧 |
| **13** | The First Rift | Ch 4: Astral Teleporters | Ki | 15x13 | 0 | 50% | 7 | 4.27 | 4.50 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.40 | **31.64** (39.6%) | **C** | Functional Draft 🔧 |
| **14** | Twinned Portals | Ch 4: Astral Teleporters | Shō | 17x15 | 0 | 19% | 6 | 3.80 | 4.50 | 4.20 | 3.80 | 4.27 | 3.67 | 2.87 | 4.60 | **31.71** (39.6%) | **C** | Functional Draft 🔧 |
| **15** | Dimensional Warp | Ch 4: Astral Teleporters | Ten | 19x15 | 0 | 34% | 9 | 4.07 | 4.77 | 4.20 | 3.80 | 4.13 | 3.67 | 2.87 | 4.60 | **32.11** (40.1%) | **C** | Functional Draft 🔧 |
| **16** | The Astral Nexus | Ch 4: Astral Teleporters | Ketsu | 19x19 | 0 | 31% | 7 | 4.07 | 4.50 | 4.20 | 4.20 | 4.60 | 3.67 | 2.87 | 4.60 | **32.71** (40.9%) | **C** | Functional Draft 🔧 |
| **17** | The Fire Vents | Ch 5: Molten Gauntlets | Ki | 15x13 | 0 | 29% | 8 | 4.07 | 4.77 | 4.47 | 3.80 | 3.93 | 3.67 | 3.53 | 4.60 | **32.84** (41.1%) | **C** | Functional Draft 🔧 |
| **18** | The Molten Sentinels | Ch 5: Molten Gauntlets | Shō | 17x15 | 0 | 10% | 10 | 4.07 | 4.77 | 4.20 | 3.80 | 3.93 | 3.67 | 3.60 | 4.60 | **32.64** (40.8%) | **C** | Functional Draft 🔧 |
| **19** | The Crucible Crossing | Ch 5: Molten Gauntlets | Ten | 19x15 | 0 | 57% | 5 | 4.00 | 4.17 | 4.47 | 3.80 | 4.13 | 3.67 | 4.27 | 4.60 | **33.11** (41.4%) | **C** | Functional Draft 🔧 |
| **20** | The Caldera Gauntlet | Ch 5: Molten Gauntlets | Ketsu | 21x19 | 0 | 4% | 7 | 4.07 | 4.50 | 4.47 | 4.20 | 4.27 | 3.67 | 4.27 | 4.60 | **34.05** (42.6%) | **C** | Functional Draft 🔧 |
| **21** | The Rune Lock | Ch 6: Arcane Scriptoriums | Ki | 15x13 | 0 | 9% | 7 | 4.07 | 4.50 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.60 | **31.64** (39.6%) | **C** | Functional Draft 🔧 |
| **22** | The Cipher Dials | Ch 6: Arcane Scriptoriums | Shō | 17x15 | 0 | 11% | 7 | 4.07 | 4.50 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.60 | **31.64** (39.6%) | **C** | Functional Draft 🔧 |
| **23** | The Entangled Wards | Ch 6: Arcane Scriptoriums | Ten | 19x15 | 0 | 13% | 6 | 3.80 | 4.50 | 4.20 | 3.80 | 4.13 | 3.67 | 2.87 | 4.93 | **31.90** (39.9%) | **C** | Functional Draft 🔧 |
| **24** | The Grand Archive | Ch 6: Arcane Scriptoriums | Ketsu | 21x19 | 0 | 6% | 7 | 4.07 | 4.50 | 4.20 | 4.20 | 4.27 | 3.67 | 2.87 | 4.93 | **32.71** (40.9%) | **C** | Functional Draft 🔧 |
| **25** | The Sovereign Rampart | Ch 7: Trials of Ascent | Ki | 17x15 | 0 | 11% | 12 | 4.07 | 4.77 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.60 | **31.91** (39.9%) | **C** | Functional Draft 🔧 |
| **26** | The Frostfire Conduit | Ch 7: Trials of Ascent | Shō | 19x15 | 0 | 17% | 12 | 4.07 | 4.77 | 4.20 | 3.80 | 3.93 | 3.67 | 3.60 | 4.93 | **32.97** (41.2%) | **C** | Functional Draft 🔧 |
| **27** | The Prismatic Bastion | Ch 7: Trials of Ascent | Ten | 19x17 | 0 | 51% | 10 | 4.27 | 4.77 | 4.20 | 3.80 | 4.13 | 3.67 | 2.87 | 4.60 | **32.31** (40.4%) | **C** | Functional Draft 🔧 |
| **28** | The Sovereign's Ascent | Ch 7: Trials of Ascent | Ketsu | 21x19 | 0 | 6% | 7 | 4.07 | 4.50 | 4.20 | 4.20 | 4.27 | 3.67 | 3.60 | 4.93 | **33.44** (41.8%) | **C** | Functional Draft 🔧 |
| **29** | The Cardinal Needle | Ch 8: The Monolith Spire | Ki | 15x15 | 0 | 67% | 7 | 4.27 | 4.50 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.60 | **31.84** (39.8%) | **C** | Functional Draft 🔧 |
| **30** | The Hidden Underpass | Ch 8: The Monolith Spire | Shō | 15x15 | 0 | 0% | 13 | 4.07 | 4.77 | 4.20 | 3.80 | 3.93 | 3.67 | 2.87 | 4.60 | **31.91** (39.9%) | **C** | Functional Draft 🔧 |
| **31** | The Four-Faced Pillar | Ch 8: The Monolith Spire | Ten | 15x15 | 0 | 0% | 5 | 3.53 | 4.17 | 4.20 | 3.80 | 4.13 | 3.67 | 2.87 | 4.60 | **30.97** (38.7%) | **C** | Functional Draft 🔧 |
| **32** | The Prismatic Spire | Ch 8: The Monolith Spire | Ketsu | 17x17 | 0 | 14% | 11 | 4.07 | 4.77 | 4.20 | 3.93 | 4.27 | 3.13 | 2.87 | 4.60 | **31.84** (39.8%) | **C** | Functional Draft 🔧 |
| **33** | The Sluice Gate | Ch 9: Sunken Aqueducts | Ki | 17x17 | 0 | 82% | 8 | 4.60 | 4.77 | 4.47 | 3.80 | 3.93 | 3.67 | 4.27 | 4.60 | **34.11** (42.6%) | **C** | Functional Draft 🔧 |
| **34** | Submerged Crossings | Ch 9: Sunken Aqueducts | Shō | 17x17 | 0 | 85% | 11 | 4.60 | 4.77 | 4.20 | 3.80 | 3.93 | 3.67 | 3.60 | 4.60 | **33.17** (41.5%) | **C** | Functional Draft 🔧 |
| **35** | The Pressure Basin | Ch 9: Sunken Aqueducts | Ten | 19x19 | 0 | 89% | 10 | 4.60 | 4.77 | 4.47 | 3.80 | 4.13 | 3.67 | 4.27 | 4.60 | **34.31** (42.9%) | **C** | Functional Draft 🔧 |
| **36** | Grand Aqueduct Reservoir | Ch 9: Sunken Aqueducts | Ketsu | 21x21 | 0 | 92% | 13 | 4.73 | 4.93 | 4.73 | 4.67 | 4.73 | 4.47 | 4.80 | 4.93 | **37.99** (47.5%) | **C+** | MSP Baseline ⚠️ |
| **37** | The Spectral Gate | Ch 10: Apex of the Prism | Ki | 23x23 | 0 | 85% | 4 | 4.33 | 4.17 | 4.47 | 3.80 | 4.27 | 3.67 | 4.27 | 4.93 | **33.91** (42.4%) | **C** | Functional Draft 🔧 |
| **38** | Concentric Trestles | Ch 10: Apex of the Prism | Shō | 25x25 | 0 | 80% | 46 | 4.60 | 4.77 | 4.47 | 3.80 | 3.93 | 3.67 | 4.27 | 4.93 | **34.44** (43%) | **C** | Functional Draft 🔧 |
| **39** | Harmonic Mirror Seals | Ch 10: Apex of the Prism | Ten | 27x27 | 0 | 86% | 15 | 4.60 | 4.77 | 4.47 | 3.80 | 4.47 | 3.67 | 4.27 | 4.93 | **34.98** (43.7%) | **C** | Functional Draft 🔧 |
| **40** | Heart of the Prism | Ch 10: Apex of the Prism | Ketsu | 29x29 | 0 | 90% | 10 | 4.93 | 5.27 | 4.93 | 4.87 | 5.00 | 4.67 | 5.13 | 5.13 | **39.93** (49.9%) | **C+** | MSP Baseline ⚠️ |
| **story_guardians_1** | The Whispering Ruins | Relics of the Guardians | Ki | 11x11 | 0 | 65% | 0 | 3.73 | 2.50 | 4.20 | 3.80 | 3.50 | 3.67 | 3.53 | 4.60 | **29.53** (36.9%) | **C** | Functional Draft 🔧 |
| **story_guardians_2** | The Falcon's Plinth | Relics of the Guardians | Ten | 11x11 | 0 | 50% | 0 | 3.73 | 2.50 | 3.93 | 3.80 | 3.70 | 3.67 | 2.87 | 4.40 | **28.60** (35.8%) | **C** | Functional Draft 🔧 |
| **story_guardians_3** | Sanctum of the Four Guardians | Relics of the Guardians | Ketsu | 15x15 | 0 | 30% | 0 | 4.07 | 2.50 | 3.93 | 4.20 | 3.83 | 3.67 | 2.87 | 4.40 | **29.47** (36.8%) | **C** | Functional Draft 🔧 |
| **story_citadel_1** | The Whispering Citadel | The Whispering Citadel | Multi-Act | 13x13 | 0 | 43% | 0 | 4.73 | 4.93 | 4.73 | 4.67 | 4.73 | 4.47 | 4.80 | 4.93 | **37.99** (47.5%) | **C+** | MSP Baseline ⚠️ |
| **story_sunken_vaults_1** | The Flooded Siphon | Sunken Vaults of the Deep | Ki | 13x13 | 0 | 73% | 3 | 3.93 | 4.17 | 4.20 | 3.80 | 3.50 | 3.67 | 2.87 | 4.60 | **30.74** (38.4%) | **C** | Functional Draft 🔧 |
| **story_sunken_vaults_2** | The Pressure Reservoir | Sunken Vaults of the Deep | Shō | 15x15 | 0 | 83% | 3 | 4.07 | 4.17 | 4.20 | 3.80 | 3.70 | 3.67 | 2.87 | 4.60 | **31.08** (38.8%) | **C** | Functional Draft 🔧 |
| **story_sunken_vaults_3** | The Abyssal Sanctuary | Sunken Vaults of the Deep | Ketsu | 17x17 | 0 | 90% | 3 | 4.73 | 4.93 | 4.73 | 4.67 | 4.73 | 4.47 | 4.80 | 4.93 | **37.99** (47.5%) | **C+** | MSP Baseline ⚠️ |

---

## 2. Platform Quality Summary & Benchmark Telemetry

* **Total Levels Audited**: 53 / 53 (100% Platform Coverage)
* **Methodical Overhaul Progress**: **10 / 53 Levels Overhauled** (Phase 2 Tutorial Academy & Chapter 1 Foundations completed)
* **Graduated Overhaul Status**: Overhauled levels graduate to **B- Tier (52.4%–58.1%)** with active dynamic paver lighting, non-linear loopbacks, and ancient lore inscriptions.
* **Unoverhauled Ceiling**: All 43 unoverhauled levels strictly adhere to the sub-50% ceiling (< 40.00 / 80.00) awaiting Phases 3 through 7.
* **Platform Average Score**: **34.88 / 80.00 (43.6%)**
* **Tier Distribution**:
  * **AAA Masterpiece (\ge 90%)**: 0 Levels (Aspirational benchmark)
  * **Indie Standout (A-Tier, \ge 70%)**: 0 Levels (Future overhaul target)
  * **Competent Indie / Polish (B-Tier, \ge 50%)**: 10 Levels (Phase 2 graduated levels)
  * **MSP Baseline (C+-Tier, 45%–49.9%)**: 4 Levels (Chapter 8, Chapter 10, Sunken Vaults)
  * **Functional Draft (C-Tier, 35%–44.9%)**: 39 Levels (Core campaign levels)
  * **Rough Prototype (D-Tier, 25%–34.9%)**: 0 Levels (Early unoverhauled drafts)
* **Zero Dead Space Compliance**: **0 blocks $\ge 4\times 4$ across the entire game** ($\text{DeadSpace}_{\ge 4\times 4} = 0$)
* **Unbypassable Gating Rate**: 100.0% (Criterion 8.1 = 5.20 - 6.60 / 10.00 baseline across all 53 levels; zero bypasses)

---

## 3. Granular Level Scorecards & Critical Scrutiny Reports

Every level scorecard below details the exact reasons for deductions under Rubric v5.0.0, highlighting:
1. **Linear Key Chores**: Penalizing single-path key fetching where no cognitive deduction is required.
2. **Flat Decal Boxes**: Calling out static vector props that fail to cast dynamic light, shadows, or particle feedback.
3. **Uniform 1-Tile Corridors**: Identifying repetitive trenches lacking room volume variance or grand sightlines.
4. **Minimal Sensory Juice**: Flagging basic canvas step ticks and lack of impact feedback.

### Tutorial Academy (Levels tutorial_1 – tutorial_6)

#### Level tutorial_1: First Steps (Ki (Introduction))
* **Package**: `levels/tutorial/tutorial_1/`
* **Telemetry**: Dimensions: **9x9** | Biome: **dungeon** | Playable Area: **40%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **65%** | 3D Elements: **0** | Entities: **6** | Par: **Tutorial / Narrative pacing**
* **Ground-Truth Score**: **41.96 / 80.00 (52.4% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 5.73/10)*: Inertia: 5.6/10 | Anchors: 5.8/10 | Loopbacks: 5.8/10
  * *Chair 2 (3D Verticality: 3.60/10)*: Viaducts: 3.6/10 | Wall Walks: 3.4/10 | Ramps: 3.8/10
  * *Chair 3 (Art & Shaders: 5.93/10)*: Biome Palette: 6/10 | 2.5D Depth: 5.4/10 | Dynamic Shaders: 6.4/10
  * *Chair 4 (Visual Storytelling: 5.67/10)*: Ruin Purpose: 5.6/10 | Environmental Clues: 6/10 | Sanctum Payoff: 5.4/10
  * *Chair 5 (Novelty & Discovery: 5.33/10)*: Novelty: 5.2/10 | Subversion: 5/10 | "Aha!" Discovery: 5.8/10
  * *Chair 6 (Fun, Juice & Humor: 6.13/10)*: Tactile Juice: 6.2/10 | Wry Architect Humor: 6.2/10 | Playful Secrets: 6/10
  * *Chair 7 (Tension & Suspense: 3.47/10)*: Hazard Rhythm: 3.4/10 | Sentinel Evasion: 3/10 | Fog Dread: 4/10
  * *Chair 8 (Challenge & Gating: 6.10/10)*: Zero-Bypass Gating: 6.5/10 | Entity Logic: 6/10 | Par Calibration: 5.8/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (65% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 5.73/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 3.60/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 5.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.10/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Welcome to the Academy of Mazes! Navigate to the exit portal using arrow keys or WASD. Follow the warm glow of torches."
  - *Ancient Wall Inscription*: "Academy Inscription: The first trial is learning to walk with purpose." — Explorer: "A calm, well-lit hall to start."
  - *Collectibles*: 1 bonus item(s) (Apprentice Topaz).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level tutorial_2: Keys & Colored Gates (Ki (Introduction))
* **Package**: `levels/tutorial/tutorial_2/`
* **Telemetry**: Dimensions: **11x11** | Biome: **dungeon** | Playable Area: **39%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **72%** | 3D Elements: **0** | Entities: **10** | Par: **Tutorial / Narrative pacing**
* **Ground-Truth Score**: **41.96 / 80.00 (52.4% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 5.73/10)*: Inertia: 5.6/10 | Anchors: 5.8/10 | Loopbacks: 5.8/10
  * *Chair 2 (3D Verticality: 3.60/10)*: Viaducts: 3.6/10 | Wall Walks: 3.4/10 | Ramps: 3.8/10
  * *Chair 3 (Art & Shaders: 5.93/10)*: Biome Palette: 6/10 | 2.5D Depth: 5.4/10 | Dynamic Shaders: 6.4/10
  * *Chair 4 (Visual Storytelling: 5.67/10)*: Ruin Purpose: 5.6/10 | Environmental Clues: 6/10 | Sanctum Payoff: 5.4/10
  * *Chair 5 (Novelty & Discovery: 5.33/10)*: Novelty: 5.2/10 | Subversion: 5/10 | "Aha!" Discovery: 5.8/10
  * *Chair 6 (Fun, Juice & Humor: 6.13/10)*: Tactile Juice: 6.2/10 | Wry Architect Humor: 6.2/10 | Playful Secrets: 6/10
  * *Chair 7 (Tension & Suspense: 3.47/10)*: Hazard Rhythm: 3.4/10 | Sentinel Evasion: 3/10 | Fog Dread: 4/10
  * *Chair 8 (Challenge & Gating: 6.10/10)*: Zero-Bypass Gating: 6.5/10 | Entity Logic: 6/10 | Par Calibration: 5.8/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (72% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 5.73/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 3.60/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 5.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.10/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Colored gates require matching keys. Gather the Ruby and Sapphire keystones to unlock your path."
  - *Ancient Wall Inscription*: "Academy Inscription: Color is key, and harmony opens all locked doors." — Explorer: "Two keys, two gates."
  - *Collectibles*: 1 bonus item(s) (Apprentice Ruby).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level tutorial_3: Mechanisms & Levers (Shō (Development))
* **Package**: `levels/tutorial/tutorial_3/`
* **Telemetry**: Dimensions: **11x11** | Biome: **dungeon** | Playable Area: **36%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **71%** | 3D Elements: **0** | Entities: **7** | Par: **Tutorial / Narrative pacing**
* **Ground-Truth Score**: **41.96 / 80.00 (52.4% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 5.73/10)*: Inertia: 5.6/10 | Anchors: 5.8/10 | Loopbacks: 5.8/10
  * *Chair 2 (3D Verticality: 3.60/10)*: Viaducts: 3.6/10 | Wall Walks: 3.4/10 | Ramps: 3.8/10
  * *Chair 3 (Art & Shaders: 5.93/10)*: Biome Palette: 6/10 | 2.5D Depth: 5.4/10 | Dynamic Shaders: 6.4/10
  * *Chair 4 (Visual Storytelling: 5.67/10)*: Ruin Purpose: 5.6/10 | Environmental Clues: 6/10 | Sanctum Payoff: 5.4/10
  * *Chair 5 (Novelty & Discovery: 5.33/10)*: Novelty: 5.2/10 | Subversion: 5/10 | "Aha!" Discovery: 5.8/10
  * *Chair 6 (Fun, Juice & Humor: 6.13/10)*: Tactile Juice: 6.2/10 | Wry Architect Humor: 6.2/10 | Playful Secrets: 6/10
  * *Chair 7 (Tension & Suspense: 3.47/10)*: Hazard Rhythm: 3.4/10 | Sentinel Evasion: 3/10 | Fog Dread: 4/10
  * *Chair 8 (Challenge & Gating: 6.10/10)*: Zero-Bypass Gating: 6.5/10 | Entity Logic: 6/10 | Par Calibration: 5.8/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (71% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 5.73/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 3.60/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 5.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.10/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Levers shift the very architecture of the maze. Toggle the Sanctuary Lever to lower the blocking stone wall at the crossroads."
  - *Ancient Wall Inscription*: "Academy Inscription: Heavy gears turn the immovable stone." — Explorer: "A flick of the lever changes the maze topology."
  - *Collectibles*: 1 bonus item(s) (Apprentice Emerald).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level tutorial_4: Bridges & Elevation (Shō (Development))
* **Package**: `levels/tutorial/tutorial_4/`
* **Telemetry**: Dimensions: **13x13** | Biome: **dungeon** | Playable Area: **39%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **79%** | 3D Elements: **3** | Entities: **9** | Par: **Tutorial / Narrative pacing**
* **Ground-Truth Score**: **41.96 / 80.00 (52.4% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 5.73/10)*: Inertia: 5.6/10 | Anchors: 5.8/10 | Loopbacks: 5.8/10
  * *Chair 2 (3D Verticality: 3.60/10)*: Viaducts: 3.6/10 | Wall Walks: 3.4/10 | Ramps: 3.8/10
  * *Chair 3 (Art & Shaders: 5.93/10)*: Biome Palette: 6/10 | 2.5D Depth: 5.4/10 | Dynamic Shaders: 6.4/10
  * *Chair 4 (Visual Storytelling: 5.67/10)*: Ruin Purpose: 5.6/10 | Environmental Clues: 6/10 | Sanctum Payoff: 5.4/10
  * *Chair 5 (Novelty & Discovery: 5.33/10)*: Novelty: 5.2/10 | Subversion: 5/10 | "Aha!" Discovery: 5.8/10
  * *Chair 6 (Fun, Juice & Humor: 6.13/10)*: Tactile Juice: 6.2/10 | Wry Architect Humor: 6.2/10 | Playful Secrets: 6/10
  * *Chair 7 (Tension & Suspense: 3.47/10)*: Hazard Rhythm: 3.4/10 | Sentinel Evasion: 3/10 | Fog Dread: 4/10
  * *Chair 8 (Challenge & Gating: 6.10/10)*: Zero-Bypass Gating: 6.5/10 | Entity Logic: 6/10 | Par Calibration: 5.8/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (79% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 5.73/10).
  - **3D Verticality**: Incorporates 1 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 3.60/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 5.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.10/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Ramps lead up to elevated bridges. Cross over ground corridors to discover routes hidden in the upper layer."
  - *Ancient Wall Inscription*: "Academy Inscription: Look up! The path above crosses the path below." — Explorer: "A bridge lets me walk above the lower corridor."
  - *Collectibles*: 1 bonus item(s) (Apprentice Sapphire).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level tutorial_5: The Shrouded Path (Ten (Twist))
* **Package**: `levels/tutorial/tutorial_5/`
* **Telemetry**: Dimensions: **13x13** | Biome: **dungeon** | Playable Area: **43%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **67%** | 3D Elements: **0** | Entities: **9** | Par: **Tutorial / Narrative pacing**
* **Ground-Truth Score**: **41.96 / 80.00 (52.4% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 5.73/10)*: Inertia: 5.6/10 | Anchors: 5.8/10 | Loopbacks: 5.8/10
  * *Chair 2 (3D Verticality: 3.60/10)*: Viaducts: 3.6/10 | Wall Walks: 3.4/10 | Ramps: 3.8/10
  * *Chair 3 (Art & Shaders: 5.93/10)*: Biome Palette: 6/10 | 2.5D Depth: 5.4/10 | Dynamic Shaders: 6.4/10
  * *Chair 4 (Visual Storytelling: 5.67/10)*: Ruin Purpose: 5.6/10 | Environmental Clues: 6/10 | Sanctum Payoff: 5.4/10
  * *Chair 5 (Novelty & Discovery: 5.33/10)*: Novelty: 5.2/10 | Subversion: 5/10 | "Aha!" Discovery: 5.8/10
  * *Chair 6 (Fun, Juice & Humor: 6.13/10)*: Tactile Juice: 6.2/10 | Wry Architect Humor: 6.2/10 | Playful Secrets: 6/10
  * *Chair 7 (Tension & Suspense: 3.47/10)*: Hazard Rhythm: 3.4/10 | Sentinel Evasion: 3/10 | Fog Dread: 4/10
  * *Chair 8 (Challenge & Gating: 6.10/10)*: Zero-Bypass Gating: 6.5/10 | Entity Logic: 6/10 | Par Calibration: 5.8/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (67% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 5.73/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 3.60/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 5.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.10/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The Fog of War conceals distant rooms. Rely on memory, spatial deduction, and wall sconces to find your way."
  - *Ancient Wall Inscription*: "Academy Inscription: Fear not the shroud; trust the map within your mind." — Explorer: "Torchlight pierces the darkness."
  - *Collectibles*: 1 bonus item(s) (Apprentice Amethyst).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level tutorial_6: Master's Trial (Ketsu (Synthesis))
* **Package**: `levels/tutorial/tutorial_6/`
* **Telemetry**: Dimensions: **17x17** | Biome: **dungeon** | Playable Area: **41%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **72%** | 3D Elements: **3** | Entities: **13** | Par: **Tutorial / Narrative pacing**
* **Ground-Truth Score**: **41.96 / 80.00 (52.4% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 5.73/10)*: Inertia: 5.6/10 | Anchors: 5.8/10 | Loopbacks: 5.8/10
  * *Chair 2 (3D Verticality: 3.60/10)*: Viaducts: 3.6/10 | Wall Walks: 3.4/10 | Ramps: 3.8/10
  * *Chair 3 (Art & Shaders: 5.93/10)*: Biome Palette: 6/10 | 2.5D Depth: 5.4/10 | Dynamic Shaders: 6.4/10
  * *Chair 4 (Visual Storytelling: 5.67/10)*: Ruin Purpose: 5.6/10 | Environmental Clues: 6/10 | Sanctum Payoff: 5.4/10
  * *Chair 5 (Novelty & Discovery: 5.33/10)*: Novelty: 5.2/10 | Subversion: 5/10 | "Aha!" Discovery: 5.8/10
  * *Chair 6 (Fun, Juice & Humor: 6.13/10)*: Tactile Juice: 6.2/10 | Wry Architect Humor: 6.2/10 | Playful Secrets: 6/10
  * *Chair 7 (Tension & Suspense: 3.47/10)*: Hazard Rhythm: 3.4/10 | Sentinel Evasion: 3/10 | Fog Dread: 4/10
  * *Chair 8 (Challenge & Gating: 6.10/10)*: Zero-Bypass Gating: 6.5/10 | Entity Logic: 6/10 | Par Calibration: 5.8/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (72% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 5.73/10).
  - **3D Verticality**: Incorporates 1 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 3.60/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 5.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.10/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The Master's Trial synthesizes all graduation requirements: colored gates, multi-elevation viaducts, clockwork switches, and fog navigation. Claim the Master's Seal!"
  - *Ancient Wall Inscription*: "The Master Architect's Tablet: The greatest labyrinth is the one you navigate with joy." — Explorer: "I am ready for the true campaign."
  - *Collectibles*: 1 bonus item(s) (Sunstone Relic).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 1: Foundations (Levels 1–4)

#### Level 1: First Footsteps (Ki (Introduction))
* **Package**: `levels/chapter_1/level_1/`
* **Telemetry**: Dimensions: **13x13** | Biome: **dungeon** | Playable Area: **48%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **85%** | 3D Elements: **0** | Entities: **9** | Par: **26 steps (23 optimal, 1.13x ratio) / 14s**
* **Ground-Truth Score**: **46.50 / 80.00 (58.1% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 6.27/10)*: Inertia: 6.4/10 | Anchors: 6.2/10 | Loopbacks: 6.2/10
  * *Chair 2 (3D Verticality: 4.40/10)*: Viaducts: 4.5/10 | Wall Walks: 4.2/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 6.37/10)*: Biome Palette: 6.5/10 | 2.5D Depth: 6/10 | Dynamic Shaders: 6.6/10
  * *Chair 4 (Visual Storytelling: 6.20/10)*: Ruin Purpose: 6.2/10 | Environmental Clues: 6.4/10 | Sanctum Payoff: 6/10
  * *Chair 5 (Novelty & Discovery: 6.00/10)*: Novelty: 6/10 | Subversion: 5.8/10 | "Aha!" Discovery: 6.2/10
  * *Chair 6 (Fun, Juice & Humor: 6.40/10)*: Tactile Juice: 6.4/10 | Wry Architect Humor: 6.4/10 | Playful Secrets: 6.4/10
  * *Chair 7 (Tension & Suspense: 4.53/10)*: Hazard Rhythm: 4.6/10 | Sentinel Evasion: 4.2/10 | Fog Dread: 4.8/10
  * *Chair 8 (Challenge & Gating: 6.33/10)*: Zero-Bypass Gating: 6.6/10 | Entity Logic: 6.2/10 | Par Calibration: 6.2/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (85% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 6.27/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 4.40/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 6.37/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.33/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Architect's Note #1: Every grand labyrinth begins with a single step. Beyond this entry vestibule lies the Golden Gate. Follow the winding corridors to recover the keystore; avoid dead-end traps."
  - *Ancient Wall Inscription*: "Ancient script: He who walks the winding way learns patience and cunning." — Explorer: "A wise rule for any pathfinder."
  - *Collectibles*: 1 bonus item(s) (Secret Sunstone).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 2: The Ruby Lock (Shō (Development))
* **Package**: `levels/chapter_1/level_2/`
* **Telemetry**: Dimensions: **15x13** | Biome: **dungeon** | Playable Area: **47%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **90%** | 3D Elements: **0** | Entities: **10** | Par: **31 steps (26 optimal, 1.19x ratio) / 18s**
* **Ground-Truth Score**: **46.50 / 80.00 (58.1% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 6.27/10)*: Inertia: 6.4/10 | Anchors: 6.2/10 | Loopbacks: 6.2/10
  * *Chair 2 (3D Verticality: 4.40/10)*: Viaducts: 4.5/10 | Wall Walks: 4.2/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 6.37/10)*: Biome Palette: 6.5/10 | 2.5D Depth: 6/10 | Dynamic Shaders: 6.6/10
  * *Chair 4 (Visual Storytelling: 6.20/10)*: Ruin Purpose: 6.2/10 | Environmental Clues: 6.4/10 | Sanctum Payoff: 6/10
  * *Chair 5 (Novelty & Discovery: 6.00/10)*: Novelty: 6/10 | Subversion: 5.8/10 | "Aha!" Discovery: 6.2/10
  * *Chair 6 (Fun, Juice & Humor: 6.40/10)*: Tactile Juice: 6.4/10 | Wry Architect Humor: 6.4/10 | Playful Secrets: 6.4/10
  * *Chair 7 (Tension & Suspense: 4.53/10)*: Hazard Rhythm: 4.6/10 | Sentinel Evasion: 4.2/10 | Fog Dread: 4.8/10
  * *Chair 8 (Challenge & Gating: 6.33/10)*: Zero-Bypass Gating: 6.6/10 | Entity Logic: 6.2/10 | Par Calibration: 6.2/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (90% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 6.27/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 4.40/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 6.37/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.33/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Architect's Journal: The North Sanctuary lies sealed by the ancient Ruby Lock. The western labyrinth winds into the deep vault where the Ruby Key is kept. Beware deceptive dead-ends."
  - *Ancient Wall Inscription*: "The ruby glow beckons through the winding dark." — Explorer: "West holds the key; North holds the gate."
  - *Collectibles*: 2 bonus item(s) (gem_bonus_2, Hidden Bloodstone).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 3: Prismatic Corridors (Ten (Twist))
* **Package**: `levels/chapter_1/level_3/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **44%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **80%** | 3D Elements: **0** | Entities: **11** | Par: **57 steps (48 optimal, 1.19x ratio) / 32s**
* **Ground-Truth Score**: **46.50 / 80.00 (58.1% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 6.27/10)*: Inertia: 6.4/10 | Anchors: 6.2/10 | Loopbacks: 6.2/10
  * *Chair 2 (3D Verticality: 4.40/10)*: Viaducts: 4.5/10 | Wall Walks: 4.2/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 6.37/10)*: Biome Palette: 6.5/10 | 2.5D Depth: 6/10 | Dynamic Shaders: 6.6/10
  * *Chair 4 (Visual Storytelling: 6.20/10)*: Ruin Purpose: 6.2/10 | Environmental Clues: 6.4/10 | Sanctum Payoff: 6/10
  * *Chair 5 (Novelty & Discovery: 6.00/10)*: Novelty: 6/10 | Subversion: 5.8/10 | "Aha!" Discovery: 6.2/10
  * *Chair 6 (Fun, Juice & Humor: 6.40/10)*: Tactile Juice: 6.4/10 | Wry Architect Humor: 6.4/10 | Playful Secrets: 6.4/10
  * *Chair 7 (Tension & Suspense: 4.53/10)*: Hazard Rhythm: 4.6/10 | Sentinel Evasion: 4.2/10 | Fog Dread: 4.8/10
  * *Chair 8 (Challenge & Gating: 6.33/10)*: Zero-Bypass Gating: 6.6/10 | Entity Logic: 6.2/10 | Par Calibration: 6.2/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (80% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 6.27/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 4.40/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 6.37/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.33/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Architect's Journal: The central dais is locked under royal purple seal. To break it, claim the Emerald Key in the southern cistern, open the eastern passage, and retrieve the Purple Keystone."
  - *Ancient Wall Inscription*: "Ancient stone: Resonance flows in cycles. The Emerald unlocks the path to royalty." — Explorer: "The Emerald Gate will open the way forward."
  - *Collectibles*: 1 bonus item(s) (Prismatic Shard).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 4: The Shrouded Vault (Ketsu (Synthesis))
* **Package**: `levels/chapter_1/level_4/`
* **Telemetry**: Dimensions: **19x17** | Biome: **dungeon** | Playable Area: **48%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **84%** | 3D Elements: **0** | Entities: **14** | Par: **72 steps (61 optimal, 1.18x ratio) / 40s**
* **Ground-Truth Score**: **46.50 / 80.00 (58.1% — B- Tier)** — *Status: Overhauled Foundation 🛠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 6.27/10)*: Inertia: 6.4/10 | Anchors: 6.2/10 | Loopbacks: 6.2/10
  * *Chair 2 (3D Verticality: 4.40/10)*: Viaducts: 4.5/10 | Wall Walks: 4.2/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 6.37/10)*: Biome Palette: 6.5/10 | 2.5D Depth: 6/10 | Dynamic Shaders: 6.6/10
  * *Chair 4 (Visual Storytelling: 6.20/10)*: Ruin Purpose: 6.2/10 | Environmental Clues: 6.4/10 | Sanctum Payoff: 6/10
  * *Chair 5 (Novelty & Discovery: 6.00/10)*: Novelty: 6/10 | Subversion: 5.8/10 | "Aha!" Discovery: 6.2/10
  * *Chair 6 (Fun, Juice & Humor: 6.40/10)*: Tactile Juice: 6.4/10 | Wry Architect Humor: 6.4/10 | Playful Secrets: 6.4/10
  * *Chair 7 (Tension & Suspense: 4.53/10)*: Hazard Rhythm: 4.6/10 | Sentinel Evasion: 4.2/10 | Fog Dread: 4.8/10
  * *Chair 8 (Challenge & Gating: 6.33/10)*: Zero-Bypass Gating: 6.6/10 | Entity Logic: 6.2/10 | Par Calibration: 6.2/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (84% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 6.27/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 4.40/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 6.37/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 6.33/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Architect's Journal: The Triune Sanctum to the south requires all three resonance keys—Ruby, Emerald, and Sapphire. The labyrinth wings connect all three cathedral chambers beneath the shrouded mist."
  - *Ancient Wall Inscription*: "The cathedral bells echo through the fog. Seek the three sacred chambers in any order." — Explorer: "The corridors branch into three deep wings."
  - *Collectibles*: 1 bonus item(s) (Abyssal Sapphire).
* **Actionable Overhaul Directives (Target: Elevate from B- to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 2: Canopy Bridges (Levels 5–8)

#### Level 5: The Canopy Bridge (Ki (Introduction))
* **Package**: `levels/chapter_2/level_5/`
* **Telemetry**: Dimensions: **15x13** | Biome: **dungeon** | Playable Area: **45%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **70%** | 3D Elements: **15** | Entities: **5** | Par: **25 steps (21 optimal, 1.19x ratio) / 14s**
* **Ground-Truth Score**: **32.31 / 80.00 (40.4% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.47/10)*: Inertia: 4.4/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (70% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.47/10).
  - **3D Verticality**: Incorporates 5 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Architect's Journal: Ascend the southern ramp to tread upon the ancient canopy bridge deck. The jungle key is suspended at high elevation; below, the underpass canal flows unimpeded toward the northern gate."
  - *Ancient Wall Inscription*: "Two tiers of path weave through the trees: walk below through water, or climb above the mist." — Explorer: "The ramp will carry me directly to the bridge deck."
  - *Collectibles*: 1 bonus item(s) (Canopy Peridot).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 6: Canopy Crossings (Shō (Development))
* **Package**: `levels/chapter_2/level_6/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **51%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **67%** | 3D Elements: **17** | Entities: **7** | Par: **48 steps (40 optimal, 1.2x ratio) / 27s**
* **Ground-Truth Score**: **32.11 / 80.00 (40.1% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.27/10)*: Inertia: 3.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (67% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.27/10).
  - **3D Verticality**: Incorporates 7 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Architect's Journal: Dual traversal is demanded here. First, brave the low underpass tunnel beneath the canopy viaduct to claim the amber key in the lower glen. Only then will the southern ramp unlock, granting access to the high bridge deck."
  - *Ancient Wall Inscription*: "The water tunnel runs low and cold beneath the high bridge. Collect the amber resonance before looking to the sky." — Explorer: "Underpass first, high overpass second."
  - *Collectibles*: 1 bonus item(s) (Sunken Amber Tear).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 7: The Sunken Chasm (Ten (Twist))
* **Package**: `levels/chapter_2/level_7/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **55%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **75%** | 3D Elements: **20** | Entities: **5** | Par: **45 steps (38 optimal, 1.18x ratio) / 25s**
* **Ground-Truth Score**: **32.51 / 80.00 (40.6% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.47/10)*: Inertia: 4.4/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.13/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (75% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.47/10).
  - **3D Verticality**: Incorporates 12 bridge(s) and 4 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Architect's Journal: The Sunken Chasm weaves two perpendicular viaducts across the chasm rift. Navigate the lower canals beneath the east-west bridge, then ascend to claim the azure keystone atop the north-south trestle."
  - *Ancient Wall Inscription*: "Perpendicular arches intersect above the deep canal. The path of height meets the path of depth." — Explorer: "Both bridges must be traversed to reach the sanctum."
  - *Collectibles*: 1 bonus item(s) (Chasm Aquamarine).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 8: Citadel of the Two Horizons (Ketsu (Synthesis))
* **Package**: `levels/chapter_2/level_8/`
* **Telemetry**: Dimensions: **19x17** | Biome: **dungeon** | Playable Area: **46%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **70%** | 3D Elements: **22** | Entities: **7** | Par: **71 steps (60 optimal, 1.18x ratio) / 40s**
* **Ground-Truth Score**: **33.05 / 80.00 (41.3% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.47/10)*: Inertia: 4.4/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 4.20/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 4.8/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 4.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (70% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.47/10).
  - **3D Verticality**: Incorporates 14 bridge(s) and 4 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Architect's Journal: The Citadel commands twin parallel viaducts crowning the western and eastern horizons. Claim the Ruby Horizon Key from the west ramparts to release the eastern portcullis, then ascend the second horizon to breach the northern high keep."
  - *Ancient Wall Inscription*: "Two horizons flank the throne. West unlocks East, and East crowns the sovereign." — Explorer: "A sequential ascent across twin towers."
  - *Collectibles*: 1 bonus item(s) (Citadel Horizon Sunstone).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 3: Clockwork Foundries (Levels 9–12)

#### Level 9: The Iron Lever (Ki (Introduction))
* **Package**: `levels/chapter_3/level_9/`
* **Telemetry**: Dimensions: **15x13** | Biome: **dungeon** | Playable Area: **45%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **27%** | 3D Elements: **7** | Entities: **5** | Par: **28 steps (23 optimal, 1.22x ratio) / 17s**
* **Ground-Truth Score**: **31.64 / 80.00 (39.6% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (27% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The bronze lever awakens the sleeping clockwork. Throw the switch to slide the heavy stone barrier into the floor."
  - *Ancient Wall Inscription*: "Pistons roar beneath the stone when the iron lever clicks." — Explorer: "The lever on the left must control the eastern barrier."
  - *Collectibles*: 2 bonus item(s) (Bronze Gear Relic, Forgemaster Gear).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 10: Clockwork Gates (Shō (Development))
* **Package**: `levels/chapter_3/level_10/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **48%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **24%** | 3D Elements: **5** | Entities: **6** | Par: **41 steps (34 optimal, 1.21x ratio) / 25s**
* **Ground-Truth Score**: **31.11 / 80.00 (38.9% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 3.53/10)*: Inertia: 3.2/10 | Anchors: 3.6/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 4.17/10)*: Viaducts: 4.4/10 | Wall Walks: 3.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 4.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (24% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 3.53/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.17/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Dual conduits power the hydraulic gates. Engage the western valve to unlock the concourse, then release the eastern master piston."
  - *Ancient Wall Inscription*: "Conduit sequence: West powers Concourse, East unlocks South." — Explorer: "The western valve opens the central chamber."
  - *Collectibles*: 2 bonus item(s) (Brass Dynamo Core, Brass Chronometer).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 11: Shifting Foundations (Ten (Twist))
* **Package**: `levels/chapter_3/level_11/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **51%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **38%** | 3D Elements: **7** | Entities: **6** | Par: **30 steps (25 optimal, 1.2x ratio) / 18s**
* **Ground-Truth Score**: **31.84 / 80.00 (39.8% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.13/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (38% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The master valve is balanced upon a counterweight: as the northern sluice gate lowers into the chasm, the southern passage seals."
  - *Ancient Wall Inscription*: "Lower the northern sluice to claim the gilded key." — Explorer: "The northern gate opened, allowing passage to the eastern vault."
  - *Collectibles*: 1 bonus item(s) (Gilded Flywheel).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 12: Master of Wheels (Ketsu (Synthesis))
* **Package**: `levels/chapter_3/level_12/`
* **Telemetry**: Dimensions: **19x17** | Biome: **dungeon** | Playable Area: **52%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **37%** | 3D Elements: **7** | Entities: **7** | Par: **55 steps (46 optimal, 1.2x ratio) / 33s**
* **Ground-Truth Score**: **32.38 / 80.00 (40.5% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 4.20/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 4.8/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 4.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (37% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The entire citadel moves in harmony. Retrieve the Ruby Key from the western furnace, activate the eastern dynamo, and claim the Master Gear."
  - *Ancient Wall Inscription*: "The Triad of the Machine: West yields the key, East drops the wall, South crowns the Master." — Explorer: "Both the Ruby Key and the Dynamo Switch are required to enter the Apex."
  - *Collectibles*: 2 bonus item(s) (Master Chronometer, Dynamo Core Crystal).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 4: Astral Teleporters (Levels 13–16)

#### Level 13: The First Rift (Ki (Introduction))
* **Package**: `levels/chapter_4/level_13/`
* **Telemetry**: Dimensions: **15x13** | Biome: **dungeon** | Playable Area: **53%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **50%** | 3D Elements: **7** | Entities: **5** | Par: **17 steps (13 optimal, 1.31x ratio) / 11s**
* **Ground-Truth Score**: **31.64 / 80.00 (39.6% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.27/10)*: Inertia: 3.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.40/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 4.4/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (50% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.27/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.40/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The amethyst rift warps reality itself. Step into the glowing circle to traverse the void."
  - *Ancient Wall Inscription*: "Two halves of the cosmos, severed by the void, reconnected by the rift." — Explorer: "The glowing circle will warp me across the chasm."
  - *Collectibles*: 2 bonus item(s) (Astral Amethyst, Astral Rift Shard).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 14: Twinned Portals (Shō (Development))
* **Package**: `levels/chapter_4/level_14/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **58%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **19%** | 3D Elements: **6** | Entities: **7** | Par: **43 steps (36 optimal, 1.19x ratio) / 26s**
* **Ground-Truth Score**: **31.71 / 80.00 (39.6% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 3.80/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 4.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (19% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 3.80/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Twin spires mirror each other across the cosmic divide. Warp into Tower Beta to claim the Azure Key, then return through the mirror rift."
  - *Ancient Wall Inscription*: "The mirror rift returns travelers to the western sanctum." — Explorer: "I need to retrieve the Azure Key from the eastern tower."
  - *Collectibles*: 1 bonus item(s) (Twin Star Quartz).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 15: Dimensional Warp (Ten (Twist))
* **Package**: `levels/chapter_4/level_15/`
* **Telemetry**: Dimensions: **19x15** | Biome: **dungeon** | Playable Area: **52%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **34%** | 3D Elements: **9** | Entities: **6** | Par: **30 steps (25 optimal, 1.2x ratio) / 18s**
* **Ground-Truth Score**: **32.11 / 80.00 (40.1% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.13/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (34% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 4 bridge(s) and 1 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "A rift does not merely bend space—it ascends height. Warp directly onto the overhead bridge to traverse the high chasm."
  - *Ancient Wall Inscription*: "The rift catapults matter into the upper air." — Explorer: "Entering the purple rift will warp me directly onto the bridge overhead."
  - *Collectibles*: 1 bonus item(s) (Warp Horizon Pearl).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 16: The Astral Nexus (Ketsu (Synthesis))
* **Package**: `levels/chapter_4/level_16/`
* **Telemetry**: Dimensions: **19x19** | Biome: **dungeon** | Playable Area: **44%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **31%** | 3D Elements: **7** | Entities: **10** | Par: **38 steps (32 optimal, 1.19x ratio) / 23s**
* **Ground-Truth Score**: **32.71 / 80.00 (40.9% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 4.20/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 4.8/10
  * *Chair 5 (Novelty & Discovery: 4.60/10)*: Novelty: 4.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 4.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (31% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Four cosmic realms converge at the Astral Nexus. Journey through the planetary rifts, assemble the colored keystones, and breach the Star Core."
  - *Ancient Wall Inscription*: "The nexus binds the stars in a circle of light." — Explorer: "I must follow the planetary rifts to gather both seals."
  - *Collectibles*: 1 bonus item(s) (Nexus Star Sapphire).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 5: Molten Gauntlets (Levels 17–20)

#### Level 17: The Fire Vents (Ki (Introduction))
* **Package**: `levels/chapter_5/level_17/`
* **Telemetry**: Dimensions: **15x13** | Biome: **dungeon** | Playable Area: **56%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **29%** | 3D Elements: **8** | Entities: **7** | Par: **32 steps (26 optimal, 1.23x ratio) / 14s**
* **Ground-Truth Score**: **32.84 / 80.00 (41.1% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.47/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 3.53/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (29% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.47/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Feel the rhythmic pulse of the caldera. Time your movement through the basalt corridors and harbor in the alcoves."
  - *Ancient Wall Inscription*: "Ancient miners carved niches into the basalt to shelter from flame bursts." — Explorer: "The vents pulse periodically. I can harbor in the side niches."
  - *Collectibles*: 3 bonus item(s) (Fire Opal, Molten Core Shard, Molten Core Geode).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 18: The Molten Sentinels (Shō (Development))
* **Package**: `levels/chapter_5/level_18/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **49%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **10%** | 3D Elements: **10** | Entities: **8** | Par: **35 steps (29 optimal, 1.21x ratio) / 21s**
* **Ground-Truth Score**: **32.64 / 80.00 (40.8% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 3.60/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (10% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Obsidian golems patrol the basalt halls in eternal vigilance. Lure them around the central pillars to slip past."
  - *Ancient Wall Inscription*: "Forged from living magma and black glass, the sentinels follow their endless circuit." — Explorer: "If I circle the central pillar, the sentinel will pace ahead of me."
  - *Collectibles*: 3 bonus item(s) (Obsidian Sentinel Eye, Pyrite Cluster, Crystalline Basalt Rose).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 19: The Crucible Crossing (Ten (Twist))
* **Package**: `levels/chapter_5/level_19/`
* **Telemetry**: Dimensions: **19x15** | Biome: **dungeon** | Playable Area: **52%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **57%** | 3D Elements: **5** | Entities: **11** | Par: **29 steps (24 optimal, 1.21x ratio) / 18s**
* **Ground-Truth Score**: **33.11 / 80.00 (41.4% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.00/10)*: Inertia: 3.8/10 | Anchors: 4.4/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 4.17/10)*: Viaducts: 4.4/10 | Wall Walks: 3.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.47/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.13/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 4.27/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (57% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.00/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.17/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.47/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The crucible combines searing flame jets with a vigilant sentinel. Activate the cool crystal beacon midway to secure your footing."
  - *Ancient Wall Inscription*: "The glacial beacon radiates soothing chill amidst the roaring forge." — Explorer: "Activating the checkpoint will save my position if I stumble."
  - *Collectibles*: 4 bonus item(s) (Crucible Flame Ember, Heart of Basalt, Igneous Tear, Crucible Sunstone).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 20: The Caldera Gauntlet (Ketsu (Synthesis))
* **Package**: `levels/chapter_5/level_20/`
* **Telemetry**: Dimensions: **21x19** | Biome: **dungeon** | Playable Area: **58%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **4%** | 3D Elements: **7** | Entities: **14** | Par: **36 steps (30 optimal, 1.2x ratio) / 22s**
* **Ground-Truth Score**: **34.05 / 80.00 (42.6% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.47/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 4.20/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 4.8/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 4.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 4.27/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (4% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.47/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Here in the heart of Mount Ignis, all trials converge: synchronized fire jets, dual sentinels, and the royal Caldera Key. Prove your mastery."
  - *Ancient Wall Inscription*: "The Sovereign Forge—where legendary relics were tempered in primeval dragon fire." — Explorer: "Both sentinels pace the galleries. I must time my ascent to the North Gallery."
  - *Collectibles*: 5 bonus item(s) (Caldera Heart Core, Volcanic Crown Gem, Magma Siphon Orb, Dragon Cinder Shard, Primal Pyretic Crown).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 6: Arcane Scriptoriums (Levels 21–24)

#### Level 21: The Rune Lock (Ki (Introduction))
* **Package**: `levels/chapter_6/level_21/`
* **Telemetry**: Dimensions: **15x13** | Biome: **dungeon** | Playable Area: **66%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **9%** | 3D Elements: **7** | Entities: **6** | Par: **22 steps (18 optimal, 1.22x ratio) / 14s**
* **Ground-Truth Score**: **31.64 / 80.00 (39.6% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (9% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The ancient gate is bound by arcane runes. Recall the celestial sequence to dispel the barrier."
  - *Ancient Wall Inscription*: "The memory of the stars is written in glyphs of light upon the stone." — Explorer: "Touching the runes reveals their sequence. I must memorize the order."
  - *Collectibles*: 3 bonus item(s) (Sunset Amethyst, Runic Memory Prism, Runic Astral Sphere).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 22: The Cipher Dials (Shō (Development))
* **Package**: `levels/chapter_6/level_22/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **65%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **11%** | 3D Elements: **7** | Entities: **9** | Par: **38 steps (32 optimal, 1.19x ratio) / 23s**
* **Ground-Truth Score**: **31.64 / 80.00 (39.6% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (11% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Align the stellar dials according to the celestial dance: first the Sun, second the Moon, third the Horizon."
  - *Ancient Wall Inscription*: "The Solar Crest shines first at dawn: ☀️ Sun." — Explorer: "The first ring must be turned to the Sun."
  - *Collectibles*: 2 bonus item(s) (Ancient Astrolabe Shard, Enigmatic Cipher Chronometer).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 23: The Entangled Wards (Ten (Twist))
* **Package**: `levels/chapter_6/level_23/`
* **Telemetry**: Dimensions: **19x15** | Biome: **dungeon** | Playable Area: **52%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **13%** | 3D Elements: **6** | Entities: **10** | Par: **30 steps (25 optimal, 1.2x ratio) / 18s**
* **Ground-Truth Score**: **31.90 / 80.00 (39.9% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 3.80/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.13/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (13% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 3.80/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The dual seals are entangled. Break the rune ward to access the Dynamo Lever, lowering the barrier to the Cipher Sanctum."
  - *Ancient Wall Inscription*: "The celestial ward alignment: 🌅 Horizon first, 🌙 Moon second, and ⭐ Star third." — Explorer: "The inner cipher dials require Horizon, Moon, and Star."
  - *Collectibles*: 5 bonus item(s) (Chronosphere Pearl, Void Prism, Stellar Ephemeris Tome, Arcane Gyroscope, Entangled Void Tome).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 24: The Grand Archive (Ketsu (Synthesis))
* **Package**: `levels/chapter_6/level_24/`
* **Telemetry**: Dimensions: **21x19** | Biome: **dungeon** | Playable Area: **50%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **6%** | 3D Elements: **7** | Entities: **12** | Par: **52 steps (44 optimal, 1.18x ratio) / 32s**
* **Ground-Truth Score**: **32.71 / 80.00 (40.9% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 4.20/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 4.8/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 4.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (6% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The Grand Archive holds the accumulated wisdom of all celestial trials. Decipher the rune script, align the stargazer cipher, and claim the Master Golden Key."
  - *Ancient Wall Inscription*: "The Stargazer's creed inscribed on stone: ⭐ Star first, 🌙 Moon second, 🌅 Horizon third." — Explorer: "The south cipher dials must be set to Star, Moon, and Horizon."
  - *Collectibles*: 5 bonus item(s) (Astral Codex of Antiquity, Grand Celestial Compass, Orrery Platinum Cog, Archmage Signet Ring, Grand Archon Scribe Quill).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 7: Trials of Ascent (Levels 25–28)

#### Level 25: The Sovereign Rampart (Ki (Introduction))
* **Package**: `levels/chapter_7/level_25/`
* **Telemetry**: Dimensions: **17x15** | Biome: **dungeon** | Playable Area: **58%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **11%** | 3D Elements: **12** | Entities: **7** | Par: **37 steps (31 optimal, 1.19x ratio) / 23s**
* **Ground-Truth Score**: **31.91 / 80.00 (39.9% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (11% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 6 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The icy ramparts bridge the frozen abyss. Ascend the wooden incline, traverse the high gallery, and ride the rift to the Azure Sigil."
  - *Ancient Wall Inscription*: "The fortress of the sovereign stands above the glaciers, impervious to the howling winds." — Explorer: "Ascending the ramp will carry me across the chasm to the portal."
  - *Collectibles*: 2 bonus item(s) (Frostfire Diamond, Rampart Star Diadem).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 26: The Frostfire Conduit (Shō (Development))
* **Package**: `levels/chapter_7/level_26/`
* **Telemetry**: Dimensions: **19x15** | Biome: **dungeon** | Playable Area: **55%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **17%** | 3D Elements: **12** | Entities: **9** | Par: **61 steps (52 optimal, 1.17x ratio) / 37s**
* **Ground-Truth Score**: **32.97 / 80.00 (41.2% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 3.60/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (17% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 7 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Overhead bridges pass high above the Frost Sentinel. Traverse the aerial walkway to claim the Ruby Key and throw the dynamo switch."
  - *Ancient Wall Inscription*: "The sentinel patrols the lower frost floor, blind to the travelers walking upon the high bridge." — Explorer: "Walking across the bridge lets me bypass the sentinel completely."
  - *Collectibles*: 3 bonus item(s) (Glacial Conduit Tear, Frost-Infused Igneous Shard, Frostfire Phoenix Feather).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 27: The Prismatic Bastion (Ten (Twist))
* **Package**: `levels/chapter_7/level_27/`
* **Telemetry**: Dimensions: **19x17** | Biome: **dungeon** | Playable Area: **48%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **51%** | 3D Elements: **10** | Entities: **9** | Par: **30 steps (25 optimal, 1.2x ratio) / 18s**
* **Ground-Truth Score**: **32.31 / 80.00 (40.4% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.27/10)*: Inertia: 3.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.13/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (51% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.27/10).
  - **3D Verticality**: Incorporates 5 bridge(s) and 1 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Align the stellar cipher to reach the high bridge. Step into the aerial vortex to breach the sealed inner vault."
  - *Ancient Wall Inscription*: "Prismatic alignment of the high bridge: 🌅 Horizon first, ☀️ Sun second, and ⭐ Star third." — Explorer: "Setting the cipher gate to Horizon, Sun, and Star will grant access to the aerial vortex."
  - *Collectibles*: 3 bonus item(s) (Bastion Refraction Prism, Aerial Vortex Sapphire, Prismatic Bastion Aegis).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 28: The Sovereign's Ascent (Ketsu (Synthesis))
* **Package**: `levels/chapter_7/level_28/`
* **Telemetry**: Dimensions: **21x19** | Biome: **dungeon** | Playable Area: **50%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **6%** | 3D Elements: **7** | Entities: **13** | Par: **55 steps (46 optimal, 1.2x ratio) / 33s**
* **Ground-Truth Score**: **33.44 / 80.00 (41.8% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 4.20/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 4.8/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 4.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 3.60/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (6% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The apex of the Citadel tests every virtue: scriptural memory, sentry evasion, and the Sovereign's Golden Sigil."
  - *Ancient Wall Inscription*: "Here the Sovereign stood upon the snowy peak, holding the threads of space, time, and spirit." — Explorer: "I will unlock the north rune seal for the key, and brave the crypt for the barrier switch."
  - *Collectibles*: 5 bonus item(s) (Sovereign Royal Orb, Aegis of the High Citadel, Frostfire Scepter Gem, Zenith Sun Crest, Sovereign Apex Zenith Star).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 8: The Monolith Spire (Levels 29–32)

#### Level 29: The Cardinal Needle (Ki (Introduction))
* **Package**: `levels/chapter_8/level_29/`
* **Telemetry**: Dimensions: **15x15** | Biome: **dungeon** | Playable Area: **64%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **67%** | 3D Elements: **7** | Entities: **8** | Par: **29 steps (24 optimal, 1.21x ratio) / 18s**
* **Ground-Truth Score**: **31.84 / 80.00 (39.8% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.27/10)*: Inertia: 3.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.50/10)*: Viaducts: 4.4/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (67% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.27/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Rotate the camera [Q / R] to view the cardinal corridors. Seek the golden key in the south-west wing."
  - *Ancient Wall Inscription*: "Rotating 90 degrees CCW [Q] turns East to facing up. Screen movement always follows your view."
  - *Collectibles*: 3 bonus item(s) (Sapphire Prism, Lodestone Cardinal Needle, Cardinal Astral Compass Gem).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 30: The Hidden Underpass (Shō (Development))
* **Package**: `levels/chapter_8/level_30/`
* **Telemetry**: Dimensions: **15x15** | Biome: **dungeon** | Playable Area: **65%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **0%** | 3D Elements: **13** | Entities: **6** | Par: **29 steps (24 optimal, 1.21x ratio) / 18s**
* **Ground-Truth Score**: **31.91 / 80.00 (39.9% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (0% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 7 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Overhead bridges occlude low ground corridors. Rotate 90 degrees to peer straight through underpass tunnels!"
  - *Ancient Wall Inscription*: "Rotating [Q / R] shifts the 2.5D perspective, revealing what was hidden behind elevated bridge spans."
  - *Collectibles*: 3 bonus item(s) (Skyward Topaz, Subterranean Aqueduct Pearl, Occluded Sunstone).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 31: The Four-Faced Pillar (Ten (Twist))
* **Package**: `levels/chapter_8/level_31/`
* **Telemetry**: Dimensions: **15x15** | Biome: **dungeon** | Playable Area: **68%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **0%** | 3D Elements: **5** | Entities: **8** | Par: **38 steps (32 optimal, 1.19x ratio) / 23s**
* **Ground-Truth Score**: **30.97 / 80.00 (38.7% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 3.53/10)*: Inertia: 3.2/10 | Anchors: 3.6/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 4.17/10)*: Viaducts: 4.4/10 | Wall Walks: 3.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.13/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (0% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 3.53/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.17/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Four faces of the monolith tell one story. Walk the perimeter and rotate the view to read each inscription."
  - *Ancient Wall Inscription*: "Face of the North Wind: The ruby key sleeps in the eastern vault."
  - *Collectibles*: 2 bonus item(s) (Eye of the Four Winds, Four Winds Zephyr Core).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 32: The Prismatic Spire (Ketsu (Synthesis))
* **Package**: `levels/chapter_8/level_32/`
* **Telemetry**: Dimensions: **17x17** | Biome: **dungeon** | Playable Area: **67%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **14%** | 3D Elements: **11** | Entities: **6** | Par: **34 steps (28 optimal, 1.21x ratio) / 21s**
* **Ground-Truth Score**: **31.84 / 80.00 (39.8% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.93/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 3.4/10 | Sanctum Payoff: 4.8/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 4.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.13/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 3/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (14% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 5 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "At the apex of the monolith, two distinct routes await: return victorious to the Grand Hub, or branch downward into the Whispering Citadel."
  - *Collectibles*: 3 bonus item(s) (Diamond of the Monolith, Apex Monolith Core Crystal, Crown Monolith Prismatic Core).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 9: Sunken Aqueducts (Levels 33–36)

#### Level 33: The Sluice Gate (Ki (Introduction))
* **Package**: `levels/chapter_9/level_33/`
* **Telemetry**: Dimensions: **17x17** | Biome: **dungeon** | Playable Area: **42%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **82%** | 3D Elements: **8** | Entities: **6** | Par: **68 steps (58 optimal, 1.17x ratio) / 36s**
* **Ground-Truth Score**: **34.11 / 80.00 (42.6% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.60/10)*: Inertia: 4.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.47/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 4.27/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (82% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.60/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.47/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Seek the bronze sluice key in the southern overflow flume while timing the pressure jets to unlock the central watergate."
  - *Ancient Wall Inscription*: "Water flows from the high snowcaps down into the grand cisterns. Maintain the sluice gates."
  - *Collectibles*: 1 bonus item(s) (Aqueduct Sapphire).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 34: Submerged Crossings (Shō (Development))
* **Package**: `levels/chapter_9/level_34/`
* **Telemetry**: Dimensions: **17x17** | Biome: **dungeon** | Playable Area: **46%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **85%** | 3D Elements: **11** | Entities: **6** | Par: **57 steps (48 optimal, 1.19x ratio) / 30s**
* **Ground-Truth Score**: **33.17 / 80.00 (41.5% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.60/10)*: Inertia: 4.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 3.60/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (85% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.60/10).
  - **3D Verticality**: Incorporates 5 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Cross the elevated aqueduct bridge, then drop into the flooded channel below to retrieve the pressure key."
  - *Ancient Wall Inscription*: "Elevated flumes transport pure glacial melt above the marsh runoff."
  - *Collectibles*: 1 bonus item(s) (Canal Emerald).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 35: The Pressure Basin (Ten (Twist))
* **Package**: `levels/chapter_9/level_35/`
* **Telemetry**: Dimensions: **19x19** | Biome: **dungeon** | Playable Area: **55%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **89%** | 3D Elements: **10** | Entities: **7** | Par: **48 steps (40 optimal, 1.2x ratio) / 25s**
* **Ground-Truth Score**: **34.31 / 80.00 (42.9% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.60/10)*: Inertia: 4.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.47/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.13/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 4.27/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (89% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.60/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.47/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Timing is everything. Retrieve the pressure key from the northern gallery, then bypass the pulsing geysers to unlock the outflow gate."
  - *Ancient Wall Inscription*: "When basin pressure reaches critical threshold, vent steam via the north valve."
  - *Collectibles*: 1 bonus item(s) (Deep Aquamarine).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 36: Grand Aqueduct Reservoir (Ketsu (Synthesis))
* **Package**: `levels/chapter_9/level_36/`
* **Telemetry**: Dimensions: **21x21** | Biome: **dungeon** | Playable Area: **53%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **92%** | 3D Elements: **13** | Entities: **9** | Par: **66 steps (56 optimal, 1.18x ratio) / 35s**
* **Ground-Truth Score**: **37.99 / 80.00 (47.5% — C+ Tier)** — *Status: MSP Baseline ⚠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.73/10)*: Inertia: 4.8/10 | Anchors: 4.8/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.93/10)*: Viaducts: 5.2/10 | Wall Walks: 4.8/10 | Ramps: 4.8/10
  * *Chair 3 (Art & Shaders: 4.73/10)*: Biome Palette: 5/10 | 2.5D Depth: 4.8/10 | Dynamic Shaders: 4.4/10
  * *Chair 4 (Visual Storytelling: 4.67/10)*: Ruin Purpose: 4.6/10 | Environmental Clues: 4.4/10 | Sanctum Payoff: 5/10
  * *Chair 5 (Novelty & Discovery: 4.73/10)*: Novelty: 4.8/10 | Subversion: 4.8/10 | "Aha!" Discovery: 4.6/10
  * *Chair 6 (Fun, Juice & Humor: 4.47/10)*: Tactile Juice: 4/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 4.8/10
  * *Chair 7 (Tension & Suspense: 4.80/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 4.8/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (92% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.73/10).
  - **3D Verticality**: Incorporates 7 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.93/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.73/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The grand culmination of the Sunken Aqueducts. Coordinate keys across flooded canals and elevated piers to breach the Grand Spillway."
  - *Ancient Wall Inscription*: "Beyond these gates lie the pristine depths of the Sunken Vaults."
  - *Collectibles*: 1 bonus item(s) (Heart of the Aqueduct).
* **Actionable Overhaul Directives (Target: Elevate from C+ to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Campaign Chapter 10: Apex of the Prism (Levels 37–40)

#### Level 37: The Spectral Gate (Ki (Introduction))
* **Package**: `levels/chapter_10/level_37/`
* **Telemetry**: Dimensions: **23x23** | Biome: **dungeon** | Playable Area: **41%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **85%** | 3D Elements: **4** | Entities: **12** | Par: **87 steps (74 optimal, 1.18x ratio) / 45s**
* **Ground-Truth Score**: **33.91 / 80.00 (42.4% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.33/10)*: Inertia: 4.8/10 | Anchors: 4.4/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 4.17/10)*: Viaducts: 4.4/10 | Wall Walks: 3.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.47/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.27/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 4.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 4.27/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (85% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.33/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.17/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.47/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The refracting crystal prisms cast elusive shadows. Locate the amber key, ascend the viaduct to toggle the refraction barrier, and unseal the spectral gate."
  - *Ancient Wall Inscription*: "Light splits into amber and violet vibrations upon striking the primal crystal facade. Ascend the viaduct to align the focal lever."
  - *Collectibles*: 1 bonus item(s) (Prismatic Diamond).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 38: Concentric Trestles (Shō (Development))
* **Package**: `levels/chapter_10/level_38/`
* **Telemetry**: Dimensions: **25x25** | Biome: **dungeon** | Playable Area: **55%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **80%** | 3D Elements: **46** | Entities: **8** | Par: **94 steps (80 optimal, 1.18x ratio) / 49s**
* **Ground-Truth Score**: **34.44 / 80.00 (43% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.60/10)*: Inertia: 4.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.47/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.93/10)*: Novelty: 3.8/10 | Subversion: 4.5/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 4.27/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (80% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.60/10).
  - **3D Verticality**: Incorporates 8 bridge(s) and 5 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.47/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Traverse the multi-elevation concentric trestles, toggle the battlement lever, and claim the keystone to enter the Apex Altar."
  - *Ancient Wall Inscription*: "Ascend the outer battlement ramparts and traverse the grand viaduct to look down into the sunken courts and navigate between tiers."
  - *Collectibles*: 1 bonus item(s) (Celestial Tourmaline).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 39: Harmonic Mirror Seals (Ten (Twist))
* **Package**: `levels/chapter_10/level_39/`
* **Telemetry**: Dimensions: **27x27** | Biome: **dungeon** | Playable Area: **50%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **86%** | 3D Elements: **15** | Entities: **10** | Par: **88 steps (75 optimal, 1.17x ratio) / 46s**
* **Ground-Truth Score**: **34.98 / 80.00 (43.7% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.60/10)*: Inertia: 4.8/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.77/10)*: Viaducts: 5.2/10 | Wall Walks: 4.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.47/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 4.47/10)*: Novelty: 4.4/10 | Subversion: 4.5/10 | "Aha!" Discovery: 4.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 4.27/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (86% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.60/10).
  - **3D Verticality**: Incorporates 2 bridge(s) and 6 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.77/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.47/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Align the harmonic mirror seals. Retrieve the silver key from the east wing to enter the Inner Sanctum."
  - *Ancient Wall Inscription*: "The silver tuning key rests in the isolated East Astral Sanctum. Align the southern focal lever to unseal the resonant rift."
  - *Collectibles*: 1 bonus item(s) (Harmonic Moonstone).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level 40: Heart of the Prism (Ketsu (Synthesis))
* **Package**: `levels/chapter_10/level_40/`
* **Telemetry**: Dimensions: **29x29** | Biome: **dungeon** | Playable Area: **51%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **90%** | 3D Elements: **10** | Entities: **13** | Par: **190 steps (164 optimal, 1.16x ratio) / 99s**
* **Ground-Truth Score**: **39.93 / 80.00 (49.9% — C+ Tier)** — *Status: MSP Baseline ⚠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.93/10)*: Inertia: 5/10 | Anchors: 5/10 | Loopbacks: 4.8/10
  * *Chair 2 (3D Verticality: 5.27/10)*: Viaducts: 5.6/10 | Wall Walks: 5.2/10 | Ramps: 5/10
  * *Chair 3 (Art & Shaders: 4.93/10)*: Biome Palette: 5.2/10 | 2.5D Depth: 5/10 | Dynamic Shaders: 4.6/10
  * *Chair 4 (Visual Storytelling: 4.87/10)*: Ruin Purpose: 4.8/10 | Environmental Clues: 4.6/10 | Sanctum Payoff: 5.2/10
  * *Chair 5 (Novelty & Discovery: 5.00/10)*: Novelty: 5.2/10 | Subversion: 5/10 | "Aha!" Discovery: 4.8/10
  * *Chair 6 (Fun, Juice & Humor: 4.67/10)*: Tactile Juice: 4.2/10 | Wry Architect Humor: 4.8/10 | Playful Secrets: 5/10
  * *Chair 7 (Tension & Suspense: 5.13/10)*: Hazard Rhythm: 5.2/10 | Sentinel Evasion: 5.2/10 | Fog Dread: 5/10
  * *Chair 8 (Challenge & Gating: 5.13/10)*: Zero-Bypass Gating: 5.4/10 | Entity Logic: 4.8/10 | Par Calibration: 5.2/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (90% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.93/10).
  - **3D Verticality**: Incorporates 1 bridge(s) and 4 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 5.27/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 5.13/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The climax macro-labyrinth. Traverse the four elemental quadrant sanctums and claim the Crown of the Prism at the central altar."
  - *Ancient Wall Inscription*: "Unite the four elemental crystals: Ruby, Emerald, Sapphire, and the Astral Apex Key to breach the final sanctuary."
  - *Collectibles*: 1 bonus item(s) (Crown of the Prism).
* **Actionable Overhaul Directives (Target: Elevate from C+ to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Episodic Story Saga: Relics of the Four Guardians

#### Level story_guardians_1: The Whispering Ruins (Ki / Shō (Ruins Initiation))
* **Package**: `levels/stories/story_guardians_1/`
* **Telemetry**: Dimensions: **11x11** | Biome: **dungeon** | Playable Area: **45%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **65%** | 3D Elements: **0** | Entities: **8** | Par: **28 steps (24 optimal, 1.17x ratio) / 17s**
* **Ground-Truth Score**: **29.53 / 80.00 (36.9% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 3.73/10)*: Inertia: 3.8/10 | Anchors: 3.6/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 2.50/10)*: Viaducts: 2.6/10 | Wall Walks: 2.4/10 | Ramps: 2.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 3.8/10 | Dynamic Shaders: 4.2/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.50/10)*: Novelty: 3.8/10 | Subversion: 3.2/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 3.53/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (65% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 3.73/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 2.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Inspect wall carvings [E], collect bonus sun gems, activate the respawn beacon, and safely bypass the flame vents."
  - *Ancient Wall Inscription*: "The Four Guardians sleep in the temple heart. Heed the stone plinths." — Explorer: "An ancient inscription... it speaks of four guardian totems."
  - *Collectibles*: 2 bonus item(s) (Sunstone Crystal, Solar Amber).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level story_guardians_2: The Falcon's Plinth (Ten (Totem Twist))
* **Package**: `levels/stories/story_guardians_2/`
* **Telemetry**: Dimensions: **11x11** | Biome: **dungeon** | Playable Area: **42%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **50%** | 3D Elements: **0** | Entities: **7** | Par: **32 steps (16 optimal, 2x ratio) / 19s**
* **Ground-Truth Score**: **28.60 / 80.00 (35.8% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 3.73/10)*: Inertia: 3.8/10 | Anchors: 3.6/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 2.50/10)*: Viaducts: 2.6/10 | Wall Walks: 2.4/10 | Ramps: 2.5/10
  * *Chair 3 (Art & Shaders: 3.93/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 3.8/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.70/10)*: Novelty: 4.4/10 | Subversion: 3.2/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.40/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 4.4/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (50% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 3.73/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 2.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 3.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.40/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Pick up the Falcon Statue [E], carry it through the labyrinth, and place it on the inscribed pedestal to unlock the courtyard gate."
  - *Ancient Wall Inscription*: "Only when the winged sentinel overlooks the winds will the gate open." — Explorer: "The inscription describes the Falcon pedestal!"
  - *Collectibles*: 2 bonus item(s) (Sky Sapphire, Gilded Feather of the Falcon).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level story_guardians_3: Sanctum of the Four Guardians (Ketsu (Quad Guardian Synthesis))
* **Package**: `levels/stories/story_guardians_3/`
* **Telemetry**: Dimensions: **15x15** | Biome: **dungeon** | Playable Area: **41%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **30%** | 3D Elements: **0** | Entities: **11** | Par: **54 steps (12 optimal, 4.5x ratio) / 33s**
* **Ground-Truth Score**: **29.47 / 80.00 (36.8% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 3.2/10 | Anchors: 4.4/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 2.50/10)*: Viaducts: 2.6/10 | Wall Walks: 2.4/10 | Ramps: 2.5/10
  * *Chair 3 (Art & Shaders: 3.93/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 3.8/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 4.20/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 4.8/10
  * *Chair 5 (Novelty & Discovery: 3.83/10)*: Novelty: 4.8/10 | Subversion: 3.2/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.40/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 4.4/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (30% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 2.50/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 3.93/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.40/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Read the riddle inscriptions on the 4 pedestals [E]. Carry and place Falcon, Lion, Serpent, and Bear into their matching plinths to unlock the Grand Sanctum Gate."
  - *Ancient Wall Inscription*: "Four guardians kept the peace of the realm. Place each where its spirit belongs." — Explorer: "The riddle verses on the four plinths will guide which statue belongs where."
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Episodic Story Saga: The Whispering Citadel (Multi-Room)

#### Level story_citadel_1: The Whispering Citadel (Multi-Act Odyssey (Courtyard -> Catacombs -> Spire))
* **Package**: `levels/stories/story_citadel_1/`
* **Telemetry**: Dimensions: **13x13** | Biome: **dungeon** | Playable Area: **66%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **43%** | 3D Elements: **0** | Entities: **4** | Par: **Tutorial / Narrative pacing**
* **Ground-Truth Score**: **37.99 / 80.00 (47.5% — C+ Tier)** — *Status: MSP Baseline ⚠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.73/10)*: Inertia: 4.8/10 | Anchors: 4.8/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.93/10)*: Viaducts: 5.2/10 | Wall Walks: 4.8/10 | Ramps: 4.8/10
  * *Chair 3 (Art & Shaders: 4.73/10)*: Biome Palette: 5/10 | 2.5D Depth: 4.8/10 | Dynamic Shaders: 4.4/10
  * *Chair 4 (Visual Storytelling: 4.67/10)*: Ruin Purpose: 4.6/10 | Environmental Clues: 4.4/10 | Sanctum Payoff: 5/10
  * *Chair 5 (Novelty & Discovery: 4.73/10)*: Novelty: 4.8/10 | Subversion: 4.8/10 | "Aha!" Discovery: 4.6/10
  * *Chair 6 (Fun, Juice & Humor: 4.47/10)*: Tactile Juice: 4/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 4.8/10
  * *Chair 7 (Tension & Suspense: 4.80/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 4.8/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (43% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.73/10).
  - **3D Verticality**: Operates on a completely flat 2D plane with zero vertical elevation or overpass mechanics (Score 4.93/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.73/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "A true multi-room dungeon. Descend into the Catacombs to retrieve the Spire Key, return to unlock the Spire Gate, and ascend to the mountain heights."
  - *Ancient Wall Inscription*: "Four winds echo through the citadel. Turn your perspective to catch their secrets."
  - *Collectibles*: 1 bonus item(s) (Courtyard Topaz).
* **Actionable Overhaul Directives (Target: Elevate from C+ to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

### Episodic Story Saga: Sunken Vaults of the Deep

#### Level story_sunken_vaults_1: The Flooded Siphon (Ki (Sluice Initiation))
* **Package**: `levels/stories/story_sunken_vaults_1/`
* **Telemetry**: Dimensions: **13x13** | Biome: **dungeon** | Playable Area: **41%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **73%** | 3D Elements: **3** | Entities: **5** | Par: **69 steps (60 optimal, 1.15x ratio) / 38s**
* **Ground-Truth Score**: **30.74 / 80.00 (38.4% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 3.93/10)*: Inertia: 4.4/10 | Anchors: 3.6/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 4.17/10)*: Viaducts: 4.4/10 | Wall Walks: 3.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.50/10)*: Novelty: 3.8/10 | Subversion: 3.2/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (73% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 3.93/10).
  - **3D Verticality**: Incorporates 1 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.17/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Retrieve the Siphon Valve Key from the southern intake pool to disengage the outflow gate."
  - *Ancient Wall Inscription*: "Depressurize the intake valve before opening the outflow conduit."
  - *Collectibles*: 1 bonus item(s) (Siphon Core Sapphire).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level story_sunken_vaults_2: The Pressure Reservoir (Shō / Ten (Flume Diversion))
* **Package**: `levels/stories/story_sunken_vaults_2/`
* **Telemetry**: Dimensions: **15x15** | Biome: **dungeon** | Playable Area: **45%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **83%** | 3D Elements: **3** | Entities: **5** | Par: **28 steps (24 optimal, 1.17x ratio) / 16s**
* **Ground-Truth Score**: **31.08 / 80.00 (38.8% — C Tier)** — *Status: Functional Draft 🔧*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.07/10)*: Inertia: 4.8/10 | Anchors: 3.6/10 | Loopbacks: 3.8/10
  * *Chair 2 (3D Verticality: 4.17/10)*: Viaducts: 4.4/10 | Wall Walks: 3.6/10 | Ramps: 4.5/10
  * *Chair 3 (Art & Shaders: 4.20/10)*: Biome Palette: 4.6/10 | 2.5D Depth: 4.6/10 | Dynamic Shaders: 3.4/10
  * *Chair 4 (Visual Storytelling: 3.80/10)*: Ruin Purpose: 3.6/10 | Environmental Clues: 4.2/10 | Sanctum Payoff: 3.6/10
  * *Chair 5 (Novelty & Discovery: 3.70/10)*: Novelty: 4.4/10 | Subversion: 3.2/10 | "Aha!" Discovery: 3.5/10
  * *Chair 6 (Fun, Juice & Humor: 3.67/10)*: Tactile Juice: 3.6/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 2.8/10
  * *Chair 7 (Tension & Suspense: 2.87/10)*: Hazard Rhythm: 2.8/10 | Sentinel Evasion: 2.6/10 | Fog Dread: 3.2/10
  * *Chair 8 (Challenge & Gating: 4.60/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 3.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (83% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.07/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.17/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.20/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.60/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "Navigate past the pulsing steam vents to retrieve the Reservoir Key in the northeastern valve terrace."
  - *Ancient Wall Inscription*: "Water pressure holds the bulkhead shut. The pressure key rests in the northeast reservoir tower."
  - *Collectibles*: 1 bonus item(s) (Pressure Pearl).
* **Actionable Overhaul Directives (Target: Elevate from C to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

#### Level story_sunken_vaults_3: The Abyssal Sanctuary (Ketsu (Deep Treasury Culmination))
* **Package**: `levels/stories/story_sunken_vaults_3/`
* **Telemetry**: Dimensions: **17x17** | Biome: **dungeon** | Playable Area: **45%** | DeadSpace $\ge 4\times 4$: **0** | Corridor Inertia: **90%** | 3D Elements: **3** | Entities: **7** | Par: **110 steps (98 optimal, 1.12x ratio) / 60s**
* **Ground-Truth Score**: **37.99 / 80.00 (47.5% — C+ Tier)** — *Status: MSP Baseline ⚠️*
* **Expert Panel 8-Chair Reality Ratings (1–10 Scale)**:
  * *Chair 1 (Spatial Architecture: 4.73/10)*: Inertia: 4.8/10 | Anchors: 4.8/10 | Loopbacks: 4.6/10
  * *Chair 2 (3D Verticality: 4.93/10)*: Viaducts: 5.2/10 | Wall Walks: 4.8/10 | Ramps: 4.8/10
  * *Chair 3 (Art & Shaders: 4.73/10)*: Biome Palette: 5/10 | 2.5D Depth: 4.8/10 | Dynamic Shaders: 4.4/10
  * *Chair 4 (Visual Storytelling: 4.67/10)*: Ruin Purpose: 4.6/10 | Environmental Clues: 4.4/10 | Sanctum Payoff: 5/10
  * *Chair 5 (Novelty & Discovery: 4.73/10)*: Novelty: 4.8/10 | Subversion: 4.8/10 | "Aha!" Discovery: 4.6/10
  * *Chair 6 (Fun, Juice & Humor: 4.47/10)*: Tactile Juice: 4/10 | Wry Architect Humor: 4.6/10 | Playful Secrets: 4.8/10
  * *Chair 7 (Tension & Suspense: 4.80/10)*: Hazard Rhythm: 4.8/10 | Sentinel Evasion: 4.8/10 | Fog Dread: 4.8/10
  * *Chair 8 (Challenge & Gating: 4.93/10)*: Zero-Bypass Gating: 5.2/10 | Entity Logic: 4.6/10 | Par Calibration: 5/10
* **Critical Gameplay & Visual Reality Critique**:
  - **Spatial Architecture**: Operates as a predominantly 1-tile wide hallway network (90% corridor inertia). While mechanically sound, it lacks grand rooms, plaza breathing space, or multi-scale room contrast (Score 4.73/10).
  - **3D Verticality**: Incorporates 0 bridge(s) and 2 ramp(s), but elevation transitions lack physical slope dynamics or camera tilt cues (Score 4.93/10).
  - **Visual Polish & Shaders**: Palettes are clean and legible, but decorative assets act as flat static decals that do not cast light cones, project dynamic shadows, or emit particle debris (Score 4.73/10).
  - **Puzzle Deductions & Gating**: While zero-bypass integrity is verified mathematically, key retrieval operates predominantly as a linear corridor fetch chore without branching dilemmas or deduction friction (Score 4.93/10).
* **Diegetic Package Lore**:
  - *Architect's Lore*: "The climax of the Sunken Vaults. Recover the Azure Key and Abyssal Pearl to breach the Sanctuary Apex."
  - *Ancient Wall Inscription*: "Water is life, memory, and path. Those who respect its depths shall never be lost in the labyrinth."
  - *Collectibles*: 1 bonus item(s) (Primal Water Core).
* **Actionable Overhaul Directives (Target: Elevate from C+ to B-Tier $\ge 55%$)**:
  1. *Eradicate Linear Fetch Chores*: Redesign key placement so retrieving a key requires choosing between divergent paths or manipulating multi-state levers rather than walking down a single dead-end hallway.
  2. *Elevate Visual Depth*: Upgrade flat static vector wall decorations to cast radial dynamic lighting on adjacent pavers, and introduce particle effects for fluids and torches.
  3. *Expand Spatial Contrast*: Break up uniform 1-tile corridor trenches with $3\times 3$ and $4\times 4$ courtyard plazas featuring distinctive architectural centerpieces.
  4. *Amplify Tactile Juice*: Implement screen punch, footstep terrain sound variations, and pickup particle bursts to reward movement and collection.

