# Expert Panel Level Audit Rubric & Quality Control Standard

This document establishes the official multi-perspective judging rubric, granular scoring dimensions, scrutiny standards, and quality thresholds for auditing all campaign levels, tutorial chapters, and episodic story sagas in the **Casual Maze Game**.

* **Audit Standard**: Expert Panel Quality Control Standard (Ground-Truth Gameplay & Aesthetics Edition)
* **Version**: `5.0.0`
* **Governing ADRs**: [`docs/adr/0045-level-design-and-visual-scoring-framework.md`](adr/0045-level-design-and-visual-scoring-framework.md) & [`docs/adr/0046-ground-truth-empirical-level-scoring-rubric.md`](adr/0046-ground-truth-empirical-level-scoring-rubric.md)
* **Auditing Philosophy**: **Simulated 8-Chair Expert Panel Review.** Every level across the platform is subjected to unsparing scrutiny by eight domain expert judges. Rather than evaluating theoretical JSON declarations (e.g. counting whether a decorative array exists or whether a key was placed), the panel evaluates **actual, live gameplay experience in practice**.
* **Concrete Anchor Points (1–10 Scale)**:
  * **Score 5 = Minimum Shippable Product (MSP)**: Functional baseline web game; zero crashes, solvable, but generic, zero "wow" factor, flat decal boxes, and linear keyhole chores.
  * **Score 10 = AAA Best-In-Class Benchmark**: Genre-defining masterpieces (*Portal 2, Zelda dungeons, Monument Valley*); seamless union of mechanics, spatial grandeur, dynamic lighting, and intellectual epiphany.
  * **Current Platform Reality = Scores 3, 4, 5 (Average < 50%)**: Reflects an honest baseline prototype requiring substantive gameplay and visual overhauls to reach commercial indie standards.

---

## 1. 8-Chair Evaluation Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        8-CHAIR EXPERT PANEL AUDIT SYSTEM (RUBRIC v5.0.0)                         │
├─────────────────────────────────┬─────────────────────────────────┬──────────────────────────────┤
│ Chair 1: Spatial & Labyrinth    │ Chair 2: 3D Systems & Vertical  │ Chair 3: Art & Shaders       │
│ • 1.1 Corridor Inertia (1–10)   │ • 2.1 Viaducts & Underpasses(10)│ • 3.1 Biome Harmony (1–10)   │
│ • 1.2 Landmarks & Wayfinding(10)│ • 2.2 Wall-Walk Ramparts (1–10) │ • 3.2 2.5D Depth & Shading(10│
│ • 1.3 Flow & Loopbacks (1–10)   │ • 2.3 Ramp Traversal Ease (1–10)│ • 3.3 Dynamic Shaders (1–10) │
│ Category 1: Avg (1.00–10.00)    │ Category 2: Avg (1.00–10.00)    │ Category 3: Avg (1.00–10.00) │
├─────────────────────────────────┼─────────────────────────────────┼──────────────────────────────┤
│ Chair 4: Visual Storytelling    │ Chair 5: Novelty & Subversion   │ Chair 6: Fun, Juice & Humor  │
│ • 4.1 Diegetic Antiquity (1–10) │ • 5.1 Kishōtenketsu Novelty(10) │ • 6.1 Tactile Feel & Juice(10│
│ • 4.2 Environmental Clues (1–10)│ • 5.2 Spatial Subversion (1–10) │ • 6.2 Wry Architect Notes(10)│
│ • 4.3 Sanctum Framing (1–10)    │ • 5.3 Cognitive "Aha!" (1–10)   │ • 6.3 Playful Secrets (1–10) │
│ Category 4: Avg (1.00–10.00)    │ Category 5: Avg (1.00–10.00)    │ Category 6: Avg (1.00–10.00) │
├─────────────────────────────────┼─────────────────────────────────┴──────────────────────────────┤
│ Chair 7: Tension & Suspense     │ Chair 8: Cognitive Challenge & Gating                          │
│ • 7.1 Hazard Rhythm (1–10)      │ • 8.1 Zero-Bypass Gating (1–10 - Gatekeeper)                   │
│ • 7.2 Sentinel Evasion (1–10)   │ • 8.2 Entity Economy & Logic (1–10)                            │
│ • 7.3 Fog Dread & Catwalks (1–10│ • 8.3 Empirical Par Calibration (1–10)                         │
│ Category 7: Avg (1.00–10.00)    │ Category 8: Avg (1.00–10.00)                                   │
├─────────────────────────────────┴────────────────────────────────────────────────────────────────┤
│ MASTER LEVEL QUALITY SCORE = Sum of Categories 1–8 (8.00 – 80.00 pts / 10.0% – 100.0%)           │
│ REALISTIC CEILING: Under current engine, no level scores above 50.0% (< 40.00 / 80.00 pts).      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mathematical Formulation
For each Category $C_k$ ($k \in \{1, \dots, 8\}$):
$$\text{Category Score}_k = \frac{\text{Criterion}_{k.1} + \text{Criterion}_{k.2} + \text{Criterion}_{k.3}}{3} \quad (1.00 \le \text{Category Score}_k \le 10.00)$$

$$\text{Master Quality Score} = \sum_{k=1}^{8} \text{Category Score}_k \quad (8.00 \le \text{Master Score} \le 80.00)$$

$$\text{Normalized Percentage} = \frac{\text{Master Quality Score}}{80.00} \times 100.0\%$$

---

## 2. Concrete Behavioral Scoring Rubrics (Columns 1 through 10)

Every criterion below provides an explicit, observable description for all scores from 1 to 10.

---

### Chair 1: Spatial Architecture & Labyrinth Topology

#### Criterion 1.1: Corridor Inertia, Branching & Spatial Diversity
*Focus: Organic maze corridors, directional momentum, varied room volumes, avoidance of uniform 1-tile grid tracks.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Broken/Hostile**: Disjointed maze with broken wall geometry, unnavigable single-tile choke blocks, or accidental dead-ends immediately adjacent to spawn. |
| **2** | **Barebones Prototype**: Uniform square box maze or repetitive barcode stripes. Jarring dead-end clusters; severe visual monotony. |
| **3** | **Rough Draft Grid**: Uniform 1-tile grid corridors repeating across the entire map. Lacks any directional flow; turning every 2–3 tiles with zero breathing room. |
| **4** | **Serviceable Prototype**: Basic corridor inertia present ($\ge 50\%$), but corridors feel like repetitive trenches. No spatial expansion or room volume contrast. |
| **5 (MSP)** | **Minimum Shippable Product**: Passable standard maze. Clean corridors with reasonable inertia ($\ge 70\%$), zero dead space voids $\ge 4\times 4$, but predominantly uniform 1-tile hallways with predictable orthogonal layout. |
| **6** | **Competent Indie**: Clear sense of spatial rhythm. Alternates between narrow tunnels (1-tile) and modest resting chambers ($2\times 2$ to $3\times 3$). Winding paths feel deliberate. |
| **7** | **High-Quality Indie**: Compelling labyrinth topography (*The Witness* style). Winding avenues, distinctive forks, asymmetrical room volumes, and organic transitions that naturally guide the player. |
| **8** | **Polished Standout**: Grand architectural cadence. Features multi-scale spaces (narrow catacombs opening into expansive grand halls), purposeful blind 90° elbows, and dramatic sightline reveals. |
| **9** | **Masterwork**: Exquisite spatial composition. Perfect harmony of claustrophobic passages and awe-inspiring basilicas; navigation feels intuitive purely through architecture. |
| **10 (AAA)**| **AAA Benchmark (*Portal 2/Zelda*)**: Flawless architectural mastery. Every corridor run, elbow, and chamber possesses unique proportions, guiding player momentum effortlessly without visual repetition. |

#### Criterion 1.2: Dynamic Spatial Anchors & Navigational Legibility
*Focus: Memorable landmarks, central courtyards, fountain basins, daises, dynamic spawn/exit variety.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Featureless Void**: Zero visual anchors. Player spawns at `(1,1)` facing a generic blank wall; exit is an untextured tile at `(W-2, H-2)`. Instant disorientation. |
| **2** | **Barebones**: Identical stone walls in every direction. Zero central courtyards, markers, or distinguishing floor patterns. Player cannot orient themselves. |
| **3** | **Repetitive Grid**: A few isolated decals placed randomly on walls that do not help wayfinding. Spawn and exit are locked to generic opposite corners. |
| **4** | **Basic Landmark**: Single central pillar or slightly wider corridor, but most intersections look identical, forcing trial-and-error navigation under fog. |
| **5 (MSP)** | **Minimum Shippable Product**: Decentralized spawn/exit (e.g. west terrace to north courtyard). Contains at least 1 recognizable spatial anchor (e.g. central fountain or dais), though peripheral corridors remain visually indistinct. |
| **6** | **Competent Indie**: Distinct quad-based layout. Each quadrant has a recognizable architectural motif (e.g. pillar court, archway corridor, sunken pool) aiding mental mapping. |
| **7** | **High-Quality Indie**: Strong landmark hierarchy. Landmarks are visible across corridors and elevation layers, acting as persistent north stars for navigation. |
| **8** | **Polished Standout**: Dramatic environmental centerpieces (e.g. monumental tiered fountain, cracked obelisk with light shafts) that anchor multi-wing routing. |
| **9** | **Masterwork**: Intuitive environmental orientation. Player never needs a minimap; spatial geometry, light direction, and architectural motifs provide effortless wayfinding. |
| **10 (AAA)**| **AAA Benchmark (*Zelda*)**: Iconic spatial set-pieces. Landmark structures serve dual roles as navigation anchors and puzzle hubs, etched permanently into the player's memory. |

#### Criterion 1.3: Transit Flow, Ambulatory Circulation & Backtracking Flow
*Focus: Loopback shortcuts, circular ambulatory paths, avoidance of barren retracing through cleared halls.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Backtracking Nightmare**: Long blind alleys ($> 20$ tiles) requiring players to completely retrace footsteps through empty halls with zero interactions or shortcuts. |
| **2** | **Punishing Transit**: Multiple long cul-de-sacs forcing $15+$ steps of tedious empty backtracking per key or lever. |
| **3** | **Heavy Retracing**: Retrieving a key requires walking $10–14$ tiles back down the exact same empty corridor to reach the locked door. |
| **4** | **Noticeable Friction**: Backtracking is present ($6–10$ empty steps), but partially mitigated by short corridor lengths. |
| **5 (MSP)** | **Minimum Shippable Product**: Basic circulation. Backtracking exists ($4–8$ steps) but is manageable; layout connects main arteries to reduce pure dead-end slogs. |
| **6** | **Competent Indie**: Minor loopback pathways. Collecting an objective reveals or connects to an adjacent hallway, cutting return transit in half. |
| **7** | **High-Quality Indie**: Elegant circular circulation (*Dark Souls* shortcut philosophy). Unlocking a door or pulling a lever drops a barrier that creates a direct loop back to the central hub. |
| **8** | **Polished Standout**: Flawless flow loops. Zero empty steps through cleared hallways; every return path offers a new vantage point, collectible, or shortcut. |
| **9** | **Masterwork**: Seamless continuous momentum. Player is perpetually moving forward into new spaces or transformed corridors, never experiencing empty transit. |
| **10 (AAA)**| **AAA Benchmark (*Portal 2*)**: Absolute spatial perfection. Puzzle solutions naturally reposition the player at the threshold of the next chamber with zero redundant travel. |

---

### Chair 2: 3D Systems & Traversal Mechanics

#### Criterion 2.1: Multi-Elevation Viaducts, Underpasses & Bridges
*Focus: True 3D spatial interplay, overhead bridges (`B_EW`, `B_NS`), Roman vaulted underpass tunnels.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Broken Geometry**: Bridge tiles have inverted collision axes, blocking legitimate travel or trapping player inside wall collisions. |
| **2** | **Pure 2D Flatland**: Flat 2D grid with zero elevation elements; game pretends to have 3D but only features cosmetic floor lines. |
| **3** | **Isolated Bridge Token**: Single bridge placed in an open hall with no lower corridor passing under it; serves as a glorified floor decoration. |
| **4** | **Basic Crossing**: Functional bridge spanning a 1-tile lower trench, but underpass feels flat, lacks drop shadows, and has zero spatial necessity. |
| **5 (MSP)** | **Minimum Shippable Product**: Working multi-elevation bridge crossing a lower corridor. Upper and lower travel axes operate without bugs; basic underpass arch graphics rendered. |
| **6** | **Competent Indie**: Multi-bridge network. Bridges cross meaningful transit paths, allowing players to cross over previously visited lower corridors. |
| **7** | **High-Quality Indie**: Tiered viaduct system (*Monument Valley* style). Bridges span expansive lower courtyards; crossing over reveals lower puzzles and patrollers below. |
| **8** | **Polished Standout**: Multi-level architectural wonders. True multi-deck crossings with vaulted masonry keystones, parallax depth, and sound occlusion for lower tunnels. |
| **9** | **Masterwork**: Mind-bending vertical topology. Interlocking viaducts create layered 3D labyrinths where upper and lower paths dynamically intersect and influence each other. |
| **10 (AAA)**| **AAA Benchmark (*Portal 2/Zelda*)**: Breathtaking 3D verticality. Seamless integration of physical elevation, perspective shifts, and spatial physics across towering multi-floor complexes. |

#### Criterion 2.2: Wall-Walk Ramparts, Overlooks & Reconnaissance
*Focus: Elevated battlements (`WALL_WALK`), vantage points, multi-elevation Fog-of-War scouting.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Impassable Trap**: Wall walkways trap the player in an unescapable collision box or cannot be mounted. |
| **2** | **Inaccessible Decal**: Walkways exist visually on the map but cannot be reached or traversed. |
| **3** | **Blind Catwalk**: Narrow walkway surrounded by solid black fog or occluding walls; provides zero view of lower corridors. |
| **4** | **Cosmetic Perimeter**: Walkways trace the outer border but overlook only solid bedrock walls; no gameplay reconnaissance value. |
| **5 (MSP)** | **Minimum Shippable Product**: Functional battlement walkway where player can walk along walls; reveals some adjacent lower tiles through Fog of War line-of-sight. |
| **6** | **Competent Indie**: Strategic overlook. Walking along ramparts lets player scout a lower locked door, sentinel path, or key location before descending. |
| **7** | **High-Quality Indie**: Tactical reconnaissance hub. Elevated parapets circle an entire puzzle courtyard, allowing players to plan their entire route from above. |
| **8** | **Polished Standout**: Cinematic vantage points. Wall walks feature crenellated stone parapets, dynamic drop shadows onto lower ground, and atmospheric wind/echo effects. |
| **9** | **Masterwork**: Essential strategic observation. The level cannot be easily solved without first scouting the complex mechanical clockwork from the battlements. |
| **10 (AAA)**| **AAA Benchmark**: Sublime observation deck design. Overlooks frame the entire level as a living, moving diorama, generating immense excitement to descend into the arena. |

#### Criterion 2.3: Directional Ramps, Elevation Transitions & Traversal Feel
*Focus: Smooth height interpolation, longitudinal ramp alignment, clear approach corridors, traversal intuition.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Broken Ramps**: Ramp facing opposite direction, ejecting player into void or blocking ascent with false wall collision. |
| **2** | **Awkward Snag**: Ramps require exact sub-pixel positioning or snap the camera violently; player constantly gets stuck on ramp lips. |
| **3** | **Unclear Elevation**: Flat ramp sprite with no directional arrows; player cannot visually distinguish whether ramp leads up or down. |
| **4** | **Functional but Stiff**: Ramp operates mechanically, but player sprite instantly teleports height with no smooth visual lift or chevron feedback. |
| **5 (MSP)** | **Minimum Shippable Product**: Directional ramp (`R_N`, `R_S`, `R_E`, `R_W`) properly aligned on travel axis; player ascends/descends with basic height interpolation and chevron indicator. |
| **6** | **Competent Indie**: Intuitive approach corridors. Wide, clear approaches to ramps; smooth shadow scaling as player ascends from ground to upper elevation. |
| **7** | **High-Quality Indie**: Tactile slope physics. Audio pitch shifts during ascent, footsteps change timbre on stone inclines, camera subtly tilts to emphasize vertical gain. |
| **8** | **Polished Standout**: Grand stone staircases with carved balustrades, integrated torch sconces, and seamless multi-layer shadow projections. |
| **9** | **Masterwork**: Effortless vertical traversal. Ramps feel like natural geographic contours of an ancient ruined fortress rather than mechanical ramps. |
| **10 (AAA)**| **AAA Benchmark**: Flawless kinetic incline. Perfect camera interpolation, reactive cloth/character physics on slopes, and visceral sense of physical weight and height. |

---

### Chair 3: Visual Aesthetics, Shaders & Vector Polish

#### Criterion 3.1: Thematic Palette Harmony, Contrast & Readability
*Focus: Distinct biome color palettes, high contrast between floor/walls/hazards, zero visual muddiness.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Visual Chaos**: Clashing, garish neon colors; passable floors and impassable walls share identical colors, causing constant collision confusion. |
| **2** | **Muddy Slate**: Dull, low-contrast grey-on-grey canvas; hazards blend into floor tiles; severe eye strain after 60 seconds. |
| **3** | **Flat Monotony**: Single flat hex color fill for all walls and floors; zero texture, zero shading, sterile prototype appearance. |
| **4** | **Basic Vector Fill**: Simple two-tone palette (e.g. brown wall, beige floor). Legible, but visually bland and sterile. |
| **5 (MSP)** | **Minimum Shippable Product**: Clean thematic palette conforming to biome (Dungeon, Temple, Caverns, Jungle, Lava, Citadel, Aqueduct, Prismatic). High contrast between walls, floors, interactables, and hazards. |
| **6** | **Competent Indie**: Rich palette with secondary accent tones (e.g. moss green highlights on ancient stone, warm amber lantern glow). Distinct floor tile borders. |
| **7** | **High-Quality Indie**: Sophisticated art direction (*Hyper Light Drifter* / *Hades* color discipline). Masterful tonal hierarchy, atmospheric saturation, and mood-setting palettes. |
| **8** | **Polished Standout**: Dynamic color grading. Visual temperature shifts based on elevation (cooler high ramparts, warm glowing subterranean vaults). |
| **9** | **Masterwork**: Breathtaking visual harmony. Every frame resembles a finished concept painting; perfect balance of readability, beauty, and emotional tone. |
| **10 (AAA)**| **AAA Benchmark (*Monument Valley*)**: Iconic, timeless aesthetic perfection. Peerless color theory where every hue communicates gameplay meaning and artistic elegance. |

#### Criterion 3.2: 2.5D Architectural Depth, Drop Shadows & Masonry Detailing
*Focus: Multi-stage bevels, flagstone pavers, underpass keystones, contact & detached ground drop shadows.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Flat 2D Boxes**: Flat unshaded 2D rectangles; zero shadows, zero bevels, zero perspective; looks like a 1980s wireframe. |
| **2** | **Harsh Outlines**: Hard black 1-pixel borders around tiles; zero drop shadows, making elevated bridges look painted onto the floor. |
| **3** | **Primitive Bevel**: Single rudimentary white highlight line along top wall edges; no soft shadows or depth cues. |
| **4** | **Flat Decal Appearance**: Walls have a top face and front face, but drop shadows are uniform static dark boxes that clip unnaturally into floors. |
| **5 (MSP)** | **Minimum Shippable Product**: Clean 2.5D perspective. Walls have 2-stage bevels and consistent southern drop shadows; upper bridges cast basic contact drop shadows on the ground below. |
| **6** | **Competent Indie**: 4-stage stone masonry bevels with textured flagstone pavers. Vaulted underpass archways feature visible masonry keystones. |
| **7** | **High-Quality Indie**: Rich architectural depth. Dual-elevation player shadows (upper contact shadow + detached ground shadow at Z=0), chamfered corners, and stone weathering. |
| **8** | **Polished Standout**: True pseudo-isometric depth. Multi-layer parallax wall drops, crenellated coping with cast shadows, and subtle ambient occlusion in corridor corners. |
| **9** | **Masterwork**: Exquisite masonry craftsmanship. Every stone block feels physically carved; lighting cascades realistically over uneven pavers and ancient lintels. |
| **10 (AAA)**| **AAA Benchmark**: Complete architectural illusion. Flawless volumetric depth, micro-shadows on individual bricks, and cinematic depth-of-field. |

#### Criterion 3.3: Dynamic Surface Shaders, Environmental Props & Lighting
*Focus: Animated water caustics, magma bubbling, crystal glints, torch light cones vs. flat static decal boxes.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Barren Void**: Zero props, zero lighting, zero shaders; completely naked tile grid. |
| **2** | **Grey Box Placeholders**: Props render as untextured grey rectangles or missing texture crosses. |
| **3** | **Flat Static Decals (Current Pitfall)**: Props exist in JSON as "wall decorations" or "torches", but render as flat static vector stamps that cast zero light, produce no particles, and have no animation. |
| **4** | **Basic Static Dressing**: A few static urns or moss decals scattered on floors; readable but lifeless and static. |
| **5 (MSP)** | **Minimum Shippable Product**: Modest animated torches with flickering flame sprites; basic procedural surface shader for fluid tiles (water ripples or slow lava bubbling). |
| **6** | **Competent Indie**: Dynamic radial light cones emitted from wall sconces that illuminate nearby floor pavers; animated fluid surfaces with specular glints. |
| **7** | **High-Quality Indie**: Reactive environmental shaders. Water ripples expand when stepped on; torch flames flutter in player draft; crystal formations cast prismatic caustic beams. |
| **8** | **Polished Standout**: Rich particle ecosystem. Ambient dust motes floating in sun shafts, drifting embers near magma, heat shimmer distortion, and dynamic normal-mapped tile lighting. |
| **9** | **Masterwork**: Atmospheric living world. Shaders dynamically respond to puzzle state (e.g. draining water reveals slimy wet flagstones that slowly dry in the torchlight). |
| **10 (AAA)**| **AAA Benchmark**: State-of-the-art visual spectacle. Full volumetric lighting, real-time fluid simulation, dynamic soft shadows, and reactive foliage/particles. |

---

### Chair 4: Visual Storytelling & Environmental Narrative

#### Criterion 4.1: Diegetic Antiquity, Worldbuilding & Spatial Purpose
*Focus: Ruin identity, architectural purpose (cistern, foundry, scriptorium, observatory) vs. arbitrary puzzle maze.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Arbitrary Abstract Grid**: Random collection of maze walls with zero thematic context or physical believability. |
| **2** | **Generic Dungeon**: Generic grey brick maze with no clues as to what the structure ever was or why it exists. |
| **3** | **Theme in Name Only**: Level titled "The Sunken Cistern", but layout is identical to the "Molten Foundry" with just a blue floor instead of red. |
| **4** | **Superficial Theme**: A few thematic props placed randomly (e.g. an anvil in a hallway), but the architecture makes zero functional sense. |
| **5 (MSP)** | **Minimum Shippable Product**: Clear thematic identity supported by layout structures (e.g. aqueduct features drainage troughs; foundry features furnace alcoves). |
| **6** | **Competent Indie**: Cohesive architectural purpose. Rooms clearly served historical functions (guard post, barracks, grain store, ritual dais) before becoming ruined. |
| **7** | **High-Quality Indie**: Rich environmental history. Architecture tells the story of the ancient civilization: who built it, what catastrophe occurred, and how nature reclaimed it. |
| **8** | **Polished Standout**: Deep environmental lore. Structural damage reflects historical events (e.g. siege battering marks, tectonic earthquake fault lines splitting chambers). |
| **9** | **Masterwork**: Unspoken narrative mastery (*Ico / Shadow of the Colossus* tier). The space feels sacred, haunting, and completely authentic without a single word of exposition. |
| **10 (AAA)**| **AAA Benchmark (*Portal 2*)**: Iconic world storytelling. Every decayed beam, rusted valve, and mossy inscription weaves a poignant, unforgettable environmental narrative. |

#### Criterion 4.2: Environmental Clues, Visual Telegraphing & Deterioration
*Focus: Cracked masonry hinting at secret walls (`SW`), worn paths showing player flow, visual puzzle clues.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Blind Guesswork**: Secret walls have zero visual difference from solid walls; finding secrets requires brute-force bumping into every wall tile. |
| **2** | **Misleading Cues**: Visual textures suggest secret passages or hazards where none exist, frustrating the player. |
| **3** | **Zero Telegraphing**: Puzzle mechanisms offer no visual cues; player must flip levers blindly to see what opened somewhere offscreen. |
| **4** | **Heavy-Handed Hints**: Obvious bright red neon signs or intrusive floating UI arrows that remove all organic observation. |
| **5 (MSP)** | **Minimum Shippable Product**: Secret walls feature distinct hairline cracks or broken masonry texture; lever linkages have basic color-coded trim. |
| **6** | **Competent Indie**: Subtle organic telegraphing. Worn flagstones suggest heavy foot traffic along the correct path; draft particles blow through hidden cracks. |
| **7** | **High-Quality Indie**: Masterful environmental clues (*The Witness* style). Water stains on walls indicate where water gates drain; floor scratches reveal hidden sliding doors. |
| **8** | **Polished Standout**: Elegant diegetic signposting. Ancient wall frescoes depict puzzle mechanisms in action, rewarding players who pause to observe ancient artwork. |
| **9** | **Masterwork**: Flawless non-verbal guidance. The environment naturally draws the player's gaze toward critical clues through composition, contrast, and ruin degradation. |
| **10 (AAA)**| **AAA Benchmark**: Subconscious visual mastery. Players solve complex environmental riddles instinctively because the environmental clues are woven into the world's fabric. |

#### Criterion 4.3: Climactic Sanctum Framing, Thresholds & Milestone Payoff
*Focus: Rewarding exit sanctum, ascension stairs, sunlight rays, architectural grandeur at chapter conclusions.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Abrupt Disappointment**: Exit is a plain corridor tile that abruptly terminates the level with no victory visual or transition. |
| **2** | **Cramped Anticlimax**: Exit shoved into an unceremonious 1-tile dead-end corner behind a trash pile. |
| **3** | **Generic Portal Tile**: A generic swirling sprite placed in a hallway identical to every other hallway in the level. |
| **4** | **Basic Exit Room**: A small $2\times 2$ room housing the exit tile; lacks emotional weight or celebratory atmosphere. |
| **5 (MSP)** | **Minimum Shippable Product**: Clear dedicated exit chamber with decorative pillars and distinctive exit tile graphics; provides a clean sense of completion. |
| **6** | **Competent Indie**: Thematic sanctum. Exit is framed by an ornate archway, flanked by glowing braziers, and elevated on a stone dais. |
| **7** | **High-Quality Indie**: Dramatic milestone payoff. Golden sunlight rays pierce the ceiling; triumphant ambient audio swells as the player approaches the grand threshold. |
| **8** | **Polished Standout**: Awe-inspiring architectural climax. Reaching the sanctum reveals a massive vista (e.g. looking out over the sunken city from an open balcony). |
| **9** | **Masterwork**: Profound emotional catharsis. The threshold represents the philosophical and mechanical synthesis of the entire chapter journey. |
| **10 (AAA)**| **AAA Benchmark (*Journey / Zelda*)**: Transcendent milestone experience. Awe, beauty, sound, and visual spectacle unite to deliver unforgettable victory satisfaction. |

---

### Chair 5: Novelty, Subversion & "Aha!" Discovery

#### Criterion 5.1: Kishōtenketsu Stage Progression & Pacing Novelty
*Focus: Clear role in chapter arc: Ki (Intro), Shō (Development), Ten (Twist), Ketsu (Grand Synthesis).*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Pacing Chaos**: Chapter 1 Level 1 throws 5 complex mechanics simultaneously at the player with zero tutorialization. |
| **2** | **Aimless Progression**: All levels in the chapter feel identical; mechanics are introduced and forgotten at random. |
| **3** | **Repetitive Padding**: Level does not introduce or develop any new idea; acts as pure filler identical to the preceding level. |
| **4** | **Vague Progression**: Intended role (e.g. Twist) is present in theory, but execution is so mild that it feels like standard development. |
| **5 (MSP)** | **Minimum Shippable Product**: Recognizable progression arc. Ki introduces mechanic safely; Shō expands it; Ten introduces a minor twist; Ketsu combines them. |
| **6** | **Competent Indie**: Distinct chapter personality. Level has a clear, focused purpose in the 4-stage arc that feels distinct from its neighbors. |
| **7** | **High-Quality Indie**: Classic Kishōtenketsu mastery (*Mario 3D World* discipline). The twist level genuinely reframes how the player thinks about the core mechanic. |
| **8** | **Polished Standout**: Sublime pacing curve. Tension, novelty, and complexity escalate with surgical precision toward a breathtaking chapter finale. |
| **9** | **Masterwork**: Genre-advancing narrative-ludic progression. The structural progression tells an unspoken story of player mastery and enlightenment. |
| **10 (AAA)**| **AAA Benchmark (*Portal 2*)**: Flawless pedagogical design. Every single level delivers a distinct, brilliant conceptual leap while building seamlessly on prior knowledge. |

#### Criterion 5.2: Spatial Subversion & Expectation Defiance
*Focus: Defying maze tropes: apparent dead-ends opening, two-way teleporter shortcuts, 4-way camera rotation revelations.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Hostile Bait-and-Switch**: Traps player in invisible walls or tricks player unfairly with unavoidable punishments. |
| **2** | **Boring Predictability**: Strictly orthodox 2D maze; zero surprises, zero shifting elements, zero clever mechanics. |
| **3** | **Formulaic Template (Current Pitfall)**: Walk down hall -> pick up key -> walk back -> unlock door. Repeated 4 times with zero spatial deviation. |
| **4** | **Trivial Twist**: A lever opens a door 3 tiles away in plain view; zero mystery or subversion. |
| **5 (MSP)** | **Minimum Shippable Product**: At least one spatial twist (e.g. flipping a lever lowers a wall revealing a new wing, or a teleporter provides a cross-map warp). |
| **6** | **Competent Indie**: Clever expectation defiance. An apparent dead-end contains a secret passage that loops behind a locked gate; camera rotation reveals hidden underpasses. |
| **7** | **High-Quality Indie**: Spatial paradigm shift. The maze physically reconfigures, transforming previously visited areas into entirely new puzzle landscapes. |
| **8** | **Polished Standout**: Non-Euclidean and multi-dimensional brilliance. Corridors loop impossibly; 4-way camera rotation reveals hidden 3D vertical architecture. |
| **9** | **Masterwork**: Breathtaking optical ingenuity (*Monument Valley / Antichamber* tier). Defies geometry in ways that delight and astound the senses. |
| **10 (AAA)**| **AAA Benchmark**: Legendary spatial subversion. Shatters player expectations of 2D/3D space while remaining perfectly logical and deeply satisfying. |

#### Criterion 5.3: Cognitive "Aha!" Eureka Deductions & Decision Friction
*Focus: Mental deduction, foresight, non-trivial decision forks vs. mindless keyhole fetching along 1 path.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Zero Brainpower Required**: Single linear hallway with zero forks; impossible to make a wrong choice or think at all. |
| **2** | **Brute-Force Slog**: 10 identical doors with 10 keys; player must try every key on every door through mindless trial and error. |
| **3** | **Trivial Linear Chore (Current Pitfall)**: The key is placed at the end of a forced path and the door is the only way forward. Player does not deduce anything; they just perform manual labor. |
| **4** | **Obvious Deduction**: Simple A-to-B logic with trivial branching; player immediately sees the solution with zero cognitive pause. |
| **5 (MSP)** | **Minimum Shippable Product**: Moderate cognitive choice. At least two branching paths where player must choose which wing to explore first; requires remembering door locations. |
| **6** | **Competent Indie**: Multi-step deduction. Solving the room requires planning: "If I flip lever A, it locks gate B, so I must first carry key C across the bridge." |
| **7** | **High-Quality Indie**: True Eureka moment (*Baba Is You / The Witness* tier). A sudden intellectual realization where an seemingly impossible layout snaps into focus. |
| **8** | **Polished Standout**: Deep multi-layered problem solving. Involves spatial foresight across multiple elevation layers and camera angles to execute a brilliant sequence. |
| **9** | **Masterwork**: Pure intellectual euphoria. Player feels like a genius upon discovering the elegant, organic solution that was hiding in plain sight all along. |
| **10 (AAA)**| **AAA Benchmark (*Portal 2*)**: Absolute pinnacle of cognitive design. Puzzles challenge the player's core assumptions, producing unforgettable, smile-inducing breakthroughs. |

---

### Chair 6: Fun, Juice, Tactile Delight & Whimsical Humor

#### Criterion 6.1: Micro-Interactions, Feedback Juice & Kinetic Impact
*Focus: Lever toggle clicks, unlock sparkles, pitch-jittered footsteps, camera micro-bobbing, celebratory particle bursts.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Completely Mute & Stiff**: Zero sound, zero animation, zero visual response. Moving feels like sliding an untextured box on ice. |
| **2** | **Glitchy Feedback**: Audio pops, delayed animations, or UI flicker on interaction. |
| **3** | **Flat Web Prototype (Current Pitfall)**: Single generic click sound on key pickup; player sprite slides rigidly tile-to-tile with zero bounce, lean, or footstep audio variation. |
| **4** | **Basic Polish**: Functional sound FX for door open and key pickup; basic step timer, but lacks satisfying kinetic punch or particle juice. |
| **5 (MSP)** | **Minimum Shippable Product**: Clean audiovisual feedback. Key collection plays a pleasant chime with a brief floating icon; levers toggle with a crisp mechanical snap. |
| **6** | **Competent Indie**: Juicy micro-interactions. Pitch-jittered footstep audio matching terrain (stone vs. wood vs. water); collectible gems emit subtle sparkling particle bursts. |
| **7** | **High-Quality Indie**: Delightful tactile feel. Character squash-and-stretch on turns, subtle screen punch on heavy gate unlocks, celebratory confetti on secret discovery. |
| **8** | **Polished Standout**: Exuberant sensory juice. Dynamic camera micro-zoom on discoveries, satisfying mechanical rumble on shifting walls, physics-driven particle debris. |
| **9** | **Masterwork**: Sensory synesthesia. Every movement, interaction, and puzzle click feels viscerally addictive and joyful in its own right. |
| **10 (AAA)**| **AAA Benchmark (*Celeste / Mario*)**: The gold standard of game feel. Interacting with the world produces pure, unadulterated tactile bliss at 60 FPS. |

#### Criterion 6.2: Wry Architect Journal Notes & Diegetic Humor
*Focus: Witty worldbuilding, dry humor, ancient builder banter, personality without breaking immersion.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Offensive or Broken Text**: Corrupted text strings (`[object Object]`), lorem ipsum placeholders, or tone-deaf immersion-breaking memes. |
| **2** | **Completely Absent**: Zero lore notes, zero tablets, zero environmental writing anywhere in the level. |
| **3** | **Sterile Manual Instructions**: Notes read like software manuals: "Press E to interact with lever to open door 1." Zero personality or worldbuilding. |
| **4** | **Generic Fantasy Clichés**: "Beware traveler, danger lies ahead in the dark." Completely forgettable, generic tropes. |
| **5 (MSP)** | **Minimum Shippable Product**: Decent atmospheric flavor text on journals, providing brief contextual lore about the builder or the tomb. |
| **6** | **Competent Indie**: Wry, engaging tone. Architect journals feature dry wit ("The guild ordered a 50-foot bridge; the budget allowed for 12. Mind the gap."). |
| **7** | **High-Quality Indie**: Memorable personality. Recurring character voices across tablets (e.g. the cynical apprentice vs. the perfectionist architect) that players actively seek out. |
| **8** | **Polished Standout**: Hilarious, poignant world lore. Notes provide brilliant contextual humor while subtly hinting at secret puzzle mechanics. |
| **9** | **Masterwork**: Literary brilliance. Environmental writing rivaling *Disco Elysium* or *Portal 2* (Cave Johnson) in wit, charm, and poignant observation. |
| **10 (AAA)**| **AAA Benchmark**: Timeless comedic narrative. Every inscription is a masterclass in economy of words, eliciting genuine laughter and deep world affection. |

#### Criterion 6.3: Playful Secrets, Easter Eggs & Optional Discoveries
*Focus: Subtle cracked walls (`SW`), hidden sanctuaries, sapphire chests, cheeky dead-end discoveries.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Broken Secrets**: Secret rooms that trap the player forever or crash the game upon entry. |
| **2** | **Zero Secrets**: Strictly linear map with 0 optional alcoves, 0 secret walls, and 0 collectibles beyond the mandatory keys. |
| **3** | **Empty Dead-Ends**: Multiple long dead-ends that contain literally nothing—no coins, no lore, no art—wasting player time. |
| **4** | **Trivial Secret**: Secret wall placed right next to spawn with no hint needed, containing a single generic coin. |
| **5 (MSP)** | **Minimum Shippable Product**: At least one well-placed secret wall (`SW`) hiding an optional treasure chest or bonus gem, rewarding exploration. |
| **6** | **Competent Indie**: Playful discovery. Secret room features distinct visual dressing (e.g. hidden garden sanctuary) and an extra lore tablet. |
| **7** | **High-Quality Indie**: Rich optional layer. Multiple secrets ranging from casual discoveries to deeply hidden riddles that unlock cosmetic trophies or secret lore. |
| **8** | **Polished Standout**: Delightful Easter eggs. Hidden mini-puzzles, cheeky developer rooms, or rare relic collections that spark community discussion. |
| **9** | **Masterwork**: Joyous sense of wonder. Discovering secrets feels like uncovering ancient, forbidden mysteries that genuinely enrich the overall game lore. |
| **10 (AAA)**| **AAA Benchmark (*Zelda / Fez*)**: Legendary secret design. Layers of secrets within secrets that reward obsessive curiosity and ignite lifelong player passion. |

---

### Chair 7: Tension, Suspense & Perilous Hazards

#### Criterion 7.1: Hazard Rhythm, Suspenseful Timing & Anticipation
*Focus: Timed flame vents, floor spike traps, clear audio-visual telegraphing, safe harbor resting spots.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Unfair Cheap Deaths**: Instant invisible traps that trigger with zero warning, forcing trial-and-error memorization. |
| **2** | **Desynchronized Chaos**: Hazards cycle with erratic, unpredictable intervals; safe harbors are impossible to reach in time. |
| **3** | **Static Irrelevance**: Hazards are completely static or cycle so slowly that they pose zero actual threat or tension. |
| **4** | **Basic Timing**: Flame vents toggle on/off every 2 seconds; player just waits 1 second and walks past with zero adrenaline. |
| **5 (MSP)** | **Minimum Shippable Product**: Clear telegraphed hazard cycles (e.g. floor spikes rattle/glow 0.8s before firing); safe harbor tiles placed at reasonable dash intervals. |
| **6** | **Competent Indie**: Suspenseful hazard gauntlets. Staggered hazard rows create rhythmic dash windows where player must commit and time their stride. |
| **7** | **High-Quality Indie**: Dynamic hazard choreography. Hazards interact with player movement speed; anticipation audio creates palpable heart-racing tension. |
| **8** | **Polished Standout**: Masterful environmental peril. Crumbing platforms, rising lava, and rhythmic flame jets combine into thrilling, fair obstacle courses. |
| **9** | **Masterwork**: Pulse-pounding rhythmic flow. Traversing hazard rooms feels like a high-stakes, exhilarating dance where player mastery is richly rewarded. |
| **10 (AAA)**| **AAA Benchmark (*Celeste*)**: Unrivaled hazard precision. 100% fair, brilliantly telegraphed, intense yet forgiving, delivering immense adrenaline rushes. |

#### Criterion 7.2: Sentinel Patrol Stealth, Sight Cones & Evasion Tension
*Focus: Predictable patrol routes, visible facing directions, tactical hiding alcoves, near-miss thrills.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Telepathic Sentinels**: Enemies detect player through solid walls or instantly teleport onto player with no evasion possible. |
| **2** | **Broken Patrols**: Sentinels get stuck oscillating on a single wall tile or spin aimlessly in circles. |
| **3** | **Toothless Drones**: Sentinels move so slowly and have such tiny detection radii that player can easily ignore them completely. |
| **4** | **Simple Pac-Man Loop**: Sentinel walks a fixed 4-tile loop in an open room; player simply walks around them with zero tension. |
| **5 (MSP)** | **Minimum Shippable Product**: Functioning patrol route with visible facing orientation; hallway features at least one alcove to duck into while sentinel passes. |
| **6** | **Competent Indie**: Near-miss stealth tension. Tight corridor patrols where player must wait in darkness for the sentinel's lantern cone to sweep past. |
| **7** | **High-Quality Indie**: Dynamic stealth interplay. Sentinels investigate sound/disturbances; evasion requires timing lever toggles to trap sentinels behind gates. |
| **8** | **Polished Standout**: Multi-sentinel coordination. Interlocking patrol routes that force the player to weave between vision cones across multi-elevation walkways. |
| **9** | **Masterwork**: Nail-biting cat-and-mouse tension. Heartbeat audio surges when hiding in shadows inches from a looming ancient guardian. |
| **10 (AAA)**| **AAA Benchmark (*Metal Gear / Alien: Isolation*)**: Legendary stealth mastery. Sentinels feel like living, intelligent predators; evasion produces breathless thrills. |

#### Criterion 7.3: Fog-of-War Dread, Claustrophobia & Spatial Uncertainty
*Focus: Atmospheric fog, narrowing sightlines on 90° blind corners, vertigo on catwalks over chasms.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Impenetrable Pitch Black**: Player can see literally only their own tile, causing continuous blind wall collisions. |
| **2** | **Blinding Fog**: Fog reveals tiles so slowly that player must stop moving every step to let visibility catch up. |
| **3** | **Zero Atmosphere**: Entire map is permanently revealed or fog is a flat ugly grey mask with harsh circular cutout. |
| **4** | **Basic Fog**: Standard fog of war reveals 3 tiles in every direction; functional for exploration but creates zero emotional dread or suspense. |
| **5 (MSP)** | **Minimum Shippable Product**: Smooth radial fog-of-war gradient; turning blind 90° corners conceals what lies ahead, creating basic curiosity. |
| **6** | **Competent Indie**: Atmospheric claustrophobia. Light radius shrinks in deeper vaults; distant glowing hazard eyes peer through the gloom. |
| **7** | **High-Quality Indie**: Palpable environmental dread. Fog naturally billows and recedes; narrow bridges suspended over black chasms evoke genuine vertigo. |
| **8** | **Polished Standout**: Masterful psychological tension. Ambient audio echoes from unseen rooms; shadows play tricks in the player's peripheral vision. |
| **9** | **Masterwork**: Atmospheric immersion perfection. The darkness feels like a living character; stepping forward requires genuine courage and focus. |
| **10 (AAA)**| **AAA Benchmark (*Inside / Dark Souls*)**: Peerless environmental dread. Visual mood, spatial vulnerability, and sound design combine into unforgettable atmospheric suspense. |

---

### Chair 8: Cognitive Challenge, Gating & Mathematical Calibration

#### Criterion 8.1: Zero-Bypass Gating Integrity & Sequence Security
*Focus: Mathematically verified key/door/lever necessity, strict sequence security, zero bypasses.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **0–1**| ***AUTOMATIC AUDIT REJECTION***: Player can bypass a locked door, walk through broken wall geometry, or reach exit without solving core gating sequence. |
| **2** | **Critical Sequence Break**: A minor corner cut allows skipping 80% of the puzzle and reaching the exit prematurely. |
| **3** | **Accidental Bypass**: An intended puzzle barrier can be jumped or sidestepped via an unintended side corridor. |
| **4** | **Loose Sequence**: Gating is unbypassable, but keys can be picked up in an unintended, sloppy order that renders half the puzzle redundant. |
| **5 (MSP)** | **Minimum Shippable Product**: 100% mathematically airtight. Verified by BFS solver that exit cannot be reached without collecting all mandatory keys and opening all required doors. |
| **6** | **Competent Indie**: Strict sequential locks. Door A requires Key A, which unlocks Chamber B containing Lever B, which opens Gate C to Key C. |
| **7** | **High-Quality Indie**: Interlocking state-space gating. Mechanisms are multi-modal (e.g. lowering gate A raises water in reservoir B), preventing accidental sequence breaks. |
| **8** | **Polished Standout**: Elegant systemic gating. Gating mechanisms emerge naturally from the game's physics and world rules rather than arbitrary lock-and-key barriers. |
| **9** | **Masterwork**: Pristine mathematical elegance. Zero redundant entities; every barrier and state change is integral to a beautiful logical chain. |
| **10 (AAA)**| **AAA Benchmark (*The Witness / Portal*)**: Impeccable puzzle integrity. Every single component is mathematically essential, elegant, and impossible to break or cheese. |

#### Criterion 8.2: Entity Economy, Meaningful Choices & Multi-Step Logic
*Focus: Branching choices, deduction dilemmas vs. trivial linear fetch chores along a single hallway.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Sloppy Entity Litter**: Orphaned keys that open nothing, locked doors with no key, useless levers that do nothing. |
| **2** | **Mindless Redundancy**: 5 keys placed right next to 5 doors in a straight line; zero decision-making. |
| **3** | **Linear Fetch Chore (Current Critical Pitfall)**: Key is placed at the end of a single hallway and the door is the only way forward. Player has zero choices; it is pure manual walking labor. |
| **4** | **Basic Choice**: Two identical halls; one has key, one has door. If player picks wrong hall first, they just walk back. Trivial 50/50 trial. |
| **5 (MSP)** | **Minimum Shippable Product**: Clear entity purpose. Every entity in the map has a defined role; multiple wings require deciding which section to tackle first based on inventory. |
| **6** | **Competent Indie**: Meaningful dilemmas. Player has 1 key but 2 locked doors: one leads to a shortcut/secret, one leads to the next puzzle section. |
| **7** | **High-Quality Indie**: Multi-step deductive logic. Puzzles require working backward from the goal: "To open the sanctum, I need the gold key, which is on the high platform, which requires lowering the floodgate..." |
| **8** | **Polished Standout**: Deep logical elegance. Multiple mechanics (levers, portals, elevation, light beams) interlock into cohesive, satisfying logic puzzles. |
| **9** | **Masterwork**: Sublime intellectual economy. A minimal set of interacting entities produces extraordinarily deep, emergent puzzle challenges. |
| **10 (AAA)**| **AAA Benchmark (*Baba Is You / Portal 2*)**: Absolute genius of game logic. Simple rules compound into breathtaking, mind-bending intellectual triumphs. |

#### Criterion 8.3: Empirical Par Step Calibration & Exploration Margin
*Focus: Mathematically calibrated par targets ($parSteps \in [1.12, 1.25] \times \text{BFS}_{\text{optimal}}$), rewarding efficiency.*

| Score | Practical In-Game Manifestation |
| :---: | :--- |
| **1** | **Mathematically Impossible**: Par steps set lower than the shortest theoretical BFS path; impossible to achieve even with tool-assisted speedrun. |
| **2** | **Absurdly Loose**: Par steps set to $5\times$ optimal path; player can wander aimlessly in dead-ends for 5 minutes and still get Gold medal. |
| **3** | **Arbitrary Guesswork**: Par numbers typed in manually with zero testing; some levels are brutally tight while others are wildly generous. |
| **4** | **Rough Estimate**: Par targets roughly approximate path length but don't account for ramp steps or lever toggles. |
| **5 (MSP)** | **Minimum Shippable Product**: Empirically calibrated par. $parSteps = \lceil \text{BFS}_{\text{optimal}} \times 1.15 \rceil$, providing a fair 15% exploration buffer for human players. |
| **6** | **Competent Indie**: Tiered medal calibration. Bronze (completion), Silver (fair exploration), and Gold (near-optimal route planning) offer distinct challenges. |
| **7** | **High-Quality Indie**: Precision speedrunner calibration. Optimal path requires mastering movement mechanics (e.g. cutting corners, queueing inputs). |
| **8** | **Polished Standout**: Perfectly tuned medal thresholds that turn every level into an addictive routing optimization challenge. |
| **9** | **Masterwork**: Flawless mathematical balance. Par scores motivate players to replay and analyze maze geometry with intense satisfaction. |
| **10 (AAA)**| **AAA Benchmark**: The gold standard of speedrun and routing calibration, celebrating player mastery with absolute mathematical precision. |

---

## 3. Ground-Truth Quality Tiers & Reality Calibrated Gating

The revised quality tiers establish a realistic standard where **Minimum Shippable Product (MSP)** sits at **50.0%** ($40.00 / 80.00$), and the current platform state is recognized honestly in the **30.0% to 48.0%** range.

| Quality Tier | Master Score (/80) | Normalized % | Reality-Anchored Classification | Current Platform Representation |
| :---: | :---: | :---: | :--- | :--- |
| **AAA Benchmark** | **72.00 – 80.00** | **90.0% – 100.0%** | **Industry Masterpiece**: *Portal 2 / Zelda / Monument Valley* tier. Genre-defining spatial and visual perfection. | **0 Levels (Aspirational)** |
| **Indie Standout (A)** | **56.00 – 71.99** | **70.0% – 89.9%** | **High-Quality Commercial Indie**: Rich dynamic shaders, deep 3D multi-level verticality, clever puzzle dilemmas, unforgettable pacing. | **0 Levels (Target for Phase 2 Overhauls)** |
| **Competent Indie (B)**| **44.00 – 55.99** | **55.0% – 69.9%** | **Commercial Indie Prototype**: Strong biome identity, distinct landmarks, genuine multi-path choice, reactive lighting. | **0 Levels (Requires visual & puzzle refactor)** |
| **MSP Baseline (C+)**  | **36.00 – 43.99** | **45.0% – 54.9%** | **Minimum Shippable Product**: Fully playable, zero bugs, clean 60 FPS, basic 2.5D perspective, but linear key chores and flat decals. | **Top ~15 Levels (Ch 8, Ch 5, Sunken Vaults)** |
| **Functional Draft (C)**| **28.00 – 35.99** | **35.0% – 44.9%** | **Early Functional Prototype**: Sound mechanics and unbypassable locks, but repetitive 1-tile hallways, minimal juice, flat static decals. | **Core Platform Campaign (~25 Levels)** |
| **Rough Prototype (D)** | **20.00 – 27.99** | **25.0% – 34.9%** | **Early Prototype / Tutorial**: Simple linear demonstrations, trivial corridors, barebones aesthetics, zero challenge. | **Tutorials & Early Chapter 1 Levels (~13 Levels)**|
| **Unacceptable (F)**   | **< 20.00** | **< 25.0%** | **Broken / Non-Solvable**: Bypassable gating, collision traps, severe disorientation. | **0 Levels (All 53 pass basic solvability)** |

### Mandatory Release Criteria (Production Gate)
To advance any level toward commercial indie release:
1. **Master Score** must reach $\ge 44.00 / 80.00$ (**B-Tier**, $\ge 55.0\%$).
2. **Gating Integrity (Criterion 8.1)** must remain **10.0 / 10.0** (airtight zero-bypass security).
3. **Entity Economy (Criterion 8.2)** must score $\ge 6.0 / 10.0$ (eliminating single-corridor linear fetch chores).
4. **Shaders & Props (Criterion 3.3)** must score $\ge 6.0 / 10.0$ (eliminating flat static decals in favor of reactive lighting/particles).
5. **Dead Space Metric**: $\text{DeadSpace}_{\ge 4\times 4} = 0$.
