# 0041. 3D Multi-Elevation Bridges, Battlements & Underpass Tunnels Overhaul

Date: 2026-10-18

## Status
Accepted

## Context
In previous iterations, elevated bridges in Chapter 10 (especially Level 38 "Concentric Trestles" and Level 39 "Harmonic Mirror Seals") suffered from significant visual and gameplay issues:
1. **Perpendicular Visual Misalignment**: In 2.5D angled rendering (`renderAngledOverheadLayer`), East-West bridges (`BRIDGE_EW`) were rendered with North-South railings and vice versa due to an inverted directional ternary. This caused railings to visually block the bridge walkway in angled perspective.
2. **Visual Elevation Snapping on Ramps**: When ascending or descending directional ramps, the player sprite snapped abruptly between ground elevation ($0\text{px}$) and overhead elevation ($-14\text{px}$) upon move completion, occasionally rendering underneath the ramp deck during ascent.
3. **Disjointed Underpass Visuals**: Ground floor tiles positioned beneath overhead bridges or platforms did not render underpass shadow cues or tunnel masonry, making bridges appear to float in open air with no sense of subterranean or underpass traversal.
4. **Superficial Level Traversal**: Elevated bridges in Chapter 10 were small (1-tile isolated spans) and largely inconsequential. In Level 38, only 6 out of 53 steps were elevated, and in Level 39, zero elevated steps were taken in the optimal path. Players solved levels almost entirely on 2D ground planes, completely missing the excitement of scouting lower courtyards from high ramparts and discovering hidden tunnels.

## Decision
1. **Engine & Rendering Overhaul (BL-156)**:
   - **Smooth Ramp Elevation Interpolation**: In [`js/entities/player.js`](../../js/entities/player.js), track `fromElevation` and implement `getEffectiveElevation()`, smoothly easing vertical height offset between $Z=0$ and $Z=1$ across ramp movement. In [`js/engine/renderer.js`](../../js/engine/renderer.js), exclude ascending players from the ground pass and render them in the overhead pass with fractional elevation lift ($y - \text{heightOffset} \times \text{effectiveZ}$), eliminating visual popping.
   - **Unified Bridge Direction**: Implement `getOverheadBridgeDirection(overTile, gTile, isRotated90or270)` ensuring `BRIDGE_EW` decks run East-West and `BRIDGE_NS` decks run North-South across both angled 2.5D and top-down blueprint pipelines.
   - **Tunnel Underpass Ground Shaders**: In `renderAngledFloors`, detect ground tiles beneath overhead bridges and platforms (`BRIDGE_EW`, `BRIDGE_NS`, `PLATFORM`), rendering underpass tunnel cobblestones with entry/exit shadow archways.

2. **Chapter 10 Level 38 ("Concentric Trestles") Architectural Redesign**:
   - Redesigned Level 38 into a multi-tiered fortress citadel:
     - **High Battlement Wall-Walk**: Ascend from the northwest starting courtyard via ramp onto an extensive perimeter wall-walk (`WALL_WALK`, $y=2, x: 4..20$ and $x=20, y: 3..14$).
     - **Scouting from Above**: From the high battlement at $(20, 7)$, players look down into the sunken courtyard below and spot the glowing Prism Keystone at $(18, 7)$, surrounded by high walls with no direct descent.
     - **Grand Viaduct Trestle**: An expansive multi-tile viaduct bridge (`overhead[14][15..19]` and `overhead[15..18][14]`) spans across lower underpass corridors, leading to a descending ramp at $(14, 19)$ into the southern quadrant.
     - **Underpass Tunnel Route**: On ground level, paths that appear to be dead ends pass through an underpass tunnel directly beneath the overhead viaduct at $(18, 14)$ into the Sunken Keystone Courtyard.
     - **Mandatory 3D Progression**: Ground shortcuts are blocked; the optimal path requires 77 steps, of which 40 steps ($>50\%$) are elevated.
   - Strictly verified against zero dead space ($\ge 4\times 4$), LevelValidator ($0$ errors, $0$ warnings), and zero-bypass solvability.

3. **Automated Testing & Regression Gating**:
   - Updated [`tests/unit/levels/chapter-10.test.mjs`](../../tests/unit/levels/chapter-10.test.mjs) asserting 77 optimal steps, calibrated par steps ($89$), and $\ge 35$ elevated steps.
   - Verified all 153 suites (761 tests) and drift validation pass with zero failures.
