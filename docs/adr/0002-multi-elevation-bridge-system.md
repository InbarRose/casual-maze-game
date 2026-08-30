# 0002. Two-Layer Elevation and Directional Bridges

Date: 2026-08-30

## Status
Accepted

## Context
Traditional 2D tile mazes are strictly planar (one layer). To support complex puzzle designs where corridors can cross over each other without connecting (bridges and tunnels), the engine needed an elevation model without introducing full 3D complexity.

## Decision
1. **Two-Layer Elevation Grid**:
   * `Layer 0 (Ground)`: The standard floor level, tunnel passages under bridges, and default entities.
   * `Layer 1 (Overhead)`: Elevated walkways and bridge decks.
2. **Directional Bridge Tiles**:
   * `BRIDGE_EW` (`B_EW`): Allows East <-> West movement on `Layer 0` (tunnel) and North <-> South movement on `Layer 1` (overhead bridge).
   * `BRIDGE_NS` (`B_NS`): Allows North <-> South movement on `Layer 0` (tunnel) and East <-> West movement on `Layer 1` (overhead bridge).
3. **Ramp Transition Tiles**:
   * Directional ramps (`RAMP_N`, `RAMP_S`, `RAMP_E`, `RAMP_W`) dynamically transition the player between `Layer 0` and `Layer 1` based on the movement direction vector.
4. **Collision Evaluation**:
   * Collision queries evaluate tiles matching the entity's current elevation, permitting entities on `Layer 1` to walk over walls on `Layer 0`.

## Consequences
### Positive
* Enables intricate labyrinth topologies (overpasses, multi-tiered puzzles).
* Retains grid-based integer coordinate calculations without continuous 3D collision physics.
* Fully serialized in the canonical 2D matrix JSON level format.

### Negative / Trade-offs
* Requires careful level design to ensure ramps align with bridges so players don't become trapped on the overhead layer.
* Rendering requires a multi-pass pipeline (Ground Layer -> Entities -> Overhead Layer).
