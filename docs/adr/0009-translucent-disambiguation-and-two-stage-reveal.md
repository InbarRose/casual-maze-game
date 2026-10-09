# 0009. Translucent Disambiguation and Two-Stage Interaction Reveal

Date: 2026-10-09

## Status
Accepted

## Context
With the introduction of Directional Proximity Interaction and Multi-Target Disambiguation (BL-85), when a player is adjacent to multiple interactable objects (e.g. a lever, an architectural mural, a signpost, or an item pedestal), the engine immediately rendered floating numbered badges (`[1]`, `[2]`, `[3]`) over every object in the game canvas alongside the docked action drawer.

While this resolved control ambiguity, playtesting revealed new UX friction:
1. **Character & Viewport Occlusion**: Popups and badges appearing directly adjacent to or over the player avatar occlude character sightlines, walking paths, and immediate atmospheric details.
2. **Visual Clutter During Movement**: When navigating tight multi-item corridors, multiple badges immediately popping up while the player is simply walking past creates visual noise and interface distraction.
3. **Modal Opacity**: Opaque or heavily bordered modal elements create a sense of screen interruption rather than subtle ambient game guidance.

## Decision
We refine the multi-target proximity HUD with a **Two-Stage Reveal** and **Translucent Presentation** model (BL-91):

1. **Two-Stage Interaction Reveal**:
   * **Stage 1 (Passive Walkby / Proximity)**: When multiple interactable items are nearby simultaneously, the game does **not** immediately scatter numbers over every object. Instead, it displays only a single primary interact indicator over the prioritized facing entity, accompanied by a discreet quantity badge (e.g. `[E] • 3` or `[E] (3)`).
   * **Stage 2 (Active Engagement / Disambiguation Activation)**: Only *after* the player explicitly presses <kbd>E</kbd> or taps the prompt does the interface expand into full disambiguation mode, revealing in-world numbered targets (`[1]`, `[2]`, `[3]`) and opening the numbered action drawer for numeric or touch selection.
   * If only a single item is nearby, the standard clean single-prompt experience (`[E]`) remains completely unchanged.
2. **Translucent Glassmorphic Presentation**:
   * All disambiguation pills and action drawer elements must use translucent backgrounds (`background: rgba(15, 23, 42, 0.72)` or similar) with backdrop blur (`backdrop-filter: blur(8px)`).
   * The active player avatar and walking paths must remain visible through all contextual overlays, never completely blocking line-of-sight.

## Consequences
### Positive
* **Pristine Exploration**: Players moving through densely furnished chambers will not experience sudden popup barrages or obscured avatars.
* **Intelligent Progressive Disclosure**: The UI remains minimal by default, expanding only when the player expresses clear intent to engage.
* **Elimination of Visual Occlusion**: Translucent glass surfaces preserve immersion and spatial clarity.

### Negative / Trade-offs
* **Two-Step Action for Secondary Targets**: Selecting secondary target `#2` or `#3` requires an initial <kbd>E</kbd> press to open the choice list followed by the number key (or quick direct number pressing if numeric hotkeys `1`..`9` are retained as shortcuts).
