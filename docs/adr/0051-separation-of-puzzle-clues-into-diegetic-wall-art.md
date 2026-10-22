# ADR-0051: Separation of Puzzle Clues into Diegetic Wall Art & Carvings

## Status
Accepted

## Context
Previously in several maze levels, narrative worldbuilding notes and mechanical puzzle clues (such as lever sequences, compass directions, or secret door hints) were both presented through floor signposts. This caused two key design problems:
1. **Thematic Conflation**: Philosophical lost letters from the Master Architect were indistinguishable in form from tactical instructions or cyphers left by previous explorers.
2. **Visual Clutter & Floor Monotony**: Placing signs on corridor floors for puzzle hints obstructed movement sightlines and created repetitive floor clutter.

The player requested:
> *"any notes that are specifically placed for clues or stuff should be replaced by wall carvings, art, runic inscriptions, etc."*

## Decision
We established a strict separation of concerns between narrative lore and tactical puzzle clues (`BL-177`):

1. **Narrative Lore -> Collectible Lecterns & Folios (`Signpost`)**:
   - Reserved exclusively for the Master Architect's autobiographical notes, philosophical ruminations, and chapter story lore.
   - Housed on stone lecterns (`lectern_stone`), wooden reading desks (`lectern_wood`), or wall niches (`wall_niche`).
   - Integrated into the persistent Architect's Codex collection with coordinate recording.

2. **Tactical & Secret Clues -> Diegetic Wall Art (`WallDecor`)**:
   - Any clues regarding lever combinations, hidden pathways, directional compass codes, or cipher solutions are strictly mounted on corridor walls as inspectable architectural decor.
   - Supported diegetic decor types:
     - `carving` / `relief`: Stone bas-relief carvings depicting historical battles, compass roses, or directional glyphs.
     - `runic_plate`: Bronze plaques mounted with iron bolts and glowing cypher runes (`ᚲᛁᛈᚺ`).
     - `fresco` / `mosaic`: Painted or tiled murals on plaster wall segments hinting at environmental secrets.
     - `tapestry`: Woven wall hangings concealing shallow alcoves or illustrating maze allegories.
   - Inspected directly via `InteractionDispatcher` and displayed with dedicated stone tablet or parchment modals, without cluttering the player's collectible lore codex.

3. **Level Authoring Standard**:
   - When designing or refactoring campaign levels, level creators must never place a floor note for a puzzle clue or secret room hint. All gameplay clues must use `wall_decor` entities positioned on solid boundary walls with appropriate orientation (`north`, `south`, `east`, `west`).

## Consequences & Verification
- **Visual Elegance**: Floors remain clean pathways; walls are enriched with varied historical textures and intriguing points of interest.
- **Narrative Purity**: The Architect's Codex remains a pristine compilation of lore folios rather than a junk drawer of disposable lever codes.
- **Backwards Compatibility**: Existing `WallDecor` rendering and interaction systems seamlessly handle the new `runic_plate` style and clue text.
