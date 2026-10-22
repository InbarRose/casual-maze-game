# ADR-0050: The Architect's Codex, Collectible Journal Folios & Spatial Coordinate Telemetry

## Status
Accepted

## Context
Across previous iterations, narrative lore was delivered via generic wooden or stone signposts sitting as flat blocks on the floor. Hands-on evaluation revealed several friction points:
1. **Immersion & Visual Repetition**: Plain wooden markers resting on the floor broke the architectural grandeur of stone dungeons and cathedral naves.
2. **Lack of Tangible Progression**: Reading a signpost was purely ephemeral; once inspected, there was no persistent collection, codex, or achievement incentive.
3. **Missing Telemetry & Lore Tracking**: Players had no way to reference past letters or remember the geographical coordinates where each philosophical excerpt was recovered.

## Decision
We systematically overhauled the signpost system into **The Architect's Codex & Collectible Folio System** (`BL-176`):

1. **Diegetic Architectural Lecterns & Folios**:
   - Replaced flat floor blocks with carved stone plinths (`lectern_stone`), ornate wooden reading desks (`lectern_wood`), wall alcoves (`wall_niche`), and hovering enchanted manuscripts (`floating_folio`).
   - Lecterns render a 2.5D chamfered stone base, an angled shelf, an open illuminated book with curved cream parchment pages, fine ink lines, and a crimson bookmark ribbon.
   - When uncollected, the lectern emits subtle golden light pulses and orbiting dust motes. When collected, it rests in a peaceful state.

2. **Pick-Up & Collection Mechanic**:
   - Interacting with an Architect's Folio collects it into the player's permanent collection with a celestial audio chime, golden pickup particle shockwave, and floating text (`📜 Collected: [Title]`).
   - The folio is permanently marked as collected in the running session and in persistent storage.

3. **Persistent Coordinate & Metadata Tracking (`StorageManager`)**:
   - Introduced `STORAGE_KEYS.ARCHITECT_CODEX` (`casual_maze_architect_codex`).
   - Every saved folio records:
     - `id`, `title`, `author`, `text`, `style`.
     - `(X, Y, Z)` discovery coordinates and `coordString`.
     - `levelId`, `levelTitle`, `chapter`, `zone`.
     - `discoveredAtDate` (ISO timestamp) and `discoveredAtSteps`.
   - Integrated into full save profile backup (`exportSaveProfile`), import (`importSaveProfile`), emergency rollback snapshots, and profile stats (`getPlayerProfile`).

4. **The Architect's Codex Modal (`ArchitectCodexModal`)**:
   - An interactive illuminated manuscript book accessible via topbar button 📖, Pause Drawer, Profile Modal, or global hotkey <kbd>J</kbd>.
   - Features chapter tabs, directory indexing with discovery status and coordinates, illuminated initial drop-caps, aged deckle-edge styling, and an Archivist Achievements showcase.

5. **Archivist Achievements**:
   - Implemented Chapter Archivist badges (`ch1_archivist` to `ch10_archivist`) and realm milestones (`apprentice_archivist`, `journeyman_archivist`, `master_archivist`, `grand_chronicler`).

## Consequences & Verification
- **Static Compatibility**: 100% client-side vanilla ES6+ and Canvas 2D without server or runtime dependencies (GitHub Pages).
- **Test Integrity**: Validated with dedicated unit suite `tests/unit/ui/architect-codex.test.mjs` and full platform suite (`npm test`, 775 tests passing, 0 failed).
- **Drift Protection**: All 23 drift checks in `tests/validate-drift.mjs` pass cleanly (`0 failed`).
