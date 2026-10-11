# 0012. Macro-Labyrinth Expansion and Classical Maze Topologies

Date: 2026-10-09

## Status
Accepted

## Context
Across early levels, labyrinth dimensions were primarily constrained between $11 \times 11$ and $17 \times 17$. While effective for teaching isolated mechanics and providing clean single-screen puzzle challenges, players and reviewers noted:
1. **Lack of Expansive Navigation**: The player could frequently see all paths at a glance, diminishing the visceral feeling of being lost inside an ancient labyrinth.
2. **Puzzle-Dominant vs. Maze Balance**: The game excels at puzzle elements (keys, levers, bridges, teleporters, ciphers), but players sought authentic maze components—interconnected wings, concentric ambulatory halls, and branching dead ends requiring spatial memory alongside deduction.
3. **Preserving Established Levels**: Rather than discarding or destroying perfectly calibrated compact levels, expansion should take advantage of episodic sagas and multi-room dungeons to introduce macro-scale labyrinths ($\ge 25 \times 25$ up to $35 \times 35$).

## Decision
We implement **Macro-Labyrinth Expansion & Classical Maze Topologies** (`BL-89`, `BL-90`):
1. **27×27 Sunken Catacombs Megalabyrinth (`story_citadel_1`)**:
   * Upgraded the subterranean Catacombs room from a modest $13 \times 13$ chamber into a sprawling $27 \times 27$ multi-wing macro-labyrinth.
   * Features 4 architectural zones:
     - **Entrance Sanctuary**: Safe departure point at (1, 1).
     - **West Crypt Sanctuary**: Pillared mausoleum with ambient shadows.
     - **Central Hall of the Ancient Dead**: $9 \times 9$ chamber with 4 symmetrical monolithic columns.
     - **South-West Concentric Corridors**: Branching perimeter galleries with hidden collectible Emerald.
     - **South-East Sarcophagus Vault**: Vault chamber housing the mandatory Spire Keystone at (23, 23).
   * Guarded by timed fire vents (`cyclePeriod: 3000ms`), lore murals, and precious Amethyst and Emerald relics.
2. **Camera Follow & Viewport Scale Harmony**:
   * Works hand-in-hand with Viewport Zoom (`BL-87`) and Fog of War (`BL-88`), ensuring large labyrinths extend naturally beyond viewport borders with camera tracking rather than being squished into the screen.
3. **Zero-Bypass Gating Verification**:
   * Full solvability verified via BFS solver: reaching the Spire Keystone, escaping the catacombs, unlocking the Spire Gate in the Courtyard, and ascending to the High Spire is 100% verified and unbypassable.

## Consequences
### Positive
* **Authentic Labyrinth Feel**: Players experience true spatial navigation, loopbacks, and fork choices across a vast $27 \times 27$ expanse.
* **Preserves Campaign Baseline**: Existing campaign levels remain intact and pristine while storyline quests showcase macro-scale dungeons.
* **Amplifies Fog of War and Zoom Value**: With $27 \times 27$ dimensions and Fog of War enabled, the player relies on minimap radar, waypoint trails, and zoom controls.

### Negative / Trade-offs
* **Longer Exploration Time**: Solving the multi-room citadel now requires significant navigation through the subterranean depths.
