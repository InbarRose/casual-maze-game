# ADR-0063: Note Collection Despawning, Tabbed Inventory Journal & Level-Scoped Item Prominence

## Status
Accepted

## Date
2026-10-24

## Context & Problem Statement
During gameplay feedback, two related inventory and world-interaction concerns were identified:
1. **Persistent Read Notes**: Reading or collecting The Architect's journal folios (`Signpost` entity) did not remove them from the visual map or physical runtime state. They remained indefinitely on the floor, causing player confusion over whether they had already been collected or needed to be re-read.
2. **Unfiltered Inventory Clutter**: The primary HUD quick-bar displayed every key or item held by the player without distinguishing between the current chamber/level and items lingering from prior chapters or past levels. In multi-level progression, this created visual noise and made it unclear which items were functional for the active chamber puzzle.
3. **Flat Inventory Model**: The inventory lacked a structured, dedicated space for reading collected folios, letters, and lore entries in one cohesive place.

## Decision
1. **Note Collection & Despawning (`Signpost` & `GameLoop`)**:
   - Collecting a note/folio marks `entity.collected = true` and `entity.isCollected = true`.
   - `Signpost.render()` returns immediately when collected, eliminating it completely from canvas and minimap rendering.
   - `Signpost.canInteract()` returns false once collected, preventing redundant interaction prompts.
   - `GameLoop.executeInteraction()` removes the entity from `this.entities` and `this.level.entities`, emits `folio:collected`, and records the folio in `player.addFolio(data)`.
2. **Player Journal Model (`Player`)**:
   - Added `player.journalFolios` (array of collected folio objects with id, title, text, author, level, coordinates, and timestamp) and `player.collectedFolioIds` (`Set` for deduplication).
   - Added methods `addFolio(folio)`, `getJournalFolios()`, and `hasFolio(folioId)`.
   - Preserved `player.inventory` as an array of key IDs to ensure 100% backward compatibility with all collision, solver, and progression suites.
3. **Tabbed Inventory & Journal Modal (`maze.html`)**:
   - Unified `#journal-modal` into a comprehensive three-tab modal:
     - **Tab 1: Active Inventory**: Prominently displays keys and equipment relevant to the active chamber. Separately displays archived items from previous chambers under an "Inactive" archive section.
     - **Tab 2: Architect's Journal**: Discovered folios list and parchment reader with coordinates, author, and text.
     - **Tab 3: Relics & Codex**: Story trophies and socketable riddle relics.
   - Accessible via clicking `#hud-inventory-card` or pressing `[I]` (Inventory) or `[J]` (Journal), or clicking the HUD `📜 X Folios` pill.
4. **Level-Scoped Prominence in HUD Quick-Bar**:
   - The HUD top bar filters keys against `currentLevel.entities`, displaying only keys and tools relevant to the active level.

## Consequences & Verification
- Notes disappear upon collection with celebratory golden motes, shockwaves, and floating text, giving immediate satisfying feedback.
- Players can review all collected folios at any time in their Architect's Journal.
- The HUD quick-bar is uncluttered and shows only immediately relevant items.
- All 787 tests in `tests/run-all.mjs` pass (0 failed); 23/23 drift checks pass.
