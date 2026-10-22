# The Shrouded Vault

**Chapter**: Chapter 1  
**Zone**: zone_1  
**Dimensions**: 19 × 17  
**Par Steps**: 107 | **Par Time**: 55s  
**Theme**: dungeon  

## Narrative Lore & Overview
*Architect's Journal*: The Triune Sanctum to the south requires all three resonance keys—Ruby, Emerald, and Sapphire. The labyrinth wings connect all three cathedral chambers beneath the shrouded mist.

## Architectural & Portal Design (BL-174, BL-175, ADR-0048, ADR-0049)
- **Entrance Doorway (`wall_doorway`, `north`)**: Centered at `(9, 8)` beneath North wall drop-face `(9, 7)` featuring studded timber double-doors and stone steps ascending to open mist.
- **Exit Archway (`wall_archway`, `north`)**: Cut into North wall `(10, 14)` at floor `(10, 15)` framed by masonry quoins and stone stairs descending down into the torchlit depths of Chapter 2.
- **Labyrinth Topology**: Multi-wing cathedral layout with $77\%$ corridor inertia, zero dead space $\ge 4\times 4$, and zero-bypass gating enforcing the collection of all three resonance keys (Ruby, Emerald, Sapphire).
- **The Secret Alcove**: Hidden behind a false mortar seam (`SW` at `17, 3`) in the northeast dead end, hinted by a runic wall carving (`17, 4`), concealing the Cathedral Starstone (`17, 2`).

## Kishōtenketsu Architectural Structure
- **Ki (Introduction)**: Spawning centrally at the grand cathedral nave `(9, 8)` with architectural entrance stairs behind the adventurer. An ancient signpost and altar inscription orient the explorer toward the three branching labyrinth wings.
- **Shō (Development)**: Navigating the dense fog of war (view radius 6) through winding 1-tile corridors into the Western wing for the Ruby Key and the Northern cloisters for the Sapphire Key.
- **Ten (Twist)**: The Eastern labyrinth wing harbors deceptive dead ends and the Emerald Key. A runic wall carving hints at the northeast corner where mortar yields, opening into an enclosed secret chamber concealing the Cathedral Starstone.
- **Ketsu (Resolution)**: Returning south to unlock the Triune Sanctum doors sequentially (Ruby $\to$ Emerald $\to$ Sapphire) to reach the grand subterranean archway at `(10, 15)`.
