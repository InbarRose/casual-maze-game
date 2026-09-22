# Expert Panel Component Audit Rubric & Quality Control Standard

This document establishes the official multi-perspective judging rubric, granular scoring dimensions, and uncompromising quality standards for auditing all **platform components, user interfaces, engine subsystems, editor studios, tooling, and infrastructure** in the **Casual Maze Game**.

* **Audit Standard**: Platform Component & Subsystem Quality Control Standard
* **Version**: `1.0.0`
* **Auditing Philosophy**: **Simulated Expert Panel Review.** Every application component—from the rendering canvas to the settings modal, from the map editor to the bug reporting workflow—is subjected to a comprehensive, multi-faceted evaluation by six domain expert judges. Each judge assesses three distinct criteria on an absolute **1 to 10 scale**. Category scores are computed from the arithmetic average of these criteria, producing a rigorous master score out of 60 (and normalized percentage).
* **Guiding North Stars**:
  1. **Pure Static GitHub Pages Architecture**: 100% client-side execution, zero server runtime dependencies, instantaneous cold boot, offline-ready resilience, and cryptographic asset integrity.
  2. **Delightful Indie Game Feel & Tactile "Juice"**: Emulating masterworks of deliberate physical charm (*World of Goo*, *Braid*, *The Witness*, *Baba Is You*, *Celeste*, *Monument Valley*) with rich kinetic feedback, acoustic crunch, micro-animations, and anti-sterility.

---

## 1. Expert Panel Evaluation Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   6-CHAIR PLATFORM COMPONENT AUDIT SYSTEM                              │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ Chair 1: Game Feel & "Juice"  │ Chair 2: Static Web Systems   │ Chair 3: UI/UX & Info  │
│ • 1.1 Kinetic Response (1–10) │ • 2.1 Static Purity (1–10)    │ • 3.1 Visual Harmony(1–10)│
│ • 1.2 Acoustic Feedback(1–10) │ • 2.2 Cold Boot & Mem (1–10)  │ • 3.2 Cognitive Load(1–10)│
│ • 1.3 Charm & Anti-Sterility  │ • 2.3 Drift & Offline (1–10)  │ • 3.3 Multi-Device (1–10) │
│ Category 1: Avg (1.0–10.0)    │ Category 2: Avg (1.0–10.0)    │ Category 3: Avg (1.0–10.0)│
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ Chair 4: Mechanics & Depth    │ Chair 5: Player Progression   │ Chair 6: Inclusivity   │
│ • 4.1 Systemic Rigor (1–10)   │ • 5.1 Save Resilience (1–10)  │ • 6.1 Accessibility(1–10)│
│ • 4.2 Multi-Input Parity(1–10)│ • 5.2 Prestige Rewards (1–10) │ • 6.2 Documentation(1–10)│
│ • 4.3 Emergent Synergy (1–10) │ • 5.3 Retention Loop (1–10)   │ • 6.3 Bug/Dev Ergo (1–10) │
│ Category 4: Avg (1.0–10.0)    │ Category 5: Avg (1.0–10.0)    │ Category 6: Avg (1.0–10.0)│
├───────────────────────────────┴───────────────────────────────┴────────────────────────┤
│ MASTER COMPONENT SCORE = Sum of Categories 1–6 (6.0 – 60.0 pts / 10.0% – 100.0%)       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mathematical Formulation
For each Category $C_k$ ($k \in \{1, \dots, 6\}$):
$$\text{Category Score}_k = \frac{\text{Criterion}_{k.1} + \text{Criterion}_{k.2} + \text{Criterion}_{k.3}}{3} \quad (1.00 \le \text{Category Score}_k \le 10.00)$$

$$\text{Master Component Score} = \sum_{k=1}^{6} \text{Category Score}_k \quad (6.00 \le \text{Master Score} \le 60.00)$$

$$\text{Normalized Percentage} = \frac{\text{Master Component Score}}{60} \times 100\%$$

---

## 2. Detailed Expert Panel Rubrics & Scoring Criteria

### Chair 1: Game Feel & Tactile "Juice" Director — Kinetic Feedback & Charm
*Domain: Physical delight, visceral feedback, micro-animations, acoustic crunch, and elimination of sterile software feel.*

* **Criterion 1.1: Kinetic Responsiveness & Motion Feedback (1–10)**
  * *10*: Exhilarating physical response. Every button press, movement step, slider drag, and tool paint yields springy easing, slight scale pops, button depression, ripple effects, or particle bursts. Nothing is visually static.
  * *6–8*: Responsive hover and active states with CSS transitions, but lacking bouncy spring dynamics or playful particle squashes.
  * *1–5*: Lifeless, stiff, or sterile software interface. Elements snap rigidly with zero tweening, no micro-transitions, and zero visceral satisfaction.

* **Criterion 1.2: Acoustic Texture & Sound "Crunch" (1–10)**
  * *10*: Rich, tactile sound design. Procedural audio clicks, wooshes, snaps, chimes, and thuds provide immediate acoustic confirmation for every UI interaction, modal toggle, and game mechanic. Frequencies are tuned to avoid ear fatigue while delivering crisp physical gratification.
  * *6–8*: Clean sounds for primary gameplay events (doors, keys, victory), but secondary UI menus, slider drags, and editor tools lack sound feedback.
  * *1–5*: Completely mute, abrasive synthetic square-wave beeps, or lagging audio response that breaks immersion.

* **Criterion 1.3: Charm, Whimsy & Anti-Sterility (1–10)**
  * *10*: Radiant indie game charm (*World of Goo* spirit). Diegetic tooltips, playful character idle animations, celebratory confetti/stars on achievements, expressive error messages, and whimsical micro-copy that makes using the tool an absolute pleasure.
  * *6–8*: Clean and pleasant design with tasteful emojis and icons, but leans toward standard productivity software rather than a joyful toy.
  * *1–5*: Cold, corporate, utilitarian administrative panel feel with clinical error strings.

---

### Chair 2: Static Web Systems Architect — Static Purity, Performance & Reliability
*Domain: 100% client-side GitHub Pages compliance, memory efficiency, offline autonomy, and cryptographic integrity.*

* **Criterion 2.1: Zero-Backend Static Purity (1–10 - Gatekeeper)**
  * *10*: Absolute architectural purity. Runs 100% client-side on modern evergreen browsers hosted on GitHub Pages via static files (HTML5, CSS3, ES6+ modules, Canvas 2D). Zero Node.js or server runtimes in production. Clean URL handling without server rewrites.
  * *6–8*: Pure static runtime, but contains minor dead code or dev-server assumptions in production scripts.
  * ***AUTOMATIC 0/10 & AUDIT REJECTION***: Any component requiring a server-side process, API proxy, cloud database, or server rendering to function in production.

* **Criterion 2.2: Cold Boot Speed, Frame Budget & Memory Footprint (1–10)**
  * *10*: Blazing fast cold start ($< 250\text{ms}$ to interactive). Rock-solid 60 FPS under heavy particle and lighting loads. Zero memory leaks: listeners, timers, intervals, and audio nodes are cleanly disposed of upon component unmount.
  * *6–8*: Fast load ($< 800\text{ms}$), sustains 55–60 FPS on desktop, but shows minor frame drops on lower-end mobile devices during rapid canvas redraws.
  * *1–5*: Sluggish boot ($> 2000\text{ms}$), noticeable garbage collection hitching, uncleaned event listeners, or unbounded DOM/canvas memory leaks.

* **Criterion 2.3: Cryptographic Integrity, Drift Audit & Offline Resilience (1–10)**
  * *10*: 100% synchronized with SHA-256 asset manifests. Fully autonomous offline capability (works from local filesystem or service worker). Zero broken relative paths, asset 404s, or unmanifested drift.
  * *6–8*: Offline functional, all assets verified by drift tests, but lacks progressive caching hints or graceful offline fallback banners.
  * *1–5*: Broken asset links, unmanifested drift, or hardcoded external CDN dependencies that fail when disconnected from the internet.

---

### Chair 3: UI/UX & Information Design Lead — Ergonomics & Usability
*Domain: Glassmorphic aesthetic cohesion, visual hierarchy, mobile touch targets, and responsive layout harmony.*

* **Criterion 3.1: Glassmorphic Visual Cohesion & Layout Rhythm (1–10)**
  * *10*: Breathtaking visual consistency. Unified design token architecture (`var(--bg)`, `var(--card-bg)`, `var(--accent)`, `var(--radius-md)`), dark glassmorphic backdrops with subtle border specular highlights (`rgba(255, 255, 255, 0.08)`), consistent typography hierarchy, and proportional spacing rhythms across all pages.
  * *6–8*: Visually cohesive and clean dark mode aesthetic, but minor token deviations or font-size inconsistencies between separate modal windows.
  * *1–5*: Clashing color palettes, mismatched border radii, inconsistent margins, and garish unstyled HTML form widgets.

* **Criterion 3.2: Cognitive Load & Information Architecture (1–10)**
  * *10*: Effortless wayfinding. Critical metrics (keys, par steps, coordinates, layer badges) are scannable at a single glance. Complex configurations are organized into progressive disclosure tabs. Zero confusing terminology; unambiguous iconographic metaphors.
  * *6–8*: Clear layout, but occasional modal screens present too many controls simultaneously without sufficient visual grouping.
  * *1–5*: Overwhelming wall of unformatted controls, cryptic labels, hidden controls without visual affordance, and high user confusion.

* **Criterion 3.3: Multi-Device Responsiveness & Mobile Ergonomics (1–10)**
  * *10*: Flawless multi-device parity. Desktop mouse/keyboard, tablet stylus, and handheld phone screens are all first-class citizens. Touch targets strictly observe the $\ge 44\text{px}$ standard. Zero horizontal overflow, viewport bouncing, or cut-off dialogs on small viewports ($375\text{px}$ to $4K$).
  * *6–8*: Mobile friendly with responsive grid collapse, but minor tight spacing on screens $< 400\text{px}$ wide.
  * *1–5*: Broken mobile experience: dialogs overflow screen edges, desktop hover dependencies block mobile usage, or touch targets are microscopic ($< 24\text{px}$).

---

### Chair 4: Gameplay Mechanics & Deep Systems Engineer — Mechanics & Input Parity
*Domain: Mathematical solvability, multi-input parity, collision precision, state machine determinism, and emergent depth.*

* **Criterion 4.1: Systemic Rigor & Edge-Case Robustness (1–10)**
  * *10*: Indestructible mechanics. Elevation shifts across bridges and ramps, multi-target clockwork levers, lock-and-key state transitions, and carryable puzzle pedestals transition deterministically with zero stuck states, glitch exploits, or coordinate desyncs.
  * *6–8*: Solid mechanics, but rare edge cases (e.g. rapid direction changes while stepping onto a ramp) cause minor visual jitter before resolving.
  * *1–5*: Fragile mechanics where players can clip through walls, desync from bridges, or create unrecoverable game states without feedback.

* **Criterion 4.2: Multi-Input Parity & Ergonomic Parity (1–10)**
  * *10*: Supreme input flexibility. Seamless simultaneous support for Keyboard (`WASD`, Arrows, customizable hotkeys), Mouse (smart BFS click-to-move, drag panning, wheel zoom), and Mobile Touch (cardinal swipe navigation, contextual interaction pills, pinch zoom). Every action is equally accessible regardless of input hardware.
  * *6–8*: Excellent keyboard and mouse navigation; touch controls work well but lack customizable sensitivity or haptic simulation.
  * *1–5*: Exclusively optimized for desktop keyboard; mouse click-to-move is broken or missing, and mobile touch is virtually unplayable.

* **Criterion 4.3: Mechanical Depth & Emergent Puzzle Synergy (1–10)**
  * *10*: Profound systemic depth. Interlocking mechanics (elevated walkways crossing over ground corridors, levers toggling passage walls, directional teleporters, timed pressure plates, carryable animal statues) combine into intricate, elegant puzzles with high emergent potential.
  * *6–8*: Strong variety of mechanics that work well together, but primarily interact through basic lock-and-key sequences.
  * *1–5*: Shallow, one-dimensional mechanics; purely navigating corridors with no interactive puzzle elements.

---

### Chair 5: Player Progression & Persistence Custodian — Retention & Ownership
*Domain: Save state resilience, player identity, achievements, medal calibration, and cloudless data portability.*

* **Criterion 5.1: Save State Resilience & Cloudless Portability (1–10)**
  * *10*: Bulletproof data preservation. Automatic persistence to `localStorage` with versioned schema migrations, corruption fallback, and 1-click JSON export/import. Players have complete ownership of their save file with zero cloud lock-in.
  * *6–8*: Reliable `localStorage` persistence with JSON backup download, but lacks automated schema migration for legacy save versions.
  * *1–5*: Fragile storage prone to silent overwriting, lack of export/import backup mechanisms, or save corruption on browser clearing.

* **Criterion 5.2: Prestige Rewards, Par Calibration & Achievement Economy (1–10)**
  * *10*: Deeply rewarding progression. Player rank scales dynamically across earned campaign, tutorial, and story stars. Granular completion medals (Completion, Par Steps, Par Time, Flawless) are empirically calibrated using algorithmic BFS solvers.
  * *6–8*: Clear star counts and player titles, but par steps and par times feel estimated rather than mathematically calibrated on some levels.
  * *1–5*: Flat win/lose screen with no medals, zero performance rating, no player rank titles, and zero replay incentive.

* **Criterion 5.3: Player Onboarding & Compelling Retention Loop (1–10)**
  * *10*: Irresistible retention loop. Seamless onboarding through self-guided interactive tutorials, clear visual signposts, immediate level unlock celebrations, branching campaign paths, and community story chapters that pull players naturally through the game.
  * *6–8*: Good chapter progression and clear stage selection, but early levels could introduce advanced bridge mechanics with more gradual pacing.
  * *1–5*: Sudden difficulty spikes, unguided mechanics, zero clear progression roadmap, and high early player drop-off.

---

### Chair 6: Accessibility, Tooling & Community Director — Inclusivity & DX
*Domain: WCAG accessibility, colorblind support, in-app documentation, developer diagnostic ergonomics, and issue reporting.*

* **Criterion 6.1: Visual & Motor Accessibility (1–10)**
  * *10*: Universally inclusive. Full high-contrast mode with bold borders, distinct geometric shape glyphs on keys and doors for all colorblind variants (protanopia, deuteranopia, tritanopia), high-visibility player highlights, full keyboard navigation with visible focus rings, and screen-reader aria labels.
  * *6–8*: High contrast mode exists in CSS, but colorblind shape glyphs on vector doors/keys are partial, or some modal buttons lack explicit `aria-label` tags.
  * *1–5*: Totally inaccessible to colorblind or low-vision players; relying exclusively on hue to differentiate keys, with tiny unbordered text and zero keyboard focus rings.

* **Criterion 6.2: In-App Documentation & Architect Handbooks (1–10)**
  * *10*: Comprehensive, accessible guidance. In-app Architect Guide modal with architectural philosophy, shortcut cheatsheets, puzzle wiring walkthroughs, and diegetic signposts that explain mechanics without breaking character.
  * *6–8*: Helpful guide modal and keyboard shortcuts list, but lacks visual diagrams for multi-elevation bridge ramp placement.
  * *1–5*: Zero in-game help or documentation; players and creators are left to guess controls and editor tools through trial and error.

* **Criterion 6.3: Developer Tooling, Diagnostics & Community Bug Channels (1–10)**
  * *10*: World-class developer experience. Replay Theater & Diagnostics Lab with step-by-step state inspection, zero-dependency automated test runner ($> 400$ tests in $< 600\text{ms}$), 1-click diagnostic state export for bug reporting, and structured GitHub issue forms with automated log ingestion.
  * *6–8*: Great test suite and basic debug logging, but lacks 1-click diagnostic export bundling save state, browser telemetry, and action history into GitHub issue links.
  * *1–5*: No automated test harness, silent console errors, and no structured bug reporting templates for players.

---

## 3. Tier Classification & Scoring Thresholds

| Master Score (pts) | Normalized (%) | Tier Classification | Engineering Action Standard |
| :---: | :---: | :---: | :--- |
| **54.00 – 60.00** | **90.0% – 100.0%** | **S-Tier (Masterpiece)** | Exemplary standard. Serves as reference implementation for future subsystems. |
| **45.00 – 53.99** | **75.0% – 89.9%** | **A-Tier (Release Candidate)** | Production ready. Minor cosmetic or ergonomic polish items tracked for scheduled sprints. |
| **36.00 – 44.99** | **60.0% – 74.9%** | **B-Tier (Functional Baseline)** | Workable, but possesses noticeable friction, lacking game feel "juice", or partial mobile parity. Targeted for immediate upgrade. |
| **27.00 – 35.99** | **45.0% – 59.9%** | **C-Tier (Substandard / Deficient)** | Significant usability, accessibility, or technical debt. Requires structured refactor plan before feature expansion. |
| **< 27.00** | **< 45.0%** | **D-Tier (Critical Failure / Broken)** | Unacceptable. Fails core reliability, accessibility, or game feel criteria. Immediate emergency fix required. |

---

## 4. Automatic Deduction Penalties

The expert panel applies explicit mathematical deductions to the raw Master Score for specific critical defects:

1. **Static Violation Penalty**: $-30\text{ pts}$ if any production code introduces a runtime server dependency or non-static API requirement.
2. **Colorblind Gating Penalty**: $-5\text{ pts}$ if any interactive key, door, or hazard relies solely on color hue with zero shape/glyph or text distinction.
3. **Mobile Lock Penalty**: $-4\text{ pts}$ if any core user journey cannot be completed on a mobile touch screen due to desktop hover dependencies.
4. **Data Loss Penalty**: $-6\text{ pts}$ if unexpected browser refresh or modal dismissal causes silent loss of user progress or editor creations without auto-save or confirmation.
5. **Headless Test Failure**: $-10\text{ pts}$ if any component causes automated tests to crash or fail in headless Node.js environments.
