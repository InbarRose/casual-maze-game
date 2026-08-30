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
| `spawn` | `object` | `{ x: number, y: number, elevation: 0|1 }` starting point. |
| `exit` | `object` | `{ x: number, y: number }` target portal location. |
| `config` | `object` | Gameplay flags (see below). |
| `help` | `object` | Optional guidance banner (`{ title: string, message: string }`). |
| `layers` | `object` | `{ ground: Array<Array>, overhead: Array<Array> }` 2D tile matrices. |
| `entities` | `array` | Interactive objects (Keys, Doors, Levers). |

---

### Configuration Flags (`config`)
* `fogOfWar` (`boolean`): Enables dynamic 2D line-of-sight raycasting.
* `mapRevealed` (`boolean`): When true, initialized in memory/explored state `1` instead of pitch black `0`.
* `viewRadius` (`number`): Sight radius in tiles (default: `6`).
* `allowFreePan` (`boolean`): Enables `[M]` free-pan mode.
* `theme` (`string`): Visual palette token (`dungeon`, `castle`, `crypt`, `garden`, `temple`).

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

#### 1. Key (`key`)
```json
{
  "id": "key_sapphire",
  "type": "key",
  "x": 4,
  "y": 7,
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

---

### Playtest Session Properties (Optional / Runtime)

When playtesting custom drafts from the editor, transient runtime properties can be attached:

| Property | Type | Description |
| --- | --- | --- |
| `testSpawn` | `{ x: number, y: number, elevation: number }` | Overrides starting position and elevation for focused chamber testing. |
| `testInventory` | `string[]` | Preloaded array of key IDs placed in the player's backpack upon start. |

