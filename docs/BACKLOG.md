# Casual Maze Game — Master Product Backlog

This document serves as the authoritative, prioritized master backlog for all features, technical debt, level overhauls, engine enhancements, and UX improvements in the **Casual Maze Game**.

* **Audited & Updated**: 2026-09-20
* **Status**: Active & Maintained
* **Priority Schema**:
  * **P0 (Blocker / Critical)**: Must be addressed immediately; breaks gameplay, solvability, or core architecture.
  * **P1 (High)**: Major user friction, visual deficiency, or core gameplay gap.
  * **P2 (Medium)**: Quality-of-life improvement, polish, or progressive feature expansion.
  * **P3 (Low / Polish)**: Nice-to-have visual micro-interactions, extra sound design, or minor enhancements.

---

## 1. Backlog Summary by Epic

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MASTER BACKLOG OVERVIEW                         │
├──────────────────────────────────────┬──────────┬───────────┬──────────┤
│ Epic Name                            │ Items    │ Priority  │ Status   │
├──────────────────────────────────────┼──────────┼───────────┼──────────┤
│ 1. Level Design & Kishōtenketsu      │ BL-01–08,89,90│ P0/P1│ Active   │
│ 2. Visual Engine & Vector Rendering  │ BL-09–13,33,78,80│ P1 │ Completed│
│ 3. Game Feel, Controls & Mobile UX   │ BL-14–17,40,55,63,65,67,70,72,87│ P1│ Active │
│ 4. Map Editor Studio Overhaul        │ BL-18–22,37,39,75 │ P1 / P2 │ Completed│
│ 5. Universal Navigation, HUD & Save  │ BL-23–26,34,36,38,53,54,64,66,68,69,71,73,74,76,81-86,88,91,92 │ P0/P1 │ Active │
│ 6. Audio FX & Ambience Engine        │ BL-27–28,35,77 │ P2   │ Completed│
│ 7. QA Automation & Test Scale        │ BL-29–32,45,46,79 │ P0/P1│ Completed│
│ 8. Immediate Gameplay & UX Polish    │ BL-41–44,47–52 │ P0 / P1 │ Ready    │
│ 9. Architecture Modernization & SOLID│ BL-56–62 │ P1        │ Planned  │
└──────────────────────────────────────┴──────────┴───────────┴──────────┘
```

---

## 2. Detailed Backlog Items

### Epic 1: Level Design & Kishōtenketsu Campaign Overhaul
*Objective: Eliminate monotonous corner-to-corner templates and ensure every level adheres to the 4-stage Kishōtenketsu methodology with 100% zero-bypass gating.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-01** | **Level Design Philosophy & Audit Rubric** | **P0** | `v1.19.0` | Publish `docs/LEVEL_DESIGN_PHILOSOPHY.md` and critical 6-axis 60-point `docs/LEVEL_AUDIT_RUBRIC.md`. | **Completed** |
| **BL-02** | **Master Level Scoring Register** | **P0** | `v1.19.0` | Audit all 38 levels in `docs/LEVEL_SCORING_REGISTER.md` with realistic, critical baseline scores. | **Completed** |
| **BL-03** | **Chapter 1 Workshop (The Foundation)** | **P0** | `v1.19.0` | Redesign Levels 1–4 with non-uniform dimensions, dynamic spawns, unbypassable locks, and zero empty backtracking. | **Completed** |
| **BL-04** | **Chapter 2 Workshop (Vertical Dimension)** | **P0** | `v1.19.0` | Redesign Levels 5–8 with multi-elevation bridges (`B_EW`, `B_NS`), directional ramps (`R_*`), and elevated keys. | **Completed** |
| **BL-05** | **Chapter 3 Workshop (Shifting Clockwork)** | **P1** | `v1.19.0` | Redesign Levels 9–12: Clockwork levers, dynamic wall-state gates, multi-target toggles with zero bypass. | **Completed** |
| **BL-06** | **Chapter 4 Workshop (Astral Teleporters)** | **P1** | `v1.19.0` | Redesign Levels 13–16: 3D teleporter networks, non-Euclidean shortcuts, anti-softlock teleport loops. | **Completed** |
| **BL-07** | **Chapter 5 Workshop (Molten Danger)** | **P1** | `v1.19.0` | Redesign Levels 17–20: Timed flame vents, rhythm gauntlets, patroller sentinels, mid-level checkpoints. | **Completed** |
| **BL-08** | **Chapters 6–8 Polish & Synthesis** | **P2** | `v1.19.0` | Polish minigame seals (Ch 6), grand trial synthesis (Ch 7), and 4-way camera rotation puzzles (Ch 8). | **Completed** |
| **BL-89** | **Expanded Labyrinth Scale & Macro-Corridor Expansion** | **P1** | `v1.25.0` | Design large-scale maps ($\ge 27 \times 27$ up to $35 \times 35$) without discarding existing levels by introducing a new Chapter 9 ("The Vast Catacombs") or Master Tier trials with branching dead-ends, multi-chamber wings, and authentic labyrinth routing. | **Completed** |
| **BL-90** | **Pure Maze Classical Topologies & Interlocking Circuit Integration** | **P1** | `v1.25.0` | Integrate classic labyrinthine structures (winding concentric rings, hedge-style maze branches, fork-path choices with distinctive landmarks) combined with puzzle gates, ensuring exploration requires spatial navigation alongside logical deduction. | **Completed** |

---

### Epic 2: Visual Engine & SVG Vector Rendering Pipeline
*Objective: Replace flat solid-color Canvas 2D rectangles with rich vector SVG sprites, layered textures, and atmospheric lighting.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-09** | **SVG Sprite Rendering in Game Canvas** | **P1** | `v1.20.0` | Connect `assets/manifest.json` SVG vector assets into `js/engine/renderer.js` for walls, floors, doors, and keys. | **Completed** |
| **BL-10** | **Biome Floor Textures & Wall Drop Relief** | **P1** | `v1.20.0` | Render cobblestone, flagstone, moss, and crystal floor textures instead of flat monochromatic fills. | **Completed** |
| **BL-11** | **Dynamic Atmospheric Particle Systems** | **P2** | `v1.21.0` | Add subtle canvas particle effects: rising embers in Lava, drifting pollen in Jungle, floating motes in Caverns. | **Completed** |
| **BL-12** | **Lighting Gradients & Torch Glow** | **P2** | `v1.21.0` | Dynamic radial gradient lighting around the explorer and placed wall torches under Fog of War. | **Completed** |
| **BL-13** | **Elevation Drop Shadows & Visual Depth** | **P2** | `v1.21.0` | Render realistic directional drop shadows cast by elevated bridge spans and high platforms onto lower terrain. | **Completed** |
| **BL-33** | **2.5D Depth-Sorting & Wall Front/Roof Occlusion** | **P1** | `v1.20.0` | Resolve visual anomaly where explorer renders over southern wall roofs. Implement unified Y-sorted or row-interleaved painter pass so character walking behind/north of a wall tile is properly occluded by its elevated front face and top cap. | **Completed** |
| **BL-78** | **Explorer Avatar Customization & Thematic Wardrobes** | **P1** | `v1.24.0` | In-profile wardrobe picker allowing players to equip 6 distinct aesthetic adventurer outfits (`Classic Pathfinder`, `Emerald Ranger`, `Frost Nomad`, `Desert Scout`, `Obsidian Rogue`, `Arcane Scholar`) with color swatch dots, active badges, and instant event bus propagation. | **Completed** |
| **BL-80** | **High-Polish Game Aesthetic, Dynamic Hero Canvas Backdrop & Visual Branding** | **P1** | `v1.24.0` | High-production procedural canvas hero backdrop (`HeroAmbientCanvas`), stylized crest and metallic branding title, gameplay feature spotlight strip, biome-themed campaign cards, and tactile button glows. | **Completed** |

---

### Epic 3: Game Feel, Controls & Mobile Ergonomics
*Objective: Deliver a responsive, delightful control experience across both desktop keyboards and mobile touchscreens.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-14** | **Click-to-Move BFS Pathfinding Engine** | **P0** | `v1.18.0` | One-tap navigation routing explorer around obstacles and through open doors with animated target indicator. | **Completed** |
| **BL-15** | **Contextual Floating Action Pill** | **P0** | `v1.18.0` | Glassmorphic floating interact button positioned above character for one-tap mobile activation. | **Completed** |
| **BL-16** | **Mobile Touch Viewport & Scroll Locking** | **P1** | `v1.20.0` | Prevent accidental page rubber-banding and scrolling during canvas drag gestures on iOS Safari & Android Chrome. | **Completed** |
| **BL-17** | **Minimap Pinch-to-Zoom & Pan Gesture** | **P2** | `v1.22.0` | Touch gesture support for zooming and panning the HUD minimap overlay on mobile viewports. | **Completed** |
| **BL-40** | **Gamepad API Controller Support** | **P2** | `v1.24.0` | Zero-dependency Gamepad API listener mapping standard USB/Bluetooth controller D-pad and analog sticks to movement, A for inspect/interact, B/Start for pause, bumpers for camera rotation. | **Completed** |
| **BL-55** | **Keyboard Quick-Advance on Victory (Space / Enter for Next Level)** | **P1** | `v1.23.0` | Allow players to press Space or Enter when victory modal is displayed to automatically advance to the next level without requiring mouse clicks for faster gameplay flow. | **Completed** |
| **BL-63** | **Moveable Top-Docked Virtual Controls & Auto-Repeat Steps** | **P1** | `v1.24.0` | Moveable and top-docked virtual D-pad controls (`data-dock="top-left"` default) to prevent OS gesture conflicts, continuous touch/mouse auto-repeat holding for effortless mobile movement, minimize toggle (`_`/`▲`), 4-quadrant dock cycling, and integrated camera rotation buttons (`↺`/`↻`). | **Completed** |
| **BL-65** | **Tactical Minimap Elevation & Entity Shading** | **P1** | `v1.24.0` | Multi-elevation bridge deck (`#0369a1`) & walkway stripe (`#38bdf8`) shading, directional ramp markers, tactical entity indicators (uncollected keys, locked doors, levers, teleporters), player elevation beacon, sonar sweep wave, and HUD corner brackets. | **Completed** |
| **BL-67** | **Continuous Touch Drag Steering & Pathfinding Waypoint Trail** | **P1** | `v1.24.0` | Fluid directional drag steering on mobile touchscreens with automatic stepping repeat (125ms interval), dynamic in-drag turning, and animated BFS pathfinding waypoint trail rendering along corridor tiles. | **Completed** |
| **BL-70** | **Gamepad Controller Visual Guide & Live Input Tester in Settings** | **P1** | `v1.24.0` | Visual controller mapping diagram and live input tester in settings modal polling connected gamepads via Gamepad API, highlighting pressed buttons and stick axes in real time. | **Completed** (`78399ca`) |
| **BL-72** | **Multi-Elevation BFS Pathfinding & Deadzone-Free Touch Tap Sensitivity** | **P1** | `v1.24.0` | Multi-elevation BFS pathfinding navigating across bridge ramps (`R_S`, `R_N`) and overpasses (`B_EW`, `B_NS`) without elevation mismatch failures, responsive touch tap detection without deadzones, and 20px drag threshold for fluid mobile navigation. | **Completed** |
| **BL-87** | **Interactive Viewport Zoom-In / Zoom-Out & Consistent World Scale Anchor** | **P1** | `v1.25.0` | Decouple canvas tile rendering from "fit-to-screen" squash; establish a default optical tile size ($32\text{px}$–$40\text{px}$ world scale) so larger maps render beyond viewport edges and scroll smoothly with camera follow; provide intuitive zoom controls (hotkeys `+`/`-`, mouse wheel zoom, pinch-to-zoom on canvas, HUD zoom buttons). | **Completed** |

---

### Epic 4: Map Editor Studio Overhaul
*Objective: Transform the map editor into a modern, fluid authoring environment with undo/redo, brush tools, and instant diagnostics.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-18** | **Action History Stack (Undo / Redo)** | **P1** | `v1.20.0` | Full undo/redo stack (`Ctrl+Z` / `Ctrl+Y`) for brush strokes, tile edits, and entity placement. | **Completed** |
| **BL-19** | **Continuous Drag-to-Paint Smoothing** | **P1** | `v1.20.0` | Smooth interpolated line stamping during rapid mouse drag across canvas (no broken tile gaps). | **Completed** |
| **BL-20** | **Multi-Tile Stamp & Prefab Palette** | **P2** | `v1.21.0` | Pre-built architectural prefabs (bridge crossings, locked vault gates, 4-way intersections) for 1-click stamping. | **Completed** |
| **BL-21** | **One-Click Diagnostic Auto-Fixer** | **P2** | `v1.22.0` | Editor action to automatically resolve common errors (e.g. adding missing ramp next to bridge or matching door key). | **Completed** |
| **BL-22** | **Visual Layer Switcher HUD** | **P2** | `v1.22.0` | Real-time visual overlay highlighting active editing elevation (Ground Z=0 vs Overhead Z=1) with translucent previews. | **Completed** |
| **BL-37** | **Visual Multi-Elevation Bridge & Ramp Guide** | **P2** | `v1.23.0` | Interactive SVG diagrams in Guide Modal demonstrating directional ramp placement for `B_EW` and `B_NS` bridges. | **Completed** |
| **BL-39** | **Custom Prefab Saving in Map Editor** | **P2** | `v1.24.0` | Allow creators to select an arbitrary canvas region and save it to `localStorage` as a custom reusable stamping prefab. | **Completed** |
| **BL-75** | **Interactive Issue Jumping Pins & Bridge/Rotation Diagnostics in Map Editor** | **P1** | `v1.24.0` | Clicking diagnostic issues centers canvas with pulsing pin marker, checks bridge connectivity, checks 4-way rotation compatibility, and eliminates native confirm in playtest. | **Completed** |

---

### Epic 5: Universal Navigation, HUD, Profile & Save Management
*Objective: Modern, cohesive glassmorphic app chrome, in-game modal access, and cloudless export/import.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-23** | **Universal App Header & Footer** | **P0** | `v1.16.0` | Persistent glassmorphic header and footer with live star count, profile pill, and settings modal. | **Completed** |
| **BL-24** | **In-Game Settings & Profile Modals** | **P1** | `v1.19.0` | Mount `#app-header` and modal triggers inside `maze.html` so players can adjust settings without leaving active game. | **Completed** |
| **BL-25** | **Real-Time Audio Gain Sliders** | **P1** | `v1.19.0` | Connect Master, SFX, and BGM sliders directly to `WebAudioEngine` gain nodes with live volume changes. | **Completed** |
| **BL-26** | **High-Contrast Accessibility Mode** | **P2** | `v1.21.0` | High-contrast visual mode with sharp white/black borders, colorblind key glyphs, and high-visibility explorer. | **Completed** |
| **BL-34** | **1-Click Diagnostic Bug Bundle Exporter** | **P1** | `v1.23.0` | In-game action packaging level ID, player coordinates, move history, and debug logs into pre-filled GitHub issue links. | **Completed** |
| **BL-36** | **Save State Versioned Migration Runner** | **P1** | `v1.23.0` | Automated `StorageManager.migrateSaveData()` upgrading legacy save schemas on initial boot without data loss. | **Completed** |
| **BL-38** | **Prestige Rank-Up Celebration & Victory Confetti** | **P2** | `v1.23.0` | Full-screen celebratory rank-up splash banner with star sparkles and Canvas 2D confetti bursts on victory. | **Completed** |
| **BL-53** | **Comprehensive Settings Rebinding & Profile Backup** | **P2** | `v1.23.0` | In-game settings allowing full key rebinding, audio mute/volume, default art style, and 1-click JSON export/import of profile. | **Completed** |
| **BL-54** | **Top Navigation Breadcrumbs & Chapter/Level HUD Hierarchy** | **P1** | `v1.23.0` | Interactive breadcrumb navigation hierarchy in top navigation and in-game HUD (e.g., `Campaign > Chapter 2: The Vertical Dimension > Level 5: Sunken Vault`). Displays active chapter name, chapter number, level index, and total levels with click-to-navigate back to chapter selection. | **Completed** |
| **BL-64** | **Minimalist UI, Menu Scrolling & Destructive Confirmation Safety** | **P1** | `v1.24.0` | Modal scrolling containment with sticky footers avoiding intrusive popups, non-blocking toast activity feeds, and explicit confirmation dialogs for destructive actions (Reset All Progress, Delete Custom Prefab, and Overwrite/Generate Canvas). | **Completed** |
| **BL-66** | **Canvas High-Contrast Contours & Assist Halos** | **P1** | `v1.24.0` | High-contrast visual pass across canvas renderer and minimap: pitch-black background, 2px solid white wall borders, 2-tier neon yellow (`#facc15`) and white halo contours around explorer for high accessibility. | **Completed** |
| **BL-68** | **Pause Menu Destructive Confirmation Safety & Collapsible Top Minimap** | **P1** | `v1.24.0` | Explicit confirmation dialogs protecting Restart Level and Return to Level Select in pause menu; top-docked minimap radar on mobile viewports with 1-tap minimize toggle (`_`/`▲`) and state persistence. | **Completed** |
| **BL-69** | **Universal Feedback & Bug Reporting Modal with Live Telemetry** | **P1** | `v1.24.0` | Universal glassmorphic modal accessible from app header, footer, and settings generating 1-click diagnostic bundles with client viewport, DPR, player coordinates, engine version, markdown clipboard copy, and pre-filled GitHub issue creation. | **Completed** (`78399ca`) |
| **BL-71** | **Universal Interactive How-to-Play & Labyrinth Mechanics Guide Modal** | **P1** | `v1.24.0` | Universal multi-tabbed glassmorphic modal accessible from app header and footer providing interactive controls guides, entity mechanics, visual bridge/ramp SVG diagrams, and secret wall / scoring guides. | **Completed** (`9981a2d`) |
| **BL-73** | **Inline Destructive Action Confirmations & Universal Popup Avoidance** | **P1** | `v1.24.0` | Eradication of native browser `confirm()` popups across ProfileModal reset, SettingsModal backup restore, and Editor clear canvas with sleek, non-blocking inline confirmation boxes and modal dialogs. | **Completed** |
| **BL-74** | **Top Navigation Hub Exit Safety & GameMenu Confirmation Routing** | **P1** | `v1.24.0` | Shielded `← Hub` top navigation link during active play with inline pause quit confirmation routing, preventing accidental progress loss on mobile touchscreens. | **Completed** |
| **BL-76** | **Cloudless Save Backup Metadata, Previews & Snapshot Rollback Safety** | **P1** | `v1.24.0` | Rich metadata headers in exported JSON backups (stars, levels, rank, engine version), pre-restore verification info box, and automated emergency snapshots before reset/restore with 1-click rollback recovery. | **Completed** |
| **BL-81** | **Action Activity Feed, Level Lore Journal & Unobtrusive Examination UX** | **P1** | `v1.24.0` | Eradicate 3-popup barrage on Architect Note stepping by providing a single interaction prompt [E]; add real-time docked Action Activity Feed with category filter toggles (`All`, `Lore`, `Mech`, `Items`); build in-game Level Lore Journal modal and HUD drawer with hotkey (`J`); add configurable Note Presentation mode (`Card Modal` vs `Feed Only`). | **Completed** |
| **BL-82** | **Architectural Entrance & Exit Overhaul (Wall Doorways & Freestanding Spiral Staircases)** | **P1** | `v1.24.0` | Grounding spawn entrance and exits physically in the game world: wall-integrated arched doorways with ajar wooden doors and light spill when adjacent to walls, and 3D freestanding spiral stairwells with stone balustrades and depth shadows when in open floor space. | **Completed** |
| **BL-83** | **Celestial Cipher Dials & Thematic Wall Murals** | **P0** | `v1.24.0` | Replace arbitrary numeric dial digits with thematic celestial symbols (☀️ Sun, 🌙 Moon, 🌅 Horizon, ⭐ Star, 🪐 Planet, ☄️ Comet); upgrade PuzzleModal dial rendering and controls; inscribe in-world celestial murals and riddles across Level 22, 23, 24, and 27 for legitimate deduction without guessing. | **Completed** |
| **BL-84** | **Hardcoded Entrance & Exit Layout, Clash Detection & Editor Assistant** | **P1** | `v1.24.0` | Eliminate dynamic runtime architecture inference; hardcode styles and wall directions across all 42 levels; add architectural clash detection and editor suggestion assistant. | **Completed** |
| **BL-85** | **Directional Proximity Interaction & Multi-Target Disambiguation** | **P0** | `v1.24.0` | Add `interactDirections` property restricting player approaches; implement multi-target disambiguation when multiple interactables are reachable simultaneously with in-world numbered pills (`[1]`, `[2]`), action drawer HUD, and numeric hotkey selection (`1`..`9`). | **Completed** |
| **BL-86** | **Lever Interaction Separation & Floor-Plate Trap Mechanics** | **P0** | `v1.24.0` | Prevent levers from auto-toggling when stepped on; require explicit engagement (`[E]`, click, disambiguation); add `floor_plate` style for single-fire auto-trigger traps. | **Completed** |
| **BL-88** | **Strategic Fog of War Expansion & Exploratory Vision Dynamics** | **P1** | `v1.25.0` | Broaden Fog of War application across campaign levels (e.g. subterranean crypts, dense jungles, twilight temples, vast labyrinths) to make exploration meaningful and elevate minimap utility; support varied sight radiuses (`viewRadius: 4..8`) and atmospheric lighting gradients. | **Completed** |
| **BL-91** | **Translucent Disambiguation & Two-Stage Interaction Reveal** | **P1** | `v1.25.0` | Refine multi-target proximity HUD to eliminate player character visual occlusion: (1) Make in-world popups and drawers semi-translucent (`backdrop-filter`, `opacity: 0.82`, non-blocking footprint); (2) When multiple items are nearby, render only a single primary `[E]` interact indicator with a small quantity badge (e.g. `[E] • 3`); (3) Only reveal in-world numbered targets (`[1]`, `[2]`, `[3]`) and expanded action options *after* the initial <kbd>E</kbd> / tap is engaged, keeping the viewport pristine during movement. | **Completed** |
| **BL-92** | **Responsive Viewport HUD Collapse, Mobile Clutter Elimination & Menu Auto-Pause** | **P0** | `v1.25.0` | Prevent screen shrinking from clumping topbars, sidebars, inventory, and telemetry over the game world on small screens and mobile: (1) Responsive collapse of topbars, sidebars, radar, and feeds into compact floating quick-action pills/drawers with 1-tap expand/minimize states; (2) Eradicate overlapping HUD elements on viewports $< 768\text{px}$; (3) Automatic engine pause whenever full-screen menus, modals, or expanded overlays obscure visibility of the player and active maze. | **Completed** |
| **BL-93** | **Viewport Zoom Optical Clamping & UI Isolation** | **P1** | `v1.25.0` | Enforce strict upper ($2.0\times$) and lower ($0.5\times$) zoom limits across wheel, touch, and hotkeys; decouple UI menus/modals entirely from canvas zoom; dynamically scale in-world overlay indicators with `--camera-zoom` CSS custom property to prevent visual breakage and rate mismatch. | **Completed** |
| **BL-94** | **Interactive Action Feed History & Companion Drawer** | **P1** | `v1.25.0` | Eradicate feed ephemerality by allowing players to click the feed bar or history button (📜) to inspect full chronological history of events, items, lore notes, and puzzle switches inside the companion Activity History modal with category filters (`All`, `Lore`, `Mech`, `Items`). | **Completed** |
| **BL-95** | **Player Profile Visual Character Customization** | **P1** | `v1.25.0` | Allow players to customize explorer visual presentation in Player Profile (gender / body silhouette: male, female, neutral; hair styles: short, ponytail, curls, bob, bald; hair colors: brunette, raven, blonde, auburn, silver, amethyst; skin tones: fair, warm, olive, bronze, deep); persist customization state; render customizations dynamically in-game and on hero preview canvases. | **Completed** |
| **BL-96** | **Replay Theater Full Graphic Simulation & Vector Asset Alignment** | **P1** | `v1.25.0` | Align replay and walkthrough player coordinates with level tile size (`this.gameLoop.tileSize` instead of hardcoded 32); preload theme vector SVG assets in `test.html` so replays and solver walkthroughs display complete in-game graphics, lighting, and entity assets instead of fallback placeholders. | **Completed** |
| **BL-97** | **Mobile Feed Accessibility, Download Feedback & Site-Wide Button Verification** | **P0** | `v1.25.0` | Restore mobile feed accessibility by docking above virtual controls and providing 1-tap `#hud-feed-pill` in collapsed HUD; provide explicit download toasts/notifications informing mobile users where files are saved; verify and audit all buttons, links, and click targets across all pages for full touch and mouse compatibility. | **Completed** |
| **BL-98** | **Mobile Footer Shortcuts Cheatsheet Drawer** | **P1** | `v1.25.0` | Provide an expandable mobile cheatsheet drawer in `.app-nav-footer` (<kbd>⌨️ Controls</kbd>) displaying desktop keyboard shortcuts alongside mobile touch equivalents (Drag/Swipe movement, pinch zoom, HUD pill toggles) on small screens without page redirection. | **Completed** |
| **BL-99** | **Colorblind Geometric Shape Glyphs on Inventory Keys** | **P1** | `v1.25.0` | Add distinct geometric shape glyph badges (`●`, `▲`, `◆`, `■`, `★`) to held `.key-pill` elements in HUD inventory, guaranteeing instant identification across all color vision variants (protanopia, deuteranopia, tritanopia). | **Completed** |
| **BL-100** | **Custom Keybinding Presets & Pointer Movement Mode Toggle (Issue #63)** | **P1** | `v1.25.0` | Implement settings in Options/Settings menu for key bindings (WASD+Arrows, Arrows only, ESDF, AZERTY ZQSD, Numpad) and pointer navigation toggle (Click-to-Move BFS pathfinding, drag-only steering, or disabled) with live persistence and telemetry reporting. | **Completed** |
| **BL-101** | **Visual Polish & Environmental Fidelity Engine (Deluxe Wall/Floor Details & Animated Torches)** | **P0** | `v1.26.0` | Elevate in-game visual fidelity across all biomes: (1) Rich procedural masonry texture variants (cobblestone pavers, flagstones, moss creep, crystal facets, obsidian veins); (2) Dynamic animated wall-mounted torches and sconces with warm flickering light cones; (3) Thematic floor debris, scattered pebbles, and dust particles; (4) Enhanced architectural depth bevels and ambient occlusion for all wall corners. | **Completed** |
| **BL-102** | **AAA Map Editor Studio Visual Redesign & Architect Tooling Polish** | **P0** | `v1.26.0` | Overhaul Map Editor UI into a professional AAA game dev studio suite: (1) Dark glassmorphic workspace aesthetic with high-contrast accenting; (2) Tool palette overhaul with categorized collapsible groups and active tool badges; (3) Interactive canvas mini-map overview HUD in bottom-right corner; (4) Enhanced status bar with selection coordinates, dimensions, entity count, and solvability state; (5) Rich visual tooltips with hotkey indicators across all tools. | **Completed** |
| **BL-103** | **Interactive Mini-Map Overview HUD in Map Editor** | **P1** | `v1.26.0` | Implement interactive floating mini-map canvas overview HUD (`#editor-minimap-hud`) in editor viewport with live viewport rectangle tracking and 1-click drag navigation across large labyrinths. | **Completed** |
| **BL-104** | **Categorized Accordion Tool Palette in Map Editor Studio** | **P1** | `v1.26.0` | Group sidebar tools into collapsible accordion cards (`Draw Tools`, `Tiles & Bridges`, `Elevation Ramps`, `Architectural Prefabs`, `Custom Prefabs`, `Entities & Markers`) with item count badges, chevrons, and minimized workspace states. | **Completed** |
| **BL-105** | **Procedural Surface Shaders & Environmental Fluid Polish** | **P1** | `v1.26.0` | Add reflective water puddle shimmer with animated ripple rings in Caves, Jungles, and Dungeons; molten lava vein pulses and bubbling hotspots in Magma; diamond sparkle glints in Glacial biomes; and gilded fleck inlays in Sunset/Temple. | **Completed** |

---

### Epic 6: Audio FX & Environmental Ambience
*Objective: Satisfying zero-dependency procedural Web Audio sound design for physical feedback and atmosphere.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-27** | **Procedural Sound FX Engine** | **P0** | `v1.16.0` | Web Audio synthesizer triggers for footsteps, key pickup, door unlock, lever flip, and victory chimes. | **Completed** |
| **BL-28** | **Continuous Environmental Ambience** | **P2** | `v1.22.0` | Ambient procedural background loops: dungeon wind whispers, jungle forest chirps, subterranean cavern drips. | **Completed** |
| **BL-35** | **Tactile UI Audio Cues & Footstep Pitch Jitter** | **P2** | `v1.23.0` | Procedural acoustic micro-clicks for tab changes, editor painting, and footstep frequency randomization ($\pm 3\%$). | **Completed** |
| **BL-77** | **Elevation Transition Chimes & Diagnostic Radar Audio** | **P2** | `v1.24.0` | Harmonic procedural audio chimes for vertical ramp/bridge elevation ascents/descents, and acoustic radar pip for editor issue pin jumps. | **Completed** |

---

### Epic 7: QA Automation, Test Architecture & Scalability
*Objective: Ensure 100% test coverage, modular per-chapter test organization, fast CI gating, and zero cryptographic drift.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-29** | **Export `ALL_LEVELS` & Fix Test Runner** | **P0** | `v1.19.0` | Export `ALL_LEVELS` in `default-levels.js` resolving module syntax crash in `test.html`. | **Completed** |
| **BL-30** | **Modular Per-Chapter Unit Tests** | **P0** | `v1.19.0` | Dedicated test files per chapter (`chapter-1.test.mjs` through `chapter-8.test.mjs`, plus story suites) instead of multi-chapter bundles. | **Completed** |
| **BL-31** | **Automated Zero-Bypass Regression Tests** | **P0** | `v1.19.0` | Prove with BFS solver that `solveLevel(lvl, { allowDoors: false }) === null` for all gated levels. | **Completed** |
| **BL-32** | **Test Harness Failure Summary Diagnostics** | **P1** | `v1.19.0` | Print concise failure summaries and stack traces at the end of `runner.mjs` executions. | **Completed** |
| **BL-45** | **In-Browser Test Runner Diagnostics & Failure Reporter** | **P1** | `v1.20.0` | Resolve failing tests in `test.html`. Provide clean, styled DOM failure summary, module stack traces, and real-time pass/fail tally matching `npm test`. | **Completed** (`f199db4`) |
| **BL-46** | **Replay Theater Graphic Simulation & Full Telemetry** | **P1** | `v1.20.0` | Record structured action telemetry (moves, turns, interactions, rotations); `ReplayPlayer` renders moves through `GameRenderer`. | **Completed** (`f199db4`) |
| **BL-79** | **Automated Visual Entity Canvas Snapshot Regression Diffing & Perf Benchmark** | **P1** | `v1.24.0` | Automated tests validating deterministic canvas operations across all core domain entities (`Key`, `Door`, `Lever`, `Teleporter`, `Pedestal`, `Player` in 6 outfits), 4-way camera rotation matrix verification, and microsecond rendering budget validation ($< 300\text{ms}$ per 1,000 frames). | **Completed** |

---

### Epic 8: Immediate Gameplay & UX Polishing Sprint
*Objective: Resolve critical usability friction, camera rotation discrepancies, asset regressions, and architectural connectors.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-41** | **Generic Icon Regression Fix (Keys, Levers, Doors)** | **P0** | `v1.20.0` | Detect placeholder SVGs and prioritize rich procedural Canvas 2D vector rendering with distinctive colorways, key cuts, lever pivot geometry, and lock bars. | **Completed** (`8b5cbcb`) |
| **BL-42** | **Unobtrusive Tile Interaction HUD & 'E' Hotkey Switch** | **P1** | `v1.20.0` | Switch interaction hotkey to `E` (Space/Enter as secondary); remove obtrusive avatar pop-up; add subtle in-world tile prompt or clean side HUD drawer. | **Completed** (`b9ea9dc`) |
| **BL-43** | **4-Quadrant Camera Rotation Matrix & Grid Alignment Fix** | **P0** | `v1.20.0` | Full 4-way rotation cycling (0° -> 90° -> 180° -> 270°); fix `worldToScreen` and `screenToWorld` coordinate transform so player remains locked to true tile center. | **Completed** (`b9ea9dc`) |
| **BL-44** | **Distinct Dual-Tileset Pipeline (Minimal Top-Down vs Deluxe 2.5D)** | **P2** | `v1.21.0` | Top-down mode renders clean architectural blueprints with vector glyphs; 2.5D renders depth, wall caps, dynamic shadows, and atmospheric particle layers. | **Completed** (`f48f0c1`) |
| **BL-47** | **Seamless Bridge & Ramp Architectural Overhaul** | **P2** | `v1.20.0` | Eliminate clumsy directional arrows; render authentic stone masonry treads, archway abutments, and seamless elevation transitions. | **Completed** (`b9ea9dc`) |
| **BL-48** | **Campaign-First Hub Redirection & Onboarding Flow** | **P2** | `v1.21.0` | Route players to official campaign first; present standalone stories and community levels in organized secondary discovery carousels. | **Completed** (`2943fc4`) |
| **BL-49** | **Multi-Room Story Campaign Authoring in Map Editor** | **P2** | `v1.22.0` | Multi-room story authoring with interconnected scenes, shared inventory persistence, and narrative dialog scripting. | Planned |
| **BL-50** | **Random Maze Generator & Endless Labyrinth Mode** | **P2** | `v1.22.0` | Procedural maze generator in editor and playable infinite/endless maze mode with selectable dimensions, biomes, and obstacle density. | **Completed** |
| **BL-51** | **Secret Rooms, Fake Walls & Concealed Collectibles** | **P2** | `v1.21.0` | Passable illusory walls concealing secret alcoves, bonus stars, and lore notes with subtle audio/visual proximity hints. | **Completed** (`f48f0c1`, `6e13db2`) |
| **BL-52** | **Performance Scoring & Tiered Victory Medals** | **P2** | `v1.21.0` | Move, secret, and time-based scoring awarding Gold/Silver/Bronze medals and prestige stars across all campaign chapters. | **Completed** (`f48f0c1`, `12a48e1`) |

---

### Epic 9: Architecture Modernization, SOLID Refactoring & Code Elegance
*Objective: Transform monolithic "god-classes" and procedural switch blocks into simple, elegant, explainable, highly testable, readable, and robust Object-Oriented modules adhering strictly to SOLID principles and clean architectural separation.*

| ID | Title | Priority | Target Milestone | Acceptance Criteria | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **BL-56** | **Engine Decomposition & SRP Refactoring (`GameLoop` God-Class Split)** | **P1** | `v2.0.0` | Decompose monolithic `game-loop.js` (~2,250 lines) into focused, single-responsibility collaborators: `MovementController` (motion & collision mediation), `InteractionDispatcher` (entity activation), and `GameStateManager` (scoring, par steps/time, level lifecycle). Keep all modules $\le 300$ lines. | Planned |
| **BL-57** | **Polymorphic Entity Domain Models (Open/Closed Principle)** | **P1** | `v2.0.0` | Replace procedural switch/case logic with clean object-oriented entity classes (`KeyEntity`, `DoorEntity`, `LeverEntity`, `PedestalEntity`, `HazardEntity`) implementing an explicit `Interactable` / `Collidable` contract (`canInteract()`, `onInteract()`, `onCollide()`, `getPrompt()`). | **Completed** |
| **BL-58** | **Editor Studio Modularization (`EditorUI` & `EditorCanvas` Split)** | **P1** | `v2.0.0` | Decompose monolithic `editor-ui.js` (~1,800 lines) into cohesive sub-controllers: `ToolbarController`, `ProjectModalManager`, `DiagnosticsController`, and `EditorShortcutHandler` adhering to SRP and clean event mediation. | Planned |
| **BL-59** | **Clean Input Handling & Command Pattern (`InputManager`)** | **P1** | `v2.0.0` | Extract keyboard, mouse, gamepad, and touch listeners from `GameLoop` and HTML scripts into a standalone `InputManager` emitting discrete semantic `GameCommand` objects (`MoveCommand`, `InteractCommand`, `RotateCommand`). Facilitates clean unit testing without ad-hoc DOM event mocks. | **Completed** |
| **BL-60** | **Decoupled UI Contract & Presentation Layer (Dependency Inversion)** | **P1** | `v2.0.0` | Replace ad-hoc `uiCallbacks` object literals with an explicit `IGamePresenter` interface contract and granular event subscriptions (`onInventoryChanged`, `onStepTaken`, `onElevationChanged`), eliminating full-DOM recalculations on every step and TDZ initialization hazards. | Planned |
| **BL-61** | **Value Objects & Clean Geometry Math (`Vec2`, `GridRect`, `Heading`)** | **P2** | `v2.0.0` | Replace loose `{x, y}` object literals and repeated ad-hoc math (`Math.hypot`, distance clamps, rotational transforms) with immutable, elegant Value Objects: `Vec2` / `Coord2D`, `GridRect`, and `Heading` with self-documenting methods. | **Completed** |
| **BL-62** | **Defensive Guard Clauses & Code Elegance Standards (ADR-007)** | **P2** | `v2.0.0` | Establish ADR-007 formalizing graceful coding standards: early return guard clauses over nested indentation, eradication of magical sentinel numbers (`-1`, string splitting IDs), maximum file length guidelines ($\le 300$ lines), and consistent error handling paradigms. | **Completed** |

---

## 3. Sprint Planning & Delivery Roadmap

```mermaid
flowchart LR
    subgraph Sprint 1: Foundation & Audit [v1.19.0 Current]
        S1A["Level Design Philosophy & Critical Rubric"] --> S1B["Audit Register & Gap Analysis"]
        S1B --> S1C["Chapter 1 & 2 Kishōtenketsu Workshop"]
        S1C --> S1D["Per-Chapter Modular Unit Tests"]
    end

    subgraph Sprint 2: Immediate Fixes & Polish [v1.20.0 Next]
        S2A["BL-41: Key/Lever Graphics Fix"] --> S2B["BL-42: 'E' Key & Unobtrusive HUD"]
        S2B --> S2C["BL-43: 4-Way Rotation Alignment"]
        S2C --> S2D["BL-45/46: Browser Test & Replay"]
        S2D --> S2E["BL-47: Seamless Ramps & Bridges"]
    end

    subgraph Sprint 3: Deep Systems & Modes [v1.21.0 Future]
        S3A["BL-44: Dual Tileset Pipeline"] --> S3B["BL-51: Secrets & Fake Walls"]
        S3B --> S3C["BL-52: Performance Medals"]
        S3C --> S3D["BL-50: Endless Maze Mode"]
    end

    subgraph Sprint 4: Architecture Modernization & SOLID [v2.0.0 Future]
        S4A["BL-56: GameLoop SRP Split"] --> S4B["BL-57: Polymorphic Entities"]
        S4B --> S4C["BL-58: Editor Modularization"]
        S4C --> S4D["BL-59/60: Input & UI Presenter"]
        S4D --> S4E["BL-61/62: Value Objects & ADR-004"]
    end

    subgraph Sprint 5: Fog of War, Macro-Labyrinths & Viewport Zoom [v1.25.0 Planned]
        S5A["BL-87: Viewport Zoom & Optical Scale"] --> S5B["BL-88: Strategic Fog of War Expansion"]
        S5B --> S5C["BL-89: Macro-Labyrinths & New Chapters"]
        S5C --> S5D["BL-90: Classical Maze Topologies"]
    end

    Sprint 1 --> Sprint 2 --> Sprint 3 --> Sprint 4 --> Sprint 5
```

---

## 4. Backlog Governance & Updating Guidelines
1. **New Issues & User Feedback**: When new gaps, bugs, or user requests are identified, record them immediately in this document with an ID (`BL-XX`), priority, and clear acceptance criteria.
2. **Atomic Commits**: As backlog items are completed, link the conventional commit or PR number in the status column.
3. **Traceability**: All items in `docs/PROJECT_MANAGEMENT.md` and `docs/GAP_ANALYSIS_AND_IMPROVEMENT_PLAN.md` must cross-reference this master backlog.

