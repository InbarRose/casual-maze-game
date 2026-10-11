# 0010. Responsive HUD Collapse, Mobile Clutter Elimination, and Obscured Menu Auto-Pause

Date: 2026-10-09

## Status
Accepted

## Context
When reducing the browser viewport size or running on mobile screens, various in-game HUD modules—the top navigation breadcrumbs, level information cards, inventory belt, activity feed, telemetry metrics, compass rotation dial, and minimap radar—converge into a dense layout. On small screens ($\le 768\text{px}$) and especially in landscape or split-screen configurations:
1. **Viewport Clutter & Obstruction**: Overlapping HUD cards and topbars encroach upon the game canvas, obscuring maze corridors, traps, keys, and the player character.
2. **Mobile Screen Crowding**: Large static HUD containers leave insufficient room for touch interaction and visual tracking of maze pathways.
3. **Unpaused Background Gameplay**: When extensive overlays or menus are open and block sight of the player, background gameplay continuing without clear visibility creates severe hazards (e.g. running into sentinels, missing time-sensitive traps, or losing orientation).

## Decision
We implement a comprehensive **Responsive HUD Collapse** architecture and **Obscured Visibility Auto-Pause** policy (BL-92):

1. **Responsive Compact Drawer & Pill Collapsing**:
   * On compact screens ($< 768\text{px}$) or when resized below comfortable thresholds, topbars, sidebars, inventory belts, and telemetry collapse into minimal floating icon pills.
   * Each collapsed module provides an intuitive 1-tap toggle button (`_` / `▲` / badge) to expand its detailed drawer on demand without cluttering the screen permanently.
   * Persistent user preference: minimized/expanded states for the minimap, feed, controls, and info card are remembered in `localStorage` across levels.
2. **Strict HUD Non-Overlap Rules**:
   * Enforce CSS flex-wrap, safe margins, and docked placement boundaries preventing any two HUD widgets from overlapping or colliding in screen space.
3. **Automatic Engine Pause When View is Obscured**:
   * The core game loop must automatically enter the `PAUSED` state whenever full-screen menus, modals, or expanded dialogs (e.g. lore journal, puzzle modals, settings, help handbook, or large overlays) obscure line-of-sight to the active labyrinth.
   * When all obscuring dialogs are dismissed, gameplay seamlessly resumes (or prompts the player to resume).

## Consequences
### Positive
* **Fluid Scalability**: The game scales gracefully from ultra-wide 4K monitors down to compact mobile phones without visual degradation or clipped buttons.
* **Maximized Play Area**: Player visibility remains front-and-center, preserving immersion and precision navigation.
* **Player Protection**: Auto-pausing when views are obstructed prevents accidental deaths, hazard collisions, or lost steps while reading lore or adjusting options.

### Negative / Trade-offs
* **Tap-to-Inspect for Telemetry**: Mobile users may need an extra tap on compact stat pills to inspect detailed step counts or inventory cards if collapsed by default.
