# 0008. Lever Manual Interaction Separation and Floor-Plate Trap Mechanics

Date: 2026-10-09

## Status
Accepted

## Context
In early iterations of the engine, stepping onto a lever tile automatically invoked `lever.toggle(this.level)` inside `GameLoop.handleCellArrival()`. This created several gameplay and UX issues:
1. **Accidental Mechanism Triggering**: Players frequently walked onto or through lever tiles to examine adjacent puzzle items, wall murals, or corridors, inadvertently toggling gates or reversing previous puzzle solutions without explicit intent.
2. **Ambiguity with Nearby Interaction**: With the introduction of multi-target proximity disambiguation (BL-85), an entity on the player's tile could auto-fire without player choice, clashing with the player's intended facing action.
3. **Loss of Tactical Traps**: There was no distinction between an interactive deliberate control (switch, cog valve, pedestal) and a hidden or reactive floor hazard (such as a pressure-sensitive trap plate that springs when stepped upon).

## Decision
We establish a clean architectural separation between **manual interactable switches** and **step-triggered floor plates**:

1. **Manual Interaction for Standard Levers**:
   * Standard levers (`style: 'switch_lever'`, `'pressure_pedestal'`, `'crystal_switch'`, `'runic_plate'`, `'cog_wheel'`) no longer toggle upon stepping.
   * Standard levers strictly require explicit player engagement via:
     - Keyboard interact hotkey (<kbd>E</kbd> / <kbd>Space</kbd> / <kbd>Enter</kbd>).
     - Multi-target disambiguation selection (<kbd>1</kbd>..<kbd>9</kbd> or action drawer click).
     - Direct canvas click / touch on the lever tile or adjacent interactable.
2. **Floor-Plate Traps (`style: 'floor_plate'`)**:
   * Introduced a specialized `floor_plate` preset in `LEVER_STYLES` (`constants.js`) and corresponding domain properties on `Lever`:
     - `triggerOnStep`: boolean flag indicating whether stepping onto the tile triggers the mechanism.
     - `autoTriggerOnce`: boolean flag indicating whether the mechanism only springs a single time upon first step.
     - `hasTriggered`: state tracking whether the trap has fired.
   * `GameLoop.handleCellArrival()` solely checks for entities matching `(e.triggerOnStep || e.style === 'floor_plate') && (!e.autoTriggerOnce || !e.hasTriggered)`.
3. **Distinct Visual Feedback**:
   * Levers display switch handles and ON/OFF LED glow with deliberate action prompts (`Pull [E]`).
   * Floor-plate traps display metallic pressure plates with hazard icons (`⚠️` unarmed / `💥` triggered) and danger shockwaves.

## Consequences
### Positive
* **Player Agency**: Eliminates accidental toggles; players can traverse rooms and position themselves freely without unintentional gate flipping.
* **Consistency with Disambiguation (BL-85)**: Both levers and other nearby entities follow the same predictable interaction and candidate ranking rules.
* **Expanded Level Design Palette**: Level architects can now design intentional trap corridors (e.g. spring-loaded floor plates that shut doors behind the player or fire mechanisms) while keeping switches strictly deliberate.

### Negative / Trade-offs
* **Level Solver & Journey Tests**: Automated solver scripts (`tests/helpers/campaign-solver.mjs`) must explicitly issue manual interact commands (`gameLoop.handleManualInteract()`) when crossing lever coordinates along the optimal path, rather than relying on automatic step arrival toggling.
