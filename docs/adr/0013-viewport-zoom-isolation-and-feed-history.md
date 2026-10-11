# 0013. Viewport Zoom Isolation and Interactive Action Feed History

Date: 2026-10-09

## Status
Accepted

## Context
1. **Viewport Zoom Visual Drift & Component Inconsistency (BL-93)**:
   - When zooming the viewport (`+`/`-`, mouse wheel, pinch-to-zoom), different UI elements sized at mismatched rates. In particular:
     - The game level canvas scaled `camera.tileSize` cleanly, but in-world DOM indicators (`#hud-tile-indicator`, `.hud-disambig-pill`) remained at static pixel sizes, overpowering tiny cells when zoomed out ($0.5\times$) or appearing disproportionately small when zoomed in ($2.0\times$).
     - The zoom bounds needed strict upper and lower limits ($0.5\times$ to $2.0\times$) clamped across all input surfaces (wheel, touch pinch, buttons, keyboard shortcuts).
     - UI menus, top navigation chrome, minimap, and modals must remain completely isolated from game camera zoom to prevent distorted or clipped overlays.
2. **Action Activity Feed Ephemerality & Historical Companion Access (BL-94)**:
   - The in-game action activity feed displayed live notifications (`key:collected`, `door:unlocked`, `lever:toggled`, `teleport:warped`, `hazard:trapped`, lore inspects), but automatically faded out after 5.5 seconds.
   - Players were unable to review past interactions, lore snippets, or switch toggles after items disappeared.
   - The game already features companion log/telemetry infrastructure (`#activity-log-modal`, `gameActivityHistory`), but the docked feed lacked a direct interaction trigger to review action history.

## Decision
1. **Viewport Zoom Isolation & Optical Anchor (`BL-93`)**:
   - Establish strict zoom bounds: `VIEWPORT_ZOOM.MIN = 0.5`, `VIEWPORT_ZOOM.MAX = 2.0`, enforced in `Camera.setZoom()`, mouse wheel handlers, touch pinch-to-zoom, and UI buttons.
   - Inject the current camera zoom as a CSS custom property `--camera-zoom` onto the root document / viewport wrapper.
   - Bind in-world DOM element transforms (`.hud-tile-indicator`, `.hud-disambig-pill`) to scale with `clamp(0.75, var(--camera-zoom, 1), 1.35)`, ensuring indicator elements scale harmoniously with canvas tiles without occluding game cells.
   - Guarantee 100% decoupling: menus, headers, sidebars, and modals use fixed screen units (`rem`, `px`, `%`) and are strictly unaffected by world canvas zoom.
2. **Interactive Action Feed History & Companion Drawer (`BL-94`)**:
   - Add an interactive history button (📜 / `btn-feed-history`) and make the feed title/body clickable to immediately open the comprehensive Activity History modal (`openActivityLogModal()`).
   - Store all chronological game actions in `gameActivityHistory` with categorized tags (`lore`, `mech`, `item`, `warning`, `info`).
   - Enhance the Activity Log Modal with filtering buttons matching the feed categories (`All`, `Lore`, `Mech`, `Items`, `Warnings`).
   - Make individual live feed items clickable so players can inspect any specific past event in detail.

## Consequences
### Positive
* Game canvas zoom is strictly bounded between $0.5\times$ (50%) and $2.0\times$ (200%), preventing visual breakage or extreme distortion.
* In-world overlay indicators dynamically scale with canvas zoom factor while remaining crisp and legible.
* Zero menu distortion: zoom affects only the game world canvas and its in-world projection anchors.
* Players have instant 1-click access to complete chronological history of level actions, lore notes, and puzzle states without losing ephemeral toasts.
* Reuses existing telemetry and log companion components without creating redundant DOM structures.

### Negative / Trade-offs
* Mobile screens at $0.5\times$ zoom show smaller tiles, requiring in-world indicators to maintain minimum hit targets ($\ge 24\text{px}$) via CSS clamping.
