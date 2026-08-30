# 0003. Tutorial Academy, In-Game Hint System, and Level Design Toggles

Date: 2026-08-30

## Status
Accepted

## Context
As the game evolved with multi-elevation bridges, levers, and fog-of-war mechanics, newcomers needed a gradual learning curve introducing mechanics one at a time. Furthermore, level designers required flexible toggles for fog-of-war presence, field-of-view radius, initial map layout visibility (memory mode), and multi-colored key/door configurations.

## Decision
1. **Progressive Tutorial Academy**: Created a structured 6-level introductory curriculum (`tutorial_1` to `tutorial_6`) ranging from simple movement to full puzzle integration, backed by `TUTORIAL_PROGRESS` in `localStorage`.
2. **Contextual In-Game Help & Hints**: Extended the level schema with optional `help: { title, message }` metadata, rendered as an unobtrusive, collapsible HUD banner and accessible anytime via the hint button.
3. **Level Design Toggles**:
   - `config.fogOfWar` (Boolean): Controls whether darkness and line-of-sight raycasting are active.
   - `config.viewRadius` (Number): Sets tile sight distance for raycasting.
   - `config.mapRevealed` (Boolean): When enabled with fog-of-war, initializes all tiles to `FOG_STATE.EXPLORED` (1) so maze geometry/walls are visible on the map while dynamic entities remain shrouded until line-of-sight.
4. **Multi-Colored Keys & Doors**: Formalized `KEY_COLORS` (`GOLD`, `RED`, `BLUE`, `GREEN`, `PURPLE`) with explicit color matching between keys and doors, and rendered color-coded inventory pills in HUD.
5. **Architect Integration & Starter Templates**: Added editor toggles for map memory mode and custom help messages, alongside instant remixable tutorial starter templates in the Projects modal.

## Consequences
### Positive
* Smooth onboarding experience with zero friction.
* Richer puzzle variety with customizable fog memory and multi-gate color locking.
* Level creators can easily remix and test tutorial puzzles in the editor.
* Maintains 100% static compatibility with zero backend requirements.

### Negative / Trade-offs
* Requires maintaining level definitions in both standalone JSON files and fallback modules.
