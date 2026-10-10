# 0015. Mobile Footer Shortcuts Drawer and Colorblind Inventory Glyphs

Date: 2026-10-10

## Status
Accepted

## Context
1. **Mobile Footer Keyboard Shortcut Clipping (CMP-01, BL-98)**:
   - On screens $\le 768\text{px}$, the global footer's `.shortcuts-hint` (<kbd>WASD</kbd>, <kbd>Q/R</kbd>, <kbd>V</kbd>, <kbd>M</kbd>, <kbd>Esc</kbd>) was either hidden or pushed off-screen.
   - Mobile and touch players had no compact, expandable drawer to view all controls and gesture shortcuts at a glance without navigating away to the full handbook modal.
2. **Colorblind Inventory Key Distinction (CMP-06, CMP-19, BL-99)**:
   - In `maze.html`, inventory keys rendered as colored pills with key name and gold key icon 🔑 (`.key-pill`).
   - For players with color vision deficiencies (protanopia, deuteranopia, tritanopia), distinguishing held keys (e.g. Ruby vs Emerald vs Sapphire vs Amethyst) relied heavily on text labels rather than immediate visual shape recognition.
   - The Component Scoring Register specifically identified this gap in CMP-06 and CMP-19:
     *"Directives: Add colorblind geometric badges to inventory key pills."*

## Decision
1. **Mobile Expandable Shortcuts Drawer (`BL-98`)**:
   - In `js/ui/app-header.js`, add a mobile toggle button `#btn-footer-shortcuts-toggle` (`⌨️ Controls`) in `.shortcuts-hint`.
   - On mobile viewports, render a compact expandable cheat sheet drawer listing all desktop hotkeys alongside touch equivalents (Swipe/Drag to move, 1-tap HUD pills, pinch-to-zoom).
   - In `css/main.css`, style the mobile drawer with smooth CSS slide animations and glassmorphic backdrop.
2. **Colorblind Geometric Shape Glyphs on Inventory Key Pills (`BL-99`)**:
   - Define canonical geometric symbol badges for key colors in `constants.js`:
     - Gold / Yellow: 🟡 Circle (`●`)
     - Red / Ruby: 🔺 Triangle (`▲`)
     - Blue / Sapphire: 🔷 Diamond (`◆`)
     - Green / Emerald: 🟩 Square (`■`)
     - Purple / Amethyst: ⭐ Star (`★`)
   - In `maze.html` inventory card rendering, append a distinct high-contrast geometric shape badge (`.key-shape-badge`) to each `.key-pill`.
   - Update `css/game.css` to style `.key-shape-badge` with high-contrast borders and sharp silhouettes.

## Consequences
### Positive
* Mobile players can expand and inspect all controls and gesture shortcuts directly from the footer on any page without losing their place.
* Colorblind and low-vision players can instantly identify held keys at a glance via distinct geometric shapes in addition to color hue.
* Elevates master scores for **CMP-01** (Universal App Shell), **CMP-06** (HUD & Inventory), and **CMP-19** (Accessibility & Sensory Inclusivity).

### Negative / Trade-offs
* Minor additional markup in `.key-pill`, fully lightweight and zero-dependency.
