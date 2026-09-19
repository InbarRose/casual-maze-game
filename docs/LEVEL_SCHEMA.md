# Level Schema & Entity Specification

This document defines the canonical JSON schema for levels in the **Casual Maze Game**, including grid layers, entity definitions, and level configuration toggles.

---

## 1. Schema Overview (`maze_file.json`)

Levels are defined as static JSON files conforming to the following structure:

```json
{
  "$schema": "https://casual-maze-game.inbarrose.com/schemas/maze-v1.json",
  "id": "level_1",
  "zone": "zone_1",
  "title": "Training Hall",
  "author": "Architect",
  "version": 1,
  "dimensions": {
    "width": 21,
    "height": 21
  },
  "config": {
    "fogOfWar": true,
    "mapRevealed": false,
    "viewRadius": 6,
    "allowFreePan": true,
    "tileSize": 32,
    "theme": "dungeon"
  },
  "help": {
    "title": "Level Objective",
    "message": "Find the Ruby Key to unlock the gate and reach the golden portal."
  },
  "spawn": {
    "x": 1,
    "y": 1,
    "elevation": 0
  },
  "exit": {
    "x": 19,
    "y": 19
  },
  "layers": {
    "ground": [
      [1, 1, 1, 1, 1],
      [1, 0, 0, "B_EW", 1],
      [1, 1, 1, 1, 1]
    ],
    "overhead": [
      [0, 0, 0, 0, 0],
      [0, 0, 0, "B_NS", 0],
      [0, 0, 0, 0, 0]
    ]
  },
  "entities": [
    {
      "id": "key_ruby",
      "type": "key",
      "x": 5,
      "y": 5,
      "color": "#f43f5e",
      "name": "Ruby Key"
    },
    {
      "id": "door_ruby",
      "type": "door",
      "x": 10,
      "y": 5,
      "requiresKey": "key_ruby",
      "color": "#f43f5e"
    },
    {
      "id": "lever_gate_1",
      "type": "lever",
      "x": 3,
      "y": 8,
      "state": false,
      "targets": [
        {
          "action": "toggle_tile",
          "layer": "ground",
          "x": 12,
          "y": 8,
          "stateA": 1,
          "stateB": 0
        }
      ]
    }
  ]
}
```

---

## 2. Properties Reference

### Top-Level Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g. `tutorial_1`, `level_1`, `custom_vault`). |
| `zone` | `string` | Optional campaign zone ID (e.g. `zone_1`, `zone_2`). |
| `title` | `string` | Display name shown in HUD and level select. |
| `author` | `string` | Creator attribution. |
| `dimensions` | `object` | `{ width: number, height: number }` of the grid. |
| `spawn` | `object` | `{ x: number, y: number, z?: number, elevation?: number }` starting point (`z = 0` Ground, `z = 1` Overhead, `z = -1` Basement). |
| `exit` | `object` | `{ x: number, y: number, z?: number, elevation?: number }` target portal location. |
| `config` | `object` | Gameplay flags (see below). |
| `help` | `object` | Optional guidance banner (`{ title: string, message: string }`). |
| `layers` | `object` | `{ ground: Array<Array>, overhead: Array<Array> }` 2D tile matrices. |
| `entities` | `array` | Interactive objects (Keys, Doors, Levers) with `(x, y, z)` positioning. |

---

### Configuration Flags (`config`)
* `fogOfWar` (`boolean`): Enables dynamic 2D line-of-sight raycasting.
* `mapRevealed` (`boolean`): When true, initialized in memory/explored state `1` instead of pitch black `0`.
* `viewRadius` (`number`): Sight radius in tiles (default: `6`).
* `allowFreePan` (`boolean`): Enables `[M]` free-pan mode.
* `viewPerspective` (`string`): Default visual rendering perspective (`'angled'` or `'topdown'`).
* `theme` (`string`): Visual palette token (`dungeon`, `castle`, `crypt`, `garden`, `temple`, `lava`, `snow`, `cave`, `sunset`).

---

### Tile Definitions
| Token / ID | Name | Layer | Description |
| :--- | :--- | :--- | :--- |
| `0` | Floor / Void | Ground / Overhead | Walkable on ground; empty air on overhead. |
| `1` | Solid Wall | Ground / Overhead | Impassable barrier. |
| `B_EW` | Bridge (E-W) | Ground (0) / Overhead (1) | E-W tunnel on ground; N-S elevated walkway on overhead. |
| `B_NS` | Bridge (N-S) | Ground (0) / Overhead (1) | N-S tunnel on ground; E-W elevated walkway on overhead. |
| `R_N` | Ramp North | Ground (0) | Ascends North from 0 to 1; descends South from 1 to 0. |
| `R_S` | Ramp South | Ground (0) | Ascends South from 0 to 1; descends North from 1 to 0. |
| `R_E` | Ramp East | Ground (0) | Ascends East from 0 to 1; descends West from 1 to 0. |
| `R_W` | Ramp West | Ground (0) | Ascends West from 0 to 1; descends East from 1 to 0. |

---

### Entity Types

All entities accept 3D coordinates `x`, `y`, `z` (where `z = 0` is Ground, `z = 1` is Overhead, and `z = -1` is Basement).

#### 1. Key (`key`)
```json
{
  "id": "key_sapphire",
  "type": "key",
  "x": 4,
  "y": 7,
  "z": 0,
  "color": "#38bdf8",
  "name": "Sapphire Key"
}
```

#### 2. Door (`door`)
```json
{
  "id": "door_sapphire",
  "type": "door",
  "x": 8,
  "y": 7,
  "z": 0,
  "requiresKey": "key_sapphire",
  "color": "#38bdf8"
}
```

#### 3. Lever (`lever`)
```json
{
  "id": "lever_1",
  "type": "lever",
  "x": 2,
  "y": 4,
  "z": 0,
  "state": false,
  "targets": [
    {
      "action": "toggle_tile",
      "layer": "ground",
      "x": 10,
      "y": 4,
      "stateA": 0,
      "stateB": 1
    }
  ]
}
```

#### 4. Teleporter (`teleporter`)
Warps the player to the target 3D coordinate upon stepping onto the portal pad.
```json
{
  "id": "teleporter_alpha",
  "type": "teleporter",
  "x": 2,
  "y": 2,
  "z": 0,
  "targetX": 15,
  "targetY": 15,
  "targetZ": 1,
  "cooldown": 1.0,
  "style": "runic"
}
```

#### 5. Timed Hazard (`hazard`)
Cyclically activates danger zones (flame jets, spike traps). Stepping onto an active hazard respawns the player to the last safe checkpoint.
```json
{
  "id": "hazard_flame_1",
  "type": "hazard",
  "x": 6,
  "y": 8,
  "z": 0,
  "hazardType": "flame_vent",
  "intervalMs": 3000,
  "activeDurationMs": 1500,
  "warningDurationMs": 800,
  "radius": 0.45,
  "style": "fire"
}
```

#### 6. Patroller (`patroller`)
Autonomous entity that moves along defined waypoints. Collision with player triggers checkpoint respawn.
```json
{
  "id": "patroller_guard_1",
  "type": "patroller",
  "x": 10,
  "y": 5,
  "z": 0,
  "waypoints": [
    { "x": 10, "y": 5 },
    { "x": 14, "y": 5 },
    { "x": 14, "y": 9 },
    { "x": 10, "y": 9 }
  ],
  "speed": 1.5,
  "patrolType": "loop",
  "radius": 0.4,
  "color": "#f97316",
  "patrollerType": "sentry"
}
```

#### 7. Puzzle Gate (`puzzle_gate`)
Solid barrier unlocked by completing an interactive modal minigame.
```json
{
  "id": "gate_celestial",
  "type": "puzzle_gate",
  "x": 12,
  "y": 6,
  "z": 0,
  "puzzleType": "rune_memory",
  "puzzleConfig": {
    "sequenceLength": 4
  },
  "targetGateId": "gate_celestial",
  "name": "Celestial Gate",
  "color": "#a855f7"
}
```
*(Or `puzzleType: "cipher_dial"` with `"puzzleConfig": { "solution": [2, 0, 3] }`)*

---

### Playtest Session Properties (Optional / Runtime)

When playtesting custom drafts from the editor, transient runtime properties can be attached:

| Property | Type | Description |
| --- | --- | --- |
| `testSpawn` | `{ x: number, y: number, elevation: number }` | Overrides starting position and elevation for focused chamber testing. |
| `testInventory` | `string[]` | Preloaded array of key IDs placed in the player's backpack upon start. |

