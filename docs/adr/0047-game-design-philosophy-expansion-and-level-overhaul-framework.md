# ADR-0047: Master Game Design Philosophy Expansion & 7-Phase Methodical Level Overhaul Framework

## Status
Accepted

## Date
2026-10-20

## Context
The ground-truth scoring recalibration (BL-162, ADR-0046, Rubric v5.0.0) established an unsparing baseline where the platform averages **40.6%** (ranging from 30.0% to 49.9%), classifying all 53 levels as functional drafts and Minimum Shippable Products (MSP).

The audit diagnosed four fundamental gameplay and aesthetic shortcomings:
1. **Linear Key-Door Chores**: Many keys are located at the terminus of a single forced corridor, reducing puzzles to mindless manual walking labor without decision friction or deductive trade-offs.
2. **Flat Decal Boxes & Cosmetic Placeholders**: Declared decorative assets often render as flat static vector stamps or unshaded glyphs that do not cast light, generate shadows, or emit particle feedback.
3. **Uniform 1-Tile Corridor Trenches**: Layouts frequently consist of endless 1-tile wide hallway grids lacking varied room volumes, grand courtyards, or architectural centerpieces.
4. **Minimal Sensory Juice**: Movement and collection lack visceral feedback (screen punch, particle bursts, terrain-specific footstep acoustics).

To systematically elevate all platform levels from their current prototype scores (30–48%) to commercial indie excellence ($\ge 60\%–75\%+$), the project requires an authoritative expansion of its Game Design Philosophy and a structured, multi-phase execution roadmap.

## Decision

1. **Expand `docs/LEVEL_DESIGN_PHILOSOPHY.md` to Version 2.0.0**:
   Establish binding architectural and gameplay laws across six core dimensions:
   - **Law of Non-Linear Gating**: Absolute ban on single-hallway keyhole fetch chores. Every key acquisition must involve branching exploration, inventory dilemmas (which door to open first), or environmental state changes (draining water, shifting walls).
   - **Law of Living Visual Depth**: Absolute ban on flat static decals and grey box placeholders. Decorative props must feature dynamic radial light casting, floor paver illumination, reactive fluid shaders, and particle motes.
   - **Law of Spatial Rhythm & Volume Contrast**: Absolute ban on uniform 1-tile corridor mazes. Every level must synthesize winding labyrinth paths ($\ge 70\%$ corridor inertia) with spacious courtyards ($3\times 3$ to $5\times 5$), colonnades, and memorable architectural anchors.
   - **Law of True 3D Verticality**: Multi-elevation structures must serve genuine topological functions. Upper battlements must provide tactical Fog of War reconnaissance of lower chambers; viaducts must cross active transit tunnels; ramps must feature smooth visual ascent.
   - **Law of Environmental Antiquity**: Every ruin must convey its historical architectural identity (sunken aqueduct, molten foundry, astronomical observatory). Clues for secrets (`SW`) must be woven into masonry wear, moisture stains, and fresco murals.
   - **Law of Sensory Juice & Whimsical Humanity**: Interacting with the world must feel joyful at 60 FPS. Movement must feature pitch-jittered terrain steps; unlocks must deliver screen punch and particle bursts; Architect Journal lore must blend witty ancient banter with atmospheric worldbuilding.

2. **Establish the 7-Phase Methodical Level Overhaul Master Plan**:
   - **Phase 1: Engine & Visual Polish Prerequisites**:
     Implement dynamic radial torchlight casting onto adjacent floor pavers, fluid particle emitters, screen punch on gate unlocks, and footstep audio pitch-jitter.
   - **Phase 2: Foundations & Tutorial Academy (Tutorial 1–6, Ch 1 Levels 1–4)**:
     Introduce room volume contrast, non-linear branching for keys, visual landmarks, elevating scores from ~28 to $\ge 50$ (MSP+).
   - **Phase 3: Vertical Dimension & Clockwork Foundries (Ch 2 & 3, Levels 5–12)**:
     Overhaul elevated ramparts, multi-deck viaducts, dynamic shifting walls, and shortcut loops.
   - **Phase 4: Astral Portals & Molten Gauntlets (Ch 4 & 5, Levels 13–20)**:
     Integrate 3D rifts, hazard gauntlets, stealth patrols, and timing anticipation beats.
   - **Phase 5: Arcane Scriptoriums & Trials of Ascent (Ch 6 & 7, Levels 21–28)**:
     Implement cipher dial logic, multi-elevation bastions, and non-trivial deduction chains.
   - **Phase 6: Monolith Spire, Sunken Aqueducts & Apex of the Prism (Ch 8, 9 & 10, Levels 29–40)**:
     Refine macro-mazes, 4-way camera rotation revelations, water sluice gates, and epic sanctum finales.
   - **Phase 7: Episodic Story Sagas (Guardians, Whispering Citadel, Sunken Vaults)**:
     Deepen multi-room narrative transitions, cinematic pacing, and grand sanctum payoffs.

## Consequences

### Positive
- **Clear Engineering & Design Mandate**: Eliminates ambiguity regarding what separates a 4-point prototype from a 7-point indie standout.
- **Methodical, Low-Risk Execution**: Breaking overhauls into 7 discrete phases prevents monolithic regressions and enables continuous automated testing.
- **Preserved Vision with Superior Craftsmanship**: Keeps the original level themes, stories, and mechanics intact while radically improving layout pacing, visual depth, and cognitive delight.

### Negative / Trade-offs
- Requires dedicated implementation sprints across both engine visual rendering and level package geometry.
