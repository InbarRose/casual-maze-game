# ADR-0030: Preset Avatar Archetypes, Universal Top Bar, Overlay Menu Toggles & Minimal Mode Exit

## Status
Accepted

## Date
2026-10-11

## Context
Following community feedback and user issue reports (#82, #83, #84, tracked under BL-118, BL-119, BL-120), three critical visual and UX friction points required architectural resolution:

1. **Player Customization Finickiness & Lack of Variety (Issue #84, BL-118)**:
   The previous character customization relied solely on granular sliders/pickers (gender silhouette, hair style, hair color, skin tone) without distinct visual class identity. Players requested ready-made, iconic fantasy adventurer presets that immediately transform character visuals with distinct silhouetted gear, garments, and headwear without affecting core gameplay stats.
2. **Mobile Menu Readability & Viewport Fit (Issue #83, BL-119)**:
   On mobile displays, menu dialogs could exceed viewport height, collide with bottom navigation bars or home indicator gestures, and lack safe bottom buffers. In addition, players lacked a consistent top bar structure across screens (Hub return on left, breadcrumbs, page context button + quick access radar, feed, and bug report icons in center, and settings & profile on right) and an explicit visual border distinguishing the gameplay canvas from HUD chrome.
3. **Trapped in Mobile Minimal Drag Exploring Mode (Issue #82, BL-120)**:
   When switching to minimal exploration view or collapsing the top HUD bar on touchscreens, mobile players could not easily discover how to exit minimal mode or restore the standard HUD and pathfinding controls.

## Decisions

### 1. 8 Preset Hero Avatar Archetypes
Introduced `ARCHETYPES` and `ARCHETYPE_META` in `js/core/constants.js` with 8 distinct, iconic adventurer classes:
- **Adventurer**: Classic brimmed fedora, plaid flannel shirt, explorer backpack with bedroll and straps.
- **Fighter**: Warrior iron helmet with nasal ridge, plate armor breastplate with brass rivets, round back shield.
- **Wizard**: Pointed conical wizard hat with gold star, mystic flowing robes with center stole and runic medallion, back mantle cloak.
- **Rogue**: Shadow assassin cowl/hood, dark leather jerkin with utility cross-straps, shadow mantle cloak.
- **Cleric**: Radiant sun halo/circlet, sacred robes with divine medallion, sacred relic pouch on back.
- **Ranger**: Huntsman cap with crimson feather, hunting tunic with diagonal quiver baldric, back quiver with arrows.
- **Paladin**: Greathelm with golden crown crest, polished knight breastplate, radiant heater shield on back.
- **Bard**: Ornate feathered beret, flamboyant doublet with gold accent bands, slung acoustic lute instrument on back.

Rendered faithfully in both **2.5D Angled View** (`renderAngledExplorer`) and **Classic Top-Down View** (`renderTopDownExplorer`).

### 2. Curated Primary & Secondary Color Palette Pickers
Created `PALETTE_COLORS` with 8 rich fantasy swatches (Crimson, Cobalt, Emerald, Amber, Purple, Rose, Slate, Silver). Players can select any primary outfit color and secondary trim/cuff/accent color. Preserved 100% backward compatibility for legacy silhouette, hair, and skin customizations inside a collapsible `<details>` panel in `ProfileModal`.

### 3. Universal Top Navigation Bar Layout
Standardized the firm top bar layout across desktop and mobile:
- **Left Island**: Hub return button (`← Hub`), breadcrumb trail (`Hub ❯ Chapter 1 ❯ Level 1`), level title and floor elevation badge.
- **Center Island**: Page Context menu button (`⏸️ Menu [P]`), quick access icons (`🗺️ Radar`, `⚡ Feed`, `🐛 Bug Feedback`), inventory keys list, carried riddle relic badge, and lore journal trigger.
- **Right Island**: Quick Settings button (`⚙️`), Player Profile button (`🧭`), Touch Navigation mode toggle (`👆`), Timer/Steps telemetry, zoom controls, camera rotation compass, and HUD collapse toggle (`📐`).

### 4. Luminous Canvas Render Area Frame
Added `.canvas-render-border` framing the `#game-canvas` with subtle cyan luminosity (`border: 2px solid rgba(56, 189, 248, 0.28); box-shadow: inset 0 0 16px rgba(56, 189, 248, 0.08);`). This cleanly delineates the interactive gameplay labyrinth from the browser viewport chrome.

### 5. Safe Area Bottom Buffer & Responsive Dialog Clamping
- Defined `--bottom-safe-buffer: max(16px, env(safe-area-inset-bottom, 16px))` in `css/game.css`.
- Clamped modal dialog dimensions on mobile: `max-height: calc(100vh - var(--top-bar-height, 52px) - var(--bottom-safe-buffer) - 20px); max-width: min(520px, calc(100vw - 1rem)); overflow-y: auto;`.
- Anchored virtual touch controls and bottom hint bars above the safe area buffer.

### 6. In-Game Pause Menu Overlay Toggles
Added an **Overlays & HUD Visibility** section to the in-game pause dialog (`GameMenu`) with dedicated toggle buttons for:
- Radar / Minimap (`#btn-pause-toggle-radar`)
- Activity Feed (`#btn-pause-toggle-feed`)
- Virtual Touch Controls (`#btn-pause-toggle-controls`)
- HUD Bar collapse (`#btn-pause-toggle-hud`)
Updating live status text (`ON`, `MIN`, `COLLAPSED`) when opening the pause drawer.

### 7. Floating Exit Minimal View Button
Added a prominent floating pill button `#btn-exit-minimal-mode` (`👁️ Normal View [H]`) anchored top-center (`top: calc(var(--top-bar-height) + 12px); left: 50%; transform: translateX(-50%);`).
- Appears whenever `.game-hud-top.hud-collapsed` is active or touch navigation is in `drag_only` minimal mode.
- 1-tap click immediately restores full HUD, un-collapses top bar, resets touch navigation mode to standard, and plays acoustic feedback.

### 8. Semantic Version Increment
Incremented engine version to `v1.23.0` across `package.json`, `js/core/version.js`, `test.html`, and documentation registers.

## Consequences

### Positive
- Players have immediate access to 8 visually distinct, colorful hero avatars without overwhelming slider micro-management.
- Pure static client-side operation preserved (0 backend dependencies, 100% GitHub Pages compatible).
- Top bar navigation is predictable, standardized, and clean across all pages.
- Mobile screens no longer experience dialog cutoff or touch clipping at the bottom edge.
- Mobile players in minimal or collapsed view always have an unmistakable, single-tap return path to the standard HUD.
- All 680+ unit, integration, and E2E tests pass with 0 failures.

### Trade-offs
- Small increase in CSS rules for safe area variables and canvas frame borders (~1.8KB unminified).
