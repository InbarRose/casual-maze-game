/**
 * Script to revisit and refine all Tutorial and Campaign levels
 * with rich thematic choices of tiles, entity styles, glow effects, facings,
 * and spawn/exit objects while strictly preserving puzzle solvability.
 */

import fs from 'fs';
import path from 'path';
import { LevelValidator } from '../js/editor/level-validator.js';

const LEVEL_UPDATES = {
  // ==========================================
  // TUTORIALS
  // ==========================================
  'levels/tutorial/tutorial_1.json': (lvl) => {
    lvl.config.theme = 'dungeon';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'archway';
    return lvl;
  },
  'levels/tutorial/tutorial_2.json': (lvl) => {
    lvl.config.theme = 'dungeon';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'portal';
    lvl.entities = [
      {
        id: 'key_red_t2',
        type: 'key',
        x: 3,
        y: 3,
        color: '#f43f5e',
        name: 'Ruby Key',
        style: 'classic',
        glowEffect: 'vibrant'
      },
      {
        id: 'door_red_t2',
        type: 'door',
        x: 1,
        y: 5,
        requiresKey: 'key_red_t2',
        color: '#f43f5e',
        style: 'classic',
        orientation: 'vertical'
      },
      {
        id: 'key_blue_t2',
        type: 'key',
        x: 7,
        y: 3,
        color: '#38bdf8',
        name: 'Sapphire Crystal',
        style: 'crystal',
        glowEffect: 'pulse'
      },
      {
        id: 'door_blue_t2',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_blue_t2',
        color: '#38bdf8',
        style: 'portcullis',
        orientation: 'horizontal'
      }
    ];
    return lvl;
  },
  'levels/tutorial/tutorial_3.json': (lvl) => {
    lvl.config.theme = 'temple';
    lvl.spawn.style = 'archway';
    lvl.exit.style = 'stairs_up';
    lvl.entities = [
      {
        id: 'lever_t3_1',
        type: 'lever',
        x: 3,
        y: 7,
        name: 'Sanctuary Lever',
        style: 'switch_lever',
        state: false,
        targets: [
          {
            action: 'toggle_tile',
            layer: 'ground',
            x: 5,
            y: 3,
            stateA: 0,
            stateB: 1
          }
        ]
      }
    ];
    return lvl;
  },
  'levels/tutorial/tutorial_4.json': (lvl) => {
    lvl.config.theme = 'jungle';
    lvl.spawn.style = 'camp';
    lvl.exit.style = 'shrine';
    return lvl;
  },
  'levels/tutorial/tutorial_5.json': (lvl) => {
    lvl.config.theme = 'dungeon';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'portal';
    lvl.entities = [
      {
        id: 'key_gold_t5',
        type: 'key',
        x: 9,
        y: 3,
        color: '#fbbf24',
        name: 'Crypt Bone Token',
        style: 'skull',
        glowEffect: 'pulse'
      },
      {
        id: 'door_gold_t5',
        type: 'door',
        x: 9,
        y: 9,
        requiresKey: 'key_gold_t5',
        color: '#fbbf24',
        style: 'magic_seal',
        orientation: 'auto'
      }
    ];
    return lvl;
  },
  'levels/tutorial/tutorial_6.json': (lvl) => {
    lvl.config.theme = 'temple';
    lvl.spawn.style = 'archway';
    lvl.exit.style = 'chest';
    lvl.entities = [
      {
        id: 'key_green_t6',
        type: 'key',
        x: 3,
        y: 3,
        color: '#34d399',
        name: 'Emerald Scarab',
        style: 'relic',
        glowEffect: 'vibrant'
      },
      {
        id: 'door_green_t6',
        type: 'door',
        x: 5,
        y: 1,
        requiresKey: 'key_green_t6',
        color: '#34d399',
        style: 'portcullis',
        orientation: 'vertical'
      },
      {
        id: 'key_blue_t6',
        type: 'key',
        x: 15,
        y: 1,
        color: '#38bdf8',
        name: 'Sapphire Orb',
        style: 'orb',
        glowEffect: 'pulse'
      },
      {
        id: 'door_blue_t6',
        type: 'door',
        x: 11,
        y: 4,
        requiresKey: 'key_blue_t6',
        color: '#38bdf8',
        style: 'magic_seal',
        orientation: 'auto'
      },
      {
        id: 'lever_t6',
        type: 'lever',
        x: 11,
        y: 11,
        name: 'Sanctuary Switch',
        style: 'pressure_pedestal',
        state: false,
        targets: [
          {
            action: 'toggle_tile',
            layer: 'ground',
            x: 13,
            y: 13,
            stateA: 0,
            stateB: 1
          }
        ]
      },
      {
        id: 'key_red_t6',
        type: 'key',
        x: 1,
        y: 15,
        color: '#f43f5e',
        name: 'Ruby Sun Shard',
        style: 'crystal',
        glowEffect: 'vibrant'
      },
      {
        id: 'door_red_t6',
        type: 'door',
        x: 14,
        y: 15,
        requiresKey: 'key_red_t6',
        color: '#f43f5e',
        style: 'vault_hatch',
        orientation: 'auto'
      }
    ];
    return lvl;
  },

  // ==========================================
  // ZONE 1: DUNGEON
  // ==========================================
  'levels/zone_1/level_1.json': (lvl) => {
    lvl.config.theme = 'dungeon';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'archway';
    lvl.entities = [
      {
        id: 'key_gold_1',
        type: 'key',
        x: 1,
        y: 11,
        color: '#fbbf24',
        name: 'Dungeon Master Key',
        style: 'classic',
        glowEffect: 'vibrant'
      },
      {
        id: 'door_gold_1',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_gold_1',
        color: '#fbbf24',
        style: 'classic',
        orientation: 'vertical'
      }
    ];
    return lvl;
  },
  'levels/zone_1/level_2.json': (lvl) => {
    lvl.config.theme = 'dungeon';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'stairs_up';
    lvl.entities = [
      {
        id: 'key_emerald_2',
        type: 'key',
        x: 7,
        y: 1,
        color: '#34d399',
        name: 'Overpass Skeleton Key',
        style: 'ornate',
        glowEffect: 'vibrant'
      },
      {
        id: 'door_emerald_2',
        type: 'door',
        x: 13,
        y: 9,
        requiresKey: 'key_emerald_2',
        color: '#34d399',
        style: 'portcullis',
        orientation: 'horizontal'
      }
    ];
    return lvl;
  },
  'levels/zone_1/level_3.json': (lvl) => {
    lvl.config.theme = 'dungeon';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'portal';
    lvl.entities = [
      {
        id: 'lever_crypt_1',
        type: 'lever',
        x: 1,
        y: 15,
        name: 'Crypt Iron Switch',
        style: 'switch_lever',
        state: false,
        targets: [
          {
            action: 'toggle_tile',
            layer: 'ground',
            x: 9,
            y: 7,
            stateA: 0,
            stateB: 1
          }
        ]
      },
      {
        id: 'key_sunset_3',
        type: 'key',
        x: 15,
        y: 1,
        color: '#f43f5e',
        name: 'Ruby Crypt Orb',
        style: 'orb',
        glowEffect: 'pulse'
      },
      {
        id: 'door_sunset_3',
        type: 'door',
        x: 9,
        y: 13,
        requiresKey: 'key_sunset_3',
        color: '#f43f5e',
        style: 'classic',
        orientation: 'vertical'
      }
    ];
    return lvl;
  },
  'levels/zone_1/level_4.json': (lvl) => {
    lvl.config.theme = 'dungeon';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'stairs_up';
    lvl.entities = [
      {
        id: 'key_blue_4',
        type: 'key',
        x: 15,
        y: 1,
        color: '#38bdf8',
        name: 'Azure Crystal',
        style: 'crystal',
        glowEffect: 'vibrant'
      },
      {
        id: 'key_gold_4',
        type: 'key',
        x: 1,
        y: 19,
        color: '#fbbf24',
        name: 'Imperial Relic Crown',
        style: 'relic',
        glowEffect: 'pulse'
      },
      {
        id: 'door_blue_4',
        type: 'door',
        x: 17,
        y: 19,
        requiresKey: 'key_blue_4',
        color: '#38bdf8',
        style: 'portcullis',
        orientation: 'vertical'
      },
      {
        id: 'door_gold_4',
        type: 'door',
        x: 18,
        y: 19,
        requiresKey: 'key_gold_4',
        color: '#fbbf24',
        style: 'classic',
        orientation: 'horizontal'
      }
    ];
    return lvl;
  },
  'levels/zone_1/level_5.json': (lvl) => {
    lvl.config.theme = 'dungeon';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'chest';
    lvl.entities = [
      {
        id: 'lever_vault_1',
        type: 'lever',
        x: 1,
        y: 19,
        name: 'Sunken Vault Pedestal',
        style: 'pressure_pedestal',
        state: false,
        targets: [
          {
            action: 'toggle_tile',
            layer: 'ground',
            x: 11,
            y: 11,
            stateA: 0,
            stateB: 1
          }
        ]
      },
      {
        id: 'key_gold_5',
        type: 'key',
        x: 19,
        y: 1,
        color: '#fbbf24',
        name: 'Grand Vault Key',
        style: 'ornate',
        glowEffect: 'pulse'
      },
      {
        id: 'door_gold_5',
        type: 'door',
        x: 19,
        y: 13,
        requiresKey: 'key_gold_5',
        color: '#fbbf24',
        style: 'vault_hatch',
        orientation: 'auto'
      }
    ];
    return lvl;
  },

  // ==========================================
  // ZONE 2: EMERALD JUNGLE
  // ==========================================
  'levels/zone_2/level_6.json': (lvl) => {
    lvl.config.theme = 'jungle';
    lvl.spawn.style = 'camp';
    lvl.exit.style = 'shrine';
    lvl.entities = [
      {
        id: 'key_green_6',
        type: 'key',
        x: 1,
        y: 11,
        color: '#34d399',
        name: 'Jade Shard',
        style: 'crystal',
        glowEffect: 'vibrant'
      },
      {
        id: 'door_green_6',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_green_6',
        color: '#34d399',
        style: 'portcullis',
        orientation: 'vertical'
      }
    ];
    return lvl;
  },
  'levels/zone_2/level_7.json': (lvl) => {
    lvl.config.theme = 'jungle';
    lvl.spawn.style = 'archway';
    lvl.exit.style = 'portal';
    lvl.entities = [
      {
        id: 'key_green_7',
        type: 'key',
        x: 1,
        y: 13,
        color: '#34d399',
        name: 'Vine Skeleton Key',
        style: 'ornate',
        glowEffect: 'pulse'
      },
      {
        id: 'door_green_7',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_green_7',
        color: '#34d399',
        style: 'portcullis',
        orientation: 'horizontal'
      },
      {
        id: 'key_blue_7',
        type: 'key',
        x: 13,
        y: 1,
        color: '#38bdf8',
        name: 'Canopy Crystal',
        style: 'crystal',
        glowEffect: 'vibrant'
      },
      {
        id: 'door_blue_7',
        type: 'door',
        x: 13,
        y: 9,
        requiresKey: 'key_blue_7',
        color: '#38bdf8',
        style: 'magic_seal',
        orientation: 'auto'
      }
    ];
    return lvl;
  },
  'levels/zone_2/level_8.json': (lvl) => {
    lvl.config.theme = 'jungle';
    lvl.spawn.style = 'camp';
    lvl.exit.style = 'shrine';
    lvl.entities = [
      {
        id: 'key_purple_8',
        type: 'key',
        x: 1,
        y: 13,
        color: '#a855f7',
        name: 'Jungle Heart Relic',
        style: 'relic',
        glowEffect: 'pulse'
      },
      {
        id: 'door_purple_8',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_purple_8',
        color: '#a855f7',
        style: 'portcullis',
        orientation: 'vertical'
      }
    ];
    return lvl;
  },

  // ==========================================
  // ZONE 3: MOLTEN CHASM & OBSIDIAN VAULT
  // ==========================================
  'levels/zone_3/level_9.json': (lvl) => {
    lvl.config.theme = 'lava';
    lvl.spawn.style = 'archway';
    lvl.exit.style = 'portal';
    lvl.entities = [
      {
        id: 'key_red_9',
        type: 'key',
        x: 1,
        y: 11,
        color: '#f43f5e',
        name: 'Molten Ruby Shard',
        style: 'crystal',
        glowEffect: 'pulse'
      },
      {
        id: 'door_red_9',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_red_9',
        color: '#f43f5e',
        style: 'laser_barrier',
        orientation: 'horizontal'
      }
    ];
    return lvl;
  },
  'levels/zone_3/level_10.json': (lvl) => {
    lvl.config.theme = 'lava';
    lvl.spawn.style = 'stairs_down';
    lvl.exit.style = 'chest';
    lvl.entities = [
      {
        id: 'key_red_10',
        type: 'key',
        x: 1,
        y: 13,
        color: '#f43f5e',
        name: 'Magma Core Shard',
        style: 'crystal',
        glowEffect: 'vibrant'
      },
      {
        id: 'door_red_10',
        type: 'door',
        x: 7,
        y: 7,
        requiresKey: 'key_red_10',
        color: '#f43f5e',
        style: 'laser_barrier',
        orientation: 'vertical'
      },
      {
        id: 'key_gold_10',
        type: 'key',
        x: 13,
        y: 1,
        color: '#fbbf24',
        name: 'Obsidian Bone Seal',
        style: 'skull',
        glowEffect: 'pulse'
      },
      {
        id: 'door_gold_10',
        type: 'door',
        x: 13,
        y: 9,
        requiresKey: 'key_gold_10',
        color: '#fbbf24',
        style: 'vault_hatch',
        orientation: 'auto'
      }
    ];
    return lvl;
  }
};

let allValid = true;

for (const [relPath, updater] of Object.entries(LEVEL_UPDATES)) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  let data = JSON.parse(raw);
  data = updater(data);

  // Validate level
  const valResult = LevelValidator.validate(data);
  if (!valResult.valid) {
    console.error(`❌ Validation failed for ${relPath}:`, valResult.errors);
    allValid = false;
  } else {
    console.log(`✅ ${data.title} (${relPath}) validated successfully!`);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
  }
}

// Update manifest.json with normalized themes
const manifestPath = path.resolve(process.cwd(), 'levels/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

for (const entry of manifest) {
  if (entry.id === 'tutorial_3' || entry.id === 'tutorial_6') {
    entry.theme = 'temple';
  } else if (entry.id === 'tutorial_4') {
    entry.theme = 'jungle';
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

if (allValid) {
  console.log('\n✨ All 16 levels updated and validated with 0 errors!');
} else {
  process.exit(1);
}
