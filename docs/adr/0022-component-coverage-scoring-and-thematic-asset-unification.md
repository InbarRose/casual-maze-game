# 0022. Platform Component Audit Test Coverage, Subsystem Quality Scoring & Thematic Asset Unification

Date: 2026-10-10

## Status
Accepted

## Context
Across previous architectural milestones, the game expanded to 19 platform components (`CMP-01` to `CMP-19`), 42 official campaign/storyline/tutorial levels, and 6 core visual themes. However, three architectural gaps emerged:
1. **Thematic Asset Gaps**: Level authors used sub-theme and regional biome descriptors (`lava`, `volcano`, `snow`, `frost`, `ice`, `cave`, `crypt`, `caves`, `sunset`, `citadel`, `astral`, `canopy`) that lacked dedicated SVG vector asset bundles in `assets/manifest.json`, causing occasional fallback or missing graphic rendering.
2. **Component Test Suite Granularity**: While journey tests and UI unit tests verified broad behavior, platform components lacked 1:1 dedicated, audited test suites under `tests/unit/components/` that rigorously test every menu, button, mode, and phase described in `docs/COMPONENT_AUDIT_RUBRIC.md`.
3. **Subsystem & Level Quality Scoring Register Alignment**: The platform lacked complete, traceable quality scoring registers assessing every component and level against the 6-Chair simulated expert panel rubric, as well as an in-engine scoring calculation formula for par steps, par time, secrets, and medals.

## Decision
1. **Thematic Biome Asset Unification (`BIOME_FAMILIES`)**:
   - Establish canonical `BIOME_FAMILIES` mapping in `js/core/constants.js` and `js/core/asset-loader.js`:
     - `dungeon`: `['dungeon', 'caves', 'cave', 'crypt', 'blueprint']`
     - `jungle`: `['jungle', 'emerald', 'canopy']`
     - `magma`: `['magma', 'lava', 'volcano']`
     - `glacial`: `['glacial', 'snow', 'frost', 'ice']`
     - `temple`: `['temple', 'sunset', 'citadel', 'astral']`
   - In `AssetLoader.prototype.resolvePath(idOrPath)`, automatically alias sub-theme asset keys (e.g. `tile_floor_lava` $\to$ `tile_floor_magma`, `tile_wall_cave` $\to$ `tile_wall_dungeon`) so levels with similar areas share high-fidelity vector tiles, walls, bridges, doors, and floor shaders.
   - In `AssetLoader.prototype.preloadTheme(theme)`, resolve the biome family via `getBiomeFamily(theme)` to ensure complete visual readiness on level boot.

2. **Dedicated Component Test Suites (`tests/unit/components/`)**:
   - Implement dedicated component test suites matching the `CMP-XX` audit rubric:
     - `tests/unit/components/cmp-01-app-shell.test.mjs` (CMP-01)
     - `tests/unit/components/cmp-05-06-hud-and-action-feedback.test.mjs` (CMP-05, CMP-06)
     - `tests/unit/components/cmp-07-pause-and-victory.test.mjs` (CMP-07)
     - `tests/unit/components/cmp-08-10-editor-studio.test.mjs` (CMP-08, CMP-09, CMP-10)
     - `tests/unit/components/cmp-11-asset-pipeline-and-scoring.test.mjs` (CMP-11)
     - `tests/unit/components/cmp-14-profile-and-progression.test.mjs` (CMP-14)
     - `tests/unit/components/cmp-15-settings-system.test.mjs` (CMP-15)
     - `tests/unit/components/cmp-16-18-guide-and-feedback.test.mjs` (CMP-16, CMP-18)
     - `tests/unit/components/cmp-17-diagnostic-lab-theater.test.mjs` (CMP-17)

3. **Subsystem & Level Quality Scoring Documentation**:
   - Document comprehensive evaluations across all 19 application components in `docs/COMPONENT_SCORING_REGISTER.md` and all 42 campaign levels in `docs/LEVEL_SCORING_REGISTER.md`.
   - Validate in-engine performance scoring formulas across flawless runs, par metrics, and medal thresholds in automated unit test suites.

## Consequences
### Positive
* Zero visual missing-asset fallbacks across all campaign chapters and custom editor maps.
* Complete traceability between the component rubric (`docs/COMPONENT_AUDIT_RUBRIC.md`), scoring register (`docs/COMPONENT_SCORING_REGISTER.md`), and automated tests in `tests/unit/components/`.
* High test suite confidence ($644$ automated tests passing, $0$ failed, $0$ drift).
* 100% static compatibility on GitHub Pages.

### Negative / Trade-offs
* Minor runtime lookup overhead in `AssetLoader.prototype.resolvePath` to check biome aliases (negligible; cached after resolution).
