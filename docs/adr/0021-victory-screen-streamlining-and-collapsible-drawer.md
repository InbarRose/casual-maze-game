# ADR-0021: Level Victory Screen Streamlining & Collapsible More Drawer

## Status
Accepted

## Date
2026-10-10

## Context & Problem Statement
Upon completing a level or labyrinth, the victory overlay modal (`#victory-modal`) presented an overwhelming, bloated presentation:
1. **Button Clutter**: Seven large, multi-colored buttons were mashed together in the modal footer (`Level Select`, `🎬 Watch Run Replay`, `💾 Save Game Progress`, `📥 Debug Logs`, `🐞 Feedback / Report`, `Replay`, `Next Level [Space / Enter] →`), creating decision fatigue and pushing actionable controls off-screen on smaller viewports.
2. **Verbose Labeling**: Stat cards displayed verbose labels ("Performance Score", "Time Elapsed", "Steps Taken", "Secrets Unveiled") inside oversized containers taking excessive vertical space.
3. **Modal Height & Responsiveness**: Heavy vertical margins, large bouncy icons ($3.5\text{rem}$), and bloated footer buttons caused the modal to exceed $70\text{vh}$ on laptops and mobile devices, forcing annoying vertical scrolling.

The user requested:
> *"the level ending screen is bloated. too many buttons and too large. collapse all the non basic instructions to "more" basically we should see "next level" or "more" and maybe a few icons for quick access to report bug or watch replay, but those should also show up on the "more" button. the labels and timings and score should be streamlined and optimized please."*

## Decision
1. **Primary Action Bar & Quick Icon Group**:
   - The modal footer is redesigned into a streamlined single-line primary action bar:
     - **Primary Action**: Prominent `[ Next Level [Space / Enter] → ]` button.
     - **Quick Icon Group**: Three compact, subtle icon buttons for 1-tap utility (`🔄 Retry Level`, `🎬 Watch Run Replay`, `🐞 Report Bug / Feedback`).
     - **More Toggle**: `[ More ▾ ]` toggle button with dynamic active indicator and rotating chevron.
2. **Collapsible "More" Drawer**:
   - Secondary utilities are consolidated into an animated collapsible drawer (`#victory-more-drawer`) directly beneath the primary action bar.
   - When expanded, it reveals a clean 2-column grid of all six options with clear icons and descriptive labels:
     - 🎬 **Watch Run Replay** (`#btn-vic-watch-replay`)
     - 🔄 **Retry Labyrinth** (`#btn-replay`)
     - 🗺️ **Level Select Hub** (`#btn-vic-level-select`)
     - 💾 **Save Progress** (`#btn-save-progress`)
     - 📥 **Debug Telemetry** (`#btn-download-log`)
     - 🐞 **Report Bug / Feedback** (`#btn-vic-report-issue`)
   - Tapping `[ More ▾ ]` smoothly slides the drawer down/up, switching the button label between `More ▾` and `Less ▴`.
   - The drawer automatically collapses when entering a victory state or when starting a replay.
3. **Streamlined Metrics & Micro-Typography**:
   - Condensed verbose labels into sleek, standard terms: `Score`, `Time`, `Steps`, and `Secrets`.
   - Applied thematic color highlights: gold glow for score, cyan for time, emerald for steps, and purple for secrets.
   - Scaled down the trophy icon to a refined $2.6\text{rem}$ with a gentle float animation, compacting vertical margins.
   - Streamlined medal pills to concise chips (`★ Cleared`, `👟 Pathfinder`, `⏱️ Speed`, `🔍 Sleuth`, `🛡️ Flawless`).
4. **Preserved Backward Compatibility**:
   - Retained all existing button IDs, keyboard listeners (Space / Enter for `btn-next-level`), and automated test hooks.

## Consequences
### Positive
- **Visual Elegance**: Reduces initial victory screen footprint by $>50\%$, fitting comfortably on mobile viewports ($\le 90\text{vh}$) without vertical scroll.
- **Cognitive Clarity**: Players instantly know their main path forward (`Next Level`), with quick 1-tap icons for common power actions.
- **Clean Extensibility**: Additional diagnostic or social tools can be added to the "More" drawer in the future without cluttering the primary victory screen.

### Negative / Trade-offs
- Secondary actions like "Save Game Progress" and "Debug Logs" are now behind a second tap via the "More" drawer (while quick icons remain immediate).
