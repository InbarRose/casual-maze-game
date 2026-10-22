# ADR-0061: Chapter 10 Prismatic Apex Rigor, Concentric Trestles, Harmonic Forcefields & Chromatic Culmination

## Status
Accepted

## Context
Following the completion of Chapter 9 (ADR-0060), work advances to Phase 10B of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-186`).

Chapter 10 ("The Prismatic Labyrinth", Levels 37–40: "The Spectral Gate", "Concentric Trestles", "Harmonic Mirror Seals", "Heart of the Prism") represents the climax and grand finale of the 40-level main campaign in the Prismatic biome:
- Chromatic refraction barriers and dual spectral keys (Amber & Violet).
- Multi-elevation crystal trestles and viaduct overpasses requiring $\ge 35$ elevated steps at $Z=1$, directional ramps (`R_E`, `R_W`), and battlement wall-walks (`TILES.WALL_WALK`).
- Resonant harmonic mirror tuning levers, astral teleporters (`portal_harmonic_a`, `portal_harmonic_b`), and concentric forcefields.
- The 4-quadrant macro-puzzle climax (29 × 29) on Level 40 demanding sequential unsealing of Ruby, Emerald, Sapphire, and Apex Prismatic Core chambers guarded by the Apex Colossus.

Prior to this overhaul, an architectural audit identified key quality gaps:
1. **Missing Architect Folios & Stone Lecterns**: None of the Chapter 10 levels featured stone lecterns (`style: "lectern_stone"`) housing collectible lost folios with persistent coordinate tracking `(X, Y, Z)` for the Architect's Codex (ADR-0050, BL-176), leaving the Chapter 10 "Prism Cartographer" and Campaign "Master Campaign Archivist" achievements unachievable.
2. **Inconsistent Spawn Portal Styling**: Level 39 retained a legacy `floor_symbol` spawn rather than an authentic North wall drop-face doorway (`wall_doorway`, `north`).
3. **Polymorphic Entity Handling**: The engine loop lacked explicit support for `architect_note` entity types in `createEntities`, requiring unified mapping to `Signpost`.

## Decision

We systematically finalize and solidify all four stages of Chapter 10 (Levels 37–40) to enforce rigorous 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, measured 80%–90%, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone folio lecterns with coordinates, diegetic wall art, authentic entrance doorways, and full playthrough compatibility.

### 1. Level 37: "The Spectral Gate" (23 × 23, Prismatic Biome) — Ki (Introduction)
- **Concept**: Introduction to chromatic key frequencies and bottleneck spectral barriers. The explorer navigates the western refraction gallery to claim the Amber Crystal Key (`key_amber_37` at `(3, 7)`), passes the Amber Spectral Barrier (`door_amber_37` at `(5, 11)`), traverses the Astral Rift teleporter (`portal_spectral_a` at `(3, 21)` to `portal_spectral_b` at `(15, 14)`), ascends the elevated viaduct platform to align the Refraction Focal Lever (`lever_refraction_37` at `(15, 7, 1)`), claims the Violet Crystal Key (`key_violet_37` at `(17, 18)`), and breaches the Violet Prismatic Gate (`door_violet_37` at `(21, 5)`).
- **Topology**: 1-tile winding labyrinth with 85% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Requires `key_amber_37` (unsolvable without it).
  - Deceptive secret wall at `(1, 19)` concealing Prismatic Diamond (`gem_secret_37`, 250 pts).
  - Elevated viaduct platforms (`TILES.PLATFORM` overhead) and astral rifts.
- **Architectural Portals & Folio**:
  - Entrance: North wall doorway (`wall_doorway`, `north`) at `(1, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(21, 1, 0)`.
  - Stone lectern at `(1, 4, 0)` housing Architect's Folio #37 with coordinates `(1, 4, 0)`.
  - Diegetic bronze plaque at `(1, 3, 0)` explaining chromatic refraction.
- **Calibration**: Optimal BFS solution = 75 steps; calibrated par = 87 steps (`Math.ceil(75 * 1.15)`).

### 2. Level 38: "Concentric Trestles" (25 × 25, Prismatic Biome) — Shō (Development)
- **Concept**: Multi-elevation crystalline overpasses and directional ramps over sunken chasms. The adventurer ascends directional ramps (`TILES.RAMP_E` at `(6, 12)`), traverses elevated viaduct battlements (`TILES.WALL_WALK`) and overhead bridges (`TILES.BRIDGE_NS` at `(12, 7)`), toggles the battlement focal lever (`lever_trestle_38` at `(5, 2, 1)`), navigates to the eastern court to claim the Prism Keystone (`key_prism_38` at `(18, 7)`), and descends into the central court to unseal the Inner Sanctum Gate (`door_prism_38` at `(12, 10)`).
- **Topology**: 1-tile winding labyrinth with 80% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Over 50% of the optimal path (41 steps out of 81, well exceeding the $\ge 35$ contract) is elevated at $Z=1$.
  - Strict zero-bypass: unsolvable without lever and prism key.
  - Secret wall guarding Celestial Tourmaline (`gem_secret_38` at `(23, 1)`).
- **Architectural Portals & Folio**:
  - Entrance: North wall doorway (`wall_doorway`, `north`) at `(1, 1, 0)`.
  - Exit: Central Apex Altar pedestal (`style: "pedestal"`) at `(12, 12, 0)`.
  - Stone lectern at `(1, 3, 0)` housing Architect's Folio #38 with coordinates `(1, 3, 0)`.
  - Trestle diagram plaque at `(1, 4, 0)`.
- **Calibration**: Optimal BFS solution = 81 steps; calibrated par = 94 steps (`Math.ceil(81 * 1.15)`).

### 3. Level 39: "Harmonic Mirror Seals" (27 × 27, Prismatic Biome) — Ten (Twist)
- **Concept**: Resonant mirror harmonics and concentric forcefield traps. The player activates the southern Harmonic Mirror Lever (`lever_harmonic_39` at `(3, 25)`), rides the Harmonic Rift teleporter (`portal_harmonic_a` at `(14, 25)` to `portal_harmonic_b` at `(25, 13)`), claims the Silver Harmonic Key (`key_silver_39` at `(24, 13)`), and penetrates the central concentric forcefield (`door_silver_39` at `(13, 11)`).
- **Topology**: 1-tile winding labyrinth with 86% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Requires `key_silver_39` (unsolvable without it).
  - Secret wall at `(22, 4)` (`ground[4][22] === TILES.SECRET_WALL`) concealing Harmonic Moonstone (`gem_secret_39` at `(24, 4)`).
  - Elevated viaduct platforms overhead and astral teleporters.
- **Architectural Portals & Folio**:
  - Entrance: Upgraded to North wall doorway (`wall_doorway`, `north`) at `(1, 1, 0)`.
  - Exit: Central Heart Portal pedestal (`style: "pedestal"`) at `(13, 13, 0)`.
  - Stone lectern at `(1, 3, 0)` housing Architect's Folio #39 with coordinates `(1, 3, 0)`.
  - Harmonic Mirror inscription plaque at `(1, 3, 0)` facing east.
- **Calibration**: Optimal BFS solution = 76 steps; calibrated par = 88 steps (`Math.ceil(76 * 1.15)`).

### 4. Level 40: "Heart of the Prism" (29 × 29, Prismatic Biome) — Ketsu (Climax Finale)
- **Concept**: The grand 4-quadrant chromatic macro-puzzle climax. The explorer must systematically conquer all four quadrants of the mega-maze:
  1. Northwest: Ruby Shard Key (`key_ruby_40` at `(7, 7)`) unseals the Ruby Barrier (`door_ruby_40` at `(14, 1)`).
  2. Northeast: Emerald Shard Key (`key_emerald_40` at `(21, 7)`) unseals the Emerald Barrier (`door_emerald_40` at `(27, 14)`).
  3. Southeast: Sapphire Shard Key (`key_sapphire_40` at `(21, 21)`) unseals the Sapphire Barrier (`door_sapphire_40` at `(14, 27)`).
  4. Southwest: Apex Prismatic Core (`key_apex_40` at `(7, 21)`) unseals the final Gateway of the Prism (`door_apex_40` at `(13, 14)`).
- **Topology**: 1-tile winding mega-labyrinth with 90% corridor inertia and 0 dead space $\ge 4\times 4$.
- **Mechanics & Zero-Bypass**:
  - Requires all 4 keys in sequence.
  - Features Prismatic Apex Colossus patroller navigating perimeter corridors.
  - Multi-elevation bridge overpasses and wall-walk battlements spanning chasm channels.
  - Secret wall concealing the Crown of the Prism (`gem_apex_secret` at `(27, 3)`).
- **Architectural Portals & Folio**:
  - Entrance: North wall doorway (`wall_doorway`, `north`) at `(1, 1, 0)`.
  - Exit: Central Heart of the Prism altar pedestal (`style: "pedestal"`) at `(14, 14, 0)`.
  - Stone lectern at `(1, 4, 0)` housing Architect's Folio #40 with coordinates `(1, 4, 0)`.
  - Sovereign Codex plaque at `(1, 3, 0)`.
- **Calibration**: Optimal BFS solution = 165 steps; calibrated par = 190 steps (`Math.ceil(165 * 1.15)`).

### 5. Engine OOP Polymorphism
- Updated `js/engine/game-loop.js` so that `createEntities` handles both `ENTITY_TYPES.SIGNPOST` and `architect_note` polymorphically as `new Signpost(e)`.
- Updated interaction candidate dispatch to recognize both identifiers, ensuring all 40 campaign folios record accurately into `StorageManager.saveArchitectFolio` upon inspection.

## Consequences

- **100% Campaign Rigor Completed**: All 40 campaign levels (Chapters 1 through 10) now strictly conform to the 1-tile winding corridor inertia standard ($\ge 70\%$, 0 dead spaces $\ge 4\times 4$), North wall doorways, stone lecterns with coordinates, and zero-bypass solvability.
- **Folio Completion**: All 40 campaign Architect's Folios can now be discovered and preserved in the Architect's Codex modal (hotkey `J`).
- **Zero Test Regressions**: All 778 automated tests in `npm test` pass with 0 failures; all 23 drift verification checks in `npm run validate:drift` pass.
- **Pure Static Compatibility**: Remains 100% client-side compatible with GitHub Pages.
