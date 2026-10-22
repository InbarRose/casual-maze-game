# ADR-0057: Chapter 6 Arcane Enigmas Rigor, Puzzle Gates, Cipher Dials & Scriptorium Labyrinth Topology

## Status
Accepted

## Context
Following the successful completion and merging of Chapter 1 (ADR-0049), Chapter 2 (ADR-0053), Chapter 3 (ADR-0054), Chapter 4 (ADR-0055), and Chapter 5 (ADR-0056), work advances to Phase 7 of the Game-Wide Rigor Master Plan ([`master_rigor_art_and_codex_overhaul_plan.md`](../master_rigor_art_and_codex_overhaul_plan.md), `BL-183`).

Chapter 6 ("Arcane Enigmas", Levels 21–24: "The Rune Lock", "The Cipher Dials", "The Entangled Wards", "The Grand Archive") introduces the engine's interactive minigame puzzle gates in the Crypt/Arcane biome:
- Rune Memory puzzle gates (`puzzleType: "rune_memory"`): sequence-matching ancient glyphs.
- Stellar Cipher Dials (`puzzleType: "cipher_dial"`): rotational symbol alignment.
- Entangled dual wards requiring sequential solution across distinct scriptorium wings.
- Full mechanical synthesis on Chapter climax Level 24 under strategic Fog of War (`fogOfWar: true`, `viewRadius: 7`) combining Rune Memory, Cipher Dial, Golden Key, and Stargazer Barrier Lever.

Prior to this overhaul, an automated metrics audit (`scripts/audit-level-metrics.mjs`) revealed significant quality gaps in Chapter 6:
1. **Low Corridor Inertia (28%–46%)**:
   - Level 21: **38% inertia** (broad rotunda halls around central rune gate).
   - Level 22: **34% inertia** (wide open dial gallery).
   - Level 23: **28% inertia** (lowest in middle game; fractured chambers).
   - Level 24: **46% inertia** (sprawling open scriptorium arena).
2. **Flat Floor Markers**: Spawns and exits utilized generic flat circles rather than architectural North wall drop-face doorways (`wall_doorway`, `north`) with ascending stairs and subterranean archways (`wall_archway`, `north`) with descending stairs.
3. **Floating Lore Signs**: Notes were floating flat signs on the floor rather than stone lecterns (`style: "lectern_stone"`) recording discovery coordinates `(X, Y, Z)` for the Architect's Codex (ADR-0050).
4. **Mechanical Clues in Lore Signs**: Cipher clues and secret wall hints were placed in lore text rather than diegetic wall art (stone bas-reliefs and bronze runic plates, ADR-0051).

## Decision

We systematically re-engineer all four stages of Chapter 6 (Levels 21–24) to enforce rigorous 1-tile winding labyrinth topology ($\ge 70\%$ corridor inertia, 0 dead spaces $\ge 4\times 4$), 100% zero-bypass gating solvability, stone lecterns, and diegetic wall art.

### 1. Level 21: "The Rune Lock" (15 × 13, Crypt/Arcane Biome) — Ki (Introduction)
- **Concept**: Introductory arcane puzzle. The adventurer navigates winding basalt scriptorium corridors to encounter the ancient Rune Memory gate, solving its four-glyph sequence to unlock the northern sanctum.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Rune Memory Gate**:
  - `puzzle_gate_21` at `(7, 7, 0)` (`puzzleType: "rune_memory"`, `solution: [0, 2, 1, 3]`).
  - Strict zero-bypass: Solving with `allowPuzzles: false` mathematically yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway (`wall_doorway`, `north`) at `(3, 1, 0)`.
  - Exit: North wall subterranean archway (`wall_archway`, `north`) at `(13, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 3, 0)` housing Architect's Note #21 with coordinates `(1, 3, 0)`.
  - Wall fresco at `(3, 4, 0)` depicting the four primary astral runes.
  - Bronze runic plate at `(10, 11, 0)` hinting secret wall concealing Arcane Rune Shard (`secret_gem_21`, 300 pts).
- **Calibration**: Optimal BFS solution $\ge 30$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 2. Level 22: "The Cipher Dials" (17 × 15, Crypt/Arcane Biome) — Shō (Development)
- **Concept**: Introduction of Cipher Dial rotational puzzles and colored key gating. The adventurer winds through the planetary observatory to align the three concentric cipher rings, then claims the Azure Key to unlock the final archivist vault.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Cipher Dial & Azure Gate**:
  - `puzzle_gate_22` at `(8, 7, 0)` (`puzzleType: "cipher_dial"`, `solution: [0, 1, 2]`).
  - Azure Key (`key_azure_22`) at `(8, 4, 0)` unlocking Azure Gate (`door_azure_22`) at `(15, 3, 0)`.
  - Strict zero-bypass: Omitting cipher dial, key, or door yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)`.
  - Exit: North wall subterranean archway at `(15, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(8, 7, 0)` housing Architect's Note #22 with coordinates `(8, 7, 0)`.
  - Wall bas-reliefs illustrating Sun, Moon, and Horizon celestial alignments.
  - Bronze runic plate at `(11, 13, 0)` hinting Astrolabe Shard (`secret_gem_22`, 350 pts).
- **Calibration**: Optimal BFS solution $\ge 50$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 3. Level 23: "The Entangled Wards" (19 × 15, Crypt/Arcane Biome) — Ten (Twist)
- **Concept**: Entangled multi-puzzle synthesis and hydraulic dynamo lever. Outer Rune Ward protects the southern conduit switch; toggling the dynamo lever lowers the foundation gate to reach the Inner Cipher Ward protecting the sanctum exit.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Entangled Wards Mechanics**:
  - Outer Rune Ward (`puzzle_gate_23_rune`) at `(7, 7, 0)` (`solution: [2, 0, 3, 1]`).
  - Conduit Lever (`lever_23`) toggling foundation barrier gate at `(13, 9, 0)`.
  - Inner Cipher Ward (`puzzle_gate_23_cipher`) at `(15, 5, 0)` (`solution: [2, 1, 3]`).
  - Strict zero-bypass: Omitting either puzzle gate or the lever mathematically yields `null`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)`.
  - Exit: North wall subterranean archway at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(1, 7, 0)` housing Architect's Note #23 with coordinates `(1, 7, 0)`.
  - Wall carvings depicting the entangled harmonic resonances.
  - Bronze runic plate at `(13, 13, 0)` hinting Chronosphere Gem (`secret_gem_23`, 400 pts).
- **Calibration**: Optimal BFS solution $\ge 50$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

### 4. Level 24: "The Grand Archive" (21 × 19, Crypt/Arcane Biome) — Ketsu (Climax)
- **Concept**: Grand chapter finale operating under strategic Fog of War (`viewRadius: 7`). Four-quadrant scriptorium synthesizing Rune Memory, Cipher Dial, Stargazer Dynamo Lever, Golden Archive Key, and Golden Gate.
- **Topology**: 1-tile winding labyrinth with $\ge 70\%$ corridor inertia and zero dead space $\ge 4\times 4$.
- **Archive Culmination Mechanics**:
  - Scriptorium Rune Seal (`puzzle_gate_24_rune`) at `(9, 5, 0)`.
  - Stargazer Dynamo Lever (`lever_24_archive`) at `(1, 17, 0)` lowering central dividing bulkhead.
  - Stargazer Cipher Dial (`puzzle_gate_24_cipher`) at `(11, 11, 0)`.
  - Master Archive Golden Key (`key_gold_24`) at `(19, 17, 0)` unlocking Golden Archive Gate (`door_gold_24`) at `(17, 3, 0)`.
  - Strict sequential zero-bypass: Every obstacle must be cleared in order to reach the exit archway at `(17, 1, 0)`.
- **Architectural Portals**:
  - Entrance: North wall drop-face doorway at `(3, 1, 0)`.
  - Exit: North wall subterranean archway at `(17, 1, 0)`.
- **Codex & Diegetic Art**:
  - Stone lectern at `(10, 17, 0)` housing Architect's Note #24 with coordinates `(10, 17, 0)`.
  - Wall carving depicting the Grand Orrery and Celestial Compass.
  - Bronze runic plate hinting Astral Codex Shard (`secret_gem_24`, 500 pts).
- **Calibration**: Optimal BFS solution $\ge 70$ steps; calibrated par = $\lceil\text{optimal} \times 1.15\rceil$.

## Consequences & Verification
- **Static Compatibility**: 100% static vanilla web execution with zero server dependencies (GitHub Pages).
- **Automated Test Integrity**: All 156 test suites and existing unit/integration tests must pass cleanly (`0 failed`).
- **Drift Protection**: `npm run validate:drift` must maintain 23/23 passing checks.
- **Level Package Alignment**: All 4 levels compiled into modular packages under `levels/chapter_6/level_X/`.
- **Telemetry Verification**: Corridor directional inertia elevated from 28%–46% to $\ge 70\%$, with 0 dead spaces $\ge 4\times 4$.
