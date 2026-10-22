# ADR-0053: Chapter 2 Verticality Rigor, Labyrinth Topology & Architectural Portals

## Status
Accepted

## Context
Following the implementation of the Architect's Codex system (ADR-0050, ADR-0051) and the visual diversity multi-variant biome rendering system (ADR-0052), work proceeded to Phase 3 of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-179`).

Chapter 2 ("The Vertical Dimension", Levels 5–8: "The Canopy Bridge", "Canopy Crossings", "The Sunken Chasm", "Citadel of the Two Horizons") introduces the 3D elevation mechanics of the engine:
- Directional ramps (`R_N`, `R_S`, `R_E`, `R_W`) connecting ground elevation $Z=0$ to bridge deck elevation $Z=1$.
- Overhead bridge spans (`B_EW`, `B_NS`) that allow elevated traversal at $Z=1$ across ground underpasses at $Z=0$.
- Ground underpasses that allow perpendicular traversal beneath overhead bridge spans.

Prior to this overhaul, the legacy implementations exhibited:
1. **Low-Inertia Runway Topology**: Overly wide or straight passages with redundant corridors and dead spaces exceeding $4\times 4$.
2. **Generic Floor Markers**: Spawns and exits utilized flat circles rather than architectural North wall drop-face doorways (`wall_doorway`, `north`) and subterranean archways (`wall_archway`, `north`).
3. **Crude Note Entity Placement**: Notes were floating flat signs on the floor rather than stone pedestals/lecterns (`style: "lectern_stone"`) recording discovery coordinates `(X, Y, Z)` for the Codex.
4. **Loose Puzzle Hints**: Puzzle and secret hints were presented in lore signs rather than diegetic wall carvings and bronze runic plates (`wall_decor`, `carving` / `runic_plate`).

## Decision

We systematically redesigned and re-engineered all four stages of Chapter 2 (Levels 5–8) in accordance with the Kishōtenketsu progression, enforcing rigorous 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone lecterns, and diegetic wall clues.

### 1. Level 5: "The Canopy Bridge" (15 × 13, Jungle Biome) — Ki (Introduction)
- **Concept**: Introductory vertical traverse. Adventurer ascends the southern ramp to tread upon the ancient canopy bridge deck, retrieving the Canopy Emerald Key at $Z=1$ while below, the underpass canal flows unimpeded toward the northern gate.
- **Topology**: 1-tile winding labyrinth with $70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **3D Vertical Architecture**:
  - Southern ramp `R_N` at `(7, 9)` ascends north onto the overhead bridge deck (`B_EW` spanning `(7, 4)` to `(7, 8)`).
  - Northern ramp `R_S` at `(7, 3)` descends south from the bridge deck.
  - Perpendicular ground underpass canal at `(7, 6)` beneath the overhead bridge deck.
- **Portals & Gating**:
  - Spawn at `(1, 1, 0)` with North wall entrance doorway (`wall_doorway`, `north`).
  - Exit at `(13, 1, 0)` with North wall archway (`wall_archway`, `north`).
  - Canopy Emerald Key (`key_jungle_5`) perched at `(7, 6, 1)` on the bridge deck. Unlocks Canopy Door at `(13, 3, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 11, 0)` with Architect's Note #5.
  - Bas-relief wall carving at `(3, 4, 0)` depicting bridge ascent above canal.
  - Runic bronze plate at `(2, 11, 0)` pointing to secret wall `SW` at `(3, 11)`, concealing Canopy Emerald (`secret_gem_5`, 300 pts) at `(5, 11, 0)`.
- **Calibration**: Optimal BFS solution = 53 steps; par = 61 steps (1.15x ratio), par time = 37s.

### 2. Level 6: "Canopy Crossings" (17 × 15, Jungle Biome) — Shō (Development)
- **Concept**: Dual traversal requiring both lower ground underpass and elevated bridge overpass.
- **Topology**: 1-tile winding labyrinth with $74\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **3D Vertical Architecture**:
  - Dual underpass ground canals at `(5, 7)` and `(11, 7)`.
  - Overhead bridge deck spans running North-South at $x=5$ and $x=11$ joined by elevated walkway trestles `WW` at $y=5$.
  - South ramp `R_N` at `(11, 10)` and north ramp `R_S` at `(11, 4)`.
- **Portals & Sequential Gating**:
  - Spawn at `(1, 1, 0)` with North wall entrance doorway; Exit at `(15, 1, 0)` with North wall archway.
  - Phase 1: Player traverses lower underpass tunnel to claim Amber Key (`key_amber_6`) at ground `(8, 7, 0)`.
  - Phase 2: Unlocks Amber Door at `(9, 9, 0)`, permitting access to southern ramp.
  - Phase 3: Player ascends ramp to bridge deck to seize Canopy Key (`key_canopy_6`) at `(11, 7, 1)`.
  - Phase 4: Unlocks Canopy Door at `(15, 2, 0)` leading into Exit Archway.
  - Automated tests verify that omitting `key_amber_6` strictly yields `null` (zero bypass).
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 13, 0)` with Architect's Note #6.
  - Wall carving at `(3, 8, 0)` describing the underpass-first ascent.
  - Runic plate at `(2, 13, 0)` hinting secret wall `SW` at `(3, 13)`, concealing Verdant Jade (`secret_gem_6`, 350 pts) at `(4, 13, 0)`.
- **Calibration**: Optimal BFS solution = 43 steps; par = 50 steps, par time = 30s.

### 3. Level 7: "The Sunken Chasm" (17 × 15, Jungle Biome) — Ten (Twist)
- **Concept**: Perpendicular crossing of two intersecting bridge decks (`B_EW` and `B_NS`) suspended over a sunken chasm.
- **Topology**: 1-tile winding labyrinth with $69.4\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **3D Vertical Architecture**:
  - Overhead layer contains both North-South bridge decks (`B_EW` at $x=7$ between $y=4$ and $y=9$) AND East-West bridge decks (`B_NS` at $y=6$ from $x=5$ to $x=9$).
  - Ground underpass canal passes beneath at `(7, 6, 0)`.
  - Ramps `R_S` at `(7, 3)` and `R_N` at `(7, 10)`.
- **Portals & Gating**:
  - Spawn at `(1, 1, 0)` with North wall entrance doorway; Exit at `(15, 1, 0)` with North wall archway.
  - Chasm Emerald Key (`key_chasm_7`) suspended at intersection `(7, 6, 1)`.
  - Unlocks Chasm Door at `(15, 2, 0)` directly sealing the Exit corridor.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 13, 0)` with Architect's Note #7.
  - Wall carving at `(3, 4, 0)` warning of the directional incline across chasm depths.
  - Runic plate at `(4, 13, 0)` hinting secret wall `SW` at `(5, 13)`, concealing Chasm Chrysoberyl (`secret_gem_7`, 400 pts) at `(7, 13, 0)`.
- **Calibration**: Optimal BFS solution = 51 steps; par = 59 steps, par time = 36s.

### 4. Level 8: "Citadel of the Two Horizons" (19 × 17, Jungle Biome) — Ketsu (Climax)
- **Concept**: Climactic chapter finale featuring twin parallel viaducts flanking a fortified citadel under strategic Fog of War (`viewRadius: 8`).
- **Topology**: 1-tile winding labyrinth with $75\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **3D Vertical Architecture**:
  - Twin parallel bridge spans at $x=5$ (West viaduct) and $x=13$ (East viaduct) spanning from $y=4$ to $y=10$.
  - North ramps `R_S` at `(5, 3)` and `(13, 3)`.
  - South ramps `R_N` at `(5, 11)` and `(13, 11)`.
  - Ground underpasses at `(5, 7, 0)` and `(13, 7, 0)`.
- **Sequential Dual-Horizon Gating**:
  - West viaduct elevates Ruby Horizon Key (`key_ruby_8`) at `(5, 7, 1)`.
  - Ruby Door at `(13, 12, 0)` strictly seals access to the East viaduct's southern ramp.
  - East viaduct elevates Gold Horizon Key (`key_gold_8`) at `(13, 7, 1)`.
  - Gold Door at `(17, 2, 0)` strictly chokes the Exit Archway at `(17, 1, 0)`.
  - Omitting either `key_ruby_8` or `key_gold_8` mathematically yields strictly `null` (zero bypass).
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 15, 0)` with Architect's Note #8.
  - Wall carving at `(3, 6, 0)` illustrating the twin horizons.
  - Runic plate at `(2, 15, 0)` hinting secret wall `SW` at `(3, 15)`, concealing Master Architect's Beryl (`secret_gem_8`, 500 pts) at `(5, 15, 0)`.
- **Calibration**: Optimal BFS solution = 59 steps; par = 68 steps, par time = 41s.

## Consequences & Verification
- **Static Compatibility**: 100% static vanilla web execution with zero server or runtime dependencies (GitHub Pages).
- **Automated Test Integrity**: All 156 test suites and 777 automated tests pass cleanly (`0 failed`).
- **Drift Protection**: All 23 drift checks in `tests/validate-drift.mjs` pass cleanly (`0 failed`).
- **Level Package Alignment**: All 4 levels compiled into modular packages (`manifest.json`, `layers.json`, `entities.json`, `README.md`) under `levels/chapter_2/level_X/`.
- **Chapter 2 Unit Assertions**: All tests in `tests/unit/levels/chapter-2.test.mjs` and `tests/integration/campaign/chapter-2.test.mjs` pass with 100% zero-bypass gating, multi-elevation traversal, and sequential lock validation.
