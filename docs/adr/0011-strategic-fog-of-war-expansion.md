# 0011. Strategic Fog of War Expansion and Exploratory Vision Dynamics

Date: 2026-10-09

## Status
Accepted

## Context
In previous milestones, Fog of War was selectively confined primarily to Tutorial 5 & 6, Chapter 1 Level 4, and Chapter 8 (Levels 29–32). For the vast majority of campaign levels (Chapters 2 through 7), the entire labyrinth was fully exposed immediately upon entering.

As highlighted in user feedback:
1. **Underutilized Mechanic**: Fog of war is a core atmospheric and suspense element that transforms puzzle progression into active discovery.
2. **Minimap & Radar Value**: Without fog of war, the tactical radar, minimap zoom/pan, sonar pings, and breadcrumb tracking lose much of their utility because the player can see the entire maze on screen immediately.
3. **Pacing & Climaxes**: Having fog of war enabled across climatic final chapters of each zone creates a natural tension curve across the campaign.

## Decision
We implement a strategic expansion of Fog of War across the campaign (BL-88):
1. **Climatic Zone Pacing**:
   * Enable Fog of War on the climatic synthesis finale of each campaign chapter:
     - Level 4 (*The Dark Descent*): `viewRadius: 6` (Subterranean introduction)
     - Level 8 (*Citadel of the Two Horizons*): `viewRadius: 7` (Multi-elevation jungle citadel)
     - Level 12 (*Master of Wheels*): `viewRadius: 7` (Dynamic clockwork mechanism labyrinth)
     - Level 16 (*The Astral Nexus*): `viewRadius: 7` (3D teleporter nexus)
     - Level 20 (*The Caldera Gauntlet*): `viewRadius: 7` (Molten gauntlet with moving hazards)
     - Level 24 (*The Grand Archive*): `viewRadius: 7` (Celestial cipher library)
     - Level 28 (*The Sovereign's Ascent*): `viewRadius: 7` (Grand multi-puzzle synthesis trial)
     - Chapter 8 Levels 29–32: `viewRadius: 6..7` (Master tier 4-way camera rotation trials)
2. **Dynamic 2D Raycasting & Atmospheric Lighting**:
   * Raycasting 360-degree line-of-sight terminates cleanly against opaque walls and unrevealed secret doors.
   * Soft radial lighting gradients surround the explorer with subtle sinusoidal candle flicker, expanding when carrying a torch item (`BL-12`).
   * Explored corridors transition to memory shading (`fogMemory: rgba(0, 0, 0, 0.65)`), preserving mapped geometry while concealing active dynamic hazards in darkness.
3. **Tactical Minimap Radar Synergy**:
   * Exploration dynamically populates the tactical minimap radar (`BL-65`), elevating its strategic utility during navigation.

## Consequences
### Positive
* **Elevated Suspense & Joy of Exploration**: Players experience genuine joy of discovery unearthing concealed chambers, secret doors, and puzzle switches.
* **Harmonious Difficulty Pacing**: Early introductory levels in each chapter remain clear to learn mechanics, culminating in a mysterious, fog-shrouded finale.
* **Maximizes Minimap & Zoom Value**: Elevates the utility of the minimap radar and interactive zoom controls (`BL-87`).

### Negative / Trade-offs
* **Increased Navigation Caution**: Players must explore corridors methodically rather than scanning the entire level layout from the start tile.
